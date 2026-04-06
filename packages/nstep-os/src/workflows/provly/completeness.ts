import { randomUUID } from "node:crypto";
import type {
  ProvLyAttachment,
  ProvLyCompletenessIssue,
  ProvLyCompletenessSummary,
  ProvLyInventoryItem,
  ProvLyReceipt,
  ProvLyIntake,
} from "../../core/types.js";
import { DEFAULT_PROVLY_UNASSIGNED_ROOM, coerceString, normalizeText } from "./catalog.js";
import type { ProvLyClassificationResult } from "./classification.js";
import type { ProvLyNormalizationResult } from "./normalization.js";

export interface ProvLyCompletenessResult {
  readonly completeness: ProvLyCompletenessSummary;
  readonly reminders: readonly string[];
  readonly ruleNotes: readonly string[];
  readonly priorityItems: readonly ProvLyInventoryItem[];
}

export function checkProvLyCompleteness(
  intake: ProvLyIntake,
  classification: ProvLyClassificationResult,
  normalized: ProvLyNormalizationResult,
): ProvLyCompletenessResult {
  const itemScores = classification.items.map((item) => scoreItem(item, normalized.attachments, normalized.receipts, intake));
  const issues: ProvLyCompletenessIssue[] = [];
  const reminders: string[] = [];
  const missingFields = new Set<string>();
  const priorityItems = classification.items.filter((item) => item.highValue).sort((left, right) => (right.estimatedValue || 0) - (left.estimatedValue || 0));

  for (const scored of itemScores) {
    for (const field of scored.missingFields) {
      missingFields.add(field);
      issues.push({
        severity: scored.severity,
        category: scoreFieldCategory(field),
        itemId: scored.itemId,
        field,
        message: scored.messages[field] || `Missing ${field} for ${scored.label}.`,
        resolution: scored.resolutions[field] || defaultResolution(field),
        data: {
          itemId: scored.itemId,
          highValue: scored.highValue,
        },
      });
    }

    if (scored.score < 100) {
      reminders.push(buildReminderLine(scored.label, scored.missingFields));
    }
  }

  const score = Math.round(itemScores.reduce((sum, item) => sum + item.score, 0) / Math.max(1, itemScores.length));
  const completedItems = itemScores.filter((item) => item.score >= 85).length;
  const highValueItems = priorityItems.length;
  const priorityScores = priorityItems.map((item) => itemScores.find((scoreEntry) => scoreEntry.itemId === item.itemId)?.score ?? 0);
  const claimReady = highValueItems === 0 ? score >= 80 : score >= 82 && priorityScores.every((priorityScore) => priorityScore >= 80);
  const status = claimReady && score >= 90 ? "pass" : score >= 70 ? "warn" : "fail";
  const now = new Date().toISOString();

  const completeness: ProvLyCompletenessSummary = {
    checkId: `check_${randomUUID()}`,
    tenantId: intake.goal.tenantId,
    caseId: intake.caseId,
    status,
    score,
    claimReady,
    totalItems: classification.items.length,
    highValueItems,
    completedItems,
    itemScores: itemScores.map((item) => ({
      itemId: item.itemId,
      score: item.score,
      missingFields: item.missingFields,
      highValue: item.highValue,
    })),
    issues,
    missingFields: [...missingFields],
    reminders: [...new Set(reminders)],
    createdAt: now,
    updatedAt: now,
    metadata: {
      claimType: intake.claimType,
      highValueThreshold: intake.highValueThreshold,
      attachmentCount: normalized.attachments.length,
      receiptCount: normalized.receipts.length,
    },
  };

  const ruleNotes = buildRuleNotes(intake, completeness, priorityItems, classification.items, normalized.attachments, normalized.receipts);

  return {
    completeness,
    reminders: completeness.reminders,
    ruleNotes,
    priorityItems,
  };
}

interface ItemScoreResult {
  readonly itemId: string;
  readonly label: string;
  readonly score: number;
  readonly missingFields: readonly string[];
  readonly highValue: boolean;
  readonly messages: Record<string, string>;
  readonly resolutions: Record<string, string>;
  readonly severity: "warning" | "error";
}

