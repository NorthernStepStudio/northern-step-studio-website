"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveReview = getActiveReview;
exports.getReviewCounts = getReviewCounts;
exports.markReviewItemApplied = markReviewItemApplied;
function getActiveReview(reviewItems, activeReviewId) {
    if (!activeReviewId) {
        return reviewItems[0];
    }
    return reviewItems.find((item) => item.id === activeReviewId) ?? reviewItems[0];
}
function getReviewCounts(reviewItems) {
    return {
        pending: reviewItems.filter((item) => item.status === "pending").length,
        approved: reviewItems.filter((item) => item.status === "approved").length,
    };
}
function markReviewItemApplied(reviewItems, reviewId) {
    return reviewItems.map((item) => item.id === reviewId
        ? {
            ...item,
            status: "applied",
            stale: false,
            updatedAt: new Date().toISOString(),
        }
        : item);
}
//# sourceMappingURL=reviewState.js.map