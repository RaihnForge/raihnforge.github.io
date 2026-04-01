#!/usr/bin/env python3
"""
Step 1: Copy Google Drive matched images to static/images/recovered/
and rewrite joshuakeyes.us URLs in content to local paths.

Reads /tmp/gdrive_matches.txt (tab-separated: filename\tgdrive_path)
"""

import os
import re
import shutil
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CONTENT_DIR = PROJECT_ROOT / "content"
RECOVERED_DIR = PROJECT_ROOT / "static" / "images" / "recovered"
MATCHES_FILE = Path("/tmp/gdrive_matches.txt")

def load_gdrive_matches():
    """Load filename -> gdrive_path mapping."""
    matches = {}
    with open(MATCHES_FILE, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split("\t", 1)
            if len(parts) == 2:
                filename, gdrive_path = parts
                matches[filename] = gdrive_path
    return matches

def copy_files(matches):
    """Copy matched files to static/images/recovered/."""
    RECOVERED_DIR.mkdir(parents=True, exist_ok=True)
    copied = 0
    skipped = 0
    errors = []

    for filename, gdrive_path in sorted(matches.items()):
        dest = RECOVERED_DIR / filename
        if dest.exists():
            skipped += 1
            continue
        src = Path(gdrive_path)
        if not src.exists():
            errors.append(f"  NOT FOUND: {gdrive_path}")
            continue
        try:
            shutil.copy2(str(src), str(dest))
            copied += 1
        except Exception as e:
            errors.append(f"  COPY ERROR: {filename}: {e}")

    print(f"\nCopy results:")
    print(f"  Copied: {copied}")
    print(f"  Skipped (already exist): {skipped}")
    print(f"  Errors: {len(errors)}")
    for err in errors:
        print(err)

    return copied + skipped  # total available

def build_url_to_local_map(matches):
    """
    Build a mapping from joshuakeyes.us URLs to local /images/recovered/ paths.

    For each filename we have in GDrive, find all joshuakeyes.us URLs in content
    that reference that filename (including _thumb variants).
    """
    available_files = set(matches.keys())

    # Also check what's actually in recovered dir (from previous runs)
    if RECOVERED_DIR.exists():
        for f in RECOVERED_DIR.iterdir():
            if f.is_file():
                available_files.add(f.name)

    return available_files

def rewrite_urls_in_content(available_files):
    """
    Scan all content files and rewrite joshuakeyes.us image URLs
    where we have the file locally.
    """
    # Pattern to match joshuakeyes.us image URLs
    url_pattern = re.compile(
        r'http://(www\.)?joshuakeyes\.us/[^\s\)\]"]*?([^/\s\)\]"]+\.(?:jpg|jpeg|png|gif|bmp))',
        re.IGNORECASE
    )

    total_rewrites = 0
    files_modified = 0
    thumb_rewrites = 0
    unmatched = set()

    for md_file in sorted(CONTENT_DIR.rglob("*.md")):
        content = md_file.read_text(encoding="utf-8")
        original = content

        def replace_url(match):
            nonlocal total_rewrites, thumb_rewrites
            full_url = match.group(0)
            filename = match.group(2)

            # Check if we have this exact file
            if filename in available_files:
                total_rewrites += 1
                return f"/images/recovered/{filename}"

            # Check if this is a _thumb variant and we have the full-size
            thumb_match = re.match(r'(.+?)_thumb(\.\w+)$', filename)
            if thumb_match:
                base = thumb_match.group(1)
                ext = thumb_match.group(2)
                full_name = base + ext
                if full_name in available_files:
                    thumb_rewrites += 1
                    total_rewrites += 1
                    return f"/images/recovered/{full_name}"

            unmatched.add(filename)
            return full_url

        content = url_pattern.sub(replace_url, content)

        if content != original:
            md_file.write_text(content, encoding="utf-8")
            files_modified += 1

    print(f"\nURL rewrite results:")
    print(f"  Total URLs rewritten: {total_rewrites}")
    print(f"  Thumb→full rewrites: {thumb_rewrites}")
    print(f"  Files modified: {files_modified}")
    print(f"  Unmatched filenames: {len(unmatched)}")

    if unmatched:
        print(f"\n  Still missing ({len(unmatched)} unique filenames):")
        for fn in sorted(unmatched)[:30]:
            print(f"    {fn}")
        if len(unmatched) > 30:
            print(f"    ... and {len(unmatched) - 30} more")

    # Write remaining unmatched filenames for Wayback step
    remaining_file = Path("/tmp/remaining_missing_images.txt")
    with open(remaining_file, "w") as f:
        for fn in sorted(unmatched):
            f.write(fn + "\n")
    print(f"\n  Remaining missing filenames written to: {remaining_file}")

    return total_rewrites, unmatched

def main():
    print("=" * 60)
    print("Step 1: Google Drive Image Recovery")
    print("=" * 60)

    # Load matches
    matches = load_gdrive_matches()
    print(f"\nLoaded {len(matches)} Google Drive matches")

    # Copy files
    copy_files(matches)

    # Build available file set
    available_files = build_url_to_local_map(matches)
    print(f"\nTotal available recovered files: {len(available_files)}")

    # Rewrite URLs
    total_rewrites, unmatched = rewrite_urls_in_content(available_files)

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    # Count remaining joshuakeyes.us refs
    remaining_count = 0
    for md_file in CONTENT_DIR.rglob("*.md"):
        content = md_file.read_text(encoding="utf-8")
        remaining_count += len(re.findall(r'joshuakeyes\.us', content))

    print(f"  URLs rewritten: {total_rewrites}")
    print(f"  Remaining joshuakeyes.us refs: {remaining_count}")
    print(f"  Unique missing filenames: {len(unmatched)}")

if __name__ == "__main__":
    main()
