import { api } from '../api.js';
import { state } from '../state.js';
import { context } from '../context.js';
import { updateAppSelector } from './appFeature.js';
import { refreshBuildHistoryForSelectedApp } from './historyFeature.js';

export async function handleScan() {
    context.elements.scanBtn.disabled = true;
    context.elements.scanBtn.textContent = 'Scanning...';
    try {
        const result = await api.scanWorkspace();
        if (result.error) throw new Error(result.error);
        state.setApps(result.discovered);
        updateAppSelector(result.discovered);
        if (state.selectedAppId && result.discovered.some((app) => app.id === state.selectedAppId)) {
            await refreshBuildHistoryForSelectedApp({ preserveSelection: true, autoSelectNewest: false });
        } else if (state.selectedAppId) {
            state.selectApp(null);
            state.setBuildHistory([]);
            state.setSelectedBuild(null);
            state.setLogs([]);
        }
    } catch (err) {
        console.error('Scan failed:', err);
        const msg = err.details ? `${err.message} (${err.details})` : err.message;
        if (context.logViewMode === 'live') {
            state.addLog({
                timestamp: new Date().toISOString(),
                message: `FAILED: Workspace scan failed. ${msg}`,
                source: 'stderr'
            });
        }
    } finally {
        context.elements.scanBtn.disabled = true; // will be re-enabled later
        context.elements.scanBtn.disabled = false;
        context.elements.scanBtn.textContent = 'Scan Workspace';
    }
}
