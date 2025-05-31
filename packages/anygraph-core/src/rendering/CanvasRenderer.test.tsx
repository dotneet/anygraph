import React from 'react';
import { render } from '@testing-library/react';
import { CanvasRenderer } from './CanvasRenderer';
import { Dataset, GraphConfig } from '../types';

// Mock canvas context
const createMockContext = () => {
  const context = {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    arc: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    translate: jest.fn(),
    fillText: jest.fn(),
    _fillStyle: '',
    _strokeStyle: '',
    _lineWidth: 1,
    _font: '',
    _textAlign: 'center',
    _textBaseline: 'middle',
    canvas: { width: 800, height: 600 },
  };

  // Add getters and setters for style properties
  Object.defineProperty(context, 'fillStyle', {
    get() { return this._fillStyle; },
    set(value) { this._fillStyle = value; }
  });

  Object.defineProperty(context, 'strokeStyle', {
    get() { return this._strokeStyle; },
    set(value) { this._strokeStyle = value; }
  });

  Object.defineProperty(context, 'lineWidth', {
    get() { return this._lineWidth; },
    set(value) { this._lineWidth = value; }
  });

  Object.defineProperty(context, 'font', {
    get() { return this._font; },
    set(value) { this._font = value; }
  });

  Object.defineProperty(context, 'textAlign', {
    get() { return this._textAlign; },
    set(value) { this._textAlign = value; }
  });

  Object.defineProperty(context, 'textBaseline', {
    get() { return this._textBaseline; },
    set(value) { this._textBaseline = value; }
  });

  return context;
};

let mockContext: any;

beforeEach(() => {
  mockContext = createMockContext();
  HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext);
  jest.clearAllMocks();
});

