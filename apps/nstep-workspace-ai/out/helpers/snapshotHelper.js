"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAppSnapshot = generateAppSnapshot;
const vscode = __importStar(require("vscode"));
async function generateAppSnapshot(workspaceRoot) {
    let structureSummary = "Project Structure:\n";
    try {
        const files = await vscode.workspace.findFiles("**/*", "**/node_modules/**", 100);
        const structure = files
            .map(f => vscode.workspace.asRelativePath(f))
            .sort()
            .join("\n");
        structureSummary += structure || "No files found in workspace root.";
    }
    catch (error) {
        structureSummary += `Error generating structure: ${error instanceof Error ? error.message : String(error)}`;
    }
    return {
        structureSummary,
        activeFile: vscode.window.activeTextEditor?.document.fileName
            ? vscode.workspace.asRelativePath(vscode.window.activeTextEditor.document.fileName)
            : undefined
    };
}
//# sourceMappingURL=snapshotHelper.js.map