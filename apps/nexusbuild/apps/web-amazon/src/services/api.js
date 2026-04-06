import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV
        ? 'http://localhost:3000/api'
        : 'https://api.nexusbuild.app/api');
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

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
    accessory: 'storage',
    os: 'storage',
};

const normalizeCategory = (value) => {
    if (!value) return 'part';
    const normalized = String(value).toLowerCase().replace(/[_-]+/g, ' ').trim();
    const aliases = {
        cpu: 'cpu',
        gpu: 'gpu',
        'video card': 'gpu',
        'video-card': 'gpu',
        motherboard: 'motherboard',
        ram: 'ram',
        memory: 'ram',
        storage: 'storage',
        'internal-hard-drive': 'storage',
        psu: 'psu',
        'power supply': 'psu',
        'power-supply': 'psu',
        case: 'case',
        cooler: 'cooler',
        'cpu cooler': 'cooler',
        monitor: 'monitor',
        keyboard: 'keyboard',
        mouse: 'mouse',
    };
    return aliases[normalized] || normalized.replace(/\s+/g, '-');
};

const normalizePriceValue = (value) => {
    const parsed = Number.parseFloat(String(value ?? '').replace(/[^0-9.]+/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeProduct = (product, fallbackCategory) => ({
    id: product?.id || product?.url || `${product?.name}-${fallbackCategory || 'part'}`,
    name: product?.name || 'Unknown Part',
    category: normalizeCategory(product?.category || fallbackCategory),
    manufacturer: product?.price?.merchant || product?.manufacturer || 'PCPartPicker',
    price: normalizePriceValue(product?.price?.lowestPrice ?? product?.price),
    image_url: product?.imageUrl || product?.image_url || product?.image || null,
    url: product?.price?.buyLink || product?.url || null,
    specs: product?.specs || product?.specifications || {},
});

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const partsAPI = {
    getAll: async (category = null) => {
        if (!category) return [];
        const response = await api.get(`/prices/trending/${PRICE_CATEGORY_MAP[category] || category}`, {
            params: { limit: 12 },
        });
        return (response.data?.products || []).map((product) => normalizeProduct(product, category));
    },

    getById: async (id) => {
        const response = await api.get(`/parts/${id}`);
        return response.data?.part || response.data;
    },

    search: async (query, category = null) => {
        const response = await api.get('/prices/search', {
            params: { q: query, category: category ? PRICE_CATEGORY_MAP[category] || category : undefined },
        });
        return (response.data?.products || []).map((product) => normalizeProduct(product, category));
    },
};

export const buildsAPI = {
    getAll: async () => {
        const response = await api.get('/builds/community');
        return response.data?.builds || [];
    },

    getById: async (id) => {
        const response = await api.get(`/builds/${id}`);
        return response.data?.build || response.data;
    },
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

export default api;
