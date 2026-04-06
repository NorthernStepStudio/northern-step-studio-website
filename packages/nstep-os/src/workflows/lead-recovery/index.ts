import type {
  WorkflowDefinition,
  WorkflowResult,
  WorkflowStep,
} from "../../core/types.js";
import { buildLeadRecoveryAssessment, buildLeadRecoveryDecision, createEmptyLeadRecoveryHistory, readLeadRecoveryHistorySnapshot } from "./assessment.js";
import { executeLeadRecoveryStep } from "./execution.js";
import { extractLeadRecoveryInput } from "./intake.js";
import { buildLeadRecoveryMemory } from "./memory.js";
import { STEP_TYPES, type LeadRecoveryDecision, type LeadRecoveryDraftSafety, type LeadRecoveryWorkflowPayload } from "./models.js";
import { buildLeadRecord } from "./records.js";
import { planLeadRecovery } from "./planning.js";
import { reportLeadRecovery } from "./reporting.js";
import { verifyLeadRecoveryJob } from "./verification.js";

export type { LeadRecoveryDecision, LeadRecoveryDraftSafety, LeadRecoveryWorkflowPayload };

export {
  buildLeadRecoveryAssessment,
  buildLeadRecoveryDecision,
  createEmptyLeadRecoveryHistory,
  executeLeadRecoveryStep,
  extractLeadRecoveryInput,
  buildLeadRecoveryMemory,
  STEP_TYPES,
  buildLeadRecord,
  planLeadRecovery,
  reportLeadRecovery,
  readLeadRecoveryHistorySnapshot,
  verifyLeadRecoveryJob,
};

export function createLeadRecoveryWorkflow(): WorkflowDefinition {
  return {
    key: "lead-recovery",
    title: "Lead Recovery",
    description: "Recover missed calls with a safe SMS follow-up, delivery verification, memory, and reporting.",
    buildPlan(goal, context) {
      return planLeadRecovery(extractLeadRecoveryInput(goal), context);
    },
    async executeStep(step, context) {
      return executeLeadRecoveryStep(step, {
        ...context,
        input: extractLeadRecoveryInput(context.job.goal),
      });
    },
    async verify(job, context) {
      return verifyLeadRecoveryJob(job, context);
    },
    async createMemory(job, context) {
      const input = extractLeadRecoveryInput(job.goal);
      const assessment = buildLeadRecoveryAssessment(input);
      const loadStep = job.steps.find((workflowStep: WorkflowStep) => workflowStep.type === STEP_TYPES.loadLead);
      const decision = buildLeadRecoveryDecision(
        input,
        assessment,
        readLeadRecoveryHistorySnapshot(loadStep) || createEmptyLeadRecoveryHistory(input, input.lead || buildLeadRecord(input)),
      );
      return [buildLeadRecoveryMemory(input, assessment, job.jobId, decision)];
    },
    report(job, _context): WorkflowResult {
      const input = extractLeadRecoveryInput(job.goal);
      const assessment = buildLeadRecoveryAssessment(input);
      return reportLeadRecovery(input, assessment, job);
    },
  };
}
