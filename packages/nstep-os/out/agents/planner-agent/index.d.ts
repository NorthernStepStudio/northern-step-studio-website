import type { GoalInput, WorkflowDefinition, WorkflowPlan, WorkflowPlanningContext } from "../../core/types.js";
import { type Stage2AgentDescriptor, type Stage2AgentFactoryContext, type Stage2Bridge } from "../../core/stage2-models.js";
export interface PlannerAgent extends Stage2AgentDescriptor {
    plan(goal: GoalInput, workflow: WorkflowDefinition, context: WorkflowPlanningContext): WorkflowPlan;
}
export declare function createPlannerAgent(_context: Stage2AgentFactoryContext, bridge: Stage2Bridge): PlannerAgent;
