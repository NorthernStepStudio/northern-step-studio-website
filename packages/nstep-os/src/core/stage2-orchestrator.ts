import { randomUUID } from "node:crypto";
import type {
  DashboardSnapshot,
  GoalInput,
  JobRecord,
  JobStepState,
  MemoryEntry,
  NStepLogger,
  RouteDecision,
  StepResult,
  VerificationResult,
  WorkflowDefinition,
  WorkflowExecutionContext,
  WorkflowPlan,
  WorkflowPlanningContext,
  WorkflowResult,
} from "./types.js";
import type {
  Stage2AgentDescriptor,
  Stage2InvocationOutcome,
  Stage2InvocationRecord,
  Stage2MessageDraft,
  Stage2MessageRequest,
  Stage2OrchestrationContext,
  Stage2OrchestrationSelection,
  Stage2ThinkRequest,
  Stage2ThinkResult,
  Stage2SupervisionRequest,
  Stage2SupervisionResult,
  Stage2SourceRequest,
  Stage2SourceResult,
  Stage2ResearchRequest,
  Stage2ResearchResult,
  Stage2RuntimePhase,
} from "./stage2-models.js";
import type { Stage2Agents } from "../agents/index.js";

const PHASE_MAP: Record<
  Stage2RuntimePhase,
  {
    readonly agentId: Stage2AgentDescriptor["id"];
    readonly capability: Stage2OrchestrationSelection["capability"];
    readonly permissionScope: Stage2OrchestrationSelection["permissionScope"];
    readonly reason: string;
  }
> = {
  thinking: {
    agentId: "thinker-agent",
    capability: "reason",
    permissionScope: "thinking",
    reason: "Frames the problem before routing and planning turn it into steps.",
  },
  supervision: {
    agentId: "supervisor-agent",
    capability: "review",
    permissionScope: "supervision",
    reason: "Reviews worker outputs for drift, unsupported assumptions, and missing controls.",
  },
  routing: {
    agentId: "router-agent",
    capability: "classify",
    permissionScope: "route",
    reason: "Routes the goal before downstream planning and execution.",
  },
  planning: {
    agentId: "planner-agent",
    capability: "plan",
    permissionScope: "plan",
    reason: "Turns the routed goal into a concrete task graph.",
  },
  "source-gathering": {
    agentId: "source-gatherer-agent",
    capability: "gather",
    permissionScope: "sources",
    reason: "Collects external evidence before the reasoning-focused research phase.",
  },
  research: {
    agentId: "research-agent",
    capability: "research",
    permissionScope: "research",
    reason: "Gathers research context before execution or reporting.",
  },
  execution: {
    agentId: "execution-agent",
    capability: "execute",
    permissionScope: "job",
    reason: "Performs the runtime step or job action through the execution layer.",
  },
  communication: {
    agentId: "communication-agent",
    capability: "compose",
    permissionScope: "message",
    reason: "Drafts controlled outbound copy before any delivery step.",
  },
  verification: {
    agentId: "verification-agent",
    capability: "verify",
    permissionScope: "job",
    reason: "Confirms whether the workflow outcome can be accepted.",
  },
  memory: {
    agentId: "memory-agent",
    capability: "remember",
    permissionScope: "memory",
    reason: "Persists reusable patterns and audit-backed memory entries.",
  },
  reporting: {
    agentId: "reporting-agent",
    capability: "report",
    permissionScope: "report",
    reason: "Produces user-facing and dashboard-facing workflow summaries.",
  },
};

