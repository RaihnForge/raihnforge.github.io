# Portfolio Website — Memory

> Memory initialized by Keeper compliance sweep. No prior session history.

## Project Context

- Hugo static portfolio site (RaihnForge) for Joshua Keyes — 255+ content files across art, blog, and gamedev sections, migrated from WordPress in Feb 2026
- Custom layouts with no external theme, no JavaScript (except Sveltia CMS admin), single CSS stylesheet with light/dark mode
- Positioned for Product Owner career track — content emphasizes product thinking, visual design craft, and 20+ year creative evolution
- **Products section restructured 2026-04-20** into 6 active buckets tied to what Joshua is currently building: Archkey, Forge Framework, Mecromage, mellonOS, My Drink, TTRPG. Deprecated sections (verg-castleroid, indie-dev-dues, ndlz, unchosen-paths) redirect via Hugo aliases. `ezibg` archived.
- **Mecromage is the through-line** creative project. Its `_index.md` now tells the full arc: Unchosen Paths studio (2009–2018) → honest postmortem → Archkey Studio's AI-assisted redemption. All 8 former `indie-dev-dues/` posts live under Mecromage as the legacy devlog archive.
- **Archkey Studio is the new vehicle** — AI-assisted game dev. It is explicitly positioned as the production model that closes the velocity gap that ended Unchosen Paths. U2DTS research + NDLZ prototype live here as forward-looking work.

## Session Breadcrumbs

- **2026-05-19 (session wrap):** Scholar section built out end-to-end. 37 entries across all 9 departments after a multi-round agent-publish sweep. See "Scholar section state" below for the full standing and "Open at next session" for the punch list.
- **2026-05-18:** Gallery 4-up grid + Highlights blue-cyan symmetric treatment shipped. Scholar paper layout finalized with printed-document chrome, author/professor/date/module/editor meta block, and stacked editorial-context blocks above the document. Footer admin padlock icon added. Sveltia auth Worker still placeholder; dashboard PAT path is the working admin surface.
- **2026-05-17:** Scholar nav tab introduced. Course-summary content type and AI-derived disclosure pattern designed and piloted with RELS 101, then scaled to CS 110, ENG 104, MATH 100A. Three-line compact footer + `grade:` frontmatter field landed.
- **2026-05-16:** Deploy cutover completed — `RaihnForge/raihnforge-www` renamed to `RaihnForge/raihnforge.github.io` on GitHub. Local git remote, Sveltia CMS config, and dashboard REPO constant all repointed. Site now serves at the org-root URL. Same day: Alma "norwahl" journal entry + Gallery piece, 3-card portfolio grid, Riot/CWU tile differentiation, X-Com broken links patched, Forge Framework reader.html published into `static/`.
- **2026-04-20:** Products relaunch complete locally.

## Scholar Section State (as of 2026-05-19)

Two content types live in Scholar:
- **Paper** (`type:` omitted): Joshua's own writing. Renders with editorial-context blocks (About this paper / Why it matters to the practice / Connections), white printed-document chrome, full Author/Professor/Date/Module/Editor meta. ALL such pages have passed an authenticity check (see `feedback_authenticity_check_before_publish.md` in auto-memory).
- **Course Reference** (`type: "course-summary"`): AI-compiled scaffolding from CWU's public catalog. Renders with a teal-leaning treatment, top "AI-compiled scaffolding" disclosure banner, Curator/Compiled-by/Sources/Compiled meta (no author/professor — that would impersonate a paper), and a compact footer line that includes an optional `grade:` field. Used only where Joshua's own coursework prose was not findable / not appropriate.

**Standing:**
- IT (8): Hardware (paper), ITAM Internship A & B (papers), Manually Segmenting Data, Windows/Linux Open-Source, Spokeo v. Robins, Stuxnet, James River DB Security, Lark Resorts; CS 110 course ref
- ADMG (17): M02 Manifesto, M03 Process Terms, Project Plan, Capstone Reflection, Sustainability Proposal M5/M7/M8/M9, ADMG 372 Leadership ×2, ADMG 374 ×2, ADMG 474/476/477 papers, ADMG 302 Finance, ADMG 385 SMART, ADMG 371 Mgmt Theories
- HIST (4): Empires, Hammurabi, Las Casas, First Cities
- RMT (3): Buyer's Experience, Loyalty Program, Three Facts (all anonymized per option-(b) pattern)
- MUS (1): Legends of Rock (Dylan + Jackson)
- ENG (1): course ref
- RELS (1): course ref
- MATH (1): course ref
- CS (1): course ref

