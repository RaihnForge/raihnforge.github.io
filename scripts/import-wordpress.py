#!/usr/bin/env python3
"""
WordPress WXR → Hugo Content Importer
Parses WordPress eXtended RSS export and generates Hugo-compatible markdown files.
Handles category→section mapping, media matching, and joshuakeyes.us recovery flagging.
"""

import xml.etree.ElementTree as ET
import os
import re
import shutil
import sys
from datetime import datetime
from collections import defaultdict
from pathlib import Path

# Optional: markdownify for HTML→Markdown conversion
try:
    from markdownify import markdownify as md
    HAS_MARKDOWNIFY = True
except ImportError:
    HAS_MARKDOWNIFY = False
    print("WARNING: markdownify not installed. Using basic HTML→Markdown conversion.")
    print("Install with: pip3 install markdownify")

# ============================================================
# Configuration
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
WXR_FILE = PROJECT_ROOT / ".tempdocs" / "raihn.wordpress.com-2026-02-28-22_56_31" / "raihn.wordpress.com.2026-02-28.000.xml"
MEDIA_EXPORT_DIR = PROJECT_ROOT / ".tempdocs" / "media-export-3300961-from-0-to-4222"
CONTENT_DIR = PROJECT_ROOT / "content"
STATIC_IMAGES_DIR = PROJECT_ROOT / "static" / "images"

# XML namespaces
NS = {
    'wp': 'http://wordpress.org/export/1.2/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
    'dc': 'http://purl.org/dc/elements/1.1/',
    'excerpt': 'http://wordpress.org/export/1.2/excerpt/',
}

# ============================================================
# Category → Hugo Section Mapping
# ============================================================

# Categories that map to art section
ART_CATEGORIES = {
    'illustration', 'digital painting', 'fan art', 'cartooning',
    'logo designs', 'sketchbook', 'life drawing', 'speed painting',
    'avatars', 'twitch emoticons', 'twitch cheermotes', 'acrylic painting',
    'sketchbook digital', 'sketchbook ink', 'sketchbook mixed medium',
    'sketchbook pencil', 'sketchbook therapy', 'sequential art',
    'signatures', 'icon', 'character concept', 'art study', 'art history',
    'art feature',
    # Design categories also go to art
    'design', 'web assets design', 'web page designs', 'product design',
    'advertisements', 'posters', 'banners', 't-shirt', 'business cards',
    'stationary', 'wallpaper', 'gift card',
    # Pixel art goes to art unless also tagged with game categories
    'pixel art',
}

# Categories that map to gamedev section
GAMEDEV_CATEGORIES = {
    'indie game blog', 'game design', 'indie game concept art',
    'indie game art', 'unchosen paths', 'tiled', 'indie game design',
    'game graphics', 'castlevania',
}

# Categories that map to blog section (everything else, but listed for clarity)
BLOG_CATEGORIES = {
    'muse', 'article image', 'daily up', 'uncategorized', 'media',
    'production assets', 'esports', 'team liquid', 'grubby',
    'basetradetv', 'family', 'psychology', 'wip',
    'education', 'political science', 'renaissance man reflections',
    'emuse', 'street level', 'download', 'projects', 'brony',
    'league of ledgends', 'destiny', 'starcraft',
}

# Page slug → section mapping
PAGE_MAPPING = {
    'associations': 'skip',  # Already in about.md
    'portfolio': 'skip',     # Art index page
    'sketchbook': 'skip',    # Art index page
    'workshop': 'blog',      # Workshop → blog post
    'muse-perspectives': 'blog',
    'ezibg': 'gamedev',
}


def determine_section(categories):
    """Determine Hugo section based on WordPress categories."""
    cats_lower = {c.lower() for c in categories}

    # If it has gamedev categories, it goes to gamedev
    if cats_lower & GAMEDEV_CATEGORIES:
        return 'gamedev'

    # If it has art categories, it goes to art
    if cats_lower & ART_CATEGORIES:
        return 'art'

    # Everything else goes to blog
    return 'blog'


