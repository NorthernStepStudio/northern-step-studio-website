import type { LeadRecoveryAssessment, LeadRecoveryInput, MemoryEntry } from "../../core/types.js";
import type { LeadRecoveryDecision } from "./models.js";
export declare function buildLeadRecoveryMemory(input: LeadRecoveryInput, assessment: LeadRecoveryAssessment, jobId?: string, decision?: LeadRecoveryDecision): MemoryEntry;
