#!/usr/bin/env python3
"""
Restructure content into nested Hugo sections.

Art (186 files) → 5 categories: illustration, esports, branding, study, fine-art
GameDev (40 files) → 6 products: mecromage, verg-castleroid, ezibg, ndlz, unchosen-paths, indie-dev-dues
+ 4 cross-section moves (gamedev → art)

Creates subdirectories, _index.md files, moves content, and adds aliases for old URLs.
"""

import os
import re
import sys

CONTENT_DIR = "content"

# ────────────────────────────────────────────────────────────────
# Art file assignments: filename (without .md) → category slug
# ────────────────────────────────────────────────────────────────

ART_ASSIGNMENTS = {
    # ── Illustration (~74 files) ─────────────────────────────────
    "ash-keepers-season-22": "illustration",
    "azurebear-and-jadewolf": "illustration",
    "birthday-flight": "illustration",
    "bring-the-light": "illustration",
    "call-to-arms": "illustration",
    "chaos-warrior": "illustration",
    "cheerful-mannerlisk": "illustration",
    "cheerful-reynor": "illustration",
    "cheerfulgrubby-melting-face": "illustration",
    "christmas-card": "illustration",
    "christmas-commission-wow-character": "illustration",
    "commission-gentle-avatar": "illustration",
    "commission-spellbringers-key-art": "illustration",
    "cyber-reaper": "illustration",
    "dangerous-treats": "illustration",
    "destiny-2-creation-submissions": "illustration",
    "destiny-avatar-e4-keyez": "illustration",
    "downwheres-man": "illustration",
    "eg-tl-cheerfulbetter-faster-stronger": "illustration",
    "eisei-the-lady-of-ice": "illustration",
    "ghost-reign": "illustration",
    "gore-board-tile": "illustration",
    "grubby-vs-flash-mlg-dallas-cheerful": "illustration",
    "handel-on-the-news-get-well-mike-cartoon": "illustration",
    "happy-minion": "illustration",
    "ikora-rey-of-light": "illustration",
    "imagination-in-the-illusion-woods": "illustration",
    "jadewolf-titan": "illustration",
    "katelyns-cheerful": "illustration",
    "keyes-salvage-concept": "illustration",
    "kfi-moring-show-cartoon-the-b-team": "illustration",
    "lil-susie-3-reaver": "illustration",
    "manner-please": "illustration",
    "melech-warlock-character-concept": "illustration",
    "monsieur-toad": "illustration",
    "nshadowsongs-dragon": "illustration",
    "oh-its-the-of": "illustration",
    "political-cartoon-washington-post": "illustration",
    "reptiles-and-robots-oh-my": "illustration",
    "revisiting-the-probe": "illustration",
    "rf-fisb-the-whirl-wind": "illustration",
    "roll-4-adventure-night-on-the-town": "illustration",
    "semper-filly": "illustration",
    "spider-man-faith": "illustration",
    "starcraft2-fan-art": "illustration",
    "steph-and-misha-avatar": "illustration",
    "stephanies-dragon-wallpaper": "illustration",
    "talk-radio-comic": "illustration",
    "tap-out-toss": "illustration",
    "toilet-tom": "illustration",
    "wcr-archmage-lounging": "illustration",
    "wcr-art-feature-cleansed-by-fire": "illustration",
    "wcr-art-feature-get-down-with-the-cygnus": "illustration",
    "wcr-art-feature-i-am-not-afraid": "illustration",
    "wcr-art-feature-painseeker": "illustration",
    "wcr-art-feature-prestigious": "illustration",
    "wcr-art-feature-pretty-hate-machine": "illustration",
    "wcr-art-feature-ready-to-track": "illustration",
    "wcr-art-feature-seige": "illustration",
    "wcr-art-feature-sketches-of-war": "illustration",
    "wcr-art-feature-snoel": "illustration",
    "wcr-art-feature-stompin-grounds": "illustration",
    "wcr-art-feature-tremble-before-me": "illustration",
    "wcr-art-feature-weather-the-storm": "illustration",
    "wcr-farewell-cygnus": "illustration",
    "wcr-frost-tauren": "illustration",
    "wcr-ghoul-chow": "illustration",
    "wcr-headhunter-havoc": "illustration",
    "wcr-pirates": "illustration",
    "wcr-thrall-during-puberty": "illustration",
    "what-makes-the-grass-grow": "illustration",
    "x-com-beat-the-night": "illustration",

    # ── Esports & Community (~35 files) ──────────────────────────
    "article-banners-for-wcr": "esports",
    "backgrounds-for-wcr-replay-generator": "esports",
    "basetradetv-reflection": "esports",
    "cheermotes-for-basetrade-tv": "esports",
    "coggy-for-dahnjins-wcreplays-clockwerk-gobbo-rating-widget": "esports",
    "dahnjin-undead-troll": "esports",
    "elite-grubby-guard": "esports",
    "grubby-business-card": "esports",
    "grubby-hows-the-weather": "esports",
    "grubby-shop-coming-soon": "esports",
    "grubby-splash-protoss-video-player": "esports",
    "grubby-vs-flash-mlg-dallas-fall-results": "esports",
    "hearthstone-twitch-emoticons": "esports",
    "hero-icons-for-dahnjins-wcreplays-project": "esports",
    "idra-logo-reflection-2": "esports",
    "idra-vs-jinro-fan-art-work-in-progress": "esports",
    "king-of-the-kill-avatars-for-wcreplayscom": "esports",
    "league-champ-select-overlay": "esports",
    "new-signature-image-for-priestforever": "esports",
    "new-wallpaper-for-tastelessgamingcom": "esports",
    "nostalgic-avatars-for-blizzard-gamers": "esports",
    "overlay-for-x-com-stream": "esports",
    "replays-race-icons-for-wcreplays-com": "esports",
    "sc2pro-stream-front": "esports",
    "tastless-gaming-new-header": "esports",
    "team-liquid-overlayin-game": "esports",
    "the-tasteless-badass-probe": "esports",
    "topreplays-avatars": "esports",
    "twitch-icon-arbiter": "esports",
    "wcr-avatars": "esports",
    "wcr-banners": "esports",
    "wcr-front-page-design": "esports",
    "wcr-race-wars": "esports",
    "wcr-signatures": "esports",
    "wcreplays-com-avatars": "esports",

    # ── Branding & Commercial (~34 files) ────────────────────────
    "blue-cartoon-cards-for-politically-correct-the-game": "branding",
    "bobblehead-for-politically-correct-the-game": "branding",
    "business-card-ordance": "branding",
    "cartoon-panels-for-politically-correct-the-game": "branding",
    "cd-cover-clockwork-ultraviolence": "branding",
    "cd-cover-demos-for-shim": "branding",
    "collectable-supplies-coupon": "branding",
    "dunn-for-now-music": "branding",
    "four-oh-four-screen": "branding",
    "game-board-of-politically-correct-the-game": "branding",
    "game-characters-for-politically-correct-the-game": "branding",
    "game-cover-and-packaging-for-politically-correct-the-game": "branding",
    "game-instructions-booklet-of-politically-correct-the-game": "branding",
    "honey-badger-decal": "branding",
    "honey-badger-decal-wallpaper": "branding",
    "honey-badger-logo": "branding",
    "logo-created-for-clifford-dunn-music": "branding",
    "logo-for-politically-correct-the-game": "branding",
    "memberchat-net-front-page-design-and-other-web-assets": "branding",
    "motorcycle-poster-for-my-now-famous-dad-a-learning-project": "branding",
    "play-money-for-politically-correct-the-game": "branding",
    "politically-correct-the-game-website-design": "branding",
    "product-box-for-bj-clinton-bobble-head": "branding",
    "red-cartoon-cards-for-politically-correct-the-game": "branding",
    "sms-church-graphics": "branding",
    "store-coupon-created-for-collectible-supplies": "branding",
    "surf-the-splash-screen": "branding",
    "team-web-building": "branding",
    "usaf-bulldogs-t-shirt": "branding",
    "web-design-practice-usord": "branding",
    "web-layout-concept-for-clifford-dunn-music": "branding",
    "web-print-advertisements-for-politically-correct-the-game": "branding",
    "wedding-invitations": "branding",
    "wild-goose-casio-print-designs": "branding",

    # ── Study & Sketchbook (~39 files) ───────────────────────────
    "a-couple-of-sketches-i-did-for-graffiti-on-facebook": "study",
    "concept-sketching": "study",
    "daily-sketch-mage": "study",
    "digital-sketch-war-angels": "study",
    "encounter-in-the-deep-speedpainting": "study",
    "getty-ville-exploration-of-the-helmet-of-chalcidian-shape": "study",
    "hd-screen-shot-of-castlevania-3": "study",
    "head-of-an-akkadian-ruler": "study",
    "life-drawing-anatomy-study-and-sketches": "study",
    "life-drawing-clown": "study",
    "life-drawing-faith": "study",
    "life-drawing-female-study-and-sketches": "study",
    "life-drawing-man": "study",
    "life-drawing-matter-of-fact": "study",
    "life-drawing-more-female-study-and-sketches": "study",
    "life-drawing-reflection": "study",
    "life-drawing-sketches-2": "study",
    "life-drawing-sketches": "study",
    "life-drawing-study": "study",
    "life-drawing-woman": "study",
    "life-drawingcivic-burden": "study",
    "life-drawingconcern": "study",
    "life-drawinglazy-morning": "study",
    "life-drawingmidnight-window": "study",
    "life-drawingmissing-you": "study",
    "life-drawingsummer-day": "study",
    "life-drawingwaiting": "study",
    "marine-sketches": "study",
    "sketch-of-the-day-service": "study",
    "sketch-therapy-armor-up": "study",
    "sketchbook-therapy-easter-detective": "study",
    "sketchbook-therapy-errr": "study",
    "sketchbook-therapy-fathers-day-treasure": "study",
    "sketchbook-therapy-mario-reacts": "study",
    "sketchbook-therapy-vader-moon": "study",
    "social-sketches-april": "study",
    "the-warriors-burden-helmet-of-chalcidian-shape": "study",
    "todays-sketches": "study",
    "un-homme-de-coeur-speed-painting": "study",

    # ── Fine Art (~6 files) ──────────────────────────────────────
    "envelope-art": "fine-art",
    "envelope-artstep-up": "fine-art",
    "good-times-at-the-track": "fine-art",
    "painting": "fine-art",
    "prince-charmings-riot-comic-contest-entry": "fine-art",
    "stolen-flower": "fine-art",
}

