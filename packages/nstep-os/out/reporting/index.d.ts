import type { DashboardSnapshot, KnowledgeChunk, JobRecord, MemoryEntry, NStepLogger, WorkflowDefinition, WorkflowExecutionContext, WorkflowResult } from "../core/types.js";
export interface JobExecutionReport {
    readonly jobId: string;
    readonly tenantId: string;
    readonly product: JobRecord["goal"]["product"];
    readonly workflow?: string;
    readonly status: JobRecord["status"];
    readonly approvalStatus: JobRecord["approvalStatus"];
    readonly summary: string;
    readonly actionsTaken: readonly string[];
    readonly stepCount: number;
    readonly completedStepCount: number;
    readonly failedStepCount: number;
    readonly waitingApprovalStepCount: number;
    readonly logCount: number;
    readonly memoryCount: number;
    readonly updatedAt: string;
    readonly escalationStatus?: string;
}
export interface ReportingService {
    buildWorkflowReport(workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext): WorkflowResult;
    buildJobSummary(job: JobRecord): string;
    buildDashboardSnapshot(jobs: readonly JobRecord[], memory: readonly MemoryEntry[], knowledge?: readonly KnowledgeChunk[]): DashboardSnapshot;
    buildJobExecutionReport(job: JobRecord, memoryCount?: number): JobExecutionReport;
}
export interface ReportingServiceOptions {
    readonly logger?: NStepLogger;
}
export declare function createReportingService(options?: ReportingServiceOptions): ReportingService;
export declare function buildWorkflowReport(workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext): WorkflowResult;
export declare function buildJobSummary(job: JobRecord): string;
export declare function buildDashboardSnapshot(jobs: readonly JobRecord[], memory: readonly MemoryEntry[], knowledge?: readonly KnowledgeChunk[]): DashboardSnapshot;
