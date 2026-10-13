# AGENTS.md

## Purpose
This file captures the key context, decisions, and lessons learned while building and refining this site so future work can resume quickly without re-discovery.

## Project Snapshot
- Project: `putnam-io`
- Stack: Astro + Astro content collections + Markdown/JSON content
- Site type: multi-page executive profile
- Output: static files in `dist/`
- Hosting target: Cloudflare Workers (static assets via Wrangler + Workers Builds)

## Current Information Architecture
- `/` Home
- `/initiatives/` Strategic Initiatives
- `/writing/` Writing
- `/direction/` Platform Direction
- `/contact/` Contact

## User Preferences (Important)
- Style should feel professional, restrained, and editorial.
- Keep light/dark auto based on browser preference (`prefers-color-scheme`).
- Do not reintroduce manual dark mode toggle.
- Keep the color palette currently in CSS tokens.
- Keep interactions subtle; avoid flashy effects.
- Keep image treatment supportive to text, not dominant.
- On mobile phone sizes, hero background image should be hidden for readability.

## Data + Content Source of Truth
- Global content/settings: `src/data/site.ts`
- Initiatives content: `src/content/initiatives/*.json`
- Writing content: `src/content/writing/*.md`
- Page and route templates: `src/pages/**/*.astro`
- Collections schema: `src/content.config.ts`

### Current Contact Values
- Email: `kyle@putnam.io`
- LinkedIn: `https://www.linkedin.com/in/kmputnam/`

## Template + Styling Architecture
- Base layout: `src/layouts/BaseLayout.astro`
- Writing post layout: `src/layouts/WritingPostLayout.astro`
- Global CSS: `src/styles/global.css`
- Navigation current-page state:
  - Layout applies `.is-active` based on `Astro.url.pathname`.
  - Exact page links use `aria-current="page"`. Active parent sections use `aria-current="location"`.
  - CSS uses a subtle underline pseudo-element on active nav links.

## Theme Behavior
- No JS theme toggling.
- Light and dark tokens are defined in CSS.
- Dark mode activates only via `@media (prefers-color-scheme: dark)`.

## Hero Image Behavior (Home Page)
- Image metadata in data: `site.headshot.src`
- Original image: `src/assets/headshot.png`
- Astro `getImage()` makes a 1520-pixel WebP image during the build.
- The original PNG is outside `public/` and is not deployed.
- Implementation: image rendered as a background layer (`.hero-bg`) behind hero copy.
- Responsive behavior:
  - Desktop: full figure visible, right-aligned.
  - Tablet: smaller version of same visual treatment.
  - Phone (`max-width: 640px`): image hidden (`display: none`).

## Favicon + Manifest Setup
- Icons directory: `public/assets/icons/`
- Includes:
  - `favicon.svg`
  - `favicon.ico`
  - `favicon-16x16.png`
  - `favicon-32x32.png`
  - `apple-touch-icon.png`
  - `android-chrome-192x192.png`
  - `android-chrome-512x512.png`
  - `safari-pinned-tab.svg`
- Manifest: `public/site.webmanifest`
- Head tags in `BaseLayout.astro` include:
  - SVG icon
  - root `/favicon.ico` fallback
  - PNG favicon sizes
  - root and assets-based Apple touch icon links
  - Safari `mask-icon`
  - `/site.webmanifest`

## Astro Config Notes
File: `astro.config.mjs`

Key settings:
- `output: "static"`
- `trailingSlash: "always"`
- `outDir: "./dist"`
- `site: "https://putnam.io"`

Collections:
- `writing`: Markdown entries with `title`, optional `deck`, required hidden `date`, optional `draft`
- `initiatives`: JSON entries with `title`, `meta`, `scope`, `bullets` (max 3), `order`

## Local Dev Commands
- Use Node.js `24.18.0`, as pinned in `.node-version`.
- Install: `npm ci`
- Type/content check: `npm run check`
- Build: `npm run build`
- Serve/watch: `npm run start`
- Serve via Workers runtime: `npm run start:worker`
- Emergency-only manual deploy: `npm run deploy:manual`
- Browser tests: `npm run test:e2e`
- Public browser tests: `E2E_BASE_URL=https://putnam-io.kylemputnam.workers.dev npm run test:e2e`
- Read `docs/e2e-plan.md` for browser installation, reports, and repeatable evidence.

Notes:
- Dev server port may auto-shift if busy (`8080`, `8081`, etc.).
- `dist` can retain stale assets between iterations; if behavior seems wrong, do a clean rebuild.
- Wrangler local preview state lives in `.wrangler/` and should stay gitignored.

## Cloudflare Workers Deployment
Configuration lives in `wrangler.toml`:
- Worker name: `putnam-io`
- `compatibility_date` pinned for runtime stability
- `[assets].directory = "./dist"` to serve Astro output
- `html_handling = "auto-trailing-slash"` for friendly page routes
- `not_found_handling = "404-page"` for true multi-page 404 behavior
- Production address: `https://putnam-io.kylemputnam.workers.dev`
- The intended canonical domain remains `https://putnam.io`.
- On October 12, 2026, `putnam.io` still served the old WordPress site through Flywheel.
- Do not treat a successful Worker deployment as proof that the canonical domain serves Astro.

### Deploy Pipeline Policy (Important)
- Primary deploy path is Cloudflare Workers Builds from git pushes to `main`.
- Do not add `.github/workflows/*` deploy jobs.
- Do not introduce a second auto-deploy pipeline outside Cloudflare Workers Builds.
- `npm run deploy:manual` is fallback-only.

## Build and Audit Rules
- Keep dependencies and generated files out of Git. Use `package-lock.json` for installation.
- Local Fontsource files supply Inter and JetBrains Mono. Do not restore external Google Fonts requests.
- Keep canonical and social metadata in `BaseLayout.astro`.
- Page templates supply descriptions. Writing descriptions use the article deck.
- The sitemap integration includes published pages. It excludes the custom 404 page.
- `public/robots.txt` identifies the sitemap. `public/_headers` defines response security headers.
- `src/pages/404.astro` supplies the page for unknown addresses.
- Use E2E browser tests through the Cloudflare runtime. Do not add unit tests after implementation.
- Save reports, screenshots, build hashes, and the tested source revision after E2E tests.

## Known Gotchas and Fixes
- `site.webmanifest` 404:
  - Cause: missing root static file.
  - Fix: ensure `public/site.webmanifest` exists and `/site.webmanifest` is referenced in head.

- Safari favicon not showing:
  - Causes: missing root icon fallbacks and/or caching.
  - Fixes:
    - root `/favicon.ico`
    - root `/apple-touch-icon.png`
    - `mask-icon` for pinned tabs
    - clear Safari cache for localhost/domain when testing updates

- Stale image in build output:
  - Cause: old generated assets in `dist`.
  - Fix: clean stale output and rebuild if necessary.

- Worker deploy fails with auth/account error:
  - Cause: Wrangler session missing/expired in local environment.
  - Fix: run `npx wrangler login` again.

- Writing post order confusion:
  - Cause: all entries are date-hidden in UI.
  - Fix: use frontmatter `date` only for sorting and never render it in templates.

## If You Revisit Later (Checklist)
1. Run `npm run check`, `npm run build`, `npm run start`, and `npm run start:worker`.
2. Verify nav active underline on each page.
3. Verify `/contact/` has correct email and LinkedIn.
4. Verify `/writing/` lists posts and each post page keeps the Writing nav item active.
5. Verify favicon in both Chrome and Safari.
6. Verify `/site.webmanifest` returns 200 locally.
7. Verify hero image behavior at desktop/tablet/mobile breakpoints.
