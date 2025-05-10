import * as vscode from 'vscode';
import * as diff from 'diff';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.compareCurrentWithDiff', async () => {
    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found');
      return;
    }

    // Read diff from clipboard
    const diffText = await vscode.env.clipboard.readText();
    if (!diffText) {
      vscode.window.showErrorMessage('Clipboard is empty');
      return;
    }

    try {
      // Get current file content
      const currentContent = editor.document.getText();

      // Parse and apply the diff
      const patches = diff.parsePatch(diffText);
      let modifiedContent: string | false = currentContent;

      for (const patch of patches) {
        modifiedContent = diff.applyPatch(modifiedContent, patch);
        if (modifiedContent === false) {
          vscode.window.showErrorMessage('Failed to apply diff');
          return;
        }
      }

      // Write modified content to clipboard
      await vscode.env.clipboard.writeText(modifiedContent);

      // Trigger VS Code's compare with clipboard command
      await vscode.commands.executeCommand('workbench.files.action.compareWithClipboard');
    } catch (error: any) {
      vscode.window.showErrorMessage(`Error: ${error.message}`);
    } finally {
      // Reset the clipboard
      await vscode.env.clipboard.writeText(diffText)
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() { }