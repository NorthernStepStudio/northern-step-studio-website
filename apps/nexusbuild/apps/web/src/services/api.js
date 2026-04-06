import axios from 'axios';
import { getApiBaseUrl } from '@shared/api/getApiBaseUrl';
import appsCatalogData from '@shared/constants/appsCatalog.json';

const API_BASE_URL = getApiBaseUrl({
    platform: 'web',
    isDev: import.meta.env.DEV,
    envApiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    productionUrl: 'https://api.nexusbuild.app/api',
});

export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');
const { appCatalogBySlug } = appsCatalogData;
const getAppBySlug = (slug) => appCatalogBySlug?.[String(slug ?? '').trim().toLowerCase()] || null;

const PRICE_CATEGORY_MAP = {
    cpu: 'cpu',
    gpu: 'gpu',
    motherboard: 'motherboard',
    ram: 'ram',
    storage: 'storage',
    psu: 'psu',
    case: 'case',
    cooler: 'cooler',
    fan: 'case',
    monitor: 'monitor',
    keyboard: 'keyboard',
    mouse: 'mouse',
    headset: 'headphones',
    accessory: 'storage',
    os: 'storage',
};

const APP_CATEGORY_ALIASES = {
    cpu: 'cpu',
    processor: 'cpu',
    gpu: 'gpu',
    'graphics-card': 'gpu',
    'graphics card': 'gpu',
    'video-card': 'gpu',
    'video card': 'gpu',
    motherboard: 'motherboard',
    mobo: 'motherboard',
    ram: 'ram',
    memory: 'ram',
    storage: 'storage',
    'internal-hard-drive': 'storage',
    ssd: 'storage',
    hdd: 'storage',
    nvme: 'storage',
    psu: 'psu',
    'power-supply': 'psu',
    'power supply': 'psu',
    case: 'case',
    cooler: 'cooler',
    'cpu-cooler': 'cooler',
    'cpu cooler': 'cooler',
    fan: 'fan',
    monitor: 'monitor',
    keyboard: 'keyboard',
    mouse: 'mouse',
    headphones: 'headset',
    headset: 'headset',
    os: 'os',
    accessory: 'accessory',
};

const normalizeAppCategory = (value) => {
    if (!value) return 'part';
    const normalized = String(value).toLowerCase().replace(/[_-]+/g, ' ').trim();
    return APP_CATEGORY_ALIASES[normalized] || normalized.replace(/\s+/g, '-');
};

