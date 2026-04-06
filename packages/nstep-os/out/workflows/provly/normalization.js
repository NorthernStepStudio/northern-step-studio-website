import { randomUUID } from "node:crypto";
import { DEFAULT_PROVLY_CURRENCY, DEFAULT_PROVLY_HIGH_VALUE_THRESHOLD, DEFAULT_PROVLY_UNASSIGNED_ROOM, buildCategoryId, buildRoomId, coerceNumber, coerceRecord, coerceString, inferCategory, inferBrand, inferCondition, inferHighValue, inferRoomLabel, normalizeText, parseMoney, slugify, stringifyValue, titleize, } from "./catalog.js";
export function normalizeProvLyInventory(intake) {
    const threshold = intake.highValueThreshold || DEFAULT_PROVLY_HIGH_VALUE_THRESHOLD;
    const items = normalizeInventoryItems(intake.inventoryItems, intake, threshold);
    const attachments = normalizeAttachments(intake.attachments, intake);
    const receipts = normalizeReceipts(intake.receipts, intake);
    const roomLabels = collectRoomLabels(intake, items);
    return {
        items,
        attachments,
        receipts,
        roomLabels,
        sourceCounts: countSources(items),
    };
}
function normalizeInventoryItems(rawItems, intake, highValueThreshold) {
    const candidates = flattenCollection(rawItems);
    return candidates.map((candidate, index) => normalizeItem(candidate, intake, highValueThreshold, index)).filter(Boolean);
}
function normalizeItem(candidate, intake, highValueThreshold, index) {
    const record = coerceRecord(candidate);
    if (!record && candidate === undefined) {
        return undefined;
    }
    const text = stringifyValue(candidate);
    const name = coerceString(record?.name) || coerceString(record?.title) || coerceString(record?.itemName) || coerceString(record?.description) || `Item ${index + 1}`;
    const categoryLabel = titleize(coerceString(record?.category) || coerceString(record?.type) || inferCategory(`${text} ${name}`, record?.category)) || "Other";
    const category = inferCategory(`${text} ${name}`, categoryLabel);
    const roomLabel = titleize(coerceString(record?.room) ||
        coerceString(record?.roomName) ||
        coerceString(record?.location) ||
        coerceString(record?.area) ||
        inferRoomLabel(`${text} ${name}`, intake.claimType || DEFAULT_PROVLY_UNASSIGNED_ROOM)) || DEFAULT_PROVLY_UNASSIGNED_ROOM;
    const quantity = Math.max(1, Math.round(coerceNumber(record?.quantity) || coerceNumber(record?.count) || 1));
    const estimatedValue = coerceNumber(record?.estimatedValue) ??
        coerceNumber(record?.value) ??
        coerceNumber(record?.replacementCost) ??
        parseMoney(record?.price) ??
        parseMoney(record?.amount);
    const condition = inferCondition(coerceString(record?.condition) || coerceString(record?.status) || `${text} ${name}`);
    const receiptIds = extractIdList(record?.receiptIds ?? record?.receipts ?? record?.receiptId ?? record?.receipt);
    const attachmentIds = extractIdList(record?.attachmentIds ?? record?.attachments ?? record?.photoIds ?? record?.photos ?? record?.files);
    const source = resolveItemSource(record?.source || record?.origin || record?.importSource);
    const brand = coerceString(record?.brand) || coerceString(record?.make) || inferBrand(text);
    const model = coerceString(record?.model) || coerceString(record?.sku) || coerceString(record?.serial) || coerceString(record?.partNumber);
    const purchaseDate = coerceString(record?.purchaseDate) || coerceString(record?.datePurchased) || coerceString(record?.acquiredAt);
    const serialNumber = coerceString(record?.serialNumber) || coerceString(record?.serial) || coerceString(record?.serialNo);
    const notes = coerceString(record?.notes) || coerceString(record?.summary) || coerceString(record?.memo);
    const claimContext = {
        ...(intake.claimContext || {}),
        ...(coerceRecord(record?.claimContext) || {}),
    };
    const metadata = {
        source: source,
        providedFields: Object.keys(record || {}),
        inferredFields: buildInferredFields(record, {
            name,
            category,
            roomLabel,
            estimatedValue,
            purchaseDate,
            serialNumber,
            notes,
        }),
        rawText: normalizeText(text),
        itemIndex: index,
        roomProvided: Boolean(record?.room || record?.roomName || record?.location || record?.area),
        categoryProvided: Boolean(record?.category || record?.type),
        attachmentCount: attachmentIds.length,
        receiptCount: receiptIds.length,
    };
    const itemId = coerceString(record?.itemId) || coerceString(record?.id) || `${slugify(name)}_${randomUUID().slice(0, 8)}`;
    return {
        itemId,
        tenantId: intake.goal.tenantId,
        caseId: intake.caseId,
        name,
        categoryId: buildCategoryId(category),
        categoryLabel: category,
        roomId: buildRoomId(roomLabel),
        roomLabel,
        quantity,
        condition,
        estimatedValue,
        currency: (coerceString(record?.currency) || intake.preferredCurrency || DEFAULT_PROVLY_CURRENCY).toUpperCase(),
        purchaseDate,
        serialNumber,
        brand,
        model,
        highValue: inferHighValue(category, estimatedValue, highValueThreshold, `${name} ${notes}`),
        source,
        receiptIds,
        attachmentIds,
        notes,
        claimContext,
        metadata,
        createdAt: coerceString(record?.createdAt) || new Date().toISOString(),
        updatedAt: coerceString(record?.updatedAt) || new Date().toISOString(),
    };
}
function normalizeAttachments(rawAttachments, intake) {
    return flattenCollection(rawAttachments).map((candidate, index) => normalizeAttachment(candidate, intake, index)).filter(Boolean);
}
function normalizeAttachment(candidate, intake, index) {
    const record = coerceRecord(candidate);
    if (!record && candidate === undefined) {
        return undefined;
    }
    const filename = coerceString(record?.filename) || coerceString(record?.name) || coerceString(record?.label);
    const kind = resolveAttachmentKind(record?.kind || record?.type || record?.mimeType || filename);
    return {
        attachmentId: coerceString(record?.attachmentId) || coerceString(record?.id) || `attachment_${randomUUID().slice(0, 8)}_${index + 1}`,
        tenantId: intake.goal.tenantId,
        caseId: intake.caseId,
        itemId: coerceString(record?.itemId) || coerceString(record?.inventoryItemId) || coerceString(record?.linkedItemId),
        kind,
        label: coerceString(record?.label) || filename,
        filename,
        mimeType: coerceString(record?.mimeType) || coerceString(record?.contentType),
        url: coerceString(record?.url) || coerceString(record?.href),
        sizeBytes: coerceNumber(record?.sizeBytes) || coerceNumber(record?.size),
        capturedAt: coerceString(record?.capturedAt) || coerceString(record?.createdAt) || new Date().toISOString(),
        metadata: {
            ...(coerceRecord(record?.metadata) || {}),
            source: coerceString(record?.source) || "upload",
            providedFields: Object.keys(record || {}),
        },
    };
}
function normalizeReceipts(rawReceipts, intake) {
    return flattenCollection(rawReceipts).map((candidate, index) => normalizeReceipt(candidate, intake, index)).filter(Boolean);
}
function normalizeReceipt(candidate, intake, index) {
    const record = coerceRecord(candidate);
    if (!record && candidate === undefined) {
        return undefined;
    }
    return {
        receiptId: coerceString(record?.receiptId) || coerceString(record?.id) || `receipt_${randomUUID().slice(0, 8)}_${index + 1}`,
        tenantId: intake.goal.tenantId,
        caseId: intake.caseId,
        itemId: coerceString(record?.itemId) || coerceString(record?.inventoryItemId),
        vendor: coerceString(record?.vendor) || coerceString(record?.merchant) || coerceString(record?.store),
        receiptNumber: coerceString(record?.receiptNumber) || coerceString(record?.number),
        purchaseDate: coerceString(record?.purchaseDate) || coerceString(record?.date) || coerceString(record?.createdAt),
        total: coerceNumber(record?.total) || coerceNumber(record?.amount) || coerceNumber(record?.price),
        currency: (coerceString(record?.currency) || intake.preferredCurrency || DEFAULT_PROVLY_CURRENCY).toUpperCase(),
        attachmentId: coerceString(record?.attachmentId) || coerceString(record?.documentId),
        notes: coerceString(record?.notes) || coerceString(record?.summary),
        createdAt: coerceString(record?.createdAt) || new Date().toISOString(),
        updatedAt: coerceString(record?.updatedAt) || new Date().toISOString(),
        metadata: {
            ...(coerceRecord(record?.metadata) || {}),
            providedFields: Object.keys(record || {}),
            source: coerceString(record?.source) || "upload",
        },
    };
}
function collectRoomLabels(intake, items) {
    const labels = new Set(intake.rooms.map((room) => room.trim()).filter(Boolean));
    for (const item of items) {
        if (item.roomLabel.trim()) {
            labels.add(item.roomLabel);
        }
    }
    return [...labels];
}
function extractIdList(value) {
    const items = flattenCollection(value);
    const ids = items.flatMap((item) => {
        if (typeof item === "string") {
            return [item.trim()];
        }
        const record = coerceRecord(item);
        if (record) {
            const id = coerceString(record.id) || coerceString(record.itemId) || coerceString(record.attachmentId) || coerceString(record.receiptId);
            return id ? [id] : [];
        }
        return [];
    });
    return ids.filter(Boolean);
}
function resolveItemSource(value) {
    const normalized = coerceString(value)?.toLowerCase();
    if (normalized === "manual" ||
        normalized === "upload" ||
        normalized === "photo" ||
        normalized === "receipt" ||
        normalized === "import" ||
        normalized === "claim" ||
        normalized === "system") {
        return normalized;
    }
    return "manual";
}
function resolveAttachmentKind(value) {
    const normalized = normalizeText(value);
    if (/(receipt|invoice|bill)/.test(normalized)) {
        return "receipt";
    }
    if (/(note|memo)/.test(normalized)) {
        return "note";
    }
    if (/(pdf|document)/.test(normalized)) {
        return "pdf";
    }
    if (/(photo|image|jpg|jpeg|png|heic|heif|webp)/.test(normalized)) {
        return "photo";
    }
    return "other";
}
function buildInferredFields(record, values) {
    const inferred = [];
    if (!record?.name && !record?.title && !record?.itemName) {
        inferred.push("name");
    }
    if (!record?.category && !record?.type) {
        inferred.push("category");
    }
    if (!record?.room && !record?.roomName && !record?.location && !record?.area) {
        inferred.push("room");
    }
    if (!record?.estimatedValue && !record?.value && !record?.replacementCost && !record?.price && !record?.amount) {
        inferred.push("estimatedValue");
    }
    if (!values.purchaseDate) {
        inferred.push("purchaseDate");
    }
    if (!values.serialNumber) {
        inferred.push("serialNumber");
    }
    if (!values.notes) {
        inferred.push("notes");
    }
    return inferred;
}
function countSources(items) {
    const counts = {
        manual: 0,
        upload: 0,
        photo: 0,
        receipt: 0,
        import: 0,
        claim: 0,
        system: 0,
    };
    for (const item of items) {
        counts[item.source] += 1;
    }
    return counts;
}
function flattenCollection(raw) {
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
    const nestedCollections = [
        record.items,
        record.inventoryItems,
        record.assets,
        record.records,
        record.attachments,
        record.receipts,
        record.photos,
        record.files,
        record.documents,
        record.rooms,
    ];
    const collected = [];
    for (const nested of nestedCollections) {
        if (Array.isArray(nested)) {
            collected.push(...nested.flatMap((item) => flattenCollection(item)));
        }
    }
    if (collected.length > 0) {
        return collected;
    }
    return [record];
}
//# sourceMappingURL=normalization.js.map