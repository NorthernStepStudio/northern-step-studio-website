"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAskRequest = handleAskRequest;
const mCore_js_1 = require("../mCore.js");
async function handleAskRequest(config, request) {
    const runtime = (0, mCore_js_1.createMCoreRuntime)({
        ...config.mCore,
        logger: (0, mCore_js_1.createConsoleLogger)("m-core"),
    });
    return runtime.run(request);
}
//# sourceMappingURL=askService.js.map