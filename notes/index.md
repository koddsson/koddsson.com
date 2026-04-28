---
permalink: /notes/index.html
layout: default
title: "Notes"
description: "My notes!"
noPageHeader: true
---

{%- assign visibleNotes = collections.notes | where_exp: "n", "n.url != '/notes/'" -%}

<header class="index-hero">
  <h1>NOTES.</h1>
  <span class="meta">N = {{ visibleNotes.size | prepend: '0' | slice: -2, 2 }} · MICROBLOG</span>
</header>

<ul class="notes-list">
  {%- for note in visibleNotes reversed -%}
    <li>
      <a class="note-date" href="{{ note.url }}"><time datetime="{{ note.date | date: '%Y-%m-%d' }}">{{ note.date | isoDate }}</time></a>
      <div class="body">{{ note.content }}</div>
      <span class="relative">{% relativeTime note.date %}</span>
    </li>
  {%- endfor -%}
</ul>
