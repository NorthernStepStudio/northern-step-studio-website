const fs = require('fs');
const path = require('path');
const { WORKSPACE_ROOT } = require('../config/paths');

/**
 * Recursively finds React Native or Expo apps in a directory.
 * Skips system folders and doesn't abort on finding .git.
 */
function findApps(dir, results = []) {
    try {
        const stats = fs.statSync(dir);
        if (!stats.isDirectory()) return results;

        const files = fs.readdirSync(dir);
        
        // If we found an app, record it
        if (files.includes('package.json')) {
            try {
                const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
                const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
                
                if (deps['react-native'] || deps['expo']) {
                    results.push({
                        appRoot: dir,
                        pkg,
                        hasAndroid: files.includes('android'),
                        isExpo: !!deps['expo'],
                        isReactNative: !!deps['react-native']
                    });
                    // Note: We continue recursing even if we find a root app,
                    // to support nested apps (monorepos).
                }
            } catch (err) {
                // Ignore invalid package.json
            }
        }

        // Recurse into subdirectories
        for (const file of files) {
            if (file === 'node_modules' || file === '.git' || file === '.gemini' || (file === 'archive' && dir === WORKSPACE_ROOT)) continue;
            
            const fullPath = path.join(dir, file);
            try {
                const subStats = fs.statSync(fullPath);
                if (subStats.isDirectory()) {
                    findApps(fullPath, results);
                }
            } catch (err) {
                // Ignore inaccessible files
            }
        }
    } catch (e) {
        // Ignore directory errors
    }
    return results;
}

module.exports = findApps;
