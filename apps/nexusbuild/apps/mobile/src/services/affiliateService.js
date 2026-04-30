/**
 * Affiliate Service - NexusBuild Mobile App
 * 
 * AFFILIATE-SAFE ARCHITECTURE:
 * - No hardcoded affiliate URLs per product
 * - Products store only neutral data + merchantSku (e.g., {amazon: "ASIN"})
 * - Affiliate URLs generated dynamically at click time via redirect layer
 * - Merchant configs stored here, not per product
 * 
 * Usage:
 *   import affiliateService, { getAffiliateUrl, AFFILIATE_DISCLOSURE } from './affiliateService';
 *   
 *   // Get redirect URL for a product
 *   const url = affiliateService.getAffiliateUrl('amazon', 'B0BHJJ9Y77', 'deals');
 */

import Constants from 'expo-constants';

const resolveAmazonTag = () => {
    const tag = Constants.expoConfig?.extra?.amazonAssociatesTag || '';
    const normalized = String(tag).trim();
    return normalized && normalized !== 'your-tag' ? normalized : null;
};

// ============================================================
// MERCHANT CONFIGURATION
// Affiliate tags stored HERE, not per product
// ============================================================

export const MERCHANT_CONFIG = {
    amazon: {
        name: 'Amazon',
        tag: resolveAmazonTag(),
        icon: '🛒',
        buttonText: 'View on Amazon',
        color: '#FF9900',
        // Template for generating affiliate URL
        template: 'https://www.amazon.com/dp/{sku}',
    },
    newegg: {
        name: 'Newegg',
        id: 'nexusbuild',
        icon: '🖥️',
        buttonText: 'View on Newegg',
        color: '#000000',
        template: 'https://www.newegg.com/p/{sku}',
    },
    bestbuy: {
        name: 'Best Buy',
        id: 'nexusbuild',
        icon: '🏪',
        buttonText: 'View on Best Buy',
        color: '#0046BE',
        template: 'https://www.bestbuy.com/site/{sku}.p',
    },
    microcenter: {
        name: 'Micro Center',
        id: 'nexusbuild',
        icon: '🔧',
        buttonText: 'View on Micro Center',
        color: '#E40046',
        template: 'https://www.microcenter.com/product/{sku}',
    },
    bhphoto: {
        name: 'B&H Photo',
        id: 'nexusbuild',
        icon: '📷',
        buttonText: 'View on B&H',
        color: '#00263E',
        template: 'https://www.bhphotovideo.com/c/product/{sku}',
    },
};

// Backend API base URL (for redirect layer)
const API_BASE = 'https://api.nexusbuild.app';

// Use direct links until the redirect backend is deployed.
const USE_DIRECT_LINKS = true;

// ============================================================
// AFFILIATE SERVICE
// Dynamic URL generation at click time
// ============================================================

export const affiliateService = {
    /**
     * Get affiliate URL for a merchant + SKU
     * Uses redirect layer in production, direct links before backend launch.
     * 
     * @param merchant - 'amazon', 'newegg', etc.
     * @param sku - Product SKU/ASIN
     * @param subid - Optional analytics subID
     */
    getAffiliateUrl(merchant, sku, subid = 'direct') {
        if (!merchant || !sku) return null;

        const config = MERCHANT_CONFIG[merchant.toLowerCase()];
        if (!config) {
            console.warn(`[AffiliateService] Unknown merchant: ${merchant}`);
            return null;
        }

        if (USE_DIRECT_LINKS) {
            if (merchant.toLowerCase() === 'amazon') {
                const url = new URL(config.template.replace('{sku}', sku));
                if (config.tag) {
                    url.searchParams.set('tag', config.tag);
                }
                return url.toString();
            }

            return config.template
                .replace('{sku}', sku)
                .replace('{tag}', config.tag || config.id || '');
        }

        // Production: Use backend redirect layer
        return `${API_BASE}/api/affiliate/out/${merchant}/${sku}?subid=${subid}`;
    },

    /**
     * Get affiliate URL from product data
     * Products use: { merchantSku: { amazon: 'ASIN', newegg: 'SKU' } }
     * 
     * @param product - Product with merchantSku field
     * @param preferredMerchant - Preferred merchant to use
     * @param subid - Analytics subID
     */
    getUrlFromProduct(product, preferredMerchant = 'amazon', subid = 'direct') {
        if (!product?.merchantSku) return null;

        const merchants = Object.keys(product.merchantSku);
        const merchant = merchants.includes(preferredMerchant)
            ? preferredMerchant
            : merchants[0];

        if (!merchant) return null;

        return this.getAffiliateUrl(merchant, product.merchantSku[merchant], subid);
    },

    /**
     * Get merchant display info for UI buttons
     */
    getMerchantInfo(merchant) {
        return MERCHANT_CONFIG[merchant?.toLowerCase()] || {
            name: merchant,
            buttonText: `View on ${merchant}`,
            color: '#666666',
            icon: '🔗',
        };
    },

    /**
     * Detect retailer from URL (for legacy data)
     */
    detectRetailer(url) {
        if (!url) return null;
        const urlLower = url.toLowerCase();

        if (urlLower.includes('amazon.') || urlLower.includes('amzn.to')) return 'amazon';
        if (urlLower.includes('newegg.')) return 'newegg';
        if (urlLower.includes('bestbuy.')) return 'bestbuy';
        if (urlLower.includes('bhphoto') || urlLower.includes('bhphotovideo')) return 'bhphoto';
        if (urlLower.includes('microcenter.')) return 'microcenter';

        return null;
    },

    /**
     * Wrap an existing URL with affiliate parameters (legacy support)
     */
    wrapAffiliateUrl(url, retailer) {
        if (!url) return url;
        const config = MERCHANT_CONFIG[retailer?.toLowerCase()];
        if (!config) return url;

        try {
            const urlObj = new URL(url);
            if (retailer === 'amazon' && config.tag) {
                urlObj.searchParams.set('tag', config.tag);
            }
            return urlObj.toString();
        } catch (e) {
            return url;
        }
    },
};

// ============================================================
// HELPER EXPORTS
// ============================================================

/**
 * Get affiliate URL (shorthand function)
 */
export function getAffiliateUrl(merchant, sku, subid) {
    return affiliateService.getAffiliateUrl(merchant, sku, subid);
}

/**
 * Universal affiliate disclosure (covers all programs)
 */
export const AFFILIATE_DISCLOSURE =
    'Some links on this site are affiliate links. If you make a purchase, we may earn a commission at no extra cost to you.';

// Legacy exports for backwards compatibility
export const wrapAffiliateUrl = affiliateService.wrapAffiliateUrl.bind(affiliateService);
export const detectRetailer = affiliateService.detectRetailer.bind(affiliateService);
export const wrapUrl = (url) => affiliateService.wrapAffiliateUrl(url, affiliateService.detectRetailer(url));

export default affiliateService;
