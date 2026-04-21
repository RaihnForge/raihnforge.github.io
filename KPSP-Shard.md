# Portfolio Website — KPSP-Shard
> Managed by ExPod. Do not modify above the Session Notes line.

## Objective
- **Mission:** Personal portfolio and blog site built with Hugo. Showcases competencies, projects, and journal entries.
- **Deliverable:** Personal portfolio and blog — Hugo static site showcasing competencies, projects, art, gamedev, and journal entries with Decap CMS
- **Intent:** Professional presence and creative showcase — demonstrate product thinking, visual design sensibility, and 20+ years of creative evolution

## Scope
Hugo site generation, content sections (Art, Blog, Gamedev, About), Decap CMS integration, responsive design, deployment pipeline. Out of scope: dynamic server features, user accounts, e-commerce

## Phase
- **Lifecycle:** Monitoring
- **Status:** Product
- **Product Matured:** 2026-02-15

## Milestones & WBS
- **MS 0 — Initiation:** Project kickoff, pillar docs, registration ✓
- **MS 1 — Draft Components:** Core modules stubbed, basic structure in place ✓
- **MS 2 — Core Features:** Primary functionality implemented and working ✓
- **MS 3 — Integration:** Components connected, data flowing end-to-end ✓
- **MS 4 — Polish:** UI refinement, edge cases, error handling ✓
- **MS 5 — Testing & QA:** Verified workflows, cross-browser, responsive ✓
- **MS 6 — Launch Prep:** Documentation, deployment pipeline, final review ✓
- **MS 7 — Ship / Release:** Product live, monitoring phase entered ✓

## Backlog
Unscoped ideas and future work. Not prioritized, not committed.

---

## Recovered Content

- [ ] Investigate recovering lost media from lapsed joshuakeyes.us domain (180 posts affected)
- [ ] Audit recovered posts for placeholder images that could be replaced with alternatives
- [ ] Consider removing recovered notice for posts where media is non-essential

## Design & Styling

- [ ] Break monolithic `style.css` into modular partials (or section-scoped files)
- [ ] Refine dark mode — audit all components for contrast and consistency
- [ ] Add responsive image handling (Hugo image processing or srcset)
- [ ] Evaluate typography scale on mobile devices

## Content & Navigation

- [ ] Add project case studies to gamedev section (deeper product narrative)
- [ ] Surface featured art and gamedev projects more prominently on homepage
- [ ] Add filtering or sorting to art section (by medium, year, subcategory)
- [ ] Review tag taxonomy for consistency across sections

## CMS & Workflow

- [ ] Align Hugo version between local (v0.157.0) and CI (v0.147.0)
- [ ] Add image optimization step to GitHub Actions pipeline
- [ ] Evaluate Decap CMS editorial workflow for multi-draft management

## Infrastructure

- [ ] Configure production `baseURL` properly (currently `/` with manual override)
- [ ] Add sitemap and SEO metadata improvements
- [ ] Set up custom domain if not already configured
- [ ] Add OpenGraph and social sharing meta tags per section

## Session Notes — 2026-04-20 (Products Relaunch)

**Context:** Live GitHub Pages URL `raihnforge.github.io` was serving a stale placeholder from a different repo (`RaihnForge/raihnforge.github.io`) — the Hugo site at localhost was mature but not publicly visible. Also, Products section groupings were tied to old studio-era identifiers that no longer matched what Joshua is actively building.

**Products restructure — new 6-bucket structure under `content/gamedev/`:**

The narrative spine: Mecromage is the through-line creative project. Archkey Studio is the new vehicle — AI-assisted game dev — that redeems the Unchosen Paths era and finishes what the old studio couldn't.

1. **Archkey Studio** (new) — AI-assisted game dev studio. Forward-looking research home. Holds all 8 former `verg-castleroid/` posts (U2DTS study) and NDLZ as a child showcase.
2. **Forge Framework** — kept as-is.
3. **Mecromage** — `_index.md` rewritten as a three-chapter arc: the original Unchosen Paths studio (2009–2018), the honest postmortem, and the Archkey-era rebuild. Absorbs all of Unchosen Paths' history plus all 8 `indie-dev-dues/` posts as legacy devlogs.
4. **mellonOS** (new) — desktop environment shell, seeded overview.
5. **My Drink** (new) — PWA drink-order builder, seeded overview.
6. **TTRPG Character Generator** (new) — FASERIP char gen, seeded overview, marked Released.

**Deprecated & archived:**
- `verg-castleroid/`, `indie-dev-dues/`, `ndlz/`, `unchosen-paths/` — folders removed, content redistributed.
- `ezibg/` — marked `archived: true`. URL still live but filtered from listings.
- 20 Hugo `aliases` added on moved pages and deprecated section roots for URL continuity.

**Layout polish:**
- Homepage hero eyebrow now surfaces `role` param ("Product Owner & Creative Producer") instead of author name.
- Products list page (`layouts/gamedev/list.html`) now filters archived sections and displays an "● Actively updated" micro-label (accent color) on cards whose _index.md or newest child post date is within 90 days.
- New `.project-active` CSS class added.

**Pillar docs synced:**
- `ARCHITECTURE.md` — updated gamedev tree, added URL aliasing section, fixed Sveltia CMS naming, updated build stats.
- `CLAUDE.md` — updated Products table to 6-bucket structure, documented absorption mappings.
- `MEMORY.md` — breadcrumbed the relaunch milestone.

**Deploy cutover (user action pending):**
- Rename `RaihnForge/raihnforge-www` → `RaihnForge/raihnforge.github.io` (after deleting existing placeholder repo) so this Hugo site takes the org-root URL.
- Local git remote needs `git remote set-url origin https://github.com/RaihnForge/raihnforge.github.io.git` after rename.
- Workflow may need `publish_branch` adjustment — GitHub Pages org/user pages can still serve from `gh-pages` branch under current settings, but verify after rename.

## Session Notes — 2026-03-30 (Demo Polish Pass)

**Completed improvements:**

1. **SEO & Social Meta Tags** — Added comprehensive Open Graph, Twitter Card, and canonical URL tags to `baseof.html`. Includes proper image fallback for pages without explicit images.

2. **Custom 404 Page** — Created branded 404 error page at `layouts/404.html` with consistent design, navigation CTAs, and dark mode support. Improves user experience when pages are not found.

3. **Responsive Navigation** — Enhanced mobile responsive behavior for nav at 768px breakpoint. Improved header layout, adjusted font sizes, and optimized spacing for tablet devices.

4. **Flexible Pillars Grid** — Changed `.pillars-grid` from fixed 3-column to `auto-fit` with 300px minimum, improving responsive reflow on tablets and smaller screens.

5. **Keyboard Navigation** — Added `:focus` states to `.btn-primary` and `.btn-secondary` for enhanced keyboard accessibility alongside existing `:hover` states.

6. **Content Validation** — Spot-checked content frontmatter across blog, art, and gamedev sections. All files have complete required fields (title, date, description, tags). Featured flags properly set on key pieces.

*(Session-authored — ExPod harvests on next review)*