def determine_medium(categories):
    """Infer art medium from WordPress categories."""
    cats_lower = {c.lower() for c in categories}

    medium_map = {
        'digital painting': 'Digital',
        'acrylic painting': 'Acrylic',
        'speed painting': 'Digital',
        'sketchbook pencil': 'Pencil',
        'sketchbook ink': 'Ink',
        'sketchbook mixed medium': 'Mixed Media',
        'sketchbook digital': 'Digital',
        'pixel art': 'Pixel Art',
        'sequential art': 'Sequential',
        'life drawing': 'Pencil',
    }

    for cat, medium in medium_map.items():
        if cat in cats_lower:
            return medium

    if cats_lower & {'illustration', 'fan art', 'cartooning', 'avatars',
                      'twitch emoticons', 'twitch cheermotes'}:
        return 'Digital'

    if cats_lower & {'design', 'web assets design', 'web page designs',
                      'product design', 'logo designs', 'banners', 'posters'}:
        return 'Digital'

    return ''


# ============================================================
# HTML → Markdown Conversion
# ============================================================

def html_to_markdown(html_content):
    """Convert WordPress HTML content to clean Markdown."""
    if not html_content:
        return ''

    # Remove WordPress block editor comments
    text = re.sub(r'<!-- /?wp:\S+.*?-->', '', html_content, flags=re.DOTALL)

    # Remove empty div wrappers from block editor
    text = re.sub(r'<div class="wp-block-\S+"[^>]*>', '', text)
    text = re.sub(r'</div>', '', text)

    # Handle WordPress galleries
    text = re.sub(r'\[gallery[^\]]*\]', '', text)

    # Handle WordPress captions
    text = re.sub(r'\[caption[^\]]*\](.*?)\[/caption\]', r'\1', text, flags=re.DOTALL)

    # Handle oEmbed/YouTube embeds - preserve as links
    text = re.sub(
        r'https?://(?:www\.)?youtube\.com/watch\?v=([a-zA-Z0-9_-]+)',
        r'{{< youtube "\1" >}}',
        text
    )
    text = re.sub(
        r'https?://youtu\.be/([a-zA-Z0-9_-]+)',
        r'{{< youtube "\1" >}}',
        text
    )

    if HAS_MARKDOWNIFY:
        result = md(text, heading_style='ATX', bullets='-', strip=['script', 'style'])
    else:
        result = basic_html_to_md(text)

    # Clean up excessive whitespace
    result = re.sub(r'\n{3,}', '\n\n', result)
    result = result.strip()

    return result


def basic_html_to_md(html):
    """Basic HTML→Markdown fallback when markdownify is unavailable."""
    text = html

    # Headings
    for i in range(6, 0, -1):
        text = re.sub(f'<h{i}[^>]*>(.*?)</h{i}>', lambda m: '#' * i + ' ' + m.group(1), text, flags=re.DOTALL)

    # Bold/italic
    text = re.sub(r'<(?:strong|b)>(.*?)</(?:strong|b)>', r'**\1**', text, flags=re.DOTALL)
    text = re.sub(r'<(?:em|i)>(.*?)</(?:em|i)>', r'*\1*', text, flags=re.DOTALL)

    # Links
    text = re.sub(r'<a [^>]*href="([^"]*)"[^>]*>(.*?)</a>', r'[\2](\1)', text, flags=re.DOTALL)

    # Images
    text = re.sub(r'<img [^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*/?>',
                  lambda m: f'![{m.group(2)}]({m.group(1)})', text)
    text = re.sub(r'<img [^>]*src="([^"]*)"[^>]*/?>',
                  lambda m: f'![]({m.group(1)})', text)

    # Lists
    text = re.sub(r'<li[^>]*>(.*?)</li>', r'- \1', text, flags=re.DOTALL)
    text = re.sub(r'</?[uo]l[^>]*>', '', text)

    # Blockquotes
    text = re.sub(r'<blockquote[^>]*>(.*?)</blockquote>',
                  lambda m: '\n'.join('> ' + line for line in m.group(1).strip().split('\n')),
                  text, flags=re.DOTALL)

    # Paragraphs & breaks
    text = re.sub(r'<br\s*/?>', '\n', text)
    text = re.sub(r'<p[^>]*>(.*?)</p>', r'\1\n\n', text, flags=re.DOTALL)

    # Strip remaining HTML tags
    text = re.sub(r'<[^>]+>', '', text)

    # Clean up HTML entities
    text = text.replace('&amp;', '&')
    text = text.replace('&lt;', '<')
    text = text.replace('&gt;', '>')
    text = text.replace('&quot;', '"')
    text = text.replace('&#8217;', "'")
    text = text.replace('&#8216;', "'")
    text = text.replace('&#8220;', '"')
    text = text.replace('&#8221;', '"')
    text = text.replace('&#8211;', '–')
    text = text.replace('&#8212;', '—')
    text = text.replace('&nbsp;', ' ')

    return text


