"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NssStateStore = void 0;
exports.createInitialState = createInitialState;
const defaults_js_1 = require("../config/defaults.js");
const pruning_js_1 = require("../storage/pruning.js");
const storageKeys_js_1 = require("../storage/storageKeys.js");
const storageLimits_js_1 = require("../storage/storageLimits.js");
function createInitialState() {
    return {
        responseHistory: [],
        reviewItems: [],
        serverHealth: {
            status: "unknown",
            detail: "No backend request yet.",
            checkedAt: new Date().toISOString(),
        },
        taskHistory: [],
        diagnosticSessions: [],
        projectRules: [],
        repairPatterns: [],
        recurringFailures: [],
        mode: defaults_js_1.DEFAULT_MODE,
        presetId: defaults_js_1.DEFAULT_PRESET_ID,
        studioProjectId: defaults_js_1.DEFAULT_STUDIO_PROJECT_ID,
        knowledgeItems: [],
        roadmapNotes: [],
        persistentMemories: [],
    };
}
function cloneState(value) {
    return JSON.parse(JSON.stringify(value));
}
class NssStateStore {
    context;
    state;
    legacyStorageKey;
    constructor(context) {
        this.context = context;
        const persistedState = this.context.workspaceState.get(storageKeys_js_1.NSS_WORKSPACE_STATE_STORAGE_KEY);
        if (persistedState) {
            this.state = hydrateState(persistedState);
            return;
        }
        const legacyEntry = storageKeys_js_1.NSS_LEGACY_WORKSPACE_STATE_KEYS.find((key) => this.context.workspaceState.get(key) !== undefined);
        this.legacyStorageKey = legacyEntry;
        this.state = hydrateState(legacyEntry ? this.context.workspaceState.get(legacyEntry) : undefined);
    }
    async initialize() {
        this.state = (0, pruning_js_1.pruneWorkspaceState)(this.state, (0, storageLimits_js_1.getStorageLimits)());
        await this.context.workspaceState.update(storageKeys_js_1.NSS_WORKSPACE_STATE_STORAGE_KEY, this.state);
        if (this.legacyStorageKey) {
            await this.context.workspaceState.update(this.legacyStorageKey, undefined);
        }
    }
    snapshot() {
        return cloneState(this.state);
    }
    async update(mutator) {
        const draft = this.snapshot();
        mutator(draft);
        this.state = (0, pruning_js_1.pruneWorkspaceState)(draft, (0, storageLimits_js_1.getStorageLimits)());
        await this.context.workspaceState.update(storageKeys_js_1.NSS_WORKSPACE_STATE_STORAGE_KEY, this.state);
    }
}
exports.NssStateStore = NssStateStore;
function hydrateState(value) {
    const initialState = createInitialState();
    if (!value) {
        return initialState;
    }
    return {
        ...initialState,
        ...value,
        responseHistory: [...(value.responseHistory ?? initialState.responseHistory)],
        reviewItems: [...(value.reviewItems ?? initialState.reviewItems)],
        taskHistory: [...(value.taskHistory ?? initialState.taskHistory)],
        diagnosticSessions: [...(value.diagnosticSessions ?? initialState.diagnosticSessions)],
        projectRules: [...(value.projectRules ?? initialState.projectRules)],
        repairPatterns: [...(value.repairPatterns ?? initialState.repairPatterns)],
        recurringFailures: [...(value.recurringFailures ?? initialState.recurringFailures)],
        knowledgeItems: [...(value.knowledgeItems ?? initialState.knowledgeItems)],
        roadmapNotes: [...(value.roadmapNotes ?? initialState.roadmapNotes)],
        persistentMemories: [...(value.persistentMemories ?? initialState.persistentMemories)],
        serverHealth: value.serverHealth ?? initialState.serverHealth,
        mode: value.mode ?? initialState.mode,
        presetId: value.presetId ?? initialState.presetId,
        studioProjectId: value.studioProjectId ?? initialState.studioProjectId,
    };
}
//# sourceMappingURL=store.js.map