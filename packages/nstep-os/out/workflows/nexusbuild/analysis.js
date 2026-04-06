import { getBuildPrice, inferMemoryCapacityGb, scoreCpuPart, scoreGpuPart, scoreMemoryPart, scorePowerSupply, scoreStoragePart, stringifyValue, } from "./catalog.js";
import { reviewNexusBuildCompatibility } from "./compatibility.js";
export function analyzeNexusBuild(intake, compatibility, pricingSnapshots = []) {
    const parts = intake.parts;
    const cpu = partByCategory(parts, "cpu");
    const gpu = partByCategory(parts, "gpu");
    const memory = partByCategory(parts, "memory");
    const psu = partByCategory(parts, "psu");
    const storageParts = parts.filter((part) => part.category === "storage");
    const memoryCapacity = inferMemoryCapacityGb(memory?.specs, `${memory?.name || ""} ${memory?.model || ""}`);
    const cpuScore = scoreCpuPart(cpu);
    const gpuScore = scoreGpuPart(gpu);
    const memoryScore = scoreMemoryPart(memory);
    const storageScore = averageScore(storageParts.map((part) => scoreStoragePart(part)));
    const psuScore = scorePowerSupply(psu);
    const useCaseWeights = resolveWeights(intake.useCase);
    const performanceScore = clampScore(cpuScore * useCaseWeights.cpu +
        gpuScore * useCaseWeights.gpu +
        memoryScore * useCaseWeights.memory +
        storageScore * useCaseWeights.storage +
        psuScore * useCaseWeights.platform +
        compatibility.score * useCaseWeights.compatibility);
    const useCaseFit = clampScore(performanceScore * 0.55 +
        compatibility.score * 0.15 +
        scoreUseCaseAlignment(intake.useCase, cpuScore, gpuScore, memoryScore, memoryCapacity) * 0.3);
    const estimatedBuildScore = clampScore(performanceScore * 0.65 + compatibility.score * 0.35);
    const bottlenecks = buildBottlenecks(intake, cpuScore, gpuScore, memoryScore, memoryCapacity, compatibility, storageParts.length);
    const strengths = buildStrengths(intake, cpuScore, gpuScore, memoryScore, storageScore, psuScore, compatibility);
    const expectedOutcome = buildExpectedOutcome(intake, performanceScore, useCaseFit, compatibility.score, bottlenecks);
    const performance = {
        score: performanceScore,
        useCaseFit,
        expectedOutcome,
        bottlenecks,
        strengths,
        estimatedCpuScore: cpuScore,
        estimatedGpuScore: gpuScore,
        estimatedBuildScore,
    };
    const estimatedBuildCost = estimateBuildCost(parts, pricingSnapshots);
    const budgetFit = estimateBudgetFit(intake.budget, estimatedBuildCost);
    const valueNotes = buildValueNotes(intake, estimatedBuildCost, budgetFit, performanceScore, compatibility, pricingSnapshots);
    const pricePerformanceNotes = buildPricePerformanceNotes(intake, parts, estimatedBuildCost, performanceScore, compatibility, pricingSnapshots);
    const valueScore = clampScore(performanceScore * 0.55 + budgetFit * 0.45);
    const value = {
        score: valueScore,
        estimatedBuildCost,
        budgetFit,
        valueNotes,
        pricePerformanceNotes,
    };
    return {
        performance,
        value,
        warnings: [...compatibility.issues.filter((issue) => issue.severity !== "info").map((issue) => issue.message), ...bottlenecks],
    };
}
export function compareNexusBuilds(builds, baseUseCase) {
    const matrix = builds.map((build) => {
        const compatibility = reviewNexusBuildCompatibility({
            goal: {
                goal: build.name,
                product: "nexusbuild",
                priority: "medium",
                constraints: [],
                mode: "assist",
                tenantId: build.tenantId,
                source: "system",
            },
            buildId: build.buildId,
            operation: "parts-comparison",
            useCase: build.useCase || baseUseCase,
            buildName: build.name,
            budget: build.budget,
            currency: build.currency,
            parts: build.parts,
            savedBuilds: [build],
            comparisonBuilds: [build],
            priceSources: [],
            watchlist: [],
            preferences: {},
            benchmarkContext: {},
            livePricingEnabled: false,
        });
        const analysis = analyzeComparisonSnapshot(build, baseUseCase, compatibility);
        return {
            buildId: build.buildId,
            score: analysis.score,
            summary: analysis.summary,
        };
    });
    const winner = [...matrix].sort((left, right) => right.score - left.score)[0];
    const second = [...matrix].sort((left, right) => right.score - left.score)[1];
    const notes = [];
    if (winner) {
        notes.push(`Top build is ${winner.buildId} with a score of ${winner.score}.`);
    }
    if (second) {
        notes.push(`Runner-up is ${second.buildId} at ${second.score}.`);
    }
    if (winner && second) {
        const delta = winner.score - second.score;
        notes.push(delta >= 10 ? "The winner has a clear lead." : "The builds are close enough that price and preference matter.");
    }
    return {
        comparedBuildIds: builds.map((build) => build.buildId),
        winnerBuildId: winner?.buildId,
        notes,
        matrix,
    };
}
function analyzeComparisonSnapshot(build, useCase, compatibility) {
    const cpu = partByCategory(build.parts, "cpu");
    const gpu = partByCategory(build.parts, "gpu");
    const memory = partByCategory(build.parts, "memory");
    const storageParts = build.parts.filter((part) => part.category === "storage");
    const psu = partByCategory(build.parts, "psu");
    const cpuScore = scoreCpuPart(cpu);
    const gpuScore = scoreGpuPart(gpu);
    const memoryScore = scoreMemoryPart(memory);
    const storageScore = averageScore(storageParts.map((part) => scoreStoragePart(part)));
    const psuScore = scorePowerSupply(psu);
    const performanceScore = clampScore(cpuScore * useCaseWeight(useCase, "cpu") +
        gpuScore * useCaseWeight(useCase, "gpu") +
        memoryScore * useCaseWeight(useCase, "memory") +
        storageScore * useCaseWeight(useCase, "storage") +
        psuScore * useCaseWeight(useCase, "platform") +
        compatibility.score * useCaseWeight(useCase, "compatibility"));
    const estimatedCost = getBuildPrice(build.parts) ?? 0;
    const budgetFit = estimateBudgetFit(build.budget, estimatedCost || undefined);
    const valueScore = clampScore(performanceScore * 0.55 + budgetFit * 0.45);
    const score = clampScore(performanceScore * 0.5 + valueScore * 0.3 + compatibility.score * 0.2);
    return {
        score,
        summary: `${build.name} scores ${score} with ${performanceScore} performance, ${valueScore} value, and ${compatibility.score} compatibility.`,
    };
}
function buildValueNotes(intake, estimatedBuildCost, budgetFit, performanceScore, compatibility, pricingSnapshots) {
    const notes = [];
    if (estimatedBuildCost !== undefined) {
        if (intake.budget !== undefined && estimatedBuildCost > intake.budget) {
            notes.push(`Estimated cost of ${formatMoney(estimatedBuildCost, intake.currency)} is above the target budget.`);
        }
        else if (intake.budget !== undefined) {
            notes.push(`Estimated cost of ${formatMoney(estimatedBuildCost, intake.currency)} fits inside the budget.`);
        }
        else {
            notes.push(`Estimated build cost is ${formatMoney(estimatedBuildCost, intake.currency)}.`);
        }
    }
    else if (pricingSnapshots.length > 0) {
        notes.push(`Pricing snapshots were collected for ${pricingSnapshots.length} source(s), but the build cost is incomplete.`);
    }
    else {
        notes.push("Price data is limited, so value is estimated from the part list alone.");
    }
    if (budgetFit >= 85) {
        notes.push("Budget fit looks healthy.");
    }
    else if (budgetFit < 50) {
        notes.push("The build appears poorly aligned with the target budget.");
    }
    if (compatibility.status === "fail") {
        notes.push("Compatibility issues lower the practical value of the build.");
    }
    else if (compatibility.status === "warn") {
        notes.push("A few warnings reduce confidence in the final value judgment.");
    }
    if (performanceScore >= 80 && estimatedBuildCost !== undefined) {
        notes.push("Performance is strong enough to justify premium pricing if the build matches the user goal.");
    }
    return notes;
}
function buildPricePerformanceNotes(intake, parts, estimatedBuildCost, performanceScore, compatibility, pricingSnapshots) {
    const notes = [];
    const cpu = partByCategory(parts, "cpu");
    const gpu = partByCategory(parts, "gpu");
    const motherboard = partByCategory(parts, "motherboard");
    const casePart = partByCategory(parts, "case");
    const psu = partByCategory(parts, "psu");
    const totalKnownCost = estimatedBuildCost ?? 0;
    const gpuPriceShare = priceShare(parts, "gpu", totalKnownCost);
    const motherboardPriceShare = priceShare(parts, "motherboard", totalKnownCost);
    if (cpu && gpu && intake.useCase === "gaming" && gpuPriceShare < 0.35) {
        notes.push("Gaming performance may be underfunded relative to the rest of the build.");
    }
    if (motherboard && motherboardPriceShare > 0.22 && intake.useCase === "gaming") {
        notes.push("The motherboard share looks high for a gaming-focused budget.");
    }
    if (casePart && totalKnownCost > 0 && shareOfPart(parts, casePart.partId, totalKnownCost) > 0.15) {
        notes.push("Case spend is relatively high; that budget could be redirected toward GPU or CPU.");
    }
    if (psu && totalKnownCost > 0 && shareOfPart(parts, psu.partId, totalKnownCost) > 0.15) {
        notes.push("PSU spend is larger than average; confirm that the wattage and quality are actually needed.");
    }
    if (pricingSnapshots.length > 0) {
        notes.push(`Live pricing checks covered ${pricingSnapshots.length} source(s).`);
    }
    if (performanceScore >= 85 && compatibility.status !== "fail") {
        notes.push("The build is likely to deliver premium results without obvious waste.");
    }
    if (compatibility.status === "fail") {
        notes.push("Compatibility failures can erase the value advantage of an otherwise strong component mix.");
    }
    return notes;
}
function estimateBuildCost(parts, pricingSnapshots) {
    const buildCost = getBuildPrice(parts);
    if (buildCost !== undefined) {
        return buildCost;
    }
    const snapshotCost = pricingSnapshots
        .map((snapshot) => snapshot.price)
        .filter((price) => typeof price === "number" && Number.isFinite(price))
        .reduce((total, price) => total + price, 0);
    return snapshotCost > 0 ? snapshotCost : undefined;
}
function estimateBudgetFit(budget, cost) {
    if (budget === undefined) {
        return cost === undefined ? 70 : 78;
    }
    if (cost === undefined) {
        return 68;
    }
    if (cost <= budget) {
        const savingsRatio = (budget - cost) / Math.max(1, budget);
        return clampScore(82 + savingsRatio * 18);
    }
    const overageRatio = (cost - budget) / Math.max(1, budget);
    return clampScore(100 - overageRatio * 100);
}
function buildBottlenecks(intake, cpuScore, gpuScore, memoryScore, memoryCapacity, compatibility, storageCount) {
    const bottlenecks = [];
    if ((intake.useCase === "gaming" || intake.useCase === "creator") && cpuScore > gpuScore + 18) {
        bottlenecks.push("GPU is the likely limiter for gaming or creator workloads.");
    }
    if ((intake.useCase === "productivity" || intake.useCase === "workstation") && gpuScore > cpuScore + 18) {
        bottlenecks.push("CPU may be the practical bottleneck for CPU-heavy work.");
    }
    if (memoryCapacity !== undefined && memoryCapacity < 16 && (intake.useCase === "gaming" || intake.useCase === "creator")) {
        bottlenecks.push("Memory capacity is low for modern workloads.");
    }
    if (memoryScore < 50 && intake.useCase !== "budget") {
        bottlenecks.push("The RAM kit looks modest compared with the rest of the build.");
    }
    if (storageCount === 0) {
        bottlenecks.push("No primary storage was provided.");
    }
    if (compatibility.status === "fail") {
        bottlenecks.push("Compatibility problems will block the build before performance matters.");
    }
    return [...new Set(bottlenecks)];
}
function buildStrengths(intake, cpuScore, gpuScore, memoryScore, storageScore, psuScore, compatibility) {
    const strengths = [];
    if (cpuScore >= 80) {
        strengths.push("Strong CPU headroom.");
    }
    if (gpuScore >= 80) {
        strengths.push("Strong GPU headroom.");
    }
    if (memoryScore >= 70) {
        strengths.push("RAM capacity and speed look healthy.");
    }
    if (storageScore >= 70) {
        strengths.push("Storage looks modern enough for responsive use.");
    }
    if (psuScore >= 78) {
        strengths.push("Power delivery headroom looks comfortable.");
    }
    if (compatibility.status === "pass") {
        strengths.push("Compatibility review passed cleanly.");
    }
    if (intake.livePricingEnabled) {
        strengths.push("The workflow can validate pricing live or semi-live.");
    }
    return [...new Set(strengths)];
}
function buildExpectedOutcome(intake, performanceScore, useCaseFit, compatibilityScore, bottlenecks) {
    if (compatibilityScore < 60) {
        return "The build needs compatibility fixes before it is purchase-ready.";
    }
    if (performanceScore >= 85 && useCaseFit >= 80) {
        return `This build should feel premium for ${intake.useCase} work.`;
    }
    if (performanceScore >= 70 && useCaseFit >= 65) {
        return `This is a balanced ${intake.useCase} build with acceptable headroom.`;
    }
    if (bottlenecks.length > 0) {
        return `This build is workable, but ${bottlenecks[0].toLowerCase()}`;
    }
    return "This build is functional, but it likely leaves performance or value on the table.";
}
function scoreUseCaseAlignment(useCase, cpuScore, gpuScore, memoryScore, memoryCapacity) {
    switch (useCase) {
        case "gaming":
            return clampScore(gpuScore * 0.55 + cpuScore * 0.25 + memoryScore * 0.2);
        case "creator":
            return clampScore(cpuScore * 0.35 + gpuScore * 0.3 + memoryScore * 0.25 + (memoryCapacity || 0) * 0.1);
        case "productivity":
            return clampScore(cpuScore * 0.4 + memoryScore * 0.3 + gpuScore * 0.15 + (memoryCapacity || 0) * 0.15);
        case "workstation":
            return clampScore(cpuScore * 0.35 + memoryScore * 0.35 + gpuScore * 0.15 + (memoryCapacity || 0) * 0.15);
        case "budget":
            return clampScore((cpuScore + gpuScore + memoryScore) / 3);
        default:
            return clampScore((cpuScore + gpuScore + memoryScore) / 3);
    }
}
function resolveWeights(useCase) {
    switch (useCase) {
        case "gaming":
            return { cpu: 0.28, gpu: 0.36, memory: 0.12, storage: 0.06, platform: 0.08, compatibility: 0.1 };
        case "creator":
            return { cpu: 0.3, gpu: 0.28, memory: 0.16, storage: 0.08, platform: 0.08, compatibility: 0.1 };
        case "productivity":
            return { cpu: 0.34, gpu: 0.16, memory: 0.18, storage: 0.1, platform: 0.12, compatibility: 0.1 };
        case "workstation":
            return { cpu: 0.32, gpu: 0.18, memory: 0.2, storage: 0.08, platform: 0.12, compatibility: 0.1 };
        case "budget":
            return { cpu: 0.26, gpu: 0.28, memory: 0.18, storage: 0.08, platform: 0.1, compatibility: 0.1 };
        default:
            return { cpu: 0.28, gpu: 0.28, memory: 0.16, storage: 0.1, platform: 0.08, compatibility: 0.1 };
    }
}
function useCaseWeight(useCase, key) {
    return resolveWeights(useCase)[key];
}
function partByCategory(parts, category) {
    return parts.find((part) => part.category === category);
}
function priceShare(parts, category, totalCost) {
    if (totalCost <= 0) {
        return 0;
    }
    const categoryCost = parts
        .filter((part) => part.category === category && typeof part.price === "number" && Number.isFinite(part.price))
        .reduce((total, part) => total + (part.price || 0) * Math.max(1, part.quantity || 1), 0);
    return categoryCost / totalCost;
}
function shareOfPart(parts, partId, totalCost) {
    if (totalCost <= 0) {
        return 0;
    }
    const part = parts.find((item) => item.partId === partId);
    if (!part || typeof part.price !== "number" || !Number.isFinite(part.price)) {
        return 0;
    }
    return (part.price * Math.max(1, part.quantity || 1)) / totalCost;
}
function averageScore(values) {
    if (values.length === 0) {
        return 0;
    }
    return values.reduce((total, value) => total + value, 0) / values.length;
}
function clampScore(value) {
    return Math.max(0, Math.min(100, Math.round(value)));
}
function formatMoney(amount, currency) {
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(amount);
    }
    catch {
        return `${currency} ${Math.round(amount)}`;
    }
}
function normalizePartsText(parts) {
    return parts.map((part) => `${part.name} ${part.brand || ""} ${part.model || ""} ${stringifyValue(part.specs)}`).join(" ");
}
export function summarizeWorkflowWarnings(intake, compatibility, analysis, comparison, pricingSnapshots = [], watchlist = []) {
    const warnings = new Set(analysis.warnings);
    for (const issue of compatibility.issues) {
        warnings.add(issue.message);
    }
    if (comparison?.notes.length) {
        for (const note of comparison.notes) {
            warnings.add(note);
        }
    }
    if (pricingSnapshots.length === 0 && intake.livePricingEnabled) {
        warnings.add("Live pricing was enabled, but no snapshots were captured.");
    }
    if (watchlist.length > 0 && comparison?.winnerBuildId) {
        warnings.add(`Watchlist is active for ${watchlist.length} source(s); the chosen build is ${comparison.winnerBuildId}.`);
    }
    return [...warnings];
}
//# sourceMappingURL=analysis.js.map