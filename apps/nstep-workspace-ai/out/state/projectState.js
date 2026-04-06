"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveStudioProjectSelection = resolveStudioProjectSelection;
const defaults_js_1 = require("../config/defaults.js");
const workspace_js_1 = require("../helpers/workspace.js");
function resolveStudioProjectSelection(currentProjectId, workspacePath, autoSuggest) {
    if (currentProjectId) {
        return currentProjectId;
    }
    if (autoSuggest && workspacePath) {
        return (0, workspace_js_1.inferStudioProjectIdFromPath)(workspacePath);
    }
    return defaults_js_1.DEFAULT_STUDIO_PROJECT_ID;
}
//# sourceMappingURL=projectState.js.map