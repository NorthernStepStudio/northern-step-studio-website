/**
 * NStep Build Center - API Client
 */

export const api = {
    async getApps() {
        return fetch('/api/apps').then(r => r.json());
    },
    async scanWorkspace() {
        const r = await fetch('/api/discovery/scan');
        const data = await r.json();
        // Normalize to legacy shape for UI compatibility
        if (!data) return { error: 'No response' };
        if (!data.ok) return { error: data.errors ? data.errors.join('; ') : 'Scan failed', details: data.errors };
        return { discovered: data.apps || [], count: data.count || 0, durationMs: data.durationMs || 0 };
    },
    async getStatus() {
        return fetch('/api/build/status').then(r => r.json());
    },
    async getLogs() {
        return fetch('/api/build/logs').then(r => r.json());
    },
    async getBuildHistory(appId) {
        const query = appId ? `?appId=${encodeURIComponent(appId)}` : '';
        return fetch(`/api/build/history${query}`).then(r => r.json());
    },
    async getBuildLogsById(buildId) {
        return fetch(`/api/build/history/${encodeURIComponent(buildId)}/logs`).then(r => r.json());
    },
    async clearLogs() {
        return fetch('/api/build/clear', { method: 'POST' }).then(r => r.json());
    },
    async saveSecrets(data) {
        return fetch('/api/secrets/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json());
    },
    async startBuild(appName, buildType) {
        return fetch('/api/build/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appName, buildType })
        }).then(r => r.json());
    },
    async cancelBuild() {
        return fetch('/api/build/cancel', { method: 'POST' }).then(r => r.json());
    },
    async validateKeystore(appName, keystorePassword, remember = false) {
        return fetch('/api/build/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appName, keystorePassword, remember })
        }).then(r => r.json());
    },
    async getAliases(appName, keystorePassword) {
        return fetch('/api/keystore/aliases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appName, keystorePassword })
        }).then(r => r.json());
    },
    async generateResetKey(appName, keystorePassword) {
        return fetch('/api/keystore/generate-reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appName, keystorePassword })
        }).then(r => r.json());
    },
    async generateKeystore(data) {
        const r = await fetch('/api/discovery/generate-keystore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await r.json();
        if (!r.ok) return { error: result.error || 'Generation failed', details: result.details };
        return result;
    },
    async resolveCredentials(id, appRoot) {
        const r = await fetch('/api/discovery/resolve-credentials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, appRoot })
        });
        const result = await r.json();
        if (!r.ok) return { error: result.error || 'Credential resolution failed' };
        return result;
    },
    async saveExistingPassword(id, appRoot, keystorePassword) {
        const r = await fetch('/api/discovery/save-existing-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, appRoot, keystorePassword })
        });
        const result = await r.json();
        if (!r.ok) return { error: result.error || 'Password save failed' };
        return result;
    },
    async verifyCredentials(id, appRoot) {
        const r = await fetch('/api/discovery/verify-credentials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, appRoot })
        });
        const result = await r.json();
        if (!r.ok) return { error: result.error || 'Credential verification failed' };
        return result;
    },
    async getSettings() {
        return fetch('/api/settings').then(r => r.json());
    },
    async saveSettings(settings) {
        return fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        }).then(r => r.json());
    },
    async openFolder(filePath) {
        return fetch('/api/discovery/open-folder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: filePath })
        }).then(r => r.json());
    },
    async bumpVersion(id, appRoot, nextVersionCode, nextVersionName) {
        return fetch('/api/discovery/bump-version', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, appRoot, nextVersionCode, nextVersionName })
        }).then(res => res.json());
    },
    async updatePlayVersion(id, versionCode) {
        const r = await fetch('/api/discovery/update-play-version', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, versionCode })
        });
        return r.json();
    },
    async generateUploadKey(id, appRoot) {
        const r = await fetch('/api/discovery/generate-upload-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, appRoot })
        });
        return r.json();
    },
    async confirmUploadApproval(id) {
        const r = await fetch('/api/discovery/confirm-upload-approval', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        return r.json();
    }
};
