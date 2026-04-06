import type { BrowserAdapter } from "./browser/index.js";
import type { SmsAdapter } from "./sms/index.js";
import type { EmailAdapter } from "./email/index.js";
import type { HttpApiAdapter } from "./api/index.js";
import type { ScrapingAdapter } from "./scraping/index.js";
import type { SchedulerAdapter } from "./scheduler/index.js";
import type { RedisAdapter } from "./redis/index.js";
import type { OcrAdapter } from "./ocr/index.js";
import type { NStepLogger, RuntimeConfig } from "../core/types.js";
import { type Stage3ToolDescriptor, type Stage3ToolInvocationRecord, type Stage3ToolPolicy, type Stage3ToolScope } from "../core/stage3-models.js";
import type { DatabaseAdapter } from "./database/runtime.js";
export interface Stage3ToolRuntime {
    readonly [key: string]: unknown;
    readonly browser: BrowserAdapter;
    readonly sms: SmsAdapter;
    readonly email: EmailAdapter;
    readonly database: DatabaseAdapter;
    readonly api: HttpApiAdapter;
    readonly scraping: ScrapingAdapter;
    readonly scheduler: SchedulerAdapter;
    readonly redis: RedisAdapter;
    readonly ocr: OcrAdapter;
    readonly policy: Stage3ToolPolicy;
    readonly descriptors: readonly Stage3ToolDescriptor[];
    readonly invocations: readonly Stage3ToolInvocationRecord[];
    scope(scope: Stage3ToolScope): Stage3ToolRuntime;
}
export interface Stage3ToolRuntimeInputs {
    readonly config: RuntimeConfig;
    readonly logger?: NStepLogger;
    readonly browser: BrowserAdapter;
    readonly sms: SmsAdapter;
    readonly email: EmailAdapter;
    readonly database: DatabaseAdapter;
    readonly api: HttpApiAdapter;
    readonly scraping: ScrapingAdapter;
    readonly scheduler: SchedulerAdapter;
    readonly redis: RedisAdapter;
    readonly ocr: OcrAdapter;
    readonly maxAttempts?: number;
}
export declare function createStage3ToolRuntime(inputs: Stage3ToolRuntimeInputs, scope?: Stage3ToolScope, sharedState?: {
    invocations: Stage3ToolInvocationRecord[];
}): Stage3ToolRuntime;
