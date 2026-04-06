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
exports.rebuildKnowledgePacks = rebuildKnowledgePacks;
const vscode = __importStar(require("vscode"));
const text_js_1 = require("../../helpers/text.js");
const docDiscoveryService_js_1 = require("./docDiscoveryService.js");
async function rebuildKnowledgePacks(activePresetId) {
    const docs = await (0, docDiscoveryService_js_1.discoverWorkspaceDocs)();
    const items = [];
    for (const uri of docs) {
        const content = Buffer.from(await vscode.workspace.fs.readFile(uri)).toString("utf8");
        items.push({
            id: `knowledge-${uri.fsPath}`,
            title: uri.path.split("/").at(-1) ?? uri.fsPath,
            path: uri.fsPath,
            excerpt: (0, text_js_1.truncateText)(content.trim(), 500),
            linkedPresetIds: uri.fsPath.toLowerCase().includes(activePresetId) ? [activePresetId] : [],
            updatedAt: new Date().toISOString(),
        });
    }
    return items;
}
//# sourceMappingURL=knowledgePackService.js.map