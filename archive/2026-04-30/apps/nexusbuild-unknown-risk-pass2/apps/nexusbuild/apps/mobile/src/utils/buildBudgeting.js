const BUILD_USE_CASE_ALIASES = {
  gaming: "gaming",
  game: "gaming",
  streamer: "streaming",
  stream: "streaming",
  streaming: "streaming",
  workstation: "workstation",
  work: "workstation",
  creator: "workstation",
  productivity: "workstation",
};

export const CANONICAL_BUILD_ALLOCATIONS = Object.freeze({
  gaming: Object.freeze({
    cpu: 0.35,
    gpu: 0.28,
    motherboard: 0.1,
    ram: 0.11,
    storage: 0.08,
    psu: 0.05,
    case: 0.02,
    cooler: 0.01,
  }),
  streaming: Object.freeze({
    cpu: 0.3,
    gpu: 0.28,
    motherboard: 0.09,
    ram: 0.12,
    storage: 0.09,
    psu: 0.05,
    case: 0.04,
    cooler: 0.03,
  }),
  workstation: Object.freeze({
    gpu: 0.36,
    cpu: 0.24,
    motherboard: 0.09,
    ram: 0.13,
    storage: 0.09,
    psu: 0.05,
    case: 0.02,
    cooler: 0.02,
  }),
});

export const BUILD_MODE_SELECTION_ORDER = Object.freeze({
  gaming: Object.freeze([
    "cpu",
    "gpu",
    "motherboard",
    "ram",
    "storage",
    "psu",
    "case",
    "cooler",
  ]),
  streaming: Object.freeze([
    "cpu",
    "gpu",
    "motherboard",
    "ram",
    "storage",
    "psu",
    "case",
    "cooler",
  ]),
  workstation: Object.freeze([
    "gpu",
    "cpu",
    "ram",
    "motherboard",
    "storage",
    "psu",
    "cooler",
    "case",
  ]),
});

export const BUILD_MODE_UPGRADE_PRIORITY = Object.freeze({
  gaming: Object.freeze(["cpu", "gpu", "ram", "storage", "motherboard"]),
  streaming: Object.freeze(["cpu", "gpu", "ram", "storage", "motherboard"]),
  workstation: Object.freeze(["gpu", "cpu", "ram", "storage", "motherboard"]),
});

export const BUILD_CATEGORY_TOLERANCE = Object.freeze({
  gpu: 0.08,
  cpu: 0.08,
  motherboard: 0.12,
  ram: 0.12,
  storage: 0.15,
  psu: 0.15,
  case: 0.2,
  cooler: 0.2,
});

export const normalizeBuildUseCase = (value = "gaming") => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (!normalized) {
    return "gaming";
  }

  if (BUILD_USE_CASE_ALIASES[normalized]) {
    return BUILD_USE_CASE_ALIASES[normalized];
  }

  if (normalized.includes("stream")) {
    return "streaming";
  }

  if (
    normalized.includes("work") ||
    normalized.includes("creator") ||
    normalized.includes("productiv")
  ) {
    return "workstation";
  }

  return "gaming";
};

export const getBudgetAllocationTemplate = (useCase = "gaming") =>
  CANONICAL_BUILD_ALLOCATIONS[normalizeBuildUseCase(useCase)] ||
  CANONICAL_BUILD_ALLOCATIONS.gaming;

export const computeBudgetAllocationAmounts = (budget, useCase = "gaming") => {
  const normalizedBudget = Math.max(Number(budget) || 0, 0);
  const template = getBudgetAllocationTemplate(useCase);

  return Object.entries(template).reduce((acc, [component, ratio]) => {
    acc[component] = Math.round(normalizedBudget * ratio);
    return acc;
  }, {});
};

export const getAllocationTemplateTotal = (useCase = "gaming") =>
  Object.values(getBudgetAllocationTemplate(useCase)).reduce(
    (sum, ratio) => sum + ratio,
    0,
  );
