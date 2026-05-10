// Safe app normalization for frontend rendering
export function normalizeApp(app = {}) {
    const src = Object.assign({}, app);

    const id = src.id || src.appId || src.name || 'unknown';
    const displayName = src.displayName || src.name || src.id || 'Unknown App';
    const path = src.path || src.appRoot || '';
    const appRoot = src.appRoot || src.path || '';

    const classification = src.classification || 'unknown';
    const label = String(classification).toUpperCase();

    const normalized = {
        id,
        displayName,
        path,
        appRoot,
        androidPath: src.androidPath || '',
        packageName: src.packageName || '',
        versionName: src.versionName || '',
        
        classification,
        classificationLabel: label,
        credentialState: src.credentialState || 'missing',
        safeMessage: src.safeMessage || 'Run Scan Workspace to discover credential state.',
        
        keystoreFound: Boolean(src.keystoreFound),
        keystoreSource: src.keystoreSource || (src.keystoreFound ? 'found' : 'missing'),
        passwordSourceFound: Boolean(src.passwordSourceFound),
        passwordSource: src.passwordSource || 'missing',
        alreadyOnGooglePlay: Boolean(src.alreadyOnGooglePlay),
        isProduction: Boolean(src.isProduction || src.alreadyOnGooglePlay),
    };

    return Object.freeze(Object.assign({}, src, normalized));
}

export default normalizeApp;
