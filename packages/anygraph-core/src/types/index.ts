// Core data types based on the specification
export type Values = number[];
export type ValuesList = Values[];

export type Point = {
  x: number;
  y: number;
};

export type PointList = Point[];

export type ValuesDataset = {
  dataType: 'values';
  values: ValuesList;
};

export type PointsDataset = {
  dataType: 'points';
  points: PointList[];
};

export type Dataset = ValuesDataset | PointsDataset;

// Graph types
export type GraphType = 
  | 'line'           // Line chart for 1D data
  | 'scatter'        // Scatter plot for 2D data points
  | 'quadrant'       // 4-quadrant line graph (normal Y-axis)
  | 'quadrant-inverted'; // 4-quadrant line graph (inverted Y-axis)

// Scale configuration
export type Scale = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  autoScale: boolean;
};

// Rendering configuration
export type RenderConfig = {
  width: number;
  height: number;
  backgroundColor: string;
  gridColor: string;
  axisColor: string;
  showGrid: boolean;
  showAxes: boolean;
};

// Series configuration for multi-data support
export type SeriesConfig = {
  color: string;
  label?: string;
  visible: boolean;
};

// Graph configuration
export type GraphConfig = {
  type: GraphType;
  scale: Scale;
  render: RenderConfig;
  series: SeriesConfig[];
};

// VSCode communication types
export type VSCodeMessage = {
  type: 'data' | 'config' | 'scale' | 'error';
  payload: any;
};

export type DataMessage = {
  type: 'data';
  payload: {
    rawText: string;
    dataset: Dataset;
  };
};

export type ConfigMessage = {
  type: 'config';
  payload: {
    graphType: GraphType;
    config: Partial<GraphConfig>;
  };
};

export type ScaleMessage = {
  type: 'scale';
  payload: {
    scale: Scale;
  };
};

export type ErrorMessage = {
  type: 'error';
  payload: {
    message: string;
    details?: any;
  };
};

// Parser types
export type ParseResult = {
  success: boolean;
  dataset?: Dataset;
  error?: string;
  rawData?: string;
};

// Component props
export type GraphProps = {
  dataset: Dataset;
  config: GraphConfig;
  onConfigChange?: (config: Partial<GraphConfig>) => void;
  onDataEdit?: (rawText: string) => void;
};