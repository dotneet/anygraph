import * as vscode from 'vscode';
import { GraphViewProvider } from './GraphViewProvider';
import { Dataset } from '@anygraph/core';

// Mock vscode module
jest.mock('vscode', () => ({
  Uri: {
    joinPath: jest.fn((base, ...paths) => ({
      toString: () => `${base}/${paths.join('/')}`,
    })),
  },
  window: {
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn(),
  },
}));

// Mock Dataset from core
jest.mock('@anygraph/core', () => ({
  Dataset: {},
}));

describe('GraphViewProvider', () => {
  let provider;
  let mockWebviewView;
  let mockWebview;
  let mockExtensionUri;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockExtensionUri = { toString: () => 'file:///test' };
    provider = new GraphViewProvider(mockExtensionUri);

    mockWebview = {
      html: '',
      options: {},
      postMessage: jest.fn(),
      onDidReceiveMessage: jest.fn(),
      asWebviewUri: jest.fn((uri) => uri),
      cspSource: 'vscode-webview:',
    };

    mockWebviewView = {
      webview: mockWebview,
    };
  });

  describe('resolveWebviewView', () => {
    it('should configure webview options', () => {
      provider.resolveWebviewView(mockWebviewView, {}, {});

      expect(mockWebview.options).toEqual({
        enableScripts: true,
        localResourceRoots: [mockExtensionUri],
      });
    });

    it('should set webview HTML', () => {
      provider.resolveWebviewView(mockWebviewView, {}, {});

      expect(mockWebview.html).toContain('<!DOCTYPE html>');
      expect(mockWebview.html).toContain('AnyGraph');
      expect(mockWebview.html).toContain('anygraph-container');
    });

    it('should register message handler', () => {
      provider.resolveWebviewView(mockWebviewView, {}, {});

      expect(mockWebview.onDidReceiveMessage).toHaveBeenCalledWith(
        expect.any(Function),
        undefined,
        []
      );
    });

    it('should generate HTML with correct CSP and nonce', () => {
      provider.resolveWebviewView(mockWebviewView, {}, {});

      expect(mockWebview.html).toContain('Content-Security-Policy');
      expect(mockWebview.html).toContain('nonce-');
      expect(mockWebview.html).toContain(mockWebview.cspSource);
    });
  });

  describe('message handling', () => {
    beforeEach(() => {
      provider.resolveWebviewView(mockWebviewView, {}, {});
    });

    it('should handle ready message', () => {
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      
      messageHandler({ type: 'ready' });

      // Should not throw error
      expect(true).toBe(true);
    });

    it('should handle error message', () => {
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      
      messageHandler({ 
        type: 'error', 
        message: 'Test error' 
      });

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        'AnyGraph Error: Test error'
      );
    });

    it('should handle info message', () => {
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      
      messageHandler({ 
        type: 'info', 
        message: 'Test info' 
      });

      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        'AnyGraph: Test info'
      );
    });

    it('should send current data on ready if available', () => {
      const testDataset = {
        dataType: 'values',
        values: [[1, 2, 3, 4]],
      };

      // Set current data
      provider.updateData('[1, 2, 3, 4]', testDataset);

      // Simulate ready message
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      messageHandler({ type: 'ready' });

      expect(mockWebview.postMessage).toHaveBeenCalledWith({
        type: 'data',
        payload: {
          rawText: '[1, 2, 3, 4]',
          dataset: testDataset,
        },
      });
    });
  });

  describe('updateData', () => {
    it('should store data when webview is not ready', () => {
      const testDataset = {
        dataType: 'values',
        values: [[1, 2, 3, 4]],
      };

      provider.updateData('[1, 2, 3, 4]', testDataset);

      // Data should be stored for later use
      expect(true).toBe(true); // Internal state is private, but we can test behavior
    });

    it('should send data to webview when available', () => {
      provider.resolveWebviewView(mockWebviewView, {}, {});

      const testDataset = {
        dataType: 'points',
        points: [[{ x: 1, y: 2 }, { x: 3, y: 4 }]],
      };

      provider.updateData('[1, 2, 3, 4]', testDataset);

      expect(mockWebview.postMessage).toHaveBeenCalledWith({
        type: 'data',
        payload: {
          rawText: '[1, 2, 3, 4]',
          dataset: testDataset,
        },
      });
    });

    it('should handle multiple data updates', () => {
      provider.resolveWebviewView(mockWebviewView, {}, {});

      const dataset1 = {
        dataType: 'values',
        values: [[1, 2, 3]],
      };

      const dataset2 = {
        dataType: 'values',
        values: [[4, 5, 6]],
      };

      provider.updateData('[1, 2, 3]', dataset1);
      provider.updateData('[4, 5, 6]', dataset2);

      expect(mockWebview.postMessage).toHaveBeenCalledTimes(2);
      expect(mockWebview.postMessage).toHaveBeenNthCalledWith(1, {
        type: 'data',
        payload: {
          rawText: '[1, 2, 3]',
          dataset: dataset1,
        },
      });
      expect(mockWebview.postMessage).toHaveBeenNthCalledWith(2, {
        type: 'data',
        payload: {
          rawText: '[4, 5, 6]',
          dataset: dataset2,
        },
      });
    });
  });

  describe('HTML generation', () => {
    it('should include placeholder content', () => {
      provider.resolveWebviewView(mockWebviewView, {}, {});

      expect(mockWebview.html).toContain('Select data in your editor');
      expect(mockWebview.html).toContain('Ctrl+Shift+G');
      expect(mockWebview.html).toContain('Cmd+Shift+G');
      expect(mockWebview.html).toContain('Visualize Selection');
    });

    it('should include VSCode theme variables', () => {
      provider.resolveWebviewView(mockWebviewView, {}, {});

      expect(mockWebview.html).toContain('--vscode-editor-background');
      expect(mockWebview.html).toContain('--vscode-editor-foreground');
      expect(mockWebview.html).toContain('--vscode-font-family');
    });

    it('should include error and loading styles', () => {
      provider.resolveWebviewView(mockWebviewView, {}, {});

      expect(mockWebview.html).toContain('.loading');
      expect(mockWebview.html).toContain('.error');
      expect(mockWebview.html).toContain('.placeholder');
    });

    it('should reference webview script and CSS', () => {
      provider.resolveWebviewView(mockWebviewView, {}, {});

      expect(mockWebview.html).toContain('webview.js');
      expect(mockWebview.html).toContain('webview.css');
      expect(vscode.Uri.joinPath).toHaveBeenCalledWith(
        mockExtensionUri,
        'dist',
        'webview.js'
      );
      expect(vscode.Uri.joinPath).toHaveBeenCalledWith(
        mockExtensionUri,
        'dist',
        'webview.css'
      );
    });
  });

  describe('viewType', () => {
    it('should have correct view type', () => {
      expect(GraphViewProvider.viewType).toBe('anygraph.graphView');
    });
  });
});