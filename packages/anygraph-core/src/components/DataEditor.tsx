import React, { useState, useEffect, useRef } from 'react';
import { Dataset } from '../types';
import { datasetToText } from '../data/parser';

export interface DataEditorProps {
  rawText: string;
  dataset: Dataset;
  onTextChange: (text: string) => void;
}

export const DataEditor: React.FC<DataEditorProps> = ({
  rawText,
  dataset,
  onTextChange,
}) => {
  const [currentText, setCurrentText] = useState<string>(rawText);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [isUserEditing, setIsUserEditing] = useState<boolean>(false);
  const initializedRef = useRef<boolean>(false);

  useEffect(() => {
    // Only initialize text once when component first mounts
    if (!initializedRef.current) {
      if (!rawText && dataset) {
        // If no raw text provided, generate from dataset
        const generatedText = datasetToText(dataset);
        setCurrentText(generatedText);
      } else {
        setCurrentText(rawText);
      }
      initializedRef.current = true;
    }
  }, [rawText, dataset]);

  // Update text only if user is not actively editing and rawText changes from external source
  useEffect(() => {
    if (!isUserEditing && rawText !== currentText && initializedRef.current) {
      setCurrentText(rawText);
    }
  }, [rawText, isUserEditing, currentText]);

  const handleTextChange = (text: string) => {
    setCurrentText(text);
    setIsUserEditing(true);
    
    // Validate the text by attempting to parse it
    try {
      onTextChange(text);
      setIsValid(true);
    } catch (error) {
      setIsValid(false);
    }
    
    // Reset editing flag after a short delay to allow for external updates
    setTimeout(() => setIsUserEditing(false), 100);
  };

  const getDatasetInfo = () => {
    if (dataset.dataType === 'values') {
      const seriesCount = dataset.values.length;
      const totalPoints = dataset.values.reduce((sum, series) => sum + series.length, 0);
      return `${seriesCount} series, ${totalPoints} values total`;
    } else {
      const seriesCount = dataset.points.length;
      const totalPoints = dataset.points.reduce((sum, series) => sum + series.length, 0);
      return `${seriesCount} series, ${totalPoints} points total`;
    }
  };

  const getSampleFormats = () => {
    return [
      '1D Data Examples:',
      '[1, 2, 3, 4, 5]',
      '1, 2, 3, 4, 5',
      '1 2 3 4 5',
      '',
      '2D Data Examples:',
      '[1, 2, 3, 4]  // (1,2), (3,4)',
      '[0, 1, 1, 4, 2, 9]  // (0,1), (1,4), (2,9)',
      '',
      'Multi-series:',
      '[1, 2, 3] and [4, 5, 6]',
      '[1, 2, 3]',
      '[4, 5, 6]',
    ];
  };

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '10px'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '10px',
        paddingBottom: '10px',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <h3 style={{ 
          margin: '0 0 5px 0', 
          fontSize: '16px',
          color: '#333'
        }}>
          Data Editor
        </h3>
        <div style={{ 
          fontSize: '12px', 
          color: isValid ? '#666' : '#d32f2f'
        }}>
          {isValid ? getDatasetInfo() : 'Invalid data format'}
        </div>
      </div>

      {/* Text Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <label style={{ 
          fontSize: '14px', 
          fontWeight: 'bold',
          marginBottom: '5px',
          color: '#333'
        }}>
          Raw Data:
        </label>
        <textarea
          value={currentText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Enter your data here..."
          style={{
            flex: 1,
            minHeight: '150px',
            padding: '8px',
            border: `2px solid ${isValid ? '#ccc' : '#d32f2f'}`,
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'monospace',
            resize: 'vertical',
            outline: 'none',
            backgroundColor: isValid ? '#fff' : '#fff5f5'
          }}
        />
      </div>

      {/* Help Section */}
      <div style={{ 
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          marginBottom: '8px',
          color: '#333'
        }}>
          Supported Formats:
        </div>
        <div style={{ 
          fontFamily: 'monospace',
          lineHeight: '1.4',
          color: '#666'
        }}>
          {getSampleFormats().map((line, index) => (
            <div key={index} style={{ 
              marginBottom: line === '' ? '5px' : '2px',
              fontWeight: line.endsWith(':') ? 'bold' : 'normal',
              color: line.endsWith(':') ? '#333' : '#666'
            }}>
              {line || '\u00A0'}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ 
        marginTop: '10px',
        display: 'flex',
        gap: '5px'
      }}>
        <button
          onClick={() => handleTextChange('[1, 2, 3, 4, 5]')}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            backgroundColor: '#f5f5f5',
            cursor: 'pointer'
          }}
        >
          Sample 1D
        </button>
        <button
          onClick={() => handleTextChange('[0, 1, 1, 4, 2, 9, 3, 16]')}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            backgroundColor: '#f5f5f5',
            cursor: 'pointer'
          }}
        >
          Sample 2D
        </button>
        <button
          onClick={() => {
            setCurrentText('');
            setIsUserEditing(true);
            onTextChange('');
            setTimeout(() => setIsUserEditing(false), 100);
          }}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            backgroundColor: '#f5f5f5',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
};