**Conventions confirmed in production:**
- No em dashes in paper prose body. Frontmatter and titles may have them.
- Anonymization pattern (option-b): real vendors/individuals → role/role labels (e.g. "the vendor," "the sales representative"). Triggered when papers name specific commercial relationships with named individuals. Adds a leading "*A note on naming.*" line.
- Course-summary `grade:` field optional; renders in the footer when present.
- All papers list Joshua as author and Claude (Opus 4.7) as editor.
- Each paper has 3 editorial context fields (`context`, `relevance`, `connections`) shown stacked above the document.
- Inline figure shortcode now supported in scholar paper body (used for the Aryan equestrian sketch in HIST Empires).

## Open at Next Session

Priority order, lightest lift first.

1. **Joshua to eyeball the wave that just landed.** 26 new Scholar entries in commits `c5600dcd`, `b68a0b15`, `9f2c8a49`. Especially worth a fresh-eyes read: the IT 301 Windows/Linux paper (sharp Lessig-modalities argument), the ADMG 474 Nurse Workstation plan (real client context — confirm comfort with named client), the ADMG 372 leadership papers (carry Veterans Center context).
2. **Curator's Takeaway fills.** Every Course Reference page has an italic placeholder paragraph for Joshua's own reflection. Worth a 10-minute pass to drop a few real lines on the four course-ref pages (CS 110, ENG 104, RELS 101, MATH 100A). They render but currently say "to be filled in once he has reviewed."
3. **`_CWU DT` mystery folder.** Drive ID `1ElOxHT_jiesXkyGC9Zi9C0XqqZzE88p6`. Untouched by the sweep. Could contain capstone / digital thesis content. Quick scan next session.
4. **IT 490B Internship B sub-folder.** Drive ID `1rAKXA-m6EiSLZB2qO_RgyvLiOm9LQZyf`. Likely duplicates the already-published 490B paper but worth confirming.
5. **Beyond-Scholar Drive sweep.** Joshua's Drive almost certainly has more Gallery-eligible work (esports, fine art, sketches, client design). The B2W emote sweep earlier this week surfaced multiple unposted assets. Same agent-dispatch pattern would work here.
6. **Sveltia OAuth Worker.** `static/admin/config.yml` still has `YOURSUBDOMAIN.workers.dev` as the auth Worker base_url. The dashboard PAT path works, but `/admin/` (Sveltia proper) won't authenticate until that Worker is deployed.
7. **Phase 2 "On Deck" dashboard (deferred).** The richer tool we discussed for Drive ingestion + publish/ignore controls inside `static/admin/dashboard/`. We did Phase 3 (agent-publish) ahead of Phase 2 (UI) because the backfill velocity mattered. Pick this back up if/when new Drive content needs to be triaged at volume.
8. **Empty-dept landing visibility.** Every department now has at least one entry, so the original "hide empty dept cards" template tweak is no longer urgent. Skip unless visual polish wanted.

## Hand-Off Notes for the Next Session

- Saved feedback memory files in `~/.claude/projects/c--development--projects-portfolio-website/memory/` cover the durable rules: push-after-edits, no-em-dashes, authenticity-check-before-publish. Those will reload automatically.
- Agent-publish pipeline pattern is proven. Each agent gets: an exemplar file path, the Drive folder/file IDs, the frontmatter schema, the em-dash rule, the anonymization pattern, and a 200-word return cap. Parallel dispatch of 5–6 agents per round is the sweet spot.
- The site's git remote is `RaihnForge/raihnforge.github.io` (renamed from `raihnforge-www`). Pushes to `main` deploy via GitHub Actions to gh-pages.
