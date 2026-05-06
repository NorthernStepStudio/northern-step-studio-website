const fs = require('fs');
const path = require('path');
const { getCredential, setCredential } = require('./sessionVault');
const { recoverFromWCM } = require('./windowsCredentialManager');
const { WORKSPACE_ROOT } = require('../config/paths');
const { sanitizeAppId, getCredentialLookupIds } = require('../utils/idUtils');
const { getCredentialManifestEntry } = require('./credentialManifest');

/**
 * Resolves credentials for an app following a strict 6-step priority chain.
 */
function resolveCredentials(appId, appRoot, options = {}) {
    const appConfig = options.appConfig || {};
    const lookupContext = {
        appRoot,
        path: appConfig.path,
        packageName: appConfig.packageName,
        candidateAppIds: options.candidateAppIds || []
    };

    // 1. Session Vault
    let creds = getCredential(appId);
    if (creds && creds.keystorePassword) {
        return { ...creds, source: 'session' };
    }

    // 2. Local Machine Secure Store (Windows Credential Manager)
    const wcm = recoverFromWCM(appId, lookupContext);
    if (wcm && wcm.keystorePassword) {
        const loaded = { ...wcm, source: 'machine-secure-store' };
        setCredential(appId, loaded);
        return loaded;
    }

    // 3. App Credential Manifest (outside repo: ~/NStep/credentials-manifest.json)
    const manifestEntry = getCredentialManifestEntry(appId);
    if (manifestEntry) {
        const manifestLookupIds = getCredentialLookupIds(appId, {
            appRoot,
            path: appConfig.path,
            packageName: appConfig.packageName
        }).concat(manifestEntry.appId || [], manifestEntry.canonicalAppId || []);
        const manifestWcm = recoverFromWCM(appId, { candidateAppIds: manifestLookupIds });
        if (manifestWcm && manifestWcm.keystorePassword) {
            const loaded = { ...manifestWcm, source: 'machine-secure-store' };
            setCredential(appId, loaded);
            return loaded;
        }
    }

    // 4. Environment Variables
    const cleanId = sanitizeAppId(appId);
    const envPrefix = cleanId.replace(/-/g, '_').toUpperCase();
    const envKsPass = process.env[`NSTEP_${envPrefix}_KEYSTORE_PASSWORD`] || process.env[`NSTEP_KEYSTORE_PASSWORD`];
    const envKeyPass = process.env[`NSTEP_${envPrefix}_KEY_PASSWORD`] || process.env[`NSTEP_KEY_PASSWORD`];
    const envKeyAlias = process.env[`NSTEP_${envPrefix}_KEY_ALIAS`] || process.env[`NSTEP_KEY_ALIAS`];

    if (envKsPass) {
        const envCreds = {
            keystorePassword: envKsPass,
            keyPassword: envKeyPass || envKsPass,
            keyAlias: envKeyAlias
        };
        setCredential(appId, envCreds);
        return { ...envCreds, source: 'environment' };
    }

    // 5. Existing Expo credential export (credentials.json)
    if (appRoot) {
        const fullAppRoot = path.isAbsolute(appRoot) ? appRoot : path.join(WORKSPACE_ROOT, appRoot);
        const easPath = path.join(fullAppRoot, 'credentials.json');
        if (fs.existsSync(easPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(easPath, 'utf8'));
                const android = data?.android || data?.production?.android || data?.development?.android;
                if (android?.keystore) {
                    const easCreds = {
                        keystorePassword: android.keystore.keystorePassword,
                        keyPassword: android.keystore.keyPassword || android.keystore.keystorePassword,
                        keyAlias: android.keystore.keyAlias
                    };
                    setCredential(appId, easCreds);
                    return { ...easCreds, source: 'expo-manifest' };
                }
            } catch (e) {}
        }
    }

    // 6. Generated Local Credential Record (Session Vault / Temporary Cache)
    // Already covered by step 1 & 2 in practice, but keeping as a logical step.

    return null;
}

module.exports = { resolveCredentials };
