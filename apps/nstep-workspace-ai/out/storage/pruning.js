"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pruneWorkspaceState = pruneWorkspaceState;
const limits_js_1 = require("../helpers/limits.js");
function pruneWorkspaceState(state, limits) {
    return {
        ...state,
        responseHistory: (0, limits_js_1.limitItems)(state.responseHistory, limits.responseHistory),
        reviewItems: (0, limits_js_1.limitItems)(state.reviewItems, limits.reviewItems),
        taskHistory: (0, limits_js_1.limitItems)(state.taskHistory, limits.taskHistory),
        diagnosticSessions: (0, limits_js_1.limitItems)(state.diagnosticSessions, limits.diagnosticSessions),
        projectRules: (0, limits_js_1.limitItems)(state.projectRules, limits.projectRules),
        repairPatterns: (0, limits_js_1.limitItems)(state.repairPatterns, limits.repairPatterns),
        recurringFailures: (0, limits_js_1.limitItems)(state.recurringFailures, limits.recurringFailures),
        knowledgeItems: (0, limits_js_1.limitItems)(state.knowledgeItems, limits.knowledgeItems),
        roadmapNotes: (0, limits_js_1.limitItems)(state.roadmapNotes, limits.roadmapNotes),
    };
}
//# sourceMappingURL=pruning.js.map