---
layout: layouts/base.njk
title: Contact
permalink: /contact/index.html
---

<section class="page-heading" aria-labelledby="contact-heading">
  <p class="section-label">Contact</p>
  <h1 id="contact-heading" class="page-title">Contact</h1>
  <p class="page-intro">{{ site.contactSentence }}</p>
</section>

<section class="section-block" aria-label="Contact links">
  <p class="contact-line">
    <a href="mailto:{{ site.contact.email }}">{{ site.contact.email }}</a>
    <span class="divider-dot" aria-hidden="true">•</span>
    <a href="{{ site.contact.linkedin }}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
  </p>
</section>
