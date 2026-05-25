#!/usr/bin/env node
// scripts/build-mindmap.js
//
// Generates .tempdocs/portfolio-site-map.xmind — a multi-sheet XMind file
// describing the portfolio site map and the major user flows.
//
// Self-contained: no npm dependencies. Writes a minimal valid .xmind
// (zip containing content.xml + META-INF/manifest.xml) using the XMind 8
// XML format, which both XMind 8 and Zen/2024 can open.
//
// Usage: node scripts/build-mindmap.js

const fs = require('fs');
const path = require('path');

// ─── Mind map data ──────────────────────────────────────────────────
// Each sheet becomes a tab in XMind. Each topic { title, children? }
// becomes a node. Tree depth is unrestricted.

const sheets = [
  {
    id: 'sheet-sitemap',
    title: 'Site Map',
    root: {
      title: 'RaihnForge (Portfolio Site)',
      children: [
        {
          title: 'Home (/)',
          children: [
            { title: 'Hero statement' },
            { title: '3 Value Pillars (Product / Visual / Process)' },
            { title: 'Featured Work (sampler items)' },
            { title: 'From the Journal (3 recent posts)' },
            { title: "CTA: Let's Talk" },
          ],
        },
        {
          title: 'Gallery (/art/) — top nav',
          children: [
            {
              title: 'Showcase scroll (data/portfolio_gallery.yml, lightbox)',
              children: [
                { title: 'Illustration (18 tiles)' },
                { title: 'Logo Design (6)' },
                { title: 'Pixel Art (5)' },
                { title: 'Environment Concepts (13)' },
                { title: 'Character Concepts (11)' },
                { title: 'Game Animation (13)' },
                { title: 'Emotes (8)' },
                { title: 'Overlays (5)' },
                { title: 'Cheermotes (5)' },
              ],
            },
            {
              title: 'Discipline sections (lightbox, dedupes vs showcase)',
              children: [
                { title: 'Branding' },
                { title: 'Esports' },
                { title: 'Fine Art' },
                { title: 'Illustration' },
                { title: 'Study' },
              ],
            },
            { title: 'Selected Works cards (link to /portfolio/...)' },
            {
              title: 'Discipline sub-pages (/art/<discipline>/)',
              children: [
                { title: 'Portfolio pieces tier (curator)' },
                { title: 'More work tier (visual grid)' },
                { title: 'Archive tier (text by year)' },
                { title: 'Related journal entries' },
              ],
            },
          ],
        },
        {
          title: 'Products (/gamedev/) — top nav',
          children: [
            { title: 'Archkey Studio' },
            { title: 'Forge Framework' },
            { title: 'Mecromage (through-line)' },
            { title: 'mellonOS' },
            { title: 'My Drink' },
            { title: 'TTRPG' },
            { title: 'Ezibg (archived)' },
          ],
        },
        { title: 'Journal (/blog/) — top nav' },
        {
          title: 'Scholar (/scholar/) — top nav',
          children: [
            { title: 'ADMG' },
            { title: 'CS' },
            { title: 'ENG' },
            { title: 'HIST' },
            { title: 'IT' },
            { title: 'MATH' },
            { title: 'MUS' },
            { title: 'RELS' },
            { title: 'RMT' },
            { title: 'Transfer Credits' },
          ],
        },
        { title: 'About (/about/) — top nav' },
        {
          title: 'Selected Works (/portfolio/) — surfaced from Gallery, NOT in top nav',
          children: [
            { title: '/selected-works/ (alias)' },
            {
              title: 'Riot Portfolio',
              children: [
                { title: '/portfolio/riot/ (Hugo page)' },
                { title: '/riot-portfolio/ (static HTML)' },
                { title: 'PDF source: scripts/pdf-build/riot-portfolio.html' },
              ],
            },
            {
              title: 'Game Graphics Portfolio',
              children: [
                { title: '/portfolio/game-graphics/' },
                { title: '/game-graphics-portfolio/' },
                { title: 'PDF source: scripts/pdf-build/game-graphics-portfolio.html' },
              ],
            },
            {
              title: 'CWU Portfolio',
              children: [
                { title: '/portfolio/cwu/' },
              ],
            },
          ],
        },
        {
          title: 'Admin',
          children: [
            { title: '/admin/ — Sveltia CMS (GitHub backend)' },
            { title: '/admin/dashboard/ — content management dashboard' },
          ],
        },
      ],
    },
  },

  {
    id: 'sheet-flow-gallery',
    title: 'Flow: Gallery Browse',
    root: {
      title: 'Browse the Gallery',
      children: [
        {
          title: 'Entry',
          children: [
            { title: 'Home: "View Work" CTA' },
            { title: 'Top nav: Gallery' },
            { title: 'Direct URL /art/' },
          ],
        },
        {
          title: 'On /art/ page',
          children: [
            { title: 'See page header + intro' },
            {
              title: 'Showcase scroll (84 tiles, 9 sections)',
              children: [
                { title: 'Hover any tile: title overlay reveals' },
                { title: 'Click any tile: Lightbox opens (see Flow: Lightbox)' },
              ],
            },
            { title: 'Scroll past showcase' },
            {
              title: 'Discipline section (e.g. Illustration)',
              children: [
                { title: 'See section heading + description' },
                { title: 'Browse dense tile grid (same style as showcase)' },
                { title: 'Click tile: Lightbox (cycles WITHIN this discipline)' },
                { title: 'Click "See all N pieces": Discipline page' },
              ],
            },
            {
              title: 'Bottom: Selected Works cards',
              children: [
                { title: 'Click a card: see Flow: Selected Works' },
              ],
            },
          ],
        },
        {
          title: 'On Discipline page (/art/<discipline>/)',
          children: [
            { title: 'Sibling category filter pills' },
            { title: 'Portfolio pieces tier (curator-flagged)' },
            { title: 'More work grid' },
            { title: 'Archive (text list by year)' },
            { title: 'Related journal entries' },
          ],
        },
        { title: 'Click any piece: Detail page /art/<discipline>/<slug>/' },
      ],
    },
  },

  {
    id: 'sheet-flow-lightbox',
    title: 'Flow: Lightbox',
    root: {
      title: 'Lightbox Interaction',
      children: [
        {
          title: 'Trigger',
          children: [
            { title: 'Click on .portfolio-gallery-tile' },
            { title: 'JS: e.preventDefault() on linked tiles' },
          ],
        },
        {
          title: 'Open',
          children: [
            {
              title: 'JS reads data-* attrs from tile',
              children: [
                { title: 'data-section (lightbox group id)' },
                { title: 'data-index' },
                { title: 'data-image' },
                { title: 'data-title' },
                { title: 'data-description (optional, from linked page)' },
                { title: 'data-link (optional, RelPermalink)' },
              ],
            },
            { title: 'lightbox.classList.add("is-open")' },
            { title: 'document.body.style.overflow = "hidden"' },
            { title: 'closeBtn.focus()' },
          ],
        },
        {
          title: 'View state',
          children: [
            { title: 'Image (max-height 70vh)' },
            { title: 'Title (display serif)' },
            { title: 'Description (hidden if absent)' },
            { title: '"Read full post →" (hidden if no data-link)' },
            { title: 'Counter "N / Total within section"' },
          ],
        },
        {
          title: 'Navigate',
          children: [
            { title: 'Right arrow: step(+1)' },
            { title: 'Left arrow: step(-1)' },
            { title: 'Prev / Next chevron buttons' },
            { title: 'Cycles at boundaries (modulo)' },
            { title: 'Constraint: section-bound (no cross-section jump)' },
          ],
        },
        {
          title: 'Close',
          children: [
            { title: 'Esc key' },
            { title: 'Click backdrop (e.target === lightbox)' },
            { title: 'X (Close) button' },
            { title: 'Restore focus to triggering tile' },
          ],
        },
      ],
    },
  },

  {
    id: 'sheet-flow-selected-works',
    title: 'Flow: Selected Works',
    root: {
      title: 'Selected Works Discovery',
      children: [
        {
          title: 'Discovery paths',
          children: [
            { title: 'Bottom of /art/ (Gallery) — Selected Works section' },
            { title: 'Direct URL /portfolio/ or /selected-works/' },
            { title: 'Continue Exploring strip on Selected Works page' },
          ],
        },
        {
          title: 'Selected Works landing (/portfolio/)',
          children: [
            { title: 'Page header (title + audience-tailored framing)' },
            {
              title: 'Card grid',
              children: [
                { title: 'Riot Portfolio' },
                { title: 'Game Graphics Portfolio' },
                { title: 'CWU Portfolio' },
              ],
            },
            { title: 'Continue Exploring (Gallery / Products / Scholar / Journal)' },
          ],
        },
        {
          title: 'Card click resolution',
          children: [
            { title: 'If external_url set: open that URL (target=_blank for http)' },
            { title: 'Riot card: /riot-portfolio/ (static HTML)' },
            { title: 'Game Graphics card: /game-graphics-portfolio/' },
            { title: 'CWU card: /portfolio/cwu/' },
          ],
        },
        {
          title: 'On a static portfolio page',
          children: [
            { title: 'Print-friendly page-frame layout' },
            { title: 'Hero overlay + multi-section content flow' },
            { title: 'PDF download (built from scripts/pdf-build/<name>.html)' },
            { title: 'Audience-specific framing (cover letter style)' },
          ],
        },
      ],
    },
  },

  {
    id: 'sheet-arch',
    title: 'Architecture',
    root: {
      title: 'Site Architecture',
      children: [
        {
          title: 'Content (markdown)',
          children: [
            { title: '/content/art/ — 5 disciplines' },
            { title: '/content/blog/ — journal posts' },
            { title: '/content/gamedev/ — 6 active products + 1 archived' },
            { title: '/content/scholar/ — CWU course papers' },
            { title: '/content/portfolio/ — Selected Works pages' },
            { title: '/content/about.md' },
          ],
        },
        {
          title: 'Data',
          children: [
            { title: '/data/portfolio_gallery.yml — showcase scroll source of truth' },
          ],
        },
        {
          title: 'Layouts',
          children: [
            { title: '/layouts/baseof.html' },
            { title: '/layouts/index.html (homepage)' },
            { title: '/layouts/art/list.html (Gallery + discipline buckets)' },
            { title: '/layouts/art/single.html (piece detail)' },
            { title: '/layouts/portfolio/list.html (Selected Works landing)' },
            { title: '/layouts/portfolio/single.html (selected work detail)' },
            { title: '/layouts/gamedev/{list,single}.html' },
            { title: '/layouts/scholar/{list,single}.html' },
          ],
        },
        {
          title: 'Partials',
          children: [
            { title: 'portfolio-gallery-scroll.html (YAML driven, 9 sections)' },
            { title: 'gallery-lightbox-modal.html (markup + script tag)' },
            { title: 'selected-works.html (shared on Gallery and /portfolio/)' },
          ],
        },
        {
          title: 'Static assets',
          children: [
            { title: '/static/css/style.css (monolithic)' },
            { title: '/static/js/gallery-lightbox.js' },
            { title: '/static/images/...' },
            { title: '/static/admin/ — Sveltia CMS UI' },
            { title: '/static/riot-portfolio/ — selected-work static HTML' },
            { title: '/static/game-graphics-portfolio/ — selected-work static HTML' },
          ],
        },
        {
          title: 'Tooling',
          children: [
            { title: 'scripts/import-wordpress.py' },
            { title: 'scripts/pdf-build/riot-portfolio.html (PDF source)' },
            { title: 'scripts/pdf-build/game-graphics-portfolio.html (PDF source)' },
            { title: 'scripts/add-journal-crossrefs.py' },
            { title: 'scripts/restructure-content.py' },
            { title: 'scripts/build-mindmap.js (THIS FILE)' },
          ],
        },
        {
          title: 'Build & Deploy',
          children: [
            { title: 'Hugo v0.157 local / v0.147 CI' },
            { title: 'GitHub Actions: .github/workflows/hugo.yml' },
            { title: 'gh-pages branch → raihnforge.github.io' },
            { title: 'Auto-snapshot cron for uncommitted work' },
          ],
        },
        {
          title: 'CMS',
          children: [
            { title: 'Sveltia CMS at /admin/ (GitHub backend, main branch)' },
            { title: 'Collections: art, blog, gamedev, scholar, pages' },
            { title: 'Dashboard extension at /admin/dashboard/' },
          ],
        },
      ],
    },
  },
];

