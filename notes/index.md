---
layout: default
title: index
---

<ul>
{% for note in site.pages %}
  {% if note.path contains 'notes' and note.name != 'index.md' %}
    <li>
      <a href="{{ note.url | relative_url }}">
        {{ note.title | default: note.name | replace: '.md', '' }}
      </a>
    </li>
  {% endif %}
{% endfor %}
</ul>
