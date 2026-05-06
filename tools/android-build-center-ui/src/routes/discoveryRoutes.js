const express = require('express');
const router = express.Router();
const path = require('path');

const { WORKSPACE_ROOT } = require('../config/paths');
const pathToRunner = path.join(__dirname, '..', 'discovery', 'scanWorkspaceRunner.js');
const broadcaster = require('../utils/broadcaster');
const { updateAppVersion, resolveAppVersion } = require('../utils/versionResolver');
const { updatePlayVersion } = require('../metadata/buildMetadata');
const {
    resolveAndValidateCredentials,
    savePasswordForExistingKeystore,
    generateKeystoreForApp,
    generateUploadKeyForApp,
    confirmUploadKeyApproval,
    verifyCredentials
} = require('../credentials/credentialService');
const { parsePositiveInteger, bumpPatchVersionName, getNextVersionCode } = require('../utils/versionRules');

/**
 * GET /api/discovery/scan
 * Triggers a full workspace scan and returns discovered apps with their states.
 */
let currentScan = null;

router.get('/scan', (req, res) => {
    const { spawn } = require('child_process');

    // If a scan is already running, cancel it and start a new one
    if (currentScan && currentScan.child) {
        try {
            broadcaster.broadcast({ type: 'log', data: { timestamp: new Date().toISOString(), message: 'Previous scan canceled.' } });
            currentScan.child.kill();
        } catch (e) {}
        currentScan = null;
    }

    const child = spawn(process.execPath, [pathToRunner], { stdio: ['ignore', 'pipe', 'pipe'] });
    let timedOut = false;
    currentScan = { child, startedAt: Date.now(), timedOutRef: () => timedOut };

    const errors = [];
    let stdout = '';

    // Parse progress lines from stderr; runner emits SCAN_PROGRESS:JSON\n per event
    let stderrBuf = '';
    child.stderr.on('data', (chunk) => {
        stderrBuf += chunk.toString();
        const lines = stderrBuf.split(/\r?\n/);
        stderrBuf = lines.pop();
        for (const line of lines) {
            if (!line) continue;
            if (line.startsWith('SCAN_PROGRESS:')) {
                try {
                    const evt = JSON.parse(line.replace('SCAN_PROGRESS:', ''));
                    // Broadcast as log but keep messages concise
                    broadcaster.broadcast({ type: 'log', data: { timestamp: new Date().toISOString(), message: evt.message || evt.type } });
                } catch (e) {
                    // ignore malformed progress
                }
            } else {
                errors.push(line);
            }
        }
    });

    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });

    // timeout handling
    const timeoutMs = 60000; // 60s default
    const toId = setTimeout(() => {
        if (currentScan && currentScan.child === child) {
            timedOut = true;
            try { child.kill(); } catch (e) {}
            broadcaster.broadcast({ type: 'log', data: { timestamp: new Date().toISOString(), message: `Scan timed out after ${timeoutMs/1000} seconds.` } });
        }
    }, timeoutMs);

    child.on('close', (code) => {
        clearTimeout(toId);
        currentScan = null;
        try {
            if (timedOut) {
                return res.json({ ok: false, apps: [], count: 0, durationMs: Date.now() - (child.startedAt || Date.now()), errors: [`Scan timed out after ${timeoutMs/1000} seconds.`] });
            }
            const parsed = stdout ? JSON.parse(stdout) : null;
            if (!parsed || parsed.ok !== true) {
                const reason = (parsed && parsed.errors && parsed.errors.length) ? parsed.errors.join('; ') : (errors.join('; ') || 'Scan worker error');
                return res.json({ ok: false, apps: [], count: 0, durationMs: Date.now() - (child.startedAt || Date.now()), errors: [reason] });
            }
            // success
            return res.json({ ok: true, apps: parsed.apps || [], count: parsed.count || (parsed.apps?parsed.apps.length:0), durationMs: parsed.durationMs || 0, errors: [] });
        } catch (err) {
            return res.json({ ok: false, apps: [], count: 0, durationMs: 0, errors: ['Invalid JSON from scan worker'] });
        }
    });
});

/**
 * POST /api/discovery/generate-keystore
 * Explicitly generates a new keystore for a specific app following security rules.
 */
