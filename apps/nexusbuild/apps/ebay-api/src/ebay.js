/**
 * eBay OAuth + Browse API Client
 * 
 * Handles OAuth 2.0 Application access token (client_credentials grant)
 * and Browse API calls. Token is cached in memory until expiry.
 */

// Environment configuration
const EBAY_ENV = process.env.EBAY_ENV || 'production';
const EBAY_CLIENT_ID = process.env.EBAY_CLIENT_ID;
const EBAY_CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET;
const EBAY_MARKETPLACE_ID = process.env.EBAY_MARKETPLACE_ID || 'EBAY_US';

// eBay endpoints based on environment
const ENDPOINTS = {
  production: {
    token: 'https://api.ebay.com/identity/v1/oauth2/token',
    browse: 'https://api.ebay.com/buy/browse/v1/item_summary/search'
  },
  sandbox: {
    token: 'https://api.sandbox.ebay.com/identity/v1/oauth2/token',
    browse: 'https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search'
  }
};

// Token cache
let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Get OAuth Application access token (client_credentials grant)
 * Caches token and refreshes 60 seconds before expiry
 */
async function getAccessToken() {
  // Return cached token if still valid (with 60s buffer)
  const now = Date.now();
  if (cachedToken && tokenExpiresAt - now > 60000) {
    return cachedToken;
  }

  if (!EBAY_CLIENT_ID || !EBAY_CLIENT_SECRET) {
    throw new Error('Missing EBAY_CLIENT_ID or EBAY_CLIENT_SECRET environment variables');
  }

  const endpoints = ENDPOINTS[EBAY_ENV] || ENDPOINTS.production;

  // Base64 encode credentials
  const credentials = Buffer.from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`).toString('base64');

  console.log(`[eBay] Requesting new access token from ${EBAY_ENV} environment...`);

  const response = await fetch(endpoints.token, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[eBay] Token request failed:', response.status, errorText);
    throw new Error(`eBay token request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Cache the token
  cachedToken = data.access_token;
  // expires_in is in seconds, convert to ms and subtract 60s buffer
  tokenExpiresAt = now + (data.expires_in * 1000);

  console.log(`[eBay] Access token obtained, expires in ${data.expires_in}s`);

  return cachedToken;
}

/**
 * Search eBay items using Browse API
 * @param {string} query - Search keywords
 * @param {number} limit - Max results (default 10, max 200)
 * @param {string} categoryIds - Optional category filter
 * @returns {Promise<Object>} eBay search results
 */
async function searchItems(query, limit = 10, categoryIds = null, options = {}) {
  const token = await getAccessToken();
  const endpoints = ENDPOINTS[EBAY_ENV] || ENDPOINTS.production;

  // Build search URL with query parameters
  const params = new URLSearchParams({
    q: query,
    limit: Math.min(limit, 200).toString()
  });

  // Add category filter if provided
  if (categoryIds) {
    params.append('category_ids', categoryIds);
  }

  // Add Price Filtering
  // Syntax: filter=price:[min..max],priceCurrency:USD
  const filters = [];
  if (options.minPrice || options.maxPrice) {
    // Determine bounds, default to * if missing
    const min = options.minPrice || '0';
    const max = options.maxPrice || '*';
    const currency = options.currency || 'USD';
    filters.push(`price:[${min}..${max}]`);
    filters.push(`priceCurrency:${currency}`);
  }

  // Items located in US only for faster shipping/relevance? (Optional)
  // filters.push('itemLocationCountry:US');

  if (filters.length > 0) {
    params.append('filter', filters.join(','));
  }

  const url = `${endpoints.browse}?${params.toString()}`;

  console.log(`[eBay] Searching: "${query}" (limit: ${limit}) params: ${params.toString()}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': EBAY_MARKETPLACE_ID,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[eBay] Search failed:', response.status, errorText);

    // If token expired, clear cache and retry once
    if (response.status === 401) {
      cachedToken = null;
      tokenExpiresAt = 0;
      return searchItems(query, limit, categoryIds);
    }

    const error = new Error(`eBay search failed: ${response.status}`);
    error.status = response.status;
    error.details = errorText;
    throw error;
  }

  const data = await response.json();

  console.log(`[eBay] Found ${data.total || 0} results for "${query}"`);

  return data;
}

/**
 * Get PC component category IDs for eBay
 * These help filter results to relevant categories
 */
const PC_CATEGORIES = {
  gpu: '27386',           // Graphics/Video Cards
  cpu: '164',             // CPUs/Processors
  motherboard: '1244',    // Motherboards
  ram: '170083',          // Computer Memory (RAM)
  storage: '56083',       // Solid State Drives
  psu: '42017',           // Power Supplies
  case: '42014',          // Computer Cases
  cooler: '131486',       // CPU Fans & Heatsinks
  monitor: '80053'        // Monitors
};

module.exports = {
  getAccessToken,
  searchItems,
  PC_CATEGORIES,
  EBAY_ENV,
  EBAY_MARKETPLACE_ID
};
