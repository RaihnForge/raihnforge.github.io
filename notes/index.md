---
layout: default
title: Notes
---

# Notes

<ul>
{% for note in site.static_files %}
  {% if note.path contains '/notes/' and note.extname == '.html' %}
    <li><a href="{{ note.path | relative_url }}">{{ note.name | replace: '.html', '' }}</a></li>
  {% endif %}
{% endfor %}
</ul>
