import type { RedisAdapter } from "../redis/index.js";
export interface ScheduledTask {
    readonly id: string;
    readonly runAt: string;
    readonly status: "scheduled" | "running" | "completed" | "failed" | "cancelled";
    readonly detail?: string;
}
export interface ScheduleRequest {
    readonly id?: string;
    readonly runAt: string;
    readonly task: () => Promise<void> | void;
    readonly detail?: string;
}
export interface SchedulerAdapter {
    schedule(input: ScheduleRequest): Promise<ScheduledTask>;
    list(): Promise<readonly ScheduledTask[]>;
    cancel(id: string): Promise<void>;
}
interface RedisSchedulerAdapterOptions {
    readonly redis: RedisAdapter;
    readonly namespace?: string;
}
export declare function createMemorySchedulerAdapter(): SchedulerAdapter;
export declare function createRedisSchedulerAdapter(options: RedisSchedulerAdapterOptions): SchedulerAdapter;
export {};
