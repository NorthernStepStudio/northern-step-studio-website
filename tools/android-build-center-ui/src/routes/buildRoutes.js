const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const { WORKSPACE_ROOT, APPS_JSON_PATH, SCRIPTS, LOGS_DIR } = require('../config/paths');
const { readJson } = require('../utils/jsonUtils');
const { setCredential } = require('../credentials/sessionVault');
const { savePasswordForExistingKeystore } = require('../credentials/credentialService');
const { saveToWCM } = require('../credentials/windowsCredentialManager');
const { startBuild, cancelBuild, getBuildStatus, getLogs, clearLogs } = require('../builds/buildRunner');
const { getBuildHistory, getBuildById } = require('../metadata/buildMetadata');

let broadcastHandler = () => {};
router.setBroadcast = (fn) => { broadcastHandler = fn; };

router.get('/status', (req, res) => {
    const status = getBuildStatus();
    const resetDir = path.join(WORKSPACE_ROOT, 'private-keys', 'android', `${status.currentApp || ''}-reset`);
    res.json({ ...status, hasResetKey: fs.existsSync(resetDir) });
});

router.get('/logs', (req, res) => {
    res.json(getLogs());
});

router.get('/history', (req, res) => {
    const appId = String(req.query.appId || '').trim();
    const history = getBuildHistory();
    const filtered = appId ? history.filter((entry) => entry.appId === appId) : history;
    res.json({
        builds: filtered.map((entry) => ({
            id: entry.id,
            appId: entry.appId,
            buildType: entry.buildType,
            status: entry.status,
            versionName: entry.versionName,
            versionCode: entry.versionCode,
            artifactPath: entry.artifactPath,
            errorSummary: entry.errorSummary || null,
            hasLog: Boolean(entry.logPath),
            timestamp: entry.timestamp,
            startedAt: entry.startedAt || null,
            endedAt: entry.endedAt || null,
            elapsedMs: entry.elapsedMs || null
        }))
    });
});

router.get('/history/:buildId/logs', (req, res) => {
    const buildId = String(req.params.buildId || '').trim();
    const entry = getBuildById(buildId);
    if (!entry) return res.status(404).json({ error: 'Build history entry not found.' });
    if (!entry.logPath) return res.status(404).json({ error: 'No saved log file for this build.' });

    const resolvedPath = path.resolve(entry.logPath);
    const logsRoot = path.resolve(LOGS_DIR);
    if (!resolvedPath.toLowerCase().startsWith(logsRoot.toLowerCase())) {
        return res.status(403).json({ error: 'Log path is outside the allowed logs directory.' });
    }
    if (!fs.existsSync(resolvedPath)) {
        return res.status(404).json({ error: 'Saved log file no longer exists on disk.' });
    }

    const raw = fs.readFileSync(resolvedPath, 'utf8');
    const lines = raw.split(/\r?\n/);
    const dividerIndex = lines.findIndex((line) => line.trim() === '---');
    const logLines = dividerIndex >= 0 ? lines.slice(dividerIndex + 1) : lines;
    const parsed = [];

    for (const line of logLines) {
        if (!line.trim()) continue;
        const match = line.match(/^\[(.*?)\]\s+\[([A-Z]+)\]\s+(.*)$/);
        if (match) {
            parsed.push({
                timestamp: match[1],
                source: match[2].toLowerCase(),
                message: match[3]
            });
        }
    }

    res.json({
        build: {
            id: entry.id,
            appId: entry.appId,
            buildType: entry.buildType,
            status: entry.status,
            versionName: entry.versionName,
            versionCode: entry.versionCode,
            artifactPath: entry.artifactPath,
            errorSummary: entry.errorSummary || null,
            timestamp: entry.timestamp
        },
        logs: parsed,
        raw
    });
});

router.post('/clear', (req, res) => {
    clearLogs();
    res.json({ success: true });
});

router.post('/start', (req, res) => {
    const { appName, buildType } = req.body;

    if (!appName || !buildType) {
        return res.status(400).json({ error: 'Missing appName or buildType', step: 1 });
    }
    if (!['apk', 'aab'].includes(buildType)) {
        return res.status(400).json({ error: `Invalid buildType '${buildType}'. Must be 'apk' or 'aab'.`, step: 1 });
    }

    const scriptPath = buildType === 'apk' ? SCRIPTS.BUILD_APK : SCRIPTS.BUILD_AAB;
    if (!fs.existsSync(scriptPath)) {
        return res.status(500).json({ error: `Build script not found: ${scriptPath}`, step: 1 });
    }

    const result = startBuild(appName, buildType, scriptPath, {
        ...process.env,
        EXPO_USE_METRO_WORKSPACE_ROOT: '1'
    }, broadcastHandler);

    if (result.error) return res.status(400).json({ ...result, step: result.step || 1 });
    res.json({ message: 'Build started', app: appName, type: buildType });
});

router.post('/cancel', (req, res) => {
    const result = cancelBuild(broadcastHandler);
    if (result.error) return res.status(400).json(result);
    res.json({ message: 'Cancellation requested' });
});

router.post('/validate', (req, res) => {
    const { appName, keystorePassword } = req.body;
    if (!appName || !keystorePassword) return res.status(400).json({ error: 'Missing appName or password' });

    const apps = readJson(APPS_JSON_PATH);
    const app = apps[appName];
    if (!app) return res.status(404).json({ error: 'App not found' });

    const result = savePasswordForExistingKeystore({
        appId: appName,
        appRoot: app.path,
        keystorePassword
    });

    if (!result.success) return res.status(400).json({ error: result.error });
    res.json({ success: true, message: result.message, report: result.report });
});

router.post('/secrets', (req, res) => {
    const { appName, keystorePassword, remember } = req.body;
    if (!appName || !keystorePassword) return res.status(400).json({ error: 'Missing appName or password' });

    setCredential(appName, { keystorePassword, keyPassword: keystorePassword });
    if (remember) {
        const saved = saveToWCM(appName, keystorePassword, keystorePassword);
        if (!saved.success) return res.status(400).json({ error: saved.error });
    }
    res.json({ success: true });
});

module.exports = router;
