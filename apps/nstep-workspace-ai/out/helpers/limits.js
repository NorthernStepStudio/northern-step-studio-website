"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clampMinimum = clampMinimum;
exports.limitItems = limitItems;
function clampMinimum(value, minimum) {
    return Math.max(minimum, Math.trunc(value));
}
function limitItems(items, limit) {
    return items.slice(0, Math.max(0, limit));
}
//# sourceMappingURL=limits.js.map