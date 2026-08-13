#!/usr/bin/env node
/**
 * Meditations deck builder — Node stdlib only, no deps (studio convention).
 * Reads cards.json → emits:
 *   out/meditations-deck.html            self-contained interactive flip-card deck
 *   out/phil/_index.md + out/phil/*.md   Hugo scholar/phil content bundle
 *   out/meditations-lexicon-candidates.json  Sage Lexicon candidate entries
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'out');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'cards.json'), 'utf8'));

const TITLES = {
  'jbk-internal-state': 'The 20–80 Band',
  'jbk-thoughts-manifest': 'Thoughts Manifest',
  'jbk-future-now': 'The Future Is Now',
  'jbk-wisdom-ignorance': 'Wisdom and Ignorance',
  'jbk-invest': 'Investment Parity',
  'jbk-cognizance': 'Cognizance First',
  'jbk-eighty-percent': 'The 80% Reserve',
  'jbk-saying-no': 'The Critical No',
  'jbk-yes-cost': 'The Cost of Yes',
  'jbk-no-drinking': 'The Night Before',
  'jbk-deodorant': 'Only If You Have To',
  'jbk-two-alarms': 'Two Alarms',
  'jbk-twice-work': 'Never Twice Without Reason',
  'jbk-eternal': 'Love, Truth, and Honor',
  'jbk-anger-forge': 'The Smelting of the Self',
  'maximus-echoes': 'Echoes in Eternity',
  'gandhi-be-the-change': 'Be the Change',
  'jesus-golden-rule': 'The Golden Rule',
  'windshield-mirror': 'Windshield and Mirror',
  'jesus-plank': 'The Plank and the Splinter',
  'jesus-fruits': 'By Their Fruits',
  'roosevelt-stick': 'The Big Stick',
  'pym-actions': 'Actions Speak Louder',
  'peterson-sword': 'The Sheathed Sword',
  'patton-wrong-action': 'The Wrong Action Now',
  'rohn-five-people': 'The Company You Keep',
  'socrates-know-thyself': 'Know Thyself',
  'comfortable-self': 'Comfortable in Your Skin',
  'buddha-middle-path': 'The Middle Path',
  'schrute-idiot': 'The Idiot Test',
  'rogan-fun': 'The Fun Gauge',
  'strength-and-honor': 'Strength and Honor',
  'good-day': 'A Good Day Today',
  'surrounded': 'Surrounded, Good',
  'never-give-up': 'Never Give Up, Never Surrender'
};

for (const c of data.cards) {
  c.title = TITLES[c.id] || c.id;
  if (!TITLES[c.id]) console.warn('WARN: no title for', c.id);
}
const byId = Object.fromEntries(data.cards.map(c => [c.id, c]));
// validate related refs
for (const c of data.cards) for (const r of c.related) {
  if (!byId[r]) throw new Error(`bad related ref ${r} on ${c.id}`);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'phil'), { recursive: true });

/* ---------------- deck html ---------------- */
const deckData = JSON.stringify({ themes: data.themes, cards: data.cards }, null, 0)
  .replace(/</g, '\\u003c');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meditations — Joshua Keyes</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#FAFBFE; --card:#ffffff; --ink:#1d2430; --muted:#6b7484; --line:#e4e8f0;
  --accent:#D4722A; --accent-soft:#faeee3; --shadow:0 1px 2px rgba(29,36,48,.06),0 8px 24px rgba(29,36,48,.07);
  --serif:"Source Serif 4",Georgia,serif; --sans:Inter,-apple-system,system-ui,sans-serif;
}
[data-theme="dark"]{
  --bg:#14181f; --card:#1c222c; --ink:#e8ebf1; --muted:#98a1b3; --line:#2b3341;
  --accent:#e08a45; --accent-soft:#33261a; --shadow:0 1px 2px rgba(0,0,0,.4),0 10px 28px rgba(0,0,0,.45);
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--ink);font-family:var(--sans);line-height:1.55;padding:32px 20px 64px;transition:background .25s,color .25s}
.wrap{max-width:1180px;margin:0 auto}
header{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:8px}
h1{font-family:var(--serif);font-weight:600;font-size:2.4rem;letter-spacing:-.01em}
.sub{color:var(--muted);font-size:.95rem;max-width:62ch;margin:6px 0 22px}
.sub b{color:var(--ink);font-weight:600}
#themeToggle{border:1px solid var(--line);background:var(--card);color:var(--muted);border-radius:999px;padding:7px 14px;font:500 .8rem var(--sans);cursor:pointer}
.filters{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}
.filters+.filters{margin-bottom:26px}
.chip{border:1px solid var(--line);background:var(--card);color:var(--muted);border-radius:999px;padding:6px 14px;font:500 .8rem var(--sans);cursor:pointer;transition:all .15s}
.chip:hover{border-color:var(--accent);color:var(--accent)}
.chip[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:#fff}
.chip .n{opacity:.65;font-size:.72rem;margin-left:4px}
.grouplabel{font-size:.68rem;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);align-self:center;margin-right:4px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:18px}
.slot{perspective:1400px;height:360px}
.cardi{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .55s cubic-bezier(.2,.7,.25,1);cursor:pointer}
.slot.flipped .cardi{transform:rotateY(180deg)}
.face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;background:var(--card);border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow);padding:22px;display:flex;flex-direction:column;overflow:hidden}
.face.back{transform:rotateY(180deg)}
.slot.axiom .face{border-left:3px solid var(--accent)}
.badge{font:600 .62rem var(--sans);text-transform:uppercase;letter-spacing:.14em;color:var(--accent);background:var(--accent-soft);border-radius:5px;padding:3px 8px;width:max-content;margin-bottom:12px}
.badge.oth{color:var(--muted);background:transparent;border:1px solid var(--line)}
.qwrap{flex:1;display:flex;align-items:center;min-height:0}
.quote{font-family:var(--serif);font-size:1.28rem;line-height:1.42;font-weight:400}
.quote.long{font-size:1.02rem}.quote.xlong{font-size:.9rem}
.attr{margin-top:14px;padding-top:12px;border-top:1px solid var(--line)}
.attr .who{font-weight:600;font-size:.86rem}
.attr .src{color:var(--muted);font-size:.72rem;margin-top:2px;line-height:1.4}
.ttags{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}
.ttag{font-size:.64rem;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:2px 8px}
.back h3{font-family:var(--serif);font-size:1.05rem;font-weight:600;margin-bottom:8px}
.back .body{font-size:.82rem;color:var(--ink);overflow-y:auto;flex:1;padding-right:6px;min-height:0}
.back .body p{margin-bottom:8px}
.slotnote{font-style:italic;color:var(--muted);border:1px dashed var(--line);border-radius:10px;padding:12px;font-size:.82rem}
.rel{margin-top:12px;padding-top:10px;border-top:1px solid var(--line)}
.rel .rl{font-size:.62rem;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);margin-bottom:6px}
.rel a{display:block;color:var(--accent);font-size:.78rem;text-decoration:none;margin-bottom:3px}
.rel a:hover{text-decoration:underline}
.rel a span{color:var(--muted)}
.flip-hint{position:absolute;right:12px;bottom:10px;font-size:.62rem;color:var(--muted);opacity:.7}
.slot.pulse .face{outline:2px solid var(--accent);outline-offset:2px}
footer{margin-top:44px;color:var(--muted);font-size:.75rem;text-align:center;line-height:1.7}
.count{color:var(--muted);font-size:.8rem;margin:0 0 14px}
@media (max-width:640px){.slot{height:380px}h1{font-size:1.9rem}}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>Meditations</h1>
    <button id="themeToggle" aria-label="Toggle dark mode">◐ theme</button>
  </header>
  <p class="sub"><b>Joshua B. Keyes</b> — a card catalog of collected wisdom, lens from myself first.
  While working at the College, a fellow student worker asked for a nugget of wisdom about once a week; I started writing them down.
  Front is the quote with honest attribution. Back is what it's related to, and the longer pontification.
  <b>Axiom backs are mine to write</b> — other authors' backs carry editor-drafted context.</p>
  <div class="filters" id="themeChips"><span class="grouplabel">Theme</span></div>
  <div class="filters" id="originChips"><span class="grouplabel">Origin</span></div>
  <p class="count" id="count"></p>
  <div class="grid" id="grid"></div>
  <footer>Joshua Keyes Meditations · seeded 2026-08-13 · source of truth: <code>content/scholar/phil/</code> (RaihnForge) · Lexicon candidates registered with Sage<br>
  Editor-drafted backs are marked; every axiom back awaits its author.</footer>
