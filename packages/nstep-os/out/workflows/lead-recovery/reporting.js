import { buildLeadRecoveryDecision, createEmptyLeadRecoveryHistory, readLeadRecoveryHistorySnapshot } from "./assessment.js";
import { buildLeadRecoveryMessage } from "./message.js";
import { buildLeadRecord } from "./records.js";
import { STEP_TYPES } from "./models.js";
export function reportLeadRecovery(input, assessment, job) {
    const loadStep = job.steps.find((step) => step.type === STEP_TYPES.loadLead);
    const draftStep = job.steps.find((step) => step.type === STEP_TYPES.draft);
    const safety = draftStep?.result?.output?.safety;
    const decision = buildLeadRecoveryDecision(input, assessment, readLeadRecoveryHistorySnapshot(loadStep) || createEmptyLeadRecoveryHistory(input, input.lead || buildLeadRecord(input)));
    const message = draftStep?.result?.output?.draft ||
        buildLeadRecoveryMessage(input, assessment, decision.scenario);
    const sendStep = job.steps.find((step) => step.type === STEP_TYPES.send);
    const verifyStep = job.steps.find((step) => step.type === STEP_TYPES.verify);
    const logOutput = job.steps.find((step) => step.type === STEP_TYPES.log)?.result?.output;
    const sendOutput = sendStep?.result?.output;
    const verifyOutput = verifyStep?.result?.output;
    const delivery = sendOutput?.delivery;
    const verifiedDelivery = verifyOutput?.delivery;
    const deliveryStep = job.steps.find((step) => step.type === STEP_TYPES.verify);
    const deliveryStatus = verifiedDelivery?.status || delivery?.status || "unknown";
    const status = decision.contactable && deliveryStep?.status === "completed" && deliveryStatus === "delivered" ? "succeeded" : "partial";
    const summary = status === "succeeded"
        ? `Recovered ${input.event.callerPhone} for ${input.brand.businessName} with a business-safe SMS follow-up.`
        : deliveryStatus === "queued"
            ? `Lead recovery completed for ${input.event.callerPhone}, but the SMS is still queued.`
            : `Lead recovery completed with limitations for ${input.event.callerPhone}.`;
    return {
        status,
        summary,
        actionsTaken: [
            "captured missed call",
            "loaded caller history",
            "checked suppression rules",
            "classified contactability",
            "generated SMS follow-up",
            "attempted delivery verification",
            "logged interaction",
            "stored reusable memory",
        ],
        data: {
            tenantId: input.goal.tenantId,
            eventId: input.event.eventId,
            phone: input.event.callerPhone,
            businessName: input.brand.businessName,
            leadId: input.lead?.leadId,
            leadStage: logOutput?.leadStage || input.lead?.stage || "new",
            contactable: decision.contactable,
            scenario: decision.scenario,
            suppressionReason: decision.reason,
            historyCount: decision.history.interactionCount,
            outboundCount: decision.history.outboundCount,
            lastInteractionAt: decision.history.lastInteractionAt,
            lastOutboundAt: decision.history.lastOutboundAt,
            complianceFlags: decision.complianceFlags,
            draftSafety: safety?.reasons || [],
            sendStatus: deliveryStatus,
            sendProvider: delivery?.provider,
            sendMessageId: delivery?.messageId,
            verificationStatus: verifyStep?.status || "unknown",
            message: message.body,
        },
    };
}
//# sourceMappingURL=reporting.js.map