"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPresetTitle = getPresetTitle;
exports.suggestPresetIdFromPath = suggestPresetIdFromPath;
const presets_js_1 = require("../../config/presets.js");
function getPresetTitle(presetId) {
    const normalizedId = normalizePresetId(presetId);
    return presets_js_1.NSS_PRESETS.find((preset) => preset.id === normalizedId)?.title ?? normalizedId;
}
function suggestPresetIdFromPath(pathValue) {
    const normalized = (pathValue ?? "").toLowerCase();
    if (normalized.includes("responseos")) {
        return "synox";
    }
    return presets_js_1.NSS_PRESETS.map((preset) => preset.id).find((id) => normalized.includes(id)) ?? "general-nss-studio";
}
function normalizePresetId(presetId) {
    return presetId === "responseos" ? "synox" : presetId;
}
//# sourceMappingURL=presetService.js.map