</div>
<script>
const DATA = ${deckData};
const ORIGINS=[["axiom","Keyes Axioms"],["others","Others"],["motivation","Motivation"]];
let theme="all", origin="all";
const grid=document.getElementById('grid');
const state={flipped:new Set()};

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function qClass(q){return q.length>200?'xlong':q.length>120?'long':''}

function chip(label,val,cur,extra){const b=document.createElement('button');b.className='chip';b.setAttribute('aria-pressed',val===cur);b.innerHTML=esc(label)+(extra?'<span class="n">'+extra+'</span>':'');b.dataset.val=val;return b}

function renderChips(){
  const tc=document.getElementById('themeChips');
  tc.querySelectorAll('.chip').forEach(e=>e.remove());
  tc.appendChild(chip('All','all',theme,DATA.cards.length));
  for(const t of DATA.themes){const n=DATA.cards.filter(c=>c.themes.includes(t.id)).length;const b=chip(t.label,t.id,theme,n);b.title=t.blurb;tc.appendChild(b)}
  tc.onclick=e=>{const b=e.target.closest('.chip');if(!b)return;theme=b.dataset.val;render()};
  const oc=document.getElementById('originChips');
  oc.querySelectorAll('.chip').forEach(e=>e.remove());
  oc.appendChild(chip('All','all',origin,''));
  for(const [id,label] of ORIGINS){oc.appendChild(chip(label,id,origin,DATA.cards.filter(c=>c.origin===id).length))}
  oc.onclick=e=>{const b=e.target.closest('.chip');if(!b)return;origin=b.dataset.val;render()};
}

