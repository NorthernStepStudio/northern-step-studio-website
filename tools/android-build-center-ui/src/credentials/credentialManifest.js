const fs = require('fs');
const path = require('path');
const { canonicalAppId } = require('../utils/idUtils');

function getMachineRoot() {
    return path.join(process.env.USERPROFILE || process.env.HOME, 'NStep');
}

function getCredentialManifestPath() {
    return path.join(getMachineRoot(), 'credentials-manifest.json');
}

function readCredentialManifest() {
    const manifestPath = getCredentialManifestPath();
    if (!fs.existsSync(manifestPath)) return {};
    try {
        return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (error) {
        return {};
    }
}

function writeCredentialManifest(manifest) {
    const manifestPath = getCredentialManifestPath();
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

function getCredentialManifestEntry(appId) {
    const manifest = readCredentialManifest();
    const canonical = canonicalAppId(appId);
    return manifest[canonical] || manifest[appId] || null;
}

function updateCredentialManifest(appId, data) {
    const canonical = canonicalAppId(appId);
    const manifest = readCredentialManifest();
    manifest[canonical] = {
        ...(manifest[canonical] || {}),
        canonicalAppId: canonical,
        appId,
        ...data,
        updatedAt: new Date().toISOString()
    };
    writeCredentialManifest(manifest);
    return manifest[canonical];
}

function getPrivateKeystorePath(appId) {
    return path.join(getMachineRoot(), 'private-keys', canonicalAppId(appId), 'upload-keystore.jks');
}

module.exports = {
    getMachineRoot,
    getCredentialManifestPath,
    readCredentialManifest,
    writeCredentialManifest,
    getCredentialManifestEntry,
    updateCredentialManifest,
    getPrivateKeystorePath
};
