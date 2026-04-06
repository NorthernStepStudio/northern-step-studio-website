import type { GoalInput, WorkflowDefinition, WorkflowPlan, WorkflowPlanningContext } from "../core/types.js";

export function planGoal(goal: GoalInput, workflow: WorkflowDefinition, context: WorkflowPlanningContext): WorkflowPlan {
  return workflow.buildPlan(goal, context);
}
