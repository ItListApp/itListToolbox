import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { getTestFilePath, getWordAtPosition } from "../../utils";

function createComponent() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const document = editor.document;
  const position = editor.selection.active;
  const componentName = getWordAtPosition(document, position);
  if (!componentName) {
    vscode.window.showInformationMessage(
      `Can't create component, your cursor does not seem to be over a component name`
    );
    return;
  }
  if (componentName[0] !== componentName[0].toUpperCase()) {
    vscode.window.showInformationMessage(
      `Can't create component, ${componentName} does not start with an uppercase letter`
    );
    return;
  }
  const currentFile = document.fileName;
  const currentDir = path.dirname(currentFile);
  const componentDir = path.join(currentDir, componentName);

  if (fs.existsSync(componentDir)) {
    vscode.window.showInformationMessage(
      `Can't create component, the folder "${componentDir}" already exists`
    );
    return;
  }
  fs.mkdirSync(componentDir);
  fs.writeFileSync(
    path.join(currentDir, componentName, `${componentName}.tsx`),
    `const ${componentName}: React.FC<{}> = ({}) => {\n  return null\n}\n\nexport default ${componentName}`
  );
}

export function activateCreateComponent(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "it-list-toolbox.create-component",
    () => {
      createComponent();
    }
  );

  context.subscriptions.push(disposable);
}
