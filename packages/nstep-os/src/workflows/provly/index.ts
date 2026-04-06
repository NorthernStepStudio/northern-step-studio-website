import { randomUUID } from "node:crypto";
import type {
  GoalInput,
  JobRecord,
  JobStepState,
  MemoryEntry,
  ProvLyAnalysisReport,
  ProvLyClaimExport,
  ProvLyCompletenessSummary,
  ProvLyIntake,
  ProvLyInventoryItem,
  ProvLyStore,
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
import { DEFAULT_PROVLY_CURRENCY, DEFAULT_PROVLY_HIGH_VALUE_THRESHOLD } from "./catalog.js";
import { buildProvLyClaimExport, evaluateProvLyClaimPrep, type ProvLyClaimPrepResult } from "./claims.js";
import { classifyProvLyInventory, type ProvLyClassificationResult } from "./classification.js";
import { checkProvLyCompleteness, type ProvLyCompletenessResult } from "./completeness.js";
import { extractProvLyIntake } from "./intake.js";
import { enrichProvLyIntakeFromVisualAssets, type ProvLyVisualExtractionSummary } from "./extraction.js";
import { normalizeProvLyInventory, type ProvLyNormalizationResult } from "./normalization.js";
import { buildProvLyMemoryEntries } from "./memory.js";
import {
  buildProvLyActions,
  buildProvLyAnalysisReport,
  buildProvLyWorkflowResult,
  type ProvLyReportContext,
} from "./report.js";
import { createProvLyCaseId } from "./store.js";
import type { OcrAdapter } from "../../tools/ocr/index.js";

const STEP_TYPES = {
  capture: "capture_provly_case",
  normalize: "normalize_inventory_records",
  classify: "classify_inventory_context",
  completeness: "review_documentation_completeness",
  claimPrep: "apply_claim_prep_rules",
  export: "generate_claim_export",
  remind: "generate_document_reminders",
  report: "build_provly_report",
  persist: "persist_provly_artifacts",
} as const;

interface CaptureStepOutput {
  readonly intake: ProvLyIntake;
  readonly extraction: ProvLyVisualExtractionSummary;
}

interface NormalizeStepOutput {
  readonly intake: ProvLyIntake;
  readonly normalization: ProvLyNormalizationResult;
}

interface ClassificationStepOutput {
  readonly classification: ProvLyClassificationResult;
}

interface CompletenessStepOutput {
  readonly completeness: ProvLyCompletenessSummary;
  readonly ruleNotes: readonly string[];
  readonly reminders: readonly string[];
  readonly priorityItems: readonly ProvLyInventoryItem[];
}

interface ClaimPrepStepOutput {
  readonly claimPrep: ProvLyClaimPrepResult;
}

interface ExportStepOutput {
  readonly claimExport: ProvLyClaimExport;
}

interface ReminderStepOutput {
  readonly reminder: {
    readonly status: "draft" | "queued" | "sent" | "failed" | "skipped";
    readonly recipients: readonly string[];
    readonly subject?: string;
    readonly body?: string;
    readonly messageId?: string;
    readonly detail?: string;
  };
}

interface PersistStepOutput {
  readonly persistence: {
    readonly itemIds: readonly string[];
    readonly categoryIds: readonly string[];
    readonly roomIds: readonly string[];
    readonly attachmentIds: readonly string[];
    readonly receiptIds: readonly string[];
    readonly completenessCheckId: string;
    readonly exportId: string;
    readonly reportId: string;
    readonly preferenceId?: string;
  };
}

interface ReportStepOutput {
  readonly report: ProvLyAnalysisReport;
}

export function createProvLyWorkflow(): WorkflowDefinition {
  return {
    key: "provly",
    title: "ProvLy",
    description: "Organize home inventory records, score documentation completeness, and prepare claim-ready exports.",
    buildPlan(goal, context) {
      return buildProvLyPlan(goal, context);
    },
    async executeStep(step, context) {
      return executeProvLyStep(step, context);
    },
    async verify(job, context) {
      return verifyProvLyJob(job, context);
    },
    async createMemory(job) {
      const reportContext = resolveReportContext(job);
      const report = resolveReportOutput(job, reportContext);
      return buildProvLyMemoryEntries(reportContext.intake, report);
    },
    report(job) {
      const reportContext = resolveReportContext(job);
      const report = resolveReportOutput(job, reportContext);
      return buildProvLyWorkflowResult(reportContext, report);
    },
  };
}

function buildProvLyPlan(goal: GoalInput, context: WorkflowPlanningContext): WorkflowPlan {
  const intake = extractProvLyIntake(goal);
  const steps: WorkflowStep[] = [];

  const captureId = addStep(steps, {
    type: STEP_TYPES.capture,
    title: "Capture inventory case and extract photos",
    tool: "database",
    dependsOn: [],
    approvalRequired: false,
    input: {
      caseId: intake.caseId,
      claimantName: intake.claimantName,
      claimType: intake.claimType,
      visualAssetCount: intake.visualAssets.length,
    },
  });

  const normalizeId = addStep(steps, {
    type: STEP_TYPES.normalize,
    title: "Normalize inventory records",
    tool: "database",
    dependsOn: [captureId],
    approvalRequired: false,
    input: {
      itemCount: intake.inventoryItems.length,
      attachmentCount: intake.attachments.length,
      receiptCount: intake.receipts.length,
    },
  });

  const classifyId = addStep(steps, {
    type: STEP_TYPES.classify,
    title: "Classify rooms and categories",
    tool: "llm",
    dependsOn: [normalizeId],
    approvalRequired: false,
    input: {
      roomCount: intake.rooms.length,
      reminderMode: intake.reminderMode,
    },
  });

  const completenessId = addStep(steps, {
    type: STEP_TYPES.completeness,
    title: "Check documentation completeness",
    tool: "llm",
    dependsOn: [classifyId],
    approvalRequired: false,
    input: {
      highValueThreshold: intake.highValueThreshold,
      exportFormat: intake.exportFormat,
    },
  });

  const claimPrepId = addStep(steps, {
    type: STEP_TYPES.claimPrep,
    title: "Apply claim-prep rules",
    tool: "llm",
    dependsOn: [completenessId],
    approvalRequired: false,
    input: {
      policyName: intake.policyName,
      policyDeadline: intake.policyDeadline,
    },
  });

  const exportId = addStep(steps, {
    type: STEP_TYPES.export,
    title: "Generate claim-ready export",
    tool: "api",
    dependsOn: [claimPrepId],
    approvalRequired: false,
    input: {
      exportFormat: intake.exportFormat,
    },
  });

  const shouldSendReminder = Boolean(intake.reminderEmail || intake.reminderPhone) && intake.reminderMode !== "dashboard";
  const remindId = addStep(
    steps,
    {
      type: STEP_TYPES.remind,
      title: "Generate documentation reminder",
      tool: "email",
      dependsOn: [exportId],
      approvalRequired: goal.mode === "assist" && shouldSendReminder,
      retryable: true,
      input: {
        reminderMode: intake.reminderMode,
        recipientCount: [intake.reminderEmail, intake.reminderPhone].filter(Boolean).length,
      },
    },
  );

  const reportId = addStep(steps, {
    type: STEP_TYPES.report,
    title: "Build claim readiness report",
    tool: "api",
    dependsOn: [remindId],
    approvalRequired: false,
    input: {
      caseId: intake.caseId,
      claimType: intake.claimType,
    },
  });

  addStep(steps, {
    type: STEP_TYPES.persist,
    title: "Persist ProvLy artifacts",
    tool: "database",
    dependsOn: [reportId],
    approvalRequired: false,
    input: {
      caseId: intake.caseId,
      itemCount: intake.inventoryItems.length,
    },
  });

  return {
    workflow: "provly",
    jobId: "pending",
    steps,
    approvalsRequired: goal.mode === "assist" || context.route.approvalRequired,
    summary: `ProvLy ${intake.operation} for ${intake.claimantName}.`,
  };
}

async function executeProvLyStep(step: JobStepState, context: WorkflowExecutionContext): Promise<StepResult> {
  const intake = resolveIntake(context.job);

  switch (step.type) {
    case STEP_TYPES.capture: {
      const ocr = context.tools.ocr as OcrAdapter | undefined;
      const extraction = await enrichProvLyIntakeFromVisualAssets(intake, ocr);
      return {
        status: "completed",
        message: extraction.summary.usedOcr ? "Inventory case captured and visual assets extracted." : "Inventory case captured.",
        output: {
          intake: extraction.intake,
          extraction: extraction.summary,
        } satisfies CaptureStepOutput,
      };
    }
    case STEP_TYPES.normalize: {
      const normalization = normalizeProvLyInventory(intake);
      return {
        status: "completed",
        message: "Inventory records normalized.",
        output: {
          intake,
          normalization,
        } satisfies NormalizeStepOutput,
      };
    }
    case STEP_TYPES.classify: {
      const normalization = resolveNormalization(context.job, intake);
      const classification = classifyProvLyInventory(intake, normalization);
      return {
        status: "completed",
        message: "Rooms and categories classified.",
        output: {
          classification,
        } satisfies ClassificationStepOutput,
      };
    }
    case STEP_TYPES.completeness: {
      const normalization = resolveNormalization(context.job, intake);
      const classification = resolveClassification(context.job, intake, normalization);
      const result = checkProvLyCompleteness(intake, classification, normalization);
      return {
        status: "completed",
        message: "Documentation completeness reviewed.",
        output: {
          completeness: result.completeness,
          ruleNotes: result.ruleNotes,
          reminders: result.reminders,
          priorityItems: result.priorityItems,
        } satisfies CompletenessStepOutput,
      };
    }
    case STEP_TYPES.claimPrep: {
      const normalization = resolveNormalization(context.job, intake);
      const classification = resolveClassification(context.job, intake, normalization);
      const completeness = resolveCompleteness(context.job, intake, classification, normalization);
      const claimPrep = evaluateProvLyClaimPrep(intake, classification, completeness);
      return {
        status: "completed",
        message: "Claim-prep rules applied.",
        output: {
          claimPrep,
        } satisfies ClaimPrepStepOutput,
      };
    }
    case STEP_TYPES.export: {
      const normalization = resolveNormalization(context.job, intake);
      const classification = resolveClassification(context.job, intake, normalization);
      const completeness = resolveCompleteness(context.job, intake, classification, normalization);
      const claimPrep = resolveClaimPrep(context.job, intake, classification, completeness);
      const claimExport = buildProvLyClaimExport(intake, classification, completeness, claimPrep);
      return {
        status: "completed",
        message: "Claim export generated.",
        output: {
          claimExport,
        } satisfies ExportStepOutput,
      };
    }
    case STEP_TYPES.remind: {
      const normalization = resolveNormalization(context.job, intake);
      const classification = resolveClassification(context.job, intake, normalization);
      const completeness = resolveCompleteness(context.job, intake, classification, normalization);
      const claimPrep = resolveClaimPrep(context.job, intake, classification, completeness);
      if (!claimPrep.reminderDraft || claimPrep.reminderDraft.recipients.length === 0 || intake.reminderMode === "dashboard") {
        return {
          status: "completed",
          message: "Reminder draft skipped.",
          output: {
            reminder: {
              status: "skipped",
              recipients: claimPrep.reminderDraft?.recipients || [],
              detail: "No reminder dispatch was needed.",
            },
          } satisfies ReminderStepOutput,
        };
      }

      const email = context.tools.email as
        | {
            send(message: { to: string; subject: string; text: string; html?: string; meta?: Record<string, unknown> }): Promise<{ messageId: string; status: "queued" | "sent" | "failed"; detail?: string; raw?: unknown }>;
          }
        | undefined;

      if (!email) {
        return {
          status: "completed",
          message: "Reminder draft prepared.",
          output: {
            reminder: {
              status: "draft",
              recipients: claimPrep.reminderDraft.recipients,
              subject: claimPrep.reminderDraft.subject,
              body: claimPrep.reminderDraft.body,
              detail: "No email adapter was configured, so a draft was produced.",
            },
          } satisfies ReminderStepOutput,
        };
      }

      const recipient = claimPrep.reminderDraft.recipients[0];
      const delivery = await email.send({
        to: recipient,
        subject: claimPrep.reminderDraft.subject,
        text: claimPrep.reminderDraft.body,
        meta: {
          caseId: intake.caseId,
          claimType: intake.claimType,
          claimReady: false,
        },
      });

      return {
        status: delivery.status === "failed" ? "failed" : "completed",
        message: delivery.detail || "Reminder dispatched.",
        output: {
          reminder: {
            status: delivery.status === "failed" ? "failed" : delivery.status,
            recipients: claimPrep.reminderDraft.recipients,
            subject: claimPrep.reminderDraft.subject,
            body: claimPrep.reminderDraft.body,
            messageId: delivery.messageId,
            detail: delivery.detail,
          },
        } satisfies ReminderStepOutput,
        retryable: delivery.status === "failed",
      };
    }
    case STEP_TYPES.report: {
      const reportContext = resolveReportContext(context.job);
      const report = buildProvLyAnalysisReport(reportContext);
      return {
        status: "completed",
        message: "ProvLy report generated.",
        output: {
          report,
        } satisfies ReportStepOutput,
      };
    }
    case STEP_TYPES.persist: {
      const reportContext = resolveReportContext(context.job);
      const report = resolveReportOutput(context.job, reportContext);
      const persistence = await persistProvLyArtifacts(context, reportContext, report);
      return {
        status: "completed",
        message: "ProvLy artifacts persisted.",
        output: {
          persistence,
        } satisfies PersistStepOutput,
      };
    }
    default:
      return {
        status: "failed",
        message: `Unsupported ProvLy step type: ${step.type}`,
        retryable: false,
      };
  }
}

function verifyProvLyJob(job: JobRecord, context: WorkflowExecutionContext): VerificationResult {
  const reportContext = resolveReportContext(job);
  const report = resolveReportOutput(job, reportContext);
  const findings: VerificationFinding[] = [];

  if (!readStepOutput(job, STEP_TYPES.normalize)) {
    findings.push({
      severity: "error",
      category: "deliverables",
      message: "Inventory normalization did not complete.",
    });
  }

  if (!readStepOutput(job, STEP_TYPES.classify)) {
    findings.push({
      severity: "error",
      category: "deliverables",
      message: "Room and category classification did not complete.",
    });
  }

  if (report.inventory.itemCount === 0) {
    findings.push({
      severity: "warning",
      category: "deliverables",
      message: "No inventory items were captured in the ProvLy report.",
    });
  }

  if (!report.completeness.claimReady) {
    findings.push({
      severity: "warning",
      category: "compliance",
      message: "The claim packet still needs documentation review.",
    });
  }

  if (report.claimExport.status === "needs-review") {
    findings.push({
      severity: "warning",
      category: "deliverables",
      message: "The claim export requires human review.",
    });
  }

  if (report.reminders.length > 0 && !reportContext.reminderResult && report.completeness.claimReady === false) {
    findings.push({
      severity: "warning",
      category: "delivery",
      message: "Documentation reminders were prepared but not dispatched.",
    });
  }

  const accepted = findings.every((finding) => finding.severity !== "error") && report.inventory.itemCount > 0;

  return {
    outcome: accepted && report.completeness.claimReady ? "accepted" : "human_review_required",
    checkedAt: new Date().toISOString(),
    findings,
    score: {
      acceptance: report.completeness.score,
      scope: report.inventory.itemCount > 0 ? 92 : 48,
      commands: 90,
      integrity: report.completeness.claimReady ? 94 : 72,
      compliance: report.completeness.status === "fail" ? 68 : 92,
      overall: report.completeness.claimReady ? 90 : 74,
    },
  };
}

export function buildProvLyMemoryEntriesFromJob(job: JobRecord): MemoryEntry[] {
  const reportContext = resolveReportContext(job);
  const report = resolveReportOutput(job, reportContext);
  return buildProvLyMemoryEntries(reportContext.intake, report);
}

function resolveReportContext(job: JobRecord): ProvLyReportContext {
  const intake = resolveIntake(job);
  const normalization = resolveNormalization(job, intake);
  const classification = resolveClassification(job, intake, normalization);
  const completeness = resolveCompleteness(job, intake, classification, normalization);
  const claimPrep = resolveClaimPrep(job, intake, classification, completeness);
  const claimExport = resolveClaimExport(job, intake, classification, completeness, claimPrep);
  const reminderResult = resolveReminderResult(job);
  const baseContext = {
    intake,
    classification,
    completeness,
    claimPrep,
    claimExport,
    reminderResult,
    job,
  };
  const actionsTaken = buildProvLyActions(baseContext);
  const persistence = resolvePersistence(job);

  return {
    ...baseContext,
    persistence,
    actionsTaken,
  };
}

function resolveIntake(job: JobRecord): ProvLyIntake {
  const capture = readStepOutput<CaptureStepOutput>(job, STEP_TYPES.capture);
  if (capture?.intake) {
    return capture.intake;
  }
  const normalized = readStepOutput<NormalizeStepOutput>(job, STEP_TYPES.normalize);
  if (normalized?.intake) {
    return normalized.intake;
  }
  return extractProvLyIntake(job.goal);
}

function resolveNormalization(job: JobRecord, intake: ProvLyIntake): ProvLyNormalizationResult {
  const output = readStepOutput<NormalizeStepOutput>(job, STEP_TYPES.normalize);
  return output?.normalization || normalizeProvLyInventory(intake);
}

function resolveClassification(job: JobRecord, intake: ProvLyIntake, normalization: ProvLyNormalizationResult): ProvLyClassificationResult {
  const output = readStepOutput<ClassificationStepOutput>(job, STEP_TYPES.classify);
  return output?.classification || classifyProvLyInventory(intake, normalization);
}

function resolveCompleteness(
  job: JobRecord,
  intake: ProvLyIntake,
  classification: ProvLyClassificationResult,
  normalization: ProvLyNormalizationResult,
): ProvLyCompletenessSummary {
  const output = readStepOutput<CompletenessStepOutput>(job, STEP_TYPES.completeness);
  return output?.completeness || checkProvLyCompleteness(intake, classification, normalization).completeness;
}

function resolveClaimPrep(
  job: JobRecord,
  intake: ProvLyIntake,
  classification: ProvLyClassificationResult,
  completeness: ProvLyCompletenessSummary,
): ProvLyClaimPrepResult {
  const output = readStepOutput<ClaimPrepStepOutput>(job, STEP_TYPES.claimPrep);
  return output?.claimPrep || evaluateProvLyClaimPrep(intake, classification, completeness);
}

function resolveClaimExport(
  job: JobRecord,
  intake: ProvLyIntake,
  classification: ProvLyClassificationResult,
  completeness: ProvLyCompletenessSummary,
  claimPrep: ProvLyClaimPrepResult,
): ProvLyClaimExport {
  const output = readStepOutput<ExportStepOutput>(job, STEP_TYPES.export);
  return output?.claimExport || buildProvLyClaimExport(intake, classification, completeness, claimPrep);
}

function resolveReminderResult(job: JobRecord): ProvLyReportContext["reminderResult"] {
  const output = readStepOutput<ReminderStepOutput>(job, STEP_TYPES.remind);
  return output?.reminder;
}

function resolvePersistence(job: JobRecord): ProvLyReportContext["persistence"] {
  const output = readStepOutput<PersistStepOutput>(job, STEP_TYPES.persist);
  return output?.persistence;
}

function resolveReportOutput(job: JobRecord, reportContext: ProvLyReportContext): ProvLyAnalysisReport {
  const output = readStepOutput<ReportStepOutput>(job, STEP_TYPES.report);
  return output?.report || buildProvLyAnalysisReport(reportContext);
}

async function persistProvLyArtifacts(
  context: WorkflowExecutionContext,
  reportContext: ProvLyReportContext,
  report: ProvLyAnalysisReport,
): Promise<NonNullable<ProvLyReportContext["persistence"]>> {
  const now = new Date().toISOString();
  const store: ProvLyStore = context.stores.provly;
  const itemIds: string[] = [];
  for (const item of reportContext.classification.items) {
    await store.upsertInventoryItem({
      ...item,
      updatedAt: now,
      createdAt: item.createdAt || now,
    });
    itemIds.push(item.itemId);
  }

  const categoryIds: string[] = [];
  for (const category of reportContext.classification.categories) {
    await store.upsertInventoryCategory({
      ...category,
      updatedAt: now,
      createdAt: category.createdAt || now,
    });
    categoryIds.push(category.categoryId);
  }

  const roomIds: string[] = [];
  for (const room of reportContext.classification.rooms) {
    await store.upsertRoom({
      ...room,
      updatedAt: now,
      createdAt: room.createdAt || now,
    });
    roomIds.push(room.roomId);
  }

  const attachmentIds: string[] = [];
  const normalization = resolveNormalization(context.job, reportContext.intake);
  for (const attachment of normalization.attachments) {
    await store.upsertAttachment(attachment);
    attachmentIds.push(attachment.attachmentId);
  }

  const receiptIds: string[] = [];
  for (const receipt of normalization.receipts) {
    await store.upsertReceipt(receipt);
    receiptIds.push(receipt.receiptId);
  }

  await store.upsertCompletenessCheck(report.completeness);
  await store.upsertClaimExport(report.claimExport);
  await store.upsertAnalysisReport(report);

  const preferenceId = await persistPreference(store, reportContext, now);

  return {
    itemIds,
    categoryIds,
    roomIds,
    attachmentIds,
    receiptIds,
    completenessCheckId: report.completeness.checkId,
    exportId: report.claimExport.exportId,
    reportId: report.reportId,
    preferenceId,
  };
}

async function persistPreference(store: ProvLyStore, reportContext: ProvLyReportContext, now: string): Promise<string | undefined> {
  const preferenceId = `preference_${reportContext.intake.caseId}`;
  const hasPreference =
    Object.keys(reportContext.intake.preferences || {}).length > 0 ||
    reportContext.intake.rooms.length > 0 ||
    reportContext.intake.policyName !== undefined ||
    reportContext.intake.highValueThreshold !== DEFAULT_PROVLY_HIGH_VALUE_THRESHOLD ||
    reportContext.intake.preferredCurrency !== DEFAULT_PROVLY_CURRENCY;

  if (!hasPreference) {
    return undefined;
  }

  await store.upsertUserPreference({
    preferenceId,
    tenantId: reportContext.intake.goal.tenantId,
    defaultCurrency: reportContext.intake.preferredCurrency,
    reportStyle: resolveReportStyle(reportContext.intake.preferences?.reportStyle),
    preferredRooms: reportContext.intake.rooms,
    highValueThreshold: reportContext.intake.highValueThreshold,
    reminderMode: reportContext.intake.reminderMode,
    exportFormat: reportContext.intake.exportFormat,
    updatedAt: now,
    metadata: {
      caseId: reportContext.intake.caseId,
      claimType: reportContext.intake.claimType,
      policyName: reportContext.intake.policyName,
    },
  });

  return preferenceId;
}

function resolveReportStyle(value: unknown): "concise" | "balanced" | "detailed" {
  if (value === "concise" || value === "detailed") {
    return value;
  }
  return "balanced";
}

function readStepOutput<T>(job: JobRecord, type: string): T | undefined {
  const step = job.steps.find((item) => item.type === type);
  return step?.result?.output as T | undefined;
}

function addStep(steps: WorkflowStep[], step: Omit<WorkflowStep, "id">): string {
  const id = `s${steps.length + 1}`;
  steps.push({
    id,
    ...step,
  });
  return id;
}
