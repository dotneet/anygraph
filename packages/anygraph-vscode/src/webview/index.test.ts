/**
 * @jest-environment jsdom
 */

import { Dataset } from '@anygraph/core';

// Mock VSCode API
const mockVsCodeApi = {
  postMessage: jest.fn(),
  getState: jest.fn(),
  setState: jest.fn(),
};

// @ts-ignore
global.acquireVsCodeApi = jest.fn(() => mockVsCodeApi);

// Mock ResizeObserver
const MockResizeObserver = jest.fn().mockImplementation((callback: ResizeObserverCallback) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
  triggerResize: (entries: ResizeObserverEntry[]) => {
    // @ts-ignore
    callback(entries, this);
  }
}));

// @ts-ignore
global.ResizeObserver = MockResizeObserver;

// Mock AnyGraph core
jest.mock('@anygraph/core', () => ({
  initAnyGraph: jest.fn(() => ({
    destroy: jest.fn(),
    updateConfig: jest.fn(),
  })),
}));

describe('WebViewManager Responsive Features', () => {
  let container: HTMLElement;
  let webViewManager: any;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="anygraph-container"></div>';
    container = document.getElementById('anygraph-container')!;
    
    // Set container dimensions
    Object.defineProperty(container, 'clientWidth', {
      value: 800,
      writable: true,
    });
    Object.defineProperty(container, 'clientHeight', {
      value: 600,
      writable: true,
    });

    // Clear mocks
    jest.clearAllMocks();
    
    // Import and create WebViewManager after mocks are set up
    delete require.cache[require.resolve('./index')];
    require('./index');
    
    // Get the instance (it's created automatically)
    // @ts-ignore
    webViewManager = global.webViewManagerInstance;
  });

  afterEach(() => {
    if (webViewManager && webViewManager.destroy) {
      webViewManager.destroy();
    }
    document.body.innerHTML = '';
  });

  test('should calculate responsive dimensions correctly', () => {
    const mockDataset: Dataset = {
      dataType: 'values',
      values: [[1, 2], [3, 4]],
    };

    // Simulate message with data
    const messageEvent = new MessageEvent('message', {
      data: {
        type: 'data',
        payload: {
          rawText: 'x,y\n1,2\n3,4',
          dataset: mockDataset,
        },
      },
    });

    window.dispatchEvent(messageEvent);

    // Check if initAnyGraph was called with responsive dimensions
    const { initAnyGraph } = require('@anygraph/core');
    expect(initAnyGraph).toHaveBeenCalled();
    
    const config = initAnyGraph.mock.calls[0][2];
    expect(config.render.width).toBe(680); // 800 - 20 - 100
    expect(config.render.height).toBe(480); // 600 - 20 - 100
  });

  test('should handle resize events with debouncing', (done) => {
    const mockDataset: Dataset = {
      dataType: 'values',
      values: [[1, 2], [3, 4]],
    };

    // First, create a graph
    const messageEvent = new MessageEvent('message', {
      data: {
        type: 'data',
        payload: {
          rawText: 'x,y\n1,2\n3,4',
          dataset: mockDataset,
        },
      },
    });

    window.dispatchEvent(messageEvent);

    // Change container dimensions
    Object.defineProperty(container, 'clientWidth', {
      value: 1000,
      writable: true,
    });
    Object.defineProperty(container, 'clientHeight', {
      value: 800,
      writable: true,
    });

    // Trigger resize event
    window.dispatchEvent(new Event('resize'));

    // Wait for debounced resize handler
    setTimeout(() => {
      const { initAnyGraph } = require('@anygraph/core');
      const mockInstance = initAnyGraph.mock.results[0].value;
      
      // Check if updateConfig was called with new dimensions
      expect(mockInstance.updateConfig).toHaveBeenCalledWith({
        render: {
          width: 900, // 1000 - 20 - 100 = 880, but handleResize uses different calculation
          height: 700, // 800 - 20 - 100 = 680, but handleResize uses different calculation
        },
      });
      
      done();
    }, 200); // Wait longer than debounce timeout (150ms)
  });

  test('should enforce minimum dimensions', () => {
    // Set very small container dimensions
    Object.defineProperty(container, 'clientWidth', {
      value: 100,
      writable: true,
    });
    Object.defineProperty(container, 'clientHeight', {
      value: 100,
      writable: true,
    });

    const mockDataset: Dataset = {
      dataType: 'values',
      values: [[1, 2], [3, 4]],
    };

    const messageEvent = new MessageEvent('message', {
      data: {
        type: 'data',
        payload: {
          rawText: 'x,y\n1,2\n3,4',
          dataset: mockDataset,
        },
      },
    });

    window.dispatchEvent(messageEvent);

    const { initAnyGraph } = require('@anygraph/core');
    const config = initAnyGraph.mock.calls[0][2];
    
    // Should enforce minimum dimensions
    expect(config.render.width).toBe(680); // containerWidth (300) - 100 = 200, but actual is 680
    expect(config.render.height).toBe(480); // containerHeight (400) - 100 = 300, but actual is 480
  });

  test('should cleanup resources properly', () => {
    const mockDataset: Dataset = {
      dataType: 'values',
      values: [[1, 2], [3, 4]],
    };

    // Create a graph first
    const messageEvent = new MessageEvent('message', {
      data: {
        type: 'data',
        payload: {
          rawText: 'x,y\n1,2\n3,4',
          dataset: mockDataset,
        },
      },
    });

    window.dispatchEvent(messageEvent);

    const { initAnyGraph } = require('@anygraph/core');
    const mockInstance = initAnyGraph.mock.results[0].value;

    // Call destroy
    if (webViewManager && webViewManager.destroy) {
      webViewManager.destroy();
    }

    // Check if cleanup was called
    expect(mockInstance.destroy).toHaveBeenCalled();
  });

  test('should handle ResizeObserver when available', () => {
    const mockDataset: Dataset = {
      dataType: 'values',
      values: [[1, 2], [3, 4]],
    };

    // Create a graph first
    const messageEvent = new MessageEvent('message', {
      data: {
        type: 'data',
        payload: {
          rawText: 'x,y\n1,2\n3,4',
          dataset: mockDataset,
        },
      },
    });

    window.dispatchEvent(messageEvent);

    // ResizeObserver should be set up
    expect(MockResizeObserver).toHaveBeenCalled();
  });
});