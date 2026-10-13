# putnam-io

Kyle Putnam's professional profile and contact site uses Astro static output and Cloudflare Workers.

## Development

Use Node.js `24.18.0`, as pinned in `.node-version`. Astro requires Node.js `22.12.0` or later. The content checker supports TypeScript 6. TypeScript 7 is outside its supported peer range.

```sh
npm ci
npm run start
```

The site uses typed Markdown and JSON collections. It has no client application code or server functions. The browser preference controls the light and dark themes.

## Source

- `src/data/site.ts`: Identity, contact information, and navigation.
- `src/content/initiatives/`: Work summaries.
- `src/content/writing/`: Essays, with hidden dates for sorting and a draft filter.
- `src/pages/`: Page templates and the custom 404 page.
- `src/layouts/`: Shared metadata and article structure.
- `src/styles/global.css`: Layout, palette, and responsive rules.
- `src/assets/headshot.png`: Original portrait. Astro makes a smaller WebP during the build.
- `public/`: Icons, manifest, robots file, and security headers.
- `astro.config.mjs`: Static output, canonical origin, and sitemap integration.
- `wrangler.toml`: Cloudflare static asset configuration.

Fontsource supplies local Inter and JetBrains Mono files. The portrait stays hidden on phone screens. The build does not publish its original PNG.

## Build and E2E tests

E2E tests operate the built site through browsers and the local Cloudflare runtime. They do not use isolated components or unit tests.

```sh
npm run check
npm run build
npx wrangler deploy --dry-run
npx playwright install chromium webkit
npm run test:e2e
```

The browser suite starts the local runtime. It covers all published pages, article links, contact links, keyboard focus, metadata, assets, response headers, and unknown addresses. It uses desktop, tablet, and phone screens with both themes. It also uses WebKit.

The suite saves screenshots, accessibility results, network results, and build hashes. The default report is `playwright-report/index.html`. Read [the E2E plan](docs/e2e-plan.md) for the saved evidence and public test procedure.

For public tests, build from the deployed source first. Set the public target with an environment variable:

```sh
E2E_BASE_URL=https://putnam-io.kylemputnam.workers.dev npm run test:e2e
```

Public asset hashes must match the local build. A successful page request alone does not establish that the deployment contains the current source.

## Deployment

Cloudflare Workers Builds is the primary deployment path. It builds and deploys pushes to `main`. Keep this existing path. Do not add a second deployment pipeline or GitHub Actions deployment job.

The build command is `npm run build`. The deployment command is `npx wrangler deploy`. The output directory is `dist/`. The pinned compatibility date remains unchanged.

The current Cloudflare address is <https://putnam-io.kylemputnam.workers.dev>. The intended canonical origin is `https://putnam.io`. On October 12, 2026, that domain still served the older WordPress site through Flywheel. A Worker release does not change the domain connection.

If Workers Builds is unavailable, the emergency command is:

```sh
npm run deploy:manual
```

Read [the audit](docs/audit-2026-10-12.md) for release results. Read [the design plan](docs/design-review-plan.md) for the next design review.
