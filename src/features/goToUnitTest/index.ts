import * as vscode from "vscode";
import { getTestFilePath, getWordAtPosition } from "../../utils";

function linkUnitTest() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const document = editor.document;
  const position = editor.selection.active;
  const functionName = getWordAtPosition(document, position);
  if (!functionName) {
    return;
  }

  const functionFile = document.fileName;
  const { testFile, testRange } = getTestFilePath(functionFile, functionName);
  if (!testFile || !testRange) {
    vscode.window.showInformationMessage(
      `No unit test found for function "${functionName}"`
    );
    return;
  }

  const testUri = vscode.Uri.file(testFile);
  vscode.workspace.openTextDocument(testUri).then((doc) => {
    vscode.window.showTextDocument(doc, { selection: testRange });
  });
}

export function activateGoToUnitTest(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "it-list-toolbox.go-to-unit-test",
    () => {
      linkUnitTest();
    }
  );

  context.subscriptions.push(disposable);
}
