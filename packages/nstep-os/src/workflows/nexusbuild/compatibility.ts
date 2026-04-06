import type {
  NexusBuildCompatibilityIssue,
  NexusBuildCompatibilitySummary,
  NexusBuildIntake,
  NexusBuildNormalizedPart,
} from "../../core/types.js";
import {
  estimatePowerDraw,
  inferFormFactor,
  inferGpuLengthMm,
  inferMemoryType,
  inferPsuWattage,
  inferSocket,
  normalizeText,
  scoreCpuPart,
  scoreGpuPart,
  stringifyValue,
} from "./catalog.js";

const ISSUE_PENALTIES: Record<NexusBuildCompatibilityIssue["severity"], number> = {
  info: 4,
  warning: 12,
  error: 25,
};

export function reviewNexusBuildCompatibility(intake: NexusBuildIntake): NexusBuildCompatibilitySummary {
  const parts = intake.parts;
  const issues: NexusBuildCompatibilityIssue[] = [];
  const passes: string[] = [];
  const unknowns: string[] = [];

  const cpu = partByCategory(parts, "cpu");
  const motherboard = partByCategory(parts, "motherboard");
  const memory = partByCategory(parts, "memory");
  const gpu = partByCategory(parts, "gpu");
  const psu = partByCategory(parts, "psu");
  const casePart = partByCategory(parts, "case");
  const cooler = partByCategory(parts, "cooler");
  const storage = parts.filter((part) => part.category === "storage");

  const cpuSocket = inferSocket(cpu?.specs, cpu ? `${cpu.name} ${cpu.model || ""}` : "");
  const motherboardSocket = inferSocket(motherboard?.specs, motherboard ? `${motherboard.name} ${motherboard.model || ""}` : "");
  if (cpu && motherboard && cpuSocket && motherboardSocket) {
    if (cpuSocket === motherboardSocket) {
      passes.push(`CPU socket matches motherboard (${cpuSocket}).`);
    } else {
      issues.push({
        severity: "error",
        category: "socket",
        message: `CPU socket ${cpuSocket} does not match motherboard socket ${motherboardSocket}.`,
        affectedPartIds: [cpu.partId, motherboard.partId],
        resolution: `Use a motherboard with ${cpuSocket} support or choose a CPU that matches ${motherboardSocket}.`,
        data: { cpuSocket, motherboardSocket },
      });
    }
  } else {
    if (!cpu) {
      unknowns.push("CPU missing from the build.");
    }
    if (!motherboard) {
      unknowns.push("Motherboard missing from the build.");
    }
    if (!cpuSocket && cpu) {
      unknowns.push(`Could not identify the CPU socket for ${cpu.name}.`);
    }
    if (!motherboardSocket && motherboard) {
      unknowns.push(`Could not identify the motherboard socket for ${motherboard.name}.`);
    }
  }

  const memoryType = inferMemoryType(memory?.specs, memory ? `${memory.name} ${memory.model || ""}` : "");
  const motherboardMemoryType = inferMemoryType(motherboard?.specs, motherboard ? `${motherboard.name} ${motherboard.model || ""}` : "");
  if (memory && motherboard && memoryType && motherboardMemoryType) {
    if (memoryType === motherboardMemoryType) {
      passes.push(`Memory type matches motherboard (${memoryType}).`);
    } else {
      issues.push({
        severity: "error",
        category: "memory",
        message: `Memory type ${memoryType} does not match motherboard support for ${motherboardMemoryType}.`,
        affectedPartIds: [memory.partId, motherboard.partId],
        resolution: `Use ${motherboardMemoryType} memory or select a board that supports ${memoryType}.`,
        data: { memoryType, motherboardMemoryType },
      });
    }
  } else if (!memory) {
    unknowns.push("Memory kit not provided.");
  } else if (!memoryType) {
    unknowns.push(`Could not identify the memory type for ${memory.name}.`);
  } else if (!motherboardMemoryType) {
    unknowns.push(`Could not identify the motherboard memory support for ${motherboard?.name || "the selected board"}.`);
  }

  const estimatedDraw = estimatePowerDraw(parts);
  const psuWattage = inferPsuWattage(psu?.specs, psu ? `${psu.name} ${psu.model || ""}` : "");
  if (psu && psuWattage) {
    const headroom = Math.round(psuWattage - estimatedDraw);
    const safeHeadroom = Math.round(psuWattage * 0.2);
    if (psuWattage < estimatedDraw) {
      issues.push({
        severity: "error",
        category: "power",
        message: `PSU wattage ${psuWattage}W appears below estimated draw of ${estimatedDraw}W.`,
        affectedPartIds: [psu.partId],
        resolution: `Choose a PSU with at least ${Math.max(estimatedDraw + 150, 650)}W for safe headroom.`,
        data: { psuWattage, estimatedDraw },
      });
    } else if (headroom < safeHeadroom) {
      issues.push({
        severity: "warning",
        category: "power",
        message: `PSU headroom is tight: ${psuWattage}W supply against ${estimatedDraw}W estimated draw.`,
        affectedPartIds: [psu.partId],
        resolution: `Move to a higher-capacity PSU or trim power draw by lowering GPU/CPU class.`,
        data: { psuWattage, estimatedDraw, headroom },
      });
    } else {
      passes.push(`PSU capacity appears reasonable (${psuWattage}W vs ${estimatedDraw}W estimated draw).`);
    }
  } else if (psu) {
    unknowns.push(`Could not identify wattage for ${psu.name}.`);
  } else {
    unknowns.push("No PSU listed.");
  }

  const boardFormFactor = inferFormFactor(motherboard?.specs, motherboard ? `${motherboard.name} ${motherboard.model || ""}` : "");
  const caseFormFactor = inferFormFactor(casePart?.specs, casePart ? `${casePart.name} ${casePart.model || ""}` : "");
  if (motherboard && casePart && boardFormFactor && caseFormFactor) {
    if (supportsFormFactor(caseFormFactor, boardFormFactor)) {
      passes.push(`Case form factor appears to support ${boardFormFactor}.`);
    } else {
      issues.push({
        severity: "error",
        category: "fit",
        message: `Case form factor ${caseFormFactor} does not appear to support motherboard size ${boardFormFactor}.`,
        affectedPartIds: [motherboard.partId, casePart.partId],
        resolution: `Choose a case that supports ${boardFormFactor} or move to a smaller motherboard.`,
        data: { boardFormFactor, caseFormFactor },
      });
    }
  } else if (!casePart) {
    unknowns.push("No case listed.");
  } else if (!boardFormFactor) {
    unknowns.push(`Could not determine the motherboard form factor for ${motherboard?.name || "the selected board"}.`);
  } else if (!caseFormFactor) {
    unknowns.push(`Could not determine the case form factor support for ${casePart.name}.`);
  }

  if (cpu && !cooler) {
    const cpuScore = scoreCpuPart(cpu);
    if (cpuScore >= 70) {
      issues.push({
        severity: "warning",
        category: "cooling",
        message: `High-tier CPU ${cpu.name} does not list a dedicated cooler.`,
        affectedPartIds: [cpu.partId],
        resolution: "Confirm stock cooling support or add a stronger air/AIO cooler.",
        data: { cpuScore },
      });
    } else {
      passes.push("Cooling may be acceptable if the CPU includes stock cooling.");
    }
  }

  const cpuScore = scoreCpuPart(cpu);
  const gpuScore = scoreGpuPart(gpu);
  const useCase = normalizeText(intake.useCase);
  if (gpu && cpu && gpuScore > 0 && cpuScore > 0) {
    if ((useCase === "gaming" || useCase === "creator") && cpuScore > gpuScore + 18) {
      issues.push({
        severity: "warning",
        category: "bottleneck",
        message: `CPU ${cpu.name} appears much stronger than GPU ${gpu.name} for ${intake.useCase} workloads.`,
        affectedPartIds: [cpu.partId, gpu.partId],
        resolution: "Rebalance the budget toward a stronger GPU or a more modest CPU.",
        data: { cpuScore, gpuScore, useCase: intake.useCase },
      });
    } else if ((useCase === "productivity" || useCase === "workstation") && gpuScore > cpuScore + 18) {
      issues.push({
        severity: "warning",
        category: "bottleneck",
        message: `GPU ${gpu.name} may be overbuilt relative to CPU ${cpu.name} for ${intake.useCase} workloads.`,
        affectedPartIds: [cpu.partId, gpu.partId],
        resolution: "Shift some budget from GPU to CPU, RAM, or storage if productivity is the main goal.",
        data: { cpuScore, gpuScore, useCase: intake.useCase },
      });
    } else {
      passes.push("CPU/GPU balance looks reasonable for the selected use case.");
    }
  }

  if (gpu) {
    const gpuLength = inferGpuLengthMm(gpu.specs, `${gpu.name} ${gpu.model || ""}`);
    if (gpuLength && casePart) {
      const caseText = normalizeText(`${casePart.name} ${casePart.model || ""} ${stringifyValue(casePart.specs)}`);
      const supportsLongGpu = /(full tower|mid tower|supports\s?\d{3,4}\s?mm|gpu clearance|long gpu)/i.test(caseText);
      if (gpuLength > 330 && !supportsLongGpu) {
        issues.push({
          severity: "warning",
          category: "fit",
          message: `GPU length ${gpuLength}mm may be tight in the selected case.`,
          affectedPartIds: [gpu.partId, casePart.partId],
          resolution: "Confirm GPU clearance or choose a larger chassis.",
          data: { gpuLength },
        });
      } else {
        passes.push("GPU clearance does not raise an obvious concern.");
      }
    }
  }

  if (parts.length === 0) {
    issues.push({
      severity: "warning",
      category: "interface",
      message: "No parts were supplied for compatibility review.",
      affectedPartIds: [],
      resolution: "Provide at least CPU, motherboard, memory, PSU, and case for a meaningful compatibility pass.",
      data: { buildName: intake.buildName },
    });
  }

  if (storage.length > 0) {
    passes.push(`Storage devices included: ${storage.length}.`);
  }

  if (motherboard && cpu && !cpuSocket) {
    issues.push({
      severity: "warning",
      category: "socket",
      message: `Could not confidently verify CPU socket compatibility for ${cpu.name}.`,
      affectedPartIds: [cpu.partId, motherboard.partId],
      resolution: "Add socket data or a board model to tighten verification.",
      data: { cpu: cpu.name, motherboard: motherboard.name },
    });
  }

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(100 - issues.reduce((total, issue) => total + ISSUE_PENALTIES[issue.severity], 0)),
    ),
  );
  const hasErrors = issues.some((issue) => issue.severity === "error");
  const hasWarnings = issues.some((issue) => issue.severity === "warning");

  return {
    status: hasErrors ? "fail" : hasWarnings || unknowns.length > 0 ? "warn" : "pass",
    score,
    issues,
    passes,
    unknowns,
  };
}

function supportsFormFactor(caseFormFactor: string, boardFormFactor: string): boolean {
  const caseRank = formFactorRank(caseFormFactor);
  const boardRank = formFactorRank(boardFormFactor);
  if (caseRank === 0 || boardRank === 0) {
    return false;
  }

  return caseRank >= boardRank;
}

function formFactorRank(formFactor: string): number {
  const normalized = normalizeText(formFactor).replace(/\s+/g, "");
  if (normalized.includes("eatx")) {
    return 4;
  }
  if (normalized.includes("atx")) {
    return 3;
  }
  if (normalized.includes("microatx") || normalized.includes("matx")) {
    return 2;
  }
  if (normalized.includes("itx")) {
    return 1;
  }
  return 0;
}

function partByCategory(parts: readonly NexusBuildNormalizedPart[], category: NexusBuildNormalizedPart["category"]): NexusBuildNormalizedPart | undefined {
  return parts.find((part) => part.category === category);
}
