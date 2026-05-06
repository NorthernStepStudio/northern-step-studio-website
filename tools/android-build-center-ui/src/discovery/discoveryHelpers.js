const fs = require('fs');
const path = require('path');
const { APPS_JSON_PATH, WORKSPACE_ROOT } = require('../config/paths');
const { readJson } = require('../utils/jsonUtils');
const { getCredential } = require('../credentials/sessionVault');
const { recoverFromWCM } = require('../credentials/windowsCredentialManager');

function detectSecrets(appRoot) {
    const credPath = path.join(appRoot, 'credentials.json');
    const tempPath = path.join(appRoot, 'android', 'signing.temp.properties');
    
    // Check EAS credentials.json
    if (fs.existsSync(credPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(credPath, 'utf8'));
            if (data && data.android && data.android.keystore) {
                return {
                    keystorePassword: data.android.keystore.keystorePassword,
                    keyPassword: data.android.keystore.keyPassword || data.android.keystore.keystorePassword,
                    keyAlias: data.android.keystore.keyAlias
                };
            }
        } catch (e) {}
    }

    // Check transient signing.temp.properties
    if (fs.existsSync(tempPath)) {
        try {
            const content = fs.readFileSync(tempPath, 'utf8');
            const storePass = content.match(/STORE_PASSWORD=(.+)/);
            const keyPass = content.match(/KEY_PASSWORD=(.+)/);
            if (storePass && keyPass) {
                return {
                    keystorePassword: storePass[1].trim(),
                    keyPassword: keyPass[1].trim()
                };
            }
        } catch (e) {}
    }
    return null;
}

function detectKeystores(appRoot, appId) {
    const root = WORKSPACE_ROOT;
    const searchPaths = [
        'android/app',
        'android/keystores',
        'credentials/android',
        'private-keys/android'
    ];

    const keystores = [];
    searchPaths.forEach(relPath => {
        const fullPath = path.join(appRoot, relPath);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            try {
                const files = fs.readdirSync(fullPath);
                files.forEach(file => {
                    if ((file.endsWith('.keystore') || file.endsWith('.jks')) && file !== 'debug.keystore') {
                        keystores.push(path.relative(root, path.join(fullPath, file)).replace(/\\/g, '/'));
                    }
                });
            } catch (e) {}
        }
    });

    const appBaseName = path.basename(appRoot);
    const globalPrivatePath = path.join(root, 'private-keys/android', appBaseName);
    if (fs.existsSync(globalPrivatePath)) {
        try {
            const files = fs.readdirSync(globalPrivatePath);
            files.forEach(file => {
                if ((file.endsWith('.keystore') || file.endsWith('.jks')) && file !== 'debug.keystore') {
                    keystores.push(path.relative(root, path.join(globalPrivatePath, file)).replace(/\\/g, '/'));
                }
            });
        } catch (e) {}
    }

    if (appId) {
        const idPrivatePath = path.join(root, 'private-keys/android', appId);
        if (fs.existsSync(idPrivatePath)) {
            try {
                const files = fs.readdirSync(idPrivatePath);
                files.forEach(file => {
                    if ((file.endsWith('.keystore') || file.endsWith('.jks')) && file !== 'debug.keystore') {
                        keystores.push(path.relative(root, path.join(idPrivatePath, file)).replace(/\\/g, '/'));
                    }
                });
            } catch (e) {}
        }
    }

    if (appId) {
        try {
            const cfg = readJson(APPS_JSON_PATH);
            if (cfg[appId] && cfg[appId].keystorePath) {
                const ksPath = path.join(root, cfg[appId].keystorePath);
                if (fs.existsSync(ksPath)) {
                    keystores.push(cfg[appId].keystorePath.replace(/\\/g, '/'));
                } else if (path.isAbsolute(cfg[appId].keystorePath) && fs.existsSync(cfg[appId].keystorePath)) {
                    keystores.push(cfg[appId].keystorePath.replace(/\\/g, '/'));
                }
            }

            // Check Metadata Manifest (outside repo)
            const machineRoot = path.join(process.env.USERPROFILE || process.env.HOME, 'NStep');
            const manifestPath = path.join(machineRoot, 'credentials-manifest.json');
            if (fs.existsSync(manifestPath)) {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                if (manifest[appId] && manifest[appId].keystorePath && fs.existsSync(manifest[appId].keystorePath)) {
                    keystores.push(manifest[appId].keystorePath.replace(/\\/g, '/'));
                }
            }
        } catch (e) {}
    }

    return [...new Set(keystores)];
}

function scanCredentialSourcesForApp(appId) {
    const root = WORKSPACE_ROOT;
    const apps = readJson(APPS_JSON_PATH);
    let relAppRoot = apps[appId] && apps[appId].path ? apps[appId].path : path.join('apps', appId);
    const appRoot = path.join(root, relAppRoot);

    const result = { credentialsFound: false, sources: [] };

    if (getCredential(appId)) {
        result.credentialsFound = true;
        result.sources.push({ type: 'session-vault', hasStorePassword: true, hasKeyPassword: true });
    }

    const easPath = path.join(appRoot, 'credentials.json');
    if (fs.existsSync(easPath)) {
        result.credentialsFound = true;
        result.sources.push({ type: 'eas-credentials-json', path: easPath, hasStorePassword: true });
    }

    const wcm = recoverFromWCM(appId);
    if (wcm) {
        result.credentialsFound = true;
        result.sources.push({ type: 'windows-credential-manager', hasStorePassword: true });
    }

    return result;
}

function classifyApp(id, configuredApps) {
    const cfg = configuredApps[id];
    if (cfg && (cfg.alreadyOnGooglePlay || cfg.isProduction)) return 'production';
    if (cfg) return 'private';
    return 'unknown';
}

module.exports = { detectSecrets, detectKeystores, scanCredentialSourcesForApp, classifyApp };
