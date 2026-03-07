---
layout: default.html
description: "The personal web site of Kristján Oddsson"
pagination:
    data: images
    size: 1
    alias: image
permalink: "images/{{ image.id | slugify }}/"
eleventyComputed:
  title: "{{image.meta.caption}}"
---

{% assign url = image.variants[0] %}
{% assign url = url | replace: "homepage", "public" %}
<figure>
  <img src="{{ url }}" alt="{{ image.meta.alt }}">
  <figcaption>
    {% relativeTime image.uploaded %}
  </figcaption>
</figure>
