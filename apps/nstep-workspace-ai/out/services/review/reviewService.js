"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewItem = createReviewItem;
exports.canApplyReviewItem = canApplyReviewItem;
exports.approveReviewItem = approveReviewItem;
exports.rejectReviewItem = rejectReviewItem;
exports.markReviewItemStale = markReviewItemStale;
const text_js_1 = require("../../helpers/text.js");
function createReviewItem(input) {
    const resolvedProposedText = input.proposedText ?? (0, text_js_1.extractCodeFence)(input.responseText);
    const now = new Date().toISOString();
    return {
        id: `review-${Date.now()}`,
        title: input.title,
        prompt: input.prompt,
        summary: (0, text_js_1.truncateText)(input.responseText.replace(/\s+/g, " ").trim(), 220),
        targetPath: input.targetPath,
        originalText: input.originalText,
        previewMarkdown: buildReviewPreviewMarkdown(input, resolvedProposedText),
        createdAt: now,
        updatedAt: now,
        status: "pending",
        stale: false,
        sourceResponseId: input.sourceResponseId,
        proposedText: resolvedProposedText,
    };
}
function canApplyReviewItem(item) {
    return typeof item.proposedText === "string" && item.proposedText.trim().length > 0;
}
function approveReviewItem(item) {
    return {
        ...item,
        status: "approved",
        updatedAt: new Date().toISOString(),
    };
}
function rejectReviewItem(item) {
    return {
        ...item,
        status: "rejected",
        updatedAt: new Date().toISOString(),
    };
}
function markReviewItemStale(item, stale) {
    return {
        ...item,
        stale,
        updatedAt: new Date().toISOString(),
    };
}
function buildReviewPreviewMarkdown(input, proposedText) {
    return [
        `## ${input.title}`,
        "",
        `Target: \`${input.targetPath}\``,
        "",
        `Prompt: ${input.prompt}`,
        "",
        "### Proposal Summary",
        input.responseText,
        "",
        "### Apply Status",
        proposedText
            ? "A concrete proposed file body is available and can be applied to the active file after confirmation."
            : "No concrete proposed file body was returned. This proposal can be reviewed, but not auto-applied yet.",
    ].join("\n");
}
//# sourceMappingURL=reviewService.js.map