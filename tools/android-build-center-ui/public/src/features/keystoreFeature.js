import { api } from '../api.js';
import { state } from '../state.js';
import { context, isStoredPasswordLabel } from '../context.js';
import { handleScan } from './scanFeature.js';
import { handleAppAction } from './appFeature.js';

export async function handleGenerateKeystore() {
    const appId = context.elements.appSelector.value;
    const app = state.apps.find(a => a.id === appId);
    if (!app) return;

    context.elements.generateKeystoreBtn.disabled = true;
    context.elements.generateKeystoreBtn.textContent = 'Generating...';

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
        context.elements.generateKeystoreBtn.disabled = false;
        context.elements.generateKeystoreBtn.textContent = 'Generate Keystore';
    }
}

export async function handleSaveExistingPassword() {
    const appName = context.elements.appSelector.value;
    const app = state.apps.find(a => a.id === appName);
    const password = context.elements.keystorePasswordInput.value;
    if (!appName || !app) return;
    if (!password || isStoredPasswordLabel(password)) {
        state.addLog({ timestamp: new Date().toISOString(), message: 'FAILED: Enter the keystore password before saving.', source: 'stderr' });
        return;
    }

    context.elements.keystorePasswordInput.disabled = true;
    context.elements.saveExistingPasswordBtn.disabled = true;
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
        context.elements.keystorePasswordInput.disabled = false;
        context.elements.saveExistingPasswordBtn.disabled = false;
    }
}

export async function handleGenerateUploadKey() {
    const appName = context.elements.appSelector.value;
    const app = state.apps.find(a => a.id === appName);
    if (!appName || !app) return;

    if (app.isProduction && context.uploadKeyResetArmedFor !== appName) {
        context.uploadKeyResetArmedFor = appName;
        context.elements.generateUploadKeyBtn.classList.add('btn-danger');
        context.elements.generateUploadKeyBtn.textContent = 'Confirm Upload Key Reset';
        state.addLog({
            timestamp: new Date().toISOString(),
            message: `ACTION REQUIRED: Click Confirm Upload Key Reset to generate a new upload key for production app '${appName}'. The exported certificate must be uploaded to Google Play Console before AAB builds are allowed.`,
            source: 'system'
        });
        return;
    }

    context.elements.generateUploadKeyBtn.disabled = true;
    try {
        context.uploadKeyResetArmedFor = null;
        const result = await api.generateUploadKey(appName, app.appRoot);
        if (result.error) throw new Error(result.error);

        state.addLog({ timestamp: new Date().toISOString(), message: `UPLOAD KEY GENERATED: ${result.keystorePath}`, source: 'system' });
        state.addLog({ timestamp: new Date().toISOString(), message: `CERTIFICATE EXPORTED: ${result.certPath}`, source: 'system' });
        state.addLog({ timestamp: new Date().toISOString(), message: `INSTRUCTION: ${result.instruction}`, source: 'system' });

        await handleScan();
    } catch (err) {
        state.addLog({ timestamp: new Date().toISOString(), message: `Generation Failed: ${err.message}`, source: 'stderr' });
    } finally {
        context.elements.generateUploadKeyBtn.disabled = false;
        context.elements.generateUploadKeyBtn.classList.remove('btn-danger');
    }
}

export async function handleConfirmUploadApproval() {
    const appName = context.elements.appSelector.value;
    const app = state.apps.find(a => a.id === appName);
    if (!appName || !app) return;

    context.elements.confirmUploadApprovalBtn.disabled = true;
    try {
        const result = await api.confirmUploadApproval(appName);
        if (result.error) throw new Error(result.error);

        state.addLog({ timestamp: new Date().toISOString(), message: result.message, source: 'system' });
        await handleScan();
    } catch (err) {
        state.addLog({ timestamp: new Date().toISOString(), message: `Confirmation Failed: ${err.message}`, source: 'stderr' });
    } finally {
        context.elements.confirmUploadApprovalBtn.disabled = false;
    }
}

export async function handleVerifyCredentials() {
    const appName = context.elements.appSelector.value;
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
