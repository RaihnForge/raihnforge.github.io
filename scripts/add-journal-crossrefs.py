#!/usr/bin/env python3
"""
Add related_sections to blog post front matter for cross-referencing
with Design categories and Products sub-sections.
"""

import os
import re
import sys

# Blog post filename → list of related section slugs
CROSS_REFS = {
    "dota-2-teamliquid-steaming-overlays.md": ["esports"],
    "the-ash-keepers-of-season-22-back2warcraft-x-w3champions-avatars.md": ["esports", "illustration"],
    "ghost-reign-sc-remastered.md": ["illustration"],
    "icons-for-editors.md": ["mecromage"],
    "creative-cog-cool-down-2.md": ["mecromage"],
    "what-would-a-hd-trevor-sprite-look-like.md": ["verg-castleroid"],
    "what-if-starcraft-2s-cyclone-was-the-cyclops.md": ["illustration"],
    "wcr-cartography-art-thief-in-the-night.md": ["illustration", "esports"],
    "teamliquid-artist-directory-petition.md": ["esports"],
    "esports-site-private.md": ["esports"],
    "workshop.md": ["mecromage", "verg-castleroid"],
}


def add_related_sections(filepath, sections):
    """Add related_sections field to front matter."""
    with open(filepath, "r") as f:
        content = f.read()

    if not content.startswith("---"):
        print(f"  SKIP (no front matter): {filepath}")
        return False

    end = content.index("---", 3)
    fm_str = content[3:end]
    body = content[end + 3:]

    # Check if already has related_sections
    if "related_sections:" in fm_str:
        print(f"  SKIP (already has related_sections): {filepath}")
        return False

    # Build the YAML list
    sections_yaml = "\n".join(f'  - "{s}"' for s in sections)
    field = f'\nrelated_sections:\n{sections_yaml}'

    # Insert before draft line, or at end of front matter
    if "\ndraft:" in fm_str:
        fm_str = fm_str.replace("\ndraft:", f"{field}\ndraft:")
    else:
        fm_str += field

    with open(filepath, "w") as f:
        f.write(f"---{fm_str}---{body}")

    print(f"  Updated: {filepath} → {sections}")
    return True


def main():
    blog_dir = os.path.join("content", "blog")
    if not os.path.isdir(blog_dir):
        print("ERROR: content/blog/ not found. Run from project root.")
        sys.exit(1)

    updated = 0
    for filename, sections in CROSS_REFS.items():
        filepath = os.path.join(blog_dir, filename)
        if os.path.exists(filepath):
            if add_related_sections(filepath, sections):
                updated += 1
        else:
            print(f"  NOT FOUND: {filepath}")

    print(f"\nUpdated {updated} blog posts with related_sections.")


if __name__ == "__main__":
    main()
