const { sanitizeAppId, getKeystoreResourceKey } = require('./src/utils/idUtils');
const { saveToWCM, recoverFromWCM } = require('./src/credentials/windowsCredentialManager');

const testCases = [
    { name: 'Simple', id: 'provly' },
    { name: 'Hyphens', id: 'nexusbuild-app' },
    { name: 'Spaces', id: 'noobs investing' },
    { name: 'Mixed Case', id: 'PasoScore' }
];

console.log('--- NStep Build Center Credential Hardening Audit ---');

testCases.forEach(test => {
    const cleanId = sanitizeAppId(test.id);
    const key = getKeystoreResourceKey(test.id);
    console.log(`\nTesting Case: ${test.name}`);
    console.log(`  Raw ID: "${test.id}"`);
    console.log(`  Sanitized ID: "${cleanId}"`);
    console.log(`  Vault Key: "${key}"`);
    
    const testPass = 'pass-' + Math.random().toString(16).slice(2, 10);
    const saved = saveToWCM(test.id, testPass, testPass);
    console.log(`  Save to Vault: ${saved.success ? 'SUCCESS' : 'FAILED'}`);
    
    const recovered = recoverFromWCM(test.id);
    if (recovered && recovered.keystorePassword === testPass) {
        console.log(`  Recovery Check: SUCCESS (Matches)`);
    } else {
        console.log(`  Recovery Check: FAILED`);
        console.log(`    Expected: ${testPass ? '***' : 'null'}`);
        console.log(`    Got: ${recovered && recovered.keystorePassword ? '***' : 'null'}`);
    }
});

console.log('\n--- Audit Complete ---');
