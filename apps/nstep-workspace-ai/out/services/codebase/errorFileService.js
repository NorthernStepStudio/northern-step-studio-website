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
exports.findLikelyErrorFilesFromOutput = findLikelyErrorFilesFromOutput;
const path = __importStar(require("node:path"));
const vscode = __importStar(require("vscode"));
const workspace_js_1 = require("../../helpers/workspace.js");
const FILE_REFERENCE_PATTERN = /((?:[A-Za-z]:)?[\\/][^:\r\n]+?\.(?:ts|tsx|js|jsx|json|css|html|md|py)|(?:src|apps|docs|packages)[\\/][^:\r\n]+?\.(?:ts|tsx|js|jsx|json|css|html|md|py))/g;
async function findLikelyErrorFilesFromOutput(output, limit = 8) {
    const directMatches = [...output.matchAll(FILE_REFERENCE_PATTERN)]
        .map((match) => match[1])
        .filter(Boolean);
    const normalizedMatches = dedupeAndNormalizePaths(directMatches);
    if (normalizedMatches.length > 0) {
        return normalizedMatches.slice(0, limit);
    }
    const fallbackQuery = extractFallbackQuery(output);
    if (!fallbackQuery) {
        return [];
    }
    const searchMatches = await vscode.workspace.findFiles(`**/*${fallbackQuery}*.*`, workspace_js_1.WORKSPACE_SEARCH_EXCLUDE_GLOB, limit);
    return searchMatches.map((uri) => uri.fsPath);
}
function dedupeAndNormalizePaths(paths) {
    const seen = new Set();
    const resolved = [];
    for (const value of paths) {
        const normalized = value.replace(/\//g, path.sep).trim();
        if (!normalized || seen.has(normalized)) {
            continue;
        }
        seen.add(normalized);
        resolved.push(normalized);
    }
    return resolved;
}
function extractFallbackQuery(output) {
    const match = output.match(/(?:module|file|import)\s+['"]?([A-Za-z0-9_.-]{3,})/i);
    return match?.[1];
}
//# sourceMappingURL=errorFileService.js.map