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
exports.getStorageLimits = getStorageLimits;
const vscode = __importStar(require("vscode"));
const defaults_js_1 = require("../config/defaults.js");
const limits_js_1 = require("../helpers/limits.js");
function getStorageLimits() {
    const config = vscode.workspace.getConfiguration("nssWorkspaceAi");
    return {
        responseHistory: defaults_js_1.DEFAULT_RESPONSE_HISTORY_LIMIT,
        reviewItems: (0, limits_js_1.clampMinimum)(config.get("maxReviewHistory", defaults_js_1.DEFAULT_MAX_REVIEW_HISTORY), 10),
        taskHistory: defaults_js_1.DEFAULT_TASK_HISTORY_LIMIT,
        diagnosticSessions: (0, limits_js_1.clampMinimum)(config.get("maxDiagnosticSessionHistory", defaults_js_1.DEFAULT_MAX_DIAGNOSTIC_SESSION_HISTORY), 3),
        projectRules: defaults_js_1.DEFAULT_PROJECT_RULE_LIMIT,
        repairPatterns: defaults_js_1.DEFAULT_REPAIR_PATTERN_LIMIT,
        recurringFailures: defaults_js_1.DEFAULT_RECURRING_FAILURE_LIMIT,
        knowledgeItems: defaults_js_1.DEFAULT_KNOWLEDGE_ITEM_LIMIT,
        roadmapNotes: defaults_js_1.DEFAULT_ROADMAP_NOTE_LIMIT,
    };
}
//# sourceMappingURL=storageLimits.js.map