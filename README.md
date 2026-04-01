# RaihnForge Portfolio

Hugo-based portfolio site for Joshua Keyes — visual design, game development, and product thinking. 255+ content files migrated from WordPress, with custom layouts and Decap CMS.

## Quick Start

```sh
hugo server -D    # Dev server with drafts at localhost:1313
hugo              # Build site (~400ms)
```

## Sections

| Section | URL | Content |
|---------|-----|---------|
| Design | `/art/` | Visual design portfolio (illustration, esports, branding, study, fine art) |
| Products | `/gamedev/` | Game dev projects (Mecromage, Verg, EziBG, NDLZ, etc.) |
| Journal | `/blog/` | Blog posts |
| About | `/about/` | Bio page |

## Stack

- Hugo static site generator (no external theme — custom `layouts/`)
- No JavaScript (pure CSS, except Decap CMS admin)
- Single stylesheet: `static/css/style.css`
- Decap CMS at `/admin/` (GitHub backend, editorial workflow)

## Deploy

Push to `main` — GitHub Actions builds and deploys to gh-pages.

## Key Files

| File | Purpose |
|------|---------|
| `hugo.toml` | Site config, menu, taxonomies |
| `layouts/_default/baseof.html` | Base template |
| `static/css/style.css` | All styles (light + dark mode) |
| `static/admin/config.yml` | Decap CMS config |
| `CLAUDE.md` | AI instructions |