const normalizePriceValue = (value) => {
    const parsed = Number.parseFloat(String(value ?? '').replace(/[^0-9.]+/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
};

const normalizePriceProduct = (product, fallbackCategory) => {
    const offers = Array.isArray(product?.price?.offers) ? product.price.offers : [];
    const lowestPrice = normalizePriceValue(product?.price?.lowestPrice);
    const highestOffer = offers.reduce((max, offer) => {
        const price = normalizePriceValue(offer?.price);
        return price > max ? price : max;
    }, 0);
    const originalPrice = highestOffer > lowestPrice ? highestOffer : null;
    const discount = originalPrice && originalPrice > 0
        ? Math.round(((originalPrice - lowestPrice) / originalPrice) * 100)
        : null;

    return {
        id: product?.id || product?.url || `${product?.name}-${fallbackCategory || 'part'}`,
        name: product?.name || 'Unknown Part',
        category: normalizeAppCategory(product?.category || fallbackCategory),
        manufacturer: product?.price?.merchant || product?.manufacturer || 'PCPartPicker',
        price: lowestPrice,
        originalPrice,
        salePrice: lowestPrice,
        discount,
        image_url: product?.imageUrl || product?.image_url || product?.image || null,
        url: product?.price?.buyLink || product?.url || null,
        specs: product?.specs || product?.specifications || {},
        availability: product?.price?.availability || 'Unknown',
    };
};

const normalizePart = (part) => ({
    id: part?.id,
    name: part?.name || 'Unknown Part',
    category: normalizeAppCategory(part?.category),
    manufacturer: part?.manufacturer || part?.merchant || 'NexusBuild',
    price: normalizePriceValue(part?.price ?? part?.salePrice),
    originalPrice: part?.originalPrice ?? null,
    salePrice: normalizePriceValue(part?.salePrice ?? part?.price),
    discount: part?.discount ?? null,
    image_url: part?.image_url || part?.imageUrl || part?.image || null,
    url: part?.url || null,
    specs: part?.specs || part?.specifications || {},
});

const normalizePartsMap = (parts) => {
    if (!parts) return {};
    if (!Array.isArray(parts)) {
        return Object.entries(parts).reduce((acc, [key, value]) => {
            if (!value) return acc;
            const part = normalizePart({ ...value, category: value.category || key });
            acc[normalizeAppCategory(part.category)] = part;
            return acc;
        }, {});
    }

    return parts.reduce((acc, part) => {
        const normalized = normalizePart(part);
        acc[normalized.category] = normalized;
        return acc;
    }, {});
};

const normalizeBuild = (build) => {
    if (!build) return null;
    const parts = normalizePartsMap(build.parts || build.parts_list);
    return {
        id: build.id,
        name: build.name || 'Untitled Build',
        description: build.description || '',
        total_price: normalizePriceValue(build.total_price ?? build.totalPrice),
        totalPrice: normalizePriceValue(build.total_price ?? build.totalPrice),
        image_url: build.image_url || build.imageUrl || null,
        is_public: build.is_public ?? build.isPublic ?? true,
        is_featured: build.is_featured ?? build.isFeatured ?? false,
        likes: build.likes ?? build.likes_count ?? 0,
        likes_count: build.likes ?? build.likes_count ?? 0,
        created_at: build.created_at || build.createdAt || null,
        updated_at: build.updated_at || build.updatedAt || null,
        username: build.username || build.user?.username || null,
        user: build.user || null,
        parts,
        parts_list: Object.values(parts),
    };
};

const normalizeBuildList = (payload) => {
    const builds = Array.isArray(payload) ? payload : payload?.builds || [];
    return builds.map(normalizeBuild).filter(Boolean);
};

const normalizeUser = (user) => {
    if (!user) return null;
    return {
        ...user,
        displayName: user.displayName || user.username,
        avatar: user.avatar || user.profile_image || null,
        profile: user.profile || {
            bio: user.bio || '',
            frameId: user.avatar_frame || 'basic',
        },
    };
};

const normalizeTesterApp = (app) => {
    if (!app) return null;

    return {
        slug: app.slug,
        name: app.name || 'Unknown App',
        tagline: app.tagline || '',
        status: app.status || '',
        accent: app.accent || '',
    };
};

const normalizeTester = (tester) => {
    if (!tester) return null;

    const appSlug = tester.appSlug ?? tester.app_slug ?? null;
    const app = tester.app || getAppBySlug(appSlug);

    return {
        ...tester,
        appSlug,
        appLabel: tester.appLabel ?? tester.app_label ?? app?.name ?? 'All apps',
        app: normalizeTesterApp(app),
        reason: tester.reason || '',
        status: tester.status || 'pending',
        adminNotes: tester.adminNotes ?? tester.admin_notes ?? '',
        createdAt: tester.createdAt ?? tester.created_at ?? null,
        updatedAt: tester.updatedAt ?? tester.updated_at ?? null,
    };
};

const normalizeTesterList = (payload) => {
    const testers = Array.isArray(payload) ? payload : payload?.testers || [];
    return testers.map(normalizeTester).filter(Boolean);
};

const normalizeTesterStats = (payload = {}) => ({
    total: payload.total ?? 0,
    pending: payload.pending ?? 0,
    approved: payload.approved ?? 0,
    denied: payload.denied ?? 0,
    byApp: Array.isArray(payload.byApp)
        ? payload.byApp.map((bucket) => ({
              appSlug: bucket.appSlug ?? bucket.app_slug ?? null,
              appLabel: bucket.appLabel ?? bucket.app_label ?? 'All apps',
              total: bucket.total ?? 0,
              pending: bucket.pending ?? 0,
              approved: bucket.approved ?? 0,
              denied: bucket.denied ?? 0,
          }))
        : Array.isArray(payload.by_app)
            ? payload.by_app.map((bucket) => ({
                  appSlug: bucket.appSlug ?? bucket.app_slug ?? null,
                  appLabel: bucket.appLabel ?? bucket.app_label ?? 'All apps',
                  total: bucket.total ?? 0,
                  pending: bucket.pending ?? 0,
                  approved: bucket.approved ?? 0,
                  denied: bucket.denied ?? 0,
              }))
            : [],
});
const computeBudgetAllocation = (budget, useCase = 'gaming') => {
    const allocationsByUseCase = {
        gaming: { gpu: 0.45, cpu: 0.22, ram: 0.08, storage: 0.1, motherboard: 0.1, psu: 0.03, case: 0.02 },
        workstation: { cpu: 0.35, gpu: 0.25, ram: 0.15, storage: 0.12, motherboard: 0.08, psu: 0.03, case: 0.02 },
        streaming: { gpu: 0.35, cpu: 0.28, ram: 0.12, storage: 0.1, motherboard: 0.1, psu: 0.03, case: 0.02 },
        creator: { gpu: 0.34, cpu: 0.28, ram: 0.12, storage: 0.12, motherboard: 0.09, psu: 0.03, case: 0.02 },
    };

    const template = allocationsByUseCase[useCase] || allocationsByUseCase.gaming;
    return Object.entries(template).map(([component, ratio]) => ({
        component,
        percent_range: {
            min: Math.round(ratio * 100),
            max: Math.round(ratio * 100),
        },
        amount_range: {
            min: Math.round(budget * ratio),
            max: Math.round(budget * ratio),
        },
    }));
};

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return {
            ...response.data,
            user: normalizeUser(response.data.user),
        };
    },

    register: async (username, email, password) => {
        const response = await api.post('/auth/register', { username, email, password });
        return {
            ...response.data,
            user: normalizeUser(response.data.user),
        };
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return normalizeUser(response.data);
    },

    updateProfile: async (updates) => {
        const response = await api.put('/auth/update', updates);
        return {
            ...response.data,
            user: normalizeUser(response.data.user),
        };
    },

    logout: async () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    },
};

