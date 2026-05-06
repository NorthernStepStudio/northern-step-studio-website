const fs = require('fs');
const path = require('path');

const { APPS_JSON_PATH, WORKSPACE_ROOT } = require('../config/paths');
const { readJson, writeJson } = require('../utils/jsonUtils');
const { canonicalAppId, getCredentialLookupIds, getKeystoreResourceKey } = require('../utils/idUtils');
const { resolveCredentials } = require('./credentialResolver');
const { setCredential, getCredential } = require('./sessionVault');
const { saveToWCM, recoverFromWCM, deleteFromWCM } = require('./windowsCredentialManager');
const { validateKeystoreWithPassword } = require('./credentialValidator');
const { generateKeystore, generateUploadKey } = require('./keystoreGenerator');
const {
    getCredentialManifestEntry,
    updateCredentialManifest,
    getPrivateKeystorePath
} = require('./credentialManifest');

function absoluteFromWorkspace(filePath) {
    if (!filePath) return null;
    return path.isAbsolute(filePath) ? filePath : path.join(WORKSPACE_ROOT, filePath);
}

function publicPathForConfig(filePath) {
    return filePath;
}

function resolveAppRecord(appId) {
    const apps = readJson(APPS_JSON_PATH);
    const appConfig = apps[appId] || {};
    return { apps, appConfig };
}

function resolveAppRoot(appRoot, appConfig = {}) {
    const configuredRoot = appRoot || appConfig.path || '';
    return configuredRoot
        ? (path.isAbsolute(configuredRoot) ? configuredRoot : path.join(WORKSPACE_ROOT, configuredRoot))
        : null;
}

function resolveKeystorePath(appId, appRoot, appConfig = {}, providedKeystorePath) {
    const candidates = [
        providedKeystorePath,
        appConfig.keystorePath,
        getCredentialManifestEntry(appId)?.keystorePath
    ].filter(Boolean);

    for (const candidate of candidates) {
        const absolutePath = absoluteFromWorkspace(candidate);
        if (absolutePath && fs.existsSync(absolutePath)) {
            return absolutePath;
        }
    }

    return candidates[0] ? absoluteFromWorkspace(candidates[0]) : null;
}

function normalizeValidationError(validation) {
    if (!validation) return 'Keystore validation failed.';
    if (validation.reason === 'Invalid Password') return `Invalid Password: ${validation.error}`;
    if (validation.reason === 'Invalid Keystore') return `Invalid Keystore: ${validation.error}`;
    if (validation.reason === 'Invalid Alias') return `Invalid Alias: ${validation.error}`;
    return validation.error || validation.reason || 'Keystore validation failed.';
}

function persistPublicCredentialMetadata(appId, appConfig, updates) {
    const { apps } = resolveAppRecord(appId);
    apps[appId] = {
        ...(apps[appId] || appConfig || {}),
        ...updates
    };
    writeJson(APPS_JSON_PATH, apps);
    return apps[appId];
}

function buildLookupContext(appId, appRoot, appConfig) {
    return {
        appRoot,
        path: appConfig.path,
        configPath: appConfig.path,
        packageName: appConfig.packageName,
        candidateAppIds: getCredentialLookupIds(appId, {
            appRoot,
            path: appConfig.path,
            packageName: appConfig.packageName
        })
    };
}

