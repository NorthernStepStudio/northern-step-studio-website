import { randomUUID } from "node:crypto";
import { DEFAULT_PROVLY_CURRENCY, DEFAULT_PROVLY_HIGH_VALUE_THRESHOLD, DEFAULT_PROVLY_UNASSIGNED_ROOM, buildCategoryId, buildRoomId, coerceNumber, coerceRecord, coerceString, inferBrand, inferCategory, inferHighValue, inferRoomLabel, normalizeText, parseMoney, slugify, titleize, } from "./catalog.js";
export async function enrichProvLyIntakeFromVisualAssets(intake, ocr) {
    const candidates = collectVisualCandidates(intake);
    if (candidates.length === 0) {
        return {
            intake: annotateIntakeWithExtraction(intake, {
                candidateCount: 0,
                extractedItemCount: 0,
                extractedReceiptCount: 0,
                attachmentCount: 0,
                ocrStatus: ocr ? "fallback" : "unavailable",
                ocrProvider: ocr?.provider,
                usedOcr: false,
                notes: ["No visual assets were supplied."],
                extractedAt: new Date().toISOString(),
            }),
            summary: {
                candidateCount: 0,
                extractedItemCount: 0,
                extractedReceiptCount: 0,
                attachmentCount: 0,
                ocrStatus: ocr ? "fallback" : "unavailable",
                ocrProvider: ocr?.provider,
                usedOcr: false,
                notes: ["No visual assets were supplied."],
                extractedAt: new Date().toISOString(),
            },
        };
    }
    const ocrResults = await runOcr(candidates, ocr);
    const existingAttachmentKeys = new Set(intake.attachments.map(attachmentFingerprintFromValue).filter(Boolean));
    const generatedItems = [];
    const generatedReceipts = [];
    const generatedAttachments = [];
    const notes = new Set();
    for (const candidate of candidates) {
        const result = ocrResults.find((item) => item.id === candidate.id);
        const text = normalizeText(resolveExtractionText(candidate, result));
        if (!text) {
            notes.add(`Skipped ${candidate.label || candidate.filename || candidate.id} because no text was available.`);
            continue;
        }
        const attachment = buildAttachment(intake, candidate, text, result);
        const attachmentKey = attachmentFingerprint(attachment);
        if (!existingAttachmentKeys.has(attachmentKey)) {
            generatedAttachments.push(attachment);
            existingAttachmentKeys.add(attachmentKey);
        }
        if (looksLikeReceipt(candidate, text)) {
            generatedReceipts.push(buildReceiptDraft(intake, candidate, attachment.attachmentId, text, result?.confidence));
            notes.add(`Extracted receipt details from ${candidate.label || candidate.filename || candidate.id}.`);
            continue;
        }
        generatedItems.push(buildItemDraft(intake, candidate, attachment.attachmentId, text, result?.confidence));
        notes.add(`Extracted inventory details from ${candidate.label || candidate.filename || candidate.id}.`);
    }
    const enrichedIntake = {
        ...intake,
        inventoryItems: [...intake.inventoryItems, ...generatedItems],
        attachments: [...intake.attachments, ...generatedAttachments],
        receipts: [...intake.receipts, ...generatedReceipts],
        claimContext: {
            ...intake.claimContext,
            visualExtraction: {
                candidateCount: candidates.length,
                extractedItemCount: generatedItems.length,
                extractedReceiptCount: generatedReceipts.length,
                attachmentCount: generatedAttachments.length,
                ocrStatus: ocrResults.length > 0 ? "used" : ocr?.provider === "generic-http" ? "fallback" : ocr ? "fallback" : "unavailable",
                ocrProvider: ocr?.provider,
                usedOcr: ocrResults.length > 0,
                notes: [...notes],
                extractedAt: new Date().toISOString(),
            },
        },
    };
    const summary = enrichedIntake.claimContext.visualExtraction;
    return {
        intake: enrichedIntake,
        summary,
    };
}
async function runOcr(candidates, ocr) {
    if (!ocr || candidates.length === 0) {
        return [];
    }
    const items = candidates
        .filter((candidate) => Boolean(candidate.url || candidate.dataUrl || candidate.text || candidate.metadata.ocrText || candidate.metadata.text))
        .map((candidate) => ({
        id: candidate.id,
        url: candidate.url,
        dataUrl: candidate.dataUrl,
        mimeType: candidate.mimeType,
        filename: candidate.filename,
        label: candidate.label,
        text: stringFromMetadata(candidate.metadata, "ocrText", "text", "transcript", "caption", "notes"),
        metadata: candidate.metadata,
    }));
    if (items.length === 0) {
        return [];
    }
    try {
        const response = await ocr.extract({
            items,
            prompt: "Extract concise text from home inventory photos and receipts. Preserve item names, brands, model numbers, receipt totals, vendor names, dates, room clues, and serial numbers when visible.",
        });
        return response.items;
    }
    catch (error) {
        if (error instanceof Error && error.name === "ToolPermissionError") {
            return [];
        }
        return [];
    }
}
function resolveExtractionText(candidate, result) {
    return (result?.text ||
        candidate.text ||
        stringFromMetadata(candidate.metadata, "ocrText", "text", "transcript", "caption", "notes", "summary") ||
        "");
}
function collectVisualCandidates(intake) {
    const candidates = new Map();
    const rawItems = [...intake.visualAssets, ...intake.attachments];
    rawItems.forEach((raw, index) => {
        const candidate = normalizeCandidate(raw, index);
        if (!candidate) {
            return;
        }
        candidates.set(candidate.id, candidate);
    });
    return [...candidates.values()];
}
function normalizeCandidate(raw, index) {
    const record = coerceRecord(raw);
    if (!record && typeof raw !== "string") {
        return undefined;
    }
    const textValue = record
        ? stringFromMetadata(record, "ocrText", "text", "transcript", "caption", "notes", "summary")
        : undefined;
    const filename = record ? coerceString(record.filename) || coerceString(record.name) : undefined;
    const label = record ? coerceString(record.label) || coerceString(record.title) || coerceString(record.name) : undefined;
    const mimeType = record ? coerceString(record.mimeType) || coerceString(record.contentType) : undefined;
    const url = record ? coerceString(record.url) || coerceString(record.href) : undefined;
    const dataUrl = record ? coerceString(record.dataUrl) || coerceString(record.base64) : undefined;
    const kind = resolveVisualKind(record, filename, mimeType, label);
    const id = (record && (coerceString(record.attachmentId) || coerceString(record.receiptId) || coerceString(record.itemId))) ||
        `visual_${slugify(label || filename || url || `asset ${index + 1}`)}_${randomUUID().slice(0, 8)}`;
    return {
        id,
        kind,
        label,
        filename,
        mimeType,
        url,
        dataUrl,
        text: textValue,
        metadata: record || { value: raw },
    };
}
function resolveVisualKind(record, filename, mimeType, label) {
    const hint = normalizeText([filename, mimeType, label, stringFromMetadata(record || {}, "kind", "type", "source")].filter(Boolean).join(" "));
    if (/(receipt|invoice|bill)/.test(hint)) {
        return "receipt";
    }
    if (/(document|pdf|scan)/.test(hint)) {
        return "document";
    }
    if (/(photo|image|jpg|jpeg|png|webp|heic|heif)/.test(hint)) {
        return "photo";
    }
    return "other";
}
function buildAttachment(intake, candidate, text, result) {
    return {
        attachmentId: candidate.id,
        tenantId: intake.goal.tenantId,
        caseId: intake.caseId,
        itemId: undefined,
        kind: candidate.kind === "receipt" ? "receipt" : candidate.kind === "document" ? "pdf" : "photo",
        label: candidate.label || candidate.filename || candidate.id,
        filename: candidate.filename,
        mimeType: candidate.mimeType,
        url: candidate.url,
        sizeBytes: coerceNumber(candidate.metadata.sizeBytes) || coerceNumber(candidate.metadata.size),
        capturedAt: new Date().toISOString(),
        metadata: {
            ...candidate.metadata,
            source: "visual-extraction",
            extractedText: text,
            extractionConfidence: result?.confidence,
            extractionProviderText: result?.text,
        },
    };
}
function buildItemDraft(intake, candidate, attachmentId, text, confidence) {
    const name = resolveItemName(candidate, text);
    const categoryLabel = titleize(coerceString(candidate.metadata.categoryLabel) ||
        coerceString(candidate.metadata.category) ||
        inferCategory(`${text} ${name}`, name) ||
        "other");
    const category = inferCategory(`${text} ${name}`, categoryLabel);
    const roomLabel = titleize(coerceString(candidate.metadata.roomLabel) ||
        coerceString(candidate.metadata.room) ||
        inferRoomLabel(`${text} ${name}`, intake.claimType || DEFAULT_PROVLY_UNASSIGNED_ROOM)) || DEFAULT_PROVLY_UNASSIGNED_ROOM;
    const estimatedValue = coerceNumber(candidate.metadata.estimatedValue) || parseMoney(text) || parseMoney(candidate.metadata.price) || parseMoney(candidate.metadata.amount);
    const purchaseDate = coerceString(candidate.metadata.purchaseDate) || coerceString(candidate.metadata.datePurchased) || extractDate(text);
    const serialNumber = coerceString(candidate.metadata.serialNumber) || coerceString(candidate.metadata.serial) || extractSerialNumber(text);
    const model = coerceString(candidate.metadata.model) || coerceString(candidate.metadata.sku) || extractModel(text);
    return {
        itemId: `item_${slugify(name)}_${randomUUID().slice(0, 8)}`,
        tenantId: intake.goal.tenantId,
        caseId: intake.caseId,
        name,
        categoryId: buildCategoryId(category),
        categoryLabel: category,
        roomId: buildRoomId(roomLabel),
        roomLabel,
        quantity: Math.max(1, Math.round(coerceNumber(candidate.metadata.quantity) || 1)),
        condition: "unknown",
        estimatedValue,
        currency: (coerceString(candidate.metadata.currency) || intake.preferredCurrency || DEFAULT_PROVLY_CURRENCY).toUpperCase(),
        purchaseDate,
        serialNumber,
        brand: coerceString(candidate.metadata.brand) || inferBrand(text),
        model,
        highValue: inferHighValue(category, estimatedValue, intake.highValueThreshold || DEFAULT_PROVLY_HIGH_VALUE_THRESHOLD, `${name} ${text}`),
        source: candidate.kind === "receipt" ? "receipt" : "photo",
        receiptIds: [],
        attachmentIds: [attachmentId],
        notes: text.slice(0, 240),
        claimContext: {
            ...candidate.metadata,
            extractedFrom: "visual-ocr",
            extractionConfidence: confidence,
            visualKind: candidate.kind,
        },
        metadata: {
            ...candidate.metadata,
            extractedFrom: "visual-ocr",
            extractionConfidence: confidence,
            visualKind: candidate.kind,
            rawText: text,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}
function buildReceiptDraft(intake, candidate, attachmentId, text, confidence) {
    return {
        receiptId: `receipt_${slugify(candidate.label || candidate.filename || "receipt")}_${randomUUID().slice(0, 8)}`,
        tenantId: intake.goal.tenantId,
        caseId: intake.caseId,
        itemId: undefined,
        vendor: extractVendor(text) || coerceString(candidate.metadata.vendor) || candidate.label || candidate.filename,
        receiptNumber: extractReceiptNumber(text) || coerceString(candidate.metadata.receiptNumber),
        purchaseDate: coerceString(candidate.metadata.purchaseDate) || extractDate(text),
        total: coerceNumber(candidate.metadata.total) || parseMoney(text) || parseMoney(candidate.metadata.amount),
        currency: (coerceString(candidate.metadata.currency) || intake.preferredCurrency || DEFAULT_PROVLY_CURRENCY).toUpperCase(),
        attachmentId,
        notes: text.slice(0, 240),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
            ...candidate.metadata,
            extractedFrom: "visual-ocr",
            extractionConfidence: confidence,
            visualKind: candidate.kind,
            rawText: text,
        },
    };
}
function annotateIntakeWithExtraction(intake, summary) {
    return {
        ...intake,
        claimContext: {
            ...intake.claimContext,
            visualExtraction: summary,
        },
    };
}
function resolveItemName(candidate, text) {
    const firstLine = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .find(Boolean);
    return (coerceString(candidate.metadata.itemName) ||
        coerceString(candidate.metadata.name) ||
        coerceString(candidate.metadata.title) ||
        candidate.label ||
        stripReceiptPhrases(firstLine || text || candidate.filename || "Item"));
}
function stripReceiptPhrases(value) {
    return titleize(value
        .replace(/\b(receipt|invoice|bill|total|subtotal|tax|balance due|amount due)\b/gi, " ")
        .replace(/\s+/g, " ")
        .trim());
}
function extractVendor(text) {
    const firstLine = text.split(/\r?\n/).map((line) => line.trim()).find(Boolean);
    if (!firstLine) {
        return undefined;
    }
    return titleize(firstLine.replace(/\b(receipt|invoice|bill)\b/gi, "").trim()) || undefined;
}
function extractReceiptNumber(text) {
    const match = text.match(/\b(?:receipt|invoice|ref|reference|order)\s*(?:#|no\.?|number)?\s*[:\-]?\s*([A-Z0-9\-]{4,})\b/i);
    return match ? match[1] : undefined;
}
function extractSerialNumber(text) {
    const match = text.match(/\b(?:serial|s\/n|sn|serial number)\s*[:#\-]?\s*([A-Z0-9\-]{4,})\b/i);
    return match ? match[1] : undefined;
}
function extractModel(text) {
    const match = text.match(/\b(?:model|sku|style|part)\s*[:#\-]?\s*([A-Z0-9\-]{3,})\b/i);
    return match ? match[1] : undefined;
}
function extractDate(text) {
    const match = text.match(/\b(20\d{2}-\d{2}-\d{2})\b|\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b|\b([A-Za-z]{3,9}\s+\d{1,2},\s+20\d{2})\b/);
    return match ? match[1] || match[2] || match[3] : undefined;
}
function looksLikeReceipt(candidate, text) {
    const hint = normalizeText(`${candidate.kind} ${candidate.label || ""} ${candidate.filename || ""} ${text}`);
    return candidate.kind === "receipt" || /(receipt|invoice|subtotal|total|tax|balance due|amount due|merchant|store)/.test(hint);
}
function attachmentFingerprint(attachment) {
    return [attachment.url, attachment.filename, attachment.label, attachment.mimeType].filter(Boolean).join("|");
}
function attachmentFingerprintFromValue(value) {
    const record = coerceRecord(value);
    if (!record) {
        return "";
    }
    return attachmentFingerprint({
        url: coerceString(record.url) || coerceString(record.href),
        filename: coerceString(record.filename) || coerceString(record.name),
        label: coerceString(record.label) || coerceString(record.title) || coerceString(record.name),
        mimeType: coerceString(record.mimeType) || coerceString(record.contentType),
    });
}
function mergeUnique(base, additions, getId) {
    const seen = new Set(base.map(getId));
    return [...base, ...additions.filter((item) => !seen.has(getId(item)))];
}
function stringFromMetadata(record, ...keys) {
    for (const key of keys) {
        const value = record[key];
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }
    return undefined;
}
//# sourceMappingURL=extraction.js.map