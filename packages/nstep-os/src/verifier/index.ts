import { createNoopLogger } from "../core/logger.js";
import type { JobRecord, NStepLogger, VerificationFinding, VerificationResult, WorkflowDefinition, WorkflowExecutionContext } from "../core/types.js";

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
  verifyJob(
    workflow: WorkflowDefinition,
    job: JobRecord,
    context: WorkflowExecutionContext,
  ): Promise<VerificationOutcome>;
  summarize(result: VerificationResult): VerificationSummary;
}

export interface VerificationServiceOptions {
  readonly logger?: NStepLogger;
}

export function createVerificationService(options: VerificationServiceOptions = {}): VerificationService {
  const logger = options.logger ?? createNoopLogger();

  return {
    async verifyJob(workflow, job, context) {
      const startedAt = new Date().toISOString();
      const startedMs = Date.now();
      logger.info(`Verifying ${workflow.key} job ${job.jobId}.`, {
        jobId: job.jobId,
        workflow: workflow.key,
        approvalStatus: job.approvalStatus,
        status: job.status,
      });

      try {
        const result = normalizeVerificationResult(await workflow.verify(job, context));
        const summary = summarizeVerificationResult(result);
        const completedAt = new Date().toISOString();
        const durationMs = Math.max(0, Date.now() - startedMs);
        logger.info(`Verified ${workflow.key} job ${job.jobId}.`, {
          jobId: job.jobId,
          workflow: workflow.key,
          outcome: result.outcome,
          durationMs,
          findings: summary.findingCount,
        });

        return {
          result,
          startedAt,
          completedAt,
          durationMs,
          accepted: result.outcome === "accepted",
          findingCount: summary.findingCount,
          errorCount: summary.errorCount,
          warningCount: summary.warningCount,
        };
      } catch (error) {
        const completedAt = new Date().toISOString();
        const durationMs = Math.max(0, Date.now() - startedMs);
        const message = error instanceof Error ? error.message : String(error);
        const fallback = buildFallbackVerificationResult(job, workflow, message);
        const summary = summarizeVerificationResult(fallback);
        logger.error(`Verification failed for ${workflow.key} job ${job.jobId}.`, {
          jobId: job.jobId,
          workflow: workflow.key,
          durationMs,
          error: message,
          findings: summary.findingCount,
        });

        return {
          result: fallback,
          startedAt,
          completedAt,
          durationMs,
          accepted: false,
          findingCount: summary.findingCount,
          errorCount: summary.errorCount,
          warningCount: summary.warningCount,
        };
      }
    },
    summarize(result) {
      return summarizeVerificationResult(result);
    },
  };
}

export async function verifyJob(
  workflow: WorkflowDefinition,
  job: JobRecord,
  context: WorkflowExecutionContext,
): Promise<VerificationResult> {
  return (await createVerificationService().verifyJob(workflow, job, context)).result;
}

function normalizeVerificationResult(result: VerificationResult): VerificationResult {
  return {
    outcome: result.outcome,
    checkedAt: result.checkedAt,
    findings: result.findings.map(normalizeVerificationFinding),
    score: result.score,
  };
}

function normalizeVerificationFinding(finding: VerificationFinding): VerificationFinding {
  return {
    severity: finding.severity,
    category: finding.category,
    message: finding.message.trim(),
    paths: finding.paths,
  };
}

function buildFallbackVerificationResult(job: JobRecord, workflow: WorkflowDefinition, message: string): VerificationResult {
  const checkedAt = new Date().toISOString();
  return {
    outcome: "human_review_required",
    checkedAt,
    findings: [
      {
        severity: "critical",
        category: "blocker",
        message: `Verification failed for ${workflow.key} job ${job.jobId}: ${message}`,
      },
    ],
    score: {
      acceptance: 0,
      scope: 0,
      commands: 0,
      integrity: 0,
      compliance: 0,
      overall: 0,
    },
  };
}

function summarizeVerificationResult(result: VerificationResult): VerificationSummary {
  const findingCount = result.findings.length;
  const errorCount = result.findings.filter((finding) => finding.severity === "error" || finding.severity === "critical").length;
  const warningCount = result.findings.filter((finding) => finding.severity === "warning").length;
  return {
    outcome: result.outcome,
    findingCount,
    errorCount,
    warningCount,
    accepted: result.outcome === "accepted" && errorCount === 0,
    overallScore: result.score.overall,
  };
}
