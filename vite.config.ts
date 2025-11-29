import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = import.meta.dirname;

// Content Security Policy for static GH Pages hosting
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export default defineConfig({
  // GitHub Pages base path - set by deploy.yml from actions/configure-pages
  base: process.env.VITE_BASE_PATH ? `${process.env.VITE_BASE_PATH}/` : "/",

  publicDir: "public",

  plugins: [
    react(),
    tailwindcss(),
    {
      name: "html-csp-injection",
      transformIndexHtml(html, ctx) {
        if (ctx.server) return html;
        return html.replace(
          "</head>",
          `<meta http-equiv="Content-Security-Policy" content="${CSP}">\n  </head>`,
        );
      },
    },
  ],

  resolve: {
    alias: {
      "@": `${root}/src`,
      "@/core": `${root}/src/core`,
      "@/genetics": `${root}/src/genetics`,
      "@/analysis": `${root}/src/analysis`,
      "@/education": `${root}/src/education`,
      "@/exporters": `${root}/src/exporters`,
      "@/ui": `${root}/src/ui`,
      "@/demos": `${root}/src/demos`,
      "@/data": `${root}/src/data`,
      "@/types": `${root}/src/types`,
      "@/utils": `${root}/src/utils`,
      "@/playground": `${root}/src/playground`,
      "@/pages": `${root}/src/pages`,
      "@/components": `${root}/src/components`,
      "@/hooks": `${root}/src/hooks`,
    },
  },

  server: {
    headers: { "Content-Security-Policy": CSP },
  },

  build: {
    outDir: "dist",
  },
});
