const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 4545;

const prewarmVault = require('./src/boot/prewarmVault');

// ──── MIDDLEWARE ────
app.use(express.json());
app.use(cors());

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Cache busting for development static assets
app.use((req, res, next) => {
    if (req.url.includes('/src/') || req.url.includes('style.css')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    }
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

// ──── SSE BROADCASTER ────
let sseClients = [];
function broadcast(data) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    const stillActive = [];
    sseClients.forEach(client => {
        try {
            client.res.write(message);
            stillActive.push(client);
        } catch (e) {
            // Client likely disconnected
        }
    });
    sseClients = stillActive;
}

// expose broadcast through broadcaster utility
try {
    require('./src/utils/broadcaster').setBroadcast(broadcast);
} catch (e) {}

app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const id = Date.now();
    sseClients.push({ id, res });
    req.on('close', () => { sseClients = sseClients.filter(c => c.id !== id); });
});

// ──── ROUTES ────
const appRoutes = require('./src/routes/appRoutes');
const discoveryRoutes = require('./src/routes/discoveryRoutes');
const buildRoutes = require('./src/routes/buildRoutes');
const keystoreRoutes = require('./src/routes/keystoreRoutes');
const secretRoutes = require('./src/routes/secretRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');

buildRoutes.setBroadcast(broadcast);

app.use('/api', appRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/build', buildRoutes);
app.use('/api/keystore', keystoreRoutes);
app.use('/api/secrets', secretRoutes);
app.use('/api/settings', settingsRoutes);

// ──── STARTUP ────
app.listen(PORT, () => {
    console.log(`NStep Build Center UI running at http://localhost:${PORT}`);
    prewarmVault();
});
