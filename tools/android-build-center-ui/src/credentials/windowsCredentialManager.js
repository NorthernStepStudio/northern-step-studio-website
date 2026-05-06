const { spawnSync } = require('child_process');
const {
    canonicalAppId,
    getCredentialLookupIds,
    getKeystoreResourceKey,
    getKeyResourceKey
} = require('../utils/idUtils');

function toPsString(value) {
    return String(value || '').replace(/'/g, "''");
}

function toBase64(value) {
    return Buffer.from(String(value || ''), 'utf16le').toString('base64');
}

function runPowerShell(script) {
    const child = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script], {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
    });

    return {
        status: child.status,
        stdout: child.stdout ? child.stdout.trim() : '',
        stderr: child.stderr ? child.stderr.trim() : ''
    };
}

function parseJsonOutput(output) {
    if (!output) return null;
    const firstJson = output.split(/\r?\n/).find(line => line.trim().startsWith('{'));
    if (!firstJson) return null;
    try {
        return JSON.parse(firstJson);
    } catch (error) {
        return null;
    }
}

/**
 * Saves credentials to Windows PasswordVault with canonical keys and robust escaping.
 */
function saveToWCM(appId, keystorePassword, keyPassword) {
    if (process.platform !== 'win32') {
        return { success: false, error: 'Windows PasswordVault is only available on Windows.' };
    }
    if (!appId || !keystorePassword) {
        return { success: false, error: 'App id and keystore password are required.' };
    }

    try {
        const credentialUser = canonicalAppId(appId);
        const ksKey = getKeystoreResourceKey(credentialUser);
        const kKey = getKeyResourceKey(credentialUser);
        const storePass64 = toBase64(keystorePassword);
        const keyPass64 = toBase64(keyPassword || keystorePassword);

        const script = `
$ErrorActionPreference = 'Stop'
[void][Windows.Security.Credentials.PasswordVault,Windows.Security.Credentials,ContentType=WindowsRuntime]
$vault = New-Object Windows.Security.Credentials.PasswordVault
function Decode([string]$value) { [Text.Encoding]::Unicode.GetString([Convert]::FromBase64String($value)) }
function Remove-IfExists([string]$resource, [string]$user) {
  try {
    $existing = $vault.Retrieve($resource, $user)
    $vault.Remove($existing)
  } catch {}
}
$storePassword = Decode '${storePass64}'
$keyPassword = Decode '${keyPass64}'
$storeResource = '${toPsString(ksKey)}'
$keyResource = '${toPsString(kKey)}'
$user = '${toPsString(credentialUser)}'
Remove-IfExists $storeResource $user
Remove-IfExists $keyResource $user
$vault.Add((New-Object Windows.Security.Credentials.PasswordCredential -ArgumentList $storeResource, $user, $storePassword))
$vault.Add((New-Object Windows.Security.Credentials.PasswordCredential -ArgumentList $keyResource, $user, $keyPassword))
$check = $vault.Retrieve($storeResource, $user)
$check.RetrievePassword()
if ($check.Password -ne $storePassword) { throw 'PasswordVault recover check failed after save.' }
@{ ok = $true; credentialUser = $user; keystoreKey = $storeResource; keyKey = $keyResource } | ConvertTo-Json -Compress
`;

        const result = runPowerShell(script);
        if (result.status !== 0) {
            return { success: false, error: result.stderr || result.stdout || 'PasswordVault save failed.' };
        }

        const parsed = parseJsonOutput(result.stdout);
        if (!parsed || !parsed.ok) {
            return { success: false, error: 'PasswordVault save did not return a verification result.' };
        }

        const verify = recoverFromWCM(appId, { candidateAppIds: [credentialUser] });
        if (!verify || verify.keystorePassword !== keystorePassword) {
            return { success: false, error: 'PasswordVault save succeeded but recovery verification failed.' };
        }

        return {
            success: true,
            credentialUser,
            keystoreKey: ksKey,
            keyKey: kKey
        };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * Recovers credentials from Windows PasswordVault using canonical keys.
 */
function recoverFromWCM(appId, options = {}) {
    if (process.platform !== 'win32') return null;
    try {
        const candidates = getCredentialLookupIds(appId, options)
            .concat((options.candidateAppIds || []).map(canonicalAppId));
        const uniqueCandidates = Array.from(new Set(candidates));
        const canonicalSelected = canonicalAppId(appId);
        const pairs = [];

        uniqueCandidates.forEach(candidate => {
            const users = Array.from(new Set([candidate, appId, canonicalSelected].filter(Boolean)));
            users.forEach(user => {
                pairs.push({
                    candidate,
                    user,
                    storeResource: getKeystoreResourceKey(candidate),
                    keyResource: getKeyResourceKey(candidate)
                });
            });
        });

        const json64 = toBase64(JSON.stringify(pairs));
        const script = `
$ErrorActionPreference = 'Stop'
[void][Windows.Security.Credentials.PasswordVault,Windows.Security.Credentials,ContentType=WindowsRuntime]
$vault = New-Object Windows.Security.Credentials.PasswordVault
function Decode([string]$value) { [Text.Encoding]::Unicode.GetString([Convert]::FromBase64String($value)) }
$pairs = Decode '${json64}' | ConvertFrom-Json
foreach ($pair in $pairs) {
  try {
    $store = $vault.Retrieve([string]$pair.storeResource, [string]$pair.user)
    $store.RetrievePassword()
    $keyPassword = $store.Password
    try {
      $key = $vault.Retrieve([string]$pair.keyResource, [string]$pair.user)
      $key.RetrievePassword()
      $keyPassword = $key.Password
    } catch {}
    @{
      ok = $true
      keystorePassword = $store.Password
      keyPassword = $keyPassword
      credentialUser = [string]$pair.user
      recoveredFromAppId = [string]$pair.candidate
      keystoreKey = [string]$pair.storeResource
      keyKey = [string]$pair.keyResource
    } | ConvertTo-Json -Compress
    exit 0
  } catch {}
}
exit 1
`;

        const result = runPowerShell(script);
        if (result.status !== 0) return null;

        const parsed = parseJsonOutput(result.stdout);
        if (parsed && parsed.ok && parsed.keystorePassword) {
            return {
                keystorePassword: parsed.keystorePassword,
                keyPassword: parsed.keyPassword || parsed.keystorePassword,
                credentialUser: parsed.credentialUser,
                recoveredFromAppId: parsed.recoveredFromAppId,
                credentialKeyName: parsed.keystoreKey,
                keyCredentialKeyName: parsed.keyKey
            };
        }
    } catch (e) {
        // Not found is expected for new apps
    }
    return null;
}

function deleteFromWCM(appId) {
    if (process.platform !== 'win32') return { success: false, error: 'Windows PasswordVault is only available on Windows.' };
    const credentialUser = canonicalAppId(appId);
    const ksKey = getKeystoreResourceKey(credentialUser);
    const kKey = getKeyResourceKey(credentialUser);
    const script = `
$ErrorActionPreference = 'Stop'
[void][Windows.Security.Credentials.PasswordVault,Windows.Security.Credentials,ContentType=WindowsRuntime]
$vault = New-Object Windows.Security.Credentials.PasswordVault
function Remove-IfExists([string]$resource, [string]$user) {
  try {
    $existing = $vault.Retrieve($resource, $user)
    $vault.Remove($existing)
  } catch {}
}
Remove-IfExists '${toPsString(ksKey)}' '${toPsString(credentialUser)}'
Remove-IfExists '${toPsString(kKey)}' '${toPsString(credentialUser)}'
@{ ok = $true } | ConvertTo-Json -Compress
`;
    const result = runPowerShell(script);
    return result.status === 0
        ? { success: true }
        : { success: false, error: result.stderr || result.stdout || 'PasswordVault delete failed.' };
}

module.exports = { saveToWCM, recoverFromWCM, deleteFromWCM };
