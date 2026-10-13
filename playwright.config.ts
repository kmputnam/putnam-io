import { defineConfig } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const publicTarget = process.env.E2E_BASE_URL;
const localTarget = "http://127.0.0.1:8787";
const outputDirectory = process.env.E2E_OUTPUT_DIR ?? "test-results";
const reportDirectory = process.env.E2E_REPORT_DIR ?? "playwright-report";
const sourceRevision = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const sourceDirty = execFileSync("git", ["status", "--porcelain", "--untracked-files=normal"], { encoding: "utf8" }).trim().length > 0;
const lockfileSha256 = createHash("sha256").update(readFileSync("package-lock.json")).digest("hex");

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 3,
  outputDir: outputDirectory,
  reporter: [
    ["list"],
    ["html", { outputFolder: reportDirectory, open: "never" }],
    ["json", { outputFile: join(outputDirectory, "results.json") }]
  ],
  metadata: {
    target: publicTarget ?? localTarget,
    canonicalOrigin: process.env.E2E_CANONICAL_ORIGIN ?? "https://putnam.io",
    sourceRevision,
    sourceDirty,
    lockfileSha256,
    nodeVersion: process.version,
    startedAt: new Date().toISOString(),
    outputDirectory,
    reportDirectory
  },
  use: {
    baseURL: publicTarget ?? localTarget,
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    ...["light", "dark"].flatMap((colorScheme) => [
      {
        name: `desktop-${colorScheme}`,
        use: { browserName: "chromium" as const, viewport: { width: 1440, height: 1000 }, colorScheme: colorScheme as "light" | "dark" }
      },
      {
        name: `tablet-${colorScheme}`,
        use: { browserName: "chromium" as const, viewport: { width: 820, height: 1180 }, colorScheme: colorScheme as "light" | "dark", hasTouch: true }
      },
      {
        name: `phone-${colorScheme}`,
        use: { browserName: "chromium" as const, viewport: { width: 390, height: 844 }, colorScheme: colorScheme as "light" | "dark", isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
      }
    ]),
    {
      name: "safari-desktop",
      use: { browserName: "webkit", viewport: { width: 1440, height: 1000 }, colorScheme: "light" }
    }
  ],
  webServer: publicTarget ? undefined : {
    command: "npm run build && npx wrangler dev --ip 127.0.0.1 --port 8787 --local",
    url: localTarget,
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe"
  }
});
