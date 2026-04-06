"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPresetTitle = getPresetTitle;
exports.suggestPresetIdFromPath = suggestPresetIdFromPath;
const presets_js_1 = require("../../config/presets.js");
function getPresetTitle(presetId) {
    return presets_js_1.NSS_PRESETS.find((preset) => preset.id === presetId)?.title ?? presetId;
}
function suggestPresetIdFromPath(pathValue) {
    const normalized = (pathValue ?? "").toLowerCase();
    return presets_js_1.NSS_PRESETS.map((preset) => preset.id).find((id) => normalized.includes(id)) ?? "general-nss-studio";
}
//# sourceMappingURL=presetService.js.map