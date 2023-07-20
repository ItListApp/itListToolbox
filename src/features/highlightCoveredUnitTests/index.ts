import * as vscode from "vscode";
import { getTestFilePath } from "../../utils";

function updateDecorations(
  editor: vscode.TextEditor,
  decorationType: vscode.TextEditorDecorationType
) {
  const document = editor.document;
  if (!isTSFile(document.fileName)) {
    return;
  }
  const decorations: vscode.DecorationOptions[] = [];
  const constRegex = /^export\s+const\s+(\w+)/;
  const functionRegex = /^export\s+function\s+(\w+)/;

  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    const functionName =
      line.text.match(constRegex)?.[1] || line.text.match(functionRegex)?.[1];
    if (functionName) {
      const hasTests = getTestFilePath(
        document.fileName,
        functionName
      )?.testFile;
      if (hasTests) {
        const decoration = {
          range: new vscode.Range(line.range.start, line.range.end),
          hoverMessage: "Covered by unit tests ✅",
        };
        decorations.push(decoration);
      }
    }
  }

  editor.setDecorations(decorationType, decorations);
}

function isTSFile(fileName: string): boolean {
  return /\.ts$/i.test(fileName) && !/\.[^\.]+\.ts$/i.test(fileName);
}

export function activateHighlight(context: vscode.ExtensionContext) {
  let timeout: NodeJS.Timer | undefined = undefined;
  let activeEditor = vscode.window.activeTextEditor;
  const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: "rgba(0,100,0,0.3)",
  });

  function triggerUpdateDecorations(throttle = false) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
    if (!activeEditor) {
      throw new Error("no active editor");
    }
    if (throttle) {
      timeout = ((editor) =>
        setTimeout(() => updateDecorations(editor, decorationType), 500))(
        activeEditor
      );
    } else {
      updateDecorations(activeEditor, decorationType);
    }
  }

  if (activeEditor) {
    triggerUpdateDecorations();
  }

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor;
      if (editor) {
        triggerUpdateDecorations();
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateDecorations(true);
      }
    },
    null,
    context.subscriptions
  );
}
