import type { NssAskIntent, NssAskRequestPayload, NssAskResponse, ResponseOsAgent } from "../core/types.js";
export declare function buildResponseTitle(request: NssAskRequestPayload): string;
export declare function buildMockResponseBody(request: NssAskRequestPayload, agent: ResponseOsAgent): string;
export declare function normalizeStructuredModelResponse(content: string, fallbackTitle: string): NssAskResponse;
export declare function isProposalIntent(intent: NssAskIntent): boolean;
