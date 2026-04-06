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
exports.discoverProjectDocumentation = discoverProjectDocumentation;
const vscode = __importStar(require("vscode"));
const text_js_1 = require("../../helpers/text.js");
/**
 * Service to discover and summarize project documentation and meta-files.
 * This provides the AI with "Why" and "What's Next" context.
 */
async function discoverProjectDocumentation() {
    const docs = [];
    const docPatterns = [
        "**/README.md",
        "**/ARCHITECTURE.md",
        "**/TODO.md",
        "**/CHANGELOG.md",
        "**/ROADMAP.md",
    ];
    for (const pattern of docPatterns) {
        try {
            // Find the most relevant docs (up to 10)
            const uris = await vscode.workspace.findFiles(pattern, "**/node_modules/**", 10);
            for (const uri of uris) {
                const doc = await vscode.workspace.openTextDocument(uri);
                const text = doc.getText();
                const relPath = vscode.workspace.asRelativePath(uri);
                // We summarize docs by taking the first 3000 chars, 
                // focus is on headers and introductory text.
                docs.push({
                    path: relPath,
                    summary: (0, text_js_1.truncateText)(text, 3000),
                });
            }
        }
        catch (err) {
            console.error(`NSS: Documentation discovery failed for ${pattern}`, err);
        }
    }
    return docs;
}
//# sourceMappingURL=documentationDiscoveryService.js.map