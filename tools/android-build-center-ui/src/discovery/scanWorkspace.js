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

function normalizeRelPath(value) {
    return String(value || '').replace(/\\/g, '/').replace(/\/+$/, '');
}

function isHiddenAppConfig(config) {
    return Boolean(config && (config.hidden || config.excludeFromBuildCenter));
}

/**
 * Orchestrates the workspace scanning logic with hardened security guards and deduplication.
 */
function scanWorkspace(logger = console.log) {
    const root = WORKSPACE_ROOT;
    logger({ type: 'info', message: `Scanning workspace at: ${root}` });
    
    const appsFound = findApps(root);
    logger({ type: 'info', message: `Found ${appsFound.length} potential project roots.` });
    
    const allConfiguredApps = readJson(APPS_JSON_PATH);
    const hiddenPaths = new Set(
        Object.values(allConfiguredApps)
            .filter(isHiddenAppConfig)
            .map(app => normalizeRelPath(app.path))
            .filter(Boolean)
    );
    const configuredApps = Object.fromEntries(
        Object.entries(allConfiguredApps).filter(([, app]) => !isHiddenAppConfig(app))
    );
    const discoveredMap = new Map();

    appsFound.forEach(app => {
        const relAppRoot = normalizeRelPath(path.relative(root, app.appRoot));
        if (hiddenPaths.has(relAppRoot)) {
            logger({ type: 'log', message: `Skipping hidden app at ${relAppRoot}.` });
            return;
        }
        
        // ID Generation: Priority 1: Existing ID in apps.json, 2: package name, 3: folder name
        let id = app.pkg.name ? app.pkg.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() : path.basename(app.appRoot);
        
        // Match existing config by path to preserve ID
        let status = 'new';
        let existingKey = Object.keys(configuredApps).find(k => normalizeRelPath(configuredApps[k].path) === relAppRoot);
        if (existingKey) {
            status = 'configured';
            id = existingKey;
        } else if (configuredApps[id]) {
            // Configured build targets are canonical. Skip same-package stray roots.
            if (normalizeRelPath(configuredApps[id].path) !== relAppRoot) {
                logger({ type: 'log', message: `Skipping duplicate app '${id}' at ${relAppRoot}; configured target is ${configuredApps[id].path}.` });
                return;
            } else {
                status = 'configured';
            }
        }

        // Deduplication
        if (discoveredMap.has(id)) {
            const existing = discoveredMap.get(id);
            // If current is configured but existing is not, replace it
            if (status === 'configured' && existing.status !== 'configured') {
                logger({ type: 'log', message: `Dedupe: Replacing ${id} with configured version at ${relAppRoot}` });
            } else {
                return;
            }
        }

        logger({ type: 'log', message: `Analyzing ${id} at ${relAppRoot}...` });

        try {
            const appConfig = configuredApps[id] || {};
            const isProduction = Boolean(appConfig.isProduction || appConfig.alreadyOnGooglePlay);
            const classification = classifyApp(id, configuredApps);
            const isExpo = Boolean(app.isExpo && !app.hasAndroid);

            // 1. Resolve credentials
            let ksList = detectKeystores(app.appRoot, id);
            let ksPresent = ksList.length > 0;
            
            // We use a safe version of validation that doesn't crash the scan
            let validationReport = { ready: false, error: 'Not validated during scan' };
            try {
                validationReport = resolveAndValidateCredentials(id, app.appRoot, {
                    appConfig,
                    keystorePath: appConfig.keystorePath ? undefined : ksList[0],
                    updateConfig: false // Don't persist during scan to avoid race conditions
                });
            } catch (vErr) {
                logger({ type: 'error', message: `Credential validation failed for ${id}: ${vErr.message}` });
            }

            let pwPresent = !!validationReport.passwordRecovered;
            let credentialsValidated = validationReport.ready;
            let validationError = validationReport.error;

            // 2. Derived State Mapping
            let credentialState = 'Missing Keystore';
            let safeMessage = '';

            if (isExpo && !app.hasAndroid) {
                credentialState = 'Needs Prebuild';
                safeMessage = 'Expo app detected. Native build requires prebuild.';
            } else if (credentialsValidated) {
                credentialState = 'Ready';
                safeMessage = 'Credentials validated and ready for build.';
            } else if (ksPresent && !pwPresent) {
                credentialState = 'Needs Password';
                safeMessage = 'Keystore found but password source is missing.';
            } else if (ksPresent && pwPresent && !credentialsValidated) {
                credentialState = validationReport.validationReason === 'Invalid Password' ? 'Invalid Password' : 'Invalid Keystore';
                safeMessage = validationError ? `Validation failed: ${validationError.substring(0, 60)}...` : 'Credentials found but failed validation.';
            } else if (isProduction && !credentialsValidated) {
                credentialState = 'Needs Password';
                safeMessage = 'Production app protected. Manual credential entry required.';
            } else if (!ksPresent) {
                credentialState = 'Missing Keystore';
                safeMessage = 'No keystore found in project or local storage.';
            }

            // 3. Version Resolution
            const versions = resolveAppVersion(app.appRoot);
            const playVersions = getPlayVersions();
            const lastPlayVersion = playVersions[id]?.versionCode || 0;

            discoveredMap.set(id, {
                id,
                displayName: appConfig.displayName || app.pkg.displayName || app.pkg.name || id,
                appRoot: relAppRoot,
                packageName: appConfig.packageName || '',
                status,
                classification,
                isProduction,
                isExpo,
                hasAndroid: app.hasAndroid,
                keystoreFound: ksPresent,
                passwordSourceFound: pwPresent,
                passwordSource: validationReport.passwordSource || 'missing',
                credentialsValidated,
                credentialState,
                safeMessage,
                versionName: versions.versionName || '0.0.0',
                versionCode: versions.versionCode || 0,
                lastPlayVersion: lastPlayVersion || ''
            });
        } catch (appErr) {
            logger({ type: 'error', message: `Failed to process app ${id}: ${appErr.message}` });
        }
    });

    logger({ type: 'info', message: `Scan complete: ${discoveredMap.size} apps found.` });
    return { workspaceRoot: root, discovered: Array.from(discoveredMap.values()) };
}

module.exports = scanWorkspace;
