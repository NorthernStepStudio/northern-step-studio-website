"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRepairPattern = createRepairPattern;
function createRepairPattern(projectId, session) {
    return {
        id: `pattern-${Date.now()}`,
        projectId,
        title: session.title,
        symptom: session.summary,
        fix: session.notes[session.notes.length - 1] ?? "Review the linked task results and notes.",
        createdAt: new Date().toISOString(),
    };
}
//# sourceMappingURL=repairPatternService.js.map