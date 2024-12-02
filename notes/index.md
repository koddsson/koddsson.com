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
          {{ note.data.title }}, {% relativeTime note.date %}
        </a>
      </li>
    {%- endunless -%}
  {%- endfor -%}
</ul>
