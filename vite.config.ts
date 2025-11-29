import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages base path (will be /codoncanvas/ when deployed)
  // When running build with --base flag, this config is overridden
  base: "/",

  // Public directory for static assets
  publicDir: "public",

  // Plugins
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "html-csp-injection",
      transformIndexHtml(html, ctx) {
        // Only inject CSP during build (when server is not defined)
        if (ctx.server) return html;

        // Production CSP - stricter than dev (no unsafe-eval)
        const csp = [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'", // unsafe-inline might be needed for some inline scripts, but unsafe-eval is removed
          "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for dynamic styles
          "img-src 'self' data: https:",
          "font-src 'self' data:",
          "connect-src 'self' https://api.qrserver.com",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; ");

        return html.replace(
          "</head>",
          `<meta http-equiv="Content-Security-Policy" content="${csp}">\n  </head>`,
        );
      },
    },
  ],

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

  // SECURITY: Content Security Policy headers (Dev Server only)
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
