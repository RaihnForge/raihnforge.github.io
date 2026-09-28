// Shared helpers for the art catalog tools. Node stdlib only.
//
// Frontmatter handling is deliberately narrow: we READ simple YAML (scalars,
// inline arrays, block lists) and WRITE only top-level scalar keys, replacing
// the line in place or appending before the closing `---`. Everything else in
// a file is left byte-for-byte untouched.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONTENT = path.join(ROOT, 'content');
const STATIC = path.join(ROOT, 'static');
const TAXONOMY_FILE = path.join(ROOT, 'data', 'art_taxonomy.json');
const LIVE_BASE = 'https://raihnforge.github.io';

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith('.md')) out.push(p);
  }
  return out;
}

function splitFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(\r?\n|$)/);
  if (!m) return null;
  return { fm: m[1], body: text.slice(m[0].length), head: m[0] };
}

function unquote(v) {
  v = v.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  return v;
}

function parseFrontmatter(fm) {
  const data = {};
  const lines = fm.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!m) continue;
    const [, key, raw] = m;
    if (raw === '') {
      const list = [];
      while (i + 1 < lines.length && /^\s+-\s*/.test(lines[i + 1])) list.push(unquote(lines[++i].replace(/^\s+-\s*/, '')));
      data[key] = list.length ? list : '';
    } else if (raw.startsWith('[')) {
      data[key] = raw.replace(/^\[|\]$/g, '').split(',').map(unquote).filter(Boolean);
    } else {
      const v = unquote(raw);
      data[key] = v === 'true' ? true : v === 'false' ? false : (/^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v);
    }
  }
  return data;
}

function yamlScalar(v) {
  if (typeof v === 'boolean' || typeof v === 'number') return String(v);
  return JSON.stringify(String(v));
}

// Set top-level scalar keys in a markdown file's frontmatter. Returns true if changed.
function setFields(file, fields) {
  const text = fs.readFileSync(file, 'utf8');
  const parts = splitFrontmatter(text);
  if (!parts) throw new Error(`no frontmatter: ${file}`);
  let lines = parts.fm.split(/\r?\n/);
  for (const [key, value] of Object.entries(fields)) {
    const idx = lines.findIndex(l => l.startsWith(key + ':'));
    if (value === null || value === undefined) {
      if (idx >= 0) lines.splice(idx, 1);
      continue;
    }
    const line = `${key}: ${yamlScalar(value)}`;
    if (idx >= 0) lines[idx] = line;
    else {
      // append before any trailing blank lines so the block stays tidy
      let at = lines.length;
      while (at > 0 && lines[at - 1].trim() === '') at--;
      lines.splice(at, 0, line);
    }
  }
  const next = `---\n${lines.join('\n')}\n---\n` + parts.body;
  if (next === text) return false;
  fs.writeFileSync(file, next);
  return true;
}

function readEntry(file) {
  const text = fs.readFileSync(file, 'utf8');
  const parts = splitFrontmatter(text);
  return { file, data: parts ? parseFrontmatter(parts.fm) : {}, body: parts ? parts.body : text };
}

function loadTaxonomy() {
  return JSON.parse(fs.readFileSync(TAXONOMY_FILE, 'utf8'));
}

// Local site path (/images/..) -> exists on disk?
function localExists(p) {
  if (!p || !p.startsWith('/')) return false;
  const clean = decodeURIComponent(p.split(/[?#]/)[0]);
  return fs.existsSync(path.join(STATIC, clean));
}

// content file -> site URL path (honours `url:` / slug-free Hugo default)
function urlFor(file, data) {
  if (data && data.url) return data.url;
  let rel = path.relative(CONTENT, file).replace(/\\/g, '/').replace(/\.md$/, '');
  rel = rel.replace(/(^|\/)_index$/, '').replace(/(^|\/)index$/, '');
  return '/' + (rel ? rel.toLowerCase() + '/' : '');
}

module.exports = { ROOT, CONTENT, STATIC, LIVE_BASE, walk, splitFrontmatter, parseFrontmatter, setFields, readEntry, loadTaxonomy, localExists, urlFor };
