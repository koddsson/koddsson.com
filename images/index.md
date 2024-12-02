---
permalink: /images/index.html
layout: default
title: "Images"
description: "A bunch of images"
---

<div class="image-grid">
{%- for image in images reversed -%}
  {% assign url = image.variants[0] %} {% assign url = url | replace: "public", "homepage" %} <a href="/images/{{image.id}}"> {% image url, image.meta.alt, "(max-width: 600px) 480px, 800px", "eager" %} </a>
{%- endfor -%}
</div>
