import { randomUUID } from "node:crypto";
import type {
  GoalInput,
  DashboardSnapshot,
  JobRecord,
  JobScratchpadEntry,
  JobStepState,
  PrincipalRole,
  RouteDecision,
  RuntimeConfig,
  RuntimeStores,
  StepResult,
  WorkflowDefinition,
  WorkflowExecutionContext,
  WorkflowPlanningContext,
  WorkflowStep,
} from "../core/types.js";
import { createNoopLogger } from "../core/logger.js";
import type { NStepLogger } from "../core/types.js";
import { buildRetryModel, buildWorkflowStatusModel } from "../core/stage1-models.js";
import { assertWorkflowResult } from "../core/validation.js";
import { createRuntimeServices, type RuntimeServices } from "../core/runtime-services.js";
import type { Stage2OrchestrationContext } from "../core/stage2-models.js";
import type { Stage2RuntimeOrchestrator } from "../core/stage2-orchestrator.js";
import { routeGoal } from "../router/index.js";
import { planGoal } from "../planner/index.js";
import { resolveWorkflowDefinition } from "../workflows/index.js";
import { buildJobEscalation, evaluateActionRestriction, evaluateApprovalPolicy, evaluateTenantIsolation } from "../policies/index.js";
import { buildMemoryHierarchy, selectMemoryForReasoning } from "../memory/index.js";
import type { Stage3ToolRuntime } from "../tools/runtime.js";

export interface JobEngineDependencies {
  readonly config: RuntimeConfig;
  readonly stores: RuntimeStores;
  readonly logger?: NStepLogger;
  readonly tools?: Record<string, unknown>;
  readonly services?: RuntimeServices;
  readonly orchestrator?: Stage2RuntimeOrchestrator;
}

export interface JobEngine {
  intake(goal: GoalInput): Promise<JobRecord>;
  route(jobId: string): Promise<JobRecord>;
  plan(jobId: string): Promise<JobRecord>;
  run(jobId: string): Promise<JobRecord>;
  process(jobId: string): Promise<JobRecord>;
  approve(jobId: string, stepId: string, actor?: JobEngineActor): Promise<JobRecord>;
  reject(jobId: string, stepId: string, actor?: JobEngineActor): Promise<JobRecord>;
  get(jobId: string): Promise<JobRecord | undefined>;
  list(): Promise<readonly JobRecord[]>;
  dashboard(): Promise<DashboardSnapshot>;
}

export interface JobEngineActor {
  readonly subjectId?: string;
  readonly tenantId?: string;
  readonly role?: PrincipalRole;
  readonly reason?: string;
}

