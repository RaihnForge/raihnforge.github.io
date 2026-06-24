# RaihnForge Portfolio — Project Guide

## Current Status

**Hugo static site** — 257 content `.md` files across nested sections, Sveltia CMS configured.
Originally imported from WordPress.com (232 posts, 7 pages, 683 media files) in Feb 2026, then restructured into nested Hugo sections on 2026-03-01 with category/product navigation.

| Section | Nav Label | Structure |
|---------|-----------|-----------|
| `content/art/` | "Design" | 5 subcategories: `branding` (36), `esports` (36), `fine-art` (3), `illustration` (79), `study` (41) — counts incl. `_index.md` |
| `content/gamedev/` | "Products" | 8 active product buckets + 1 archived (`ezibg`). Active: `archkey`, `forge-framework`, `grimas-bane`, `mecromage`, `mellon-os`, `my-drink`, `narya`, `ttrpg` |
| `content/blog/` | "Journal" | 19 flat posts |
| `content/about.md` | "About" | Single page |

### Products structure (2026-04-20 restructure)

The Products section was consolidated on 2026-04-20 around what Joshua is actively building. Each bucket has an `_index.md` overview and optional devlog children.

**Narrative architecture:** Mecromage holds the long creative arc (Unchosen Paths era → postmortem → rebuild), and Archkey Studio is the new vehicle — an AI-assisted game dev studio that finishes the work the old studio couldn't. The two pages cross-reference each other.

| Bucket | Status | Role | Content |
|--------|--------|------|---------|
| `archkey/` | In Development | Developer, Artist & Director | AI-assisted game dev studio. Holds former `verg-castleroid/` (8 U2DTS posts) + NDLZ as a child. 9 devlog children. |
| `forge-framework/` | In Development | Creator & Author | Organizational management theory |
| `mecromage/` | In Progress | Producer, Artist & Game Director | The through-line project. `_index.md` contains full UP postmortem + Archkey redemption arc. 23 devlog children (15 original + 2 UP daily diaries + 6 process posts from former `indie-dev-dues/`); 9 are `archived: true` (pre-2016 recovered). |
| `mellon-os/` | In Development | Architect & Developer | Windowed desktop environment shell |
| `my-drink/` | In Development | Creator & Developer | PWA drink-order builder |
| `ttrpg/` | Released | Creator & Developer | FASERIP character generator |
| `narya/` | Released | Creator & Developer | Vendor-agnostic Windows system-tray GPU watcher (PowerShell). Public repo under RaihnForge. |
| `grimas-bane/` | Released | Creator & Developer | Chrome MV3 extension that blocks Shorts/Reels on YouTube/Facebook/Instagram/TikTok by default. Public repo + Pages landing under RaihnForge. |
| `ezibg/` | Archived | — | 2019 wallpaper product. `archived: true`, hidden from listings but URL live |

Deprecated sections (`verg-castleroid`, `indie-dev-dues`, `ndlz`, `unchosen-paths`) redirect to their new homes via Hugo `aliases` frontmatter.

- `indie-dev-dues/` → `/gamedev/mecromage/` (all 8 posts moved there)
- `unchosen-paths/` → `/gamedev/mecromage/`
- `verg-castleroid/` → `/gamedev/archkey/`
- `ndlz/` → `/gamedev/archkey/ndlz/`

**Build:** `hugo` — builds in ~330ms, 1470 pages, 512 static files.

**Archived content:** 99 pre-2016 recovered posts carry `archived: true`. Pages remain reachable at direct URLs with an archive notice, but are hidden from section listings, category counts, and homepage features (archived 2026-03-01, commit `4c52908`).

---

## Architecture

- **Hugo** static site generator (v0.157.0 local, v0.147.0 in CI)
- **No external theme** — custom layouts in `layouts/`
- **No JavaScript** — pure CSS, except Sveltia CMS admin panel
- **Sveltia CMS** at `/admin/` for content management (GitHub backend; migrated from Decap on 2026-03-01)
- **Deploy:** GitHub Actions → gh-pages branch

### Key Directories

```
content/          # Markdown content (art, blog, gamedev, about)
layouts/          # Hugo templates (baseof, index, section-specific)
static/css/       # Single monolithic style.css
static/images/    # Original images + wp-imports/ from migration
static/admin/     # Decap CMS (index.html + config.yml)
scripts/          # Import tools (import-wordpress.py)
.tempdocs/        # Temp migration data (gitignored)
```

### Design System

- **Light mode primary** with dark mode via `[data-theme="dark"]`
- **Colors:** `--bg: #FAFBFE`, `--accent: #D4722A` (burnt orange)
- **Typography:** Inter (body) + Source Serif 4 (display) via Google Fonts
- **CSS variables** defined in `:root` in `static/css/style.css`

---

## Content Types & Front Matter

### Art (`content/art/<category>/*.md`)
```yaml
title: ""
date: YYYY-MM-DD
description: ""
tags: []
image: "/images/..."
medium: ""        # Digital, Pencil, Acrylic, Mixed Media, etc.
year: 2007
featured: false   # Show on homepage
recovered: false  # Lost external media
archived: false   # Hide from listings; URL stays live
draft: false
```

