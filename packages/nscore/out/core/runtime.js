"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMCoreRuntime = void 0;
exports.createResponseOsRuntime = createResponseOsRuntime;
exports.runAgent = runAgent;
const router_js_1 = require("../agents/router.js");
const provider_js_1 = require("../providers/provider.js");
const budget_js_1 = require("./budget.js");
const logger_js_1 = require("./logger.js");
function createResponseOsRuntime(config) {
    const logger = config.logger ?? (0, logger_js_1.createNoopLogger)();
    const provider = (0, provider_js_1.createResponseOsProvider)(config);
    return {
        providerMode: provider.id,
        describeProvider() {
            return provider.describe();
        },
        async run(request) {
            validateAskRequest(request);
            const agent = (0, router_js_1.resolveAgentForRequest)(request);
            const budget = (0, budget_js_1.resolveBudgetForIntent)(request.intent);
            logger.debug("M-CORE runtime handling request.", {
                intent: request.intent,
                provider: provider.id,
                agent: agent.id,
            });
            return provider.generate({
                request,
                agent,
                budget,
                logger,
            });
        },
    };
}
function validateAskRequest(request) {
    if (!request || typeof request !== "object") {
        throw new Error("Request body must be a JSON object.");
    }
    if (typeof request.prompt !== "string" || request.prompt.trim().length === 0) {
        throw new Error("Request body must include a non-empty prompt.");
    }
    if (typeof request.intent !== "string" || request.intent.trim().length === 0) {
        throw new Error("Request body must include a non-empty intent.");
    }
    if (!request.workspace || typeof request.workspace.name !== "string" || request.workspace.name.trim().length === 0) {
        throw new Error("Request body must include workspace.name.");
    }
}
exports.createMCoreRuntime = createResponseOsRuntime;
async function runAgent(config, request) {
    return createResponseOsRuntime(config).run(request);
}
//# sourceMappingURL=runtime.js.map