import type { IncomingMessage } from "node:http";
import type { RuntimeConfig } from "./types.js";
export interface InternalRequestCheck {
    readonly allowed: boolean;
    readonly reason?: string;
}
export declare function verifyInternalRequest(request: IncomingMessage, config: RuntimeConfig): InternalRequestCheck;
export interface TwilioRequestCheck {
    readonly allowed: boolean;
    readonly reason?: string;
}
export declare function verifyTwilioRequest(request: IncomingMessage, rawBody: string, config: RuntimeConfig): TwilioRequestCheck;
