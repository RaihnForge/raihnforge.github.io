#!/usr/bin/env python3
"""Content management CLI for the RaihnForge portfolio.

Provides commands for listing, archiving, deduplicating, validating,
merging, duplicating, and bulk-editing Hugo content files.
Standard library only — no pip dependencies.

Usage:
    python3 scripts/manage.py status
    python3 scripts/manage.py list [--section S] [--recovered] [--archived] [--no-image] [--older-than YEAR]
    python3 scripts/manage.py archive [--section S] [--recovered] [--older-than YEAR] [--file F] [--dry-run] [--yes]
    python3 scripts/manage.py unarchive [--section S] [--file F] [--dry-run] [--yes]
    python3 scripts/manage.py duplicates [--threshold T]
    python3 scripts/manage.py set --field KEY --value VAL [--section S] [--file F] [--dry-run] [--yes]
    python3 scripts/manage.py move SRC DEST [--dry-run] [--yes]
    python3 scripts/manage.py validate [--section S] [--file F] [--fix] [--dry-run]
    python3 scripts/manage.py merge SOURCE DEST [--dry-run] [--yes]
    python3 scripts/manage.py duplicate SOURCE [--dest DIR] [--title T] [--dry-run]
    python3 scripts/manage.py report
"""

import argparse
import os
import re
import shutil
import subprocess
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path

CONTENT_DIR = Path(__file__).resolve().parent.parent / "content"
REPORT_DIR = Path(__file__).resolve().parent.parent / "reports"


# ── Front matter parsing ─────────────────────────────────────────────────

def parse_file(path):
    """Read a markdown file and return (front_matter_str, body_str, raw)."""
    raw = path.read_text(encoding="utf-8")
    if not raw.startswith("---"):
        return None, raw, raw
    try:
        end = raw.index("---", 3)
    except ValueError:
        return None, raw, raw
    fm_str = raw[3:end].strip()
    body = raw[end + 3:].lstrip("\n")
    return fm_str, body, raw


def reconstruct(fm_str, body):
    """Rebuild markdown file from front matter string and body."""
    return f"---\n{fm_str}\n---\n{body}"


def get_field(fm_str, key):
    """Extract a scalar field value from front matter text."""
    if fm_str is None:
        return None
    m = re.search(rf'^{re.escape(key)}:\s*(.+)$', fm_str, re.MULTILINE)
    if not m:
        return None
    val = m.group(1).strip().strip('"').strip("'")
    return val


def get_bool(fm_str, key):
    """Extract a boolean field, returns True/False/None."""
    val = get_field(fm_str, key)
    if val is None:
        return None
    return val.lower() == "true"


def get_list(fm_str, key):
    """Extract a list field (inline [...] or multi-line - items)."""
    if fm_str is None:
        return []
    # Inline: tags: [a, b, c]
    m = re.search(rf'^{re.escape(key)}:\s*\[([^\]]*)\]', fm_str, re.MULTILINE)
    if m:
        items = [i.strip().strip('"').strip("'") for i in m.group(1).split(",") if i.strip()]
        return items
    # Multi-line
    m = re.search(rf'^{re.escape(key)}:\s*\n((?:\s+-\s+.+\n?)*)', fm_str, re.MULTILINE)
    if m:
        return [line.strip().lstrip("- ").strip('"').strip("'")
                for line in m.group(1).strip().split("\n") if line.strip()]
    return []


def set_field(fm_str, key, value):
    """Set a scalar field in front matter text. Adds if missing."""
    # Determine proper YAML formatting for the value
    if isinstance(value, bool):
        yaml_val = "true" if value else "false"
    elif isinstance(value, (int, float)):
        yaml_val = str(value)
    elif value == "true" or value == "false":
        yaml_val = value
    else:
        # Quote strings that need it
        if any(c in str(value) for c in ":#{}[]|>&*!%@`"):
            yaml_val = f'"{value}"'
        else:
            yaml_val = str(value)

    pattern = rf'^{re.escape(key)}:.*$'
    if re.search(pattern, fm_str, re.MULTILINE):
        return re.sub(pattern, f'{key}: {yaml_val}', fm_str, flags=re.MULTILINE)
    else:
        # Add before 'draft:' if present, else append
        if "\ndraft:" in fm_str:
            return fm_str.replace("\ndraft:", f"\n{key}: {yaml_val}\ndraft:")
        return fm_str + f"\n{key}: {yaml_val}"


def remove_field(fm_str, key):
    """Remove a field from front matter text entirely."""
    return re.sub(rf'^{re.escape(key)}:.*\n?', '', fm_str, flags=re.MULTILINE)


def word_count(body):
    """Count words in the body text (strips markdown markup roughly)."""
    text = re.sub(r'!\[.*?\]\(.*?\)', '', body)  # images
    text = re.sub(r'\[([^\]]*)\]\(.*?\)', r'\1', text)  # links
    text = re.sub(r'[#*_>`~\-\|]', '', text)  # markup
    text = re.sub(r'<[^>]+>', '', text)  # HTML tags
    return len(text.split())


# ── Content scanning ─────────────────────────────────────────────────────

def scan_content(section=None):
    """Scan content files and return list of dicts with metadata."""
    items = []
    search_dir = CONTENT_DIR / section if section else CONTENT_DIR

    if not search_dir.exists():
        print(f"Error: directory {search_dir} does not exist", file=sys.stderr)
        sys.exit(1)

    for md in sorted(search_dir.rglob("*.md")):
        if md.name == "_index.md":
            continue
        if md.name.startswith("_"):
            continue

        rel = md.relative_to(CONTENT_DIR)
        fm_str, body, raw = parse_file(md)
        if fm_str is None:
            continue

        title = get_field(fm_str, "title") or md.stem
        date_str = get_field(fm_str, "date") or ""
        year = None
        if date_str:
            try:
                year = int(date_str[:4])
            except (ValueError, IndexError):
                pass
        # year field override
        year_field = get_field(fm_str, "year")
        if year_field:
            try:
                year = int(year_field)
            except ValueError:
                pass

        items.append({
            "path": md,
            "rel": str(rel),
            "section": str(rel.parent),
            "title": title,
            "date": date_str,
            "year": year,
            "image": get_field(fm_str, "image") or "",
            "medium": get_field(fm_str, "medium") or "",
            "recovered": get_bool(fm_str, "recovered") or False,
            "archived": get_bool(fm_str, "archived") or False,
            "featured": get_bool(fm_str, "featured") or False,
            "draft": get_bool(fm_str, "draft") or False,
            "description": get_field(fm_str, "description") or "",
            "tags": get_list(fm_str, "tags"),
            "word_count": word_count(body),
            "fm_str": fm_str,
            "body": body,
        })

    return items


