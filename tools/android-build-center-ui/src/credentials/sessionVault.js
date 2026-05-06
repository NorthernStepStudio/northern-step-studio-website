// In-Memory Session Vault (Security Part 2)
let sessionVault = {};

function getVault() {
    return sessionVault;
}

function setCredential(appId, creds) {
    sessionVault[appId] = { ...creds };
}

function getCredential(appId) {
    return sessionVault[appId];
}

module.exports = { getVault, setCredential, getCredential };
