// VSCode API mock for testing
const vscode = {
  // Common enums
  ViewColumn: {
    One: 1,
    Two: 2,
    Three: 3,
    Active: -1,
    Beside: -2,
  },
  
  // Uri class
  Uri: {
    file: (path) => ({ scheme: 'file', path }),
    parse: (uri) => ({ scheme: 'file', path: uri }),
  },
  
  // WebviewPanel mock
  WebviewPanel: class {
    constructor() {
      this.webview = {
        html: '',
        onDidReceiveMessage: () => ({ dispose: () => {} }),
        postMessage: jest.fn(),
        cspSource: 'vscode-webview:',
        asWebviewUri: (uri) => uri,
      };
      this.onDidDispose = () => ({ dispose: () => {} });
      this.dispose = jest.fn();
      this.reveal = jest.fn();
    }
  },
  
  // Window API
  window: {
    createWebviewPanel: jest.fn(() => new vscode.WebviewPanel()),
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    activeTextEditor: {
      selection: {
        isEmpty: false,
      },
      document: {
        getText: jest.fn(() => 'sample text'),
      },
    },
  },
  
  // Commands API
  commands: {
    registerCommand: jest.fn(),
    executeCommand: jest.fn(),
  },
  
  // Workspace API
  workspace: {
    getConfiguration: jest.fn(() => ({
      get: jest.fn(),
      update: jest.fn(),
    })),
  },
  
  // Range class
  Range: class {
    constructor(start, end) {
      this.start = start;
      this.end = end;
    }
  },
  
  // Position class
  Position: class {
    constructor(line, character) {
      this.line = line;
      this.character = character;
    }
  },
  
  // ExtensionContext mock
  ExtensionContext: class {
    constructor() {
      this.subscriptions = [];
      this.extensionPath = '/mock/extension/path';
      this.globalState = {
        get: jest.fn(),
        update: jest.fn(),
      };
      this.workspaceState = {
        get: jest.fn(),
        update: jest.fn(),
      };
    }
  },
};

// Add Selection class after Range is defined
vscode.Selection = class extends vscode.Range {
  constructor(anchor, active) {
    super(anchor, active);
    this.anchor = anchor;
    this.active = active;
  }
};

module.exports = vscode;