import type { GoalInput, RouteDecision, WorkflowDefinition, WorkflowPlan, WorkflowPlanningContext } from "../core/types.js";
import { intakeGoal } from "../intake/index.js";
import { routeGoal } from "../router/index.js";
import { planGoal } from "../planner/index.js";
import { createJobEngine, type JobEngineDependencies } from "../jobs/job-engine.js";
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

export function createPhase1Surface(): Phase1Surface {
  return {
    intakeGoal,
    routeGoal,
    planGoal,
    createJobEngine,
  };
}

export function buildPhase1Pipeline(
  goalInput: unknown,
  workflow: WorkflowDefinition,
  planningContext: WorkflowPlanningContext,
  engineDependencies: JobEngineDependencies,
): Phase1Pipeline {
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
