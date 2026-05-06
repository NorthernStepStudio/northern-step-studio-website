const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const { sanitizeAppId } = require('../utils/idUtils');

/**
 * Handles the generation of Android keystores using keytool.
 */
function generateKeystore(options) {
    const {
        id,
        keystorePath,
        keyAlias = `${sanitizeAppId(id)}-upload`,
        dname = `CN=${sanitizeAppId(id)}, OU=NStep, O=Northern Step Studio, C=US`
    } = options;

    const keystoreDir = path.dirname(keystorePath);
    if (!fs.existsSync(keystoreDir)) {
        fs.mkdirSync(keystoreDir, { recursive: true });
    }

    if (fs.existsSync(keystorePath)) {
        return { success: false, reason: 'Keystore already exists' };
    }

    const storePassword = crypto.randomBytes(12).toString('hex'); // 24 chars
    const keyPassword = storePassword; // Standard for modern Android

    const result = spawnSync('keytool', [
        '-genkeypair',
        '-alias', keyAlias,
        '-keyalg', 'RSA',
        '-keysize', '2048',
        '-validity', '10000',
        '-storetype', 'JKS',
        '-keystore', keystorePath,
        '-storepass', storePassword,
        '-keypass', keyPassword,
        '-dname', dname
    ], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });

    if (result.status === 0 && fs.existsSync(keystorePath)) {
        return {
            success: true,
            keystorePath,
            password: storePassword,
            storePassword,
            keyPassword,
            keyAlias
        };
    }

    return {
        success: false,
        reason: 'Keytool execution failed',
        error: result.stderr
    };
}

/**
 * Specifically handles the Google Play Upload Key workflow.
 * Saves to $USERPROFILE/NStep/private-keys/<app-id>/
 */
function generateUploadKey(appId) {
    const sanitizedId = sanitizeAppId(appId);
    const userProfile = process.env.USERPROFILE || os.homedir();
    const baseDir = path.join(userProfile, 'NStep', 'private-keys', sanitizedId);
    const keystorePath = path.join(baseDir, 'upload-keystore.jks');
    const certPath = path.join(baseDir, 'upload_certificate.pem');
    const alias = 'upload';

    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
    }

    // Generate Passwords
    const pass = crypto.randomBytes(12).toString('hex'); // 24 chars

    // 1. Generate Keystore
    const genResult = spawnSync('keytool', [
        '-genkeypair',
        '-v',
        '-alias', alias,
        '-keyalg', 'RSA',
        '-keysize', '2048',
        '-validity', '10000',
        '-storetype', 'JKS',
        '-keystore', keystorePath,
        '-storepass', pass,
        '-keypass', pass,
        '-dname', `CN=${sanitizedId}, OU=NStep Upload, O=Northern Step Studio, C=US`
    ], { encoding: 'utf8' });

    if (genResult.status !== 0 || !fs.existsSync(keystorePath)) {
        return { success: false, reason: 'Failed to generate upload keystore', error: genResult.stderr };
    }

    // 2. Export Certificate
    const exportResult = spawnSync('keytool', [
        '-export',
        '-rfc',
        '-alias', alias,
        '-keystore', keystorePath,
        '-storepass', pass,
        '-file', certPath
    ], { encoding: 'utf8' });

    if (exportResult.status !== 0 || !fs.existsSync(certPath)) {
        return { success: false, reason: 'Failed to export upload certificate', error: exportResult.stderr };
    }

    return {
        success: true,
        keystorePath,
        certPath,
        alias,
        password: pass
    };
}

module.exports = { generateKeystore, generateUploadKey };