def filter_items(items, args):
    """Apply common filter flags to an items list."""
    if hasattr(args, "section") and args.section:
        items = [i for i in items if i["section"] == args.section
                 or i["section"].startswith(args.section + "/")]
    if hasattr(args, "recovered") and args.recovered:
        items = [i for i in items if i["recovered"]]
    if hasattr(args, "archived") and args.archived:
        items = [i for i in items if i["archived"]]
    if hasattr(args, "no_image") and args.no_image:
        items = [i for i in items if not i["image"]]
    if hasattr(args, "older_than") and args.older_than:
        cutoff = int(args.older_than)
        items = [i for i in items if i["year"] and i["year"] < cutoff]
    if hasattr(args, "file") and args.file:
        target = Path(args.file)
        items = [i for i in items if i["path"] == target or i["path"] == CONTENT_DIR.parent / target]
    return items


# ── Git safety ───────────────────────────────────────────────────────────

def warn_uncommitted():
    """Warn if there are uncommitted changes."""
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True, text=True,
            cwd=CONTENT_DIR.parent
        )
        if result.stdout.strip():
            print("Warning: You have uncommitted git changes.", file=sys.stderr)
    except FileNotFoundError:
        pass  # git not available


def confirm(message, yes=False):
    """Ask for confirmation unless --yes."""
    if yes:
        return True
    try:
        answer = input(f"{message} [y/N] ").strip().lower()
    except EOFError:
        return False
    return answer in ("y", "yes")


# ── Commands ─────────────────────────────────────────────────────────────

def cmd_status(args):
    """Print content overview table."""
    items = scan_content()

    sections = defaultdict(lambda: {"total": 0, "active": 0, "archived": 0,
                                     "recovered": 0, "featured": 0})
    for item in items:
        # Top-level section
        top = item["section"].split("/")[0]
        for key in [top, item["section"]]:
            sections[key]["total"] += 1
            if item["archived"]:
                sections[key]["archived"] += 1
            else:
                sections[key]["active"] += 1
            if item["recovered"]:
                sections[key]["recovered"] += 1
            if item["featured"]:
                sections[key]["featured"] += 1

    # Print summary
    total = len(items)
    active = sum(1 for i in items if not i["archived"])
    archived = sum(1 for i in items if i["archived"])
    recovered = sum(1 for i in items if i["recovered"])
    featured = sum(1 for i in items if i["featured"])

    print(f"\n  Content Overview")
    print(f"  {'='*60}")
    print(f"  Total: {total}   Active: {active}   Archived: {archived}   Recovered: {recovered}   Featured: {featured}")
    print(f"  {'='*60}\n")

    # Section breakdown
    header = f"  {'Section':<30} {'Total':>6} {'Active':>7} {'Arch':>6} {'Recov':>7} {'Feat':>6}"
    print(header)
    print(f"  {'-'*62}")

    # Sort: top-level sections first, then sub-sections
    sorted_keys = sorted(sections.keys(), key=lambda k: (k.count("/"), k))
    printed_tops = set()
    for key in sorted_keys:
        s = sections[key]
        depth = key.count("/")
        if depth == 0:
            if key in printed_tops:
                continue
            printed_tops.add(key)
            label = key
        else:
            label = "  " + key
        print(f"  {label:<30} {s['total']:>6} {s['active']:>7} {s['archived']:>6} {s['recovered']:>7} {s['featured']:>6}")

    print()


def cmd_list(args):
    """List content files with optional filters."""
    items = scan_content(args.section if hasattr(args, "section") and args.section else None)
    items = filter_items(items, args)

    if not items:
        print("No matching content found.")
        return

    print(f"\n  {'Title':<45} {'Section':<25} {'Year':>5} {'Img':>4} {'Rec':>4} {'Arc':>4}")
    print(f"  {'-'*87}")
    for item in items:
        title = item["title"][:43]
        section = item["section"][:23]
        year = str(item["year"] or "")
        img = "Y" if item["image"] else "-"
        rec = "Y" if item["recovered"] else "-"
        arc = "Y" if item["archived"] else "-"
        print(f"  {title:<45} {section:<25} {year:>5} {img:>4} {rec:>4} {arc:>4}")

    print(f"\n  {len(items)} files\n")


def cmd_archive(args):
    """Set archived: true on matching files."""
    items = scan_content()
    items = filter_items(items, args)
    # Only target non-archived items
    items = [i for i in items if not i["archived"]]

    if not items:
        print("No matching content to archive.")
        return

    print(f"\nWill archive {len(items)} files:")
    for item in items:
        print(f"  {item['rel']}")

    if args.dry_run:
        print("\n  (dry run — no changes made)")
        return

    warn_uncommitted()
    if not confirm(f"\nArchive {len(items)} files?", args.yes):
        print("Cancelled.")
        return

    for item in items:
        fm_str, body, raw = parse_file(item["path"])
        fm_str = set_field(fm_str, "archived", True)
        item["path"].write_text(reconstruct(fm_str, body), encoding="utf-8")

    print(f"\nArchived {len(items)} files.")


