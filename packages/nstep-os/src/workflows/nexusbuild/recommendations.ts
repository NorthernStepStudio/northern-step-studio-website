import type {
  NexusBuildComparisonSummary,
  NexusBuildCompatibilitySummary,
  NexusBuildIntake,
  NexusBuildRecommendationSummary,
  NexusBuildPricingSnapshot,
} from "../../core/types.js";
import { scoreCpuPart, scoreGpuPart, scoreMemoryPart, scorePowerSupply } from "./catalog.js";
import type { NexusBuildAnalysisBundle } from "./analysis.js";
type AlternatePartSuggestion = NexusBuildRecommendationSummary["alternateParts"][number];

const USE_CASE_RECOMMENDATIONS: Record<
  NexusBuildIntake["useCase"],
  {
    readonly cpu: string[];
    readonly gpu: string[];
    readonly memory: string[];
    readonly motherboard: string[];
    readonly storage: string[];
    readonly psu: string[];
  }
> = {
  gaming: {
    cpu: ["AMD Ryzen 7 7800X3D", "Intel Core i5-14600K"],
    gpu: ["NVIDIA GeForce RTX 4070 Super", "AMD Radeon RX 7800 XT"],
    memory: ["32GB DDR5-6000 CL30 kit"],
    motherboard: ["B650 or B650E board with solid VRM"],
    storage: ["1TB or 2TB PCIe 4.0 NVMe SSD"],
    psu: ["750W 80+ Gold PSU"],
  },
  creator: {
    cpu: ["AMD Ryzen 9 7900", "Intel Core i7-14700K"],
    gpu: ["NVIDIA GeForce RTX 4070 Ti Super", "AMD Radeon RX 7900 XT"],
    memory: ["64GB DDR5 kit"],
    motherboard: ["B650E or Z790 board with strong memory support"],
    storage: ["2TB PCIe 4.0 NVMe SSD"],
    psu: ["850W 80+ Gold PSU"],
  },
  productivity: {
    cpu: ["AMD Ryzen 7 7700", "Intel Core i5-14600K"],
    gpu: ["Integrated graphics or mid-range GPU"],
    memory: ["32GB DDR5 kit"],
    motherboard: ["Reliable B650 or B760 board"],
    storage: ["1TB NVMe SSD"],
    psu: ["650W 80+ Gold PSU"],
  },
  workstation: {
    cpu: ["AMD Ryzen 9 7950X", "Intel Core i9-14900K"],
    gpu: ["Professional or high-end gaming GPU"],
    memory: ["64GB or 128GB DDR5 kit"],
    motherboard: ["Workstation-grade board with robust power delivery"],
    storage: ["2TB or larger NVMe SSD"],
    psu: ["850W to 1000W 80+ Gold PSU"],
  },
  budget: {
    cpu: ["AMD Ryzen 5 7600", "Intel Core i5-14400F"],
    gpu: ["AMD Radeon RX 7700 XT", "NVIDIA GeForce RTX 4060 Ti"],
    memory: ["32GB DDR5 or 16GB if the platform is constrained"],
    motherboard: ["Value B650 or B760 board"],
    storage: ["1TB NVMe SSD"],
    psu: ["650W 80+ Bronze or Gold PSU"],
  },
  general: {
    cpu: ["AMD Ryzen 7 7700", "Intel Core i5-14600K"],
    gpu: ["NVIDIA GeForce RTX 4070 Super", "AMD Radeon RX 7800 XT"],
    memory: ["32GB DDR5 kit"],
    motherboard: ["B650, B650E, or B760 board"],
    storage: ["1TB to 2TB NVMe SSD"],
    psu: ["750W 80+ Gold PSU"],
  },
};