### Blog (`content/blog/*.md`)
```yaml
title: ""
date: YYYY-MM-DD
description: ""
tags: []
image: ""
recovered: false
archived: false
draft: false
```

### Game Dev / Products (`content/gamedev/<product>/_index.md` + child posts)
```yaml
title: ""
date: YYYY-MM-DD
description: ""
tags: []
image: ""
status: ""        # Released, In Progress, In Development, Concept
engine: ""        # Optional — for software products
role: ""          # Joshua's role
timeline: ""      # e.g. "2009-2018" or "2024–Present"
featured: false
recovered: false
archived: false
draft: false
```

Products are folders, not flat files — each one has an `_index.md` for the product overview, with child `.md` files as devlog entries.

---

## Navigation & URL Mapping

URLs stay as `/art/`, `/blog/`, `/gamedev/`. Nav labels are reframed:

| URL Path | Nav Label | Subnav |
|----------|-----------|--------|
| `/art/` | Work → Visual Design | Visual Design / Products |
| `/gamedev/` | Work → Products | Visual Design / Products |
| `/blog/` | Journal | — |
| `/about/` | About | — |

---

## Recovered Content

180 posts have `recovered: true` — these originally referenced images on joshuakeyes.us (domain lapsed). Templates show a muted notice:

> *Some media from this post was originally hosted externally and could not be recovered.*

Styled via `.recovered-notice` in style.css.

Of these 180 recovered posts, the 99 dated pre-2016 additionally carry `archived: true` — see the Archived content note in Current Status.

---

## Positioning

Site positions Joshua Keyes for **Product Owner** roles. Content emphasizes:
- Product thinking and human-centric design
- Visual design craft and creative process
- 20+ year creative evolution
- Military discipline, 4.0 GPA ITAM degree, systems thinking

Voice: friendly, professional, reflective — focused on human enrichment.

---

## Build & Deploy

```bash
hugo                    # Build site
hugo server -D          # Dev server with drafts
hugo --gc               # Build + garbage collect
```

**Deploy:** Push to `main` → GitHub Actions builds and deploys to gh-pages.
**Note:** `baseURL` in `hugo.toml` is `/` — override for production with `hugo --baseURL "https://yourdomain.com/"`.

---

## CMS

Sveltia CMS at `/admin/` (migrated from Decap on 2026-03-01, commit `2ec087c`):
- GitHub backend: `RaihnForge/raihnforge.github.io` / `main`
- Collections: art, blog, gamedev, pages (about)
- Custom dashboard extension at `/admin/dashboard/` for content management (reorder, validate, merge, duplicate)

---

## Migration History

Imported from WordPress.com WXR export (Feb 2026):
- 228 posts converted (169 art, 26 blog, 33 gamedev)
- 146 media files copied to `static/images/wp-imports/`
- 180 posts flagged as recovered (joshuakeyes.us media lost)
- 27 pre-existing hand-crafted posts preserved (skipped during import)
- Import script: `scripts/import-wordpress.py`

## Scholar privacy conventions

Scholar papers reference real workplaces, colleagues, and procurement engagements. To keep this archive public-safe without flattening the work, current and future scholar content follows these conventions:

**Generalize identifying details.**
- Employer name → "an EdTech employer" / "the employer" / "my EdTech employer" (whichever reads naturally)
- Specific product names (e.g., flagship platform names) → "the survey platform," "the internal content system"
- Internal codenames (e.g., KC3) → "the internal content control system" / "the content system"
- Named colleagues → role labels only ("our CTO," "our COO," "our CRO"). Do not preserve first-initial / last-initial form — it still narrows identity in a small org.
- Named classmates → "Teammate 1 / Teammate 2 / Teammate 3" (numbered consistently within a single paper). Do not preserve real first names.
- Addresses, office locations, phone numbers, work email handles → redact entirely or replace with "[redacted]"
- City + state pairs that uniquely identify the employer → state only

**Preserve.**
- Frameworks, decisions, outcomes, dates, courses, professors, references, citations, and Joshua's own role and actions
- The author's full name (Joshua Keyes) and educational institution (CWU)
- Generic tool names that are industry-standard (Jira, Slack, Canva, RISE 360, GitHub, etc.)

**Two layout hooks make this self-explanatory to readers.**
- Every non-course-summary scholar page renders a quiet "Names and identifiers" footer disclaimer (`layouts/scholar/single.html`) — do not duplicate this disclaimer inline in the markdown body.
- Frontmatter may include `role_note: "…"` to record where Joshua's official title differed from his operational role. The note renders as a distinct accent block in the editorial context. Use it on any paper that discusses his EdTech employment, since the Lead Production Designer title under-described his Product Manager scope (a mutually understood compensation-banding compromise).

**Process when importing new scholar content from Drive or older notebooks.**
1. Read the source for any of the categories above and apply the substitutions before publishing.
2. Set `role_note` if the paper names the employer role.
3. Spot-check the rendered page locally — the footer disclaimer should be visible; the role-note block should appear above the article when set.

## Workflow Rules

- Complete ALL tiers/phases of a plan before moving on. Do not skip ahead or start new phases prematurely.
- Always update KPSP-Shard.md and ARCHITECTURE.md after implementing features or completing plans. Proactively prune completed items.
- Verify you are editing files in the CORRECT project directory before making changes. Check ownership boundaries.
