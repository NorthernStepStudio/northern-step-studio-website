import type { JobRecord, ProvLyAnalysisReport, ProvLyClaimExport, ProvLyCompletenessSummary, ProvLyIntake, WorkflowResult } from "../../core/types.js";
import type { ProvLyClaimPrepResult } from "./claims.js";
import type { ProvLyClassificationResult } from "./classification.js";
export interface ProvLyReportContext {
    readonly intake: ProvLyIntake;
    readonly classification: ProvLyClassificationResult;
    readonly completeness: ProvLyCompletenessSummary;
    readonly claimPrep: ProvLyClaimPrepResult;
    readonly claimExport: ProvLyClaimExport;
    readonly reminderResult?: {
        readonly status: "draft" | "queued" | "sent" | "failed" | "skipped";
        readonly recipients: readonly string[];
        readonly messageId?: string;
        readonly detail?: string;
    };
    readonly persistence?: {
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
    readonly actionsTaken: readonly string[];
    readonly job: JobRecord;
}
export declare function buildProvLyAnalysisReport(context: ProvLyReportContext): ProvLyAnalysisReport;
export declare function buildProvLyWorkflowResult(context: ProvLyReportContext, report: ProvLyAnalysisReport): WorkflowResult;
export declare function buildProvLyActions(context: Pick<ProvLyReportContext, "reminderResult">): string[];
