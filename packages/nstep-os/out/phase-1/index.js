import { intakeGoal } from "../intake/index.js";
import { routeGoal } from "../router/index.js";
import { planGoal } from "../planner/index.js";
import { createJobEngine } from "../jobs/job-engine.js";
export function createPhase1Surface() {
    return {
        intakeGoal,
        routeGoal,
        planGoal,
        createJobEngine,
    };
}
export function buildPhase1Pipeline(goalInput, workflow, planningContext, engineDependencies) {
    const goal = intakeGoal(goalInput);
    const route = routeGoal(goal);
    const plan = planGoal(goal, workflow, planningContext);
    const engine = createJobEngine(engineDependencies);
    return {
        goal,
        route,
        plan,
        engine,
    };
}
//# sourceMappingURL=index.js.map