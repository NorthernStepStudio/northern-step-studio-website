/**
 * NStep Build Center - Main Orchestrator (Premium Dashboard)
 */

import { api } from './api.js';
import { state } from './state.js';
import { context } from './context.js';
import { renderAppList } from './render/renderApps.js';
import { renderLogs } from './render/renderLogs.js';
import { renderBuildStatus } from './render/renderBuildStatus.js';

import { handleScan } from './features/scanFeature.js';
import { handleBuild } from './features/buildFeature.js';
import { handleGenerateKeystore, handleSaveExistingPassword, handleGenerateUploadKey, handleConfirmUploadApproval, handleVerifyCredentials } from './features/keystoreFeature.js';
import { handleBumpVersion, handlePlayCodeUpdate } from './features/versionFeature.js';
import { setupUIBindings } from './features/uiFeature.js';
import { handleAppAction, updateAppSelector } from './features/appFeature.js';
import { renderBuildHistoryList, refreshBuildHistoryForSelectedApp } from './features/historyFeature.js';

window.api = api;
window.state = state;

context.elements = {
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

async function init() {
    console.log('Initializing NStep Build Center Dashboard...');
    try {
        const settings = await api.getSettings();
        state.setSettings(settings);
        if (context.elements.autoGenToggle) context.elements.autoGenToggle.checked = settings.autoGenerateForPrivateApps;
        if (context.elements.wcmToggle) context.elements.wcmToggle.checked = settings.rememberInWCM;

        const apps = await api.getApps();
        state.setApps(Object.keys(apps).map(k => ({ id: k, ...apps[k] })));
        updateAppSelector(state.apps);

        const [status] = await Promise.all([api.getStatus()]);
        state.setBuildStatus(status);
        state.setLogs([]);

        setupSSE();

        setInterval(() => {
            if (state.buildStatus && state.buildStatus.running) {
                renderBuildStatus(state.buildStatus, context.elements.buildStatusCard);
            }
        }, 1000);

        handleScan();
    } catch (e) {
        console.error('Initialization failed:', e);
    }
}

function updateSettings() {
    const settings = {
        autoGenerateForPrivateApps: context.elements.autoGenToggle.checked,
        rememberInWCM: context.elements.wcmToggle.checked
    };
    api.saveSettings(settings);
    state.setSettings(settings);
}

if (context.elements.autoGenToggle) context.elements.autoGenToggle.addEventListener('change', updateSettings);
if (context.elements.wcmToggle) context.elements.wcmToggle.addEventListener('change', updateSettings);

function setupSSE() {
    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        if (payload.type === 'log') {
            const selectedApp = state.selectedAppId;
            const currentBuildApp = state.buildStatus?.currentApp;
            if (context.logViewMode === 'live' && selectedApp && currentBuildApp === selectedApp) {
                state.addLog(payload.data);
            }
        } else if (payload.type === 'status') {
            const previous = state.buildStatus;
            state.setBuildStatus(payload.data);

            const selectedApp = state.selectedAppId;
            const currentApp = payload.data?.currentApp;
            const currentlyRunning = Boolean(payload.data?.running);
            const wasRunning = Boolean(previous?.running);

            if (currentlyRunning && selectedApp && currentApp === selectedApp && context.logViewMode !== 'live') {
                context.logViewMode = 'live';
                state.setSelectedBuild('live');
                state.setLogs([]);
            }

            if (wasRunning && !currentlyRunning && selectedApp && currentApp === selectedApp) {
                refreshBuildHistoryForSelectedApp({ preserveSelection: false, autoSelectNewest: true });
            }
        }
    };
}

// Bind main listeners
context.elements.scanBtn.addEventListener('click', handleScan);
context.elements.buildApkBtn.addEventListener('click', () => handleBuild('apk'));
context.elements.buildAabBtn.addEventListener('click', () => handleBuild('aab'));
context.elements.cancelBuildBtn.addEventListener('click', () => api.cancelBuild());
context.elements.appSelector.addEventListener('change', () => {
    const appId = context.elements.appSelector.value;
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
context.elements.generateKeystoreBtn.addEventListener('click', handleGenerateKeystore);
context.elements.generateUploadKeyBtn.addEventListener('click', handleGenerateUploadKey);
context.elements.confirmUploadApprovalBtn.addEventListener('click', handleConfirmUploadApproval);
context.elements.savePasswordBtn.addEventListener('click', handleSaveExistingPassword);
context.elements.saveExistingPasswordBtn.addEventListener('click', handleSaveExistingPassword);
context.elements.verifyCredentialsBtn.addEventListener('click', handleVerifyCredentials);
context.elements.bumpVersionBtn.addEventListener('click', handleBumpVersion);
context.elements.playCodeInput.addEventListener('change', handlePlayCodeUpdate);
context.elements.clearLogBtn.addEventListener('click', () => {
    if (context.logViewMode === 'live') {
        state.setLogs([]);
        api.clearLogs();
    } else {
        state.setSelectedBuild(null);
        state.setLogs([]);
    }
});

setupUIBindings();

state.subscribe((s) => {
    try {
        renderAppList(s.apps || [], context.elements.appList, handleAppAction);
        renderLogs(s.logs || [], context.elements.logContainer, context.logOptions);
        renderBuildStatus(s.buildStatus, context.elements.buildStatusCard);
        renderBuildHistoryList(s);

        const isRunning = s.buildStatus && s.buildStatus.running;
        context.elements.buildApkBtn.disabled = isRunning;
        context.elements.buildAabBtn.disabled = isRunning;

        if (isRunning) {
            context.elements.buildProgress.classList.add('active');
            context.elements.cancelBuildBtn.classList.remove('hidden');
        } else {
            context.elements.buildProgress.classList.remove('active');
            context.elements.cancelBuildBtn.classList.add('hidden');
        }
    } catch (err) {
        console.error('[State] Render Error:', err);
    }
});

init();
