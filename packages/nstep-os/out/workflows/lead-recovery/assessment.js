import { SMS_MAX_CONVERSATION_TURNS, containsSmsOptOutKeyword } from "../../core/sms-compliance.js";
import { evaluateLeadRecoverySafety } from "../../policies/index.js";
import { buildLeadRecord } from "./records.js";
export function buildLeadRecoveryAssessment(input) {
    const now = Date.now();
    const previousInteractionTimes = input.previousInteractions
        ?.map((interaction) => Date.parse(interaction.at))
        .filter((value) => Number.isFinite(value)) || [];
    const lastPreviousInteractionAt = previousInteractionTimes.length ? Math.max(...previousInteractionTimes) : NaN;
    const previousOptOutSignal = Boolean(input.previousInteractions?.some((interaction) => hasOptOutSignal(interaction)));
    const conversationTurns = input.previousInteractions?.length || 0;
    const conversationTurnLimitReached = conversationTurns >= SMS_MAX_CONVERSATION_TURNS;
    const lastOutboundAt = input.lead?.lastOutboundAt ? Date.parse(input.lead.lastOutboundAt) : NaN;
    const lastContactedAt = input.lead?.lastContactedAt ? Date.parse(input.lead.lastContactedAt) : NaN;
    const contactedRecently = (Number.isFinite(lastOutboundAt) && now - lastOutboundAt < 48 * 60 * 60 * 1000) ||
        (Number.isFinite(lastContactedAt) && now - lastContactedAt < 48 * 60 * 60 * 1000) ||
        (Number.isFinite(lastPreviousInteractionAt) && now - lastPreviousInteractionAt < 48 * 60 * 60 * 1000) ||
        previousOptOutSignal ||
        Boolean(input.lead?.contactedWithin48h);
    const phoneBlocked = Boolean(input.lead?.doNotContact || previousOptOutSignal || input.lead?.stage === "opted_out" || input.lead?.stage === "blocked");
    const businessHours = isWithinBusinessHours(input.brand, now);
    const urgent = isUrgent(input.event, input.lead);
    const contactable = !phoneBlocked && !conversationTurnLimitReached && (!contactedRecently || urgent);
    const shouldUseSms = contactable;
    return evaluateLeadRecoverySafety({
        contactable,
        reason: phoneBlocked
            ? previousOptOutSignal
                ? "Lead opted out in a previous interaction."
                : "Lead is marked do-not-contact."
            : conversationTurnLimitReached
                ? `Conversation reached the ${SMS_MAX_CONVERSATION_TURNS}-message limit without reaching a goal.`
                : contactedRecently && !urgent
                    ? "Lead was contacted within the last 48 hours."
                    : "Lead is eligible for a business-safe text follow-up.",
        urgency: urgent ? "emergency" : input.lead?.stage === "qualified" ? "priority" : "normal",
        shouldUseSms,
        approvalRequired: input.goal.mode === "assist" || !businessHours || urgent,
        contactWindowAllowed: businessHours || urgent,
        conversationTurns,
        conversationTurnLimitReached,
        stopKeywordDetected: previousOptOutSignal,
        complianceFlags: [
            phoneBlocked ? "do-not-contact" : "allowed",
            previousOptOutSignal ? "stop-keyword" : "keyword-clear",
            conversationTurnLimitReached ? "conversation-turn-limit" : "conversation-turns-ok",
            contactedRecently ? "contacted-within-48h" : "contact-window-ok",
            businessHours ? "within-business-hours" : "outside-business-hours",
        ].filter(Boolean),
    });
}
export async function loadLeadRecoveryHistorySnapshot(database, input, lead) {
    const [interactions, outbounds] = await Promise.all([
        database.listInteractions(input.goal.tenantId),
        database.listOutbounds(input.goal.tenantId),
    ]);
    const normalizedPhone = normalizePhone(input.event.callerPhone);
    const leadInteractions = interactions.filter((interaction) => interaction.leadId === lead.leadId ||
        normalizePhone(String(interaction.metadata?.phone || interaction.metadata?.callerPhone || "")) === normalizedPhone);
    const leadOutbounds = outbounds.filter((message) => normalizePhone(message.to) === normalizedPhone);
    const recentInteractions = [...leadInteractions].slice(-5);
    const recentOutbounds = [...leadOutbounds].slice(-5);
    const hasRecentOptOut = lead.doNotContact ||
        input.lead?.stage === "opted_out" ||
        input.lead?.stage === "blocked" ||
        leadInteractions.some((interaction) => hasOptOutSignal(interaction));
    return {
        leadId: lead.leadId,
        tenantId: input.goal.tenantId,
        interactionCount: leadInteractions.length,
        outboundCount: leadOutbounds.length,
        recentInteractions,
        recentOutbounds,
        lastInteractionAt: recentInteractions.at(-1)?.at,
        lastOutboundAt: recentOutbounds.at(-1)?.sentAt,
        hasRecentOptOut,
        metadata: {
            normalizedPhone,
            leadStage: lead.stage,
            recentInteractionSummaries: recentInteractions.map((interaction) => interaction.summary),
            recentOutboundStatuses: recentOutbounds.map((message) => message.status || "unknown"),
        },
    };
}
export function readLeadRecoveryHistorySnapshot(step) {
    const output = step?.result?.output;
    return output?.history;
}
export function buildLeadRecoveryDecision(input, assessment, history) {
    const safeHistory = history || createEmptyLeadRecoveryHistory(input, input.lead || buildLeadRecord(input));
    const scenario = determineLeadRecoveryScenario(input, assessment, safeHistory);
    const urgent = assessment.urgency === "emergency";
    const recentOutboundAt = safeHistory.lastOutboundAt ? Date.parse(safeHistory.lastOutboundAt) : NaN;
    const recentInteractionAt = safeHistory.lastInteractionAt ? Date.parse(safeHistory.lastInteractionAt) : NaN;
    const contactedRecently = (Number.isFinite(recentOutboundAt) && Date.now() - recentOutboundAt < 48 * 60 * 60 * 1000) ||
        (Number.isFinite(recentInteractionAt) && Date.now() - recentInteractionAt < 48 * 60 * 60 * 1000) ||
        Boolean(input.lead?.contactedWithin48h);
    const complianceFlags = new Set(assessment.complianceFlags);
    if (safeHistory.hasRecentOptOut) {
        complianceFlags.add("opted-out");
        return {
            contactable: false,
            reason: "Lead is opted out or blocked from follow-up.",
            scenario,
            conversationTurns: assessment.conversationTurns,
            turnLimitReached: assessment.conversationTurnLimitReached,
            stopKeywordDetected: assessment.stopKeywordDetected || safeHistory.hasRecentOptOut,
            complianceFlags: [...complianceFlags],
            history: safeHistory,
        };
    }
    if (assessment.conversationTurnLimitReached) {
        complianceFlags.add("conversation-turn-limit");
        return {
            contactable: false,
            reason: `Lead recovery reached the ${SMS_MAX_CONVERSATION_TURNS}-message turn limit without reaching a goal.`,
            scenario,
            conversationTurns: assessment.conversationTurns,
            turnLimitReached: true,
            stopKeywordDetected: assessment.stopKeywordDetected,
            complianceFlags: [...complianceFlags],
            history: safeHistory,
        };
    }
    if (contactedRecently && !urgent) {
        complianceFlags.add("contacted-within-48h");
        return {
            contactable: false,
            reason: "Lead was contacted within the last 48 hours.",
            scenario,
            conversationTurns: assessment.conversationTurns,
            turnLimitReached: assessment.conversationTurnLimitReached,
            stopKeywordDetected: assessment.stopKeywordDetected,
            complianceFlags: [...complianceFlags],
            history: safeHistory,
        };
    }
    if (!assessment.contactWindowAllowed && !urgent) {
        complianceFlags.add("outside-business-hours");
        return {
            contactable: false,
            reason: "Lead should only be contacted during business hours.",
            scenario,
            conversationTurns: assessment.conversationTurns,
            turnLimitReached: assessment.conversationTurnLimitReached,
            stopKeywordDetected: assessment.stopKeywordDetected,
            complianceFlags: [...complianceFlags],
            history: safeHistory,
        };
    }
    return {
        contactable: assessment.contactable,
        reason: assessment.reason,
        scenario,
        conversationTurns: assessment.conversationTurns,
        turnLimitReached: assessment.conversationTurnLimitReached,
        stopKeywordDetected: assessment.stopKeywordDetected,
        complianceFlags: [...complianceFlags],
        history: safeHistory,
    };
}
export function determineLeadRecoveryScenario(input, assessment, history) {
    const text = [
        input.goal.goal,
        input.brand.followupTemplate || "",
        input.lead?.notes || "",
        input.event.metadata ? JSON.stringify(input.event.metadata) : "",
        history.recentInteractions.map((interaction) => interaction.summary).join(" "),
    ]
        .join(" ")
        .toLowerCase();
    if (/(appointment|schedule|reschedule|calendar|booking)/.test(text)) {
        return "appointment-callback";
    }
    if (/(quote|estimate|pricing|proposal|bid)/.test(text)) {
        return "quote-followup";
    }
    if (/(service|support|help|inquiry|question|details)/.test(text)) {
        return "service-inquiry";
    }
    if (!assessment.contactWindowAllowed) {
        return "after-hours";
    }
    return "generic-callback";
}
export function createEmptyLeadRecoveryHistory(input, lead) {
    return {
        leadId: lead.leadId,
        tenantId: input.goal.tenantId,
        interactionCount: 0,
        outboundCount: 0,
        recentInteractions: [],
        recentOutbounds: [],
        hasRecentOptOut: Boolean(lead.doNotContact || lead.stage === "opted_out" || lead.stage === "blocked"),
        metadata: {
            normalizedPhone: normalizePhone(input.event.callerPhone),
            leadStage: lead.stage,
        },
    };
}
function hasOptOutSignal(interaction) {
    const text = [interaction.summary, ...collectTextValues(interaction.metadata)].join(" ").toLowerCase();
    return containsSmsOptOutKeyword(text);
}
function collectTextValues(value, collected = [], depth = 0) {
    if (depth > 4) {
        return collected;
    }
    if (typeof value === "string") {
        collected.push(value);
        return collected;
    }
    if (Array.isArray(value)) {
        for (const item of value) {
            collectTextValues(item, collected, depth + 1);
        }
        return collected;
    }
    if (value && typeof value === "object") {
        for (const nested of Object.values(value)) {
            collectTextValues(nested, collected, depth + 1);
        }
    }
    return collected;
}
function normalizePhone(value) {
    const digits = String(value || "").replace(/\D+/g, "");
    if (!digits) {
        return String(value || "").trim();
    }
    if (digits.length === 11 && digits.startsWith("1")) {
        return `+${digits}`;
    }
    if (digits.length === 10) {
        return `+1${digits}`;
    }
    return `+${digits}`;
}
function isWithinBusinessHours(brand, atMs) {
    if (!brand.businessHours) {
        return true;
    }
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: brand.timeZone || "UTC",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        weekday: "long",
    });
    const parts = formatter.formatToParts(new Date(atMs));
    const weekday = parts.find((part) => part.type === "weekday")?.value?.toLowerCase() || "";
    const hour = parts.find((part) => part.type === "hour")?.value || "00";
    const minute = parts.find((part) => part.type === "minute")?.value || "00";
    const time = `${hour}:${minute}`;
    return (brand.businessHours.days.map((day) => day.toLowerCase()).includes(weekday) &&
        time >= brand.businessHours.open &&
        time <= brand.businessHours.close);
}
function isUrgent(event, lead) {
    const metadata = event.metadata;
    return Boolean(metadata.urgent === true ||
        metadata.emergency === true ||
        metadata.priority === "high" ||
        lead?.communicationTone === "urgent");
}
//# sourceMappingURL=assessment.js.map