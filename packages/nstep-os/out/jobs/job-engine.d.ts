import type { GoalInput, DashboardSnapshot, JobRecord, PrincipalRole, RuntimeConfig, RuntimeStores } from "../core/types.js";
import type { NStepLogger } from "../core/types.js";
import { type RuntimeServices } from "../core/runtime-services.js";
import type { Stage2RuntimeOrchestrator } from "../core/stage2-orchestrator.js";
export interface JobEngineDependencies {
    readonly config: RuntimeConfig;
    readonly stores: RuntimeStores;
    readonly logger?: NStepLogger;
    readonly tools?: Record<string, unknown>;
    readonly services?: RuntimeServices;
    readonly orchestrator?: Stage2RuntimeOrchestrator;
}
export interface JobEngine {
    intake(goal: GoalInput): Promise<JobRecord>;
    route(jobId: string): Promise<JobRecord>;
    plan(jobId: string): Promise<JobRecord>;
    run(jobId: string): Promise<JobRecord>;
    process(jobId: string): Promise<JobRecord>;
    approve(jobId: string, stepId: string, actor?: JobEngineActor): Promise<JobRecord>;
    reject(jobId: string, stepId: string, actor?: JobEngineActor): Promise<JobRecord>;
    get(jobId: string): Promise<JobRecord | undefined>;
    list(): Promise<readonly JobRecord[]>;
    dashboard(): Promise<DashboardSnapshot>;
}
export interface JobEngineActor {
    readonly subjectId?: string;
    readonly tenantId?: string;
    readonly role?: PrincipalRole;
    readonly reason?: string;
}
export declare function createJobEngine(deps: JobEngineDependencies): JobEngine;
