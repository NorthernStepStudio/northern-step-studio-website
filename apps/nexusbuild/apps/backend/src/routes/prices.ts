/**
 * PCPartPicker Pricing API Routes
 * 
 * Endpoints for fetching real-time PC component pricing from PCPartPicker
 * using the Apify scraper integration.
 */

import { Router, Request, Response } from 'express';
import {
    buildSearchPhrases,
    searchPCParts,
    getProductPrice,
    getBatchPrices,
    getTrendingProducts,
    checkApifyConnection,
    isApifyConfigured,
    normalizeCategory,
    PCPP_CATEGORIES,
    rankProducts,
    PCPartPickerCategory,
} from '../services/apifyService';
import {
    getFallbackBatchPrices,
    getFallbackCatalogStatus,
    getFallbackProductPrice,
    getFallbackTrendingProducts,
    searchFallbackProducts,
} from '../services/fallbackCatalog';

const router = Router();
const VALID_CATEGORIES = new Set<PCPartPickerCategory>(Object.values(PCPP_CATEGORIES));

const isPCPartPickerCategory = (value: string): value is PCPartPickerCategory =>
    VALID_CATEGORIES.has(value as PCPartPickerCategory);

const parseLimit = (value: unknown, fallback: number, max: number): number => {
    const parsed = Number.parseInt(String(value ?? fallback), 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
        return fallback;
    }
    return Math.min(parsed, max);
};

/**
 * GET /api/prices/health
 * Check if Apify connection is working
 */
router.get('/health', async (req: Request, res: Response) => {
    try {
        if (!isApifyConfigured()) {
            return res.json({
                ...getFallbackCatalogStatus(),
                apifyConnected: false,
            });
        }

        const isConnected = await checkApifyConnection();
        res.json({
            status: isConnected ? 'ok' : 'degraded',
            apifyConnected: isConnected,
            dataSource: isConnected ? 'apify' : 'fallback',
            message: isConnected
                ? 'Apify connection active'
                : 'Apify connection failed. Serving the curated fallback catalog.',
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            apifyConnected: false,
            message: 'Failed to check Apify connection',
        });
    }
});

/**
 * GET /api/prices/categories
 * Get list of available PCPartPicker categories
 */
router.get('/categories', (req: Request, res: Response) => {
    res.json({
        categories: PCPP_CATEGORIES,
    });
});

/**
 * GET /api/prices/search
 * Search for PC parts by name
 * 
 * Query params:
 * - q: Search query (required)
 * - category: Category filter (optional)
 * - limit: Max results (default: 10)
 */
router.get('/search', async (req: Request, res: Response) => {
    try {
        const { q, category, limit = '10' } = req.query;

        if (!q || typeof q !== 'string') {
            return res.status(400).json({
                error: 'Missing required query parameter: q',
            });
        }

        const normalizedCategory = typeof category === 'string' ? normalizeCategory(category) : undefined;
        const maxProducts = parseLimit(limit, 10, 30);
        const useFallback = !isApifyConfigured();
        const results = useFallback
            ? searchFallbackProducts({
                query: q,
                category: normalizedCategory,
                limit: maxProducts,
            })
            : await searchPCParts({
                searchPhrases: [q],
                category: normalizedCategory,
                maxProducts,
                countryCode: 'us',
            });
        const rankedResults = useFallback ? results : rankProducts(q, results, normalizedCategory);

        res.json({
            query: q,
            searchPhrases: buildSearchPhrases(q),
            category: normalizedCategory || 'all',
            count: rankedResults.length,
            dataSource: useFallback ? 'fallback' : 'apify',
            products: rankedResults,
        });
    } catch (error) {
        console.error('[API] Price search error:', error);
        res.status(500).json({
            error: 'Failed to search for products',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * GET /api/prices/product
 * Get price for a specific product
 * 
 * Query params:
 * - name: Product name (required)
 * - category: Category hint (optional)
 */
router.get('/product', async (req: Request, res: Response) => {
    try {
        const { name, category } = req.query;

        if (!name || typeof name !== 'string') {
            return res.status(400).json({
                error: 'Missing required query parameter: name',
            });
        }

        const useFallback = !isApifyConfigured();
        const product = useFallback
            ? getFallbackProductPrice(name, category as string)
            : await getProductPrice(name, category as string);

        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
                query: name,
            });
        }

        res.json({
            dataSource: useFallback ? 'fallback' : 'apify',
            product,
        });
    } catch (error) {
        console.error('[API] Product price error:', error);
        res.status(500).json({
            error: 'Failed to get product price',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * POST /api/prices/batch
 * Get prices for multiple products
 * 
 * Body:
 * - products: Array of { name: string, category?: string }
 */
router.post('/batch', async (req: Request, res: Response) => {
    try {
        const { products } = req.body;

        if (!products || !Array.isArray(products)) {
            return res.status(400).json({
                error: 'Missing required body field: products (array)',
            });
        }

        if (products.length > 20) {
            return res.status(400).json({
                error: 'Too many products. Maximum 20 per batch.',
            });
        }

        const normalizedProducts = products.map((product) => ({
            name: product?.name,
            category:
                typeof product?.category === 'string'
                    ? normalizeCategory(product.category)
                    : undefined,
        }));

        const hasInvalidProduct = normalizedProducts.some(
            (product) => typeof product.name !== 'string' || !product.name.trim()
        );
        if (hasInvalidProduct) {
            return res.status(400).json({
                error: 'Each product must include a non-empty name.',
            });
        }

        const useFallback = !isApifyConfigured();
        const results = useFallback
            ? getFallbackBatchPrices(normalizedProducts)
            : await getBatchPrices(normalizedProducts);

        // Convert Map to object
        const priceMap: Record<string, any> = {};
        results.forEach((value, key) => {
            priceMap[key] = value;
        });

        res.json({
            count: products.length,
            dataSource: useFallback ? 'fallback' : 'apify',
            prices: priceMap,
        });
    } catch (error) {
        console.error('[API] Batch price error:', error);
        res.status(500).json({
            error: 'Failed to get batch prices',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * GET /api/prices/trending/:category
 * Get trending/popular products in a category
 */
router.get('/trending/:category', async (req: Request, res: Response) => {
    try {
        const { category } = req.params;
        const { limit = '10' } = req.query;
        const normalizedCategory = normalizeCategory(category);

        if (!normalizedCategory || !isPCPartPickerCategory(normalizedCategory)) {
            return res.status(400).json({
                error: 'Invalid category',
                validCategories: Array.from(VALID_CATEGORIES),
            });
        }

        const useFallback = !isApifyConfigured();
        const products = useFallback
            ? getFallbackTrendingProducts(normalizedCategory, parseLimit(limit, 10, 30))
            : await getTrendingProducts(
                normalizedCategory,
                parseLimit(limit, 10, 30)
            );

        res.json({
            category: normalizedCategory,
            count: products.length,
            dataSource: useFallback ? 'fallback' : 'apify',
            products,
        });
    } catch (error) {
        console.error('[API] Trending products error:', error);
        res.status(500).json({
            error: 'Failed to get trending products',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router;
