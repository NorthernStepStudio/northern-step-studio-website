"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudioProjectTitle = getStudioProjectTitle;
exports.getStudioProjectDescription = getStudioProjectDescription;
exports.suggestStudioProjectIdFromPath = suggestStudioProjectIdFromPath;
const studioProjects_js_1 = require("../../config/studioProjects.js");
function getStudioProjectTitle(projectId) {
    const normalizedId = normalizeProjectId(projectId);
    return studioProjects_js_1.STUDIO_PROJECTS.find((project) => project.id === normalizedId)?.title ?? normalizedId;
}
function getStudioProjectDescription(projectId) {
    const normalizedId = normalizeProjectId(projectId);
    return studioProjects_js_1.STUDIO_PROJECTS.find((project) => project.id === normalizedId)?.description ?? "";
}
function suggestStudioProjectIdFromPath(pathValue) {
    const normalized = (pathValue ?? "").toLowerCase();
    if (normalized.includes("responseos")) {
        return "synox";
    }
    return studioProjects_js_1.STUDIO_PROJECTS.map((project) => project.id).find((id) => normalized.includes(id)) ?? "general-nss-studio";
}
function normalizeProjectId(projectId) {
    return projectId === "responseos" ? "synox" : projectId;
}
//# sourceMappingURL=studioProjectService.js.map