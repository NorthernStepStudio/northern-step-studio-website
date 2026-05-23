const fs = require('fs');
const path = require('path');
const { WORKSPACE_ROOT } = require('../config/paths');

/**
 * Recursively finds React Native or Expo apps in a directory.
 * Skips system folders and doesn't abort on finding .git.
 */
function findApps(dir, results = [], options = {}) {
    const maxResults = options.maxResults || 200;
    const fullScan = Boolean(options.full);
    const seen = new Set();

    const defaultExcludes = new Set(['node_modules', '.git', '.gemini', 'archive', 'build-artifacts', 'b', 'b-cxx', '.expo', '.next', 'dist', 'tmp', 'logs']);

    function shouldSkip(name, parent) {
        if (!name) return true;
        if (defaultExcludes.has(name)) return true;
        // Skip workspace-level archive folder only at root
        if (name === 'archive' && parent === WORKSPACE_ROOT) return true;
        return false;
    }

    function tryReadPackageJson(folder) {
        try {
            const pkgPath = path.join(folder, 'package.json');
            if (!fs.existsSync(pkgPath)) return null;
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            return pkg;
        } catch (e) {
            return null;
        }
    }

    function analyzeFolder(folder) {
        if (results.length >= maxResults) return;
        const canonical = path.resolve(folder);
        if (seen.has(canonical)) return;
        seen.add(canonical);

        let files;
        try {
            files = fs.readdirSync(folder);
        } catch (e) {
            return;
        }

        if (files.includes('package.json')) {
            const pkg = tryReadPackageJson(folder);
            if (pkg) {
                const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
                if (deps['react-native'] || deps['expo']) {
                    results.push({
                        appRoot: folder,
                        pkg,
                        hasAndroid: files.includes('android'),
                        isExpo: !!deps['expo'],
                        isReactNative: !!deps['react-native']
                    });
                }
            }
        }
    }

    function recurse(folder, depth = 0, maxDepth = 6) {
        if (results.length >= maxResults) return;
        if (depth > maxDepth) return;
        let files;
        try {
            files = fs.readdirSync(folder);
        } catch (e) {
            return;
        }

        // Analyze current folder first (shallow-first)
        analyzeFolder(folder);

        for (const file of files) {
            if (shouldSkip(file, folder)) continue;
            const fullPath = path.join(folder, file);
            try {
                const st = fs.statSync(fullPath);
                if (st.isDirectory()) {
                    // Heuristic: avoid recursing into very deep or large paths during quick scan
                    recurse(fullPath, depth + 1, fullScan ? 50 : Math.max(3, 6 - depth));
                    if (results.length >= maxResults) return;
                }
            } catch (e) {
                continue;
            }
        }
    }

    // Quick-first strategy: prioritize common top-level locations
    const candidates = [];
    try {
        candidates.push(dir);
        const appsDir = path.join(dir, 'apps');
        const packagesDir = path.join(dir, 'packages');
        const projectsDir = path.join(dir, 'projects');
        [appsDir, packagesDir, projectsDir].forEach(d => { try { if (fs.existsSync(d) && fs.statSync(d).isDirectory()) candidates.push(d); } catch(e){} });
    } catch (e) {
        // ignore
    }

    // Walk prioritized candidates shallow-first
    for (const c of candidates) {
        recurse(c, 0, fullScan ? 50 : 4);
        if (!fullScan && results.length > 0) {
            // If quick scan found apps, return early
            return results;
        }
    }

    // If quick scan didn't find anything or fullScan requested, perform broader search from root
    if (!fullScan) {
        recurse(dir, 0, 10);
    }

    return results;
}

module.exports = findApps;
