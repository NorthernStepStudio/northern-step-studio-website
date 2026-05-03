import { Linking as RNLinking, Platform } from 'react-native';

type QueryParams = Record<string, string>;
type ParsedURL = {
    hostname: string | null;
    path: string | null;
    queryParams: QueryParams;
    scheme: string | null;
};

const DEFAULT_SCHEME = 'provly';

const ensureSlash = (value: string): string => {
    if (!value) return '';
    return value.startsWith('/') ? value : `/${value}`;
};

const cleanPath = (value: string): string => {
    if (!value) return '';
    return value.replace(/^\/+/, '');
};

const encodeQuery = (queryParams?: Record<string, unknown>): string => {
    if (!queryParams) return '';

    const entries = Object.entries(queryParams).filter(([, v]) => v !== undefined && v !== null);
    if (entries.length === 0) return '';

    const params = new URLSearchParams();
    for (const [key, value] of entries) {
        params.set(key, String(value));
    }

    const query = params.toString();
    return query ? `?${query}` : '';
};

const parseUrl = (url: string): ParsedURL => {
    try {
        const parsed = new URL(url);
        const queryParams: QueryParams = {};
        parsed.searchParams.forEach((value, key) => {
            queryParams[key] = value;
        });

        // Also read hash params like #access_token=...&refresh_token=...
        const hash = parsed.hash.startsWith('#') ? parsed.hash.slice(1) : parsed.hash;
        if (hash) {
            const hashParams = new URLSearchParams(hash);
            hashParams.forEach((value, key) => {
                queryParams[key] = value;
            });
        }

        return {
            hostname: parsed.hostname || null,
            path: cleanPath(parsed.pathname || ''),
            queryParams,
            scheme: parsed.protocol ? parsed.protocol.replace(':', '') : null,
        };
    } catch {
        return {
            hostname: null,
            path: null,
            queryParams: {},
            scheme: null,
        };
    }
};

export const createURL = (
    path = '',
    options?: {
        queryParams?: Record<string, unknown>;
        scheme?: string;
    }
): string => {
    const query = encodeQuery(options?.queryParams);

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
        const normalizedPath = ensureSlash(path);
        return `${window.location.origin}${normalizedPath}${query}`;
    }

    const scheme = (options?.scheme || DEFAULT_SCHEME).replace(/:$/, '');
    const normalizedPath = cleanPath(path);
    const pathPart = normalizedPath ? `/${normalizedPath}` : '';
    return `${scheme}://${pathPart}${query}`;
};

export const makeUrl = createURL;

export const parse = (url: string): ParsedURL => parseUrl(url);

export const parseInitialURLAsync = async (): Promise<(ParsedURL & { url: string | null })> => {
    const url = await RNLinking.getInitialURL();
    if (!url) {
        return {
            hostname: null,
            path: null,
            queryParams: {},
            scheme: null,
            url: null,
        };
    }
    return { ...parseUrl(url), url };
};

export const getInitialURL = RNLinking.getInitialURL.bind(RNLinking);
export const openURL = RNLinking.openURL.bind(RNLinking);
export const canOpenURL = RNLinking.canOpenURL.bind(RNLinking);
export const addEventListener = RNLinking.addEventListener.bind(RNLinking);
const rnLinkingLegacy = RNLinking as unknown as {
    removeEventListener?: (type: 'url', listener: (event: { url: string }) => void) => void;
};
export const removeEventListener = rnLinkingLegacy.removeEventListener?.bind(RNLinking);

const ExpoLinkingShim = {
    createURL,
    makeUrl,
    parse,
    parseInitialURLAsync,
    getInitialURL,
    openURL,
    canOpenURL,
    addEventListener,
    removeEventListener,
};

export default ExpoLinkingShim;
