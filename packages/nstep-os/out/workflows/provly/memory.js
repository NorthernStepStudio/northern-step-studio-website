import { randomUUID } from "node:crypto";
import { createMemoryLesson } from "../../memory/index.js";
export function buildProvLyMemoryEntries(intake, report) {
    const now = new Date().toISOString();
    const entries = [
        {
            id: `memory_${randomUUID()}`,
            tenantId: intake.goal.tenantId,
            product: "provly",
            category: "workflow-template",
            key: "provly.claim-export-template",
            value: {
                claimType: intake.claimType,
                exportFormat: report.claimExport.format,
                roomCount: report.inventory.roomCount,
                categoryCount: report.inventory.categoryCount,
                claimReady: report.completeness.claimReady,
            },
            confidence: report.completeness.claimReady ? 0.95 : 0.8,
            lesson: createMemoryLesson(report.completeness.claimReady
                ? {
                    outcome: "success",
                    evidence: "Claim export was ready.",
                    reuseRule: "Reuse this export shape when documentation is already complete.",
                }
                : {
                    outcome: "failure",
                    symptom: "Claim export was not fully ready.",
                    cause: report.completeness.missingFields.slice(0, 5).join("; ") || "Missing documentation fields",
                    fix: "Flagged missing documentation and generated reminders.",
                    prevention: "Check missing fields before marking the case ready for export.",
                    reuseRule: "Apply the same documentation checklist to similar claim cases.",
                    evidence: report.reminders.slice(0, 5).join("; "),
                }),
            sourceStepId: "report",
            editable: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: `memory_${randomUUID()}`,
            tenantId: intake.goal.tenantId,
            product: "provly",
            category: report.completeness.claimReady ? "success-pattern" : "business-rule",
            key: "provly.documentation-patterns",
            value: {
                missingFields: report.completeness.missingFields,
                reminders: report.reminders,
                highValueItemCount: report.inventory.highValueItemCount,
                topRooms: report.inventory.organizedByRoom.slice(0, 3).map((room) => room.roomLabel),
            },
            confidence: report.completeness.claimReady ? 0.92 : 0.78,
            lesson: createMemoryLesson(report.completeness.claimReady
                ? {
                    outcome: "success",
                    evidence: "Documentation patterns were complete enough for claim preparation.",
                    reuseRule: "Use the same documentation pattern when the room and item mix are similar.",
                }
                : {
                    outcome: "prevention",
                    symptom: "Documentation completeness was below claim-ready.",
                    cause: report.completeness.missingFields.join("; ") || "Missing document and claim fields",
                    fix: "Saved reminders and missing-field rules for the case.",
                    prevention: "Review claim documentation requirements before moving to export.",
                    reuseRule: "Use this reminder pattern whenever the same missing fields reappear.",
                    evidence: report.completeness.issues.map((issue) => issue.message).join("; "),
                }),
            sourceStepId: "completeness",
            editable: true,
            createdAt: now,
            updatedAt: now,
        },
    ];
    if (intake.preferences && Object.keys(intake.preferences).length > 0) {
        entries.push({
            id: `memory_${randomUUID()}`,
            tenantId: intake.goal.tenantId,
            product: "provly",
            category: "user-preference",
            key: "provly.user-preference",
            value: {
                preferredCurrency: intake.preferredCurrency,
                reminderMode: intake.reminderMode,
                exportFormat: intake.exportFormat,
                policyName: intake.policyName,
            },
            confidence: 0.88,
            lesson: createMemoryLesson({
                outcome: "success",
                evidence: "User preference profile was present.",
                reuseRule: "Reuse these preference settings for future claim-prep jobs in the same tenant.",
            }),
            sourceStepId: "capture",
            editable: true,
            createdAt: now,
            updatedAt: now,
        });
    }
    return entries;
}
//# sourceMappingURL=memory.js.map