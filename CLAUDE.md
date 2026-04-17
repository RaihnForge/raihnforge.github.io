# RaihnForge Portfolio — Project Guide

## Current Status

**Hugo static site** — 257 content `.md` files across nested sections, Sveltia CMS configured.
Originally imported from WordPress.com (232 posts, 7 pages, 683 media files) in Feb 2026, then restructured into nested Hugo sections on 2026-03-01 with category/product navigation.

| Section | Nav Label | Structure |
|---------|-----------|-----------|
| `content/art/` | "Design" | 5 subcategories: `branding` (36), `esports` (36), `fine-art` (3), `illustration` (79), `study` (41) — counts incl. `_index.md` |
| `content/gamedev/` | "Products" | 7 product folders, each with `_index.md` + devlog child posts (e.g. `mecromage/` has 16) |
| `content/blog/` | "Journal" | 19 flat posts |
| `content/about.md` | "About" | Single page |

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
- GitHub backend: `RaihnForge/raihnforge-www` / `main`
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

## Workflow Rules

- Complete ALL tiers/phases of a plan before moving on. Do not skip ahead or start new phases prematurely.
- Always update KPSP-Shard.md and ARCHITECTURE.md after implementing features or completing plans. Proactively prune completed items.
- Verify you are editing files in the CORRECT project directory before making changes. Check ownership boundaries.
