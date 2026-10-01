// Safe global environment check for Canva SDK
if (typeof window !== 'undefined') {
  const win = window as any;
  if (!win.canva_sdk) {
    win.canva_sdk = {};
  }
  if (!win.canva_sdk.intents) {
    win.canva_sdk.intents = {
      v1: {
        design: {
          prepareDesignEditor: () => {},
        },
      },
    };
  }
}

import appStyles from './styles/app.css?inline';
import { prepareDesignEditor } from '@canva/intents/design';
import designEditor, { render } from './intents/design_editor';

// Inject CSS styles directly into document head so app.js is 100% self-contained
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-app-styles', 'canva-crossword');
  styleEl.textContent = appStyles;
  document.head.appendChild(styleEl);
}

// Register Design Editor intent with Canva
prepareDesignEditor(designEditor);

// Standalone fallback: if not inside Canva's intent runner, render directly
const isInsideCanva = typeof window !== 'undefined' && (window as any).__canva__ !== undefined;
if (!isInsideCanva) {
  render();
}
