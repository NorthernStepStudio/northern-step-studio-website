import { normalizeText, titleize } from "./catalog.js";
export function classifyProvLyInventory(intake, normalized) {
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
function buildCategorySummaries(intake, items) {
    const grouped = new Map();
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
function buildRoomSummaries(intake, items) {
    const grouped = new Map();
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
function averageCompleteness(items) {
    if (items.length === 0) {
        return 0;
    }
    const total = items.reduce((sum, item) => sum + organizationScore(item), 0);
    return Math.round(total / items.length);
}
function organizationScore(item) {
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
function sumItemValues(items) {
    const total = items.reduce((sum, item) => sum + (item.estimatedValue || 0) * item.quantity, 0);
    return total > 0 ? Number(total.toFixed(2)) : undefined;
}
function summarizeSources(items) {
    const counts = {};
    for (const item of items) {
        counts[item.source] = (counts[item.source] || 0) + 1;
    }
    return counts;
}
//# sourceMappingURL=classification.js.map