# ============================================================
# Media Handling
# ============================================================

def build_attachment_map(items):
    """Build lookup maps for WordPress attachments."""
    # attachment_id → attachment data
    attachments = {}
    # parent_post_id → list of attachment data
    parent_attachments = defaultdict(list)

    for item in items:
        post_type = item.find('wp:post_type', NS)
        if post_type is None or post_type.text != 'attachment':
            continue

        post_id = item.find('wp:post_id', NS).text
        parent_id = item.find('wp:post_parent', NS).text
        att_url_el = item.find('wp:attachment_url', NS)
        att_url = att_url_el.text if att_url_el is not None else ''
        title = item.find('title').text or ''
        date = item.find('wp:post_date', NS).text or ''

        data = {
            'id': post_id,
            'parent_id': parent_id,
            'url': att_url,
            'title': title,
            'date': date,
            'filename': os.path.basename(att_url) if att_url else '',
        }

        attachments[post_id] = data
        if parent_id and parent_id != '0':
            parent_attachments[parent_id].append(data)

    return attachments, parent_attachments


def find_local_media(filename):
    """Find a media file in the local media export directory."""
    if not filename:
        return None

    # Walk the media export directory
    for root, dirs, files in os.walk(MEDIA_EXPORT_DIR):
        for f in files:
            if f == filename:
                return os.path.join(root, f)

    # Try case-insensitive match
    filename_lower = filename.lower()
    for root, dirs, files in os.walk(MEDIA_EXPORT_DIR):
        for f in files:
            if f.lower() == filename_lower:
                return os.path.join(root, f)

    return None


def get_thumbnail_id(item):
    """Get the _thumbnail_id from post metadata."""
    for meta in item.findall('wp:postmeta', NS):
        key = meta.find('wp:meta_key', NS).text
        if key == '_thumbnail_id':
            return meta.find('wp:meta_value', NS).text
    return None


# ============================================================
# Content Processing
# ============================================================

def extract_description(content, max_length=150):
    """Extract a description from the first paragraph of content."""
    if not content:
        return ''

    # Strip markdown formatting for description
    text = re.sub(r'!\[.*?\]\(.*?\)', '', content)  # Remove images
    text = re.sub(r'\[([^\]]*)\]\([^\)]*\)', r'\1', text)  # Links → text
    text = re.sub(r'[*_#`>]', '', text)  # Remove formatting chars
    text = re.sub(r'\{\{<.*?>}\}', '', text)  # Remove shortcodes
    text = text.strip()

    # Get first non-empty paragraph
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    if not paragraphs:
        return ''

    desc = paragraphs[0]
    if len(desc) > max_length:
        desc = desc[:max_length].rsplit(' ', 1)[0] + '...'

    return desc


def sanitize_slug(slug):
    """Ensure slug is clean for use as a filename."""
    if not slug:
        return ''
    # Remove any path components, keep only the slug
    slug = slug.strip('/').split('/')[-1]
    # Remove special chars, keep alphanumeric, hyphens, underscores
    slug = re.sub(r'[^a-z0-9_-]', '-', slug.lower())
    slug = re.sub(r'-+', '-', slug).strip('-')
    return slug


