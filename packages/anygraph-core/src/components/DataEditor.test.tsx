import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { DataEditor } from './DataEditor';
import { Dataset } from '../types';

// Mock the parser
jest.mock('../data/parser', () => ({
  datasetToText: jest.fn((dataset: Dataset) => {
    if (dataset.dataType === 'values') {
      return dataset.values.map(series => `[${series.join(', ')}]`).join('\n');
    }
    return '[1, 2, 3, 4]';
  }),
}));

describe('DataEditor', () => {
  const mockValuesDataset: Dataset = {
    dataType: 'values',
    values: [[1, 2, 3, 4, 5]],
  };

  const mockPointsDataset: Dataset = {
    dataType: 'points',
    points: [[
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ]],
  };

  const mockProps = {
    rawText: '[1, 2, 3, 4, 5]',
    dataset: mockValuesDataset,
    onTextChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render data editor components', () => {
    render(<DataEditor {...mockProps} />);

    expect(screen.getByText('Data Editor')).toBeInTheDocument();
    expect(screen.getByText('Raw Data:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your data here...')).toBeInTheDocument();
  });

  it('should display dataset information for values dataset', () => {
    render(<DataEditor {...mockProps} />);

    expect(screen.getByText('1 series, 5 values total')).toBeInTheDocument();
  });

  it('should display dataset information for points dataset', () => {
    render(
      <DataEditor
        {...mockProps}
        dataset={mockPointsDataset}
      />
    );

    expect(screen.getByText('1 series, 2 points total')).toBeInTheDocument();
  });

  it('should display multi-series information correctly', () => {
    const multiSeriesDataset: Dataset = {
      dataType: 'values',
      values: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
    };

    render(
      <DataEditor
        {...mockProps}
        dataset={multiSeriesDataset}
      />
    );

    expect(screen.getByText('3 series, 9 values total')).toBeInTheDocument();
  });

  it('should show initial raw text in textarea', () => {
    render(<DataEditor {...mockProps} />);

    const textarea = screen.getByPlaceholderText('Enter your data here...');
    expect(textarea).toHaveValue('[1, 2, 3, 4, 5]');
  });

  it('should generate text from dataset when no raw text provided', () => {
    const { datasetToText } = require('../data/parser');
    
    render(
      <DataEditor
        rawText=""
        dataset={mockValuesDataset}
        onTextChange={mockProps.onTextChange}
      />
    );

    expect(datasetToText).toHaveBeenCalledWith(mockValuesDataset);
  });

  it('should call onTextChange when textarea value changes', () => {
    render(<DataEditor {...mockProps} />);

    const textarea = screen.getByPlaceholderText('Enter your data here...');
    fireEvent.change(textarea, { target: { value: '[1, 2, 3]' } });

    expect(mockProps.onTextChange).toHaveBeenCalledWith('[1, 2, 3]');
  });

  it('should show supported formats help section', () => {
    render(<DataEditor {...mockProps} />);

    expect(screen.getByText('Supported Formats:')).toBeInTheDocument();
    expect(screen.getByText('1D Data Examples:')).toBeInTheDocument();
    expect(screen.getByText('2D Data Examples:')).toBeInTheDocument();
    expect(screen.getByText('Multi-series:')).toBeInTheDocument();
  });

  it('should display sample format examples', () => {
    render(<DataEditor {...mockProps} />);

    expect(screen.getByText('[1, 2, 3, 4, 5]')).toBeInTheDocument();
    expect(screen.getByText('1, 2, 3, 4, 5')).toBeInTheDocument();
    expect(screen.getByText('1 2 3 4 5')).toBeInTheDocument();
  });

  it('should have quick action buttons', () => {
    render(<DataEditor {...mockProps} />);

    expect(screen.getByText('Sample 1D')).toBeInTheDocument();
    expect(screen.getByText('Sample 2D')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('should set sample 1D data when Sample 1D button is clicked', () => {
    render(<DataEditor {...mockProps} />);

    const button = screen.getByText('Sample 1D');
    fireEvent.click(button);

    expect(mockProps.onTextChange).toHaveBeenCalledWith('[1, 2, 3, 4, 5]');
  });

  it('should set sample 2D data when Sample 2D button is clicked', () => {
    render(<DataEditor {...mockProps} />);

    const button = screen.getByText('Sample 2D');
    fireEvent.click(button);

    expect(mockProps.onTextChange).toHaveBeenCalledWith('[0, 1, 1, 4, 2, 9, 3, 16]');
  });

  it('should clear data when Clear button is clicked', () => {
    render(<DataEditor {...mockProps} />);

    const button = screen.getByText('Clear');
    fireEvent.click(button);

    const textarea = screen.getByPlaceholderText('Enter your data here...');
    expect(textarea).toHaveValue('');
  });

  it('should show valid state styling by default', () => {
    render(<DataEditor {...mockProps} />);

    const textarea = screen.getByPlaceholderText('Enter your data here...');
    expect(textarea).toHaveStyle({
      border: '2px solid #ccc',
      backgroundColor: '#fff',
    });
  });

  it('should handle invalid data gracefully', () => {
    const onTextChangeWithError = jest.fn(() => {
      throw new Error('Invalid data');
    });

    render(
      <DataEditor
        {...mockProps}
        onTextChange={onTextChangeWithError}
      />
    );

    const textarea = screen.getByPlaceholderText('Enter your data here...');
    fireEvent.change(textarea, { target: { value: 'invalid data' } });

    // Should show invalid state
    expect(screen.getByText('Invalid data format')).toBeInTheDocument();
  });

  it('should apply correct styling for invalid data', () => {
    const onTextChangeWithError = jest.fn(() => {
      throw new Error('Invalid data');
    });

    render(
      <DataEditor
        {...mockProps}
        onTextChange={onTextChangeWithError}
      />
    );

    const textarea = screen.getByPlaceholderText('Enter your data here...');
    fireEvent.change(textarea, { target: { value: 'invalid data' } });

    expect(textarea).toHaveStyle({
      border: '2px solid #d32f2f',
      backgroundColor: '#fff5f5',
    });
  });

  it('should handle empty dataset', () => {
    const emptyDataset: Dataset = {
      dataType: 'values',
      values: [[]],
    };

    render(
      <DataEditor
        {...mockProps}
        dataset={emptyDataset}
      />
    );

    expect(screen.getByText('1 series, 0 values total')).toBeInTheDocument();
  });

  it('should handle dataset with no series', () => {
    const noSeriesDataset: Dataset = {
      dataType: 'values',
      values: [],
    };

    render(
      <DataEditor
        {...mockProps}
        dataset={noSeriesDataset}
      />
    );

    expect(screen.getByText('0 series, 0 values total')).toBeInTheDocument();
  });

  it('should update textarea value when rawText prop changes', () => {
    const { rerender } = render(<DataEditor {...mockProps} />);

    let textarea = screen.getByPlaceholderText('Enter your data here...');
    expect(textarea).toHaveValue('[1, 2, 3, 4, 5]');

    rerender(
      <DataEditor
        {...mockProps}
        rawText="[6, 7, 8, 9]"
      />
    );

    textarea = screen.getByPlaceholderText('Enter your data here...');
    expect(textarea).toHaveValue('[6, 7, 8, 9]');
  });

  it('should maintain textarea focus during editing', () => {
    render(<DataEditor {...mockProps} />);

    const textarea = screen.getByPlaceholderText('Enter your data here...');
    textarea.focus();
    
    fireEvent.change(textarea, { target: { value: '[1, 2, 3]' } });

    expect(document.activeElement).toBe(textarea);
  });
});