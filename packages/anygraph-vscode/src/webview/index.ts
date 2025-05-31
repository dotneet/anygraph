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
  private resizeObserver: ResizeObserver | null = null;
  private resizeTimeout: number | null = null;

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

    // Setup responsive behavior
    this.setupResponsiveBehavior();

    // Listen for messages from the extension
    window.addEventListener('message', (event: any) => {
      const message = event.data;
      this.handleMessage(message);
    });

    // Notify extension that webview is ready
    this.vscode.postMessage({ type: 'ready' });
  }

  private setupResponsiveBehavior() {
    if (!this.container) return;

    // Setup ResizeObserver for container size changes
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver((entries) => {
        console.log('ResizeObserver triggered');
        if (this.resizeTimeout) {
          clearTimeout(this.resizeTimeout);
        }
        
        // Debounce resize events to avoid excessive re-renders
        this.resizeTimeout = window.setTimeout(() => {
          this.handleResize();
        }, 150);
      });
      
      this.resizeObserver.observe(this.container);
    }

    // Fallback for browsers without ResizeObserver
    window.addEventListener('resize', () => {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
      
      this.resizeTimeout = window.setTimeout(() => {
        this.handleResize();
      }, 150);
    });
  }

  private handleResize() {
    if (!this.anyGraphInstance || !this.container) return;

    // Calculate new responsive dimensions
    const containerWidth = Math.min(600, Math.max(300, this.container.clientWidth - 300));
    const containerHeight = Math.max(400, this.container.clientHeight - 100);
    const graphWidth = Math.max(300, containerWidth - 200);
    const graphHeight = Math.max(300, containerHeight - 180);

    console.log('Container dimensions:', this.container.clientWidth, this.container.clientHeight);
    console.log('Resizing graph to:', { graphWidth, graphHeight });

    // Update graph dimensions
    try {
      this.anyGraphInstance.updateConfig({
        render: {
          width: graphWidth,
          height: graphHeight,
        }
      });
    } catch (error) {
      console.warn('Error during resize:', error);
    }
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
    if (!this.container) {
      console.error('Container not found');
      return;
    }

    console.log('updateData called with:', { rawText, dataset });

    try {
      // Always recreate the instance to avoid React DOM issues
      if (this.anyGraphInstance) {
        console.log('Destroying existing AnyGraph instance');
        try {
          this.anyGraphInstance.destroy();
        } catch (error) {
          console.warn('Error destroying existing instance:', error);
        }
        this.anyGraphInstance = null;
      }

      // Clear container content
      this.container.innerHTML = '';

      // Calculate responsive dimensions with better logic
      const containerWidth = Math.max(300, this.container.clientWidth - 20);
      const containerHeight = Math.max(400, this.container.clientHeight - 20);
      const graphWidth = Math.max(150, containerWidth - 100);
      const graphHeight = Math.max(150, containerHeight - 100);

      console.log('Container dimensions:', { containerWidth, containerHeight, graphWidth, graphHeight });
      console.log('Creating new AnyGraph instance with dataset:', dataset);

      const defaultConfig: GraphConfig = {
        type: 'quadrant-inverted',
        scale: {
          xMin: 0,
          xMax: 10,
          yMin: 0,
          yMax: 10,
          autoScale: true,
        },
        render: {
          width: graphWidth,
          height: graphHeight,
          backgroundColor: '#ffffff',
          gridColor: '#e0e0e0',
          axisColor: '#333333',
          showGrid: true,
          showAxes: true,
        },
        series: [
          {
            color: '#2196f3',
            label: 'Series 1',
            visible: true,
          },
        ],
      };

      console.log('Calling initAnyGraph with config:', defaultConfig);
      this.anyGraphInstance = initAnyGraph(
        this.container,
        dataset,
        defaultConfig
      );
      console.log('AnyGraph instance created:', this.anyGraphInstance);

      // Save state
      this.vscode.setState({
        rawText,
        dataset,
        hasData: true,
      });

      console.log('Data update completed successfully');

    } catch (error) {
      console.error('Error in updateData:', error);
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

  // Cleanup method for proper resource management
  public destroy() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.anyGraphInstance) {
      try {
        this.anyGraphInstance.destroy();
      } catch (error) {
        console.warn('Error destroying AnyGraph instance:', error);
      }
      this.anyGraphInstance = null;
    }
  }
}

// Initialize when script loads
const webViewManagerInstance = new WebViewManager();

// Export for testing
if (typeof global !== 'undefined') {
  // @ts-ignore
  global.webViewManagerInstance = webViewManagerInstance;
}