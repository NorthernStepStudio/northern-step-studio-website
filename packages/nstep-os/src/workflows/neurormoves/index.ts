import { randomUUID } from "node:crypto";
import type {
  GoalInput,
  JobRecord,
  JobStepState,
  MemoryEntry,
  StepResult,
  VerificationFinding,
  VerificationResult,
  WorkflowDefinition,
  WorkflowExecutionContext,
  WorkflowPlan,
  WorkflowPlanningContext,
  WorkflowResult,
  WorkflowStep,
} from "../../core/types.js";

interface NeuroMovesPayload {
  readonly neurormoves?: {
    readonly childName?: string;
    readonly ageGroup?: string;
    readonly focus?: string;
    readonly strengths?: readonly string[];
    readonly challenges?: readonly string[];
    readonly preferredTone?: "warm" | "neutral" | "direct";
    readonly parentEmail?: string;
    readonly nextCheckInDays?: number;
    readonly routineWindow?: string;
  };
}

interface NeuroMovesInput {
  readonly goal: GoalInput;
  readonly childName: string;
  readonly ageGroup: string;
  readonly focus: string;
  readonly strengths: readonly string[];
  readonly challenges: readonly string[];
  readonly preferredTone: "warm" | "neutral" | "direct";
  readonly parentEmail?: string;
  readonly nextCheckInDays: number;
  readonly routineWindow?: string;
}

const STEP_TYPES = {
  capture: "capture_support_request",
  map: "map_needs_and_constraints",
  routine: "generate_routine_steps",
  schedule: "schedule_followup_checkin",
  send: "send_parent_summary",
  remember: "update_memory",
  report: "report_summary",
} as const;

function extractNeuroMovesInput(goal: GoalInput): NeuroMovesInput {
  const payload = goal.payload as NeuroMovesPayload | undefined;
  const raw = payload?.neurormoves ?? (goal.payload as Record<string, unknown> | undefined);
  return {
    goal,
    childName: stringField(raw, "childName") || "Child",
    ageGroup: stringField(raw, "ageGroup") || "school-age",
    focus: stringField(raw, "focus") || goal.goal,
    strengths: arrayField(raw, "strengths"),
    challenges: arrayField(raw, "challenges"),
    preferredTone: resolveTone(stringField(raw, "preferredTone")),
    parentEmail: stringField(raw, "parentEmail"),
    nextCheckInDays: numberField(raw, "nextCheckInDays") || 7,
    routineWindow: stringField(raw, "routineWindow"),
  };
}

function planNeuroMoves(input: NeuroMovesInput, _context?: WorkflowPlanningContext): WorkflowPlan {
  const steps: WorkflowStep[] = [
    {
      id: "s1",
      type: STEP_TYPES.capture,
      title: "Capture the support request",
      tool: "database",
      dependsOn: [],
      input: {
        childName: input.childName,
        ageGroup: input.ageGroup,
        focus: input.focus,
      },
    },
    {
      id: "s2",
      type: STEP_TYPES.map,
      title: "Map needs and constraints",
      tool: "llm",
      dependsOn: ["s1"],
      input: {
        strengths: input.strengths,
        challenges: input.challenges,
      },
    },
    {
      id: "s3",
      type: STEP_TYPES.routine,
      title: "Generate the routine steps",
      tool: "api",
      dependsOn: ["s2"],
      input: {},
    },
    {
      id: "s4",
      type: STEP_TYPES.schedule,
      title: "Schedule the follow-up check-in",
      tool: "scheduler",
      dependsOn: ["s3"],
      input: {
        nextCheckInDays: input.nextCheckInDays,
      },
    },
    {
      id: "s5",
      type: STEP_TYPES.send,
      title: "Send the summary to the parent or provider",
      tool: "email",
      dependsOn: ["s4"],
      input: {
        parentEmail: input.parentEmail,
      },
      approvalRequired: input.goal.mode === "assist",
      retryable: true,
    },
    {
      id: "s6",
      type: STEP_TYPES.remember,
      title: "Update memory with the routine pattern",
      tool: "memory",
      dependsOn: ["s5"],
      input: {},
    },
    {
      id: "s7",
      type: STEP_TYPES.report,
      title: "Report the support plan",
      tool: "api",
      dependsOn: ["s6"],
      input: {},
    },
  ];

  return {
    workflow: "neurormoves",
    jobId: "pending",
    steps,
    approvalsRequired: input.goal.mode === "assist",
    summary: `NeuroMoves support routine for ${input.childName}.`,
  };
}

