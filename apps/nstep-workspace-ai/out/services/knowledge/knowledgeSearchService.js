"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchKnowledgeItems = searchKnowledgeItems;
function searchKnowledgeItems(items, query) {
    const normalizedQuery = query.toLowerCase();
    return items.filter((item) => {
        return (item.title.toLowerCase().includes(normalizedQuery) ||
            item.excerpt.toLowerCase().includes(normalizedQuery) ||
            item.path.toLowerCase().includes(normalizedQuery));
    });
}
//# sourceMappingURL=knowledgeSearchService.js.map