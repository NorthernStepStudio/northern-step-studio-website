const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { APPS_JSON_PATH, WORKSPACE_ROOT } = require('../config/paths');
const { readJson } = require('../utils/jsonUtils');
const { detectSecrets } = require('../discovery/discoveryHelpers');
const { setCredential, getCredential } = require('../credentials/sessionVault');
const { loadSettings, saveSettings } = require('../config/settings');
const { saveToWCM } = require('../credentials/windowsCredentialManager');

router.get('/apps', (req, res) => {
    try {
        const raw = readJson(APPS_JSON_PATH) || {};
        const normalized = {};

        Object.keys(raw).forEach(key => {
            const item = Object.assign({}, raw[key]);
            if (item.hidden || item.excludeFromBuildCenter) return;

            // detect reset key presence
            const resetDir = path.join(WORKSPACE_ROOT, 'private-keys', 'android', `${key}-reset`);
            item.hasResetKey = fs.existsSync(resetDir);

            // Try to seed session vault if secrets discovered on disk
            const appRoot = path.join(WORKSPACE_ROOT, item.path || '');
            const detected = detectSecrets(appRoot);
            if (detected && !getCredential(key)) {
                setCredential(key, detected);
            }

            // Normalize local API fields with safe defaults
            const classification = item.classification || 'unknown';
            const credentialState = item.credentialState || 'missing';
            const safeMessage = item.safeMessage || 'Run Scan Workspace to discover credential state.';
            const keystoreFound = !!item.keystoreFound;
            const passwordSourceFound = !!item.passwordSourceFound;
            const credentialsLoaded = !!item.credentialsLoaded;
            const credentialsValidated = !!item.credentialsValidated;
            const alreadyOnGooglePlay = !!item.alreadyOnGooglePlay;
            const productionWarning = !!item.productionWarning;
            const isProduction = !!(item.isProduction || alreadyOnGooglePlay || productionWarning);
            const readiness = item.readiness || (item.readyToBuild ? 'Ready' : 'Unknown');
            const warnings = Array.isArray(item.warnings) ? item.warnings : [];
            const nextActions = Array.isArray(item.nextActions) ? item.nextActions : ['scan'];

            normalized[key] = Object.assign({}, item, {
                classification,
                credentialState,
                safeMessage,
                keystoreFound,
                passwordSourceFound,
                credentialsLoaded,
                credentialsValidated,
                alreadyOnGooglePlay,
                productionWarning,
                isProduction,
                readiness,
                warnings,
                nextActions
            });
        });

        res.json(normalized);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read apps.json' });
    }
});

router.get('/secrets', (req, res) => {
    // Return placeholder or indicators, never full passwords in bulk
    const vault = require('../credentials/sessionVault').getVault();
    const result = {};
    Object.keys(vault).forEach(k => { result[k] = { loaded: true }; });
    res.json(result);
});

router.post('/secrets/save', (req, res) => {
    const { appName, keystorePassword, keyPassword, remember } = req.body;
    if (!appName) return res.status(400).json({ error: 'Missing appName' });

    setCredential(appName, { keystorePassword, keyPassword });

    if (remember) {
        const saved = saveToWCM(appName, keystorePassword, keyPassword);
        if (!saved.success) return res.status(400).json({ error: saved.error });
    }
    res.json({ success: true });
});

router.get('/settings', (req, res) => {
    res.json(loadSettings());
});

router.post('/settings', (req, res) => {
    const current = loadSettings();
    if (req.body.autoGenerateForPrivateApps !== undefined) {
        current.autoGenerateForPrivateApps = !!req.body.autoGenerateForPrivateApps;
    }
    saveSettings(current);
    res.json({ success: true, settings: current });
});

module.exports = router;
