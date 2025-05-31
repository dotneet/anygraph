import React from 'react';
import { createRoot } from 'react-dom/client';
import { AnyGraph } from './components/AnyGraph';
import { Dataset, GraphConfig, GraphType } from './types';

// Export all types and components for external use
export * from './types';
export * from './components/AnyGraph';
export * from './data/parser';
export * from './rendering/CanvasRenderer';

// Default configuration
const defaultConfig: GraphConfig = {
  type: 'quadrant-inverted' as GraphType,
  scale: {
    xMin: 0,
    xMax: 10,
    yMin: 0,
    yMax: 10,
    autoScale: true,
  },
  render: {
    width: 800,
    height: 600,
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

// Sample dataset for development
const sampleDataset: Dataset = {
  dataType: 'points',
  points: [[{x: 1, y: 2}, {x: 3, y: 4}, {x: 5, y: 6}]],
};

// Main initialization function for standalone usage
export function initAnyGraph(
  container: HTMLElement,
  dataset?: Dataset,
  config?: Partial<GraphConfig>
) {
  const root = createRoot(container);
  const finalConfig = { ...defaultConfig, ...config };
  const finalDataset = dataset || sampleDataset;

  root.render(
    <AnyGraph
      dataset={finalDataset}
      config={finalConfig}
      onConfigChange={(newConfig) => {
        console.log('Config changed:', newConfig);
      }}
      onDataEdit={(rawText) => {
        console.log('Data edited:', rawText);
      }}
    />
  );

  return {
    updateDataset: (newDataset: Dataset) => {
      root.render(
        <AnyGraph
          dataset={newDataset}
          config={finalConfig}
          onConfigChange={(newConfig) => {
            console.log('Config changed:', newConfig);
          }}
          onDataEdit={(rawText) => {
            console.log('Data edited:', rawText);
          }}
        />
      );
    },
    updateConfig: (newConfig: Partial<GraphConfig>) => {
      const updatedConfig = { ...finalConfig, ...newConfig };
      root.render(
        <AnyGraph
          dataset={finalDataset}
          config={updatedConfig}
          onConfigChange={(configChange) => {
            console.log('Config changed:', configChange);
          }}
          onDataEdit={(rawText) => {
            console.log('Data edited:', rawText);
          }}
        />
      );
    },
    destroy: () => {
      root.unmount();
    },
  };
}

// Auto-initialize if running in browser environment
if (typeof window !== 'undefined' && document.getElementById('anygraph-root')) {
  const container = document.getElementById('anygraph-root');
  if (container) {
    initAnyGraph(container);
  }
}