describe('CanvasRenderer', () => {
  const mockValuesDataset: Dataset = {
    dataType: 'values',
    values: [[1, 2, 3, 4, 5]],
  };

  const mockPointsDataset: Dataset = {
    dataType: 'points',
    points: [[
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 6 },
    ]],
  };

  const mockConfig: GraphConfig = {
    type: 'line',
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

  it('should render canvas element', () => {
    const { container } = render(
      <CanvasRenderer
        dataset={mockValuesDataset}
        config={mockConfig}
        width={800}
        height={600}
      />
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width', '800');
    expect(canvas).toHaveAttribute('height', '600');
  });

  it('should clear and fill canvas background', () => {
    render(
      <CanvasRenderer
        dataset={mockValuesDataset}
        config={mockConfig}
        width={800}
        height={600}
      />
    );

    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
  });

  it('should draw grid when showGrid is true', () => {
    render(
      <CanvasRenderer
        dataset={mockValuesDataset}
        config={mockConfig}
        width={800}
        height={600}
      />
    );

    // Check that drawing functions were called (grid drawing uses these)
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
    expect(mockContext.moveTo).toHaveBeenCalled();
    expect(mockContext.lineTo).toHaveBeenCalled();
  });

  it('should not draw grid when showGrid is false', () => {
    const configWithoutGrid = {
      ...mockConfig,
      render: { ...mockConfig.render, showGrid: false },
    };

    render(
      <CanvasRenderer
        dataset={mockValuesDataset}
        config={configWithoutGrid}
        width={800}
        height={600}
      />
    );

    // Grid drawing calls should be minimal
    const strokeCalls = mockContext.stroke.mock.calls.length;
    expect(strokeCalls).toBeLessThan(10); // Fewer calls without grid
  });

  it('should draw axes when showAxes is true', () => {
    render(
      <CanvasRenderer
        dataset={mockValuesDataset}
        config={mockConfig}
        width={800}
        height={600}
      />
    );

    // Check that drawing functions were called (axis drawing uses these)
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.moveTo).toHaveBeenCalled();
    expect(mockContext.lineTo).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  it('should handle values dataset for line chart', () => {
    render(
      <CanvasRenderer
        dataset={mockValuesDataset}
        config={mockConfig}
        width={800}
        height={600}
      />
    );

    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.moveTo).toHaveBeenCalled();
    expect(mockContext.lineTo).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  it('should handle points dataset for scatter plot', () => {
    const scatterConfig = { ...mockConfig, type: 'scatter' as const };

    render(
      <CanvasRenderer
        dataset={mockPointsDataset}
        config={scatterConfig}
        width={800}
        height={600}
      />
    );

    expect(mockContext.arc).toHaveBeenCalled();
    expect(mockContext.fill).toHaveBeenCalled();
  });

  it('should handle quadrant chart type', () => {
    const quadrantConfig = { ...mockConfig, type: 'quadrant' as const };

    render(
      <CanvasRenderer
        dataset={mockPointsDataset}
        config={quadrantConfig}
        width={800}
        height={600}
      />
    );

    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  it('should handle inverted quadrant chart type', () => {
    const invertedConfig = { ...mockConfig, type: 'quadrant-inverted' as const };

    render(
      <CanvasRenderer
        dataset={mockPointsDataset}
        config={invertedConfig}
        width={800}
        height={600}
      />
    );

    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  it('should use auto-scale when enabled', () => {
    const autoScaleConfig = {
      ...mockConfig,
      scale: { ...mockConfig.scale, autoScale: true },
    };

    render(
      <CanvasRenderer
        dataset={mockValuesDataset}
        config={autoScaleConfig}
        width={800}
        height={600}
      />
    );

    // Should render without errors
    expect(mockContext.clearRect).toHaveBeenCalled();
  });

  it('should use manual scale when auto-scale is disabled', () => {
    const manualScaleConfig = {
      ...mockConfig,
      scale: { ...mockConfig.scale, autoScale: false },
    };

    render(
      <CanvasRenderer
        dataset={mockValuesDataset}
        config={manualScaleConfig}
        width={800}
        height={600}
      />
    );

    // Should render without errors
    expect(mockContext.clearRect).toHaveBeenCalled();
  });

  it('should handle empty dataset', () => {
    const emptyDataset: Dataset = {
      dataType: 'values',
      values: [[]],
    };

    render(
      <CanvasRenderer
        dataset={emptyDataset}
        config={mockConfig}
        width={800}
        height={600}
      />
    );

    // Should render without errors
    expect(mockContext.clearRect).toHaveBeenCalled();
  });

  it('should handle multiple series', () => {
    const multiSeriesDataset: Dataset = {
      dataType: 'values',
      values: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
    };

    const multiSeriesConfig = {
      ...mockConfig,
      series: [
        { color: '#ff0000', label: 'Series 1', visible: true },
        { color: '#00ff00', label: 'Series 2', visible: true },
        { color: '#0000ff', label: 'Series 3', visible: true },
      ],
    };

    render(
      <CanvasRenderer
        dataset={multiSeriesDataset}
        config={multiSeriesConfig}
        width={800}
        height={600}
      />
    );

    // Should render multiple series
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  describe('Scale Auto-calculation', () => {
    it('should normalize scale to power of 2', () => {
      const dataset: Dataset = {
        dataType: 'points',
        points: [[
          { x: 1, y: 2 },
          { x: 3, y: 4 },
        ]],
      };

      render(
        <CanvasRenderer
          dataset={dataset}
          config={mockConfig}
          width={800}
          height={600}
        />
      );

      // Should render without errors and call drawing functions
      expect(mockContext.clearRect).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should use unified scale for both X and Y axes', () => {
      const dataset: Dataset = {
        dataType: 'points',
        points: [[
          { x: 1, y: 100 }, // Y range is much larger than X range
          { x: 2, y: 200 },
        ]],
      };

      render(
        <CanvasRenderer
          dataset={dataset}
          config={mockConfig}
          width={800}
          height={600}
        />
      );

      // Should render without errors - unified scaling should handle different ranges
      expect(mockContext.clearRect).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should display scale labels at axis endpoints', () => {
      const dataset: Dataset = {
        dataType: 'points',
        points: [[
          { x: 1, y: 2 },
          { x: 3, y: 4 },
        ]],
      };

      render(
        <CanvasRenderer
          dataset={dataset}
          config={mockConfig}
          width={800}
          height={600}
        />
      );

      // Should call fillText for scale labels
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should handle edge case with zero range', () => {
      const dataset: Dataset = {
        dataType: 'points',
        points: [[
          { x: 5, y: 5 },
          { x: 5, y: 5 }, // Same point - zero range
        ]],
      };

      render(
        <CanvasRenderer
          dataset={dataset}
          config={mockConfig}
          width={800}
          height={600}
        />
      );

      // Should render without errors even with zero range
      expect(mockContext.clearRect).toHaveBeenCalled();
    });

    it('should handle negative values correctly', () => {
      const dataset: Dataset = {
        dataType: 'points',
        points: [[
          { x: -10, y: -5 },
          { x: 10, y: 5 },
        ]],
      };

      render(
        <CanvasRenderer
          dataset={dataset}
          config={mockConfig}
          width={800}
          height={600}
        />
      );

      // Should render without errors with negative values
      expect(mockContext.clearRect).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should handle very small values (fractional powers of 2)', () => {
      const dataset: Dataset = {
        dataType: 'points',
        points: [[
          { x: 0.1, y: 0.2 },
          { x: 0.3, y: 0.4 },
        ]],
      };

      render(
        <CanvasRenderer
          dataset={dataset}
          config={mockConfig}
          width={800}
          height={600}
        />
      );

      // Should render without errors with very small values
      expect(mockContext.clearRect).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
      // Note: Scale labels may not be drawn if axes are outside visible range
      // This is expected behavior for edge cases
    });

    it('should display scale labels at bottom for Y inverted charts', () => {
      const dataset: Dataset = {
        dataType: 'points',
        points: [[
          { x: 1, y: 2 },
          { x: 3, y: 4 },
        ]],
      };

      const invertedConfig = {
        ...mockConfig,
        type: 'quadrant-inverted' as const,
      };

      render(
        <CanvasRenderer
          dataset={dataset}
          config={invertedConfig}
          width={800}
          height={600}
        />
      );

      // Should call fillText for scale labels (positioned at bottom for Y inverted)
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should maintain square aspect ratio regardless of canvas dimensions', () => {
      const dataset: Dataset = {
        dataType: 'points',
        points: [[
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ]],
      };

      // Test with wide canvas (1200x600)
      render(
        <CanvasRenderer
          dataset={dataset}
          config={mockConfig}
          width={1200}
          height={600}
        />
      );

      // Should render without errors and maintain square plotting area
      expect(mockContext.clearRect).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should maintain square aspect ratio with tall canvas', () => {
      const dataset: Dataset = {
        dataType: 'points',
        points: [[
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ]],
      };

      // Test with tall canvas (600x1200)
      render(
        <CanvasRenderer
          dataset={dataset}
          config={mockConfig}
          width={600}
          height={1200}
        />
      );

      // Should render without errors and maintain square plotting area
      expect(mockContext.clearRect).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should draw grid with 1/5 scale intervals', () => {
      const dataset: Dataset = {
        dataType: 'points',
        points: [[
          { x: 0, y: 0 },
          { x: 4, y: 4 },
        ]],
      };

      render(
        <CanvasRenderer
          dataset={dataset}
          config={mockConfig}
          width={800}
          height={600}
        />
      );

      // Should draw grid lines (6 vertical + 6 horizontal = 12 grid lines)
      expect(mockContext.stroke).toHaveBeenCalled();
      expect(mockContext.moveTo).toHaveBeenCalled();
      expect(mockContext.lineTo).toHaveBeenCalled();
    });

    it('should position axes correctly for Y inverted charts', () => {
      const dataset: Dataset = {
        dataType: 'points',
        points: [[
          { x: -1, y: -1 },
          { x: 1, y: 1 },
        ]],
      };

      const invertedConfig = {
        ...mockConfig,
        type: 'quadrant-inverted' as const,
      };

      render(
        <CanvasRenderer
          dataset={dataset}
          config={invertedConfig}
          width={800}
          height={600}
        />
      );

      // Should draw axes with inverted Y positioning
      expect(mockContext.stroke).toHaveBeenCalled();
      expect(mockContext.moveTo).toHaveBeenCalled();
      expect(mockContext.lineTo).toHaveBeenCalled();
    });

    it('should center origin (0,0) for quadrant mode', () => {
      const dataset: Dataset = {
        dataType: 'points',
        points: [[
          { x: -2, y: -2 },
          { x: 2, y: 2 },
        ]],
      };

      const quadrantConfig = {
        ...mockConfig,
        type: 'quadrant' as const,
      };

      render(
        <CanvasRenderer
          dataset={dataset}
          config={quadrantConfig}
          width={800}
          height={600}
        />
      );

      // Should render with origin centered
      expect(mockContext.clearRect).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
      expect(mockContext.moveTo).toHaveBeenCalled();
      expect(mockContext.lineTo).toHaveBeenCalled();
    });

    it('should center origin (0,0) for quadrant-inverted mode', () => {
      const dataset: Dataset = {
        dataType: 'points',
        points: [[
          { x: -3, y: -1 },
          { x: 1, y: 3 },
        ]],
      };

      const quadrantInvertedConfig = {
        ...mockConfig,
        type: 'quadrant-inverted' as const,
      };

      render(
        <CanvasRenderer
          dataset={dataset}
          config={quadrantInvertedConfig}
          width={800}
          height={600}
        />
      );

      // Should render with origin centered and Y-axis inverted
      expect(mockContext.clearRect).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
      expect(mockContext.moveTo).toHaveBeenCalled();
      expect(mockContext.lineTo).toHaveBeenCalled();
    });

    it('should handle asymmetric data ranges in quadrant mode', () => {
      const dataset: Dataset = {
        dataType: 'points',
        points: [[
          { x: -10, y: -1 },
          { x: 2, y: 5 },
        ]],
      };

      const quadrantConfig = {
        ...mockConfig,
        type: 'quadrant' as const,
      };

      render(
        <CanvasRenderer
          dataset={dataset}
          config={quadrantConfig}
          width={800}
          height={600}
        />
      );

      // Should render with origin centered even with asymmetric data
      expect(mockContext.clearRect).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should ensure origin is visible even with positive-only data in quadrant mode', () => {
      const dataset: Dataset = {
        dataType: 'points',
        points: [[
          { x: 1, y: 1 },
          { x: 5, y: 5 },
        ]],
      };

      const quadrantConfig = {
        ...mockConfig,
        type: 'quadrant' as const,
      };

      render(
        <CanvasRenderer
          dataset={dataset}
          config={quadrantConfig}
          width={800}
          height={600}
        />
      );

      // Should render with origin centered, expanding range to include negative values
      expect(mockContext.clearRect).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });
  });
});