"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runModePresetSmoke = runModePresetSmoke;
const node_assert_1 = require("node:assert");
const modeService_js_1 = require("../../services/studio/modeService.js");
const presetService_js_1 = require("../../services/studio/presetService.js");
const studioProjectService_js_1 = require("../../services/studio/studioProjectService.js");
function runModePresetSmoke() {
    node_assert_1.strict.equal((0, presetService_js_1.suggestPresetIdFromPath)("D:\\dev\\Northern Step Studio\\apps\\nexusbuild"), "nexusbuild");
    node_assert_1.strict.equal((0, studioProjectService_js_1.suggestStudioProjectIdFromPath)("D:\\dev\\Northern Step Studio\\apps\\provly"), "provly");
    node_assert_1.strict.match((0, modeService_js_1.getModeDetails)("debugging"), /Debugging mode/i);
}
//# sourceMappingURL=modePreset.smoke.js.map