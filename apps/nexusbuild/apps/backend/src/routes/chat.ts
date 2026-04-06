/**
 * Chat API Route
 * POST /api/chat - AI-powered PC building assistant
 * Uses custom NexusEngine (no external LLM dependencies)
 */

import { Router, Request, Response } from 'express';
import { processChat } from '../ai/nexusEngine';

const router = Router();

// Rate limiting (simple in-memory)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
        return true;
    }

    if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
        return false;
    }

    entry.count++;
    return true;
}

// In-memory conversation context storage (keyed by session)
const sessionContexts = new Map<string, any>();

// Clean up old sessions every 5 minutes
setInterval(() => {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    for (const [key, ctx] of sessionContexts.entries()) {
        if (ctx.lastUsed && now - ctx.lastUsed > maxAge) {
            sessionContexts.delete(key);
        }
    }
}, 5 * 60 * 1000);

/**
 * POST /api/chat
 * Main chat endpoint using NexusEngine
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        // Rate limiting
        const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
        if (!checkRateLimit(clientIp)) {
            return res.status(429).json({ error: 'Rate limit exceeded. Please wait a minute.' });
        }

        const { messages, userContext, sessionId } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        // Get or create session context
        const sid = sessionId || clientIp;
        let context = sessionContexts.get(sid) || {};
        context.lastUsed = Date.now();

        // Add user context to NexusEngine context
        if (userContext) {
            if (userContext.budget) context.extractedBudget = userContext.budget;
            if (userContext.useCase) context.extractedUseCase = userContext.useCase;
        }

        // Process with NexusEngine
        const result = processChat(messages, context);

        // Save updated context
        if (result.context) {
            sessionContexts.set(sid, { ...result.context, lastUsed: Date.now() });
        }

        // Format response to match expected API contract
        const response = {
            message: result.text,
            suggestions: result.suggestions,
            build: result.build ? {
                parts: Object.entries(result.build.parts).map(([cat, part]: [string, any]) => ({
                    category: cat,
                    name: part.name,
                    price: part.price
                })),
                totalPrice: result.build.total,
                reasoning: result.build.reasoning
            } : undefined
        };

        return res.json(response);

    } catch (error) {
        console.error('[Chat] Error:', error);
        return res.status(500).json({
            error: 'An error occurred while processing your request.',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router;
