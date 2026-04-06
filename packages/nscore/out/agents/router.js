"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAgentForRequest = resolveAgentForRequest;
const generalAgent_js_1 = require("./generalAgent.js");
const stackExpertAgent_js_1 = require("./stackExpertAgent.js");
const architectAgent_js_1 = require("./architectAgent.js");
const workspaceOpsAgent_js_1 = require("./workspaceOpsAgent.js");
function resolveAgentForRequest(request) {
    if (request.preferredAgentId) {
        const preferredAgent = resolvePreferredAgent(request.preferredAgentId);
        if (preferredAgent) {
            return preferredAgent;
        }
    }
    if (request.mode === "architect")
        return architectAgent_js_1.architectAgent;
    if (request.mode === "coding" || request.mode === "debugging")
        return stackExpertAgent_js_1.stackExpertAgent;
    if (request.mode === "product")
        return workspaceOpsAgent_js_1.workspaceOpsAgent;
    const structuralIntents = ["propose-multi-file-change", "explain-project-structure", "change-plan"];
    if (structuralIntents.includes(request.intent)) {
        return architectAgent_js_1.architectAgent;
    }
    if (hasStudioStackSignals(request)) {
        return stackExpertAgent_js_1.stackExpertAgent;
    }
    const isTechnicalFile = request.activeFile?.languageId &&
        ["typescript", "typescriptreact", "javascript", "javascriptreact", "prisma", "sql", "json"].includes(request.activeFile.languageId);
    if (isTechnicalFile || request.intent === "propose-edit" || request.intent === "propose-error-file-fix") {
        return stackExpertAgent_js_1.stackExpertAgent;
    }
    return generalAgent_js_1.generalAgent;
}
function resolvePreferredAgent(agentId) {
    switch (agentId) {
        case "general":
            return generalAgent_js_1.generalAgent;
        case "workspace-ops":
            return workspaceOpsAgent_js_1.workspaceOpsAgent;
        case "stack-expert":
            return stackExpertAgent_js_1.stackExpertAgent;
        case "architect":
            return architectAgent_js_1.architectAgent;
        default:
            return undefined;
    }
}
function hasStudioStackSignals(request) {
    const dependencyNames = request.codebase?.dependencies?.flatMap((entry) => entry.dependencies) ?? [];
    if (dependencyNames.some((dependency) => isStackDependency(dependency))) {
        return true;
    }
    if (hasStackContentSignals(request.activeFile?.content ?? "")) {
        return true;
    }
    const searchResultText = request.codebase?.searchResults?.map((result) => `${result.path}\n${result.content}`).join("\n") ?? "";
    return hasStackContentSignals(searchResultText);
}
function isStackDependency(dependency) {
    const normalized = dependency.toLowerCase();
    return (normalized === "hono" ||
        normalized === "react" ||
        normalized === "react-dom" ||
        normalized === "@types/react" ||
        normalized === "@supabase/supabase-js" ||
        normalized.includes("supabase"));
}
function hasStackContentSignals(content) {
    if (!content) {
        return false;
    }
    const patterns = [
        /\bnew\s+Hono\s*\(/i,
        /\bfrom\s+["'][^"']*hono[^"']*["']/i,
        /\bcreateClient\s*\(/i,
        /\bsupabase\.(from|auth|storage|rpc)\b/i,
        /\buseState\s*\(/i,
        /\buseEffect\s*\(/i,
        /<\s*[A-Z][\w.-]*(?:\s|>|\/)/,
    ];
    return patterns.some((pattern) => pattern.test(content));
}
//# sourceMappingURL=router.js.map