import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

// Relative base so the static build works under any path (e.g. the
// project's GitHub Pages URL https://kjanat.github.io/codoncanvas/).
export default defineConfig({
  base: "./",
  plugins: [svelte()],
  build: {
    target: "es2022",
    sourcemap: true,
  },
});