function resolveAndValidateCredentials(appId, appRoot, options = {}) {
    const { apps, appConfig } = resolveAppRecord(appId);
    const absoluteAppRoot = resolveAppRoot(appRoot, appConfig);
    const keystorePath = resolveKeystorePath(appId, absoluteAppRoot, appConfig, options.keystorePath);
    const lookupContext = buildLookupContext(appId, absoluteAppRoot, appConfig);
    const credentials = resolveCredentials(appId, absoluteAppRoot, {
        appConfig,
        candidateAppIds: lookupContext.candidateAppIds
    });

    const report = {
        appSelected: Boolean(appId),
        appId,
        canonicalAppId: canonicalAppId(appId),
        appRoot: absoluteAppRoot,
        keystorePath,
        keystoreExists: Boolean(keystorePath && fs.existsSync(keystorePath)),
        credentialKeyName: getKeystoreResourceKey(appId),
        passwordSource: credentials?.source || 'missing',
        passwordRecovered: Boolean(credentials?.keystorePassword),
        sessionVaultLoaded: Boolean(getCredential(appId)?.keystorePassword),
        keytoolValid: false,
        gradleSigningConfigReady: false,
        keyAlias: credentials?.keyAlias || appConfig.keyAlias || null,
        ready: false,
        error: null
    };

    if (!report.keystoreExists) {
        report.error = keystorePath ? `Keystore file not found: ${keystorePath}` : 'Keystore path is missing.';
        return report;
    }

    if (!credentials?.keystorePassword) {
        report.error = 'Keystore password is missing. Use Save Password for Existing Keystore.';
        return report;
    }

    const validation = validateKeystoreWithPassword(
        keystorePath,
        credentials.keystorePassword,
        credentials.keyAlias || appConfig.keyAlias || null
    );

    report.keytoolValid = validation.isValid;
    report.validationReason = validation.reason || null;
    report.aliases = validation.aliases || [];
    if (!validation.isValid) {
        report.error = normalizeValidationError(validation);
        return report;
    }

    const resolvedAlias = validation.keyAlias || credentials.keyAlias || appConfig.keyAlias || report.aliases[0] || null;
    if (!resolvedAlias) {
        report.error = 'Keytool validation passed but no key alias was found.';
        return report;
    }

    const loadedCredentials = {
        keystorePassword: credentials.keystorePassword,
        keyPassword: credentials.keyPassword || credentials.keystorePassword,
        keyAlias: resolvedAlias,
        source: credentials.source || 'session',
        credentialKeyName: credentials.credentialKeyName
    };
    setCredential(appId, loadedCredentials);

    report.sessionVaultLoaded = Boolean(getCredential(appId)?.keystorePassword);
    report.keyAlias = resolvedAlias;
    report.gradleSigningConfigReady = Boolean(report.sessionVaultLoaded && resolvedAlias && appConfig.keystoreFileName !== '');
    report.ready = Boolean(report.keytoolValid && report.sessionVaultLoaded && resolvedAlias);
    report.passwordSource = loadedCredentials.source;
    report.error = null;

    if (options.updateConfig !== false) {
        const nextConfig = {
            ...(apps[appId] || appConfig),
            path: appConfig.path || (absoluteAppRoot ? path.relative(WORKSPACE_ROOT, absoluteAppRoot).replace(/\\/g, '/') : appConfig.path),
            keystorePath: publicPathForConfig(appConfig.keystorePath || options.keystorePath || keystorePath),
            keystoreFileName: appConfig.keystoreFileName || path.basename(keystorePath),
            keyAlias: resolvedAlias
        };
        persistPublicCredentialMetadata(appId, appConfig, nextConfig);
    }

    return report;
}

function savePasswordForExistingKeystore({ appId, appRoot, keystorePassword }) {
    if (!appId) return { success: false, error: 'App is not selected.' };
    if (!keystorePassword || String(keystorePassword).trim() === '') {
        return { success: false, error: 'Keystore password is required.' };
    }

    const { appConfig } = resolveAppRecord(appId);
    const absoluteAppRoot = resolveAppRoot(appRoot, appConfig);
    const keystorePath = resolveKeystorePath(appId, absoluteAppRoot, appConfig);
    if (!keystorePath || !fs.existsSync(keystorePath)) {
        return { success: false, error: `Keystore file not found: ${keystorePath || 'missing path'}` };
    }

    const saveResult = saveToWCM(appId, keystorePassword, keystorePassword);
    if (!saveResult.success) {
        return { success: false, error: `PasswordVault save failed: ${saveResult.error}` };
    }

    const recovered = recoverFromWCM(appId, { candidateAppIds: [canonicalAppId(appId)] });
    if (!recovered?.keystorePassword) {
        return { success: false, error: 'PasswordVault recover failed after save.' };
    }

    const validation = validateKeystoreWithPassword(
        keystorePath,
        recovered.keystorePassword,
        appConfig.keyAlias || null
    );

    if (!validation.isValid) {
        deleteFromWCM(appId);
        return { success: false, error: normalizeValidationError(validation) };
    }

    const keyAlias = validation.keyAlias || appConfig.keyAlias || validation.aliases?.[0];
    setCredential(appId, {
        keystorePassword: recovered.keystorePassword,
        keyPassword: recovered.keyPassword || recovered.keystorePassword,
        keyAlias,
        source: 'machine-secure-store',
        credentialKeyName: recovered.credentialKeyName
    });

    try {
        updateCredentialManifest(appId, {
            keystorePath,
            alias: keyAlias,
            credentialKeyName: recovered.credentialKeyName || saveResult.keystoreKey,
            source: 'existing-keystore'
        });

        persistPublicCredentialMetadata(appId, appConfig, {
            ...appConfig,
            keystorePath: appConfig.keystorePath || keystorePath,
            keystoreFileName: appConfig.keystoreFileName || path.basename(keystorePath),
            keyAlias
        });
    } catch (error) {
        return { success: false, error: `Credential manifest update failed: ${error.message}` };
    }

    const finalReport = resolveAndValidateCredentials(appId, absoluteAppRoot, { updateConfig: true });
    if (!finalReport.ready) {
        return { success: false, error: finalReport.error || 'Session vault load failed after validation.' };
    }

    return {
        success: true,
        message: 'Password saved, recovered, validated, and loaded into session vault.',
        report: finalReport
    };
}