router.post('/generate-keystore', (req, res) => {
    const { id, appRoot, packageName } = req.body;
    if (!id || !appRoot) return res.status(400).json({ error: 'Missing id or appRoot' });

    const result = generateKeystoreForApp({ appId: id, appRoot, packageName });
    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }
    res.json(result);
});

/**
 * POST /api/discovery/generate-upload-key
 */
router.post('/generate-upload-key', (req, res) => {
    const { id, appRoot } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing id' });

    const result = generateUploadKeyForApp({ appId: id, appRoot });
    if (!result.success) return res.status(400).json({ error: result.error });
    res.json(result);
});

/**
 * POST /api/discovery/confirm-upload-approval
 */
router.post('/confirm-upload-approval', (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing id' });

    const result = confirmUploadKeyApproval(id);
    if (!result.success) return res.status(400).json({ error: result.error });
    res.json(result);
});

router.post('/open-folder', (req, res) => {
    const { path: filePath } = req.body;
    const { exec } = require('child_process');
    if (!filePath) return res.status(400).json({ error: 'Missing path' });
    
    // Safety check: only open folders within Northern Step Studio or NStep private storage
    const isStudio = filePath.includes('Northern Step Studio');
    const isNStep = filePath.includes('NStep');
    if (!isStudio && !isNStep) return res.status(403).json({ error: 'Access denied' });

    exec(`explorer.exe /select,"${filePath.replace(/\//g, '\\')}"`);
    res.json({ success: true });
});

/**
 * POST /api/discovery/bump-version
 */
router.post('/bump-version', (req, res) => {
    const { id, appRoot } = req.body;
    if (!id || !appRoot) return res.status(400).json({ error: 'Missing id or appRoot' });

    const absoluteRoot = path.isAbsolute(appRoot) ? appRoot : path.join(WORKSPACE_ROOT, appRoot);
    const current = resolveAppVersion(absoluteRoot);
    if (current.versionError) {
        return res.status(400).json({ error: current.versionError });
    }
    const playVersions = require('../metadata/buildMetadata').getPlayVersions();
    const lastPlayCode = playVersions[id]?.versionCode || 0;
    const nextVersionCode = getNextVersionCode(current.versionCode || 0, lastPlayCode);
    const nextVersionName = bumpPatchVersionName(current.versionName || '1.0.0');
    const result = updateAppVersion(absoluteRoot, nextVersionName, nextVersionCode);

    if (result.success) {
        res.json({
            success: true,
            message: `Version updated in ${result.file}`,
            versionName: nextVersionName,
            versionCode: nextVersionCode
        });
    } else {
        res.status(400).json({ error: result.error });
    }
});

/**
 * POST /api/discovery/update-play-version
 */
router.post('/update-play-version', (req, res) => {
    const { id, versionCode } = req.body;
    if (!id || versionCode === undefined) return res.status(400).json({ error: 'Missing id or versionCode' });

    const parsed = parsePositiveInteger(versionCode, 'Google Play versionCode');
    if (!parsed.valid) return res.status(400).json({ error: 'Google Play versionCode must be a positive integer.' });

    const result = updatePlayVersion(id, parsed.value);
    if (!result.success) return res.status(400).json({ error: result.error });
    res.json({ success: true, versionCode: parsed.value });
});

router.post('/resolve-credentials', (req, res) => {
    const { id, appRoot } = req.body;
    if (!id || !appRoot) return res.status(400).json({ error: 'Missing id or appRoot' });
    const report = resolveAndValidateCredentials(id, appRoot, { updateConfig: true });
    res.json(report);
});

router.post('/save-existing-password', (req, res) => {
    const { id, appRoot, keystorePassword } = req.body;
    if (!id || !appRoot || !keystorePassword) return res.status(400).json({ error: 'Missing id, appRoot, or keystorePassword' });
    const result = savePasswordForExistingKeystore({ appId: id, appRoot, keystorePassword });
    if (!result.success) return res.status(400).json({ error: result.error });
    res.json(result);
});

/**
 * POST /api/discovery/verify-credentials
 * Comprehensive audit of credentials for an app.
 */
router.post('/verify-credentials', (req, res) => {
    const { id, appRoot } = req.body;
    if (!id || !appRoot) return res.status(400).json({ error: 'Missing id or appRoot' });

    res.json(verifyCredentials(id, appRoot));
});

module.exports = router;
