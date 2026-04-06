export interface HttpApiRequest {
    readonly url: string;
    readonly method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    readonly headers?: Record<string, string>;
    readonly body?: unknown;
}
export interface HttpApiResponse {
    readonly status: number;
    readonly ok: boolean;
    readonly headers: Record<string, string>;
    readonly json?: unknown;
    readonly text?: string;
}
export interface HttpApiAdapter {
    request(input: HttpApiRequest): Promise<HttpApiResponse>;
    getJson(url: string, headers?: Record<string, string>): Promise<HttpApiResponse>;
    postJson(url: string, body: unknown, headers?: Record<string, string>): Promise<HttpApiResponse>;
}
export declare function createHttpApiAdapter(): HttpApiAdapter;
