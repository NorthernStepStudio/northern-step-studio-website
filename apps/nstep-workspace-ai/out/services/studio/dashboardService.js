"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildStudioDashboard = buildStudioDashboard;
function buildStudioDashboard(input) {
    const lines = [
        `Workspace: ${input.workspaceName}`,
        `Mode: ${input.modeTitle}`,
        `Preset: ${input.presetTitle}`,
        `Studio Project: ${input.projectTitle}`,
    ];
    if (input.taskHistory.length > 0) {
        lines.push("", "Recent tasks:", ...input.taskHistory.slice(0, 5).map((task) => `- ${task.kind}: ${task.summary}`));
    }
    if (input.reviewItems.length > 0) {
        lines.push("", "Review queue:", ...input.reviewItems.slice(0, 5).map((item) => `- ${item.title} (${item.status})`));
    }
    if (input.diagnosticSessions.length > 0) {
        lines.push("", "Diagnostics:", ...input.diagnosticSessions.slice(0, 5).map((session) => `- ${session.title} (${session.status})`));
    }
    if (input.roadmapNotes.length > 0) {
        lines.push("", "Roadmap:", ...input.roadmapNotes.slice(0, 5).map((note) => `- ${note.note}`));
    }
    return lines.join("\n");
}
//# sourceMappingURL=dashboardService.js.map