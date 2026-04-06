import type { RuntimeConfig } from "../../core/types.js";
export interface OcrExtractionItem {
    readonly id: string;
    readonly url?: string;
    readonly dataUrl?: string;
    readonly mimeType?: string;
    readonly filename?: string;
    readonly label?: string;
    readonly text?: string;
    readonly metadata?: Record<string, unknown>;
}
export interface OcrExtractionRequest {
    readonly items: readonly OcrExtractionItem[];
    readonly prompt?: string;
    readonly tenantId?: string;
    readonly jobId?: string;
}
export interface OcrExtractionResultItem {
    readonly id: string;
    readonly text: string;
    readonly confidence: number;
    readonly source: OcrExtractionItem;
    readonly raw?: unknown;
}
export interface OcrExtractionResult {
    readonly provider: "mock" | "generic-http";
    readonly items: readonly OcrExtractionResultItem[];
    readonly summary: string;
    readonly extractedAt: string;
}
export interface OcrAdapter {
    readonly provider: "mock" | "generic-http";
    extract(input: OcrExtractionRequest): Promise<OcrExtractionResult>;
    close(): Promise<void>;
}
export interface OcrAdapterConfig {
    readonly provider?: "mock" | "http";
    readonly endpoint?: string;
    readonly apiKey?: string;
    readonly timeoutMs?: number;
    readonly config?: Pick<RuntimeConfig, "serviceName">;
}
export declare function createOcrAdapter(config?: OcrAdapterConfig): OcrAdapter;
