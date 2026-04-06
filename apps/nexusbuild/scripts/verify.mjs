import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const commandName = (base) => (process.platform === 'win32' ? `${base}.cmd` : base);

const tasks = {
    mobile: [
        {
            label: 'mobile tests',
            command: commandName('npm'),
            args: ['test', '--', '--runInBand'],
            cwd: 'apps/mobile',
        },
        {
            label: 'mobile android export',
            command: commandName('npx'),
            args: ['expo', 'export', '--platform', 'android', '--output-dir', '.expo-export-verify'],
            cwd: 'apps/mobile',
            cleanup: '.expo-export-verify',
        },
    ],
    web: [
        {
            label: 'web build',
            command: commandName('npm'),
            args: ['run', 'build'],
            cwd: 'apps/web',
        },
    ],
    'web-amazon': [
        {
            label: 'web-amazon build',
            command: commandName('npm'),
            args: ['run', 'build'],
            cwd: 'apps/web-amazon',
        },
    ],
    backend: [
        {
            label: 'backend build',
            command: commandName('npm'),
            args: ['run', 'build'],
            cwd: 'apps/backend',
        },
    ],
};

const requestedTargets = process.argv.slice(2);
const selectedTargets = requestedTargets.length === 0 || requestedTargets.includes('all')
    ? ['mobile', 'web', 'web-amazon', 'backend']
    : requestedTargets;

for (const target of selectedTargets) {
    if (!tasks[target]) {
        console.error(`[verify] Unknown target: ${target}`);
        process.exit(1);
    }
}

const runTask = (task) => new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const command = isWindows ? 'cmd.exe' : task.command;
    const args = isWindows
        ? ['/d', '/s', '/c', task.command, ...task.args]
        : task.args;

    const child = spawn(command, args, {
        cwd: path.join(rootDir, task.cwd),
        stdio: 'inherit',
        shell: false,
    });

    child.on('exit', (code) => {
        if (code === 0) {
            resolve();
            return;
        }
        reject(new Error(`${task.label} failed with exit code ${code ?? 'unknown'}`));
    });

    child.on('error', reject);
});

for (const target of selectedTargets) {
    console.log(`[verify] Running ${target}`);

    for (const task of tasks[target]) {
        try {
            await runTask(task);
        } finally {
            if (task.cleanup) {
                await rm(path.join(rootDir, task.cwd, task.cleanup), { recursive: true, force: true });
            }
        }
    }
}

console.log('[verify] All requested checks passed.');
