import { Dataset, ParseResult, ValuesDataset, PointsDataset, Point } from '../types';

/**
 * Parse raw text data into structured dataset
 */
export function parseData(rawText: string): ParseResult {
  try {
    // Clean the input text
    const cleanedText = cleanInput(rawText);
    
    if (!cleanedText.trim()) {
      return {
        success: false,
        error: 'No data found in input text',
        rawData: rawText,
      };
    }

    // Extract numeric arrays from the cleaned text
    const arrays = extractNumericArrays(cleanedText);
    
    if (arrays.length === 0) {
      return {
        success: false,
        error: 'No numeric data found',
        rawData: rawText,
      };
    }

    // Determine if this should be treated as 1D or 2D data
    const dataset = determineDatasetType(arrays);

    return {
      success: true,
      dataset,
      rawData: rawText,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error',
      rawData: rawText,
    };
  }
}

/**
 * Clean input text by removing unnecessary characters and formatting
 */
function cleanInput(text: string): string {
  // Remove common prefixes and suffixes
  let cleaned = text
    .replace(/^[^[\d\-.,\s]*/, '') // Remove leading non-numeric characters
    .replace(/[^[\d\-.,\s\]]*$/, '') // Remove trailing non-numeric characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Handle function calls like "hoge([1,2,3,4])"
  const functionCallMatch = cleaned.match(/\w+\s*\(([^)]+)\)/);
  if (functionCallMatch) {
    cleaned = functionCallMatch[1];
  }

  // Handle labeled data like "データ1: [1,2,3,4], データ2: [5,6,7,8]"
  cleaned = cleaned.replace(/[^[\d\-.,\s\]]+:/g, ''); // Remove labels

  return cleaned;
}

/**
 * Extract numeric arrays from cleaned text
 */
function extractNumericArrays(text: string): number[][] {
  const arrays: number[][] = [];

  // Pattern to match arrays like [1,2,3,4] or (1,2,3,4)
  const arrayPattern = /[\[\(]\s*([\d\-.,\s]+)\s*[\]\)]/g;
  let match;

  while ((match = arrayPattern.exec(text)) !== null) {
    const numbers = parseNumberSequence(match[1]);
    if (numbers.length > 0) {
      arrays.push(numbers);
    }
  }

  // If no arrays found, try to parse as space/comma separated numbers
  if (arrays.length === 0) {
    const numbers = parseNumberSequence(text);
    if (numbers.length > 0) {
      arrays.push(numbers);
    }
  }

  return arrays;
}

/**
 * Parse a sequence of numbers from text
 */
function parseNumberSequence(text: string): number[] {
  const numbers: number[] = [];
  
  // Split by comma, space, or newline
  const parts = text.split(/[,\s\n]+/).filter(part => part.trim());
  
  for (const part of parts) {
    const num = parseFloat(part.trim());
    if (!isNaN(num)) {
      numbers.push(num);
    }
  }

  return numbers;
}

/**
 * Determine whether the data should be treated as 1D values or 2D points
 */
function determineDatasetType(arrays: number[][]): Dataset {
  // If we have multiple arrays, treat as multiple series
  if (arrays.length > 1) {
    // Check if all arrays have even length (could be 2D data)
    const allEvenLength = arrays.every(arr => arr.length % 2 === 0 && arr.length >= 2);
    
    if (allEvenLength && arrays.every(arr => arr.length <= 10)) {
      // Likely 2D point data
      const pointSeries: Point[][] = arrays.map(arr => convertToPoints(arr));
      return {
        dataType: 'points',
        points: pointSeries,
      } as PointsDataset;
    } else {
      // Treat as 1D value series
      return {
        dataType: 'values',
        values: arrays,
      } as ValuesDataset;
    }
  }

  // Single array - decide based on length and context
  const singleArray = arrays[0];
  
  // If even length and reasonable size, could be 2D points
  if (singleArray.length % 2 === 0 && singleArray.length >= 4 && singleArray.length <= 20) {
    const points = convertToPoints(singleArray);
    return {
      dataType: 'points',
      points: [points],
    } as PointsDataset;
  }

  // Default to 1D values
  return {
    dataType: 'values',
    values: [singleArray],
  } as ValuesDataset;
}

/**
 * Convert array of numbers to array of points
 * [1,2,3,4,5] -> [{x:1,y:2},{x:3,y:4},{x:5,y:4}] (last y value repeated if odd length)
 */
function convertToPoints(numbers: number[]): Point[] {
  const points: Point[] = [];
  
  for (let i = 0; i < numbers.length; i += 2) {
    const x = numbers[i];
    const y = numbers[i + 1] !== undefined ? numbers[i + 1] : numbers[i - 1] || 0;
    points.push({ x, y });
  }

  return points;
}

/**
 * Convert dataset back to raw text representation
 */
export function datasetToText(dataset: Dataset): string {
  if (dataset.dataType === 'values') {
    return dataset.values.map(series => `[${series.join(', ')}]`).join('\n');
  } else {
    return dataset.points.map(series => 
      `[${series.map(p => `${p.x}, ${p.y}`).join(', ')}]`
    ).join('\n');
  }
}