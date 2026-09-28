#!/usr/bin/env node
// curator.js — local-only Art Curator for the RaihnForge site (:3145).
//
//   node tools/art-catalog/curator.js     → http://localhost:3145
//
// What it does:
//   Works    — every art entry with its type / subtype / rating / curated flag, sorted best→worst.
//              Edits write straight into the entry's frontmatter (content/art/**.md).
//   Missing  — every image slot the site shows a placeholder for, with the post it belongs to and a
//              Wayback Machine link to the original. Drop a file on a slot and it lands at exactly the
//              path the post already references, so the placeholder disappears on the next build.
//
// Nothing here is deployed. Changes reach the live site only when you commit + push.
// Binds to 127.0.0.1. Node stdlib only.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { ROOT, STATIC, setFields, loadTaxonomy } = require('./lib');
const { build } = require('./catalog');

const PORT = Number(process.env.PORT) || 3145;
const MAX_UPLOAD = 40 * 1024 * 1024;
const IMG_TYPES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.bmp': 'image/bmp' };

function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []; let n = 0;
    req.on('data', c => { n += c.length; if (n > limit) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Only files the catalog knows about may be edited; only known missing slots (or a new cover) may be written.
function knownEntry(rel) {
  const cat = build();
  return cat.entries.find(e => e.file === rel);
}

function safeStaticPath(sitePath) {
  if (!sitePath.startsWith('/images/')) return null;
  const abs = path.join(STATIC, decodeURIComponent(sitePath.split(/[?#]/)[0]));
  return abs.startsWith(path.join(STATIC, 'images') + path.sep) ? abs : null;
}

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && u.pathname === '/') return send(res, 200, PAGE, 'text/html; charset=utf-8');
    if (req.method === 'GET' && u.pathname === '/api/catalog') return send(res, 200, build());

    if (req.method === 'GET' && u.pathname.startsWith('/images/')) {
      const abs = safeStaticPath(u.pathname);
      if (!abs || !fs.existsSync(abs)) return send(res, 404, 'not found', 'text/plain');
      return send(res, 200, fs.readFileSync(abs), IMG_TYPES[path.extname(abs).toLowerCase()] || 'application/octet-stream');
    }

    if (req.method === 'POST' && u.pathname === '/api/entry') {
      const body = JSON.parse((await readBody(req, 64 * 1024)).toString());
      const entry = knownEntry(body.file);
      if (!entry) return send(res, 404, { error: 'unknown entry' });
      const tax = loadTaxonomy();
      const t = tax.types.find(x => x.id === body.art_type);
      if (!t || !t.subtypes.some(s => s.id === body.art_subtype)) return send(res, 400, { error: 'type/subtype not in taxonomy' });
      const rating = Math.round(Number(body.rating));
      if (!(rating >= 1 && rating <= 10)) return send(res, 400, { error: 'rating must be 1-10' });
      const fields = { art_type: t.id, art_subtype: body.art_subtype, rating, curated: body.curated === true };
      if (typeof body.title === 'string' && body.title.trim()) fields.title = body.title.trim();
      if (body.year !== undefined && body.year !== '') fields.year = Number(body.year) || body.year;
      setFields(path.join(ROOT, entry.file), fields);
      return send(res, 200, { ok: true });
    }

    // PUT /api/upload?slot=/images/...            fill a known missing slot at its exact path
    // PUT /api/upload?cover=<entry file>&ext=.png  give an image-less entry a cover
    if (req.method === 'PUT' && u.pathname === '/api/upload') {
      const data = await readBody(req, MAX_UPLOAD);
      if (!data.length) return send(res, 400, { error: 'empty upload' });
      const cat = build();
      let dest, sitePath;
      if (u.searchParams.get('slot')) {
        sitePath = u.searchParams.get('slot');
        const known = cat.entries.some(e => e.missing.some(m => m.path === sitePath));
        if (!known) return send(res, 400, { error: 'not a known missing slot' });
        dest = safeStaticPath(sitePath);
      } else if (u.searchParams.get('cover')) {
        const entry = cat.entries.find(e => e.file === u.searchParams.get('cover'));
        const ext = (u.searchParams.get('ext') || '').toLowerCase();
        if (!entry || !IMG_TYPES[ext]) return send(res, 400, { error: 'unknown entry or file type' });
        sitePath = `/images/art/covers/${path.basename(entry.file, '.md')}${ext}`;
        dest = safeStaticPath(sitePath);
        setFields(path.join(ROOT, entry.file), { image: sitePath });
      }
      if (!dest) return send(res, 400, { error: 'bad destination' });
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, data);
      return send(res, 200, { ok: true, path: sitePath });
    }

    send(res, 404, { error: 'not found' });
  } catch (e) {
    send(res, 500, { error: e.message });
  }
});

server.listen(PORT, '127.0.0.1', () => console.log(`Art Curator → http://localhost:${PORT}`));

// ------------------------------------------------------------------ UI
const PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Art Curator · RaihnForge</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><rect width='16' height='16' rx='3' fill='%23D4722A'/><path d='M4 11l3-4 2 2.5L10.5 8 13 11z' fill='white'/></svg>">
<style>
:root{--bg:#FAFBFE;--panel:#fff;--ink:#1d2130;--muted:#6b7285;--line:#e3e6ee;--accent:#D4722A;--ok:#2f8f5b;--warn:#b7791f;--bad:#c0392b}
@media (prefers-color-scheme:dark){:root{--bg:#14161c;--panel:#1c1f27;--ink:#e8eaf0;--muted:#9aa1b2;--line:#2c303b}}
*{box-sizing:border-box}body{margin:0;font:14px/1.45 Inter,system-ui,sans-serif;background:var(--bg);color:var(--ink)}
header{position:sticky;top:0;z-index:5;background:var(--panel);border-bottom:1px solid var(--line);padding:10px 18px;display:flex;gap:16px;align-items:center;flex-wrap:wrap}
h1{font-size:16px;margin:0}h1 span{color:var(--accent)}
.tabs button{border:1px solid var(--line);background:none;color:var(--ink);padding:6px 12px;border-radius:6px;cursor:pointer}
.tabs button.on{background:var(--accent);border-color:var(--accent);color:#fff}
.stats{color:var(--muted);font-size:12px;margin-left:auto}
.filters{display:flex;gap:8px;flex-wrap:wrap;padding:10px 18px;border-bottom:1px solid var(--line)}
select,input{font:inherit;color:var(--ink);background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:5px 8px}
input[type=number]{width:60px}
main{padding:12px 18px 60px}
table{width:100%;border-collapse:collapse;background:var(--panel);border:1px solid var(--line);border-radius:8px;overflow:hidden}
th,td{padding:7px 9px;border-bottom:1px solid var(--line);text-align:left;vertical-align:middle}
th{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);background:var(--bg);position:sticky;top:0}
td.thumb img{width:72px;height:54px;object-fit:cover;border-radius:4px;background:var(--line);display:block}
.title{font-weight:600}.sub{color:var(--muted);font-size:12px}
a{color:var(--accent)}
.pill{display:inline-block;padding:1px 7px;border-radius:10px;font-size:11px;border:1px solid var(--line);color:var(--muted)}
.pill.ok{color:var(--ok);border-color:var(--ok)}.pill.warn{color:var(--warn);border-color:var(--warn)}.pill.bad{color:var(--bad);border-color:var(--bad)}
tr.saved td{transition:background .6s;background:rgba(47,143,91,.12)}
.confirm{border:1px solid var(--ok);color:var(--ok);background:none;border-radius:6px;padding:4px 9px;cursor:pointer}
.slot{display:grid;grid-template-columns:110px 1fr;gap:12px;align-items:center;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:10px;margin-bottom:8px}
.drop{border:2px dashed var(--line);border-radius:8px;height:80px;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:12px;text-align:center;cursor:pointer}
.drop.over{border-color:var(--accent);color:var(--accent)}
code{font-size:12px;word-break:break-all}
.group{margin:18px 0 6px;font-weight:600}
.note{color:var(--muted);font-size:12px;margin:6px 0 12px}
</style></head><body>
<header>
  <h1>Art Curator <span>· RaihnForge</span></h1>
  <div class="tabs"><button data-tab="works" class="on">Works</button> <button data-tab="missing">Missing images</button></div>
  <div class="stats" id="stats"></div>
</header>
<div class="filters" id="filters">
  <input id="q" placeholder="Search title / tags / file" size="26">
  <select id="fType"><option value="">All types</option></select>
  <select id="fSub"><option value="">All subtypes</option></select>
  <select id="fCur"><option value="">Curated + unconfirmed</option><option value="no">Unconfirmed only</option><option value="yes">Confirmed only</option></select>
  <select id="fVis"><option value="visible">Visible on site</option><option value="archived">Archived</option><option value="">All</option></select>
  <select id="fImg"><option value="">Any image state</option><option value="missing">Has missing images</option><option value="none">No cover image</option></select>
</div>
<main id="main"></main>
<script>
let CAT = null, TAB = 'works';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const typeById = id => CAT.taxonomy.types.find(t => t.id === id);

async function load() {
  CAT = await (await fetch('/api/catalog')).json();
  const ft = $('#fType'); const keep = ft.value;
  ft.innerHTML = '<option value="">All types</option>' + CAT.taxonomy.types.map(t => '<option value="'+t.id+'">'+esc(t.title)+'</option>').join('');
  ft.value = keep; fillSub(); render();
}
function fillSub() {
  const t = typeById($('#fType').value); const keep = $('#fSub').value;
  $('#fSub').innerHTML = '<option value="">All subtypes</option>' + (t ? t.subtypes.map(s => '<option value="'+s.id+'">'+esc(s.title)+'</option>').join('') : '');
  $('#fSub').value = t && t.subtypes.some(s => s.id === keep) ? keep : '';
}
function filtered() {
  const q = $('#q').value.toLowerCase(), ty = $('#fType').value, st = $('#fSub').value, cu = $('#fCur').value, vi = $('#fVis').value, im = $('#fImg').value;
  return CAT.entries.filter(e =>
    (!q || (e.title + ' ' + e.tags.join(' ') + ' ' + e.file).toLowerCase().includes(q)) &&
    (!ty || e.art_type === ty) && (!st || e.art_subtype === st) &&
    (!cu || (cu === 'yes') === e.curated) &&
    (!vi || (vi === 'archived') === e.archived) &&
    (!im || (im === 'missing' ? e.missing.length : e.imageStatus === 'none')));
}
function stats() {
  const e = CAT.entries, c = e.filter(x => x.curated).length, m = e.reduce((n, x) => n + x.missing.length, 0);
  $('#stats').textContent = e.length + ' works · ' + c + ' confirmed · ' + m + ' missing images · catalog ' + new Date(CAT.generated).toLocaleTimeString();
}
function render() { stats(); TAB === 'works' ? renderWorks() : renderMissing(); }

function typeSelect(e) {
  return '<select data-f="art_type">' + CAT.taxonomy.types.map(t => '<option value="'+t.id+'"'+(t.id===e.art_type?' selected':'')+'>'+esc(t.title)+'</option>').join('') + '</select>';
}
function subSelect(e) {
  const t = typeById(e.art_type);
  return '<select data-f="art_subtype">' + (t ? t.subtypes : []).map(s => '<option value="'+s.id+'"'+(s.id===e.art_subtype?' selected':'')+'>'+esc(s.title)+'</option>').join('') + '</select>';
}
function thumb(e) {
  const ok = e.imageStatus === 'ok';
  return ok ? '<img loading="lazy" src="'+esc(e.image)+'" alt="">' : '<img src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E" alt="" title="no image">';
}
function renderWorks() {
  const rows = filtered();
  $('#main').innerHTML = '<p class="note">Sorted best → worst by rating. Edits save immediately into the post\\'s frontmatter. <b>Confirm</b> marks the type/subtype/rating as yours (curated: true); unconfirmed values are machine guesses.</p>' +
  '<table><thead><tr><th></th><th>Work</th><th>Type</th><th>Subtype</th><th>Rating</th><th>Status</th><th>Links</th></tr></thead><tbody>' +
  rows.map(e => '<tr data-file="'+esc(e.file)+'">' +
    '<td class="thumb">'+thumb(e)+'</td>' +
    '<td><div class="title">'+esc(e.title)+'</div><div class="sub">'+esc(e.folder)+(e.year?' · '+esc(e.year):'')+(e.medium?' · '+esc(e.medium):'')+(e.archived?' · archived':'')+'</div></td>' +
    '<td>'+typeSelect(e)+'</td><td>'+subSelect(e)+'</td>' +
    '<td><input type="number" min="1" max="10" data-f="rating" value="'+e.rating+'"></td>' +
    '<td>'+(e.curated?'<span class="pill ok">confirmed</span>':'<button class="confirm">Confirm</button>') +
      (e.missing.length?' <span class="pill warn">'+e.missing.length+' missing</span>':'') + (e.imageStatus==='none'?' <span class="pill bad">no cover</span>':'') + '</td>' +
    '<td class="sub"><a href="'+esc(e.liveUrl)+'" target="_blank">live</a> · <a href="'+esc(e.localUrl)+'" target="_blank">local</a>'+(e.related?' · <a href="https://raihnforge.github.io'+esc(e.related)+'" target="_blank">related</a>':'')+'</td>' +
  '</tr>').join('') + '</tbody></table>' + (rows.length ? '' : '<p class="note">Nothing matches these filters.</p>');
}

async function save(tr, confirm) {
  const e = CAT.entries.find(x => x.file === tr.dataset.file);
  const get = f => tr.querySelector('[data-f="'+f+'"]').value;
  const body = { file: e.file, art_type: get('art_type'), art_subtype: get('art_subtype'), rating: Number(get('rating')), curated: confirm || e.curated };
  const r = await fetch('/api/entry', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) { alert(j.error); return; }
  Object.assign(e, body);
  tr.classList.add('saved'); setTimeout(() => tr.classList.remove('saved'), 900);
  if (confirm) { CAT.entries.sort((a,b) => b.rating - a.rating || a.title.localeCompare(b.title)); render(); }
  stats();
}

$('#main').addEventListener('change', ev => {
  const tr = ev.target.closest('tr[data-file]'); if (!tr) return;
  if (ev.target.dataset.f === 'art_type') {
    const e = CAT.entries.find(x => x.file === tr.dataset.file);
    e.art_type = ev.target.value; e.art_subtype = typeById(e.art_type).subtypes[0].id;
    tr.children[3].innerHTML = subSelect(e);
  }
  save(tr, false);
});
$('#main').addEventListener('click', ev => {
  if (ev.target.classList.contains('confirm')) save(ev.target.closest('tr'), true);
});

function renderMissing() {
  const rows = filtered().filter(e => e.missing.length || e.imageStatus === 'none');
  let html = '<p class="note">Each slot is an image a post references but the repo does not have. Drop the file (or click to choose) and it is saved to the exact path shown, so the placeholder on the site is replaced on the next build. Use the Wayback link to hunt for the original.</p>';
  for (const e of rows) {
    html += '<div class="group">'+esc(e.title)+' <span class="sub">— <a href="'+esc(e.liveUrl)+'" target="_blank">live post</a> · <a href="'+esc(e.localUrl)+'" target="_blank">local</a> · <code>'+esc(e.file)+'</code></span></div>';
    if (e.imageStatus === 'none') html += slot({ kind: 'cover', file: e.file, label: 'No cover image — upload one to give this work a thumbnail' });
    for (const m of e.missing) html += slot({ kind: 'slot', path: m.path, role: m.role, original: m.original, wayback: m.wayback });
  }
  $('#main').innerHTML = rows.length ? html : html + '<p class="note">Nothing missing under these filters. 🎉</p>';
}
function slot(s) {
  const data = s.kind === 'cover' ? 'data-cover="'+esc(s.file)+'"' : 'data-slot="'+esc(s.path)+'"';
  const info = s.kind === 'cover' ? '<div>'+esc(s.label)+'</div>' :
    '<div><span class="pill">'+esc(s.role)+'</span> <code>'+esc(s.path)+'</code></div>' +
    (s.original ? '<div class="sub">was: <code>'+esc(s.original)+'</code> · <a href="'+esc(s.wayback)+'" target="_blank">find on Wayback Machine</a></div>' : '');
  return '<div class="slot"><div class="drop" '+data+'>Drop image<br>or click</div><div>'+info+'</div></div>';
}
async function upload(drop, file) {
  const qs = drop.dataset.slot ? 'slot=' + encodeURIComponent(drop.dataset.slot)
    : 'cover=' + encodeURIComponent(drop.dataset.cover) + '&ext=' + encodeURIComponent(('.' + file.name.split('.').pop()).toLowerCase());
  drop.textContent = 'Uploading…';
  const r = await fetch('/api/upload?' + qs, { method: 'PUT', body: file });
  const j = await r.json();
  if (!r.ok) { drop.textContent = j.error; return; }
  await load();
}
$('#main').addEventListener('dragover', ev => { const d = ev.target.closest('.drop'); if (d) { ev.preventDefault(); d.classList.add('over'); } });
$('#main').addEventListener('dragleave', ev => { const d = ev.target.closest('.drop'); if (d) d.classList.remove('over'); });
$('#main').addEventListener('drop', ev => { const d = ev.target.closest('.drop'); if (!d) return; ev.preventDefault(); d.classList.remove('over'); if (ev.dataTransfer.files[0]) upload(d, ev.dataTransfer.files[0]); });
$('#main').addEventListener('click', ev => {
  const d = ev.target.closest('.drop'); if (!d) return;
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = () => inp.files[0] && upload(d, inp.files[0]); inp.click();
});

document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => {
  document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b));
  TAB = b.dataset.tab; render();
});
['#q','#fCur','#fVis','#fImg','#fSub'].forEach(s => $(s).addEventListener('input', render));
$('#fType').addEventListener('input', () => { fillSub(); render(); });
load();
</script></body></html>`;