export const partsAPI = {
    getAll: async (category = null, limit = 12) => {
        if (!category) {
            return [];
        }
        const response = await api.get(`/prices/trending/${PRICE_CATEGORY_MAP[category] || category}`, {
            params: { limit },
        });
        return (response.data?.products || []).map((product) => normalizePriceProduct(product, category));
    },

    getById: async (id) => {
        const response = await api.get(`/parts/${id}`);
        return normalizePart(response.data?.part || response.data);
    },

    search: async (query, category = null) => {
        const response = await api.get('/prices/search', {
            params: { q: query, category: category ? PRICE_CATEGORY_MAP[category] || category : undefined },
        });
        return (response.data?.products || []).map((product) => normalizePriceProduct(product, category));
    },
};

export const buildsAPI = {
    getAll: async () => {
        const response = await api.get('/builds');
        return normalizeBuildList(response.data);
    },

    getById: async (id) => {
        const response = await api.get(`/builds/${id}`);
        return normalizeBuild(response.data?.build || response.data);
    },

    create: async (buildData) => {
        const response = await api.post('/builds', buildData);
        return {
            ...response.data,
            build: normalizeBuild(response.data?.build),
        };
    },

    update: async (id, buildData) => {
        const response = await api.put(`/builds/${id}`, buildData);
        return {
            ...response.data,
            build: normalizeBuild(response.data?.build),
        };
    },

    delete: async (id) => {
        const response = await api.delete(`/builds/${id}`);
        return response.data;
    },

    getUserBuilds: async () => {
        const response = await api.get('/builds');
        return normalizeBuildList(response.data);
    },

    getCommunity: async (params = {}) => {
        const response = await api.get('/builds/community', { params });
        return {
            ...response.data,
            builds: normalizeBuildList(response.data),
        };
    },

    getFeatured: async () => {
        const response = await api.get('/builds/featured');
        return normalizeBuildList(response.data);
    },

    like: async (id) => {
        const response = await api.post(`/builds/${id}/like`);
        return {
            ...response.data,
            build: normalizeBuild(response.data?.build),
        };
    },
};

