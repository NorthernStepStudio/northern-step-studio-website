const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { LOGS_DIR, WORKSPACE_ROOT, APPS_JSON_PATH } = require('../config/paths');
const { resolveAppVersion } = require('../utils/versionResolver');
const { getPlayVersions, addBuildToHistory } = require('../metadata/buildMetadata');
const { resolveAndValidateCredentials } = require('../credentials/credentialService');
const { getCredential } = require('../credentials/sessionVault');
const { readJson } = require('../utils/jsonUtils');
const { validateBuildVersion } = require('../utils/versionRules');

let buildStatus = {
    running: false,
    currentApp: null,
    buildType: null,
    status: 'idle',
    startedAt: null,
    endedAt: null,
    elapsedMs: 0,
    outputPath: null,
    savedLogPath: null,
    exitCode: null,
    currentPhase: 'Idle',
    phaseSummary: [],
    errorSummary: null
};

let logBuffer = [];
let buildProcess = null;

function getBuildStatus() {
    const status = { ...buildStatus };
    if (status.running && status.startedAt) {
        status.elapsedMs = Date.now() - new Date(status.startedAt).getTime();
    }
    return status;
}

function getLogs() {
    return logBuffer;
}

function clearLogs() {
    logBuffer = [];
}

function addLogLine(msg, source, broadcast) {
    const logLine = { timestamp: new Date().toISOString(), message: msg, source };
    logBuffer.push(logLine);
    broadcast({ type: 'log', data: logLine });
    // Safely increment current phase line count
    const current = buildStatus.phaseSummary[buildStatus.phaseSummary.length - 1];
    if (current) current.lineCount++;
}

function updatePhase(newPhase, broadcast) {
    if (buildStatus.currentPhase === newPhase) return;

    // Mark previous phase as success
    const prevPhase = buildStatus.phaseSummary.find(p => p.name === buildStatus.currentPhase);
    if (prevPhase && prevPhase.status === 'running') {
        prevPhase.status = 'success';
        prevPhase.endedAt = new Date().toISOString();
        prevPhase.durationMs = Date.now() - new Date(prevPhase.startedAt).getTime();
    }

    buildStatus.currentPhase = newPhase;
    buildStatus.phaseSummary.push({
        name: newPhase,
        status: 'running',
        startedAt: new Date().toISOString(),
        lineCount: 0
    });

    const logLine = { timestamp: new Date().toISOString(), message: `--- PHASE: ${newPhase} ---`, source: 'system' };
    logBuffer.push(logLine);
    broadcast({ type: 'log', data: logLine });
    broadcast({ type: 'status', data: getBuildStatus() });
}

function failBuild(phase, errorMsg, broadcast, step) {
    const current = buildStatus.phaseSummary[buildStatus.phaseSummary.length - 1];
    if (!current || current.name !== phase) {
        updatePhase(phase, broadcast);
    }

    const active = buildStatus.phaseSummary[buildStatus.phaseSummary.length - 1];
    if (active) {
        active.status = 'failed';
        active.endedAt = new Date().toISOString();
        active.durationMs = Date.now() - new Date(active.startedAt).getTime();
    }

    buildStatus.running = false;
    buildStatus.status = 'failed';
    buildStatus.errorSummary = errorMsg;
    buildStatus.currentPhase = phase;
    buildStatus.endedAt = new Date().toISOString();
    buildStatus.elapsedMs = Date.now() - new Date(buildStatus.startedAt).getTime();
    addLogLine(`FAILED: ${errorMsg}`, 'stderr', broadcast);
    broadcast({ type: 'status', data: getBuildStatus() });
    return { error: errorMsg, step };
}

