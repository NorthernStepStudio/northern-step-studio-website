const fs = require('fs');
const path = require('path');
const { APPS_JSON_PATH, WORKSPACE_ROOT } = require('../config/paths');
const { resolveCredentials } = require('../credentials/credentialResolver');

/**
 * Pre-warms the ephemeral session vault during server startup.
 * Scans configured apps for local secrets or Windows Credential Manager matches.
 */
function prewarmVault() {
    console.log('[Boot] Pre-warming session vault...');
    try {
        if (!fs.existsSync(APPS_JSON_PATH)) return;

        const configuredApps = JSON.parse(fs.readFileSync(APPS_JSON_PATH, 'utf8'));
        Object.keys(configuredApps).forEach(id => {
            const app = configuredApps[id];
            if (!app.path) return;

            const appRoot = path.join(WORKSPACE_ROOT, app.path);
            const resolved = resolveCredentials(id, appRoot);
            if (resolved) {
                console.log(`[Vault] Resolved credentials for ${id} via ${resolved.source}`);
            }
        });
    } catch (e) {
        console.error('[Boot] Startup vault warmup failed:', e.message);
    }
}

module.exports = prewarmVault;
