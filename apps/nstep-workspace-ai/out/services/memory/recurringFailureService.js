"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecurringFailure = createRecurringFailure;
exports.recallSimilarFailure = recallSimilarFailure;
function createRecurringFailure(projectId, summary) {
    return {
        id: `failure-${Date.now()}`,
        projectId,
        summary,
        createdAt: new Date().toISOString(),
    };
}
function recallSimilarFailure(failures, query) {
    const normalizedQuery = query.toLowerCase();
    return failures.find((failure) => failure.summary.toLowerCase().includes(normalizedQuery));
}
//# sourceMappingURL=recurringFailureService.js.map