export interface Stage2RuntimeOrchestrator {
  readonly descriptors: readonly Stage2AgentDescriptor[];
  select(phase: Stage2RuntimePhase, context?: Stage2OrchestrationContext): Stage2OrchestrationSelection;
  think(
    request: Stage2ThinkRequest,
    context?: Stage2OrchestrationContext,
  ): Promise<Stage2InvocationOutcome<Stage2ThinkResult>>;
  supervise(
    request: Stage2SupervisionRequest,
    context?: Stage2OrchestrationContext,
  ): Promise<Stage2InvocationOutcome<Stage2SupervisionResult>>;
  gatherSources(
    request: Stage2SourceRequest,
    context?: Stage2OrchestrationContext,
  ): Promise<Stage2InvocationOutcome<Stage2SourceResult>>;
  route(goal: GoalInput, context?: Stage2OrchestrationContext): Promise<Stage2InvocationOutcome<RouteDecision>>;
  plan(
    goal: GoalInput,
    workflow: WorkflowDefinition,
    context: WorkflowPlanningContext & Stage2OrchestrationContext,
  ): Promise<Stage2InvocationOutcome<WorkflowPlan>>;
  research(
    request: Stage2ResearchRequest,
    context?: Stage2OrchestrationContext,
  ): Promise<Stage2InvocationOutcome<Stage2ResearchResult>>;
  executeStep(
    workflow: WorkflowDefinition,
    step: JobStepState,
    context: WorkflowExecutionContext & Stage2OrchestrationContext,
  ): Promise<Stage2InvocationOutcome<StepResult>>;
  composeMessage(
    request: Stage2MessageRequest,
    context?: Stage2OrchestrationContext,
  ): Promise<Stage2InvocationOutcome<Stage2MessageDraft>>;
  verifyJob(
    workflow: WorkflowDefinition,
    job: JobRecord,
    context: WorkflowExecutionContext & Stage2OrchestrationContext,
  ): Promise<Stage2InvocationOutcome<VerificationResult>>;
  remember(
    workflow: WorkflowDefinition,
    job: JobRecord,
    context: WorkflowExecutionContext & Stage2OrchestrationContext,
  ): Promise<Stage2InvocationOutcome<readonly MemoryEntry[]>>;
  report(
    workflow: WorkflowDefinition,
    job: JobRecord,
    context: WorkflowExecutionContext & Stage2OrchestrationContext,
  ): Promise<Stage2InvocationOutcome<WorkflowResult>>;
  summarize(
    jobs: readonly JobRecord[],
    memory: readonly MemoryEntry[],
    context?: Stage2OrchestrationContext,
  ): Promise<Stage2InvocationOutcome<DashboardSnapshot>>;
  history(jobId?: string): readonly Stage2InvocationRecord[];
}

export interface Stage2OrchestratorOptions {
  readonly logger?: NStepLogger;
}