export function createJobEngine(deps: JobEngineDependencies): JobEngine {
  const logger = deps.logger ?? createNoopLogger();
  const tools = deps.tools ?? {};
  const services = deps.services ?? createRuntimeServices({ config: deps.config, stores: deps.stores, logger });
  const orchestrator = deps.orchestrator;
  const retryLimit = Math.max(1, deps.config.maxRetries + 1);
  const waitingApprovalDelayMs = 30 * 24 * 60 * 60 * 1000;

  async function getJob(jobId: string): Promise<JobRecord | undefined> {
    return deps.stores.jobs.get(jobId);
  }

  async function saveJob(job: JobRecord): Promise<JobRecord> {
    job.updatedAt = new Date().toISOString();
    job.workflowStatus = buildWorkflowStatusModel(job);
    return deps.stores.jobs.upsert(job);
  }

  function addScratchpad(
    job: JobRecord,
    phase: JobScratchpadEntry["phase"],
    title: string,
    note: string,
    data?: Record<string, unknown>,
    context?: {
      readonly step?: JobStepState;
      readonly actorRole?: PrincipalRole;
      readonly actorId?: string;
    },
  ): void {
    const step = context?.step;
    job.scratchpad = [
      ...job.scratchpad,
      {
        id: `scratchpad_${randomUUID()}`,
        at: new Date().toISOString(),
        phase,
        title,
        note,
        stepId: step?.id,
        stepType: step?.type,
        actorRole: context?.actorRole,
        actorId: context?.actorId,
        data,
      },
    ];
  }

  function ensureWorldState(job: JobRecord): NonNullable<JobRecord["worldState"]> {
    if (!job.worldState) {
      job.worldState = {
        currentGoal: job.goal.goal,
        reasoningSummary: undefined,
        actionHistory: [],
        observations: [],
        repeatedActionWarnings: [],
        modifiedPaths: [],
        failingTests: [],
      };
    }
    return job.worldState;
  }

  function normalizeToken(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, "-");
  }

  function fingerprintAction(
    phase: NonNullable<JobRecord["worldState"]>["observations"][number]["phase"],
    source: "job" | "step" | "system",
    title: string,
    note: string,
    metadata?: Record<string, unknown>,
  ): string {
    const scope = [phase, source, title, note]
      .map((part) => normalizeToken(part))
      .filter(Boolean)
      .join(":");
    const stepId = typeof metadata?.stepId === "string" ? normalizeToken(metadata.stepId) : undefined;
    const tool = typeof metadata?.tool === "string" ? normalizeToken(metadata.tool) : undefined;
    return [scope, stepId, tool].filter(Boolean).join("|");
  }

  function updateWorldState(
    job: JobRecord,
    phase: NonNullable<JobRecord["worldState"]>["observations"][number]["phase"],
    source: "job" | "step" | "system",
    title: string,
    note: string,
    data?: Record<string, unknown>,
    context?: {
      readonly step?: JobStepState;
      readonly actorRole?: PrincipalRole;
      readonly actorId?: string;
    },
  ): { readonly fingerprint: string; readonly repeatedCount: number; readonly warning?: string } {
    const worldState = ensureWorldState(job);
    const metadata = data || {};
    const fingerprint = fingerprintAction(phase, source, title, note, metadata);
    const now = new Date().toISOString();
    const existing = worldState.actionHistory.find((entry) => entry.fingerprint === fingerprint);
    const repeatedCount = existing ? existing.count + 1 : 1;
    const actionHistory = existing
      ? worldState.actionHistory.map((entry) =>
          entry.fingerprint === fingerprint
            ? {
                ...entry,
                count: repeatedCount,
                lastAt: now,
                sampleSummary: entry.sampleSummary || note,
              }
            : entry,
        )
      : [
          ...worldState.actionHistory,
          {
            fingerprint,
            count: 1,
            firstAt: now,
            lastAt: now,
            sampleSummary: note,
          },
        ];
    const modifiedPaths = new Set(worldState.modifiedPaths);
    const failingTests = new Set(worldState.failingTests);
    const observationModifiedPaths = Array.isArray(metadata.modifiedPaths)
      ? metadata.modifiedPaths.filter((item): item is string => typeof item === "string")
      : [];
    const observationFailingTests = Array.isArray(metadata.failingTests)
      ? metadata.failingTests.filter((item): item is string => typeof item === "string")
      : [];
    observationModifiedPaths.forEach((path) => modifiedPaths.add(path));
    observationFailingTests.forEach((test) => failingTests.add(test));
    const observation = {
      at: now,
      phase,
      source,
      fingerprint,
      summary: note,
      modifiedPaths: observationModifiedPaths,
      failingTests: observationFailingTests,
      metadata,
    } satisfies NonNullable<JobRecord["worldState"]>["observations"][number];
    const observations = [...worldState.observations, observation];
    const warning =
      repeatedCount >= 3
        ? `Repeated action fingerprint "${fingerprint}" reached ${repeatedCount} identical attempts without a new outcome.`
        : undefined;
    job.worldState = {
      currentGoal: worldState.currentGoal,
      reasoningSummary: worldState.reasoningSummary,
      actionHistory,
      observations,
      repeatedActionWarnings: warning
        ? [
            ...worldState.repeatedActionWarnings,
            {
              at: now,
              fingerprint,
              count: repeatedCount,
              reason: warning,
            },
          ]
        : worldState.repeatedActionWarnings,
      modifiedPaths: [...modifiedPaths],
      failingTests: [...failingTests],
    };
    if (phase === "system" && typeof metadata.reasoningSummary === "string") {
      job.worldState = {
        ...job.worldState,
        reasoningSummary: metadata.reasoningSummary,
      };
    }
    return { fingerprint, repeatedCount, warning };
  }

  function shouldTriggerCircuitBreaker(job: JobRecord, fingerprint: string): boolean {
    const worldState = job.worldState;
    if (!worldState) {
      return false;
    }
    const matching = worldState.actionHistory.find((entry) => entry.fingerprint === fingerprint);
    return Boolean(matching && matching.count >= 3);
  }

  function recordWorldEvent(
    job: JobRecord,
    phase: NonNullable<JobRecord["worldState"]>["observations"][number]["phase"],
    source: "job" | "step" | "system",
    title: string,
    note: string,
    data?: Record<string, unknown>,
    context?: {
      readonly step?: JobStepState;
      readonly actorRole?: PrincipalRole;
      readonly actorId?: string;
    },
  ): ReturnType<typeof updateWorldState> {
    const outcome = updateWorldState(job, phase, source, title, note, data, context);
    if (outcome.warning) {
      addLog(job, "warn", outcome.warning, undefined, {
        step: context?.step,
        source,
        actorRole: context?.actorRole,
        actorId: context?.actorId,
        data: {
          fingerprint: outcome.fingerprint,
          repeatedCount: outcome.repeatedCount,
          ...data,
        },
      });
    }
    return outcome;
  }

  function createContext(job: JobRecord, route: RouteDecision): WorkflowExecutionContext {
    const role = job.goal.requestedByRole || "operator";
    const stage3Tools = tools as unknown as Stage3ToolRuntime;
    const scopedTools =
      typeof stage3Tools.scope === "function"
        ? stage3Tools.scope({
            jobId: job.jobId,
            tenantId: job.tenantId,
            role,
            product: job.goal.product,
            mode: job.goal.mode,
            approvalStatus: job.approvalStatus,
            riskLevel: route.riskLevel,
            purpose: job.goal.goal,
            externalAllowed: job.approvalStatus === "approved" || job.approvalStatus === "not_required",
          })
        : tools;

    return {
      config: deps.config,
      logger,
      stores: deps.stores,
      tools: scopedTools,
      route,
      job,
    };
  }

  function createPlanningContext(route: RouteDecision): WorkflowPlanningContext {
    return {
      config: deps.config,
      logger,
      route,
    };
  }

  function buildStepStates(planSteps: readonly WorkflowStep[]): JobStepState[] {
    return planSteps.map((step) => ({
      ...step,
      status: "pending" as const,
      attempts: 0,
      retry: buildRetryModel(
        {
          ...step,
          status: "pending",
          attempts: 0,
        },
        retryLimit,
      ),
    }));
  }

  async function enqueueJob(job: JobRecord, reason: string): Promise<void> {
    job.status = "queued";
    job.error = undefined;
    await saveJob(job);
    await deps.stores.queue.enqueue(job, reason);
  }

  async function finalizeQueueState(job: JobRecord): Promise<void> {
    try {
      const queue = deps.stores.queue;
      if (job.status === "completed") {
        await queue.complete(job.jobId);
        return;
      }
      if (job.status === "waiting_approval") {
        await queue.defer(job.jobId, job.error || "Waiting for approval.", new Date(Date.now() + waitingApprovalDelayMs).toISOString());
        return;
      }
      if (job.status === "failed") {
        await queue.fail(job.jobId, job.error || "Workflow failed.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("Queue finalization failed.", {
        jobId: job.jobId,
        status: job.status,
        error: message,
      });
    }
  }

  function shouldExecuteInline(): boolean {
    return deps.config.executionMode === "inline";
  }

  async function ensureRoute(job: JobRecord): Promise<RouteDecision> {
    if (job.route) {
      return job.route;
    }
    const routeOutcome = orchestrator
      ? await orchestrator.route(job.goal, buildOrchestrationContext(job))
      : {
          record: undefined,
          output: routeGoal(job.goal),
        };
    if (routeOutcome.record) {
      addOrchestrationLog(job, routeOutcome.record);
    }
    const route = routeOutcome.output;
    addScratchpad(job, "routing", "Route selected", `Routed to ${route.workflow} on the ${route.lane} lane.`, {
      workflow: route.workflow,
      lane: route.lane,
      riskLevel: route.riskLevel,
      approvalRequired: route.approvalRequired,
      confidence: route.confidence,
    });
    const approvalPolicy = evaluateApprovalPolicy(job.goal, route, deps.config.approvalThreshold);
    job.route = {
      ...route,
      approvalRequired: route.approvalRequired || approvalPolicy.requiresApproval,
      reasoning: `${route.reasoning} ${approvalPolicy.reason}`.trim(),
      tags: [...new Set([...route.tags, "approval-policy", ...(approvalPolicy.requiresApproval ? ["review-required"] : [])])],
    };
    job.approvalStatus = job.route.approvalRequired ? "pending" : "not_required";
    await saveJob(job);
    return job.route;
  }

  async function ensurePlan(job: JobRecord, route: RouteDecision): Promise<WorkflowDefinition> {
    const workflow = resolveWorkflowDefinition(route.workflow);
    if (!job.plan) {
      const planOutcome = orchestrator
        ? await orchestrator.plan(job.goal, workflow, {
            ...createPlanningContext(route),
            ...buildOrchestrationContext(job, route),
          })
        : {
            record: undefined,
            output: planGoal(job.goal, workflow, createPlanningContext(route)),
          };
      if (planOutcome.record) {
        addOrchestrationLog(job, planOutcome.record);
      }
      const plan = planOutcome.output;
      job.plan = {
        ...plan,
        jobId: job.jobId,
      };
      job.steps = buildStepStates(plan.steps);
      job.status = "planning";
      addScratchpad(job, "planning", "Plan drafted", plan.summary, {
        stepCount: plan.steps.length,
        approvalsRequired: plan.approvalsRequired,
        workflow: plan.workflow,
      });
      await saveJob(job);
    }
    return workflow;
  }

  async function runWorkflow(jobId: string): Promise<JobRecord> {
    const job = await getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} was not found.`);
    }
    if (job.status === "completed" || job.status === "failed") {
      await finalizeQueueState(job);
      return job;
    }
    if (job.status === "waiting_approval" && job.approvalStatus !== "approved") {
      await finalizeQueueState(job);
      return job;
    }
    let route: RouteDecision | undefined;
    let workflow!: WorkflowDefinition;
    let context!: WorkflowExecutionContext;

    try {
      job.status = "routing";
      await saveJob(job);
      recordWorldEvent(job, "routing", "job", "Routing started", `Evaluating route for ${job.goal.product}.`, {
        goal: job.goal.goal,
        product: job.goal.product,
      });
      route = await ensureRoute(job);

      const memoryContext = await deps.stores.memory.list();
      const tenantMemory = memoryContext.filter((entry) => entry.tenantId === job.tenantId);
      const memoryHierarchy = buildMemoryHierarchy(tenantMemory, 12);
      const reasoningMemory = selectMemoryForReasoning(tenantMemory, 12);
      if (reasoningMemory.length > 0) {
        addScratchpad(job, "system", "Memory tiers loaded", `Loaded ${memoryHierarchy.semantic.length} semantic, ${memoryHierarchy.procedural.length} procedural, and ${memoryHierarchy.episodic.length} episodic memory item(s).`, {
          semanticCount: memoryHierarchy.semantic.length,
          proceduralCount: memoryHierarchy.procedural.length,
          episodicCount: memoryHierarchy.episodic.length,
          selectedCount: reasoningMemory.length,
        });
      }
      const thinkOutcome = orchestrator
        ? await orchestrator.think(
            {
              goal: job.goal,
              route,
              notes: job.logs.slice(-5).map((entry) => entry.message),
              memory: reasoningMemory,
              context: {
                jobId: job.jobId,
                source: "job-engine",
              },
            },
            buildOrchestrationContext(job, route),
          )
        : undefined;
      if (thinkOutcome?.record) {
        addOrchestrationLog(job, thinkOutcome.record);
      }
      if (thinkOutcome?.output) {
        recordWorldEvent(job, "system", "system", "Reasoning captured", thinkOutcome.output.summary, {
          reasoningSummary: thinkOutcome.output.summary,
          reasoning: thinkOutcome.output.reasoning,
          risks: thinkOutcome.output.risks,
          assumptions: thinkOutcome.output.assumptions,
          nextFocus: thinkOutcome.output.nextFocus,
          confidence: thinkOutcome.output.confidence,
        });
        addScratchpad(job, "system", "Reasoning notes", thinkOutcome.output.summary, {
          actorRole: job.goal.requestedByRole,
          data: {
            reasoning: thinkOutcome.output.reasoning,
            risks: thinkOutcome.output.risks,
            assumptions: thinkOutcome.output.assumptions,
            nextFocus: thinkOutcome.output.nextFocus,
            confidence: thinkOutcome.output.confidence,
          },
        });
        addLog(job, "info", `Reasoning captured in ${thinkOutcome.output.reasoning.length} note(s).`, undefined, {
          source: "job",
          actorRole: job.goal.requestedByRole,
          data: {
            nextFocus: thinkOutcome.output.nextFocus,
            confidence: thinkOutcome.output.confidence,
          },
        });
      }

      const supervisionOutcome = orchestrator
        ? await orchestrator.supervise(
            {
              goal: job.goal,
              subject: `${job.goal.product} reasoning review`,
              targetPhase: "thinking",
              summary: thinkOutcome?.output?.summary || `No reasoning output was produced for ${job.goal.product}.`,
              evidence: thinkOutcome?.output
                ? [...thinkOutcome.output.reasoning, ...thinkOutcome.output.risks, ...thinkOutcome.output.assumptions]
                : [],
              constraints: job.goal.constraints,
              context: {
                jobId: job.jobId,
                source: "job-engine",
                reasoningConfidence: thinkOutcome?.output?.confidence,
              },
            },
            buildOrchestrationContext(job, route),
          )
        : undefined;
      if (supervisionOutcome?.record) {
        addOrchestrationLog(job, supervisionOutcome.record);
      }
      if (supervisionOutcome && supervisionOutcome.output.verdict !== "approved") {
        const corrections = supervisionOutcome.output.corrections.slice(0, 3);
        addScratchpad(
          job,
          "system",
          "Supervisor review",
          `${supervisionOutcome.output.verdict}: ${supervisionOutcome.output.findings.join(" ")}`,
          {
            verdict: supervisionOutcome.output.verdict,
            findings: supervisionOutcome.output.findings,
            corrections,
            targetPhase: supervisionOutcome.output.targetPhase,
          },
        );
        if (!job.escalation) {
          job.escalation = buildJobEscalation(
            job,
            `Supervisor review requested adjustment during ${supervisionOutcome.output.targetPhase}.`,
            "medium",
            "policy",
            job.goal.requestedByRole || "operator",
            {
              phase: supervisionOutcome.output.targetPhase,
              verdict: supervisionOutcome.output.verdict,
              findings: supervisionOutcome.output.findings,
              corrections,
            },
          );
        }
        addLog(job, "warn", `Supervisor requested adjustment during ${supervisionOutcome.output.targetPhase}.`, undefined, {
          source: "system",
          actorRole: "system",
          data: {
            verdict: supervisionOutcome.output.verdict,
            findings: supervisionOutcome.output.findings,
            corrections,
          },
        });
      }

      job.status = "planning";
      await saveJob(job);
      workflow = await ensurePlan(job, route!);
      const planSupervisionOutcome = orchestrator
        ? await orchestrator.supervise(
            {
              goal: job.goal,
              subject: `${job.plan?.workflow || route!.workflow} plan review`,
              targetPhase: "planning",
              summary: job.plan?.summary || "Plan drafted.",
              evidence: job.plan?.steps.map((step) => `${step.id}: ${step.title} (${step.type})`) || [],
              constraints: job.plan?.approvalsRequired ? ["Plan contains approval-gated steps."] : [],
              context: {
                jobId: job.jobId,
                source: "job-engine",
                stepCount: job.plan?.steps.length || 0,
              },
            },
            buildOrchestrationContext(job, route),
          )
        : undefined;
      if (planSupervisionOutcome?.record) {
        addOrchestrationLog(job, planSupervisionOutcome.record);
      }
      if (planSupervisionOutcome && planSupervisionOutcome.output.verdict !== "approved") {
        const corrections = planSupervisionOutcome.output.corrections.slice(0, 3);
        addScratchpad(
          job,
          "system",
          "Plan review",
          `${planSupervisionOutcome.output.verdict}: ${planSupervisionOutcome.output.findings.join(" ")}`,
          {
            verdict: planSupervisionOutcome.output.verdict,
            findings: planSupervisionOutcome.output.findings,
            corrections,
            targetPhase: planSupervisionOutcome.output.targetPhase,
          },
        );
        if (!job.escalation) {
          job.escalation = buildJobEscalation(
            job,
            `Supervisor review requested adjustment during ${planSupervisionOutcome.output.targetPhase}.`,
            "medium",
            "policy",
            job.goal.requestedByRole || "operator",
            {
              phase: planSupervisionOutcome.output.targetPhase,
              verdict: planSupervisionOutcome.output.verdict,
              findings: planSupervisionOutcome.output.findings,
              corrections,
            },
          );
        }
        addLog(job, "warn", `Supervisor requested adjustment during ${planSupervisionOutcome.output.targetPhase}.`, undefined, {
          source: "system",
          actorRole: "system",
          data: {
            verdict: planSupervisionOutcome.output.verdict,
            findings: planSupervisionOutcome.output.findings,
            corrections,
          },
        });
      }
      recordWorldEvent(job, "planning", "job", "Plan drafted", job.plan?.summary || "Plan drafted", {
        workflow: job.plan?.workflow || route!.workflow,
        stepCount: job.plan?.steps.length || 0,
      });
      context = createContext(job, route!);

      job.status = "running";
      await saveJob(job);

      for (let index = 0; index < job.steps.length; ) {
        const step = job.steps[index];
        if (step.status === "completed" || step.status === "skipped") {
          index += 1;
          continue;
        }

        if (!dependenciesMet(job.steps, step)) {
          index += 1;
          continue;
        }

        if (step.approvalRequired && !job.approvedStepIds.includes(step.id)) {
          step.status = "waiting_approval";
          job.status = "waiting_approval";
          job.approvalStatus = "pending";
          job.escalation = upsertEscalation(
            job,
            buildJobEscalation(job, `Step ${step.id} requires approval before execution.`, "medium", "approval", job.goal.requestedByRole || "operator", {
              stepId: step.id,
              stepType: step.type,
            }),
          );
          await saveJob(job);
          return job;
        }

        const actionRestriction = evaluateActionRestriction(
          step,
          route!,
          job.goal.requestedByRole || "operator",
          job.approvedStepIds.includes(step.id) || job.approvalStatus === "approved",
        );
        if (!actionRestriction.allowed) {
          step.status = "waiting_approval";
          job.status = "waiting_approval";
          job.approvalStatus = "pending";
          job.escalation = upsertEscalation(
            job,
            buildJobEscalation(job, actionRestriction.reason, route!.riskLevel, "policy", actionRestriction.requiredRole || job.goal.requestedByRole || "operator", {
              stepId: step.id,
              stepType: step.type,
              tool: step.tool,
            }),
          );
          addLog(job, "warn", `Step ${step.id} restricted: ${actionRestriction.reason}`, undefined, {
            step,
            actorRole: job.goal.requestedByRole,
          });
          await saveJob(job);
          return job;
        }

        step.status = "running";
        step.attempts += 1;
        step.startedAt = step.startedAt || new Date().toISOString();
        step.retry = buildRetryModel(step, retryLimit);
        const executionWorld = recordWorldEvent(job, "execution", "step", `Starting ${step.title}`, `Executing ${step.tool} step ${step.id}.`, {
          stepId: step.id,
          stepType: step.type,
          tool: step.tool,
          attempts: step.attempts,
          dependsOn: step.dependsOn,
        }, {
          step,
          actorRole: job.goal.requestedByRole,
        });
        if (shouldTriggerCircuitBreaker(job, executionWorld.fingerprint)) {
          step.status = "failed";
          job.status = "failed";
          job.error = `Circuit breaker triggered after repeated identical action for step ${step.id}.`;
          job.escalation = upsertEscalation(
            job,
            buildJobEscalation(job, job.error, "high", "retry-exhausted", job.goal.requestedByRole || "operator", {
              stepId: step.id,
              stepType: step.type,
              repeatedActionFingerprint: executionWorld.fingerprint,
              repeatedActionCount: executionWorld.repeatedCount,
            }),
          );
          addLog(job, "error", job.error, undefined, {
            step,
            actorRole: job.goal.requestedByRole,
            data: {
              repeatedActionFingerprint: executionWorld.fingerprint,
              repeatedActionCount: executionWorld.repeatedCount,
            },
          });
          addScratchpad(job, "execution", `${step.title} halted`, job.error, {
            step,
            actorRole: job.goal.requestedByRole,
            data: {
              repeatedActionFingerprint: executionWorld.fingerprint,
              repeatedActionCount: executionWorld.repeatedCount,
            },
          });
          await saveJob(job);
          return job;
        }
        addScratchpad(job, "execution", `Starting ${step.title}`, `Executing ${step.tool} step ${step.id}.`, undefined, {
          step,
          actorRole: job.goal.requestedByRole,
        });
        await saveJob(job);

        const execution = orchestrator
          ? await orchestrator.executeStep(workflow, step, {
              ...context,
              ...buildOrchestrationContext(job, route!, step),
            })
          : {
              record: undefined,
              output: (await services.execution.executeStep(workflow, step, context)).result,
            };
        if (execution.record) {
          addOrchestrationLog(job, execution.record);
        }
        const result = execution.output;
        step.result = result;
        step.completedAt = execution.record?.completedAt || new Date().toISOString();

        if (result.status === "completed") {
          step.status = "completed";
          step.retry = buildRetryModel(step, retryLimit);
          recordWorldEvent(job, "execution", "step", `${step.title} completed`, result.message, {
            stepId: step.id,
            stepType: step.type,
            tool: step.tool,
            resultStatus: result.status,
          }, {
            step,
            actorRole: job.goal.requestedByRole,
          });
          addLog(job, "info", `Step ${step.id} completed in ${execution.record?.durationMs ?? 0}ms.`, undefined, {
            step,
            actorRole: job.goal.requestedByRole,
          });
          addScratchpad(job, "execution", `${step.title} completed`, result.message, {
            step,
            actorRole: job.goal.requestedByRole,
          });
          await saveJob(job);
          index += 1;
          continue;
        }

        if (result.status === "blocked") {
          step.status = "waiting_approval";
          job.status = "waiting_approval";
          job.approvalStatus = "pending";
          job.escalation = upsertEscalation(
            job,
            buildJobEscalation(job, result.message, route!.riskLevel, "policy", job.goal.requestedByRole || "operator", {
              stepId: step.id,
              stepType: step.type,
              tool: step.tool,
            }),
          );
          step.retry = buildRetryModel(step, retryLimit);
          recordWorldEvent(job, "execution", "step", `${step.title} blocked`, result.message, {
            stepId: step.id,
            stepType: step.type,
            tool: step.tool,
            resultStatus: result.status,
          }, {
            step,
            actorRole: job.goal.requestedByRole,
          });
          addLog(job, "warn", `Step ${step.id} blocked: ${result.message}`, undefined, {
            step,
            actorRole: job.goal.requestedByRole,
          });
          addScratchpad(job, "execution", `${step.title} blocked`, result.message, {
            step,
            actorRole: job.goal.requestedByRole,
          });
          await saveJob(job);
          return job;
        }

        if (result.retryable && step.attempts < retryLimit) {
          recordWorldEvent(job, "execution", "step", `${step.title} retrying`, result.message, {
            stepId: step.id,
            stepType: step.type,
            tool: step.tool,
            retryable: result.retryable,
            attempts: step.attempts,
          }, {
            step,
            actorRole: job.goal.requestedByRole,
          });
          addLog(job, "warn", `Retrying step ${step.id} (${step.attempts}/${retryLimit})`, undefined, {
            step,
            actorRole: job.goal.requestedByRole,
          });
          step.status = "pending";
          step.completedAt = undefined;
          step.result = undefined;
          step.retry = buildRetryModel(step, retryLimit);
          await saveJob(job);
          continue;
        }

        step.status = "failed";
        job.status = "failed";
        job.error = result.message;
        step.retry = buildRetryModel(step, retryLimit);
        job.escalation = upsertEscalation(
          job,
          buildJobEscalation(job, `Retry boundary reached for step ${step.id}. ${result.message}`, "high", "retry-exhausted", job.goal.requestedByRole || "operator", {
            stepId: step.id,
            stepType: step.type,
            attempts: step.attempts,
            maxAttempts: retryLimit,
          }),
        );
        addLog(job, "error", `Step ${step.id} failed: ${result.message}`, undefined, {
          step,
          actorRole: job.goal.requestedByRole,
        });
        recordWorldEvent(job, "execution", "step", `${step.title} failed`, result.message, {
          stepId: step.id,
          stepType: step.type,
          tool: step.tool,
          resultStatus: result.status,
          retryable: result.retryable,
        }, {
          step,
          actorRole: job.goal.requestedByRole,
        });
        addScratchpad(job, "execution", `${step.title} failed`, result.message, {
          step,
          actorRole: job.goal.requestedByRole,
        });
        await saveJob(job);
        return job;
      }

      job.status = "verifying";
      addLog(job, "info", "Running workflow verification.", undefined, { source: "job", actorRole: job.goal.requestedByRole });
      recordWorldEvent(job, "verification", "job", "Verification started", "Checking completed steps and result quality.", {
        completedSteps: job.steps.filter((candidate) => candidate.status === "completed").length,
        waitingApprovalSteps: job.steps.filter((candidate) => candidate.status === "waiting_approval").length,
      });
      addScratchpad(job, "verification", "Verification started", "Checking completed steps and result quality.", {
        completedSteps: job.steps.filter((candidate) => candidate.status === "completed").length,
        waitingApprovalSteps: job.steps.filter((candidate) => candidate.status === "waiting_approval").length,
      });
      await saveJob(job);

      const verificationOutcome = orchestrator
        ? await orchestrator.verifyJob(workflow, job, {
            ...context,
            ...buildOrchestrationContext(job, route!),
          })
        : {
            record: undefined,
            output: (await services.verification.verifyJob(workflow, job, context)).result,
          };
      if (verificationOutcome.record) {
        addOrchestrationLog(job, verificationOutcome.record);
      }
      const verification = verificationOutcome.output;
      addLog(job, "info", `Verification completed in ${verificationOutcome.record?.durationMs ?? 0}ms.`, undefined, {
        source: "job",
        actorRole: job.goal.requestedByRole,
        data: {
          outcome: verification.outcome,
          findings: verification.findings.length,
        },
      });
      recordWorldEvent(job, "verification", "job", "Verification complete", `Outcome: ${verification.outcome}.`, {
        outcome: verification.outcome,
        findings: verification.findings.slice(0, 5),
      });
      addScratchpad(job, "verification", "Verification complete", `Outcome: ${verification.outcome}.`, {
        outcome: verification.outcome,
        findings: verification.findings.slice(0, 5),
      });
      if (verification.outcome === "accepted") {
        const memoryOutcome = orchestrator
          ? await orchestrator.remember(workflow, job, {
              ...context,
              ...buildOrchestrationContext(job, route!),
            })
          : {
              record: undefined,
              output: await services.memory.createJobMemory(workflow, job, context),
            };
        if (memoryOutcome.record) {
          addOrchestrationLog(job, memoryOutcome.record);
        }
        const memories = memoryOutcome.output;
        const memorySummary = await services.memory.persistJobMemory(memories, {
          jobId: job.jobId,
          actorRole: "system",
          actorId: "job-engine",
          note: "Persisted workflow memory after successful verification.",
        });
        addLog(job, "info", `Persisted ${memorySummary.total} memory entr${memorySummary.total === 1 ? "y" : "ies"}.`, undefined, {
          source: "job",
          actorRole: "system",
          data: {
            memoryIds: memorySummary.ids,
            byCategory: memorySummary.byCategory,
          },
        });
        recordWorldEvent(job, "memory", "job", "Memory updated", `Persisted ${memorySummary.total} memory entr${memorySummary.total === 1 ? "y" : "ies"}.`, {
          memoryIds: memorySummary.ids,
          byCategory: memorySummary.byCategory,
        });
        addScratchpad(job, "memory", "Memory updated", `Persisted ${memorySummary.total} memory entr${memorySummary.total === 1 ? "y" : "ies"}.`, {
          memoryIds: memorySummary.ids,
          byCategory: memorySummary.byCategory,
        });
        const reportOutcome = orchestrator
          ? await orchestrator.report(workflow, job, {
              ...context,
              ...buildOrchestrationContext(job, route!),
            })
          : {
              record: undefined,
              output: services.reporting.buildWorkflowReport(workflow, job, context),
            };
        if (reportOutcome.record) {
          addOrchestrationLog(job, reportOutcome.record);
        }
        const result = reportOutcome.output;
        assertWorkflowResult(result);
        job.result = result;
        job.status = "completed";
        job.approvalStatus = job.approvedStepIds.length > 0 ? "approved" : "not_required";
        job.escalation = resolveEscalation(job, "resolved", "Workflow completed successfully.");
        addScratchpad(job, "reporting", "Report assembled", result.summary, {
          status: result.status,
          actionsTaken: result.actionsTaken.length,
        });
        recordWorldEvent(job, "reporting", "job", "Report assembled", result.summary, {
          status: result.status,
          actionsTaken: result.actionsTaken.length,
        });
        addLog(job, "info", `Job completed: ${job.result.summary}`, undefined, { source: "job", actorRole: job.goal.requestedByRole });
        await saveJob(job);
        return job;
      }

      if (verification.outcome === "human_review_required") {
        job.status = "waiting_approval";
        job.approvalStatus = "pending";
        job.error = "Human review required after verification.";
        const reportOutcome = orchestrator
          ? await orchestrator.report(workflow, job, {
              ...context,
              ...buildOrchestrationContext(job, route!),
            })
          : {
              record: undefined,
              output: services.reporting.buildWorkflowReport(workflow, job, context),
            };
        if (reportOutcome.record) {
          addOrchestrationLog(job, reportOutcome.record);
        }
        const result = reportOutcome.output;
        assertWorkflowResult(result);
        job.result = result;
        job.escalation = upsertEscalation(
          job,
          buildJobEscalation(job, "Verification requested human review.", "medium", "verification", job.goal.requestedByRole || "operator", {
            outcome: verification.outcome,
            findings: verification.findings.slice(0, 10),
          }),
        );
        addLog(job, "warn", "Verification requested human review.", undefined, { source: "job", actorRole: job.goal.requestedByRole });
        recordWorldEvent(job, "verification", "job", "Human review required", "Verification requested operator review.", {
          outcome: verification.outcome,
          findings: verification.findings.slice(0, 5),
        });
        addScratchpad(job, "verification", "Human review required", "Verification requested operator review.", {
          outcome: verification.outcome,
          findings: verification.findings.slice(0, 5),
        });
        await saveJob(job);
        return job;
      }

      if (verification.outcome === "retry_required" || verification.outcome === "rollback_required") {
        job.status = "failed";
        job.error = verification.outcome === "retry_required" ? "Verification requested a retry." : "Verification requested rollback.";
        const reportOutcome = orchestrator
          ? await orchestrator.report(workflow, job, {
              ...context,
              ...buildOrchestrationContext(job, route!),
            })
          : {
              record: undefined,
              output: services.reporting.buildWorkflowReport(workflow, job, context),
            };
        if (reportOutcome.record) {
          addOrchestrationLog(job, reportOutcome.record);
        }
        const result = reportOutcome.output;
        assertWorkflowResult(result);
        job.result = result;
        job.escalation = upsertEscalation(
          job,
          buildJobEscalation(job, job.error, "high", verification.outcome === "retry_required" ? "retry-exhausted" : "verification", job.goal.requestedByRole || "operator", {
            outcome: verification.outcome,
            findings: verification.findings.slice(0, 10),
          }),
        );
        addLog(job, "error", `Verification ended with ${verification.outcome}.`, undefined, { source: "job", actorRole: job.goal.requestedByRole });
        recordWorldEvent(job, "verification", "job", "Verification escalated", `Verification ended with ${verification.outcome}.`, {
          outcome: verification.outcome,
          findings: verification.findings.slice(0, 5),
        });
        addScratchpad(job, "verification", "Verification escalated", `Verification ended with ${verification.outcome}.`, {
          outcome: verification.outcome,
          findings: verification.findings.slice(0, 5),
        });
        await saveJob(job);
        return job;
      }

      job.status = "failed";
      job.error = "Verification failed.";
      const reportOutcome = orchestrator
        ? await orchestrator.report(workflow, job, {
            ...context,
            ...buildOrchestrationContext(job, route!),
          })
        : {
            record: undefined,
            output: services.reporting.buildWorkflowReport(workflow, job, context),
          };
      if (reportOutcome.record) {
        addOrchestrationLog(job, reportOutcome.record);
      }
      const result = reportOutcome.output;
      assertWorkflowResult(result);
      job.result = result;
      job.escalation = upsertEscalation(
        job,
        buildJobEscalation(job, "Verification failed.", "high", "verification", job.goal.requestedByRole || "operator", {
          outcome: verification.outcome,
          findings: verification.findings.slice(0, 10),
        }),
      );
      addLog(job, "error", "Verification failed.", undefined, { source: "job", actorRole: job.goal.requestedByRole });
      recordWorldEvent(job, "verification", "job", "Verification failed", "Verification did not accept the job.", {
        outcome: verification.outcome,
        findings: verification.findings.slice(0, 5),
      });
      addScratchpad(job, "verification", "Verification failed", "Verification did not accept the job.", {
        outcome: verification.outcome,
        findings: verification.findings.slice(0, 5),
      });
      await saveJob(job);
      return job;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      job.status = "failed";
      job.error = message;
      job.escalation = upsertEscalation(
        job,
        buildJobEscalation(job, `Workflow execution failed: ${message}`, "high", "verification", job.goal.requestedByRole || "operator", {
          error: message,
          route: route?.workflow,
        }),
      );
      addLog(job, "error", `Workflow execution failed: ${message}`, undefined, {
        source: "job",
        actorRole: job.goal.requestedByRole,
      });
      await saveJob(job);
      return job;
    } finally {
      await finalizeQueueState(job);
    }
  }

  return {
    async intake(goal) {
      const now = new Date().toISOString();
      const job: JobRecord = {
        jobId: `job_${randomUUID()}`,
        tenantId: goal.tenantId,
        goal,
        status: "pending",
        createdAt: now,
        updatedAt: now,
        steps: [],
        logs: [],
        scratchpad: [],
        worldState: {
          currentGoal: goal.goal,
          reasoningSummary: undefined,
          actionHistory: [],
          observations: [],
          repeatedActionWarnings: [],
          modifiedPaths: [],
          failingTests: [],
        },
        approvedStepIds: [],
        approvalStatus: "not_required",
      };
      addLog(job, "info", `Goal ingested for ${goal.product}.`, undefined, { source: "job" });
      recordWorldEvent(job, "system", "job", "Goal ingested", `Goal ingested for ${goal.product}.`, {
        product: goal.product,
        priority: goal.priority,
        mode: goal.mode,
      });
      await deps.stores.jobs.upsert(job);
      return job;
    },
    async route(jobId) {
      const job = await getJob(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} was not found.`);
      }
      await ensureRoute(job);
      return job;
    },
    async plan(jobId) {
      const job = await getJob(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} was not found.`);
      }
      const route = await ensureRoute(job);
      await ensurePlan(job, route);
      return job;
    },
    async run(jobId) {
      const job = await getJob(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} was not found.`);
      }
      if (job.status === "completed") {
        return job;
      }
      if (job.status === "waiting_approval" || job.approvalStatus === "pending") {
        await deps.stores.queue.defer(job.jobId, "Waiting for approval.", new Date(Date.now() + waitingApprovalDelayMs).toISOString());
        return job;
      }
      await enqueueJob(job, "workflow run requested");
      if (shouldExecuteInline()) {
        const claimed = await deps.stores.queue.claim(job.jobId, "inline");
        if (!claimed) {
          return job;
        }
        return runWorkflow(job.jobId);
      }
      return job;
    },
    async process(jobId) {
      return runWorkflow(jobId);
    },
    async approve(jobId, stepId, actor) {
      const job = await getJob(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} was not found.`);
      }
      const actorRole = actor?.role || "operator";
      const tenantDecision = evaluateTenantIsolation(job.tenantId, actor?.tenantId, actorRole);
      if (!tenantDecision.allowed) {
        throw new Error(tenantDecision.reason);
      }
      if (actorRole === "viewer" || actorRole === "analyst") {
        throw new Error(`Role ${actorRole} cannot approve workflow steps.`);
      }
      if (!job.approvedStepIds.includes(stepId)) {
        job.approvedStepIds = [...job.approvedStepIds, stepId];
      }
      job.approvalStatus = "approved";
      const step = job.steps.find((item) => item.id === stepId);
      if (step && step.status === "waiting_approval") {
        step.status = "pending";
        step.retry = buildRetryModel(step, retryLimit);
      }
      job.escalation = resolveEscalation(job, "resolved", `Approval recorded for step ${stepId}.`);
      addLog(job, "info", `Approval recorded for step ${stepId}.`, undefined, {
        source: "job",
        actorRole,
        actorId: actor?.subjectId,
        data: {
          stepId,
          action: "approve",
          actorId: actor?.subjectId,
        },
      });
      await saveJob(job);
      await enqueueJob(job, `approval recorded for step ${stepId}`);
      if (shouldExecuteInline()) {
        const claimed = await deps.stores.queue.claim(job.jobId, "inline");
        if (!claimed) {
          return job;
        }
        return runWorkflow(jobId);
      }
      return job;
    },
    async reject(jobId, stepId, actor) {
      const job = await getJob(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} was not found.`);
      }
      const actorRole = actor?.role || "operator";
      const tenantDecision = evaluateTenantIsolation(job.tenantId, actor?.tenantId, actorRole);
      if (!tenantDecision.allowed) {
        throw new Error(tenantDecision.reason);
      }
      if (actorRole === "viewer" || actorRole === "analyst") {
        throw new Error(`Role ${actorRole} cannot reject workflow steps.`);
      }

      const step = job.steps.find((item) => item.id === stepId);
      if (!step) {
        throw new Error(`Step ${stepId} was not found on job ${jobId}.`);
      }
      if (job.status !== "waiting_approval" && job.approvalStatus !== "pending" && step.status !== "waiting_approval") {
        throw new Error(`Step ${stepId} is not waiting for approval.`);
      }

      const rejectionReason = actor?.reason?.trim() || `Approval rejected for step ${stepId}.`;
      const route = await ensureRoute(job);
      const workflow = await ensurePlan(job, route);
      const context = createContext(job, route);

      step.status = "failed";
      step.startedAt = step.startedAt || new Date().toISOString();
      step.completedAt = new Date().toISOString();
      step.error = rejectionReason;
      step.result = {
        status: "failed",
        message: rejectionReason,
        retryable: false,
      };
      job.approvedStepIds = job.approvedStepIds.filter((item) => item !== stepId);
      job.status = "failed";
      job.approvalStatus = "rejected";
      job.error = rejectionReason;
      job.escalation = resolveEscalation(job, "resolved", rejectionReason);
      addLog(job, "warn", `Approval rejected for step ${stepId}.`, undefined, {
        source: "job",
        actorRole,
        actorId: actor?.subjectId,
        data: {
          stepId,
          reason: rejectionReason,
          action: "reject",
          actorId: actor?.subjectId,
        },
      });

      const reportOutcome = orchestrator
        ? await orchestrator.report(workflow, job, {
            ...context,
            ...buildOrchestrationContext(job, route),
          })
        : {
            record: undefined,
            output: services.reporting.buildWorkflowReport(workflow, job, context),
          };
      if (reportOutcome.record) {
        addOrchestrationLog(job, reportOutcome.record);
      }
      const result = reportOutcome.output;
      assertWorkflowResult(result);
      job.result = result;
      await saveJob(job);
      await finalizeQueueState(job);
      return job;
    },
    get: getJob,
    async list() {
      return deps.stores.jobs.list();
    },
    async dashboard() {
      const jobs = await deps.stores.jobs.list();
      const memory = await deps.stores.memory.list();
      const knowledge = await deps.stores.knowledge.list();
      return services.reporting.buildDashboardSnapshot(jobs, memory, knowledge);
    },
  };
}

