import { createStage2Bridge } from "../core/stage2.js";
import { createCommunicationAgent } from "./communication-agent/index.js";
import { createExecutionAgent } from "./execution-agent/index.js";
import { createMemoryAgent } from "./memory-agent/index.js";
import { createPlannerAgent } from "./planner-agent/index.js";
import { createReportingAgent } from "./reporting-agent/index.js";
import { createResearchAgent } from "./research-agent/index.js";
import { createSourceGathererAgent } from "./source-gatherer-agent/index.js";
import { createRouterAgent } from "./router-agent/index.js";
import { createVerificationAgent } from "./verification-agent/index.js";
import { createThinkerAgent } from "./thinker-agent/index.js";
import { createSupervisorAgent } from "./supervisor-agent/index.js";
export function createStage2Agents(context = {}, bridge = createStage2Bridge()) {
    const thinker = createThinkerAgent(context, bridge);
    const supervisor = createSupervisorAgent(context, bridge);
    const router = createRouterAgent(context, bridge);
    const sourceGatherer = createSourceGathererAgent(context, bridge);
    const planner = createPlannerAgent(context, bridge);
    const research = createResearchAgent(context, bridge);
    const execution = createExecutionAgent(context, bridge);
    const communication = createCommunicationAgent(context, bridge);
    const verification = createVerificationAgent(context, bridge);
    const memory = createMemoryAgent(context, bridge);
    const reporting = createReportingAgent(context, bridge);
    const descriptors = [
        supervisor,
        thinker,
        router,
        sourceGatherer,
        planner,
        research,
        execution,
        communication,
        verification,
        memory,
        reporting,
    ];
    return {
        bridge,
        supervisor,
        thinker,
        router,
        sourceGatherer,
        planner,
        research,
        execution,
        communication,
        verification,
        memory,
        reporting,
        descriptors,
        list() {
            return descriptors;
        },
        get(agentId) {
            return descriptors.find((agent) => agent.id === agentId);
        },
    };
}
//# sourceMappingURL=index.js.map