export function buildNexusBuildRecommendation(
  intake: NexusBuildIntake,
  compatibility: NexusBuildCompatibilitySummary,
  analysis: NexusBuildAnalysisBundle,
  comparison?: NexusBuildComparisonSummary,
  pricingSnapshots: readonly NexusBuildPricingSnapshot[] = [],
): NexusBuildRecommendationSummary {
  const alternateParts = buildAlternateParts(intake, compatibility, analysis);
  const upgradePath = buildUpgradePath(intake, compatibility, analysis, comparison);
  const budgetOptimizations = buildBudgetOptimizations(intake, compatibility, analysis);
  const purchaseStrategy = resolvePurchaseStrategy(intake, compatibility, analysis, comparison, pricingSnapshots);

  return {
    title: `${capitalize(intake.useCase)} build guidance`,
    purchaseStrategy,
    upgradePath,
    alternateParts,
    budgetOptimizations,
    premiumGuidance: buildPremiumGuidance(intake, compatibility, analysis, comparison, purchaseStrategy),
  };
}

function buildAlternateParts(
  intake: NexusBuildIntake,
  compatibility: NexusBuildCompatibilitySummary,
  analysis: NexusBuildAnalysisBundle,
): NexusBuildRecommendationSummary["alternateParts"] {
  const suggestions: AlternatePartSuggestion[] = [];
  const cpu = intake.parts.find((part) => part.category === "cpu");
  const gpu = intake.parts.find((part) => part.category === "gpu");
  const memory = intake.parts.find((part) => part.category === "memory");
  const motherboard = intake.parts.find((part) => part.category === "motherboard");
  const psu = intake.parts.find((part) => part.category === "psu");

  const cpuScore = scoreCpuPart(cpu);
  const gpuScore = scoreGpuPart(gpu);
  const memoryScore = scoreMemoryPart(memory);
  const psuScore = scorePowerSupply(psu);

  if (!cpu || cpuScore < 70 || compatibility.issues.some((issue) => issue.category === "socket")) {
    suggestions.push({
      category: "cpu",
      suggestion: pickSuggestion(intake.useCase, "cpu"),
      reason: cpu ? "The current CPU looks like the weakest platform link." : "The build needs a clearer CPU choice.",
    });
  }

  if (!gpu || gpuScore < 70 || (intake.useCase === "gaming" && analysis.performance.estimatedGpuScore < analysis.performance.estimatedCpuScore)) {
    suggestions.push({
      category: "gpu",
      suggestion: pickSuggestion(intake.useCase, "gpu"),
      reason: gpu ? "The GPU is not strong enough for the intended use case." : "The build needs a clearer GPU choice.",
    });
  }

  if (!memory || memoryScore < 60) {
    suggestions.push({
      category: "memory",
      suggestion: pickSuggestion(intake.useCase, "memory"),
      reason: "The memory configuration could be more future-proof.",
    });
  }

  if (!motherboard || compatibility.issues.some((issue) => issue.category === "socket" || issue.category === "memory")) {
    suggestions.push({
      category: "motherboard",
      suggestion: pickSuggestion(intake.useCase, "motherboard"),
      reason: "A different board may improve compatibility and upgrade headroom.",
    });
  }

  if (!psu || psuScore < 70 || compatibility.issues.some((issue) => issue.category === "power")) {
    suggestions.push({
      category: "psu",
      suggestion: pickSuggestion(intake.useCase, "psu"),
      reason: "A stronger PSU would make the build safer and more upgrade-friendly.",
    });
  }

  return dedupeAlternateParts(suggestions);
}

function buildUpgradePath(
  intake: NexusBuildIntake,
  compatibility: NexusBuildCompatibilitySummary,
  analysis: NexusBuildAnalysisBundle,
  comparison?: NexusBuildComparisonSummary,
): string[] {
  const path: string[] = [];

  if (compatibility.status === "fail") {
    path.push("Resolve the reported compatibility blockers before buying anything.");
  }

  if (analysis.performance.bottlenecks.length > 0) {
    for (const bottleneck of analysis.performance.bottlenecks.slice(0, 3)) {
      path.push(bottleneck);
    }
  }

  if (comparison?.winnerBuildId) {
    path.push(`If comparing builds, favor ${comparison.winnerBuildId} unless price changes materially.`);
  }

  if (intake.useCase === "gaming" && analysis.performance.estimatedGpuScore < analysis.performance.estimatedCpuScore) {
    path.push("Upgrade the GPU before adding more CPU budget.");
  }

  if ((intake.useCase === "creator" || intake.useCase === "workstation") && analysis.performance.estimatedCpuScore < analysis.performance.estimatedGpuScore) {
    path.push("Shift budget toward CPU and RAM before chasing a bigger GPU.");
  }

  if (analysis.value.budgetFit < 60) {
    path.push("Trim the motherboard, case, or cooling tier if the budget needs relief.");
  }

  if (path.length === 0) {
    path.push("Keep the current balance, then watch price changes before purchase.");
  }

  return dedupeStrings(path);
}

