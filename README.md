# AnyGraph

VSCode extension for visualizing selected data as 2D graphs.

## Overview

AnyGraph is a VSCode extension that allows you to visualize selected data in the editor as various types of 2D graphs. The project is structured as a monorepo with two main packages:

- **anygraph-core**: Independent React-based visualization library
- **anygraph-vscode**: VSCode extension that integrates the core library

## Features

- **Multiple Graph Types**:
  - Line chart (1D data)
  - Scatter plot (2D data points)
  - 4-quadrant line graph (normal Y-axis)
  - 4-quadrant line graph (inverted Y-axis)

- **Smart Data Parsing**: Automatically interprets various data formats from selected text
- **Interactive Scaling**: Auto-scale detection with manual adjustment capabilities
- **Multi-series Support**: Display multiple data series with different colors
- **Real-time Editing**: Edit data through text area with live graph updates

## Project Structure

```
anygraph/
├── packages/
│   ├── anygraph-core/          # Core visualization library
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── data/          # Data parsing and processing
│   │   │   ├── rendering/     # Canvas rendering logic
│   │   │   ├── types/         # TypeScript type definitions
│   │   │   ├── hooks/         # React hooks
│   │   │   ├── store/         # State management
│   │   │   └── utils/         # Utility functions
│   │   └── package.json
│   └── anygraph-vscode/        # VSCode extension
│       ├── src/
│       │   ├── extension.ts   # Extension entry point
│       │   ├── providers/     # VSCode providers
│       │   ├── commands/      # Extension commands
│       │   ├── webview/       # WebView integration
│       │   └── utils/         # Extension utilities
│       └── package.json
├── package.json               # Root package.json (monorepo)
├── tsconfig.base.json         # Shared TypeScript config
└── README.md
```

## Development

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

### Setup

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

### Development Workflow

1. **Core Development**: Work on `packages/anygraph-core` for visualization logic
2. **Extension Development**: Work on `packages/anygraph-vscode` for VSCode integration
3. **Testing**: Each package can be developed and tested independently

## Data Format Support

### 1D Data (Values)
```
Input: [1,2,3,4] or 1,2,3,4 or 1 2 3 4
Output: values: [1,2,3,4]
```

### 2D Data (Points)
```
Input: [1,2,3,4]
Output: [{x:1,y:2},{x:3,y:4}]
```

### Multi-series Data
```
Input: [1,2] and [3,4]
Output: Multiple data series with different colors
```

## License

MIT License