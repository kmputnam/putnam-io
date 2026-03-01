---
layout: layouts/base.njk
title: Writing
permalink: /writing/index.html
---

<section class="page-heading" aria-labelledby="writing-heading">
  <p class="section-label">Writing</p>
  <h1 id="writing-heading" class="page-title">Writing</h1>
  <p class="page-intro">
    Short essays on product strategy, platform decisions, and execution in complex environments.
  </p>
</section>

<section class="section-block writing-index" aria-label="Writing list">
  {% set posts = collections.writing | reverse %}
  {% if posts.length %}
    <div class="writing-list">
      {% for post in posts %}
        <article class="writing-item">
          <h2 class="writing-title"><a href="{{ post.url }}">{{ post.data.title }}</a></h2>
          {% if post.data.deck %}
            <p class="writing-deck">{{ post.data.deck }}</p>
          {% endif %}
        </article>
      {% endfor %}
    </div>
  {% else %}
    <p class="page-intro">Posts coming soon.</p>
  {% endif %}
</section>
