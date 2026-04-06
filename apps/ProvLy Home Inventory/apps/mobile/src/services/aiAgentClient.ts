// apps/mobile/src/services/aiAgentClient.ts
import { API_URL } from '../config/apiUrl';

export type AgentRequest = {
    prompt: string;
    homeId?: string;
    history?: any[];
    image?: string; // base64 (no data: prefix)
    access_token: string;
    fact_pack?: any;
    signal?: AbortSignal;
};

export type AgentResponse = {
    response: string;
    [key: string]: any;
};

/**
 * Unified client for calling /v1/ai/agent
 * - Sends token in body (not headers) to avoid 431 errors
 * - Strips credentials to minimize header bloat
 */
export async function postAgent(req: AgentRequest): Promise<AgentResponse> {
    // Strip data: prefix from base64 if present
    const cleanImage = req.image?.replace(/^data:image\/\w+;base64,/, '');

    const res = await fetch(`${API_URL}/ai/agent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // IMPORTANT: avoid cookie/header bloat that can worsen 431s
        credentials: 'omit' as RequestCredentials,
        body: JSON.stringify({
            ...req,
            image: cleanImage,
            signal: undefined, // Don't send signal in body
        }),
        signal: req.signal,
    });

    const text = await res.text();
    let data: any = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = { raw: text };
    }

    if (!res.ok) {
        const msg = data?.error || data?.message || `Request failed (${res.status})`;
        throw new Error(msg);
    }

    return data;
}
