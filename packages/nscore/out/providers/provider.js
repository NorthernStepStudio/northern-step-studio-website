"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResponseOsProvider = createResponseOsProvider;
const gemini_js_1 = require("./gemini.js");
const mock_js_1 = require("./mock.js");
const off_js_1 = require("./off.js");
function createResponseOsProvider(config) {
    switch (config.providerMode) {
        case "gemini":
            return (0, gemini_js_1.createGeminiProvider)(config);
        case "off":
            return (0, off_js_1.createOffProvider)();
        case "mock":
        default:
            return (0, mock_js_1.createMockProvider)();
    }
}
//# sourceMappingURL=provider.js.map