"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWorkspaceBriefing = buildWorkspaceBriefing;
function buildWorkspaceBriefing(input) {
    const lines = [
        `Workspace: ${input.workspaceName}`,
        `Mode: ${input.modeTitle}`,
        `Preset: ${input.presetTitle}`,
        `Studio Project: ${input.projectTitle}`,
    ];
    if (input.projectRules.length > 0) {
        lines.push("", "Project rules:", ...input.projectRules.slice(0, 6).map((rule) => `- ${rule.rule}`));
    }
    if (input.knowledgeItems.length > 0) {
        lines.push("", "Knowledge highlights:", ...input.knowledgeItems.slice(0, 5).map((item) => `- ${item.title}`));
    }
    if (input.roadmapNotes.length > 0) {
        lines.push("", "Roadmap notes:", ...input.roadmapNotes.slice(0, 5).map((note) => `- ${note.note}`));
    }
    return lines.join("\n");
}
//# sourceMappingURL=workspaceBriefingService.js.map