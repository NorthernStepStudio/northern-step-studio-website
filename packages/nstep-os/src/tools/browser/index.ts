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

async function fetchPage(url: string, headers?: Record<string, string>): Promise<BrowserVisitResult> {
  const response = await fetch(url, { headers });
  const html = await response.text();
  return {
    url,
    title: extractTitle(html),
    text: stripHtml(html),
    links: extractLinks(html),
    meta: {
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get("content-type") || undefined,
    },
  };
}

async function loadPlaywright(): Promise<any> {
  const dynamicImport = new Function("specifier", "return import(specifier);");
  return dynamicImport("playwright");
}

export function createBrowserAdapter(config: { readonly provider?: "mock" | "playwright" }): BrowserAdapter {
  let browserPromise: Promise<any> | null = null;

  async function getPlaywrightBrowser() {
    if (!browserPromise) {
      browserPromise = (async () => {
        const playwright = await loadPlaywright();
        return playwright.chromium.launch({ headless: true });
      })();
    }

    return browserPromise;
  }

  const visit = async (input: BrowserVisitRequest): Promise<BrowserVisitResult> => {
    if (config.provider === "playwright") {
      let page: any;
      try {
        const browser = await getPlaywrightBrowser();
        page = await browser.newPage();
        await page.goto(input.url, { waitUntil: "domcontentloaded" });
        if (input.waitForMs) {
          await new Promise((resolve) => setTimeout(resolve, input.waitForMs));
        }
        const html = await page.content();
        const result = {
          url: input.url,
          title: await page.title(),
          text: stripHtml(html),
          links: extractLinks(html),
          meta: {
            provider: "playwright",
          },
        };
        return result;
      } catch {
        return fetchPage(input.url, input.headers);
      } finally {
        if (page) {
          try {
            await page.close();
          } catch {
            // ignore close failures on transient pages
          }
        }
      }
    }

    return fetchPage(input.url, input.headers);
  };

  return {
    visit,
    extract: async (input) => {
      if (config.provider === "playwright" && input.selector) {
        let page: any;
        try {
          const browser = await getPlaywrightBrowser();
          page = await browser.newPage();
          await page.goto(input.url, { waitUntil: "domcontentloaded" });
          const selected = await page
            .$eval(input.selector, (element: any) => {
              const metaContent = element.getAttribute("content");
              if (metaContent) {
                return metaContent.trim();
              }
              const text = (element.textContent || "").trim();
              return text;
            })
            .catch(() => "");
          const html = await page.content();
          const result: BrowserVisitResult = {
            url: input.url,
            title: await page.title(),
            text: selected || stripHtml(html),
            links: extractLinks(html),
            meta: {
              provider: "playwright",
              selector: input.selector,
              selectorMatched: Boolean(selected),
            },
          };
          return result;
        } catch {
          return visit({ url: input.url, headers: input.headers });
        } finally {
          if (page) {
            try {
              await page.close();
            } catch {
              // ignore close failures on transient pages
            }
          }
        }
      }

      return visit({ url: input.url, headers: input.headers });
    },
    async close() {
      if (!browserPromise) {
        return;
      }
      try {
        const browser = await browserPromise;
        await browser.close();
      } catch {
        // ignore shutdown errors in the mock/fallback path
      } finally {
        browserPromise = null;
      }
    },
  };
}
