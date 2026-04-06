import type { JobRecord, NStepLogger, VerificationResult, WorkflowDefinition, WorkflowExecutionContext } from "../core/types.js";
export interface VerificationOutcome {
    readonly result: VerificationResult;
    readonly startedAt: string;
    readonly completedAt: string;
    readonly durationMs: number;
    readonly accepted: boolean;
    readonly findingCount: number;
    readonly errorCount: number;
    readonly warningCount: number;
}
export interface VerificationSummary {
    readonly outcome: VerificationResult["outcome"];
    readonly findingCount: number;
    readonly errorCount: number;
    readonly warningCount: number;
    readonly accepted: boolean;
    readonly overallScore: number;
}
export interface VerificationService {
    verifyJob(workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext): Promise<VerificationOutcome>;
    summarize(result: VerificationResult): VerificationSummary;
}
export interface VerificationServiceOptions {
    readonly logger?: NStepLogger;
}
export declare function createVerificationService(options?: VerificationServiceOptions): VerificationService;
export declare function verifyJob(workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext): Promise<VerificationResult>;
