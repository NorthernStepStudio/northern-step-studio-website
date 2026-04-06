import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

import { APP_NAME, APP_VERSION } from './appInfo';
import { API_CONFIG, FEATURES, getWebAdminConsoleUrl } from './config';

const fallbackConfig = require('../../app.config.js')({ config: {} });
const fallbackExpoConfig = fallbackConfig?.expo || {};

const toIsoString = (value) => {
    if (!value) return null;

    try {
        return new Date(value).toISOString();
    } catch {
        return null;
    }
};

const getFallbackRuntimeVersion = () => {
    const runtimeVersion = fallbackExpoConfig?.runtimeVersion;

    if (typeof runtimeVersion === 'string') {
        return runtimeVersion;
    }

    if (runtimeVersion?.policy === 'appVersion') {
        return APP_VERSION;
    }

    return null;
};

export const getRuntimeDiagnostics = () => {
    const expoConfig = Constants?.expoConfig || fallbackExpoConfig;

    return {
        appName: APP_NAME,
        appVersion: APP_VERSION,
        runtimeVersion: Updates.runtimeVersion || getFallbackRuntimeVersion() || APP_VERSION,
        updateId: Updates.updateId || (Updates.isEmbeddedLaunch ? 'embedded' : 'unknown'),
        channel: Updates.channel || expoConfig?.releaseChannel || 'default',
        isEmbeddedLaunch:
            typeof Updates.isEmbeddedLaunch === 'boolean' ? Updates.isEmbeddedLaunch : true,
        updateCreatedAt: toIsoString(Updates.createdAt || Updates.manifest?.createdAt),
        projectId:
            expoConfig?.extra?.eas?.projectId || fallbackExpoConfig?.extra?.eas?.projectId || null,
        updateUrl: expoConfig?.updates?.url || fallbackExpoConfig?.updates?.url || null,
        apiBaseUrl: API_CONFIG.baseUrl,
        webAdminConsoleUrl: getWebAdminConsoleUrl(),
        features: {
            generalChat: FEATURES.GENERAL_CHAT,
            assistantChat: FEATURES.ASSISTANT_CHAT,
            priceTracking: FEATURES.PRICE_TRACKING,
            mobileAdmin: FEATURES.ADMIN_PANEL,
            webAdminConsole: FEATURES.WEB_ADMIN_CONSOLE,
        },
    };
};

export const formatDiagnosticsClipboard = (diagnostics = getRuntimeDiagnostics()) => {
    const lines = [
        ['App', diagnostics.appName],
        ['Version', diagnostics.appVersion],
        ['Runtime', diagnostics.runtimeVersion],
        ['Channel', diagnostics.channel],
        ['Update ID', diagnostics.updateId],
        ['Embedded Launch', diagnostics.isEmbeddedLaunch ? 'Yes' : 'No'],
        ['Update Created', diagnostics.updateCreatedAt],
        ['Project ID', diagnostics.projectId],
        ['Update URL', diagnostics.updateUrl],
        ['API Base URL', diagnostics.apiBaseUrl],
        ['Web Admin URL', diagnostics.webAdminConsoleUrl],
        [
            'Features',
            [
                diagnostics.features?.generalChat ? 'general-chat' : null,
                diagnostics.features?.assistantChat ? 'assistant-chat' : null,
                diagnostics.features?.priceTracking ? 'price-tracking' : null,
                diagnostics.features?.webAdminConsole ? 'web-admin' : null,
                diagnostics.features?.mobileAdmin ? 'mobile-admin' : null,
            ].filter(Boolean).join(', '),
        ],
    ];

    return lines
        .filter(([, value]) => value)
        .map(([label, value]) => `${label}: ${value}`)
        .join('\n');
};
