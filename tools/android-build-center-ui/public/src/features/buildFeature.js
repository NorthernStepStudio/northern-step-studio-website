import { api } from '../api.js';
import { state } from '../state.js';
import { context, isStoredPasswordLabel } from '../context.js';
import { refreshBuildHistoryForSelectedApp } from './historyFeature.js';

export async function handleBuild(type) {
    const appName = context.elements.appSelector.value;
    const password = context.elements.keystorePasswordInput.value;
    if (!appName) return;

    if (password && !isStoredPasswordLabel(password)) {
        const app = state.apps.find(a => a.id === appName);
        state.addLog({ timestamp: new Date().toISOString(), message: `Saving and validating password for ${appName} before build...`, source: 'system' });
        const val = await api.saveExistingPassword(appName, app?.appRoot || '', password);
        if (val.error) {
            state.addLog({ timestamp: new Date().toISOString(), message: `FAILED: ${val.error}`, source: 'stderr' });
            return;
        }
        state.addLog({ timestamp: new Date().toISOString(), message: val.message, source: 'system' });
    }

    context.logViewMode = 'live';
    state.setSelectedBuild('live');
    state.setLogs([]);
    const result = await api.startBuild(appName, type);
    if (result.error) {
        console.error('Build Error:', result.error);
        state.addLog({ timestamp: new Date().toISOString(), message: `FAILED: ${result.error}`, source: 'stderr' });
        refreshBuildHistoryForSelectedApp({ preserveSelection: false, autoSelectNewest: true });
    }
}
