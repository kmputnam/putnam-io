---
layout: layouts/base.njk
title: Home
permalink: /
---

<section class="hero hero-home" aria-label="Executive profile overview">
  <div class="hero-bg" aria-hidden="true" style="background-image: url('{{ site.headshot.src }}');"></div>
  <div class="hero-copy">
    <h1>{{ site.name }}</h1>
    <p class="title-line">{{ site.title }}</p>
    <p class="lead">{{ site.positioningLine }}</p>
  </div>
</section>

<section class="section-block" aria-labelledby="overview-label">
  <p id="overview-label" class="section-label">Overview</p>
  <p class="page-intro">Explore the core areas of work and operating philosophy.</p>
  <ul class="page-links">
    <li><a href="/initiatives/">Strategic Initiatives</a></li>
    <li><a href="/operating-model/">Operating Model</a></li>
    <li><a href="/direction/">Platform Direction</a></li>
    <li><a href="/contact/">Contact</a></li>
  </ul>
</section>
