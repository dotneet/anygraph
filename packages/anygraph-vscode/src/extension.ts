import * as vscode from 'vscode';
import { GraphViewProvider } from './providers/GraphViewProvider';
import { parseData } from '@anygraph/core';

export function activate(context: vscode.ExtensionContext) {
    console.log('AnyGraph extension is now active!');

    // Register the webview provider
    const provider = new GraphViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(GraphViewProvider.viewType, provider)
    );

    // Register commands
    const visualizeSelectionCommand = vscode.commands.registerCommand(
        'anygraph.visualizeSelection',
        () => {
            console.log('AnyGraph: visualizeSelection command triggered');
            
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                console.log('AnyGraph: No active editor found');
                vscode.window.showErrorMessage('No active editor found');
                return;
            }

            const selection = editor.selection;
            console.log('AnyGraph: Selection:', {
                isEmpty: selection.isEmpty,
                start: selection.start,
                end: selection.end,
                anchor: selection.anchor,
                active: selection.active
            });

            // Check if there's any selected text, including multi-line selections
            const selectedText = editor.document.getText(selection);
            console.log('AnyGraph: Selected text length:', selectedText.length);
            console.log('AnyGraph: Selected text preview:', selectedText.substring(0, 100));

            if (selection.isEmpty || selectedText.trim().length === 0) {
                console.log('AnyGraph: No text selected or empty selection');
                vscode.window.showErrorMessage('No text selected. Please select some data to visualize.');
                return;
            }
            
            // Parse the selected data
            const parseResult = parseData(selectedText);
            
            if (!parseResult.success) {
                vscode.window.showErrorMessage(
                    `Failed to parse data: ${parseResult.error}`
                );
                return;
            }

            // Send data to the webview
            provider.updateData(selectedText, parseResult.dataset!);
            
            // Show the webview
            vscode.commands.executeCommand('workbench.view.extension.anygraph');
        }
    );

    const openGraphCommand = vscode.commands.registerCommand(
        'anygraph.openGraph',
        () => {
            // Show the webview panel
            vscode.commands.executeCommand('workbench.view.extension.anygraph');
        }
    );

    context.subscriptions.push(visualizeSelectionCommand);
    context.subscriptions.push(openGraphCommand);

    // Register status bar item
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    statusBarItem.command = 'anygraph.visualizeSelection';
    statusBarItem.text = '$(graph) AnyGraph';
    statusBarItem.tooltip = 'Visualize selected data with AnyGraph';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Update status bar visibility based on selection
    const updateStatusBar = () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && !editor.selection.isEmpty) {
            statusBarItem.show();
        } else {
            statusBarItem.hide();
        }
    };

    // Listen for selection changes
    vscode.window.onDidChangeTextEditorSelection(updateStatusBar);
    vscode.window.onDidChangeActiveTextEditor(updateStatusBar);
    
    updateStatusBar();
}

export function deactivate() {
    console.log('AnyGraph extension is now deactivated');
}