# ────────────────────────────────────────────────────────────────
# GameDev file assignments: filename (without .md) → product slug
# ────────────────────────────────────────────────────────────────

GAMEDEV_ASSIGNMENTS = {
    # ── Mecromage (~16 files) ────────────────────────────────────
    "mecromage": "mecromage",                          # → _index.md
    "mecromage-about-the-game": "mecromage",
    "mecromage-elgon-concepts": "mecromage",
    "mecromage-foundational-assets": "mecromage",
    "wip-mecromage-animation-demo": "mecromage",
    "codrak-shaman": "mecromage",
    "concept-work-for-stage-9": "mecromage",
    "draft-concept-map-screen": "mecromage",
    "forging-links": "mecromage",
    "master-haloths-trinkets-and-trade": "mecromage",
    "neoblon-titan-ruins": "mecromage",
    "running-with-fusion-can-be-dangerous": "mecromage",
    "sprite-in-progres": "mecromage",
    "art-update-litte-bot-buddy": "mecromage",
    "liamlarge-invasion-assault-mech": "mecromage",
    "yeah-yeah-but-did-you-see-the-elevator": "mecromage",

    # ── UF: VERG — Castleroid (~9 files) ─────────────────────────
    "uf-verg-castleroid": "verg-castleroid",           # → _index.md
    "uf-verg-castleroid-02": "verg-castleroid",
    "a-familiar-castle-wip": "verg-castleroid",
    "wip": "verg-castleroid",                          # titled "UF: VERG-Delvroid"
    "castlevania-3-clock-tower-study": "verg-castleroid",
    "pixel-interpretations-castlevania-3-intro-scene-trevor": "verg-castleroid",
    "study-castlevania-legends": "verg-castleroid",
    "keyes-beholding-sotn-grim-reaper": "verg-castleroid",
    "side-scrolling-study": "verg-castleroid",

    # ── Indie Dev Dues (~8 files) ────────────────────────────────
    "daily-diary": "indie-dev-dues",
    "daily-up-2011-10-26": "indie-dev-dues",
    "one-asset-to-rule-them-allui-resolution-issues": "indie-dev-dues",
    "problem-dynamic-2d-platform": "indie-dev-dues",
    "revamping-work-flows": "indie-dev-dues",
    "tiled-shooter-game-reskin": "indie-dev-dues",
    "team-aegis": "indie-dev-dues",
    "keyes-possibilities": "indie-dev-dues",

    # ── Single-file products ─────────────────────────────────────
    "ezibg": "ezibg",                                  # → _index.md
    "ndlz": "ndlz",                                    # → _index.md
    "unchosen-paths": "unchosen-paths",                 # → _index.md
}

