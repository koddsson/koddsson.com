---
layout: default.html
title: "Kristján Oddsson"
description: "The personal web site of Kristján Oddsson"
---

A software engineer with a penchant for working with Web Platform features and hacking on small projects has created posts and notes on this website.

<nav class="vertical" aria-label="Socials">
  <a href="https://github.com/koddsson">GitHub</a>
  <a href="https://x.com/koddsson">Twitter</a>
  <a href="https://read.cv/koddsson">ReadCV</a>
  <a href="https://linkedin.com/in/koddsson">LinkedIn</a>
  <a href="https://koddsson.cooking">koddsson.cooking</a>
</nav>

## Posts

<ul class="items">
  {%- for post in collections.lastFivePosts -%}
    <li style="margin-bottom: var(--size-2);">
      <a href="{{ post.url }}">{{ post.data.title }}</a>
      <small>{{post.data.description}}</small>
    </li>
  {%- endfor -%}
</ul>

## Images

<div class="image-grid">
{%- for image in images reversed -%}
  {% if forloop.index0 < 9 %}
    {% assign url = image.variants[0] %}
    {% assign url = url | replace: "public", "homepage" %}
    <a href="/images/{{image.id}}"> {% image url, image.meta.alt, "(max-width: 600px) 480px, 800px", "eager" %} </a>
  {%- endif -%}
{%- endfor -%}
</div>

## Notes

<ul class="items" id="notes">
  {%- for note in collections.notes reversed -%}
    {% if forloop.index0 < 3 %}
      <li>
        {{ note.content }}
        <a href="{{ note.url }}">
          {% relativeTime note.date %}
        </a>
      </li>
    {%- endif -%}
  {%- endfor -%}
</ul>
