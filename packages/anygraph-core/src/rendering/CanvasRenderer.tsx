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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = config.render.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Calculate scale and bounds
    const bounds = calculateBounds(dataset, config);
    const scale = calculateScale(bounds, width, height, config);

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
      width={width}
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

function calculateScale(bounds: Bounds, width: number, height: number, config: GraphConfig): Scale {
  const margin = 40;
  const plotWidth = width - 2 * margin;
  const plotHeight = height - 2 * margin;

  const xRange = bounds.xMax - bounds.xMin;
  const yRange = bounds.yMax - bounds.yMin;

  const xScale = plotWidth / xRange;
  const yScale = plotHeight / yRange;

  return {
    ...bounds,
    xScale,
    yScale,
    offsetX: margin,
    offsetY: margin,
  };
}

function drawGrid(ctx: CanvasRenderingContext2D, scale: Scale, config: GraphConfig) {
  ctx.strokeStyle = config.render.gridColor;
  ctx.lineWidth = 1;

  const plotWidth = ctx.canvas.width - 2 * scale.offsetX;
  const plotHeight = ctx.canvas.height - 2 * scale.offsetY;

  // Vertical grid lines
  const xStep = Math.max(1, Math.floor((scale.xMax - scale.xMin) / 10));
  for (let x = Math.ceil(scale.xMin / xStep) * xStep; x <= scale.xMax; x += xStep) {
    const canvasX = scale.offsetX + (x - scale.xMin) * scale.xScale;
    ctx.beginPath();
    ctx.moveTo(canvasX, scale.offsetY);
    ctx.lineTo(canvasX, scale.offsetY + plotHeight);
    ctx.stroke();
  }

  // Horizontal grid lines
  const yStep = Math.max(1, Math.floor((scale.yMax - scale.yMin) / 10));
  for (let y = Math.ceil(scale.yMin / yStep) * yStep; y <= scale.yMax; y += yStep) {
    const canvasY = scale.offsetY + plotHeight - (y - scale.yMin) * scale.yScale;
    ctx.beginPath();
    ctx.moveTo(scale.offsetX, canvasY);
    ctx.lineTo(scale.offsetX + plotWidth, canvasY);
    ctx.stroke();
  }
}

function drawAxes(ctx: CanvasRenderingContext2D, scale: Scale, config: GraphConfig) {
  ctx.strokeStyle = config.render.axisColor;
  ctx.lineWidth = 2;

  const plotWidth = ctx.canvas.width - 2 * scale.offsetX;
  const plotHeight = ctx.canvas.height - 2 * scale.offsetY;

  // X-axis
  const xAxisY = scale.offsetY + plotHeight - (0 - scale.yMin) * scale.yScale;
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
}

function drawData(ctx: CanvasRenderingContext2D, dataset: Dataset, scale: Scale, config: GraphConfig) {
  const plotHeight = ctx.canvas.height - 2 * scale.offsetY;

  if (dataset.dataType === 'values') {
    dataset.values.forEach((series, seriesIndex) => {
      const color = config.series[seriesIndex]?.color || '#2196f3';
      
      if (config.type === 'line') {
        drawLineChart(ctx, series, scale, plotHeight, color);
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

function drawLineChart(ctx: CanvasRenderingContext2D, series: number[], scale: Scale, plotHeight: number, color: string) {
  if (series.length === 0) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  series.forEach((value, index) => {
    const x = scale.offsetX + (index - scale.xMin) * scale.xScale;
    const y = scale.offsetY + plotHeight - (value - scale.yMin) * scale.yScale;
    
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

  if (type === 'scatter') {
    // Draw scatter plot
    points.forEach(point => {
      const x = scale.offsetX + (point.x - scale.xMin) * scale.xScale;
      const y = scale.offsetY + plotHeight - (point.y - scale.yMin) * scale.yScale;
      
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

      // Handle inverted Y-axis for quadrant-inverted
      if (type === 'quadrant-inverted') {
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