# Files that become _index.md of their product subdirectory
PRODUCT_INDEX_FILES = {
    "mecromage": "mecromage",
    "uf-verg-castleroid": "verg-castleroid",
    "ezibg": "ezibg",
    "ndlz": "ndlz",
    "unchosen-paths": "unchosen-paths",
}

# Cross-section moves: filename → (from_section, to_section/category)
CROSS_SECTION_MOVES = {
    "team-eve-gaming-logo": ("gamedev", "art/branding"),
    "roll20-rogue-token": ("gamedev", "art/illustration"),
    "daily-sketchesnshadowninja-a-tree": ("gamedev", "art/study"),
    "revenge-of-lil-red-riding-hood": ("gamedev", "art/illustration"),
}

# ────────────────────────────────────────────────────────────────
# _index.md content for new category/product directories
# ────────────────────────────────────────────────────────────────

ART_INDEX_PAGES = {
    "illustration": {
        "title": "Illustration",
        "description": "Character art, portraits, fan art, commissions, and standalone digital paintings — from Warcraft fan features to Destiny concept submissions and the Cheerful caricature series.",
        "image": "/images/art/bring-the-light.jpg",
    },
    "esports": {
        "title": "Esports & Community",
        "description": "Avatars, overlays, stream graphics, cheermotes, and web assets created for esports organizations and gaming communities — including WCReplays, Grubby, BaseTrade TV, and Team Liquid.",
    },
    "branding": {
        "title": "Branding & Commercial",
        "description": "Logos, packaging, advertisements, web design, and print materials — from the Politically Correct board game suite to Honey Badger branding and Clifford Dunn Music.",
    },
    "study": {
        "title": "Study & Sketchbook",
        "description": "Life drawing sessions, daily sketches, speed paintings, art history explorations, and the Sketchbook Therapy series — the practice behind the craft.",
    },
    "fine-art": {
        "title": "Fine Art",
        "description": "Acrylic paintings, mixed media works, sequential art, and envelope art — traditional and experimental pieces outside the digital realm.",
    },
}