def cmd_unarchive(args):
    """Set archived: false on matching files."""
    items = scan_content()
    items = filter_items(items, args)
    # Only target archived items
    items = [i for i in items if i["archived"]]

    if not items:
        print("No matching archived content to unarchive.")
        return

    print(f"\nWill unarchive {len(items)} files:")
    for item in items:
        print(f"  {item['rel']}")

    if args.dry_run:
        print("\n  (dry run — no changes made)")
        return

    warn_uncommitted()
    if not confirm(f"\nUnarchive {len(items)} files?", args.yes):
        print("Cancelled.")
        return

    for item in items:
        fm_str, body, raw = parse_file(item["path"])
        fm_str = remove_field(fm_str, "archived")
        item["path"].write_text(reconstruct(fm_str, body), encoding="utf-8")

    print(f"\nUnarchived {len(items)} files.")


def cmd_duplicates(args):
    """Find potential duplicate content."""
    items = scan_content()
    threshold = args.threshold if hasattr(args, "threshold") and args.threshold else 0.6

    print(f"\n  Duplicate Detection (threshold: {threshold})")
    print(f"  {'='*60}\n")

    groups_found = 0

    # 1. Title similarity
    print("  Title Similarity:")
    print(f"  {'-'*40}")
    title_dupes = []
    for i, a in enumerate(items):
        for b in items[i + 1:]:
            score = title_similarity(a["title"], b["title"])
            if score >= threshold:
                title_dupes.append((score, a, b))

    title_dupes.sort(key=lambda x: -x[0])
    if title_dupes:
        groups_found += len(title_dupes)
        for score, a, b in title_dupes:
            print(f"  {score:.0%} match:")
            print(f"    {a['rel']}")
            print(f"      \"{a['title']}\"")
            print(f"    {b['rel']}")
            print(f"      \"{b['title']}\"")
            print()
    else:
        print("  No title duplicates found.\n")

    # 2. Identical image references
    print("  Identical Image References:")
    print(f"  {'-'*40}")
    image_map = defaultdict(list)
    for item in items:
        if item["image"]:
            image_map[item["image"]].append(item)

    image_dupes = {k: v for k, v in image_map.items() if len(v) > 1}
    if image_dupes:
        groups_found += len(image_dupes)
        for img, dupes in image_dupes.items():
            print(f"  Image: {img}")
            for d in dupes:
                print(f"    {d['rel']} — \"{d['title']}\"")
            print()
    else:
        print("  No duplicate image references found.\n")

    # 3. Body content overlap (for substantial posts)
    print("  Body Content Overlap:")
    print(f"  {'-'*40}")
    body_dupes = []
    substantial = [i for i in items if i["word_count"] >= 20]
    for i, a in enumerate(substantial):
        for b in substantial[i + 1:]:
            score = body_similarity(a["body"], b["body"])
            if score >= threshold:
                body_dupes.append((score, a, b))

    body_dupes.sort(key=lambda x: -x[0])
    if body_dupes:
        groups_found += len(body_dupes)
        for score, a, b in body_dupes:
            print(f"  {score:.0%} overlap:")
            print(f"    {a['rel']} ({a['word_count']} words)")
            print(f"    {b['rel']} ({b['word_count']} words)")
            print()
    else:
        print("  No body content overlaps found.\n")

    print(f"  {groups_found} potential duplicate groups found.\n")


def title_similarity(a, b):
    """Word-overlap similarity between two titles."""
    words_a = set(a.lower().split())
    words_b = set(b.lower().split())
    if not words_a or not words_b:
        return 0.0
    intersection = words_a & words_b
    # Remove common stopwords from the score
    stopwords = {"the", "a", "an", "and", "or", "of", "in", "to", "for", "is", "on", "at", "by"}
    meaningful_a = words_a - stopwords
    meaningful_b = words_b - stopwords
    if not meaningful_a or not meaningful_b:
        return 0.0
    meaningful_intersection = meaningful_a & meaningful_b
    return len(meaningful_intersection) / max(len(meaningful_a), len(meaningful_b))


def body_similarity(a, b):
    """Simple line-overlap similarity between two bodies."""
    lines_a = set(line.strip() for line in a.split("\n") if len(line.strip()) > 20)
    lines_b = set(line.strip() for line in b.split("\n") if len(line.strip()) > 20)
    if not lines_a or not lines_b:
        return 0.0
    intersection = lines_a & lines_b
    return len(intersection) / min(len(lines_a), len(lines_b))


def cmd_set(args):
    """Bulk update a front matter field."""
    items = scan_content()
    items = filter_items(items, args)

    if not items:
        print("No matching content found.")
        return

    # Parse the value
    value = args.value
    if value.lower() == "true":
        value = "true"
    elif value.lower() == "false":
        value = "false"

    print(f"\nWill set '{args.field}: {value}' on {len(items)} files:")
    for item in items:
        current = get_field(item["fm_str"], args.field) or "(not set)"
        print(f"  {item['rel']}  [{current} → {value}]")

    if args.dry_run:
        print("\n  (dry run — no changes made)")
        return

    warn_uncommitted()
    if not confirm(f"\nUpdate {len(items)} files?", args.yes):
        print("Cancelled.")
        return

    for item in items:
        fm_str, body, raw = parse_file(item["path"])
        fm_str = set_field(fm_str, args.field, value)
        item["path"].write_text(reconstruct(fm_str, body), encoding="utf-8")

    print(f"\nUpdated {len(items)} files.")


def cmd_move(args):
    """Move a file between sections, adding an alias for the old URL."""
    src = Path(args.src)
    if not src.is_absolute():
        src = CONTENT_DIR.parent / src

    dest_dir = Path(args.dest)
    if not dest_dir.is_absolute():
        dest_dir = CONTENT_DIR.parent / dest_dir

    if not src.exists():
        print(f"Error: source file {src} not found", file=sys.stderr)
        sys.exit(1)

    if not dest_dir.exists():
        print(f"Error: destination directory {dest_dir} not found", file=sys.stderr)
        sys.exit(1)

    dest = dest_dir / src.name

    # Compute old URL for alias
    old_rel = src.relative_to(CONTENT_DIR)
    old_url = "/" + str(old_rel).replace(".md", "/")

    print(f"\nMove: {src.relative_to(CONTENT_DIR.parent)}")
    print(f"  To: {dest.relative_to(CONTENT_DIR.parent)}")
    print(f"  Alias: {old_url}")

    if args.dry_run:
        print("\n  (dry run — no changes made)")
        return

    warn_uncommitted()
    if not confirm("\nProceed with move?", args.yes):
        print("Cancelled.")
        return

    # Add alias to front matter
    fm_str, body, raw = parse_file(src)
    if fm_str is not None:
        fm_str = add_alias(fm_str, old_url)
        src.write_text(reconstruct(fm_str, body), encoding="utf-8")

    # Move the file
    shutil.move(str(src), str(dest))
    print(f"\nMoved {src.name} → {dest.relative_to(CONTENT_DIR.parent)}")


