import React, { useState, useCallback, useEffect } from 'react';
import { Dataset, GraphConfig, GraphType } from '../types';
import { CanvasRenderer } from '../rendering/CanvasRenderer';
import { DataEditor } from './DataEditor';
import { GraphControls } from './GraphControls';
import { parseData } from '../data/parser';

export interface AnyGraphProps {
  dataset: Dataset;
  config: GraphConfig;
  onConfigChange?: (config: Partial<GraphConfig>) => void;
  onDataEdit?: (rawText: string) => void;
}

export const AnyGraph: React.FC<AnyGraphProps> = ({
  dataset,
  config,
  onConfigChange,
  onDataEdit,
}) => {
  const [currentDataset, setCurrentDataset] = useState<Dataset>(dataset);
  const [currentConfig, setCurrentConfig] = useState<GraphConfig>(config);
  const [rawText, setRawText] = useState<string>('');
  const [showEditor, setShowEditor] = useState<boolean>(false);

  useEffect(() => {
    // Only parse data when rawText is not empty
    if (rawText.trim()) {
      console.log(currentConfig.type, rawText);
      const parseResult = parseData(currentConfig.type, rawText);
      if (parseResult.success && parseResult.dataset) {
        setCurrentDataset(parseResult.dataset);
      }
    }
  }, [currentConfig.type, rawText]);

  const handleConfigChange = useCallback((newConfig: Partial<GraphConfig>) => {
    const updatedConfig = { ...currentConfig, ...newConfig };
    setCurrentConfig(updatedConfig);
    onConfigChange?.(newConfig);
  }, [currentConfig, onConfigChange]);

  const handleDataEdit = useCallback((text: string) => {
    setRawText(text);
    
    // Only parse and update if text is not empty
    if (text.trim()) {
      const parseResult = parseData(currentConfig.type, text);
      
      if (parseResult.success && parseResult.dataset) {
        setCurrentDataset(parseResult.dataset);
        onDataEdit?.(text);
      }
    } else {
      // If text is empty, keep the current dataset but update rawText
      onDataEdit?.(text);
    }
  }, [currentConfig.type, onDataEdit]);

  const handleGraphTypeChange = useCallback((type: GraphType) => {
    handleConfigChange({ type });
  }, [handleConfigChange]);

  const handleScaleChange = useCallback((scale: Partial<typeof currentConfig.scale>) => {
    handleConfigChange({
      scale: { ...currentConfig.scale, ...scale }
    });
  }, [currentConfig.scale, handleConfigChange]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header with controls */}
      <div style={{ 
        padding: '10px', 
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f5f5f5'
      }}>
        <GraphControls
          config={currentConfig}
          onGraphTypeChange={handleGraphTypeChange}
          onScaleChange={handleScaleChange}
          onToggleEditor={() => setShowEditor(!showEditor)}
          showEditor={showEditor}
        />
      </div>

      {/* Main content area */}
      <div style={{ 
        display: 'flex', 
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* Canvas area */}
        <div style={{ 
          flex: showEditor ? '1' : '1',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: currentConfig.render.backgroundColor
        }}>
          <CanvasRenderer
            dataset={currentDataset}
            config={currentConfig}
            width={currentConfig.render.width}
            height={currentConfig.render.height}
          />
        </div>

        {/* Data editor panel */}
        {showEditor && (
          <div style={{ 
            borderLeft: '1px solid #e0e0e0',
            backgroundColor: '#fafafa'
          }}>
            <DataEditor
              rawText={rawText}
              dataset={currentDataset}
              onTextChange={handleDataEdit}
            />
          </div>
        )}
      </div>
    </div>
  );
};