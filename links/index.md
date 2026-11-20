---
permalink: /links/index.html
layout: default
title: "Links"
description: "Interesting links with commentary"
templateEngineOverride: liquid
---

<ul>
  {%- for link in collections.links reversed %}
    {%- unless link.url == '/links/' %}
  <li><a href="{{ link.url }}">{{ link.data.title }}</a>{% if link.data.description %} <span class="muted">{{ link.data.description }}</span>{% endif %}</li>
    {%- endunless %}
  {%- endfor %}
</ul>
