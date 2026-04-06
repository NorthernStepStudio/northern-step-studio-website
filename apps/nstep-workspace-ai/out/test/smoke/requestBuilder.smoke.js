"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runRequestBuilderSmoke = runRequestBuilderSmoke;
const node_assert_1 = require("node:assert");
const requestBuilder_js_1 = require("../../api/requestBuilder.js");
function runRequestBuilderSmoke() {
    const request = (0, requestBuilder_js_1.buildAskRequest)({
        prompt: "Explain this helper",
        intent: "explain-file",
        workspaceName: "Northern Step Studio",
        workspacePath: "D:\\dev\\Northern Step Studio",
        preferredAgentId: "architect",
        build: {
            goal: "Add a reusable settings panel",
            scope: "workspace",
            target: "workspace",
            workspaceKind: "fullstack",
            frameworks: ["react"],
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
            steps: ["Inspect impacted packages"],
            validation: ["Run the workspace compile step."],
            rollback: ["Commit the shared contract separately."],
            relatedFiles: [
                {
                    path: "apps/nstep-workspace-ai/src/extension.ts",
                    score: 9,
                },
            ],
        },
        activeFile: {
            path: "apps/nstep-workspace-ai/src/extension.ts",
            languageId: "typescript",
            content: "export function test() {}",
            selection: "test",
        },
        project: {
            structureSummary: "- apps\n- docs",
        },
        codebaseSearchResults: [
            {
                path: "packages/m-core/src/agents/router.ts",
                content: "return stackExpertAgent;",
                score: 8,
            },
        ],
    });
    node_assert_1.strict.equal(request.prompt, "Explain this helper");
    node_assert_1.strict.equal(request.intent, "explain-file");
    node_assert_1.strict.equal(request.workspace.name, "Northern Step Studio");
    node_assert_1.strict.equal(request.preferredAgentId, "architect");
    node_assert_1.strict.equal(request.build?.template.id, "fullstack-app");
    node_assert_1.strict.equal(request.activeFile?.selection, "test");
    node_assert_1.strict.equal(request.project?.structureSummary, "- apps\n- docs");
    node_assert_1.strict.equal(request.codebase?.searchResults?.[0]?.path, "packages/m-core/src/agents/router.ts");
}
//# sourceMappingURL=requestBuilder.smoke.js.map