/**
 * Apify PCPartPicker Scraper Service
 *
 * Uses Apify's PCPartPicker Scraper actor to fetch real-time pricing and
 * product data, then normalizes and ranks the results for NexusBuild.
 */

import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

const ACTOR_ID = process.env.APIFY_PCPARTPICKER_ACTOR_ID || 'Wa8AOJpMTOnV1V7uX';
const SEARCH_CACHE_TTL_MS = 10 * 60 * 1000;
const PRODUCT_CACHE_TTL_MS = 15 * 60 * 1000;

const searchCache = new Map<string, { expiresAt: number; results: PCPartPickerProduct[] }>();
const productCache = new Map<string, { expiresAt: number; result: PCPartPickerProduct | null }>();

export const isApifyConfigured = () => Boolean(process.env.APIFY_API_TOKEN?.trim());

export const PCPP_CATEGORIES = {
    CPU: 'cpu',
    GPU: 'video-card',
    MOTHERBOARD: 'motherboard',
    RAM: 'memory',
    STORAGE: 'internal-hard-drive',
    SSD: 'internal-hard-drive',
    PSU: 'power-supply',
    CASE: 'case',
    COOLER: 'cpu-cooler',
    MONITOR: 'monitor',
    KEYBOARD: 'keyboard',
    MOUSE: 'mouse',
    HEADPHONES: 'headphones',
} as const;

export type PCPartPickerCategory =
    (typeof PCPP_CATEGORIES)[keyof typeof PCPP_CATEGORIES];

const CATEGORY_ALIASES: Record<string, string> = {
    cpu: PCPP_CATEGORIES.CPU,
    processor: PCPP_CATEGORIES.CPU,
    gpu: PCPP_CATEGORIES.GPU,
    'graphics card': PCPP_CATEGORIES.GPU,
    'graphics-card': PCPP_CATEGORIES.GPU,
    'video card': PCPP_CATEGORIES.GPU,
    'video-card': PCPP_CATEGORIES.GPU,
    motherboard: PCPP_CATEGORIES.MOTHERBOARD,
    mobo: PCPP_CATEGORIES.MOTHERBOARD,
    ram: PCPP_CATEGORIES.RAM,
    memory: PCPP_CATEGORIES.RAM,
    storage: PCPP_CATEGORIES.STORAGE,
    ssd: PCPP_CATEGORIES.SSD,
    hdd: PCPP_CATEGORIES.STORAGE,
    nvme: PCPP_CATEGORIES.STORAGE,
    psu: PCPP_CATEGORIES.PSU,
    'power supply': PCPP_CATEGORIES.PSU,
    'power-supply': PCPP_CATEGORIES.PSU,
    case: PCPP_CATEGORIES.CASE,
    chassis: PCPP_CATEGORIES.CASE,
    cooler: PCPP_CATEGORIES.COOLER,
    'cpu cooler': PCPP_CATEGORIES.COOLER,
    'cpu-cooler': PCPP_CATEGORIES.COOLER,
    monitor: PCPP_CATEGORIES.MONITOR,
    keyboard: PCPP_CATEGORIES.KEYBOARD,
    mouse: PCPP_CATEGORIES.MOUSE,
    headphones: PCPP_CATEGORIES.HEADPHONES,
};

const STOP_WORDS = new Set([
    'a',
    'an',
    'and',
    'the',
    'for',
    'with',
    'of',
    'to',
    'in',
    'by',
]);

const SEARCH_NOISE_WORDS = new Set([
    ...STOP_WORDS,
    'edition',
    'gaming',
    'desktop',
    'processor',
    'graphics',
    'card',
    'module',
    'kit',
    'internal',
    'drive',
    'solid',
    'state',
    'wireless',
    'wifi',
    'rgb',
    'black',
    'white',
    'series',
    'oc',
    'airflow',
    'cooler',
]);

const MODEL_TOKEN_RE = /(?:\d{3,5}[a-z]{0,4}|x3d|xtx|xt|gre|ti|super|ddr[45]|nvme|am[45]|lga\d{4})/i;