function cardHTML(c){
  const badge=c.origin==='axiom'?'<span class="badge">Keyes Axiom</span>':c.origin==='motivation'?'<span class="badge oth">Battle Cry</span>':'<span class="badge oth">Collected</span>';
  const tags=c.themes.map(t=>{const th=DATA.themes.find(x=>x.id===t);return '<span class="ttag">'+esc(th?th.label:t)+'</span>'}).join('');
  const rel=c.related.map(r=>{const rc=DATA.cards.find(x=>x.id===r);return rc?'<a href="#" data-goto="'+r+'">'+esc(rc.title)+' <span>— '+esc(rc.author)+'</span></a>':''}).join('');
  const back=c.back
    ?'<div class="body"><p>'+esc(c.back)+'</p></div>'
    :'<div class="body"><p class="slotnote">This side belongs to the author. Pontification pending — JBK.</p></div>';
  return '<div class="cardi" role="button" tabindex="0" aria-label="Flip card: '+esc(c.title)+'">'
    +'<div class="face front">'+badge
    +'<div class="qwrap"><blockquote class="quote '+qClass(c.quote)+'">“'+esc(c.quote)+'”</blockquote></div>'
    +'<div class="attr"><div class="who">'+esc(c.author)+'</div><div class="src">'+esc(c.attribution)+'</div></div>'
    +'<div class="ttags">'+tags+'</div><span class="flip-hint">flip ⟳</span></div>'
    +'<div class="face back"><h3>'+esc(c.title)+'</h3>'+back
    +'<div class="rel"><div class="rl">Related</div>'+rel+'</div><span class="flip-hint">flip ⟳</span></div>'
    +'</div>';
}

function visible(){return DATA.cards.filter(c=>(theme==='all'||c.themes.includes(theme))&&(origin==='all'||c.origin===origin))}

function render(){
  renderChips();
  const cards=visible();
  document.getElementById('count').textContent=cards.length+' card'+(cards.length===1?'':'s');
  grid.innerHTML='';
  for(const c of cards){
    const slot=document.createElement('div');
    slot.className='slot'+(c.origin==='axiom'?' axiom':'')+(state.flipped.has(c.id)?' flipped':'');
    slot.id='card-'+c.id;
    slot.innerHTML=cardHTML(c);
    const flip=()=>{slot.classList.toggle('flipped');state.flipped.has(c.id)?state.flipped.delete(c.id):state.flipped.add(c.id)};
    slot.addEventListener('click',e=>{
      const go=e.target.closest('[data-goto]');
      if(go){e.preventDefault();e.stopPropagation();goto(go.dataset.goto);return}
      flip();
    });
    slot.querySelector('.cardi').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip()}});
    grid.appendChild(slot);
  }
}

