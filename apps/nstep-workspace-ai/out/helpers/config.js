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
exports.getRuntimeConfig = getRuntimeConfig;
const vscode = __importStar(require("vscode"));
const defaults_js_1 = require("../config/defaults.js");
const workspace_js_1 = require("./workspace.js");
const serverUrl_js_1 = require("./serverUrl.js");
function getRuntimeConfig() {
    const config = vscode.workspace.getConfiguration("nssWorkspaceAi");
    const resolvedServerUrl = (0, serverUrl_js_1.resolveServerUrl)({
        configuredServerUrl: config.get("serverUrl", defaults_js_1.DEFAULT_BACKEND_URL),
        workspaceRoot: (0, workspace_js_1.getPrimaryWorkspaceFolder)()?.uri.fsPath,
        defaultServerUrl: defaults_js_1.DEFAULT_BACKEND_URL,
    });
    return {
        serverUrl: resolvedServerUrl.serverUrl,
        serverUrlSource: resolvedServerUrl.source,
        defaultMode: config.get("defaultMode", defaults_js_1.DEFAULT_MODE),
        autoSuggestPresetForWorkspace: config.get("autoSuggestPresetForWorkspace", true),
        maxReviewHistory: config.get("maxReviewHistory", defaults_js_1.DEFAULT_MAX_REVIEW_HISTORY),
        maxDiagnosticSessionHistory: config.get("maxDiagnosticSessionHistory", defaults_js_1.DEFAULT_MAX_DIAGNOSTIC_SESSION_HISTORY),
    };
}
//# sourceMappingURL=config.js.map