function buildBudgetOptimizations(
  intake: NexusBuildIntake,
  compatibility: NexusBuildCompatibilitySummary,
  analysis: NexusBuildAnalysisBundle,
): string[] {
  const optimizations: string[] = [];

  if (analysis.value.budgetFit < 70) {
    optimizations.push("Reallocate budget away from motherboard or case aesthetics if the goal is more performance.");
  }
  if (intake.useCase === "gaming" && analysis.performance.estimatedGpuScore < 75) {
    optimizations.push("Spend first on the GPU, then on the CPU, then on extras.");
  }
  if (intake.useCase === "creator" && analysis.performance.estimatedCpuScore < 75) {
    optimizations.push("Prioritize CPU cores and memory capacity before premium storage accessories.");
  }
  if (compatibility.status === "warn") {
    optimizations.push("Use the warnings to avoid spending money on parts that will be replaced later.");
  }
  if (analysis.value.pricePerformanceNotes.length > 0) {
    const note = analysis.value.pricePerformanceNotes[0];
    if (note) {
      optimizations.push(note);
    }
  }
  if (optimizations.length === 0) {
    optimizations.push("The current mix already looks reasonably efficient for the target budget.");
  }

  return dedupeStrings(optimizations);
}

function resolvePurchaseStrategy(
  intake: NexusBuildIntake,
  compatibility: NexusBuildCompatibilitySummary,
  analysis: NexusBuildAnalysisBundle,
  comparison: NexusBuildComparisonSummary | undefined,
  pricingSnapshots: readonly NexusBuildPricingSnapshot[],
): string {
  if (compatibility.status === "fail") {
    return "Fix compatibility blockers before buying.";
  }

  if (comparison?.winnerBuildId) {
    return `Choose ${comparison.winnerBuildId} unless the price gap changes the ranking.`;
  }

  if (intake.livePricingEnabled && pricingSnapshots.length === 0) {
    return "Keep watching live pricing before checkout.";
  }

  if (analysis.value.score >= 80 && compatibility.status === "pass") {
    return "Buy now if the parts are in stock at these prices.";
  }

  if (analysis.value.budgetFit < 60) {
    return "Refine the parts list and re-run the analysis before purchase.";
  }

  return "Proceed, but keep an eye on price movement and compatibility notes.";
}

function buildPremiumGuidance(
  intake: NexusBuildIntake,
  compatibility: NexusBuildCompatibilitySummary,
  analysis: NexusBuildAnalysisBundle,
  comparison: NexusBuildComparisonSummary | undefined,
  purchaseStrategy: string,
): string[] {
  const guidance = [
    `${capitalize(intake.useCase)} fit: ${analysis.performance.expectedOutcome}`,
    `Purchase strategy: ${purchaseStrategy}`,
  ];

  if (compatibility.status === "fail") {
    guidance.push("The build is not purchase-ready until the reported blockers are resolved.");
  } else if (compatibility.status === "warn") {
    guidance.push("The build is usable, but the warnings deserve a careful read before checkout.");
  } else {
    guidance.push("Compatibility is clean enough to move forward confidently.");
  }

  if (comparison?.winnerBuildId) {
    guidance.push(`Comparison winner: ${comparison.winnerBuildId}.`);
  }

  return guidance;
}

function pickSuggestion(useCase: NexusBuildIntake["useCase"], category: keyof (typeof USE_CASE_RECOMMENDATIONS)["general"]): string {
  return USE_CASE_RECOMMENDATIONS[useCase][category][0] || USE_CASE_RECOMMENDATIONS.general[category][0];
}

function dedupeAlternateParts(entries: readonly AlternatePartSuggestion[]): NexusBuildRecommendationSummary["alternateParts"] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = `${entry.category}:${entry.suggestion}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function dedupeStrings(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