function startBuild(appName, buildType, scriptPath, env, broadcast) {
    if (buildStatus.running) return { error: 'Build already in progress' };

    logBuffer = [];
    buildStatus = {
        running: true,
        currentApp: appName,
        currentAppRoot: null,
        buildType,
        status: 'running',
        startedAt: new Date().toISOString(),
        endedAt: null,
        elapsedMs: 0,
        outputPath: null,
        savedLogPath: null,
        exitCode: null,
        currentPhase: 'Initializing',
        phaseSummary: [],
        errorSummary: null
    };

    const apps = readJson(APPS_JSON_PATH);
    const appConfig = apps[appName] || {};
    let absoluteAppRoot = null;

    updatePhase('Resolve App', broadcast);
    if (!appConfig.path) {
        return failBuild('Resolve App', `App '${appName}' was not found in apps.json. Scan workspace before building this app.`, broadcast, 1);
    }

    absoluteAppRoot = path.isAbsolute(appConfig.path) ? appConfig.path : path.join(WORKSPACE_ROOT, appConfig.path);
    buildStatus.currentAppRoot = appConfig.path;
    if (!fs.existsSync(absoluteAppRoot)) {
        return failBuild('Resolve App', `App directory not found: ${appConfig.path}`, broadcast, 1);
    }
    addLogLine(`App resolved: ${appName}`, 'system', broadcast);

    updatePhase('Resolve Version', broadcast);
    const currentVersion = resolveAppVersion(absoluteAppRoot);
    if (currentVersion.versionError) {
        return failBuild('Resolve Version', currentVersion.versionError, broadcast, 2);
    }

    const playVersions = getPlayVersions();
    const lastPlayCode = playVersions[appName]?.versionCode || null;
    const requirePlayCode = buildType === 'aab' && Boolean(appConfig.alreadyOnGooglePlay || appConfig.isProduction);
    const versionCheck = validateBuildVersion({
        localVersionCode: currentVersion.versionCode,
        lastPlayCode,
        requirePlayCode
    });
    if (!versionCheck.valid) {
        return failBuild('Resolve Version', versionCheck.error, broadcast, 2);
    }
    addLogLine(`Version resolved: ${currentVersion.versionName || 'unknown'} (${versionCheck.localVersionCode})`, 'system', broadcast);

    updatePhase('Resolve Credentials', broadcast);
    const credentialReport = resolveAndValidateCredentials(appName, absoluteAppRoot, { updateConfig: true });
    if (!credentialReport.keystoreExists) {
        return failBuild('Resolve Credentials', credentialReport.error || `Keystore missing for '${appName}'. Use Generate Keystore.`, broadcast, 3);
    }
    if (!credentialReport.passwordRecovered) {
        return failBuild('Resolve Credentials', credentialReport.error || `Keystore password is missing for '${appName}'. Use Save Password for Existing Keystore.`, broadcast, 3);
    }
    addLogLine(`Credentials resolved from ${credentialReport.passwordSource}.`, 'system', broadcast);

    updatePhase('Load Session Vault', broadcast);
    const creds = getCredential(appName);
    if (!creds?.keystorePassword) {
        return failBuild('Load Session Vault', `Credentials for '${appName}' could not be loaded into the session vault after recovery.`, broadcast, 4);
    }
    addLogLine('Session vault loaded for selected app.', 'system', broadcast);

    updatePhase('Validate Signing', broadcast);
    if (!credentialReport.keytoolValid || !credentialReport.ready) {
        return failBuild('Validate Signing', credentialReport.error || 'Signing validation failed.', broadcast, 5);
    }
    addLogLine(`Signing validated with alias '${credentialReport.keyAlias}'.`, 'system', broadcast);

    updatePhase('Prebuild if needed', broadcast);

    const buildEnv = {
        ...env,
        APP_ROOT: appConfig.path,
        NSTEP_KEYSTORE_PASSWORD: creds.keystorePassword,
        NSTEP_KEY_PASSWORD: creds.keyPassword || creds.keystorePassword,
        NSTEP_KEY_ALIAS: creds.keyAlias || credentialReport.keyAlias,
        EXPO_USE_METRO_WORKSPACE_ROOT: '1'
    };

    const args = [
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-File', scriptPath,
        appName
    ];

    buildProcess = spawn('powershell.exe', args, { env: buildEnv });

    buildProcess.stdout.on('data', (data) => {
        const lines = data.toString().split(/\r?\n/);
        lines.forEach(line => {
                if (line.trim()) {
                    addLogLine(line, 'stdout', broadcast);

                    if (line.includes('ARTIFACT_PATH:')) {
                        buildStatus.outputPath = line.split('ARTIFACT_PATH:')[1].trim();
                        updatePhase('Verify Artifact', broadcast);
                    }

                if (line.includes('android/ folder missing') || line.includes('Running expo prebuild')) updatePhase('Prebuild if needed', broadcast);
                if (line.includes('Cleaning Android build') || line.includes('gradlew.bat clean')) updatePhase('Native Build', broadcast);
                
                if (line.includes('Building APK') || line.includes('Building AAB') || line.includes(':app:')) {
                    updatePhase('Native Build', broadcast);
                }

                if (line.includes('Searching for') || line.includes('Verifying artifact') || line.includes('Moving artifact') || line.includes('Found artifact')) {
                    updatePhase('Package Artifact', broadcast);
                }
            }
        });
    });

    buildProcess.stderr.on('data', (data) => {
        addLogLine(data.toString(), 'stderr', broadcast);
    });

    buildProcess.on('error', (error) => {
        failBuild(buildStatus.currentPhase || 'Native Build', error.message, broadcast, 7);
        buildProcess = null;
    });

    buildProcess.on('close', (code) => {
        if (!buildStatus.running && buildStatus.status === 'failed') return;
        finalizeBuild(code, broadcast);
    });

    return { success: true };
}