function generateKeystoreForApp({ appId, appRoot, packageName }) {
    if (!appId) return { success: false, error: 'App is not selected.' };

    const { appConfig } = resolveAppRecord(appId);
    const absoluteAppRoot = resolveAppRoot(appRoot, appConfig);
    const isProduction = Boolean(appConfig.isProduction || appConfig.alreadyOnGooglePlay || appConfig.productionWarning);
    if (isProduction) {
        return { success: false, error: `Production app '${appId}' is protected. Generate a new upload key only through the Play Console reset flow.` };
    }

    const keystorePath = getPrivateKeystorePath(appId);
    if (fs.existsSync(keystorePath)) {
        return { success: false, error: `Keystore already exists at ${keystorePath}. Use Save Password for Existing Keystore or Verify Credentials.` };
    }

    const keyAlias = `${canonicalAppId(appId)}-upload`;
    const generated = generateKeystore({ id: appId, keystorePath, keyAlias });
    if (!generated.success) {
        return { success: false, error: generated.reason || generated.error || 'Keytool generation failed.' };
    }

    if (!fs.existsSync(keystorePath)) {
        return { success: false, error: 'Keytool reported success but the keystore file does not exist.' };
    }

    const saveResult = saveToWCM(appId, generated.storePassword, generated.keyPassword);
    if (!saveResult.success) {
        return { success: false, error: `PasswordVault save failed: ${saveResult.error}` };
    }

    const recovered = recoverFromWCM(appId, { candidateAppIds: [canonicalAppId(appId)] });
    if (!recovered?.keystorePassword) {
        return { success: false, error: 'PasswordVault recover failed after generated credential save.' };
    }

    const validation = validateKeystoreWithPassword(keystorePath, recovered.keystorePassword, keyAlias);
    if (!validation.isValid) {
        return { success: false, error: normalizeValidationError(validation) };
    }

    const sessionCredentials = {
        keystorePassword: recovered.keystorePassword,
        keyPassword: recovered.keyPassword || generated.keyPassword || recovered.keystorePassword,
        keyAlias,
        source: 'generated',
        credentialKeyName: recovered.credentialKeyName || saveResult.keystoreKey
    };
    setCredential(appId, sessionCredentials);

    try {
        updateCredentialManifest(appId, {
            keystorePath,
            alias: keyAlias,
            credentialKeyName: sessionCredentials.credentialKeyName,
            source: 'generated'
        });

        persistPublicCredentialMetadata(appId, appConfig, {
            ...appConfig,
            path: appConfig.path || (absoluteAppRoot ? path.relative(WORKSPACE_ROOT, absoluteAppRoot).replace(/\\/g, '/') : appConfig.path),
            keystorePath,
            keystoreFileName: 'upload-keystore.jks',
            keyAlias,
            packageName: packageName || appConfig.packageName || '',
            classification: appConfig.classification || 'private'
        });
    } catch (error) {
        return { success: false, error: `Credential manifest update failed: ${error.message}` };
    }

    const finalReport = resolveAndValidateCredentials(appId, absoluteAppRoot, { updateConfig: true });
    if (!finalReport.ready) {
        return { success: false, error: finalReport.error || 'Generated credentials did not load into the session vault.' };
    }

    return {
        success: true,
        message: 'Keystore generated, saved, recovered, validated, and loaded into session vault.',
        report: finalReport
    };
}

