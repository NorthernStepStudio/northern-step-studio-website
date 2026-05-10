/**
 * NStep Build Center - Main Orchestrator (Premium Dashboard)
 */

import { api } from './api.js';
import { state } from './state.js';
import { renderAppList } from './render/renderApps.js';
import { renderLogs } from './render/renderLogs.js';
import { renderBuildStatus } from './render/renderBuildStatus.js';

window.api = api;
window.state = state;

const elements = {
    appList: document.getElementById('appList'),
    logContainer: document.getElementById('logContainer'),
    buildHistoryList: document.getElementById('buildHistoryList'),
    scanBtn: document.getElementById('scanBtn'),
    buildApkBtn: document.getElementById('buildApkBtn'),
    buildAabBtn: document.getElementById('buildAabBtn'),
    cancelBuildBtn: document.getElementById('cancelBuildBtn'),
    clearLogBtn: document.getElementById('clearLogBtn'),
    appSelector: document.getElementById('appSelector'),
    generateKeystoreBtn: document.getElementById('generateKeystoreBtn'),
    generateUploadKeyBtn: document.getElementById('generateUploadKeyBtn'),
    confirmUploadApprovalBtn: document.getElementById('confirmUploadApprovalBtn'),
    saveExistingPasswordBtn: document.getElementById('saveExistingPasswordBtn'),
    verifyCredentialsBtn: document.getElementById('verifyCredentialsBtn'),
    keystorePasswordInput: document.getElementById('keystorePassword'),
    savePasswordBtn: document.getElementById('savePasswordBtn'),
    rememberPassCheckbox: document.getElementById('rememberPass'),
    buildStatusCard: document.getElementById('buildStatusCard'),
    buildProgress: document.getElementById('buildProgress'),
    autoGenToggle: document.getElementById('autoGenToggleMain'),
    wcmToggle: document.getElementById('wcmToggleMain'),
    connectionStatus: document.getElementById('connectionStatus'),
    vaultBadge: document.getElementById('vaultBadge'),
    versionManagement: document.getElementById('versionManagement'),
    vNameLabel: document.getElementById('vNameLabel'),
    vCodeLabel: document.getElementById('vCodeLabel'),
    playCodeInput: document.getElementById('playCodeInput'),
    bumpVersionBtn: document.getElementById('bumpVersionBtn')
};

const PASSWORD_LABEL_PREFIX = '**********';
const selectedBuildByApp = new Map();
let logViewMode = 'history';
let uploadKeyResetArmedFor = null;

function isStoredPasswordLabel(value) {
    return String(value || '').startsWith(PASSWORD_LABEL_PREFIX);
}

