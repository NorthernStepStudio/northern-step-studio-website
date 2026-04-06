import type { JobRecord, LeadRecoveryAssessment, VerificationFinding, VerificationResult, WorkflowExecutionContext } from "../../core/types.js";
import { buildLeadRecoveryAssessment, buildLeadRecoveryDecision, createEmptyLeadRecoveryHistory, readLeadRecoveryHistorySnapshot } from "./assessment.js";
import { extractLeadRecoveryInput } from "./intake.js";
import { buildLeadRecord } from "./records.js";
import { STEP_TYPES } from "./models.js";

export function verifyLeadRecoveryJob(job: JobRecord, _context: WorkflowExecutionContext): VerificationResult {
  const input = extractLeadRecoveryInput(job.goal);
  const assessment = buildLeadRecoveryAssessment(input);
  const loadStep = job.steps.find((step) => step.type === STEP_TYPES.loadLead);
  const history = readLeadRecoveryHistorySnapshot(loadStep) || createEmptyLeadRecoveryHistory(input, input.lead || buildLeadRecord(input));
  const decision = buildLeadRecoveryDecision(input, assessment, history);
  const sendStep = job.steps.find((step) => step.type === STEP_TYPES.send);
  const verifyStep = job.steps.find((step) => step.type === STEP_TYPES.verify);
  const findings: VerificationFinding[] = [];

  if (!decision.contactable) {
    findings.push({
      severity: "warning",
      category: "compliance",
      message: decision.reason,
    });
  }

  if (sendStep?.status === "failed") {
    findings.push({
      severity: "error",
      category: "delivery",
      message: "The SMS send step failed.",
    });
  }

  const verifyOutput = verifyStep?.result?.output as { readonly delivery?: { readonly status?: string } } | undefined;
  const verifiedDelivery = verifyOutput?.delivery;
  if (verifiedDelivery?.status === "queued") {
    findings.push({
      severity: "warning",
      category: "delivery",
      message: "The SMS has been accepted but delivery is still queued.",
    });
  }

  if (verifyStep?.status !== "completed") {
    findings.push({
      severity: "warning",
      category: "delivery",
      message: "Delivery verification did not complete.",
    });
  }

  const overall = computeScore(job, assessment, findings);
  const outcome =
    findings.some((item) => item.severity === "error")
      ? "retry_required"
      : !decision.contactable
        ? "human_review_required"
        : assessment.approvalRequired && !job.approvedStepIds.includes("s5")
          ? "human_review_required"
          : overall.overall >= 70
            ? "accepted"
            : "retry_required";

  return {
    outcome,
    checkedAt: new Date().toISOString(),
    findings,
    score: overall,
  };
}

function computeScore(job: JobRecord, assessment: LeadRecoveryAssessment, findings: readonly VerificationFinding[]) {
  const completedSteps = job.steps.filter((step) => step.status === "completed").length;
  const totalSteps = job.steps.length || 1;
  const completionRatio = Math.round((completedSteps / totalSteps) * 100);
  const compliance = assessment.contactable ? 90 : 78;
  const integrity = findings.some((item) => item.severity === "error") ? 65 : 92;
  const overall = Math.round((completionRatio + compliance + integrity) / 3);

  return {
    acceptance: completionRatio,
    scope: 96,
    commands: 90,
    integrity,
    compliance,
    overall,
  };
}
