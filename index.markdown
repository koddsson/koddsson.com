Hey! I'm Kristján, I like working with Web Platform features and hacking on small projects like this web site. You'll find some posts and notes here. I'm currently working at [GitHub](https://github.com/koddsson) as a Web Systems Engineer.

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
