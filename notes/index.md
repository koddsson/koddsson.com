---
permalink: /notes/index.html
layout: default
title: "Notes"
description: "My notes!"
---

<ul>
  {%- for note in collections.notes reversed -%}
    {% unless note.url == '/notes/' %}
      <li>
        <a href="{{ note.url }}">
          {% if note.data.title %}{{ note.data.title }}, {% endif %}{% relativeTime note.date %}
        </a>
      </li>
    {%- endunless -%}
  {%- endfor -%}
</ul>
