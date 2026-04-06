import { randomUUID } from "node:crypto";
export function buildProvLyAnalysisReport(context) {
    const now = new Date().toISOString();
    const reportId = `report_${randomUUID()}`;
    return {
        reportId,
        tenantId: context.intake.goal.tenantId,
        caseId: context.intake.caseId,
        operation: context.intake.operation,
        title: `${context.intake.claimantName} inventory review`,
        summary: buildSummary(context),
        claimType: context.intake.claimType,
        inventory: {
            itemCount: context.classification.items.length,
            roomCount: context.classification.rooms.length,
            categoryCount: context.classification.categories.length,
            attachmentCount: context.intake.attachments.length,
            receiptCount: context.intake.receipts.length,
            totalEstimatedValue: context.classification.totalEstimatedValue,
            highValueItemCount: context.classification.highValueItems.length,
            organizedByRoom: context.classification.rooms.map((room) => ({
                roomId: room.roomId,
                roomLabel: room.label,
                itemCount: room.itemCount,
                estimatedValue: room.estimatedValue,
                highValueCount: room.highValueCount,
            })),
            organizedByCategory: context.classification.categories.map((category) => ({
                categoryId: category.categoryId,
                categoryLabel: category.label,
                itemCount: category.itemCount,
                estimatedValue: category.estimatedValue,
                highValueCount: category.highValueCount,
            })),
        },
        completeness: context.completeness,
        claimExport: context.claimExport,
        warnings: buildWarnings(context),
        reminders: buildReminders(context),
        createdAt: now,
        updatedAt: now,
        metadata: {
            jobId: context.job.jobId,
            workflow: "provly",
            approvalStatus: context.job.approvalStatus,
            reminderStatus: context.reminderResult?.status,
            completenessScore: context.completeness.score,
            claimReady: context.completeness.claimReady,
            itemCount: context.classification.items.length,
            visualExtraction: resolveVisualExtractionSummary(context),
        },
    };
}
export function buildProvLyWorkflowResult(context, report) {
    const status = resolveStatus(context, report);
    return {
        status,
        summary: report.summary,
        actionsTaken: [...context.actionsTaken, ...buildReminderActionNotes(context)],
        data: {
            report,
            dashboard: buildDashboardSummary(context, report),
            inventory: context.classification.items,
            rooms: context.classification.rooms,
            categories: context.classification.categories,
            completeness: context.completeness,
            claimExport: context.claimExport,
            reminder: context.reminderResult,
            persistence: context.persistence,
            highValueItems: context.classification.highValueItems,
        },
    };
}
export function buildProvLyActions(context) {
    const actions = [
        "captured inventory intake",
        "normalized item records",
        "classified rooms and categories",
        "checked documentation completeness",
        "prepared claim export",
        "built dashboard report",
        "persisted workflow artifacts",
    ];
    if (context.reminderResult?.status === "sent") {
        actions.splice(5, 0, "sent documentation reminder");
    }
    else if (context.reminderResult?.status === "draft") {
        actions.splice(5, 0, "prepared reminder draft");
    }
    return actions;
}
function buildSummary(context) {
    const completenessLine = context.completeness.claimReady && context.completeness.status === "pass"
        ? "The claim packet is ready."
        : context.completeness.status === "warn"
            ? "The packet is close to ready, but a few documentation gaps remain."
            : "The packet still needs documentation before final submission.";
    const reminderLine = context.reminderResult?.status === "sent" ? "A reminder was sent." : context.reminderResult?.status === "draft" ? "A reminder draft was prepared." : "No reminder dispatch was needed.";
    const extraction = resolveVisualExtractionSummary(context);
    const extractionLine = extraction && extraction.extractedItemCount + extraction.extractedReceiptCount > 0
        ? `Visual extraction added ${extraction.extractedItemCount} item draft(s) and ${extraction.extractedReceiptCount} receipt draft(s).`
        : extraction?.candidateCount
            ? "Visual assets were reviewed but no structured records were extracted."
            : "No visual extraction was needed.";
    return `${context.intake.claimantName}'s ${context.intake.claimType} inventory was organized across ${context.classification.rooms.length} room(s) and ${context.classification.categories.length} category group(s). ${completenessLine} ${reminderLine} ${extractionLine}`;
}
function buildWarnings(context) {
    const warnings = new Set();
    for (const issue of context.completeness.issues) {
        warnings.add(issue.message);
    }
    for (const note of context.claimPrep.ruleNotes) {
        warnings.add(note);
    }
    for (const note of context.completeness.reminders) {
        if (/missing|need|attach|add|review|incomplete/i.test(note)) {
            warnings.add(note);
        }
    }
    if (context.completeness.missingFields.length > 0) {
        warnings.add(`${context.completeness.missingFields.length} missing field(s) require attention.`);
    }
    return [...warnings];
}
function buildReminders(context) {
    return [...new Set([...context.completeness.reminders, ...(context.reminderResult?.status === "draft" ? ["Reminder draft prepared for follow-up."] : [])])];
}
function resolveStatus(context, report) {
    if (context.classification.items.length === 0) {
        return "partial";
    }
    if (!context.completeness.claimReady) {
        return "partial";
    }
    if (context.reminderResult?.status === "failed") {
        return "partial";
    }
    if (report.warnings.length > 0 && context.completeness.status !== "pass") {
        return "partial";
    }
    return "succeeded";
}
function buildDashboardSummary(context, report) {
    const visualExtraction = resolveVisualExtractionSummary(context);
    return {
        caseId: context.intake.caseId,
        claimantName: context.intake.claimantName,
        claimType: context.intake.claimType,
        operation: context.intake.operation,
        itemCount: report.inventory.itemCount,
        roomCount: report.inventory.roomCount,
        categoryCount: report.inventory.categoryCount,
        attachmentCount: report.inventory.attachmentCount,
        receiptCount: report.inventory.receiptCount,
        completenessScore: report.completeness.score,
        claimReady: report.completeness.claimReady,
        exportStatus: report.claimExport.status,
        highValueItemCount: report.inventory.highValueItemCount,
        missingFieldCount: report.completeness.missingFields.length,
        reminderCount: report.reminders.length,
        totalEstimatedValue: report.inventory.totalEstimatedValue,
        policyDeadline: context.intake.policyDeadline,
        topRooms: report.inventory.organizedByRoom.slice(0, 5),
        topCategories: report.inventory.organizedByCategory.slice(0, 5),
        visualExtraction,
        highValueItems: context.classification.highValueItems.slice(0, 10).map((item) => ({
            itemId: item.itemId,
            name: item.name,
            roomLabel: item.roomLabel,
            categoryLabel: item.categoryLabel,
            estimatedValue: item.estimatedValue,
            currency: item.currency,
        })),
    };
}
function resolveVisualExtractionSummary(context) {
    const visualExtraction = context.intake.claimContext.visualExtraction;
    if (!visualExtraction || typeof visualExtraction !== "object" || Array.isArray(visualExtraction)) {
        return undefined;
    }
    return visualExtraction;
}
function buildReminderActionNotes(context) {
    if (context.reminderResult?.status === "sent") {
        return ["sent documentation reminder"];
    }
    if (context.reminderResult?.status === "draft") {
        return ["prepared documentation reminder draft"];
    }
    if (context.reminderResult?.status === "skipped") {
        return ["skipped reminder dispatch"];
    }
    return [];
}
//# sourceMappingURL=report.js.map