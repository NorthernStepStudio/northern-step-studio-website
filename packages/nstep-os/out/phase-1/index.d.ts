import type { GoalInput, RouteDecision, WorkflowDefinition, WorkflowPlan, WorkflowPlanningContext } from "../core/types.js";
import { intakeGoal } from "../intake/index.js";
import { routeGoal } from "../router/index.js";
import { planGoal } from "../planner/index.js";
import { type JobEngineDependencies } from "../jobs/job-engine.js";
import type { JobEngine } from "../jobs/job-engine.js";
export interface Phase1Surface {
    readonly intakeGoal: typeof intakeGoal;
    readonly routeGoal: typeof routeGoal;
    readonly planGoal: typeof planGoal;
    readonly createJobEngine: (deps: JobEngineDependencies) => JobEngine;
}
export interface Phase1Pipeline {
    readonly goal: GoalInput;
    readonly route: RouteDecision;
    readonly plan: WorkflowPlan;
    readonly engine: JobEngine;
}
export declare function createPhase1Surface(): Phase1Surface;
export declare function buildPhase1Pipeline(goalInput: unknown, workflow: WorkflowDefinition, planningContext: WorkflowPlanningContext, engineDependencies: JobEngineDependencies): Phase1Pipeline;
