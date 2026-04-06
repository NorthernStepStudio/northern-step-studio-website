"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRepairTrail = buildRepairTrail;
function buildRepairTrail(session, tasks) {
    const relatedTasks = tasks.filter((task) => session.taskIds.includes(task.id));
    const lines = [`Session: ${session.title}`, `Status: ${session.status}`, ""];
    if (session.notes.length > 0) {
        lines.push("Notes:", ...session.notes.map((note) => `- ${note}`), "");
    }
    if (relatedTasks.length > 0) {
        lines.push("Task trail:", ...relatedTasks.map((task) => `- ${task.kind}: ${task.summary}`));
    }
    return lines.join("\n");
}
//# sourceMappingURL=repairTrailService.js.map