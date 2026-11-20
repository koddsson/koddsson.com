---
permalink: /posts/index.html
layout: default
title: "Posts"
description: "A list of posts I've written"
noPageHeader: true
templateEngineOverride: liquid
---

<h1>Posts</h1>

<p class="muted">{{ collections.filteredPosts.size }} essays, newest first.</p>

<ul class="index">
  {%- for post in collections.filteredPosts %}
  <li>
    <time datetime="{{ post.date | date: '%Y-%m-%d' }}">{{ post.date | isoDate }}</time><a href="{{ post.url }}">{{ post.data.title }}</a>
    {%- if post.data.description %}<span class="d">{{ post.data.description }}</span>{% endif %}
  </li>
  {%- endfor %}
</ul>
