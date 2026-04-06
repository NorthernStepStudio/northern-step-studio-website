import { type Stage2AgentDescriptor, type Stage2AgentFactoryContext, type Stage2Bridge, type Stage2ResearchRequest, type Stage2ResearchResult } from "../../core/stage2-models.js";
export interface ResearchAgent extends Stage2AgentDescriptor {
    research(request: Stage2ResearchRequest): Promise<Stage2ResearchResult>;
}
export declare function createResearchAgent(context: Stage2AgentFactoryContext, _bridge: Stage2Bridge): ResearchAgent;