function goto(id){
  theme='all';origin='all';render();
  const el=document.getElementById('card-'+id);
  if(!el)return;
  el.scrollIntoView({behavior:'smooth',block:'center'});
  el.classList.add('pulse');setTimeout(()=>el.classList.remove('pulse'),1600);
}

const tbtn=document.getElementById('themeToggle');
const prefersDark=matchMedia('(prefers-color-scheme: dark)').matches;
let dark=prefersDark;
function applyTheme(){document.documentElement.setAttribute('data-theme',dark?'dark':'light')}
tbtn.onclick=()=>{dark=!dark;applyTheme()};
applyTheme();
render();
</script>
</body>
</html>`;
fs.writeFileSync(path.join(OUT, 'meditations-deck.html'), html);

/* ---------------- hugo markdown bundle ---------------- */
const yq = s => '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
const ORIGIN_LABEL = { axiom: 'Keyes Axiom', others: 'Collected', motivation: 'Battle Cry' };

const indexMd = `---
title: "Philosophy"
code: "PHIL"
description: "The Meditations — a card catalog of collected wisdom, lens from myself first. Keyes axioms alongside classical and contemporary thinkers, each card carrying its attribution, its relations, and a longer pontification."
weight: 90
---

The Meditations began at the College: a fellow student worker asked for a nugget of wisdom about once a week, and I started writing them down. This section is that habit given a proper home — a deck of cards, each one a quote with honest attribution on the front and, on the back, the cards it relates to plus the longer pontification.

The lens is my own first. The Keyes axioms anchor the deck; classical and contemporary thinkers — from the Sermon on the Mount to Chesty Puller to Dwight Schrute — are collected around them, connected by theme rather than by era. Attribution is kept honest: apocryphal quotes are labeled apocryphal, paraphrases point at their originals.

Backs follow an authorship rule: for collected quotes, the backing context is editor-drafted; the back of every Keyes axiom is reserved for its author.

**[Browse the interactive deck →](/scholar/phil/deck.html)**
`;
fs.writeFileSync(path.join(OUT, 'phil', '_index.md'), indexMd);

for (const c of data.cards) {
  const themesYaml = '[' + c.themes.map(yq).join(', ') + ']';
  const relatedYaml = '[' + c.related.map(yq).join(', ') + ']';
  const body = c.back
    ? c.back
    : `<!-- PONTIFICATION SLOT — this back belongs to Joshua. Related cards render from front matter. -->\n\n*Pontification pending — JBK.*`;
  const md = `---
title: ${yq(c.title)}
date: 2026-08-13
quote: ${yq(c.quote)}
author: ${yq(c.author)}
attribution: ${yq(c.attribution)}
origin: ${yq(c.origin)}
origin_label: ${yq(ORIGIN_LABEL[c.origin])}
themes: ${themesYaml}
related: ${relatedYaml}
category: "PHIL"
category_label: "Philosophy"
editor: "Claude (Fable 5) — deck seeding; axiom backs reserved for the author"
tags: ["Meditations", "Philosophy", "Wisdom Cards"]
draft: false
---

