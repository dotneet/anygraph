import * as vscode from 'vscode';
import { activate, deactivate } from './extension';

// Mock vscode module
jest.mock('vscode', () => ({
  commands: {
    registerCommand: jest.fn(),
    executeCommand: jest.fn(),
  },
  window: {
    registerWebviewViewProvider: jest.fn(),
    createStatusBarItem: jest.fn(() => ({
      command: '',
      text: '',
      tooltip: '',
      show: jest.fn(),
      hide: jest.fn(),
    })),
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn(),
    activeTextEditor: undefined,
    onDidChangeTextEditorSelection: jest.fn(),
    onDidChangeActiveTextEditor: jest.fn(),
  },
  StatusBarAlignment: {
    Right: 2,
  },
  Uri: {
    parse: jest.fn((uri) => ({ toString: () => uri })),
  },
  ExtensionContext: jest.fn(),
}));

// Mock GraphViewProvider
jest.mock('./providers/GraphViewProvider', () => ({
  GraphViewProvider: jest.fn().mockImplementation(() => ({
    updateData: jest.fn(),
    viewType: 'anygraph.graphView',
  })),
}));

// Mock parseData from core
jest.mock('@anygraph/core', () => ({
  parseData: jest.fn((text) => ({
    success: true,
    dataset: {
      dataType: 'values',
      values: [[1, 2, 3, 4]],
    },
  })),
}));

describe('Extension', () => {
  let mockContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext = {
      subscriptions: [],
      extensionUri: vscode.Uri.parse('file:///test'),
    } as any;
  });

  describe('activate', () => {
    it('should register commands and providers', () => {
      activate(mockContext);

      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        'anygraph.visualizeSelection',
        expect.any(Function)
      );
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        'anygraph.openGraph',
        expect.any(Function)
      );
      expect(vscode.window.registerWebviewViewProvider).toHaveBeenCalled();
    });

    it('should create status bar item', () => {
      activate(mockContext);

      expect(vscode.window.createStatusBarItem).toHaveBeenCalledWith(
        vscode.StatusBarAlignment.Right,
        100
      );
    });

    it('should add subscriptions to context', () => {
      activate(mockContext);

      expect(mockContext.subscriptions.length).toBeGreaterThan(0);
    });
  });

  describe('visualizeSelection command', () => {
    it('should show error when no active editor', () => {
      // Mock no active editor
      (vscode.window as any).activeTextEditor = undefined;

      activate(mockContext);

      // Get the registered command function
      const commandCall = (vscode.commands.registerCommand as jest.Mock).mock.calls
        .find(call => call[0] === 'anygraph.visualizeSelection');
      const commandFunction = commandCall[1];

      commandFunction();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        'No active editor found'
      );
    });

    it('should show error when no text selected', () => {
      // Mock active editor with empty selection
      (vscode.window as any).activeTextEditor = {
        selection: { isEmpty: true },
        document: {
          getText: jest.fn().mockReturnValue(''),
        },
      } as any;

      activate(mockContext);

      const commandCall = (vscode.commands.registerCommand as jest.Mock).mock.calls
        .find(call => call[0] === 'anygraph.visualizeSelection');
      const commandFunction = commandCall[1];

      commandFunction();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        'No text selected. Please select some data to visualize.'
      );
    });

    it('should process selected text successfully', () => {
      // Mock active editor with selection
      const mockSelection = { isEmpty: false } as any;
      const mockDocument = {
        getText: jest.fn().mockReturnValue('[1, 2, 3, 4]'),
      } as any;

      (vscode.window as any).activeTextEditor = {
        selection: mockSelection,
        document: mockDocument,
      } as any;

      activate(mockContext);

      const commandCall = (vscode.commands.registerCommand as jest.Mock).mock.calls
        .find(call => call[0] === 'anygraph.visualizeSelection');
      const commandFunction = commandCall[1];

      commandFunction();

      expect(mockDocument.getText).toHaveBeenCalledWith(mockSelection);
      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        'workbench.view.extension.anygraph'
      );
    });

    it('should handle parse errors', () => {
      // Mock parseData to return error
      const { parseData } = require('@anygraph/core');
      parseData.mockReturnValue({
        success: false,
        error: 'Invalid data format',
      });

      const mockSelection = { isEmpty: false } as any;
      const mockDocument = {
        getText: jest.fn().mockReturnValue('invalid data'),
      } as any;

      (vscode.window as any).activeTextEditor = {
        selection: mockSelection,
        document: mockDocument,
      } as any;

      activate(mockContext);

      const commandCall = (vscode.commands.registerCommand as jest.Mock).mock.calls
        .find(call => call[0] === 'anygraph.visualizeSelection');
      const commandFunction = commandCall[1];

      commandFunction();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        'Failed to parse data: Invalid data format'
      );
    });
  });

  describe('openGraph command', () => {
    it('should execute workbench command', () => {
      activate(mockContext);

      const commandCall = (vscode.commands.registerCommand as jest.Mock).mock.calls
        .find(call => call[0] === 'anygraph.openGraph');
      const commandFunction = commandCall[1];

      commandFunction();

      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        'workbench.view.extension.anygraph'
      );
    });
  });

  describe('status bar', () => {
    it('should configure status bar item correctly', () => {
      const mockStatusBarItem = {
        command: '',
        text: '',
        tooltip: '',
        show: jest.fn(),
        hide: jest.fn(),
      } as any;

      (vscode.window.createStatusBarItem as jest.Mock).mockReturnValue(mockStatusBarItem);

      activate(mockContext);

      expect(mockStatusBarItem.command).toBe('anygraph.visualizeSelection');
      expect(mockStatusBarItem.text).toBe('$(graph) AnyGraph');
      expect(mockStatusBarItem.tooltip).toBe('Visualize selected data with AnyGraph');
      expect(mockStatusBarItem.show).toHaveBeenCalled();
    });
  });

  describe('deactivate', () => {
    it('should log deactivation message', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      deactivate();

      expect(consoleSpy).toHaveBeenCalledWith(
        'AnyGraph extension is now deactivated'
      );

      consoleSpy.mockRestore();
    });
  });
});