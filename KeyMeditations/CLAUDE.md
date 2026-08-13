# KeyMeditations — AI Instructions

Joshua Keyes Meditations: a wisdom-card deck. Quote + honest attribution on the front;
related cards + expanded pontification on the back. Lens from JBK first — Keyes Axioms
anchor the deck; classical and contemporary thinkers are collected around them.

This folder is the **working/dev home** for the deck. The publish destination is the
portfolio site (`_projects/portfolio-website`) as a Scholar subspace:
`content/scholar/phil/` + `static/scholar/phil/deck.html` → `raihnforge.github.io/scholar/phil/`.

## The binding authorship rule (JBK directive, 2026-08-13)

- **Keyes Axiom backs belong to Joshua.** Never draft pontification for an `origin: axiom`
  card (or any card whose author is JBK, e.g. `good-day`). They ship as marked slots:
  `*Pontification pending — JBK.*` ForgeScribe voice-flag discipline applies — never ventriloquize.
- Collected quotes (other authors): backing context is editor-drafted and labeled as such.
- Attribution stays honest: apocryphal quotes labeled apocryphal (Gandhi), paraphrases point
  at their originals (Patton, Puller, Roosevelt, Rohn). Do not "clean up" an attribution
  by dropping the caveat.

## Layout

```
cards.json                          seed card data (35 cards, 7 themes)
build.js                            generator (Node stdlib, no deps) — cards.json → out/
meditations-deck.html               built deck (self-contained HTML, no deps)
phil/                               Hugo content bundle: _index.md + one .md per card
meditations-lexicon-candidates.json Sage Lexicon proposals (status: candidate — Sage owns the merge)
MEDITATIONS-ISSUE.md                the backlog item / plan of record
```

`node build.js` regenerates everything into `out/` (deck html, phil/ bundle, lexicon json).
Planned evolution (see MEDITATIONS-ISSUE.md): flip source of truth from `cards.json` to the
`phil/*.md` front matter and have the generator read that instead.

## Taxonomy

Themes (Miller's-Law-sized, 7): Self-Command, Action & Momentum, Discipline & Readiness,
Wisdom & Perception, Relationships & Investment, Legacy & the Eternal, Battle Cries.
Origins: `axiom` (Keyes) / `others` (collected) / `motivation` (battle cries).
Card schema: id, title, quote, author, attribution, origin, themes[], related[], back.

## Ownership boundaries

- This folder owns the deck data, generator, and built artifact.
- **Portfolio-website** owns the published pages once the bundle lands there.
- **Sage** owns the Lexicon — we only propose `status: "candidate"` entries.
- **ForgeScribe** owns writing process/voice discipline for any future drafting work.

## Adding a card

1. Add the entry to `cards.json` (id, quote, author, honest attribution, origin, themes,
   related both ways) and a title to the `TITLES` map in `build.js`.
2. `node build.js`; verify the deck renders and related links resolve (builder validates refs).
3. If the card coins a JBK concept, add a candidate entry to the lexicon block in `build.js`.
4. Axiom backs stay empty. Always.
