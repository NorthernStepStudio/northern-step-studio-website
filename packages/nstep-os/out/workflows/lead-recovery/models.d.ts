import type { LeadRecoveryHistorySnapshot, LeadRecoveryInput, LeadRecoveryScenario } from "../../core/types.js";
export interface LeadRecoveryWorkflowPayload {
    readonly leadRecovery: LeadRecoveryInput;
}
export interface LeadRecoveryDecision {
    readonly contactable: boolean;
    readonly reason: string;
    readonly scenario: LeadRecoveryScenario;
    readonly conversationTurns: number;
    readonly turnLimitReached: boolean;
    readonly stopKeywordDetected: boolean;
    readonly complianceFlags: readonly string[];
    readonly history: LeadRecoveryHistorySnapshot;
}
export interface LeadRecoveryDraftSafety {
    readonly safe: boolean;
    readonly reasons: readonly string[];
    readonly body: string;
    readonly messageLength: number;
    readonly repeatedBodyDetected: boolean;
    readonly complianceFooterApplied: boolean;
}
export declare const STEP_TYPES: {
    readonly captureEvent: "capture_missed_call_event";
    readonly loadLead: "retrieve_lead_metadata";
    readonly assess: "classify_contact_eligibility";
    readonly draft: "draft_sms_followup";
    readonly send: "send_sms_followup";
    readonly verify: "verify_delivery";
    readonly log: "log_interaction";
    readonly remember: "update_memory";
    readonly report: "build_summary";
};
