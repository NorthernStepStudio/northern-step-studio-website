import Constants from 'expo-constants';

const fallbackConfig = require('../../app.config.js')({ config: {} });
const fallbackExpoConfig = fallbackConfig?.expo || {};

export const APP_NAME = 'NexusBuild';

export const APP_VERSION =
    Constants?.expoConfig?.extra?.appVersion ||
    Constants?.expoConfig?.version ||
    fallbackExpoConfig?.version ||
    '0.0.0';

export const APP_VERSION_LABEL = `${APP_NAME} v${APP_VERSION}`;

export const getAppVersionLabel = (suffix = '') =>
    suffix ? `${APP_VERSION_LABEL} (${suffix})` : APP_VERSION_LABEL;
