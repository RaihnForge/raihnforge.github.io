#!/usr/bin/env node
// localize-wp.js — make this repo the long-term home for every asset the site
// uses, so the WordPress site (raihn.wordpress.com) and the lapsed
// joshuakeyes.us domain can be deleted without losing anything.
//
// For every WordPress URL in content/**/*.md:
//   raihn.wordpress.com/wp-content/uploads/...  -> downloaded to static/images/wp-imports/uploads/..., link rewritten
//   joshuakeyes.us asset (image) URL            -> rewritten to an existing local copy (matched by filename) if one exists,
//                                                  else to /images/legacy/<original path> (a MISSING slot; the site shows a
//                                                  placeholder until the file is dropped there)
//   WordPress *page* links                      -> rewritten to the matching local post, else the link is removed (text kept)
//
// Every rewrite is recorded in tools/art-catalog/wp-url-map.json (original URL -> local path + status), which is what
// the curator uses to point you at the Wayback Machine copy of each missing file.
//
// Usage: node tools/art-catalog/localize-wp.js [--dry]

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { ROOT, CONTENT, STATIC, walk, readEntry, urlFor } = require('./lib');

const DRY = process.argv.includes('--dry');
const MAP_FILE = path.join(__dirname, 'wp-url-map.json');
const OWN_WP = /^https?:\/\/(www\.)?(raihn\.wordpress\.com|raihn\.files\.wordpress\.com|joshuakeyes\.us)/i;
const URL_RE = /https?:\/\/(?:www\.)?(?:[Rr]aihn\.wordpress\.com|raihn\.files\.wordpress\.com|joshuakeyes\.us)[^\s)"'<>\]]*/g;
const IMG_EXT = /\.(jpe?g|png|gif|bmp|webp|svg)$/i;

const map = fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, 'utf8')) : {};

// ---- index of local images by lowercased basename (with and without extension)
const byName = new Map();
(function index(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) { index(p); continue; }
    const site = '/' + path.relative(STATIC, p).replace(/\\/g, '/');
    for (const key of [ent.name.toLowerCase(), ent.name.toLowerCase().replace(/\.[^.]+$/, '')]) {
      if (!byName.has(key)) byName.set(key, site);
    }
  }
})(path.join(STATIC, 'images'));

// ---- index of local pages by slug (filename + aliases) for page-link remapping
const pageBySlug = new Map();
for (const f of walk(CONTENT)) {
  const { data } = readEntry(f);
  const url = urlFor(f, data);
  const slugs = [path.basename(f, '.md')];
  for (const a of [].concat(data.aliases || [])) slugs.push(String(a).replace(/\/$/, '').split('/').pop());
  for (const s of slugs) if (s && s !== '_index' && !pageBySlug.has(s.toLowerCase())) pageBySlug.set(s.toLowerCase(), url);
}

function isAsset(u) {
  const p = new URL(u).pathname;
  return IMG_EXT.test(p) || /\/wp-content\/uploads\//.test(p) || /\/(images|art)\//i.test(p);
}

function download(u, dest, hops = 0) {
  return new Promise((resolve, reject) => {
    const lib = u.startsWith('https') ? https : http;
    lib.get(u, { headers: { 'User-Agent': 'raihnforge-localizer' } }, res => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && hops < 5) {
        res.resume();
        return resolve(download(new URL(res.headers.location, u).href, dest, hops + 1));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode}`)); }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      const out = fs.createWriteStream(dest);
      res.pipe(out);
      out.on('finish', () => out.close(resolve));
      out.on('error', reject);
    }).on('error', reject);
  });
}

async function resolveUrl(raw) {
  if (map[raw]) return map[raw];
  const u = new URL(raw);
  const host = u.hostname.replace(/^www\./, '').toLowerCase();
  const pth = decodeURIComponent(u.pathname);
  let rec;

  if (host.endsWith('wordpress.com') && /\/wp-content\/uploads\//.test(pth)) {
    const rel = pth.replace(/^.*\/wp-content\/uploads\//, '');
    const local = '/images/wp-imports/uploads/' + rel;
    const dest = path.join(STATIC, local);
    if (fs.existsSync(dest)) rec = { local, status: 'downloaded' };
    else if (DRY) rec = { local, status: 'would-download' };
    else {
      try { await download(`https://${u.hostname}${u.pathname}`, dest); rec = { local, status: 'downloaded' }; }
      catch (e) { rec = { local, status: 'missing', note: `download failed: ${e.message}` }; }
    }
  } else if (isAsset(raw)) {
    const base = path.basename(pth).toLowerCase();
    const hit = byName.get(base) || byName.get(base.replace(/\.[^.]+$/, ''));
    if (hit) rec = { local: hit, status: 'matched' };
    else rec = { local: '/images/legacy' + pth.replace(/\/+$/, ''), status: 'missing' };
  } else {
    const slug = pth.replace(/\/+$/, '').split('/').pop().toLowerCase().replace(/\.html?$/, '');
    const hit = slug && pageBySlug.get(slug);
    rec = hit ? { local: hit, status: 'page-mapped' } : { local: null, status: 'unlinked' };
  }
  rec.wayback = `https://web.archive.org/web/2020/${raw}`;
  map[raw] = rec;
  return rec;
}

(async () => {
  const files = walk(CONTENT);
  const tally = {};
  let changedFiles = 0;
  for (const f of files) {
    let text = fs.readFileSync(f, 'utf8');
    const urls = [...new Set(text.match(URL_RE) || [])].sort((a, b) => b.length - a.length);
    if (!urls.length) continue;
    for (const raw of urls) {
      const rec = await resolveUrl(raw);
      rec.usedIn = [...new Set([...(rec.usedIn || []), path.relative(ROOT, f)])];
      tally[rec.status] = (tally[rec.status] || 0) + 1;
      const esc = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (rec.local) {
        text = text.replace(new RegExp(esc, 'g'), rec.local);
      } else {
        // unlinkable page: [text](url "title") -> text ; any bare remainder is dropped
        text = text.replace(new RegExp(`\\[([^\\]]*)\\]\\(${esc}(?:\\s+"[^"]*")?\\)`, 'g'), '$1');
        text = text.replace(new RegExp(`<?${esc}>?`, 'g'), '');
      }
    }
    if (!DRY) { fs.writeFileSync(f, text); changedFiles++; }
  }
  if (!DRY) fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2) + '\n');
  const left = files.reduce((n, f) => n + ((fs.readFileSync(f, 'utf8').match(OWN_WP_GLOBAL()) || []).length), 0);
  console.log(`${DRY ? '[dry] ' : ''}files touched: ${changedFiles}`);
  console.log('url occurrences by outcome:', tally);
  console.log('own-WordPress URLs remaining in content:', DRY ? '(dry run)' : left);
})();

function OWN_WP_GLOBAL() { return new RegExp(URL_RE.source, 'g'); }
