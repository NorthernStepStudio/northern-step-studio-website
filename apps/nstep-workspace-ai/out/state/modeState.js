"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveModeSelection = resolveModeSelection;
const defaults_js_1 = require("../config/defaults.js");
function resolveModeSelection(currentMode, fallbackMode = defaults_js_1.DEFAULT_MODE) {
    return currentMode ?? fallbackMode;
}
//# sourceMappingURL=modeState.js.map