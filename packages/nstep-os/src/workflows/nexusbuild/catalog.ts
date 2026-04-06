import type {
  NexusBuildBuildSnapshot,
  NexusBuildComponentCategory,
  NexusBuildNormalizedPart,
  NexusBuildUseCase,
} from "../../core/types.js";

export const DEFAULT_NEXUSBUILD_CURRENCY = "USD";

const CATEGORY_KEYWORDS: Array<[NexusBuildComponentCategory, RegExp]> = [
  ["cpu", /(cpu|processor|ryzen|core i[3579]|threadripper|xeon|epyc)/i],
  ["motherboard", /(motherboard|mobo|board|b650|x670|b760|z790|a620|lga1700|am5|am4)/i],
  ["gpu", /(gpu|graphics|rtx|gtx|radeon|rx\s?\d|geforce|arc a\d{3})/i],
  ["memory", /(memory|ram|ddr4|ddr5|dimms?)/i],
  ["storage", /(ssd|hdd|nvme|sata|storage|m.2|m2)/i],
  ["psu", /(psu|power supply|watt|seasonic|corsair rm|evga|super flower)/i],
  ["case", /(case|chassis|tower|enclosure|mini itx|micro atx|mid tower|full tower)/i],
  ["cooler", /(cooler|aio|air cooler|heatsink|liquid cooling|nh-d15|phantom spirit)/i],
  ["monitor", /(monitor|display|screen|panel)/i],
];

const USE_CASE_KEYWORDS: Array<[NexusBuildUseCase, RegExp]> = [
  ["gaming", /(gaming|esports|fps|1440p|4k|high refresh|ultra settings)/i],
  ["creator", /(creator|editing|video|rendering|3d|production|streaming)/i],
  ["productivity", /(productivity|office|multitask|business|workday|everyday)/i],
  ["workstation", /(workstation|cad|simulation|engineering|vm|virtualization|compile)/i],
  ["budget", /(budget|cheap|value|affordable|cost effective|entry level)/i],
];

export function coerceRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}

export function coerceString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function coerceNumber(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/[^0-9.+-]/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\u2019']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function inferUseCase(text: string): NexusBuildUseCase {
  for (const [useCase, pattern] of USE_CASE_KEYWORDS) {
    if (pattern.test(text)) {
      return useCase;
    }
  }

  return "general";
}

export function inferCategory(value: unknown, fallbackText = ""): NexusBuildComponentCategory {
  const text = `${stringifyValue(value)} ${fallbackText}`;
  for (const [category, pattern] of CATEGORY_KEYWORDS) {
    if (pattern.test(text)) {
      return category;
    }
  }

  return "accessory";
}

export function inferBrand(text: string): string | undefined {
  const brands = ["AMD", "Intel", "NVIDIA", "ASUS", "MSI", "Gigabyte", "Corsair", "NZXT", "Seasonic", "be quiet!", "Cooler Master", "Thermaltake", "Samsung", "Crucial", "Western Digital", "Sabrent", "G.Skill", "Kingston", "XPG", "TeamGroup", "ASRock"];
  return brands.find((brand) => new RegExp(`\\b${escapeRegExp(brand)}\\b`, "i").test(text));
}

export function inferSocket(value: Record<string, unknown> | undefined, fallbackText = ""): string | undefined {
  const direct = coerceString(value?.socket) || coerceString(value?.cpuSocket) || coerceString(value?.motherboardSocket);
  if (direct) {
    return direct.toUpperCase();
  }

  const text = `${stringifyValue(value)} ${fallbackText}`.toUpperCase();
  const matches = [
    "AM5",
    "AM4",
    "AM3",
    "AM2",
    "LGA1851",
    "LGA1700",
    "LGA1200",
    "LGA1151",
    "LGA1150",
    "LGA2066",
    "TRX50",
    "STRX4",
    "STR5",
  ];
  return matches.find((socket) => text.includes(socket));
}

export function inferMemoryType(value: Record<string, unknown> | undefined, fallbackText = ""): string | undefined {
  const direct = coerceString(value?.memoryType) || coerceString(value?.memory) || coerceString(value?.ramType);
  if (direct) {
    return direct.toUpperCase();
  }

  const text = `${stringifyValue(value)} ${fallbackText}`.toUpperCase();
  if (text.includes("DDR5")) {
    return "DDR5";
  }
  if (text.includes("DDR4")) {
    return "DDR4";
  }
  if (text.includes("DDR3")) {
    return "DDR3";
  }
  return undefined;
}

