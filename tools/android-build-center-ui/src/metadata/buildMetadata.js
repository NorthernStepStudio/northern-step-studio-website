const fs = require('fs');
const path = require('path');
const { readJson, writeJson } = require('../utils/jsonUtils');
const { parsePositiveInteger } = require('../utils/versionRules');

const METADATA_DIR = path.join(__dirname, '../../metadata');
const HISTORY_FILE = path.join(METADATA_DIR, 'build-history.json');
const PLAY_VERSIONS_FILE = path.join(METADATA_DIR, 'play-versions.json');
const LOGS_DIR = path.join(__dirname, '../../logs');

// Ensure metadata dir exists
if (!fs.existsSync(METADATA_DIR)) fs.mkdirSync(METADATA_DIR, { recursive: true });

function getBuildHistory() {
    const history = readJson(HISTORY_FILE, []);
    const logsAvailable = fs.existsSync(LOGS_DIR) ? new Set(fs.readdirSync(LOGS_DIR)) : new Set();
    return (history || [])
        .map((entry, index) => ({
            ...entry,
            id: entry.id || `build-${index}-${entry.timestamp || 'legacy'}`,
            logPath: entry.logPath || inferLegacyLogPath(entry, logsAvailable)
        }))
        .sort((a, b) => {
            const ta = new Date(a.timestamp || 0).getTime();
            const tb = new Date(b.timestamp || 0).getTime();
            return tb - ta;
        });
}

function inferLegacyLogPath(entry, logFiles) {
    if (!entry || !entry.appId || !entry.buildType || !entry.timestamp) return null;
    const stampDate = new Date(entry.timestamp);
    if (Number.isNaN(stampDate.getTime())) return null;

    const parts = [
        stampDate.getUTCFullYear(),
        String(stampDate.getUTCMonth() + 1).padStart(2, '0'),
        String(stampDate.getUTCDate()).padStart(2, '0'),
        String(stampDate.getUTCHours()).padStart(2, '0'),
        String(stampDate.getUTCMinutes()).padStart(2, '0'),
        String(stampDate.getUTCSeconds()).padStart(2, '0')
    ];
    const ts = `${parts[0]}-${parts[1]}-${parts[2]}-${parts[3]}-${parts[4]}-${parts[5]}`;
    const expectedPrefix = `${entry.appId}-${entry.buildType}-${ts}-`;
    for (const name of logFiles) {
        if (name.startsWith(expectedPrefix) && name.endsWith('.log')) {
            return path.join(LOGS_DIR, name);
        }
    }

    return null;
}

function addBuildToHistory(buildData) {
    const history = readJson(HISTORY_FILE, []);
    const entry = {
        id: buildData.id || `build-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...buildData,
        timestamp: buildData.timestamp || new Date().toISOString()
    };
    history.push(entry);
    // Keep last 300 builds
    while (history.length > 300) history.shift();
    writeJson(HISTORY_FILE, history);
    return entry;
}

function getBuildById(buildId) {
    if (!buildId) return null;
    return getBuildHistory().find((entry) => entry.id === buildId) || null;
}

function getPlayVersions() {
    const raw = readJson(PLAY_VERSIONS_FILE, {});
    const sanitized = {};
    Object.entries(raw || {}).forEach(([appId, entry]) => {
        const parsed = parsePositiveInteger(entry?.versionCode, 'Google Play versionCode');
        if (parsed.valid) {
            sanitized[appId] = {
                ...entry,
                versionCode: parsed.value
            };
        }
    });
    return sanitized;
}

function updatePlayVersion(appId, versionCode) {
    const parsed = parsePositiveInteger(versionCode, 'Google Play versionCode');
    if (!parsed.valid) {
        return { success: false, error: 'Google Play versionCode must be a positive integer.' };
    }

    const versions = getPlayVersions();
    versions[appId] = {
        versionCode: parsed.value,
        updatedAt: new Date().toISOString()
    };
    writeJson(PLAY_VERSIONS_FILE, versions);
    return { success: true, versionCode: parsed.value };
}

module.exports = { 
    getBuildHistory, 
    getBuildById,
    addBuildToHistory, 
    getPlayVersions, 
    updatePlayVersion 
};
