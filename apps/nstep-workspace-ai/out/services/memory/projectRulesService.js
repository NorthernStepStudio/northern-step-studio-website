"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProjectRule = createProjectRule;
exports.listProjectRulesForProject = listProjectRulesForProject;
function createProjectRule(projectId, rule) {
    return {
        id: `rule-${Date.now()}`,
        projectId,
        rule,
        createdAt: new Date().toISOString(),
    };
}
function listProjectRulesForProject(rules, projectId) {
    return rules.filter((rule) => rule.projectId === projectId);
}
//# sourceMappingURL=projectRulesService.js.map