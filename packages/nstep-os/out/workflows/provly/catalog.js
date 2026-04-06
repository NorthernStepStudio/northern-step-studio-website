export const DEFAULT_PROVLY_CURRENCY = "USD";
export const DEFAULT_PROVLY_HIGH_VALUE_THRESHOLD = 1000;
export const DEFAULT_PROVLY_UNASSIGNED_ROOM = "Unassigned";
const CATEGORY_KEYWORDS = [
    ["electronics", ["tv", "television", "computer", "laptop", "monitor", "camera", "tablet", "phone", "audio", "speaker", "console", "router"]],
    ["furniture", ["sofa", "couch", "chair", "table", "desk", "bed", "dresser", "cabinet", "shelf", "stool", "ottoman"]],
    ["appliance", ["fridge", "refrigerator", "washer", "dryer", "oven", "stove", "microwave", "dishwasher", "freezer", "appliance"]],
    ["jewelry", ["jewelry", "watch", "ring", "necklace", "bracelet", "earring", "diamond", "gold", "silver"]],
    ["art", ["painting", "art", "print", "sculpture", "canvas", "framed", "poster", "collectible art"]],
    ["clothing", ["shirt", "pants", "dress", "coat", "shoes", "jacket", "clothing", "wardrobe", "suit"]],
    ["tools", ["tool", "drill", "saw", "hammer", "wrench", "garage", "workbench"]],
    ["kitchenware", ["plate", "bowl", "cup", "utensil", "cookware", "pan", "pot", "kitchen", "dish"]],
    ["sports", ["bike", "bicycle", "sports", "golf", "tennis", "exercise", "fitness", "ski", "camping"]],
    ["media", ["book", "dvd", "vinyl", "cd", "record", "media", "game", "games", "console"]],
    ["documents", ["document", "paper", "file", "folder", "record", "policy", "receipt", "invoice", "statement"]],
    ["collectibles", ["collectible", "coin", "comic", "toy", "figurine", "vintage", "antique", "memorabilia"]],
    ["decor", ["lamp", "rug", "mirror", "vase", "curtain", "decor", "frame", "lamp"]],
];
const ROOM_KEYWORDS = [
    ["Kitchen", ["kitchen", "pantry"]],
    ["Living Room", ["living room", "lounge", "family room", "den"]],
    ["Bedroom", ["bedroom", "master bedroom", "guest room"]],
    ["Bathroom", ["bathroom", "bath"]],
    ["Garage", ["garage"]],
    ["Basement", ["basement"]],
    ["Attic", ["attic"]],
    ["Office", ["office", "study", "workroom"]],
    ["Dining Room", ["dining room", "dining"]],
    ["Laundry Room", ["laundry", "utility room"]],
    ["Closet", ["closet", "wardrobe"]],
    ["Storage", ["storage", "shed", "shed room"]],
    ["Hallway", ["hallway", "hall"]],
    ["Patio", ["patio", "porch", "deck"]],
    ["Nursery", ["nursery"]],
];
const HIGH_VALUE_CATEGORIES = new Set(["electronics", "jewelry", "art", "collectibles"]);
export function normalizeText(value) {
    return stringifyValue(value)
        .toLowerCase()
        .replace(/[_/\\|,:;()\[\]{}]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
export function stringifyValue(value) {
    if (value === undefined || value === null) {
        return "";
    }
    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
        return String(value);
    }
    if (Array.isArray(value)) {
        return value.map((item) => stringifyValue(item)).filter(Boolean).join(" ");
    }
    if (typeof value === "object") {
        try {
            return JSON.stringify(value);
        }
        catch {
            return Object.prototype.toString.call(value);
        }
    }
    return String(value);
}
export function coerceRecord(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return undefined;
    }
    return value;
}
export function coerceString(value) {
    if (typeof value !== "string") {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
}
export function coerceNumber(value) {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : undefined;
    }
    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value.replace(/[$,]/g, ""));
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
}
export function coerceBoolean(value) {
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
export function dedupeStrings(values) {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
export function slugify(value) {
    return normalizeText(value)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 64) || "item";
}
export function titleize(value) {
    const normalized = normalizeText(value);
    if (!normalized) {
        return "";
    }
    return normalized
        .split(" ")
        .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
        .join(" ");
}
export function buildCategoryId(label) {
    return `category_${slugify(label)}`;
}
export function buildRoomId(label) {
    return `room_${slugify(label)}`;
}
export function inferCategory(text, fallbackCategory) {
    const combined = normalizeText(`${stringifyValue(text)} ${stringifyValue(fallbackCategory)}`);
    for (const [category, keywords] of CATEGORY_KEYWORDS) {
        if (keywords.some((keyword) => combined.includes(keyword))) {
            return category;
        }
    }
    return "other";
}
export function inferRoomLabel(text, fallback) {
    const combined = normalizeText(`${stringifyValue(text)} ${stringifyValue(fallback)}`);
    for (const [room, keywords] of ROOM_KEYWORDS) {
        if (keywords.some((keyword) => combined.includes(keyword))) {
            return room;
        }
    }
    return titleize(fallback || DEFAULT_PROVLY_UNASSIGNED_ROOM) || DEFAULT_PROVLY_UNASSIGNED_ROOM;
}
export function inferCondition(text) {
    const normalized = normalizeText(text);
    if (/(new|unused|sealed|mint)/.test(normalized)) {
        return "new";
    }
    if (/(good|excellent|working|functional)/.test(normalized)) {
        return "good";
    }
    if (/(fair|used|visible wear|light wear)/.test(normalized)) {
        return "fair";
    }
    if (/(poor|broken|damaged|non[- ]?working|as is)/.test(normalized)) {
        return "poor";
    }
    return "unknown";
}
export function inferHighValue(category, estimatedValue, threshold = DEFAULT_PROVLY_HIGH_VALUE_THRESHOLD, text) {
    if (estimatedValue !== undefined && estimatedValue >= threshold) {
        return true;
    }
    if (HIGH_VALUE_CATEGORIES.has(category)) {
        return true;
    }
    const normalized = normalizeText(text);
    return /(jewelry|diamond|gold|antique|vintage|art|camera|watch|designer|luxury|collectible)/.test(normalized);
}
export function inferBrand(text) {
    const normalized = normalizeText(text);
    if (!normalized) {
        return undefined;
    }
    const brandMatchers = [
        [/\b(apple|macbook|imac|mac mini|ipad|iphone)\b/, "Apple"],
        [/\b(samsung)\b/, "Samsung"],
        [/\b(lg)\b/, "LG"],
        [/\b(sony)\b/, "Sony"],
        [/\b(bose)\b/, "Bose"],
        [/\b(dell|alienware)\b/, "Dell"],
        [/\b(hp|hewlett packard)\b/, "HP"],
        [/\b(lenovo)\b/, "Lenovo"],
        [/\b(asus)\b/, "ASUS"],
        [/\b(acer)\b/, "Acer"],
        [/\b(microsoft)\b/, "Microsoft"],
        [/\b(nintendo)\b/, "Nintendo"],
        [/\b(playstation|ps5|ps4)\b/, "PlayStation"],
        [/\b(xbox)\b/, "Xbox"],
        [/\b(whirlpool)\b/, "Whirlpool"],
        [/\b(samsung)\b/, "Samsung"],
        [/\b(general electric|ge)\b/, "GE"],
        [/\b(ikea)\b/, "IKEA"],
        [/\b(costco|kirkland)\b/, "Kirkland"],
    ];
    for (const [pattern, brand] of brandMatchers) {
        if (pattern.test(normalized)) {
            return brand;
        }
    }
    return undefined;
}
export function parseMoney(value) {
    return coerceNumber(value);
}
export function formatMoney(amount, currency = DEFAULT_PROVLY_CURRENCY) {
    if (amount === undefined || !Number.isFinite(amount)) {
        return "n/a";
    }
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
}
//# sourceMappingURL=catalog.js.map