function scoreItem(
  item: ProvLyInventoryItem,
  attachments: readonly ProvLyAttachment[],
  receipts: readonly ProvLyReceipt[],
  intake: ProvLyIntake,
): ItemScoreResult {
  const itemAttachments = attachments.filter((attachment) => attachment.itemId === item.itemId || item.attachmentIds.includes(attachment.attachmentId));
  const itemReceipts = receipts.filter((receipt) => receipt.itemId === item.itemId || item.receiptIds.includes(receipt.receiptId));
  const missingFields: string[] = [];
  const messages: Record<string, string> = {};
  const resolutions: Record<string, string> = {};
  let score = 100;

  if (isGeneratedName(item.name)) {
    missingFields.push("name");
    messages.name = "Item name was inferred instead of provided.";
    resolutions.name = "Rename the item with the real product or asset name.";
    score -= 20;
  }

  if (!item.categoryId || item.categoryLabel === "Other") {
    missingFields.push("category");
    messages.category = "Category needs review.";
    resolutions.category = "Assign a more specific inventory category.";
    score -= 15;
  }

  if (!item.roomId || normalizeText(item.roomLabel) === normalizeText(DEFAULT_PROVLY_UNASSIGNED_ROOM)) {
    missingFields.push("room");
    messages.room = "Room assignment is incomplete.";
    resolutions.room = "Place the item in its room or claim location.";
    score -= 15;
  }

  if (item.estimatedValue === undefined) {
    missingFields.push("estimatedValue");
    messages.estimatedValue = "Estimated value is missing.";
    resolutions.estimatedValue = "Add a replacement cost or estimated market value.";
    score -= 12;
  }

  if (item.purchaseDate === undefined && item.highValue) {
    missingFields.push("purchaseDate");
    messages.purchaseDate = "High-value items should include a purchase date when possible.";
    resolutions.purchaseDate = "Add the purchase date or approximate acquisition year.";
    score -= 8;
  }

  if (item.highValue && itemReceipts.length === 0) {
    missingFields.push("receipt");
    messages.receipt = "High-value item lacks a receipt or proof of purchase.";
    resolutions.receipt = "Attach a receipt, invoice, or other proof of ownership.";
    score -= 15;
  }

  if (item.highValue && itemAttachments.length === 0) {
    missingFields.push("photo");
    messages.photo = "High-value item lacks a supporting photo.";
    resolutions.photo = "Attach at least one clear photo of the item.";
    score -= 10;
  }

  if (isSerialSensitive(item) && !item.serialNumber) {
    missingFields.push("serialNumber");
    messages.serialNumber = "Serial number is recommended for this item.";
    resolutions.serialNumber = "Add the model or serial number if available.";
    score -= 10;
  }

  if (item.quantity <= 0) {
    missingFields.push("quantity");
    messages.quantity = "Quantity is invalid.";
    resolutions.quantity = "Set the quantity to at least 1.";
    score -= 10;
  }

  if (item.currency !== intake.preferredCurrency && item.estimatedValue !== undefined) {
    score -= 2;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const severity: "warning" | "error" = score < 70 ? "error" : "warning";

  return {
    itemId: item.itemId,
    label: item.name,
    score,
    missingFields: [...new Set(missingFields)],
    highValue: item.highValue,
    messages,
    resolutions,
    severity,
  };
}

function buildRuleNotes(
  intake: ProvLyIntake,
  completeness: ProvLyCompletenessSummary,
  priorityItems: readonly ProvLyInventoryItem[],
  items: readonly ProvLyInventoryItem[],
  attachments: readonly ProvLyAttachment[],
  receipts: readonly ProvLyReceipt[],
): string[] {
  const notes: string[] = [];
  if (completeness.claimReady) {
    notes.push("The inventory is ready for claim export.");
  } else {
    notes.push("The inventory still needs supporting documentation before final claim export.");
  }
  if (priorityItems.length > 0) {
    notes.push(`${priorityItems.length} high-value item(s) need extra review.`);
  }
  if (attachments.length === 0) {
    notes.push("No attachments were provided.");
  }
  if (receipts.length === 0) {
    notes.push("No receipts were provided.");
  }
  if (items.some((item) => isGeneratedName(item.name))) {
    notes.push("Some item names were inferred and should be renamed before submission.");
  }
  if (intake.policyDeadline) {
    notes.push(`Policy deadline noted: ${intake.policyDeadline}.`);
  }
  return notes;
}

function buildReminderLine(label: string, missingFields: readonly string[]): string {
  if (missingFields.length === 0) {
    return `${label} is ready.`;
  }
  return `${label} still needs ${missingFields.join(", ")}.`;
}

function scoreFieldCategory(field: string): ProvLyCompletenessIssue["category"] {
  switch (field) {
    case "receipt":
      return "receipt";
    case "photo":
      return "photo";
    case "room":
      return "room";
    case "estimatedValue":
      return "value";
    case "serialNumber":
    case "purchaseDate":
    case "name":
    case "quantity":
      return "metadata";
    case "category":
      return "category";
    default:
      return "metadata";
  }
}

function defaultResolution(field: string): string {
  switch (field) {
    case "receipt":
      return "Attach proof of purchase.";
    case "photo":
      return "Attach a clear photo.";
    case "room":
      return "Assign the item to a room.";
    case "estimatedValue":
      return "Add an estimated or replacement value.";
    case "serialNumber":
      return "Add the serial or model number.";
    case "purchaseDate":
      return "Add the purchase date or approximate year.";
    case "category":
      return "Choose a more specific category.";
    case "name":
      return "Rename the item.";
    default:
      return "Review the item details.";
  }
}

function isGeneratedName(name: string): boolean {
  return /^item\s+\d+$/i.test(name.trim());
}

function isSerialSensitive(item: ProvLyInventoryItem): boolean {
  return normalizeText(`${item.categoryLabel} ${item.name} ${item.notes || ""}`).includes("electronics") || item.highValue;
}
