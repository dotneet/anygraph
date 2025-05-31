import React, { useRef, useEffect } from 'react';
import { Dataset, GraphConfig, Point } from '../types';

export interface CanvasRendererProps {
  dataset: Dataset;
  config: GraphConfig;
  width: number;
  height: number;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  dataset,
  config,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWidth = Math.min(600, width);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, height);
    ctx.fillStyle = config.render.backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, height);

    // Calculate scale and bounds
    const bounds = calculateBounds(dataset, config);
    const scale = calculateScale(bounds, canvasWidth, height, config);

    // Draw grid and axes
    if (config.render.showGrid) {
      drawGrid(ctx, scale, config);
    }
    
    if (config.render.showAxes) {
      drawAxes(ctx, scale, config);
    }

    // Draw data
    drawData(ctx, dataset, scale, config);

  }, [dataset, config, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={height}
      style={{
        border: '1px solid #e0e0e0',
        backgroundColor: config.render.backgroundColor,
      }}
    />
  );
};

interface Bounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

interface Scale {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xScale: number;
  yScale: number;
  offsetX: number;
  offsetY: number;
}

function calculateBounds(dataset: Dataset, config: GraphConfig): Bounds {
  if (!config.scale.autoScale) {
    return {
      xMin: config.scale.xMin,
      xMax: config.scale.xMax,
      yMin: config.scale.yMin,
      yMax: config.scale.yMax,
    };
  }

  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;

  if (dataset.dataType === 'values') {
    dataset.values.forEach(series => {
      series.forEach((value, index) => {
        xMin = Math.min(xMin, index);
        xMax = Math.max(xMax, index);
        yMin = Math.min(yMin, value);
        yMax = Math.max(yMax, value);
      });
    });
  } else {
    dataset.points.forEach(series => {
      series.forEach(point => {
        xMin = Math.min(xMin, point.x);
        xMax = Math.max(xMax, point.x);
        yMin = Math.min(yMin, point.y);
        yMax = Math.max(yMax, point.y);
      });
    });
  }

  // Add padding
  const xPadding = (xMax - xMin) * 0.1;
  const yPadding = (yMax - yMin) * 0.1;

  return {
    xMin: xMin - xPadding,
    xMax: xMax + xPadding,
    yMin: yMin - yPadding,
    yMax: yMax + yPadding,
  };
}

/**
 * Calculate unified scale for both X and Y axes
 * Ensures both axes use the same scale normalized to powers of 2
 * Maintains square aspect ratio regardless of canvas dimensions
 * For quadrant modes, ensures origin (0,0) is at the center
 */
function calculateScale(bounds: Bounds, width: number, height: number, config: GraphConfig): Scale {
  const margin = 60; // Increased margin for scale labels
  const availableWidth = width - 2 * margin;
  const availableHeight = height - 2 * margin;

  // Use the smaller dimension to ensure square plotting area
  const plotSize = Math.min(availableWidth, availableHeight);

  // Check if this is a quadrant mode
  const isQuadrantMode = config.type === 'quadrant' || config.type === 'quadrant-inverted';

  let normalizedBounds: Bounds;

  if (isQuadrantMode) {
    // For quadrant modes, ensure origin (0,0) is at the center
    normalizedBounds = calculateQuadrantBounds(bounds);
  } else {
    // For non-quadrant modes, use the original logic
    const xRange = bounds.xMax - bounds.xMin;
    const yRange = bounds.yMax - bounds.yMin;

    // Calculate the maximum range to ensure uniform scaling
    const maxRange = Math.max(xRange, yRange);
    
    // Normalize to power of 2
    const normalizedRange = normalizeToPowerOfTwo(maxRange);
    
    // Center the data within the normalized range
    normalizedBounds = centerDataInNormalizedRange(bounds, normalizedRange);
  }
  
  // Use the same scale for both axes based on the square plot area
  const scale = plotSize / (normalizedBounds.xMax - normalizedBounds.xMin);
  
  // Center the plot area within the canvas
  const offsetX = margin + (availableWidth - plotSize) / 2;
  const offsetY = margin + (availableHeight - plotSize) / 2;

  return {
    ...normalizedBounds,
    xScale: scale,
    yScale: scale,
    offsetX,
    offsetY,
  };
}

