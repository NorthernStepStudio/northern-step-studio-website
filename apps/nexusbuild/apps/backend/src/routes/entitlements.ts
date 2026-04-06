import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/entitlements
 * Get current user's entitlements
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const entitlements = await prisma.userEntitlement.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        // Check if any entitlements are active
        const hasActivePremium = entitlements.some((e: any) =>
            e.tier === 'premium' &&
            (!e.expiresAt || new Date(e.expiresAt) > new Date())
        );

        res.json({
            success: true,
            entitlements,
            hasPremium: hasActivePremium,
            count: entitlements.length,
        });
    } catch (error) {
        console.error('Error fetching entitlements:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch entitlements',
        });
    }
});

/**
 * POST /api/entitlements
 * Grant an entitlement to a user (admin only)
 */
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { userId, tier, expiresAt } = req.body;

        if (!userId || !tier) {
            return res.status(400).json({
                success: false,
                error: 'userId and tier are required',
            });
        }

        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        const entitlement = await prisma.userEntitlement.create({
            data: {
                userId: parseInt(userId),
                tier,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            },
        });

        res.status(201).json({
            success: true,
            entitlement,
            message: 'Entitlement granted successfully',
        });
    } catch (error) {
        console.error('Error granting entitlement:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to grant entitlement',
        });
    }
});

/**
 * DELETE /api/entitlements/:id
 * Revoke an entitlement (admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const entitlementId = parseInt(req.params.id);

        if (isNaN(entitlementId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid entitlement ID',
            });
        }

        // Check if entitlement exists
        const existingEntitlement = await prisma.userEntitlement.findUnique({
            where: { id: entitlementId },
        });

        if (!existingEntitlement) {
            return res.status(404).json({
                success: false,
                error: 'Entitlement not found',
            });
        }

        await prisma.userEntitlement.delete({
            where: { id: entitlementId },
        });

        res.json({
            success: true,
            message: 'Entitlement revoked successfully',
        });
    } catch (error) {
        console.error('Error revoking entitlement:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to revoke entitlement',
        });
    }
});

export default router;
