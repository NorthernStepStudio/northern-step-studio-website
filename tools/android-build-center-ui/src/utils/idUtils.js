/**
 * Utilities for consistent App ID and Credential Key handling.
 */

/**
 * Sanitizes an app ID for use in file paths and credential store keys.
 * Rules: lowercase, no spaces, hyphens only for separators.
 */
function sanitizeAppId(id) {
    if (!id) return 'unknown-app';
    return id.toLowerCase()
             .replace(/\s+/g, '-')    // Spaces to hyphens
             .replace(/[^a-z0-9-]/g, '') // Remove special chars
             .replace(/-+/g, '-')      // Collapse multiple hyphens
             .replace(/^-|-$/g, '')
             .trim();
}

function canonicalAppId(id) {
    return sanitizeAppId(id);
}

function uniqueNonEmpty(values) {
    const seen = new Set();
    const result = [];
    values.forEach(value => {
        if (!value) return;
        const normalized = sanitizeAppId(String(value));
        if (!normalized || seen.has(normalized)) return;
        seen.add(normalized);
        result.push(normalized);
    });
    return result;
}

function getCredentialLookupIds(appId, context = {}) {
    const values = [appId, canonicalAppId(appId)];

    if (appId && String(appId).endsWith('-mobile')) {
        values.push(String(appId).replace(/-mobile$/, ''));
    }

    const pathLikeValues = [context.appRoot, context.path, context.configPath].filter(Boolean);
    pathLikeValues.forEach(value => {
        const normalized = String(value).replace(/\\/g, '/').replace(/\/$/, '');
        const basename = normalized.split('/').filter(Boolean).pop();
        if (basename) values.push(basename);
    });

    if (context.packageName) {
        values.push(context.packageName);
        values.push(String(context.packageName).split('.').pop());
    }

    return uniqueNonEmpty(values);
}

/**
 * Returns the canonical Windows Credential Manager resource key for an app's keystore.
 */
function getKeystoreResourceKey(appId) {
    return `NStep.AndroidBuildCenter.${sanitizeAppId(appId)}.uploadKeystore`;
}

/**
 * Returns the canonical Windows Credential Manager resource key for an app's key alias password.
 */
function getKeyResourceKey(appId) {
    return `NStep.AndroidBuildCenter.${sanitizeAppId(appId)}.uploadKey`;
}

module.exports = {
    sanitizeAppId,
    canonicalAppId,
    getCredentialLookupIds,
    getKeystoreResourceKey,
    getKeyResourceKey
};
