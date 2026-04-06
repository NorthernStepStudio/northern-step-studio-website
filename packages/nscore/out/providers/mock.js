"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockProvider = createMockProvider;
const responseTools_js_1 = require("../tools/responseTools.js");
function createMockProvider() {
    return {
        id: "mock",
        describe() {
            return "M-CORE mock mode. Deterministic local responses, no external model required.";
        },
        async generate(input) {
            const title = (0, responseTools_js_1.buildResponseTitle)(input.request);
            const response = (0, responseTools_js_1.buildMockResponseBody)(input.request, input.agent);
            return {
                title,
                response,
                preview: response.split("\n").slice(0, 4).join("\n"),
            };
        },
    };
}
//# sourceMappingURL=mock.js.map