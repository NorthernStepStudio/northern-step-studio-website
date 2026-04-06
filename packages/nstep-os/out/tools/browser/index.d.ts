export interface BrowserVisitRequest {
    readonly url: string;
    readonly waitForMs?: number;
    readonly headers?: Record<string, string>;
}
export interface BrowserVisitResult {
    readonly url: string;
    readonly title?: string;
    readonly text: string;
    readonly links: readonly string[];
    readonly meta: Record<string, unknown>;
}
export interface BrowserExtractionRequest {
    readonly url: string;
    readonly selector?: string;
    readonly headers?: Record<string, string>;
}
export interface BrowserAdapter {
    visit(input: BrowserVisitRequest): Promise<BrowserVisitResult>;
    extract(input: BrowserExtractionRequest): Promise<BrowserVisitResult>;
    close(): Promise<void>;
}
export declare function createBrowserAdapter(config: {
    readonly provider?: "mock" | "playwright";
}): BrowserAdapter;
