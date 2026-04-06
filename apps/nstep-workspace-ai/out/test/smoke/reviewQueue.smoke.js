"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runReviewQueueSmoke = runReviewQueueSmoke;
const node_assert_1 = require("node:assert");
const reviewService_js_1 = require("../../services/review/reviewService.js");
function runReviewQueueSmoke() {
    const reviewItem = (0, reviewService_js_1.createReviewItem)({
        title: "Proposed Edit: extension.ts",
        prompt: "Refactor activation",
        targetPath: "src/extension.ts",
        originalText: "old content",
        responseText: "Summary\n\n```ts\nexport const restored = true;\n```",
    });
    node_assert_1.strict.equal(reviewItem.targetPath, "src/extension.ts");
    node_assert_1.strict.equal((0, reviewService_js_1.canApplyReviewItem)(reviewItem), true);
    node_assert_1.strict.equal(reviewItem.proposedText, "export const restored = true;");
    node_assert_1.strict.match(reviewItem.previewMarkdown, /Apply Status/);
}
//# sourceMappingURL=reviewQueue.smoke.js.map