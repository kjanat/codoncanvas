import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { buildConfig } from "./build.config";

const root: string = import.meta.dirname;

export default defineConfig({
  // GitHub Pages base path - set by deploy.yml from actions/configure-pages
  base: buildConfig.base,
  publicDir: "public",

  server: {
    host: "0.0.0.0",
    port: buildConfig.server.port,
    allowedHosts: ["*"],
    strictPort: true,
  },

  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
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

  build: {
    outDir: "dist",
    sourcemap: !buildConfig.isCI,
  },

  css: {
    devSourcemap: true,
  },
});