def escape_yaml_string(s):
    """Escape a string for YAML front matter."""
    if not s:
        return '""'
    # If contains special chars, wrap in quotes
    if any(c in s for c in ':#[]{}|>*&!%@`"\'\n'):
        escaped = s.replace('\\', '\\\\').replace('"', '\\"')
        return f'"{escaped}"'
    return f'"{s}"'


def check_joshuakeyes_refs(html_content):
    """Check if content references joshuakeyes.us (lost media)."""
    if not html_content:
        return False
    return 'joshuakeyes.us' in html_content


def rewrite_image_urls(markdown_content, section, slug, attachment_map, parent_attachments, post_id):
    """Rewrite image URLs in markdown to point to local paths."""
    def rewrite_url(match):
        url = match.group(1)
        alt = match.group(0).split('](')[0][2:] if '![' in match.group(0) else ''

        # WordPress.com hosted images
        if 'raihnforge.com/wp-content/uploads/' in url or 'wp.com' in url:
            filename = os.path.basename(url.split('?')[0])
            local_path = find_local_media(filename)
            if local_path:
                return f'![{alt}](/images/wp-imports/{section}/{filename})'

        # joshuakeyes.us images — mark as lost
        if 'joshuakeyes.us' in url:
            return f'![{alt} (original image unavailable)]({url})'

        return match.group(0)

    # Rewrite markdown image URLs
    result = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', lambda m: rewrite_url(m), markdown_content)

    return result


def build_front_matter(title, date, description, section, categories, tags,
                       image_path='', recovered=False, year=None, medium='',
                       status='', engine='', role='', timeline=''):
    """Build YAML front matter for a Hugo content file."""
    lines = ['---']
    lines.append(f'title: {escape_yaml_string(title)}')
    lines.append(f'date: {date}')
    lines.append(f'description: {escape_yaml_string(description)}')

    # Tags (from WP categories + tags, deduplicated and cleaned)
    all_tags = sorted(set(tags))
    if all_tags:
        tag_str = ', '.join(escape_yaml_string(t) for t in all_tags)
        lines.append(f'tags: [{tag_str}]')

    if image_path:
        lines.append(f'image: "{image_path}"')

    lines.append('draft: false')

    # Section-specific fields
    if section == 'art':
        if medium:
            lines.append(f'medium: "{medium}"')
        if year:
            lines.append(f'year: {year}')

    if section == 'gamedev':
        if status:
            lines.append(f'status: "{status}"')
        if engine:
            lines.append(f'engine: "{engine}"')
        if role:
            lines.append(f'role: "{role}"')
        if timeline:
            lines.append(f'timeline: "{timeline}"')

    if recovered:
        lines.append('recovered: true')

    lines.append('---')
    return '\n'.join(lines)


# ============================================================
# Main Import Logic
# ============================================================

