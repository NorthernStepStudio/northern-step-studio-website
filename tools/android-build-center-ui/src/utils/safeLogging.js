/**
 * Security utilities for NStep Android Build Center
 * Ensures passwords are never logged or exposed accidentally.
 */

function maskPassword(pw) {
    if (!pw) return '';
    return '*'.repeat(Math.min(pw.length, 8));
}

function safeLog(message, data) {
    // Basic safeguard: avoid logging anything that looks like a password field
    const safeData = data ? JSON.parse(JSON.stringify(data)) : null;
    if (safeData) {
        const sensitiveKeys = ['password', 'keystorePassword', 'keyPassword', 'storePassword'];
        sensitiveKeys.forEach(key => {
            if (safeData[key]) safeData[key] = '[REDACTED]';
        });
    }
    console.log(message, safeData || '');
}

module.exports = { maskPassword, safeLog };
