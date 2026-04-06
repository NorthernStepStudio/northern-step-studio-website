/**
 * eBay API Client for NexusBuild Mobile App
 * 
 * Calls our secure backend server which proxies eBay Browse API.
 * Never contains eBay credentials - all auth is server-side.
 */

// Backend URL - Railway deployment
const EBAY_BACKEND_URL = process.env.EXPO_PUBLIC_EBAY_API_URL || 'https://ebay-api-production.up.railway.app';

/**
 * Search eBay items
 * @param {string} query - Search keywords
 * @param {Object} options - Search options
 * @param {number} options.limit - Max results (default 10)
 * @param {string} options.category - PC component category (gpu, cpu, motherboard, etc.)
 * @returns {Promise<Object>} Search results with items array
 */
export async function searchEbay(query, options = {}) {
    const { limit = 10, category = null } = options;

    const params = new URLSearchParams({
        q: query,
        limit: limit.toString()
    });

    if (category) {
        params.append('category', category);
    }

    if (options.minPrice) {
        params.append('min_price', options.minPrice.toString());
    }

    if (options.maxPrice) {
        params.append('max_price', options.maxPrice.toString());
    }

    const url = `${EBAY_BACKEND_URL}/api/ebay/search?${params.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.message || error.error || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[eBay Client] Search error:', error.message);
        throw error;
    }
}

/**
 * Get available PC component categories
 * @returns {Promise<Object>} Category mappings
 */
export async function getCategories() {
    const url = `${EBAY_BACKEND_URL}/api/ebay/categories`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('[eBay Client] Categories error:', error.message);
        throw error;
    }
}

/**
 * Check if eBay backend is available
 * @returns {Promise<boolean>}
 */
export async function checkHealth() {
    try {
        const response = await fetch(`${EBAY_BACKEND_URL}/health`);
        const data = await response.json();
        return data.ok === true;
    } catch {
        return false;
    }
}

/**
 * PC component categories available for filtering
 */
export const PC_CATEGORIES = [
    { key: 'gpu', label: 'Graphics Cards' },
    { key: 'cpu', label: 'CPUs' },
    { key: 'motherboard', label: 'Motherboards' },
    { key: 'ram', label: 'Memory (RAM)' },
    { key: 'storage', label: 'Storage (SSD/HDD)' },
    { key: 'psu', label: 'Power Supplies' },
    { key: 'case', label: 'Cases' },
    { key: 'cooler', label: 'CPU Coolers' },
    { key: 'monitor', label: 'Monitors' }
];

export default {
    searchEbay,
    getCategories,
    checkHealth,
    PC_CATEGORIES
};