export function createStage2Orchestrator(
  agents: Stage2Agents,
  options: Stage2OrchestratorOptions = {},
): Stage2RuntimeOrchestrator {
  const logger = options.logger?.child("stage2-orchestrator");
  const history: Stage2InvocationRecord[] = [];

  function select(phase: Stage2RuntimePhase, context: Stage2OrchestrationContext = {}): Stage2OrchestrationSelection {
    const agent = resolveAgent(agents, phase);
    const phaseDefinition = PHASE_MAP[phase];
    const permission = agent.permissions.find((entry) => entry.scope === phaseDefinition.permissionScope)
      ?? agent.permissions.find((entry) => entry.capabilities.includes(phaseDefinition.capability))
      ?? agent.permissions[0];

    if (!permission) {
      throw new Error(`Stage 2 agent ${agent.id} does not expose permissions for ${phase}.`);
    }

    if (context.jobId || context.tenantId || context.product || context.workflow) {
      logger?.debug("Stage 2 agent selected.", {
        phase,
        agentId: agent.id,
        jobId: context.jobId,
        tenantId: context.tenantId,
        product: context.product,
        workflow: context.workflow,
      });
    }

    return {
      phase,
      agentId: agent.id,
      agentTitle: agent.title,
      capability: phaseDefinition.capability,
      permissionScope: permission.scope,
      mayUseExternalTools: permission.mayUseExternalTools,
      requiresApprovalForExternalActions: permission.requiresApprovalForExternalActions,
      reason: phaseDefinition.reason,
    };
  }

  async function invoke<T>(
    phase: Stage2RuntimePhase,
    context: Stage2OrchestrationContext,
    input: unknown,
    execute: () => Promise<T> | T,
    summarize: (output: T) => string,
  ): Promise<Stage2InvocationOutcome<T>> {
    const selection = select(phase, context);
    const startedAt = new Date().toISOString();
    const started = Date.now();

    try {
      const output = await execute();
      const completedAt = new Date().toISOString();
      const record = createInvocationRecord(
        selection,
        context,
        startedAt,
        completedAt,
        Date.now() - started,
        "completed",
        summarize(output),
        input,
        output,
      );
      history.push(record);
      logger?.info("Completed Stage 2 agent invocation.", {
        phase,
        agentId: selection.agentId,
        durationMs: record.durationMs,
        summary: record.summary,
        jobId: context.jobId,
        tenantId: context.tenantId,
      });
      return { record, output };
    } catch (error) {
      const completedAt = new Date().toISOString();
      const message = error instanceof Error ? error.message : String(error);
      const record = createInvocationRecord(
        selection,
        context,
        startedAt,
        completedAt,
        Date.now() - started,
        "failed",
        message,
        input,
        undefined,
        message,
      );
      history.push(record);
      logger?.error("Stage 2 agent invocation failed.", {
        phase,
        agentId: selection.agentId,
        durationMs: record.durationMs,
        error: message,
        jobId: context.jobId,
        tenantId: context.tenantId,
      });
      throw error instanceof Error ? error : new Error(message);
    }
  }

  return {
    get descriptors() {
      return agents.list();
    },
    select,
    think(request, context = {}) {
      return invoke(
        "thinking",
        {
          ...context,
          product: context.product ?? request.goal.product,
          tenantId: context.tenantId ?? request.goal.tenantId,
          requestedByRole: context.requestedByRole ?? request.goal.requestedByRole,
          mode: context.mode ?? request.goal.mode,
        },
        request,
        () => agents.thinker.think(request),
        (output) => `Reasoned ${output.reasoning.length} note(s) with ${output.risks.length} risk signal(s).`,
      );
    },
    supervise(request, context = {}) {
      return invoke(
        "supervision",
        {
          ...context,
          product: context.product ?? request.goal?.product,
          tenantId: context.tenantId ?? request.goal?.tenantId,
          requestedByRole: context.requestedByRole ?? request.goal?.requestedByRole,
          mode: context.mode ?? request.goal?.mode,
        },
        request,
        () => agents.supervisor.supervise(request, {
          ...(context as Record<string, unknown>),
          goal: request.goal,
          job: (context as Record<string, unknown>).job as JobRecord | undefined,
          workflow: (context as Record<string, unknown>).workflow as WorkflowDefinition | undefined,
        } as Parameters<typeof agents.supervisor.supervise>[1]),
        (output) => `Supervisor verdict ${output.verdict} for ${output.targetPhase}.`,
      );
    },
    route(goal, context = {}) {
      return invoke(
        "routing",
        {
          ...context,
          product: context.product ?? goal.product,
          tenantId: context.tenantId ?? goal.tenantId,
          requestedByRole: context.requestedByRole ?? goal.requestedByRole,
          mode: context.mode ?? goal.mode,
        },
        goal,
        () => agents.router.route(goal),
        (output) => `Routing decision: ${output.workflow} (${output.lane}, ${output.riskLevel}).`,
      );
    },
    plan(goal, workflow, context) {
      return invoke(
        "planning",
        {
          ...context,
          product: context.product ?? goal.product,
          tenantId: context.tenantId ?? goal.tenantId,
          requestedByRole: context.requestedByRole ?? goal.requestedByRole,
          mode: context.mode ?? goal.mode,
        },
        { goal, workflow: workflow.key },
        () => agents.planner.plan(goal, workflow, context),
        (output) => `Planned ${output.steps.length} step(s) for ${output.workflow}.`,
      );
    },
    gatherSources(request, context = {}) {
      return invoke(
        "source-gathering",
        {
          ...context,
          product: context.product ?? request.goal?.product,
          tenantId: context.tenantId ?? request.goal?.tenantId,
          requestedByRole: context.requestedByRole ?? request.goal?.requestedByRole,
          mode: context.mode ?? request.goal?.mode,
        },
        request,
        () => agents.sourceGatherer.gatherSources(request),
        (output) => `Gathered ${output.sources.length} source candidate(s) for ${output.subject}.`,
      );
    },
    research(request, context = {}) {
      return invoke(
        "research",
        {
          ...context,
          product: context.product ?? request.goal?.product,
          tenantId: context.tenantId ?? request.goal?.tenantId,
          requestedByRole: context.requestedByRole ?? request.goal?.requestedByRole,
          mode: context.mode ?? request.goal?.mode,
        },
        request,
        async () => {
          const sourceOutcome = await this.gatherSources(
            {
              goal: request.goal,
              subject: request.subject,
              seedSources: request.sources,
              maxSources: request.maxSources,
              constraints: request.constraints,
              context: request.context,
            },
            context,
          );
          const gatheredSources = sourceOutcome.output.sources;
          return agents.research.research({
            ...request,
            sources: gatheredSources.map((source) => source.url || source.title),
          });
        },
        (output) => `Prepared ${output.findings.length} research finding(s) from ${output.sourcesUsed.length} source(s).`,
      );
    },
    executeStep(workflow, step, context) {
      return invoke(
        "execution",
        {
          ...context,
          product: context.product ?? context.job.goal.product,
          tenantId: context.tenantId ?? context.job.tenantId,
          requestedByRole: context.requestedByRole ?? context.job.goal.requestedByRole,
          mode: context.mode ?? context.job.goal.mode,
          workflow: context.workflow ?? workflow.key,
          stepId: context.stepId ?? step.id,
          stepType: context.stepType ?? step.type,
        },
        { workflow: workflow.key, step: step.id },
        () => agents.execution.runStep(workflow, step, context),
        (output) => `Execution step ${step.id} ${output.status}.`,
      );
    },
    composeMessage(request, context = {}) {
      return invoke(
        "communication",
        {
          ...context,
          product: context.product ?? request.goal?.product,
          tenantId: context.tenantId ?? request.goal?.tenantId,
          requestedByRole: context.requestedByRole ?? request.goal?.requestedByRole,
          mode: context.mode ?? request.goal?.mode,
        },
        request,
        () => agents.communication.composeMessage(request),
        (output) => `Composed ${output.channel} draft for ${output.subject}.`,
      );
    },
    verifyJob(workflow, job, context) {
      return invoke(
        "verification",
        {
          ...context,
          product: context.product ?? job.goal.product,
          tenantId: context.tenantId ?? job.tenantId,
          requestedByRole: context.requestedByRole ?? job.goal.requestedByRole,
          mode: context.mode ?? job.goal.mode,
          workflow: context.workflow ?? workflow.key,
        },
        { workflow: workflow.key, job: job.jobId },
        () => agents.verification.verify(workflow, job, context),
        (output) => `Verification outcome ${output.outcome}.`,
      );
    },
    remember(workflow, job, context) {
      return invoke(
        "memory",
        {
          ...context,
          product: context.product ?? job.goal.product,
          tenantId: context.tenantId ?? job.tenantId,
          requestedByRole: context.requestedByRole ?? job.goal.requestedByRole,
          mode: context.mode ?? job.goal.mode,
          workflow: context.workflow ?? workflow.key,
        },
        { workflow: workflow.key, job: job.jobId },
        () => agents.memory.remember(workflow, job, context),
        (output) => `Persisted ${output.length} memory entr${output.length === 1 ? "y" : "ies"}.`,
      );
    },
    report(workflow, job, context) {
      return invoke(
        "reporting",
        {
          ...context,
          product: context.product ?? job.goal.product,
          tenantId: context.tenantId ?? job.tenantId,
          requestedByRole: context.requestedByRole ?? job.goal.requestedByRole,
          mode: context.mode ?? job.goal.mode,
          workflow: context.workflow ?? workflow.key,
        },
        { workflow: workflow.key, job: job.jobId },
        () => agents.reporting.report(workflow, job, context),
        (output) => `Workflow result ${output.status}: ${output.summary}`,
      );
    },
    summarize(jobs, memory, context = {}) {
      return invoke(
        "reporting",
        context,
        { jobs: jobs.length, memory: memory.length },
        () => agents.reporting.summarize(jobs, memory),
        (output) => `Dashboard snapshot prepared with ${output.jobs.total} job(s) and ${output.memory.total} memory entr${output.memory.total === 1 ? "y" : "ies"}.`,
      );
    },
    history(jobId?: string) {
      return jobId ? history.filter((record) => record.jobId === jobId) : [...history];
    },
  };
}

