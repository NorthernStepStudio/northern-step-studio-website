"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWorkflow = startWorkflow;
exports.cancelWorkflow = cancelWorkflow;
function startWorkflow(definition) {
    const now = new Date().toISOString();
    return {
        id: `workflow-${Date.now()}`,
        workflowId: definition.id,
        title: definition.title,
        steps: definition.steps,
        currentStepIndex: 0,
        status: "active",
        startedAt: now,
        updatedAt: now,
    };
}
function cancelWorkflow(run) {
    return {
        ...run,
        status: "cancelled",
        updatedAt: new Date().toISOString(),
    };
}
//# sourceMappingURL=workflowService.js.map