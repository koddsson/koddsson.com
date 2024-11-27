---
permalink: /posts/index.html
layout: default
title: "Posts"
description: "A list of posts I've written"
---

{% for post in collections.filteredPosts %}
<a href="{{ post.url }}">

<h3>{{ post.data.title }}</h3>
<small>{{post.data.description}}</small>
</a>
{% endfor %}