GAMEDEV_INDEX_PAGES = {
    "indie-dev-dues": {
        "title": "Indie Dev Dues",
        "description": "Game development lessons, process essays, workflow insights, and daily development logs from the indie studio trenches.",
        "status": "In Progress",
        "role": "Developer & Artist",
        "timeline": "2011-2014",
    },
}

# ────────────────────────────────────────────────────────────────
# Front matter helpers
# ────────────────────────────────────────────────────────────────

def parse_front_matter(content):
    """Split a markdown file into (front_matter_str, body_str).
    Returns the raw YAML string and the body after the closing ---.
    """
    if not content.startswith("---"):
        return None, content
    # Find the closing ---
    end = content.index("---", 3)
    fm_str = content[3:end].strip()
    body = content[end + 3:].lstrip("\n")
    return fm_str, body


def add_alias_to_front_matter(fm_str, alias):
    """Add an aliases field to front matter YAML string.
    Uses simple string manipulation to avoid YAML reformatting.
    """
    if "aliases:" in fm_str:
        # Already has aliases — append
        fm_str = re.sub(
            r'(aliases:\s*\n)',
            f'\\1  - "{alias}"\n',
            fm_str
        )
        # Handle inline format: aliases: ["/old/"]
        if re.search(r'aliases:\s*\[', fm_str):
            fm_str = re.sub(
                r'aliases:\s*\[([^\]]*)\]',
                lambda m: f'aliases: [{m.group(1)}, "{alias}"]' if m.group(1).strip() else f'aliases: ["{alias}"]',
                fm_str
            )
    else:
        # Add aliases field before draft line, or at end
        if "\ndraft:" in fm_str:
            fm_str = fm_str.replace("\ndraft:", f'\naliases:\n  - "{alias}"\ndraft:')
        else:
            fm_str += f'\naliases:\n  - "{alias}"'
    return fm_str