async function executeNeuroMovesStep(step: JobStepState, context: WorkflowExecutionContext & { readonly input: NeuroMovesInput }): Promise<StepResult> {
  const input = context.input;

  switch (step.type) {
    case STEP_TYPES.capture:
      return {
        status: "completed",
        message: "Support request captured.",
        output: {
          childName: input.childName,
          focus: input.focus,
        },
      };
    case STEP_TYPES.map:
      return {
        status: "completed",
        message: "Needs and constraints mapped.",
        output: buildSupportProfile(input),
      };
    case STEP_TYPES.routine: {
      const routine = buildRoutine(input);
      return {
        status: "completed",
        message: "Routine generated.",
        output: routine,
      };
    }
    case STEP_TYPES.schedule: {
      const scheduler = context.tools.scheduler as { schedule(input: { runAt: string; detail?: string; task: () => Promise<void> | void }): Promise<{ id: string; runAt: string; status: string; detail?: string }>; } | undefined;
      if (!scheduler) {
        return {
          status: "blocked",
          message: "No scheduler adapter is configured.",
          retryable: true,
        };
      }

      const runAt = new Date(Date.now() + input.nextCheckInDays * 24 * 60 * 60 * 1000).toISOString();
      const task = await scheduler.schedule({
        runAt,
        detail: `NeuroMoves follow-up for ${input.childName}`,
        task: async () => {
          await context.stores.memory.upsert(buildNeuroMovesMemory(input, `follow-up:${runAt}`, context.job.jobId));
        },
      });

      return {
        status: "completed",
        message: "Check-in scheduled.",
        output: {
          task,
        },
      };
    }
    case STEP_TYPES.send: {
      if (!input.parentEmail) {
        return {
          status: "completed",
          message: "No email recipient provided, summary skipped.",
          output: {
            skipped: true,
          },
        };
      }

      const email = context.tools.email as { send(message: { to: string; subject: string; text: string; html?: string; meta?: Record<string, unknown> }): Promise<{ status: "queued" | "sent" | "failed"; messageId: string; detail?: string; raw?: unknown }>; } | undefined;
      if (!email) {
        return {
          status: "blocked",
          message: "No email adapter is configured.",
          retryable: true,
        };
      }

      const routine = buildRoutine(input);
      const delivery = await email.send({
        to: input.parentEmail,
        subject: `NeuroMoves support routine for ${input.childName}`,
        text: buildParentSummary(input, routine),
        meta: {
          focus: input.focus,
          childName: input.childName,
        },
      });

      return {
        status: delivery.status === "failed" ? "failed" : "completed",
        message: delivery.detail || "Summary sent.",
        output: {
          delivery,
        },
        retryable: delivery.status === "failed",
      };
    }
    case STEP_TYPES.remember: {
      const memory = buildNeuroMovesMemory(input, "routine-template", context.job.jobId);
      await context.stores.memory.upsert(memory);
      return {
        status: "completed",
        message: "Memory entry stored.",
        output: {
          memoryId: memory.id,
        },
      };
    }
    case STEP_TYPES.report:
      return {
        status: "completed",
        message: "Support plan report generated.",
        output: {
          summary: buildParentSummary(input, buildRoutine(input)),
        },
      };
    default:
      return {
        status: "failed",
        message: `Unsupported NeuroMoves step type: ${step.type}`,
        retryable: false,
      };
  }
}

function verifyNeuroMovesJob(job: JobRecord, input: NeuroMovesInput): VerificationResult {
  const findings: VerificationFinding[] = [];
  const routineStep = job.steps.find((step) => step.type === STEP_TYPES.routine);
  const scheduleStep = job.steps.find((step) => step.type === STEP_TYPES.schedule);
  const sendStep = job.steps.find((step) => step.type === STEP_TYPES.send);

  if (!routineStep || routineStep.status !== "completed") {
    findings.push({
      severity: "error",
      category: "deliverables",
      message: "Routine generation did not complete.",
    });
  }

  if (!scheduleStep || scheduleStep.status !== "completed") {
    findings.push({
      severity: "warning",
      category: "deliverables",
      message: "The follow-up check-in was not scheduled.",
    });
  }

  if (input.parentEmail && sendStep?.status === "failed") {
    findings.push({
      severity: "warning",
      category: "delivery",
      message: "The summary email failed to send.",
    });
  }

  const accepted = findings.every((item) => item.severity !== "error");
  return {
    outcome: accepted ? "accepted" : "human_review_required",
    checkedAt: new Date().toISOString(),
    findings,
    score: {
      acceptance: routineStep?.status === "completed" ? 100 : 30,
      scope: 90,
      commands: 88,
      integrity: accepted ? 92 : 70,
      compliance: input.goal.mode === "assist" ? 94 : 96,
      overall: accepted ? 90 : 66,
    },
  };
}