export function inferFormFactor(value: Record<string, unknown> | undefined, fallbackText = ""): string | undefined {
  const direct = coerceString(value?.formFactor) || coerceString(value?.size) || coerceString(value?.caseSize);
  if (direct) {
    return direct.toUpperCase();
  }

  const text = `${stringifyValue(value)} ${fallbackText}`.toUpperCase();
  const matches = ["E-ATX", "ATX", "M-ATX", "MICRO-ATX", "MATX", "ITX", "MINI-ITX", "SFX", "SFX-L"];
  return matches.find((item) => text.includes(item));
}

export function inferPsuWattage(value: Record<string, unknown> | undefined, fallbackText = ""): number | undefined {
  const direct = coerceNumber(value?.wattage) || coerceNumber(value?.power) || coerceNumber(value?.capacity);
  if (direct) {
    return direct;
  }

  const text = `${stringifyValue(value)} ${fallbackText}`;
  const match = text.match(/(\d{3,4})\s*w/i);
  return match ? Number(match[1]) : undefined;
}

export function inferMemoryCapacityGb(value: Record<string, unknown> | undefined, fallbackText = ""): number | undefined {
  const direct = coerceNumber(value?.capacityGb) || coerceNumber(value?.capacity);
  if (direct) {
    return direct;
  }

  const text = `${stringifyValue(value)} ${fallbackText}`;
  const match = text.match(/(\d{1,3})\s*gb/i);
  return match ? Number(match[1]) : undefined;
}

export function inferStorageCapacityGb(value: Record<string, unknown> | undefined, fallbackText = ""): number | undefined {
  return inferMemoryCapacityGb(value, fallbackText);
}

export function inferGpuLengthMm(value: Record<string, unknown> | undefined, fallbackText = ""): number | undefined {
  const direct = coerceNumber(value?.lengthMm) || coerceNumber(value?.length);
  if (direct) {
    return direct;
  }

  const text = `${stringifyValue(value)} ${fallbackText}`;
  const match = text.match(/(\d{2,3})\s*mm/i);
  return match ? Number(match[1]) : undefined;
}

export function inferCpuTdp(value: Record<string, unknown> | undefined, fallbackText = ""): number | undefined {
  const direct = coerceNumber(value?.tdp) || coerceNumber(value?.powerDraw);
  if (direct) {
    return direct;
  }

  const text = `${stringifyValue(value)} ${fallbackText}`;
  const match = text.match(/(\d{2,3})\s*w/i);
  return match ? Number(match[1]) : undefined;
}

