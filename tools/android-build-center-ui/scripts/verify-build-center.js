const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const appsJsonPath = path.join(root, '..', 'android-build-center', 'apps.json');
const gitignorePath = path.join(root, '..', '..', '.gitignore');
const publicScriptPath = path.join(root, 'public', 'script.js');
const normalizePath = path.join(root, 'public', 'src', 'utils', 'normalizeApp.js');
const renderAppsPath = path.join(root, 'public', 'src', 'render', 'renderApps.js');
const indexHtmlPath = path.join(root, 'public', 'index.html');

let failCount = 0;

function logResult(check, pass, details = '') {
    const icon = pass ? '✅' : '❌';
    console.log(`${icon} ${check}`);
    if (!pass) {
        console.log(`   └─ ${details}`);
        failCount++;
    }
}

console.log('--- NStep Build Center Verification ---\n');

// 1. Check apps.json for secrets
if (fs.existsSync(appsJsonPath)) {
    try {
        const apps = JSON.parse(fs.readFileSync(appsJsonPath, 'utf8'));
        let hasSecrets = false;
        Object.values(apps).forEach(app => {
            if (app.storePassword || app.keyPassword || app.password) hasSecrets = true;
        });
        logResult('apps.json contains no secrets', !hasSecrets, 'Found password fields in apps.json!');
    } catch (e) {
        logResult('apps.json is valid JSON', false, 'Failed to parse apps.json');
    }
} else {
    logResult('apps.json exists', false, 'apps.json not found');
}

// 2. Check for UI anti-patterns across public/src
const srcDir = path.join(root, 'public', 'src');
let foundBlockingUI = false;
if (fs.existsSync(srcDir)) {
    const walk = (dir) => {
        fs.readdirSync(dir).forEach(f => {
            const p = path.join(dir, f);
            if (fs.statSync(p).isDirectory()) return walk(p);
            if (p.endsWith('.js')) {
                const c = fs.readFileSync(p, 'utf8');
                if (/alert\(|confirm\(|prompt\(/.test(c)) {
                    foundBlockingUI = true;
                    console.log('  Found blocking UI in:', p);
                }
            }
        });
    };
    walk(srcDir);
}
logResult('Frontend uses no blocking alerts/prompts', !foundBlockingUI, foundBlockingUI ? 'Found alert/confirm/prompt in public/src' : '');


// 2b. Check normalizeApp exists and renderApps uses it
if (fs.existsSync(normalizePath)) {
    logResult('normalizeApp exists', true);
} else {
    logResult('normalizeApp exists', false, 'public/src/utils/normalizeApp.js missing');
}

if (fs.existsSync(renderAppsPath)) {
    const content = fs.readFileSync(renderAppsPath, 'utf8');
    const usesNormalize = /normalizeApp/.test(content);
    const directToUpper = /\.classification\s*\|\|\s*'unknown'\)\.toUpperCase\(|\.credentialState\s*\|\|\s*'missing'\)\.toUpperCase\(/.test(content);
    logResult('renderApps imports/uses normalizeApp', usesNormalize, 'renderApps does not reference normalizeApp');
    logResult('renderApps does not call .toUpperCase() on raw fields', !directToUpper, 'Found direct .toUpperCase() usage');
} else {
    logResult('renderApps exists', false, 'public/src/render/renderApps.js missing');
}

// 2c. Check index.html cache-busting or server header change
if (fs.existsSync(indexHtmlPath)) {
    const content = fs.readFileSync(indexHtmlPath, 'utf8');
    const hasCacheBust = /src\/main.js\?v=/.test(content);
    logResult('index.html has module cache-busting', hasCacheBust, 'index.html missing ?v= cache-bust on module import');
} else {
    logResult('index.html exists', false, 'public/index.html missing');
}

// 2d. Check server.js static headers for no-store
const serverPath = path.join(root, 'server.js');
if (fs.existsSync(serverPath)) {
    const scontent = fs.readFileSync(serverPath, 'utf8');
    const hasNoStore = /no-store|no-cache|must-revalidate/.test(scontent);
    logResult('server.js sets no-cache headers for dev static assets', hasNoStore, 'server.js missing Cache-Control no-store headers');
} else {
    logResult('server.js exists', false, 'server.js not found at expected path');
}

// 2e. Check appRoutes normalizes /api/apps fields
const appRoutesPath = path.join(root, 'src', 'routes', 'appRoutes.js');
if (fs.existsSync(appRoutesPath)) {
    const acontent = fs.readFileSync(appRoutesPath, 'utf8');
    const checks = ['classification', 'credentialState', 'safeMessage', 'keystoreFound', 'passwordSourceFound', 'credentialsLoaded', 'credentialsValidated', 'alreadyOnGooglePlay', 'productionWarning', 'isProduction', 'readiness', 'warnings', 'nextActions'];
    const missing = checks.filter(k => !acontent.includes(k));
    logResult('/src/routes/appRoutes.js normalizes required public fields', missing.length === 0, missing.length ? `Missing fields in appRoutes.js: ${missing.join(', ')}` : '');
} else {
    logResult('appRoutes.js exists', false, 'src/routes/appRoutes.js missing');
}

// 3. Check .gitignore for security invariants
if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    const hasKeystore = content.includes('*.keystore');
    const hasJks = content.includes('*.jks');
    const hasTempProps = content.includes('signing.temp.properties');
    const hasPrivateKeys = content.includes('private-keys/');
    logResult('Security invariants in .gitignore', hasKeystore && hasJks && hasTempProps && hasPrivateKeys, 'Missing critical ignore rules in .gitignore');
}

// 4. Check for required documentation
const docs = ['FEATURE_CONTRACT.md', 'SECURITY_RULES.md', 'ARCHITECTURE.md', 'CHANGELOG.md'];
docs.forEach(doc => {
    const docPath = path.join(root, 'docs', doc);
    logResult(`Documentation exists: ${doc}`, fs.existsSync(docPath), `${doc} is missing from docs/ directory`);
});

// 5. Check for logs directory
const logsDir = path.join(root, 'logs');
logResult('Logs directory exists', fs.existsSync(logsDir), 'logs/ directory is missing');

console.log(`\nVerification finished. ${failCount} failures found.`);
process.exit(failCount > 0 ? 1 : 0);
