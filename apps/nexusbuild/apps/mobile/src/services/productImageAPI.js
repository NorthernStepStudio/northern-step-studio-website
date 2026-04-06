/**
 * Product Image API Service
 * 
 * STUB SERVICE - Ready for future integration with product image APIs
 * 
 * Supported APIs (when implemented):
 * 1. Amazon Product Advertising API (FREE with affiliate account)
 * 2. Google Custom Search API ($5 per 1000 queries after free tier)
 * 3. Serpapi Google Images (Paid, ~$50/month)
 * 
 * Current Implementation: 
 * - Returns null for all queries (fallback to manual image_urls in parts data)
 * - Designed to be easily switched to real API when ready
 * 
 * Usage:
 * import { getProductImage, searchProductImages } from '../services/productImageAPI';
 * const imageUrl = await getProductImage('NVIDIA GeForce RTX 4090');
 */

// API Configuration - Fill in when ready to use
const API_CONFIG = {
    // Amazon Product Advertising API
    amazon: {
        enabled: false,
        accessKey: process.env.AMAZON_ACCESS_KEY || '',
        secretKey: process.env.AMAZON_SECRET_KEY || '',
        partnerTag:
            process.env.AMAZON_PARTNER_TAG ||
            process.env.EXPO_PUBLIC_AMAZON_ASSOCIATES_TAG ||
            '',
        region: 'us-east-1',
    },
    // Google Custom Search API
    google: {
        enabled: false,
        apiKey: process.env.GOOGLE_API_KEY || '',
        searchEngineId: process.env.GOOGLE_CX || '',
    },
    // SerpAPI (Alternative)
    serpapi: {
        enabled: false,
        apiKey: process.env.SERPAPI_KEY || '',
    },
};

/**
 * Get a product image URL by product name
 * @param {string} productName - The name of the product (e.g., "AMD Ryzen 9 7950X3D")
 * @returns {Promise<string|null>} - Image URL or null if not found
 */
export const getProductImage = async (productName) => {
    // Check if any API is enabled
    if (API_CONFIG.amazon.enabled) {
        return await searchAmazonImage(productName);
    }
    if (API_CONFIG.google.enabled) {
        return await searchGoogleImage(productName);
    }
    if (API_CONFIG.serpapi.enabled) {
        return await searchSerpApiImage(productName);
    }

    // No API enabled - return null (use fallback image_url from parts data)
    console.log('[ProductImageAPI] No API enabled, using fallback image_url');
    return null;
};

/**
 * Search for multiple product images at once
 * @param {string[]} productNames - Array of product names
 * @returns {Promise<Object>} - Map of product name to image URL
 */
export const searchProductImages = async (productNames) => {
    const results = {};
    for (const name of productNames) {
        results[name] = await getProductImage(name);
    }
    return results;
};

/**
 * Enrich parts data with images from API
 * @param {Object} parts - Parts object with categories
 * @returns {Promise<Object>} - Parts with image_url populated
 */
export const enrichPartsWithImages = async (parts) => {
    const enrichedParts = { ...parts };

    for (const [category, partsList] of Object.entries(parts)) {
        if (Array.isArray(partsList)) {
            enrichedParts[category] = await Promise.all(
                partsList.map(async (part) => {
                    if (!part.image_url) {
                        const imageUrl = await getProductImage(part.name);
                        return { ...part, image_url: imageUrl };
                    }
                    return part;
                })
            );
        }
    }

    return enrichedParts;
};

// ============ STUB API IMPLEMENTATIONS ============
// These will be implemented when API credentials are available

const searchAmazonImage = async (productName) => {
    // TODO: Implement Amazon Product Advertising API
    // Requires: AWS SDK, paapi5-nodejs-sdk
    // Docs: https://webservices.amazon.com/paapi5/documentation/
    console.log(`[Amazon API] Would search for: ${productName}`);
    return null;
};

const searchGoogleImage = async (productName) => {
    // TODO: Implement Google Custom Search API
    // Requires: googleapis package or fetch
    // Docs: https://developers.google.com/custom-search/v1/overview
    console.log(`[Google API] Would search for: ${productName}`);
    return null;
};

const searchSerpApiImage = async (productName) => {
    // TODO: Implement SerpAPI
    // Requires: serpapi package
    // Docs: https://serpapi.com/images-results
    console.log(`[SerpAPI] Would search for: ${productName}`);
    return null;
};

// ============ MANUAL IMAGE DATABASE ============
// Fallback images for popular products (used when no API is available)

export const FALLBACK_IMAGES = {
    // CPUs
    'AMD Ryzen 9 7950X3D': 'https://m.media-amazon.com/images/I/51K+a7l-A4L._AC_SL1200_.jpg',
    'Intel Core i9-13900K': 'https://m.media-amazon.com/images/I/51yLw7uB1QL._AC_SL1200_.jpg',
    'AMD Ryzen 7 7800X3D': 'https://m.media-amazon.com/images/I/51K+a7l-A4L._AC_SL1200_.jpg',
    'Intel Core i5-13600K': 'https://m.media-amazon.com/images/I/51yLw7uB1QL._AC_SL1200_.jpg',

    // GPUs
    'NVIDIA GeForce RTX 4090': 'https://m.media-amazon.com/images/I/61WhHLWDwSL._AC_SL1500_.jpg',
    'NVIDIA GeForce RTX 4080': 'https://m.media-amazon.com/images/I/61WhHLWDwSL._AC_SL1500_.jpg',
    'AMD Radeon RX 7900 XTX': 'https://m.media-amazon.com/images/I/51v8r5bqJTL._AC_SL1000_.jpg',
    'NVIDIA GeForce RTX 4070 Ti': 'https://m.media-amazon.com/images/I/61WhHLWDwSL._AC_SL1500_.jpg',

    // Cases (generic PC case image)
    'generic_case': 'https://m.media-amazon.com/images/I/81vLiWH4UBL._AC_SL1500_.jpg',
};

/**
 * Get image from fallback database
 * @param {string} productName - Product name to look up
 * @returns {string|null} - Image URL or null
 */
export const getFallbackImage = (productName) => {
    return FALLBACK_IMAGES[productName] || null;
};

export default {
    getProductImage,
    searchProductImages,
    enrichPartsWithImages,
    getFallbackImage,
    FALLBACK_IMAGES,
    API_CONFIG,
};
