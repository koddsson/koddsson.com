---
layout: default.html
title: "Kristjan Oddsson"
description: "The personal web site of Kristjan Oddsson"
---

<p class="hero">Welcome to my personal homepage! I'm a software engineer with a penchant for the Web Platform. I build things, write about them sometimes, and share photos from life along the way.</p>

## Posts

<ul class="items">
  {%- for post in collections.lastFivePosts -%}
    <li style="margin-bottom: var(--size-2);">
      <a href="{{ post.url }}">{{ post.data.title }}</a>
      <small>{{post.data.description}}</small>
    </li>
  {%- endfor -%}
</ul>

[See more posts](/posts/)

## Images

<div class="image-grid">
{%- for image in images reversed -%}
  {% if forloop.index0 < 9 %} {% assign url = image.variants[0] %} {% assign url = url | replace: "public", "homepage" %} <a href="/images/{{image.id}}"> <img src="{{ url }}" alt="{{ image.meta.alt }}"> </a>
  {%- endif -%}
{%- endfor -%}
</div>

[See more images](/images/)

## Notes

<ul class="items" id="notes">
  {%- for note in collections.notes reversed -%}
    {% if forloop.index0 < 3 and note.url != '/notes/' %}
      <li>
        {{ note.content }}
        <a href="{{ note.url }}">
          {% relativeTime note.date %}
        </a>
      </li>
    {%- endif -%}
  {%- endfor -%}
</ul>

[See more notes](/notes/)
