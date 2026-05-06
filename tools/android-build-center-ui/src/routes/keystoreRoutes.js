const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { APPS_JSON_PATH, WORKSPACE_ROOT, SCRIPTS } = require('../config/paths');
const { readJson } = require('../utils/jsonUtils');

router.post('/validate', (req, res) => {
    const { appName, keystorePassword } = req.body;
    if (!appName || !keystorePassword) return res.status(400).json({ error: 'Missing appName or password' });

    const apps = readJson(APPS_JSON_PATH);
    const app = apps[appName];
    if (!app) return res.status(404).json({ error: 'App not found' });

    const keystorePath = path.join(WORKSPACE_ROOT, app.keystorePath);
    if (!fs.existsSync(keystorePath)) return res.status(404).json({ error: 'Keystore missing' });

    const child = spawn('keytool', ['-list', '-keystore', keystorePath, '-storepass', keystorePassword]);
    let stderr = '';
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('close', (code) => {
        if (code === 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: stderr.includes('password was incorrect') ? 'Password incorrect' : stderr });
        }
    });
});

router.post('/aliases', (req, res) => {
    const { appName, keystorePassword } = req.body;
    const apps = readJson(APPS_JSON_PATH);
    const app = apps[appName];
    const keystorePath = path.join(WORKSPACE_ROOT, app.keystorePath);

    const child = spawn('keytool', ['-list', '-v', '-keystore', keystorePath, '-storepass', keystorePassword]);
    let output = '';
    child.stdout.on('data', (d) => { output += d.toString(); });
    child.on('close', (code) => {
        if (code === 0) {
            const aliases = output.split('\n').filter(l => l.includes('Alias name:')).map(l => l.split(':')[1].trim());
            res.json({ success: true, aliases });
        } else {
            res.json({ success: false });
        }
    });
});

router.post('/generate-reset', (req, res) => {
    const { appName, keystorePassword } = req.body;
    const child = spawn('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-File', SCRIPTS.GENERATE_RESET, '-AppName', appName, '-StorePassword', keystorePassword]);
    
    let output = '';
    child.stdout.on('data', (d) => { output += d.toString(); });
    child.on('close', (code) => {
        if (code === 0) {
            const pemPath = output.match(/UPLOAD_PEM_PATH:(.*)/)?.[1].trim() || 'Unknown';
            res.json({ success: true, pemPath });
        } else {
            res.json({ success: false });
        }
    });
});

module.exports = router;
