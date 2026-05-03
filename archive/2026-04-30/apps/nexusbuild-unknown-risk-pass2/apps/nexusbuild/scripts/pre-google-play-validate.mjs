import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const args = process.argv.slice(2);
const readArg = (name) => {
  const index = args.indexOf(name);
  if (index >= 0 && index + 1 < args.length) {
    return args[index + 1];
  }

  const inline = args.find((arg) => arg.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : null;
};

const fileExists = async (relativePath) => {
  try {
    await access(path.join(rootDir, relativePath));
    return true;
  } catch {
    return false;
  }
};

const readEnvFile = async (relativePath) => {
  const absolutePath = path.join(rootDir, relativePath);
  const raw = await readFile(absolutePath, 'utf8');
  const map = new Map();

  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^"(.*)"$/, '$1')
      .replace(/^'(.*)'$/, '$1');

    map.set(key, value);
  });

  return map;
};

const normalizeApiBaseUrl = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const withoutSlash = raw.endsWith('/') ? raw.slice(0, -1) : raw;
  return withoutSlash.endsWith('/api') ? withoutSlash : `${withoutSlash}/api`;
};

const normalizeOrigin = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    return new URL(raw).origin;
  } catch {
    return '';
  }
};

const checks = [];
const addCheck = (label, ok, detail, severity = 'error') => {
  checks.push({ label, ok, detail, severity });
};

const defaultMobileEnvPath = (await fileExists('apps/mobile/.env.release'))
  ? 'apps/mobile/.env.release'
  : (await fileExists('apps/mobile/.env'))
    ? 'apps/mobile/.env'
    : 'apps/mobile/.env.example';

const defaultWorkerEnvPath = (await fileExists('apps/backend-worker/.dev.vars'))
  ? 'apps/backend-worker/.dev.vars'
  : 'apps/backend-worker/.dev.vars.example';

const mobileEnvPath = readArg('--mobile-env') || defaultMobileEnvPath;
const workerEnvPath = readArg('--worker-env') || defaultWorkerEnvPath;

const mobileEnv = (await fileExists(mobileEnvPath))
  ? await readEnvFile(mobileEnvPath)
  : new Map();
const workerEnv = (await fileExists(workerEnvPath))
  ? await readEnvFile(workerEnvPath)
  : new Map();

const appConfigFactory = require(path.join(rootDir, 'apps/mobile/app.config.js'));
const appConfig = appConfigFactory({ config: {} });
const easConfig = JSON.parse(
  await readFile(path.join(rootDir, 'apps/mobile/eas.json'), 'utf8'),
);

const productionProfile = easConfig?.build?.production;
const productionApkProfile = easConfig?.build?.['production-apk'];
const deepLinkScheme = String(appConfig?.scheme || '').trim();
const deepLinkIntentFilters = Array.isArray(appConfig?.android?.intentFilters)
  ? appConfig.android.intentFilters
  : [];

const hasIntentFilterMatch = deepLinkIntentFilters.some((filter) =>
  Array.isArray(filter?.data) &&
  filter.data.some((entry) => {
    const schemeMatches = String(entry?.scheme || '') === deepLinkScheme;
    const hostMatches = String(entry?.host || '') === 'auth';
    const pathMatches = String(entry?.pathPrefix || '') === '/callback';
    return schemeMatches && hostMatches && pathMatches;
  }),
);

addCheck(
  'Expo deep-link scheme is configured',
  Boolean(deepLinkScheme),
  deepLinkScheme ? `scheme=${deepLinkScheme}` : 'Missing app scheme in app.config.js',
);

addCheck(
  'Android intent filter matches auth callback',
  hasIntentFilterMatch,
  hasIntentFilterMatch
    ? `${deepLinkScheme}://auth/callback intent filter found`
    : 'Missing Android intent filter for nexusbuild://auth/callback',
);

addCheck(
  'EAS production profile exists',
  Boolean(productionProfile),
  productionProfile ? 'apps/mobile/eas.json build.production found' : 'Missing build.production',
);

addCheck(
  'EAS production-apk profile exists',
  Boolean(productionApkProfile),
  productionApkProfile
    ? 'apps/mobile/eas.json build.production-apk found'
    : 'Missing build.production-apk (required for release APK smoke tests)',
);

addCheck(
  'production-apk builds APK artifact',
  String(productionApkProfile?.android?.buildType || '') === 'apk',
  productionApkProfile?.android?.buildType
    ? `buildType=${productionApkProfile.android.buildType}`
    : 'Missing android.buildType=apk in production-apk profile',
);

const requiredWorkerEnvKeys = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_OAUTH_ORIGIN',
];

requiredWorkerEnvKeys.forEach((key) => {
  const value = String(workerEnv.get(key) || '').trim();
  addCheck(
    `Worker env has ${key}`,
    Boolean(value),
    value ? `${key} set` : `${key} missing in ${workerEnvPath}`,
  );
});

const mobileApiBaseUrl = normalizeApiBaseUrl(
  readArg('--api-base-url') ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    mobileEnv.get('EXPO_PUBLIC_API_BASE_URL') ||
    appConfig?.extra?.apiBaseUrl,
);

addCheck(
  'Mobile release API base URL is configured',
  Boolean(mobileApiBaseUrl),
  mobileApiBaseUrl || `Missing EXPO_PUBLIC_API_BASE_URL in ${mobileEnvPath}`,
);