def reconstruct_file(fm_str, body):
    """Reconstruct a markdown file from front matter string and body."""
    return f"---\n{fm_str}\n---\n{body}"


def create_index_page(path, metadata):
    """Create an _index.md file with the given metadata."""
    lines = ["---"]
    lines.append(f'title: "{metadata["title"]}"')
    if "description" in metadata:
        lines.append(f'description: "{metadata["description"]}"')
    if "image" in metadata:
        lines.append(f'image: "{metadata["image"]}"')
    if "status" in metadata:
        lines.append(f'status: "{metadata["status"]}"')
    if "role" in metadata:
        lines.append(f'role: "{metadata["role"]}"')
    if "timeline" in metadata:
        lines.append(f'timeline: "{metadata["timeline"]}"')
    lines.append("---")
    lines.append("")

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write("\n".join(lines))
    print(f"  Created: {path}")


def move_content_file(src_path, dst_path, old_url):
    """Move a content file, adding an alias for the old URL."""
    with open(src_path, "r") as f:
        content = f.read()

    fm_str, body = parse_front_matter(content)
    if fm_str is None:
        print(f"  WARNING: No front matter in {src_path}, copying as-is")
        os.makedirs(os.path.dirname(dst_path), exist_ok=True)
        with open(dst_path, "w") as f:
            f.write(content)
        os.remove(src_path)
        return

    fm_str = add_alias_to_front_matter(fm_str, old_url)
    new_content = reconstruct_file(fm_str, body)

    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    with open(dst_path, "w") as f:
        f.write(new_content)
    os.remove(src_path)
    print(f"  Moved: {src_path} → {dst_path}")


def convert_to_index(src_path, dst_dir, old_url=None):
    """Convert a regular page to _index.md of a subdirectory."""
    with open(src_path, "r") as f:
        content = f.read()

    fm_str, body = parse_front_matter(content)
    if fm_str is None:
        print(f"  WARNING: No front matter in {src_path}")
        return

    if old_url:
        fm_str = add_alias_to_front_matter(fm_str, old_url)

    new_content = reconstruct_file(fm_str, body)
    dst_path = os.path.join(dst_dir, "_index.md")

    os.makedirs(dst_dir, exist_ok=True)
    with open(dst_path, "w") as f:
        f.write(new_content)
    os.remove(src_path)
    print(f"  Converted to index: {src_path} → {dst_path}")


# ────────────────────────────────────────────────────────────────
# Main migration
# ────────────────────────────────────────────────────────────────

