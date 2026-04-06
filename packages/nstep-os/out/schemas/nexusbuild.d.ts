export declare const nexusBuildPartSchema: {
    readonly type: "object";
    readonly required: readonly ["partId", "category", "name", "quantity", "source", "specs"];
    readonly properties: {
        readonly partId: {
            readonly type: "string";
        };
        readonly category: {
            readonly type: "string";
            readonly enum: readonly ["cpu", "motherboard", "gpu", "memory", "storage", "psu", "case", "cooler", "monitor", "accessory"];
        };
        readonly name: {
            readonly type: "string";
        };
        readonly brand: {
            readonly type: "string";
        };
        readonly model: {
            readonly type: "string";
        };
        readonly quantity: {
            readonly type: "number";
        };
        readonly price: {
            readonly type: "number";
        };
        readonly currency: {
            readonly type: "string";
        };
        readonly url: {
            readonly type: "string";
        };
        readonly source: {
            readonly type: "string";
            readonly enum: readonly ["goal", "saved", "browser", "api", "catalog"];
        };
        readonly specs: {
            readonly type: "object";
        };
        readonly notes: {
            readonly type: "string";
        };
    };
};
export declare const nexusBuildSnapshotSchema: {
    readonly type: "object";
    readonly required: readonly ["buildId", "tenantId", "name", "useCase", "currency", "parts", "metadata"];
    readonly properties: {
        readonly buildId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly name: {
            readonly type: "string";
        };
        readonly useCase: {
            readonly type: "string";
            readonly enum: readonly ["gaming", "productivity", "creator", "budget", "workstation", "general"];
        };
        readonly budget: {
            readonly type: "number";
        };
        readonly currency: {
            readonly type: "string";
        };
        readonly parts: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["partId", "category", "name", "quantity", "source", "specs"];
                readonly properties: {
                    readonly partId: {
                        readonly type: "string";
                    };
                    readonly category: {
                        readonly type: "string";
                        readonly enum: readonly ["cpu", "motherboard", "gpu", "memory", "storage", "psu", "case", "cooler", "monitor", "accessory"];
                    };
                    readonly name: {
                        readonly type: "string";
                    };
                    readonly brand: {
                        readonly type: "string";
                    };
                    readonly model: {
                        readonly type: "string";
                    };
                    readonly quantity: {
                        readonly type: "number";
                    };
                    readonly price: {
                        readonly type: "number";
                    };
                    readonly currency: {
                        readonly type: "string";
                    };
                    readonly url: {
                        readonly type: "string";
                    };
                    readonly source: {
                        readonly type: "string";
                        readonly enum: readonly ["goal", "saved", "browser", "api", "catalog"];
                    };
                    readonly specs: {
                        readonly type: "object";
                    };
                    readonly notes: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly preferred: {
            readonly type: "boolean";
        };
        readonly notes: {
            readonly type: "string";
        };
        readonly metadata: {
            readonly type: "object";
        };
        readonly createdAt: {
            readonly type: "string";
        };
        readonly updatedAt: {
            readonly type: "string";
        };
    };
};
export declare const nexusBuildPriceSourceSchema: {
    readonly type: "object";
    readonly required: readonly ["url"];
    readonly properties: {
        readonly label: {
            readonly type: "string";
        };
        readonly url: {
            readonly type: "string";
        };
        readonly kind: {
            readonly type: "string";
            readonly enum: readonly ["retail", "marketplace", "watchlist", "spec", "benchmark", "review"];
        };
        readonly priority: {
            readonly type: "number";
        };
    };
};
export declare const nexusBuildCompatibilityIssueSchema: {
    readonly type: "object";
    readonly required: readonly ["severity", "category", "message", "affectedPartIds"];
    readonly properties: {
        readonly severity: {
            readonly type: "string";
            readonly enum: readonly ["info", "warning", "error"];
        };
        readonly category: {
            readonly type: "string";
        };
        readonly message: {
            readonly type: "string";
        };
        readonly affectedPartIds: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly resolution: {
            readonly type: "string";
        };
        readonly data: {
            readonly type: "object";
        };
    };
};
export declare const nexusBuildCompatibilitySummarySchema: {
    readonly type: "object";
    readonly required: readonly ["status", "score", "issues", "passes", "unknowns"];
    readonly properties: {
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["pass", "warn", "fail"];
        };
        readonly score: {
            readonly type: "number";
        };
        readonly issues: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["severity", "category", "message", "affectedPartIds"];
                readonly properties: {
                    readonly severity: {
                        readonly type: "string";
                        readonly enum: readonly ["info", "warning", "error"];
                    };
                    readonly category: {
                        readonly type: "string";
                    };
                    readonly message: {
                        readonly type: "string";
                    };
                    readonly affectedPartIds: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly resolution: {
                        readonly type: "string";
                    };
                    readonly data: {
                        readonly type: "object";
                    };
                };
            };
        };
        readonly passes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly unknowns: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
    };
};
export declare const nexusBuildPerformanceSummarySchema: {
    readonly type: "object";
    readonly required: readonly ["score", "useCaseFit", "expectedOutcome", "bottlenecks", "strengths", "estimatedCpuScore", "estimatedGpuScore", "estimatedBuildScore"];
    readonly properties: {
        readonly score: {
            readonly type: "number";
        };
        readonly useCaseFit: {
            readonly type: "number";
        };
        readonly expectedOutcome: {
            readonly type: "string";
        };
        readonly bottlenecks: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly strengths: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly estimatedCpuScore: {
            readonly type: "number";
        };
        readonly estimatedGpuScore: {
            readonly type: "number";
        };
        readonly estimatedBuildScore: {
            readonly type: "number";
        };
    };
};
export declare const nexusBuildValueSummarySchema: {
    readonly type: "object";
    readonly required: readonly ["score", "budgetFit", "valueNotes", "pricePerformanceNotes"];
    readonly properties: {
        readonly score: {
            readonly type: "number";
        };
        readonly estimatedBuildCost: {
            readonly type: "number";
        };
        readonly budgetFit: {
            readonly type: "number";
        };
        readonly valueNotes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly pricePerformanceNotes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
    };
};
export declare const nexusBuildRecommendationSummarySchema: {
    readonly type: "object";
    readonly required: readonly ["title", "purchaseStrategy", "upgradePath", "alternateParts", "budgetOptimizations", "premiumGuidance"];
    readonly properties: {
        readonly title: {
            readonly type: "string";
        };
        readonly purchaseStrategy: {
            readonly type: "string";
        };
        readonly upgradePath: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly alternateParts: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["category", "suggestion", "reason"];
                readonly properties: {
                    readonly category: {
                        readonly type: "string";
                    };
                    readonly suggestion: {
                        readonly type: "string";
                    };
                    readonly reason: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly budgetOptimizations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly premiumGuidance: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
    };
};
export declare const nexusBuildComparisonSummarySchema: {
    readonly type: "object";
    readonly required: readonly ["comparedBuildIds", "notes", "matrix"];
    readonly properties: {
        readonly comparedBuildIds: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly winnerBuildId: {
            readonly type: "string";
        };
        readonly notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly matrix: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["buildId", "score", "summary"];
                readonly properties: {
                    readonly buildId: {
                        readonly type: "string";
                    };
                    readonly score: {
                        readonly type: "number";
                    };
                    readonly summary: {
                        readonly type: "string";
                    };
                };
            };
        };
    };
};
export declare const nexusBuildPricingSnapshotSchema: {
    readonly type: "object";
    readonly required: readonly ["snapshotId", "tenantId", "buildId", "source", "url", "currency", "capturedAt", "metadata"];
    readonly properties: {
        readonly snapshotId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly buildId: {
            readonly type: "string";
        };
        readonly partId: {
            readonly type: "string";
        };
        readonly source: {
            readonly type: "string";
        };
        readonly label: {
            readonly type: "string";
        };
        readonly url: {
            readonly type: "string";
        };
        readonly currency: {
            readonly type: "string";
        };
        readonly price: {
            readonly type: "number";
        };
        readonly capturedAt: {
            readonly type: "string";
        };
        readonly rawText: {
            readonly type: "string";
        };
        readonly metadata: {
            readonly type: "object";
        };
    };
};
export declare const nexusBuildAnalysisReportSchema: {
    readonly type: "object";
    readonly required: readonly ["reportId", "tenantId", "buildId", "operation", "useCase", "title", "summary", "compatibility", "performance", "value", "recommendation", "pricing", "warnings", "createdAt", "updatedAt", "metadata"];
    readonly properties: {
        readonly reportId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly buildId: {
            readonly type: "string";
        };
        readonly operation: {
            readonly type: "string";
        };
        readonly useCase: {
            readonly type: "string";
        };
        readonly title: {
            readonly type: "string";
        };
        readonly summary: {
            readonly type: "string";
        };
        readonly compatibility: {
            readonly type: "object";
            readonly required: readonly ["status", "score", "issues", "passes", "unknowns"];
            readonly properties: {
                readonly status: {
                    readonly type: "string";
                    readonly enum: readonly ["pass", "warn", "fail"];
                };
                readonly score: {
                    readonly type: "number";
                };
                readonly issues: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["severity", "category", "message", "affectedPartIds"];
                        readonly properties: {
                            readonly severity: {
                                readonly type: "string";
                                readonly enum: readonly ["info", "warning", "error"];
                            };
                            readonly category: {
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly type: "string";
                            };
                            readonly affectedPartIds: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            };
                            readonly resolution: {
                                readonly type: "string";
                            };
                            readonly data: {
                                readonly type: "object";
                            };
                        };
                    };
                };
                readonly passes: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly unknowns: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly performance: {
            readonly type: "object";
            readonly required: readonly ["score", "useCaseFit", "expectedOutcome", "bottlenecks", "strengths", "estimatedCpuScore", "estimatedGpuScore", "estimatedBuildScore"];
            readonly properties: {
                readonly score: {
                    readonly type: "number";
                };
                readonly useCaseFit: {
                    readonly type: "number";
                };
                readonly expectedOutcome: {
                    readonly type: "string";
                };
                readonly bottlenecks: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly strengths: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly estimatedCpuScore: {
                    readonly type: "number";
                };
                readonly estimatedGpuScore: {
                    readonly type: "number";
                };
                readonly estimatedBuildScore: {
                    readonly type: "number";
                };
            };
        };
        readonly value: {
            readonly type: "object";
            readonly required: readonly ["score", "budgetFit", "valueNotes", "pricePerformanceNotes"];
            readonly properties: {
                readonly score: {
                    readonly type: "number";
                };
                readonly estimatedBuildCost: {
                    readonly type: "number";
                };
                readonly budgetFit: {
                    readonly type: "number";
                };
                readonly valueNotes: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly pricePerformanceNotes: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly recommendation: {
            readonly type: "object";
            readonly required: readonly ["title", "purchaseStrategy", "upgradePath", "alternateParts", "budgetOptimizations", "premiumGuidance"];
            readonly properties: {
                readonly title: {
                    readonly type: "string";
                };
                readonly purchaseStrategy: {
                    readonly type: "string";
                };
                readonly upgradePath: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly alternateParts: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["category", "suggestion", "reason"];
                        readonly properties: {
                            readonly category: {
                                readonly type: "string";
                            };
                            readonly suggestion: {
                                readonly type: "string";
                            };
                            readonly reason: {
                                readonly type: "string";
                            };
                        };
                    };
                };
                readonly budgetOptimizations: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly premiumGuidance: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly comparison: {
            readonly type: "object";
            readonly required: readonly ["comparedBuildIds", "notes", "matrix"];
            readonly properties: {
                readonly comparedBuildIds: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly winnerBuildId: {
                    readonly type: "string";
                };
                readonly notes: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly matrix: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["buildId", "score", "summary"];
                        readonly properties: {
                            readonly buildId: {
                                readonly type: "string";
                            };
                            readonly score: {
                                readonly type: "number";
                            };
                            readonly summary: {
                                readonly type: "string";
                            };
                        };
                    };
                };
            };
        };
        readonly pricing: {
            readonly type: "object";
            readonly required: readonly ["snapshotCount", "snapshots", "livePricingEnabled", "notes"];
            readonly properties: {
                readonly snapshotCount: {
                    readonly type: "number";
                };
                readonly snapshots: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["snapshotId", "tenantId", "buildId", "source", "url", "currency", "capturedAt", "metadata"];
                        readonly properties: {
                            readonly snapshotId: {
                                readonly type: "string";
                            };
                            readonly tenantId: {
                                readonly type: "string";
                            };
                            readonly buildId: {
                                readonly type: "string";
                            };
                            readonly partId: {
                                readonly type: "string";
                            };
                            readonly source: {
                                readonly type: "string";
                            };
                            readonly label: {
                                readonly type: "string";
                            };
                            readonly url: {
                                readonly type: "string";
                            };
                            readonly currency: {
                                readonly type: "string";
                            };
                            readonly price: {
                                readonly type: "number";
                            };
                            readonly capturedAt: {
                                readonly type: "string";
                            };
                            readonly rawText: {
                                readonly type: "string";
                            };
                            readonly metadata: {
                                readonly type: "object";
                            };
                        };
                    };
                };
                readonly livePricingEnabled: {
                    readonly type: "boolean";
                };
                readonly notes: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly createdAt: {
            readonly type: "string";
        };
        readonly updatedAt: {
            readonly type: "string";
        };
        readonly metadata: {
            readonly type: "object";
        };
    };
};
export declare const nexusBuildRecommendationRunSchema: {
    readonly type: "object";
    readonly required: readonly ["runId", "tenantId", "buildId", "operation", "status", "score", "createdAt", "updatedAt", "metadata"];
    readonly properties: {
        readonly runId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly buildId: {
            readonly type: "string";
        };
        readonly reportId: {
            readonly type: "string";
        };
        readonly operation: {
            readonly type: "string";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["draft", "final", "watching"];
        };
        readonly score: {
            readonly type: "number";
        };
        readonly createdAt: {
            readonly type: "string";
        };
        readonly updatedAt: {
            readonly type: "string";
        };
        readonly metadata: {
            readonly type: "object";
        };
    };
};
export declare const nexusBuildSavedBuildSchema: {
    readonly type: "object";
    readonly required: readonly ["buildId", "tenantId", "name", "useCase", "currency", "parts", "metadata", "createdAt", "updatedAt"];
    readonly properties: {
        readonly buildId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly name: {
            readonly type: "string";
        };
        readonly useCase: {
            readonly type: "string";
        };
        readonly budget: {
            readonly type: "number";
        };
        readonly currency: {
            readonly type: "string";
        };
        readonly parts: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["partId", "category", "name", "quantity", "source", "specs"];
                readonly properties: {
                    readonly partId: {
                        readonly type: "string";
                    };
                    readonly category: {
                        readonly type: "string";
                        readonly enum: readonly ["cpu", "motherboard", "gpu", "memory", "storage", "psu", "case", "cooler", "monitor", "accessory"];
                    };
                    readonly name: {
                        readonly type: "string";
                    };
                    readonly brand: {
                        readonly type: "string";
                    };
                    readonly model: {
                        readonly type: "string";
                    };
                    readonly quantity: {
                        readonly type: "number";
                    };
                    readonly price: {
                        readonly type: "number";
                    };
                    readonly currency: {
                        readonly type: "string";
                    };
                    readonly url: {
                        readonly type: "string";
                    };
                    readonly source: {
                        readonly type: "string";
                        readonly enum: readonly ["goal", "saved", "browser", "api", "catalog"];
                    };
                    readonly specs: {
                        readonly type: "object";
                    };
                    readonly notes: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly preferred: {
            readonly type: "boolean";
        };
        readonly notes: {
            readonly type: "string";
        };
        readonly metadata: {
            readonly type: "object";
        };
        readonly createdAt: {
            readonly type: "string";
        };
        readonly updatedAt: {
            readonly type: "string";
        };
    };
};
export declare const nexusBuildUserPreferenceSchema: {
    readonly type: "object";
    readonly required: readonly ["preferenceId", "tenantId", "preferredBrands", "avoidBrands", "tone", "updatedAt", "metadata"];
    readonly properties: {
        readonly preferenceId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly name: {
            readonly type: "string";
        };
        readonly useCase: {
            readonly type: "string";
        };
        readonly preferredBrands: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly avoidBrands: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly targetBudget: {
            readonly type: "number";
        };
        readonly currency: {
            readonly type: "string";
        };
        readonly tone: {
            readonly type: "string";
            readonly enum: readonly ["concise", "balanced", "premium"];
        };
        readonly updatedAt: {
            readonly type: "string";
        };
        readonly metadata: {
            readonly type: "object";
        };
    };
};
export declare const nexusBuildIntakeSchema: {
    readonly type: "object";
    readonly required: readonly ["goal", "buildId", "operation", "useCase", "buildName", "currency", "parts", "savedBuilds", "comparisonBuilds", "priceSources", "watchlist", "preferences", "benchmarkContext", "livePricingEnabled"];
    readonly properties: {
        readonly goal: {
            readonly type: "object";
        };
        readonly buildId: {
            readonly type: "string";
        };
        readonly operation: {
            readonly type: "string";
        };
        readonly useCase: {
            readonly type: "string";
        };
        readonly buildName: {
            readonly type: "string";
        };
        readonly budget: {
            readonly type: "number";
        };
        readonly currency: {
            readonly type: "string";
        };
        readonly parts: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["partId", "category", "name", "quantity", "source", "specs"];
                readonly properties: {
                    readonly partId: {
                        readonly type: "string";
                    };
                    readonly category: {
                        readonly type: "string";
                        readonly enum: readonly ["cpu", "motherboard", "gpu", "memory", "storage", "psu", "case", "cooler", "monitor", "accessory"];
                    };
                    readonly name: {
                        readonly type: "string";
                    };
                    readonly brand: {
                        readonly type: "string";
                    };
                    readonly model: {
                        readonly type: "string";
                    };
                    readonly quantity: {
                        readonly type: "number";
                    };
                    readonly price: {
                        readonly type: "number";
                    };
                    readonly currency: {
                        readonly type: "string";
                    };
                    readonly url: {
                        readonly type: "string";
                    };
                    readonly source: {
                        readonly type: "string";
                        readonly enum: readonly ["goal", "saved", "browser", "api", "catalog"];
                    };
                    readonly specs: {
                        readonly type: "object";
                    };
                    readonly notes: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly savedBuilds: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["buildId", "tenantId", "name", "useCase", "currency", "parts", "metadata"];
                readonly properties: {
                    readonly buildId: {
                        readonly type: "string";
                    };
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly name: {
                        readonly type: "string";
                    };
                    readonly useCase: {
                        readonly type: "string";
                        readonly enum: readonly ["gaming", "productivity", "creator", "budget", "workstation", "general"];
                    };
                    readonly budget: {
                        readonly type: "number";
                    };
                    readonly currency: {
                        readonly type: "string";
                    };
                    readonly parts: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly required: readonly ["partId", "category", "name", "quantity", "source", "specs"];
                            readonly properties: {
                                readonly partId: {
                                    readonly type: "string";
                                };
                                readonly category: {
                                    readonly type: "string";
                                    readonly enum: readonly ["cpu", "motherboard", "gpu", "memory", "storage", "psu", "case", "cooler", "monitor", "accessory"];
                                };
                                readonly name: {
                                    readonly type: "string";
                                };
                                readonly brand: {
                                    readonly type: "string";
                                };
                                readonly model: {
                                    readonly type: "string";
                                };
                                readonly quantity: {
                                    readonly type: "number";
                                };
                                readonly price: {
                                    readonly type: "number";
                                };
                                readonly currency: {
                                    readonly type: "string";
                                };
                                readonly url: {
                                    readonly type: "string";
                                };
                                readonly source: {
                                    readonly type: "string";
                                    readonly enum: readonly ["goal", "saved", "browser", "api", "catalog"];
                                };
                                readonly specs: {
                                    readonly type: "object";
                                };
                                readonly notes: {
                                    readonly type: "string";
                                };
                            };
                        };
                    };
                    readonly preferred: {
                        readonly type: "boolean";
                    };
                    readonly notes: {
                        readonly type: "string";
                    };
                    readonly metadata: {
                        readonly type: "object";
                    };
                    readonly createdAt: {
                        readonly type: "string";
                    };
                    readonly updatedAt: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly comparisonBuilds: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["buildId", "tenantId", "name", "useCase", "currency", "parts", "metadata"];
                readonly properties: {
                    readonly buildId: {
                        readonly type: "string";
                    };
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly name: {
                        readonly type: "string";
                    };
                    readonly useCase: {
                        readonly type: "string";
                        readonly enum: readonly ["gaming", "productivity", "creator", "budget", "workstation", "general"];
                    };
                    readonly budget: {
                        readonly type: "number";
                    };
                    readonly currency: {
                        readonly type: "string";
                    };
                    readonly parts: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly required: readonly ["partId", "category", "name", "quantity", "source", "specs"];
                            readonly properties: {
                                readonly partId: {
                                    readonly type: "string";
                                };
                                readonly category: {
                                    readonly type: "string";
                                    readonly enum: readonly ["cpu", "motherboard", "gpu", "memory", "storage", "psu", "case", "cooler", "monitor", "accessory"];
                                };
                                readonly name: {
                                    readonly type: "string";
                                };
                                readonly brand: {
                                    readonly type: "string";
                                };
                                readonly model: {
                                    readonly type: "string";
                                };
                                readonly quantity: {
                                    readonly type: "number";
                                };
                                readonly price: {
                                    readonly type: "number";
                                };
                                readonly currency: {
                                    readonly type: "string";
                                };
                                readonly url: {
                                    readonly type: "string";
                                };
                                readonly source: {
                                    readonly type: "string";
                                    readonly enum: readonly ["goal", "saved", "browser", "api", "catalog"];
                                };
                                readonly specs: {
                                    readonly type: "object";
                                };
                                readonly notes: {
                                    readonly type: "string";
                                };
                            };
                        };
                    };
                    readonly preferred: {
                        readonly type: "boolean";
                    };
                    readonly notes: {
                        readonly type: "string";
                    };
                    readonly metadata: {
                        readonly type: "object";
                    };
                    readonly createdAt: {
                        readonly type: "string";
                    };
                    readonly updatedAt: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly priceSources: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["url"];
                readonly properties: {
                    readonly label: {
                        readonly type: "string";
                    };
                    readonly url: {
                        readonly type: "string";
                    };
                    readonly kind: {
                        readonly type: "string";
                        readonly enum: readonly ["retail", "marketplace", "watchlist", "spec", "benchmark", "review"];
                    };
                    readonly priority: {
                        readonly type: "number";
                    };
                };
            };
        };
        readonly watchlist: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["label", "url"];
                readonly properties: {
                    readonly label: {
                        readonly type: "string";
                    };
                    readonly url: {
                        readonly type: "string";
                    };
                    readonly targetPrice: {
                        readonly type: "number";
                    };
                    readonly currency: {
                        readonly type: "string";
                    };
                    readonly notes: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly preferences: {
            readonly type: "object";
        };
        readonly benchmarkContext: {
            readonly type: "object";
        };
        readonly livePricingEnabled: {
            readonly type: "boolean";
        };
    };
};
export declare const nexusBuildReportSchema: {
    readonly type: "object";
    readonly required: readonly ["buildId", "tenantId", "workflowType", "title", "summary", "useCase", "currency", "compatibility", "performance", "value", "recommendations", "pricing", "warnings", "savedAt"];
    readonly properties: {
        readonly buildId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly workflowType: {
            readonly type: "string";
        };
        readonly title: {
            readonly type: "string";
        };
        readonly summary: {
            readonly type: "string";
        };
        readonly useCase: {
            readonly type: "string";
        };
        readonly budget: {
            readonly type: "number";
        };
        readonly currency: {
            readonly type: "string";
        };
        readonly compatibility: {
            readonly type: "object";
            readonly required: readonly ["status", "score", "issues", "passes", "unknowns"];
            readonly properties: {
                readonly status: {
                    readonly type: "string";
                    readonly enum: readonly ["pass", "warn", "fail"];
                };
                readonly score: {
                    readonly type: "number";
                };
                readonly issues: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["severity", "category", "message", "affectedPartIds"];
                        readonly properties: {
                            readonly severity: {
                                readonly type: "string";
                                readonly enum: readonly ["info", "warning", "error"];
                            };
                            readonly category: {
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly type: "string";
                            };
                            readonly affectedPartIds: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            };
                            readonly resolution: {
                                readonly type: "string";
                            };
                            readonly data: {
                                readonly type: "object";
                            };
                        };
                    };
                };
                readonly passes: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly unknowns: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly performance: {
            readonly type: "object";
            readonly required: readonly ["score", "useCaseFit", "expectedOutcome", "bottlenecks", "strengths", "estimatedCpuScore", "estimatedGpuScore", "estimatedBuildScore"];
            readonly properties: {
                readonly score: {
                    readonly type: "number";
                };
                readonly useCaseFit: {
                    readonly type: "number";
                };
                readonly expectedOutcome: {
                    readonly type: "string";
                };
                readonly bottlenecks: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly strengths: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly estimatedCpuScore: {
                    readonly type: "number";
                };
                readonly estimatedGpuScore: {
                    readonly type: "number";
                };
                readonly estimatedBuildScore: {
                    readonly type: "number";
                };
            };
        };
        readonly value: {
            readonly type: "object";
            readonly required: readonly ["score", "budgetFit", "valueNotes", "pricePerformanceNotes"];
            readonly properties: {
                readonly score: {
                    readonly type: "number";
                };
                readonly estimatedBuildCost: {
                    readonly type: "number";
                };
                readonly budgetFit: {
                    readonly type: "number";
                };
                readonly valueNotes: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly pricePerformanceNotes: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly recommendations: {
            readonly type: "object";
            readonly required: readonly ["title", "purchaseStrategy", "upgradePath", "alternateParts", "budgetOptimizations", "premiumGuidance"];
            readonly properties: {
                readonly title: {
                    readonly type: "string";
                };
                readonly purchaseStrategy: {
                    readonly type: "string";
                };
                readonly upgradePath: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly alternateParts: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["category", "suggestion", "reason"];
                        readonly properties: {
                            readonly category: {
                                readonly type: "string";
                            };
                            readonly suggestion: {
                                readonly type: "string";
                            };
                            readonly reason: {
                                readonly type: "string";
                            };
                        };
                    };
                };
                readonly budgetOptimizations: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly premiumGuidance: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly comparison: {
            readonly type: "object";
            readonly required: readonly ["comparedBuildIds", "notes", "matrix"];
            readonly properties: {
                readonly comparedBuildIds: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly winnerBuildId: {
                    readonly type: "string";
                };
                readonly notes: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly matrix: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["buildId", "score", "summary"];
                        readonly properties: {
                            readonly buildId: {
                                readonly type: "string";
                            };
                            readonly score: {
                                readonly type: "number";
                            };
                            readonly summary: {
                                readonly type: "string";
                            };
                        };
                    };
                };
            };
        };
        readonly pricing: {
            readonly type: "object";
            readonly properties: {
                readonly liveChecks: {
                    readonly type: "number";
                };
                readonly snapshots: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["snapshotId", "tenantId", "buildId", "source", "url", "currency", "capturedAt", "metadata"];
                        readonly properties: {
                            readonly snapshotId: {
                                readonly type: "string";
                            };
                            readonly tenantId: {
                                readonly type: "string";
                            };
                            readonly buildId: {
                                readonly type: "string";
                            };
                            readonly partId: {
                                readonly type: "string";
                            };
                            readonly source: {
                                readonly type: "string";
                            };
                            readonly label: {
                                readonly type: "string";
                            };
                            readonly url: {
                                readonly type: "string";
                            };
                            readonly currency: {
                                readonly type: "string";
                            };
                            readonly price: {
                                readonly type: "number";
                            };
                            readonly capturedAt: {
                                readonly type: "string";
                            };
                            readonly rawText: {
                                readonly type: "string";
                            };
                            readonly metadata: {
                                readonly type: "object";
                            };
                        };
                    };
                };
                readonly notes: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly reportKind: {
            readonly type: "string";
        };
        readonly savedAt: {
            readonly type: "string";
        };
    };
};
export type NexusBuildSchemaMap = {
    readonly part: typeof nexusBuildPartSchema;
    readonly snapshot: typeof nexusBuildSnapshotSchema;
    readonly priceSource: typeof nexusBuildPriceSourceSchema;
    readonly compatibilityIssue: typeof nexusBuildCompatibilityIssueSchema;
    readonly compatibilitySummary: typeof nexusBuildCompatibilitySummarySchema;
    readonly performanceSummary: typeof nexusBuildPerformanceSummarySchema;
    readonly valueSummary: typeof nexusBuildValueSummarySchema;
    readonly recommendationSummary: typeof nexusBuildRecommendationSummarySchema;
    readonly comparisonSummary: typeof nexusBuildComparisonSummarySchema;
    readonly pricingSnapshot: typeof nexusBuildPricingSnapshotSchema;
    readonly analysisReport: typeof nexusBuildAnalysisReportSchema;
    readonly recommendationRun: typeof nexusBuildRecommendationRunSchema;
    readonly savedBuild: typeof nexusBuildSavedBuildSchema;
    readonly userPreference: typeof nexusBuildUserPreferenceSchema;
    readonly intake: typeof nexusBuildIntakeSchema;
    readonly report: typeof nexusBuildReportSchema;
};
