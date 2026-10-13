import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  output: "static",
  trailingSlash: "always",
  outDir: "./dist",
  site: "https://putnam.io",
  integrations: [sitemap()]
});
