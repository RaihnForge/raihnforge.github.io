---
layout: default
title: Notes
---

# Notes

<ul>
{% assign notes_pages = site.pages | where_exp: "page", "page.path contains 'notes/'" %}
{% for note in notes_pages %}
  {% unless note.name == "index.md" %}
    <li><a href="{{ note.url | relative_url }}">{{ note.title | default: note.name | replace: '.md', '' }}</a></li>
  {% endunless %}
{% endfor %}
</ul>
