#!/usr/bin/env python3
"""
Step 2: Recover missing images from the Wayback Machine.

Strategy:
1. Bulk CDX queries by URL prefix to build index of available snapshots
2. Match against remaining broken URLs in content
3. Download matched images
4. Rewrite URLs in content

Usage:
    python3 scripts/recover-wayback.py          # Full run
    python3 scripts/recover-wayback.py --dry-run # Index only, no downloads
    python3 scripts/recover-wayback.py --resume  # Resume downloads from progress
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CONTENT_DIR = PROJECT_ROOT / "content"
RECOVERED_DIR = PROJECT_ROOT / "static" / "images" / "recovered"
PROGRESS_FILE = Path("/tmp/wayback_progress.json")
REPORT_FILE = Path("/tmp/wayback_report.txt")

REQUEST_DELAY = 1.2  # seconds between requests to archive.org
CDX_API = "https://web.archive.org/cdx/search/cdx"

# URL prefixes to query in bulk via CDX wildcard
CDX_PREFIXES = [
    "www.joshuakeyes.us/wordpress/raihn/images/*",
    "www.joshuakeyes.us/raihn/images/*",
    "www.joshuakeyes.us/raihn/art/*",
    "www.joshuakeyes.us/raihn/bin/*",
    "www.joshuakeyes.us/wcreplays/*",
    "www.joshuakeyes.us/images/*",
    "www.joshuakeyes.us/tgtemp/*",
    "joshuakeyes.us/raihn/images/*",
    "www.wcreplays.com/features/raihn/*",
]


def bulk_cdx_query(prefix):
    """Query CDX API with wildcard prefix. Returns dict of {url: timestamp}."""
    params = (
        f"url={urllib.request.quote(prefix, safe='')}"
        f"&output=json&fl=timestamp,original,statuscode"
        f"&filter=statuscode:200&collapse=urlkey"
    )
    api_url = f"{CDX_API}?{params}"

    try:
        req = urllib.request.Request(api_url, headers={
            "User-Agent": "RaihnForge-ImageRecovery/1.0 (portfolio site migration)"
        })
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            results = {}
            for row in data[1:]:  # Skip header
                timestamp, original_url, status = row
                # Normalize URL (remove port numbers, normalize www)
                normalized = original_url.replace(":80/", "/")
                if not normalized.startswith("http"):
                    normalized = "http://" + normalized
                results[normalized] = timestamp
            return results
    except Exception as e:
        print(f"  CDX bulk query error for {prefix}: {type(e).__name__}: {e}")
        return {}


def extract_remaining_urls():
    """Extract all remaining external image URLs from content."""
    url_pattern = re.compile(
        r'http://(www\.)?(joshuakeyes\.us|wcreplays\.com)/[^\s\)\]"]+',
        re.IGNORECASE
    )

    urls = set()
    for md_file in CONTENT_DIR.rglob("*.md"):
        content = md_file.read_text(encoding="utf-8")
        for match in url_pattern.finditer(content):
            url = match.group(0).rstrip(")")
            urls.add(url)

    return urls


def download_from_wayback(url, timestamp, dest_path, retries=2):
    """Download a file from the Wayback Machine using the id_ prefix."""
    wayback_url = f"https://web.archive.org/web/{timestamp}id_/{url}"

    for attempt in range(retries):
        try:
            req = urllib.request.Request(wayback_url, headers={
                "User-Agent": "RaihnForge-ImageRecovery/1.0 (portfolio site migration)"
            })
            with urllib.request.urlopen(req, timeout=60) as resp:
                content = resp.read()

                # Reject HTML error pages
                if content[:5] in (b'<!DOC', b'<html', b'<HTML'):
                    print(f"    Got HTML instead of image")
                    return False

                # Accept known image magic bytes
                if content[:4] in (b'\x89PNG', b'\xff\xd8\xff', b'GIF8', b'BM'):
                    dest_path.write_bytes(content)
                    return True

                # Accept if content-type says image
                ct = resp.headers.get("Content-Type", "")
                if "image" in ct:
                    dest_path.write_bytes(content)
                    return True

                # Accept if > 512 bytes and not text
                if len(content) > 512:
                    dest_path.write_bytes(content)
                    return True

        except Exception as e:
            if attempt < retries - 1:
                print(f"    Retry {attempt + 1}: {type(e).__name__}")
                time.sleep(2)
            else:
                print(f"    Download error: {type(e).__name__}: {e}")

    return False


def detect_extension(filepath):
    """Detect image type from file magic bytes."""
    data = filepath.read_bytes()[:8]
    for magic, ext in [(b'\x89PNG', '.png'), (b'\xff\xd8\xff', '.jpg'),
                       (b'GIF8', '.gif'), (b'BM', '.bmp')]:
        if data[:len(magic)] == magic:
            return ext
    return '.jpg'


def normalize_url(url):
    """Normalize a URL for matching (handle www vs non-www, http vs https)."""
    url = url.replace("https://", "http://")
    # Ensure www. prefix for joshuakeyes.us
    url = re.sub(r'http://joshuakeyes\.us/', 'http://www.joshuakeyes.us/', url)
    return url


def rewrite_urls_in_content(url_to_local):
    """Rewrite recovered URLs in all content files."""
    total_rewrites = 0
    files_modified = 0

    for md_file in sorted(CONTENT_DIR.rglob("*.md")):
        content = md_file.read_text(encoding="utf-8")
        original = content

        for old_url, local_path in url_to_local.items():
            count_before = content.count(old_url)
            if count_before > 0:
                content = content.replace(old_url, local_path)
                total_rewrites += count_before

        if content != original:
            md_file.write_text(content, encoding="utf-8")
            files_modified += 1

    return total_rewrites, files_modified


def load_progress():
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, "r") as f:
            return json.load(f)
    return {"downloaded": [], "failed": [], "index": {}}


def save_progress(progress):
    with open(PROGRESS_FILE, "w") as f:
        json.dump(progress, f, indent=2)


def main():
    parser = argparse.ArgumentParser(description="Recover images from Wayback Machine")
    parser.add_argument("--dry-run", action="store_true", help="Index only, no downloads")
    parser.add_argument("--resume", action="store_true", help="Resume from progress")
    args = parser.parse_args()

    print("=" * 60)
    print("Step 2: Wayback Machine Image Recovery")
    print("=" * 60)

    RECOVERED_DIR.mkdir(parents=True, exist_ok=True)

    # Load progress
    progress = load_progress() if args.resume else {"downloaded": [], "failed": [], "index": {}}

    # --- Phase 1: Build CDX index ---
    print("\n--- Phase 1: Building Wayback Machine index ---")
    wayback_index = {}  # normalized_url -> timestamp

    if args.resume and progress.get("index"):
        wayback_index = progress["index"]
        print(f"  Loaded {len(wayback_index)} cached index entries")
    else:
        for prefix in CDX_PREFIXES:
            print(f"  Querying: {prefix}")
            results = bulk_cdx_query(prefix)
            print(f"    → {len(results)} snapshots found")
            for url, ts in results.items():
                norm = normalize_url(url)
                wayback_index[norm] = ts
            time.sleep(REQUEST_DELAY)

        # Deduplicate (some URLs appear under multiple prefixes)
        print(f"\n  Total unique archived URLs: {len(wayback_index)}")
        progress["index"] = wayback_index
        save_progress(progress)

    # --- Phase 2: Match against content URLs ---
    print("\n--- Phase 2: Matching against content URLs ---")
    remaining_urls = extract_remaining_urls()
    print(f"  Remaining external URLs in content: {len(remaining_urls)}")

    # Build match list
    to_download = {}  # content_url -> (wayback_url, timestamp, filename)
    already_local = {}
    no_match = set()

    for content_url in sorted(remaining_urls):
        # Skip non-recoverable URLs
        if any(content_url.endswith(ext) for ext in ('.html', '.pdf', '.php')):
            continue
        if '?' in content_url and 'section=' in content_url:
            continue
        if '?' in content_url and 'get=' in content_url:
            continue

        # Extract filename
        path = content_url.split("?")[0].rstrip("/")
        filename = path.split("/")[-1]

        # Already recovered locally?
        if (RECOVERED_DIR / filename).exists():
            already_local[content_url] = f"/images/recovered/{filename}"
            continue

        # Check with extensions if extensionless
        needs_ext = "." not in filename
        if needs_ext:
            found = False
            for ext in ['.jpg', '.png', '.gif']:
                if (RECOVERED_DIR / (filename + ext)).exists():
                    already_local[content_url] = f"/images/recovered/{filename}{ext}"
                    found = True
                    break
            if found:
                continue

        # Try matching against Wayback index
        norm = normalize_url(content_url)
        if norm in wayback_index:
            to_download[content_url] = (norm, wayback_index[norm], filename)
            continue

        # Try without _thumb suffix
        thumb_match = re.match(r'(.+?)_thumb(\.\w+)?$', filename)
        if thumb_match:
            base = thumb_match.group(1)
            ext = thumb_match.group(2) or ''
            full_name = base + ext
            full_url = content_url.replace(filename, full_name)
            norm_full = normalize_url(full_url)
            if norm_full in wayback_index:
                to_download[content_url] = (norm_full, wayback_index[norm_full], full_name)
                continue
            # Check if full-size already recovered
            if (RECOVERED_DIR / full_name).exists():
                already_local[content_url] = f"/images/recovered/{full_name}"
                continue

        no_match.add(content_url)

    print(f"  Already local: {len(already_local)}")
    print(f"  Matched in Wayback: {len(to_download)}")
    print(f"  No match found: {len(no_match)}")

    if args.dry_run:
        print("\n  [DRY RUN] Would download:")
        for url, (wb_url, ts, fn) in sorted(to_download.items())[:20]:
            print(f"    {fn} ← {ts}")
        if len(to_download) > 20:
            print(f"    ... and {len(to_download) - 20} more")

        # Still rewrite already-local URLs
        if already_local:
            print(f"\n  Rewriting {len(already_local)} already-local URLs...")
            rewrites, files_mod = rewrite_urls_in_content(already_local)
            print(f"    Rewrites: {rewrites}, Files: {files_mod}")

        save_progress(progress)
        return

    # --- Phase 3: Download ---
    print("\n--- Phase 3: Downloading from Wayback Machine ---")
    url_to_local = dict(already_local)
    downloaded = 0
    failed = 0
    already_downloaded = set(progress.get("downloaded", []))

    for i, (content_url, (wb_url, timestamp, filename)) in enumerate(sorted(to_download.items()), 1):
        # Skip if already downloaded in previous run
        if content_url in already_downloaded:
            if (RECOVERED_DIR / filename).exists():
                url_to_local[content_url] = f"/images/recovered/{filename}"
            continue

        needs_ext = "." not in filename
        dest_name = filename

        # Skip if file already exists
        if (RECOVERED_DIR / filename).exists():
            url_to_local[content_url] = f"/images/recovered/{filename}"
            downloaded += 1
            continue

        print(f"  [{i}/{len(to_download)}] {filename}")

        if needs_ext:
            temp_path = RECOVERED_DIR / (filename + ".tmp")
            if download_from_wayback(wb_url, timestamp, temp_path):
                ext = detect_extension(temp_path)
                final_name = filename + ext
                final_path = RECOVERED_DIR / final_name
                temp_path.rename(final_path)
                url_to_local[content_url] = f"/images/recovered/{final_name}"
                progress["downloaded"].append(content_url)
                downloaded += 1
                print(f"    → Saved: {final_name}")
            else:
                if temp_path.exists():
                    temp_path.unlink()
                progress["failed"].append(content_url)
                failed += 1
        else:
            dest_path = RECOVERED_DIR / filename
            if download_from_wayback(wb_url, timestamp, dest_path):
                url_to_local[content_url] = f"/images/recovered/{filename}"
                progress["downloaded"].append(content_url)
                downloaded += 1
                print(f"    → Saved: {filename}")
            else:
                progress["failed"].append(content_url)
                failed += 1

        time.sleep(REQUEST_DELAY)

        if i % 10 == 0:
            save_progress(progress)

    save_progress(progress)

    # --- Phase 4: Rewrite URLs ---
    print(f"\n--- Phase 4: Rewriting URLs ---")
    if url_to_local:
        rewrites, files_mod = rewrite_urls_in_content(url_to_local)
        print(f"  Rewrites: {rewrites}, Files modified: {files_mod}")

    # --- Report ---
    print("\n" + "=" * 60)
    print("WAYBACK RECOVERY REPORT")
    print("=" * 60)
    print(f"  Wayback index size: {len(wayback_index)}")
    print(f"  URLs matched: {len(to_download)}")
    print(f"  Downloaded: {downloaded}")
    print(f"  Failed: {failed}")
    print(f"  Already local: {len(already_local)}")
    print(f"  No Wayback match: {len(no_match)}")

    # Count remaining refs
    remaining_jk = 0
    remaining_wcr = 0
    for md_file in CONTENT_DIR.rglob("*.md"):
        content = md_file.read_text(encoding="utf-8")
        remaining_jk += len(re.findall(r'joshuakeyes\.us', content))
        remaining_wcr += len(re.findall(r'wcreplays\.com/features/', content))
    print(f"\n  Remaining joshuakeyes.us refs: {remaining_jk}")
    print(f"  Remaining wcreplays.com/features/ refs: {remaining_wcr}")

    # Write report
    with open(REPORT_FILE, "w") as f:
        f.write("Wayback Machine Recovery Report\n")
        f.write("=" * 40 + "\n\n")
        f.write(f"Wayback index: {len(wayback_index)} URLs\n")
        f.write(f"Matched: {len(to_download)}\n")
        f.write(f"Downloaded: {downloaded}\n")
        f.write(f"Failed: {failed}\n")
        f.write(f"Already local: {len(already_local)}\n\n")
        if no_match:
            f.write(f"Unrecoverable ({len(no_match)} URLs):\n")
            for url in sorted(no_match):
                f.write(f"  {url}\n")
    print(f"\nFull report: {REPORT_FILE}")


if __name__ == "__main__":
    main()
