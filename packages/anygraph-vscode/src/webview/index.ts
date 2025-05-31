// WebView script for VSCode extension
// This script runs in the webview context and handles communication with the extension

import { Dataset, initAnyGraph, GraphConfig } from '@anygraph/core';

declare const acquireVsCodeApi: () => {
  postMessage: (message: any) => void;
  getState: () => any;
  setState: (state: any) => void;
};

class WebViewManager {
  private vscode: ReturnType<typeof acquireVsCodeApi>;
  private anyGraphInstance: any = null;
  private container: HTMLElement | null = null;

  constructor() {
    this.vscode = acquireVsCodeApi();
    this.init();
  }

  private init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupWebView());
    } else {
      this.setupWebView();
    }
  }

  private setupWebView() {
    this.container = document.getElementById('anygraph-container');
    
    if (!this.container) {
      this.showError('Container element not found');
      return;
    }

    // Listen for messages from the extension
    window.addEventListener('message', event => {
      const message = event.data;
      this.handleMessage(message);
    });

    // Notify extension that webview is ready
    this.vscode.postMessage({ type: 'ready' });
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'data':
        this.updateData(message.payload.rawText, message.payload.dataset);
        break;
      case 'config':
        this.updateConfig(message.payload.config);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private updateData(rawText: string, dataset: Dataset) {
    if (!this.container) return;

    try {
      // Clear placeholder content
      this.container.innerHTML = '';

      // Create or update AnyGraph instance
      if (this.anyGraphInstance) {
        this.anyGraphInstance.updateDataset(dataset);
      } else {
        const defaultConfig: GraphConfig = {
          type: 'line',
          scale: {
            xMin: 0,
            xMax: 10,
            yMin: 0,
            yMax: 10,
            autoScale: true,
          },
          render: {
            width: Math.min(800, this.container.clientWidth - 20),
            height: Math.min(600, this.container.clientHeight - 20),
            backgroundColor: 'var(--vscode-editor-background)',
            gridColor: 'var(--vscode-panel-border)',
            axisColor: 'var(--vscode-foreground)',
            showGrid: true,
            showAxes: true,
          },
          series: [
            {
              color: 'var(--vscode-charts-blue)',
              label: 'Series 1',
              visible: true,
            },
          ],
        };

        this.anyGraphInstance = initAnyGraph(
          this.container,
          dataset,
          defaultConfig
        );
      }

      // Save state
      this.vscode.setState({
        rawText,
        dataset,
        hasData: true,
      });

    } catch (error) {
      this.showError(`Failed to render graph: ${error}`);
    }
  }

  private updateConfig(config: Partial<GraphConfig>) {
    if (this.anyGraphInstance) {
      this.anyGraphInstance.updateConfig(config);
    }
  }

  private showError(message: string) {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="error">
        <h3>Error</h3>
        <p>${message}</p>
      </div>
    `;

    this.vscode.postMessage({
      type: 'error',
      message: message,
    });
  }

  private showPlaceholder() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="placeholder">
        <h3>AnyGraph</h3>
        <p>Select data in your editor and use:</p>
        <p><span class="shortcut">Ctrl+Shift+G</span> (or <span class="shortcut">Cmd+Shift+G</span> on Mac)</p>
        <p>Or right-click and select "Visualize Selection"</p>
      </div>
    `;
  }
}

// Initialize when script loads
new WebViewManager();