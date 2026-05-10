export interface BridgeStatus {
  ok: boolean;
  provider?: string;
  model?: string;
  providerOnline?: boolean;
  error?: string;
}

export interface BridgeReasonRequest {
  mode: string;
  question: string;
  context: {
    summary: string;
    sources: string[];
  };
  safety: {
    advisoryOnly: boolean;
    noExecution: boolean;
    noRepoMutation: boolean;
    noDeployment: boolean;
  };
}

export interface BridgeReasonResponse {
  ok: boolean;
  answer?: string;
  provider?: string;
  model?: string;
  sourcesUsed?: string[];
  warnings?: string[];
  latencyMs?: number;
  error?: string;
}

const BRIDGE_URL = "http://localhost:3010";

export async function getBridgeStatus(): Promise<BridgeStatus> {
  try {
    const res = await fetch(`${BRIDGE_URL}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) throw new Error("Bridge health check failed");
    return await res.json();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function sendBridgeReasoning(request: BridgeReasonRequest): Promise<BridgeReasonResponse> {
  const startTime = Date.now();
  try {
    const res = await fetch(`${BRIDGE_URL}/reason`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(45000), // 45s for local reasoning
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown bridge error");
      throw new Error(`Bridge responded with status ${res.status}: ${errorText.substring(0, 100)}`);
    }

    const data = await res.json() as any;

    // Validation
    if (!data || typeof data !== 'object') throw new Error("Invalid response from bridge");
    if (data.ok === false) throw new Error(data.error || "Bridge reasoning failed");
    if (!data.answer) throw new Error("Bridge returned empty answer");

    return {
      ok: true,
      answer: data.answer,
      provider: data.provider || "unknown",
      model: data.model || "unknown",
      sourcesUsed: Array.isArray(data.sourcesUsed) ? data.sourcesUsed : [],
      warnings: Array.isArray(data.warnings) ? data.warnings : [],
      latencyMs: data.latencyMs || (Date.now() - startTime)
    };
  } catch (err) {
    console.error("[Synox Bridge Client Error]", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      answer: "Matterhorn is currently unable to reach the local reasoning bridge. Grounded advisory is temporarily unavailable.",
    };
  }
}