${body}
`;
  fs.writeFileSync(path.join(OUT, 'phil', c.id + '.md'), md);
}

/* ---------------- sage lexicon candidates ---------------- */
const lex = {
  "$schema": "../dev-ops/sage/lexicon/README.md#schema",
  "meta": {
    "proposedBy": "meditations (scholar/phil) — 2026-08-13",
    "note": "Candidate entries per the Lexicon consumer contract: propose, don't write. Author approves before merge into concepts.json."
  },
  "concepts": [
    {
      "id": "keyes-axioms",
      "term": "The Keyes Axioms",
      "aliases": ["KeyesJB Axioms", "the College nuggets"],
      "domain": "meditations",
      "definition": "Joshua Keyes' collected first-person maxims, begun at the College when a fellow student worker asked for weekly nuggets of wisdom. The anchor set of the Meditations deck; each axiom's expanded backing is authored only by JBK.",
      "source": "portfolio-website/content/scholar/phil/",
      "related": ["meditations-deck"],
      "status": "candidate",
      "conflicts": []
    },
    {
      "id": "meditations-deck",
      "term": "The Meditations Deck",
      "aliases": ["Joshua Keyes Meditations", "wisdom cards"],
      "domain": "meditations",
      "definition": "A card catalog of collected wisdom, lens-from-self-first: quote + honest attribution on the front; related cards + longer pontification on the back. Thematic taxonomy (Self-Command, Action & Momentum, Discipline & Readiness, Wisdom & Perception, Relationships & Investment, Legacy & the Eternal, Battle Cries). Published as a scholar/phil subspace on RaihnForge.",
      "source": "portfolio-website/content/scholar/phil/",
      "related": ["keyes-axioms"],
      "status": "candidate",
      "conflicts": []
    },
    {
      "id": "internal-state-band",
      "term": "The 20–80 Band",
      "aliases": ["internal state thresholds", "20/80 rule (Keyes)"],
      "domain": "meditations",
      "definition": "Keyes Axiom No. 1: if your internal state is affected 20–80%, regroup, reflect, consider, consolidate; past 80%, immediately engage or disengage. A triage rule for emotional load. Distinct from the Pareto 80/20 principle.",
      "source": "portfolio-website/content/scholar/phil/jbk-internal-state.md",
      "related": ["keyes-axioms", "eighty-percent-reserve", "anger-as-smelting"],
      "status": "candidate",
      "conflicts": []
    },
    {
      "id": "eighty-percent-reserve",
      "term": "The 80% Reserve",
      "aliases": ["80% consistent effort"],
      "domain": "meditations",
      "definition": "Keyes Axiom No. 7: aim for 80% consistent effort, holding reserve for the moments 120% is required. Sustainable pace as a readiness doctrine, not a comfort doctrine.",
      "source": "portfolio-website/content/scholar/phil/jbk-eighty-percent.md",
      "related": ["keyes-axioms", "internal-state-band"],
      "status": "candidate",
      "conflicts": []
    },
    {
      "id": "yes-cost",
      "term": "The Cost of Yes",
      "aliases": ["saying yes is saying no"],
      "domain": "meditations",
      "definition": "Keyes Axioms No. 8–9 taken together: every yes silently spends uncountable no's, so the critical skill is the no — with a standing exception for those who genuinely love you.",
      "source": "portfolio-website/content/scholar/phil/jbk-yes-cost.md",
      "related": ["keyes-axioms", "investment-parity"],
      "status": "candidate",
      "conflicts": []
    },
    {
      "id": "investment-parity",
      "term": "Investment Parity",
      "aliases": ["never invest more than they do"],
      "domain": "meditations",
      "definition": "Keyes Axiom No. 5: never invest in someone more than they are willing to invest in themselves. A boundary rule for mentorship, management, and love alike.",
      "source": "portfolio-website/content/scholar/phil/jbk-invest.md",
      "related": ["keyes-axioms", "yes-cost"],
      "status": "candidate",
      "conflicts": []
    },
    {
      "id": "wisdom-ignorance-expansion",
      "term": "Wisdom–Ignorance Expansion",
      "aliases": ["exponential ignorance"],
      "domain": "meditations",
      "definition": "Keyes Axiom No. 4: every step toward wisdom is met with the exponential realization of ignorance. The growing shoreline of the unknown as a feature of learning, not a failure of it.",
      "source": "portfolio-website/content/scholar/phil/jbk-wisdom-ignorance.md",
      "related": ["keyes-axioms"],
      "status": "candidate",
      "conflicts": []
    },
    {
      "id": "anger-as-smelting",
      "term": "Anger as Smelting",
      "aliases": ["the forging of the self", "warming of anger"],
      "domain": "meditations",
      "definition": "Keyes Axiom No. 15 (2026-08-13): a warming of anger in self-consciousness is akin to the smelting of metal — a requirement of change, the forging of the self. Anger read as process heat to be worked with, not a failure state to be suppressed.",
      "source": "portfolio-website/content/scholar/phil/jbk-anger-forge.md",
      "related": ["keyes-axioms", "internal-state-band"],
      "status": "candidate",
      "conflicts": []
    }
  ]
};
fs.writeFileSync(path.join(OUT, 'meditations-lexicon-candidates.json'), JSON.stringify(lex, null, 2));

console.log('cards:', data.cards.length,
  '| axioms:', data.cards.filter(c => c.origin === 'axiom').length,
  '| drafted backs:', data.cards.filter(c => c.back).length,
  '| author slots:', data.cards.filter(c => !c.back).length);
console.log('wrote:', fs.readdirSync(OUT).join(', '));
console.log('phil bundle:', fs.readdirSync(path.join(OUT, 'phil')).length, 'files');
