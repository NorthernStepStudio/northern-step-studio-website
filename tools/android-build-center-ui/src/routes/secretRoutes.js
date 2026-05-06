const express = require('express');
const router = express.Router();
const { setCredential } = require('../credentials/sessionVault');
const { saveToWCM } = require('../credentials/windowsCredentialManager');

router.post('/save', (req, res) => {
    const { appName, keystorePassword, keyPassword, remember } = req.body;
    if (!appName || !keystorePassword) return res.status(400).json({ error: 'Missing appName or password' });

    setCredential(appName, { keystorePassword, keyPassword: keyPassword || keystorePassword });

    if (remember) {
        const saved = saveToWCM(appName, keystorePassword, keyPassword || keystorePassword);
        if (!saved.success) return res.status(400).json({ error: saved.error });
    }

    res.json({ success: true });
});

module.exports = router;
