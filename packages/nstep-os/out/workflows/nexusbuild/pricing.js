import { randomUUID } from "node:crypto";
import { coerceRecord, normalizeText, parsePrice } from "./catalog.js";
export async function collectNexusBuildPricing(intake, context) {
    if (!intake.livePricingEnabled || intake.priceSources.length === 0) {
        return {
            snapshots: [],
            notes: intake.livePricingEnabled
                ? ["Live pricing is enabled, but no sources were supplied."]
                : ["Live pricing is disabled for this build."],
        };
    }
    const browser = context.tools.browser;
    const scraping = context.tools.scraping;
    const api = context.tools.api;
    const snapshots = [];
    const notes = [];
    for (const source of intake.priceSources.slice(0, 8)) {
        try {
            const content = await fetchSourceContent(source.url, source.kind, browser, scraping, api);
            const parsedPrices = extractPrices(content);
            const price = parsedPrices.length > 0 ? Math.min(...parsedPrices) : undefined;
            snapshots.push({
                snapshotId: `price_${randomUUID()}`,
                tenantId: intake.goal.tenantId,
                buildId: intake.buildId,
                partId: matchPartId(source, intake.parts),
                source: source.kind || "retail",
                label: source.label,
                url: source.url,
                currency: intake.currency,
                price,
                capturedAt: new Date().toISOString(),
                rawText: content.text.slice(0, 5000),
                metadata: {
                    sourceKind: source.kind || "retail",
                    parsedPrices,
                    linkCount: content.links.length,
                    status: content.meta?.status,
                    title: content.title,
                    extractionMode: content.meta?.extractionMode,
                    retailer: getRetailerName(source.url),
                    hasStructuredData: content.meta?.hasStructuredData || false,
                },
            });
            if (price !== undefined) {
                notes.push(`Captured ${formatMoney(price, intake.currency)} from ${source.label || source.url}.`);
            }
            else {
                notes.push(`No price was detected on ${source.label || source.url}.`);
            }
        }
        catch (error) {
            notes.push(`Price lookup failed for ${source.label || source.url}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    return {
        snapshots,
        notes,
    };
}
export async function scheduleNexusBuildPriceWatch(intake, context, watchlist) {
    if (watchlist.length === 0) {
        return {
            scheduled: [],
            notes: ["No watchlist items were provided."],
        };
    }
    const scheduler = context.tools.scheduler;
    if (!scheduler) {
        return {
            scheduled: [],
            notes: ["No scheduler adapter is configured."],
        };
    }
    const scheduled = [];
    const notes = [];
    for (const item of watchlist.slice(0, 5)) {
        const task = await scheduler.schedule({
            runAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            detail: `Watch ${item.label}`,
            task: async () => {
                const memoryEntry = {
                    id: `memory_${randomUUID()}`,
                    tenantId: intake.goal.tenantId,
                    product: "nexusbuild",
                    category: "workflow-template",
                    key: `nexusbuild.watch.${normalizeText(item.label).replace(/\s+/g, "-") || "item"}`,
                    value: {
                        buildId: intake.buildId,
                        label: item.label,
                        url: item.url,
                        targetPrice: item.targetPrice,
                        currency: item.currency || intake.currency,
                        notes: item.notes,
                    },
                    confidence: 0.72,
                    editable: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                await context.stores.memory.upsert(memoryEntry);
            },
        });
        scheduled.push(task);
        notes.push(`Scheduled price watch for ${item.label}.`);
    }
    return {
        scheduled,
        notes,
    };
}
async function fetchSourceContent(url, kind, browser, scraping, api) {
    const jsonLike = kind === "spec" || kind === "benchmark" || /\.json(\?|$)/i.test(url);
    const retailerSource = isRetailerSource(kind, url);
    if (retailerSource) {
        const fetched = await fetchRetailerSource(url);
        if (fetched) {
            const parsedPrices = extractPrices(fetched);
            if (parsedPrices.length > 0) {
                return fetched;
            }
        }
    }
    if (jsonLike && api) {
        const response = await api.getJson(url);
        return {
            title: undefined,
            text: response.text || JSON.stringify(response.json || {}),
            links: [],
            meta: {
                source: "api",
                status: response.status,
                ok: response.ok,
                extractionMode: "json",
            },
            json: response.json,
        };
    }
    if (browser) {
        const selectors = retailerSelectorsForUrl(url);
        try {
            if (selectors.length > 0) {
                for (const selector of selectors) {
                    const result = await browser.extract({ url, selector });
                    const priceCandidates = extractPrices(result);
                    if (priceCandidates.length > 0 || result.meta?.selectorMatched) {
                        return {
                            title: result.title,
                            text: result.text,
                            links: result.links,
                            meta: {
                                ...result.meta,
                                extractionMode: "browser-extract",
                            },
                        };
                    }
                }
            }
            const result = await browser.visit({ url, waitForMs: 200 });
            return {
                title: result.title,
                text: result.text,
                links: result.links,
                meta: {
                    ...result.meta,
                    extractionMode: "browser-visit",
                },
            };
        }
        catch {
            // Fall back to scraping when browser automation cannot load the source cleanly.
        }
    }
    if (scraping) {
        const result = await scraping.scrape({ url });
        return {
            title: result.title,
            text: result.text,
            links: result.links,
            meta: {
                ...result.meta,
                extractionMode: "scrape",
            },
        };
    }
    return {
        title: undefined,
        text: "",
        links: [],
        meta: {
            source: "unavailable",
            status: 0,
            ok: false,
            extractionMode: "unavailable",
        },
    };
}
function extractPrices(content) {
    const prices = new Set();
    for (const match of content.text.matchAll(/(?:\$\s*|USD\s*)(\d[\d,]*(?:\.\d{1,2})?)/gi)) {
        const value = parsePrice(match[0]);
        if (value !== undefined) {
            prices.add(value);
        }
    }
    if (content.html !== undefined) {
        for (const value of extractHtmlPrices(content.html)) {
            prices.add(value);
        }
    }
    if (content.json !== undefined) {
        for (const value of extractJsonPrices(content.json)) {
            prices.add(value);
        }
    }
    return [...prices].filter((value) => Number.isFinite(value));
}
function extractHtmlPrices(html) {
    const results = new Set();
    const metaPatterns = [
        /<meta[^>]+(?:property|name)=["'](?:product:price:amount|og:price:amount|twitter:data1|price)["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
        /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:product:price:amount|og:price:amount|twitter:data1|price)["'][^>]*>/gi,
        /<meta[^>]+itemprop=["']price["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
    ];
    for (const pattern of metaPatterns) {
        for (const match of html.matchAll(pattern)) {
            const value = parsePrice(match[1] || match[0]);
            if (value !== undefined) {
                results.add(value);
            }
        }
    }
    for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
        const raw = String(match[1] || "").trim();
        if (!raw) {
            continue;
        }
        try {
            const parsed = JSON.parse(raw);
            for (const value of extractJsonPrices(parsed)) {
                results.add(value);
            }
        }
        catch {
            // Ignore malformed structured data.
        }
    }
    return [...results];
}
function extractJsonPrices(value) {
    const results = [];
    if (typeof value === "number") {
        if (Number.isFinite(value)) {
            results.push(value);
        }
        return results;
    }
    if (Array.isArray(value)) {
        for (const item of value) {
            results.push(...extractJsonPrices(item));
        }
        return results;
    }
    const record = coerceRecord(value);
    if (!record) {
        if (typeof value === "string") {
            const parsed = parsePrice(value);
            if (parsed !== undefined) {
                results.push(parsed);
            }
        }
        return results;
    }
    for (const [key, next] of Object.entries(record)) {
        if (typeof next === "number" && /price|cost|amount|msrp|sale/i.test(key)) {
            results.push(next);
        }
        else if (typeof next === "string" && /price|cost|amount|msrp|sale/i.test(key)) {
            const parsed = parsePrice(next);
            if (parsed !== undefined) {
                results.push(parsed);
            }
        }
        else {
            results.push(...extractJsonPrices(next));
        }
    }
    return results;
}
async function fetchRetailerSource(url) {
    try {
        const response = await fetch(url, {
            headers: retailerHeaders(url),
        });
        const html = await response.text();
        const text = stripHtml(html);
        const title = extractTitle(html);
        const links = extractLinks(html);
        return {
            title,
            text,
            links,
            html,
            meta: {
                source: "retailer-fetch",
                status: response.status,
                ok: response.ok,
                contentType: response.headers.get("content-type") || undefined,
                retailer: getRetailerName(url),
                extractionMode: "html",
                hasStructuredData: /application\/ld\+json/i.test(html),
            },
        };
    }
    catch {
        return undefined;
    }
}
function stripHtml(value) {
    return value
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
function extractTitle(html) {
    const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    return match ? stripHtml(match[1]).trim() || undefined : undefined;
}
function extractLinks(html) {
    const matches = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((match) => String(match[1] || "").trim());
    return [...new Set(matches.filter(Boolean))];
}
function retailerHeaders(url) {
    return {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        pragma: "no-cache",
        "user-agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 NStepOS/${retailerUserAgentSuffix(url)}`,
    };
}
function retailerUserAgentSuffix(url) {
    const host = getRetailerHost(url);
    return host ? host.replace(/[^a-z0-9]+/gi, "-").toLowerCase() : "live-price-check";
}
function retailerSelectorsForUrl(url) {
    const host = getRetailerHost(url);
    if (!host) {
        return [];
    }
    if (host.includes("amazon.")) {
        return [
            "#corePrice_feature_div .a-price .a-offscreen",
            "#corePriceDisplay_desktop_feature_div .a-price .a-offscreen",
            "span.a-price .a-offscreen",
            "meta[property='product:price:amount']",
            "meta[itemprop='price']",
        ];
    }
    if (host.includes("bestbuy.")) {
        return [
            "[data-testid='customer-price']",
            ".priceView-hero-price span",
            "meta[property='product:price:amount']",
            "meta[itemprop='price']",
        ];
    }
    if (host.includes("newegg.")) {
        return [
            ".price-current",
            ".product-price",
            "meta[property='product:price:amount']",
            "meta[itemprop='price']",
        ];
    }
    if (host.includes("bhphotovideo.")) {
        return [
            "[data-selenium='pricing']",
            ".price_1DPoToKrLP8uWvruGq5l",
            "meta[property='product:price:amount']",
            "meta[itemprop='price']",
        ];
    }
    if (host.includes("microcenter.")) {
        return [
            "[itemprop='price']",
            ".price",
            "meta[property='product:price:amount']",
            "meta[itemprop='price']",
        ];
    }
    if (host.includes("walmart.")) {
        return [
            "[data-automation-id='product-price']",
            "[itemprop='price']",
            "meta[property='product:price:amount']",
            "meta[itemprop='price']",
        ];
    }
    return [
        "meta[property='product:price:amount']",
        "meta[property='og:price:amount']",
        "meta[itemprop='price']",
        "[itemprop='price']",
        ".price",
        "[data-testid*='price']",
    ];
}
function isRetailerSource(kind, url) {
    if (kind === "retail" || kind === "marketplace") {
        return true;
    }
    const host = getRetailerHost(url);
    return Boolean(host && /amazon|bestbuy|newegg|bhphotovideo|microcenter|walmart|target|costco|canadacomputers/i.test(host));
}
function getRetailerHost(url) {
    try {
        return new URL(url).hostname.toLowerCase();
    }
    catch {
        return undefined;
    }
}
function getRetailerName(url) {
    const host = getRetailerHost(url) || "";
    if (host.includes("amazon")) {
        return "Amazon";
    }
    if (host.includes("bestbuy")) {
        return "Best Buy";
    }
    if (host.includes("newegg")) {
        return "Newegg";
    }
    if (host.includes("bhphotovideo")) {
        return "B&H Photo";
    }
    if (host.includes("microcenter")) {
        return "Micro Center";
    }
    if (host.includes("walmart")) {
        return "Walmart";
    }
    if (host.includes("target")) {
        return "Target";
    }
    if (host.includes("costco")) {
        return "Costco";
    }
    if (host.includes("canadacomputers")) {
        return "Canada Computers";
    }
    return host || "Retailer";
}
function matchPartId(source, parts) {
    const text = normalizeText(`${source.label || ""} ${source.url}`);
    if (!text) {
        return undefined;
    }
    const matched = parts.find((part) => {
        const partText = normalizeText(`${part.category} ${part.name} ${part.brand || ""} ${part.model || ""}`);
        return partText.split(" ").some((token) => token.length >= 3 && text.includes(token));
    });
    return matched?.partId;
}
function formatMoney(amount, currency) {
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(amount);
    }
    catch {
        return `${currency} ${Math.round(amount)}`;
    }
}
//# sourceMappingURL=pricing.js.map