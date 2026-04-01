/**
 * RaihnForge Dashboard — Application Logic
 * Wires together GitHub API + content parsing into an interactive UI.
 */
(function () {
  'use strict';

  var gh = window.RFDash.github;
  var ct = window.RFDash.content;

  // ── State ─────────────────────────────────────────────────────

  var state = {
    token: null,
    user: null,
    activeSection: null,       // null = all loaded, or section id string
    sectionCounts: {},         // sectionId → count (from dir listings)
    items: [],                 // all loaded content items
    loadedSections: new Set(), // sections whose file contents are loaded
    selected: new Set(),       // paths of selected items
    filter: 'all',
    search: '',
    sort: 'date-desc',
    viewMode: 'grid',          // 'grid' or 'list'
    validationOpen: false,
    validation: null,          // { errors, warnings, byItem }
    treeEntries: [],           // full repo tree from Git Trees API
    sectionMap: {},            // id → section node (from discoverSections)
  };

  // ── DOM refs ──────────────────────────────────────────────────

  var $ = function (id) { return document.getElementById(id); };

  // ── Init ──────────────────────────────────────────────────────

  async function init() {
    setupThemeToggle();

    var token = gh.getToken();
    if (!token) {
      showAuthScreen();
      return;
    }

    var user = await gh.validateToken(token);
    if (!user) {
      showAuthScreen();
      return;
    }

    state.token = token;
    state.user = user;
    showDashboard();
    await discoverAndLoad();
  }

  // ── Auth ──────────────────────────────────────────────────────

  function showAuthScreen() {
    $('auth-screen').style.display = '';
    $('dashboard').style.display = 'none';

    $('auth-submit').onclick = async function () {
      var token = $('auth-token').value.trim();
      if (!token) return;
      $('auth-submit').disabled = true;
      $('auth-error').style.display = 'none';

      var user = await gh.validateToken(token);
      if (!user) {
        $('auth-error').style.display = '';
        $('auth-submit').disabled = false;
        return;
      }

      gh.setToken(token);
      state.token = token;
      state.user = user;
      $('auth-screen').style.display = 'none';
      showDashboard();
      await discoverAndLoad();
    };

    $('auth-token').onkeydown = function (e) {
      if (e.key === 'Enter') $('auth-submit').click();
    };
  }

  function showDashboard() {
    $('dashboard').style.display = '';
    renderUserInfo();
    renderSidebar();
    bindActionBar();
    bindToolbar();
    bindValidationPanel();
  }

  function renderUserInfo() {
    var u = state.user;
    $('header-user').innerHTML =
      '<img src="' + esc(u.avatar_url) + '&s=56" alt="" />' +
      '<span>' + esc(u.login) + '</span>';
  }

  // ── Section tree discovery ───────────────────────────────────

  async function discoverAndLoad() {
    showLoading(true);

    try {
      // 1. Get full repo tree in 2 API calls
      var treeSha = await gh.getTreeSha(state.token);
      var tree = await gh.getFullTree(treeSha, state.token);
      state.treeEntries = tree;

      // 2. Find all content/**/_index.md blobs
      var indexEntries = tree.filter(function (e) {
        return e.type === 'blob' && /^content\/.*\/_index\.md$/.test(e.path);
      });

      if (indexEntries.length === 0) {
        showLoading(false);
        toast('No sections found — is this the right repo?', 'error');
        return;
      }

      // 3. Batch-fetch _index.md blob contents
      var blobContents = new Map();
      var blobErrors = 0;
      var blobPromises = indexEntries.map(function (entry) {
        return gh.getBlob(entry.sha, state.token).then(function (content) {
          if (content !== null) {
            blobContents.set(entry.path, { content: content, sha: entry.sha });
          } else {
            blobErrors++;
          }
        }).catch(function () { blobErrors++; });
      });
      await Promise.all(blobPromises);

      if (blobErrors > 0) {
        toast(blobErrors + ' _index.md file(s) could not be read', 'error');
      }

      // 4. Discover sections from tree
      var result = ct.discoverSections(tree, blobContents);

      if (result.sections.length === 0) {
        showLoading(false);
        toast('No content sections discovered — check repo structure', 'error');
        return;
      }

      // Update mutable arrays on ct module
      ct.SECTIONS.length = 0;
      Array.prototype.push.apply(ct.SECTIONS, result.sections);
      ct.PARENT_SECTIONS.length = 0;
      Array.prototype.push.apply(ct.PARENT_SECTIONS, result.parentSections);
      state.sectionMap = result.sectionMap;

      // 5. Count content files per section from the tree (no extra API calls)
      state.sectionCounts = {};
      state._fileLists = {};
      for (var i = 0; i < ct.SECTIONS.length; i++) {
        var sec = ct.SECTIONS[i];
        var dirPrefix = 'content/' + sec.id + '/';
        var files = tree.filter(function (e) {
          if (e.type !== 'blob') return false;
          if (!e.path.startsWith(dirPrefix)) return false;
          var rest = e.path.substring(dirPrefix.length);
          // Only direct children (no sub-subdirectories), not _index.md
          if (rest.indexOf('/') !== -1) return false;
          if (rest === '_index.md' || rest.startsWith('_')) return false;
          if (!rest.endsWith('.md')) return false;
          return true;
        }).map(function (e) {
          return { name: e.path.split('/').pop(), path: e.path, sha: e.sha, size: e.size || 0 };
        });
        state.sectionCounts[sec.id] = files.length;
        state._fileLists[sec.id] = files;
      }

      showLoading(false);
      renderSidebar();
      renderStats();

      // Auto-load the first section that has content
      var firstWithContent = ct.SECTIONS.find(function (s) { return state.sectionCounts[s.id] > 0; });
      if (firstWithContent) {
        await selectSection(firstWithContent.id);
      }
    } catch (err) {
      showLoading(false);
      toast('Failed to load sections: ' + err.message, 'error');
      console.error('discoverAndLoad failed:', err);
    }
  }

  // ── Section content loading ───────────────────────────────────

  async function loadSectionContent(sectionId) {
    if (state.loadedSections.has(sectionId)) return;

    var files = state._fileLists[sectionId];
    if (!files || files.length === 0) {
      state.loadedSections.add(sectionId);
      return;
    }

    showLoading(true);
    try {
      var paths = files.map(function (f) { return f.path; });
      var fileData = await gh.getFiles(paths, state.token, 10);

      for (var i = 0; i < fileData.length; i++) {
        if (!fileData[i]) continue;
        // Attach sha from listing
        var matchingFile = files.find(function (f) { return f.path === fileData[i].path; });
        if (matchingFile) fileData[i].sha = matchingFile.sha;
        fileData[i].name = fileData[i].path.split('/').pop();

        var item = ct.buildItem(fileData[i]);
        if (item) {
          // Replace if already exists (re-load scenario)
          var existing = state.items.findIndex(function (x) { return x.path === item.path; });
          if (existing >= 0) {
            state.items[existing] = item;
          } else {
            state.items.push(item);
          }
        }
      }

      state.loadedSections.add(sectionId);
      showLoading(false);
      runValidation();
      renderStats();
    } catch (err) {
      showLoading(false);
      toast('Failed to load ' + sectionId + ': ' + err.message, 'error');
      console.error('loadSectionContent failed for ' + sectionId + ':', err);
    }
  }

  async function selectSection(sectionId) {
    state.activeSection = sectionId;
    state.selected.clear();
    updateActionBar();
    renderSidebar();

    await loadSectionContent(sectionId);
    renderContent();
  }

  async function selectAllLoaded() {
    state.activeSection = null;
    state.selected.clear();
    updateActionBar();
    renderSidebar();
    renderContent();
  }

  async function loadAllSections() {
    showLoading(true);
    for (var i = 0; i < ct.SECTIONS.length; i++) {
      await loadSectionContent(ct.SECTIONS[i].id);
    }
    showLoading(false);
    renderContent();
    renderStats();
  }

  // ── Sidebar rendering ────────────────────────────────────────

  function renderSidebar() {
    var html = '';

    // "All" item
    var totalCount = 0;
    for (var k in state.sectionCounts) totalCount += state.sectionCounts[k];
    var allActive = state.activeSection === null ? ' active' : '';
    html += '<div class="sidebar-all' + allActive + '" data-section="__all">';
    html += 'All Content <span class="count">' + totalCount + '</span>';
    html += '</div>';
    html += '<div class="sidebar-divider"></div>';

    // Parent groups
    for (var p = 0; p < ct.PARENT_SECTIONS.length; p++) {
      var parent = ct.PARENT_SECTIONS[p];
      html += '<div class="sidebar-group" data-parent="' + esc(parent.id) + '">';
      html += '<div class="sidebar-group-label">';
      html += '<span class="sidebar-label-text" data-section-id="' + esc(parent.id) + '">' + esc(parent.label) + '</span>';
      html += '<button class="sidebar-add-btn" data-parent="' + esc(parent.id) + '" title="Add subsection">+</button>';
      html += '</div>';
      for (var c = 0; c < parent.children.length; c++) {
        var sec = parent.children[c];
        var count = state.sectionCounts[sec.id] || 0;
        var active = state.activeSection === sec.id ? ' active' : '';
        html += '<div class="sidebar-item' + active + '" data-section="' + esc(sec.id) + '" draggable="true">';
        html += '<span class="sidebar-drag-handle" title="Drag to reorder">&#9776;</span>';
        html += '<span class="sidebar-label-text" data-section-id="' + esc(sec.id) + '">' + esc(sec.label) + '</span>';
        html += '<span class="sidebar-item-right">';
        if (count === 0) {
          html += '<button class="sidebar-delete-btn" data-section-id="' + esc(sec.id) + '" title="Delete section">&times;</button>';
        }
        html += '<span class="count">' + count + '</span>';
        html += '</span>';
        html += '</div>';
      }
      html += '</div>';
    }

    // Standalone sections (blog, etc.)
    var standalones = ct.SECTIONS.filter(function (s) { return !s.parent; });
    for (var si = 0; si < standalones.length; si++) {
      var solo = standalones[si];
      html += '<div class="sidebar-divider"></div>';
      var soloCount = state.sectionCounts[solo.id] || 0;
      var soloActive = state.activeSection === solo.id ? ' active' : '';
      html += '<div class="sidebar-item' + soloActive + '" data-section="' + esc(solo.id) + '">';
      html += '<span class="sidebar-label-text" data-section-id="' + esc(solo.id) + '">' + esc(solo.label) + '</span>';
      html += '<span class="sidebar-item-right">';
      html += '<span class="count">' + soloCount + '</span>';
      html += '</span>';
      html += '</div>';
    }

    // Load All button
    var allLoaded = ct.SECTIONS.every(function (s) { return state.loadedSections.has(s.id); });
    if (!allLoaded) {
      html += '<div class="sidebar-divider"></div>';
      html += '<div class="sidebar-item" data-section="__loadall" style="color: var(--accent); font-weight: 500;">Load All Sections</div>';
    }

    // "+ Add Section" for new top-level sections
    html += '<div class="sidebar-divider"></div>';
    html += '<button class="sidebar-add-toplevel" id="add-toplevel-btn" title="Add top-level section">+ Add Section</button>';

    $('sidebar').innerHTML = html;

    // Bind clicks
    var sideItems = $('sidebar').querySelectorAll('[data-section]');
    for (var i = 0; i < sideItems.length; i++) {
      sideItems[i].addEventListener('click', handleSidebarClick);
    }

    // Bind drag-drop targets for content cards
    setupSidebarDropTargets();

    // Bind editable sidebar features
    bindSidebarRename();
    bindSidebarAdd();
    bindSidebarDelete();
    bindSidebarReorder();
  }

  function handleSidebarClick(e) {
    var secId = this.getAttribute('data-section');
    if (secId === '__all') {
      selectAllLoaded();
    } else if (secId === '__loadall') {
      loadAllSections();
    } else {
      selectSection(secId);
    }
  }

  // ── Content rendering ─────────────────────────────────────────

  function getFilteredItems() {
    var items = state.items;

    // Section filter
    if (state.activeSection) {
      items = items.filter(function (item) { return item.section === state.activeSection; });
    }

    // Status filter
    var f = state.filter;
    if (f === 'active')    items = items.filter(function (i) { return !i.archived; });
    if (f === 'archived')  items = items.filter(function (i) { return i.archived; });
    if (f === 'featured')  items = items.filter(function (i) { return i.featured; });
    if (f === 'draft')     items = items.filter(function (i) { return i.draft; });
    if (f === 'recovered') items = items.filter(function (i) { return i.recovered; });

    // Search
    if (state.search) {
      var q = state.search.toLowerCase();
      items = items.filter(function (i) {
        return i.title.toLowerCase().indexOf(q) !== -1 ||
               i.description.toLowerCase().indexOf(q) !== -1 ||
               i.slug.toLowerCase().indexOf(q) !== -1;
      });
    }

    // Sort
    var s = state.sort;
    items = items.slice().sort(function (a, b) {
      if (s === 'date-desc') return (b.date || '').localeCompare(a.date || '');
      if (s === 'date-asc')  return (a.date || '').localeCompare(b.date || '');
      if (s === 'title-asc') return a.title.localeCompare(b.title);
      if (s === 'title-desc') return b.title.localeCompare(a.title);
      return 0;
    });

    return items;
  }

  function renderContent() {
    var items = getFilteredItems();
    $('loading-state').style.display = 'none';

    if (items.length === 0) {
      $('empty-state').style.display = '';
      $('card-grid').innerHTML = '';
      $('list-body').innerHTML = '';
      return;
    }
    $('empty-state').style.display = 'none';

    renderCardGrid(items);
    renderListView(items);
  }

  function renderCardGrid(items) {
    var html = '';
    var showSection = !state.activeSection; // Show section tag when viewing all

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var sel = state.selected.has(item.path) ? ' selected' : '';
      var issues = state.validation ? (state.validation.byItem.get(item.path) || []) : [];
      var hasErr = issues.some(function (is) { return is.level === 'error'; });
      var hasWarn = issues.some(function (is) { return is.level === 'warning'; });

      html += '<div class="card' + sel + '" data-path="' + esc(item.path) + '" draggable="true">';
      if (showSection) {
        html += '<div class="card-section-tag">' + esc(sectionLabel(item.section)) + '</div>';
      }
      html += '<div class="card-title">' + esc(item.title) + '</div>';
      html += '<div class="card-meta">' + esc(formatDate(item.date));
      if (item.wordCount > 0) html += ' &middot; ' + item.wordCount + 'w';
      html += '</div>';
      html += '<div class="card-badges">';
      if (item.archived)  html += '<span class="badge badge-archived">Archived</span>';
      if (item.featured)  html += '<span class="badge badge-featured">Featured</span>';
      if (item.recovered) html += '<span class="badge badge-recovered">Recovered</span>';
      if (item.draft)     html += '<span class="badge badge-draft">Draft</span>';
      if (hasErr)         html += '<span class="badge badge-error">Error</span>';
      else if (hasWarn)   html += '<span class="badge badge-warning">Warning</span>';
      html += '</div>';
      html += '</div>';
    }

    $('card-grid').innerHTML = html;

    // Bind card events
    var cards = $('card-grid').querySelectorAll('.card');
    for (var j = 0; j < cards.length; j++) {
      cards[j].addEventListener('click', handleCardClick);
      cards[j].addEventListener('dragstart', handleDragStart);
      cards[j].addEventListener('dragend', handleDragEnd);
    }
  }

  function renderListView(items) {
    var html = '';
    var showSection = !state.activeSection;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var sel = state.selected.has(item.path) ? ' selected' : '';

      html += '<tr class="' + sel.trim() + '" data-path="' + esc(item.path) + '">';
      html += '<td class="col-title">' + esc(item.title) + '</td>';
      html += '<td>' + esc(showSection ? sectionLabel(item.section) : '') + '</td>';
      html += '<td>' + esc(formatDate(item.date)) + '</td>';
      html += '<td>';
      if (item.archived)  html += '<span class="badge badge-archived">Arc</span> ';
      if (item.featured)  html += '<span class="badge badge-featured">Feat</span> ';
      if (item.recovered) html += '<span class="badge badge-recovered">Rec</span> ';
      if (item.draft)     html += '<span class="badge badge-draft">Draft</span> ';
      html += '</td>';
      html += '<td>' + item.wordCount + '</td>';
      html += '</tr>';
    }

    $('list-body').innerHTML = html;

    var rows = $('list-body').querySelectorAll('tr');
    for (var j = 0; j < rows.length; j++) {
      rows[j].addEventListener('click', handleCardClick);
    }
  }

  // ── Card selection ────────────────────────────────────────────

  function handleCardClick(e) {
    var el = this;
    var path = el.getAttribute('data-path');

    if (e.metaKey || e.ctrlKey) {
      // Toggle individual
      if (state.selected.has(path)) {
        state.selected.delete(path);
      } else {
        state.selected.add(path);
      }
    } else if (e.shiftKey) {
      // Range select
      var items = getFilteredItems();
      var paths = items.map(function (i) { return i.path; });
      var lastSelected = Array.from(state.selected).pop();
      var fromIdx = paths.indexOf(lastSelected);
      var toIdx = paths.indexOf(path);
      if (fromIdx >= 0 && toIdx >= 0) {
        var start = Math.min(fromIdx, toIdx);
        var end = Math.max(fromIdx, toIdx);
        for (var i = start; i <= end; i++) {
          state.selected.add(paths[i]);
        }
      } else {
        state.selected.add(path);
      }
    } else {
      // Single select (toggle)
      if (state.selected.has(path) && state.selected.size === 1) {
        state.selected.clear();
      } else {
        state.selected.clear();
        state.selected.add(path);
      }
    }

    renderContent();
    updateActionBar();
  }

  // ── Action bar ────────────────────────────────────────────────

  function bindActionBar() {
    $('act-archive').onclick = function () { batchSetField('archived', true, 'Archive'); };
    $('act-unarchive').onclick = function () { batchRemoveField('archived', 'Unarchive'); };
    $('act-feature').onclick = function () { batchSetField('featured', true, 'Feature'); };
    $('act-unfeature').onclick = function () { batchSetField('featured', false, 'Unfeature'); };
    $('act-move').onclick = showMoveDialog;
    $('act-edit').onclick = openInCms;
    $('act-preview').onclick = openPreview;
    $('act-clear').onclick = function () {
      state.selected.clear();
      updateActionBar();
      renderContent();
    };
  }

  function updateActionBar() {
    var bar = $('action-bar');
    var count = state.selected.size;
    if (count > 0) {
      bar.classList.add('visible');
      $('sel-count').textContent = count + ' selected';
    } else {
      bar.classList.remove('visible');
    }
  }

  // ── Batch operations ──────────────────────────────────────────

  function getSelectedItems() {
    return state.items.filter(function (i) { return state.selected.has(i.path); });
  }

  async function batchSetField(key, value, label) {
    var items = getSelectedItems();
    if (items.length === 0) return;

    var detail = items.map(function (i) { return i.rel; }).join('\n');
    var confirmed = await showConfirmDialog(
      label + ' ' + items.length + ' item' + (items.length > 1 ? 's' : '') + '?',
      'This will update the files on GitHub and trigger a deploy.',
      detail
    );
    if (!confirmed) return;

    var success = 0;
    var errors = [];
    for (var i = 0; i < items.length; i++) {
      try {
        var item = items[i];
        var newFm = ct.setField(item.fm, key, value);
        var newContent = ct.reconstruct(newFm, item.body);
        var msg = 'dashboard: ' + label.toLowerCase() + ' ' + item.name;
        var newSha = await gh.updateFile(item.path, newContent, item.sha, msg, state.token);

        // Update local state
        item.sha = newSha;
        item.fm = newFm;
        item.content = newContent;
        item[key] = value;
        success++;
      } catch (e) {
        errors.push(item.rel + ': ' + e.message);
      }
    }

    if (success > 0) toast(label + 'd ' + success + ' item' + (success > 1 ? 's' : ''), 'success');
    if (errors.length > 0) toast(errors.length + ' failed: ' + errors[0], 'error');

    state.selected.clear();
    updateActionBar();
    runValidation();
    renderContent();
    renderStats();
  }

  async function batchRemoveField(key, label) {
    var items = getSelectedItems();
    if (items.length === 0) return;

    var detail = items.map(function (i) { return i.rel; }).join('\n');
    var confirmed = await showConfirmDialog(
      label + ' ' + items.length + ' item' + (items.length > 1 ? 's' : '') + '?',
      'This will update the files on GitHub and trigger a deploy.',
      detail
    );
    if (!confirmed) return;

    var success = 0;
    var errors = [];
    for (var i = 0; i < items.length; i++) {
      try {
        var item = items[i];
        var newFm = ct.removeField(item.fm, key);
        var newContent = ct.reconstruct(newFm, item.body);
        var msg = 'dashboard: ' + label.toLowerCase() + ' ' + item.name;
        var newSha = await gh.updateFile(item.path, newContent, item.sha, msg, state.token);

        item.sha = newSha;
        item.fm = newFm;
        item.content = newContent;
        item[key] = false;
        success++;
      } catch (e) {
        errors.push(item.rel + ': ' + e.message);
      }
    }

    if (success > 0) toast(label + 'd ' + success + ' item' + (success > 1 ? 's' : ''), 'success');
    if (errors.length > 0) toast(errors.length + ' failed: ' + errors[0], 'error');

    state.selected.clear();
    updateActionBar();
    runValidation();
    renderContent();
    renderStats();
  }

  // ── Move operation ────────────────────────────────────────────

  function showMoveDialog() {
    var items = getSelectedItems();
    if (items.length === 0) return;

    var currentSections = new Set(items.map(function (i) { return i.section; }));

    // Build target list (excluding current sections)
    var targets = ct.SECTIONS.filter(function (s) { return !currentSections.has(s.id); });

    $('dialog-title').textContent = 'Move ' + items.length + ' item' + (items.length > 1 ? 's' : '');
    $('dialog-message').textContent = 'Select destination section:';
    $('dialog-detail').style.display = 'none';

    var customHtml = '<div class="move-targets">';
    for (var i = 0; i < targets.length; i++) {
      var sec = targets[i];
      var parentLabel = sec.parent ? (ct.PARENT_SECTIONS.find(function (p) { return p.id === sec.parent; }) || {}).label || '' : '';
      var label = parentLabel ? parentLabel + ' > ' + sec.label : sec.label;
      customHtml += '<button class="move-target" data-target="' + esc(sec.id) + '">' + esc(label) + '</button>';
    }
    customHtml += '</div>';
    $('dialog-custom').innerHTML = customHtml;

    var selectedTarget = null;
    var targetBtns = $('dialog-custom').querySelectorAll('.move-target');
    for (var j = 0; j < targetBtns.length; j++) {
      targetBtns[j].addEventListener('click', function () {
        // Deselect all
        for (var k = 0; k < targetBtns.length; k++) targetBtns[k].classList.remove('selected');
        this.classList.add('selected');
        selectedTarget = this.getAttribute('data-target');
      });
    }

    showDialog().then(function (confirmed) {
      if (!confirmed || !selectedTarget) return;
      executeMoves(items, selectedTarget);
    });
  }

  async function executeMoves(items, targetSectionId) {
    var success = 0;
    var errors = [];

    for (var i = 0; i < items.length; i++) {
      try {
        var item = items[i];
        var newPath = 'content/' + targetSectionId + '/' + item.name;
        var oldUrl = '/' + item.rel.replace(/\.md$/, '/');

        // Add alias for old URL
        var newFm = ct.addAlias(item.fm, oldUrl);
        var newContent = ct.reconstruct(newFm, item.body);

        // Create at new path
        var msg = 'dashboard: move ' + item.name + ' to ' + targetSectionId;
        await gh.createFile(newPath, newContent, msg, state.token);

        // Delete old file
        await gh.deleteFile(item.path, item.sha, 'dashboard: remove moved file ' + item.name, state.token);

        // Update local state
        var oldSection = item.section;
        item.path = newPath;
        item.rel = newPath.replace('content/', '');
        item.section = targetSectionId;
        item.sectionTop = targetSectionId.split('/')[0];
        item.fm = newFm;
        item.content = newContent;

        // Update section counts
        state.sectionCounts[oldSection] = Math.max(0, (state.sectionCounts[oldSection] || 1) - 1);
        state.sectionCounts[targetSectionId] = (state.sectionCounts[targetSectionId] || 0) + 1;

        success++;
      } catch (e) {
        errors.push(item.rel + ': ' + e.message);
      }
    }

    if (success > 0) toast('Moved ' + success + ' item' + (success > 1 ? 's' : ''), 'success');
    if (errors.length > 0) toast(errors.length + ' move(s) failed', 'error');

    state.selected.clear();
    updateActionBar();
    renderSidebar();
    renderContent();
    renderStats();
  }

  // ── Edit / Preview ────────────────────────────────────────────

  function openInCms() {
    var items = getSelectedItems();
    for (var i = 0; i < items.length; i++) {
      window.open(ct.cmsEditUrl(items[i]), '_blank');
    }
  }

  function openPreview() {
    var items = getSelectedItems();
    for (var i = 0; i < items.length; i++) {
      window.open(ct.previewUrl(items[i]), '_blank');
    }
  }

  // ── Drag and drop ─────────────────────────────────────────────

  var draggedPaths = [];

  function handleDragStart(e) {
    var path = this.getAttribute('data-path');
    this.classList.add('dragging');

    // If dragging a selected item, drag all selected. Otherwise just this one.
    if (state.selected.has(path)) {
      draggedPaths = Array.from(state.selected);
    } else {
      draggedPaths = [path];
    }

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedPaths.join(','));
  }

  function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedPaths = [];
    // Clear all drop-target highlights
    var targets = $('sidebar').querySelectorAll('.drop-target');
    for (var i = 0; i < targets.length; i++) targets[i].classList.remove('drop-target');
  }

  function setupSidebarDropTargets() {
    var sideItems = $('sidebar').querySelectorAll('.sidebar-item[data-section]');
    for (var i = 0; i < sideItems.length; i++) {
      var el = sideItems[i];
      var secId = el.getAttribute('data-section');
      if (secId === '__all' || secId === '__loadall') continue;

      el.addEventListener('dragover', function (e) {
        // Ignore section reorder drags (handled by reorder handler)
        if (reorderDraggedSectionId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.classList.add('drop-target');
      });

      el.addEventListener('dragleave', function () {
        this.classList.remove('drop-target');
      });

      el.addEventListener('drop', function (e) {
        // Ignore section reorder drags
        if (reorderDraggedSectionId) return;
        e.preventDefault();
        this.classList.remove('drop-target');
        var targetSec = this.getAttribute('data-section');
        var paths = e.dataTransfer.getData('text/plain').split(',').filter(Boolean);

        var items = state.items.filter(function (item) { return paths.indexOf(item.path) >= 0; });
        // Filter out items already in target section
        items = items.filter(function (item) { return item.section !== targetSec; });

        if (items.length === 0) {
          toast('Items already in that section', 'info');
          return;
        }

        // Confirm and execute
        showConfirmDialog(
          'Move ' + items.length + ' item' + (items.length > 1 ? 's' : '') + '?',
          'Move to ' + sectionLabel(targetSec) + '. Aliases will be added for old URLs.',
          items.map(function (i) { return i.rel; }).join('\n')
        ).then(function (confirmed) {
          if (confirmed) executeMoves(items, targetSec);
        });
      });
    }
  }

  // ── Toolbar ───────────────────────────────────────────────────

  function bindToolbar() {
    $('filter-status').onchange = function () {
      state.filter = this.value;
      renderContent();
    };

    $('search-input').oninput = function () {
      state.search = this.value;
      renderContent();
    };

    $('sort-select').onchange = function () {
      state.sort = this.value;
      renderContent();
    };

    $('view-grid').onclick = function () {
      state.viewMode = 'grid';
      $('content-area').classList.remove('list-mode');
      $('view-grid').classList.add('active');
      $('view-list').classList.remove('active');
    };

    $('view-list').onclick = function () {
      state.viewMode = 'list';
      $('content-area').classList.add('list-mode');
      $('view-list').classList.add('active');
      $('view-grid').classList.remove('active');
    };

    // Table header sorting
    var ths = document.querySelectorAll('.list-table th[data-sort]');
    for (var i = 0; i < ths.length; i++) {
      ths[i].addEventListener('click', function () {
        var col = this.getAttribute('data-sort');
        var map = { title: 'title-asc', date: 'date-desc', section: 'title-asc' };
        var sortKey = map[col] || 'date-desc';
        // Toggle direction if already active
        if (state.sort === sortKey) {
          sortKey = sortKey.endsWith('-asc') ? sortKey.replace('-asc', '-desc') : sortKey.replace('-desc', '-asc');
        }
        state.sort = sortKey;
        $('sort-select').value = sortKey;
        renderContent();
      });
    }
  }

  // ── Validation panel ──────────────────────────────────────────

  function bindValidationPanel() {
    $('validation-toggle').onclick = function () {
      state.validationOpen = !state.validationOpen;
      $('validation-panel').classList.toggle('open', state.validationOpen);
    };
  }

  function runValidation() {
    state.validation = ct.validateAll(state.items);
    renderValidation();
  }

  function renderValidation() {
    var v = state.validation;
    if (!v) return;

    $('val-errors').style.display = v.errors > 0 ? '' : 'none';
    $('val-errors').textContent = v.errors + ' error' + (v.errors !== 1 ? 's' : '');
    $('val-warnings').style.display = v.warnings > 0 ? '' : 'none';
    $('val-warnings').textContent = v.warnings + ' warning' + (v.warnings !== 1 ? 's' : '');

    // Render issue list
    var html = '';
    v.byItem.forEach(function (issues, path) {
      var rel = path.replace('content/', '');
      for (var i = 0; i < issues.length; i++) {
        var issue = issues[i];
        html += '<div class="validation-item">';
        html += '<span class="validation-code ' + issue.level + '">' + issue.code + '</span>';
        html += '<span class="validation-path">' + esc(rel) + '</span>';
        html += '<span class="validation-msg">' + esc(issue.message) + '</span>';
        html += '</div>';
      }
    });
    $('validation-list').innerHTML = html;
  }

  // ── Stats ─────────────────────────────────────────────────────

  function renderStats() {
    var total = state.items.length;
    var active = state.items.filter(function (i) { return !i.archived; }).length;
    var archived = total - active;
    var featured = state.items.filter(function (i) { return i.featured; }).length;

    $('header-stats').innerHTML =
      '<span><span class="stat-val">' + total + '</span> loaded</span>' +
      '<span><span class="stat-val">' + active + '</span> active</span>' +
      '<span><span class="stat-val">' + archived + '</span> archived</span>' +
      '<span><span class="stat-val">' + featured + '</span> featured</span>';
  }

  // ── Confirm dialog ────────────────────────────────────────────

  var dialogResolve = null;

  function showDialog() {
    $('dialog-overlay').classList.add('visible');
    return new Promise(function (resolve) {
      dialogResolve = resolve;

      $('dialog-confirm').onclick = function () {
        $('dialog-overlay').classList.remove('visible');
        $('dialog-custom').innerHTML = '';
        resolve(true);
      };
      $('dialog-cancel').onclick = function () {
        $('dialog-overlay').classList.remove('visible');
        $('dialog-custom').innerHTML = '';
        resolve(false);
      };
    });
  }

  function showConfirmDialog(title, message, detail) {
    $('dialog-title').textContent = title;
    $('dialog-message').textContent = message;
    $('dialog-custom').innerHTML = '';
    if (detail) {
      $('dialog-detail').style.display = '';
      $('dialog-detail').textContent = detail;
    } else {
      $('dialog-detail').style.display = 'none';
    }
    return showDialog();
  }

  // ── Toast notifications ───────────────────────────────────────

  function toast(message, type) {
    type = type || 'info';
    var el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = message;
    $('toast-container').appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s';
      setTimeout(function () { el.remove(); }, 300);
    }, 4000);
  }

  // ── Theme toggle ──────────────────────────────────────────────

  function setupThemeToggle() {
    $('theme-toggle').addEventListener('click', function () {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      }
    });
  }

  // ── Utilities ─────────────────────────────────────────────────

  function esc(str) {
    if (!str) return '';
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return dateStr.substring(0, 10);
  }

  function sectionLabel(sectionId) {
    var sec = ct.SECTIONS.find(function (s) { return s.id === sectionId; });
    if (sec) {
      if (sec.parent) {
        var parent = ct.PARENT_SECTIONS.find(function (p) { return p.id === sec.parent; });
        return (parent ? parent.label + ' > ' : '') + sec.label;
      }
      return sec.label;
    }
    return sectionId;
  }

  function showLoading(show) {
    $('loading-state').style.display = show ? '' : 'none';
  }

  // ── Sidebar: Inline Rename ──────────────────────────────────

  function bindSidebarRename() {
    var labels = $('sidebar').querySelectorAll('.sidebar-label-text');
    for (var i = 0; i < labels.length; i++) {
      labels[i].addEventListener('dblclick', handleLabelDblClick);
    }
  }

  function handleLabelDblClick(e) {
    e.stopPropagation();
    e.preventDefault();
    var span = this;
    var sectionId = span.getAttribute('data-section-id');
    var currentLabel = span.textContent;

    // Replace span with inline input
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'sidebar-inline-edit';
    input.value = currentLabel;
    span.style.display = 'none';
    span.parentNode.insertBefore(input, span.nextSibling);
    input.focus();
    input.select();

    var committed = false;
    function commit() {
      if (committed) return;
      committed = true;
      var newLabel = input.value.trim();
      input.remove();
      span.style.display = '';
      if (!newLabel || newLabel === currentLabel) return;

      span.textContent = newLabel;
      saveSectionLabel(sectionId, newLabel);
    }
    function cancel() {
      if (committed) return;
      committed = true;
      input.remove();
      span.style.display = '';
    }

    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
      if (ev.key === 'Escape') { ev.preventDefault(); cancel(); }
    });
    input.addEventListener('blur', commit);
  }

  async function saveSectionLabel(sectionId, newLabel) {
    // Find section node in sectionMap
    var node = state.sectionMap[sectionId];
    if (!node) {
      // Check parent sections
      var parent = ct.PARENT_SECTIONS.find(function (p) { return p.id === sectionId; });
      if (parent) {
        node = state.sectionMap[sectionId];
      }
    }
    if (!node) {
      toast('Section not found: ' + sectionId, 'error');
      return;
    }

    try {
      // Fetch current _index.md to get latest sha
      var file = await gh.getFile(node.indexPath, state.token);
      if (!file) throw new Error('Could not fetch ' + node.indexPath);

      var parsed = ct.parseFile(file.content);
      var fm = parsed.fm || '';
      fm = ct.setField(fm, 'dashboard_label', newLabel);
      var newContent = ct.reconstruct(fm, parsed.body);
      var msg = 'dashboard: rename section ' + sectionId + ' to "' + newLabel + '"';
      var newSha = await gh.updateFile(node.indexPath, newContent, file.sha, msg, state.token);

      // Update local state
      node.label = newLabel;
      node.indexSha = newSha;
      node.indexFm = fm;

      // Also update the ct.SECTIONS / ct.PARENT_SECTIONS references
      var sec = ct.SECTIONS.find(function (s) { return s.id === sectionId; });
      if (sec) sec.label = newLabel;
      var par = ct.PARENT_SECTIONS.find(function (p) { return p.id === sectionId; });
      if (par) par.label = newLabel;

      toast('Renamed to "' + newLabel + '"', 'success');
    } catch (err) {
      toast('Rename failed: ' + err.message, 'error');
      // Re-render to restore original label
      renderSidebar();
    }
  }

  // ── Sidebar: Create Section ─────────────────────────────────

  function bindSidebarAdd() {
    // "+" buttons on parent group labels
    var addBtns = $('sidebar').querySelectorAll('.sidebar-add-btn');
    for (var i = 0; i < addBtns.length; i++) {
      addBtns[i].addEventListener('click', function (e) {
        e.stopPropagation();
        var parentId = this.getAttribute('data-parent');
        showCreateSectionDialog(parentId);
      });
    }

    // "+ Add Section" at bottom for top-level
    var toplevelBtn = $('add-toplevel-btn');
    if (toplevelBtn) {
      toplevelBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        showCreateSectionDialog(null);
      });
    }
  }

  function showCreateSectionDialog(parentId) {
    var parentLabel = parentId ? (ct.PARENT_SECTIONS.find(function (p) { return p.id === parentId; }) || {}).label || parentId : 'top-level';
    $('dialog-title').textContent = 'Create New Section';
    $('dialog-message').textContent = parentId ? 'Add a subsection under ' + parentLabel + '.' : 'Create a new top-level section.';
    $('dialog-detail').style.display = 'none';

    var customHtml = '<div class="create-section-form">';
    customHtml += '<label>Name<input type="text" id="new-section-name" placeholder="e.g. Photography" /></label>';
    customHtml += '<label>Slug <span style="color:var(--text-light);font-size:var(--text-xs)">(auto-generated, URL-safe)</span>';
    customHtml += '<input type="text" id="new-section-slug" placeholder="photography" /></label>';
    customHtml += '<label>Description<input type="text" id="new-section-desc" placeholder="Optional description" /></label>';
    customHtml += '</div>';
    $('dialog-custom').innerHTML = customHtml;

    // Auto-generate slug from name
    $('new-section-name').addEventListener('input', function () {
      var slug = this.value.toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      $('new-section-slug').value = slug;
    });

    showDialog().then(function (confirmed) {
      if (!confirmed) return;
      var name = ($('new-section-name').value || '').trim();
      var slug = ($('new-section-slug').value || '').trim();
      var desc = ($('new-section-desc').value || '').trim();
      if (!name || !slug) {
        toast('Name and slug are required', 'error');
        return;
      }
      if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(slug)) {
        toast('Slug must be lowercase letters, numbers, and hyphens', 'error');
        return;
      }
      executeCreateSection(parentId, name, slug, desc);
    });

    setTimeout(function () { $('new-section-name').focus(); }, 100);
  }

  async function executeCreateSection(parentId, name, slug, description) {
    var sectionId = parentId ? parentId + '/' + slug : slug;
    var indexPath = 'content/' + sectionId + '/_index.md';

    // Calculate weight: 10 beyond highest sibling weight
    var siblings = parentId
      ? (ct.PARENT_SECTIONS.find(function (p) { return p.id === parentId; }) || {}).children || []
      : ct.PARENT_SECTIONS.map(function (p) { return p; });
    var maxWeight = 0;
    for (var i = 0; i < siblings.length; i++) {
      if (siblings[i].weight && siblings[i].weight > maxWeight) {
        maxWeight = siblings[i].weight;
      }
    }
    var newWeight = maxWeight + 10;

    // Build _index.md content
    var fm = 'title: ' + name;
    fm += '\ndashboard_label: ' + name;
    if (description) fm += '\ndescription: ' + description;
    fm += '\nweight: ' + newWeight;
    fm += '\ndraft: false';
    var content = ct.reconstruct(fm, '');

    try {
      var msg = 'dashboard: create section ' + sectionId;
      await gh.createFile(indexPath, content, msg, state.token);
      toast('Created "' + name + '"', 'success');
      // Re-discover sections
      await discoverAndLoad();
    } catch (err) {
      toast('Create failed: ' + err.message, 'error');
    }
  }

  // ── Sidebar: Delete Section ─────────────────────────────────

  function bindSidebarDelete() {
    var delBtns = $('sidebar').querySelectorAll('.sidebar-delete-btn');
    for (var i = 0; i < delBtns.length; i++) {
      delBtns[i].addEventListener('click', function (e) {
        e.stopPropagation();
        var sectionId = this.getAttribute('data-section-id');
        confirmDeleteSection(sectionId);
      });
    }
  }

  async function confirmDeleteSection(sectionId) {
    var node = state.sectionMap[sectionId];
    if (!node) { toast('Section not found', 'error'); return; }

    // Verify section is truly empty by re-fetching directory listing
    try {
      var files = await gh.listDir('content/' + sectionId, state.token);
      var nonIndex = files.filter(function (f) { return f.name !== '_index.md'; });
      if (nonIndex.length > 0) {
        toast('Section has ' + nonIndex.length + ' file(s) — cannot delete', 'error');
        return;
      }
    } catch (err) {
      toast('Could not verify section contents: ' + err.message, 'error');
      return;
    }

    var confirmed = await showConfirmDialog(
      'Delete "' + node.label + '"?',
      'This will remove the _index.md file for content/' + sectionId + '/ from GitHub.',
      'The section must be empty to delete.'
    );
    if (!confirmed) return;

    try {
      // Re-fetch to get latest SHA
      var file = await gh.getFile(node.indexPath, state.token);
      if (!file) throw new Error('File not found: ' + node.indexPath);

      var msg = 'dashboard: delete section ' + sectionId;
      await gh.deleteFile(node.indexPath, file.sha, msg, state.token);
      toast('Deleted "' + node.label + '"', 'success');
      // Re-discover
      if (state.activeSection === sectionId) {
        state.activeSection = null;
      }
      await discoverAndLoad();
    } catch (err) {
      toast('Delete failed: ' + err.message, 'error');
    }
  }

  // ── Sidebar: Drag Reorder ──────────────────────────────────

  var reorderDraggedEl = null;
  var reorderDraggedSectionId = null;

  function bindSidebarReorder() {
    var items = $('sidebar').querySelectorAll('.sidebar-item[draggable="true"]');
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var handle = item.querySelector('.sidebar-drag-handle');
      if (!handle) continue;

      // Only start drag when grabbing the handle
      handle.addEventListener('mousedown', function (e) {
        this.parentNode.setAttribute('data-handle-grabbed', 'true');
      });
      item.addEventListener('dragstart', handleReorderDragStart);
      item.addEventListener('dragend', handleReorderDragEnd);
      item.addEventListener('dragover', handleReorderDragOver);
      item.addEventListener('dragleave', handleReorderDragLeave);
      item.addEventListener('drop', handleReorderDrop);
    }
  }

  function handleReorderDragStart(e) {
    // Only allow drag if started from handle
    if (this.getAttribute('data-handle-grabbed') !== 'true') {
      e.preventDefault();
      return;
    }
    this.removeAttribute('data-handle-grabbed');
    reorderDraggedEl = this;
    reorderDraggedSectionId = this.getAttribute('data-section');
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-section-reorder', reorderDraggedSectionId);
  }

  function handleReorderDragEnd(e) {
    if (reorderDraggedEl) {
      reorderDraggedEl.classList.remove('dragging');
    }
    reorderDraggedEl = null;
    reorderDraggedSectionId = null;
    // Clear all drop indicators
    var allItems = $('sidebar').querySelectorAll('.sidebar-item');
    for (var i = 0; i < allItems.length; i++) {
      allItems[i].classList.remove('drop-above', 'drop-below');
    }
  }

  function handleReorderDragOver(e) {
    // Only respond to section reorder drags
    if (!reorderDraggedSectionId) return;
    var targetId = this.getAttribute('data-section');
    if (!targetId || targetId === reorderDraggedSectionId) return;

    // Must be same parent
    var draggedSec = ct.SECTIONS.find(function (s) { return s.id === reorderDraggedSectionId; });
    var targetSec = ct.SECTIONS.find(function (s) { return s.id === targetId; });
    if (!draggedSec || !targetSec || draggedSec.parent !== targetSec.parent) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Determine above/below based on mouse position
    var rect = this.getBoundingClientRect();
    var midY = rect.top + rect.height / 2;
    this.classList.remove('drop-above', 'drop-below');
    if (e.clientY < midY) {
      this.classList.add('drop-above');
    } else {
      this.classList.add('drop-below');
    }
  }

  function handleReorderDragLeave(e) {
    this.classList.remove('drop-above', 'drop-below');
  }

  function handleReorderDrop(e) {
    e.preventDefault();
    var targetId = this.getAttribute('data-section');
    this.classList.remove('drop-above', 'drop-below');

    if (!reorderDraggedSectionId || !targetId || reorderDraggedSectionId === targetId) return;

    var draggedSec = ct.SECTIONS.find(function (s) { return s.id === reorderDraggedSectionId; });
    var targetSec = ct.SECTIONS.find(function (s) { return s.id === targetId; });
    if (!draggedSec || !targetSec || draggedSec.parent !== targetSec.parent) return;

    // Determine insertion position
    var rect = this.getBoundingClientRect();
    var midY = rect.top + rect.height / 2;
    var insertBefore = e.clientY < midY;

    executeReorder(draggedSec, targetSec, insertBefore);
  }

  async function executeReorder(draggedSec, targetSec, insertBefore) {
    var parentId = draggedSec.parent;
    var parentObj = ct.PARENT_SECTIONS.find(function (p) { return p.id === parentId; });
    if (!parentObj) return;

    // Build new order
    var siblings = parentObj.children.slice();
    var draggedIdx = siblings.findIndex(function (s) { return s.id === draggedSec.id; });
    if (draggedIdx < 0) return;
    siblings.splice(draggedIdx, 1);

    var targetIdx = siblings.findIndex(function (s) { return s.id === targetSec.id; });
    if (targetIdx < 0) return;
    var insertIdx = insertBefore ? targetIdx : targetIdx + 1;
    siblings.splice(insertIdx, 0, draggedSec);

    // Assign new weights 10, 20, 30...
    var updates = [];
    for (var i = 0; i < siblings.length; i++) {
      var newWeight = (i + 1) * 10;
      if (siblings[i].weight !== newWeight) {
        updates.push({ section: siblings[i], newWeight: newWeight });
      }
    }

    if (updates.length === 0) return;

    // Update local state immediately for snappy UI
    for (var u = 0; u < updates.length; u++) {
      updates[u].section.weight = updates[u].newWeight;
      var mapNode = state.sectionMap[updates[u].section.id];
      if (mapNode) mapNode.weight = updates[u].newWeight;
    }
    // Re-sort children
    parentObj.children.sort(function (a, b) {
      if (a.weight !== null && b.weight !== null) return a.weight - b.weight;
      if (a.weight !== null) return -1;
      if (b.weight !== null) return 1;
      return a.label.localeCompare(b.label);
    });
    renderSidebar();

    // Write changed weights to GitHub
    var errors = [];
    for (var w = 0; w < updates.length; w++) {
      try {
        var sec = updates[w].section;
        var node = state.sectionMap[sec.id];
        if (!node) continue;
        var file = await gh.getFile(node.indexPath, state.token);
        if (!file) continue;
        var parsed = ct.parseFile(file.content);
        var fm = parsed.fm || '';
        fm = ct.setField(fm, 'weight', updates[w].newWeight);
        var newContent = ct.reconstruct(fm, parsed.body);
        var msg = 'dashboard: reorder ' + sec.id + ' weight=' + updates[w].newWeight;
        var newSha = await gh.updateFile(node.indexPath, newContent, file.sha, msg, state.token);
        node.indexSha = newSha;
        node.indexFm = fm;
      } catch (err) {
        errors.push(sec.id + ': ' + err.message);
      }
    }

    if (errors.length > 0) {
      toast(errors.length + ' weight update(s) failed', 'error');
    } else {
      toast('Reordered sections', 'success');
    }
  }

  // ── Boot ──────────────────────────────────────────────────────

  init();
})();
