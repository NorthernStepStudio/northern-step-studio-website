import { createServer } from "node:http";
import { type NStepOsRuntime } from "./core/runtime.js";
export interface StartedServer {
    readonly server: ReturnType<typeof createServer>;
    readonly port: number;
    close(): Promise<void>;
}
export declare function startNStepOsServer(runtime?: NStepOsRuntime, requestedPort?: number): Promise<StartedServer>;
