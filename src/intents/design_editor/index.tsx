import type { DesignEditorIntent } from '@canva/intents/design';
import React, { Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppUiProvider } from '@canva/app-ui-kit';
import uiKitStyles from '@canva/app-ui-kit/styles.ltr.css?inline';
import appStyles from '../../styles/app.css?inline';
import { App } from '../../App';

// Global error boundary to ensure the screen is never blank
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App Error Caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '24px',
            fontFamily: 'system-ui, sans-serif',
            color: '#991b1b',
            background: '#fee2e2',
            borderRadius: '8px',
            margin: '20px',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
            Something went wrong
          </h2>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              fontSize: '12px',
              background: '#ffffff',
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid #fecaca',
            }}
          >
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export async function render(): Promise<void> {
  // Inject all styles into document head only when Canva invokes render()
  if (typeof document !== 'undefined') {
    if (!document.querySelector('style[data-app-styles="canva-crossword"]')) {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-app-styles', 'canva-crossword');
      styleEl.textContent = `${uiKitStyles}\n${appStyles}`;
      document.head.appendChild(styleEl);
    }
  }

  let container = document.getElementById('root');
  if (!container && typeof document !== 'undefined') {
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
  }

  if (!container) {
    throw new Error("Unable to find element with id of 'root'");
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <AppUiProvider>
        <RootErrorBoundary>
          <App />
        </RootErrorBoundary>
      </AppUiProvider>
    </React.StrictMode>
  );
}

const designEditor: DesignEditorIntent = { render };
export default designEditor;
