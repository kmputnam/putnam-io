---
layout: layouts/base.njk
title: Strategic Initiatives
permalink: /initiatives/index.html
---

<section class="page-heading" aria-labelledby="initiatives-heading">
  <p class="section-label">Strategic Initiatives</p>
  <h1 id="initiatives-heading" class="page-title">Strategic Initiatives</h1>
  <p class="page-intro">Key transformation programs focused on strategy, platform leverage, and resilient execution.</p>
</section>

<section class="section-block initiatives-section" aria-label="Initiatives list">
  <div class="initiatives-list">
    {% for initiative in initiatives %}
      <article class="initiative">
        <div class="initiative-grid">
          <header class="initiative-header">
            <h3>{{ initiative.title }}</h3>
            <p class="initiative-meta">{{ initiative.meta }}</p>
          </header>
          <div class="initiative-body">
            <p class="initiative-scope">{{ initiative.scope }}</p>
            <ul>
              {% for bullet in initiative.bullets %}
                <li>{{ bullet }}</li>
              {% endfor %}
            </ul>
          </div>
        </div>
      </article>
    {% endfor %}
  </div>
</section>