function finalizeBuild(code, broadcast) {
    buildStatus.running = false;
    buildStatus.endedAt = new Date().toISOString();
    buildStatus.elapsedMs = Date.now() - new Date(buildStatus.startedAt).getTime();
    buildStatus.exitCode = code;

    // Finalize last phase
    const lastPhase = buildStatus.phaseSummary[buildStatus.phaseSummary.length - 1];
    if (lastPhase && lastPhase.status === 'running') {
        lastPhase.status = code === 0 ? 'success' : 'failed';
        lastPhase.endedAt = buildStatus.endedAt;
        lastPhase.durationMs = Date.now() - new Date(lastPhase.startedAt).getTime();
    }

    // Extract error summary from logs
    const errorMarkers = [
        'FAILED_PRECHECK:',
        'What went wrong:',
        'error: resource style/',
        'SigningConfig "release" is missing',
        'keystore password was incorrect',
        'Execution failed for task',
        'Build failed'
    ];
    if (code !== 0) {
        buildStatus.errorSummary = null;
        for (let i = logBuffer.length - 1; i >= 0; i--) {
            const msg = logBuffer[i].message;
            if (errorMarkers.some(m => msg.includes(m))) {
                buildStatus.errorSummary = msg.trim();
                break;
            }
        }
    }

    const fileExists = buildStatus.outputPath && fs.existsSync(buildStatus.outputPath);
    
    if (code === 0 && fileExists) {
        buildStatus.status = 'success';
        buildStatus.currentPhase = 'Complete';
    } else if (code === 0 && !fileExists) {
        buildStatus.status = 'failed';
        buildStatus.currentPhase = 'Failed';
        buildStatus.errorSummary = buildStatus.errorSummary || 'Build process exited OK but output artifact not found.';
    } else {
        buildStatus.status = 'failed';
        buildStatus.currentPhase = 'Failed';
        if (!buildStatus.errorSummary) buildStatus.errorSummary = `Process exited with code ${code}`;
    }

    // Record Build History
    if (code === 0 && fileExists) {
        const versions = resolveAppVersion(path.join(WORKSPACE_ROOT, buildStatus.currentAppRoot || ""));
        addBuildToHistory({
            appId: buildStatus.currentApp,
            versionName: versions.versionName,
            versionCode: versions.versionCode,
            buildType: buildStatus.buildType,
            artifactPath: buildStatus.outputPath,
            status: 'success'
        });
    }

    // Save log file
    try {
        const ts = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('-').slice(0, 19);
        const filename = `${buildStatus.currentApp}-${buildStatus.buildType}-${ts}-${buildStatus.status}.log`;
        const header = [
            `App: ${buildStatus.currentApp}`,
            `Type: ${buildStatus.buildType}`,
            `Status: ${buildStatus.status}`,
            `Exit Code: ${buildStatus.exitCode}`,
            `Started: ${buildStatus.startedAt}`,
            `Ended: ${buildStatus.endedAt}`,
            `Elapsed: ${Math.round(buildStatus.elapsedMs / 1000)}s`,
            buildStatus.outputPath ? `Artifact: ${buildStatus.outputPath}` : '',
            buildStatus.errorSummary ? `Error: ${buildStatus.errorSummary}` : '',
            '---'
        ].filter(Boolean).join('\n');
        const content = header + '\n' + logBuffer.map(l => `[${l.timestamp}] [${l.source.toUpperCase()}] ${l.message}`).join('\n');
        const logPath = path.join(LOGS_DIR, filename);
        fs.writeFileSync(logPath, content);
        buildStatus.savedLogPath = logPath;

        addLogLine(`Log saved to logs/${filename}`, 'system', broadcast);
    } catch (e) { /* non-fatal */ }

    broadcast({ type: 'status', data: getBuildStatus() });
    buildProcess = null;
}

function cancelBuild(broadcast) {
    if (buildProcess) {
        const pid = buildProcess.pid;
        exec(`taskkill /F /T /PID ${pid}`, () => {
            buildStatus.running = false;
            buildStatus.status = 'cancelled';
            buildStatus.endedAt = new Date().toISOString();
            buildStatus.elapsedMs = Date.now() - new Date(buildStatus.startedAt).getTime();
            buildStatus.currentPhase = 'Cancelled';

            const lastPhase = buildStatus.phaseSummary[buildStatus.phaseSummary.length - 1];
            if (lastPhase && lastPhase.status === 'running') {
                lastPhase.status = 'cancelled';
            }

            // Save log on cancel too
            try {
                const ts = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('-').slice(0, 19);
                const filename = `${buildStatus.currentApp}-${buildStatus.buildType}-${ts}-cancelled.log`;
                const content = logBuffer.map(l => `[${l.timestamp}] ${l.message}`).join('\n');
                const logPath = path.join(LOGS_DIR, filename);
                fs.writeFileSync(logPath, content);
                buildStatus.savedLogPath = logPath;
            } catch (e) { /* non-fatal */ }

            broadcast({ type: 'status', data: getBuildStatus() });
            buildProcess = null;
        });
        return { success: true };
    }
    return { error: 'No build running' };
}

module.exports = { getBuildStatus, getLogs, clearLogs, startBuild, cancelBuild };
