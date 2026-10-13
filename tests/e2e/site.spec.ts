import AxeBuilder from "@axe-core/playwright";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import type { Page, TestInfo } from "@playwright/test";
import { test, expect } from "./fixtures";

const root = resolve(process.cwd());
const canonicalOrigin = process.env.E2E_CANONICAL_ORIGIN ?? "https://putnam.io";

function filesIn(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  });
}

const posts = filesIn(join(root, "src/content/writing"))
  .filter((path) => path.endsWith(".md"))
  .map((path) => {
    const frontmatter = readFileSync(path, "utf8").split("---")[1] ?? "";
    const slug = relative(join(root, "src/content/writing"), path).split(sep).join("/").replace(/\.md$/, "");
    return {
      path: `/writing/${slug}/`,
      title: (frontmatter.match(/^title:\s*(.+)$/m)?.[1] ?? "").replace(/^['"]|['"]$/g, ""),
      date: new Date(frontmatter.match(/^date:\s*(.+)$/m)?.[1] ?? ""),
      draft: /^draft:\s*true\s*$/m.test(frontmatter)
    };
  });

const publishedPosts = posts.filter((post) => !post.draft).sort((a, b) => b.date.valueOf() - a.date.valueOf());
const routes = [
  { path: "/", title: "Home", heading: "Kyle Putnam", section: "/" },
  { path: "/initiatives/", title: "Strategic Initiatives", heading: "Strategic Initiatives", section: "/initiatives/" },
  { path: "/writing/", title: "Writing", heading: "Writing", section: "/writing/" },
  { path: "/direction/", title: "Platform Direction", heading: "Platform Direction", section: "/direction/" },
  { path: "/contact/", title: "Contact", heading: "Contact", section: "/contact/" },
  ...publishedPosts.map((post) => ({ path: post.path, title: post.title, heading: post.title, section: "/writing/" }))
];

function routeName(path: string): string {
  return path === "/" ? "home" : path.replace(/^\/|\/$/g, "").replaceAll("/", "--");
}

async function openPage(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: "networkidle" });
  expect(response?.status(), `${path} must return HTTP status 200`).toBe(200);
  await page.evaluate(() => document.fonts.ready);
  return response;
}

async function savePageEvidence(page: Page, testInfo: TestInfo, name: string) {
  const screenshot = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  await testInfo.attach(`${name}.png`, { path: screenshot, contentType: "image/png" });

  const metrics = await page.evaluate(() => ({
    url: location.href,
    viewport: { width: innerWidth, height: innerHeight, deviceScaleFactor: devicePixelRatio },
    colorScheme: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    navigation: performance.getEntriesByType("navigation").map((entry) => entry.toJSON()),
    resources: performance.getEntriesByType("resource").map((entry) => entry.toJSON())
  }));
  await testInfo.attach(`${name}-metrics.json`, { body: JSON.stringify(metrics, null, 2), contentType: "application/json" });
}

test("all routes show the expected content, metadata, navigation, and accessible layout", async ({ page }, testInfo) => {
  const routeEvidence: object[] = [];

  for (const route of routes) {
    const response = await openPage(page, route.path);
    expect.soft(response?.headers()["x-content-type-options"]).toBe("nosniff");
    expect.soft(response?.headers()["x-frame-options"]).toBe("DENY");
    expect.soft(response?.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect.soft(response?.headers()["permissions-policy"]).toBe("camera=(), microphone=(), geolocation=()");
    const contentSecurityPolicy = response?.headers()["content-security-policy"] ?? "";
    for (const directive of ["default-src 'self'", "script-src 'none'", "font-src 'self'", "object-src 'none'", "frame-ancestors 'none'", "form-action 'none'"]) {
      expect.soft(contentSecurityPolicy).toContain(directive);
    }
    await expect(page).toHaveTitle(`${route.title} | Kyle Putnam`);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute("content", /width=device-width/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{20,}/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", /.{20,}/);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", new URL(route.path, canonicalOrigin).href);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new URL(route.path, canonicalOrigin).href);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(route.heading);
    await expect(page.getByRole("main")).toBeVisible();

    const currentLink = page.locator(".site-header a[aria-current]");
    await expect(currentLink).toHaveCount(1);
    await expect(currentLink).toHaveAttribute("href", route.section);
    await expect(currentLink).toHaveAttribute("aria-current", route.path === route.section ? "page" : "location");

    const layout = await page.evaluate(() => ({
      screenWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      mainWidth: document.querySelector("main")?.getBoundingClientRect().width,
      backgroundColor: getComputedStyle(document.body).backgroundColor,
      textColor: getComputedStyle(document.body).color
    }));
    expect.soft(layout.documentWidth, `${route.path} must fit the screen width`).toBeLessThanOrEqual(layout.screenWidth);
    expect.soft(layout.mainWidth).toBeGreaterThan(0);
    expect.soft(layout.backgroundColor).toBe(testInfo.project.use.colorScheme === "dark" ? "rgb(11, 18, 32)" : "rgb(248, 249, 251)");
    expect.soft(layout.textColor).toBe(testInfo.project.use.colorScheme === "dark" ? "rgb(229, 231, 235)" : "rgb(15, 23, 42)");

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
      .analyze();
    await testInfo.attach(`${routeName(route.path)}-accessibility.json`, {
      body: JSON.stringify(accessibility, null, 2), contentType: "application/json"
    });
    expect.soft(accessibility.violations, `${route.path} must have no automated accessibility violations`).toEqual([]);
    routeEvidence.push({ ...route, layout, accessibilityRulesPassed: accessibility.passes.length, responseHeaders: response?.headers(), htmlSha256: createHash("sha256").update(await response!.body()).digest("hex") });
    await savePageEvidence(page, testInfo, routeName(route.path));
  }

  await testInfo.attach("routes.json", { body: JSON.stringify(routeEvidence, null, 2), contentType: "application/json" });
});

