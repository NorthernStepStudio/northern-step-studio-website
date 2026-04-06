"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveWorkflowStep = getActiveWorkflowStep;
function getActiveWorkflowStep(activeWorkflow) {
    if (!activeWorkflow) {
        return undefined;
    }
    return activeWorkflow.steps[activeWorkflow.currentStepIndex] ?? "Complete";
}
//# sourceMappingURL=workflowState.js.map