import React from 'react';
import { render } from '@testing-library/react';
import { CanvasRenderer } from './CanvasRenderer';
import { Dataset, GraphConfig } from '../types';

// Mock canvas context
const mockContext = {
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
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  canvas: { width: 800, height: 600 },
};

beforeEach(() => {
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

    expect(mockContext.strokeStyle).toBe(mockConfig.render.gridColor);
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
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

    expect(mockContext.strokeStyle).toBe(mockConfig.render.axisColor);
    expect(mockContext.lineWidth).toBe(2);
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
});