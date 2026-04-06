import { randomUUID } from "node:crypto";
import { DEFAULT_NEXUSBUILD_CURRENCY, coerceNumber, coerceRecord, coerceString, inferBrand, inferCategory, inferUseCase, stringifyValue, } from "./catalog.js";
import { createNexusBuildBuildId } from "./store.js";
const OPERATION_KEYWORDS = [
    ["parts-comparison", /(compare|comparison|vs\.?|versus|rank|rankings)/i],
    ["price-monitoring", /(price watch|price monitoring|watch prices|monitor prices|alert me|track prices)/i],
    ["bottleneck-analysis", /(bottleneck|bottlenecks|constraint|imbalance)/i],
    ["compatibility-review", /(compatibility|compatible|conflict|fit check|motherboard|socket|psu)/i],
    ["build-intake", /(build intake|save this build|saved build|my build intake)/i],
    ["recommendation-report", /(recommend|recommendation|analysis|review|report|pc build|parts list|build me)/i],
];
export function extractNexusBuildIntake(goal) {
    const payload = coerceRecord(goal.payload) || {};
    const raw = extractRawNexusBuildPayload(payload);
    const savedBuildRecord = coerceRecord(raw.savedBuild);
    const buildRecord = coerceRecord(raw.build);
    const targetBuildRecord = coerceRecord(raw.targetBuild);
    const operation = resolveOperation(goal.goal, raw);
    const useCase = resolveUseCase(goal.goal, raw);
    const buildName = resolveBuildName(goal.goal, raw, useCase, operation);
    const buildId = coerceString(raw.buildId) || coerceString(savedBuildRecord?.buildId) || createNexusBuildBuildId();
    const currency = (coerceString(raw.currency) || DEFAULT_NEXUSBUILD_CURRENCY).toUpperCase();
    const budget = coerceNumber(raw.budget);
    const currentParts = normalizePartCollection(raw.parts ??
        raw.components ??
        buildRecord ??
        savedBuildRecord?.parts ??
        savedBuildRecord ??
        targetBuildRecord?.parts ??
        targetBuildRecord ??
        raw.parts, "goal");
    const savedBuildSnapshot = normalizeBuildSnapshot(savedBuildRecord || buildRecord || undefined, {
        buildId,
        tenantId: goal.tenantId,
        name: buildName,
        useCase,
        budget,
        currency,
        parts: currentParts,
        preferred: coerceBoolean(raw.preferred),
        notes: coerceString(raw.notes) || coerceString(raw.summary),
        metadata: coerceRecord(raw.metadata) || {},
    });
    const savedBuilds = normalizeSavedBuilds(raw.savedBuilds, savedBuildSnapshot, goal.tenantId, buildName, useCase, budget, currency, currentParts);
    const comparisonBuilds = normalizeComparisonBuilds(raw.comparisonBuilds, buildId, goal.tenantId);
    const priceSources = normalizePriceSources(raw.priceSources);
    const watchlist = normalizeWatchlist(raw.watchlist);
    const preferences = coerceRecord(raw.preferences) || {};
    const benchmarkContext = coerceRecord(raw.benchmarkContext) || {};
    const livePricingEnabled = resolveLivePricingEnabled(raw.priceMode, priceSources, watchlist);
    return {
        goal,
        buildId,
        operation,
        useCase,
        buildName,
        budget,
        currency,
        parts: currentParts,
        savedBuilds,
        comparisonBuilds: comparisonBuilds.length > 0 ? comparisonBuilds : savedBuilds,
        priceSources,
        watchlist,
        preferences,
        benchmarkContext,
        livePricingEnabled,
    };
}
export function normalizeBuildSnapshot(raw, fallback) {
    const record = coerceRecord(raw) || {};
    const parts = normalizePartCollection(record.parts ?? fallback.parts, "saved");
    return {
        buildId: coerceString(record.buildId) || fallback.buildId,
        tenantId: coerceString(record.tenantId) || fallback.tenantId,
        name: coerceString(record.name) || fallback.name,
        useCase: resolveUseCase(coerceString(record.name) || fallback.name, record),
        budget: coerceNumber(record.budget) ?? fallback.budget,
        currency: (coerceString(record.currency) || fallback.currency).toUpperCase(),
        parts,
        preferred: coerceBoolean(record.preferred) ?? fallback.preferred,
        notes: coerceString(record.notes) || fallback.notes,
        metadata: coerceRecord(record.metadata) || fallback.metadata,
        createdAt: coerceString(record.createdAt) || new Date().toISOString(),
        updatedAt: coerceString(record.updatedAt) || new Date().toISOString(),
    };
}
function extractRawNexusBuildPayload(payload) {
    const envelope = payload;
    return coerceRecord(envelope.nexusbuild) || coerceRecord(envelope.nexusBuild) || payload;
}
function resolveOperation(goalText, raw) {
    const direct = coerceString(raw.operation) || coerceString(raw.workflowType) || coerceString(raw.intent);
    if (direct && isNexusBuildOperation(direct)) {
        return direct;
    }
    const text = `${goalText} ${stringifyValue(raw.parts)} ${stringifyValue(raw.savedBuild)} ${stringifyValue(raw.comparisonBuilds)} ${stringifyValue(raw.priceSources)}`;
    for (const [operation, pattern] of OPERATION_KEYWORDS) {
        if (pattern.test(text)) {
            return operation;
        }
    }
    return "recommendation-report";
}
function resolveUseCase(goalText, raw) {
    const direct = coerceString(raw.useCase);
    if (direct === "gaming" ||
        direct === "productivity" ||
        direct === "creator" ||
        direct === "budget" ||
        direct === "workstation" ||
        direct === "general") {
        return direct;
    }
    return inferUseCase(`${goalText} ${stringifyValue(raw.parts)} ${stringifyValue(raw.savedBuild)} ${stringifyValue(raw.benchmarkContext)}`);
}
function resolveBuildName(goalText, raw, useCase, operation) {
    const direct = coerceString(raw.buildName) || coerceString(raw.name) || coerceString(raw.title);
    if (direct) {
        return direct;
    }
    const goal = goalText.trim();
    if (goal) {
        return goal.length <= 72 ? goal : `${goal.slice(0, 69)}...`;
    }
    return `${useCase} ${operation}`.trim();
}
function normalizeSavedBuilds(raw, currentSnapshot, tenantId, name, useCase, budget, currency, fallbackParts) {
    const items = flattenCollection(raw)
        .map((item, index) => normalizeBuildSnapshot(item, {
        buildId: coerceString(coerceRecord(item)?.buildId) || `${currentSnapshot.buildId}_${index + 1}`,
        tenantId,
        name: coerceString(coerceRecord(item)?.name) || `${name} ${index + 1}`,
        useCase: resolveUseCase(`${name} ${index + 1}`, coerceRecord(item) || {}),
        budget: coerceNumber(coerceRecord(item)?.budget) ?? budget,
        currency,
        parts: normalizePartCollection(coerceRecord(item)?.parts ?? fallbackParts, "saved"),
        preferred: coerceBoolean(coerceRecord(item)?.preferred),
        notes: coerceString(coerceRecord(item)?.notes),
        metadata: coerceRecord(coerceRecord(item)?.metadata) || {},
    }))
        .filter((build, index, list) => list.findIndex((candidate) => candidate.buildId === build.buildId) === index);
    return [currentSnapshot, ...items].filter((build, index, list) => list.findIndex((candidate) => candidate.buildId === build.buildId) === index);
}
function normalizeComparisonBuilds(raw, currentBuildId, tenantId) {
    return flattenCollection(raw)
        .map((item, index) => normalizeBuildSnapshot(item, {
        buildId: coerceString(coerceRecord(item)?.buildId) || `${currentBuildId}_comparison_${index + 1}`,
        tenantId: coerceString(coerceRecord(item)?.tenantId) || tenantId,
        name: coerceString(coerceRecord(item)?.name) || `Comparison ${index + 1}`,
        useCase: resolveUseCase(coerceString(coerceRecord(item)?.name) || `Comparison ${index + 1}`, coerceRecord(item) || {}),
        budget: coerceNumber(coerceRecord(item)?.budget),
        currency: (coerceString(coerceRecord(item)?.currency) || DEFAULT_NEXUSBUILD_CURRENCY).toUpperCase(),
        parts: normalizePartCollection(coerceRecord(item)?.parts, "saved"),
        preferred: coerceBoolean(coerceRecord(item)?.preferred),
        notes: coerceString(coerceRecord(item)?.notes),
        metadata: coerceRecord(coerceRecord(item)?.metadata) || {},
    }))
        .filter((build) => build.buildId !== currentBuildId)
        .filter((build, index, list) => list.findIndex((candidate) => candidate.buildId === build.buildId) === index);
}
function normalizePriceSources(raw) {
    return flattenCollection(raw)
        .map((item) => coerceRecord(item) || {})
        .map((item) => ({
        label: coerceString(item.label) || coerceString(item.name),
        url: coerceString(item.url) || coerceString(item.href) || "",
        kind: coerceString(item.kind) === "retail" ||
            coerceString(item.kind) === "marketplace" ||
            coerceString(item.kind) === "watchlist" ||
            coerceString(item.kind) === "spec" ||
            coerceString(item.kind) === "benchmark" ||
            coerceString(item.kind) === "review"
            ? coerceString(item.kind)
            : undefined,
        priority: coerceNumber(item.priority),
    }))
        .filter((item) => Boolean(item.url));
}
function normalizeWatchlist(raw) {
    return flattenCollection(raw)
        .map((item) => coerceRecord(item) || { label: stringifyValue(item), url: stringifyValue(item) })
        .map((item) => ({
        label: coerceString(item.label) || "Price watch",
        url: coerceString(item.url) || coerceString(item.href) || "",
        targetPrice: coerceNumber(item.targetPrice),
        currency: (coerceString(item.currency) || DEFAULT_NEXUSBUILD_CURRENCY).toUpperCase(),
        notes: coerceString(item.notes),
    }))
        .filter((item) => Boolean(item.url));
}
function resolveLivePricingEnabled(rawMode, priceSources, watchlist) {
    const mode = coerceString(rawMode)?.toLowerCase();
    if (mode === "offline") {
        return false;
    }
    if (mode === "live" || mode === "semi-live") {
        return true;
    }
    return priceSources.length > 0 || watchlist.length > 0;
}
function normalizePartCollection(raw, source) {
    const candidates = flattenPartCandidates(raw);
    return candidates
        .map((candidate, index) => normalizePartCandidate(candidate, source, index))
        .filter((part) => Boolean(part));
}
function normalizePartCandidate(candidate, source, index) {
    if (candidate === undefined || candidate === null) {
        return undefined;
    }
    const record = coerceRecord(candidate) || {};
    const text = stringifyValue(candidate);
    const name = coerceString(record.name) || coerceString(record.title) || coerceString(record.model) || text || `Part ${index + 1}`;
    const category = inferCategory(record.category || record.type || record.component || record.part || record, name);
    const price = coerceNumber(record.price) ?? coerceNumber(record.amount) ?? coerceNumber(record.salePrice) ?? coerceNumber(record.currentPrice) ?? parseCandidatePrice(record.priceText ?? record.priceLabel ?? record.displayPrice ?? record.cost);
    const currency = (coerceString(record.currency) || coerceString(record.currencyCode) || DEFAULT_NEXUSBUILD_CURRENCY).toUpperCase();
    const specs = extractSpecs(record);
    const brand = coerceString(record.brand) || inferBrand(name);
    const model = coerceString(record.model) || coerceString(record.sku) || coerceString(record.partNumber);
    const quantity = Math.max(1, Math.round(coerceNumber(record.quantity) || coerceNumber(record.count) || 1));
    const notes = coerceString(record.notes) || coerceString(record.summary);
    const url = coerceString(record.url) || coerceString(record.href) || coerceString(record.link);
    return {
        partId: coerceString(record.partId) || `${category}_${randomUUID()}`,
        category,
        name,
        brand,
        model,
        quantity,
        price,
        currency,
        url,
        source,
        specs,
        notes,
    };
}
function extractSpecs(record) {
    const specs = {};
    const nested = [record.specs, record.attributes, record.details, record.features, record.metadata, record.hardware];
    for (const value of nested) {
        const nestedRecord = coerceRecord(value);
        if (nestedRecord) {
            Object.assign(specs, nestedRecord);
        }
    }
    const keys = [
        "socket",
        "memoryType",
        "ramType",
        "formFactor",
        "caseSize",
        "wattage",
        "power",
        "capacity",
        "capacityGb",
        "tdp",
        "length",
        "lengthMm",
        "interface",
        "pcie",
        "generation",
        "cores",
        "threads",
        "speed",
        "speedMhz",
        "boostClock",
        "baseClock",
        "chipset",
        "model",
        "series",
        "manufacturer",
        "brand",
    ];
    for (const key of keys) {
        const value = record[key];
        if (value !== undefined && value !== null) {
            specs[key] = value;
        }
    }
    return specs;
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
    if (Array.isArray(record.items)) {
        return record.items.flatMap((item) => flattenCollection(item));
    }
    if (Array.isArray(record.parts)) {
        return record.parts.flatMap((item) => flattenCollection(item));
    }
    if (Array.isArray(record.builds)) {
        return record.builds.flatMap((item) => flattenCollection(item));
    }
    if (Array.isArray(record.values)) {
        return record.values.flatMap((item) => flattenCollection(item));
    }
    return [record];
}
function flattenPartCandidates(raw) {
    if (!raw) {
        return [];
    }
    if (Array.isArray(raw)) {
        return raw.flatMap((item) => flattenPartCandidates(item));
    }
    const record = coerceRecord(raw);
    if (!record) {
        return [raw];
    }
    const nestedCollections = [record.parts, record.components, record.items, record.build, coerceRecord(record.savedBuild)?.parts];
    const collected = [];
    for (const nested of nestedCollections) {
        if (Array.isArray(nested)) {
            collected.push(...nested.flatMap((item) => flattenPartCandidates(item)));
        }
    }
    const categoryKeys = Object.entries(record).filter(([key, value]) => isPartCategoryKey(key) && value && typeof value === "object");
    if (categoryKeys.length > 0) {
        for (const [key, value] of categoryKeys) {
            const nested = flattenPartCandidates(value);
            for (const item of nested) {
                if (coerceRecord(item)) {
                    collected.push({ ...coerceRecord(item), category: coerceString(coerceRecord(item)?.category) || key });
                }
                else {
                    collected.push({ category: key, name: stringifyValue(item) });
                }
            }
        }
    }
    if (collected.length > 0) {
        return collected;
    }
    if (record.category ||
        record.name ||
        record.model ||
        record.brand ||
        record.price ||
        record.specs ||
        record.attributes ||
        record.details) {
        return [record];
    }
    return [raw];
}
function isPartCategoryKey(key) {
    return [
        "cpu",
        "motherboard",
        "gpu",
        "memory",
        "storage",
        "psu",
        "case",
        "cooler",
        "monitor",
        "accessory",
    ].includes(key.toLowerCase());
}
function parseCandidatePrice(value) {
    return typeof value === "string" ? coerceNumber(value) : coerceNumber(value);
}
function coerceBoolean(value) {
    if (typeof value === "boolean") {
        return value;
    }
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["true", "1", "yes", "y"].includes(normalized)) {
            return true;
        }
        if (["false", "0", "no", "n"].includes(normalized)) {
            return false;
        }
    }
    return undefined;
}
function isNexusBuildOperation(value) {
    return [
        "build-intake",
        "compatibility-review",
        "bottleneck-analysis",
        "price-monitoring",
        "recommendation-report",
        "parts-comparison",
    ].includes(value);
}
//# sourceMappingURL=intake.js.map