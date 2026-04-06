"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = require("node:assert");
const router_js_1 = require("../agents/router.js");
const runtime_js_1 = require("../core/runtime.js");
async function main() {
    const request = createRequest();
    const mockRuntime = (0, runtime_js_1.createResponseOsRuntime)({
        providerMode: "mock",
        requestTimeoutMs: 30_000,
    });
    const mockResponse = await mockRuntime.run(request);
    node_assert_1.strict.equal(mockResponse.title, "Explain extension.ts");
    (0, node_assert_1.strict)(mockResponse.response.includes("Agent: NSS Stack Expert"));
    (0, node_assert_1.strict)(mockResponse.response.includes("Active file:"));
    (0, node_assert_1.strict)(mockResponse.response.includes("Build foundation:"));
    const offRuntime = (0, runtime_js_1.createResponseOsRuntime)({
        providerMode: "off",
        requestTimeoutMs: 30_000,
    });
    const offResponse = await offRuntime.run(request);
    (0, node_assert_1.strict)(offResponse.response.includes("M-CORE is currently off."));
    const workspaceOpsAgent = (0, router_js_1.resolveAgentForRequest)({
        ...request,
        mode: "product",
    });
    node_assert_1.strict.equal(workspaceOpsAgent.id, "workspace-ops");
    const preferredAgent = (0, router_js_1.resolveAgentForRequest)({
        ...request,
        mode: "product",
        preferredAgentId: "architect",
    });
    node_assert_1.strict.equal(preferredAgent.id, "architect");
    const stackByDependencies = (0, router_js_1.resolveAgentForRequest)({
        ...request,
        codebase: {
            dependencies: [
                {
                    app: "apps/nss-workspace-ai",
                    dependencies: ["hono", "@supabase/supabase-js", "react"],
                    internalLinks: [],
                },
            ],
        },
    });
    node_assert_1.strict.equal(stackByDependencies.id, "stack-expert");
    const stackByContent = (0, router_js_1.resolveAgentForRequest)({
        ...request,
        activeFile: {
            ...request.activeFile,
            content: [
                'import { Hono } from "hono";',
                'import { createClient } from "@supabase/supabase-js";',
                "export function renderApp() {",
                "  return <App />;",
                "}",
            ].join("\n"),
        },
    });
    node_assert_1.strict.equal(stackByContent.id, "stack-expert");
}
function createRequest() {
    return {
        prompt: "Explain this file clearly.",
        intent: "explain-file",
        workspace: {
            name: "Northern Step Studio",
            rootPath: "D:\\dev\\Northern Step Studio",
        },
        activeFile: {
            path: "apps/nss-workspace-ai/src/extension.ts",
            languageId: "typescript",
            content: "import * as vscode from 'vscode';\nexport function run() {}\n",
        },
        build: {
            goal: "Add a reusable settings panel",
            scope: "workspace",
            target: "workspace",
            workspaceKind: "fullstack",
            frameworks: ["react", "hono"],
            runtimes: ["node"],
            databases: ["supabase"],
            testTools: ["vitest"],
            focusAreas: ["state", "testing"],
            template: {
                id: "fullstack-app",
                title: "Full-Stack App Template",
                description: "Structure backend, frontend, and shared contracts as distinct layers.",
                rationale: "The workspace is full-stack.",
            },
            steps: ["Inspect impacted packages", "Implement the change"],
            validation: ["Run the workspace compile step."],
            rollback: ["Commit the shared contract separately."],
            relatedFiles: [
                {
                    path: "apps/nss-workspace-ai/src/extension.ts",
                    score: 9,
                },
            ],
        },
    };
}
void main();
//# sourceMappingURL=runSmoke.js.map