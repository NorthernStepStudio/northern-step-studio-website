"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveDiagnosticSession = getActiveDiagnosticSession;
function getActiveDiagnosticSession(sessions, activeSessionId) {
    if (!activeSessionId) {
        return sessions.find((session) => session.status === "active") ?? sessions[0];
    }
    return sessions.find((session) => session.id === activeSessionId) ?? sessions[0];
}
//# sourceMappingURL=diagnosticState.js.map