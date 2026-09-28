#!/usr/bin/env node
// catalog.js — the full inventory of art entries with their curation metadata.
//
//   node tools/art-catalog/catalog.js          summary + taxonomy validation
//   node tools/art-catalog/catalog.js --json   the whole catalog as JSON (what the curator serves)
//
// Also usable as a module: require('./catalog').build()

const fs = require('fs');
const path = require('path');
const { ROOT, CONTENT, LIVE_BASE, walk, readEntry, loadTaxonomy, localExists, urlFor } = require('./lib');

const MAP_FILE = path.join(__dirname, 'wp-url-map.json');
const IMG_RE = /!\[[^\]]*\]\(([^)\s]+)/g;          // markdown image sources
const LINK_IMG_RE = /\]\((\/images\/[^)\s]+)/g;     // any link/image pointing at /images/

function build() {
  const tax = loadTaxonomy();
  const types = new Map(tax.types.map(t => [t.id, t]));
  const wp = fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, 'utf8')) : {};
  const originalOf = {};
  for (const [orig, rec] of Object.entries(wp)) if (rec.local) originalOf[rec.local] = { original: orig, wayback: rec.wayback };

  const entries = [];
  for (const file of walk(path.join(CONTENT, 'art'))) {
    if (path.basename(file) === '_index.md') continue;
    const { data, body } = readEntry(file);
    const url = urlFor(file, data);
    const t = types.get(data.art_type);
    const problems = [];
    if (!t) problems.push(`unknown art_type "${data.art_type || ''}"`);
    else if (!t.subtypes.some(s => s.id === data.art_subtype)) problems.push(`unknown art_subtype "${data.art_subtype || ''}" for ${t.id}`);
    if (!(Number(data.rating) >= 1 && Number(data.rating) <= 10)) problems.push(`rating "${data.rating ?? ''}" not 1-10`);

    const image = data.image || '';
    const imageStatus = !image ? 'none' : (image.startsWith('/') ? (localExists(image) ? 'ok' : 'missing') : 'external');
    const refs = new Set();
    for (const re of [IMG_RE, LINK_IMG_RE]) for (const m of body.matchAll(re)) if (m[1].startsWith('/images/')) refs.add(m[1]);
    const missing = [];
    if (imageStatus === 'missing') missing.push({ path: image, role: 'cover', ...(originalOf[image] || {}) });
    for (const r of refs) if (!localExists(r) && r !== image) missing.push({ path: r, role: 'body', ...(originalOf[r] || {}) });

    entries.push({
      file: path.relative(ROOT, file).replace(/\\/g, '/'),
      folder: path.relative(path.join(CONTENT, 'art'), path.dirname(file)).replace(/\\/g, '/'),
      url, liveUrl: LIVE_BASE + url, localUrl: 'http://localhost:1313' + url,
      title: data.title || path.basename(file, '.md'),
      year: data.year || (data.date ? String(data.date).slice(0, 4) : ''),
      archived: data.archived === true,
      art_type: data.art_type || '', art_subtype: data.art_subtype || '',
      rating: Number(data.rating) || 0, curated: data.curated === true,
      image, imageStatus, missing,
      medium: Array.isArray(data.medium) ? data.medium.join(', ') : (data.medium || ''),
      tags: [].concat(data.tags || []),
      related: data.related || '', source: data.source || '',
      description: data.description || '',
      problems,
    });
  }
  entries.sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title));
  return { taxonomy: tax, entries, generated: new Date().toISOString() };
}

module.exports = { build };

if (require.main === module) {
  const cat = build();
  if (process.argv.includes('--json')) { process.stdout.write(JSON.stringify(cat, null, 2)); process.exit(0); }
  const e = cat.entries;
  const live = e.filter(x => !x.archived);
  console.log(`art entries: ${e.length} (${live.length} visible, ${e.length - live.length} archived)`);
  console.log(`curated by Joshua: ${e.filter(x => x.curated).length} / ${e.length}`);
  console.log(`cover image: ok ${e.filter(x => x.imageStatus === 'ok').length} · missing ${e.filter(x => x.imageStatus === 'missing').length} · none ${e.filter(x => x.imageStatus === 'none').length}`);
  console.log(`missing image slots (cover + body): ${e.reduce((n, x) => n + x.missing.length, 0)}`);
  console.log('\nby type (visible):');
  for (const t of cat.taxonomy.types) {
    const inT = live.filter(x => x.art_type === t.id);
    console.log(`  ${t.title.padEnd(24)} ${String(inT.length).padStart(3)}   ` + t.subtypes.map(s => `${s.id} ${inT.filter(x => x.art_subtype === s.id).length}`).join(' · '));
  }
  const bad = e.filter(x => x.problems.length);
  console.log(bad.length ? `\n⚠ ${bad.length} entries fail taxonomy validation:` : '\n✔ every entry validates against data/art_taxonomy.json');
  for (const b of bad) console.log(`  ${b.file}: ${b.problems.join('; ')}`);
  process.exit(bad.length ? 1 : 0);
}
