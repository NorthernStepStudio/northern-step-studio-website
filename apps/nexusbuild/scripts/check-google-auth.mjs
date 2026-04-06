import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const readJson = async (relativePath) => {
    const raw = await readFile(path.join(rootDir, relativePath), 'utf8');
    return JSON.parse(raw);
};

const readEnvFile = async (relativePath) => {
    const raw = await readFile(path.join(rootDir, relativePath), 'utf8');
    const map = new Map();

    raw.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const separatorIndex = trimmed.indexOf('=');
        if (separatorIndex === -1) return;

        const key = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed.slice(separatorIndex + 1).trim().replace(/^"(.*)"$/, '$1');
        map.set(key, value);
    });

    return map;
};

const checks = [];

const addCheck = (label, ok, detail) => {
    checks.push({ label, ok, detail });
};

const requiredMobileEnvKeys = [
    'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
    'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID',
    'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
];

const requiredBackendEnvKeys = [
    'GOOGLE_WEB_CLIENT_ID',
    'GOOGLE_ANDROID_CLIENT_ID',
    'GOOGLE_IOS_CLIENT_ID',
];

try {
    const mobilePackage = await readJson('apps/mobile/package.json');
    const appConfig = await readJson('apps/mobile/app.json');
    const easConfig = await readJson('apps/mobile/eas.json');
    const mobileEnv = await readEnvFile('apps/mobile/.env');
    const backendEnv = await readEnvFile('apps/backend/.env');

    const expoConfig = appConfig.expo || {};
    const mobileDependencies = {
        ...(mobilePackage.dependencies || {}),
        ...(mobilePackage.devDependencies || {}),
    };
    const plugins = Array.isArray(expoConfig.plugins) ? expoConfig.plugins : [];
    const pluginNames = plugins.map((entry) => Array.isArray(entry) ? entry[0] : entry);
    const developmentProfile = easConfig.build?.development;

    addCheck(
        'Mobile has expo-dev-client installed',
        Boolean(mobileDependencies['expo-dev-client']),
        mobileDependencies['expo-dev-client'] || 'Missing from apps/mobile/package.json'
    );
    addCheck(
        'Mobile app config includes expo-dev-client plugin',
        pluginNames.includes('expo-dev-client'),
        pluginNames.includes('expo-dev-client') ? 'Configured' : 'Missing from apps/mobile/app.json plugins'
    );
    addCheck(
        'Mobile app scheme is set',
        Boolean(expoConfig.scheme),
        expoConfig.scheme ? `${expoConfig.scheme}://oauthredirect` : 'Missing app scheme'
    );
    addCheck(
        'iOS bundle identifier is set',
        Boolean(expoConfig.ios?.bundleIdentifier),
        expoConfig.ios?.bundleIdentifier || 'Missing ios.bundleIdentifier'
    );
    addCheck(
        'Android package is set',
        Boolean(expoConfig.android?.package),
        expoConfig.android?.package || 'Missing android.package'
    );
    addCheck(
        'EAS development profile is enabled',
        Boolean(developmentProfile?.developmentClient),
        developmentProfile?.developmentClient ? 'developmentClient=true' : 'Missing build.development.developmentClient'
    );

    requiredMobileEnvKeys.forEach((key) => {
        addCheck(
            `Mobile env has ${key}`,
            Boolean(mobileEnv.get(key)),
            mobileEnv.get(key) ? 'Configured' : 'Missing or empty in apps/mobile/.env'
        );
    });

    requiredBackendEnvKeys.forEach((key) => {
        addCheck(
            `Backend env has ${key}`,
            Boolean(backendEnv.get(key)),
            backendEnv.get(key) ? 'Configured' : 'Missing or empty in apps/backend/.env'
        );
    });

    const failedChecks = checks.filter((check) => !check.ok);

    console.log('Google auth readiness');
    console.log('=====================');
    for (const check of checks) {
        const marker = check.ok ? '[ok]' : '[x]';
        console.log(`${marker} ${check.label}: ${check.detail}`);
    }

    console.log('');
    console.log('Next steps');
    console.log('==========');
    console.log('1. Start the backend: npm run dev:api');
    console.log('   This now starts apps/backend (Node/TypeScript) on http://localhost:3000 by default.');
    console.log('2. Build a dev client: npm run build:mobile:dev:ios');
    console.log('3. Start Metro for the dev client: npm run dev:mobile:client');
    console.log('4. Open the installed NexusBuild dev app and tap "Continue with Google".');

    if (failedChecks.length) {
        process.exitCode = 1;
    }
} catch (error) {
    console.error('Google auth readiness check failed.');
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
}
