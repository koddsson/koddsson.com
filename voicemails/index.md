---
permalink: /voicemails/index.html
layout: default
title: "Voicemails"
description: "Voicemails left on the koddsson.com hotline."
noPageHeader: true
---

<header class="index-hero">
  <h1>VOICEMAILS.</h1>
  <span class="meta">N = {{ collections.voicemails.size | prepend: '0' | slice: -2, 2 }} · AUDIO</span>
</header>

<ul class="voicemails-list">
  {%- for vm in collections.voicemails -%}
    <li>
      <a class="voicemail-date" href="{{ vm.url }}"><time datetime="{{ vm.date | date: '%Y-%m-%dT%H:%M' }}">{{ vm.date | isoDate }}</time></a>
      <div class="body">{{ vm.content }}</div>
      <span class="relative">{% relativeTime vm.date %}</span>
    </li>
  {%- endfor -%}
</ul>
