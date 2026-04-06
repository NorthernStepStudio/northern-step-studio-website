import {
    PCPartPickerCategory,
    PCPartPickerProduct,
    PCPP_CATEGORIES,
    normalizeCategory,
    rankProducts,
} from './apifyService';

type FallbackSeed = {
    id: string;
    name: string;
    category: PCPartPickerCategory;
    price: number;
    merchant: string;
    url: string;
    specs?: Record<string, string>;
    ratingStars?: number;
    ratingCount?: number;
};

const createFallbackProduct = (seed: FallbackSeed): PCPartPickerProduct => ({
    id: seed.id,
    name: seed.name,
    category: seed.category,
    url: seed.url,
    price: {
        lowestPrice: seed.price,
        merchant: seed.merchant,
        availability: 'Curated fallback catalog',
        buyLink: seed.url,
        currency: 'USD',
        offers: [
            {
                merchant: seed.merchant,
                availability: 'Curated fallback catalog',
                price: seed.price,
                currency: 'USD',
                buyLink: seed.url,
            },
        ],
    },
    rating: {
        stars: seed.ratingStars ?? 4.6,
        count: seed.ratingCount ?? 1200,
    },
    specs: seed.specs,
    reviews: [],
    sourceSearchPhrase: 'fallback-catalog',
});

