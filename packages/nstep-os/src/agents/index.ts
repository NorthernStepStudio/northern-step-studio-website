import { createStage2Bridge } from "../core/stage2.js";
import type {
  Stage2AgentDescriptor,
  Stage2AgentFactoryContext,
  Stage2AgentId,
  Stage2Bridge,
} from "../core/stage2-models.js";
import { createCommunicationAgent, type CommunicationAgent } from "./communication-agent/index.js";
import { createExecutionAgent, type ExecutionAgent } from "./execution-agent/index.js";
import { createMemoryAgent, type MemoryAgent } from "./memory-agent/index.js";
import { createPlannerAgent, type PlannerAgent } from "./planner-agent/index.js";
import { createReportingAgent, type ReportingAgent } from "./reporting-agent/index.js";
import { createResearchAgent, type ResearchAgent } from "./research-agent/index.js";
import { createSourceGathererAgent, type SourceGathererAgent } from "./source-gatherer-agent/index.js";
import { createRouterAgent, type RouterAgent } from "./router-agent/index.js";
import { createVerificationAgent, type VerificationAgent } from "./verification-agent/index.js";
import { createThinkerAgent, type ThinkerAgent } from "./thinker-agent/index.js";
import { createSupervisorAgent, type SupervisorAgent } from "./supervisor-agent/index.js";

export interface Stage2Agents {
  readonly bridge: Stage2Bridge;
  readonly supervisor: SupervisorAgent;
  readonly thinker: ThinkerAgent;
  readonly router: RouterAgent;
  readonly sourceGatherer: SourceGathererAgent;
  readonly planner: PlannerAgent;
  readonly research: ResearchAgent;
  readonly execution: ExecutionAgent;
  readonly communication: CommunicationAgent;
  readonly verification: VerificationAgent;
  readonly memory: MemoryAgent;
  readonly reporting: ReportingAgent;
  readonly descriptors: readonly Stage2AgentDescriptor[];
  list(): readonly Stage2AgentDescriptor[];
  get(agentId: Stage2AgentId): Stage2AgentDescriptor | undefined;
}

export function createStage2Agents(
  context: Stage2AgentFactoryContext = {},
  bridge: Stage2Bridge = createStage2Bridge(),
): Stage2Agents {
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

  const descriptors: readonly Stage2AgentDescriptor[] = [
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
