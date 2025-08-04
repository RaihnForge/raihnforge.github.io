---
layout: default
title: Debug Pages
---

# Debug: site.pages

<pre>
{% for p in site.pages %}
{{ p.path }}   |   {{ p.url }}   |   {{ p.title }}
{% endfor %}
</pre>
