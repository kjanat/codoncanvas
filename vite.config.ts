import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages base path (will be /codoncanvas/ when deployed)
  base: process.env.NODE_ENV === "production" ? "/codoncanvas/" : "/",

  // Public directory for static assets
  publicDir: "public",

  // Path aliases matching tsconfig.json
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@/core": resolve(__dirname, "src/core"),
      "@/genetics": resolve(__dirname, "src/genetics"),
      "@/analysis": resolve(__dirname, "src/analysis"),
      "@/education": resolve(__dirname, "src/education"),
      "@/exporters": resolve(__dirname, "src/exporters"),
      "@/ui": resolve(__dirname, "src/ui"),
      "@/demos": resolve(__dirname, "src/demos"),
      "@/data": resolve(__dirname, "src/data"),
      "@/types": resolve(__dirname, "src/types"),
      "@/utils": resolve(__dirname, "src/utils"),
      "@/playground": resolve(__dirname, "src/playground"),
      "@/pages": resolve(__dirname, "src/pages"),
    },
  },

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
        // Main pages
        main: resolve(__dirname, "public/pages/index.html"),
        gallery: resolve(__dirname, "public/pages/gallery.html"),
        tutorial: resolve(__dirname, "public/pages/tutorial.html"),
        demos: resolve(__dirname, "public/pages/demos.html"),
        // Demo pages
        mutation: resolve(__dirname, "public/pages/demos/mutation.html"),
        timeline: resolve(__dirname, "public/pages/demos/timeline.html"),
        evolution: resolve(__dirname, "public/pages/demos/evolution.html"),
        population: resolve(
          __dirname,
          "public/pages/demos/population-genetics.html",
        ),
        genetic: resolve(
          __dirname,
          "public/pages/demos/genetic-algorithm.html",
        ),
        achievements: resolve(
          __dirname,
          "public/pages/demos/achievements.html",
        ),
        assessment: resolve(__dirname, "public/pages/demos/assessment.html"),
        // Dashboard pages
        research: resolve(__dirname, "public/pages/dashboards/research.html"),
        teacher: resolve(__dirname, "public/pages/dashboards/teacher.html"),
        learningPaths: resolve(
          __dirname,
          "public/pages/dashboards/learning-paths.html",
        ),
      },
    },
  },
});
