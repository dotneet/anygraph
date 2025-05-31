import * as vscode from 'vscode';
import { Dataset } from '@anygraph/core';

export class GraphViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'anygraph.graphView';

    private _view?: vscode.WebviewView;
    private _currentData?: { rawText: string; dataset: Dataset };

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            message => {
                switch (message.type) {
                    case 'ready':
                        // Webview is ready, send current data if available
                        if (this._currentData) {
                            this._sendDataToWebview(this._currentData.rawText, this._currentData.dataset);
                        }
                        break;
                    case 'error':
                        vscode.window.showErrorMessage(`AnyGraph Error: ${message.message}`);
                        break;
                    case 'info':
                        vscode.window.showInformationMessage(`AnyGraph: ${message.message}`);
                        break;
                }
            },
            undefined,
            []
        );
    }

    public updateData(rawText: string, dataset: Dataset) {
        this._currentData = { rawText, dataset };
        
        if (this._view) {
            this._sendDataToWebview(rawText, dataset);
        }
    }

    private _sendDataToWebview(rawText: string, dataset: Dataset) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'data',
                payload: {
                    rawText,
                    dataset
                }
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        // Get the local path to main script run in the webview
        const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js');
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-eval';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AnyGraph</title>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                        font-family: var(--vscode-font-family);
                        font-size: var(--vscode-font-size);
                        height: 100vh;
                        overflow: hidden;
                    }
                    
                    #anygraph-container {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                    }
                    
                    .loading {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100%;
                        font-size: 14px;
                        color: var(--vscode-descriptionForeground);
                    }
                    
                    .error {
                        padding: 20px;
                        color: var(--vscode-errorForeground);
                        background-color: var(--vscode-inputValidation-errorBackground);
                        border: 1px solid var(--vscode-inputValidation-errorBorder);
                        margin: 10px;
                        border-radius: 4px;
                    }
                    
                    .placeholder {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        height: 100%;
                        text-align: center;
                        padding: 20px;
                    }
                    
                    .placeholder h3 {
                        margin: 0 0 10px 0;
                        color: var(--vscode-foreground);
                    }
                    
                    .placeholder p {
                        margin: 5px 0;
                        color: var(--vscode-descriptionForeground);
                        font-size: 13px;
                    }
                    
                    .placeholder .shortcut {
                        background-color: var(--vscode-keybindingLabel-background);
                        color: var(--vscode-keybindingLabel-foreground);
                        border: 1px solid var(--vscode-keybindingLabel-border);
                        padding: 2px 6px;
                        border-radius: 3px;
                        font-family: monospace;
                        font-size: 11px;
                    }
                </style>
            </head>
            <body>
                <div id="anygraph-container">
                    <div class="placeholder">
                        <h3>AnyGraph</h3>
                        <p>Select data in your editor and use:</p>
                        <p><span class="shortcut">Ctrl+Shift+G</span> (or <span class="shortcut">Cmd+Shift+G</span> on Mac)</p>
                        <p>Or right-click and select "Visualize Selection"</p>
                    </div>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}