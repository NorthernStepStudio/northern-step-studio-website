const path = require('path');

const { WORKSPACE_ROOT, APPS_JSON_PATH } = require('../config/paths');
const { readJson } = require('../utils/jsonUtils');
const findApps = require('./findApps');
const { 
    detectKeystores, 
    classifyApp 
} = require('./discoveryHelpers');
const { resolveAndValidateCredentials } = require('../credentials/credentialService');
const { resolveAppVersion } = require('../utils/versionResolver');
const { getPlayVersions } = require('../metadata/buildMetadata');

/**
 * Orchestrates the workspace scanning logic with hardened security guards and deduplication.
 */
function scanWorkspace(logger) {
    const root = WORKSPACE_ROOT;
    const log = (evt) => {
        try {
            if (typeof logger === 'function') logger(evt);
            else if (logger && typeof logger.log === 'function') logger.log(evt);
        } catch (e) {}
    };

    log({ type: 'scan-start', message: 'Scan started' });
    log({ type: 'workspace-root', message: `Scanning ${root}` });
    const appsFound = findApps(root);
    log({ type: 'found-candidates', message: `Found ${appsFound.length} candidates` });

    let configuredApps = readJson(APPS_JSON_PATH);
    log({ type: 'loaded-config', message: `Loaded ${Object.keys(configuredApps).length} configured apps` });

    const discoveredMap = new Map();

    appsFound.forEach(app => {
        const relAppRoot = path.relative(root, app.appRoot).replace(/\\/g, '/');
        if (!app || !app.pkg) {
            log({ type: 'invalid-app', message: `Invalid app at ${relAppRoot}` });
            return;
        }
        let id = app.pkg.name ? app.pkg.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() : path.basename(app.appRoot);
        log({ type: 'candidate', message: `${id} at ${relAppRoot}` });
        
        // Match existing config
        let status = 'new';
        let existingKey = Object.keys(configuredApps).find(k => configuredApps[k].path === relAppRoot);
        if (existingKey) {
            status = 'configured';
            id = existingKey;
        } else if (configuredApps[id]) {
            status = 'configured';
        }

        // Deduplication Logic:
        // If we already found an app with this ID, decide whether to replace it.
        // Priority: 1. Configured apps, 2. Non-archive over archive, 3. Shortest path
        if (discoveredMap.has(id)) {
            const existing = discoveredMap.get(id);
            const existingIsConfigured = existing.status === 'configured';
            const currentIsConfigured = status === 'configured';

            if (!currentIsConfigured && existingIsConfigured) {
                log({ type: 'duplicate-skipped', message: `Skipped duplicate ${id} (kept configured)` });
                return; // keep existing
            }

            if (currentIsConfigured && !existingIsConfigured) {
                log({ type: 'duplicate-replaced', message: `Replaced duplicate ${id} with configured entry` });
                // proceed to replace
            } else if (relAppRoot.includes('archive/') && !existing.appRoot.includes('archive/')) {
                log({ type: 'duplicate-skipped', message: `Skipped duplicate ${id} (archive)` });
                return; // prefer non-archive existing
            } else if (!relAppRoot.includes('archive/') && existing.appRoot.includes('archive/')) {
                log({ type: 'duplicate-replaced', message: `Replaced archive duplicate ${id}` });
                // proceed to replace
            } else if (relAppRoot.length > existing.appRoot.length) {
                log({ type: 'duplicate-skipped', message: `Skipped duplicate ${id} (longer path)` });
                return; // prefer the shorter (existing) path
            }
            // otherwise proceed and replace the existing entry below
        }

        const appConfig = configuredApps[id] || {};
        const isProduction = Boolean(appConfig.isProduction || appConfig.alreadyOnGooglePlay || appConfig.productionWarning);
        const classification = classifyApp(id, configuredApps);
        const isExpo = Boolean(app.isExpo && !app.hasAndroid);
        if (isExpo) log({ type: 'expo-detected', message: `${id} is an Expo app` });
        if (app.hasAndroid) log({ type: 'android-detected', message: `${id} has Android` });

        // 1. Resolve credentials using the same save/recover/validate path used by builds.
        let ksList = detectKeystores(app.appRoot, id);
        let ksPresent = ksList.length > 0;
        const validationReport = resolveAndValidateCredentials(id, app.appRoot, {
            appConfig,
            keystorePath: ksList[0],
            updateConfig: true
        });
        let pwPresent = !!validationReport.passwordRecovered;
        let credentialsValidated = validationReport.ready;
        let validationError = validationReport.error;

        // 4. Derived State Mapping
        let credentialState = 'Missing Keystore';
        let safeMessage = '';

        if (isExpo && !app.hasAndroid) {
            credentialState = 'Needs Prebuild';
            safeMessage = 'Expo app detected. Native build requires prebuild.';
        } else if (credentialsValidated) {
            if (validationReport.passwordSource === 'generated' || appConfig.source === 'generated') {
                credentialState = 'Generated';
                safeMessage = 'Keystore generated and validated successfully.';
            } else {
                credentialState = 'Ready';
                safeMessage = 'Credentials validated and ready for build.';
            }
        } else if (ksPresent && !pwPresent) {
            credentialState = 'Needs Password';
            safeMessage = 'Keystore found but password source is missing.';
        } else if (!ksPresent && pwPresent) {
            credentialState = 'Missing Keystore';
            safeMessage = 'Password found but keystore is missing.';
        } else if (ksPresent && pwPresent && !credentialsValidated) {
            credentialState = validationReport.validationReason === 'Invalid Password' ? 'Invalid Password' : 'Invalid Keystore';
            safeMessage = validationError ? `Validation failed: ${validationError.substring(0, 120)}...` : 'Credentials found but failed validation.';
        } else if (isProduction && !credentialsValidated) {
            credentialState = 'Needs Password';
            safeMessage = 'Production app protected. Manual credential entry required.';
        }

        // 5. Version Resolution
        const versions = resolveAppVersion(app.appRoot);
        const playVersions = getPlayVersions();
        const lastPlayVersion = playVersions[id]?.versionCode || 0;

        discoveredMap.set(id, {
            id,
            displayName: app.pkg.displayName || app.pkg.name || id,
            appRoot: relAppRoot,
            packageName: appConfig.packageName || '',
            status,
            classification,
            isProduction,
            isExpo,
            hasAndroid: app.hasAndroid,
            keystoreFound: ksPresent,
            keystoreSource: ksPresent ? 'found' : 'missing',
            passwordSourceFound: pwPresent,
            passwordSource: validationReport.passwordSource || (pwPresent ? 'recovered' : 'missing'),
            credentialsValidated,
            credentialState,
            safeMessage,
            versionName: versions.versionName || '0.0.0',
            versionCode: versions.versionCode || 0,
            versionError: versions.versionError || null,
            lastPlayVersion: lastPlayVersion || ''
        });
    });

    return { workspaceRoot: root, discovered: Array.from(discoveredMap.values()) };
}

module.exports = scanWorkspace;
