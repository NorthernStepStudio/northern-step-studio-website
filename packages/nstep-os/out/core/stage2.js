import { createJobMemory } from "../memory/index.js";
import { executeStep as executeStepContract } from "../executor/index.js";
import { buildDashboardSnapshot, buildWorkflowReport } from "../reporting/index.js";
import { planGoal } from "../planner/index.js";
import { routeGoal } from "../router/index.js";
import { intakeGoal } from "../intake/index.js";
import { verifyJob as verifyJobContract } from "../verifier/index.js";
export * from "./stage2-models.js";
export * from "./stage2-orchestrator.js";
export function createStage2Bridge() {
    return {
        intakeGoal,
        routeGoal,
        planGoal,
        executeStep: executeStepContract,
        verifyJob: verifyJobContract,
        createJobMemory,
        buildWorkflowReport,
        buildDashboardSnapshot,
    };
}
//# sourceMappingURL=stage2.js.map