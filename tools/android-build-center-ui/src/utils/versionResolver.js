const fs = require('fs');
const path = require('path');
const { parseOptionalPositiveInteger, parsePositiveInteger } = require('./versionRules');

/**
 * Resolves versionCode and versionName from various Android/Expo project files.
 */
function resolveAppVersion(appRoot) {
    const result = {
        versionCode: null,
        versionName: null,
        source: null,
        versionError: null
    };

    // 1. Try Expo app.json
    const appJsonPath = path.join(appRoot, 'app.json');
    if (fs.existsSync(appJsonPath)) {
        try {
            const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
            const expo = appJson.expo || {};
            result.versionName = expo.version;
            const parsedVersionCode = parseOptionalPositiveInteger(expo.android ? expo.android.versionCode : null, 'versionCode');
            if (!parsedVersionCode.valid) result.versionError = parsedVersionCode.error;
            result.versionCode = parsedVersionCode.value;
            if (result.versionName || result.versionCode) {
                result.source = 'app.json';
                return result;
            }
        } catch (e) {}
    }

    // 2. Try Native Android build.gradle
    const gradlePath = path.join(appRoot, 'android', 'app', 'build.gradle');
    if (fs.existsSync(gradlePath)) {
        try {
            const content = fs.readFileSync(gradlePath, 'utf8');
            const vCodeMatch = content.match(/versionCode\s+(-?\d+(?:\.\d+)?)/);
            const vNameMatch = content.match(/versionName\s+["']([^"']+)["']/);
            
            const parsedVersionCode = parseOptionalPositiveInteger(vCodeMatch ? vCodeMatch[1] : null, 'versionCode');
            if (!parsedVersionCode.valid) result.versionError = parsedVersionCode.error;
            result.versionCode = parsedVersionCode.value;
            result.versionName = vNameMatch ? vNameMatch[1] : null;
            result.source = 'build.gradle';
            if (result.versionName || result.versionCode) return result;
        } catch (e) {}
    }

    // 3. Fallback to package.json
    const pkgPath = path.join(appRoot, 'package.json');
    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            result.versionName = pkg.version;
            result.source = 'package.json';
        } catch (e) {}
    }

    return result;
}

/**
 * Updates the version in the appropriate source file.
 */
function updateAppVersion(appRoot, newVersionName, newVersionCode) {
    const shouldUpdateCode = newVersionCode !== undefined && newVersionCode !== null && newVersionCode !== '';
    let parsedVersionCode = null;
    if (shouldUpdateCode) {
        const parsed = parsePositiveInteger(newVersionCode, 'versionCode');
        if (!parsed.valid) return { success: false, error: 'versionCode must be a positive integer.' };
        parsedVersionCode = parsed.value;
    }

    const writes = [];

    const appJsonPath = path.join(appRoot, 'app.json');
    if (fs.existsSync(appJsonPath)) {
        try {
            const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
            if (appJson.expo) {
                if (newVersionName) appJson.expo.version = newVersionName;
                if (shouldUpdateCode) {
                    if (!appJson.expo.android) appJson.expo.android = {};
                    appJson.expo.android.versionCode = parsedVersionCode;
                }
                writes.push({ path: appJsonPath, label: 'app.json', content: JSON.stringify(appJson, null, 2) });
            }
        } catch (e) {}
    }

    const gradlePath = path.join(appRoot, 'android', 'app', 'build.gradle');
    if (fs.existsSync(gradlePath)) {
        try {
            let content = fs.readFileSync(gradlePath, 'utf8');
            let updated = false;
            if (shouldUpdateCode) {
                const nextContent = content.replace(/(versionCode\s+)-?\d+(?:\.\d+)?/, `$1${parsedVersionCode}`);
                if (nextContent === content) {
                    return { success: false, error: 'No versionCode entry found in build.gradle.' };
                }
                content = nextContent;
                updated = true;
            }
            if (newVersionName) {
                const nextContent = content.replace(/(versionName\s+)["'][^"']+["']/, `$1"${newVersionName}"`);
                if (nextContent === content) {
                    return { success: false, error: 'No versionName entry found in build.gradle.' };
                }
                content = nextContent;
                updated = true;
            }
            if (updated) {
                writes.push({ path: gradlePath, label: 'build.gradle', content });
            }
        } catch (e) {}
    }

    if (writes.length > 0) {
        writes.forEach(write => fs.writeFileSync(write.path, write.content));
        return { success: true, file: writes.map(write => write.label).join(', ') };
    }

    return { success: false, error: 'No suitable version source found to update.' };
}

module.exports = { resolveAppVersion, updateAppVersion };