/**
 * Normalize a value to the nearest power of 2 (including negative powers)
 * Examples: 3.5 -> 4, 0.05 -> 0.0625, 150 -> 256
 */
function normalizeToPowerOfTwo(value: number): number {
  if (value === 0) return 1;
  
  // Find the power of 2 that is greater than or equal to the value
  const log2 = Math.log2(Math.abs(value));
  const power = Math.ceil(log2);
  
  return Math.pow(2, power);
}

/**
 * Center the data bounds within the normalized range
 */
function centerDataInNormalizedRange(bounds: Bounds, normalizedRange: number): Bounds {
  const xCenter = (bounds.xMin + bounds.xMax) / 2;
  const yCenter = (bounds.yMin + bounds.yMax) / 2;
  
  return {
    xMin: xCenter - normalizedRange / 2,
    xMax: xCenter + normalizedRange / 2,
    yMin: yCenter - normalizedRange / 2,
    yMax: yCenter + normalizedRange / 2,
  };
}

/**
 * Calculate bounds for quadrant mode with origin (0,0) centered
 */
function calculateQuadrantBounds(bounds: Bounds): Bounds {
  const xRange = bounds.xMax - bounds.xMin;
  const yRange = bounds.yMax - bounds.yMin;
  
  // Calculate the maximum range to ensure uniform scaling
  const maxRange = Math.max(xRange, yRange);
  
  // Find the maximum absolute value from origin to ensure origin is centered
  const maxAbsX = Math.max(Math.abs(bounds.xMin), Math.abs(bounds.xMax));
  const maxAbsY = Math.max(Math.abs(bounds.yMin), Math.abs(bounds.yMax));
  const maxAbsValue = Math.max(maxAbsX, maxAbsY);
  
  // Use the larger of data range or absolute value range to ensure all data fits
  const requiredRange = Math.max(maxRange, maxAbsValue * 2);
  
  // Normalize to power of 2
  const normalizedRange = normalizeToPowerOfTwo(requiredRange);
  
  // Center the coordinate system around origin (0,0)
  return {
    xMin: -normalizedRange / 2,
    xMax: normalizedRange / 2,
    yMin: -normalizedRange / 2,
    yMax: normalizedRange / 2,
  };
}

function drawGrid(ctx: CanvasRenderingContext2D, scale: Scale, config: GraphConfig) {
  ctx.strokeStyle = config.render.gridColor;
  ctx.lineWidth = 1;

  // Calculate the actual plot size (square area)
  const plotSize = (scale.xMax - scale.xMin) * scale.xScale;
  const plotWidth = plotSize;
  const plotHeight = plotSize;

  // Check if Y axis is inverted
  const isYInverted = config.type === 'quadrant-inverted';

  // Grid step is 1/5 of the scale range
  const scaleRange = scale.xMax - scale.xMin;
  const gridStep = scaleRange / 5;

  // Vertical grid lines
  for (let i = 0; i <= 5; i++) {
    const x = scale.xMin + i * gridStep;
    const canvasX = scale.offsetX + (x - scale.xMin) * scale.xScale;
    ctx.beginPath();
    ctx.moveTo(canvasX, scale.offsetY);
    ctx.lineTo(canvasX, scale.offsetY + plotHeight);
    ctx.stroke();
  }

  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = scale.yMin + i * gridStep;
    let canvasY = scale.offsetY + plotHeight - (y - scale.yMin) * scale.yScale;
    
    // Handle inverted Y-axis for grid lines
    if (isYInverted) {
      canvasY = scale.offsetY + (y - scale.yMin) * scale.yScale;
    }
    
    ctx.beginPath();
    ctx.moveTo(scale.offsetX, canvasY);
    ctx.lineTo(scale.offsetX + plotWidth, canvasY);
    ctx.stroke();
  }
}

