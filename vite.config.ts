import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = import.meta.dirname;

export default defineConfig({
  // GitHub Pages base path - set by deploy.yml from actions/configure-pages
  base: process.env.VITE_BASE_PATH ? `${process.env.VITE_BASE_PATH}/` : "/",

  publicDir: "public",

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
  },
});
