---
permalink: /posts/index.html
layout: default
title: "Posts"
description: "A list of posts I've written"
---

<ul class="items">
{% for post in collections.filteredPosts %}
  <li style="margin-bottom: var(--size-3);">
    <a href="{{ post.url }}">{{ post.data.title }}</a>
    <small>{{ post.data.description }}</small>
  </li>
{% endfor %}
</ul>
