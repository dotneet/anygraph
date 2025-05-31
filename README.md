# AnyGraph

VSCode extension for visualizing selected data as 2D graphs.

## Overview

AnyGraph is a VSCode extension that allows you to visualize selected data in the editor as various types of 2D graphs.

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

## Installation

### Installing from VSIX

1. Download the latest `.vsix` file from the releases
2. Open VSCode
3. Go to Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
4. Click the "..." menu in the Extensions view
5. Select "Install from VSIX..."
6. Navigate to and select the downloaded `.vsix` file

### Alternative Installation Methods

#### Using Command Line
```bash
code --install-extension anygraph-0.1.0.vsix
```

#### Using VSCode Command Palette
1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type "Extensions: Install from VSIX..."
3. Select the command and choose the `.vsix` file

## Usage

After installation, you can use the extension in three ways:

### 1. Context Menu
1. Select text containing data in any file
2. Right-click and choose "Visualize Selection"

### 2. Keyboard Shortcut
1. Select text containing data
2. Press `Ctrl+Shift+G` (Windows/Linux) or `Cmd+Shift+G` (Mac)

### 3. Command Palette
1. Select text containing data
2. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Search for "AnyGraph: Visualize Selection"

## Supported Data Formats

### 1D Data (Values)
```
Input: [1,2,3,4] or 1,2,3,4 or 1 2 3 4
Output: Line chart with values [1,2,3,4]
```

### 2D Data (Points)
```
Input: [1,2,3,4]
Output: Scatter plot with points [{x:1,y:2},{x:3,y:4}]
```

### Multi-series Data
```
Input: [1,2] and [3,4]
Output: Multiple data series with different colors
```

## For Developers

If you want to contribute to this project or build it from source, please see the [Developer Guide](DEVELOPER.md).

## License

MIT License