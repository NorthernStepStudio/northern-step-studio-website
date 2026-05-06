const express = require('express');
const router = express.Router();
const { loadSettings, saveSettings } = require('../config/settings');

router.get('/', (req, res) => {
    res.json(loadSettings());
});

router.post('/', (req, res) => {
    saveSettings(req.body);
    res.json({ success: true });
});

module.exports = router;
