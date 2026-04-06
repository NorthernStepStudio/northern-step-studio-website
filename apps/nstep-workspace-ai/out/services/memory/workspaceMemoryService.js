"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWorkspaceMemoryContext = buildWorkspaceMemoryContext;
function buildWorkspaceMemoryContext(input) {
    return {
        projectRules: input.projectRules
            .filter((rule) => rule.projectId === input.projectId)
            .map((rule) => rule.rule)
            .slice(0, 6),
        repairPatterns: input.repairPatterns
            .filter((pattern) => pattern.projectId === input.projectId)
            .map((pattern) => `${pattern.title}: ${pattern.fix}`)
            .slice(0, 4),
        recurringFailures: input.recurringFailures
            .filter((failure) => failure.projectId === input.projectId)
            .map((failure) => failure.summary)
            .slice(0, 4),
        persistent: input.persistentMemories
            ?.map((memory) => `[RECALLED] ${memory.tags.join(", ")}: ${memory.content}`)
            .slice(0, 8),
    };
}
//# sourceMappingURL=workspaceMemoryService.js.map