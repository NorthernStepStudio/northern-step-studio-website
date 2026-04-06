import type { NexusBuildIntake, NexusBuildPricingSnapshot, NexusBuildWatchItem } from "../../core/types.js";
import type { WorkflowExecutionContext } from "../../core/types.js";
import type { ScheduledTask } from "../../tools/scheduler/index.js";
export interface NexusBuildPricingResult {
    readonly snapshots: readonly NexusBuildPricingSnapshot[];
    readonly notes: readonly string[];
}
export interface NexusBuildWatchScheduleResult {
    readonly scheduled: readonly ScheduledTask[];
    readonly notes: readonly string[];
}
export declare function collectNexusBuildPricing(intake: NexusBuildIntake, context: WorkflowExecutionContext): Promise<NexusBuildPricingResult>;
export declare function scheduleNexusBuildPriceWatch(intake: NexusBuildIntake, context: WorkflowExecutionContext, watchlist: readonly NexusBuildWatchItem[]): Promise<NexusBuildWatchScheduleResult>;
