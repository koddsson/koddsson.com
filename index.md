---
layout: default.html
title: "Kristján Oddsson"
description: "The personal web site of Kristján Oddsson"
---

Hey! I'm Kristján and my pronouns are he/him. I like working with Web Platform features and hacking on small projects like this web site. You'll find some posts and notes here. I'm currently working at [ING](https://ing.nl/) as a Software Engineer and post recipies that I like to cook on [koddsson.cooking](http://koddsson.cooking).

## Posts

<ul class="items">
  {%- for post in collections.posts reversed -%}
    {% if forloop.index0 < 5 %}
      <li>
        <a href="{{ post.url }}">{{ post.data.title }}</a>
        {% relativeTime post.date %}
      </li>
    {%- endif -%}
  {%- endfor -%}
</ul>

## Images

{% assign image = images[0] %}
<a href="/images/{{image.id}}">{{image.meta.caption}} • {% relativeTime image.uploaded %}</a>

## Notes

<ul class="items" id="notes">
  {%- for note in collections.notes reversed -%}
    {% if forloop.index0 < 3 %}
      <li>
        {{ note.content }}
        <a href="{{ note.url }}">
          {% relativeTime note.date %}
        </a>
      </li>
    {%- endif -%}
  {%- endfor -%}
</ul>