function resolveAgent(agents: Stage2Agents, phase: Stage2RuntimePhase): Stage2AgentDescriptor {
  switch (phase) {
    case "supervision":
      return agents.supervisor;
    case "thinking":
      return agents.thinker;
    case "routing":
      return agents.router;
    case "source-gathering":
      return agents.sourceGatherer;
    case "planning":
      return agents.planner;
    case "research":
      return agents.research;
    case "execution":
      return agents.execution;
    case "communication":
      return agents.communication;
    case "verification":
      return agents.verification;
    case "memory":
      return agents.memory;
    case "reporting":
      return agents.reporting;
    default: {
      const exhaustiveCheck: never = phase;
      throw new Error(`Unsupported orchestration phase: ${String(exhaustiveCheck)}`);
    }
  }
}

function createInvocationRecord(
  selection: Stage2OrchestrationSelection,
  context: Stage2OrchestrationContext,
  startedAt: string,
  completedAt: string,
  durationMs: number,
  status: Stage2InvocationRecord["status"],
  summary: string,
  input: unknown,
  output?: unknown,
  error?: string,
): Stage2InvocationRecord {
  return {
    invocationId: `invoke_${randomUUID()}`,
    phase: selection.phase,
    agentId: selection.agentId,
    agentTitle: selection.agentTitle,
    selection,
    status,
    startedAt,
    completedAt,
    durationMs,
    jobId: context.jobId,
    tenantId: context.tenantId,
    product: context.product,
    workflow: context.workflow,
    stepId: context.stepId,
    stepType: context.stepType,
    summary,
    input,
    output,
    error,
  };
}