function dependenciesMet(steps: readonly JobStepState[], step: JobStepState): boolean {
  return step.dependsOn.every((dependencyId) => steps.some((item) => item.id === dependencyId && item.status === "completed"));
}

function addLog(
  job: JobRecord,
  level: "debug" | "info" | "warn" | "error",
  message: string,
  data?: Record<string, unknown>,
  context?: {
    readonly step?: JobStepState;
    readonly source?: "job" | "step" | "system";
    readonly agentId?: string;
    readonly actorRole?: PrincipalRole;
    readonly actorId?: string;
    readonly data?: Record<string, unknown>;
  },
): void {
  const step = context?.step;
  job.logs = [
    ...job.logs,
    {
      id: `log_${randomUUID()}`,
      at: new Date().toISOString(),
      level,
      message,
      jobId: job.jobId,
      tenantId: job.tenantId,
      product: job.goal.product,
      workflow: job.route?.workflow || job.goal.product,
      stepId: step?.id,
      stepType: step?.type,
      tool: step?.tool,
      agentId: context?.agentId,
      actorRole: context?.actorRole,
      actorId: context?.actorId,
      source: context?.source || (step ? "step" : "job"),
      data: context?.data || data,
    },
  ];
}

function addOrchestrationLog(
  job: JobRecord,
  record: {
    readonly agentId: string;
    readonly phase: string;
    readonly durationMs: number;
    readonly summary: string;
    readonly status: string;
  },
): void {
  addLog(job, record.status === "failed" ? "error" : "info", `${record.agentId} completed ${record.phase}.`, undefined, {
    source: "system",
    agentId: record.agentId,
    actorRole: "system",
    data: {
      phase: record.phase,
      durationMs: record.durationMs,
      summary: record.summary,
      status: record.status,
    },
  });
}

