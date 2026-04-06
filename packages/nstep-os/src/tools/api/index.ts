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

export function createHttpApiAdapter(): HttpApiAdapter {
  const request = async (input: HttpApiRequest): Promise<HttpApiResponse> => {
    const response = await fetch(input.url, {
      method: input.method || "GET",
      headers: {
        ...(input.body ? { "content-type": "application/json" } : {}),
        ...(input.headers || {}),
      },
      body: input.body === undefined ? undefined : JSON.stringify(input.body),
    });

    const text = await response.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : undefined;
    } catch {
      json = undefined;
    }

    return {
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      json,
      text,
    };
  };

  return {
    request,
    getJson: (url, headers) => request({ url, method: "GET", headers }),
    postJson: (url, body, headers) => request({ url, method: "POST", body, headers }),
  };
}
