import type { JobRecord, NexusBuildAnalysisReport, NexusBuildComparisonSummary, NexusBuildCompatibilitySummary, NexusBuildIntake, NexusBuildPricingSnapshot, NexusBuildRecommendationSummary, WorkflowResult } from "../../core/types.js";
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
export declare function buildNexusBuildAnalysisReport(context: NexusBuildReportContext): NexusBuildAnalysisReport;
export declare function buildNexusBuildWorkflowResult(context: NexusBuildReportContext, report: NexusBuildAnalysisReport): WorkflowResult;
export declare function buildNexusBuildActions(context: NexusBuildReportContext): string[];