function buildSupportProfile(input: NeuroMovesInput) {
  return {
    childName: input.childName,
    ageGroup: input.ageGroup,
    focus: input.focus,
    strengths: input.strengths,
    challenges: input.challenges,
    preferredTone: input.preferredTone,
    routineWindow: input.routineWindow || "flexible",
  };
}

function buildRoutine(input: NeuroMovesInput) {
  const profile = buildSupportProfile(input);
  const intro = `${input.childName}'s ${input.focus} routine`;
  const steps = [
    `Open with one clear cue and one visual reminder.`,
    `Do the first ${input.focus.toLowerCase()} task immediately after the cue.`,
    `Use one short break after the first success.`,
    `Repeat the next step with the same order every day.`,
    `Close with a quick check-in and praise the completed step.`,
  ];

  return {
    title: intro,
    profile,
    steps,
    notes: [
      `Use a ${input.preferredTone} tone.`,
      input.strengths.length > 0 ? `Strengths: ${input.strengths.join(", ")}.` : undefined,
      input.challenges.length > 0 ? `Challenges: ${input.challenges.join(", ")}.` : undefined,
    ].filter(Boolean),
  };
}

function buildParentSummary(input: NeuroMovesInput, routine: ReturnType<typeof buildRoutine>) {
  return [
    `Hi ${input.childName ? input.childName : "there"},`,
    `Here is the current support routine for ${input.focus}:`,
    ...routine.steps.map((step) => `- ${step}`),
    "",
    ...routine.notes.map((note) => `- ${note}`),
  ].join("\n");
}

function buildNeuroMovesMemory(input: NeuroMovesInput, key: string, jobId: string): MemoryEntry {
  const now = new Date().toISOString();
  return {
    id: `memory_${randomUUID()}`,
    tenantId: input.goal.tenantId,
    product: "neurormoves",
    category: "success-pattern",
    key: `neurormoves.${key}`,
    value: {
      childName: input.childName,
      ageGroup: input.ageGroup,
      focus: input.focus,
      preferredTone: input.preferredTone,
      nextCheckInDays: input.nextCheckInDays,
    },
    confidence: 0.9,
    sourceJobId: jobId,
    editable: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function createNeuroMovesWorkflow(): WorkflowDefinition {
  return {
    key: "neurormoves",
    title: "NeuroMoves",
    description: "Generate support routines, schedule follow-ups, and produce family-facing summaries.",
    buildPlan(goal, context) {
      return planNeuroMoves(extractNeuroMovesInput(goal), context);
    },
    async executeStep(step, context) {
      return executeNeuroMovesStep(step, {
        ...context,
        input: extractNeuroMovesInput(context.job.goal),
      });
    },
    async verify(job) {
      const input = extractNeuroMovesInput(job.goal);
      return verifyNeuroMovesJob(job, input);
    },
    async createMemory(job) {
      const input = extractNeuroMovesInput(job.goal);
      return [buildNeuroMovesMemory(input, "memory", job.jobId)];
    },
    report(job) {
      const input = extractNeuroMovesInput(job.goal);
      return {
        status: "partial",
        summary: `NeuroMoves generated a support routine for ${input.childName}.`,
        actionsTaken: [
          "captured the support request",
          "mapped needs and constraints",
          "generated a routine",
          "scheduled a follow-up",
          "sent a summary when allowed",
          "stored a reusable memory entry",
        ],
        data: {
          jobId: job.jobId,
          childName: input.childName,
          focus: input.focus,
          routine: buildRoutine(input),
        },
      };
    },
  };
}

function arrayField(value: Record<string, unknown> | undefined, key: string): string[] {
  const raw = value?.[key];
  return Array.isArray(raw) ? raw.map((item) => String(item).trim()).filter(Boolean) : [];
}

function stringField(value: Record<string, unknown> | undefined, key: string): string | undefined {
  const raw = value?.[key];
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
}

function numberField(value: Record<string, unknown> | undefined, key: string): number | undefined {
  const raw = value?.[key];
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }
  if (typeof raw === "string" && raw.trim()) {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function resolveTone(value: string | undefined): "warm" | "neutral" | "direct" {
  if (value === "direct" || value === "warm" || value === "neutral") {
    return value;
  }
  return "warm";
}
