#!/usr/bin/env python3
"""
Audit broken external links in content files.
Groups results by domain and new category/product structure.
"""

import os
import re
import sys
from collections import defaultdict


def scan_for_external_refs(content_dir):
    """Find all external URL references in content files."""
    # Patterns to match URLs in markdown content
    url_pattern = re.compile(
        r'(?:href="|src="|!\[[^\]]*\]\(|<)(https?://[^\s"<>\)]+)'
    )

    results = []

    for root, _dirs, files in os.walk(content_dir):
        for f in sorted(files):
            if not f.endswith(".md"):
                continue
            path = os.path.join(root, f)
            rel_path = os.path.relpath(path, content_dir)

            with open(path, "r") as fh:
                content = fh.read()

            # Find all external URLs
            for match in url_pattern.finditer(content):
                url = match.group(1).rstrip(")")
                # Extract domain
                domain_match = re.match(r'https?://([^/]+)', url)
                if domain_match:
                    domain = domain_match.group(1).lower()
                    # Skip known-good domains
                    if domain in (
                        "fonts.googleapis.com", "fonts.gstatic.com",
                        "instagram.com", "youtube.com", "twitter.com",
                        "facebook.com", "github.com",
                    ):
                        continue
                    results.append({
                        "file": rel_path,
                        "url": url,
                        "domain": domain,
                    })

    return results


def extract_alt_text(content, url):
    """Try to extract alt text for an image URL from markdown."""
    pattern = re.compile(r'!\[([^\]]*)\]\(' + re.escape(url) + r'\)')
    match = pattern.search(content)
    return match.group(1) if match else ""


def main():
    content_dir = "content"
    if not os.path.isdir(content_dir):
        print("ERROR: content/ not found. Run from project root.")
        sys.exit(1)

    results = scan_for_external_refs(content_dir)

    # Group by domain
    by_domain = defaultdict(list)
    for r in results:
        by_domain[r["domain"]].append(r)

    # Group by category/product
    by_section = defaultdict(list)
    for r in results:
        parts = r["file"].split("/")
        if len(parts) >= 2:
            section = "/".join(parts[:2])
        else:
            section = parts[0]
        by_section[section].append(r)

    # Write markdown report
    output = "reports/broken-links.md"
    os.makedirs("reports", exist_ok=True)

    with open(output, "w") as f:
        f.write("# Broken External Links Audit\n\n")

        # Summary table
        f.write("## Summary by Domain\n\n")
        f.write("| Domain | References | Files |\n")
        f.write("|--------|-----------|-------|\n")
        for domain in sorted(by_domain, key=lambda d: -len(by_domain[d])):
            refs = by_domain[domain]
            file_count = len(set(r["file"] for r in refs))
            f.write(f"| {domain} | {len(refs)} | {file_count} |\n")
        f.write(f"\n**Total: {len(results)} references across "
                f"{len(set(r['file'] for r in results))} files**\n\n")

        # Detail by section
        f.write("## Detail by Section\n\n")
        for section in sorted(by_section):
            refs = by_section[section]
            f.write(f"### {section}\n\n")
            for r in refs:
                f.write(f"- `{r['file']}`: {r['url']}\n")
            f.write("\n")

    print(f"Broken links report: {output}")
    print(f"  Total references:   {len(results)}")
    print(f"  Unique domains:     {len(by_domain)}")
    print(f"  Files affected:     {len(set(r['file'] for r in results))}")
    print(f"\nTop domains:")
    for domain in sorted(by_domain, key=lambda d: -len(by_domain[d]))[:5]:
        refs = by_domain[domain]
        file_count = len(set(r["file"] for r in refs))
        print(f"  {domain}: {len(refs)} refs in {file_count} files")


if __name__ == "__main__":
    main()
