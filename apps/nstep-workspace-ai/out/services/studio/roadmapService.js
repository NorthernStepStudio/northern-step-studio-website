"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoadmapNote = createRoadmapNote;
exports.listRoadmapNotes = listRoadmapNotes;
function createRoadmapNote(projectId, note) {
    return {
        id: `roadmap-${Date.now()}`,
        projectId,
        note,
        status: "open",
        createdAt: new Date().toISOString(),
    };
}
function listRoadmapNotes(notes, projectId) {
    return notes.filter((note) => note.projectId === projectId);
}
//# sourceMappingURL=roadmapService.js.map