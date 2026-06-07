import { api } from '../api.js';
import { state } from '../state.js';
import { context } from '../context.js';

export function formatBuildTime(timestamp) {
    if (!timestamp) return '--';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleString([], {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function renderBuildHistoryList(currentState) {
    const container = context.elements.buildHistoryList;
    if (!container) return;

    const appId = currentState.selectedAppId;
    const history = currentState.buildHistory || [];
    container.innerHTML = '';

    if (!appId) {
        container.innerHTML = '<div class="build-history-empty">Select an app to view its build history.</div>';
        return;
    }

    const runningForSelected = currentState.buildStatus?.running && currentState.buildStatus?.currentApp === appId;
    if (runningForSelected) {
        const liveBtn = document.createElement('button');
        liveBtn.type = 'button';
        liveBtn.className = `build-history-item ${currentState.selectedBuildId === 'live' ? 'active' : ''}`;
        liveBtn.innerHTML = `
            <span class="build-history-type">LIVE</span>
            <span class="build-history-status running">${String(currentState.buildStatus?.buildType || '').toUpperCase()}</span>
            <span class="build-history-time">running</span>
        `;
        liveBtn.addEventListener('click', () => {
            context.logViewMode = 'live';
            state.setSelectedBuild('live');
        });
        container.appendChild(liveBtn);
    }

    if (!history.length) {
        const msg = document.createElement('div');
        msg.className = 'build-history-empty';
        msg.textContent = 'No saved builds for selected app.';
        container.appendChild(msg);
        return;
    }

    history.forEach((build) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        const canOpen = Boolean(build.hasLog);
        btn.disabled = !canOpen;
        btn.className = `build-history-item ${currentState.selectedBuildId === build.id ? 'active' : ''}`;
        btn.innerHTML = `
            <span class="build-history-type">${String(build.buildType || '').toUpperCase()}</span>
            <span class="build-history-status ${String(build.status || '').toLowerCase()}">${String(build.status || 'unknown').toUpperCase()}</span>
            <span class="build-history-time">${canOpen ? formatBuildTime(build.timestamp) : 'no saved log'}</span>
        `;
        if (canOpen) {
            btn.addEventListener('click', () => {
                loadBuildLogsForSelection(build.id);
            });
        }
        container.appendChild(btn);
    });
}

export async function loadBuildLogsForSelection(buildId) {
    const appId = state.selectedAppId;
    if (!buildId || !appId) return;

    context.logViewMode = 'history';
    state.setSelectedBuild(buildId);
    context.selectedBuildByApp.set(appId, buildId);

    let result;
    try {
        result = await api.getBuildLogsById(buildId);
    } catch (err) {
        result = { error: err.message };
    }

    if (result.error) {
        state.setLogs([{
            timestamp: new Date().toISOString(),
            source: 'stderr',
            message: `FAILED: ${result.error}`
        }]);
        return;
    }
    state.setLogs(Array.isArray(result.logs) ? result.logs : []);
}

export async function refreshBuildHistoryForSelectedApp({ preserveSelection = true, autoSelectNewest = false } = {}) {
    const appId = state.selectedAppId;
    if (!appId) {
        state.setBuildHistory([]);
        state.setSelectedBuild(null);
        return;
    }

    let result;
    try {
        result = await api.getBuildHistory(appId);
    } catch (err) {
        result = { builds: [], error: err.message };
    }

    const history = Array.isArray(result.builds) ? result.builds : [];
    state.setBuildHistory(history);

    let targetBuildId = null;
    if (preserveSelection) targetBuildId = context.selectedBuildByApp.get(appId) || null;
    if (targetBuildId && !history.some((entry) => entry.id === targetBuildId)) {
        targetBuildId = null;
    }
    if (autoSelectNewest && history.length > 0) {
        targetBuildId = (history.find((entry) => entry.hasLog) || history[0]).id;
    }
    if (!targetBuildId && history.length > 0) {
        targetBuildId = (history.find((entry) => entry.hasLog) || history[0]).id;
    }

    if (targetBuildId && history.some((entry) => entry.id === targetBuildId && entry.hasLog)) {
        await loadBuildLogsForSelection(targetBuildId);
    } else if (context.logViewMode !== 'live') {
        state.setSelectedBuild(null);
        state.setLogs([]);
    }
}
