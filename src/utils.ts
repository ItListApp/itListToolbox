import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export function getTestFilePath(
  functionFile: string,
  functionName: string
): { testFile?: string; testRange?: vscode.Range } {
  const functionDir = path.dirname(functionFile);
  const { relativeFunctionDir, rootDir } = getRelativePath(functionDir);
  if (!relativeFunctionDir || !rootDir) {
    vscode.window.showInformationMessage(
      `No workspace folders found that match the current function dir: functionDir=${functionDir} - vscode.workspace.workspaceFolders=${JSON.stringify(
        vscode.workspace.workspaceFolders
      )}`
    );
    return {};
  }
  let currentDir = functionDir;

  while (true) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      const testFile = path.join(currentDir, file);
      const stat = fs.statSync(testFile);
      if (stat.isFile() && file.endsWith(".test.ts")) {
        const testRange = findTestRange(testFile, functionName);
        if (testRange) {
          return { testFile, testRange };
        }
      }
    }

    const parentDir = path.dirname(currentDir);
    if (currentDir === parentDir || currentDir === rootDir) {
      break;
    }

    currentDir = parentDir;
  }

  return {};
}

function getRelativePath(dir: string): {
  relativeFunctionDir?: string;
  rootDir?: string;
} {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders?.length) {
    vscode.window.showInformationMessage(
      `No workspace folders found: vscode.workspace.workspaceFolders=${vscode.workspace.workspaceFolders}`
    );
    return {};
  }
  for (const workspaceFolder of workspaceFolders) {
    const rootDir = workspaceFolder.uri.fsPath;
    if (dir.startsWith(rootDir)) {
      return { relativeFunctionDir: path.relative(rootDir, dir), rootDir };
    }
  }
  return {};
}

function findTestRange(
  testFile: string,
  functionName: string
): vscode.Range | undefined {
  const testText = fs.readFileSync(testFile, "utf8");
  const describeRegex = new RegExp(
    `describe\\s*\\(\\s*['"\`]${functionName}['"\`]`
  );
  const describeMatch = testText.match(describeRegex);

  if (describeMatch) {
    const describeLine = testText
      .substring(0, describeMatch.index)
      .split("\n").length;
    const startLine = describeLine - 1;
    const endLine = startLine + describeMatch[0].split("\n").length;

    return new vscode.Range(startLine, 0, endLine, 0);
  }

  return undefined;
}

export function getWordAtPosition(
  document: vscode.TextDocument,
  position: vscode.Position
): string | undefined {
  const wordRange = document.getWordRangeAtPosition(position);
  if (wordRange) {
    return document.getText(wordRange);
  }

  return undefined;
}
