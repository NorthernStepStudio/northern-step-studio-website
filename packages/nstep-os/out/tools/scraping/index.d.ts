export interface ScrapeRequest {
    readonly url: string;
    readonly headers?: Record<string, string>;
}
export interface ScrapeResult {
    readonly url: string;
    readonly title?: string;
    readonly text: string;
    readonly links: readonly string[];
    readonly meta: Record<string, unknown>;
}
export interface ScrapingAdapter {
    scrape(input: ScrapeRequest): Promise<ScrapeResult>;
}
export declare function createScrapingAdapter(): ScrapingAdapter;
