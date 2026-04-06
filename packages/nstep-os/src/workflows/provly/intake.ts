import type { GoalInput, ProvLyClaimExportFormat, ProvLyIntake, ProvLyIntakePayload, ProvLyWorkflowType } from "../../core/types.js";
import {
  DEFAULT_PROVLY_CURRENCY,
  DEFAULT_PROVLY_HIGH_VALUE_THRESHOLD,
  coerceNumber,
  coerceRecord,
  coerceString,
  inferCategory,
  normalizeText,
  slugify,
  stringifyValue,
  titleize,
} from "./catalog.js";
import { createProvLyCaseId } from "./store.js";

interface ProvLyPayloadEnvelope {
  readonly provly?: unknown;
  readonly provLy?: unknown;
}

const OPERATION_KEYWORDS: Array<[ProvLyWorkflowType, RegExp]> = [
  ["room-review", /(room review|room-by-room|by room|organize by room|inspect rooms)/i],
  ["high-value-review", /(high value|valuable item|jewelry|watch|art|premium item|expensive item)/i],
  ["reminder-generation", /(reminder|follow up|missing docs|missing documents|documentation reminder)/i],
  ["inventory-intake", /(add item|manual inventory|inventory intake|upload inventory|import inventory|new inventory)/i],
  ["export-generation", /(export|summary export|packet export|claim-ready export|report export)/i],
  ["documentation-review", /(documentation review|missing information|incomplete inventory|check docs|completeness)/i],
  ["claim-preparation", /(claim prep|claim preparation|claim packet|insurance claim|prepare claim|claim-ready)/i],
];

export function extractProvLyIntake(goal: GoalInput): ProvLyIntake {
  const payload = coerceRecord(goal.payload) || {};
  const raw = extractRawProvLyPayload(payload);
  const payloadRecord = coerceRecord(raw as unknown) || {};
  const operation = resolveOperation(goal.goal, payloadRecord);
  const caseId = coerceString(payloadRecord.caseId) || createProvLyCaseId();
  const claimantName = resolveClaimantName(goal.goal, payloadRecord);
  const claimType = resolveClaimType(goal.goal, payloadRecord);
  const inventoryItems = flattenCollection(payloadRecord.inventoryItems ?? payloadRecord.items ?? payloadRecord.inventory ?? payloadRecord.records ?? payloadRecord.assets);
  const attachments = flattenCollection(payloadRecord.attachments ?? payloadRecord.photos ?? payloadRecord.files ?? payloadRecord.documents);
  const receipts = flattenCollection(payloadRecord.receipts ?? payloadRecord.receiptDocs ?? payloadRecord.invoices);
  const visualAssets = flattenCollection(
    payloadRecord.visualAssets ??
      payloadRecord.images ??
      payloadRecord.inventoryPhotos ??
      payloadRecord.receiptPhotos ??
      payloadRecord.scans ??
      payloadRecord.photos,
  );
  const rooms = normalizeStringArray(payloadRecord.rooms ?? payloadRecord.roomNames ?? payloadRecord.locations);
  const claimContext = {
    ...(coerceRecord(payloadRecord.claimContext) || {}),
    ...(coerceRecord(payloadRecord.policy) || {}),
    ...(coerceRecord(payloadRecord.claim) || {}),
    ...(coerceRecord(payloadRecord.case) || {}),
  };
  const reminderEmail = coerceString(payloadRecord.reminderEmail) || coerceString(payloadRecord.email);
  const reminderPhone = coerceString(payloadRecord.reminderPhone) || coerceString(payloadRecord.phone);
  const exportFormat = resolveExportFormat(payloadRecord.exportFormat);
  const preferredCurrency = (coerceString(payloadRecord.preferredCurrency) || coerceString(payloadRecord.currency) || DEFAULT_PROVLY_CURRENCY).toUpperCase();
  const highValueThreshold = coerceNumber(payloadRecord.highValueThreshold) || DEFAULT_PROVLY_HIGH_VALUE_THRESHOLD;
  const documentationRules = coerceRecord(payloadRecord.documentationRules) || coerceRecord(payloadRecord.rules) || {};
  const preferences = coerceRecord(payloadRecord.preferences) || {};
  const reminderMode = resolveReminderMode(payloadRecord.reminderMode || preferences.reminderMode);

  return {
    goal,
    caseId,
    operation,
    claimantName,
    claimType,
    inventoryItems,
    attachments,
    receipts,
    visualAssets,
    rooms,
    claimContext,
    reminderEmail,
    reminderPhone,
    exportFormat,
    preferredCurrency,
    highValueThreshold,
    policyName: coerceString(payloadRecord.policyName) || coerceString(payloadRecord.policy) || coerceString(preferences.policyName),
    policyDeadline: coerceString(payloadRecord.policyDeadline) || coerceString(preferences.policyDeadline),
    documentationRules,
    preferences,
    reminderMode,
    notes: coerceString(payloadRecord.notes) || coerceString(goal.goal),
  };
}

