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
exports.analyzeProjectDependencies = analyzeProjectDependencies;
const vscode = __importStar(require("vscode"));
/**
 * Service to analyze monorepo dependencies and cross-app links.
 * Identifies internal (@nss/*) package references across all apps.
 */
async function analyzeProjectDependencies() {
    const analysis = [];
    try {
        const packageFiles = await vscode.workspace.findFiles("**/package.json", "**/node_modules/**", 20);
        for (const uri of packageFiles) {
            const doc = await vscode.workspace.openTextDocument(uri);
            const json = JSON.parse(doc.getText());
            const relPath = vscode.workspace.asRelativePath(uri);
            const appName = json.name || relPath;
            const allDeps = {
                ...(json.dependencies ?? {}),
                ...(json.devDependencies ?? {}),
                ...(json.peerDependencies ?? {}),
            };
            const dependencies = Object.keys(allDeps);
            // Internal links are packages scoped to @nss/ or that use workspace: protocol
            const internalLinks = dependencies.filter((d) => d.startsWith("@nss/") || allDeps[d]?.startsWith("workspace:"));
            analysis.push({ app: appName, dependencies, internalLinks });
        }
    }
    catch (err) {
        console.error("NSS: Dependency analysis failed", err);
    }
    return analysis;
}
//# sourceMappingURL=dependencyAnalysisService.js.map