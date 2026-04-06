import { randomUUID } from "node:crypto";
import { buildLeadRecoveryAssessment, buildLeadRecoveryDecision, createEmptyLeadRecoveryHistory, loadLeadRecoveryHistorySnapshot, readLeadRecoveryHistorySnapshot } from "./assessment.js";
import { buildLeadRecoveryMessage, validateLeadRecoveryDraft } from "./message.js";
import { STEP_TYPES } from "./models.js";
import { buildLeadRecord } from "./records.js";
import { buildLeadRecoveryMemory } from "./memory.js";
import { reportLeadRecovery } from "./reporting.js";
export async function executeLeadRecoveryStep(step, context) {
    const input = context.input;
    const assessment = buildLeadRecoveryAssessment(input);
    const database = context.stores.domain;
    const sms = context.tools.sms;
    const lead = input.lead || (await database.getLeadByPhone(input.goal.tenantId, input.event.callerPhone)) || buildLeadRecord(input);
    const getHistory = () => readLeadRecoveryHistorySnapshot(context.job.steps.find((item) => item.type === STEP_TYPES.loadLead)) ||
        createEmptyLeadRecoveryHistory(input, lead);
    const getDecision = () => buildLeadRecoveryDecision(input, assessment, getHistory());
    switch (step.type) {
        case STEP_TYPES.captureEvent: {
            await database.upsertCallEvent(input.event);
            return {
                status: "completed",
                message: "Missed call event captured.",
                output: {
                    eventId: input.event.eventId,
                },
            };
        }
        case STEP_TYPES.loadLead: {
            const storedLead = await database.upsertLead(lead);
            const history = await loadLeadRecoveryHistorySnapshot(database, input, storedLead);
            return {
                status: "completed",
                message: "Lead metadata and history loaded.",
                output: {
                    leadId: storedLead.leadId,
                    phone: storedLead.phone,
                    stage: storedLead.stage,
                    history,
                },
            };
        }
        case STEP_TYPES.assess: {
            const decision = getDecision();
            return {
                status: decision.contactable ? "completed" : "blocked",
                message: decision.reason,
                output: {
                    assessment,
                    history: decision.history,
                    decision,
                },
                retryable: false,
            };
        }
        case STEP_TYPES.draft: {
            const decision = getDecision();
            const draft = buildLeadRecoveryMessage(input, assessment, decision.scenario);
            const safety = validateLeadRecoveryDraft(draft, decision);
            return {
                status: "completed",
                message: "SMS follow-up drafted.",
                output: {
                    draft: {
                        ...draft,
                        body: safety.body,
                    },
                    decision,
                    safety,
                },
            };
        }
        case STEP_TYPES.send: {
            const decision = getDecision();
            const draftStep = context.job.steps.find((item) => item.type === STEP_TYPES.draft);
            const drafted = draftStep?.result?.output || undefined;
            const draft = drafted?.draft || buildLeadRecoveryMessage(input, assessment, decision.scenario);
            const safety = drafted?.safety || validateLeadRecoveryDraft(draft, decision);
            if (!decision.contactable) {
                return {
                    status: "blocked",
                    message: decision.reason,
                    retryable: false,
                    output: {
                        decision,
                        safety,
                        draft,
                    },
                };
            }
            if (!safety.safe) {
                return {
                    status: "blocked",
                    message: `Draft failed safety checks: ${safety.reasons.join("; ") || "policy validation failed."}`,
                    retryable: false,
                    output: {
                        decision,
                        safety,
                        draft,
                    },
                };
            }
            if (!sms) {
                return {
                    status: "failed",
                    message: "No SMS adapter is configured.",
                    retryable: true,
                };
            }
            const delivery = await sms.send({
                to: input.event.callerPhone,
                from: input.brand.smsFromNumber,
                body: safety.body,
                tenantId: input.goal.tenantId,
            });
            return {
                status: delivery.status === "failed" ? "failed" : "completed",
                message: delivery.detail || "SMS send attempted.",
                output: {
                    delivery,
                    draft: {
                        ...draft,
                        body: safety.body,
                    },
                    decision,
                    safety,
                },
                retryable: delivery.status === "failed",
            };
        }
        case STEP_TYPES.verify: {
            const sendStep = context.job.steps.find((item) => item.type === STEP_TYPES.send);
            const sendOutput = sendStep?.result?.output;
            const messageId = String(sendOutput?.delivery?.messageId || "");
            const delivery = sms && messageId ? await sms.verify(messageId) : { status: "unknown" };
            return {
                status: "completed",
                message: "Delivery verification complete.",
                output: {
                    delivery,
                    decision: getDecision(),
                },
            };
        }
        case STEP_TYPES.log: {
            const sendStep = context.job.steps.find((item) => item.type === STEP_TYPES.send);
            const draftStep = context.job.steps.find((item) => item.type === STEP_TYPES.draft);
            const history = getHistory();
            const decision = getDecision();
            const sendOutput = sendStep?.result?.output;
            const sendDelivery = sendOutput?.delivery || undefined;
            const now = new Date().toISOString();
            const deliveryStatus = sendDelivery?.status || "unknown";
            const messageId = sendDelivery?.messageId || `sms_${randomUUID()}`;
            const outboundStatus = deliveryStatus === "failed"
                ? "failed"
                : deliveryStatus === "queued"
                    ? "queued"
                    : deliveryStatus === "delivered"
                        ? "delivered"
                        : "unknown";
            const interaction = {
                interactionId: `interaction_${randomUUID()}`,
                tenantId: input.goal.tenantId,
                leadId: lead.leadId,
                channel: "sms",
                direction: "outbound",
                summary: outboundStatus === "delivered"
                    ? `Lead recovery follow-up delivered after a missed call via ${decision.scenario}.`
                    : outboundStatus === "queued"
                        ? `Lead recovery follow-up queued after a missed call via ${decision.scenario}.`
                        : `Lead recovery follow-up attempted after a missed call via ${decision.scenario}.`,
                at: now,
                metadata: {
                    eventId: input.event.eventId,
                    assessment,
                    decision,
                    history,
                    scenario: decision.scenario,
                    safety: draftStep?.result?.output?.safety,
                    deliveryStatus,
                    messageId,
                    outboundStatus,
                },
            };
            const updatedLead = {
                ...lead,
                stage: outboundStatus === "failed" ? lead.stage : lead.stage === "new" ? "contacted" : lead.stage,
                lastOutboundAt: now,
                lastContactedAt: outboundStatus === "failed" ? lead.lastContactedAt : now,
                metadata: {
                    ...lead.metadata,
                    lastLeadRecoveryJobId: context.job.jobId,
                    lastLeadRecoveryDeliveryStatus: deliveryStatus,
                    lastLeadRecoveryMessageId: messageId,
                    lastLeadRecoveryScenario: decision.scenario,
                    lastLeadRecoveryHistoryCount: history.interactionCount,
                },
            };
            await database.upsertLead(updatedLead);
            await database.appendInteraction(interaction);
            await database.appendOutboundMessage({
                to: input.event.callerPhone,
                from: input.brand.smsFromNumber,
                body: draftStep?.result?.output?.draft?.body || buildLeadRecoveryMessage(input, assessment, decision.scenario).body,
                tenantId: input.goal.tenantId,
                provider: sendDelivery?.provider || "nstep-os",
                status: outboundStatus,
                messageId,
                sentAt: sendDelivery?.deliveredAt || now,
                error: deliveryStatus === "failed" ? sendDelivery?.detail : undefined,
            });
            return {
                status: "completed",
                message: "Interaction logged.",
                output: {
                    interactionId: interaction.interactionId,
                    leadId: updatedLead.leadId,
                    leadStage: updatedLead.stage,
                    deliveryStatus: outboundStatus,
                    scenario: decision.scenario,
                },
            };
        }
        case STEP_TYPES.remember: {
            const memory = buildLeadRecoveryMemory(input, assessment, context.job.jobId, getDecision());
            return {
                status: "completed",
                message: "Memory entry stored.",
                output: {
                    memory,
                },
            };
        }
        case STEP_TYPES.report: {
            const report = reportLeadRecovery(input, assessment, context.job);
            return {
                status: "completed",
                message: "Dashboard summary built.",
                output: report.data,
            };
        }
        default:
            return {
                status: "failed",
                message: `Unsupported lead recovery step type: ${step.type}`,
                retryable: false,
            };
    }
}
//# sourceMappingURL=execution.js.map