function extractRawProvLyPayload(payload: Record<string, unknown>): unknown {
  const envelope = payload as ProvLyPayloadEnvelope;
  return envelope.provly || envelope.provLy || payload;
}

function resolveClaimantName(goalText: string, payload: Record<string, unknown>): string {
  const direct = coerceString(payload.claimantName) || coerceString(payload.name) || coerceString(payload.customerName) || coerceString(payload.ownerName);
  if (direct) {
    return direct;
  }
  const inferred = titleize(goalText.replace(/\b(provly|inventory|claim|packet|export|review)\b/gi, "").trim());
  return inferred || "Unknown claimant";
}

function resolveClaimType(goalText: string, payload: Record<string, unknown>): string {
  const direct = coerceString(payload.claimType) || coerceString(payload.caseType) || coerceString(payload.claim);
  if (direct) {
    return direct;
  }
  const text = normalizeText(`${goalText} ${stringifyValue(payload.items)} ${stringifyValue(payload.inventoryItems)}`);
  if (/(flood|fire|theft|water|burst|storm)/.test(text)) {
    return "home inventory claim";
  }
  return "home inventory";
}

function resolveOperation(goalText: string, payload: Record<string, unknown>): ProvLyWorkflowType {
  const direct = coerceString(payload.operation) || coerceString(payload.workflowType) || coerceString(payload.intent);
  if (
    direct === "inventory-intake" ||
    direct === "documentation-review" ||
    direct === "claim-preparation" ||
    direct === "room-review" ||
    direct === "reminder-generation" ||
    direct === "export-generation" ||
    direct === "high-value-review"
  ) {
    return direct;
  }

  const text = `${goalText} ${stringifyValue(payload.items)} ${stringifyValue(payload.inventoryItems)} ${stringifyValue(payload.attachments)} ${stringifyValue(payload.receipts)}`;
  for (const [operation, pattern] of OPERATION_KEYWORDS) {
    if (pattern.test(text)) {
      return operation;
    }
  }

  return "claim-preparation";
}

function resolveExportFormat(value: unknown): ProvLyClaimExportFormat {
  const direct = coerceString(value)?.toLowerCase();
  if (direct === "json" || direct === "csv" || direct === "summary" || direct === "pdf-outline") {
    return direct;
  }
  return "summary";
}

function resolveReminderMode(value: unknown): "dashboard" | "email" | "both" {
  const direct = coerceString(value)?.toLowerCase();
  if (direct === "email" || direct === "both") {
    return direct;
  }
  return "dashboard";
}

function flattenCollection(raw: unknown): unknown[] {
  if (!raw) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => flattenCollection(item));
  }
  const record = coerceRecord(raw);
  if (!record) {
    return [raw];
  }
  const nested = [record.items, record.records, record.inventoryItems, record.attachments, record.receipts, record.photos, record.files, record.documents, record.rooms, record.values];
  const collected: unknown[] = [];
  for (const group of nested) {
    if (Array.isArray(group)) {
      collected.push(...group.flatMap((item) => flattenCollection(item)));
    }
  }
  if (collected.length > 0) {
    return collected;
  }
  return [record];
}

function normalizeStringArray(raw: unknown): string[] {
  const values = flattenCollection(raw);
  return values
    .flatMap((item) => {
      if (typeof item === "string") {
        return [item];
      }
      const record = coerceRecord(item);
      if (record) {
        return [
          coerceString(record.label),
          coerceString(record.name),
          coerceString(record.room),
          coerceString(record.location),
          coerceString(record.value),
        ].filter((value): value is string => Boolean(value));
      }
      return [String(item)];
    })
    .map((value) => value.trim())
    .filter(Boolean);
}