const oauthOriginFromWorker = normalizeOrigin(workerEnv.get('GOOGLE_OAUTH_ORIGIN'));
const expectedOauthOrigin =
  normalizeOrigin(readArg('--expected-oauth-origin')) || oauthOriginFromWorker;

addCheck(
  'Expected OAuth origin is available for parity checks',
  Boolean(expectedOauthOrigin),
  expectedOauthOrigin || 'Provide GOOGLE_OAUTH_ORIGIN in worker env or pass --expected-oauth-origin',
);

const backendGoogleClientId = String(workerEnv.get('GOOGLE_CLIENT_ID') || '').trim();
const mobileGoogleClientId = String(
  mobileEnv.get('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID') ||
    mobileEnv.get('EXPO_PUBLIC_GOOGLE_CLIENT_ID') ||
    '',
).trim();

if (mobileGoogleClientId) {
  addCheck(
    'Mobile Google client ID matches backend Google client ID',
    mobileGoogleClientId === backendGoogleClientId,
    `mobile=${mobileGoogleClientId.slice(0, 16)}... backend=${backendGoogleClientId.slice(0, 16)}...`,
  );
} else {
  addCheck(
    'Mobile Google client ID override is optional for backend-driven OAuth',
    true,
    'No EXPO_PUBLIC_GOOGLE_CLIENT_ID override detected (expected for backend OAuth flow).',
    'warning',
  );
}

if (mobileApiBaseUrl) {
  try {
    const healthResponse = await fetch(`${mobileApiBaseUrl}/health`);
    addCheck(
      'Release API /health endpoint is reachable',
      healthResponse.ok,
      `GET ${mobileApiBaseUrl}/health -> ${healthResponse.status}`,
    );
  } catch (error) {
    addCheck(
      'Release API /health endpoint is reachable',
      false,
      `Network error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  try {
    const redirectResponse = await fetch(
      `${mobileApiBaseUrl}/auth/google/redirect_url?platform=mobile`,
    );

    if (!redirectResponse.ok) {
      const rawBody = await redirectResponse.text();
      addCheck(
        'Google redirect_url endpoint is live in release API',
        false,
        `GET /auth/google/redirect_url -> ${redirectResponse.status} ${rawBody.slice(0, 160)}`,
      );
    } else {
      const payload = await redirectResponse.json();
      const redirectUrl = String(payload?.redirectUrl || '');
      const parsed = new URL(redirectUrl);
      const redirectUri = parsed.searchParams.get('redirect_uri') || '';
      const redirectUriOrigin = normalizeOrigin(redirectUri);
      const redirectClientId = parsed.searchParams.get('client_id') || '';

      addCheck(
        'Google redirect_url returns a redirect URI',
        Boolean(redirectUri),
        redirectUri || 'No redirect_uri query param in redirectUrl payload',
      );

      addCheck(
        'Live Google redirect URI origin matches expected OAuth origin',
        expectedOauthOrigin ? redirectUriOrigin === expectedOauthOrigin : Boolean(redirectUriOrigin),
        `redirect_uri origin=${redirectUriOrigin || 'N/A'} expected=${expectedOauthOrigin || 'N/A'}`,
      );

      addCheck(
        'Live Google redirect URL includes client_id',
        Boolean(redirectClientId),
        redirectClientId ? `client_id present (${redirectClientId.slice(0, 16)}...)` : 'Missing client_id in redirect URL',
      );
    }
  } catch (error) {
    addCheck(
      'Google redirect_url endpoint is live in release API',
      false,
      `Network error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

const failures = checks.filter((check) => !check.ok && check.severity !== 'warning');
const warnings = checks.filter((check) => check.severity === 'warning');

console.log('Pre-Google Play Validation (Automated Checks)');
console.log('============================================');
console.log(`Mobile env file: ${mobileEnvPath}`);
console.log(`Worker env file: ${workerEnvPath}`);
console.log('');

for (const check of checks) {
  const marker = check.ok ? '[ok]' : check.severity === 'warning' ? '[!]' : '[x]';
  console.log(`${marker} ${check.label}`);
  console.log(`    ${check.detail}`);
}

console.log('');
console.log('Manual Release Matrix (Required)');
console.log('===============================');
console.log('1) Build release artifacts');
console.log('   - AAB: npm run release:aab');
console.log('   - APK: npm run release:apk');
console.log('2) Install release APK on at least 2 Android versions and run auth matrix:');
console.log('   - Email register/login/logout');
console.log('   - Google OAuth success/cancel/deny');
console.log('   - Confirm no white screen, no translation-key text, no silent auth failures');
console.log('3) Upload AAB to Google Play Internal Testing and install from Play link');
console.log('4) Re-run critical smoke flows on Play-installed build:');
console.log('   - Builder');
console.log('   - Budget allocation');
console.log('   - Add selected / Add all');
console.log('   - Save build');
console.log('   - Community fetch');
console.log('5) Verify logs and rollout safety:');
console.log('   - Confirm auth failures are logged (client + backend)');
console.log('   - Keep previous stable production version available');
console.log('   - Rollout 10% -> 50% -> 100% with monitoring gates');

if (warnings.length > 0) {
  console.log('');
  console.log(`Warnings: ${warnings.length}`);
}

if (failures.length > 0) {
  console.log('');
  console.log(`FAILED checks: ${failures.length}`);
  process.exitCode = 1;
} else {
  console.log('');
  console.log('All automated parity checks passed. Continue with manual matrix above.');
}
