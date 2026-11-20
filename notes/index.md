---
permalink: /notes/index.html
layout: default
title: "Notes"
description: "My notes!"
noPageHeader: true
templateEngineOverride: liquid
---

{%- assign visibleNotes = collections.notes | where_exp: "n", "n.url != '/notes/'" -%}

<h1>Notes</h1>

<p class="muted">{{ visibleNotes.size }} short ones, newest first.</p>

<ul class="log">
  {%- for note in visibleNotes reversed %}
  <li>
    <span class="stamp"><a href="{{ note.url }}"><time datetime="{{ note.date | date: '%Y-%m-%d' }}">{{ note.date | isoDate }}</time></a> · {% relativeTime note.date %}</span>
    <div class="body">{{ note.content }}</div>
  </li>
  {%- endfor %}
</ul>
