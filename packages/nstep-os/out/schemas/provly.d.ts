export declare const provlyInventoryItemSchema: {
    readonly type: "object";
    readonly required: readonly ["itemId", "tenantId", "caseId", "name", "categoryId", "categoryLabel", "roomId", "roomLabel", "quantity", "condition", "currency", "highValue", "source", "receiptIds", "attachmentIds", "claimContext", "metadata", "createdAt", "updatedAt"];
    readonly properties: {
        readonly itemId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly caseId: {
            readonly type: "string";
        };
        readonly name: {
            readonly type: "string";
        };
        readonly categoryId: {
            readonly type: "string";
        };
        readonly categoryLabel: {
            readonly type: "string";
        };
        readonly roomId: {
            readonly type: "string";
        };
        readonly roomLabel: {
            readonly type: "string";
        };
        readonly quantity: {
            readonly type: "number";
        };
        readonly condition: {
            readonly type: "string";
            readonly enum: readonly ["new", "good", "fair", "poor", "unknown"];
        };
        readonly estimatedValue: {
            readonly type: "number";
        };
        readonly currency: {
            readonly type: "string";
        };
        readonly purchaseDate: {
            readonly type: "string";
        };
        readonly serialNumber: {
            readonly type: "string";
        };
        readonly brand: {
            readonly type: "string";
        };
        readonly model: {
            readonly type: "string";
        };
        readonly highValue: {
            readonly type: "boolean";
        };
        readonly source: {
            readonly type: "string";
            readonly enum: readonly ["manual", "upload", "photo", "receipt", "import", "claim", "system"];
        };
        readonly receiptIds: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly attachmentIds: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly notes: {
            readonly type: "string";
        };
        readonly claimContext: {
            readonly type: "object";
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
export declare const provlyInventoryCategorySchema: {
    readonly type: "object";
    readonly required: readonly ["categoryId", "tenantId", "caseId", "label", "normalizedLabel", "itemCount", "highValueCount", "completenessScore", "metadata", "createdAt", "updatedAt"];
    readonly properties: {
        readonly categoryId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly caseId: {
            readonly type: "string";
        };
        readonly label: {
            readonly type: "string";
        };
        readonly normalizedLabel: {
            readonly type: "string";
        };
        readonly itemCount: {
            readonly type: "number";
        };
        readonly highValueCount: {
            readonly type: "number";
        };
        readonly estimatedValue: {
            readonly type: "number";
        };
        readonly completenessScore: {
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
export declare const provlyRoomSchema: {
    readonly type: "object";
    readonly required: readonly ["roomId", "tenantId", "caseId", "label", "normalizedLabel", "itemCount", "highValueCount", "completenessScore", "metadata", "createdAt", "updatedAt"];
    readonly properties: {
        readonly roomId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly caseId: {
            readonly type: "string";
        };
        readonly label: {
            readonly type: "string";
        };
        readonly normalizedLabel: {
            readonly type: "string";
        };
        readonly itemCount: {
            readonly type: "number";
        };
        readonly highValueCount: {
            readonly type: "number";
        };
        readonly estimatedValue: {
            readonly type: "number";
        };
        readonly completenessScore: {
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
export declare const provlyAttachmentSchema: {
    readonly type: "object";
    readonly required: readonly ["attachmentId", "tenantId", "caseId", "kind", "capturedAt", "metadata"];
    readonly properties: {
        readonly attachmentId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly caseId: {
            readonly type: "string";
        };
        readonly itemId: {
            readonly type: "string";
        };
        readonly kind: {
            readonly type: "string";
            readonly enum: readonly ["photo", "receipt", "note", "pdf", "other"];
        };
        readonly label: {
            readonly type: "string";
        };
        readonly filename: {
            readonly type: "string";
        };
        readonly mimeType: {
            readonly type: "string";
        };
        readonly url: {
            readonly type: "string";
        };
        readonly sizeBytes: {
            readonly type: "number";
        };
        readonly capturedAt: {
            readonly type: "string";
        };
        readonly metadata: {
            readonly type: "object";
        };
    };
};
export declare const provlyReceiptSchema: {
    readonly type: "object";
    readonly required: readonly ["receiptId", "tenantId", "caseId", "currency", "createdAt", "updatedAt", "metadata"];
    readonly properties: {
        readonly receiptId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly caseId: {
            readonly type: "string";
        };
        readonly itemId: {
            readonly type: "string";
        };
        readonly vendor: {
            readonly type: "string";
        };
        readonly receiptNumber: {
            readonly type: "string";
        };
        readonly purchaseDate: {
            readonly type: "string";
        };
        readonly total: {
            readonly type: "number";
        };
        readonly currency: {
            readonly type: "string";
        };
        readonly attachmentId: {
            readonly type: "string";
        };
        readonly notes: {
            readonly type: "string";
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
export declare const provlyCompletenessIssueSchema: {
    readonly type: "object";
    readonly required: readonly ["severity", "category", "message"];
    readonly properties: {
        readonly severity: {
            readonly type: "string";
            readonly enum: readonly ["info", "warning", "error"];
        };
        readonly category: {
            readonly type: "string";
            readonly enum: readonly ["metadata", "document", "receipt", "photo", "room", "claim", "export", "value", "attachment", "category"];
        };
        readonly message: {
            readonly type: "string";
        };
        readonly itemId: {
            readonly type: "string";
        };
        readonly field: {
            readonly type: "string";
        };
        readonly resolution: {
            readonly type: "string";
        };
        readonly data: {
            readonly type: "object";
        };
    };
};
export declare const provlyCompletenessSummarySchema: {
    readonly type: "object";
    readonly required: readonly ["checkId", "tenantId", "caseId", "status", "score", "claimReady", "totalItems", "highValueItems", "completedItems", "itemScores", "issues", "missingFields", "reminders", "createdAt", "updatedAt", "metadata"];
    readonly properties: {
        readonly checkId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly caseId: {
            readonly type: "string";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["pass", "warn", "fail"];
        };
        readonly score: {
            readonly type: "number";
        };
        readonly claimReady: {
            readonly type: "boolean";
        };
        readonly totalItems: {
            readonly type: "number";
        };
        readonly highValueItems: {
            readonly type: "number";
        };
        readonly completedItems: {
            readonly type: "number";
        };
        readonly itemScores: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["itemId", "score", "missingFields", "highValue"];
                readonly properties: {
                    readonly itemId: {
                        readonly type: "string";
                    };
                    readonly score: {
                        readonly type: "number";
                    };
                    readonly missingFields: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly highValue: {
                        readonly type: "boolean";
                    };
                };
            };
        };
        readonly issues: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["severity", "category", "message"];
                readonly properties: {
                    readonly severity: {
                        readonly type: "string";
                        readonly enum: readonly ["info", "warning", "error"];
                    };
                    readonly category: {
                        readonly type: "string";
                        readonly enum: readonly ["metadata", "document", "receipt", "photo", "room", "claim", "export", "value", "attachment", "category"];
                    };
                    readonly message: {
                        readonly type: "string";
                    };
                    readonly itemId: {
                        readonly type: "string";
                    };
                    readonly field: {
                        readonly type: "string";
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
        readonly missingFields: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly reminders: {
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
export declare const provlyClaimExportSchema: {
    readonly type: "object";
    readonly required: readonly ["exportId", "tenantId", "caseId", "title", "status", "format", "itemCount", "roomCount", "categoryCount", "completenessScore", "highValueItemCount", "missingFieldCount", "summary", "sections", "createdAt", "updatedAt", "metadata"];
    readonly properties: {
        readonly exportId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly caseId: {
            readonly type: "string";
        };
        readonly title: {
            readonly type: "string";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["draft", "ready", "needs-review", "exported"];
        };
        readonly format: {
            readonly type: "string";
            readonly enum: readonly ["json", "csv", "summary", "pdf-outline"];
        };
        readonly itemCount: {
            readonly type: "number";
        };
        readonly roomCount: {
            readonly type: "number";
        };
        readonly categoryCount: {
            readonly type: "number";
        };
        readonly completenessScore: {
            readonly type: "number";
        };
        readonly highValueItemCount: {
            readonly type: "number";
        };
        readonly missingFieldCount: {
            readonly type: "number";
        };
        readonly summary: {
            readonly type: "string";
        };
        readonly sections: {
            readonly type: "object";
            readonly properties: {
                readonly overview: {
                    readonly type: "object";
                };
                readonly rooms: {
                    readonly type: "array";
                };
                readonly categories: {
                    readonly type: "array";
                };
                readonly highValueItems: {
                    readonly type: "array";
                };
                readonly missingDocumentation: {
                    readonly type: "array";
                };
                readonly attachments: {
                    readonly type: "array";
                };
                readonly receipts: {
                    readonly type: "array";
                };
                readonly notes: {
                    readonly type: "array";
                };
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
export declare const provlyUserPreferenceSchema: {
    readonly type: "object";
    readonly required: readonly ["preferenceId", "tenantId", "defaultCurrency", "reportStyle", "preferredRooms", "highValueThreshold", "reminderMode", "exportFormat", "updatedAt", "metadata"];
    readonly properties: {
        readonly preferenceId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly defaultCurrency: {
            readonly type: "string";
        };
        readonly reportStyle: {
            readonly type: "string";
            readonly enum: readonly ["concise", "balanced", "detailed"];
        };
        readonly preferredRooms: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly highValueThreshold: {
            readonly type: "number";
        };
        readonly reminderMode: {
            readonly type: "string";
            readonly enum: readonly ["dashboard", "email", "both"];
        };
        readonly exportFormat: {
            readonly type: "string";
            readonly enum: readonly ["json", "csv", "summary", "pdf-outline"];
        };
        readonly updatedAt: {
            readonly type: "string";
        };
        readonly metadata: {
            readonly type: "object";
        };
    };
};
export declare const provlyIntakeSchema: {
    readonly type: "object";
    readonly required: readonly ["goal", "caseId", "operation", "claimantName", "claimType", "inventoryItems", "attachments", "receipts", "rooms", "claimContext", "exportFormat", "preferredCurrency", "highValueThreshold", "documentationRules", "preferences", "reminderMode"];
    readonly properties: {
        readonly goal: {
            readonly type: "object";
        };
        readonly caseId: {
            readonly type: "string";
        };
        readonly operation: {
            readonly type: "string";
            readonly enum: readonly ["inventory-intake", "documentation-review", "claim-preparation", "room-review", "reminder-generation", "export-generation", "high-value-review"];
        };
        readonly claimantName: {
            readonly type: "string";
        };
        readonly claimType: {
            readonly type: "string";
        };
        readonly inventoryItems: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["itemId", "tenantId", "caseId", "name", "categoryId", "categoryLabel", "roomId", "roomLabel", "quantity", "condition", "currency", "highValue", "source", "receiptIds", "attachmentIds", "claimContext", "metadata", "createdAt", "updatedAt"];
                readonly properties: {
                    readonly itemId: {
                        readonly type: "string";
                    };
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly caseId: {
                        readonly type: "string";
                    };
                    readonly name: {
                        readonly type: "string";
                    };
                    readonly categoryId: {
                        readonly type: "string";
                    };
                    readonly categoryLabel: {
                        readonly type: "string";
                    };
                    readonly roomId: {
                        readonly type: "string";
                    };
                    readonly roomLabel: {
                        readonly type: "string";
                    };
                    readonly quantity: {
                        readonly type: "number";
                    };
                    readonly condition: {
                        readonly type: "string";
                        readonly enum: readonly ["new", "good", "fair", "poor", "unknown"];
                    };
                    readonly estimatedValue: {
                        readonly type: "number";
                    };
                    readonly currency: {
                        readonly type: "string";
                    };
                    readonly purchaseDate: {
                        readonly type: "string";
                    };
                    readonly serialNumber: {
                        readonly type: "string";
                    };
                    readonly brand: {
                        readonly type: "string";
                    };
                    readonly model: {
                        readonly type: "string";
                    };
                    readonly highValue: {
                        readonly type: "boolean";
                    };
                    readonly source: {
                        readonly type: "string";
                        readonly enum: readonly ["manual", "upload", "photo", "receipt", "import", "claim", "system"];
                    };
                    readonly receiptIds: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly attachmentIds: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly notes: {
                        readonly type: "string";
                    };
                    readonly claimContext: {
                        readonly type: "object";
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
        readonly attachments: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["attachmentId", "tenantId", "caseId", "kind", "capturedAt", "metadata"];
                readonly properties: {
                    readonly attachmentId: {
                        readonly type: "string";
                    };
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly caseId: {
                        readonly type: "string";
                    };
                    readonly itemId: {
                        readonly type: "string";
                    };
                    readonly kind: {
                        readonly type: "string";
                        readonly enum: readonly ["photo", "receipt", "note", "pdf", "other"];
                    };
                    readonly label: {
                        readonly type: "string";
                    };
                    readonly filename: {
                        readonly type: "string";
                    };
                    readonly mimeType: {
                        readonly type: "string";
                    };
                    readonly url: {
                        readonly type: "string";
                    };
                    readonly sizeBytes: {
                        readonly type: "number";
                    };
                    readonly capturedAt: {
                        readonly type: "string";
                    };
                    readonly metadata: {
                        readonly type: "object";
                    };
                };
            };
        };
        readonly receipts: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["receiptId", "tenantId", "caseId", "currency", "createdAt", "updatedAt", "metadata"];
                readonly properties: {
                    readonly receiptId: {
                        readonly type: "string";
                    };
                    readonly tenantId: {
                        readonly type: "string";
                    };
                    readonly caseId: {
                        readonly type: "string";
                    };
                    readonly itemId: {
                        readonly type: "string";
                    };
                    readonly vendor: {
                        readonly type: "string";
                    };
                    readonly receiptNumber: {
                        readonly type: "string";
                    };
                    readonly purchaseDate: {
                        readonly type: "string";
                    };
                    readonly total: {
                        readonly type: "number";
                    };
                    readonly currency: {
                        readonly type: "string";
                    };
                    readonly attachmentId: {
                        readonly type: "string";
                    };
                    readonly notes: {
                        readonly type: "string";
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
        };
        readonly rooms: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly claimContext: {
            readonly type: "object";
        };
        readonly reminderEmail: {
            readonly type: "string";
        };
        readonly reminderPhone: {
            readonly type: "string";
        };
        readonly exportFormat: {
            readonly type: "string";
            readonly enum: readonly ["json", "csv", "summary", "pdf-outline"];
        };
        readonly preferredCurrency: {
            readonly type: "string";
        };
        readonly highValueThreshold: {
            readonly type: "number";
        };
        readonly policyName: {
            readonly type: "string";
        };
        readonly policyDeadline: {
            readonly type: "string";
        };
        readonly documentationRules: {
            readonly type: "object";
        };
        readonly preferences: {
            readonly type: "object";
        };
        readonly reminderMode: {
            readonly type: "string";
            readonly enum: readonly ["dashboard", "email", "both"];
        };
        readonly notes: {
            readonly type: "string";
        };
    };
};
export declare const provlyAnalysisReportSchema: {
    readonly type: "object";
    readonly required: readonly ["reportId", "tenantId", "caseId", "operation", "title", "summary", "claimType", "inventory", "completeness", "claimExport", "warnings", "reminders", "createdAt", "updatedAt", "metadata"];
    readonly properties: {
        readonly reportId: {
            readonly type: "string";
        };
        readonly tenantId: {
            readonly type: "string";
        };
        readonly caseId: {
            readonly type: "string";
        };
        readonly operation: {
            readonly type: "string";
            readonly enum: readonly ["inventory-intake", "documentation-review", "claim-preparation", "room-review", "reminder-generation", "export-generation", "high-value-review"];
        };
        readonly title: {
            readonly type: "string";
        };
        readonly summary: {
            readonly type: "string";
        };
        readonly claimType: {
            readonly type: "string";
        };
        readonly inventory: {
            readonly type: "object";
            readonly required: readonly ["itemCount", "roomCount", "categoryCount", "attachmentCount", "receiptCount", "highValueItemCount", "organizedByRoom", "organizedByCategory"];
            readonly properties: {
                readonly itemCount: {
                    readonly type: "number";
                };
                readonly roomCount: {
                    readonly type: "number";
                };
                readonly categoryCount: {
                    readonly type: "number";
                };
                readonly attachmentCount: {
                    readonly type: "number";
                };
                readonly receiptCount: {
                    readonly type: "number";
                };
                readonly totalEstimatedValue: {
                    readonly type: "number";
                };
                readonly highValueItemCount: {
                    readonly type: "number";
                };
                readonly organizedByRoom: {
                    readonly type: "array";
                };
                readonly organizedByCategory: {
                    readonly type: "array";
                };
            };
        };
        readonly completeness: {
            readonly type: "object";
            readonly required: readonly ["checkId", "tenantId", "caseId", "status", "score", "claimReady", "totalItems", "highValueItems", "completedItems", "itemScores", "issues", "missingFields", "reminders", "createdAt", "updatedAt", "metadata"];
            readonly properties: {
                readonly checkId: {
                    readonly type: "string";
                };
                readonly tenantId: {
                    readonly type: "string";
                };
                readonly caseId: {
                    readonly type: "string";
                };
                readonly status: {
                    readonly type: "string";
                    readonly enum: readonly ["pass", "warn", "fail"];
                };
                readonly score: {
                    readonly type: "number";
                };
                readonly claimReady: {
                    readonly type: "boolean";
                };
                readonly totalItems: {
                    readonly type: "number";
                };
                readonly highValueItems: {
                    readonly type: "number";
                };
                readonly completedItems: {
                    readonly type: "number";
                };
                readonly itemScores: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["itemId", "score", "missingFields", "highValue"];
                        readonly properties: {
                            readonly itemId: {
                                readonly type: "string";
                            };
                            readonly score: {
                                readonly type: "number";
                            };
                            readonly missingFields: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            };
                            readonly highValue: {
                                readonly type: "boolean";
                            };
                        };
                    };
                };
                readonly issues: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["severity", "category", "message"];
                        readonly properties: {
                            readonly severity: {
                                readonly type: "string";
                                readonly enum: readonly ["info", "warning", "error"];
                            };
                            readonly category: {
                                readonly type: "string";
                                readonly enum: readonly ["metadata", "document", "receipt", "photo", "room", "claim", "export", "value", "attachment", "category"];
                            };
                            readonly message: {
                                readonly type: "string";
                            };
                            readonly itemId: {
                                readonly type: "string";
                            };
                            readonly field: {
                                readonly type: "string";
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
                readonly missingFields: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly reminders: {
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
        readonly claimExport: {
            readonly type: "object";
            readonly required: readonly ["exportId", "tenantId", "caseId", "title", "status", "format", "itemCount", "roomCount", "categoryCount", "completenessScore", "highValueItemCount", "missingFieldCount", "summary", "sections", "createdAt", "updatedAt", "metadata"];
            readonly properties: {
                readonly exportId: {
                    readonly type: "string";
                };
                readonly tenantId: {
                    readonly type: "string";
                };
                readonly caseId: {
                    readonly type: "string";
                };
                readonly title: {
                    readonly type: "string";
                };
                readonly status: {
                    readonly type: "string";
                    readonly enum: readonly ["draft", "ready", "needs-review", "exported"];
                };
                readonly format: {
                    readonly type: "string";
                    readonly enum: readonly ["json", "csv", "summary", "pdf-outline"];
                };
                readonly itemCount: {
                    readonly type: "number";
                };
                readonly roomCount: {
                    readonly type: "number";
                };
                readonly categoryCount: {
                    readonly type: "number";
                };
                readonly completenessScore: {
                    readonly type: "number";
                };
                readonly highValueItemCount: {
                    readonly type: "number";
                };
                readonly missingFieldCount: {
                    readonly type: "number";
                };
                readonly summary: {
                    readonly type: "string";
                };
                readonly sections: {
                    readonly type: "object";
                    readonly properties: {
                        readonly overview: {
                            readonly type: "object";
                        };
                        readonly rooms: {
                            readonly type: "array";
                        };
                        readonly categories: {
                            readonly type: "array";
                        };
                        readonly highValueItems: {
                            readonly type: "array";
                        };
                        readonly missingDocumentation: {
                            readonly type: "array";
                        };
                        readonly attachments: {
                            readonly type: "array";
                        };
                        readonly receipts: {
                            readonly type: "array";
                        };
                        readonly notes: {
                            readonly type: "array";
                        };
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
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly reminders: {
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
