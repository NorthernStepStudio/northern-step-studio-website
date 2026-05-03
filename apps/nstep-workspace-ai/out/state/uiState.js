"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServerStatusLabel = getServerStatusLabel;
function getServerStatusLabel(serverHealth) {
    if (serverHealth.status === "online") {
        return "Synox runtime connected";
    }
    if (serverHealth.status === "offline") {
        return "Synox runtime offline";
    }
    return "Synox runtime unknown";
}
//# sourceMappingURL=uiState.js.map