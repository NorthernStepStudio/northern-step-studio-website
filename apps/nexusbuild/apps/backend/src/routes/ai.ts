import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Daily limits by tier
const DAILY_LIMITS = {
    free: 5,
    premium: 50,
    unlimited: 999999,
};

/**
 * GET /api/ai/usage
 * Get user's AI usage for today
 */
router.get('/usage', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get today's usage
        const usage = await prisma.dailyAIUsage.findFirst({
            where: {
                userId,
                date: {
                    gte: today,
                },
            },
        });

        // Get user's tier from entitlements
        const entitlements = await prisma.userEntitlement.findMany({
            where: {
                userId,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });

        // Determine tier (free, premium, or unlimited)
        let tier = 'free';
        if (entitlements.length > 0) {
            const activeTier = entitlements[0].tier;
            if (activeTier === 'premium' || activeTier === 'pro') {
                tier = 'premium';
            } else if (activeTier === 'unlimited' || activeTier === 'enterprise') {
                tier = 'unlimited';
            }
        }

        const limit = DAILY_LIMITS[tier as keyof typeof DAILY_LIMITS] || DAILY_LIMITS.free;
        const count = usage?.count || 0;
        const remaining = Math.max(0, limit - count);

        res.json({
            success: true,
            usage: {
                count,
                limit,
                remaining,
                tier,
                date: usage?.date || today,
            },
        });
    } catch (error) {
        console.error('Error fetching AI usage:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch AI usage',
        });
    }
});

/**
 * POST /api/ai/usage
 * Increment AI usage counter
 */
router.post('/usage', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get or create today's usage record
        const existingUsage = await prisma.dailyAIUsage.findFirst({
            where: {
                userId,
                date: {
                    gte: today,
                },
            },
        });

        // Get user's tier
        const entitlements = await prisma.userEntitlement.findMany({
            where: {
                userId,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });

        let tier = 'free';
        if (entitlements.length > 0) {
            const activeTier = entitlements[0].tier;
            if (activeTier === 'premium' || activeTier === 'pro') {
                tier = 'premium';
            } else if (activeTier === 'unlimited' || activeTier === 'enterprise') {
                tier = 'unlimited';
            }
        }

        const limit = DAILY_LIMITS[tier as keyof typeof DAILY_LIMITS] || DAILY_LIMITS.free;

        // Check if user has reached limit
        if (existingUsage && existingUsage.count >= limit) {
            return res.status(429).json({
                success: false,
                error: 'Daily AI usage limit reached',
                usage: {
                    count: existingUsage.count,
                    limit,
                    remaining: 0,
                    tier,
                },
            });
        }

        // Increment or create usage
        let usage;
        if (existingUsage) {
            usage = await prisma.dailyAIUsage.update({
                where: { id: existingUsage.id },
                data: { count: { increment: 1 } },
            });
        } else {
            usage = await prisma.dailyAIUsage.create({
                data: {
                    userId,
                    date: today,
                    count: 1,
                },
            });
        }

        const remaining = Math.max(0, limit - usage.count);

        res.json({
            success: true,
            usage: {
                count: usage.count,
                limit,
                remaining,
                tier,
                date: usage.date,
            },
            message: 'AI usage recorded',
        });
    } catch (error) {
        console.error('Error recording AI usage:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record AI usage',
        });
    }
});

export default router;
