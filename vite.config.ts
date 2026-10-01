import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 8080,
    host: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: 'src/index.tsx',
      output: {
        entryFileNames: 'app.js',
        inlineDynamicImports: true,
        banner: `
if (typeof globalThis !== 'undefined') {
  if (!globalThis.canva_sdk) globalThis.canva_sdk = {};
  if (!globalThis.canva_sdk.intents) {
    globalThis.canva_sdk.intents = {
      v1: {
        design: {
          prepareDesignEditor: function() {},
        },
      },
    };
  }
}
`,
      },
    },
  },
});
