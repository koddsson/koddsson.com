---
permalink: /posts/index.html
layout: default
title: "Posts"
description: "A list of posts I've written"
noPageHeader: true
---

<header class="index-hero">
  <h1>POSTS.</h1>
  <span class="meta">N = {{ collections.filteredPosts.size | prepend: '0' | slice: -2, 2 }} · ESSAYS</span>
</header>

<div class="indexed-list-header">
  <span>№</span>
  <span>TITLE / SUBTITLE</span>
  <span>DATE</span>
</div>

<ul class="indexed-list indexed-list--large">
  {%- for post in collections.filteredPosts -%}
    <li>
      <span class="num">{{ forloop.index | prepend: '0' | slice: -2, 2 }}</span>
      <div>
        <a class="title" href="{{ post.url }}">{{ post.data.title }}</a>
        <span class="description">{{ post.data.description }}</span>
      </div>
      <time datetime="{{ post.date | date: '%Y-%m-%d' }}">{{ post.date | isoDate }}</time>
    </li>
  {%- endfor -%}
</ul>
