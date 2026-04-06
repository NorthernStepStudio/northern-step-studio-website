"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBuildContext = createBuildContext;
function createBuildContext(report) {
    return {
        goal: report.goal,
        scope: report.buildSpec.scope,
        target: report.buildSpec.target,
        workspaceKind: report.capabilityProfile.primaryKind,
        frameworks: [...report.capabilityProfile.frameworks],
        runtimes: [...report.capabilityProfile.runtimes],
        databases: [...report.capabilityProfile.databases],
        testTools: [...report.capabilityProfile.testTools],
        focusAreas: [...report.buildSpec.focusAreas],
        template: { ...report.plan.template },
        steps: [...report.plan.steps],
        validation: [...report.plan.validation],
        rollback: [...report.plan.rollback],
        relatedFiles: report.relatedFiles.map((file) => ({
            path: file.path,
            score: file.score,
        })),
    };
}
//# sourceMappingURL=buildContextService.js.map