function buildOrchestrationContext(job: JobRecord, route?: RouteDecision, step?: JobStepState): Stage2OrchestrationContext {
  return {
    jobId: job.jobId,
    tenantId: job.tenantId,
    product: job.goal.product,
    workflow: route?.workflow || job.route?.workflow,
    stepId: step?.id,
    stepType: step?.type,
    actorRole: job.goal.requestedByRole,
    requestedByRole: job.goal.requestedByRole,
    approvalStatus: job.approvalStatus,
    mode: job.goal.mode,
    riskLevel: route?.riskLevel || job.route?.riskLevel,
    source: "job-engine",
  };
}

function upsertEscalation(job: JobRecord, escalation: ReturnType<typeof buildJobEscalation>): NonNullable<JobRecord["escalation"]> {
  if (!job.escalation || job.escalation.status === "resolved") {
    return escalation;
  }

  return {
    ...job.escalation,
    ...escalation,
    escalationId: job.escalation.escalationId,
    status: job.escalation.status,
    createdAt: job.escalation.createdAt,
  };
}

function resolveEscalation(
  job: JobRecord,
  status: "open" | "acknowledged" | "resolved",
  reason: string,
): NonNullable<JobRecord["escalation"]> | undefined {
  if (!job.escalation) {
    return undefined;
  }

  return {
    ...job.escalation,
    status,
    reason,
    updatedAt: new Date().toISOString(),
  };
}