interface RawPriceOffer {
    merchant?: string;
    availability?: string;
    price?: number | string | null;
    currency?: string | null;
    buyLink?: string | null;
    buylink?: string | null;
}

interface RawPCPartPickerProduct {
    id?: string | number;
    name?: string;
    category?: string;
    url?: string;
    price?: {
        lowestPrice?: number | string | null;
        merchant?: string | null;
        availability?: string | null;
        buyLink?: string | null;
        currency?: string | null;
    };
    prices?: {
        lowestPrice?: number | string | null;
        prices?: RawPriceOffer[];
        merchant?: string | null;
        availability?: string | null;
        buyLink?: string | null;
        currency?: string | null;
    };
    rating?: {
        stars?: number | string | null;
        count?: number | string | null;
    };
    ratings?: {
        averageRating?: number | string | null;
        numberOfRatings?: number | string | null;
    };
    specs?: Record<string, string>;
    specification?: Record<string, string>;
    specifications?: Record<string, string>;
    reviews?: unknown[];
    searchPhrase?: string;
}

export interface PCPartPickerProduct {
    id: string;
    name: string;
    category: string;
    url: string;
    price: {
        lowestPrice: number | null;
        merchant: string | null;
        availability: string;
        buyLink: string | null;
        currency: string;
        offers?: Array<{
            merchant: string | null;
            availability: string;
            price: number | null;
            currency: string;
            buyLink: string | null;
        }>;
    };
    rating: {
        stars: number | null;
        count: number | null;
    };
    specs?: Record<string, string>;
    reviews?: unknown[];
    match?: ProductMatchInfo;
    sourceSearchPhrase?: string;
}

export interface ProductMatchInfo {
    score: number;
    matchedTokens: string[];
    missingTokens: string[];
    exactName: boolean;
}

export interface SearchOptions {
    searchPhrases?: string[];
    category?: string;
    maxProducts?: number;
    maxReviews?: number;
    countryCode?: string;
}

const parseNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value !== 'string') return null;

    const cleaned = value.replace(/[^0-9.]+/g, '');
    if (!cleaned) return null;

    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
};

const dedupe = <T>(values: T[]) => Array.from(new Set(values));

