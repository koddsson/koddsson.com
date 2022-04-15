---
description: "The personal web site of Kristján Oddsson"
---

Hey! I'm Kristján and my pronouns are he/him. I like working with Web Platform features and hacking on small projects like this web site. You'll find some posts and notes here. I'm currently working at [GitHub](https://github.com/koddsson) as a Web Systems Engineer and post recipies that I like to cook on [koddsson.cooking](http://koddsson.cooking).

## Posts

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>

## Notes
<ul>
  {% for note in site.notes %}
    <li>
      <a href="{{ note.url }}">{{ note.date | timeago }}</a>
      {{ note.content }}
    </li>
  {% endfor %}
</ul>