function formatBuildTime(timestamp) {
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

function renderBuildHistoryList(currentState) {
    const container = elements.buildHistoryList;
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
            logViewMode = 'live';
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

async function loadBuildLogsForSelection(buildId) {
    const appId = state.selectedAppId;
    if (!buildId || !appId) return;

    logViewMode = 'history';
    state.setSelectedBuild(buildId);
    selectedBuildByApp.set(appId, buildId);

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

async function refreshBuildHistoryForSelectedApp({ preserveSelection = true, autoSelectNewest = false } = {}) {
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
    if (preserveSelection) targetBuildId = selectedBuildByApp.get(appId) || null;
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
    } else if (logViewMode !== 'live') {
        state.setSelectedBuild(null);
        state.setLogs([]);
    }
}

async function init() {
    console.log('Initializing NStep Build Center Dashboard...');
    try {
        const settings = await api.getSettings();
        state.setSettings(settings);
        if (elements.autoGenToggle) elements.autoGenToggle.checked = settings.autoGenerateForPrivateApps;
        if (elements.wcmToggle) elements.wcmToggle.checked = settings.rememberInWCM;

        const apps = await api.getApps();
        state.setApps(Object.keys(apps).map(k => ({ id: k, ...apps[k] })));
        updateAppSelector(state.apps);

        const [status] = await Promise.all([api.getStatus()]);
        state.setBuildStatus(status);
        state.setLogs([]);

        setupSSE();

        setInterval(() => {
            if (state.buildStatus && state.buildStatus.running) {
                renderBuildStatus(state.buildStatus, elements.buildStatusCard);
            }
        }, 1000);

        handleScan();
    } catch (e) {
        console.error('Initialization failed:', e);
    }
}

function updateSettings() {
    const settings = {
        autoGenerateForPrivateApps: elements.autoGenToggle.checked,
        rememberInWCM: elements.wcmToggle.checked
    };
    api.saveSettings(settings);
    state.setSettings(settings);
}

if (elements.autoGenToggle) elements.autoGenToggle.addEventListener('change', updateSettings);
if (elements.wcmToggle) elements.wcmToggle.addEventListener('change', updateSettings);

function setupSSE() {
    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        if (payload.type === 'log') {
            const selectedApp = state.selectedAppId;
            const currentBuildApp = state.buildStatus?.currentApp;
            if (logViewMode === 'live' && selectedApp && currentBuildApp === selectedApp) {
                state.addLog(payload.data);
            }
        } else if (payload.type === 'status') {
            const previous = state.buildStatus;
            state.setBuildStatus(payload.data);

            const selectedApp = state.selectedAppId;
            const currentApp = payload.data?.currentApp;
            const currentlyRunning = Boolean(payload.data?.running);
            const wasRunning = Boolean(previous?.running);

            if (currentlyRunning && selectedApp && currentApp === selectedApp && logViewMode !== 'live') {
                logViewMode = 'live';
                state.setSelectedBuild('live');
                state.setLogs([]);
            }

            if (wasRunning && !currentlyRunning && selectedApp && currentApp === selectedApp) {
                refreshBuildHistoryForSelectedApp({ preserveSelection: false, autoSelectNewest: true });
            }
        }
    };
}

elements.scanBtn.addEventListener('click', handleScan);
elements.buildApkBtn.addEventListener('click', () => handleBuild('apk'));
elements.buildAabBtn.addEventListener('click', () => handleBuild('aab'));
elements.cancelBuildBtn.addEventListener('click', () => api.cancelBuild());
elements.appSelector.addEventListener('change', () => {
    const appId = elements.appSelector.value;
    if (!appId) {
        state.selectApp(null);
        state.setBuildHistory([]);
        state.setSelectedBuild(null);
        state.setLogs([]);
        return;
    }
    const app = state.apps.find(a => a.id === appId);
    if (app) {
        handleAppAction('select', app);
    }
});
elements.generateKeystoreBtn.addEventListener('click', handleGenerateKeystore);
elements.generateUploadKeyBtn.addEventListener('click', handleGenerateUploadKey);
elements.confirmUploadApprovalBtn.addEventListener('click', handleConfirmUploadApproval);
elements.savePasswordBtn.addEventListener('click', handleSaveExistingPassword);
elements.saveExistingPasswordBtn.addEventListener('click', handleSaveExistingPassword);
elements.verifyCredentialsBtn.addEventListener('click', handleVerifyCredentials);
elements.bumpVersionBtn.addEventListener('click', handleBumpVersion);
elements.playCodeInput.addEventListener('change', handlePlayCodeUpdate);
elements.clearLogBtn.addEventListener('click', () => {
    if (logViewMode === 'live') {
        state.setLogs([]);
        api.clearLogs();
    } else {
        state.setSelectedBuild(null);
        state.setLogs([]);
    }
});

document.getElementById('expandAllLogsBtn').addEventListener('click', () => {
    document.querySelectorAll('.log-phase-group').forEach(d => d.open = true);
});
document.getElementById('collapseAllLogsBtn').addEventListener('click', () => {
    document.querySelectorAll('.log-phase-group').forEach(d => d.open = false);
});
document.getElementById('saveLogsBtn').addEventListener('click', () => {
    const logText = state.logs.map(l => `[${l.timestamp}] ${l.message}`).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `build-log-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    a.click();
});

const logOptions = { autoScroll: true, showRaw: false };
document.getElementById('autoScrollToggle').addEventListener('change', (e) => {
    logOptions.autoScroll = e.target.checked;
    renderLogs(state.logs, elements.logContainer, logOptions);
});
document.getElementById('showRawLogToggle').addEventListener('change', (e) => {
    logOptions.showRaw = e.target.checked;
    renderLogs(state.logs, elements.logContainer, logOptions);
});

async function handleScan() {
    elements.scanBtn.disabled = true;
    elements.scanBtn.textContent = 'Scanning...';
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
        if (logViewMode === 'live') {
            state.addLog({
                timestamp: new Date().toISOString(),
                message: `FAILED: Workspace scan failed. ${msg}`,
                source: 'stderr'
            });
        }
    } finally {
        elements.scanBtn.disabled = false;
        elements.scanBtn.textContent = 'Scan Workspace';
    }
}

async function handleBuild(type) {
    const appName = elements.appSelector.value;
    const password = elements.keystorePasswordInput.value;
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

    logViewMode = 'live';
    state.setSelectedBuild('live');
    state.setLogs([]);
    const result = await api.startBuild(appName, type);
    if (result.error) {
        console.error('Build Error:', result.error);
        state.addLog({ timestamp: new Date().toISOString(), message: `FAILED: ${result.error}`, source: 'stderr' });
        refreshBuildHistoryForSelectedApp({ preserveSelection: false, autoSelectNewest: true });
    }
}

async function handleGenerateKeystore() {
    const appId = elements.appSelector.value;
    const app = state.apps.find(a => a.id === appId);
    if (!app) return;

    elements.generateKeystoreBtn.disabled = true;
    elements.generateKeystoreBtn.textContent = 'Generating...';

    try {
        const result = await api.generateKeystore({
            id: app.id,
            appRoot: app.appRoot,
            packageName: app.packageName
        });

        if (result.error) {
            state.addLog({ timestamp: new Date().toISOString(), message: `FAILED: ${result.error}`, source: 'stderr' });
        } else {
            state.addLog({ timestamp: new Date().toISOString(), message: result.message, source: 'system' });
            await handleScan();
            const updatedApp = state.apps.find(a => a.id === appId);
            if (updatedApp) handleAppAction('select', updatedApp);
        }
    } catch (e) {
        console.error('Generation failed:', e);
        state.addLog({ timestamp: new Date().toISOString(), message: `FAILED: ${e.message}`, source: 'stderr' });
    } finally {
        elements.generateKeystoreBtn.disabled = false;
        elements.generateKeystoreBtn.textContent = 'Generate Keystore';
    }
}

async function handleSaveExistingPassword() {
    const appName = elements.appSelector.value;
    const app = state.apps.find(a => a.id === appName);
    const password = elements.keystorePasswordInput.value;
    if (!appName || !app) return;
    if (!password || isStoredPasswordLabel(password)) {
        state.addLog({ timestamp: new Date().toISOString(), message: 'FAILED: Enter the keystore password before saving.', source: 'stderr' });
        return;
    }

    elements.keystorePasswordInput.disabled = true;
    elements.saveExistingPasswordBtn.disabled = true;
    try {
        const val = await api.saveExistingPassword(appName, app.appRoot, password);
        if (val.error) {
            state.addLog({ timestamp: new Date().toISOString(), message: `FAILED: ${val.error}`, source: 'stderr' });
        } else {
            state.addLog({ timestamp: new Date().toISOString(), message: val.message, source: 'system' });
            await handleScan();
            const updatedApp = state.apps.find(a => a.id === appName);
            if (updatedApp) handleAppAction('select', updatedApp);
        }
    } finally {
        elements.keystorePasswordInput.disabled = false;
        elements.saveExistingPasswordBtn.disabled = false;
    }
}

async function handleGenerateUploadKey() {
    const appName = elements.appSelector.value;
    const app = state.apps.find(a => a.id === appName);
    if (!appName || !app) return;

    if (app.isProduction && uploadKeyResetArmedFor !== appName) {
        uploadKeyResetArmedFor = appName;
        elements.generateUploadKeyBtn.classList.add('btn-danger');
        elements.generateUploadKeyBtn.textContent = 'Confirm Upload Key Reset';
        state.addLog({
            timestamp: new Date().toISOString(),
            message: `ACTION REQUIRED: Click Confirm Upload Key Reset to generate a new upload key for production app '${appName}'. The exported certificate must be uploaded to Google Play Console before AAB builds are allowed.`,
            source: 'system'
        });
        return;
    }

    elements.generateUploadKeyBtn.disabled = true;
    try {
        uploadKeyResetArmedFor = null;
        const result = await api.generateUploadKey(appName, app.appRoot);
        if (result.error) throw new Error(result.error);

        state.addLog({ timestamp: new Date().toISOString(), message: `UPLOAD KEY GENERATED: ${result.keystorePath}`, source: 'system' });
        state.addLog({ timestamp: new Date().toISOString(), message: `CERTIFICATE EXPORTED: ${result.certPath}`, source: 'system' });
        state.addLog({ timestamp: new Date().toISOString(), message: `INSTRUCTION: ${result.instruction}`, source: 'system' });

        await handleScan();
    } catch (err) {
        state.addLog({ timestamp: new Date().toISOString(), message: `Generation Failed: ${err.message}`, source: 'stderr' });
    } finally {
        elements.generateUploadKeyBtn.disabled = false;
        elements.generateUploadKeyBtn.classList.remove('btn-danger');
    }
}

async function handleConfirmUploadApproval() {
    const appName = elements.appSelector.value;
    const app = state.apps.find(a => a.id === appName);
    if (!appName || !app) return;

    elements.confirmUploadApprovalBtn.disabled = true;
    try {
        const result = await api.confirmUploadApproval(appName);
        if (result.error) throw new Error(result.error);

        state.addLog({ timestamp: new Date().toISOString(), message: result.message, source: 'system' });
        await handleScan();
    } catch (err) {
        state.addLog({ timestamp: new Date().toISOString(), message: `Confirmation Failed: ${err.message}`, source: 'stderr' });
    } finally {
        elements.confirmUploadApprovalBtn.disabled = false;
    }
}

async function handleVerifyCredentials() {
    const appName = elements.appSelector.value;
    const app = state.apps.find(a => a.id === appName);
    if (!appName || !app) return;

    const report = await api.verifyCredentials(appName, app.appRoot);
    if (report.error) {
        state.addLog({ timestamp: new Date().toISOString(), message: `VERIFY FAILED: ${report.error}`, source: 'stderr' });
    } else {
        state.addLog({
            timestamp: new Date().toISOString(),
            message: `VERIFY OK: app=${report.appSelected}, canonical=${report.canonicalAppId}, keystore=${report.keystorePathExists}, vault=${report.passwordVaultRecoverSuccess}, keytool=${report.keytoolValidationSuccess}, session=${report.sessionVaultLoaded}, gradle=${report.gradleSigningConfigReady}`,
            source: 'system'
        });
    }
    await handleScan();
}

async function handleBumpVersion() {
    const appId = elements.appSelector.value;
    const app = state.apps.find(a => a.id === appId);
    if (!app) return;

    elements.bumpVersionBtn.disabled = true;
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
        elements.bumpVersionBtn.disabled = false;
    }
}

async function handlePlayCodeUpdate() {
    const appId = elements.appSelector.value;
    const raw = elements.playCodeInput.value.trim();
    if (!appId || raw === '') return;
    if (!/^\d+$/.test(raw) || Number(raw) < 1) {
        elements.playCodeInput.value = '';
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

function updateSelectedControls(app) {
    if (uploadKeyResetArmedFor && uploadKeyResetArmedFor !== app.id) {
        uploadKeyResetArmedFor = null;
    }

    const isResolved = app.credentialsValidated || app.passwordSourceFound;

    if (isResolved) {
        let label = `${PASSWORD_LABEL_PREFIX} Stored securely`;
        if (app.passwordSource === 'session') label = `${PASSWORD_LABEL_PREFIX} Session vault`;
        if (app.passwordSource === 'machine-secure-store') label = `${PASSWORD_LABEL_PREFIX} Machine secure store`;
        if (app.passwordSource === 'environment') label = `${PASSWORD_LABEL_PREFIX} Environment`;
        if (app.passwordSource === 'expo-manifest') label = `${PASSWORD_LABEL_PREFIX} Expo manifest`;
        if (app.passwordSource === 'generated') label = `${PASSWORD_LABEL_PREFIX} Generated for this app`;

        elements.keystorePasswordInput.value = label;
        elements.keystorePasswordInput.disabled = true;
        if (elements.vaultBadge) elements.vaultBadge.classList.remove('hidden');
    } else {
        elements.keystorePasswordInput.value = '';
        elements.keystorePasswordInput.placeholder = 'Password required';
        elements.keystorePasswordInput.disabled = false;
        if (elements.vaultBadge) elements.vaultBadge.classList.add('hidden');
    }

    const isProduction = app.isProduction;
    const isMissing = !app.keystoreFound;
    const isInvalid = app.credentialState === 'Invalid Keystore';
    const needsPassword = app.credentialState === 'Needs Password';
    const isInvalidPassword = app.credentialState === 'Invalid Password';
    const isPendingReset = app.credentialState === 'Pending Google Play Upload Key Reset';

    // Build Guards
    elements.buildAabBtn.disabled = isPendingReset;
    if (isPendingReset) {
        elements.buildAabBtn.title = "AAB build blocked until Google approval is confirmed.";
    } else {
        elements.buildAabBtn.title = "";
    }

    // Show Save button if manual entry is possible
    if (!app.credentialsValidated && !isPendingReset) {
        elements.savePasswordBtn.classList.remove('hidden');
    } else {
        elements.savePasswordBtn.classList.add('hidden');
    }

    // Generate Keystore Button
    if (isMissing && !isProduction) {
        elements.generateKeystoreBtn.classList.remove('hidden');
        elements.generateKeystoreBtn.textContent = 'Generate Keystore';
    } else {
        elements.generateKeystoreBtn.classList.add('hidden');
    }

    // Upload Key Reset Workflow Buttons
    if (isProduction || isInvalid || needsPassword || isInvalidPassword || isPendingReset) {
        if (isPendingReset) {
            elements.generateUploadKeyBtn.classList.add('hidden');
            elements.confirmUploadApprovalBtn.classList.remove('hidden');
        } else {
            elements.generateUploadKeyBtn.classList.remove('hidden');
            elements.confirmUploadApprovalBtn.classList.add('hidden');
            elements.generateUploadKeyBtn.classList.toggle('btn-danger', uploadKeyResetArmedFor === app.id);
            elements.generateUploadKeyBtn.textContent = uploadKeyResetArmedFor === app.id ? 'Confirm Upload Key Reset' : (isProduction ? 'Generate Play Upload Key (Reset)' : 'Generate Upload Key');
        }
    } else {
        elements.generateUploadKeyBtn.classList.add('hidden');
        elements.generateUploadKeyBtn.classList.remove('btn-danger');
        elements.confirmUploadApprovalBtn.classList.add('hidden');
    }

    if (app.keystoreFound && !app.credentialsValidated && !isPendingReset) {
        elements.saveExistingPasswordBtn.classList.remove('hidden');
    } else {
        elements.saveExistingPasswordBtn.classList.add('hidden');
    }

    elements.verifyCredentialsBtn.classList.remove('hidden');
    elements.versionManagement.classList.remove('hidden');
    elements.vNameLabel.textContent = app.versionName || '0.0.0';
    elements.vCodeLabel.textContent = app.versionCode || '0';
    elements.playCodeInput.value = app.lastPlayVersion || '';
}

async function handleAppAction(action, app) {
    if (action !== 'select') return;

    elements.appSelector.value = app.id;
    state.selectApp(app.id);
    logViewMode = 'history';
    state.setSelectedBuild(null);
    state.setLogs([]);
    updateSelectedControls(app);
    await refreshBuildHistoryForSelectedApp({ preserveSelection: true, autoSelectNewest: false });

    api.resolveCredentials(app.id, app.appRoot).then(async (report) => {
        if (!report.error && !report.ready) return;
        const result = await api.scanWorkspace();
        if (result.error) return;
        state.setApps(result.discovered);
        const updatedApp = result.discovered.find(a => a.id === app.id);
        if (updatedApp) {
            elements.appSelector.value = updatedApp.id;
            updateSelectedControls(updatedApp);
            await refreshBuildHistoryForSelectedApp({ preserveSelection: true, autoSelectNewest: false });
        }
    });
}

function updateAppSelector(apps) {
    const current = elements.appSelector.value;
    elements.appSelector.innerHTML = '<option value="">-- Select App --</option>';
    apps.forEach(app => {
        const opt = document.createElement('option');
        opt.value = app.id;
        opt.textContent = app.displayName || app.id;
        elements.appSelector.appendChild(opt);
    });
    if (current) elements.appSelector.value = current;
}

state.subscribe((s) => {
    try {
        renderAppList(s.apps || [], elements.appList, handleAppAction);
        renderLogs(s.logs || [], elements.logContainer, logOptions);
        renderBuildStatus(s.buildStatus, elements.buildStatusCard);
        renderBuildHistoryList(s);

        const isRunning = s.buildStatus && s.buildStatus.running;
        elements.buildApkBtn.disabled = isRunning;
        elements.buildAabBtn.disabled = isRunning;

        if (isRunning) {
            elements.buildProgress.classList.add('active');
            elements.cancelBuildBtn.classList.remove('hidden');
        } else {
            elements.buildProgress.classList.remove('active');
            elements.cancelBuildBtn.classList.add('hidden');
        }
    } catch (err) {
        console.error('[State] Render Error:', err);
    }
});

init();
