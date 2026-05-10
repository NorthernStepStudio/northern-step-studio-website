export interface MatterhornMessage {
  role: "user" | "assistant" | "system";
  content: string;
  id: string;
  createdAt: string;
  sources?: string[];
  riskLevel?: "Low" | "Medium" | "High";
  confidence?: number;
  latency?: number;
}

export interface MatterhornStatus {
  online: boolean;
  provider: string;
  model: string;
  latency?: number;
}

type MatterhornReasonResponse = {
  answer?: string;
  sourcesUsed?: string[];
  latencyMs?: number;
  riskLevel?: "Low" | "Medium" | "High";
  confidence?: number;
  error?: string;
};

export class MatterhornClient {
  private bridgeUrl = "http://localhost:3010";

  async getStatus(): Promise<MatterhornStatus> {
    try {
      const resp = await fetch(`${this.bridgeUrl}/health`, { 
        headers: { 'Accept': 'application/json' }
      });
      if (!resp.ok) throw new Error("Bridge offline");
      const data = await resp.json();
      return {
        online: data.ok && data.providerOnline,
        provider: data.provider,
        model: data.model,
        latency: data.latencyMs,
      };
    } catch (e) {
      return {
        online: false,
        provider: "Offline",
        model: "None",
      };
    }
  }

  async sendMessage(question: string, context?: Record<string, unknown>): Promise<MatterhornMessage> {
    const start = Date.now();
    try {
      const resp = await fetch(`${this.bridgeUrl}/reason`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'chat',
          question,
          context: context || { 
            summary: 'User query from StudioOS dashboard.', 
            sources: ['health-service', 'repo-integrity', 'verification-engine', 'risk-register', 'readiness-service'] 
          },
          safety: { advisoryOnly: true }
        }),
      });

      if (!resp.ok) {
        const errorData = (await resp.json().catch(() => null)) as MatterhornReasonResponse | null;
        throw new Error(errorData?.error || "Bridge request failed");
      }

      const data = (await resp.json()) as MatterhornReasonResponse;
      
      return {
        role: "assistant",
        content: `[Advisory only - no commands executed]\n${data.answer || "No response received from Matterhorn."}`,
        id: `matterhorn-${Date.now()}`,
        createdAt: new Date().toISOString(),
        sources: data.sourcesUsed || [],
        riskLevel: data.riskLevel || "Low",
        confidence: typeof data.confidence === "number" ? data.confidence : 0.9,
        latency: data.latencyMs || (Date.now() - start),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        role: "assistant",
        content: `I am currently unable to reach the Synox local bridge. Please ensure the bridge is running on port 3010.\n\nError: ${message}`,
        id: "error-" + Date.now(),
        createdAt: new Date().toISOString(),
      };
    }
  }
}

export const matterhornClient = new MatterhornClient();
