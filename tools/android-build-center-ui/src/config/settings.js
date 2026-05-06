const { readJson, writeJson } = require('../utils/jsonUtils');
const { SETTINGS_PATH } = require('./paths');

const DEFAULT_SETTINGS = { 
    autoGenerateForPrivateApps: true,
    rememberInWCM: false 
};

function loadSettings() {
    return { ...DEFAULT_SETTINGS, ...readJson(SETTINGS_PATH) };
}

function saveSettings(s) {
    const current = loadSettings();
    return writeJson(SETTINGS_PATH, { ...current, ...s });
}

module.exports = { loadSettings, saveSettings };
