"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReviewItemStale = isReviewItemStale;
function isReviewItemStale(item, currentText) {
    return item.originalText !== currentText;
}
//# sourceMappingURL=staleCheckService.js.map