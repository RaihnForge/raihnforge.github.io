#!/usr/bin/env python3
"""
Step 4: Update recovered: true flags in front matter.

- Posts with NO remaining joshuakeyes.us or wcreplays.com image refs → remove recovered: true
- Posts with remaining refs → keep recovered: true
- Update front matter image: field to point to best recovered image for thumbnails
"""

import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CONTENT_DIR = PROJECT_ROOT / "content"


def parse_front_matter(content):
    """Split content into front matter dict representation and body."""
    if not content.startswith("---"):
        return None, content

    end = content.find("---", 3)
    if end == -1:
        return None, content

    fm_text = content[3:end].strip()
    body = content[end + 3:]
    return fm_text, body


def has_external_image_refs(body):
    """Check if body still has joshuakeyes.us or wcreplays.com image references."""
    patterns = [
        r'joshuakeyes\.us/.*?\.(?:jpg|jpeg|png|gif|bmp)',
        r'joshuakeyes\.us/.*?(?:images|art|bin|tgtemp|wcreplays)/',
        r'wcreplays\.com/features/raihn/',
    ]
    for pattern in patterns:
        if re.search(pattern, body, re.IGNORECASE):
            return True
    return False


def find_best_image(body):
    """Find the first /images/recovered/ path in the body for use as thumbnail."""
    match = re.search(r'/images/recovered/[^\s\)\]"]+\.(?:jpg|jpeg|png|gif)', body, re.IGNORECASE)
    if match:
        return match.group(0)
    # Also check for wp-imports images
    match = re.search(r'/images/wp-imports/[^\s\)\]"]+\.(?:jpg|jpeg|png|gif)', body, re.IGNORECASE)
    if match:
        return match.group(0)
    return None


def main():
    cleared = 0
    kept = 0
    thumbnail_updated = 0
    no_recovered_flag = 0

    for md_file in sorted(CONTENT_DIR.rglob("*.md")):
        content = md_file.read_text(encoding="utf-8")

        # Check if post has recovered: true
        if "recovered: true" not in content and "recovered: false" not in content:
            no_recovered_flag += 1
            continue

        if "recovered: true" not in content:
            continue

        fm_text, body = parse_front_matter(content)
        if fm_text is None:
            continue

        original = content
        modified = False

        if has_external_image_refs(body):
            # Still has broken refs — keep recovered: true
            kept += 1
        else:
            # All images recovered! Remove recovered: true
            content = content.replace("recovered: true", "recovered: false")
            cleared += 1
            modified = True

        # Update thumbnail image if front matter image is still external or empty
        fm_has_external_image = re.search(
            r'^image:\s*["\']?http://(www\.)?(joshuakeyes\.us|wcreplays\.com)',
            content, re.MULTILINE
        )
        fm_has_empty_image = re.search(r'^image:\s*["\']?\s*["\']?\s*$', content, re.MULTILINE)

        if fm_has_external_image or fm_has_empty_image:
            best = find_best_image(body)
            if best:
                if fm_has_external_image:
                    content = re.sub(
                        r'^(image:\s*)["\']?http://[^\s"\']+["\']?',
                        f'\\1"{best}"',
                        content, count=1, flags=re.MULTILINE
                    )
                elif fm_has_empty_image:
                    content = re.sub(
                        r'^(image:\s*)["\']?\s*["\']?\s*$',
                        f'\\1"{best}"',
                        content, count=1, flags=re.MULTILINE
                    )
                thumbnail_updated += 1
                modified = True

        if content != original:
            md_file.write_text(content, encoding="utf-8")

    print("=" * 60)
    print("Step 4: Recovered Flag Update")
    print("=" * 60)
    print(f"  Cleared (all images recovered): {cleared}")
    print(f"  Kept (still has broken refs): {kept}")
    print(f"  Thumbnails updated: {thumbnail_updated}")
    print(f"  Posts without recovered flag: {no_recovered_flag}")


if __name__ == "__main__":
    main()
