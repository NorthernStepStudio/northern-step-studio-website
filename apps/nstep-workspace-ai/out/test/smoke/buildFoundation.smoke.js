"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBuildFoundationSmoke = runBuildFoundationSmoke;
const node_assert_1 = require("node:assert");
const buildPlanService_js_1 = require("../../services/foundation/buildPlanService.js");
const buildSpecService_js_1 = require("../../services/foundation/buildSpecService.js");
const workspaceCapabilityService_js_1 = require("../../services/foundation/workspaceCapabilityService.js");
function runBuildFoundationSmoke() {
    const profile = (0, workspaceCapabilityService_js_1.inferWorkspaceCapabilityProfile)({
        workspaceName: "Northern Step Studio",
        workspacePath: "D:\\dev\\Northern Step Studio",
        packageSnapshots: [
            {
                path: "apps/nstep-workspace-ai/package.json",
                name: "nss-workspace-ai",
                dependencies: ["hono", "@supabase/supabase-js", "react", "vitest"],
                scripts: ["build", "test"],
            },
        ],
        dependencyGraph: [
            {
                app: "apps/nstep-workspace-ai",
                dependencies: ["hono", "@supabase/supabase-js", "react"],
                internalLinks: ["packages/m-core"],
            },
        ],
    });
    const spec = (0, buildSpecService_js_1.createBuildSpec)("Build a reusable settings panel for the workspace", profile);
    const plan = (0, buildPlanService_js_1.createBuildPlan)(spec, profile);
    node_assert_1.strict.equal(profile.primaryKind, "fullstack");
    (0, node_assert_1.strict)(profile.summary.includes("Northern Step Studio"));
    node_assert_1.strict.equal(spec.scope, "workspace");
    (0, node_assert_1.strict)(plan.template.id === "fullstack-app" || plan.template.id === "api-service");
    (0, node_assert_1.strict)(plan.steps.length >= 4);
    (0, node_assert_1.strict)(plan.validation.some((entry) => entry.includes("vitest")));
}
//# sourceMappingURL=buildFoundation.smoke.js.map