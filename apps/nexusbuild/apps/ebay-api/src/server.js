/**
 * NexusBuild eBay API Server
 * 
 * Secure proxy for eBay Browse API calls.
 * Keeps eBay credentials server-side, exposes safe endpoints for mobile app.
 */

const express = require('express');
const cors = require('cors');
const ebay = require('./ebay');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// =============================================================================
// ENDPOINTS
// =============================================================================

/**
 * Health check endpoint
 * GET /health
 */
app.get('/health', (req, res) => {
    res.json({
        ok: true,
        env: ebay.EBAY_ENV,
        marketplace: ebay.EBAY_MARKETPLACE_ID,
        timestamp: new Date().toISOString()
    });
});

/**
 * Health check endpoint (Standard)
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        env: ebay.EBAY_ENV,
        marketplace: ebay.EBAY_MARKETPLACE_ID,
        timestamp: new Date().toISOString()
    });
});

/**
 * Search eBay items
 * GET /api/ebay/search?q=<query>&limit=<number>&category=<category>
 * 
 * Query params:
 * - q: Search keywords (required)
 * - limit: Max results 1-200 (default 10)
 * - category: PC component category (optional): gpu, cpu, motherboard, ram, storage, psu, case, cooler, monitor
 */
app.get('/api/ebay/search', async (req, res) => {
    try {
        const { q, limit = 10, category, min_price, max_price } = req.query;

        if (!q) {
            return res.status(400).json({
                error: 'Missing required query parameter: q',
                example: '/api/ebay/search?q=RTX+4090&limit=10'
            });
        }

        // Get category ID if provided
        const categoryIds = category ? ebay.PC_CATEGORIES[category.toLowerCase()] : null;

        const results = await ebay.searchItems(q, parseInt(limit), categoryIds, {
            minPrice: min_price,
            maxPrice: max_price
        });

        // Transform results for mobile app consumption
        const items = (results.itemSummaries || []).map(item => ({
            itemId: item.itemId,
            title: item.title,
            price: item.price ? {
                value: item.price.value,
                currency: item.price.currency
            } : null,
            image: item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || null,
            condition: item.condition,
            itemWebUrl: item.itemWebUrl,
            seller: item.seller ? {
                username: item.seller.username,
                feedbackPercentage: item.seller.feedbackPercentage,
                feedbackScore: item.seller.feedbackScore
            } : null,
            shippingOptions: item.shippingOptions?.[0] ? {
                cost: item.shippingOptions[0].shippingCost?.value || '0.00',
                type: item.shippingOptions[0].shippingCostType
            } : null,
            buyingOptions: item.buyingOptions,
            itemLocation: item.itemLocation?.country
        }));

        res.json({
            total: results.total || 0,
            count: items.length,
            query: q,
            category: category || null,
            items
        });

    } catch (error) {
        console.error('[Server] Search error:', error.message);

        const status = error.status || 502;
        res.status(status).json({
            error: 'eBay search failed',
            message: error.message,
            details: error.details || null
        });
    }
});

/**
 * Get category mappings
 * GET /api/ebay/categories
 */
app.get('/api/ebay/categories', (req, res) => {
    res.json({
        categories: Object.keys(ebay.PC_CATEGORIES),
        mappings: ebay.PC_CATEGORIES
    });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.path,
        availableEndpoints: [
            'GET /health',
            'GET /api/ebay/search?q=<query>&limit=<number>&category=<category>',
            'GET /api/ebay/categories'
        ]
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('[Server] Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`NexusBuild eBay API Server`);
    console.log('='.repeat(50));
    console.log(`Environment: ${ebay.EBAY_ENV}`);
    console.log(`Marketplace: ${ebay.EBAY_MARKETPLACE_ID}`);
    console.log(`Port: ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log(`Search: http://localhost:${PORT}/api/ebay/search?q=RTX+4090`);
    console.log('='.repeat(50));
});

module.exports = app;
