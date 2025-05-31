# AnyGraph - Developer Guide

This document contains development information for the AnyGraph VSCode extension.

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

## Development Setup

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation

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

### Development Commands

```bash
# Watch mode for development
npm run dev

# Type checking
npm run type-check

# Clean build artifacts
npm run clean

# Fix linting issues
npm run lint:fix
```

## Building and Packaging

### Creating VSIX Package

To create a VSIX package for distribution:

```bash
# Build all packages first
npm run build

# Navigate to the VSCode extension package
cd packages/anygraph-vscode

# Create VSIX package
npm run package
```

This will create a `.vsix` file in the `packages/anygraph-vscode` directory (e.g., `anygraph-0.1.0.vsix`).

### Development Testing

For development purposes, you can test the extension by:

1. Open the `packages/anygraph-vscode` folder in VSCode
2. Press `F5` to launch a new Extension Development Host window
3. The extension will be automatically loaded in the development window

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

## Architecture

The project is structured as a monorepo with two main packages:

- **anygraph-core**: Independent React-based visualization library that can be used standalone
- **anygraph-vscode**: VSCode extension that integrates the core library through webviews

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests for specific package
cd packages/anygraph-core && npm run test
cd packages/anygraph-vscode && npm run test
```

## License

MIT License