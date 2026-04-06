import type { DomainStore, JobRecord, JobStore, MemoryEntry, MemoryStore, RuntimeConfig, RuntimeStores } from "./types.js";
import type { NStepLogger } from "./types.js";
import { type OcrAdapter } from "../tools/ocr/index.js";
import { type Stage2Agents } from "../agents/index.js";
import { type JobEngine, type JobEngineActor } from "../jobs/job-engine.js";
import type { DashboardSnapshot } from "./types.js";
import { type Stage2RuntimeOrchestrator } from "./stage2-orchestrator.js";
import { type RuntimeServices } from "./runtime-services.js";
import { type Stage3ToolRuntime } from "../tools/runtime.js";
export interface RuntimeDependencies {
    readonly logger?: NStepLogger;
    readonly jobs?: JobStore;
    readonly queue?: RuntimeStores["queue"];
    readonly memory?: MemoryStore;
    readonly knowledge?: RuntimeStores["knowledge"];
    readonly domain?: DomainStore;
    readonly nexusbuild?: RuntimeStores["nexusbuild"];
    readonly provly?: RuntimeStores["provly"];
    readonly ocr?: OcrAdapter;
    readonly tools?: Partial<RuntimeTools>;
    readonly services?: RuntimeServices;
    readonly orchestrator?: Stage2RuntimeOrchestrator;
}
export type RuntimeTools = Stage3ToolRuntime;
export interface NStepOsRuntime {
    readonly config: RuntimeConfig;
    readonly logger: NStepLogger;
    readonly stores: RuntimeStores;
    readonly tools: RuntimeTools;
    readonly services: RuntimeServices;
    readonly agents: RuntimeAgents;
    readonly orchestrator: Stage2RuntimeOrchestrator;
    readonly engine: JobEngine;
    health(): Promise<Record<string, unknown>>;
    intake(goal: unknown): Promise<JobRecord>;
    route(jobId: string): Promise<JobRecord>;
    plan(jobId: string): Promise<JobRecord>;
    run(jobId: string): Promise<JobRecord>;
    approve(jobId: string, stepId: string, actor?: JobEngineActor): Promise<JobRecord>;
    reject(jobId: string, stepId: string, actor?: JobEngineActor): Promise<JobRecord>;
    getJob(jobId: string): Promise<JobRecord | undefined>;
    listJobs(): Promise<readonly JobRecord[]>;
    listMemory(): Promise<readonly MemoryEntry[]>;
    dashboard(): Promise<DashboardSnapshot>;
    runGoal(goal: unknown): Promise<JobRecord>;
}
export type RuntimeAgents = Stage2Agents;
export declare function createNStepOsRuntime(config?: RuntimeConfig, dependencies?: RuntimeDependencies): Promise<NStepOsRuntime>;
export declare function createRuntimeLogger(scope?: string): NStepLogger;
