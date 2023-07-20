import * as vscode from "vscode";
import { activateGoToUnitTest } from "./features/goToUnitTest";
import { activateHighlight } from "./features/highlightCoveredUnitTests";
import { activateCreateComponent } from "./features/createComponent";

export function activate(context: vscode.ExtensionContext) {
  activateGoToUnitTest(context);
  activateHighlight(context);
  activateCreateComponent(context);
}
