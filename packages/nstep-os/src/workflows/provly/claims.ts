import { randomUUID } from "node:crypto";
import type {
  ProvLyClaimExport,
  ProvLyClaimExportFormat,
  ProvLyCompletenessSummary,
  ProvLyIntake,
  ProvLyInventoryCategory,
  ProvLyInventoryItem,
  ProvLyRoom,
} from "../../core/types.js";
import { formatMoney } from "./catalog.js";
import type { ProvLyClassificationResult } from "./classification.js";

export interface ProvLyClaimPrepResult {
  readonly exportStatus: ProvLyClaimExport["status"];
  readonly ruleNotes: readonly string[];
  readonly reminderDraft?: {
    readonly recipients: readonly string[];
    readonly subject: string;
    readonly body: string;
  };
  readonly claimReady: boolean;
}

export function evaluateProvLyClaimPrep(
  intake: ProvLyIntake,
  classification: ProvLyClassificationResult,
  completeness: ProvLyCompletenessSummary,
): ProvLyClaimPrepResult {
  const ruleNotes: string[] = [];
  const claimReady = completeness.claimReady;
  const exportStatus: ProvLyClaimExport["status"] = claimReady ? "ready" : completeness.status === "fail" ? "needs-review" : "draft";

  if (claimReady) {
    ruleNotes.push("The inventory appears ready for claim export.");
  } else {
    ruleNotes.push("The inventory needs additional documentation before a final claim packet.");
  }

  if (classification.highValueItems.length > 0) {
    ruleNotes.push(`${classification.highValueItems.length} high-value item(s) deserve priority review.`);
  }

  if (intake.policyDeadline) {
    ruleNotes.push(`Claim timeline noted: ${intake.policyDeadline}.`);
  }

  const reminderDraft = buildReminderDraft(intake, classification, completeness);

  return {
    exportStatus,
    ruleNotes,
    reminderDraft,
    claimReady,
  };
}

export function buildProvLyClaimExport(
  intake: ProvLyIntake,
  classification: ProvLyClassificationResult,
  completeness: ProvLyCompletenessSummary,
  prep: ProvLyClaimPrepResult,
): ProvLyClaimExport {
  const now = new Date().toISOString();
  const missingDocumentation = buildMissingDocumentationList(intake, completeness, classification.items);
  const highValueItems = classification.highValueItems.map((item) => {
    const itemScore = completeness.itemScores.find((score) => score.itemId === item.itemId);
    return {
      itemId: item.itemId,
      name: item.name,
      roomLabel: item.roomLabel,
      categoryLabel: item.categoryLabel,
      estimatedValue: item.estimatedValue,
      missingFields: itemScore?.missingFields || [],
    };
  });

  return {
    exportId: `export_${randomUUID()}`,
    tenantId: intake.goal.tenantId,
    caseId: intake.caseId,
    title: `${intake.claimantName} claim packet`,
    status: prep.exportStatus,
    format: resolveExportFormat(intake.exportFormat),
    itemCount: classification.items.length,
    roomCount: classification.rooms.length,
    categoryCount: classification.categories.length,
    completenessScore: completeness.score,
    highValueItemCount: classification.highValueItems.length,
    missingFieldCount: completeness.missingFields.length,
    summary:
      completeness.claimReady
        ? `${intake.claimantName}'s inventory looks claim-ready with ${classification.items.length} item(s).`
        : `${intake.claimantName}'s inventory still needs documentation before it is claim-ready.`,
    sections: {
      overview: {
        caseId: intake.caseId,
        claimType: intake.claimType,
        claimReady: completeness.claimReady,
        completenessScore: completeness.score,
        totalItems: classification.items.length,
        totalEstimatedValue: classification.totalEstimatedValue,
        highValueItemCount: classification.highValueItems.length,
        policyName: intake.policyName,
        policyDeadline: intake.policyDeadline,
        reminderEmail: intake.reminderEmail,
      },
      rooms: classification.rooms.map((room) => ({
        roomId: room.roomId,
        roomLabel: room.label,
        itemCount: room.itemCount,
        estimatedValue: room.estimatedValue,
        highValueCount: room.highValueCount,
      })),
      categories: classification.categories.map((category) => ({
        categoryId: category.categoryId,
        categoryLabel: category.label,
        itemCount: category.itemCount,
        estimatedValue: category.estimatedValue,
        highValueCount: category.highValueCount,
      })),
      highValueItems,
      missingDocumentation,
      attachments: classification.items.flatMap((item) => item.attachmentIds),
      receipts: classification.items.flatMap((item) => item.receiptIds),
      notes: [
        ...prep.ruleNotes,
        ...(completeness.reminders.length > 0 ? [`${completeness.reminders.length} reminder line(s) prepared.`] : []),
      ],
    },
    createdAt: now,
    updatedAt: now,
    metadata: {
      claimType: intake.claimType,
      preferredCurrency: intake.preferredCurrency,
      reminderMode: intake.reminderMode,
      source: "provly",
    },
  };
}

function buildReminderDraft(
  intake: ProvLyIntake,
  classification: ProvLyClassificationResult,
  completeness: ProvLyCompletenessSummary,
): ProvLyClaimPrepResult["reminderDraft"] {
  if (completeness.claimReady) {
    return undefined;
  }

  const recipients = [intake.reminderEmail, intake.reminderPhone].filter((value): value is string => Boolean(value));
  if (recipients.length === 0) {
    return undefined;
  }

  const missingLines = completeness.reminders.length > 0 ? completeness.reminders : ["More documentation is needed."];
  return {
    recipients,
    subject: `${intake.claimantName} inventory docs need attention`,
    body: [
      `Hello ${intake.claimantName},`,
      "",
      `We are preparing your ${intake.claimType} inventory packet and still need a few details to complete it.`,
      ...missingLines.map((line) => `- ${line}`),
      "",
      `Current completeness score: ${completeness.score}/100.`,
      classification.highValueItems.length > 0 ? `${classification.highValueItems.length} high-value item(s) need closer review.` : "No high-value items were flagged.",
      intake.policyDeadline ? `Policy deadline: ${intake.policyDeadline}` : undefined,
      "",
      "Reply with receipts, photos, or corrected item details when ready.",
    ]
      .filter((line): line is string => Boolean(line))
      .join("\n"),
  };
}

function buildMissingDocumentationList(
  intake: ProvLyIntake,
  completeness: ProvLyCompletenessSummary,
  items: readonly ProvLyInventoryItem[],
): readonly {
  readonly itemId?: string;
  readonly label: string;
  readonly fields: readonly string[];
  readonly severity: "warning" | "error";
}[] {
  return completeness.issues.map((issue) => ({
    itemId: issue.itemId,
    label: items.find((item) => item.itemId === issue.itemId)?.name || intake.claimantName,
    fields: issue.field ? [issue.field] : [issue.category],
    severity: issue.severity === "error" ? "error" : "warning",
  }));
}

function resolveExportFormat(format: ProvLyClaimExportFormat): ProvLyClaimExportFormat {
  return format || "summary";
}
