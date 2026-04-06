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

export const STEP_TYPES = {
  captureEvent: "capture_missed_call_event",
  loadLead: "retrieve_lead_metadata",
  assess: "classify_contact_eligibility",
  draft: "draft_sms_followup",
  send: "send_sms_followup",
  verify: "verify_delivery",
  log: "log_interaction",
  remember: "update_memory",
  report: "build_summary",
} as const;
