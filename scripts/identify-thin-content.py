#!/usr/bin/env python3
"""
Identify thin content: posts with minimal body text or missing descriptions.
Outputs a CSV report for review.
"""

import csv
import os
import re
import sys


def parse_front_matter(content):
    """Extract front matter dict and body text from markdown."""
    if not content.startswith("---"):
        return {}, content
    end = content.index("---", 3)
    fm_raw = content[3:end].strip()
    body = content[end + 3:].strip()

    # Simple YAML key extraction (no full parser needed)
    fm = {}
    for line in fm_raw.split("\n"):
        if ":" in line and not line.startswith(" ") and not line.startswith("-"):
            key, _, val = line.partition(":")
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            fm[key] = val
    return fm, body


def count_words(text):
    """Count words in body text, stripping markdown/HTML."""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Remove markdown image/link syntax
    text = re.sub(r'!\[[^\]]*\]\([^)]+\)', '', text)
    text = re.sub(r'\[[^\]]*\]\([^)]+\)', '', text)
    # Remove URLs
    text = re.sub(r'https?://\S+', '', text)
    # Remove markdown formatting
    text = re.sub(r'[#*_`~>]', '', text)
    return len(text.split())


def scan_content(content_dir):
    """Scan all content files and return thin content report."""
    results = []
    for root, _dirs, files in os.walk(content_dir):
        for f in sorted(files):
            if not f.endswith(".md") or f == "_index.md":
                continue
            path = os.path.join(root, f)
            rel_path = os.path.relpath(path, content_dir)

            with open(path, "r") as fh:
                content = fh.read()

            fm, body = parse_front_matter(content)
            word_count = count_words(body)
            has_image = bool(fm.get("image", ""))
            desc = fm.get("description", "")
            desc_len = len(desc) if desc else 0

            # Flag as thin if body < 20 words or no description
            if word_count < 20 or desc_len == 0:
                results.append({
                    "file": rel_path,
                    "word_count": word_count,
                    "has_image": "yes" if has_image else "no",
                    "description_length": desc_len,
                    "title": fm.get("title", ""),
                    "medium": fm.get("medium", ""),
                    "year": fm.get("year", ""),
                })
    return results


def main():
    content_dir = "content"
    if not os.path.isdir(content_dir):
        print("ERROR: content/ not found. Run from project root.")
        sys.exit(1)

    results = scan_content(content_dir)

    # Write CSV
    output = "reports/thin-content.csv"
    os.makedirs("reports", exist_ok=True)

    with open(output, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "file", "word_count", "has_image", "description_length",
            "title", "medium", "year"
        ])
        writer.writeheader()
        writer.writerows(results)

    # Summary
    no_desc = [r for r in results if r["description_length"] == 0]
    thin_body = [r for r in results if r["word_count"] < 20]
    image_only = [r for r in results if r["word_count"] < 20 and r["has_image"] == "yes"]

    print(f"Thin content report: {output}")
    print(f"  Total flagged:        {len(results)}")
    print(f"  Body < 20 words:      {len(thin_body)}")
    print(f"  No description:       {len(no_desc)}")
    print(f"  Image-only (< 20w):   {len(image_only)}")

    # Print top priorities
    print(f"\nTop priorities (< 5 words, has image):")
    for r in sorted(results, key=lambda x: x["word_count"]):
        if r["word_count"] < 5 and r["has_image"] == "yes":
            print(f"  {r['file']}: {r['word_count']}w — {r['title']}")


if __name__ == "__main__":
    main()
