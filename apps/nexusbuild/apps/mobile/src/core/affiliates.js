/**
 * 🔗 AFFILIATE CONFIGURATION
 * 
 * This file centralizes all affiliate tracking links and IDs.
 * Update the IDs below once you receive them from affiliate programs.
 * 
 * TO COMPLETE:
 * 1. Apply to affiliate programs (see task.md)
 * 2. Get your tracking IDs
 * 3. Replace PLACEHOLDER values below
 */

import Constants from 'expo-constants';

const resolveAmazonTag = () => {
    const tag = Constants.expoConfig?.extra?.amazonAssociatesTag || '';
    const normalized = String(tag).trim();
    return normalized && normalized !== 'your-tag' ? normalized : 'YOUR_AMAZON_ASSOCIATE_ID';
};

// ============================================
// AFFILIATE IDS (Replace with your real IDs)
// ============================================
export const AFFILIATE_IDS = {
    amazon: resolveAmazonTag(),
    newegg: 'YOUR_NEWEGG_AFFILIATE_ID',      // e.g., 'abc123'
    bhphoto: 'YOUR_BH_AFFILIATE_ID',         // e.g., 'xyz789'
    bestbuy: 'YOUR_BESTBUY_PARTNER_ID',      // e.g., 'partner123'
};

// ============================================
// AFFILIATE URL BUILDERS
// ============================================

/**
 * Build Amazon affiliate URL
 * @param {string} productUrl - The Amazon product URL
 * @returns {string} URL with affiliate tag
 */
export const buildAmazonLink = (productUrl) => {
    if (AFFILIATE_IDS.amazon === 'YOUR_AMAZON_ASSOCIATE_ID') {
        // Return original URL if no affiliate ID set
        return productUrl;
    }

    // Add affiliate tag to URL
    const url = new URL(productUrl);
    url.searchParams.set('tag', AFFILIATE_IDS.amazon);
    return url.toString();
};

/**
 * Build Newegg affiliate URL
 * @param {string} productUrl - The Newegg product URL
 * @returns {string} URL with affiliate tracking
 */
export const buildNeweggLink = (productUrl) => {
    if (AFFILIATE_IDS.newegg === 'YOUR_NEWEGG_AFFILIATE_ID') {
        return productUrl;
    }
    // Newegg uses a different format - update based on their requirements
    return `https://www.newegg.com/redirect?url=${encodeURIComponent(productUrl)}&id=${AFFILIATE_IDS.newegg}`;
};

/**
 * Build B&H Photo affiliate URL
 * @param {string} productUrl - The B&H product URL
 * @returns {string} URL with affiliate tracking
 */
export const buildBHLink = (productUrl) => {
    if (AFFILIATE_IDS.bhphoto === 'YOUR_BH_AFFILIATE_ID') {
        return productUrl;
    }
    // B&H format - update based on their requirements
    return `${productUrl}?BI=${AFFILIATE_IDS.bhphoto}`;
};

/**
 * Detect retailer and build appropriate affiliate link
 * @param {string} url - Any product URL
 * @returns {string} URL with affiliate tracking if applicable
 */
export const buildAffiliateLink = (url) => {
    if (!url) return url;

    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes('amazon.com')) {
        return buildAmazonLink(url);
    }
    if (lowerUrl.includes('newegg.com')) {
        return buildNeweggLink(url);
    }
    if (lowerUrl.includes('bhphotovideo.com')) {
        return buildBHLink(url);
    }

    // Return original URL if no matching affiliate program
    return url;
};

// ============================================
// RETAILER CONFIG
// ============================================
export const RETAILERS = [
    {
        id: 'amazon',
        name: 'Amazon',
        icon: 'logo-amazon',
        baseUrl: 'https://www.amazon.com',
        enabled: true,
    },
    {
        id: 'newegg',
        name: 'Newegg',
        icon: 'cart-outline',
        baseUrl: 'https://www.newegg.com',
        enabled: true,
    },
    {
        id: 'bhphoto',
        name: 'B&H Photo',
        icon: 'camera-outline',
        baseUrl: 'https://www.bhphotovideo.com',
        enabled: true,
    },
    {
        id: 'bestbuy',
        name: 'Best Buy',
        icon: 'storefront-outline',
        baseUrl: 'https://www.bestbuy.com',
        enabled: false, // Enable once affiliate approved
    },
];

export default {
    AFFILIATE_IDS,
    buildAffiliateLink,
    buildAmazonLink,
    buildNeweggLink,
    buildBHLink,
    RETAILERS,
};
