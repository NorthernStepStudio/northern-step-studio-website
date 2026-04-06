import { randomUUID } from "node:crypto";
import type {
  JobRecord,
  NexusBuildAnalysisReport,
  NexusBuildComparisonSummary,
  NexusBuildCompatibilitySummary,
  NexusBuildIntake,
  NexusBuildPricingSnapshot,
  NexusBuildRecommendationSummary,
  WorkflowResult,
} from "../../core/types.js";
import type { NexusBuildAnalysisBundle } from "./analysis.js";
import type { NexusBuildWatchScheduleResult } from "./pricing.js";

export interface NexusBuildReportContext {
  readonly intake: NexusBuildIntake;
  readonly compatibility: NexusBuildCompatibilitySummary;
  readonly analysis: NexusBuildAnalysisBundle;
  readonly recommendation: NexusBuildRecommendationSummary;
  readonly pricingSnapshots: readonly NexusBuildPricingSnapshot[];
  readonly pricingNotes: readonly string[];
  readonly comparison?: NexusBuildComparisonSummary;
  readonly watchSchedule?: NexusBuildWatchScheduleResult;
  readonly actionsTaken: readonly string[];
  readonly job: JobRecord;
}

export function buildNexusBuildAnalysisReport(context: NexusBuildReportContext): NexusBuildAnalysisReport {
  const now = new Date().toISOString();
  const reportId = `report_${randomUUID()}`;
  const pricingNotes = [...(context.watchSchedule?.notes || [])];
  const warnings = buildWarnings(context);

  return {
    reportId,
    tenantId: context.intake.goal.tenantId,
    buildId: context.intake.buildId,
    operation: context.intake.operation,
    useCase: context.intake.useCase,
    title: `${context.intake.buildName} - NexusBuild analysis`,
    summary: buildSummary(context),
    compatibility: context.compatibility,
    performance: context.analysis.performance,
    value: context.analysis.value,
    recommendation: context.recommendation,
    comparison: context.comparison,
    pricing: {
      snapshotCount: context.pricingSnapshots.length,
      snapshots: context.pricingSnapshots,
      livePricingEnabled: context.intake.livePricingEnabled,
      notes: [...context.pricingNotes, ...pricingNotes],
    },
    warnings,
    createdAt: now,
    updatedAt: now,
    metadata: {
      jobId: context.job.jobId,
      workflow: "nexusbuild",
      approvalStatus: context.job.approvalStatus,
      sourceCount: context.intake.priceSources.length,
      watchlistCount: context.intake.watchlist.length,
      comparisonCount: context.comparison?.matrix.length || 0,
      budget: context.intake.budget,
      currency: context.intake.currency,
    },
  };
}

export function buildNexusBuildWorkflowResult(context: NexusBuildReportContext, report: NexusBuildAnalysisReport): WorkflowResult {
  const status = resolveStatus(context, report);
  const dashboard = buildDashboardSummary(context, report);
  const watchNotes = context.watchSchedule?.notes || [];

  return {
    status,
    summary: report.summary,
    actionsTaken: [...context.actionsTaken, ...watchNotes],
    data: {
      report,
      dashboard,
      watchSchedule: context.watchSchedule,
      comparison: context.comparison,
      compatibility: context.compatibility,
      performance: context.analysis.performance,
      value: context.analysis.value,
      recommendation: context.recommendation,
      pricing: {
        livePricingEnabled: context.intake.livePricingEnabled,
        snapshotCount: report.pricing.snapshotCount,
        snapshots: report.pricing.snapshots,
        notes: report.pricing.notes,
      },
    },
  };
}

export function buildNexusBuildActions(context: NexusBuildReportContext): string[] {
  const actions = [
    `ingested ${context.intake.operation}`,
    "normalized build parts",
    "checked compatibility",
    "scored performance and value",
    "assembled recommendations",
    "built dashboard report",
    "persisted workflow artifacts",
  ];

  if (context.pricingSnapshots.length > 0) {
    actions.splice(2, 0, "captured pricing snapshots");
  } else if (context.intake.livePricingEnabled) {
    actions.splice(2, 0, "attempted live pricing checks");
  }

  if (context.comparison) {
    actions.splice(actions.length - 2, 0, "compared multiple build options");
  }

  if (context.watchSchedule?.scheduled.length) {
    actions.push(`scheduled ${context.watchSchedule.scheduled.length} price watch task(s)`);
  }

  return actions;
}

function buildSummary(context: NexusBuildReportContext): string {
  const compatibilityLine =
    context.compatibility.status === "pass"
      ? "Compatibility is clean."
      : context.compatibility.status === "warn"
        ? "Compatibility is mostly fine with a few warnings."
        : "Compatibility blockers need attention.";
  const pricingLine =
    context.pricingSnapshots.length > 0
      ? `${context.pricingSnapshots.length} pricing snapshot(s) were collected.`
      : context.intake.livePricingEnabled
        ? "Live pricing was enabled, but no usable snapshots were captured."
        : "The workflow ran without live pricing.";
  const purchaseStrategy = stripTrailingSentenceMark(context.recommendation.purchaseStrategy).toLowerCase();
  return `${context.intake.buildName} was analyzed for ${context.intake.useCase}. ${compatibilityLine} ${pricingLine} The recommendation is to ${purchaseStrategy}.`;
}

function buildWarnings(context: NexusBuildReportContext): string[] {
  const warnings = new Set<string>();
  for (const issue of context.compatibility.issues) {
    warnings.add(issue.message);
  }
  for (const note of context.analysis.warnings) {
    warnings.add(note);
  }
  for (const note of context.pricingNotes) {
    if (/failed|missing|no price|unable|could not|disabled|error|warn|tight/i.test(note)) {
      warnings.add(note);
    }
  }
  for (const note of context.recommendation.budgetOptimizations) {
    if (/warn|risk|compatibility|fail|problem|issue/i.test(note)) {
      warnings.add(note);
    }
  }
  if (context.watchSchedule?.notes.length) {
    for (const note of context.watchSchedule.notes) {
      if (/failed|missing|no watchlist|unable|could not|disabled|warn|tight/i.test(note)) {
        warnings.add(note);
      }
    }
  }
  return [...warnings];
}

function buildDashboardSummary(context: NexusBuildReportContext, report: NexusBuildAnalysisReport): Record<string, unknown> {
  return {
    buildId: context.intake.buildId,
    buildName: context.intake.buildName,
    operation: context.intake.operation,
    useCase: context.intake.useCase,
    compatibilityStatus: report.compatibility.status,
    compatibilityScore: report.compatibility.score,
    performanceScore: report.performance.score,
    useCaseFit: report.performance.useCaseFit,
    valueScore: report.value.score,
    priceSnapshotCount: report.pricing.snapshotCount,
    watchCount: context.watchSchedule?.scheduled.length || 0,
    comparisonWinner: context.comparison?.winnerBuildId,
    purchaseStrategy: report.recommendation.purchaseStrategy,
    warnings: report.warnings.length,
    budget: context.intake.budget,
    currency: context.intake.currency,
  };
}

function resolveStatus(context: NexusBuildReportContext, report: NexusBuildAnalysisReport): WorkflowResult["status"] {
  if (report.compatibility.status === "fail") {
    return "partial";
  }
  if (context.pricingSnapshots.length === 0 && context.intake.livePricingEnabled) {
    return "partial";
  }
  if (context.intake.operation === "parts-comparison" && (!report.comparison || report.comparison.matrix.length < 2)) {
    return "partial";
  }
  return "succeeded";
}

function stripTrailingSentenceMark(value: string): string {
  return value.replace(/[.!?]+$/u, "").trim();
}