test("navigation, writing links, contact links, and keyboard focus work through the browser", async ({ page, browserName }, testInfo) => {
  const nextLinkKey = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
  await openPage(page, "/");
  await page.keyboard.press(nextLinkKey);
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await page.keyboard.press(nextLinkKey);
  const firstContentLink = page.getByRole("main").getByRole("link").first();
  await expect(firstContentLink).toBeFocused();
  const focus = await firstContentLink.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
  });
  expect(focus.outlineStyle).not.toBe("none");
  expect(parseFloat(focus.outlineWidth)).toBeGreaterThanOrEqual(2);

  await page.locator(".header-home").focus();
  for (const label of ["Initiatives", "Writing", "Direction", "Contact"]) {
    await page.keyboard.press(nextLinkKey);
    const navigationLink = page.getByRole("navigation").getByRole("link", { name: label, exact: true });
    await expect(navigationLink).toBeFocused();
  }
  await page.keyboard.press("Enter");
  await page.waitForURL("**/contact/");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("link", { name: "kyle@putnam.io" })).toHaveAttribute("href", "mailto:kyle@putnam.io");
  const linkedin = page.getByRole("link", { name: "LinkedIn", exact: true });
  await expect(linkedin).toHaveAttribute("href", "https://www.linkedin.com/in/kmputnam/");
  await expect(linkedin).toHaveAttribute("target", "_blank");
  expect((await linkedin.getAttribute("rel"))?.split(/\s+/)).toEqual(expect.arrayContaining(["noopener", "noreferrer"]));

  await page.getByRole("navigation").getByRole("link", { name: "Writing", exact: true }).click();
  await page.waitForURL("**/writing/");
  await page.waitForLoadState("networkidle");
  const writingLinks = page.locator(".writing-list .writing-title a");
  await expect(writingLinks).toHaveCount(publishedPosts.length);
  expect(await writingLinks.allTextContents()).toEqual(publishedPosts.map((post) => post.title));
  for (const draft of posts.filter((post) => post.draft)) {
    await expect(page.locator(`a[href="${draft.path}"]`)).toHaveCount(0);
  }
  for (const post of publishedPosts) {
    await page.getByRole("main").getByRole("link", { name: post.title, exact: true }).click();
    await page.waitForURL(`**${post.path}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(post.title);
    await expect(page.locator(".article-body")).not.toBeEmpty();
    await expect(page.locator("main time")).toHaveCount(0);
    await page.getByRole("navigation").getByRole("link", { name: "Writing", exact: true }).click();
    await page.waitForURL("**/writing/");
    await page.waitForLoadState("networkidle");
  }
  await savePageEvidence(page, testInfo, "writing-journey");
});

test("the portrait follows the screen size and the browser controls the theme", async ({ page, browserEvidence }, testInfo) => {
  await openPage(page, "/");
  const hero = page.locator(".hero-bg");
  await expect(hero).toHaveAttribute("aria-hidden", "true");
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  const background = await hero.evaluate((element) => getComputedStyle(element).backgroundImage);
  const imageUrl = background.match(/url\(["']?(.*?)["']?\)/)?.[1];
  expect(imageUrl).toBeDefined();
  if (viewport!.width <= 640) {
    await expect(hero).toBeHidden();
    expect(browserEvidence.requests.some((request) => request.url === imageUrl), "A fresh phone visit must not request the portrait").toBe(false);
  } else {
    await expect(hero).toBeVisible();
    const image = await hero.evaluate((element) => ({
      background: getComputedStyle(element).backgroundImage,
      pointerEvents: getComputedStyle(element).pointerEvents,
      width: element.getBoundingClientRect().width,
      opacity: Number(getComputedStyle(element).opacity)
    }));
    expect(image.background).toMatch(/url\(/);
    expect(image.pointerEvents).toBe("none");
    expect(image.width).toBeGreaterThan(250);
    expect(image.opacity).toBeGreaterThan(0);
    expect(image.opacity).toBeLessThan(0.5);
    expect(browserEvidence.responses.some((response) => response.url === imageUrl && response.status === 200 && response.contentType.startsWith("image/"))).toBe(true);
  }
  await expect(page.getByRole("button", { name: /theme|dark mode|light mode/i })).toHaveCount(0);

  if (testInfo.project.name === "desktop-light") {
    const boundaries = [];
    for (const width of [320, 640, 641, 980, 981, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.waitForLoadState("networkidle");
      if (width <= 640) await expect(hero).toBeHidden();
      else await expect(hero).toBeVisible();
      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(documentWidth, `The page must fit at ${width}px`).toBeLessThanOrEqual(width);
      for (const navigationLink of await page.locator(".site-header a").all()) {
        await expect.soft(navigationLink, `Every navigation link must be fully visible at ${width}px`).toBeInViewport({ ratio: 1 });
      }
      boundaries.push({ width, documentWidth, hero: await hero.boundingBox() });
      await savePageEvidence(page, testInfo, `home-${width}px`);

      await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
      const enlargedText = await page.evaluate(() => ({
        screenWidth: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        text: [...document.querySelectorAll("main h1, main p")].map((element) => ({
          text: element.textContent,
          width: element.clientWidth,
          contentWidth: element.scrollWidth
        }))
      }));
      expect.soft(enlargedText.documentWidth, `The page must fit at ${width}px with 200% text`).toBeLessThanOrEqual(width);
      for (const element of enlargedText.text) {
        expect.soft(element.contentWidth, `Text must not lose letters at ${width}px with 200% text: ${element.text}`).toBeLessThanOrEqual(element.width + 1);
      }
      for (const navigationLink of await page.locator(".site-header a").all()) {
        await expect.soft(navigationLink, `Every navigation link must be fully visible at ${width}px with 200% text`).toBeInViewport({ ratio: 1 });
      }
      await savePageEvidence(page, testInfo, `home-${width}px-text-200`);
      await testInfo.attach(`text-resize-${width}px.json`, { body: JSON.stringify(enlargedText, null, 2), contentType: "application/json" });
      await page.evaluate(() => { document.documentElement.style.removeProperty("font-size"); });
    }
    await testInfo.attach("responsive-boundaries.json", { body: JSON.stringify(boundaries, null, 2), contentType: "application/json" });
  }
});

test("all built assets and internal destinations are available, and unknown pages return 404", async ({ page, request, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-light", "One browser performs the shared HTTP and build checks.");
  const buildDirectory = join(root, "dist");
  const buildIdentity = filesIn(buildDirectory).map((path) => ({
    path: relative(buildDirectory, path).split(sep).join("/"),
    bytes: readFileSync(path).byteLength,
    sha256: createHash("sha256").update(readFileSync(path)).digest("hex")
  }));
  await testInfo.attach("build-identity.json", { body: JSON.stringify(buildIdentity, null, 2), contentType: "application/json" });
  const assetFiles = filesIn(buildDirectory).filter((path) => !path.endsWith(".html") && !["_headers", "_redirects", ".assetsignore"].includes(relative(buildDirectory, path)));
  expect(assetFiles.length, "The current site must be built before E2E tests").toBeGreaterThan(0);
  const assets = [];

  for (const path of assetFiles) {
    const assetPath = `/${relative(buildDirectory, path).split(sep).join("/")}`;
    const response = await request.get(assetPath);
    const expectedHash = createHash("sha256").update(readFileSync(path)).digest("hex");
    const actualHash = createHash("sha256").update(await response.body()).digest("hex");
    assets.push({ path: assetPath, status: response.status(), contentType: response.headers()["content-type"], expectedHash, actualHash });
    expect.soft(response.status(), `${assetPath} must be available`).toBe(200);
    expect.soft(actualHash, `${assetPath} must match the current build`).toBe(expectedHash);
  }
  await testInfo.attach("built-assets.json", { body: JSON.stringify(assets, null, 2), contentType: "application/json" });

  const internalDestinations = new Map<string, Set<string>>();
  const referencedAssets = new Set<string>();
  for (const route of routes) {
    await openPage(page, route.path);
    const links = await page.locator("a[href]").evaluateAll((elements) => elements.map((element) => (element as HTMLAnchorElement).href));
    for (const link of links) {
      const url = new URL(link);
      if (url.origin !== new URL(baseURL!).origin) continue;
      const key = `${url.pathname}${url.search}`;
      const fragments = internalDestinations.get(key) ?? new Set<string>();
      if (url.hash) fragments.add(decodeURIComponent(url.hash.slice(1)));
      internalDestinations.set(key, fragments);
    }
    const references = await page.locator("link[href], img[src], script[src], source[src]").evaluateAll((elements) => elements.map((element) => element.getAttribute("href") ?? element.getAttribute("src") ?? ""));
    for (const reference of references) {
      const url = new URL(reference, page.url());
      if (url.origin === new URL(baseURL!).origin) referencedAssets.add(`${url.pathname}${url.search}`);
    }
  }
  const destinations = [];
  for (const [path, fragments] of internalDestinations) {
    const response = await request.get(path);
    expect.soft(response.status(), `${path} must be available`).toBe(200);
    if (fragments.size) {
      await openPage(page, path);
      for (const fragment of fragments) {
        expect.soft(await page.evaluate((id) => Boolean(document.getElementById(id)), fragment), `${path}#${fragment} must exist`).toBe(true);
      }
    }
    destinations.push({ path, status: response.status(), fragments: [...fragments] });
  }
  for (const path of referencedAssets) {
    const response = await request.get(path);
    expect.soft(response.status(), `${path} must be available`).toBe(200);
  }
  const manifestResponse = await request.get("/site.webmanifest");
  expect(manifestResponse.status()).toBe(200);
  const manifest = await manifestResponse.json();
  expect(manifest.name).toBe("Kyle Putnam");
  for (const icon of manifest.icons) {
    expect((await request.get(icon.src)).status(), `${icon.src} must be available`).toBe(200);
  }
  await testInfo.attach("internal-destinations.json", { body: JSON.stringify({ destinations, references: [...referencedAssets], manifest }, null, 2), contentType: "application/json" });

  const sitemapIndex = await request.get("/sitemap-index.xml");
  expect(sitemapIndex.status()).toBe(200);
  const sitemapFiles = [...(await sitemapIndex.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
  expect(sitemapFiles.length).toBeGreaterThan(0);
  const sitemapUrls = [];
  for (const sitemapPath of sitemapFiles) {
    const sitemap = await request.get(sitemapPath);
    expect(sitemap.status()).toBe(200);
    sitemapUrls.push(...[...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]));
  }
  expect(sitemapUrls).toEqual(expect.arrayContaining(routes.map((route) => new URL(route.path, canonicalOrigin).href)));
  expect(sitemapUrls).not.toContain(new URL("/404/", canonicalOrigin).href);
  for (const draft of posts.filter((post) => post.draft)) {
    expect(sitemapUrls).not.toContain(new URL(draft.path, canonicalOrigin).href);
    expect((await request.get(draft.path)).status()).toBe(404);
  }
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain(`Sitemap: ${new URL("/sitemap-index.xml", canonicalOrigin).href}`);
  await testInfo.attach("sitemap.json", { body: JSON.stringify({ files: sitemapFiles, urls: sitemapUrls }, null, 2), contentType: "application/json" });

  const slashRedirect = await request.get("/contact", { maxRedirects: 0 });
  expect([301, 302, 307, 308]).toContain(slashRedirect.status());
  expect(new URL(slashRedirect.headers().location, baseURL).pathname).toBe("/contact/");

  const missingPath = "/this-page-does-not-exist-e2e/";
  const missing = await request.get(missingPath);
  expect(missing.status()).toBe(404);
  const missingBody = await missing.text();
  expect(missingBody).toMatch(/404|not found/i);
  expect(missingBody).not.toContain("Executive profile overview");
  await testInfo.attach("missing-page.html", { body: missingBody, contentType: "text/html" });
  await testInfo.attach("missing-page-response.json", { body: JSON.stringify({ url: missing.url(), status: missing.status(), headers: missing.headers() }, null, 2), contentType: "application/json" });
});

test.describe("unknown page", () => {
  test.use({ expectedNotFoundPaths: ["/this-page-does-not-exist-e2e/"] });

  test("a browser shows the 404 page and can return home", async ({ page }, testInfo) => {
    const response = await page.goto("/this-page-does-not-exist-e2e/", { waitUntil: "networkidle" });
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle("Page not found | Kyle Putnam");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator(".site-header a[aria-current]")).toHaveCount(0);
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
      .analyze();
    await testInfo.attach("not-found-accessibility.json", { body: JSON.stringify(accessibility, null, 2), contentType: "application/json" });
    expect.soft(accessibility.violations).toEqual([]);
    await savePageEvidence(page, testInfo, "not-found");
    await page.getByRole("link", { name: "Go to the home page", exact: true }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kyle Putnam");
  });
});
