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
exports.registerMemoryCommands = registerMemoryCommands;
const vscode = __importStar(require("vscode"));
const node_crypto_1 = require("node:crypto");
const editor_js_1 = require("../helpers/editor.js");
const paths_js_1 = require("../helpers/paths.js");
function registerMemoryCommands(context, store) {
    context.subscriptions.push(vscode.commands.registerCommand("nssWorkspaceAi.rememberSelection", async () => {
        const editor = (0, editor_js_1.requireActiveEditor)();
        const selection = (0, editor_js_1.getTrimmedSelection)(editor);
        if (!selection) {
            vscode.window.showWarningMessage("Select some text for NSS to remember.");
            return;
        }
        const tagsInput = await vscode.window.showInputBox({
            prompt: "Enter tags for this memory (comma separated)",
            placeHolder: "e.g. styling, layout, header",
        });
        const tags = tagsInput ? tagsInput.split(",").map(t => t.trim()).filter(Boolean) : [];
        const state = store.snapshot();
        await store.update((draft) => {
            draft.persistentMemories.push({
                id: (0, node_crypto_1.randomUUID)(),
                projectId: state.studioProjectId,
                tags,
                content: selection,
                importance: 3,
                createdAt: new Date().toISOString(),
            });
        });
        vscode.window.showInformationMessage(`NSS remembered this selection from ${(0, paths_js_1.toWorkspaceRelativePath)(editor.document.uri)}.`);
    }), vscode.commands.registerCommand("nssWorkspaceAi.showMemories", async () => {
        const state = store.snapshot();
        const memories = state.persistentMemories.filter(m => m.projectId === state.studioProjectId);
        if (memories.length === 0) {
            vscode.window.showInformationMessage("NSS hasn't remembered anything for this project yet.");
            return;
        }
        const picked = await vscode.window.showQuickPick(memories.map(m => ({
            label: m.tags.join(", ") || "No tags",
            description: m.content.substring(0, 100).replace(/\n/g, " "),
            memory: m,
        })), { placeHolder: "Select a memory to view or delete" });
        if (!picked)
            return;
        const action = await vscode.window.showQuickPick(["View", "Delete"], {
            placeHolder: `Memory: ${picked.label}`,
        });
        if (action === "View") {
            const doc = await vscode.workspace.openTextDocument({
                content: picked.memory.content,
                language: "markdown",
            });
            await vscode.window.showTextDocument(doc);
        }
        else if (action === "Delete") {
            await store.update((draft) => {
                draft.persistentMemories = draft.persistentMemories.filter(m => m.id !== picked.memory.id);
            });
            vscode.window.showInformationMessage("NSS has forgotten that memory.");
        }
    }));
}
//# sourceMappingURL=memoryCommands.js.map