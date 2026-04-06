import type { LeadRecoveryAssessment, LeadRecoveryInput, LeadRecoveryMessageDraft } from "../../core/types.js";
import { buildSmsCompliantBody, hasRepeatedSmsPrefix, normalizeSmsBody, SMS_MAX_CHARACTERS } from "../../core/sms-compliance.js";
import type { LeadRecoveryDecision, LeadRecoveryDraftSafety } from "./models.js";
import { formatDateTime } from "./records.js";

export function buildLeadRecoveryMessage(
  input: LeadRecoveryInput,
  assessment: LeadRecoveryAssessment,
  scenario: LeadRecoveryDecision["scenario"] = "generic-callback",
): LeadRecoveryMessageDraft {
  const leadName = input.lead?.name?.trim() || "there";
  const businessName = input.brand.businessName.trim();
  const followup = input.brand.followupTemplate?.trim();
  const signature = input.brand.signature ? ` - ${input.brand.signature}` : "";

  const urgencyLine =
    assessment.urgency === "emergency"
      ? "If this is urgent, reply with URGENT and we will respond right away."
      : assessment.urgency === "priority"
        ? "Reply with the best time to reach you and we will follow up."
        : "Reply with a quick note and we will take it from there.";

  const messageByScenario: Record<LeadRecoveryDecision["scenario"], string> = {
    "generic-callback": `Hi ${leadName}, this is ${businessName}. We missed your call from ${formatDateTime(input.event.missedAt)}. ${urgencyLine}${signature}`,
    "after-hours": `Hi ${leadName}, this is ${businessName}. We missed your call after hours. Reply with a good time and we will follow up during business hours.${signature}`,
    "service-inquiry": `Hi ${leadName}, thanks for reaching out to ${businessName}. We missed your call and can help with your service question. Reply with the best time to connect.${signature}`,
    "quote-followup": `Hi ${leadName}, thanks for your quote request with ${businessName}. We missed your call. Reply and we will help with next steps.${signature}`,
    "appointment-callback": `Hi ${leadName}, this is ${businessName}. We missed your call about your appointment. Reply with a good time and we will call you back.${signature}`,
  };

  const body = followup
    ? followup.replace(/\s+/g, " ").trim()
    : messageByScenario[scenario].replace(/\s+/g, " ").trim();

  return {
    channel: "sms",
    tone: input.brand.tone,
    scenario,
    body: buildSmsCompliantBody(body),
  };
}

export function validateLeadRecoveryDraft(draft: LeadRecoveryMessageDraft, decision: LeadRecoveryDecision): LeadRecoveryDraftSafety {
  const reasons = new Set<string>();
  const body = buildSmsCompliantBody(normalizeSmsBody(draft.body));
  const lastOutbound = decision.history.recentOutbounds.at(-1)?.body;
  const repeatedBodyDetected = hasRepeatedSmsPrefix(lastOutbound, body);

  if (!decision.contactable) {
    reasons.add(decision.reason);
  }

  if (repeatedBodyDetected) {
    reasons.add("Repeated SMS body prefix detected.");
  }

  if (body.length > SMS_MAX_CHARACTERS) {
    reasons.add(`SMS body exceeds ${SMS_MAX_CHARACTERS} characters.`);
  }

  if (/(free money|guaranteed|act now|click here|limited time offer)/i.test(body)) {
    reasons.add("Risky promotional language detected.");
  }

  if (/[A-Z]{8,}/.test(body)) {
    reasons.add("Excessive shouting detected.");
  }

  return {
    safe: reasons.size === 0,
    reasons: [...reasons],
    body,
    messageLength: body.length,
    repeatedBodyDetected,
    complianceFooterApplied: body.toLowerCase().includes("reply stop to opt out."),
  };
}
