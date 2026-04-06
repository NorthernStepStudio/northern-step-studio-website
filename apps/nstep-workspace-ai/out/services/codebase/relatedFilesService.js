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
exports.findRelatedFiles = findRelatedFiles;
const path = __importStar(require("node:path"));
const vscode = __importStar(require("vscode"));
const workspace_js_1 = require("../../helpers/workspace.js");
async function findRelatedFiles(uri, limit = 10) {
    const basename = path.parse(uri.fsPath).name;
    const sameNameMatches = await vscode.workspace.findFiles(`**/*${basename}*.*`, workspace_js_1.WORKSPACE_SEARCH_EXCLUDE_GLOB, limit * 3);
    const results = [];
    const seen = new Set();
    for (const match of sameNameMatches) {
        if (match.fsPath === uri.fsPath || seen.has(match.fsPath)) {
            continue;
        }
        seen.add(match.fsPath);
        results.push({
            path: match.fsPath,
            reason: path.dirname(match.fsPath) === path.dirname(uri.fsPath) ? "same folder" : "similar file name",
        });
        if (results.length >= limit) {
            break;
        }
    }
    return results;
}
//# sourceMappingURL=relatedFilesService.js.map