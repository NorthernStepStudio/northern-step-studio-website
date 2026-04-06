"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyReviewItemToActiveFile = applyReviewItemToActiveFile;
exports.applyReviewItemToSelection = applyReviewItemToSelection;
const editor_js_1 = require("../../helpers/editor.js");
async function applyReviewItemToActiveFile(editor, item) {
    if (!item.proposedText) {
        throw new Error("This proposal does not include a concrete file body to apply.");
    }
    await (0, editor_js_1.replaceEditorContent)(editor, item.proposedText);
}
async function applyReviewItemToSelection(editor, item) {
    if (!item.proposedText) {
        throw new Error("This review item does not include concrete text to apply.");
    }
    await (0, editor_js_1.insertTextIntoEditor)(editor, item.proposedText);
}
//# sourceMappingURL=applyService.js.map