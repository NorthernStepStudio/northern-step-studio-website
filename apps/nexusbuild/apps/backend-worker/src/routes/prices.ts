import { Hono } from 'hono';
import {
  PCPP_CATEGORIES,
  checkApifyConnection,
  isApifyConfigured,
  normalizeCategory,
  searchPCParts,
  getProductPrice,
  getBatchPrices,
  getTrendingProducts,
} from '../services/apifyService';
import {
  getFallbackBatchPrices,
  getFallbackCatalogStatus,
  getFallbackProductPrice,
  getFallbackTrendingProducts,
  searchFallbackProducts,
} from '../services/fallbackCatalog';

type Bindings = {
  APIFY_API_TOKEN: string;
};

const prices = new Hono<{ Bindings: Bindings }>();
const VALID_CATEGORIES = new Set(Object.values(PCPP_CATEGORIES));

const parseLimit = (value: unknown, fallback: number, max: number): number => {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.min(parsed, max);
};

const isPCPartPickerCategory = (value: string): value is string =>
  VALID_CATEGORIES.has(value as any);

prices.get('/health', async (c) => {
  try {
    const token = c.env.APIFY_API_TOKEN;
    if (!isApifyConfigured(token)) {
      return c.json({
        ...getFallbackCatalogStatus(),
        apifyConnected: false,
      });
    }

    const isConnected = await checkApifyConnection(token);
    return c.json({
      status: isConnected ? 'ok' : 'degraded',
      apifyConnected: isConnected,
      dataSource: isConnected ? 'apify' : 'fallback',
      message: isConnected
        ? 'Apify connection active'
        : 'Apify connection failed. Serving the curated fallback catalog.',
    });
  } catch (error) {
    return c.json(
      {
        status: 'error',
        apifyConnected: false,
        message: 'Failed to check Apify connection',
      },
      500
    );
  }
});

prices.get('/categories', (c) => {
  return c.json({
    categories: PCPP_CATEGORIES,
  });
});

prices.get('/search', async (c) => {
  try {
    const query = c.req.query('q');
    const category = c.req.query('category');
    const limit = parseLimit(c.req.query('limit'), 10, 30);

    if (!query) {
      return c.json({ error: 'Missing required query parameter: q' }, 400);
    }

    const normalizedCategory =
      typeof category === 'string' ? normalizeCategory(category) : undefined;

    const token = c.env.APIFY_API_TOKEN;
    if (isApifyConfigured(token)) {
      try {
        const apifyProducts = await searchPCParts(
          { searchPhrases: [query], category: normalizedCategory, maxProducts: limit, countryCode: 'us' },
          token
        );
        if (apifyProducts && apifyProducts.length > 0) {
          return c.json({
            query,
            category: normalizedCategory || 'all',
            count: apifyProducts.length,
            dataSource: 'apify',
            products: apifyProducts,
          });
        }
      } catch (err) {
        console.warn('Apify Search Failed, dropping to fallback', err);
      }
    }

    // Fallback Catalog
    const products = searchFallbackProducts({
      query,
      category: normalizedCategory,
      limit,
    });

    return c.json({
      query,
      category: normalizedCategory || 'all',
      count: products.length,
      dataSource: 'fallback',
      products,
    });
  } catch (error) {
    return c.json(
      {
        error: 'Failed to search for products',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

prices.get('/product', async (c) => {
  try {
    const name = c.req.query('name');
    const category = c.req.query('category');

    if (!name) {
      return c.json({ error: 'Missing required query parameter: name' }, 400);
    }

    const token = c.env.APIFY_API_TOKEN;
    if (isApifyConfigured(token)) {
      try {
        const apifyProduct = await getProductPrice(name, category || undefined, token);
        if (apifyProduct) {
          return c.json({
            dataSource: 'apify',
            product: apifyProduct,
          });
        }
      } catch (err) {
        console.warn('Apify Product Lookup Failed, dropping to fallback', err);
      }
    }

    const product = getFallbackProductPrice(name, category);
    if (!product) {
      return c.json({ error: 'Product not found', query: name }, 404);
    }

    return c.json({
      dataSource: 'fallback',
      product,
    });
  } catch (error) {
    return c.json(
      {
        error: 'Failed to get product price',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

prices.post('/batch', async (c) => {
  try {
    const { products } = await c.req.json();
    if (!products || !Array.isArray(products)) {
      return c.json(
        { error: 'Missing required body field: products (array)' },
        400
      );
    }

    if (products.length > 20) {
      return c.json({ error: 'Too many products. Maximum 20 per batch.' }, 400);
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
      return c.json(
        { error: 'Each product must include a non-empty name.' },
        400
      );
    }

    const priceMap: Record<string, unknown> = {};
    const token = c.env.APIFY_API_TOKEN;

    if (isApifyConfigured(token)) {
      try {
        const apifyResults = await getBatchPrices(normalizedProducts, token);
        apifyResults.forEach((value, key) => {
          if (value) priceMap[key] = value;
        });

        // Fill exactly what's missing using fallback
        const results = getFallbackBatchPrices(normalizedProducts);
        results.forEach((value, key) => {
          if (!priceMap[key]) priceMap[key] = value;
        });

        return c.json({
          count: products.length,
          dataSource: 'apify',
          prices: priceMap,
        });
      } catch (err) {
        console.warn('Apify Batch Prices Failed, dropping to complete fallback', err);
      }
    }

    const results = getFallbackBatchPrices(normalizedProducts);
    results.forEach((value, key) => {
      priceMap[key] = value;
    });

    return c.json({
      count: products.length,
      dataSource: 'fallback',
      prices: priceMap,
    });
  } catch (error) {
    return c.json(
      {
        error: 'Failed to get batch prices',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

prices.get('/trending/:category', async (c) => {
  try {
    const category = c.req.param('category');
    const limit = parseLimit(c.req.query('limit'), 10, 30);
    const normalizedCategory = normalizeCategory(category);

    if (!normalizedCategory || !isPCPartPickerCategory(normalizedCategory)) {
      return c.json(
        {
          error: 'Invalid category',
          validCategories: Array.from(VALID_CATEGORIES),
        },
        400
      );
    }

    const token = c.env.APIFY_API_TOKEN;
    if (isApifyConfigured(token)) {
      try {
        const apifyTrending = await getTrendingProducts(normalizedCategory, token, limit);
        if (apifyTrending && apifyTrending.length > 0) {
          return c.json({
            category: normalizedCategory,
            count: apifyTrending.length,
            dataSource: 'apify',
            products: apifyTrending,
          });
        }
      } catch (err) {
        console.warn('Apify Trending Failed, dropping to fallback', err);
      }
    }

    const products = getFallbackTrendingProducts(normalizedCategory, limit);
    return c.json({
      category: normalizedCategory,
      count: products.length,
      dataSource: 'fallback',
      products,
    });
  } catch (error) {
    return c.json(
      {
        error: 'Failed to get trending products',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default prices;
