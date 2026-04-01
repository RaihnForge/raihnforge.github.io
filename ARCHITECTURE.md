# Portfolio Website — Architecture

## Component Table

| File / Directory | Role |
|------------------|------|
| `hugo.toml` | Hugo configuration: site params, menu, taxonomies |
| `layouts/` | Custom HTML templates (no external theme) |
| `content/` | Markdown content organized by section |
| `static/css/style.css` | Single monolithic stylesheet |
| `static/images/` | Original images + `recovered/` + `wp-imports/` |
| `static/admin/` | Decap CMS panel + admin dashboard |
| `scripts/` | Import tools (`import-wordpress.py`) |
| `CLAUDE.md` | AI instructions |

## Site Structure

```
hugo.toml
content/
  _index.md              # Homepage
  about.md               # About page
  art/                   # Visual design portfolio
    _index.md
    illustration/        # Subcategory with _index.md + posts
    esports/
    branding/
    study/
    fine-art/
  blog/                  # Journal posts
    _index.md
  gamedev/               # Game dev projects
    _index.md
    mecromage/           # Per-project subcategories
    verg-castleroid/
    indie-dev-dues/
    ezibg/
    ndlz/
    unchosen-paths/
layouts/
  _default/
    baseof.html          # Base template (shell)
    single.html          # Default single page
    list.html            # Default list page
    taxonomy.html        # Tag/medium listing
    terms.html           # All terms listing
  index.html             # Homepage template
  about/single.html      # About page override
  art/list.html          # Art section list
  art/single.html        # Art single post
  blog/list.html         # Blog section list
  gamedev/list.html      # Gamedev section list
  gamedev/single.html    # Gamedev single post
  medium/taxonomy.html   # Medium taxonomy override
static/
  css/style.css          # All styles (light + dark mode via CSS vars)
  images/                # Site images
  admin/                 # Decap CMS + dashboard
```

## Content Types

Three primary sections, each with custom front matter:

| Section | Key Fields | Notes |
|---------|-----------|-------|
| Art | `medium`, `year`, `featured`, `recovered` | Subcategorized by discipline |
| Blog | `tags`, `image`, `recovered` | Flat list |
| Gamedev | `status`, `engine`, `role`, `timeline`, `featured` | Subcategorized by project |

All sections share: `title`, `date`, `description`, `tags`, `image`, `draft`.

Posts with `recovered: true` (180 total) show a muted notice — original images from lapsed joshuakeyes.us domain could not be recovered.

## Taxonomies

- `tags` — Standard tag taxonomy across all sections
- `medium` — Art-specific: Digital, Pencil, Acrylic, Mixed Media, etc.

## Design System

- Light mode primary, dark mode via `[data-theme="dark"]`
- Colors: `--bg: #FAFBFE`, `--accent: #D4722A` (burnt orange)
- Typography: Inter (body) + Source Serif 4 (display) via Google Fonts
- CSS variables in `:root` in `static/css/style.css`
- No JavaScript except Decap CMS admin panel

## Asset Pipeline

No build step for assets. Hugo handles Markdown-to-HTML. Static files are served as-is.

- Images live in `static/images/` and are referenced via `/images/...` in front matter
- `wp-imports/` contains media from WordPress migration (146 files)
- `recovered/` contains manually recovered artwork
- Single CSS file — no preprocessor, no bundler

## CMS

Decap CMS at `/admin/`:
- GitHub backend: `RaihnForge/raihnforge-www` / `main`
- Editorial workflow (draft / review / publish)
- Collections: art, blog, gamedev, pages (about)
- Config: `static/admin/config.yml`
- Separate admin dashboard at `static/admin/dashboard/`

## Deployment

```
Push to main → GitHub Actions → hugo build → gh-pages branch
```

- `baseURL` is `/` in `hugo.toml` — override for production with `hugo --baseURL "https://yourdomain.com/"`
- Hugo v0.157.0 local, v0.147.0 in CI
- Builds in ~400ms, 1463 pages, 165 static files

## Migration History

Imported from WordPress.com WXR export (Feb 2026):
- 228 posts converted (169 art, 26 blog, 33 gamedev)
- 146 media files to `static/images/wp-imports/`
- 180 posts flagged as recovered
- 27 pre-existing hand-crafted posts preserved
- Import script: `scripts/import-wordpress.py`
