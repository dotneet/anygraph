import React from 'react';
import { GraphConfig, GraphType } from '../types';

export interface GraphControlsProps {
  config: GraphConfig;
  onGraphTypeChange: (type: GraphType) => void;
  onScaleChange: (scale: Partial<GraphConfig['scale']>) => void;
  onToggleEditor: () => void;
  showEditor: boolean;
}

export const GraphControls: React.FC<GraphControlsProps> = ({
  config,
  onGraphTypeChange,
  onScaleChange,
  onToggleEditor,
  showEditor,
}) => {
  const graphTypes: { value: GraphType; label: string }[] = [
    { value: 'line', label: 'Line Chart' },
    { value: 'scatter', label: 'Scatter Plot' },
    { value: 'quadrant', label: '4-Quadrant (Normal)' },
    { value: 'quadrant-inverted', label: '4-Quadrant (Inverted Y)' },
  ];

  // Handle scale input changes with validation
  const handleScaleInputChange = (
    scaleProperty: 'xMin' | 'xMax' | 'yMin' | 'yMax',
    value: string
  ) => {
    const trimmedValue = value.trim();
    const parsed = parseFloat(trimmedValue);
    
    // Only update the scale if the parsed value is a valid number
    if (!isNaN(parsed)) {
      onScaleChange({ [scaleProperty]: parsed });
    }
    // Allow invalid values to remain in the input without updating the graph
  };

  // Common input style for scale inputs
  const scaleInputStyle = {
    width: '70px',
    padding: '4px 6px',
    border: '1px solid #ccc',
    borderRadius: '3px',
    fontSize: '12px',
    textAlign: 'center' as const,
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '15px',
      flexWrap: 'wrap'
    }}>
      {/* Graph Type Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Type:</label>
        <select
          value={config.type}
          onChange={(e) => onGraphTypeChange(e.target.value as GraphType)}
          style={{
            padding: '4px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          {graphTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Auto Scale Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>
          <input
            type="checkbox"
            checked={config.scale.autoScale}
            onChange={(e) => onScaleChange({ autoScale: e.target.checked })}
            style={{ marginRight: '5px' }}
          />
          Auto Scale
        </label>
      </div>

      {/* Manual Scale Controls */}
      {!config.scale.autoScale && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <label style={{ fontSize: '12px' }}>X:</label>
            <input
              type="text"
              defaultValue={config.scale.xMin?.toString() || ''}
              onChange={(e) => handleScaleInputChange('xMin', e.target.value)}
              placeholder="min"
              style={scaleInputStyle}
            />
            <span style={{ fontSize: '12px' }}>to</span>
            <input
              type="text"
              defaultValue={config.scale.xMax?.toString() || ''}
              onChange={(e) => handleScaleInputChange('xMax', e.target.value)}
              placeholder="max"
              style={scaleInputStyle}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <label style={{ fontSize: '12px' }}>Y:</label>
            <input
              type="text"
              defaultValue={config.scale.yMin?.toString() || ''}
              onChange={(e) => handleScaleInputChange('yMin', e.target.value)}
              placeholder="min"
              style={scaleInputStyle}
            />
            <span style={{ fontSize: '12px' }}>to</span>
            <input
              type="text"
              defaultValue={config.scale.yMax?.toString() || ''}
              onChange={(e) => handleScaleInputChange('yMax', e.target.value)}
              placeholder="max"
              style={scaleInputStyle}
            />
          </div>
        </>
      )}

      {/* Data Editor Toggle */}
      <button
        onClick={onToggleEditor}
        style={{
          padding: '6px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: showEditor ? '#007acc' : '#f5f5f5',
          color: showEditor ? 'white' : '#333',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        {showEditor ? 'Hide Editor' : 'Show Editor'}
      </button>
    </div>
  );
};