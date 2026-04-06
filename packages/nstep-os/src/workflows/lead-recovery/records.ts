import { randomUUID } from "node:crypto";
import type { LeadRecoveryInput, LeadRecord } from "../../core/types.js";

export function buildLeadRecord(input: LeadRecoveryInput): LeadRecord {
  return {
    leadId: `lead_${randomUUID()}`,
    tenantId: input.goal.tenantId,
    phone: input.event.callerPhone,
    stage: "new",
    doNotContact: false,
    communicationTone: input.brand.tone,
    notes: "Lead record auto-created from a missed call event.",
    contactedWithin48h: false,
    metadata: {
      eventId: input.event.eventId,
    },
  };
}

export function formatDateTime(value: string): string {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(parsed));
}

