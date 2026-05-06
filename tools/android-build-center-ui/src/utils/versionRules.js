function parsePositiveInteger(value, label = 'versionCode') {
    if (value === null || value === undefined || value === '') {
        return { valid: false, error: `${label} must be a positive integer.` };
    }

    const text = String(value).trim();
    if (!/^\d+$/.test(text)) {
        return { valid: false, error: `${label} must be a positive integer.` };
    }

    const parsed = Number(text);
    if (!Number.isSafeInteger(parsed) || parsed < 1) {
        return { valid: false, error: `${label} must be a positive integer.` };
    }

    return { valid: true, value: parsed };
}

function parseOptionalPositiveInteger(value, label = 'versionCode') {
    if (value === null || value === undefined || value === '') {
        return { valid: true, value: null };
    }
    return parsePositiveInteger(value, label);
}

function getNextVersionCode(currentLocal, lastPlayCode) {
    const local = Number.isSafeInteger(Number(currentLocal)) && Number(currentLocal) > 0 ? Number(currentLocal) : 0;
    const play = Number.isSafeInteger(Number(lastPlayCode)) && Number(lastPlayCode) > 0 ? Number(lastPlayCode) : 0;
    return Math.max(local + 1, play + 1, 1);
}

function bumpPatchVersionName(versionName) {
    const rawParts = String(versionName || '1.0.0').split('.');
    const parts = [0, 1, 2].map(index => {
        const raw = rawParts[index];
        return /^\d+$/.test(String(raw || '')) ? Number(raw) : 0;
    });

    if (!rawParts[0]) parts[0] = 1;
    parts[2] += 1;
    return parts.join('.');
}

function validateBuildVersion({ localVersionCode, lastPlayCode, requirePlayCode = false }) {
    const local = parsePositiveInteger(localVersionCode, 'versionCode');
    if (!local.valid) {
        return { valid: false, error: 'versionCode must be a positive integer.' };
    }

    const play = parseOptionalPositiveInteger(lastPlayCode, 'Google Play versionCode');
    if (!play.valid) {
        return { valid: false, error: 'Google Play versionCode must be a positive integer.' };
    }

    if (requirePlayCode && !play.value) {
        return { valid: false, error: 'Google Play versionCode must be a positive integer.' };
    }

    if (play.value && local.value <= play.value) {
        return {
            valid: false,
            error: `versionCode (${local.value}) must be greater than Google Play versionCode (${play.value}).`
        };
    }

    return { valid: true, localVersionCode: local.value, lastPlayCode: play.value || null };
}

module.exports = {
    parsePositiveInteger,
    parseOptionalPositiveInteger,
    getNextVersionCode,
    bumpPatchVersionName,
    validateBuildVersion
};
