---
permalink: /voicemails/index.html
layout: default
title: "Voicemails"
description: "Voicemails left on the koddsson.com hotline."
noPageHeader: true
templateEngineOverride: liquid
---

<h1>Voicemails</h1>

<p class="muted">{{ collections.voicemails.size }} messages left on the hotline.</p>

<ul class="log">
  {%- for vm in collections.voicemails %}
  <li>
    <span class="stamp"><a href="{{ vm.url }}"><time datetime="{{ vm.date | date: '%Y-%m-%dT%H:%M' }}">{{ vm.date | isoDate }}</time></a> · {% relativeTime vm.date %}</span>
    <div class="body">{{ vm.content }}</div>
  </li>
  {%- endfor %}
</ul>
