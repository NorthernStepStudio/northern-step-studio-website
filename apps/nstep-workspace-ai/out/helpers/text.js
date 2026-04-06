"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncateText = truncateText;
exports.extractCodeFence = extractCodeFence;
function truncateText(value, maxLength) {
    if (value.length <= maxLength) {
        return value;
    }
    return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}
function extractCodeFence(value) {
    const match = value.match(/```(?:[\w-]+)?\r?\n([\s\S]*?)```/);
    return match?.[1]?.trim();
}
//# sourceMappingURL=text.js.map