/**
 * RaihnForge Dashboard — Content Parser & Validator
 * Ports manage.py front matter parsing to JS. Builds section tree.
 */
(function () {
  'use strict';

  // ── Section discovery ────────────────────────────────────────

  // Default labels for top-level sections (before any dashboard_label is set)
  var LABEL_DEFAULTS = {
    art: 'Design',
    gamedev: 'Products',
    blog: 'Journal',
  };

  // CMS collection name overrides for sections whose CMS names don't follow
  // the standard parent-slug pattern (e.g. verg-castleroid → gamedev-verg)
  var CMS_NAME_OVERRIDES = {
    'gamedev/verg-castleroid': 'gamedev-verg',
    'gamedev/indie-dev-dues': 'gamedev-indie-dev',
    'gamedev/unchosen-paths': 'gamedev-unchosen',
  };

  /**
   * Compute the CMS collection name for a section id.
   * Standard pattern: parent-slug or just slug for top-level.
   */
  function computeCmsName(sectionId) {
    if (CMS_NAME_OVERRIDES[sectionId]) return CMS_NAME_OVERRIDES[sectionId];
    // top-level (no slash) → use id directly
    if (sectionId.indexOf('/') === -1) return sectionId;
    // nested → parent-child
    return sectionId.replace(/\//g, '-');
  }

  /**
   * Capitalize a slug into a readable label.
   * e.g. "fine-art" → "Fine Art"
   */
  function slugToLabel(slug) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  /**
   * Discover sections from the full Git tree.
   * treeEntries: array from getFullTree() — { path, type, sha }
   * blobContents: Map of indexPath → { content, sha } (fetched _index.md blobs)
   *
   * Returns { sections: [...], parentSections: [...] }
   */
  function discoverSections(treeEntries, blobContents) {
    // Find all content/**/_index.md entries
    var indexFiles = treeEntries.filter(function (e) {
      return e.type === 'blob' && /^content\/.*\/_index\.md$/.test(e.path);
    });

    // Build raw section nodes
    var sectionMap = {};
    for (var i = 0; i < indexFiles.length; i++) {
      var entry = indexFiles[i];
      var relDir = entry.path.replace(/^content\//, '').replace(/\/_index\.md$/, '');
      var parts = relDir.split('/');
      var slug = parts[parts.length - 1];
      var parent = parts.length > 1 ? parts.slice(0, -1).join('/') : null;

      // Parse _index.md content if we have it
      var blob = blobContents.get(entry.path);
      var fm = null;
      var body = '';
      var title = slugToLabel(slug);
      var dashboardLabel = null;
      var weight = null;
      var description = '';

      if (blob) {
        var parsed = parseFile(blob.content);
        fm = parsed.fm;
        body = parsed.body;
        if (fm) {
          title = getField(fm, 'title') || title;
          dashboardLabel = getField(fm, 'dashboard_label');
          var w = getField(fm, 'weight');
          if (w) weight = parseInt(w, 10);
          description = getField(fm, 'description') || '';
        }
      }

      // Determine display label: dashboard_label > LABEL_DEFAULTS > title
      var label = dashboardLabel || LABEL_DEFAULTS[relDir] || title;

      sectionMap[relDir] = {
        id: relDir,
        slug: slug,
        label: label,
        parent: parent,
        weight: weight,
        cms: computeCmsName(relDir),
        indexPath: entry.path,
        indexSha: blob ? blob.sha : entry.sha,
        indexFm: fm || '',
        indexBody: body,
        isParent: false,
        children: [],
        description: description,
      };
    }

    // Identify parent sections (those that have children)
    for (var id in sectionMap) {
      var node = sectionMap[id];
      if (node.parent && sectionMap[node.parent]) {
        sectionMap[node.parent].isParent = true;
        sectionMap[node.parent].children.push(node);
      }
    }

    // Sort children by weight (nulls last), then alphabetically
    for (var pid in sectionMap) {
      if (sectionMap[pid].children.length > 0) {
        sectionMap[pid].children.sort(function (a, b) {
          if (a.weight !== null && b.weight !== null) return a.weight - b.weight;
          if (a.weight !== null) return -1;
          if (b.weight !== null) return 1;
          return a.label.localeCompare(b.label);
        });
      }
    }

    // Build flat SECTIONS list (leaf sections only — ones that hold content files)
    // and PARENT_SECTIONS list
    var sections = [];
    var parentSections = [];

    // Gather top-level sections sorted by weight
    var topLevel = [];
    for (var tid in sectionMap) {
      if (!sectionMap[tid].parent) {
        topLevel.push(sectionMap[tid]);
      }
    }
    topLevel.sort(function (a, b) {
      if (a.weight !== null && b.weight !== null) return a.weight - b.weight;
      if (a.weight !== null) return -1;
      if (b.weight !== null) return 1;
      return a.label.localeCompare(b.label);
    });

    for (var t = 0; t < topLevel.length; t++) {
      var top = topLevel[t];
      if (top.isParent) {
        // Parent with children — children are the leaf sections
        var childSections = top.children.map(function (ch) {
          return {
            id: ch.id,
            slug: ch.slug,
            label: ch.label,
            parent: top.id,
            cms: ch.cms,
            weight: ch.weight,
            indexPath: ch.indexPath,
            indexSha: ch.indexSha,
            indexFm: ch.indexFm,
            indexBody: ch.indexBody,
            description: ch.description,
          };
        });
        sections = sections.concat(childSections);
        parentSections.push({
          id: top.id,
          slug: top.slug,
          label: top.label,
          weight: top.weight,
          indexPath: top.indexPath,
          indexSha: top.indexSha,
          indexFm: top.indexFm,
          indexBody: top.indexBody,
          children: childSections,
          description: top.description,
        });
      } else {
        // Standalone section (like blog)
        sections.push({
          id: top.id,
          slug: top.slug,
          label: top.label,
          parent: null,
          cms: top.cms,
          weight: top.weight,
          indexPath: top.indexPath,
          indexSha: top.indexSha,
          indexFm: top.indexFm,
          indexBody: top.indexBody,
          description: top.description,
        });
      }
    }

    return {
      sections: sections,
      parentSections: parentSections,
      sectionMap: sectionMap,
    };
  }

  // Mutable state — populated by discoverSections(), consumed by the rest of the app
  var SECTIONS = [];
  var PARENT_SECTIONS = [];

  // ── Front matter parsing ──────────────────────────────────────

  /**
   * Parse markdown file into { fm, body, raw }.
   * fm is the raw front matter string (between ---).
   */
  function parseFile(raw) {
    if (!raw || !raw.startsWith('---')) {
      return { fm: null, body: raw || '', raw: raw || '' };
    }
    var end = raw.indexOf('---', 3);
    if (end === -1) {
      return { fm: null, body: raw, raw: raw };
    }
    var fm = raw.substring(3, end).trim();
    var body = raw.substring(end + 3).replace(/^\n+/, '');
    return { fm: fm, body: body, raw: raw };
  }

  /**
   * Extract a scalar field value from front matter text.
   */
  function getField(fm, key) {
    if (!fm) return null;
    var re = new RegExp('^' + escapeRegex(key) + ':\\s*(.+)$', 'm');
    var m = fm.match(re);
    if (!m) return null;
    var val = m[1].trim().replace(/^["']|["']$/g, '');
    return val;
  }

  /**
   * Extract a boolean field. Returns true/false/null.
   */
  function getBool(fm, key) {
    var val = getField(fm, key);
    if (val === null) return null;
    return val.toLowerCase() === 'true';
  }

  /**
   * Extract a list field (inline [...] or multi-line - items).
   */
  function getList(fm, key) {
    if (!fm) return [];
    // Inline: tags: [a, b, c]
    var inlineRe = new RegExp('^' + escapeRegex(key) + ':\\s*\\[([^\\]]*)\\]', 'm');
    var m = fm.match(inlineRe);
    if (m) {
      return m[1].split(',')
        .map(function (s) { return s.trim().replace(/^["']|["']$/g, ''); })
        .filter(function (s) { return s.length > 0; });
    }
    // Multi-line
    var multiRe = new RegExp('^' + escapeRegex(key) + ':\\s*\\n((?:\\s+-\\s+.+\\n?)*)', 'm');
    m = fm.match(multiRe);
    if (m) {
      return m[1].trim().split('\n')
        .map(function (line) {
          return line.trim().replace(/^-\s+/, '').replace(/^["']|["']$/g, '');
        })
        .filter(function (s) { return s.length > 0; });
    }
    return [];
  }

  /**
   * Set a scalar field in front matter text. Adds if missing.
   */
  function setField(fm, key, value) {
    var yamlVal;
    if (typeof value === 'boolean') {
      yamlVal = value ? 'true' : 'false';
    } else if (typeof value === 'number') {
      yamlVal = String(value);
    } else if (value === 'true' || value === 'false') {
      yamlVal = value;
    } else {
      yamlVal = /[:#{}[\]|>&*!%@`]/.test(String(value)) ? '"' + value + '"' : String(value);
    }

    var pattern = new RegExp('^' + escapeRegex(key) + ':.*$', 'm');
    if (pattern.test(fm)) {
      return fm.replace(pattern, key + ': ' + yamlVal);
    }
    // Add before draft: if present, else append
    if (fm.indexOf('\ndraft:') !== -1) {
      return fm.replace('\ndraft:', '\n' + key + ': ' + yamlVal + '\ndraft:');
    }
    return fm + '\n' + key + ': ' + yamlVal;
  }

  /**
   * Remove a field from front matter text entirely.
   */
  function removeField(fm, key) {
    var pattern = new RegExp('^' + escapeRegex(key) + ':.*\\n?', 'm');
    return fm.replace(pattern, '');
  }

  /**
   * Add an alias URL to the aliases list. Handles both formats.
   */
  function addAlias(fm, alias) {
    if (!fm) return fm;
    // Check if aliases field exists
    var hasAliases = /^aliases:/m.test(fm);
    if (!hasAliases) {
      // Add as inline list before draft:
      var aliasLine = 'aliases: ["' + alias + '"]';
      if (fm.indexOf('\ndraft:') !== -1) {
        return fm.replace('\ndraft:', '\n' + aliasLine + '\ndraft:');
      }
      return fm + '\n' + aliasLine;
    }
    // Check inline format: aliases: [...]
    var inlineMatch = fm.match(/^(aliases:\s*\[)([^\]]*)\]/m);
    if (inlineMatch) {
      var existing = inlineMatch[2].trim();
      var newList = existing ? existing + ', "' + alias + '"' : '"' + alias + '"';
      return fm.replace(/^aliases:\s*\[[^\]]*\]/m, 'aliases: [' + newList + ']');
    }
    // Multi-line: add another - item
    var multiMatch = fm.match(/^(aliases:\s*\n(?:\s+-\s+.+\n?)*)/m);
    if (multiMatch) {
      return fm.replace(multiMatch[0], multiMatch[0].trimEnd() + '\n  - "' + alias + '"\n');
    }
    return fm;
  }

  /**
   * Rebuild markdown from front matter + body.
   */
  function reconstruct(fm, body) {
    return '---\n' + fm + '\n---\n' + body;
  }

  /**
   * Count words in body (strips markdown).
   */
  function wordCount(body) {
    if (!body) return 0;
    var text = body
      .replace(/!\[.*?\]\(.*?\)/g, '')         // images
      .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')   // links
      .replace(/[#*_>`~\-|]/g, '')             // markup
      .replace(/<[^>]+>/g, '');                 // HTML
    return text.split(/\s+/).filter(function (w) { return w.length > 0; }).length;
  }

  // ── Content item builder ──────────────────────────────────────

  /**
   * Build a content item from file data.
   * fileInfo: { path, name, sha, content }
   */
  function buildItem(fileInfo) {
    var parsed = parseFile(fileInfo.content);
    if (!parsed.fm) return null;

    var fm = parsed.fm;
    var body = parsed.body;
    var rel = fileInfo.path.replace(/^content\//, '');
    var parts = rel.split('/');
    var section;
    if (parts.length === 2) {
      section = parts[0]; // blog/slug.md → blog
    } else {
      section = parts.slice(0, -1).join('/'); // art/illustration/slug.md → art/illustration
    }
    var sectionTop = parts[0];
    var slug = fileInfo.name.replace(/\.md$/, '');

    var dateStr = getField(fm, 'date') || '';
    var year = null;
    if (dateStr) {
      try { year = parseInt(dateStr.substring(0, 4), 10); } catch (e) { /* ignore */ }
    }
    var yearField = getField(fm, 'year');
    if (yearField) {
      try { year = parseInt(yearField, 10); } catch (e) { /* ignore */ }
    }

    return {
      path: fileInfo.path,
      sha: fileInfo.sha,
      name: fileInfo.name,
      slug: slug,
      rel: rel,
      section: section,
      sectionTop: sectionTop,
      title: getField(fm, 'title') || slug,
      date: dateStr,
      year: year,
      image: getField(fm, 'image') || '',
      medium: getField(fm, 'medium') || '',
      description: getField(fm, 'description') || '',
      tags: getList(fm, 'tags'),
      status: getField(fm, 'status') || '',
      recovered: getBool(fm, 'recovered') || false,
      archived: getBool(fm, 'archived') || false,
      featured: getBool(fm, 'featured') || false,
      draft: getBool(fm, 'draft') || false,
      wordCount: wordCount(body),
      fm: fm,
      body: body,
      content: fileInfo.content,
    };
  }

  // ── Validation ────────────────────────────────────────────────

  var RULES = [
    { code: 'E001', level: 'error',   check: function (item) { return (!item.title || !item.title.trim()) ? 'Missing or empty title' : null; } },
    { code: 'E002', level: 'error',   check: function (item) {
      if (!item.date) return 'Missing date';
      if (!/^\d{4}-\d{2}-\d{2}/.test(item.date)) return 'Unparseable date: ' + item.date;
      return null;
    }},
    { code: 'W001', level: 'warning', check: function (item) { return !item.description ? 'Missing description' : null; } },
    { code: 'W002', level: 'warning', check: function (item) { return (item.description && item.description.trimEnd().endsWith('...')) ? 'Description appears truncated' : null; } },
    { code: 'W003', level: 'warning', check: function (item) { return (item.sectionTop === 'art' && !item.image) ? 'Missing image on art content' : null; } },
    { code: 'W005', level: 'warning', check: function (item) { return item.wordCount < 20 ? 'Thin content (' + item.wordCount + ' words)' : null; } },
    { code: 'W006', level: 'warning', check: function (item) { return (item.sectionTop === 'art' && !item.medium) ? 'Missing medium on art content' : null; } },
    { code: 'W007', level: 'warning', check: function (item) {
      if (item.sectionTop !== 'art') return null;
      var yearField = getField(item.fm, 'year');
      return !yearField ? 'Missing year on art content' : null;
    }},
    { code: 'W008', level: 'warning', check: function (item) { return (item.fm && item.fm.indexOf('tags:') === -1) ? 'Missing tags field' : null; } },
    { code: 'W009', level: 'warning', check: function (item) { return (item.image && item.image.startsWith('http')) ? 'External image URL' : null; } },
  ];

  /**
   * Validate a single item. Returns array of { code, level, message }.
   */
  function validateItem(item) {
    var issues = [];
    for (var i = 0; i < RULES.length; i++) {
      var msg = RULES[i].check(item);
      if (msg) {
        issues.push({ code: RULES[i].code, level: RULES[i].level, message: msg });
      }
    }
    return issues;
  }

  /**
   * Validate all items. Returns { errors, warnings, byItem }.
   * byItem is a Map of path → issues array.
   */
  function validateAll(items) {
    var errors = 0;
    var warnings = 0;
    var byItem = new Map();

    for (var i = 0; i < items.length; i++) {
      var issues = validateItem(items[i]);
      if (issues.length > 0) {
        byItem.set(items[i].path, issues);
        for (var j = 0; j < issues.length; j++) {
          if (issues[j].level === 'error') errors++;
          else warnings++;
        }
      }
    }
    return { errors: errors, warnings: warnings, byItem: byItem };
  }

  // ── CMS URL builder ───────────────────────────────────────────

  function cmsEditUrl(item) {
    var sec = SECTIONS.find(function (s) { return s.id === item.section; });
    if (!sec) return '/admin/';
    return '/admin/#/collections/' + sec.cms + '/entries/' + item.slug;
  }

  function previewUrl(item) {
    return '/' + item.rel.replace(/\.md$/, '/');
  }

  // ── Helpers ───────────────────────────────────────────────────

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ── Export ─────────────────────────────────────────────────────

  window.RFDash = window.RFDash || {};
  window.RFDash.content = {
    SECTIONS: SECTIONS,
    PARENT_SECTIONS: PARENT_SECTIONS,
    LABEL_DEFAULTS: LABEL_DEFAULTS,
    CMS_NAME_OVERRIDES: CMS_NAME_OVERRIDES,
    discoverSections: discoverSections,
    computeCmsName: computeCmsName,
    slugToLabel: slugToLabel,
    parseFile: parseFile,
    getField: getField,
    getBool: getBool,
    getList: getList,
    setField: setField,
    removeField: removeField,
    addAlias: addAlias,
    reconstruct: reconstruct,
    wordCount: wordCount,
    buildItem: buildItem,
    validateItem: validateItem,
    validateAll: validateAll,
    cmsEditUrl: cmsEditUrl,
    previewUrl: previewUrl,
  };
})();
