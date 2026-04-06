import { randomUUID } from "node:crypto";
import type {
  GoalInput,
  JobRecord,
  JobStepState,
  MemoryEntry,
  NexusBuildAnalysisReport,
  NexusBuildCompatibilitySummary,
  NexusBuildIntake,
  NexusBuildPricingSnapshot,
  NexusBuildRecommendationSummary,
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
import { analyzeNexusBuild, compareNexusBuilds, type NexusBuildAnalysisBundle } from "./analysis.js";
import { reviewNexusBuildCompatibility } from "./compatibility.js";
import { extractNexusBuildIntake } from "./intake.js";
import { buildNexusBuildMemoryEntries } from "./memory.js";
import { buildNexusBuildRecommendation } from "./recommendations.js";
import {
  collectNexusBuildPricing,
  scheduleNexusBuildPriceWatch,
  type NexusBuildPricingResult,
  type NexusBuildWatchScheduleResult,
} from "./pricing.js";
import {
  buildNexusBuildActions,
  buildNexusBuildAnalysisReport,
  buildNexusBuildWorkflowResult,
  type NexusBuildReportContext,
} from "./report.js";

const STEP_TYPES = {
  capture: "capture_nexusbuild_goal",
  normalize: "normalize_nexusbuild_parts",
  collectPricing: "collect_nexusbuild_pricing",
  compatibility: "review_nexusbuild_compatibility",
  analyze: "analyze_nexusbuild_build",
  compare: "compare_nexusbuild_builds",
  recommend: "generate_nexusbuild_recommendation",
  watch: "schedule_nexusbuild_watch",
  report: "build_nexusbuild_report",
  persist: "persist_nexusbuild_artifacts",
} as const;

interface CaptureStepOutput {
  readonly intake: NexusBuildIntake;
}

interface NormalizeStepOutput {
  readonly intake: NexusBuildIntake;
  readonly currentBuildId: string;
  readonly savedBuildCount: number;
  readonly comparisonBuildCount: number;
}

interface CompatibilityStepOutput {
  readonly compatibility: NexusBuildCompatibilitySummary;
}

interface AnalysisStepOutput extends NexusBuildAnalysisBundle {}

interface ComparisonStepOutput {
  readonly comparison: ReturnType<typeof compareNexusBuilds>;
}

interface RecommendationStepOutput {
  readonly recommendation: NexusBuildRecommendationSummary;
}

interface ReportStepOutput {
  readonly report: NexusBuildAnalysisReport;
}

interface PersistStepOutput {
  readonly persistence: {
    readonly savedBuildIds: readonly string[];
    readonly compatibilityCheckId: string;
    readonly reportId: string;
    readonly pricingSnapshotIds: readonly string[];
    readonly recommendationRunId: string;
    readonly preferenceId?: string;
    readonly watchTaskIds: readonly string[];
  };
}

export function createNexusBuildWorkflow(): WorkflowDefinition {
  return {
    key: "nexusbuild",
    title: "NexusBuild",
    description: "Analyze PC builds, review compatibility, compare value, and manage price monitoring.",
    buildPlan(goal, context) {
      return buildNexusBuildPlan(goal, context);
    },
    async executeStep(step, context) {
      return executeNexusBuildStep(step, context);
    },
    async verify(job) {
      return verifyNexusBuildJob(job);
    },
    async createMemory(job) {
      const reportContext = resolveReportContext(job);
      const report = readStepOutput<NexusBuildAnalysisReport>(job, STEP_TYPES.report) || buildNexusBuildAnalysisReport(reportContext);
      return buildNexusBuildMemoryEntries(reportContext.intake, report);
    },
    report(job) {
      const reportContext = resolveReportContext(job);
      const report = readStepOutput<NexusBuildAnalysisReport>(job, STEP_TYPES.report) || buildNexusBuildAnalysisReport(reportContext);
      return buildNexusBuildWorkflowResult(reportContext, report);
    },
  };
}

function buildNexusBuildPlan(goal: GoalInput, context: WorkflowPlanningContext): WorkflowPlan {
  const intake = extractNexusBuildIntake(goal);
  const steps: WorkflowStep[] = [];

  const captureId = addStep(steps, {
    type: STEP_TYPES.capture,
    title: "Capture build intent",
    tool: "database",
    dependsOn: [],
    approvalRequired: false,
    input: {
      buildId: intake.buildId,
      operation: intake.operation,
      useCase: intake.useCase,
      buildName: intake.buildName,
      partCount: intake.parts.length,
    },
  });

  const normalizeId = addStep(steps, {
    type: STEP_TYPES.normalize,
    title: "Normalize components",
    tool: "llm",
    dependsOn: [captureId],
    approvalRequired: false,
    input: {
      buildId: intake.buildId,
      savedBuildCount: intake.savedBuilds.length,
      comparisonBuildCount: intake.comparisonBuilds.length,
      currency: intake.currency,
      budget: intake.budget,
    },
  });

  const shouldCollectPricing = intake.livePricingEnabled || intake.priceSources.length > 0 || intake.operation === "price-monitoring";
  const collectPricingId = shouldCollectPricing
    ? addStep(steps, {
        type: STEP_TYPES.collectPricing,
        title: "Collect live pricing context",
        tool: "browser",
        dependsOn: [normalizeId],
        approvalRequired: goal.mode === "assist" && intake.livePricingEnabled,
        input: {
          sourceCount: intake.priceSources.length,
          livePricingEnabled: intake.livePricingEnabled,
        },
      })
    : undefined;

  const compatibilityId = addStep(steps, {
    type: STEP_TYPES.compatibility,
    title: "Review compatibility",
    tool: "llm",
    dependsOn: [collectPricingId || normalizeId],
    approvalRequired: false,
    input: {
      buildId: intake.buildId,
      partCount: intake.parts.length,
      useCase: intake.useCase,
    },
  });

  const analyzeId = addStep(steps, {
    type: STEP_TYPES.analyze,
    title: "Analyze performance and value",
    tool: "llm",
    dependsOn: [compatibilityId],
    approvalRequired: false,
    input: {
      buildId: intake.buildId,
      budget: intake.budget,
      useCase: intake.useCase,
    },
  });

  const shouldCompare = intake.operation === "parts-comparison" || intake.comparisonBuilds.length > 1;
  const compareId = shouldCompare
    ? addStep(steps, {
        type: STEP_TYPES.compare,
        title: "Compare build options",
        tool: "llm",
        dependsOn: [analyzeId],
        approvalRequired: false,
        input: {
          buildCount: intake.comparisonBuilds.length > 0 ? intake.comparisonBuilds.length : intake.savedBuilds.length,
          useCase: intake.useCase,
        },
      })
    : undefined;

  const recommendId = addStep(steps, {
    type: STEP_TYPES.recommend,
    title: "Generate recommendation",
    tool: "llm",
    dependsOn: [compareId || analyzeId],
    approvalRequired: false,
    input: {
      buildId: intake.buildId,
      operation: intake.operation,
      livePricingEnabled: intake.livePricingEnabled,
    },
  });

  const shouldWatch = intake.operation === "price-monitoring" || intake.watchlist.length > 0;
  const watchId = shouldWatch
    ? addStep(steps, {
        type: STEP_TYPES.watch,
        title: "Schedule price watch",
        tool: "scheduler",
        dependsOn: [recommendId],
        approvalRequired: goal.mode === "assist" && intake.watchlist.length > 0,
        input: {
          watchlistCount: intake.watchlist.length,
        },
      })
    : undefined;

  const reportId = addStep(steps, {
    type: STEP_TYPES.report,
    title: "Build dashboard report",
    tool: "api",
    dependsOn: [watchId || recommendId],
    approvalRequired: false,
    input: {
      buildId: intake.buildId,
      operation: intake.operation,
    },
  });

  addStep(steps, {
    type: STEP_TYPES.persist,
    title: "Persist workflow artifacts",
    tool: "database",
    dependsOn: [reportId],
    approvalRequired: false,
    input: {
      buildId: intake.buildId,
      savedBuildCount: intake.savedBuilds.length,
      comparisonCount: intake.comparisonBuilds.length,
    },
  });

  return {
    workflow: "nexusbuild",
    jobId: "pending",
    steps,
    approvalsRequired: goal.mode === "assist" || context.route.approvalRequired,
    summary: `NexusBuild ${intake.operation} for ${intake.buildName}.`,
  };
}

async function executeNexusBuildStep(step: JobStepState, context: WorkflowExecutionContext): Promise<StepResult> {
  const intake = resolveIntake(context.job);

  switch (step.type) {
    case STEP_TYPES.capture:
      return {
        status: "completed",
        message: "Build goal captured.",
        output: {
          intake,
        },
      };
    case STEP_TYPES.normalize:
      return {
        status: "completed",
        message: "Parts normalized.",
        output: {
          intake,
          currentBuildId: intake.buildId,
          savedBuildCount: intake.savedBuilds.length,
          comparisonBuildCount: intake.comparisonBuilds.length,
        },
      };
    case STEP_TYPES.collectPricing: {
      const pricing = await collectNexusBuildPricing(intake, context);
      return {
        status: "completed",
        message: "Pricing context collected.",
        output: pricing,
      };
    }
    case STEP_TYPES.compatibility: {
      const compatibility = reviewNexusBuildCompatibility(intake);
      return {
        status: "completed",
        message: "Compatibility review completed.",
        output: {
          compatibility,
        },
      };
    }
    case STEP_TYPES.analyze: {
      const compatibility = resolveCompatibility(context.job, intake);
      const pricing = resolvePricing(context.job);
      const analysis = analyzeNexusBuild(intake, compatibility, pricing.snapshots);
      return {
        status: "completed",
        message: "Performance and value analysis completed.",
        output: analysis,
      };
    }
    case STEP_TYPES.compare: {
      const comparison = compareNexusBuilds(buildsForComparison(intake), intake.useCase);
      return {
        status: "completed",
        message: "Build comparison completed.",
        output: {
          comparison,
        },
      };
    }
    case STEP_TYPES.recommend: {
      const compatibility = resolveCompatibility(context.job, intake);
      const pricing = resolvePricing(context.job);
      const analysis = resolveAnalysis(context.job, intake, compatibility, pricing.snapshots);
      const comparison = resolveComparison(context.job, intake, compatibility, analysis);
      const recommendation = buildNexusBuildRecommendation(intake, compatibility, analysis, comparison, pricing.snapshots);
      return {
        status: "completed",
        message: "Recommendation generated.",
        output: {
          recommendation,
        },
      };
    }
    case STEP_TYPES.watch: {
      if (intake.watchlist.length === 0 && intake.operation !== "price-monitoring") {
        return {
          status: "completed",
          message: "No watchlist items were provided.",
          output: {
            watchSchedule: {
              scheduled: [],
              notes: ["No watchlist items were provided."],
            },
          },
        };
      }

      const watchSchedule = await scheduleNexusBuildPriceWatch(intake, context, intake.watchlist);
      return {
        status: "completed",
        message: "Price monitoring scheduled.",
        output: {
          watchSchedule,
        },
      };
    }
    case STEP_TYPES.report: {
      const reportContext = resolveReportContext(context.job);
      const report = buildNexusBuildAnalysisReport(reportContext);
      return {
        status: "completed",
        message: "Dashboard report built.",
        output: report,
      };
    }
    case STEP_TYPES.persist: {
      const reportContext = resolveReportContext(context.job);
      const report = readStepOutput<NexusBuildAnalysisReport>(context.job, STEP_TYPES.report) || buildNexusBuildAnalysisReport(reportContext);
      const persistence = await persistNexusBuildArtifacts(context, reportContext, report);
      return {
        status: "completed",
        message: "Workflow artifacts persisted.",
        output: {
          persistence,
        },
      };
    }
    default:
      return {
        status: "failed",
        message: `Unsupported NexusBuild step type: ${step.type}`,
        retryable: false,
      };
  }
}

function verifyNexusBuildJob(job: JobRecord): VerificationResult {
  const reportContext = resolveReportContext(job);
  const report = readStepOutput<NexusBuildAnalysisReport>(job, STEP_TYPES.report) || buildNexusBuildAnalysisReport(reportContext);
  const findings: VerificationFinding[] = [];

  if (!readStepOutput(job, STEP_TYPES.analyze)) {
    findings.push({
      severity: "error",
      category: "deliverables",
      message: "Performance analysis did not complete.",
    });
  }

  if (!readStepOutput(job, STEP_TYPES.recommend)) {
    findings.push({
      severity: "error",
      category: "deliverables",
      message: "Recommendation generation did not complete.",
    });
  }

  if (!report) {
    findings.push({
      severity: "error",
      category: "deliverables",
      message: "Dashboard report did not complete.",
    });
  }

  if (report.compatibility.status === "fail") {
    findings.push({
      severity: "warning",
      category: "compliance",
      message: "Compatibility blockers are present in the final report.",
    });
  }

  if (report.pricing.livePricingEnabled && report.pricing.snapshotCount === 0 && reportContext.intake.priceSources.length > 0) {
    findings.push({
      severity: "warning",
      category: "delivery",
      message: "Live pricing was enabled, but no pricing snapshots were collected.",
    });
  }

  if (reportContext.intake.operation === "parts-comparison" && (!report.comparison || report.comparison.matrix.length < 2)) {
    findings.push({
      severity: "warning",
      category: "deliverables",
      message: "Comparison workflow did not produce two or more build entries.",
    });
  }

  const livePricingMissing = report.pricing.livePricingEnabled && report.pricing.snapshotCount === 0 && reportContext.intake.priceSources.length > 0;
  const comparisonMissing = reportContext.intake.operation === "parts-comparison" && (!report.comparison || report.comparison.matrix.length < 2);
  const accepted = findings.every((item) => item.severity !== "error") && report.compatibility.status !== "fail" && !livePricingMissing && !comparisonMissing;

  return {
    outcome: accepted ? "accepted" : "human_review_required",
    checkedAt: new Date().toISOString(),
    findings,
    score: {
      acceptance: report.compatibility.status === "pass" ? 96 : report.compatibility.status === "warn" ? 82 : 58,
      scope: report.comparison ? 92 : 78,
      commands: 90,
      integrity: accepted ? 92 : 70,
      compliance: report.compatibility.status === "fail" ? 62 : 92,
      overall: accepted ? 90 : 66,
    },
  };
}

function resolveReportContext(job: JobRecord): NexusBuildReportContext {
  const intake = resolveIntake(job);
  const pricing = resolvePricing(job);
  const compatibility = resolveCompatibility(job, intake);
  const analysis = resolveAnalysis(job, intake, compatibility, pricing.snapshots);
  const comparison = resolveComparison(job, intake, compatibility, analysis);
  const recommendation = resolveRecommendation(job, intake, compatibility, analysis, comparison, pricing.snapshots);
  const watchSchedule = resolveWatchSchedule(job);
  const baseContext = {
    intake,
    compatibility,
    analysis,
    recommendation,
    pricingSnapshots: pricing.snapshots,
    pricingNotes: pricing.notes,
    comparison,
    watchSchedule,
    job,
  };
  const actionsTaken = buildNexusBuildActions({ ...baseContext, actionsTaken: [] });

  return {
    ...baseContext,
    actionsTaken,
  };
}

function resolveIntake(job: JobRecord): NexusBuildIntake {
  const normalized = readStepOutput<{ intake: NexusBuildIntake }>(job, STEP_TYPES.normalize);
  if (normalized?.intake) {
    return normalized.intake;
  }

  const captured = readStepOutput<{ intake: NexusBuildIntake }>(job, STEP_TYPES.capture);
  if (captured?.intake) {
    return captured.intake;
  }

  return extractNexusBuildIntake(job.goal);
}

function resolvePricing(job: JobRecord): NexusBuildPricingResult {
  return readStepOutput<NexusBuildPricingResult>(job, STEP_TYPES.collectPricing) || { snapshots: [], notes: [] };
}

function resolveCompatibility(job: JobRecord, intake: NexusBuildIntake): NexusBuildCompatibilitySummary {
  const output = readStepOutput<CompatibilityStepOutput>(job, STEP_TYPES.compatibility);
  return output?.compatibility || reviewNexusBuildCompatibility(intake);
}

function resolveAnalysis(
  job: JobRecord,
  intake: NexusBuildIntake,
  compatibility: NexusBuildCompatibilitySummary,
  pricingSnapshots: readonly NexusBuildPricingSnapshot[],
): NexusBuildAnalysisBundle {
  return readStepOutput<AnalysisStepOutput>(job, STEP_TYPES.analyze) || analyzeNexusBuild(intake, compatibility, pricingSnapshots);
}

function resolveComparison(
  job: JobRecord,
  intake: NexusBuildIntake,
  compatibility: NexusBuildCompatibilitySummary,
  analysis: NexusBuildAnalysisBundle,
): ReturnType<typeof compareNexusBuilds> | undefined {
  if (!shouldCompare(intake)) {
    return undefined;
  }

  const output = readStepOutput<ComparisonStepOutput>(job, STEP_TYPES.compare);
  return output?.comparison || compareNexusBuilds(buildsForComparison(intake), intake.useCase);
}

function resolveRecommendation(
  job: JobRecord,
  intake: NexusBuildIntake,
  compatibility: NexusBuildCompatibilitySummary,
  analysis: NexusBuildAnalysisBundle,
  comparison: ReturnType<typeof compareNexusBuilds> | undefined,
  pricingSnapshots: readonly NexusBuildPricingSnapshot[],
): NexusBuildRecommendationSummary {
  const output = readStepOutput<RecommendationStepOutput>(job, STEP_TYPES.recommend);
  return output?.recommendation || buildNexusBuildRecommendation(intake, compatibility, analysis, comparison, pricingSnapshots);
}

function resolveWatchSchedule(job: JobRecord): NexusBuildWatchScheduleResult | undefined {
  const output = readStepOutput<{ watchSchedule: NexusBuildWatchScheduleResult }>(job, STEP_TYPES.watch);
  return output?.watchSchedule;
}

function buildNexusBuildWorkflowResultFromJob(job: JobRecord): WorkflowResult {
  const reportContext = resolveReportContext(job);
  const report = readStepOutput<NexusBuildAnalysisReport>(job, STEP_TYPES.report) || buildNexusBuildAnalysisReport(reportContext);
  return buildNexusBuildWorkflowResult(reportContext, report);
}

async function persistNexusBuildArtifacts(
  context: WorkflowExecutionContext,
  reportContext: NexusBuildReportContext,
  report: NexusBuildAnalysisReport,
): Promise<PersistStepOutput["persistence"]> {
  const now = new Date().toISOString();
  const uniqueBuilds = dedupeBuilds([...reportContext.intake.savedBuilds, ...reportContext.intake.comparisonBuilds]);
  const savedBuildIds: string[] = [];
  for (const build of uniqueBuilds) {
    await context.stores.nexusbuild.upsertSavedBuild({
      ...build,
      updatedAt: now,
      createdAt: build.createdAt || now,
    });
    savedBuildIds.push(build.buildId);
  }

  const compatibilityCheckId = `compatibility_${randomUUID()}`;
  await context.stores.nexusbuild.upsertCompatibilityCheck({
    checkId: compatibilityCheckId,
    tenantId: reportContext.intake.goal.tenantId,
    buildId: reportContext.intake.buildId,
    status: report.compatibility.status,
    score: report.compatibility.score,
    issues: report.compatibility.issues,
    createdAt: now,
    updatedAt: now,
    metadata: {
      jobId: context.job.jobId,
      operation: reportContext.intake.operation,
    },
  });

  const pricingSnapshotIds: string[] = [];
  for (const snapshot of report.pricing.snapshots) {
    await context.stores.nexusbuild.upsertPricingSnapshot(snapshot);
    pricingSnapshotIds.push(snapshot.snapshotId);
  }

  await context.stores.nexusbuild.upsertAnalysisReport(report);

  const recommendationRunId = `run_${randomUUID()}`;
  await context.stores.nexusbuild.upsertRecommendationRun({
    runId: recommendationRunId,
    tenantId: reportContext.intake.goal.tenantId,
    buildId: reportContext.intake.buildId,
    reportId: report.reportId,
    operation: reportContext.intake.operation,
    status: reportContext.watchSchedule?.scheduled.length ? "watching" : "final",
    score: report.performance.score,
    createdAt: now,
    updatedAt: now,
    metadata: {
      jobId: context.job.jobId,
      comparisonCount: report.comparison?.matrix.length || 0,
      livePricingEnabled: report.pricing.livePricingEnabled,
    },
  });

  const preferenceId = await persistPreference(context, reportContext, now);

  return {
    savedBuildIds,
    compatibilityCheckId,
    reportId: report.reportId,
    pricingSnapshotIds,
    recommendationRunId,
    preferenceId,
    watchTaskIds: reportContext.watchSchedule?.scheduled.map((task) => task.id) || [],
  };
}

async function persistPreference(
  context: WorkflowExecutionContext,
  reportContext: NexusBuildReportContext,
  now: string,
): Promise<string | undefined> {
  const preferenceId = `preference_${reportContext.intake.buildId}`;
  const preferredBrands = readStringArray(reportContext.intake.preferences.preferredBrands);
  const avoidBrands = readStringArray(reportContext.intake.preferences.avoidBrands);

  if (preferredBrands.length === 0 && avoidBrands.length === 0 && reportContext.intake.budget === undefined && !reportContext.intake.preferences.tone) {
    return undefined;
  }

  await context.stores.nexusbuild.upsertUserPreference({
    preferenceId,
    tenantId: reportContext.intake.goal.tenantId,
    name: reportContext.intake.buildName,
    useCase: reportContext.intake.useCase,
    preferredBrands,
    avoidBrands,
    targetBudget: reportContext.intake.budget,
    currency: reportContext.intake.currency,
    tone: resolveTone(reportContext.intake.preferences.tone),
    updatedAt: now,
    metadata: {
      buildId: reportContext.intake.buildId,
      operation: reportContext.intake.operation,
      purchaseStrategy: reportContext.recommendation.purchaseStrategy,
    },
  });

  return preferenceId;
}

function readStepOutput<T>(job: JobRecord, type: string): T | undefined {
  const step = job.steps.find((item) => item.type === type);
  return step?.result?.output as T | undefined;
}

function addStep(
  steps: WorkflowStep[],
  step: Omit<WorkflowStep, "id">,
): string {
  const id = `s${steps.length + 1}`;
  steps.push({
    id,
    ...step,
  });
  return id;
}

function buildsForComparison(intake: NexusBuildIntake): NexusBuildIntake["savedBuilds"] {
  return intake.comparisonBuilds.length > 0 ? intake.comparisonBuilds : intake.savedBuilds;
}

function shouldCompare(intake: NexusBuildIntake): boolean {
  return intake.operation === "parts-comparison" || intake.comparisonBuilds.length > 1;
}

function dedupeBuilds(builds: NexusBuildIntake["savedBuilds"]): NexusBuildIntake["savedBuilds"] {
  const seen = new Set<string>();
  return builds.filter((build) => {
    if (seen.has(build.buildId)) {
      return false;
    }
    seen.add(build.buildId);
    return true;
  });
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
}

function resolveTone(value: unknown): "concise" | "balanced" | "premium" {
  if (value === "concise" || value === "premium") {
    return value;
  }
  return "balanced";
}
