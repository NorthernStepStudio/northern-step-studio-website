import type { GoalInput, RouteDecision } from "../../core/types.js";
import {
  defineStage2Permission,
  defineStage2Responsibility,
  type Stage2AgentDescriptor,
  type Stage2AgentFactoryContext,
  type Stage2Bridge,
} from "../../core/stage2-models.js";

const routerResponsibilities = [
  defineStage2Responsibility(
    "Goal classification",
    "Classifies the incoming goal into a route, lane, and execution posture before the job engine starts work.",
    ["routeGoal"],
  ),
  defineStage2Responsibility(
    "Risk triage",
    "Detects when the request should stay in assist mode or require an approval checkpoint.",
    ["routeGoal", "approval gating"],
  ),
  defineStage2Responsibility(
    "Routing rationale",
    "Produces a concise routing reason that the rest of the runtime can audit and display.",
    ["routeGoal", "workflow logs"],
  ),
] as const;

const routerPermissions = [
  defineStage2Permission("route", ["classify"], "May classify goals into workflow routes and risk tiers."),
] as const;

export interface RouterAgent extends Stage2AgentDescriptor {
  route(goal: GoalInput): RouteDecision;
}

export function createRouterAgent(_context: Stage2AgentFactoryContext, bridge: Stage2Bridge): RouterAgent {
  return {
    id: "router-agent",
    title: "NStep Router Agent",
    stage: "stage2",
    responsibilities: routerResponsibilities,
    permissions: routerPermissions,
    route: bridge.routeGoal,
  };
}
