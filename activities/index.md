---
permalink: /activities/index.html
layout: default
title: "Activities"
description: "My Strava activities"
---

{% if activities.size > 0 %}
<ul class="items">
  {%- for activity in activities reversed -%}
    <li>
      <strong>{{ activity.object_type | capitalize }}</strong> - {% if activity.aspect_type == "create" %}New activity created{% elsif activity.aspect_type == "update" %}Activity updated{% elsif activity.aspect_type == "delete" %}Activity deleted{% endif %}<br>
      <small><a href="https://www.strava.com/activities/{{ activity.object_id }}" target="_blank" rel="noopener">View on Strava</a> | {{ activity.event_time | formatUnixTime }}</small>
    </li>
  {%- endfor -%}
</ul>
{% else %}
<p>No activities yet.</p>
{% endif %}
