const fs = require('fs');

function readJson(filePath, defaultValue = {}) {
    try {
        if (!fs.existsSync(filePath)) return defaultValue;
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        console.error(`Failed to read JSON at ${filePath}:`, e.message);
        return defaultValue;
    }
}

function writeJson(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        console.error(`Failed to write JSON at ${filePath}:`, e.message);
        return false;
    }
}

module.exports = { readJson, writeJson };
