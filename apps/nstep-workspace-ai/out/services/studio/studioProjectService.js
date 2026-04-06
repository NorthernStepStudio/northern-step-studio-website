"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudioProjectTitle = getStudioProjectTitle;
exports.getStudioProjectDescription = getStudioProjectDescription;
exports.suggestStudioProjectIdFromPath = suggestStudioProjectIdFromPath;
const studioProjects_js_1 = require("../../config/studioProjects.js");
function getStudioProjectTitle(projectId) {
    return studioProjects_js_1.STUDIO_PROJECTS.find((project) => project.id === projectId)?.title ?? projectId;
}
function getStudioProjectDescription(projectId) {
    return studioProjects_js_1.STUDIO_PROJECTS.find((project) => project.id === projectId)?.description ?? "";
}
function suggestStudioProjectIdFromPath(pathValue) {
    const normalized = (pathValue ?? "").toLowerCase();
    return studioProjects_js_1.STUDIO_PROJECTS.map((project) => project.id).find((id) => normalized.includes(id)) ?? "general-nss-studio";
}
//# sourceMappingURL=studioProjectService.js.map