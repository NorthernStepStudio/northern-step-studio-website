"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePresetSelection = resolvePresetSelection;
const defaults_js_1 = require("../config/defaults.js");
const workspace_js_1 = require("../helpers/workspace.js");
function resolvePresetSelection(currentPresetId, workspacePath, autoSuggest) {
    if (currentPresetId) {
        return currentPresetId;
    }
    if (autoSuggest && workspacePath) {
        return (0, workspace_js_1.inferPresetIdFromPath)(workspacePath);
    }
    return defaults_js_1.DEFAULT_PRESET_ID;
}
//# sourceMappingURL=presetState.js.map