"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKnowledgeRequestItems = getKnowledgeRequestItems;
const defaults_js_1 = require("../config/defaults.js");
function getKnowledgeRequestItems(knowledgeItems, limit = defaults_js_1.DEFAULT_REQUEST_KNOWLEDGE_LIMIT) {
    return knowledgeItems.slice(0, limit);
}
//# sourceMappingURL=knowledgeState.js.map