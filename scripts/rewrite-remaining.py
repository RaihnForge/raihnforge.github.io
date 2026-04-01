#!/usr/bin/env python3
"""
Final rewrite pass: scan all content for remaining joshuakeyes.us and wcreplays.com
image URLs and rewrite any that now have matching files in static/images/recovered/.
Also handles _thumb variants pointing to full-size files.
"""

import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CONTENT_DIR = PROJECT_ROOT / "content"
RECOVERED_DIR = PROJECT_ROOT / "static" / "images" / "recovered"


def get_available_files():
    """Get set of all filenames in recovered directory."""
    files = set()
    if RECOVERED_DIR.exists():
        for f in RECOVERED_DIR.iterdir():
            if f.is_file():
                files.add(f.name)
                files.add(f.name.lower())
    return files


def main():
    available = get_available_files()
    print(f"Available recovered files: {len(available)}")

    url_pattern = re.compile(
        r'http://(www\.)?(joshuakeyes\.us|wcreplays\.com)/[^\s\)\]"]*?([^/\s\)\]"]+\.(?:jpg|jpeg|png|gif|bmp))',
        re.IGNORECASE
    )

    # Also match extensionless URLs
    url_pattern_noext = re.compile(
        r'http://(www\.)?(joshuakeyes\.us)/[^\s\)\]"]*?/([^/\s\)\]"]+?)(?=[\s\)\]"])',
        re.IGNORECASE
    )

    total_rewrites = 0
    files_modified = 0
    still_broken = set()

    for md_file in sorted(CONTENT_DIR.rglob("*.md")):
        content = md_file.read_text(encoding="utf-8")
        original = content

        def replace_url(match):
            nonlocal total_rewrites
            full_url = match.group(0)
            filename = match.group(3)
            fn_lower = filename.lower()

            # Exact match
            if fn_lower in available:
                # Find the actual filename (preserve case of recovered file)
                actual = filename if filename in available else fn_lower
                total_rewrites += 1
                return f"/images/recovered/{actual}"

            # _thumb variant → full-size
            thumb_match = re.match(r'(.+?)_thumb(_\d+)?(\.\w+)$', filename, re.IGNORECASE)
            if thumb_match:
                base = thumb_match.group(1)
                ext = thumb_match.group(3)
                full_name = base + ext
                fn_lower2 = full_name.lower()
                if full_name in available or fn_lower2 in available:
                    actual = full_name if full_name in available else fn_lower2
                    total_rewrites += 1
                    return f"/images/recovered/{actual}"

            still_broken.add(filename)
            return full_url

        content = url_pattern.sub(replace_url, content)

        # Handle extensionless URLs
        def replace_noext(match):
            nonlocal total_rewrites
            full_url = match.group(0)
            basename = match.group(3)

            # Try common extensions
            for ext in ['.jpg', '.png', '.gif']:
                fn = basename + ext
                if fn in available or fn.lower() in available:
                    actual = fn if fn in available else fn.lower()
                    total_rewrites += 1
                    return f"/images/recovered/{actual}"

            still_broken.add(basename)
            return full_url

        content = url_pattern_noext.sub(replace_noext, content)

        if content != original:
            md_file.write_text(content, encoding="utf-8")
            files_modified += 1

    print(f"\nRewrite results:")
    print(f"  URLs rewritten: {total_rewrites}")
    print(f"  Files modified: {files_modified}")
    print(f"  Still broken unique filenames: {len(still_broken)}")

    # Count remaining refs
    remaining_jk = 0
    remaining_wcr_features = 0
    remaining_wcr_other = 0
    for md_file in CONTENT_DIR.rglob("*.md"):
        content = md_file.read_text(encoding="utf-8")
        remaining_jk += len(re.findall(r'joshuakeyes\.us', content))
        remaining_wcr_features += len(re.findall(r'wcreplays\.com/features/', content))
        remaining_wcr_other += len(re.findall(r'wcreplays\.com/(?!features/)', content))

    print(f"\n  Remaining joshuakeyes.us refs: {remaining_jk}")
    print(f"  Remaining wcreplays.com/features/ refs: {remaining_wcr_features}")
    print(f"  Remaining wcreplays.com other refs: {remaining_wcr_other}")


if __name__ == "__main__":
    main()
