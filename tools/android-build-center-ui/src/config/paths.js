const path = require('path');

const UI_ROOT = path.join(__dirname, '..', '..');
const WORKSPACE_ROOT = path.join(UI_ROOT, '..', '..');
const APPS_JSON_PATH = path.join(UI_ROOT, '..', 'android-build-center', 'apps.json');
const BUILD_CENTER_ROOT = path.join(UI_ROOT, '..', 'android-build-center');

module.exports = {
    UI_ROOT,
    WORKSPACE_ROOT,
    APPS_JSON_PATH,
    BUILD_CENTER_ROOT,
    LOGS_DIR: path.join(UI_ROOT, 'logs'),
    SETTINGS_PATH: path.join(UI_ROOT, 'build-center-settings.json'),
    SCRIPTS: {
        BUILD_APK: path.join(BUILD_CENTER_ROOT, 'build-apk.ps1'),
        BUILD_AAB: path.join(BUILD_CENTER_ROOT, 'build-aab.ps1'),
        GENERATE_RESET: path.join(BUILD_CENTER_ROOT, 'generate-reset-key.ps1')
    }
};
