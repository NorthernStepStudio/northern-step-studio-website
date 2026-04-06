export function defineStage3Permission(tool, actions, description, options = {}) {
    return {
        tool,
        actions: [...actions],
        allowExternalActions: options.allowExternalActions ?? false,
        requiresApprovalForExternalActions: options.requiresApprovalForExternalActions ?? false,
        permittedAgents: [...(options.permittedAgents ?? [])],
        description,
    };
}
export function defineStage3Descriptor(tool, provider, actions, permission, options = {}) {
    return {
        tool,
        provider,
        actions: [...actions],
        canRetry: options.canRetry ?? true,
        scoped: options.scoped ?? true,
        permission,
    };
}
//# sourceMappingURL=stage3-models.js.map