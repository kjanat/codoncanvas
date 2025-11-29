import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages base path (will be /codoncanvas/ when deployed)
  base: `${process.env.VITE_BASE_PATH || ""}/`,

  // Public directory for static assets
  publicDir: "public",

  // Plugins
  plugins: [react(), tailwindcss()],

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
      "@/components": resolve(__dirname, "src/components"),
      "@/hooks": resolve(__dirname, "src/hooks"),
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
  },
});
