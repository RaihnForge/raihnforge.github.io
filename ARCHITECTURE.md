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
  gamedev/               # Products — active work buckets
    _index.md
    archkey/             # AI-assisted game dev studio (absorbs verg-castleroid + NDLZ)
    forge-framework/     # Organizational management theory
    mecromage/           # Long-arc Metroidvania (absorbs unchosen-paths + all indie-dev-dues)
                         #   _index.md tells the studio postmortem → Archkey redemption arc
    mellon-os/           # Windowed desktop environment
    my-drink/            # PWA drink-order builder
    ttrpg/               # FASERIP superhero character generator
    ezibg/               # Archived — archived: true, URL stays live
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

Posts/sections with `archived: true` stay live at their URL but are filtered out of section listings, featured grids, and product-card counts. Used to preserve history for completed or deprioritized work without cluttering the current surface.

## URL Aliasing

Hugo `aliases` frontmatter is used to preserve old URLs when content moves between sections. On each moved page the historical path (e.g. `/gamedev/verg-castleroid/side-scrolling-study/`) is added to the aliases array; Hugo renders a redirect stub at that old path pointing at the new canonical URL. Section-level redirects work the same way on `_index.md` aliases. The 2026-04-20 Products restructure added 20 such aliases, covering every moved devlog and each deprecated section root.

## Taxonomies

- `tags` — Standard tag taxonomy across all sections
- `medium` — Art-specific: Digital, Pencil, Acrylic, Mixed Media, etc. (legacy; mostly "Digital", superseded by `art_type` for browsing)
- `art_type` — **Gallery type pages** at `/art/type/<id>/` (layout `layouts/art_type/term.html`)

## Art Curation System (2026-09-27)

Every art entry carries four curation fields, and **every art listing on the site is ordered by
`rating`, best first** (ties go to the newer piece). That ordering lives in one partial,
`layouts/partials/art-ranked.html`, so "best to worst" means the same thing everywhere.

| Field | Meaning |
|-------|---------|
| `art_type` | Primary category. Ids are defined in `data/art_taxonomy.json` (never `type:`, which Hugo reserves) |
| `art_subtype` | Secondary category; must belong to its type |
| `rating` | 1–10, higher is better |
| `curated` | `true` once Joshua has confirmed the three fields above; `false` means machine-guessed (seeded 2026-09-27) |
| `related` | Optional site path of a devlog/post that the piece belongs to |

**`data/art_taxonomy.json` is the single source of truth** for types, subtypes, their order and
`show` (how many top works per type the Gallery hub shows). Change it there, then run
`node tools/art-catalog/catalog.js` to flag entries that no longer fit.

**Where the ordering is used:**
- `/art/` shows the top `show` works per type, with "View all" linking to the type page.
- `/art/type/<id>/` shows the full type, grouped by subtype.
- Legacy folder pages (`/art/illustration/` etc.) stay live for old links.
- Art pages list "More <Type>" by rating.
- The homepage Selected Work shows the top 3 featured products, then the top 6 art pieces.

**Tools (`tools/art-catalog/`, Node stdlib, not deployed):**

| Script | Purpose |
|--------|---------|
| `curator.js` | Local **Art Curator**, http://localhost:3145. It has two tabs. **Works**: every entry with inline type, subtype and rating editing, plus a Confirm button; it writes the frontmatter directly. **Missing images**: every placeholder slot with its post, the original URL and a Wayback link; you can drop in a file and it lands at the exact path the post references. |
| `catalog.js` | Inventory + taxonomy validation (exits 1 on invalid entries); `--json` for the full dump |
| `localize-wp.js` | One-time/re-runnable: removes every own-WordPress URL from content, downloading what is still hosted. Map of every rewrite in `wp-url-map.json` |
| `lib.js` | Shared frontmatter read/write (writes top-level scalars only, rest of file untouched) |

**Missing media never 404s.** `partials/img-src.html` returns the given path if the file exists
in `static/`, otherwise `/images/placeholder-missing.svg`. The markdown render hooks
(`_default/_markup/render-image.html` / `render-link.html`) apply the same rule to body images
and unwrap links to lost full-size originals. When the real file is dropped at the slot path,
the placeholder disappears on the next build, and nothing in the content has to be edited.

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
- `wp-imports/uploads/` — media downloaded from raihn.wordpress.com on 2026-09-27 (67 files) so the WordPress site can be deleted
- `legacy/` — **slots** for media from the lapsed joshuakeyes.us domain. Content points here; files are backfilled via the Art Curator
- **Rule: no content may link to raihn.wordpress.com or joshuakeyes.us.** This repo is the long-term home for every asset. `localize-wp.js` enforces it and can be re-run.
- Single CSS file — no preprocessor, no bundler

## CMS

Sveltia CMS at `/admin/` (migrated from Decap 2026-03-01):
- GitHub backend: `RaihnForge/raihnforge.github.io` / `main`
- Collections: art, blog, gamedev, pages (about)
- Config: `static/admin/config.yml`
- Separate admin dashboard at `static/admin/dashboard/`

## Deployment

```
Push to main → GitHub Actions → hugo build → gh-pages branch
```

- `baseURL` is `/` in `hugo.toml`; the CI workflow overrides with `--baseURL "https://${{ github.repository_owner }}.github.io/"`
- Hugo v0.157.0 local, v0.147.0 in CI
- Builds in ~1.3s clean, ~70ms incremental; 1471 pages, 512 static files, 245 aliases

## Migration History

Imported from WordPress.com WXR export (Feb 2026):
- 228 posts converted (169 art, 26 blog, 33 gamedev)
- 146 media files to `static/images/wp-imports/`
- 180 posts flagged as recovered
- 27 pre-existing hand-crafted posts preserved
- Import script: `scripts/import-wordpress.py`
