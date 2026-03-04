# putnam-io

Multi-page executive profile website built with [Astro](https://astro.build/), typed content collections, and Cloudflare Workers static asset hosting.

## Tech stack

- Astro (static output)
- Astro layouts/pages (`.astro`) + Markdown content entries
- Typed content collections (`src/content.config.ts`)
- CSS-only automatic light/dark mode using `prefers-color-scheme`
- Cloudflare Workers static assets via Wrangler

## Project structure

- `src/pages/index.astro`: Home page
- `src/pages/initiatives/index.astro`: Strategic Initiatives page
- `src/pages/writing/index.astro`: Writing index page
- `src/pages/writing/[slug].astro`: Writing detail route
- `src/pages/direction/index.astro`: Platform Direction page
- `src/pages/contact/index.astro`: Contact page
- `src/layouts/BaseLayout.astro`: Shared layout with global header/nav
- `src/layouts/WritingPostLayout.astro`: Writing post layout (date-free presentation)
- `src/content/writing/*.md`: Writing entries (sorted by hidden `date`)
- `src/content/initiatives/*.json`: Initiative entries (sorted by `order`)
- `src/content.config.ts`: Collection schema/type definitions
- `src/data/site.ts`: Typed site metadata
- `src/styles/global.css`: Global styles and theme tokens
- `public/assets/icons/*`: Favicon/app icon assets
- `public/assets/images/headshot.png`: Homepage portrait image
- `public/site.webmanifest`: Web manifest
- `public/favicon.ico`, `public/apple-touch-icon.png`, `public/safari-pinned-tab.svg`: root icon fallbacks
- `dist/`: Astro output directory
- `wrangler.toml`: Workers deployment/runtime config

## Local development

```bash
npm install
npm run start
```

Run through Cloudflare Workers runtime locally:

```bash
npm run start:worker
```

## Validation

```bash
npm run check
npm run build
```

Generated output is written to `dist/`.

## Cloudflare Workers Builds (Primary Deploy Path)

This repo is configured for **Git-based auto deploys through Cloudflare Workers Builds**.

- Production branch: `main`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Preview deploy command: `npx wrangler versions upload` (default)

### Guardrails

- Do not add GitHub Actions deploy workflows.
- Do not create a second CI deploy path outside Cloudflare Workers Builds.
- Standard release flow: push to `main`.

## Emergency Manual Deploy (Fallback Only)

Use only if Cloudflare Workers Builds is unavailable:

```bash
npm run deploy:manual
```
