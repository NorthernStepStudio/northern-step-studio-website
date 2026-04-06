"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runWorkflowSmoke = runWorkflowSmoke;
const node_assert_1 = require("node:assert");
const workflowDefinitions_js_1 = require("../../services/workflow/workflowDefinitions.js");
const workflowService_js_1 = require("../../services/workflow/workflowService.js");
function runWorkflowSmoke() {
    const definition = (0, workflowDefinitions_js_1.getWorkflowDefinition)("debug-build-failure");
    node_assert_1.strict.ok(definition);
    const run = (0, workflowService_js_1.startWorkflow)(definition);
    node_assert_1.strict.equal(run.currentStepIndex, 0);
    const nextRun = (0, workflowDefinitions_js_1.advanceWorkflowRun)(run);
    node_assert_1.strict.equal(nextRun.currentStepIndex, 1);
}
//# sourceMappingURL=workflow.smoke.js.map