const normalizeText = (value: string) =>
    value
        .toLowerCase()
        .replace(/[\u00ae\u2122]/g, '')
        .replace(/[^a-z0-9+.-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const tokenize = (value: string) =>
    normalizeText(value)
        .split(' ')
        .map((token) => token.trim())
        .filter(Boolean)
        .filter((token) => token.length > 1 || MODEL_TOKEN_RE.test(token))
        .filter((token) => !STOP_WORDS.has(token));

const isModelToken = (token: string) => MODEL_TOKEN_RE.test(token);

export const normalizeCategory = (
    category?: string | null
): PCPartPickerCategory | string | undefined => {
    if (!category) return undefined;
    const normalized = normalizeText(category);
    return CATEGORY_ALIASES[normalized] || normalized || undefined;
};

export const buildSearchPhrases = (query: string): string[] => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const variants = new Set<string>();
    variants.add(trimmed);

    const withoutParens = trimmed.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
    if (withoutParens) {
        variants.add(withoutParens);
    }

    const cleaned = withoutParens.replace(/[,+/]/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleaned) {
        variants.add(cleaned);
    }

    const coreTokens = tokenize(cleaned).filter(
        (token) => isModelToken(token) || !SEARCH_NOISE_WORDS.has(token)
    );
    if (coreTokens.length) {
        variants.add(coreTokens.slice(0, 6).join(' '));
    }

    const modelTokens = coreTokens.filter(isModelToken);
    if (modelTokens.length) {
        variants.add(modelTokens.slice(0, 4).join(' '));
    }

    return Array.from(variants)
        .map((value) => value.trim())
        .filter((value) => value.length >= 2)
        .slice(0, 4);
};

const normalizeOffer = (offer: RawPriceOffer) => ({
    merchant: offer.merchant || null,
    availability: offer.availability || 'Unknown',
    price: parseNumber(offer.price),
    currency: offer.currency || 'USD',
    buyLink: offer.buyLink || offer.buylink || null,
});

export const normalizeApifyProduct = (raw: RawPCPartPickerProduct): PCPartPickerProduct | null => {
    if (!raw?.name || !raw?.url) {
        return null;
    }

    const pluralPrices = raw.prices;
    const singularPrice = raw.price;
    const offers = Array.isArray(pluralPrices?.prices)
        ? pluralPrices.prices.map(normalizeOffer).sort((a, b) => {
            if (a.price == null && b.price == null) return 0;
            if (a.price == null) return 1;
            if (b.price == null) return -1;
            return a.price - b.price;
        })
        : [];

    const lowestOffer = offers.find((offer) => offer.price != null) || offers[0] || null;
    const lowestPrice =
        parseNumber(pluralPrices?.lowestPrice ?? singularPrice?.lowestPrice) ??
        lowestOffer?.price ??
        null;
    const pluralRatings = raw.ratings;
    const singularRating = raw.rating;

    return {
        id: String(raw.id || raw.url),
        name: raw.name.trim(),
        category: raw.category?.trim() || 'Unknown',
        url: raw.url,
        price: {
            lowestPrice,
            merchant: pluralPrices?.merchant || singularPrice?.merchant || lowestOffer?.merchant || null,
            availability:
                pluralPrices?.availability ||
                singularPrice?.availability ||
                lowestOffer?.availability ||
                'Unknown',
            buyLink: pluralPrices?.buyLink || singularPrice?.buyLink || lowestOffer?.buyLink || null,
            currency: pluralPrices?.currency || singularPrice?.currency || lowestOffer?.currency || 'USD',
            offers,
        },
        rating: {
            stars: parseNumber(pluralRatings?.averageRating ?? singularRating?.stars),
            count: parseNumber(pluralRatings?.numberOfRatings ?? singularRating?.count),
        },
        specs: raw.specifications || raw.specification || raw.specs,
        reviews: Array.isArray(raw.reviews) ? raw.reviews : undefined,
        sourceSearchPhrase: raw.searchPhrase,
    };
};

export const scoreProductMatch = (
    query: string,
    product: PCPartPickerProduct,
    category?: string
): ProductMatchInfo => {
    const queryTokens = tokenize(query);
    const productTokens = tokenize(product.name);
    const productTokenSet = new Set(productTokens);
    const matchedTokens = queryTokens.filter((token) => productTokenSet.has(token));
    const missingTokens = queryTokens.filter((token) => !productTokenSet.has(token));
    const exactName = normalizeText(query) === normalizeText(product.name);

    let score = 0;

    if (exactName) {
        score += 120;
    }

    const normalizedQuery = normalizeText(query);
    const normalizedName = normalizeText(product.name);
    if (normalizedName.includes(normalizedQuery) || normalizedQuery.includes(normalizedName)) {
        score += 40;
    }

    if (queryTokens.length > 0) {
        score += (matchedTokens.length / queryTokens.length) * 80;
    }

    matchedTokens.forEach((token) => {
        score += isModelToken(token) ? 18 : 8;
    });

    missingTokens.forEach((token) => {
        score -= isModelToken(token) ? 20 : 6;
    });

    const normalizedCategory = normalizeCategory(category);
    const normalizedProductCategory = normalizeCategory(product.category);
    if (normalizedCategory) {
        score += normalizedCategory === normalizedProductCategory ? 20 : -15;
    }

    score += product.price.lowestPrice != null ? 10 : -5;
    score += product.rating.count ? Math.min(product.rating.count / 20, 10) : 0;
    score += product.rating.stars ? product.rating.stars : 0;

    return {
        score,
        matchedTokens,
        missingTokens,
        exactName,
    };
};

export const rankProducts = (
    query: string,
    products: PCPartPickerProduct[],
    category?: string
): PCPartPickerProduct[] => {
    const deduped = new Map<string, PCPartPickerProduct>();

    for (const product of products) {
        const key = normalizeText(product.name);
        const existing = deduped.get(key);
        if (!existing) {
            deduped.set(key, product);
            continue;
        }

        const existingPrice = existing.price.lowestPrice ?? Number.POSITIVE_INFINITY;
        const currentPrice = product.price.lowestPrice ?? Number.POSITIVE_INFINITY;
        const existingRatings = existing.rating.count ?? 0;
        const currentRatings = product.rating.count ?? 0;

        if (currentPrice < existingPrice || currentRatings > existingRatings) {
            deduped.set(key, product);
        }
    }

    return Array.from(deduped.values())
        .map((product) => ({
            ...product,
            match: scoreProductMatch(query, product, category),
        }))
        .sort((a, b) => {
            const scoreDiff = (b.match?.score ?? 0) - (a.match?.score ?? 0);
            if (scoreDiff !== 0) return scoreDiff;

            const aPrice = a.price.lowestPrice ?? Number.POSITIVE_INFINITY;
            const bPrice = b.price.lowestPrice ?? Number.POSITIVE_INFINITY;
            if (aPrice !== bPrice) return aPrice - bPrice;

            return (b.rating.count ?? 0) - (a.rating.count ?? 0);
        });
};

const getCachedSearch = (key: string) => {
    const cached = searchCache.get(key);
    if (!cached) return null;
    if (cached.expiresAt < Date.now()) {
        searchCache.delete(key);
        return null;
    }
    return cached.results;
};

const setCachedSearch = (key: string, results: PCPartPickerProduct[]) => {
    searchCache.set(key, {
        expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
        results,
    });
};

const getCachedProduct = (key: string) => {
    const cached = productCache.get(key);
    if (!cached) return null;
    if (cached.expiresAt < Date.now()) {
        productCache.delete(key);
        return null;
    }
    return cached.result;
};

const setCachedProduct = (key: string, result: PCPartPickerProduct | null) => {
    productCache.set(key, {
        expiresAt: Date.now() + PRODUCT_CACHE_TTL_MS,
        result,
    });
};

/**
 * Search for PC parts on PCPartPicker.
 */
export async function searchPCParts(options: SearchOptions): Promise<PCPartPickerProduct[]> {
    const {
        searchPhrases = [],
        category,
        maxProducts = 20,
        maxReviews = 0,
        countryCode = 'us',
    } = options;

    const normalizedCategory = normalizeCategory(category);
    const normalizedSearchPhrases = dedupe(
        searchPhrases.flatMap((phrase) => buildSearchPhrases(phrase))
    );

    const cacheKey = JSON.stringify({
        searchPhrases: normalizedSearchPhrases,
        category: normalizedCategory,
        maxProducts,
        maxReviews,
        countryCode,
    });

    const cached = getCachedSearch(cacheKey);
    if (cached) {
        return cached;
    }

    if (!isApifyConfigured()) {
        throw new Error('APIFY_API_TOKEN is not configured');
    }

    try {
        const input = {
            searchPhrases: normalizedSearchPhrases.length > 0 ? normalizedSearchPhrases : undefined,
            category: normalizedCategory,
            maxProducts,
            maxReviews,
            countryCode,
        };

        console.log('[Apify] Starting PCPartPicker search:', input);

        const run = await client.actor(ACTOR_ID).call(input, {
            waitSecs: 120,
        });

        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        const normalizedResults = (items as RawPCPartPickerProduct[])
            .map(normalizeApifyProduct)
            .filter((item): item is PCPartPickerProduct => item !== null);

        console.log(`[Apify] Found ${normalizedResults.length} normalized products`);

        setCachedSearch(cacheKey, normalizedResults);
        return normalizedResults;
    } catch (error) {
        console.error('[Apify] Error searching PC parts:', error);
        throw error;
    }
}

/**
 * Get price for a specific product by name.
 */
export async function getProductPrice(productName: string, category?: string): Promise<PCPartPickerProduct | null> {
    const cacheKey = `${normalizeText(productName)}::${normalizeCategory(category) || 'any'}`;
    const cached = getCachedProduct(cacheKey);
    if (cached !== null) {
        return cached;
    }

    try {
        const searchPhrases = buildSearchPhrases(productName);
        const categoryCandidates = dedupe([normalizeCategory(category), undefined]);

        let bestProduct: PCPartPickerProduct | null = null;

        for (const categoryCandidate of categoryCandidates) {
            const results = await searchPCParts({
                searchPhrases,
                category: categoryCandidate,
                maxProducts: 12,
                countryCode: 'us',
            });

            const ranked = rankProducts(productName, results, categoryCandidate);
            const candidate = ranked[0] || null;

            if (!candidate) {
                continue;
            }

            if (!bestProduct || (candidate.match?.score ?? 0) > (bestProduct.match?.score ?? 0)) {
                bestProduct = candidate;
            }

            if (
                (candidate.match?.score ?? 0) >= 70 ||
                (candidate.match?.missingTokens.filter(isModelToken).length ?? 0) === 0
            ) {
                break;
            }
        }

        const result = (bestProduct?.match?.score ?? 0) >= 25 ? bestProduct : null;
        setCachedProduct(cacheKey, result);
        return result;
    } catch (error) {
        console.error('[Apify] Error getting product price:', error);
        setCachedProduct(cacheKey, null);
        return null;
    }
}

/**
 * Get prices for multiple products.
 */
export async function getBatchPrices(
    products: { name: string; category?: string }[]
): Promise<Map<string, PCPartPickerProduct | null>> {
    const results = new Map<string, PCPartPickerProduct | null>();

    const uniqueProducts = dedupe(
        products.map((product) => `${product.name}::${normalizeCategory(product.category) || ''}`)
    ).map((key) => {
        const [name, normalizedCategory] = key.split('::');
        return {
            name,
            category: normalizedCategory || undefined,
            key,
        };
    });

    const resolved = new Map<string, PCPartPickerProduct | null>();
    const batchSize = 4;

    for (let i = 0; i < uniqueProducts.length; i += batchSize) {
        const batch = uniqueProducts.slice(i, i + batchSize);
        await Promise.all(
            batch.map(async (product) => {
                const result = await getProductPrice(product.name, product.category);
                resolved.set(product.key, result);
            })
        );
    }

    for (const product of products) {
        const lookupKey = `${product.name}::${normalizeCategory(product.category) || ''}`;
        results.set(product.name, resolved.get(lookupKey) ?? null);
    }

    return results;
}

/**
 * Get trending products in a category.
 */
export async function getTrendingProducts(
    category: string,
    limit: number = 10
): Promise<PCPartPickerProduct[]> {
    try {
        return await searchPCParts({
            category,
            maxProducts: limit,
            countryCode: 'us',
        });
    } catch (error) {
        console.error('[Apify] Error getting trending products:', error);
        return [];
    }
}

/**
 * Format price for display.
 */
export function formatPrice(product: PCPartPickerProduct): string {
    if (product.price.lowestPrice == null) {
        return 'Price not available';
    }
    const currency = product.price.currency === 'USD' ? '$' : product.price.currency;
    return `${currency}${product.price.lowestPrice.toFixed(2)}`;
}

/**
 * Check if actor is available and API token is valid.
 */
export async function checkApifyConnection(): Promise<boolean> {
    try {
        if (!isApifyConfigured()) {
            console.warn('[Apify] No API token configured');
            return false;
        }

        const actorInfo = await client.actor(ACTOR_ID).get();
        console.log('[Apify] Connected successfully. Actor:', actorInfo?.name);
        return true;
    } catch (error) {
        console.error('[Apify] Connection check failed:', error);
        return false;
    }
}

export default {
    buildSearchPhrases,
    checkApifyConnection,
    formatPrice,
    getBatchPrices,
    getProductPrice,
    getTrendingProducts,
    normalizeApifyProduct,
    normalizeCategory,
    PCPP_CATEGORIES,
    rankProducts,
    scoreProductMatch,
    searchPCParts,
    isApifyConfigured,
};
