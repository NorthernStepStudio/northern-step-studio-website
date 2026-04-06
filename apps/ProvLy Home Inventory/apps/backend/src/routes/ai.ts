import express from 'express';
import { aiService } from '../services/aiService.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

// Parse a receipt from text content
// TODO: In future iterations, this will also handle image URLs by fetching them first
router.post('/parse-receipt', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        const { text_content, storage_path } = req.body;

        if (!text_content && !storage_path) {
            return res.status(400).json({ error: 'Either text_content or storage_path is required' });
        }

        let parsedData;
        if (storage_path) {
            parsedData = await aiService.parseReceiptFromStorage(storage_path);
        } else {
            parsedData = await aiService.parseReceipt(text_content);
        }

        res.json(parsedData);
    } catch (error: any) {
        console.error('Error parsing receipt:', error);
        res.status(500).json({ error: error.message || 'Failed to parse receipt' });
    }
});

// Ping endpoint for fast connectivity check
router.get("/agent/ping", (_req, res) => {
    console.log("[SCAN] Ping route hit (public)");
    return res.json({ ok: true, ts: Date.now() });
});

// AI Agent Chat Endpoint
// Token can be in body (preferred to avoid 431 header size errors) or Authorization header
router.post('/agent', async (req: express.Request, res: express.Response) => {
    console.log('[AI] /v1/ai/agent hit', { ms: 0, len: req.headers['content-length'] });
    const t0 = Date.now();
    try {
        // Get token from body first, then fallback to header
        const token = req.body?.access_token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Missing token' });
        }

        // Verify token with Supabase
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
            process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data: userData, error: authError } = await supabase.auth.getUser(token);

        if (authError || !userData?.user) {
            console.log('[AI] auth failed', authError?.message);
            return res.status(401).json({ error: 'Invalid token' });
        }

        const userId = userData.user.id;
        const { prompt, homeId, history, image } = req.body;

        if (!prompt || !homeId) {
            return res.status(400).json({ error: 'prompt and homeId are required' });
        }

        // Don't log access_token for security
        console.log('[AI] before runAgent', Date.now() - t0, 'ms', {
            userId: userId.slice(0, 8) + '...',
            hasImage: Boolean(image),
            b64Len: image?.length ?? 0,
            promptLen: prompt?.length ?? 0,
            historyLen: Array.isArray(history) ? history.length : -1,
        });

        const response = await aiService.runAgent(userId, token, homeId, prompt, history, image);

        console.log('[AI] after runAgent', Date.now() - t0, 'ms');
        res.json({ response });

    } catch (error: any) {
        console.log('[AI] error', Date.now() - t0, 'ms', error?.message);
        console.error('AI Agent error:', error);
        res.status(500).json({ error: error.message || 'Agent failed' });
    }
});

export default router;
