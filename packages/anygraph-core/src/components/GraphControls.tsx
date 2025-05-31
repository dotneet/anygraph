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
              type="number"
              value={config.scale.xMin}
              onChange={(e) => onScaleChange({ xMin: parseFloat(e.target.value) })}
              style={{
                width: '60px',
                padding: '2px 4px',
                border: '1px solid #ccc',
                borderRadius: '3px',
                fontSize: '12px',
              }}
              step="0.1"
            />
            <span style={{ fontSize: '12px' }}>to</span>
            <input
              type="number"
              value={config.scale.xMax}
              onChange={(e) => onScaleChange({ xMax: parseFloat(e.target.value) })}
              style={{
                width: '60px',
                padding: '2px 4px',
                border: '1px solid #ccc',
                borderRadius: '3px',
                fontSize: '12px',
              }}
              step="0.1"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <label style={{ fontSize: '12px' }}>Y:</label>
            <input
              type="number"
              value={config.scale.yMin}
              onChange={(e) => onScaleChange({ yMin: parseFloat(e.target.value) })}
              style={{
                width: '60px',
                padding: '2px 4px',
                border: '1px solid #ccc',
                borderRadius: '3px',
                fontSize: '12px',
              }}
              step="0.1"
            />
            <span style={{ fontSize: '12px' }}>to</span>
            <input
              type="number"
              value={config.scale.yMax}
              onChange={(e) => onScaleChange({ yMax: parseFloat(e.target.value) })}
              style={{
                width: '60px',
                padding: '2px 4px',
                border: '1px solid #ccc',
                borderRadius: '3px',
                fontSize: '12px',
              }}
              step="0.1"
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