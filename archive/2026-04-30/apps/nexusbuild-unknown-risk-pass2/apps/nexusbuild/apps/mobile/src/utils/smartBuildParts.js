const SMART_BUILD_CATEGORY_ALIASES = {
  cpu: "cpu",
  processor: "cpu",
  gpu: "gpu",
  "graphics card": "gpu",
  "graphics-card": "gpu",
  "video card": "gpu",
  "video-card": "gpu",
  motherboard: "motherboard",
  mobo: "motherboard",
  ram: "ram",
  memory: "ram",
  storage: "storage",
  ssd: "storage",
  hdd: "storage",
  nvme: "storage",
  psu: "psu",
  "power supply": "psu",
  "power-supply": "psu",
  case: "case",
  cooler: "cooler",
  "cpu cooler": "cooler",
  "cpu-cooler": "cooler",
};

export const normalizeSmartBuildCategory = (value) => {
  const normalized = String(value ?? "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .trim();

  return SMART_BUILD_CATEGORY_ALIASES[normalized] || null;
};

export const normalizeSmartBuildParts = (response) => {
  if (
    Array.isArray(response?.recommendations) &&
    response.recommendations.length > 0
  ) {
    return response.recommendations;
  }

  if (Array.isArray(response?.build?.parts) && response.build.parts.length > 0) {
    return response.build.parts;
  }

  if (response?.build?.parts && typeof response.build.parts === "object") {
    return Object.entries(response.build.parts)
      .map(([categoryKey, part]) => {
        if (!part || typeof part !== "object") {
          return null;
        }

        return {
          ...part,
          category: part.category || categoryKey,
        };
      })
      .filter(Boolean);
  }

  return [];
};

export const normalizeSmartBuildPart = (part, index = 0) => {
  const category = normalizeSmartBuildCategory(part?.category);
  const name = String(part?.name || part?.title || "").trim();

  if (!category || !name) {
    return null;
  }

  return {
    ...part,
    id: part.id || `option-${index}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    category,
    name,
    price: Number(part.price ?? part.salePrice ?? 0) || 0,
    score: Number(part.score) || 0,
    specs: part.specs || {},
    source: part.source || "AI",
  };
};