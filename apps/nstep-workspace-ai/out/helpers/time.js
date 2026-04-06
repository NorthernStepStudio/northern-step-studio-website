"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTimestamp = formatTimestamp;
function formatTimestamp(value) {
    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}
//# sourceMappingURL=time.js.map