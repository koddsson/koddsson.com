---
layout: default.html
title: "Kristján Oddsson"
description: "The personal web site of Kristján Oddsson"
---

<section class="hero">
  <h1>WEB<br>PLATFORM<br><span class="accent">PRACTITIONER.</span></h1>
  <div class="hero-lede">
    <div class="hero-lede__label">№ 01 · INTRODUCTION</div>
    <p>I'm a software engineer with a penchant for working with Web Platform features and hacking on small projects. Here you'll find my posts and notes.</p>
  </div>
</section>

<div class="section-rule">
  <span class="section-rule__no">§ 02</span>
  <span>INDEX OF WRITING</span>
  <span class="section-rule__count">N={{ collections.filteredPosts.size | prepend: '0' | slice: -2, 2 }}</span>
</div>

<ul class="indexed-list">
  {%- for post in collections.lastFivePosts -%}
    <li>
      <span class="num">{{ forloop.index | prepend: '0' | slice: -2, 2 }}</span>
      <div>
        <a class="title" href="{{ post.url }}">{{ post.data.title }}</a>
        <span class="description">{{ post.data.description }}</span>
      </div>
      <time datetime="{{ post.date | date: '%Y-%m-%d' }}">{{ post.date | isoDate }}</time>
    </li>
  {%- endfor -%}
  <li class="more"><a href="/posts/">VIEW ALL POSTS →</a></li>
</ul>

<div class="note-tiles">
  {%- assign noteList = collections.notes | reverse -%}
  {%- assign tileCount = 0 -%}
  {%- for note in noteList -%}
    {%- if note.url != '/notes/' and tileCount < 2 -%}
      <div>
        <div class="note-tile-label">NOTE · {{ note.date | isoDate }}</div>
        <div class="note-tile-body">{{ note.content }}</div>
      </div>
      {%- assign tileCount = tileCount | plus: 1 -%}
    {%- endif -%}
  {%- endfor -%}
  <a class="rss-card" href="/feed.xml">
    <span class="label">SUBSCRIBE</span>
    <span class="pitch">RSS<br>FEED →</span>
  </a>
</div>

<div class="section-rule">
  <span class="section-rule__no">§ 03</span>
  <span>PROJECTS</span>
  <span class="section-rule__count">N=03</span>
</div>

<div class="project-grid">
  <a href="https://v60.koddsson.com">
    <picture><img src="/imgs/projects/v60.png" alt="Screenshot of V60 Coffee Timer showing brew stages and a start button"></picture>
    <div>
      <div class="title">v60.koddsson.com</div>
      <p class="desc">A timer and guide for brewing pour-over coffee using the James Hoffmann V60 method.</p>
    </div>
  </a>
  <a href="https://skattur.koddsson.com">
    <picture><img src="/imgs/projects/skattur.png" alt="Screenshot of Icelandic salary calculator showing salary input, deductions, and take-home pay breakdown"></picture>
    <div>
      <div class="title">skattur.koddsson.com</div>
      <p class="desc">An Icelandic salary calculator that shows take-home pay after taxes, pension, and deductions.</p>
    </div>
  </a>
</div>
