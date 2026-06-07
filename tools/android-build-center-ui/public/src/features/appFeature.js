import { api } from '../api.js';
import { state } from '../state.js';
import { context, PASSWORD_LABEL_PREFIX } from '../context.js';
import { refreshBuildHistoryForSelectedApp } from './historyFeature.js';

export function updateSelectedControls(app) {
    if (context.uploadKeyResetArmedFor && context.uploadKeyResetArmedFor !== app.id) {
        context.uploadKeyResetArmedFor = null;
    }

    const isResolved = app.credentialsValidated || app.passwordSourceFound;

    if (isResolved) {
        let label = `${PASSWORD_LABEL_PREFIX} Stored securely`;
        if (app.passwordSource === 'session') label = `${PASSWORD_LABEL_PREFIX} Session vault`;
        if (app.passwordSource === 'machine-secure-store') label = `${PASSWORD_LABEL_PREFIX} Machine secure store`;
        if (app.passwordSource === 'environment') label = `${PASSWORD_LABEL_PREFIX} Environment`;
        if (app.passwordSource === 'expo-manifest') label = `${PASSWORD_LABEL_PREFIX} Expo manifest`;
        if (app.passwordSource === 'generated') label = `${PASSWORD_LABEL_PREFIX} Generated for this app`;

        context.elements.keystorePasswordInput.value = label;
        context.elements.keystorePasswordInput.disabled = true;
        if (context.elements.vaultBadge) context.elements.vaultBadge.classList.remove('hidden');
    } else {
        context.elements.keystorePasswordInput.value = '';
        context.elements.keystorePasswordInput.placeholder = 'Password required';
        context.elements.keystorePasswordInput.disabled = false;
        if (context.elements.vaultBadge) context.elements.vaultBadge.classList.add('hidden');
    }

    const isProduction = app.isProduction;
    const isMissing = !app.keystoreFound;
    const isInvalid = app.credentialState === 'Invalid Keystore';
    const needsPassword = app.credentialState === 'Needs Password';
    const isInvalidPassword = app.credentialState === 'Invalid Password';
    const isPendingReset = app.credentialState === 'Pending Google Play Upload Key Reset';

    // Build Guards
    context.elements.buildAabBtn.disabled = isPendingReset;
    if (isPendingReset) {
        context.elements.buildAabBtn.title = "AAB build blocked until Google approval is confirmed.";
    } else {
        context.elements.buildAabBtn.title = "";
    }

    // Show Save button if manual entry is possible
    if (!app.credentialsValidated && !isPendingReset) {
        context.elements.savePasswordBtn.classList.remove('hidden');
    } else {
        context.elements.savePasswordBtn.classList.add('hidden');
    }

    // Generate Keystore Button
    if (isMissing && !isProduction) {
        context.elements.generateKeystoreBtn.classList.remove('hidden');
        context.elements.generateKeystoreBtn.textContent = 'Generate Keystore';
    } else {
        context.elements.generateKeystoreBtn.classList.add('hidden');
    }

    // Upload Key Reset Workflow Buttons
    if (isProduction || isInvalid || needsPassword || isInvalidPassword || isPendingReset) {
        if (isPendingReset) {
            context.elements.generateUploadKeyBtn.classList.add('hidden');
            context.elements.confirmUploadApprovalBtn.classList.remove('hidden');
        } else {
            context.elements.generateUploadKeyBtn.classList.remove('hidden');
            context.elements.confirmUploadApprovalBtn.classList.add('hidden');
            context.elements.generateUploadKeyBtn.classList.toggle('btn-danger', context.uploadKeyResetArmedFor === app.id);
            context.elements.generateUploadKeyBtn.textContent = context.uploadKeyResetArmedFor === app.id ? 'Confirm Upload Key Reset' : (isProduction ? 'Generate Play Upload Key (Reset)' : 'Generate Upload Key');
        }
    } else {
        context.elements.generateUploadKeyBtn.classList.add('hidden');
        context.elements.generateUploadKeyBtn.classList.remove('btn-danger');
        context.elements.confirmUploadApprovalBtn.classList.add('hidden');
    }

    if (app.keystoreFound && !app.credentialsValidated && !isPendingReset) {
        context.elements.saveExistingPasswordBtn.classList.remove('hidden');
    } else {
        context.elements.saveExistingPasswordBtn.classList.add('hidden');
    }

    context.elements.verifyCredentialsBtn.classList.remove('hidden');
    context.elements.versionManagement.classList.remove('hidden');
    context.elements.vNameLabel.textContent = app.versionName || '0.0.0';
    context.elements.vCodeLabel.textContent = app.versionCode || '0';
    context.elements.playCodeInput.value = app.lastPlayVersion || '';
}

export async function handleAppAction(action, app) {
    if (action !== 'select') return;

    context.elements.appSelector.value = app.id;
    state.selectApp(app.id);
    context.logViewMode = 'history';
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
            context.elements.appSelector.value = updatedApp.id;
            updateSelectedControls(updatedApp);
            await refreshBuildHistoryForSelectedApp({ preserveSelection: true, autoSelectNewest: false });
        }
    });
}

export function updateAppSelector(apps) {
    const current = context.elements.appSelector.value;
    context.elements.appSelector.innerHTML = '<option value="">-- Select App --</option>';
    apps.forEach(app => {
        const opt = document.createElement('option');
        opt.value = app.id;
        opt.textContent = app.displayName || app.id;
        context.elements.appSelector.appendChild(opt);
    });
    if (current) context.elements.appSelector.value = current;
}
