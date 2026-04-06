import type { GoalInput, RouteDecision } from "../../core/types.js";
import { type Stage2AgentDescriptor, type Stage2AgentFactoryContext, type Stage2Bridge } from "../../core/stage2-models.js";
export interface RouterAgent extends Stage2AgentDescriptor {
    route(goal: GoalInput): RouteDecision;
}
export declare function createRouterAgent(_context: Stage2AgentFactoryContext, bridge: Stage2Bridge): RouterAgent;
