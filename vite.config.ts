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
    rollupOptions: {
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
          prepareDesignEditor: function(impl) {
            if (globalThis.__canva_intent_registered__) return;
            globalThis.__canva_intent_registered__ = true;
            if (typeof impl === 'object' && impl && typeof impl.render === 'function') {
              try { impl.render(); } catch(e) { console.error('Intent render error:', e); }
            }
          }
        }
      }
    };
  }
}
`,
      },
    },
  },
});
