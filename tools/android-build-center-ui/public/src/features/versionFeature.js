import { api } from '../api.js';
import { state } from '../state.js';
import { context } from '../context.js';
import { handleScan } from './scanFeature.js';
import { handleAppAction } from './appFeature.js';

export async function handleBumpVersion() {
    const appId = context.elements.appSelector.value;
    const app = state.apps.find(a => a.id === appId);
    if (!app) return;

    context.elements.bumpVersionBtn.disabled = true;
    try {
        const result = await api.bumpVersion(app.id, app.appRoot);
        if (result.error) throw new Error(result.error);
        state.addLog({ timestamp: new Date().toISOString(), message: `Version updated: ${result.versionName} (${result.versionCode})`, source: 'system' });
        await handleScan();
        const updatedApp = state.apps.find(a => a.id === appId);
        if (updatedApp) handleAppAction('select', updatedApp);
    } catch (err) {
        state.addLog({ timestamp: new Date().toISOString(), message: `Bump Failed: ${err.message}`, source: 'stderr' });
    } finally {
        context.elements.bumpVersionBtn.disabled = false;
    }
}

export async function handlePlayCodeUpdate() {
    const appId = context.elements.appSelector.value;
    const raw = context.elements.playCodeInput.value.trim();
    if (!appId || raw === '') return;
    if (!/^\d+$/.test(raw) || Number(raw) < 1) {
        context.elements.playCodeInput.value = '';
        state.addLog({ timestamp: new Date().toISOString(), message: 'Google Play versionCode must be a positive integer.', source: 'stderr' });
        return;
    }

    const code = Number(raw);
    const result = await api.updatePlayVersion(appId, code);
    if (result.error) {
        state.addLog({ timestamp: new Date().toISOString(), message: result.error, source: 'stderr' });
        return;
    }

    state.addLog({ timestamp: new Date().toISOString(), message: `Updated Google Play versionCode for ${appId} to ${code}`, source: 'system' });
    const scan = await api.scanWorkspace();
    if (!scan.error) state.setApps(scan.discovered);
}