function drawAxes(ctx: CanvasRenderingContext2D, scale: Scale, config: GraphConfig) {
  ctx.strokeStyle = config.render.axisColor;
  ctx.lineWidth = 1;

  // Calculate the actual plot size (square area)
  const plotSize = (scale.xMax - scale.xMin) * scale.xScale;
  const plotWidth = plotSize;
  const plotHeight = plotSize;

  // Check if Y axis is inverted
  const isYInverted = config.type === 'quadrant-inverted';

  // X-axis
  let xAxisY = scale.offsetY + plotHeight - (0 - scale.yMin) * scale.yScale;
  
  // Handle inverted Y-axis for X-axis position
  if (isYInverted) {
    xAxisY = scale.offsetY + (0 - scale.yMin) * scale.yScale;
  }
  
  if (xAxisY >= scale.offsetY && xAxisY <= scale.offsetY + plotHeight) {
    ctx.beginPath();
    ctx.moveTo(scale.offsetX, xAxisY);
    ctx.lineTo(scale.offsetX + plotWidth, xAxisY);
    ctx.stroke();
  }

  // Y-axis
  const yAxisX = scale.offsetX + (0 - scale.xMin) * scale.xScale;
  if (yAxisX >= scale.offsetX && yAxisX <= scale.offsetX + plotWidth) {
    ctx.beginPath();
    ctx.moveTo(yAxisX, scale.offsetY);
    ctx.lineTo(yAxisX, scale.offsetY + plotHeight);
    ctx.stroke();
  }

  // Draw scale labels at axis endpoints
  drawScaleLabels(ctx, scale, config);
}

/**
 * Draw scale labels at the endpoints of both axes
 * Shows the unified scale value used for both X and Y axes
 */
function drawScaleLabels(ctx: CanvasRenderingContext2D, scale: Scale, config: GraphConfig) {
  setupScaleLabelStyle(ctx, config);

  // Calculate the actual plot size (square area)
  const plotSize = (scale.xMax - scale.xMin) * scale.xScale;
  const plotWidth = plotSize;
  const plotHeight = plotSize;
  
  // Calculate the scale value (range of the normalized axis)
  const scaleValue = scale.xMax - scale.xMin;
  const scaleText = formatScaleValue(scaleValue);

  // Check if Y axis is inverted
  const isYInverted = config.type === 'quadrant-inverted';

  // Draw scale labels at axis endpoints
  drawXAxisScaleLabel(ctx, scale, plotWidth, plotHeight, scaleText, isYInverted);
  drawYAxisScaleLabel(ctx, scale, plotWidth, plotHeight, scaleText, isYInverted);
}

/**
 * Setup text styling for scale labels
 */
function setupScaleLabelStyle(ctx: CanvasRenderingContext2D, config: GraphConfig) {
  ctx.fillStyle = config.render.axisColor;
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
}

/**
 * Draw scale label at the right end of X-axis
 */
function drawXAxisScaleLabel(
  ctx: CanvasRenderingContext2D,
  scale: Scale,
  plotWidth: number,
  plotHeight: number,
  scaleText: string,
  isYInverted: boolean
) {
  // Calculate X-axis position (same logic as in drawAxes)
  let xAxisY = scale.offsetY + plotHeight - (0 - scale.yMin) * scale.yScale;
  
  // Handle inverted Y-axis for X-axis position
  if (isYInverted) {
    xAxisY = scale.offsetY + (0 - scale.yMin) * scale.yScale;
  }
  
  if (xAxisY >= scale.offsetY && xAxisY <= scale.offsetY + plotHeight) {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    
    // Place label near the actual X-axis position
    ctx.fillText(scaleText, scale.offsetX + plotWidth + 5, xAxisY - 5);
  }
}

/**
 * Draw scale label at the top end of Y-axis
 */
