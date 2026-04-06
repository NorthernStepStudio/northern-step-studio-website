import { randomUUID } from "node:crypto";
import { buildLeadRecoveryDecision, createEmptyLeadRecoveryHistory } from "./assessment.js";
import { buildLeadRecoveryMessage } from "./message.js";
import { buildLeadRecord } from "./records.js";
import { createMemoryLesson } from "../../memory/index.js";
export function buildLeadRecoveryMemory(input, assessment, jobId = "unknown", decision) {
    const now = new Date().toISOString();
    const safeDecision = decision ||
        buildLeadRecoveryDecision(input, assessment, createEmptyLeadRecoveryHistory(input, input.lead || buildLeadRecord(input)));
    return {
        id: `memory_${randomUUID()}`,
        tenantId: input.goal.tenantId,
        product: "lead-recovery",
        category: safeDecision.contactable ? "success-pattern" : "business-rule",
        key: "lead-recovery.followup-template",
        value: {
            businessName: input.brand.businessName,
            tone: input.brand.tone,
            scenario: safeDecision.scenario,
            template: buildLeadRecoveryMessage(input, assessment, safeDecision.scenario).body,
            contactable: safeDecision.contactable,
            complianceFlags: assessment.complianceFlags,
            historyCount: safeDecision.history.interactionCount,
            outboundCount: safeDecision.history.outboundCount,
        },
        confidence: safeDecision.contactable ? 0.94 : 0.72,
        lesson: createMemoryLesson(safeDecision.contactable
            ? {
                outcome: "success",
                evidence: `Lead was contactable with scenario ${safeDecision.scenario}.`,
                reuseRule: "Use the same follow-up structure when the lead is contactable and no compliance flags are present.",
            }
            : {
                outcome: "failure",
                symptom: "Lead was not contactable for immediate follow-up.",
                cause: assessment.reason,
                fix: "Blocked outbound contact and deferred or suppressed the follow-up.",
                prevention: "Check contactability and timing before drafting outbound SMS.",
                reuseRule: "Apply this suppression logic to future missed-call recoveries for the same tenant and lead.",
                evidence: assessment.complianceFlags.join("; "),
            }),
        sourceJobId: jobId,
        editable: true,
        createdAt: now,
        updatedAt: now,
    };
}
//# sourceMappingURL=memory.js.map