/**
 * 💰 AFFILIATE LINKS SERVICE (Improved)
 * 
 * Safe URL building with URLSearchParams
 * Category hub support for bulk linking
 * Env-based config (no hardcoded tags in repo)
 * Direct ASIN/product link support when available
 */

import Constants from 'expo-constants';

const resolveAmazonTag = () => {
    const tag = Constants.expoConfig?.extra?.amazonAssociatesTag || '';
    const normalized = String(tag).trim();
    return normalized && normalized !== 'your-tag' ? normalized : null;
};

// ============================================================
// CONFIGURATION — Uses env vars, falls back to defaults
// ============================================================
const AFFILIATE_CONFIG = {
    amazon: {
        tag: resolveAmazonTag(),
        baseUrl: 'https://www.amazon.com',
    },
    newegg: {
        // NOTE: Add real tracking params when you have affiliate account
        baseUrl: 'https://www.newegg.com',
    },
    bhphoto: {
        // NOTE: Add real tracking params when you have affiliate account
        baseUrl: 'https://www.bhphotovideo.com',
    },
};

// ============================================================
// CATEGORY HUB KEYWORDS — For bulk linking (~15 links, not 100s)
// ============================================================
const AMAZON_HUB_KEYWORDS = {
    cpu: 'cpu processor ryzen intel core i5 i7 i9',
    gpu: 'graphics card gpu rtx 4070 4070ti 4080 7800xt 7900xtx',
    motherboard: 'motherboard am5 lga1700 b650 x670 z790 b760',
    ram: 'ddr5 ram 32gb 6000mhz ddr4 3600',
    ssd: 'nvme ssd gen4 gen5 1tb 2tb samsung wd',
    hdd: 'hard drive hdd 4tb 8tb storage',
    psu: 'power supply psu 750w 850w 1000w modular gold',
    case: 'pc case mid tower atx airflow rgb',
    cooler: 'cpu cooler air aio 240mm 360mm noctua',
    monitor: 'gaming monitor 1440p 4k 144hz 240hz ips',
    keyboard: 'mechanical keyboard gaming rgb',
    mouse: 'gaming mouse wireless',
    headset: 'gaming headset wireless',
    fans: 'pc case fans rgb 120mm',
    thermal: 'thermal paste compound',
    cables: 'pc cables psu extensions',
};

// ============================================================
// HELPER: Safe query sanitization
// ============================================================
function safeQuery(input) {
    if (!input) return null;
    const s = String(input).trim();
    return s.length ? s : null;
}

// ============================================================
// AMAZON AFFILIATE LINKS
// ============================================================

/**
 * Generate Amazon affiliate search URL with safe params
 * @param {string} query - Product name or search query
 * @param {object} opts - Options { hubCategory: 'gpu' }
 * @returns {string|null} - Affiliate-tagged Amazon search URL
 */
export const getAmazonAffiliateSearchUrl = (query, opts = {}) => {
    const q = safeQuery(query);
    if (!q) return null;

    const { tag, baseUrl } = AFFILIATE_CONFIG.amazon;
    const url = new URL('/s', baseUrl);

    // If a hub category is provided, enrich the query with keywords
    const hubKeywords = opts.hubCategory ? AMAZON_HUB_KEYWORDS[opts.hubCategory] : null;
    const finalQuery = hubKeywords ? `${q} ${hubKeywords}` : q;

    url.searchParams.set('k', finalQuery);
    if (tag) {
        url.searchParams.set('tag', tag);
    }

    // Optional: narrow to computers department
    // url.searchParams.set('i', 'computers');

    return url.toString();
};

/**
 * Generate Amazon direct product link (when ASIN/DP URL is known)
 * @param {string} asin - Amazon ASIN or full DP URL
 * @returns {string|null} - Affiliate-tagged Amazon product URL
 */
export const getAmazonAffiliateDpUrl = (asin) => {
    const a = safeQuery(asin);
    if (!a) return null;

    const { tag, baseUrl } = AFFILIATE_CONFIG.amazon;

    // If it's already a full URL, just append tag
    if (a.startsWith('http')) {
        try {
            const existingUrl = new URL(a);
            if (tag) {
                existingUrl.searchParams.set('tag', tag);
            }
            return existingUrl.toString();
        } catch {
            return null;
        }
    }

    // Otherwise treat as ASIN
    const url = new URL(`/dp/${a}`, baseUrl);
    if (tag) {
        url.searchParams.set('tag', tag);
    }
    return url.toString();
};

/**
 * Default: productName → Amazon search
 */
export const getAmazonAffiliateUrl = (productName) =>
    getAmazonAffiliateSearchUrl(productName);

/**
 * Get a category hub link (bulk linking approach)
 * @param {string} category - Category key (gpu, cpu, ram, etc.)
 * @returns {string} - Amazon search URL with hub keywords
 */
export const getAmazonCategoryHub = (category) => {
    const cat = category?.toLowerCase();
    const keywords = AMAZON_HUB_KEYWORDS[cat] || 'pc parts components';
    return getAmazonAffiliateSearchUrl(keywords);
};

// ============================================================
// NEWEGG & B&H PHOTO (Structured for future tracking)
// ============================================================

export const getNeweggSearchUrl = (productName) => {
    const q = safeQuery(productName);
    if (!q) return null;

    const url = new URL('/p/pl', AFFILIATE_CONFIG.newegg.baseUrl);
    url.searchParams.set('d', q);
    // TODO: Add affiliate tracking params when you have them
    return url.toString();
};

export const getBHPhotoSearchUrl = (productName) => {
    const q = safeQuery(productName);
    if (!q) return null;

    const url = new URL('/c/search', AFFILIATE_CONFIG.bhphoto.baseUrl);
    url.searchParams.set('Ntt', q);
    // TODO: Add affiliate tracking params when you have them
    return url.toString();
};

// ============================================================
// CONVENIENCE FUNCTIONS
// ============================================================

/**
 * Get all affiliate links for a product
 */
export const getAllAffiliateLinks = (productName) => ({
    amazon: getAmazonAffiliateUrl(productName),
    newegg: getNeweggSearchUrl(productName),
    bhphoto: getBHPhotoSearchUrl(productName),
});

/**
 * Get primary affiliate URL for a part
 * Prefers: 1) Direct affiliate link, 2) Generated search
 */
export const getPrimaryAffiliateUrl = (part) => {
    if (!part?.name) return null;

    // If we have a stored direct affiliate link, use it (with tag)
    if (part.affiliate_link_amazon) {
        return getAmazonAffiliateDpUrl(part.affiliate_link_amazon);
    }

    // Otherwise generate search URL
    return getAmazonAffiliateUrl(part.name);
};

// ============================================================
// DISCLOSURE TEXT (Required by FTC/Amazon)
// ============================================================

export const AFFILIATE_DISCLOSURE =
    'As an Amazon Associate, NexusBuild earns from qualifying purchases.';

export const AFFILIATE_DISCLOSURE_SHORT = 'Affiliate link';

// ============================================================
// EXPORTS
// ============================================================

export default {
    getAmazonAffiliateUrl,
    getAmazonAffiliateSearchUrl,
    getAmazonAffiliateDpUrl,
    getAmazonCategoryHub,
    getNeweggSearchUrl,
    getBHPhotoSearchUrl,
    getAllAffiliateLinks,
    getPrimaryAffiliateUrl,
    AFFILIATE_DISCLOSURE,
    AFFILIATE_CONFIG,
    AMAZON_HUB_KEYWORDS,
};