def main():
    print("=" * 60)
    print("WordPress WXR → Hugo Content Importer")
    print("=" * 60)
    print()

    # Parse WXR
    print(f"Parsing: {WXR_FILE}")
    tree = ET.parse(str(WXR_FILE))
    root = tree.getroot()
    channel = root.find('channel')
    items = channel.findall('item')
    print(f"Found {len(items)} items in WXR export")
    print()

    # Build attachment maps
    print("Building attachment maps...")
    attachments, parent_attachments = build_attachment_map(items)
    print(f"  {len(attachments)} attachments indexed")
    print(f"  {len(parent_attachments)} posts have child attachments")
    print()

    # Collect existing content files for deduplication
    existing_files = set()
    for section in ['art', 'blog', 'gamedev']:
        section_dir = CONTENT_DIR / section
        if section_dir.exists():
            for f in section_dir.iterdir():
                if f.suffix == '.md' and f.name != '_index.md':
                    existing_files.add((section, f.stem))

    print(f"Existing content files: {len(existing_files)}")
    for section, slug in sorted(existing_files):
        print(f"  {section}/{slug}")
    print()

    # Stats
    stats = {
        'imported': 0,
        'skipped_existing': 0,
        'skipped_draft': 0,
        'skipped_type': 0,
        'skipped_empty': 0,
        'skipped_page': 0,
        'recovered': 0,
        'media_matched': 0,
        'media_unmatched': 0,
        'by_section': defaultdict(int),
    }

    media_copy_queue = []  # (source_path, dest_path) tuples

    # Process each item
    print("Processing posts and pages...")
    print("-" * 40)

    for item in items:
        post_type_el = item.find('wp:post_type', NS)
        status_el = item.find('wp:status', NS)

        if post_type_el is None:
            continue

        post_type = post_type_el.text
        status = status_el.text if status_el is not None else ''

        # Only process posts and pages
        if post_type not in ('post', 'page'):
            stats['skipped_type'] += 1
            continue

        # Only published content
        if status != 'publish':
            stats['skipped_draft'] += 1
            continue

        # Extract basic fields
        title = item.find('title').text or 'Untitled'
        slug = item.find('wp:post_name', NS).text or ''
        post_id = item.find('wp:post_id', NS).text or ''
        date_str = item.find('wp:post_date', NS).text or ''
        creator = item.find('dc:creator', NS).text or ''
        content_el = item.find('content:encoded', NS)
        html_content = content_el.text if content_el is not None else ''

        # Parse date
        try:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
            date_formatted = date_obj.strftime('%Y-%m-%d')
            post_year = date_obj.year
        except (ValueError, TypeError):
            date_formatted = '2005-01-01'
            post_year = 2005

        # Clean slug
        slug = sanitize_slug(slug)
        if not slug:
            slug = sanitize_slug(title)

        # Get categories and tags
        categories = []
        wp_tags = []
        for cat_el in item.findall('category'):
            domain = cat_el.get('domain', '')
            name = cat_el.text or ''
            if domain == 'category':
                categories.append(name)
            elif domain == 'post_tag':
                wp_tags.append(name)

        # Handle pages
        if post_type == 'page':
            page_section = PAGE_MAPPING.get(slug, 'skip')
            if page_section == 'skip':
                stats['skipped_page'] += 1
                continue
            section = page_section
        else:
            # Determine section from categories
            section = determine_section(categories)

        # Check for empty content
        if not html_content or not html_content.strip():
            stats['skipped_empty'] += 1
            continue

        # Check for deduplication
        if (section, slug) in existing_files:
            stats['skipped_existing'] += 1
            print(f"  SKIP (existing): {section}/{slug}")
            continue

        # Check for joshuakeyes.us references (recovered content)
        recovered = check_joshuakeyes_refs(html_content)
        if recovered:
            stats['recovered'] += 1

        # Convert HTML to Markdown
        markdown_content = html_to_markdown(html_content)

        # Extract or generate description
        excerpt_el = item.find('excerpt:encoded', NS)
        excerpt = excerpt_el.text if excerpt_el is not None else ''
        if excerpt and excerpt.strip():
            description = excerpt.strip()[:200]
        else:
            description = extract_description(markdown_content)

        # Handle featured image
        image_path = ''
        thumbnail_id = get_thumbnail_id(item)
        if thumbnail_id and thumbnail_id in attachments:
            att = attachments[thumbnail_id]
            filename = att['filename']
            local_file = find_local_media(filename)
            if local_file:
                dest_dir = STATIC_IMAGES_DIR / 'wp-imports' / section
                dest_path = dest_dir / filename
                media_copy_queue.append((local_file, str(dest_path)))
                image_path = f'/images/wp-imports/{section}/{filename}'
                stats['media_matched'] += 1
            else:
                stats['media_unmatched'] += 1
        elif post_id in parent_attachments:
            # Try first child attachment as image
            for att in parent_attachments[post_id]:
                filename = att['filename']
                ext = os.path.splitext(filename)[1].lower()
                if ext in ('.jpg', '.jpeg', '.png', '.gif', '.webp'):
                    local_file = find_local_media(filename)
                    if local_file:
                        dest_dir = STATIC_IMAGES_DIR / 'wp-imports' / section
                        dest_path = dest_dir / filename
                        media_copy_queue.append((local_file, str(dest_path)))
                        image_path = f'/images/wp-imports/{section}/{filename}'
                        stats['media_matched'] += 1
                        break

        # Rewrite image URLs in content
        markdown_content = rewrite_image_urls(
            markdown_content, section, slug,
            attachments, parent_attachments, post_id
        )

        # Determine art-specific fields
        medium = determine_medium(categories) if section == 'art' else ''

        # Build combined tags from categories + WP tags
        # Filter out overly generic categories
        skip_tags = {'uncategorized', 'download', 'media', 'production assets',
                     'article image', 'daily up', 'projects', 'wip'}
        combined_tags = []
        for c in categories:
            if c.lower() not in skip_tags:
                combined_tags.append(c)
        combined_tags.extend(wp_tags)

        # Build front matter
        front_matter = build_front_matter(
            title=title,
            date=date_formatted,
            description=description,
            section=section,
            categories=categories,
            tags=combined_tags,
            image_path=image_path,
            recovered=recovered,
            year=post_year if section == 'art' else None,
            medium=medium,
        )

        # Write content file
        output_dir = CONTENT_DIR / section
        output_dir.mkdir(parents=True, exist_ok=True)
        output_file = output_dir / f"{slug}.md"

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(front_matter)
            f.write('\n\n')
            f.write(markdown_content)
            f.write('\n')

        stats['imported'] += 1
        stats['by_section'][section] += 1
        flag = " [RECOVERED]" if recovered else ""
        print(f"  OK: {section}/{slug}{flag}")

    # Copy media files
    print()
    print("-" * 40)
    print(f"Copying {len(media_copy_queue)} media files...")

    copied = 0
    for src, dest in media_copy_queue:
        dest_path = Path(dest)
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        if not dest_path.exists():
            shutil.copy2(src, dest)
            copied += 1

    print(f"  Copied {copied} new files")

    # Also copy inline images referenced in content
    print()
    print("Scanning for additional inline media to copy...")
    inline_copied = copy_inline_media(stats)

    # Print report
    print()
    print("=" * 60)
    print("MIGRATION REPORT")
    print("=" * 60)
    print(f"  Total imported:        {stats['imported']}")
    print(f"    → art:               {stats['by_section']['art']}")
    print(f"    → blog:              {stats['by_section']['blog']}")
    print(f"    → gamedev:           {stats['by_section']['gamedev']}")
    print(f"  Skipped (existing):    {stats['skipped_existing']}")
    print(f"  Skipped (draft/trash): {stats['skipped_draft']}")
    print(f"  Skipped (empty):       {stats['skipped_empty']}")
    print(f"  Skipped (pages):       {stats['skipped_page']}")
    print(f"  Skipped (other type):  {stats['skipped_type']}")
    print(f"  Recovered content:     {stats['recovered']}")
    print(f"  Featured images found: {stats['media_matched']}")
    print(f"  Featured images lost:  {stats['media_unmatched']}")
    print(f"  Media files copied:    {copied}")
    print(f"  Inline media copied:   {inline_copied}")
    print("=" * 60)


def copy_inline_media(stats):
    """Scan imported content for image references and copy matching media."""
    copied = 0
    for section in ['art', 'blog', 'gamedev']:
        section_dir = CONTENT_DIR / section
        if not section_dir.exists():
            continue
        for md_file in section_dir.glob('*.md'):
            if md_file.name == '_index.md':
                continue
            content = md_file.read_text(encoding='utf-8')
            # Find image references like /images/wp-imports/section/filename
            for match in re.finditer(r'/images/wp-imports/\w+/([^)\s"]+)', content):
                filename = match.group(1)
                dest = STATIC_IMAGES_DIR / 'wp-imports' / section / filename
                if not dest.exists():
                    src = find_local_media(filename)
                    if src:
                        dest.parent.mkdir(parents=True, exist_ok=True)
                        shutil.copy2(src, dest)
                        copied += 1
    return copied


if __name__ == '__main__':
    main()
