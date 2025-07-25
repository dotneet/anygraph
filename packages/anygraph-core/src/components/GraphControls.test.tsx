import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { GraphControls } from './GraphControls';
import { GraphConfig, GraphType } from '../types';

describe('GraphControls', () => {
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

  const mockProps = {
    config: mockConfig,
    onGraphTypeChange: jest.fn(),
    onScaleChange: jest.fn(),
    onToggleEditor: jest.fn(),
    showEditor: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all control elements', () => {
    render(<GraphControls {...mockProps} />);

    expect(screen.getByText('Type:')).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('line');
    expect(screen.getByText('Auto Scale')).toBeInTheDocument();
    expect(screen.getByText('Show Editor')).toBeInTheDocument();
  });

  it('should display correct graph type options', () => {
    render(<GraphControls {...mockProps} />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('line');

    // Check if all options are present
    const options = select.querySelectorAll('option');
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveTextContent('Line Chart');
    expect(options[1]).toHaveTextContent('Scatter Plot');
    expect(options[2]).toHaveTextContent('4-Quadrant (Normal)');
    expect(options[3]).toHaveTextContent('4-Quadrant (Inverted Y)');
  });

  it('should call onGraphTypeChange when graph type is changed', () => {
    render(<GraphControls {...mockProps} />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('line');
    
    fireEvent.change(select, { target: { value: 'scatter' } });

    expect(mockProps.onGraphTypeChange).toHaveBeenCalledWith('scatter');
  });

  it('should display auto scale checkbox correctly', () => {
    render(<GraphControls {...mockProps} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onScaleChange when auto scale is toggled', () => {
    render(<GraphControls {...mockProps} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockProps.onScaleChange).toHaveBeenCalledWith({ autoScale: false });
  });

  it('should show manual scale controls when auto scale is disabled', () => {
    const configWithManualScale = {
      ...mockConfig,
      scale: { ...mockConfig.scale, autoScale: false },
    };

    render(
      <GraphControls
        {...mockProps}
        config={configWithManualScale}
      />
    );

    expect(screen.getByText('X:')).toBeInTheDocument();
    expect(screen.getByText('Y:')).toBeInTheDocument();
    expect(screen.getAllByText('to')).toHaveLength(2);

    // Check for input fields
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(4); // xMin, xMax, yMin, yMax
  });

  it('should not show manual scale controls when auto scale is enabled', () => {
    render(<GraphControls {...mockProps} />);

    expect(screen.queryByText('X:')).not.toBeInTheDocument();
    expect(screen.queryByText('Y:')).not.toBeInTheDocument();
  });

  it('should call onScaleChange when manual scale values are changed', () => {
    const configWithManualScale = {
      ...mockConfig,
      scale: { ...mockConfig.scale, autoScale: false },
    };

    render(
      <GraphControls
        {...mockProps}
        config={configWithManualScale}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    
    // Change xMin
    fireEvent.change(inputs[0], { target: { value: '5' } });
    expect(mockProps.onScaleChange).toHaveBeenCalledWith({ xMin: 5 });

    // Change xMax
    fireEvent.change(inputs[1], { target: { value: '15' } });
    expect(mockProps.onScaleChange).toHaveBeenCalledWith({ xMax: 15 });

    // Change yMin
    fireEvent.change(inputs[2], { target: { value: '-5' } });
    expect(mockProps.onScaleChange).toHaveBeenCalledWith({ yMin: -5 });

    // Change yMax
    fireEvent.change(inputs[3], { target: { value: '20' } });
    expect(mockProps.onScaleChange).toHaveBeenCalledWith({ yMax: 20 });
  });

  it('should display correct editor toggle button text', () => {
    render(<GraphControls {...mockProps} />);

    expect(screen.getByText('Show Editor')).toBeInTheDocument();
  });

  it('should display "Hide Editor" when editor is shown', () => {
    render(
      <GraphControls
        {...mockProps}
        showEditor={true}
      />
    );

    expect(screen.getByText('Hide Editor')).toBeInTheDocument();
  });

  it('should call onToggleEditor when editor button is clicked', () => {
    render(<GraphControls {...mockProps} />);

    const button = screen.getByText('Show Editor');
    fireEvent.click(button);

    expect(mockProps.onToggleEditor).toHaveBeenCalled();
  });

  it('should apply correct styling to editor button when active', () => {
    render(
      <GraphControls
        {...mockProps}
        showEditor={true}
      />
    );

    const button = screen.getByText('Hide Editor');
    expect(button).toHaveStyle({
      backgroundColor: '#007acc',
      color: 'white',
    });
  });

  it('should apply correct styling to editor button when inactive', () => {
    render(<GraphControls {...mockProps} />);

    const button = screen.getByText('Show Editor');
    expect(button).toHaveStyle({
      backgroundColor: '#f5f5f5',
      color: '#333',
    });
  });

  it('should handle all graph types correctly', () => {
    const graphTypes: GraphType[] = ['line', 'scatter', 'quadrant', 'quadrant-inverted'];

    graphTypes.forEach(type => {
      const configWithType = { ...mockConfig, type };
      const { rerender } = render(
        <GraphControls
          {...mockProps}
          config={configWithType}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue(type);

      rerender(<div />); // Clean up for next iteration
    });
  });

  it('should handle decimal values in manual scale inputs', () => {
    const configWithManualScale = {
      ...mockConfig,
      scale: { ...mockConfig.scale, autoScale: false },
    };

    render(
      <GraphControls
        {...mockProps}
        config={configWithManualScale}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    
    // Test decimal input
    fireEvent.change(inputs[0], { target: { value: '2.5' } });
    expect(mockProps.onScaleChange).toHaveBeenCalledWith({ xMin: 2.5 });
  });

  it('should handle negative values in manual scale inputs', () => {
    const configWithManualScale = {
      ...mockConfig,
      scale: { ...mockConfig.scale, autoScale: false },
    };

    render(
      <GraphControls
        {...mockProps}
        config={configWithManualScale}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    
    // Test negative input
    fireEvent.change(inputs[2], { target: { value: '-10' } });
    expect(mockProps.onScaleChange).toHaveBeenCalledWith({ yMin: -10 });
  });

  it('should handle invalid text input gracefully', () => {
    const configWithManualScale = {
      ...mockConfig,
      scale: { ...mockConfig.scale, autoScale: false },
    };

    render(
      <GraphControls
        {...mockProps}
        config={configWithManualScale}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    
    // Test invalid input - should not call onScaleChange
    fireEvent.change(inputs[0], { target: { value: 'invalid' } });
    expect(mockProps.onScaleChange).not.toHaveBeenCalled();
    
    // Input should retain the invalid value
    expect(inputs[0]).toHaveValue('invalid');
  });

  it('should allow invalid values to remain in input', () => {
    const configWithManualScale = {
      ...mockConfig,
      scale: { ...mockConfig.scale, autoScale: false },
    };

    render(
      <GraphControls
        {...mockProps}
        config={configWithManualScale}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    
    // Test empty input - should not call onScaleChange but allow empty value
    fireEvent.change(inputs[0], { target: { value: '' } });
    expect(mockProps.onScaleChange).not.toHaveBeenCalled();
    expect(inputs[0]).toHaveValue('');
    
    // Test minus sign only - should not call onScaleChange but allow minus sign
    fireEvent.change(inputs[0], { target: { value: '-' } });
    expect(mockProps.onScaleChange).not.toHaveBeenCalled();
    expect(inputs[0]).toHaveValue('-');
  });

  it('should allow intermediate input states during typing', () => {
    const configWithManualScale = {
      ...mockConfig,
      scale: { ...mockConfig.scale, autoScale: false },
    };

    render(
      <GraphControls
        {...mockProps}
        config={configWithManualScale}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    
    // Test partial input that results in valid number (1. becomes 1)
    fireEvent.change(inputs[0], { target: { value: '1.' } });
    expect(mockProps.onScaleChange).toHaveBeenCalledWith({ xMin: 1 });
    expect(inputs[0]).toHaveValue('1.');
    
    // Clear mock calls for next test
    jest.clearAllMocks();
    
    // Complete the decimal input
    fireEvent.change(inputs[0], { target: { value: '1.5' } });
    expect(mockProps.onScaleChange).toHaveBeenCalledWith({ xMin: 1.5 });
  });

  it('should display placeholder text for scale inputs', () => {
    const configWithManualScale = {
      ...mockConfig,
      scale: { ...mockConfig.scale, autoScale: false },
    };

    render(
      <GraphControls
        {...mockProps}
        config={configWithManualScale}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    
    // Check placeholders
    expect(inputs[0]).toHaveAttribute('placeholder', 'min');
    expect(inputs[1]).toHaveAttribute('placeholder', 'max');
    expect(inputs[2]).toHaveAttribute('placeholder', 'min');
    expect(inputs[3]).toHaveAttribute('placeholder', 'max');
  });

  it('should handle scientific notation input', () => {
    const configWithManualScale = {
      ...mockConfig,
      scale: { ...mockConfig.scale, autoScale: false },
    };

    render(
      <GraphControls
        {...mockProps}
        config={configWithManualScale}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    
    // Test scientific notation
    fireEvent.change(inputs[0], { target: { value: '1e-3' } });
    expect(mockProps.onScaleChange).toHaveBeenCalledWith({ xMin: 0.001 });
  });
});