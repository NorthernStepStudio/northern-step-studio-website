"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOffProvider = createOffProvider;
const responseTools_js_1 = require("../tools/responseTools.js");
function createOffProvider() {
    return {
        id: "off",
        describe() {
            return "M-CORE provider is off.";
        },
        async generate(input) {
            const title = (0, responseTools_js_1.buildResponseTitle)(input.request);
            const response = [
                "M-CORE is currently off.",
                `Prompt: ${input.request.prompt}`,
                `Agent: ${input.agent.title}`,
                "",
                "Next steps:",
                "- Enable the mock provider for deterministic local NSS responses.",
                "- Enable the Gemini provider when you want model-backed output.",
            ].join("\n");
            return {
                title,
                response,
                preview: "M-CORE is currently off.",
            };
        },
    };
}
//# sourceMappingURL=off.js.map