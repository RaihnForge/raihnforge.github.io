#!/usr/bin/env python3
"""
Generate descriptions for image-only posts that have empty or minimal body text.
Uses title, medium, year, tags, and category context to create brief descriptions.
"""

import os
import re
import sys


# Manually crafted descriptions for the priority thin-content posts
DESCRIPTIONS = {
    # ── Life Drawing (19 files) ──────────────────────────────────
    "art/study/life-drawing-anatomy-study-and-sketches.md": {
        "description": "Figure studies in pencil, exploring anatomy and proportion in quick classroom poses.",
    },
    "art/study/life-drawing-clown.md": {
        "description": "Pencil figure study of a costumed model, capturing gesture and expression in a timed life drawing session.",
    },
    "art/study/life-drawing-faith.md": {
        "description": "Pencil life drawing exploring faith and introspection through figure and posture.",
    },
    "art/study/life-drawing-female-study-and-sketches.md": {
        "description": "A collection of pencil and digital figure studies focusing on the female form, weight, and gesture.",
    },
    "art/study/life-drawing-man.md": {
        "description": "Pencil figure study of a male model, emphasizing form, shadow, and anatomical structure.",
    },
    "art/study/life-drawing-matter-of-fact.md": {
        "description": "Pencil life drawing capturing a grounded, matter-of-fact pose with direct and unflinching observation.",
    },
    "art/study/life-drawing-more-female-study-and-sketches.md": {
        "description": "Continued pencil and digital figure studies of the female form, building on earlier life drawing sessions.",
    },
    "art/study/life-drawing-reflection.md": {
        "description": "Pencil life drawing study exploring a quiet, reflective pose.",
    },
    "art/study/life-drawing-sketches-2.md": {
        "description": "A second set of life drawing sketches in digital medium, exploring gesture and movement.",
    },
    "art/study/life-drawing-sketches.md": {
        "description": "Early life drawing sketches in pencil, capturing gesture, proportion, and the fundamentals of observational drawing.",
    },
    "art/study/life-drawing-study.md": {
        "description": "Digital life drawing study, translating traditional observation skills to the digital medium.",
    },
    "art/study/life-drawing-woman.md": {
        "description": "Pencil figure study of a female model, focusing on posture and the subtlety of line weight.",
    },
    "art/study/life-drawingcivic-burden.md": {
        "description": "Pencil life drawing titled 'Civic Burden' — exploring weight and responsibility through figure and posture.",
    },
    "art/study/life-drawingconcern.md": {
        "description": "Pencil life drawing study conveying concern and emotional tension through body language.",
    },
    "art/study/life-drawinglazy-morning.md": {
        "description": "Pencil life drawing capturing a relaxed, early-morning pose with soft, unhurried lines.",
    },
    "art/study/life-drawingmidnight-window.md": {
        "description": "Pencil life drawing evoking a quiet midnight scene, using shadow and negative space.",
    },
    "art/study/life-drawingmissing-you.md": {
        "description": "Pencil life drawing exploring longing and absence through a contemplative figure pose.",
    },
    "art/study/life-drawingsummer-day.md": {
        "description": "Pencil life drawing with a warm, languid quality — light and ease in every line.",
    },
    "art/study/life-drawingwaiting.md": {
        "description": "Pencil life drawing of a figure in repose, capturing the quiet tension of waiting.",
    },

    # ── WCR/Gaming thin posts ────────────────────────────────────
    "art/esports/wcr-avatars.md": {
        "description": "Custom avatar designs created for the WCReplays.com Warcraft 3 community.",
    },
    "art/esports/wcr-signatures.md": {
        "description": "Forum signature graphics designed for the WCReplays.com community.",
    },
    "art/illustration/what-makes-the-grass-grow.md": {
        "description": "Digital painting inspired by the Marine Corps cadence — a reflection on service and its imagery.",
    },

    # ── Other thin posts ─────────────────────────────────────────
    "art/branding/politically-correct-the-game-website-design.md": {
        "description": "Website design for Politically Correct the Game, a board game by DIP Enterprise INC.",
    },
    "art/study/a-couple-of-sketches-i-did-for-graffiti-on-facebook.md": {
        "description": "Quick digital sketches created for the Graffiti application on Facebook.",
    },
}


def update_description(filepath, new_description):
    """Add or update the description in a markdown file's front matter."""
    with open(filepath, "r") as f:
        content = f.read()

    if not content.startswith("---"):
        print(f"  SKIP (no front matter): {filepath}")
        return False

    end = content.index("---", 3)
    fm_str = content[3:end]
    body = content[end + 3:]

    # Check if description already has content
    desc_match = re.search(r'^description:\s*"?(.+?)"?\s*$', fm_str, re.MULTILINE)
    if desc_match and len(desc_match.group(1).strip()) > 10:
        print(f"  SKIP (has description): {filepath}")
        return False

    # Replace empty description or add one
    if re.search(r'^description:\s*["\']?\s*["\']?\s*$', fm_str, re.MULTILINE):
        fm_str = re.sub(
            r'^description:\s*["\']?\s*["\']?\s*$',
            f'description: "{new_description}"',
            fm_str,
            flags=re.MULTILINE
        )
    elif "description:" not in fm_str:
        # Add after title line
        fm_str = re.sub(
            r'(^title:.*$)',
            f'\\1\ndescription: "{new_description}"',
            fm_str,
            flags=re.MULTILINE
        )
    else:
        # Has a short description — replace it
        fm_str = re.sub(
            r'^description:.*$',
            f'description: "{new_description}"',
            fm_str,
            flags=re.MULTILINE
        )

    with open(filepath, "w") as f:
        f.write(f"---{fm_str}---{body}")

    print(f"  Updated: {filepath}")
    return True


def main():
    content_dir = "content"
    if not os.path.isdir(content_dir):
        print("ERROR: content/ not found. Run from project root.")
        sys.exit(1)

    updated = 0
    for rel_path, data in DESCRIPTIONS.items():
        filepath = os.path.join(content_dir, rel_path)
        if os.path.exists(filepath):
            if update_description(filepath, data["description"]):
                updated += 1
        else:
            print(f"  NOT FOUND: {filepath}")

    print(f"\nUpdated {updated} files with descriptions.")


if __name__ == "__main__":
    main()
