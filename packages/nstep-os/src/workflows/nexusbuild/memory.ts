import { randomUUID } from "node:crypto";
import type { MemoryEntry, NexusBuildAnalysisReport, NexusBuildIntake } from "../../core/types.js";
import { createMemoryLesson } from "../../memory/index.js";

export function buildNexusBuildMemoryEntries(intake: NexusBuildIntake, report: NexusBuildAnalysisReport): MemoryEntry[] {
  const now = new Date().toISOString();
  const entries: MemoryEntry[] = [
    {
      id: `memory_${randomUUID()}`,
      tenantId: intake.goal.tenantId,
      product: "nexusbuild",
      category: "workflow-template",
      key: `nexusbuild.workflow.${intake.operation}`,
      value: {
        buildId: intake.buildId,
        buildName: intake.buildName,
        useCase: intake.useCase,
        operation: intake.operation,
        compatibilityStatus: report.compatibility.status,
        performanceScore: report.performance.score,
        valueScore: report.value.score,
        purchaseStrategy: report.recommendation.purchaseStrategy,
        comparisonWinner: report.comparison?.winnerBuildId,
      },
      confidence: confidenceFromReport(report),
      lesson: createMemoryLesson(
        report.compatibility.status === "pass"
          ? {
              outcome: "success",
              evidence: `Compatibility passed for ${intake.buildName}.`,
              reuseRule: "Use this build shape as a baseline when the same component class and budget recur.",
            }
              : {
                  outcome: "failure",
                  symptom: `Compatibility was ${report.compatibility.status}.`,
                  cause: report.compatibility.issues[0]?.message || "One or more compatibility issues were detected.",
                  fix: "Adjust the incompatible parts or budget balance before recommending the build.",
                  prevention: "Check the compatibility report before finalizing the recommendation.",
                  reuseRule: "Use the same compatibility guardrails when the same issue pattern reappears.",
                  evidence: report.compatibility.issues.map((issue) => issue.message).join("; "),
                },
      ),
      editable: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const preferenceValue = extractPreferenceValue(intake, report);
  if (preferenceValue) {
      entries.push({
      id: `memory_${randomUUID()}`,
      tenantId: intake.goal.tenantId,
      product: "nexusbuild",
      category: "user-preference",
      key: `nexusbuild.preference.${intake.buildId}`,
      value: preferenceValue,
        confidence: 0.76,
        lesson: createMemoryLesson({
          outcome: "prevention",
          symptom: "A preference pattern was detected in the build request.",
          cause: "Repeated brand and use-case selections in the input.",
          fix: "Saved the preference for future routing and recommendation.",
          prevention: "Apply the same preference when future build requests match the pattern.",
          reuseRule: "Use the preferred brand set when budget and use-case remain similar.",
          evidence: JSON.stringify(preferenceValue),
        }),
        editable: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  if (report.warnings.length > 0) {
      entries.push({
      id: `memory_${randomUUID()}`,
      tenantId: intake.goal.tenantId,
      product: "nexusbuild",
      category: "business-rule",
      key: `nexusbuild.warning.${intake.operation}.${intake.buildId}`,
      value: {
        warnings: report.warnings.slice(0, 10),
        compatibilityStatus: report.compatibility.status,
        valueScore: report.value.score,
      },
        confidence: 0.68,
        lesson: createMemoryLesson({
          outcome: "prevention",
          symptom: "The report produced warnings.",
          cause: "Budget, compatibility, or value tradeoffs were present.",
          fix: "Captured the warning pattern so it can be checked earlier next time.",
          prevention: "Re-run compatibility and value analysis before finalizing a build with the same warning profile.",
          reuseRule: "Apply this warning rule whenever the same score and issue combination recur.",
          evidence: report.warnings.slice(0, 10).join("; "),
        }),
        editable: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  return entries;
}

function extractPreferenceValue(intake: NexusBuildIntake, report: NexusBuildAnalysisReport): Record<string, unknown> | undefined {
  const preferredBrands = readStringArray(intake.preferences.preferredBrands);
  const avoidBrands = readStringArray(intake.preferences.avoidBrands);
  const focus = {
    useCase: intake.useCase,
    budget: intake.budget,
    currency: intake.currency,
    livePricingEnabled: intake.livePricingEnabled,
    buildName: intake.buildName,
    operation: intake.operation,
    purchaseStrategy: report.recommendation.purchaseStrategy,
    preferredBrands,
    avoidBrands,
  };

  return Object.values(focus).some((value) => (Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null))
    ? focus
    : undefined;
}

function confidenceFromReport(report: NexusBuildAnalysisReport): number {
  const base = report.compatibility.status === "pass" ? 0.9 : report.compatibility.status === "warn" ? 0.8 : 0.7;
  const quality = Math.min(0.15, report.performance.score / 1000);
  return Math.max(0.55, Math.min(0.96, base + quality));
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
}
