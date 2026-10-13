import { test as base, expect } from "@playwright/test";

type BrowserEvidence = {
  errors: string[];
  requests: { url: string; resourceType: string }[];
  responses: { url: string; status: number; contentType: string }[];
};

export const test = base.extend<{ browserEvidence: BrowserEvidence; expectedNotFoundPaths: string[] }>({
  expectedNotFoundPaths: [],
  browserEvidence: [async ({ page, baseURL, expectedNotFoundPaths }, use, testInfo) => {
    const evidence: BrowserEvidence = { errors: [], requests: [], responses: [] };
    const isExpectedMissing = (url: string) => {
      try { return expectedNotFoundPaths.includes(new URL(url).pathname); }
      catch { return false; }
    };

    page.on("pageerror", (error) => evidence.errors.push(`Script error: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") {
        if (isExpectedMissing(message.location().url) && /404/.test(message.text())) return;
        evidence.errors.push(`Console error: ${message.text()} at ${message.location().url}`);
      }
    });
    page.on("request", (request) => {
      evidence.requests.push({ url: request.url(), resourceType: request.resourceType() });
      const url = new URL(request.url());
      if (["http:", "https:"].includes(url.protocol) && url.origin !== new URL(baseURL!).origin) {
        evidence.errors.push(`Unexpected external request: ${request.url()}`);
      }
    });
    page.on("requestfailed", (request) => {
      evidence.errors.push(`Failed request: ${request.method()} ${request.url()} ${request.failure()?.errorText}`);
    });
    page.on("response", (response) => {
      evidence.responses.push({
        url: response.url(),
        status: response.status(),
        contentType: response.headers()["content-type"] ?? ""
      });
      if (response.status() >= 400) {
        if (response.status() === 404 && response.request().resourceType() === "document" && isExpectedMissing(response.url())) return;
        evidence.errors.push(`HTTP error: ${response.status()} ${response.url()}`);
      }
    });

    await use(evidence);

    await testInfo.attach("browser-network.json", {
      body: JSON.stringify(evidence, null, 2),
      contentType: "application/json"
    });
    await testInfo.attach("run-identity.json", {
      body: JSON.stringify({ ...testInfo.config.metadata, project: testInfo.project.name, browser: testInfo.project.use.browserName }, null, 2),
      contentType: "application/json"
    });
    expect(evidence.errors, "The browser must have no errors or failed requests").toEqual([]);
  }, { auto: true }]
});

export { expect };