const loadDealsFromCategories = async (categories = ['gpu', 'cpu', 'storage', 'monitor']) => {
    const results = await Promise.all(
        categories.map(async (category) => {
            const response = await api.get(`/prices/trending/${PRICE_CATEGORY_MAP[category] || category}`, {
                params: { limit: 4 },
            });
            return (response.data?.products || []).map((product) => normalizePriceProduct(product, category));
        })
    );

    return results
        .flat()
        .filter((deal) => deal.price > 0)
        .map((deal) => ({
            ...deal,
            salePrice: deal.salePrice || deal.price,
            discount: deal.discount ?? 0,
        }))
        .sort((a, b) => (b.discount || 0) - (a.discount || 0) || a.price - b.price)
        .slice(0, 12);
};

export const dealsAPI = {
    getAll: async () => loadDealsFromCategories(),
    getTrending: async () => loadDealsFromCategories(['gpu', 'cpu']),
};

export const chatAPI = {
    sendMessage: async (message, sessionId = 'web-session', context = []) => {
        const messages = [
            ...context,
            { role: 'user', content: message },
        ];
        const response = await api.post('/chat', {
            sessionId,
            messages,
        });
        const build = response.data?.build;
        return {
            response: response.data?.message || 'I had trouble processing that.',
            suggestions: response.data?.suggestions || [],
            build_variants: build
                ? [{
                    label: 'Suggested Build',
                    total_price: build.totalPrice || 0,
                    components: Array.isArray(build.parts) ? build.parts.map((part) => ({
                        type: normalizeAppCategory(part.category).toUpperCase(),
                        name: part.name,
                        price: part.price,
                    })) : [],
                }]
                : [],
        };
    },

    getBudgetAllocation: async (budget, useCase = 'gaming') => ({
        allocations: computeBudgetAllocation(budget, useCase),
        note: 'Allocation generated from the live NexusBuild client budget model.',
    }),
};

export const reportsAPI = {
    create: async (formData) => {
        const response = await api.post('/reports', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    getAll: async () => {
        const response = await api.get('/reports');
        return Array.isArray(response.data) ? response.data : [];
    },
    delete: async (id) => {
        const response = await api.delete(`/reports/${id}`);
        return response.data;
    },
};

export const testerAPI = {
    submitRequest: async (payload) => {
        const response = await api.post('/testers', payload);
        return {
            ...response.data,
            tester: normalizeTester(response.data?.tester),
        };
    },
};
export const adminAPI = {
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },
    getUsers: async () => {
        const response = await api.get('/admin/users');
        return Array.isArray(response.data) ? response.data : [];
    },
    updateUser: async (id, updates) => {
        const response = await api.patch(`/admin/users/${id}`, updates);
        return response.data;
    },
    getBuilds: async () => {
        const response = await api.get('/admin/builds');
        return Array.isArray(response.data) ? response.data : [];
    },
    deleteBuild: async (id) => {
        const response = await api.delete(`/admin/builds/${id}`);
        return response.data;
    },
    getParts: async () => {
        const response = await api.get('/admin/parts');
        return Array.isArray(response.data) ? response.data : [];
    },
    getReports: async () => {
        const response = await api.get('/reports');
        return Array.isArray(response.data) ? response.data : [];
    },
    updateReport: async (id, updates) => {
        const response = await api.patch(`/reports/${id}`, updates);
        return response.data;
    },
    deleteReport: async (id) => {
        const response = await api.delete(`/reports/${id}`);
        return response.data;
    },
    getTesters: async (params = {}) => {
        const response = await api.get('/admin/testers', { params });
        const testers = normalizeTesterList(response.data);
        return {
            ...response.data,
            testers,
            count: response.data?.count ?? testers.length,
        };
    },
    getTesterStats: async () => {
        const response = await api.get('/admin/testers/stats');
        return normalizeTesterStats(response.data);
    },
    updateTester: async (id, updates) => {
        const response = await api.patch(`/admin/testers/${id}`, updates);
        return {
            ...response.data,
            tester: normalizeTester(response.data?.tester),
        };
    },
    deleteTester: async (id) => {
        const response = await api.delete(`/admin/testers/${id}`);
        return response.data;
    },
};

export default api;
