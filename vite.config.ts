import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'CodonCanvas',
      fileName: (format) => `codoncanvas.${format}.js`
    }
  },
  test: {
    globals: true,
    environment: 'node'
  }
});
