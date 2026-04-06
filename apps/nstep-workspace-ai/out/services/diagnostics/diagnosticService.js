"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDiagnosticSessionFromTask = startDiagnosticSessionFromTask;
exports.addNoteToDiagnosticSession = addNoteToDiagnosticSession;
exports.attachTaskToDiagnosticSession = attachTaskToDiagnosticSession;
exports.closeDiagnosticSession = closeDiagnosticSession;
function startDiagnosticSessionFromTask(task) {
    const now = new Date().toISOString();
    return {
        id: `diagnostic-${Date.now()}`,
        title: `Diagnostic: ${task.kind}`,
        status: "active",
        summary: task.summary,
        createdAt: now,
        updatedAt: now,
        taskIds: [task.id],
        notes: [],
    };
}
function addNoteToDiagnosticSession(session, note) {
    return {
        ...session,
        notes: [...session.notes, note],
        updatedAt: new Date().toISOString(),
    };
}
function attachTaskToDiagnosticSession(session, task) {
    return {
        ...session,
        taskIds: session.taskIds.includes(task.id) ? session.taskIds : [...session.taskIds, task.id],
        summary: task.summary,
        updatedAt: new Date().toISOString(),
    };
}
function closeDiagnosticSession(session, status) {
    return {
        ...session,
        status,
        updatedAt: new Date().toISOString(),
    };
}
//# sourceMappingURL=diagnosticService.js.map