import type { NStepLogger, RuntimeConfig, RuntimeStores } from "./types.js";
import type { ExecutionService } from "../executor/index.js";
import type { VerificationService } from "../verifier/index.js";
import type { MemoryService } from "../memory/index.js";
import type { ReportingService } from "../reporting/index.js";
export interface RuntimeServices {
    readonly execution: ExecutionService;
    readonly verification: VerificationService;
    readonly memory: MemoryService;
    readonly reporting: ReportingService;
}
export interface RuntimeServicesInput {
    readonly config: RuntimeConfig;
    readonly stores: RuntimeStores;
    readonly logger?: NStepLogger;
}
export declare function createRuntimeServices(input: RuntimeServicesInput): RuntimeServices;
