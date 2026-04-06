/**
 * 🧠 CORE CONFIG
 *
 * Environment configuration and API settings.
 * Imports ONLY from constants.js (nothing else).
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
// import { getApiBaseUrl as resolveApiBaseUrl } from '../../../packages/shared/src/api/getApiBaseUrl';

export const DEFAULT_PRODUCTION_API_BASE_URL = 'https://northernstepstudio.com/api/nexus';
export const DEFAULT_WEB_ADMIN_CONSOLE_URL =
    'https://northernstepstudio.com/admin';

// ============================================
// ENVIRONMENT
// ============================================
export const ENV = {
    isDev: __DEV__,
    platform: Platform.OS,
};

// ============================================
// API CONFIGURATION
// ============================================

/**
 * Get the base URL for API requests based on environment and platform.
 * @returns {string} The API base URL
 */
const normalizeApiBaseUrl = (value) => {
    if (!value) return null;
    const trimmed = value.endsWith('/') ? value.slice(0, -1) : value;
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const normalizeUrl = (value) => {
    if (!value) return null;
    return value.endsWith('/') ? value.slice(0, -1) : value;
};


export const getApiBaseUrl = () => {
    const extraApiBaseUrl = Constants?.expoConfig?.extra?.apiBaseUrl;
    const envApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    const devHost = Constants?.expoConfig?.hostUri || Constants?.manifest?.debuggerHost;
    const configured = normalizeApiBaseUrl(envApiBaseUrl || extraApiBaseUrl);

    let url = configured;
    if (!url) {
        const devHostName = devHost ? devHost.split(':')[0] : null;
        if (__DEV__) {
            console.log('[API Config] Dev mode detected, but routing to LIVE production Vercel Edge API!');
            url = DEFAULT_PRODUCTION_API_BASE_URL;
        } else {
            url = DEFAULT_PRODUCTION_API_BASE_URL;
        }
    }

    console.log('[API Config] Using base URL:', url);
    return url;
};

export const getLocalApiBaseUrl = () => {
    const extraLocalApiBaseUrl = Constants?.expoConfig?.extra?.localApiBaseUrl;
    const envLocalApiBaseUrl = process.env.EXPO_PUBLIC_LOCAL_API_BASE_URL;
    const devHost = Constants?.expoConfig?.hostUri || Constants?.manifest?.debuggerHost;

    const configured = normalizeApiBaseUrl(envLocalApiBaseUrl || extraLocalApiBaseUrl);
    if (configured) {
        return configured;
    }

    const devHostName = devHost ? devHost.split(':')[0] : null;
    if (Platform.OS === 'android') {
        if (devHostName) {
            return `http://${devHostName}:8787/api`;
        }
        return 'http://10.0.2.2:8787/api';
    }

    if (Platform.OS === 'web' || Platform.OS === 'ios') {
        return DEFAULT_PRODUCTION_API_BASE_URL;
    }

    return null;
};

export const getWebAdminConsoleUrl = () => {
    const extraAdminUrl = Constants?.expoConfig?.extra?.webAdminConsoleUrl;
    const envAdminUrl = process.env.EXPO_PUBLIC_WEB_ADMIN_CONSOLE_URL;
    return normalizeUrl(
        envAdminUrl || extraAdminUrl || DEFAULT_WEB_ADMIN_CONSOLE_URL
    );
};


export const API_CONFIG = {
    baseUrl: getApiBaseUrl(),
    timeout: 45000, // 45 second timeout - accommodates long-running AI generation tasks
    headers: {
        'Content-Type': 'application/json',
    },
};

// ============================================
// FEATURE FLAGS
// ============================================
export const FEATURES = {
    MOCK_ALL_APIS: false,        // Use real backend authentication
    STREAMING_CHAT: true,        // Enable streaming AI responses
    OFFLINE_MODE: true,          // Enable offline fallback
    OFFLINE_FIRST: true,         // Load mock data instantly, update in background
    PRICE_TRACKING: false,       // Hidden until backend alert data exists
    COMPATIBILITY_CHECK: true,   // Enable part compatibility warnings
    COMMUNITY_BUILDS: true,      // Show community builds gallery
    ADMIN_PANEL: false,          // Mobile admin is replaced by the website console
    WEB_ADMIN_CONSOLE: true,     // Admin access happens on the NSS website
    GENERAL_CHAT: true,          // Free informational chat
    ASSISTANT_CHAT: true,        // Paid/pro build assistant
};

// ============================================
// TIMING & LIMITS
// ============================================
export const TIMING = {
    DEBOUNCE_MS: 300,            // Debounce for search inputs
    TOAST_DURATION_MS: 3000,     // How long toasts show
    ANIMATION_DURATION_MS: 200,  // Default animation duration
    CACHE_TTL_MS: 5 * 60 * 1000, // Cache time-to-live (5 minutes)
};

export const LIMITS = {
    MAX_SEARCH_RESULTS: 50,
    MAX_MESSAGE_LENGTH: 1000,
    MAX_BUILD_NAME_LENGTH: 50,
};

export default {
    ENV,
    API_CONFIG,
    getApiBaseUrl,
    getLocalApiBaseUrl,
    getWebAdminConsoleUrl,
    FEATURES,
    TIMING,
    LIMITS,
};
