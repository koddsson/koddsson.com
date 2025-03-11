---
permalink: /images/index.html
layout: default
title: "Images"
description: "A bunch of images"
---

<div class="image-grid">
{%- for image in images reversed -%}
  {% assign url = image.variants[0] %} {% assign url = url | replace: "public", "homepage" %} <a href="/images/{{image.id}}"><img src="{{ url }}" alt="{{ image.meta.alt }}"></a>
{%- endfor -%}
</div>