def main():
    if not os.path.isdir(CONTENT_DIR):
        print(f"ERROR: {CONTENT_DIR}/ not found. Run from project root.")
        sys.exit(1)

    stats = {"moved": 0, "indexed": 0, "cross": 0, "errors": 0}

    # ── Step 1: Create art category directories and _index.md ──
    print("\n=== Creating art category directories ===")
    for slug, meta in ART_INDEX_PAGES.items():
        idx_path = os.path.join(CONTENT_DIR, "art", slug, "_index.md")
        if not os.path.exists(idx_path):
            create_index_page(idx_path, meta)
        else:
            print(f"  Exists: {idx_path}")

    # ── Step 2: Create gamedev product directories and _index.md ──
    print("\n=== Creating gamedev product directories ===")
    for slug, meta in GAMEDEV_INDEX_PAGES.items():
        idx_path = os.path.join(CONTENT_DIR, "gamedev", slug, "_index.md")
        if not os.path.exists(idx_path):
            create_index_page(idx_path, meta)
        else:
            print(f"  Exists: {idx_path}")

    # ── Step 3: Convert product index files (regular → _index.md) ──
    print("\n=== Converting product pages to _index.md ===")
    for filename, product_slug in PRODUCT_INDEX_FILES.items():
        src = os.path.join(CONTENT_DIR, "gamedev", f"{filename}.md")
        dst_dir = os.path.join(CONTENT_DIR, "gamedev", product_slug)
        if os.path.exists(src):
            # URL stays the same (/gamedev/mecromage/ → /gamedev/mecromage/)
            # so no alias needed for the index page itself
            convert_to_index(src, dst_dir)
            stats["indexed"] += 1
        else:
            print(f"  Not found (may already be moved): {src}")

    # ── Step 4: Cross-section moves (gamedev → art) ──
    print("\n=== Cross-section moves ===")
    for filename, (from_section, to_path) in CROSS_SECTION_MOVES.items():
        src = os.path.join(CONTENT_DIR, from_section, f"{filename}.md")
        dst = os.path.join(CONTENT_DIR, to_path, f"{filename}.md")
        if os.path.exists(src):
            old_url = f"/{from_section}/{filename}/"
            move_content_file(src, dst, old_url)
            stats["cross"] += 1
        else:
            print(f"  Not found: {src}")
            stats["errors"] += 1

    # ── Step 5: Move art files into categories ──
    print("\n=== Moving art files into categories ===")
    for filename, category in ART_ASSIGNMENTS.items():
        src = os.path.join(CONTENT_DIR, "art", f"{filename}.md")
        dst = os.path.join(CONTENT_DIR, "art", category, f"{filename}.md")
        if os.path.exists(src):
            old_url = f"/art/{filename}/"
            move_content_file(src, dst, old_url)
            stats["moved"] += 1
        else:
            print(f"  Not found (may be cross-move target): {src}")

    # ── Step 6: Move gamedev files into products ──
    print("\n=== Moving gamedev files into products ===")
    for filename, product in GAMEDEV_ASSIGNMENTS.items():
        # Skip files already converted to _index.md
        if filename in PRODUCT_INDEX_FILES:
            continue
        # Skip files moved cross-section
        if filename in CROSS_SECTION_MOVES:
            continue

        src = os.path.join(CONTENT_DIR, "gamedev", f"{filename}.md")
        dst = os.path.join(CONTENT_DIR, "gamedev", product, f"{filename}.md")
        if os.path.exists(src):
            old_url = f"/gamedev/{filename}/"
            move_content_file(src, dst, old_url)
            stats["moved"] += 1
        else:
            print(f"  Not found: {src}")
            stats["errors"] += 1

    # ── Summary ──
    print(f"\n=== Migration Complete ===")
    print(f"  Files moved:     {stats['moved']}")
    print(f"  Index pages:     {stats['indexed']}")
    print(f"  Cross-moves:     {stats['cross']}")
    print(f"  Errors:          {stats['errors']}")

    # Verify no orphaned files remain
    print("\n=== Checking for orphaned files ===")
    for section in ["art", "gamedev"]:
        section_dir = os.path.join(CONTENT_DIR, section)
        orphans = [f for f in os.listdir(section_dir)
                   if f.endswith(".md") and f != "_index.md"]
        if orphans:
            print(f"  WARNING: Orphaned files in {section}/:")
            for o in orphans:
                print(f"    - {o}")
        else:
            print(f"  {section}/: clean (all files moved)")


if __name__ == "__main__":
    main()
