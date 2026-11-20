---
layout: default.html
title: "Kristján Oddsson"
description: "The personal web site of Kristján Oddsson"
templateEngineOverride: liquid
---

<h1>About</h1>

<p>I'm a software engineer with a penchant for working with Web Platform features and hacking on small projects. Here you'll find my posts and notes.</p>

<h2>Posts</h2>

<ul class="index">
  {%- for post in collections.lastFivePosts %}
  <li><time datetime="{{ post.date | date: '%Y-%m-%d' }}">{{ post.date | isoDate }}</time><a href="{{ post.url }}">{{ post.data.title }}</a></li>
  {%- endfor %}
  <li><span></span><a href="/posts/">All posts →</a></li>
</ul>

<h2>Notes</h2>

<ul class="log">
  {%- assign noteList = collections.notes | reverse -%}
  {%- assign tileCount = 0 -%}
  {%- for note in noteList -%}
    {%- if note.url != '/notes/' and tileCount < 2 %}
  <li>
    <span class="stamp"><a href="{{ note.url }}"><time datetime="{{ note.date | date: '%Y-%m-%d' }}">{{ note.date | isoDate }}</time></a></span>
    <div class="body">{{ note.content }}</div>
  </li>
      {%- assign tileCount = tileCount | plus: 1 -%}
    {%- endif -%}
  {%- endfor %}
</ul>

<h2>Projects</h2>

<ul>
  <li><a href="https://v60.koddsson.com">v60.koddsson.com</a>: a timer and guide for brewing pour-over coffee using the James Hoffmann V60 method.</li>
  <li><a href="https://skattur.koddsson.com">skattur.koddsson.com</a>: an Icelandic salary calculator that shows take-home pay after taxes, pension, and deductions.</li>
  <li><a href="https://koddsson.github.io/picker/">Picker</a>: put your fingers on the screen and it picks one. Great for settling debates.</li>
</ul>
