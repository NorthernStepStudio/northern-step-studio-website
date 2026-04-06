import type { JobRecord, MemoryAuditEntry, MemoryCategory, MemoryEntry, MemoryLesson, MemoryLessonOutcome, MemoryStore, NStepLogger, PrincipalRole, WorkflowDefinition, WorkflowExecutionContext, MemoryTier } from "../core/types.js";
import type { MemoryEditRequest } from "../core/validation.js";
export interface MemoryWriteSummary {
    readonly total: number;
    readonly created: number;
    readonly updated: number;
    readonly ids: readonly string[];
    readonly byCategory: Record<string, number>;
    readonly editable: number;
}
export interface MemoryLessonInput {
    readonly outcome: MemoryLessonOutcome;
    readonly symptom?: string;
    readonly cause?: string;
    readonly fix?: string;
    readonly prevention?: string;
    readonly reuseRule?: string;
    readonly evidence?: string;
}
export interface MemoryPersistOptions {
    readonly jobId?: string;
    readonly actorRole?: PrincipalRole;
    readonly actorId?: string;
    readonly note?: string;
    readonly sourceStepId?: string;
}
export interface MemoryHierarchy {
    readonly episodic: readonly MemoryEntry[];
    readonly semantic: readonly MemoryEntry[];
    readonly procedural: readonly MemoryEntry[];
    readonly prioritized: readonly MemoryEntry[];
}
export interface MemoryService {
    createJobMemory(workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext): Promise<readonly MemoryEntry[]>;
    persistJobMemory(entries: readonly MemoryEntry[], options?: MemoryPersistOptions): Promise<MemoryWriteSummary>;
    createJobMemoryAndPersist(workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext, options?: MemoryPersistOptions): Promise<MemoryWriteSummary>;
    editMemoryEntry(store: MemoryStore, memoryId: string, request: MemoryEditRequest): Promise<MemoryEditResult>;
    appendMemoryAudit(store: MemoryStore, memoryId: string, audit: MemoryAuditEntry): Promise<MemoryEntry>;
    createMemoryAuditRecord(actorRole: MemoryEditRequest["actorRole"], note: string, sourceJobId?: string, sourceStepId?: string): MemoryAuditEntry;
    createMemoryLesson(input: MemoryLessonInput): MemoryLesson;
    inferMemoryLesson(job: JobRecord, entry: MemoryEntry): MemoryLesson;
    classifyMemoryTier(category: MemoryCategory): MemoryTier;
    buildMemoryHierarchy(memory: readonly MemoryEntry[], limit?: number): MemoryHierarchy;
    selectMemoryForReasoning(memory: readonly MemoryEntry[], limit?: number): readonly MemoryEntry[];
    createMemoryEntryId(prefix?: string): string;
}
export declare function createMemoryService(store: MemoryStore, logger?: NStepLogger): MemoryService;
export declare function createJobMemory(workflow: WorkflowDefinition, job: JobRecord, context: WorkflowExecutionContext): Promise<readonly MemoryEntry[]>;
export interface MemoryEditResult {
    readonly memory: MemoryEntry;
    readonly auditEntry: MemoryAuditEntry;
}
export declare function editMemoryEntry(store: MemoryStore, memoryId: string, request: MemoryEditRequest): Promise<MemoryEditResult>;
export declare function appendMemoryAudit(store: MemoryStore, memoryId: string, audit: MemoryAuditEntry): Promise<MemoryEntry>;
export declare function createMemoryAuditRecord(actorRole: MemoryEditRequest["actorRole"], note: string, sourceJobId?: string, sourceStepId?: string): MemoryAuditEntry;
export declare function createMemoryLesson(input: MemoryLessonInput): MemoryLesson;
export declare function classifyMemoryTier(category: MemoryCategory): MemoryTier;
export declare function buildMemoryHierarchy(memory: readonly MemoryEntry[], limit?: number): MemoryHierarchy;
export declare function selectMemoryForReasoning(memory: readonly MemoryEntry[], limit?: number): readonly MemoryEntry[];
export declare function inferMemoryLesson(job: JobRecord, entry: MemoryEntry): MemoryLesson;
export declare function createMemoryEntryId(prefix?: string): string;
export declare function persistMemoryEntries(store: MemoryStore, entries: readonly MemoryEntry[], options?: MemoryPersistOptions): Promise<MemoryWriteSummary>;
