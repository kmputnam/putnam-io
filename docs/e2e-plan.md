# E2E test plan

An end-to-end (E2E) test uses the built site through a browser and an HTTP server.
These tests use the Cloudflare Workers runtime for local checks.
The same tests can use a public address through `E2E_BASE_URL`.
The tests do not send email, submit forms, or change external data.

## Failure cases

- A build or Workers startup fails after a dependency change.
- A main route, published post, internal link, fragment, or static asset returns an error.
- An unknown route returns the home page with HTTP status 200.
- A page has no title, description, canonical address, language, or viewport declaration.
- A navigation link shows the wrong current section.
- A contact link has the wrong destination or permits access to its source window.
- A browser reports a script error, failed request, or unexpected HTTP error.
- The browser requests an external resource or downloads the portrait on a fresh phone visit.
- A response omits the security headers from `public/_headers`.
- A phone shows the portrait, or a larger screen hides it.
- The portrait does not load, extends incorrectly, or blocks the text.
- A page extends beyond the screen width or a navigation link is outside the visible area.
- Text at 200% loses letters, exceeds the screen width, or hides a navigation link.
- A theme ignores the browser preference or the page adds a manual theme control.
- Keyboard input cannot get to the content or a link has no visible focus mark.
- An accessibility rule detects a serious problem, including text contrast or missing link names.
- The writing index omits a published post, shows a draft, or exposes a date that the design hides.
- A result has no saved report, page image, or route record.

## Method

1. Select the Node version from `.node-version` in the project directory.
2. Install the package dependencies from the lockfile with `npm ci`.
3. Install the test browsers with `npx playwright install chromium webkit`.
4. Use `npm run test:e2e` from the project directory.
5. Make sure that the command builds the site and starts the local Workers runtime.
6. Examine the HTML report at `playwright-report/index.html`.
7. Examine the JSON report and page images in `test-results/`.

The browser matrix contains desktop, tablet, and phone sizes in Chromium.
Each size uses light and dark preferences.
A desktop WebKit test covers the Safari browser engine.
Each browser opens all main pages and all published posts.
Each browser saves a full-page image for every route.
Each page record contains navigation timing and resource size values.
The portrait test also saves images at the CSS boundary widths.

The route test examines titles, descriptions, canonical addresses, navigation, contact links, and writing links.
The accessibility test uses axe rules for WCAG 2.2 AA.
These automated rules do not replace a review with assistive technology.
The keyboard test examines the skip link and visible focus marks.
On macOS, the WebKit test uses Option-Tab to select links.
Apple documents this behavior in its [Safari keyboard guide](https://support.apple.com/guide/safari/keyboard-shortcuts-and-gestures-cpsh003/mac).
The size test sets the root font to 200% at each CSS boundary width.
This method examines text resizing through rem units, but does not replace a manual browser zoom review.
The asset test examines built files, document references, manifest icons, internal links, and page fragments.
It compares each asset with the current build through a SHA-256 digest, which is an exact byte fingerprint.
The missing-page test requires HTTP status 404 and saves the response.
Each browser saves a 404 page image and accessibility result.

## Public site check

Use `E2E_BASE_URL=https://putnam-io.kylemputnam.workers.dev npm run test:e2e` for the public Astro site.
The `putnam.io` domain currently serves the separate WordPress site.
The canonical metadata keeps `https://putnam.io` as the intended domain.
Use a Cloudflare preview address in place of the Workers address when necessary.
This command does not start a local server.
It uses the route and asset list from the current source and build output.
Build the current revision before this command.
The report records the target address and browser details.
Use `E2E_OUTPUT_DIR` and `E2E_REPORT_DIR` to select separate directories for public results.
For example, use `E2E_OUTPUT_DIR=test-results/live E2E_REPORT_DIR=playwright-report-live E2E_BASE_URL=https://putnam-io.kylemputnam.workers.dev npm run test:e2e`.

## Saved evidence

Playwright saves an HTML report and a JSON result file for each command.
The report records the Git commit, worktree state, Node version, and lockfile SHA-256 digest.
The asset record contains SHA-256 digests for each build file.
Each route has a page image, an accessibility result, and a route record.
The asset test saves HTTP status values and content types.
The browser test saves page errors and failed requests.
On failure, Playwright also saves a screenshot, a trace, and a video.
Copy each report directory before a second command to preserve the first result.
Keep the source revision, lockfile, command, and report together for a repeated test.
