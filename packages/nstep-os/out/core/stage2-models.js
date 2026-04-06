export function defineStage2Permission(scope, capabilities, description, options = {}) {
    return {
        scope,
        capabilities: [...capabilities],
        mayUseExternalTools: options.mayUseExternalTools ?? false,
        requiresApprovalForExternalActions: options.requiresApprovalForExternalActions ?? false,
        description,
    };
}
export function defineStage2Responsibility(title, summary, stage1Touchpoints) {
    return {
        title,
        summary,
        stage1Touchpoints: [...stage1Touchpoints],
    };
}
//# sourceMappingURL=stage2-models.js.map