import type { LeadRecord, LeadRecoveryAssessment, LeadRecoveryHistorySnapshot, LeadRecoveryInput, LeadRecoveryScenario, WorkflowExecutionContext, JobStepState } from "../../core/types.js";
import type { LeadRecoveryDecision } from "./models.js";
export declare function buildLeadRecoveryAssessment(input: LeadRecoveryInput): LeadRecoveryAssessment;
export declare function loadLeadRecoveryHistorySnapshot(database: WorkflowExecutionContext["stores"]["domain"], input: LeadRecoveryInput, lead: LeadRecord): Promise<LeadRecoveryHistorySnapshot>;
export declare function readLeadRecoveryHistorySnapshot(step: JobStepState | undefined): LeadRecoveryHistorySnapshot | undefined;
export declare function buildLeadRecoveryDecision(input: LeadRecoveryInput, assessment: LeadRecoveryAssessment, history: LeadRecoveryHistorySnapshot | undefined): LeadRecoveryDecision;
export declare function determineLeadRecoveryScenario(input: LeadRecoveryInput, assessment: LeadRecoveryAssessment, history: LeadRecoveryHistorySnapshot): LeadRecoveryScenario;
export declare function createEmptyLeadRecoveryHistory(input: LeadRecoveryInput, lead: LeadRecord): LeadRecoveryHistorySnapshot;
