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
exports.buildProjectStructureSummary = buildProjectStructureSummary;
const vscode = __importStar(require("vscode"));
const files_js_1 = require("../../helpers/files.js");
async function buildProjectStructureSummary(folder) {
    const lines = [`Workspace root: ${folder.uri.fsPath}`, ""];
    const rootEntries = await (0, files_js_1.readDirectoryListing)(folder.uri);
    const visibleEntries = rootEntries
        .filter(([name]) => !name.startsWith("."))
        .sort(([left], [right]) => left.localeCompare(right))
        .slice(0, 10);
    for (const [name, type] of visibleEntries) {
        if (type === vscode.FileType.Directory) {
            const childUri = vscode.Uri.joinPath(folder.uri, name);
            const children = await (0, files_js_1.readDirectoryListing)(childUri);
            const preview = children
                .filter(([childName]) => !childName.startsWith("."))
                .sort(([left], [right]) => left.localeCompare(right))
                .slice(0, 5)
                .map(([childName]) => childName)
                .join(", ");
            lines.push(`- ${name}/ ${preview ? `(${preview})` : ""}`.trim());
            continue;
        }
        lines.push(`- ${name}`);
    }
    return lines.join("\n");
}
//# sourceMappingURL=projectTreeService.js.map