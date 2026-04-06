import type { Stage3ToolGateResult, Stage3ToolPermission, Stage3ToolPolicy, Stage3ToolScope } from "../core/stage3-models.js";
export declare class ToolPermissionError extends Error {
    readonly tool: string;
    readonly requiresApproval: boolean;
    constructor(tool: string, message: string, requiresApproval: boolean);
}
export declare function createDefaultStage3RetryPolicy(maxAttempts: number): Stage3ToolPolicy["retry"];
export declare function createStage3ToolPolicy(permissions: readonly Stage3ToolPermission[], maxAttempts: number, allowUnscopedAccess?: boolean): Stage3ToolPolicy;
export declare function evaluateStage3ToolAccess(permission: Stage3ToolPermission, scope: Stage3ToolScope | undefined): Stage3ToolGateResult;
export declare function createToolInvocationId(): string;
export declare function createDefaultToolScope(overrides?: Stage3ToolScope): Stage3ToolScope;
export declare function shouldRetryToolError(error: unknown): boolean;
