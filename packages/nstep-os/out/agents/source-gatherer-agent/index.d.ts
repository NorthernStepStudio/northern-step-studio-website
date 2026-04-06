import { type Stage2AgentDescriptor, type Stage2AgentFactoryContext, type Stage2Bridge, type Stage2SourceRequest, type Stage2SourceResult } from "../../core/stage2-models.js";
export interface SourceGathererAgent extends Stage2AgentDescriptor {
    gatherSources(request: Stage2SourceRequest): Promise<Stage2SourceResult>;
}
export declare function createSourceGathererAgent(context: Stage2AgentFactoryContext, _bridge: Stage2Bridge): SourceGathererAgent;
