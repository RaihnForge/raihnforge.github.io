# RaihnForge Portfolio — Project Guide

## Current Status

**Hugo static site** — 255+ content files, zero build errors, Decap CMS configured.
Migrated from WordPress.com (232 posts, 7 pages, 683 media files).

| Section | Content Files | Nav Label |
|---------|---------------|-----------|
| `content/art/` | 180 (+ _index.md) | "Visual Design" / "Design" |
| `content/blog/` | 37 (+ _index.md) | "Journal" |
| `content/gamedev/` | 38 (+ _index.md) | "Products" |
| `content/about.md` | 1 | "About" |

**Build:** `hugo` — builds in ~400ms, 1463 pages, 165 static files.

---

## Architecture

- **Hugo** static site generator (v0.157.0 local, v0.147.0 in CI)
- **No external theme** — custom layouts in `layouts/`
- **No JavaScript** — pure CSS, except Decap CMS admin panel
- **Decap CMS** at `/admin/` for content management (GitHub backend)
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

### Art (`content/art/*.md`)
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
draft: false
```

### Game Dev (`content/gamedev/*.md`)
```yaml
title: ""
date: YYYY-MM-DD
description: ""
tags: []
image: ""
status: ""        # Released, In Progress, Concept
engine: ""
role: ""          # Joshua's role
timeline: ""      # e.g. "2009-2018"
featured: false
recovered: false
draft: false
```

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

Decap CMS at `/admin/`:
- GitHub backend: `RaihnForge/raihnforge-www` / `main`
- Editorial workflow enabled (draft → review → publish)
- Collections: art, blog, gamedev, pages (about)

---

## Migration History

Imported from WordPress.com WXR export (Feb 2026):
- 228 posts converted (169 art, 26 blog, 33 gamedev)
- 146 media files copied to `static/images/wp-imports/`
- 180 posts flagged as recovered (joshuakeyes.us media lost)
- 27 pre-existing hand-crafted posts preserved (skipped during import)
- Import script: `scripts/import-wordpress.py`
