import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mobileEnvPath = path.join(rootDir, 'apps', 'mobile', '.env');
const mobileEnvExamplePath = path.join(rootDir, 'apps', 'mobile', '.env.example');
const backendEnvPath = path.join(rootDir, 'apps', 'backend', '.env');
const projectEnvPath = path.join(rootDir, '.env');
const networkSecurityConfigPath = path.join(rootDir, 'apps', 'mobile', 'network_security_config.xml');

function safeRead(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch {
        return '';
    }
}

function parseEnv(content) {
    const out = {};
    const lines = content.split(/\r?\n/);
    for (const raw of lines) {
        const line = raw.trim();
        if (!line || line.startsWith('#')) continue;
        const idx = line.indexOf('=');
        if (idx <= 0) continue;
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();
        out[key] = value;
    }
    return out;
}

function upsertEnv(content, key, value) {
    const normalized = content || '';
    const re = new RegExp(`^${key}=.*$`, 'm');
    if (re.test(normalized)) {
        return normalized.replace(re, `${key}=${value}`);
    }
    const separator = normalized.endsWith('\n') || normalized.length === 0 ? '' : '\n';
    return `${normalized}${separator}${key}=${value}\n`;
}

function detectLanHost() {
    const interfaces = os.networkInterfaces();
    const candidates = [];

    for (const records of Object.values(interfaces)) {
        if (!records) continue;
        for (const entry of records) {
            if (entry.family !== 'IPv4' || entry.internal) continue;
            const ip = entry.address;
            if (
                ip.startsWith('10.') ||
                ip.startsWith('192.168.') ||
                /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
            ) {
                candidates.push(ip);
            }
        }
    }

    return candidates[0] || null;
}

function hostFromUrl(url) {
    if (!url) return null;
    try {
        return new URL(url).hostname;
    } catch {
        return null;
    }
}

function refFromUrl(url) {
    const host = hostFromUrl(url);
    return host ? host.split('.')[0] || null : null;
}

function refFromJwt(token) {
    if (!token || !token.includes('.')) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        return payload?.ref || null;
    } catch {
        return null;
    }
}

function ensureDomain(xml, domain) {
    if (!domain) return xml;
    const row = `        <domain includeSubdomains="true">${domain}</domain>`;
    if (xml.includes(row)) return xml;
    if (xml.includes(`>${domain}</domain>`)) return xml;
    return xml.replace(
        '</domain-config>',
        `${row}\n    </domain-config>`
    );
}

const backendEnv = parseEnv(safeRead(backendEnvPath));
const projectEnv = parseEnv(safeRead(projectEnvPath));
const mobileCurrentRaw = safeRead(mobileEnvPath) || safeRead(mobileEnvExamplePath);
const mobileEnv = parseEnv(mobileCurrentRaw);

const supabaseUrl = backendEnv.SUPABASE_URL || projectEnv.SUPABASE_URL || mobileEnv.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
    backendEnv.SUPABASE_ANON_KEY || projectEnv.SUPABASE_ANON_KEY || mobileEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = backendEnv.SUPABASE_SERVICE_ROLE_KEY || projectEnv.SUPABASE_SERVICE_ROLE_KEY || '';
const revenueCatAndroidKey = mobileEnv.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || '';
const revenueCatIosKey = mobileEnv.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '';
const revenueCatLegacyKey = mobileEnv.EXPO_PUBLIC_REVENUECAT_KEY || '';
const backendPort = Number(backendEnv.PORT || projectEnv.PORT || mobileEnv.EXPO_PUBLIC_API_PORT || 4000);
const detectedLanHost = detectLanHost();
const lanHost = detectedLanHost || mobileEnv.EXPO_PUBLIC_LAN_HOST || '127.0.0.1';

let mobileNext = mobileCurrentRaw || '';
mobileNext = upsertEnv(mobileNext, 'EXPO_PUBLIC_LAN_HOST', lanHost);
mobileNext = upsertEnv(mobileNext, 'EXPO_PUBLIC_API_PORT', String(backendPort));
mobileNext = upsertEnv(mobileNext, 'EXPO_PUBLIC_API_BASE_URL', `http://${lanHost}:${backendPort}/v1`);
mobileNext = upsertEnv(mobileNext, 'EXPO_PUBLIC_BACKEND_URL', `http://${lanHost}:${backendPort}`);
if (supabaseUrl) mobileNext = upsertEnv(mobileNext, 'EXPO_PUBLIC_SUPABASE_URL', supabaseUrl);
if (supabaseAnonKey) mobileNext = upsertEnv(mobileNext, 'EXPO_PUBLIC_SUPABASE_ANON_KEY', supabaseAnonKey);

fs.writeFileSync(mobileEnvPath, `${mobileNext.trimEnd()}\n`, 'utf8');

const supabaseHost = hostFromUrl(supabaseUrl);
const networkXml = safeRead(networkSecurityConfigPath);
if (networkXml) {
    let updatedXml = networkXml;
    for (const domain of ['localhost', '10.0.2.2', lanHost, supabaseHost]) {
        updatedXml = ensureDomain(updatedXml, domain);
    }
    fs.writeFileSync(networkSecurityConfigPath, updatedXml, 'utf8');
}

const urlRef = refFromUrl(supabaseUrl);
const serviceRef = refFromJwt(supabaseServiceKey);
if (urlRef && serviceRef && urlRef !== serviceRef) {
    console.warn(
        `Warning: SUPABASE_SERVICE_ROLE_KEY project (${serviceRef}) does not match SUPABASE_URL (${urlRef}).`
    );
    console.warn('Backend admin routes may fail until you replace the service role key with the matching project key.');
}

if (!revenueCatAndroidKey && !revenueCatIosKey && revenueCatLegacyKey.toLowerCase().startsWith('test_')) {
    console.warn(
        'Warning: RevenueCat is currently configured with a Test Store key. Set EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY and/or EXPO_PUBLIC_REVENUECAT_IOS_API_KEY for live billing.'
    );
}

console.log('[phone:prepare] Mobile .env synchronized.');
console.log(`[phone:prepare] LAN host: ${lanHost}`);
console.log(`[phone:prepare] API base: http://${lanHost}:${backendPort}/v1`);
if (supabaseHost) {
    console.log(`[phone:prepare] Android network config includes: ${supabaseHost}`);
}
