import type { NssAskRequestPayload, NssAskResponse, ResponseOsRuntime, ResponseOsRuntimeConfig } from "./types.js";
export declare function createResponseOsRuntime(config: ResponseOsRuntimeConfig): ResponseOsRuntime;
export declare const createMCoreRuntime: typeof createResponseOsRuntime;
export declare function runAgent(config: ResponseOsRuntimeConfig, request: NssAskRequestPayload): Promise<NssAskResponse>;
export type MCoreRuntime = ResponseOsRuntime;
export type MCoreRuntimeConfig = ResponseOsRuntimeConfig;
