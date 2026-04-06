"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKFLOW_DEFINITIONS = void 0;
exports.getWorkflowDefinition = getWorkflowDefinition;
exports.advanceWorkflowRun = advanceWorkflowRun;
exports.WORKFLOW_DEFINITIONS = [
    {
        id: "debug-build-failure",
        title: "Debug Build Failure",
        description: "Triage a failed build or typecheck run and work toward a fix.",
        steps: ["Run task", "Explain failure", "Find likely error files", "Propose or apply fix"],
    },
    {
        id: "plan-feature-change",
        title: "Plan Feature Change",
        description: "Inspect impacted files and produce a human-readable change plan.",
        steps: ["Explain project structure", "Find related files", "Plan change", "Propose edits"],
    },
    {
        id: "analyze-current-file",
        title: "Analyze Current File",
        description: "Understand an active file before editing it.",
        steps: ["Explain file", "Ask about current file", "Generate from selection", "Propose edit"],
    },
    {
        id: "generate-launch-copy",
        title: "Generate Launch Copy",
        description: "Use workspace docs and current mode to draft messaging safely.",
        steps: ["Rebuild knowledge packs", "Show workspace briefing", "Search knowledge", "Ask workspace AI"],
    },
];
function getWorkflowDefinition(workflowId) {
    return exports.WORKFLOW_DEFINITIONS.find((workflow) => workflow.id === workflowId);
}
function advanceWorkflowRun(workflow) {
    if (workflow.currentStepIndex >= workflow.steps.length - 1) {
        return {
            ...workflow,
            status: "completed",
            updatedAt: new Date().toISOString(),
        };
    }
    return {
        ...workflow,
        currentStepIndex: workflow.currentStepIndex + 1,
        updatedAt: new Date().toISOString(),
    };
}
//# sourceMappingURL=workflowDefinitions.js.map