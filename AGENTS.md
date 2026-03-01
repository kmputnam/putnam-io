# AGENTS.md

## Purpose
This file captures the key context, decisions, and lessons learned while building and refining this site so future work can resume quickly without re-discovery.

## Project Snapshot
- Project: `putnam-io`
- Stack: Eleventy + Nunjucks + Markdown + JSON data
- Site type: multi-page executive profile
- Output: static files in `_site/`
- Hosting target: Cloudflare Workers (static assets via Wrangler)

## Current Information Architecture
- `/` Home
- `/initiatives/` Strategic Initiatives
- `/operating-model/` Operating Model
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
- Global content/settings: `src/_data/site.json`
- Initiatives content: `src/_data/initiatives.json`
- Page content: Markdown files under `src/*.md`

### Current Contact Values
- Email: `kyle@putnam.io`
- LinkedIn: `https://www.linkedin.com/in/kmputnam/`

## Template + Styling Architecture
- Base layout: `src/_includes/layouts/base.njk`
- Global CSS: `src/assets/css/styles.css`
- Navigation current-page state:
  - Layout applies `.is-active` and `aria-current="page"` based on `page.url`.
  - CSS uses a subtle underline pseudo-element on active nav links.

## Theme Behavior
- No JS theme toggling.
- Light and dark tokens are defined in CSS.
- Dark mode activates only via `@media (prefers-color-scheme: dark)`.

## Hero Image Behavior (Home Page)
- Asset path in data: `site.headshot.src`
- Current active image: `src/assets/images/headshot.png`
- Implementation: image rendered as a background layer (`.hero-bg`) behind hero copy.
- Responsive behavior:
  - Desktop: full figure visible, right-aligned.
  - Tablet: smaller version of same visual treatment.
  - Phone (`max-width: 640px`): image hidden (`display: none`).

## Favicon + Manifest Setup
- Icons directory: `src/assets/icons/`
- Includes:
  - `favicon.svg`
  - `favicon.ico`
  - `favicon-16x16.png`
  - `favicon-32x32.png`
  - `apple-touch-icon.png`
  - `android-chrome-192x192.png`
  - `android-chrome-512x512.png`
  - `safari-pinned-tab.svg`
- Manifest: `src/site.webmanifest`
- Head tags in `base.njk` include:
  - SVG icon
  - root `/favicon.ico` fallback
  - PNG favicon sizes
  - root and assets-based Apple touch icon links
  - Safari `mask-icon`
  - `/site.webmanifest`

## Eleventy Config Notes
File: `.eleventy.js`

Passthrough copy must include:
- `src/assets/css` -> `assets/css`
- `src/assets/icons` -> `assets/icons`
- `src/assets/images` -> `assets/images`
- `src/site.webmanifest` -> `site.webmanifest`
- `src/assets/icons/favicon.ico` -> `favicon.ico`
- `src/assets/icons/apple-touch-icon.png` -> `apple-touch-icon.png`
- `src/assets/icons/safari-pinned-tab.svg` -> `safari-pinned-tab.svg`

These root-level passthroughs were added specifically to fix local/browser 404 and Safari favicon behavior.

## Local Dev Commands
- Install: `npm install`
- Build: `npm run build`
- Serve/watch: `npm run start`
- Serve via Workers runtime: `npm run start:worker`
- Deploy Worker: `npm run deploy`

Notes:
- Dev server port may auto-shift if busy (`8080`, `8081`, etc.).
- `_site` can retain stale assets between iterations; if behavior seems wrong, do a clean rebuild.
- Wrangler local preview state lives in `.wrangler/` and should stay gitignored.

## Cloudflare Workers Deployment
Configuration lives in `wrangler.toml`:
- Worker name: `putnam-io`
- `compatibility_date` pinned for runtime stability
- `[assets].directory = "./_site"` to serve Eleventy output
- `html_handling = "auto-trailing-slash"` for friendly page routes
- `not_found_handling = "404-page"` for true multi-page 404 behavior

Deploy workflow:
1. `npx wrangler login` (first-time local auth)
2. `npm run deploy`

CI workflow baseline:
1. `npm ci`
2. `npm run build`
3. `npx wrangler deploy`

## Known Gotchas and Fixes
- `site.webmanifest` 404:
  - Cause: not copied to root output.
  - Fix: passthrough `src/site.webmanifest` to `site.webmanifest`.

- Safari favicon not showing:
  - Causes: missing root icon fallbacks and/or caching.
  - Fixes:
    - root `/favicon.ico`
    - root `/apple-touch-icon.png`
    - `mask-icon` for pinned tabs
    - clear Safari cache for localhost/domain when testing updates

- Stale image in build output:
  - Cause: old generated assets in `_site`.
  - Fix: clean stale output and rebuild if necessary.

- Worker deploy fails with auth/account error:
  - Cause: Wrangler session missing/expired in local environment.
  - Fix: run `npx wrangler login` again.

## If You Revisit Later (Checklist)
1. Run `npm run build`, `npm run start`, and `npm run start:worker`.
2. Verify nav active underline on each page.
3. Verify `/contact/` has correct email and LinkedIn.
4. Verify favicon in both Chrome and Safari.
5. Verify `/site.webmanifest` returns 200 locally.
6. Verify hero image behavior at desktop/tablet/mobile breakpoints.
