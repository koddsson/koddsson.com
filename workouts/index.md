---
permalink: /workouts/index.html
layout: default
title: "Workouts"
description: "My Strava activities"
---

<style>
  .workout-list {
    list-style: none;
    padding: 0;
  }
  
  .workout-item {
    border: 1px solid var(--surface-3);
    border-radius: var(--radius-2);
    padding: var(--size-3);
    margin-bottom: var(--size-3);
    display: flex;
    gap: var(--size-3);
  }
  
  .workout-svg {
    flex-shrink: 0;
    width: 200px;
    height: 200px;
  }
  
  .workout-svg svg {
    width: 100%;
    height: 100%;
  }
  
  .workout-details {
    flex-grow: 1;
  }
  
  .workout-title {
    margin: 0 0 var(--size-2) 0;
    font-size: var(--font-size-4);
  }
  
  .workout-stats {
    display: flex;
    gap: var(--size-3);
    flex-wrap: wrap;
    margin-top: var(--size-2);
  }
  
  .workout-stat {
    display: flex;
    flex-direction: column;
  }
  
  .workout-stat-label {
    font-size: var(--font-size-0);
    color: var(--text-2);
  }
  
  .workout-stat-value {
    font-size: var(--font-size-2);
    font-weight: bold;
  }
  
  @media (max-width: 768px) {
    .workout-item {
      flex-direction: column;
    }
    
    .workout-svg {
      width: 100%;
      height: 250px;
    }
  }
</style>

<ul class="workout-list">
  {%- for workout in workouts -%}
    {% assign activity = workout.data.activity %}
    {% if activity %}
      <li class="workout-item">
        {% if workout.svgPath %}
          <div class="workout-svg">
            {% include workout.svgPath %}
          </div>
        {% endif %}
        <div class="workout-details">
          <h3 class="workout-title">{{ activity.name }}</h3>
          <time>{{ activity.start_date | date: '%B %d, %Y at %I:%M %p' }}</time>
          
          <div class="workout-stats">
            {% if activity.distance %}
              <div class="workout-stat">
                <span class="workout-stat-label">Distance</span>
                <span class="workout-stat-value">{{ activity.distance | divided_by: 1000.0 | round: 2 }} km</span>
              </div>
            {% endif %}
            
            {% if activity.moving_time %}
              <div class="workout-stat">
                <span class="workout-stat-label">Duration</span>
                <span class="workout-stat-value">{{ activity.moving_time | divided_by: 60 }} min</span>
              </div>
            {% endif %}
            
            {% if activity.average_speed %}
              <div class="workout-stat">
                <span class="workout-stat-label">Avg Speed</span>
                <span class="workout-stat-value">{{ activity.average_speed | times: 3.6 | round: 1 }} km/h</span>
              </div>
            {% endif %}
            
            {% if activity.total_elevation_gain %}
              <div class="workout-stat">
                <span class="workout-stat-label">Elevation Gain</span>
                <span class="workout-stat-value">{{ activity.total_elevation_gain | round }} m</span>
              </div>
            {% endif %}
            
            {% if activity.average_heartrate %}
              <div class="workout-stat">
                <span class="workout-stat-label">Avg Heart Rate</span>
                <span class="workout-stat-value">{{ activity.average_heartrate | round }} bpm</span>
              </div>
            {% endif %}
          </div>
        </div>
      </li>
    {% endif %}
  {%- endfor -%}
</ul>