// ─── XML escaping ──────────────────────────────────────────────────
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── XML generation ────────────────────────────────────────────────
let idCounter = 0;
function nextId() { return 't' + (++idCounter); }

function renderTopic(topic) {
  let xml = `<topic id="${nextId()}">`;
  xml += `<title>${esc(topic.title)}</title>`;
  if (topic.children && topic.children.length) {
    xml += '<children><topics type="attached">';
    for (const c of topic.children) xml += renderTopic(c);
    xml += '</topics></children>';
  }
  xml += '</topic>';
  return xml;
}

function buildContent() {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n';
  xml += '<xmap-content xmlns="urn:xmind:xmap:xmlns:content:2.0" ';
  xml += 'xmlns:fo="http://www.w3.org/1999/XSL/Format" ';
  xml += 'xmlns:svg="http://www.w3.org/2000/svg" ';
  xml += 'xmlns:xhtml="http://www.w3.org/1999/xhtml" ';
  xml += 'xmlns:xlink="http://www.w3.org/1999/xlink" ';
  xml += 'version="2.0">\n';
  for (const sheet of sheets) {
    xml += `  <sheet id="${esc(sheet.id)}">`;
    xml += renderTopic(sheet.root);
    xml += `<title>${esc(sheet.title)}</title>`;
    xml += '</sheet>\n';
  }
  xml += '</xmap-content>\n';
  return xml;
}

