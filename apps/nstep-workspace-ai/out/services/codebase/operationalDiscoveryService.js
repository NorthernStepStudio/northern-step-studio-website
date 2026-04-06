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
exports.discoverOperationalConfig = discoverOperationalConfig;
const vscode = __importStar(require("vscode"));
const text_js_1 = require("../../helpers/text.js");
/**
 * Service to discover and summarize operational and deployment configurations.
 * This gives the AI awareness of how the project is built and shipped.
 */
async function discoverOperationalConfig() {
    const configs = [];
    const configPatterns = [
        "**/wrangler.toml",
        "**/vite.config.ts",
        "**/vite.config.js",
        "**/tsconfig.json",
        "**/package.json", // Focus on scripts
        "**/.env.example",
        "**/.dev.vars", // Safely truncated
    ];
    for (const pattern of configPatterns) {
        try {
            const uris = await vscode.workspace.findFiles(pattern, "**/node_modules/**", 15);
            for (const uri of uris) {
                const doc = await vscode.workspace.openTextDocument(uri);
                const text = doc.getText();
                const relPath = vscode.workspace.asRelativePath(uri);
                let summary = text;
                if (relPath.endsWith("package.json")) {
                    summary = summarizePackageScripts(text);
                }
                configs.push({
                    path: relPath,
                    summary: (0, text_js_1.truncateText)(summary, 2000),
                });
            }
        }
        catch (err) {
            console.error(`NSS: Operational discovery failed for ${pattern}`, err);
        }
    }
    return configs;
}
function summarizePackageScripts(text) {
    try {
        const json = JSON.parse(text);
        return JSON.stringify({
            name: json.name,
            scripts: json.scripts,
            engines: json.engines,
            workspaces: json.workspaces,
        }, null, 2);
    }
    catch {
        return text;
    }
}
//# sourceMappingURL=operationalDiscoveryService.js.map