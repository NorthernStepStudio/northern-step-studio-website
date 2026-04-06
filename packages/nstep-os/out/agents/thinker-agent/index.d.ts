import { type Stage2AgentDescriptor, type Stage2AgentFactoryContext, type Stage2Bridge, type Stage2ThinkRequest, type Stage2ThinkResult } from "../../core/stage2-models.js";
export interface ThinkerAgent extends Stage2AgentDescriptor {
    think(request: Stage2ThinkRequest): Stage2ThinkResult;
}
export declare function createThinkerAgent(context: Stage2AgentFactoryContext, bridge: Stage2Bridge): ThinkerAgent;