def add_alias(fm_str, alias):
    """Add an alias to front matter, handling both list formats."""
    if "aliases:" in fm_str:
        # Multi-line format
        if re.search(r'aliases:\s*\n', fm_str):
            fm_str = re.sub(
                r'(aliases:\s*\n)',
                f'\\1  - "{alias}"\n',
                fm_str
            )
        # Inline format
        elif re.search(r'aliases:\s*\[', fm_str):
            fm_str = re.sub(
                r'aliases:\s*\[([^\]]*)\]',
                lambda m: f'aliases: [{m.group(1)}, "{alias}"]' if m.group(1).strip() else f'aliases: ["{alias}"]',
                fm_str
            )
    else:
        if "\ndraft:" in fm_str:
            fm_str = fm_str.replace("\ndraft:", f'\naliases:\n  - "{alias}"\ndraft:')
        else:
            fm_str += f'\naliases:\n  - "{alias}"'
    return fm_str


def cmd_report(args):
    """Generate HTML dashboard report."""
    items = scan_content()
    REPORT_DIR.mkdir(exist_ok=True)
    out = REPORT_DIR / "dashboard.html"

    # Summary stats
    total = len(items)
    active = sum(1 for i in items if not i["archived"])
    archived = sum(1 for i in items if i["archived"])
    recovered = sum(1 for i in items if i["recovered"])
    featured = sum(1 for i in items if i["featured"])
    no_image = sum(1 for i in items if not i["image"])
    thin = sum(1 for i in items if i["word_count"] < 20)
    no_desc = sum(1 for i in items if not i["description"])

    # Section breakdown
    section_counts = defaultdict(int)
    for i in items:
        section_counts[i["section"]] += 1

    # Build duplicate data
    title_dupes = []
    for i, a in enumerate(items):
        for b in items[i + 1:]:
            score = title_similarity(a["title"], b["title"])
            if score >= 0.6:
                title_dupes.append((score, a, b))
    title_dupes.sort(key=lambda x: -x[0])

    image_map = defaultdict(list)
    for item in items:
        if item["image"]:
            image_map[item["image"]].append(item)
    image_dupes = {k: v for k, v in image_map.items() if len(v) > 1}

    # Build table rows JSON
    rows_js = []
    for item in items:
        rows_js.append(
            f'{{title:{js_str(item["title"])},'
            f'section:{js_str(item["section"])},'
            f'date:{js_str(item["date"][:10] if item["date"] else "")},'
            f'year:{item["year"] or 0},'
            f'medium:{js_str(item["medium"])},'
            f'image:{js_str("Y" if item["image"] else "")},'
            f'recovered:{js_str("Y" if item["recovered"] else "")},'
            f'archived:{js_str("Y" if item["archived"] else "")},'
            f'featured:{js_str("Y" if item["featured"] else "")},'
            f'words:{item["word_count"]},'
            f'rel:{js_str(item["rel"])}}}'
        )

    # Build duplicate rows
    dupe_rows = []
    for score, a, b in title_dupes:
        dupe_rows.append(f'<tr><td>{score:.0%}</td><td>Title</td><td>{esc(a["title"])}<br><small>{esc(a["rel"])}</small></td><td>{esc(b["title"])}<br><small>{esc(b["rel"])}</small></td></tr>')
    for img, dupes in image_dupes.items():
        names = "<br>".join(f'{esc(d["title"])} <small>({esc(d["rel"])})</small>' for d in dupes)
        dupe_rows.append(f'<tr><td>100%</td><td>Image</td><td colspan="2">{esc(img)}<br>{names}</td></tr>')

    # Sections for filter dropdown
    sections_list = sorted(section_counts.keys())

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RaihnForge Content Dashboard</title>
<style>
*,*::before,*::after{{box-sizing:border-box}}
body{{font-family:Inter,system-ui,sans-serif;background:#FAFBFE;color:#1a1a2e;margin:0;padding:2rem}}
h1{{font-family:'Source Serif 4',Georgia,serif;color:#1a1a2e;margin:0 0 .5rem}}
h2{{font-family:'Source Serif 4',Georgia,serif;margin:2rem 0 1rem;padding-bottom:.5rem;border-bottom:2px solid #e8e9f0}}
.subtitle{{color:#6b7280;margin:0 0 2rem}}
.cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:1rem;margin-bottom:2rem}}
.card{{background:#fff;border:1px solid #e8e9f0;border-radius:8px;padding:1.25rem;text-align:center}}
.card .num{{font-size:2rem;font-weight:700;color:#D4722A}}
.card .label{{font-size:.85rem;color:#6b7280;margin-top:.25rem}}
.filters{{display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1rem;align-items:center}}
.filters select,.filters input{{padding:.4rem .6rem;border:1px solid #d1d5db;border-radius:6px;font-size:.85rem}}
table{{width:100%;border-collapse:collapse;font-size:.85rem}}
th{{text-align:left;padding:.5rem .75rem;background:#f3f4f6;border-bottom:2px solid #d1d5db;cursor:pointer;user-select:none;white-space:nowrap}}
th:hover{{background:#e5e7eb}}
td{{padding:.4rem .75rem;border-bottom:1px solid #e8e9f0}}
tr:hover td{{background:#f9fafb}}
.y{{color:#D4722A;font-weight:600}}
.health-list{{columns:2;column-gap:2rem}}
.health-item{{break-inside:avoid;margin-bottom:.5rem;font-size:.85rem}}
.badge{{display:inline-block;padding:.15rem .5rem;border-radius:4px;font-size:.75rem;font-weight:600}}
.badge-warn{{background:#fef3c7;color:#92400e}}
.badge-info{{background:#dbeafe;color:#1e40af}}
.cmd{{background:#1a1a2e;color:#e5e7eb;padding:1rem;border-radius:8px;font-family:monospace;font-size:.8rem;overflow-x:auto;margin:.5rem 0}}
.gen{{color:#9ca3af;font-size:.75rem;margin-top:3rem;text-align:center}}
</style>
</head>
<body>
<h1>Content Dashboard</h1>
<p class="subtitle">Generated {datetime.now().strftime("%Y-%m-%d %H:%M")} &mdash; {total} content files</p>

<div class="cards">
<div class="card"><div class="num">{total}</div><div class="label">Total</div></div>
<div class="card"><div class="num">{active}</div><div class="label">Active</div></div>
<div class="card"><div class="num">{archived}</div><div class="label">Archived</div></div>
<div class="card"><div class="num">{recovered}</div><div class="label">Recovered</div></div>
<div class="card"><div class="num">{featured}</div><div class="label">Featured</div></div>
<div class="card"><div class="num">{no_image}</div><div class="label">No Image</div></div>
<div class="card"><div class="num">{thin}</div><div class="label">Thin (&lt;20w)</div></div>
<div class="card"><div class="num">{no_desc}</div><div class="label">No Description</div></div>
</div>

<h2>Content Files</h2>
<div class="filters">
<label>Section:
<select id="fSection"><option value="">All</option>
{"".join(f'<option value="{s}">{s}</option>' for s in sections_list)}
</select></label>
<label>Recovered: <select id="fRecovered"><option value="">All</option><option value="Y">Yes</option><option value="">No</option></select></label>
<label>Archived: <select id="fArchived"><option value="">All</option><option value="Y">Yes</option><option value="">No</option></select></label>
<label>Search: <input type="text" id="fSearch" placeholder="Title..." /></label>
<span id="rowCount"></span>
</div>
<table id="contentTable">
<thead><tr>
<th data-col="title">Title</th>
<th data-col="section">Section</th>
<th data-col="date">Date</th>
<th data-col="year">Year</th>
<th data-col="medium">Medium</th>
<th data-col="image">Img</th>
<th data-col="recovered">Rec</th>
<th data-col="archived">Arc</th>
<th data-col="featured">Feat</th>
<th data-col="words">Words</th>
</tr></thead>
<tbody id="tbody"></tbody>
</table>

<h2>Duplicate Report</h2>
{"<p>No potential duplicates found.</p>" if not dupe_rows else ""}
{"<table><thead><tr><th>Score</th><th>Type</th><th>Item A</th><th>Item B</th></tr></thead><tbody>" + "".join(dupe_rows) + "</tbody></table>" if dupe_rows else ""}

<h2>Health Report</h2>
<div class="health-list">
{"".join(f'<div class="health-item"><span class="badge badge-warn">thin</span> {esc(i["rel"])} ({i["word_count"]}w)</div>' for i in items if i["word_count"] < 20)}
{"".join(f'<div class="health-item"><span class="badge badge-info">no desc</span> {esc(i["rel"])}</div>' for i in items if not i["description"])}
</div>

<p class="gen">RaihnForge Content Dashboard &mdash; generated by manage.py</p>

<script>
const DATA=[{",".join(rows_js)}];
let sortCol="date",sortAsc=false;

function render(){{
  const fs=document.getElementById("fSection").value;
  const fr=document.getElementById("fRecovered").value;
  const fa=document.getElementById("fArchived").value;
  const fq=document.getElementById("fSearch").value.toLowerCase();
  let rows=DATA.filter(r=>{{
    if(fs&&r.section!==fs&&!r.section.startsWith(fs+"/"))return false;
    if(fr==="Y"&&r.recovered!=="Y")return false;
    if(fa==="Y"&&r.archived!=="Y")return false;
    if(fq&&!r.title.toLowerCase().includes(fq))return false;
    return true;
  }});
  rows.sort((a,b)=>{{
    let va=a[sortCol],vb=b[sortCol];
    if(typeof va==="number")return sortAsc?va-vb:vb-va;
    va=(va||"").toString();vb=(vb||"").toString();
    return sortAsc?va.localeCompare(vb):vb.localeCompare(va);
  }});
  const tbody=document.getElementById("tbody");
  tbody.innerHTML=rows.map(r=>`<tr>
    <td>${{r.title}}</td><td>${{r.section}}</td><td>${{r.date}}</td>
    <td>${{r.year||""}}</td><td>${{r.medium}}</td>
    <td class="${{r.image?"y":""}}">${{r.image}}</td>
    <td class="${{r.recovered?"y":""}}">${{r.recovered}}</td>
    <td class="${{r.archived?"y":""}}">${{r.archived}}</td>
    <td class="${{r.featured?"y":""}}">${{r.featured}}</td>
    <td>${{r.words}}</td></tr>`).join("");
  document.getElementById("rowCount").textContent=rows.length+" of "+DATA.length;
}}

document.querySelectorAll("th[data-col]").forEach(th=>{{
  th.addEventListener("click",()=>{{
    const col=th.dataset.col;
    if(sortCol===col)sortAsc=!sortAsc;
    else{{sortCol=col;sortAsc=true;}}
    render();
  }});
}});
document.querySelectorAll(".filters select,.filters input").forEach(el=>{{
  el.addEventListener("input",render);
}});
render();
</script>
</body>
</html>"""

    out.write_text(html, encoding="utf-8")
    print(f"\nDashboard generated: {out}")
    print(f"Open with: open {out}")


def js_str(s):
    """Escape a string for inline JavaScript."""
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n") + '"'


def esc(s):
    """Escape HTML entities."""
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


# ── Validate command ──────────────────────────────────────────────────────

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


def cmd_validate(args):
    """Validate content files against schema rules."""
    items = scan_content()
    items = filter_items(items, args)

    issues = []  # list of (path_rel, code, level, message)
    fixable = []  # list of (path, fix_type, detail)

    for item in items:
        rel = item["rel"]
        path = item["path"]
        fm_str = item["fm_str"]
        body = item["body"]
        section_top = item["section"].split("/")[0]

        # E001: Missing or empty title
        title = get_field(fm_str, "title")
        if not title or not title.strip():
            issues.append((rel, "E001", "Error", "Missing or empty title"))

        # E002: Missing or unparseable date
        date_str = get_field(fm_str, "date")
        if not date_str:
            issues.append((rel, "E002", "Error", "Missing date"))
        else:
            try:
                # Accept YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS...
                datetime.strptime(date_str[:10], "%Y-%m-%d")
            except ValueError:
                issues.append((rel, "E002", "Error", f"Unparseable date: {date_str}"))

        # W001: Missing description
        desc = item["description"]
        if not desc:
            issues.append((rel, "W001", "Warn", "Missing description"))

        # W002: Description appears truncated
        if desc and desc.rstrip().endswith("..."):
            issues.append((rel, "W002", "Warn", "Description appears truncated (ends with \"...\")"))
            fixable.append((path, "trim_ellipsis", desc))

        # W003: Missing image on art content
        if section_top == "art" and not item["image"]:
            issues.append((rel, "W003", "Warn", "Missing image on art content"))

        # W004: Image path doesn't exist in static/
        if item["image"] and not item["image"].startswith("http"):
            # Image paths are like /images/foo.jpg → static/images/foo.jpg
            img_path = STATIC_DIR / item["image"].lstrip("/")
            if not img_path.exists():
                issues.append((rel, "W004", "Warn", f"Image file not found: {item['image']}"))

        # W005: Body content < 20 words
        if item["word_count"] < 20:
            issues.append((rel, "W005", "Warn", f"Body content is thin ({item['word_count']} words)"))

        # W006: Missing medium on art content
        if section_top == "art" and not item["medium"]:
            issues.append((rel, "W006", "Warn", "Missing medium on art content"))

        # W007: Missing year on art content
        if section_top == "art":
            year_field = get_field(fm_str, "year")
            if not year_field:
                issues.append((rel, "W007", "Warn", "Missing year on art content"))

        # W008: Missing tags field
        tags_raw = get_field(fm_str, "tags")
        has_tags_field = "tags:" in fm_str if fm_str else False
        if not has_tags_field:
            issues.append((rel, "W008", "Warn", "Missing tags field"))
            fixable.append((path, "add_tags", None))

        # W009: Image references external URL
        if item["image"] and item["image"].startswith("http"):
            issues.append((rel, "W009", "Warn", f"Image references external URL: {item['image']}"))

        # I001: recovered: true but has working local image
        if item["recovered"] and item["image"] and not item["image"].startswith("http"):
            img_path = STATIC_DIR / item["image"].lstrip("/")
            if img_path.exists():
                issues.append((rel, "I001", "Info", "recovered: true but has working local image"))
                fixable.append((path, "clear_recovered", None))

        # Check for recovered: false (fixable — remove it)
        recovered_val = get_field(fm_str, "recovered")
        if recovered_val is not None and recovered_val.lower() == "false":
            fixable.append((path, "remove_recovered_false", None))

    # Count by level
    errors = sum(1 for _, _, lvl, _ in issues if lvl == "Error")
    warns = sum(1 for _, _, lvl, _ in issues if lvl == "Warn")
    infos = sum(1 for _, _, lvl, _ in issues if lvl == "Info")
    active_items = [i for i in items if not i["archived"]]
    # "Publishable" = active items with no errors and no warnings
    items_with_issues = set()
    for rel, code, lvl, msg in issues:
        if lvl in ("Error", "Warn"):
            items_with_issues.add(rel)
    publishable = sum(1 for i in active_items if i["rel"] not in items_with_issues)

    # Print summary
    print(f"\n  Content Validation")
    print(f"  {'='*60}")
    print(f"  Scanned: {len(items)}   Errors: {errors}   Warnings: {warns}   Publishable: {publishable}/{len(active_items)} active")
    print(f"  {'='*60}\n")

    # Print issues grouped by file
    if issues:
        current_file = None
        for rel, code, lvl, msg in issues:
            if rel != current_file:
                current_file = rel
                print(f"  {rel}")
            prefix = {"Error": "ERR ", "Warn": "WARN", "Info": "INFO"}[lvl]
            print(f"    [{code}] {msg}")
        print()

    if not issues:
        print("  No issues found.\n")

    # Handle --fix
    if args.fix and fixable:
        unique_fixes = {}
        for path, fix_type, detail in fixable:
            key = (str(path), fix_type)
            if key not in unique_fixes:
                unique_fixes[key] = (path, fix_type, detail)

        print(f"  Auto-fixable issues: {len(unique_fixes)}")
        for (_, fix_type), (path, _, detail) in unique_fixes.items():
            rel = path.relative_to(CONTENT_DIR)
            if fix_type == "add_tags":
                print(f"    {rel}: add tags: []")
            elif fix_type == "trim_ellipsis":
                print(f"    {rel}: trim trailing \"...\" from description")
            elif fix_type == "remove_recovered_false":
                print(f"    {rel}: remove recovered: false")
            elif fix_type == "clear_recovered":
                print(f"    {rel}: clear recovered (local image exists)")

        if args.dry_run:
            print("\n  (dry run — no changes made)\n")
            return

        if not confirm(f"\nApply {len(unique_fixes)} fixes?"):
            print("Cancelled.")
            return

        applied = 0
        for (_, fix_type), (path, _, detail) in unique_fixes.items():
            fm_str, body, raw = parse_file(path)
            if fm_str is None:
                continue

            if fix_type == "add_tags":
                # Add tags: [] before draft: if present
                if "tags:" not in fm_str:
                    if "\ndraft:" in fm_str:
                        fm_str = fm_str.replace("\ndraft:", "\ntags: []\ndraft:")
                    else:
                        fm_str += "\ntags: []"
                    applied += 1

            elif fix_type == "trim_ellipsis":
                desc = get_field(fm_str, "description")
                if desc and desc.rstrip().endswith("..."):
                    new_desc = desc.rstrip().rstrip(".")
                    fm_str = set_field(fm_str, "description", new_desc)
                    applied += 1

            elif fix_type == "remove_recovered_false":
                fm_str = remove_field(fm_str, "recovered")
                applied += 1

            elif fix_type == "clear_recovered":
                fm_str = remove_field(fm_str, "recovered")
                applied += 1

            path.write_text(reconstruct(fm_str, body), encoding="utf-8")

        print(f"\n  Applied {applied} fixes.\n")

    elif args.fix and not fixable:
        print("  No auto-fixable issues found.\n")


# ── Merge command ─────────────────────────────────────────────────────────

def cmd_merge(args):
    """Merge SOURCE content into DEST, archiving SOURCE."""
    src = Path(args.source)
    if not src.is_absolute():
        src = CONTENT_DIR.parent / src

    dest = Path(args.dest)
    if not dest.is_absolute():
        dest = CONTENT_DIR.parent / dest

    if not src.exists():
        print(f"Error: source file {src} not found", file=sys.stderr)
        sys.exit(1)

    if not dest.exists():
        print(f"Error: destination file {dest} not found", file=sys.stderr)
        sys.exit(1)

    src_fm, src_body, _ = parse_file(src)
    dest_fm, dest_body, _ = parse_file(dest)

    if src_fm is None or dest_fm is None:
        print("Error: could not parse front matter from source or destination", file=sys.stderr)
        sys.exit(1)

    src_title = get_field(src_fm, "title") or src.stem
    dest_title = get_field(dest_fm, "title") or dest.stem

    # Merge tags (union)
    src_tags = get_list(src_fm, "tags")
    dest_tags = get_list(dest_fm, "tags")
    merged_tags = list(dict.fromkeys(dest_tags + src_tags))  # preserve order, dedupe

    # Image: keep dest, fall back to source
    dest_image = get_field(dest_fm, "image")
    src_image = get_field(src_fm, "image")
    final_image = dest_image or src_image or ""

    # Date: keep earlier
    src_date = get_field(src_fm, "date") or ""
    dest_date = get_field(dest_fm, "date") or ""
    if src_date and dest_date:
        final_date = min(src_date[:10], dest_date[:10])
    else:
        final_date = dest_date or src_date

    # Source URL for alias
    src_rel = src.relative_to(CONTENT_DIR)
    src_url = "/" + str(src_rel).replace(".md", "/")

    # Merged body
    merged_body = dest_body.rstrip("\n") + f"\n\n---\n\n*Merged from: {src_title}*\n\n" + src_body

    print(f"\n  Merge Preview")
    print(f"  {'='*60}")
    print(f"  Source:  {src.relative_to(CONTENT_DIR.parent)} — \"{src_title}\"")
    print(f"  Dest:    {dest.relative_to(CONTENT_DIR.parent)} — \"{dest_title}\"")
    print(f"  {'─'*60}")
    print(f"  Date:    {final_date} (earlier of {src_date[:10]}, {dest_date[:10]})")
    print(f"  Image:   {final_image or '(none)'}")
    print(f"  Tags:    {', '.join(merged_tags) if merged_tags else '(none)'}")
    print(f"  Alias:   {src_url}")
    print(f"  Source body appended ({word_count(src_body)} words)")
    print(f"  Source will be archived after merge")

    if args.dry_run:
        print(f"\n  (dry run — no changes made)\n")
        return

    warn_uncommitted()
    if not confirm(f"\nMerge \"{src_title}\" into \"{dest_title}\"?", args.yes):
        print("Cancelled.")
        return

    # Apply to dest
    if final_date:
        dest_fm = set_field(dest_fm, "date", final_date)
    if final_image:
        dest_fm = set_field(dest_fm, "image", final_image)

    # Update tags
    if merged_tags:
        # Remove existing tags field and add merged
        dest_fm = remove_field(dest_fm, "tags")
        tags_yaml = "[" + ", ".join(f'"{t}"' for t in merged_tags) + "]"
        if "\ndescription:" in dest_fm:
            dest_fm = dest_fm.replace("\ndescription:", f"\n__TAGS_PLACEHOLDER__\ndescription:")
            dest_fm = dest_fm.replace("__TAGS_PLACEHOLDER__", f"tags: {tags_yaml}")
        elif "\ndraft:" in dest_fm:
            dest_fm = dest_fm.replace("\ndraft:", f"\ntags: {tags_yaml}\ndraft:")
        else:
            dest_fm += f"\ntags: {tags_yaml}"

    # Add alias
    dest_fm = add_alias(dest_fm, src_url)

    # Write dest
    dest.write_text(reconstruct(dest_fm, merged_body), encoding="utf-8")

    # Archive source
    src_fm = set_field(src_fm, "archived", True)
    src.write_text(reconstruct(src_fm, src_body), encoding="utf-8")

    print(f"\n  Merged \"{src_title}\" into \"{dest_title}\".")
    print(f"  Source archived: {src.relative_to(CONTENT_DIR.parent)}\n")


# ── Duplicate command ─────────────────────────────────────────────────────

def cmd_duplicate(args):
    """Duplicate a content file with fresh metadata."""
    src = Path(args.source)
    if not src.is_absolute():
        src = CONTENT_DIR.parent / src

    if not src.exists():
        print(f"Error: source file {src} not found", file=sys.stderr)
        sys.exit(1)

    src_fm, src_body, _ = parse_file(src)
    if src_fm is None:
        print("Error: could not parse front matter", file=sys.stderr)
        sys.exit(1)

    src_title = get_field(src_fm, "title") or src.stem

    # Determine destination
    new_title = args.title if args.title else f"{src_title} (copy)"
    slug = re.sub(r'[^a-z0-9]+', '-', new_title.lower()).strip('-')

    if args.dest:
        dest_dir = Path(args.dest)
        if not dest_dir.is_absolute():
            dest_dir = CONTENT_DIR.parent / dest_dir
    else:
        dest_dir = src.parent

    dest = dest_dir / f"{slug}.md"

    # Build new front matter
    new_fm = src_fm
    new_fm = set_field(new_fm, "title", new_title)
    new_fm = set_field(new_fm, "date", datetime.now().strftime("%Y-%m-%d"))
    new_fm = set_field(new_fm, "draft", True)

    # Clear featured
    if get_bool(new_fm, "featured") is not None:
        new_fm = set_field(new_fm, "featured", False)

    # Remove aliases (they belong to the original)
    if "aliases:" in new_fm:
        # Remove multi-line aliases block
        new_fm = re.sub(r'\naliases:\s*\n(?:\s+-\s+.+\n?)*', '\n', new_fm)
        # Remove inline aliases
        new_fm = re.sub(r'\naliases:\s*\[[^\]]*\]\n?', '\n', new_fm)

    print(f"\n  Duplicate Preview")
    print(f"  {'='*60}")
    print(f"  Source:    {src.relative_to(CONTENT_DIR.parent)} — \"{src_title}\"")
    print(f"  New file:  {dest.relative_to(CONTENT_DIR.parent)}")
    print(f"  Title:     \"{new_title}\"")
    print(f"  Date:      {datetime.now().strftime('%Y-%m-%d')}")
    print(f"  Draft:     true")
    print(f"  Featured:  false")
    print(f"  Aliases:   cleared")

    if args.dry_run:
        print(f"\n  (dry run — no changes made)\n")
        return

    if dest.exists():
        print(f"\n  Error: destination file already exists: {dest}", file=sys.stderr)
        sys.exit(1)

    if not dest_dir.exists():
        print(f"\n  Error: destination directory does not exist: {dest_dir}", file=sys.stderr)
        sys.exit(1)

    dest.write_text(reconstruct(new_fm, src_body), encoding="utf-8")
    print(f"\n  Created: {dest.relative_to(CONTENT_DIR.parent)}\n")


# ── CLI entry point ──────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="RaihnForge content management CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # status
    sub.add_parser("status", help="Content overview")

    # list
    p_list = sub.add_parser("list", help="List/filter content")
    p_list.add_argument("--section", help="Section path (e.g. art/illustration)")
    p_list.add_argument("--recovered", action="store_true")
    p_list.add_argument("--archived", action="store_true")
    p_list.add_argument("--no-image", action="store_true")
    p_list.add_argument("--older-than", help="Year cutoff (exclusive)")

    # archive
    p_arch = sub.add_parser("archive", help="Archive content")
    p_arch.add_argument("--section", help="Section path")
    p_arch.add_argument("--recovered", action="store_true")
    p_arch.add_argument("--older-than", help="Year cutoff")
    p_arch.add_argument("--file", help="Single file path")
    p_arch.add_argument("--dry-run", action="store_true")
    p_arch.add_argument("--yes", "-y", action="store_true")

    # unarchive
    p_unarch = sub.add_parser("unarchive", help="Unarchive content")
    p_unarch.add_argument("--section", help="Section path")
    p_unarch.add_argument("--file", help="Single file path")
    p_unarch.add_argument("--dry-run", action="store_true")
    p_unarch.add_argument("--yes", "-y", action="store_true")

    # duplicates
    p_dup = sub.add_parser("duplicates", help="Find duplicates")
    p_dup.add_argument("--threshold", type=float, default=0.6, help="Similarity threshold (0-1)")

    # set
    p_set = sub.add_parser("set", help="Bulk update a field")
    p_set.add_argument("--field", required=True, help="Front matter field name")
    p_set.add_argument("--value", required=True, help="Value to set")
    p_set.add_argument("--section", help="Section path")
    p_set.add_argument("--file", help="Single file path")
    p_set.add_argument("--dry-run", action="store_true")
    p_set.add_argument("--yes", "-y", action="store_true")

    # move
    p_move = sub.add_parser("move", help="Move file between sections")
    p_move.add_argument("src", help="Source file path")
    p_move.add_argument("dest", help="Destination directory")
    p_move.add_argument("--dry-run", action="store_true")
    p_move.add_argument("--yes", "-y", action="store_true")

    # validate
    p_val = sub.add_parser("validate", help="Validate content against schema")
    p_val.add_argument("--section", help="Section path")
    p_val.add_argument("--file", help="Single file path")
    p_val.add_argument("--fix", action="store_true", help="Auto-fix safe issues")
    p_val.add_argument("--dry-run", action="store_true", help="Preview fixes without applying")

    # merge
    p_merge = sub.add_parser("merge", help="Merge source into destination")
    p_merge.add_argument("source", help="Source file path")
    p_merge.add_argument("dest", help="Destination file path")
    p_merge.add_argument("--dry-run", action="store_true")
    p_merge.add_argument("--yes", "-y", action="store_true")

    # duplicate
    p_dupl = sub.add_parser("duplicate", help="Duplicate a content file")
    p_dupl.add_argument("source", help="Source file path")
    p_dupl.add_argument("--dest", help="Destination directory (default: same as source)")
    p_dupl.add_argument("--title", help="Title for the new file")
    p_dupl.add_argument("--dry-run", action="store_true")

    # report
    sub.add_parser("report", help="Generate HTML dashboard")

    args = parser.parse_args()

    commands = {
        "status": cmd_status,
        "list": cmd_list,
        "archive": cmd_archive,
        "unarchive": cmd_unarchive,
        "duplicates": cmd_duplicates,
        "set": cmd_set,
        "move": cmd_move,
        "validate": cmd_validate,
        "merge": cmd_merge,
        "duplicate": cmd_duplicate,
        "report": cmd_report,
    }

    commands[args.command](args)


if __name__ == "__main__":
    main()
