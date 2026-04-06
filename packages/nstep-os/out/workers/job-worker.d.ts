import type { NStepOsRuntime } from "../core/runtime.js";
import type { JobRecord } from "../core/types.js";
export interface JobWorkerOptions {
    readonly workerId?: string;
    readonly pollIntervalMs?: number;
    readonly staleAfterMs?: number;
}
export interface JobWorker {
    readonly workerId: string;
    start(): Promise<void>;
    stop(): Promise<void>;
    tick(): Promise<readonly JobRecord[]>;
    isRunning(): boolean;
}
export declare function createJobWorker(runtime: NStepOsRuntime, options?: JobWorkerOptions): JobWorker;
export declare function startJobWorker(runtime: NStepOsRuntime, options?: JobWorkerOptions): Promise<JobWorker>;
