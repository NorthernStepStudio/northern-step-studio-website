import type { ApprovalStatus, GoalMode, PrincipalRole, ProductKey, RiskLevel, ToolName } from "./types.js";
import type { Stage2AgentId } from "./stage2-models.js";
import type { NStepLogger } from "./types.js";

export type Stage3ToolProvider =
  | "mock"
  | "playwright"
  | "twilio"
  | "webhook"
  | "file"
  | "postgres"
  | "supabase"
  | "memory"
  | "redis"
  | "generic-http";

export interface Stage3ToolScope {
  readonly agentId?: Stage2AgentId;
  readonly jobId?: string;
  readonly stepId?: string;
  readonly tenantId?: string;
  readonly role?: PrincipalRole;
  readonly product?: ProductKey;
  readonly mode?: GoalMode;
  readonly approvalStatus?: ApprovalStatus;
  readonly riskLevel?: RiskLevel;
  readonly purpose?: string;
  readonly externalAllowed?: boolean;
}

export interface Stage3ToolPermission {
  readonly tool: ToolName;
  readonly actions: readonly string[];
  readonly allowExternalActions: boolean;
  readonly requiresApprovalForExternalActions: boolean;
  readonly permittedAgents: readonly Stage2AgentId[];
  readonly description: string;
}

export interface Stage3ToolDescriptor {
  readonly tool: ToolName;
  readonly provider: Stage3ToolProvider;
  readonly actions: readonly string[];
  readonly canRetry: boolean;
  readonly scoped: boolean;
  readonly permission: Stage3ToolPermission;
}

export interface Stage3ToolInvocationRecord {
  readonly id: string;
  readonly at: string;
  readonly tool: ToolName;
  readonly action: string;
  readonly attempt: number;
  readonly status: "started" | "retry" | "succeeded" | "failed" | "blocked";
  readonly scope?: Stage3ToolScope;
  readonly message: string;
  readonly data?: Record<string, unknown>;
}

export interface Stage3RetryPolicy {
  readonly maxAttempts: number;
  readonly backoffMs: number;
  readonly jitterMs: number;
}

export interface Stage3ToolPolicy {
  readonly retry: Stage3RetryPolicy;
  readonly permissions: readonly Stage3ToolPermission[];
  readonly allowUnscopedAccess: boolean;
}

export interface Stage3ToolGateResult {
  readonly allowed: boolean;
  readonly blockedBy?: string;
  readonly reason: string;
  readonly requiresApproval: boolean;
}

export interface Stage3ToolSession {
  readonly scope: Stage3ToolScope;
  readonly logger: NStepLogger;
  readonly policy: Stage3ToolPolicy;
  readonly recordInvocation: (record: Stage3ToolInvocationRecord) => void;
}

export interface Stage3ToolOutcome<T> {
  readonly tool: ToolName;
  readonly action: string;
  readonly provider: Stage3ToolProvider;
  readonly status: "succeeded" | "failed" | "blocked";
  readonly attempts: number;
  readonly value?: T;
  readonly error?: string;
  readonly retryable: boolean;
  readonly invocations: readonly Stage3ToolInvocationRecord[];
}

export function defineStage3Permission(
  tool: ToolName,
  actions: readonly string[],
  description: string,
  options: {
    readonly allowExternalActions?: boolean;
    readonly requiresApprovalForExternalActions?: boolean;
    readonly permittedAgents?: readonly Stage2AgentId[];
  } = {},
): Stage3ToolPermission {
  return {
    tool,
    actions: [...actions],
    allowExternalActions: options.allowExternalActions ?? false,
    requiresApprovalForExternalActions: options.requiresApprovalForExternalActions ?? false,
    permittedAgents: [...(options.permittedAgents ?? [])],
    description,
  };
}

export function defineStage3Descriptor(
  tool: ToolName,
  provider: Stage3ToolProvider,
  actions: readonly string[],
  permission: Stage3ToolPermission,
  options: {
    readonly canRetry?: boolean;
    readonly scoped?: boolean;
  } = {},
): Stage3ToolDescriptor {
  return {
    tool,
    provider,
    actions: [...actions],
    canRetry: options.canRetry ?? true,
    scoped: options.scoped ?? true,
    permission,
  };
}
