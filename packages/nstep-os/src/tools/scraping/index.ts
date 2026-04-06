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

function stripHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? stripHtml(match[1]).trim() || undefined : undefined;
}

function extractLinks(html: string): string[] {
  const matches = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((match) => String(match[1] || "").trim());
  return [...new Set(matches.filter(Boolean))];
}

export function createScrapingAdapter(): ScrapingAdapter {
  return {
    async scrape(input) {
      const response = await fetch(input.url, {
        headers: input.headers,
      });
      const html = await response.text();
      const title = extractTitle(html);
      const text = stripHtml(html);
      const links = extractLinks(html);

      return {
        url: input.url,
        title,
        text,
        links,
        meta: {
          status: response.status,
          ok: response.ok,
          contentType: response.headers.get("content-type") || undefined,
        },
      };
    },
  };
}
