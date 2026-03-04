import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  trailingSlash: "always",
  outDir: "./dist",
  site: "https://putnam.io"
});
