export function safeUpper(value, fallback = 'UNKNOWN') {
    if (value === null || value === undefined) return fallback;
    try {
        return String(value).toUpperCase();
    } catch (e) {
        return fallback;
    }
}

export function formatClassification(app) {
    const cls = (app && app.classification) ? String(app.classification) : null;
    return safeUpper(cls, 'Unknown');
}

export function formatCredentialState(app) {
    const state = (app && app.credentialState) ? String(app.credentialState) : 'missing';
    switch (state) {
        case 'ready': return 'Ready';
        case 'found_unvalidated': return 'Found / Needs Test';
        case 'keystore_found_password_missing': return 'Key Found / Password Missing';
        case 'password_found_keystore_missing': return 'Password Found / Key Missing';
        case 'missing': return 'Missing';
        case 'invalid': return 'Invalid';
        case 'production_protected': return 'Production Protected';
        default: return 'Unknown';
    }
}

export function formatReadiness(app) {
    if (!app) return 'Unknown';
    const r = app.readiness || 'Unknown';
    return String(r);
}

export function formatPath(p) {
    if (!p) return '';
    try { return String(p); } catch (e) { return ''; }
}

export default { safeUpper, formatClassification, formatCredentialState, formatReadiness, formatPath };
