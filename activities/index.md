---
permalink: /activities/index.html
layout: default
title: "Activities"
description: "My Strava activities"
---

{% if activities.size > 0 %}
<ul>
  {%- for activity in activities reversed -%}
    <li>
      <strong>{{ activity.object_type }}</strong> - {% if activity.aspect_type == "create" %}New activity created{% elsif activity.aspect_type == "update" %}Activity updated{% elsif activity.aspect_type == "delete" %}Activity deleted{% endif %}
      <br>
      <small>ID: {{ activity.object_id }} | Time: {{ activity.event_time }}</small>
    </li>
  {%- endfor -%}
</ul>
{% else %}
<p>No activities yet.</p>
{% endif %}
