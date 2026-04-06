import type {
  ProvLyInventoryCategory,
  ProvLyInventoryItem,
  ProvLyIntake,
  ProvLyRoom,
} from "../../core/types.js";
import { formatMoney, normalizeText, slugify, titleize } from "./catalog.js";
import type { ProvLyNormalizationResult } from "./normalization.js";

export interface ProvLyClassificationResult {
  readonly items: readonly ProvLyInventoryItem[];
  readonly categories: readonly ProvLyInventoryCategory[];
  readonly rooms: readonly ProvLyRoom[];
  readonly highValueItems: readonly ProvLyInventoryItem[];
  readonly totalEstimatedValue?: number;
}

export function classifyProvLyInventory(intake: ProvLyIntake, normalized: ProvLyNormalizationResult): ProvLyClassificationResult {
  const items = [...normalized.items];
  const highValueItems = items.filter((item) => item.highValue).sort((left, right) => (right.estimatedValue || 0) - (left.estimatedValue || 0));
  const categories = buildCategorySummaries(intake, items);
  const rooms = buildRoomSummaries(intake, items);
  const totalEstimatedValue = sumItemValues(items);

  return {
    items,
    categories,
    rooms,
    highValueItems,
    totalEstimatedValue,
  };
}

function buildCategorySummaries(intake: ProvLyIntake, items: readonly ProvLyInventoryItem[]): ProvLyInventoryCategory[] {
  const grouped = new Map<string, ProvLyInventoryItem[]>();
  for (const item of items) {
    const list = grouped.get(item.categoryId) || [];
    list.push(item);
    grouped.set(item.categoryId, list);
  }

  return [...grouped.entries()].map(([categoryId, group]) => {
    const sample = group[0];
    const estimatedValue = sumItemValues(group);
    return {
      categoryId,
      tenantId: intake.goal.tenantId,
      caseId: intake.caseId,
      label: sample?.categoryLabel || titleize(categoryId.replace(/^category_/, "")) || "Other",
      normalizedLabel: normalizeText(sample?.categoryLabel || categoryId),
      itemCount: group.length,
      highValueCount: group.filter((item) => item.highValue).length,
      estimatedValue,
      completenessScore: averageCompleteness(group),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        itemIds: group.map((item) => item.itemId),
        itemNames: group.map((item) => item.name),
        sourceSummary: summarizeSources(group),
      },
    };
  }).sort((left, right) => right.itemCount - left.itemCount || (right.estimatedValue || 0) - (left.estimatedValue || 0));
}

function buildRoomSummaries(intake: ProvLyIntake, items: readonly ProvLyInventoryItem[]): ProvLyRoom[] {
  const grouped = new Map<string, ProvLyInventoryItem[]>();
  for (const item of items) {
    const list = grouped.get(item.roomId) || [];
    list.push(item);
    grouped.set(item.roomId, list);
  }

  return [...grouped.entries()].map(([roomId, group]) => {
    const sample = group[0];
    const estimatedValue = sumItemValues(group);
    return {
      roomId,
      tenantId: intake.goal.tenantId,
      caseId: intake.caseId,
      label: sample?.roomLabel || titleize(roomId.replace(/^room_/, "")) || "Unassigned",
      normalizedLabel: normalizeText(sample?.roomLabel || roomId),
      itemCount: group.length,
      highValueCount: group.filter((item) => item.highValue).length,
      estimatedValue,
      completenessScore: averageCompleteness(group),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        itemIds: group.map((item) => item.itemId),
        itemNames: group.map((item) => item.name),
      },
    };
  }).sort((left, right) => right.itemCount - left.itemCount || (right.estimatedValue || 0) - (left.estimatedValue || 0));
}

function averageCompleteness(items: readonly ProvLyInventoryItem[]): number {
  if (items.length === 0) {
    return 0;
  }
  const total = items.reduce((sum, item) => sum + organizationScore(item), 0);
  return Math.round(total / items.length);
}

function organizationScore(item: ProvLyInventoryItem): number {
  const inferredFields = Array.isArray(item.metadata.inferredFields) ? item.metadata.inferredFields.length : 0;
  const providedFields = Array.isArray(item.metadata.providedFields) ? item.metadata.providedFields.length : 0;
  let score = 100;
  score -= inferredFields * 8;
  if (item.highValue && item.receiptIds.length === 0) {
    score -= 12;
  }
  if (item.highValue && item.attachmentIds.length === 0) {
    score -= 8;
  }
  if (providedFields < 6) {
    score -= 10;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

function sumItemValues(items: readonly ProvLyInventoryItem[]): number | undefined {
  const total = items.reduce((sum, item) => sum + (item.estimatedValue || 0) * item.quantity, 0);
  return total > 0 ? Number(total.toFixed(2)) : undefined;
}

function summarizeSources(items: readonly ProvLyInventoryItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item.source] = (counts[item.source] || 0) + 1;
  }
  return counts;
}
