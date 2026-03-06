---
permalink: /links/index.html
layout: default
title: "Links"
description: "Interesting links with commentary"
---

<ul class="items">
  {%- for link in collections.links reversed -%}
    {% unless link.url == '/links/' %}
      <li>
        <a href="{{ link.url }}">{{ link.data.title }}</a>
        <small>{{ link.data.description }}</small>
      </li>
    {%- endunless -%}
  {%- endfor -%}
</ul>
