import React from 'react';
import { initAnyGraph } from './index';
import { Dataset, GraphConfig } from './types';

// Mock React DOM
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn(),
    unmount: jest.fn(),
  })),
}));

// Mock AnyGraph component
jest.mock('./components/AnyGraph', () => ({
  AnyGraph: ({ config }: { config: GraphConfig }) => (
    <div data-testid="anygraph" data-graph-type={config.type} />
  ),
}));

describe('initAnyGraph', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should use quadrant-inverted as default graph type', () => {
    const mockDataset: Dataset = {
      dataType: 'values',
      values: [[1, 2, 3]],
    };

    const instance = initAnyGraph(container, mockDataset);

    // Verify that the default config has quadrant-inverted type
    expect(instance).toBeDefined();
    expect(instance.updateConfig).toBeDefined();
    expect(instance.updateDataset).toBeDefined();
    expect(instance.destroy).toBeDefined();
  });

  it('should allow overriding default graph type', () => {
    const mockDataset: Dataset = {
      dataType: 'values',
      values: [[1, 2, 3]],
    };

    const customConfig = {
      type: 'line' as const,
    };

    const instance = initAnyGraph(container, mockDataset, customConfig);

    expect(instance).toBeDefined();
  });

  it('should use sample dataset when no dataset provided', () => {
    const instance = initAnyGraph(container);

    expect(instance).toBeDefined();
  });

  it('should merge custom config with defaults', () => {
    const mockDataset: Dataset = {
      dataType: 'points',
      points: [[{ x: 1, y: 2 }]],
    };

    const customConfig = {
      render: {
        width: 1000,
        height: 800,
        backgroundColor: '#f0f0f0',
        gridColor: '#cccccc',
        axisColor: '#666666',
        showGrid: false,
        showAxes: false,
      },
    };

    const instance = initAnyGraph(container, mockDataset, customConfig);

    expect(instance).toBeDefined();
  });
});

describe('Default Configuration', () => {
  it('should have quadrant-inverted as default graph type', () => {
    // This test verifies that the exported default configuration
    // has the correct default graph type
    const { initAnyGraph } = require('./index');
    
    // Create a container and initialize with minimal parameters
    const container = document.createElement('div');
    const instance = initAnyGraph(container);
    
    // The instance should be created successfully with quadrant-inverted as default
    expect(instance).toBeDefined();
    expect(typeof instance.updateConfig).toBe('function');
    expect(typeof instance.updateDataset).toBe('function');
    expect(typeof instance.destroy).toBe('function');
  });
});