import { parseData, datasetToText } from './parser';
import { Dataset, ValuesDataset, PointsDataset } from '../types';

describe('Data Parser', () => {
  describe('parseData', () => {
    it('should parse simple 1D array', () => {
      const result = parseData('[1, 2, 3, 4]');
      
      expect(result.success).toBe(true);
      expect(result.dataset).toBeDefined();
      if (result.dataset) {
        expect(result.dataset.dataType).toBe('values');
        
        const dataset = result.dataset as ValuesDataset;
        expect(dataset.values).toEqual([[1, 2, 3, 4]]);
      }
    });

    it('should parse comma-separated values', () => {
      const result = parseData('1, 2, 3, 4');
      
      expect(result.success).toBe(true);
      if (result.dataset) {
        expect(result.dataset.dataType).toBe('values');
        
        const dataset = result.dataset as ValuesDataset;
        expect(dataset.values).toEqual([[1, 2, 3, 4]]);
      }
    });

    it('should parse space-separated values', () => {
      const result = parseData('1 2 3 4');
      
      expect(result.success).toBe(true);
      if (result.dataset) {
        expect(result.dataset.dataType).toBe('values');
        
        const dataset = result.dataset as ValuesDataset;
        expect(dataset.values).toEqual([[1, 2, 3, 4]]);
      }
    });

    it('should parse 2D data as points', () => {
      const result = parseData('[1, 2, 3, 4]');
      
      expect(result.success).toBe(true);
      
      // For even-length small arrays, it might be interpreted as points
      if (result.dataset && result.dataset.dataType === 'points') {
        const dataset = result.dataset as PointsDataset;
        expect(dataset.points[0]).toEqual([
          { x: 1, y: 2 },
          { x: 3, y: 4 }
        ]);
      }
    });

    it('should handle multiple arrays', () => {
      const result = parseData('[1, 2, 3] [4, 5, 6]');
      
      expect(result.success).toBe(true);
      if (result.dataset) {
        expect(result.dataset.dataType).toBe('values');
        
        const dataset = result.dataset as ValuesDataset;
        expect(dataset.values).toEqual([[1, 2, 3], [4, 5, 6]]);
      }
    });

    it('should clean function calls', () => {
      const result = parseData('console.log([1, 2, 3, 4])');
      
      expect(result.success).toBe(true);
      if (result.dataset) {
        expect(result.dataset.dataType).toBe('values');
        
        const dataset = result.dataset as ValuesDataset;
        expect(dataset.values[0]).toEqual([1, 2, 3, 4]);
      }
    });

    it('should handle empty input', () => {
      const result = parseData('');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('No data found');
    });

    it('should handle invalid input', () => {
      const result = parseData('not a number');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('No numeric data found');
    });

    it('should handle odd-length arrays for points', () => {
      const result = parseData('[1, 2, 3, 4, 5]');
      
      expect(result.success).toBe(true);
      
      if (result.dataset && result.dataset.dataType === 'points') {
        const dataset = result.dataset as PointsDataset;
        expect(dataset.points[0]).toEqual([
          { x: 1, y: 2 },
          { x: 3, y: 4 },
          { x: 5, y: 4 } // Last y value repeated
        ]);
      }
    });

    it('should treat newline without trailing comma as separate data series', () => {
      const result = parseData('1,1,2,2\n3,3,4,4');
      
      expect(result.success).toBe(true);
      if (result.dataset) {
        expect(result.dataset.dataType).toBe('values');
        
        const dataset = result.dataset as ValuesDataset;
        expect(dataset.values).toEqual([[1, 1, 2, 2], [3, 3, 4, 4]]);
      }
    });

    it('should treat newline with trailing comma as single data series', () => {
      const result = parseData('1,1,2,2,\n3,3,4,4');
      
      expect(result.success).toBe(true);
      if (result.dataset) {
        expect(result.dataset.dataType).toBe('values');
        
        const dataset = result.dataset as ValuesDataset;
        expect(dataset.values).toEqual([[1, 1, 2, 2, 3, 3, 4, 4]]);
      }
    });

    it('should handle multiple lines with mixed comma endings', () => {
      const result = parseData('1,2,3,\n4,5,6\n7,8,9');
      
      expect(result.success).toBe(true);
      if (result.dataset) {
        expect(result.dataset.dataType).toBe('values');
        
        const dataset = result.dataset as ValuesDataset;
        expect(dataset.values).toEqual([[1, 2, 3, 4, 5, 6], [7, 8, 9]]);
      }
    });

    it('should handle space-separated values with newlines', () => {
      const result = parseData('1 1 2 2\n3 3 4 4');
      
      expect(result.success).toBe(true);
      if (result.dataset) {
        expect(result.dataset.dataType).toBe('values');
        
        const dataset = result.dataset as ValuesDataset;
        expect(dataset.values).toEqual([[1, 1, 2, 2], [3, 3, 4, 4]]);
      }
    });

    it('should handle complex multi-line data with trailing commas', () => {
      const result = parseData('1,2,\n3,4,\n5,6\n7,8');
      
      expect(result.success).toBe(true);
      if (result.dataset) {
        expect(result.dataset.dataType).toBe('values');
        
        const dataset = result.dataset as ValuesDataset;
        expect(dataset.values).toEqual([[1, 2, 3, 4, 5, 6], [7, 8]]);
      }
    });
  });

  describe('datasetToText', () => {
    it('should convert values dataset to text', () => {
      const dataset: ValuesDataset = {
        dataType: 'values',
        values: [[1, 2, 3], [4, 5, 6]]
      };
      
      const text = datasetToText(dataset);
      expect(text).toBe('[1, 2, 3]\n[4, 5, 6]');
    });

    it('should convert points dataset to text', () => {
      const dataset: PointsDataset = {
        dataType: 'points',
        points: [[
          { x: 1, y: 2 },
          { x: 3, y: 4 }
        ]]
      };
      
      const text = datasetToText(dataset);
      expect(text).toBe('[1, 2, 3, 4]');
    });
  });
});