export function parsePrice(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const match = value.match(/(?:[$€£]\s*)?(\d[\d,]*(?:\.\d{1,2})?)/);
  if (!match) {
    return undefined;
  }

  const parsed = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function buildPriceText(parts: readonly NexusBuildNormalizedPart[]): string {
  return parts
    .map((part) => `${part.name} ${part.brand || ""} ${part.model || ""} ${stringifyValue(part.specs)}`)
    .join(" ");
}

export function scoreCpuPart(part: NexusBuildNormalizedPart | undefined): number {
  if (!part) {
    return 0;
  }

  const text = normalizeText(`${part.name} ${part.brand || ""} ${part.model || ""}`);
  let score = 20;

  if (text.includes("threadripper") || text.includes("xeon") || text.includes("epyc")) {
    score = 92;
  } else if (text.includes("ryzen 9") || text.includes("core i9") || text.includes("ultra 9")) {
    score = 90;
  } else if (text.includes("ryzen 7") || text.includes("core i7") || text.includes("ultra 7")) {
    score = 78;
  } else if (text.includes("ryzen 5") || text.includes("core i5") || text.includes("ultra 5")) {
    score = 64;
  } else if (text.includes("ryzen 3") || text.includes("core i3")) {
    score = 48;
  }

  if (text.includes("x3d")) {
    score += 8;
  }
  if (text.includes("k ") || text.endsWith(" k") || text.includes("kf")) {
    score += 4;
  }

  return clampScore(score);
}

export function scoreGpuPart(part: NexusBuildNormalizedPart | undefined): number {
  if (!part) {
    return 0;
  }

  const text = normalizeText(`${part.name} ${part.brand || ""} ${part.model || ""}`);
  let score = 18;

  if (text.includes("rtx 4090") || text.includes("rx 7900 xtx")) {
    score = 98;
  } else if (text.includes("rtx 4080") || text.includes("rx 7900 xt")) {
    score = 92;
  } else if (text.includes("rtx 4070") || text.includes("rx 7800 xt")) {
    score = 82;
  } else if (text.includes("rtx 4060") || text.includes("rx 7700 xt")) {
    score = 68;
  } else if (text.includes("rtx 3060") || text.includes("rx 6700 xt")) {
    score = 58;
  } else if (text.includes("rtx 3050") || text.includes("rx 6600")) {
    score = 48;
  }

  if (text.includes("ti")) {
    score += 3;
  }
  if (text.includes("super")) {
    score += 4;
  }

  return clampScore(score);
}

export function scoreMemoryPart(part: NexusBuildNormalizedPart | undefined): number {
  if (!part) {
    return 0;
  }

  const text = normalizeText(`${part.name} ${part.brand || ""} ${part.model || ""} ${stringifyValue(part.specs)}`);
  let score = 25;

  const capacity = inferMemoryCapacityGb(part.specs, text) || inferMemoryCapacityGb(undefined, text);
  if (capacity && capacity >= 64) {
    score = 95;
  } else if (capacity && capacity >= 32) {
    score = 82;
  } else if (capacity && capacity >= 16) {
    score = 68;
  } else if (capacity && capacity >= 8) {
    score = 48;
  }

  if (text.includes("ddr5")) {
    score += 8;
  } else if (text.includes("ddr4")) {
    score += 4;
  }
  if (text.includes("cl30") || text.includes("cl32")) {
    score += 4;
  }

  return clampScore(score);
}

export function scoreStoragePart(part: NexusBuildNormalizedPart | undefined): number {
  if (!part) {
    return 0;
  }

  const text = normalizeText(`${part.name} ${part.brand || ""} ${part.model || ""} ${stringifyValue(part.specs)}`);
  let score = 20;
  if (text.includes("gen4") || text.includes("pci") || text.includes("nvme")) {
    score = 78;
  } else if (text.includes("ssd")) {
    score = 58;
  } else if (text.includes("hdd")) {
    score = 35;
  }

  const capacity = inferStorageCapacityGb(part.specs, text);
  if (capacity && capacity >= 2000) {
    score += 12;
  } else if (capacity && capacity >= 1000) {
    score += 6;
  }

  return clampScore(score);
}

export function scorePowerSupply(part: NexusBuildNormalizedPart | undefined): number {
  if (!part) {
    return 0;
  }

  const wattage = inferPsuWattage(part.specs, `${part.name} ${part.model || ""}`) || inferPsuWattage(undefined, `${part.name} ${part.model || ""}`);
  if (!wattage) {
    return 36;
  }

  if (wattage >= 1000) {
    return 96;
  }
  if (wattage >= 850) {
    return 88;
  }
  if (wattage >= 750) {
    return 78;
  }
  if (wattage >= 650) {
    return 64;
  }
  return 48;
}

export function estimatePowerDraw(parts: readonly NexusBuildNormalizedPart[]): number {
  const cpu = parts.find((part) => part.category === "cpu");
  const gpu = parts.find((part) => part.category === "gpu");
  const memory = parts.filter((part) => part.category === "memory");
  const storage = parts.filter((part) => part.category === "storage");
  const motherboard = parts.find((part) => part.category === "motherboard");
  const cooler = parts.find((part) => part.category === "cooler");
  const psu = parts.find((part) => part.category === "psu");

  const cpuTdp = inferCpuTdp(cpu?.specs, `${cpu?.name || ""} ${cpu?.model || ""}`) || inferCpuTdp(undefined, `${cpu?.name || ""} ${cpu?.model || ""}`) || (cpu ? 125 : 0);
  const gpuTdp = inferCpuTdp(gpu?.specs, `${gpu?.name || ""} ${gpu?.model || ""}`) || inferCpuTdp(undefined, `${gpu?.name || ""} ${gpu?.model || ""}`) || (gpu ? 200 : 0);
  const memoryDraw = memory.length * 8;
  const storageDraw = storage.length * 6;
  const motherboardDraw = motherboard ? 45 : 0;
  const coolerDraw = cooler ? 8 : cpu ? 5 : 0;
  const psuOverhead = psu ? 0 : 0;

  return Math.round(cpuTdp + gpuTdp + memoryDraw + storageDraw + motherboardDraw + coolerDraw + psuOverhead);
}

export function inferPsuMargin(wattage: number | undefined, estimatedDraw: number): number | undefined {
  if (!wattage || wattage <= 0) {
    return undefined;
  }

  return Math.round(((wattage - estimatedDraw) / wattage) * 100);
}

export function getBuildPrice(parts: readonly NexusBuildNormalizedPart[]): number | undefined {
  const pricedParts = parts.filter((part) => typeof part.price === "number" && Number.isFinite(part.price));
  if (pricedParts.length === 0) {
    return undefined;
  }

  return pricedParts.reduce((total, part) => total + (part.price || 0) * Math.max(1, part.quantity || 1), 0);
}

export function buildNormalizedBuildLabel(snapshot: NexusBuildBuildSnapshot): string {
  return `${snapshot.name} (${snapshot.useCase})`;
}

export function stringifyValue(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function extractTextFromPart(part: Pick<NexusBuildNormalizedPart, "name" | "brand" | "model" | "specs" | "notes">): string {
  return [part.name, part.brand, part.model, stringifyValue(part.specs), part.notes || ""].filter(Boolean).join(" ");
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