function verifyCredentials(appId, appRoot) {
    const { appConfig } = resolveAppRecord(appId);
    const absoluteAppRoot = resolveAppRoot(appRoot, appConfig);
    const passwordVaultCredentials = recoverFromWCM(appId, buildLookupContext(appId, absoluteAppRoot, appConfig));
    const report = resolveAndValidateCredentials(appId, appRoot, { updateConfig: true });
    return {
        appSelected: report.appSelected,
        canonicalAppId: report.canonicalAppId,
        keystorePathExists: report.keystoreExists,
        credentialKeyName: report.credentialKeyName,
        passwordVaultRecoverSuccess: Boolean(passwordVaultCredentials?.keystorePassword),
        keytoolValidationSuccess: report.keytoolValid,
        sessionVaultLoaded: report.sessionVaultLoaded,
        gradleSigningConfigReady: report.gradleSigningConfigReady,
        keyAlias: report.keyAlias,
        passwordSource: report.passwordSource,
        error: report.error
    };
}

function generateUploadKeyForApp({ appId, appRoot }) {
    if (!appId) return { success: false, error: 'App is not selected.' };
    const { appConfig } = resolveAppRecord(appId);
    
    // 1. Generate local keystore and export certificate
    const result = generateUploadKey(appId);
    if (!result.success) return result;

    // 2. Save password to Windows PasswordVault
    const saveResult = saveToWCM(appId, result.password, result.password);
    if (!saveResult.success) {
        return { success: false, error: `PasswordVault save failed: ${saveResult.error}` };
    }

    // 3. Mark app as Pending Reset in apps.json
    persistPublicCredentialMetadata(appId, appConfig, {
        ...appConfig,
        credentialState: 'Pending Google Play Upload Key Reset',
        keystorePath: result.keystorePath,
        keystoreFileName: path.basename(result.keystorePath),
        uploadCertificatePath: result.certPath,
        keyAlias: result.alias
    });

    // 4. Update manifest for internal tracking
    updateCredentialManifest(appId, {
        keystorePath: result.keystorePath,
        alias: result.alias,
        credentialKeyName: saveResult.keystoreKey,
        source: 'local-vault-pending'
    });

    return {
        success: true,
        message: 'Upload keystore generated and certificate exported.',
        keystorePath: result.keystorePath,
        certPath: result.certPath,
        instruction: 'Upload the certificate (.pem) to Google Play Console and wait for approval.'
    };
}

function confirmUploadKeyApproval(appId) {
    if (!appId) return { success: false, error: 'App is not selected.' };
    const { appConfig } = resolveAppRecord(appId);

    // 1. Recover and validate
    const recovered = recoverFromWCM(appId, { candidateAppIds: [canonicalAppId(appId)] });
    if (!recovered?.keystorePassword) {
        return { success: false, error: 'Failed to recover passwords from vault.' };
    }

    const keystorePath = appConfig.keystorePath;
    if (!fs.existsSync(keystorePath)) {
        return { success: false, error: `Keystore file not found at ${keystorePath}` };
    }

    const validation = validateKeystoreWithPassword(keystorePath, recovered.keystorePassword, appConfig.keyAlias || 'upload');
    if (!validation.isValid) {
        return { success: false, error: `Local keystore validation failed: ${validation.error}` };
    }

    // 2. Clear pending state
    persistPublicCredentialMetadata(appId, appConfig, {
        ...appConfig,
        credentialState: 'Ready',
        ready: true
    });

    // 3. Update manifest
    updateCredentialManifest(appId, {
        ...getCredentialManifestEntry(appId),
        source: 'local-vault'
    });

    // 4. Load session
    setCredential(appId, {
        keystorePassword: recovered.keystorePassword,
        keyPassword: recovered.keyPassword || recovered.keystorePassword,
        keyAlias: appConfig.keyAlias || 'upload',
        source: 'local-vault',
        credentialKeyName: recovered.credentialKeyName
    });

    return { success: true, message: 'Upload key confirmed and loaded into session vault.' };
}

module.exports = {
    absoluteFromWorkspace,
    resolveKeystorePath,
    resolveAndValidateCredentials,
    savePasswordForExistingKeystore,
    generateKeystoreForApp,
    generateUploadKeyForApp,
    confirmUploadKeyApproval,
    verifyCredentials,
    normalizeValidationError
};
