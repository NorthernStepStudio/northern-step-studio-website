"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModeTitle = getModeTitle;
exports.getModeDetails = getModeDetails;
const modes_js_1 = require("../../config/modes.js");
const MODE_DETAILS = {
    coding: "Coding mode focuses on implementation, code explanation, and code generation prompts.",
    debugging: "Debugging mode emphasizes task failures, likely error files, and repair trails.",
    product: "Product mode focuses on planning, briefs, and feature framing.",
    marketing: "Marketing mode emphasizes launch copy, positioning, and messaging drafts.",
    research: "Research mode prioritizes understanding, discovery, and documentation review.",
    architect: "Architect mode provides structural analysis, cross-app impact assessment, and deep schema-aware proposals for large-scale changes.",
};
function getModeTitle(modeId) {
    return modes_js_1.NSS_MODES.find((mode) => mode.id === modeId)?.title ?? modeId;
}
function getModeDetails(modeId) {
    return MODE_DETAILS[modeId];
}
//# sourceMappingURL=modeService.js.map