const FALLBACK_SEEDS: FallbackSeed[] = [
    {
        id: 'fallback-cpu-7800x3d',
        name: 'AMD Ryzen 7 7800X3D',
        category: PCPP_CATEGORIES.CPU,
        price: 379.99,
        merchant: 'Amazon',
        url: 'https://pcpartpicker.com/product/78M48d/amd-ryzen-7-7800x3d-42-ghz-8-core-processor-100-100000910wof',
        specs: { cores: '8', threads: '16', socket: 'AM5' },
    },
    {
        id: 'fallback-cpu-14600k',
        name: 'Intel Core i5-14600K',
        category: PCPP_CATEGORIES.CPU,
        price: 299.99,
        merchant: 'Newegg',
        url: 'https://pcpartpicker.com/product/Xk9wrH/intel-core-i5-14600k-35-ghz-14-core-processor-bx8071514600k',
        specs: { cores: '14', threads: '20', socket: 'LGA1700' },
    },
    {
        id: 'fallback-gpu-4070-super',
        name: 'NVIDIA GeForce RTX 4070 SUPER',
        category: PCPP_CATEGORIES.GPU,
        price: 599.99,
        merchant: 'Best Buy',
        url: 'https://pcpartpicker.com/products/video-card/#c=565',
        specs: { memory: '12 GB', chipset: 'RTX 4070 SUPER' },
    },
    {
        id: 'fallback-gpu-7800xt',
        name: 'AMD Radeon RX 7800 XT',
        category: PCPP_CATEGORIES.GPU,
        price: 499.99,
        merchant: 'Amazon',
        url: 'https://pcpartpicker.com/products/video-card/#c=559',
        specs: { memory: '16 GB', chipset: 'RX 7800 XT' },
    },
    {
        id: 'fallback-mobo-b650',
        name: 'MSI MAG B650 Tomahawk WiFi',
        category: PCPP_CATEGORIES.MOTHERBOARD,
        price: 199.99,
        merchant: 'Amazon',
        url: 'https://pcpartpicker.com/products/motherboard/#c=160',
        specs: { socket: 'AM5', chipset: 'B650', formFactor: 'ATX' },
    },
    {
        id: 'fallback-mobo-z790',
        name: 'ASUS TUF Gaming Z790-Plus WiFi',
        category: PCPP_CATEGORIES.MOTHERBOARD,
        price: 239.99,
        merchant: 'Newegg',
        url: 'https://pcpartpicker.com/products/motherboard/#c=162',
        specs: { socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX' },
    },
    {
        id: 'fallback-ram-ddr5-32',
        name: 'Corsair Vengeance DDR5 32GB 6000',
        category: PCPP_CATEGORIES.RAM,
        price: 109.99,
        merchant: 'Amazon',
        url: 'https://pcpartpicker.com/products/memory/#Z=32768002',
        specs: { capacity: '32 GB', speed: 'DDR5-6000', cas: 'CL30' },
    },
    {
        id: 'fallback-ram-ddr5-64',
        name: 'G.Skill Flare X5 DDR5 64GB 6000',
        category: PCPP_CATEGORIES.RAM,
        price: 199.99,
        merchant: 'Newegg',
        url: 'https://pcpartpicker.com/products/memory/#Z=65536002',
        specs: { capacity: '64 GB', speed: 'DDR5-6000', cas: 'CL32' },
    },
    {
        id: 'fallback-storage-990-pro',
        name: 'Samsung 990 Pro 2TB NVMe SSD',
        category: PCPP_CATEGORIES.STORAGE,
        price: 149.99,
        merchant: 'Amazon',
        url: 'https://pcpartpicker.com/products/internal-hard-drive/#A=1800000000000,24000000000000&t=0',
        specs: { capacity: '2 TB', interface: 'PCIe 4.0 x4', type: 'NVMe SSD' },
    },
    {
        id: 'fallback-storage-sn850x',
        name: 'WD Black SN850X 1TB NVMe SSD',
        category: PCPP_CATEGORIES.STORAGE,
        price: 89.99,
        merchant: 'Best Buy',
        url: 'https://pcpartpicker.com/products/internal-hard-drive/#A=900000000000,1200000000000&t=0',
        specs: { capacity: '1 TB', interface: 'PCIe 4.0 x4', type: 'NVMe SSD' },
    },
    {
        id: 'fallback-psu-rm850e',
        name: 'Corsair RM850e 850W 80+ Gold',
        category: PCPP_CATEGORIES.PSU,
        price: 119.99,
        merchant: 'Amazon',
        url: 'https://pcpartpicker.com/products/power-supply/#A=850000000000,2200000000000&e=6,5',
        specs: { wattage: '850 W', efficiency: '80+ Gold', modular: 'Fully Modular' },
    },
    {
        id: 'fallback-psu-focus-750',
        name: 'Seasonic Focus GX-750 750W 80+ Gold',
        category: PCPP_CATEGORIES.PSU,
        price: 109.99,
        merchant: 'Newegg',
        url: 'https://pcpartpicker.com/products/power-supply/#A=750000000000,2200000000000&e=6,5',
        specs: { wattage: '750 W', efficiency: '80+ Gold', modular: 'Fully Modular' },
    },
    {
        id: 'fallback-case-nzxt-h6',
        name: 'NZXT H6 Flow',
        category: PCPP_CATEGORIES.CASE,
        price: 109.99,
        merchant: 'Amazon',
        url: 'https://pcpartpicker.com/products/case/',
        specs: { formFactor: 'ATX Mid Tower', airflow: 'High', color: 'Black' },
    },
    {
        id: 'fallback-case-lancool-216',
        name: 'Lian Li Lancool 216',
        category: PCPP_CATEGORIES.CASE,
        price: 99.99,
        merchant: 'Newegg',
        url: 'https://pcpartpicker.com/products/case/',
        specs: { formFactor: 'ATX Mid Tower', airflow: 'High', color: 'Black' },
    },
    {
        id: 'fallback-cooler-pa120',
        name: 'Thermalright Peerless Assassin 120 SE',
        category: PCPP_CATEGORIES.COOLER,
        price: 35.90,
        merchant: 'Amazon',
        url: 'https://pcpartpicker.com/products/cpu-cooler/',
        specs: { type: 'Air Cooler', fans: '2 x 120 mm', height: '155 mm' },
    },
    {
        id: 'fallback-cooler-ls720',
        name: 'DeepCool LS720 360mm AIO',
        category: PCPP_CATEGORIES.COOLER,
        price: 119.99,
        merchant: 'Newegg',
        url: 'https://pcpartpicker.com/products/cpu-cooler/',
        specs: { type: 'Liquid Cooler', radiator: '360 mm', lighting: 'ARGB' },
    },
    {
        id: 'fallback-monitor-g2724d',
        name: 'Dell G2724D 27-inch 1440p 165Hz',
        category: PCPP_CATEGORIES.MONITOR,
        price: 229.99,
        merchant: 'Dell',
        url: 'https://pcpartpicker.com/products/monitor/',
        specs: { size: '27 in', resolution: '2560x1440', refreshRate: '165 Hz' },
    },
    {
        id: 'fallback-monitor-odyssey-g6',
        name: 'Samsung Odyssey G6 27-inch 240Hz',
        category: PCPP_CATEGORIES.MONITOR,
        price: 379.99,
        merchant: 'Best Buy',
        url: 'https://pcpartpicker.com/products/monitor/',
        specs: { size: '27 in', resolution: '2560x1440', refreshRate: '240 Hz' },
    },
    {
        id: 'fallback-keyboard-k70',
        name: 'Corsair K70 RGB Pro Mechanical Keyboard',
        category: PCPP_CATEGORIES.KEYBOARD,
        price: 129.99,
        merchant: 'Amazon',
        url: 'https://pcpartpicker.com/products/keyboard/',
        specs: { switches: 'Cherry MX', layout: 'Full Size', lighting: 'RGB' },
    },
    {
        id: 'fallback-keyboard-apex-tkl',
        name: 'SteelSeries Apex Pro TKL',
        category: PCPP_CATEGORIES.KEYBOARD,
        price: 169.99,
        merchant: 'Best Buy',
        url: 'https://pcpartpicker.com/products/keyboard/',
        specs: { switches: 'OmniPoint', layout: 'TKL', lighting: 'RGB' },
    },
    {
        id: 'fallback-mouse-gpx2',
        name: 'Logitech G Pro X Superlight 2',
        category: PCPP_CATEGORIES.MOUSE,
        price: 149.99,
        merchant: 'Amazon',
        url: 'https://pcpartpicker.com/products/mouse/',
        specs: { sensor: 'HERO 2', weight: '60 g', connection: 'Wireless' },
    },
    {
        id: 'fallback-mouse-viper-v3',
        name: 'Razer Viper V3 Pro',
        category: PCPP_CATEGORIES.MOUSE,
        price: 159.99,
        merchant: 'Best Buy',
        url: 'https://pcpartpicker.com/products/mouse/',
        specs: { sensor: 'Focus Pro', weight: '54 g', connection: 'Wireless' },
    },
    {
        id: 'fallback-headphones-cloud3',
        name: 'HyperX Cloud III Wireless',
        category: PCPP_CATEGORIES.HEADPHONES,
        price: 129.99,
        merchant: 'Amazon',
        url: 'https://pcpartpicker.com/products/headphones/',
        specs: { type: 'Headset', connection: 'Wireless', surround: 'DTS' },
    },
    {
        id: 'fallback-headphones-arctis-nova',
        name: 'SteelSeries Arctis Nova 7',
        category: PCPP_CATEGORIES.HEADPHONES,
        price: 149.99,
        merchant: 'Best Buy',
        url: 'https://pcpartpicker.com/products/headphones/',
        specs: { type: 'Headset', connection: 'Wireless', battery: '38 hours' },
    },
];

const FALLBACK_PRODUCTS = FALLBACK_SEEDS.map(createFallbackProduct);

const FALLBACK_BY_CATEGORY = FALLBACK_PRODUCTS.reduce<Record<string, PCPartPickerProduct[]>>((acc, product) => {
    if (!acc[product.category]) {
        acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
}, {});

const sortFallbackProducts = (query: string, products: PCPartPickerProduct[], category?: string) =>
    rankProducts(query, products, category);

export const getFallbackTrendingProducts = (
    category: string,
    limit: number = 10
): PCPartPickerProduct[] => {
    const normalizedCategory = normalizeCategory(category);
    if (!normalizedCategory) {
        return [];
    }

    return (FALLBACK_BY_CATEGORY[normalizedCategory] || []).slice(0, limit);
};

export const searchFallbackProducts = ({
    query,
    category,
    limit = 10,
}: {
    query: string;
    category?: string;
    limit?: number;
}): PCPartPickerProduct[] => {
    const normalizedCategory = normalizeCategory(category);
    const products = normalizedCategory
        ? FALLBACK_BY_CATEGORY[normalizedCategory] || []
        : FALLBACK_PRODUCTS;

    return sortFallbackProducts(query, products, normalizedCategory).slice(0, limit);
};

export const getFallbackProductPrice = (
    name: string,
    category?: string
): PCPartPickerProduct | null => {
    const [bestMatch] = searchFallbackProducts({
        query: name,
        category,
        limit: 1,
    });

    return bestMatch || null;
};

export const getFallbackBatchPrices = (
    products: { name: string; category?: string }[]
): Map<string, PCPartPickerProduct | null> => {
    const result = new Map<string, PCPartPickerProduct | null>();
    for (const product of products) {
        result.set(product.name, getFallbackProductPrice(product.name, product.category));
    }
    return result;
};

export const getFallbackCatalogStatus = () => ({
    status: 'degraded',
    dataSource: 'fallback',
    message: 'Apify is unavailable. Serving the curated fallback catalog.',
});

export default {
    getFallbackBatchPrices,
    getFallbackCatalogStatus,
    getFallbackProductPrice,
    getFallbackTrendingProducts,
    searchFallbackProducts,
};
