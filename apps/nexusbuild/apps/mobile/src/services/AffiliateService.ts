/**
 * Amazon Affiliate Service for NexusBuild
 * 
 * Generates Amazon affiliate links using dynamic search URLs.
 * This approach scales infinitely without manual link creation.
 * 
 * FTC Compliance: You MUST display affiliate disclosure near links.
 */

import Constants from 'expo-constants';
import { Linking } from 'react-native';

// ============================================================
// CONFIGURATION - Update with your actual Amazon Associates ID
// ============================================================
const resolveAmazonTag = () => {
    const tag = Constants.expoConfig?.extra?.amazonAssociatesTag || '';
    const normalized = String(tag).trim();
    return normalized && normalized !== 'your-tag' ? normalized : null;
};

const AFFILIATE_TAG = resolveAmazonTag();
const AMAZON_BASE_URL = 'https://www.amazon.com';

// ============================================================
// DYNAMIC SEARCH LINK GENERATOR
// ============================================================

/**
 * Generate an Amazon search link for a specific part.
 * This is the primary method - works for any product automatically.
 * 
 * @param partName - Full name of the part (e.g., "ASUS ROG Strix RTX 4070")
 * @param category - Optional category to improve search results
 * @returns Full Amazon affiliate search URL
 */
export const getAmazonSearchLink = (partName: string, category?: string): string => {
    // Build search query
    let query = partName;

    // Append category if provided (helps Amazon return relevant results)
    if (category) {
        const categoryKeywords: Record<string, string> = {
            'CPU': 'processor',
            'GPU': 'graphics card',
            'Motherboard': 'motherboard',
            'RAM': 'memory',
            'SSD': 'solid state drive',
            'HDD': 'hard drive',
            'PSU': 'power supply',
            'Case': 'PC case',
            'Cooler': 'CPU cooler',
            'Monitor': 'monitor',
            'Keyboard': 'keyboard',
            'Mouse': 'gaming mouse',
            'Headset': 'gaming headset',
        };

        const keyword = categoryKeywords[category];
        if (keyword && !query.toLowerCase().includes(keyword.toLowerCase())) {
            query += ` ${keyword}`;
        }
    }

    // URL encode the query
    const encodedQuery = encodeURIComponent(query);

    // Build final URL with affiliate tag
    const url = new URL('/s', AMAZON_BASE_URL);
    url.searchParams.set('k', query);
    if (AFFILIATE_TAG) {
        url.searchParams.set('tag', AFFILIATE_TAG);
    }
    return url.toString();
};

// ============================================================
// CATEGORY HUB LINKS (Static, for "Browse All" buttons)
// ============================================================

const CATEGORY_HUBS: Record<string, string> = {
    // These are pre-generated search links for browsing categories
    // TODO: Generate these via SiteStripe for better tracking
    'CPU': getAmazonSearchLink('gaming processor CPU'),
    'GPU': getAmazonSearchLink('graphics card RTX RX'),
    'Motherboard': getAmazonSearchLink('gaming motherboard'),
    'RAM': getAmazonSearchLink('DDR5 RAM gaming'),
    'SSD': getAmazonSearchLink('NVMe SSD gaming'),
    'PSU': getAmazonSearchLink('modular power supply'),
    'Case': getAmazonSearchLink('gaming PC case RGB'),
    'Cooler': getAmazonSearchLink('CPU cooler tower'),
    'Monitor': getAmazonSearchLink('gaming monitor 144hz'),
    'General': getAmazonSearchLink('PC gaming parts'),
};

/**
 * Get a category hub link for browsing all products in a category.
 * Use this for "Shop All GPUs" type buttons.
 * 
 * @param category - Category name (e.g., "GPU", "CPU")
 * @returns Amazon affiliate search URL for that category
 */
export const getCategoryHubLink = (category: string): string => {
    return CATEGORY_HUBS[category] || CATEGORY_HUBS['General'];
};

// ============================================================
// HELPER: OPEN AMAZON LINK
// ============================================================

/**
 * Opens an Amazon link in the user's default browser.
 * 
 * @param partName - Name of the part to search for
 * @param category - Optional category for better search results
 */
export const openAmazonLink = async (partName: string, category?: string): Promise<void> => {
    const url = getAmazonSearchLink(partName, category);

    try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            console.error('Cannot open Amazon URL:', url);
        }
    } catch (error) {
        console.error('Error opening Amazon link:', error);
    }
};

/**
 * Opens a category hub page on Amazon.
 * 
 * @param category - Category to browse
 */
export const openCategoryHub = async (category: string): Promise<void> => {
    const url = getCategoryHubLink(category);

    try {
        await Linking.openURL(url);
    } catch (error) {
        console.error('Error opening category hub:', error);
    }
};

// ============================================================
// DISCLOSURE TEXT (Required by FTC/Amazon)
// ============================================================

export const AFFILIATE_DISCLOSURE =
    "As an Amazon Associate, NexusBuild earns from qualifying purchases.";

export const AFFILIATE_DISCLOSURE_SHORT =
    "Affiliate link";
