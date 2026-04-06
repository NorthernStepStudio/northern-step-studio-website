/**
 * 🧠 CORE CONSTANTS
 * 
 * App-wide constants - the foundation of the "brain".
 * NOTHING should import into this file - it's pure data.
 */

// ============================================
// PART CATEGORIES
// ============================================
export const PART_CATEGORIES = {
    CPU: 'cpu',
    GPU: 'gpu',
    MOTHERBOARD: 'motherboard',
    RAM: 'ram',
    STORAGE: 'storage',
    PSU: 'psu',
    CASE: 'case',
    COOLER: 'cooler',
    // New peripheral categories
    MONITOR: 'monitor',
    KEYBOARD: 'keyboard',
    MOUSE: 'mouse',
    HEADSET: 'headset',
    FANS: 'fan',
};

export const PART_CATEGORY_LABELS = {
    [PART_CATEGORIES.CPU]: 'Processor',
    [PART_CATEGORIES.GPU]: 'Graphics Card',
    [PART_CATEGORIES.MOTHERBOARD]: 'Motherboard',
    [PART_CATEGORIES.RAM]: 'Memory',
    [PART_CATEGORIES.STORAGE]: 'Storage',
    [PART_CATEGORIES.PSU]: 'Power Supply',
    [PART_CATEGORIES.CASE]: 'Case',
    [PART_CATEGORIES.COOLER]: 'CPU Cooler',
    [PART_CATEGORIES.MONITOR]: 'Monitor',
    [PART_CATEGORIES.KEYBOARD]: 'Keyboard',
    [PART_CATEGORIES.MOUSE]: 'Mouse',
    [PART_CATEGORIES.HEADSET]: 'Headset',
    [PART_CATEGORIES.FANS]: 'Case Fans',
};

export const PART_CATEGORY_ICONS = {
    [PART_CATEGORIES.CPU]: 'hardware-chip',
    [PART_CATEGORIES.GPU]: 'game-controller',
    [PART_CATEGORIES.MOTHERBOARD]: 'grid',
    [PART_CATEGORIES.RAM]: 'speedometer',
    [PART_CATEGORIES.STORAGE]: 'server',
    [PART_CATEGORIES.PSU]: 'flash',
    [PART_CATEGORIES.CASE]: 'cube',
    [PART_CATEGORIES.COOLER]: 'snow',
    [PART_CATEGORIES.MONITOR]: 'tv-outline',
    [PART_CATEGORIES.KEYBOARD]: 'keypad-outline',
    [PART_CATEGORIES.MOUSE]: 'navigate-outline',
    [PART_CATEGORIES.HEADSET]: 'headset-outline',
    [PART_CATEGORIES.FANS]: 'aperture-outline',
};

// ============================================
// BUILD LIMITS
// ============================================
export const BUILD_LIMITS = {
    MIN_BUDGET: 300,
    MAX_BUDGET: 50000,
    MAX_PARTS_PER_CATEGORY: 1,
    MAX_STORAGE_DRIVES: 4,
    MAX_RAM_STICKS: 4,
};

// ============================================
// SOCKET TYPES
// ============================================
export const SOCKET_TYPES = {
    AMD_AM5: 'AM5',
    AMD_AM4: 'AM4',
    INTEL_1700: 'LGA1700',
    INTEL_1200: 'LGA1200',
};

// ============================================
// MEMORY TYPES
// ============================================
export const MEMORY_TYPES = {
    DDR5: 'DDR5',
    DDR4: 'DDR4',
};

// ============================================
// ERROR MESSAGES
// ============================================
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
    AUTH_REQUIRED: 'Please login to continue.',
    BUILD_SAVE_FAILED: 'Failed to save build. Please try again.',
    PART_NOT_FOUND: 'Part not found.',
    INCOMPATIBLE_SOCKET: 'Socket mismatch detected.',
    INCOMPATIBLE_RAM: 'RAM type not supported by motherboard.',
    INSUFFICIENT_PSU: 'Power supply may be insufficient.',
};