const MANIFEST = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<manifest xmlns="urn:xmind:xmap:xmlns:manifest:1.0">
  <file-entry full-path="content.xml" media-type="text/xml"/>
  <file-entry full-path="META-INF/" media-type=""/>
  <file-entry full-path="META-INF/manifest.xml" media-type=""/>
</manifest>
`;

// ─── CRC32 ─────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = (CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8)) >>> 0;
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// ─── Minimal zip writer (STORED method, no compression) ────────────
function buildZip(files) {
  const localParts = [];
  const cdParts = [];
  let offset = 0;

  for (const f of files) {
    const nameBuf = Buffer.from(f.name, 'utf8');
    const dataLen = f.data.length;
    const crc = crc32(f.data);

    const lfh = Buffer.alloc(30);
    lfh.writeUInt32LE(0x04034b50, 0);
    lfh.writeUInt16LE(20, 4);
    lfh.writeUInt16LE(0, 6);
    lfh.writeUInt16LE(0, 8);
    lfh.writeUInt16LE(0, 10);
    lfh.writeUInt16LE(0, 12);
    lfh.writeUInt32LE(crc, 14);
    lfh.writeUInt32LE(dataLen, 18);
    lfh.writeUInt32LE(dataLen, 22);
    lfh.writeUInt16LE(nameBuf.length, 26);
    lfh.writeUInt16LE(0, 28);
    localParts.push(lfh, nameBuf, f.data);

    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8);
    cd.writeUInt16LE(0, 10);
    cd.writeUInt16LE(0, 12);
    cd.writeUInt16LE(0, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(dataLen, 20);
    cd.writeUInt32LE(dataLen, 24);
    cd.writeUInt16LE(nameBuf.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(offset, 42);
    cdParts.push(cd, nameBuf);

    offset += 30 + nameBuf.length + dataLen;
  }

  const cdStart = offset;
  let cdSize = 0;
  for (const p of cdParts) cdSize += p.length;

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(cdSize, 12);
  eocd.writeUInt32LE(cdStart, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, ...cdParts, eocd]);
}

// ─── Build & write ─────────────────────────────────────────────────
const contentXml = buildContent();
const files = [
  { name: 'content.xml', data: Buffer.from(contentXml, 'utf8') },
  { name: 'META-INF/manifest.xml', data: Buffer.from(MANIFEST, 'utf8') },
];

const zip = buildZip(files);
const outDir = path.join(__dirname, '..', '.tempdocs');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'portfolio-site-map.xmind');
fs.writeFileSync(outPath, zip);

console.log(`Wrote ${outPath}`);
console.log(`  size: ${zip.length} bytes`);
console.log(`  sheets: ${sheets.length}`);
console.log(`  topics: ${idCounter}`);
