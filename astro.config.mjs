import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://kanishkajha29.github.io",
  integrations: [tailwind()],
});