function drawYAxisScaleLabel(
  ctx: CanvasRenderingContext2D,
  scale: Scale,
  plotWidth: number,
  plotHeight: number,
  scaleText: string,
  isYInverted: boolean
) {
  const yAxisX = scale.offsetX + (0 - scale.xMin) * scale.xScale;
  if (yAxisX >= scale.offsetX && yAxisX <= scale.offsetX + plotWidth) {
    ctx.textAlign = 'right';
    
    if (isYInverted) {
      // For Y inverted, place label at the bottom of the graph
      ctx.textBaseline = 'top';
      ctx.fillText(scaleText, yAxisX - 5, scale.offsetY + plotHeight + 5);
    } else {
      // Normal case, place label at the top
      ctx.textBaseline = 'bottom';
      ctx.fillText(scaleText, yAxisX - 5, scale.offsetY - 5);
    }
  }
}

/**
 * Format scale value for display
 * Shows powers of 2 in a readable format
 */
function formatScaleValue(value: number): string {
  // Handle special cases for common values
  if (value === 1) return '1';
  if (value === 2) return '2';
  if (value === 4) return '4';
  if (value === 8) return '8';
  if (value === 0.5) return '0.5';
  if (value === 0.25) return '0.25';
  if (value === 0.125) return '0.125';
  if (value === 0.0625) return '0.0625';
  
  // For larger values or other powers of 2, use exponential notation
  if (value >= 16 || (value < 1 && value < 0.0625)) {
    const power = Math.log2(value);
    return `2^${Math.round(power)}`;
  }
  
  return value.toString();
}

function drawData(ctx: CanvasRenderingContext2D, dataset: Dataset, scale: Scale, config: GraphConfig) {
  // Calculate the actual plot size (square area)
  const plotSize = (scale.xMax - scale.xMin) * scale.xScale;
  const plotHeight = plotSize;

  if (dataset.dataType === 'values') {
    dataset.values.forEach((series, seriesIndex) => {
      const color = config.series[seriesIndex]?.color || '#2196f3';
      
      if (config.type === 'line') {
        drawLineChart(ctx, series, scale, plotHeight, color, config.type);
      } else {
        // Convert to points for other chart types
        const points = series.map((value, index) => ({ x: index, y: value }));
        drawPointsChart(ctx, points, scale, plotHeight, color, config.type);
      }
    });
  } else {
    dataset.points.forEach((series, seriesIndex) => {
      const color = config.series[seriesIndex]?.color || '#2196f3';
      drawPointsChart(ctx, series, scale, plotHeight, color, config.type);
    });
  }
}

function drawLineChart(ctx: CanvasRenderingContext2D, series: number[], scale: Scale, plotHeight: number, color: string, type: string) {
  if (series.length === 0) return;

  // Check if Y-axis should be inverted
  const isYInverted = type === 'quadrant-inverted';

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  series.forEach((value, index) => {
    const x = scale.offsetX + (index - scale.xMin) * scale.xScale;
    let y = scale.offsetY + plotHeight - (value - scale.yMin) * scale.yScale;
    
    // Handle inverted Y-axis
    if (isYInverted) {
      y = scale.offsetY + (value - scale.yMin) * scale.yScale;
    }
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();
}

function drawPointsChart(ctx: CanvasRenderingContext2D, points: Point[], scale: Scale, plotHeight: number, color: string, type: string) {
  if (points.length === 0) return;

  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  // Check if Y-axis should be inverted
  const isYInverted = type === 'quadrant-inverted';
  
  if (type === 'scatter') {
    // Draw scatter plot
    points.forEach(point => {
      const x = scale.offsetX + (point.x - scale.xMin) * scale.xScale;
      let y = scale.offsetY + plotHeight - (point.y - scale.yMin) * scale.yScale;
      
      // Handle inverted Y-axis
      if (isYInverted) {
        y = scale.offsetY + (point.y - scale.yMin) * scale.yScale;
      }
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
  } else {
    // Draw connected lines for quadrant charts
    ctx.lineWidth = 2;
    ctx.beginPath();

    points.forEach((point, index) => {
      let x = scale.offsetX + (point.x - scale.xMin) * scale.xScale;
      let y = scale.offsetY + plotHeight - (point.y - scale.yMin) * scale.yScale;

      // Handle inverted Y-axis
      if (isYInverted) {
        y = scale.offsetY + (point.y - scale.yMin) * scale.yScale;
      }

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  }
}