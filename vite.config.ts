import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // GitHub Pages base path (will be /codoncanvas/ when deployed)
  base: process.env.NODE_ENV === 'production' ? '/codoncanvas/' : '/',

  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        demos: resolve(__dirname, 'demos.html'),
        mutation: resolve(__dirname, 'mutation-demo.html'),
        timeline: resolve(__dirname, 'timeline-demo.html'),
        evolution: resolve(__dirname, 'evolution-demo.html'),
        population: resolve(__dirname, 'population-genetics-demo.html'),
        genetic: resolve(__dirname, 'genetic-algorithm-demo.html'),
        tutorial: resolve(__dirname, 'tutorial.html'),
      }
    }
  },

  test: {
    globals: true,
    environment: 'jsdom'
  }
});
