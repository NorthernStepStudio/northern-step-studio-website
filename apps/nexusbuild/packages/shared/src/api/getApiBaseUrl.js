const normalizeApiBaseUrl = (value) => {
    if (!value) return null;
    const trimmed = value.endsWith('/') ? value.slice(0, -1) : value;
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const getDevHostName = (devHost) => {
    if (!devHost) return null;
    return devHost.split(':')[0];
};

export const getApiBaseUrl = ({
    platform = 'web',
    isDev = false,
    devHost = null,
    envApiBaseUrl = null,
    extraApiBaseUrl = null,
    localPort = 3000,
    productionUrl = 'https://northernstepstudio.com/api/nexus',
} = {}) => {
    const configured = normalizeApiBaseUrl(envApiBaseUrl || extraApiBaseUrl);
    if (configured) {
        return configured;
    }

    if (isDev) {
        const localUrl = `http://localhost:${localPort}/api`;
        console.log(`[API Config] Local dev mode detected, routing to ${localUrl}`);
        return localUrl;
    }

    return productionUrl;
};

export default getApiBaseUrl;
