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
exports.WORKSPACE_SEARCH_EXCLUDE_GLOB = void 0;
exports.getPrimaryWorkspaceFolder = getPrimaryWorkspaceFolder;
exports.getWorkspaceName = getWorkspaceName;
exports.inferPresetIdFromPath = inferPresetIdFromPath;
exports.inferStudioProjectIdFromPath = inferStudioProjectIdFromPath;
const vscode = __importStar(require("vscode"));
const presets_js_1 = require("../config/presets.js");
const studioProjects_js_1 = require("../config/studioProjects.js");
exports.WORKSPACE_SEARCH_EXCLUDE_GLOB = "**/{node_modules,dist,out,build,.git,.next,coverage,venv,.venv,__pycache__,.turbo}/**";
function getPrimaryWorkspaceFolder() {
    return vscode.workspace.workspaceFolders?.[0];
}
function getWorkspaceName() {
    return getPrimaryWorkspaceFolder()?.name ?? "Current Workspace";
}
function inferPresetIdFromPath(input) {
    return inferIdFromPath(input, presets_js_1.NSS_PRESETS.map((preset) => preset.id)) ?? "general-nss-studio";
}
function inferStudioProjectIdFromPath(input) {
    return inferIdFromPath(input, studioProjects_js_1.STUDIO_PROJECTS.map((project) => project.id)) ?? "general-nss-studio";
}
function inferIdFromPath(input, knownIds) {
    const normalized = (input ?? "").toLowerCase();
    return knownIds.find((id) => normalized.includes(id));
}
//# sourceMappingURL=workspace.js.map