import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // GitHub Pages base path (will be /codoncanvas/ when deployed)
  base: process.env.NODE_ENV === "production" ? "/codoncanvas/" : "/",

  // SECURITY: Content Security Policy headers
  server: {
    headers: {
      "Content-Security-Policy":
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " + // unsafe-inline needed for Vite HMR in dev
        "style-src 'self' 'unsafe-inline'; " + // unsafe-inline for inline styles
        "img-src 'self' data: https:; " + // data: for canvas toDataURL, https: for external images
        "font-src 'self' data:; " + // data: for embedded fonts
        "connect-src 'self' https://api.qrserver.com; " + // Allow QR code API
        "frame-ancestors 'none'; " + // Prevent clickjacking
        "base-uri 'self'; " +
        "form-action 'self';",
    },
  },

  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        demos: resolve(__dirname, "demos.html"),
        mutation: resolve(__dirname, "mutation-demo.html"),
        timeline: resolve(__dirname, "timeline-demo.html"),
        evolution: resolve(__dirname, "evolution-demo.html"),
        population: resolve(__dirname, "population-genetics-demo.html"),
        genetic: resolve(__dirname, "genetic-algorithm-demo.html"),
        tutorial: resolve(__dirname, "tutorial.html"),
        gallery: resolve(__dirname, "gallery.html"),
      },
    },
  },

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    pool: "forks",
  },
});
