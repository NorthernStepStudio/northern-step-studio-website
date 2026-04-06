"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commandRegistry_smoke_js_1 = require("./smoke/commandRegistry.smoke.js");
const askClient_smoke_js_1 = require("./smoke/askClient.smoke.js");
const modePreset_smoke_js_1 = require("./smoke/modePreset.smoke.js");
const buildFoundation_smoke_js_1 = require("./smoke/buildFoundation.smoke.js");
const requestBuilder_smoke_js_1 = require("./smoke/requestBuilder.smoke.js");
const reviewQueue_smoke_js_1 = require("./smoke/reviewQueue.smoke.js");
const serverUrl_smoke_js_1 = require("./smoke/serverUrl.smoke.js");
const workflow_smoke_js_1 = require("./smoke/workflow.smoke.js");
async function main() {
    (0, commandRegistry_smoke_js_1.runCommandRegistrySmoke)();
    (0, modePreset_smoke_js_1.runModePresetSmoke)();
    (0, buildFoundation_smoke_js_1.runBuildFoundationSmoke)();
    (0, requestBuilder_smoke_js_1.runRequestBuilderSmoke)();
    (0, reviewQueue_smoke_js_1.runReviewQueueSmoke)();
    (0, serverUrl_smoke_js_1.runServerUrlSmoke)();
    (0, workflow_smoke_js_1.runWorkflowSmoke)();
    await (0, askClient_smoke_js_1.runAskClientSmoke)();
}
void main();
//# sourceMappingURL=runSmoke.js.map