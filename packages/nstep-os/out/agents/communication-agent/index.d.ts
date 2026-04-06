import { type Stage2AgentDescriptor, type Stage2AgentFactoryContext, type Stage2Bridge, type Stage2MessageDraft, type Stage2MessageRequest } from "../../core/stage2-models.js";
export interface CommunicationAgent extends Stage2AgentDescriptor {
    composeMessage(request: Stage2MessageRequest): Stage2MessageDraft;
}
export declare function createCommunicationAgent(context: Stage2AgentFactoryContext, _bridge: Stage2Bridge): CommunicationAgent;
