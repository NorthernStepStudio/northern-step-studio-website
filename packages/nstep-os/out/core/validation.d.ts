import type { GoalInput, JobRecord, LeadRecoveryInput, MemoryEntry, PrincipalRole, RouteDecision, WorkflowPlan, WorkflowResult } from "./types.js";
export declare function assertGoalInput(value: unknown): asserts value is GoalInput;
export declare function assertWorkflowPlan(value: unknown): asserts value is WorkflowPlan;
export declare function assertRouteDecision(value: unknown): asserts value is RouteDecision;
export declare function assertLeadRecoveryInput(value: unknown): asserts value is LeadRecoveryInput;
export declare function assertJobRecord(value: unknown): asserts value is JobRecord;
export declare function assertMemoryEntry(value: unknown): asserts value is MemoryEntry;
export declare function assertWorkflowResult(value: unknown): asserts value is WorkflowResult;
export interface MemoryEditRequest {
    readonly tenantId: string;
    readonly actorRole: PrincipalRole;
    readonly actorId?: string;
    readonly key?: string;
    readonly category?: string;
    readonly value?: string | Record<string, unknown>;
    readonly confidence?: number;
    readonly editable?: boolean;
    readonly note?: string;
    readonly sourceJobId?: string;
    readonly sourceStepId?: string;
}
export declare function assertMemoryEditRequest(value: unknown): asserts value is MemoryEditRequest;
