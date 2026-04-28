---
permalink: /images/index.html
layout: default
title: "Images"
description: "A bunch of images"
noPageHeader: true
---

<header class="index-hero">
  <h1>IMAGES.</h1>
  <span class="meta">N = {{ images.size | prepend: '00' | slice: -3, 3 }}</span>
</header>

<div class="image-grid">
{%- for image in images reversed -%}
  {% assign url = image.variants[0] %}{% assign url = url | replace: "public", "homepage" %}<a href="/images/{{image.id}}"><img src="{{ url }}" alt="{{ image.meta.alt }}"></a>
{%- endfor -%}
</div>
