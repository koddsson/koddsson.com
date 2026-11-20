---
permalink: /images/index.html
layout: default
title: "Images"
description: "A bunch of images"
noPageHeader: true
templateEngineOverride: liquid
---

<h1>Images</h1>

<p class="muted">{{ images.size }} photos, newest first.</p>

<div class="image-grid">
{%- for image in images reversed -%}
  {% assign url = image.variants[0] %}{% assign url = url | replace: "public", "homepage" %}<a href="/images/{{image.id}}/"><img src="{{ url }}" alt="{{ image.meta.alt }}" loading="lazy"></a>
{%- endfor -%}
</div>
