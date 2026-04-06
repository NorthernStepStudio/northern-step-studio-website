"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearWorkspaceMemory = clearWorkspaceMemory;
function clearWorkspaceMemory(state) {
    state.projectRules = [];
    state.repairPatterns = [];
    state.recurringFailures = [];
    state.roadmapNotes = [];
    state.knowledgeItems = [];
}
//# sourceMappingURL=memoryState.js.map