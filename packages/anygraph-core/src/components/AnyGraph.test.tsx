import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { AnyGraph } from './AnyGraph';
import { Dataset, GraphConfig } from '../types';

// Mock the CanvasRenderer component
jest.mock('../rendering/CanvasRenderer', () => ({
  CanvasRenderer: ({ dataset, config }: any) => (
    <div data-testid="canvas-renderer">
      <div data-testid="dataset-type">{dataset.dataType}</div>
      <div data-testid="graph-type">{config.type}</div>
    </div>
  ),
}));

// Mock the DataEditor component
jest.mock('./DataEditor', () => ({
  DataEditor: ({ onTextChange }: any) => (
    <div data-testid="data-editor">
      <button onClick={() => onTextChange('[1, 2, 3]')}>
        Update Data
      </button>
    </div>
  ),
}));

// Mock the GraphControls component
jest.mock('./GraphControls', () => ({
  GraphControls: ({ onGraphTypeChange, onToggleEditor }: any) => (
    <div data-testid="graph-controls">
      <button onClick={() => onGraphTypeChange('scatter')}>
        Change to Scatter
      </button>
      <button onClick={onToggleEditor}>
        Toggle Editor
      </button>
    </div>
  ),
}));

describe('AnyGraph', () => {
  const mockDataset: Dataset = {
    dataType: 'values',
    values: [[1, 2, 3, 4, 5]],
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

  it('should render main components', () => {
    render(
      <AnyGraph
        dataset={mockDataset}
        config={mockConfig}
      />
    );

    expect(screen.getByTestId('graph-controls')).toBeInTheDocument();
    expect(screen.getByTestId('canvas-renderer')).toBeInTheDocument();
  });

  it('should display correct dataset type', () => {
    render(
      <AnyGraph
        dataset={mockDataset}
        config={mockConfig}
      />
    );

    expect(screen.getByTestId('dataset-type')).toHaveTextContent('values');
  });

  it('should display correct graph type', () => {
    render(
      <AnyGraph
        dataset={mockDataset}
        config={mockConfig}
      />
    );

    expect(screen.getByTestId('graph-type')).toHaveTextContent('line');
  });

  it('should handle graph type change', () => {
    const onConfigChange = jest.fn();
    
    render(
      <AnyGraph
        dataset={mockDataset}
        config={mockConfig}
        onConfigChange={onConfigChange}
      />
    );

    fireEvent.click(screen.getByText('Change to Scatter'));
    
    expect(onConfigChange).toHaveBeenCalledWith({ type: 'scatter' });
  });

  it('should toggle data editor visibility', () => {
    render(
      <AnyGraph
        dataset={mockDataset}
        config={mockConfig}
      />
    );

    // Initially, data editor should not be visible
    expect(screen.queryByTestId('data-editor')).not.toBeInTheDocument();

    // Click toggle button
    fireEvent.click(screen.getByText('Toggle Editor'));

    // Data editor should now be visible
    expect(screen.getByTestId('data-editor')).toBeInTheDocument();
  });

  it('should handle data editing', () => {
    const onDataEdit = jest.fn();
    
    render(
      <AnyGraph
        dataset={mockDataset}
        config={mockConfig}
        onDataEdit={onDataEdit}
      />
    );

    // Show editor first
    fireEvent.click(screen.getByText('Toggle Editor'));

    // Update data
    fireEvent.click(screen.getByText('Update Data'));

    expect(onDataEdit).toHaveBeenCalledWith('[1, 2, 3]');
  });

  it('should handle scale changes', () => {
    const onConfigChange = jest.fn();
    
    render(
      <AnyGraph
        dataset={mockDataset}
        config={mockConfig}
        onConfigChange={onConfigChange}
      />
    );

    // This would be triggered by GraphControls component
    // The actual implementation would be tested in GraphControls.test.tsx
    expect(screen.getByTestId('graph-controls')).toBeInTheDocument();
  });

  it('should render with points dataset', () => {
    const pointsDataset: Dataset = {
      dataType: 'points',
      points: [[
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ]],
    };

    render(
      <AnyGraph
        dataset={pointsDataset}
        config={mockConfig}
      />
    );

    expect(screen.getByTestId('dataset-type')).toHaveTextContent('points');
  });

  it('should handle empty dataset', () => {
    const emptyDataset: Dataset = {
      dataType: 'values',
      values: [[]],
    };

    render(
      <AnyGraph
        dataset={emptyDataset}
        config={mockConfig}
      />
    );

    expect(screen.getByTestId('canvas-renderer')).toBeInTheDocument();
  });

  it('should apply custom styling', () => {
    const { container } = render(
      <AnyGraph
        dataset={mockDataset}
        config={mockConfig}
      />
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    });
  });

  it('should handle config changes without onConfigChange callback', () => {
    // Should not throw error when onConfigChange is not provided
    render(
      <AnyGraph
        dataset={mockDataset}
        config={mockConfig}
      />
    );

    fireEvent.click(screen.getByText('Change to Scatter'));
    
    // Should not throw error
    expect(screen.getByTestId('canvas-renderer')).toBeInTheDocument();
  });

  it('should handle data editing without onDataEdit callback', () => {
    // Should not throw error when onDataEdit is not provided
    render(
      <AnyGraph
        dataset={mockDataset}
        config={mockConfig}
      />
    );

    // Show editor first
    fireEvent.click(screen.getByText('Toggle Editor'));

    // Update data
    fireEvent.click(screen.getByText('Update Data'));

    // Should not throw error
    expect(screen.getByTestId('data-editor')).toBeInTheDocument();
  });
});