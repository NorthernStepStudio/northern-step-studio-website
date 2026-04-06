"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAskRequest = buildAskRequest;
function buildAskRequest(input) {
    return {
        prompt: input.prompt.trim(),
        intent: input.intent,
        workspace: {
            name: input.workspaceName,
            rootPath: input.workspacePath,
        },
        preferredAgentId: input.preferredAgentId,
        mode: input.mode,
        presetId: input.presetId,
        studioProjectId: input.studioProjectId,
        activeFile: input.activeFile,
        project: input.project,
        memory: input.memory,
        knowledge: input.knowledge,
        task: input.task,
        codebase: mergeCodebaseContext(input.codebase, input.codebaseSearchResults),
        workflow: input.workflow,
        events: input.events,
        appSnapshot: input.appSnapshot,
        build: input.build,
    };
}
function mergeCodebaseContext(codebase, searchResults) {
    if (!codebase && !searchResults) {
        return undefined;
    }
    if (!searchResults || searchResults.length === 0) {
        return codebase;
    }
    return {
        ...(codebase ?? {}),
        searchResults: [...(codebase?.searchResults ?? []), ...searchResults],
    };
}
//# sourceMappingURL=requestBuilder.js.map