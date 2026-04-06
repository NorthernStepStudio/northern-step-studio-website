export const nexusBuildPartSchema = {
    type: "object",
    required: ["partId", "category", "name", "quantity", "source", "specs"],
    properties: {
        partId: { type: "string" },
        category: {
            type: "string",
            enum: ["cpu", "motherboard", "gpu", "memory", "storage", "psu", "case", "cooler", "monitor", "accessory"],
        },
        name: { type: "string" },
        brand: { type: "string" },
        model: { type: "string" },
        quantity: { type: "number" },
        price: { type: "number" },
        currency: { type: "string" },
        url: { type: "string" },
        source: { type: "string", enum: ["goal", "saved", "browser", "api", "catalog"] },
        specs: { type: "object" },
        notes: { type: "string" },
    },
};
export const nexusBuildSnapshotSchema = {
    type: "object",
    required: ["buildId", "tenantId", "name", "useCase", "currency", "parts", "metadata"],
    properties: {
        buildId: { type: "string" },
        tenantId: { type: "string" },
        name: { type: "string" },
        useCase: { type: "string", enum: ["gaming", "productivity", "creator", "budget", "workstation", "general"] },
        budget: { type: "number" },
        currency: { type: "string" },
        parts: { type: "array", items: nexusBuildPartSchema },
        preferred: { type: "boolean" },
        notes: { type: "string" },
        metadata: { type: "object" },
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
    },
};
export const nexusBuildPriceSourceSchema = {
    type: "object",
    required: ["url"],
    properties: {
        label: { type: "string" },
        url: { type: "string" },
        kind: { type: "string", enum: ["retail", "marketplace", "watchlist", "spec", "benchmark", "review"] },
        priority: { type: "number" },
    },
};
export const nexusBuildCompatibilityIssueSchema = {
    type: "object",
    required: ["severity", "category", "message", "affectedPartIds"],
    properties: {
        severity: { type: "string", enum: ["info", "warning", "error"] },
        category: { type: "string" },
        message: { type: "string" },
        affectedPartIds: { type: "array", items: { type: "string" } },
        resolution: { type: "string" },
        data: { type: "object" },
    },
};
export const nexusBuildCompatibilitySummarySchema = {
    type: "object",
    required: ["status", "score", "issues", "passes", "unknowns"],
    properties: {
        status: { type: "string", enum: ["pass", "warn", "fail"] },
        score: { type: "number" },
        issues: { type: "array", items: nexusBuildCompatibilityIssueSchema },
        passes: { type: "array", items: { type: "string" } },
        unknowns: { type: "array", items: { type: "string" } },
    },
};
export const nexusBuildPerformanceSummarySchema = {
    type: "object",
    required: ["score", "useCaseFit", "expectedOutcome", "bottlenecks", "strengths", "estimatedCpuScore", "estimatedGpuScore", "estimatedBuildScore"],
    properties: {
        score: { type: "number" },
        useCaseFit: { type: "number" },
        expectedOutcome: { type: "string" },
        bottlenecks: { type: "array", items: { type: "string" } },
        strengths: { type: "array", items: { type: "string" } },
        estimatedCpuScore: { type: "number" },
        estimatedGpuScore: { type: "number" },
        estimatedBuildScore: { type: "number" },
    },
};
export const nexusBuildValueSummarySchema = {
    type: "object",
    required: ["score", "budgetFit", "valueNotes", "pricePerformanceNotes"],
    properties: {
        score: { type: "number" },
        estimatedBuildCost: { type: "number" },
        budgetFit: { type: "number" },
        valueNotes: { type: "array", items: { type: "string" } },
        pricePerformanceNotes: { type: "array", items: { type: "string" } },
    },
};
export const nexusBuildRecommendationSummarySchema = {
    type: "object",
    required: ["title", "purchaseStrategy", "upgradePath", "alternateParts", "budgetOptimizations", "premiumGuidance"],
    properties: {
        title: { type: "string" },
        purchaseStrategy: { type: "string" },
        upgradePath: { type: "array", items: { type: "string" } },
        alternateParts: {
            type: "array",
            items: {
                type: "object",
                required: ["category", "suggestion", "reason"],
                properties: {
                    category: { type: "string" },
                    suggestion: { type: "string" },
                    reason: { type: "string" },
                },
            },
        },
        budgetOptimizations: { type: "array", items: { type: "string" } },
        premiumGuidance: { type: "array", items: { type: "string" } },
    },
};
export const nexusBuildComparisonSummarySchema = {
    type: "object",
    required: ["comparedBuildIds", "notes", "matrix"],
    properties: {
        comparedBuildIds: { type: "array", items: { type: "string" } },
        winnerBuildId: { type: "string" },
        notes: { type: "array", items: { type: "string" } },
        matrix: {
            type: "array",
            items: {
                type: "object",
                required: ["buildId", "score", "summary"],
                properties: {
                    buildId: { type: "string" },
                    score: { type: "number" },
                    summary: { type: "string" },
                },
            },
        },
    },
};
export const nexusBuildPricingSnapshotSchema = {
    type: "object",
    required: ["snapshotId", "tenantId", "buildId", "source", "url", "currency", "capturedAt", "metadata"],
    properties: {
        snapshotId: { type: "string" },
        tenantId: { type: "string" },
        buildId: { type: "string" },
        partId: { type: "string" },
        source: { type: "string" },
        label: { type: "string" },
        url: { type: "string" },
        currency: { type: "string" },
        price: { type: "number" },
        capturedAt: { type: "string" },
        rawText: { type: "string" },
        metadata: { type: "object" },
    },
};
export const nexusBuildAnalysisReportSchema = {
    type: "object",
    required: ["reportId", "tenantId", "buildId", "operation", "useCase", "title", "summary", "compatibility", "performance", "value", "recommendation", "pricing", "warnings", "createdAt", "updatedAt", "metadata"],
    properties: {
        reportId: { type: "string" },
        tenantId: { type: "string" },
        buildId: { type: "string" },
        operation: { type: "string" },
        useCase: { type: "string" },
        title: { type: "string" },
        summary: { type: "string" },
        compatibility: nexusBuildCompatibilitySummarySchema,
        performance: nexusBuildPerformanceSummarySchema,
        value: nexusBuildValueSummarySchema,
        recommendation: nexusBuildRecommendationSummarySchema,
        comparison: nexusBuildComparisonSummarySchema,
        pricing: {
            type: "object",
            required: ["snapshotCount", "snapshots", "livePricingEnabled", "notes"],
            properties: {
                snapshotCount: { type: "number" },
                snapshots: { type: "array", items: nexusBuildPricingSnapshotSchema },
                livePricingEnabled: { type: "boolean" },
                notes: { type: "array", items: { type: "string" } },
            },
        },
        warnings: { type: "array", items: { type: "string" } },
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
        metadata: { type: "object" },
    },
};
export const nexusBuildRecommendationRunSchema = {
    type: "object",
    required: ["runId", "tenantId", "buildId", "operation", "status", "score", "createdAt", "updatedAt", "metadata"],
    properties: {
        runId: { type: "string" },
        tenantId: { type: "string" },
        buildId: { type: "string" },
        reportId: { type: "string" },
        operation: { type: "string" },
        status: { type: "string", enum: ["draft", "final", "watching"] },
        score: { type: "number" },
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
        metadata: { type: "object" },
    },
};
export const nexusBuildSavedBuildSchema = {
    type: "object",
    required: ["buildId", "tenantId", "name", "useCase", "currency", "parts", "metadata", "createdAt", "updatedAt"],
    properties: {
        buildId: { type: "string" },
        tenantId: { type: "string" },
        name: { type: "string" },
        useCase: { type: "string" },
        budget: { type: "number" },
        currency: { type: "string" },
        parts: { type: "array", items: nexusBuildPartSchema },
        preferred: { type: "boolean" },
        notes: { type: "string" },
        metadata: { type: "object" },
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
    },
};
export const nexusBuildUserPreferenceSchema = {
    type: "object",
    required: ["preferenceId", "tenantId", "preferredBrands", "avoidBrands", "tone", "updatedAt", "metadata"],
    properties: {
        preferenceId: { type: "string" },
        tenantId: { type: "string" },
        name: { type: "string" },
        useCase: { type: "string" },
        preferredBrands: { type: "array", items: { type: "string" } },
        avoidBrands: { type: "array", items: { type: "string" } },
        targetBudget: { type: "number" },
        currency: { type: "string" },
        tone: { type: "string", enum: ["concise", "balanced", "premium"] },
        updatedAt: { type: "string" },
        metadata: { type: "object" },
    },
};
export const nexusBuildIntakeSchema = {
    type: "object",
    required: ["goal", "buildId", "operation", "useCase", "buildName", "currency", "parts", "savedBuilds", "comparisonBuilds", "priceSources", "watchlist", "preferences", "benchmarkContext", "livePricingEnabled"],
    properties: {
        goal: { type: "object" },
        buildId: { type: "string" },
        operation: { type: "string" },
        useCase: { type: "string" },
        buildName: { type: "string" },
        budget: { type: "number" },
        currency: { type: "string" },
        parts: { type: "array", items: nexusBuildPartSchema },
        savedBuilds: { type: "array", items: nexusBuildSnapshotSchema },
        comparisonBuilds: { type: "array", items: nexusBuildSnapshotSchema },
        priceSources: { type: "array", items: nexusBuildPriceSourceSchema },
        watchlist: {
            type: "array",
            items: {
                type: "object",
                required: ["label", "url"],
                properties: {
                    label: { type: "string" },
                    url: { type: "string" },
                    targetPrice: { type: "number" },
                    currency: { type: "string" },
                    notes: { type: "string" },
                },
            },
        },
        preferences: { type: "object" },
        benchmarkContext: { type: "object" },
        livePricingEnabled: { type: "boolean" },
    },
};
export const nexusBuildReportSchema = {
    type: "object",
    required: ["buildId", "tenantId", "workflowType", "title", "summary", "useCase", "currency", "compatibility", "performance", "value", "recommendations", "pricing", "warnings", "savedAt"],
    properties: {
        buildId: { type: "string" },
        tenantId: { type: "string" },
        workflowType: { type: "string" },
        title: { type: "string" },
        summary: { type: "string" },
        useCase: { type: "string" },
        budget: { type: "number" },
        currency: { type: "string" },
        compatibility: nexusBuildCompatibilitySummarySchema,
        performance: nexusBuildPerformanceSummarySchema,
        value: nexusBuildValueSummarySchema,
        recommendations: nexusBuildRecommendationSummarySchema,
        comparison: nexusBuildComparisonSummarySchema,
        pricing: {
            type: "object",
            properties: {
                liveChecks: { type: "number" },
                snapshots: { type: "array", items: nexusBuildPricingSnapshotSchema },
                notes: { type: "array", items: { type: "string" } },
            },
        },
        warnings: { type: "array", items: { type: "string" } },
        reportKind: { type: "string" },
        savedAt: { type: "string" },
    },
};
//# sourceMappingURL=nexusbuild.js.map