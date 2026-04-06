/**
 * Local retailer pricing scraper service.
 *
 * Uses free retailer search pages plus a long-lived disk cache so NexusBuild
 * refreshes pricing a few times per week instead of paying for a per-request
 * scraping service.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import type { Browser } from 'playwright';

const RETAILER_USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const HTTP_TIMEOUT_MS = 30_000;
const CACHE_TTL_HOURS = Number.parseInt(process.env.PRICE_CACHE_TTL_HOURS || '72', 10) || 72;
const SEARCH_CACHE_TTL_MS = CACHE_TTL_HOURS * 60 * 60 * 1000;
const PRODUCT_CACHE_TTL_MS = CACHE_TTL_HOURS * 60 * 60 * 1000;
const CACHE_FILE_PATH = path.resolve(__dirname, '..', '..', 'storage', 'price-cache.json');
const MICRO_CENTER_STORE_ID = process.env.MICROCENTER_STORE_ID || '029';

const searchCache = new Map<string, { expiresAt: number; results: PCPartPickerProduct[] }>();
const productCache = new Map<string, { expiresAt: number; result: PCPartPickerProduct | null }>();

let browserPromise: Promise<Browser> | null = null;
let cacheLoaded = false;
let cacheWritePromise: Promise<void> = Promise.resolve();

export const SCRAPER_SOURCES = ['Newegg', 'Micro Center'] as const;

const NO_CACHE = Symbol('NO_CACHE');

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
    cpus: PCPP_CATEGORIES.CPU,
    processor: PCPP_CATEGORIES.CPU,
    processors: PCPP_CATEGORIES.CPU,
    'cpus / processors': PCPP_CATEGORIES.CPU,
    gpu: PCPP_CATEGORIES.GPU,
    gpus: PCPP_CATEGORIES.GPU,
    'graphics card': PCPP_CATEGORIES.GPU,
    'graphics cards': PCPP_CATEGORIES.GPU,
    'graphics-card': PCPP_CATEGORIES.GPU,
    'video card': PCPP_CATEGORIES.GPU,
    'video cards': PCPP_CATEGORIES.GPU,
    'video-card': PCPP_CATEGORIES.GPU,
    'gpus / video graphics cards': PCPP_CATEGORIES.GPU,
    'video card - nvidia': PCPP_CATEGORIES.GPU,
    'video card - amd': PCPP_CATEGORIES.GPU,
    motherboard: PCPP_CATEGORIES.MOTHERBOARD,
    motherboards: PCPP_CATEGORIES.MOTHERBOARD,
    mobo: PCPP_CATEGORIES.MOTHERBOARD,
    ram: PCPP_CATEGORIES.RAM,
    memory: PCPP_CATEGORIES.RAM,
    storage: PCPP_CATEGORIES.STORAGE,
    ssd: PCPP_CATEGORIES.SSD,
    ssds: PCPP_CATEGORIES.SSD,
    'solid state drive': PCPP_CATEGORIES.STORAGE,
    'solid state drives': PCPP_CATEGORIES.STORAGE,
    'internal hard drives': PCPP_CATEGORIES.STORAGE,
    hdd: PCPP_CATEGORIES.STORAGE,
    hdds: PCPP_CATEGORIES.STORAGE,
    nvme: PCPP_CATEGORIES.STORAGE,
    psu: PCPP_CATEGORIES.PSU,
    'power supply': PCPP_CATEGORIES.PSU,
    'power supplies': PCPP_CATEGORIES.PSU,
    'power-supply': PCPP_CATEGORIES.PSU,
    case: PCPP_CATEGORIES.CASE,
    cases: PCPP_CATEGORIES.CASE,
    chassis: PCPP_CATEGORIES.CASE,
    cooler: PCPP_CATEGORIES.COOLER,
    coolers: PCPP_CATEGORIES.COOLER,
    'cpu cooler': PCPP_CATEGORIES.COOLER,
    'cpu coolers': PCPP_CATEGORIES.COOLER,
    'cpu-cooler': PCPP_CATEGORIES.COOLER,
    monitor: PCPP_CATEGORIES.MONITOR,
    monitors: PCPP_CATEGORIES.MONITOR,
    keyboard: PCPP_CATEGORIES.KEYBOARD,
    keyboards: PCPP_CATEGORIES.KEYBOARD,
    mouse: PCPP_CATEGORIES.MOUSE,
    mice: PCPP_CATEGORIES.MOUSE,
    headphones: PCPP_CATEGORIES.HEADPHONES,
    headset: PCPP_CATEGORIES.HEADPHONES,
    headsets: PCPP_CATEGORIES.HEADPHONES,
};

const CATEGORY_HINTS: Partial<Record<PCPartPickerCategory, string[]>> = {
    [PCPP_CATEGORIES.CPU]: ['processor'],
    [PCPP_CATEGORIES.GPU]: ['graphics card'],
    [PCPP_CATEGORIES.MOTHERBOARD]: ['motherboard'],
    [PCPP_CATEGORIES.RAM]: ['memory'],
    [PCPP_CATEGORIES.STORAGE]: ['ssd'],
    [PCPP_CATEGORIES.PSU]: ['power supply'],
    [PCPP_CATEGORIES.CASE]: ['pc case'],
    [PCPP_CATEGORIES.COOLER]: ['cpu cooler'],
    [PCPP_CATEGORIES.MONITOR]: ['monitor'],
    [PCPP_CATEGORIES.KEYBOARD]: ['keyboard'],
    [PCPP_CATEGORIES.MOUSE]: ['mouse'],
    [PCPP_CATEGORIES.HEADPHONES]: ['headphones'],
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
    'graphics',
    'card',
    'cards',
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
    'overclocked',
    'triple',
    'dual',
    'fan',
    'fans',
    'pcie',
]);

const PRODUCT_FINGERPRINT_NOISE = new Set([
    ...SEARCH_NOISE_WORDS,
    'nvidia',
    'amd',
    'intel',
    'geforce',
    'radeon',
    'core',
    'ultra',
    'pci',
    'express',
    'gddr6',
    'gddr6x',
    'gddr7',
    'gb',
    '16gb',
    '12gb',
    '8gb',
]);

const MODEL_TOKEN_RE = /(?:\d{3,5}[a-z]{0,4}|x3d|xtx|xt|gre|ti|super|ddr[45]|nvme|am[45]|lga\d{4})/i;
const HTML_ENTITY_MAP: Record<string, string> = {
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
};

interface SearchCacheSnapshot {
    search: Record<string, { expiresAt: number; results: PCPartPickerProduct[] }>;
    product: Record<string, { expiresAt: number; result: PCPartPickerProduct | null }>;
}

export interface SearchOptions {
    searchPhrases?: string[];
    category?: string;
    maxProducts?: number;
    maxReviews?: number;
    countryCode?: string;
}

interface NeweggSearchState {
    Products?: Array<{ ItemCell?: NeweggItemCell | null }>;
}

interface NeweggItemCell {
    Item?: string;
    UnitCost?: number | string | null;
    FinalPrice?: number | string | null;
    Instock?: boolean;
    Seller?: {
        SellerName?: string | null;
    };
    Description?: {
        Title?: string;
        LineDescription?: string;
        BulletDescription?: string;
        ProductName?: string;
    };
    Subcategory?: {
        SubcategoryDescription?: string;
        RealSubCategoryDescription?: string;
    };
    ItemManufactory?: {
        Manufactory?: string | null;
    };
    Review?: {
        RatingOneDecimal?: number | string | null;
        Rating?: number | string | null;
        HumanRating?: number | string | null;
    };
    ViewDescription?: string;
}

export interface PCPartPickerProduct {
    id: string;
    name: string;
    category: string;
    url: string;
    source?: string;
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

const parseNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value !== 'string') {
        return null;
    }

    const cleaned = value.replace(/[^0-9.]+/g, '');
    if (!cleaned) {
        return null;
    }

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

const decodeHtmlEntities = (value: string) => {
    let decoded = value;
    decoded = decoded.replace(/&#(\d+);/g, (_, codePoint) =>
        String.fromCodePoint(Number.parseInt(codePoint, 10))
    );
    decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (_, codePoint) =>
        String.fromCodePoint(Number.parseInt(codePoint, 16))
    );

    for (const [entity, replacement] of Object.entries(HTML_ENTITY_MAP)) {
        decoded = decoded.split(entity).join(replacement);
    }

    return decoded;
};

const stripTags = (value: string) =>
    decodeHtmlEntities(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());

const toAbsoluteUrl = (baseUrl: string, maybeRelativeUrl: string) => {
    if (!maybeRelativeUrl) {
        return baseUrl;
    }

    try {
        return new URL(maybeRelativeUrl, baseUrl).toString();
    } catch {
        return baseUrl;
    }
};

const parseSpecHtml = (value?: string | null): Record<string, string> | undefined => {
    if (!value) {
        return undefined;
    }

    const specs: Record<string, string> = {};
    const lines = value
        .replace(/<br\s*\/?>/gi, '\n')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    for (const line of lines) {
        const match = line.match(/<b>(.*?)<\/b>\s*(.*)/i);
        if (!match) {
            continue;
        }

        const key = stripTags(match[1]).replace(/:$/, '').trim();
        const specValue = stripTags(match[2]);
        if (key && specValue) {
            specs[key] = specValue;
        }
    }

    return Object.keys(specs).length > 0 ? specs : undefined;
};

const extractJsonAssignment = (html: string, variableName: string): string | null => {
    const pattern = new RegExp(`${variableName}\\s*=\\s*(\\{[\\s\\S]*?\\})\\s*<\\/script>`);
    const match = html.match(pattern);
    return match?.[1] || null;
};

export const normalizeCategory = (
    category?: string | null
): PCPartPickerCategory | string | undefined => {
    if (!category) {
        return undefined;
    }

    const normalized = normalizeText(category);
    return CATEGORY_ALIASES[normalized] || normalized || undefined;
};

export const buildSearchPhrases = (query: string): string[] => {
    const trimmed = query.trim();
    if (!trimmed) {
        return [];
    }

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
    if (coreTokens.length > 0) {
        variants.add(coreTokens.slice(0, 6).join(' '));
    }

    const modelTokens = coreTokens.filter(isModelToken);
    if (modelTokens.length > 0) {
        variants.add(modelTokens.slice(0, 4).join(' '));
    }

    return Array.from(variants)
        .map((value) => value.trim())
        .filter((value) => value.length >= 2)
        .slice(0, 4);
};