// ============================================
// STORAGE KEYS (AsyncStorage)
// ============================================
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'authToken',
    USER: 'user',
    CURRENT_BUILD: 'currentBuild',
    THEME: 'theme',
    CACHED_TRENDING: 'trending_builds',
};

// ============================================
// API ENDPOINTS (relative paths)
// ============================================
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
    },
    PARTS: {
        LIST: '/parts',
        SEARCH: '/parts/search',
        BY_ID: (id) => `/parts/${id}`,
    },
    BUILDS: {
        LIST: '/builds',
        BY_ID: (id) => `/builds/${id}`,
        USER: () => '/builds',
    },
    CHAT: {
        SEND: '/chat',
        STREAM: '/chat',
        CLEAR: '/chat/clear',
    },
    DEALS: {
        LIST: '/prices/trending',
        TRENDING: '/prices/trending',
    },
};

// ============================================
// FEATURE BRANDING COLORS
// ============================================
export const FEATURE_COLORS = {
    HOME: '#00E5FF',     // Cyan
    BUILDER: '#FF9F1C',  // Orange
    CHAT: '#A633CC',     // Purple
    PROFILE: '#2EC4B6',  // Teal
    MENU: '#FF3366',     // Pink
};

// ============================================
// GAMIFICATION
// ============================================
export const AVATAR_FRAMES = {
    // Default - No frame
    DEFAULT: { id: 'default', name: 'Standard', borderColor: null, shape: 'round' },

    // Original Premium Frames
    NEON_CYAN: { id: 'neon_cyan', name: 'Neon Circuit', borderColor: ['#00FFFF', '#00CED1'], locked: true, shape: 'square' },
    PLASMA_RED: { id: 'plasma_red', name: 'Plasma Core', borderColor: ['#FF4444', '#FF0000'], locked: true, shape: 'round' },
    TECH_GOLD: { id: 'tech_gold', name: 'Gold Tier', borderColor: ['#FFD700', '#FFA500'], locked: true, shape: 'square' },
    GLITCH_PURPLE: { id: 'glitch_purple', name: 'Cyber Glitch', borderColor: ['#8B00FF', '#FF00FF'], locked: true, shape: 'round' },

    // Menu-Inspired Frames (matching tab colors)
    DEALS_GREEN: { id: 'deals_green', name: 'Emerald Shield', borderColor: ['#22C55E', '#10B981'], locked: false, shape: 'hexagon' },
    AMBER_GLOW: { id: 'amber_glow', name: 'Sunset Glow', borderColor: ['#F59E0B', '#D97706'], locked: false, shape: 'round' },
    OCEAN_BLUE: { id: 'ocean_blue', name: 'Ocean Wave', borderColor: ['#00E5FF', '#0EA5E9'], locked: false, shape: 'square' },
    INDIGO_DREAM: { id: 'indigo_dream', name: 'Indigo Dream', borderColor: ['#6366F1', '#8B5CF6'], locked: false, shape: 'hexagon' },
    INFO_BLUE: { id: 'info_blue', name: 'Crystal Ice', borderColor: ['#3B82F6', '#60A5FA'], locked: false, shape: 'round' },
    WARNING_ORANGE: { id: 'warning_orange', name: 'Solar Flare', borderColor: ['#F97316', '#FB923C'], locked: false, shape: 'square' },
    MINT_FRESH: { id: 'mint_fresh', name: 'Mint Fresh', borderColor: ['#10B981', '#34D399'], locked: false, shape: 'hexagon' },
    PINK_ROSE: { id: 'pink_rose', name: 'Rose Petal', borderColor: ['#FF3366', '#EC4899'], locked: false, shape: 'round' },
    TEAL_WAVE: { id: 'teal_wave', name: 'Teal Tide', borderColor: ['#2EC4B6', '#14B8A6'], locked: false, shape: 'square' },
};

export default {
    PART_CATEGORIES,
    PART_CATEGORY_LABELS,
    PART_CATEGORY_ICONS,
    BUILD_LIMITS,
    SOCKET_TYPES,
    MEMORY_TYPES,
    ERROR_MESSAGES,
    STORAGE_KEYS,
    API_ENDPOINTS,
    AVATAR_FRAMES,
};
