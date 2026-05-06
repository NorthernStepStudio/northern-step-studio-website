const fs = require('fs');
const path = require('path');
const { readJson, writeJson } = require('../utils/jsonUtils');
const { parsePositiveInteger } = require('../utils/versionRules');

const METADATA_DIR = path.join(__dirname, '../../metadata');
const HISTORY_FILE = path.join(METADATA_DIR, 'build-history.json');
const PLAY_VERSIONS_FILE = path.join(METADATA_DIR, 'play-versions.json');

// Ensure metadata dir exists
if (!fs.existsSync(METADATA_DIR)) fs.mkdirSync(METADATA_DIR, { recursive: true });

function getBuildHistory() {
    return readJson(HISTORY_FILE, []);
}

function addBuildToHistory(buildData) {
    const history = getBuildHistory();
    history.push({
        ...buildData,
        timestamp: new Date().toISOString()
    });
    // Keep last 100 builds
    if (history.length > 100) history.shift();
    writeJson(HISTORY_FILE, history);
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
    addBuildToHistory, 
    getPlayVersions, 
    updatePlayVersion 
};
