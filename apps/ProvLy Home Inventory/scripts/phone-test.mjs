import { execSync, spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = path.join(rootDir, 'apps', 'backend');
const mobileDir = path.join(rootDir, 'apps', 'mobile');
const prepareScriptPath = path.join(rootDir, 'scripts', 'prepare-phone-env.mjs');
const npmCmd = 'npm';
const metroPort = 8099;

let backendProc = null;
let expoProc = null;

function parseEnv(content) {
    const out = {};
    for (const raw of content.split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line.startsWith('#')) continue;
        const idx = line.indexOf('=');
        if (idx <= 0) continue;
        out[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
    return out;
}

function readBackendPort() {
    try {
        const backendEnv = parseEnv(fs.readFileSync(path.join(backendDir, '.env'), 'utf8'));
        return Number(backendEnv.PORT || 4000);
    } catch {
        return 4000;
    }
}

function requestText(url, timeoutMs = 3500) {
    return new Promise((resolve, reject) => {
        const req = http.get(url, { timeout: timeoutMs }, (res) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                resolve({ status: res.statusCode || 0, body });
            });
        });
        req.on('error', reject);
        req.on('timeout', () => req.destroy(new Error('timeout')));
    });
}

async function requestJson(url, timeoutMs = 3500) {
    const result = await requestText(url, timeoutMs);
    return JSON.parse(result.body);
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(checkFn, label, timeoutMs = 60000, intervalMs = 1000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        try {
            const ok = await checkFn();
            if (ok) return;
        } catch {
            // keep polling
        }
        await sleep(intervalMs);
    }
    throw new Error(`${label} was not ready within ${Math.round(timeoutMs / 1000)}s`);
}

function findListeningPids(port) {
    if (process.platform === 'win32') {
        try {
            const output = execSync(`netstat -ano -p tcp | findstr :${port}`, { encoding: 'utf8' });
            const pids = new Set();
            for (const raw of output.split(/\r?\n/)) {
                const line = raw.trim();
                if (!line || !line.includes('LISTENING')) continue;
                const parts = line.split(/\s+/);
                const pid = Number(parts[parts.length - 1]);
                if (Number.isInteger(pid) && pid > 0) pids.add(pid);
            }
            return [...pids];
        } catch {
            return [];
        }
    }

    try {
        const output = execSync(`lsof -t -i:${port} -sTCP:LISTEN`, { encoding: 'utf8' });
        return output
            .split(/\r?\n/)
            .map((v) => Number(v.trim()))
            .filter((n) => Number.isInteger(n) && n > 0);
    } catch {
        return [];
    }
}

function killPid(pid) {
    if (!pid) return;
    if (process.platform === 'win32') {
        spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
        return;
    }
    try {
        process.kill(pid, 'SIGTERM');
    } catch {
        // noop
    }
}

function killPortListeners(port) {
    const pids = findListeningPids(port);
    for (const pid of pids) killPid(pid);
    return pids.length;
}

async function probeBackend(backendPort) {
    try {
        return await requestJson(`http://127.0.0.1:${backendPort}/health`, 2000);
    } catch {
        return null;
    }
}

async function ensureBackend(backendPort) {
    const running = await probeBackend(backendPort);
    if (running?.ok && running?.service === 'provly-backend') {
        console.log(`[phone:test] Reusing backend on :${backendPort}.`);
        return;
    }

    if (running?.ok && running?.service !== 'provly-backend') {
        console.log(
            `[phone:test] Found stale backend service "${running.service}" on :${backendPort}. Restarting with current source.`
        );
        killPortListeners(backendPort);
    } else {
        const killed = killPortListeners(backendPort);
        if (killed > 0) {
            console.log(`[phone:test] Cleared ${killed} process(es) on :${backendPort}.`);
        }
    }

    backendProc = spawn(npmCmd, ['run', 'dev'], {
        cwd: backendDir,
        stdio: 'inherit',
        env: process.env,
        shell: process.platform === 'win32',
    });

    await waitFor(async () => {
        const health = await probeBackend(backendPort);
        return !!health?.ok && !!health?.service;
    }, 'Backend health');

    const health = await probeBackend(backendPort);
    if (health?.service !== 'provly-backend') {
        throw new Error(`Backend started but unexpected service "${health?.service || 'unknown'}" responded.`);
    }
}

async function ensureExpo() {
    try {
        const existing = await requestText(`http://127.0.0.1:${metroPort}`, 1500);
        if (existing.status === 200 && existing.body.includes('<title>ProvLy</title>')) {
            console.log(`[phone:test] Reusing Expo Metro on :${metroPort}.`);
            return;
        }
    } catch {
        // no running server
    }

    const killed = killPortListeners(metroPort);
    if (killed > 0) {
        console.log(`[phone:test] Cleared ${killed} process(es) on :${metroPort}.`);
    }

    expoProc = spawn(npmCmd, ['run', 'start', '--', '--tunnel', '--clear', '--port', String(metroPort), '--non-interactive'], {
        cwd: mobileDir,
        stdio: 'inherit',
        env: process.env,
        shell: process.platform === 'win32',
    });

    await waitFor(async () => {
        try {
            const r = await requestText(`http://127.0.0.1:${metroPort}`, 2000);
            return r.status === 200;
        } catch {
            return false;
        }
    }, 'Expo Metro', 120000, 1500);
}

function cleanup() {
    if (expoProc?.pid) killPid(expoProc.pid);
    if (backendProc?.pid) killPid(backendProc.pid);
}

process.on('SIGINT', () => {
    cleanup();
    process.exit(0);
});

process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
});

process.on('exit', () => {
    cleanup();
});

const prep = spawnSync(process.execPath, [prepareScriptPath], {
    cwd: rootDir,
    stdio: 'inherit',
    env: process.env,
});

if (prep.status !== 0) {
    process.exit(prep.status || 1);
}

const backendPort = readBackendPort();

try {
    await ensureBackend(backendPort);
    await ensureExpo();
    console.log('\n[phone:test] Ready for Expo Go phone testing.');
    console.log(`[phone:test] Backend health: http://127.0.0.1:${backendPort}/health`);
    console.log(`[phone:test] Metro web: http://127.0.0.1:${metroPort}`);
    if (expoProc) {
        await new Promise((resolve) => expoProc.on('exit', resolve));
    } else {
        await new Promise(() => {});
    }
} catch (error) {
    console.error(`[phone:test] ${error.message}`);
    cleanup();
    process.exit(1);
}
