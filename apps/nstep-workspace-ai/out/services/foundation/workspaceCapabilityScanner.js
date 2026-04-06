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
exports.analyzeWorkspaceCapabilityProfile = analyzeWorkspaceCapabilityProfile;
const vscode = __importStar(require("vscode"));
const dependencyAnalysisService_js_1 = require("../codebase/dependencyAnalysisService.js");
const workspace_js_1 = require("../../helpers/workspace.js");
const workspaceCapabilityService_js_1 = require("./workspaceCapabilityService.js");
async function analyzeWorkspaceCapabilityProfile(workspaceFolder) {
    const workspaceName = workspaceFolder?.name ?? "Current Workspace";
    const workspacePath = workspaceFolder?.uri.fsPath;
    const packageSnapshots = await collectPackageSnapshots();
    const dependencyGraph = await (0, dependencyAnalysisService_js_1.analyzeProjectDependencies)();
    return (0, workspaceCapabilityService_js_1.inferWorkspaceCapabilityProfile)({
        workspaceName,
        workspacePath,
        packageSnapshots,
        dependencyGraph,
    });
}
async function collectPackageSnapshots() {
    const packageFiles = await vscode.workspace.findFiles("**/package.json", workspace_js_1.WORKSPACE_SEARCH_EXCLUDE_GLOB, 100);
    const snapshots = [];
    for (const uri of packageFiles) {
        try {
            const doc = await vscode.workspace.openTextDocument(uri);
            const json = JSON.parse(doc.getText());
            const allDeps = {
                ...(json.dependencies ?? {}),
                ...(json.devDependencies ?? {}),
                ...(json.peerDependencies ?? {}),
            };
            snapshots.push({
                path: vscode.workspace.asRelativePath(uri),
                name: json.name ?? vscode.workspace.asRelativePath(uri),
                dependencies: Object.keys(allDeps),
                scripts: Object.keys(json.scripts ?? {}),
            });
        }
        catch {
            continue;
        }
    }
    return snapshots;
}
//# sourceMappingURL=workspaceCapabilityScanner.js.map