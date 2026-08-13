# Backlog item — Meditations: scholar/phil subspace (portfolio-website)

> KPSP-Shard-ready. Destination: `_projects/portfolio-website/KPSP-Shard.md` § Backlog.
> Drafted 2026-08-13 from the Cowork "development" project session. Owner: Joshua (JBK).

## The item

**Meditations — publish the wisdom-card deck as a Scholar subspace at `raihnforge.github.io/scholar/phil/`.**

A card catalog of collected wisdom, lens from JBK first: quote + honest attribution on the front; related cards + expanded pontification on the back. Seed deck is 35 cards — 15 Keyes Axioms (incl. the new anger-as-smelting axiom, 2026-08-13), 16 collected quotes, 4 battle cries — organized by a 7-theme taxonomy (Self-Command, Action & Momentum, Discipline & Readiness, Wisdom & Perception, Relationships & Investment, Legacy & the Eternal, Battle Cries).

## Placement decision

- **Section:** `content/scholar/phil/` — "PHIL" follows the existing scholar dept-code pattern (ADMG, CS, ENG, HIST, IT, MATH, MUS, RELS, RMT). `_index.md` provided (weight 90, slots after RMT).
- **Interactive deck:** `static/scholar/phil/deck.html` — self-contained HTML, shipped the same way as `/forge-framework/reader.html`. This preserves the site's **no-JavaScript layouts convention**: the Hugo pages stay pure CSS; the interactivity lives in one standalone artifact linked from the `_index.md`.
- **Source of truth:** the per-card markdown files (`content/scholar/phil/<card-id>.md`). Front matter carries the machine-readable card (quote, author, attribution, origin, themes, related); the body is the back-of-card text. The deck HTML is a build artifact.

## Authorship rule (binding, per JBK 2026-08-13)

- Collected quotes (other authors): backing context is **editor-drafted** and labeled as such.
- **Keyes Axioms: the back belongs to JBK.** Seed files ship with a marked pontification slot (`*Pontification pending — JBK.*`); no session drafts these. (ForgeScribe voice-flag discipline applies: never ventriloquize.)
- Attribution stays honest: apocryphal quotes labeled apocryphal (Gandhi), paraphrases point at originals (Patton, Puller, Roosevelt, Rohn).

## Work remaining

1. **Land the seed** — copy `phil/` bundle into `content/scholar/`, `meditations-deck.html` into `static/scholar/phil/deck.html`; verify `hugo` builds and `/scholar/phil/` lists cards; check the scholar dept image convention (pick an Unsplash header image for the PHIL `_index.md` like the other depts).
2. **Deck regeneration script** — `scripts/build-meditations-deck.js` (Node stdlib): parse `content/scholar/phil/*.md` front matter → regenerate `static/scholar/phil/deck.html`, so markdown stays the single source of truth. (Seed generator exists from this session; adapt it to read front matter instead of cards.json.)
3. **JBK writes axiom backs** — 16 author slots open (15 axioms + "A Good Day Today"). Deck renders them as reserved slots until filled.
4. **Sage Lexicon submission** — `meditations-lexicon-candidates.json` (8 concepts, `status: "candidate"`) proposed per the Lexicon consumer contract; Joshua approves → merge into `dev-ops/sage/lexicon/concepts.json`. Adds a new `meditations` domain.
5. **Optional, later:** scholar `single.html` treatment for card pages (front-matter-driven card rendering); printable PDF export; new-card intake flow (a note → card pipeline, candidate for ForgeScribe involvement).

## Boundaries check

- **Portfolio-website** owns the published pages + deck artifact.
- **Sage** owns the Lexicon; we only propose candidates.
- **ForgeScribe** owns writing process/voice discipline — future axiom-back drafting sessions (if ever delegated) go through its `[AUTHOR:…]` flags.
- Not a new top-level project; no port, no service, no Valinor entry needed.
