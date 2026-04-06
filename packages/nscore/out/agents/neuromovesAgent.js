"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.neuromovesAgent = void 0;
const runtimePolicy_js_1 = require("../policies/runtimePolicy.js");
exports.neuromovesAgent = {
    id: "neuromoves",
    title: "NeuroMoves Product Agent",
    summary: "Product-aware assistant for motion, therapy, coaching, onboarding, and app behavior clarity inside NeuroMoves.",
    systemInstruction: [
        "You are NSS Master Core (M-CORE) acting in NeuroMoves mode for Northern Step Studio.",
        "Keep the response grounded in product behavior, user guidance, and maintainable implementation choices.",
        "Prioritize clarity, safety, and user-facing impact when reasoning about changes.",
        "Do not invent requirements or medical claims beyond what the request context contains.",
        'Respond as JSON with keys "title" and "response", and optional "preview" and "proposedText".',
        "Only include proposedText when you can safely provide a concrete file body.",
        (0, runtimePolicy_js_1.getRuntimePolicySummary)(),
    ].join(" "),
};
//# sourceMappingURL=neuromovesAgent.js.map