import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import homesRouter from './routes/homes.js';
import roomsRouter from './routes/rooms.js';
import itemsRouter from './routes/items.js';
import documentsRouter from './routes/documents.js';
import documentsUploadRouter from './routes/documentsUpload.js';
import exportsRouter from './routes/exports.js';
import accountRouter from './routes/account.js';
import maintenanceRouter from './routes/maintenance.js';
import aiRouter from './routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const serviceCommit =
    process.env.SERVICE_GIT_COMMIT_SHA ||
    process.env.RAILWAY_GIT_COMMIT_SHA ||
    process.env.K_REVISION ||
    null;

// Boot fingerprint for debugging across local, Cloud Run, and any legacy hosts.
console.log('[BOOT] backend starting', {
    node: process.version,
    ts: new Date().toISOString(),
    commit: serviceCommit,
});

app.use(cors());

app.use((req, res, next) => {
    const t0 = Date.now();
    console.log('[REQ] arrived', req.method, req.originalUrl, 'len=', req.headers['content-length']);
    res.on('finish', () => {
        console.log('[REQ] finished', req.method, req.originalUrl, 'status=', res.statusCode, 'ms=', Date.now() - t0);
    });
    next();
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.get('/', (_req, res) => {
    res.status(200).send('ProvLy Backend OK');
});

app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'provly-backend', ts: new Date().toISOString() });
});

app.get('/v1/health', (_req, res) => {
    res.json({ ok: true, service: 'provly-backend', commit: serviceCommit, ts: new Date().toISOString() });
});

app.use('/v1/homes', homesRouter);
app.use('/v1/rooms', roomsRouter);
app.use('/v1/items', itemsRouter);
app.use('/v1/documents', documentsRouter);
app.use('/v1/documents', documentsUploadRouter);
app.use('/v1/exports', exportsRouter);
app.use('/v1/account', accountRouter);
app.use('/v1/maintenance', maintenanceRouter);
app.use('/v1/ai', aiRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const port = Number(PORT);
app.listen(port, '0.0.0.0', () => {
    console.log(`ProvLy Backend running on port ${port}`);
});
