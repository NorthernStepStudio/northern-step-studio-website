const { spawnSync } = require('child_process');
const fs = require('fs');

function cleanKeytoolOutput(output) {
    return String(output || '')
        .replace(/\r/g, '')
        .split('\n')
        .filter(line => !line.toLowerCase().includes('warning:'))
        .join('\n')
        .trim();
}

function extractAliases(output) {
    const aliases = [];
    const text = String(output || '');
    const verboseMatches = text.matchAll(/Alias name:\s*(.+)/gi);
    for (const match of verboseMatches) {
        const alias = match[1] && match[1].trim();
        if (alias && !aliases.includes(alias)) aliases.push(alias);
    }

    if (aliases.length) return aliases;

    text.split(/\r?\n/).forEach(line => {
        const match = line.match(/^([^,\s][^,]*),\s+\w{3}\s+\d{1,2},\s+\d{4},/);
        if (match && match[1] && !aliases.includes(match[1].trim())) {
            aliases.push(match[1].trim());
        }
    });

    return aliases;
}

function classifyKeytoolError(output) {
    const text = cleanKeytoolOutput(output);
    const lower = text.toLowerCase();
    if (lower.includes('password was incorrect') || lower.includes('keystore was tampered') || lower.includes('failed to decrypt')) {
        return 'Invalid Password';
    }
    if (lower.includes('alias') && (lower.includes('does not exist') || lower.includes('not found'))) {
        return 'Invalid Alias';
    }
    if (lower.includes('not a valid keystore') || lower.includes('unrecognized keystore') || lower.includes('invalid keystore')) {
        return 'Invalid Keystore';
    }
    return 'Keystore Validation Failed';
}

function validateKeystoreWithPassword(keystorePath, password, alias) {
    try {
        if (!keystorePath || !fs.existsSync(keystorePath)) {
            return { isValid: false, error: `Keystore file not found: ${keystorePath || 'unknown path'}`, reason: 'Missing Keystore' };
        }
        if (!password) {
            return { isValid: false, error: 'Keystore password is required.', reason: 'Needs Password' };
        }

        const baseArgs = ['-list', '-v', '-keystore', keystorePath, '-storepass', password];
        const child = spawnSync('keytool', alias ? [...baseArgs, '-alias', alias] : baseArgs, { encoding: 'utf8' });
        const output = cleanKeytoolOutput(`${child.stdout || ''}\n${child.stderr || ''}`);
        
        if (child.status === 0) {
            const aliases = extractAliases(output);
            return {
                isValid: true,
                aliases,
                keyAlias: alias || aliases[0] || null
            };
        }

        const reason = classifyKeytoolError(output);
        return {
            isValid: false,
            reason,
            aliases: extractAliases(output),
            error: output || reason
        };
    } catch (e) {
        return { isValid: false, error: e.message, reason: 'Keystore Validation Failed' };
    }
}

module.exports = { validateKeystoreWithPassword, extractAliases, classifyKeytoolError };
