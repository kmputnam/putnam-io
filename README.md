# putnam-io

Multi-page executive profile website built with [Eleventy](https://www.11ty.dev/), Nunjucks templates, and Markdown content.

## Tech stack

- Eleventy (latest stable installed via npm)
- Nunjucks layout templates
- Markdown pages (`src/index.md`, `src/initiatives.md`, `src/writing.md`, `src/direction.md`, `src/contact.md`)
- JSON data for reusable site and initiative content
- CSS-only automatic light/dark mode using `prefers-color-scheme`
- Cloudflare Workers static asset hosting via Wrangler

## Project structure

- `src/index.md`: Home page
- `src/initiatives.md`: Strategic Initiatives page
- `src/writing.md`: Writing index page
- `src/writing/*.md`: Individual writing posts
- `src/direction.md`: Platform Direction page
- `src/contact.md`: Contact page
- `src/_includes/layouts/base.njk`: Shared layout with global header/nav
- `src/_includes/layouts/writing-post.njk`: Writing post layout (date-free presentation)
- `src/_data/site.json`: Name/title/positioning/contact/nav
- `src/_data/initiatives.json`: Strategic initiatives list
- `src/assets/css/styles.css`: Global styles and theme tokens
- `src/assets/images/headshot.png`: Optional homepage portrait image
- `src/assets/icons/*`: Favicon and app-icon assets (svg, ico, png variants)
- `src/site.webmanifest`: Web app manifest
- `_site/`: Static output directory
- `wrangler.toml`: Workers deployment/runtime config

## Local development

```bash
npm install
npm run start
```

To run the site through Cloudflare Workers locally:

```bash
npm run start:worker
```

## Production build

```bash
npm run build
```

Generated site output is written to `_site/`.

## Cloudflare Workers deployment

1. Authenticate Wrangler (first time only):

```bash
npx wrangler login
```

2. Build + deploy:

```bash
npm run deploy
```

### Runtime/deploy notes

- Worker name: `putnam-io` (configured in `wrangler.toml`)
- Static assets directory: `_site`
- Node.js version: `20` or newer
- For CI/CD (for example GitHub Actions), run:
  - `npm ci`
  - `npm run build`
  - `npx wrangler deploy`
