import type { LeadRecoveryAssessment, LeadRecoveryInput, LeadRecoveryMessageDraft } from "../../core/types.js";
import type { LeadRecoveryDecision, LeadRecoveryDraftSafety } from "./models.js";
export declare function buildLeadRecoveryMessage(input: LeadRecoveryInput, assessment: LeadRecoveryAssessment, scenario?: LeadRecoveryDecision["scenario"]): LeadRecoveryMessageDraft;
export declare function validateLeadRecoveryDraft(draft: LeadRecoveryMessageDraft, decision: LeadRecoveryDecision): LeadRecoveryDraftSafety;
