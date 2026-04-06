import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { validatePart } from '../utils/validation';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/parts?buildId=X
 * List all parts for a specific build
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const buildId = parseInt(req.query.buildId as string);

        if (isNaN(buildId)) {
            return res.status(400).json({
                success: false,
                error: 'Valid buildId query parameter is required',
            });
        }

        // Verify build ownership
        const build = await prisma.build.findFirst({
            where: { id: buildId, userId },
        });

        if (!build) {
            return res.status(404).json({
                success: false,
                error: 'Build not found or access denied',
            });
        }

        const parts = await prisma.part.findMany({
            where: { buildId },
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            parts,
            count: parts.length,
        });
    } catch (error) {
        console.error('Error fetching parts:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch parts',
        });
    }
});

/**
 * POST /api/parts
 * Add a new part to a build
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { buildId, name, category, price, url, imageUrl, specifications } = req.body;

        // Validate buildId
        const buildIdNum = parseInt(buildId);
        if (isNaN(buildIdNum)) {
            return res.status(400).json({
                success: false,
                error: 'Valid buildId is required',
            });
        }

        // Verify build ownership
        const build = await prisma.build.findFirst({
            where: { id: buildIdNum, userId },
        });

        if (!build) {
            return res.status(404).json({
                success: false,
                error: 'Build not found or access denied',
            });
        }

        // Validate part data
        const validation = validatePart({ name, category, price });
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: validation.errors.join(', '),
            });
        }

        const part = await prisma.part.create({
            data: {
                buildId: buildIdNum,
                name,
                category,
                price: price ? parseFloat(price) : 0,
                url: url || null,
                imageUrl: imageUrl || null,
                specifications: specifications || undefined,
            },
        });

        // Update build total price
        const allParts = await prisma.part.findMany({
            where: { buildId: buildIdNum },
        });
        const totalPrice = allParts.reduce((sum: number, p: any) => sum + parseFloat(p.price.toString()), 0);
        await prisma.build.update({
            where: { id: buildIdNum },
            data: { totalPrice },
        });

        res.status(201).json({
            success: true,
            part,
            message: 'Part added successfully',
        });
    } catch (error) {
        console.error('Error creating part:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create part',
        });
    }
});

/**
 * PUT /api/parts/:id
 * Update an existing part
 */
router.put('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const partId = parseInt(req.params.id);
        const { name, category, price, url, imageUrl, specifications } = req.body;

        if (isNaN(partId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid part ID',
            });
        }

        // Get existing part and verify ownership through build
        const existingPart = await prisma.part.findUnique({
            where: { id: partId },
            include: { build: true },
        });

        if (!existingPart || existingPart.build.userId !== userId) {
            return res.status(404).json({
                success: false,
                error: 'Part not found or access denied',
            });
        }

        // Validate part data
        const validation = validatePart({ name, category, price });
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: validation.errors.join(', '),
            });
        }

        const part = await prisma.part.update({
            where: { id: partId },
            data: {
                name,
                category,
                price: price ? parseFloat(price) : existingPart.price,
                url: url || null,
                imageUrl: imageUrl || null,
                specifications: specifications || undefined,
            },
        });

        // Update build total price
        const allParts = await prisma.part.findMany({
            where: { buildId: existingPart.buildId },
        });
        const totalPrice = allParts.reduce((sum: number, p: any) => sum + parseFloat(p.price.toString()), 0);
        await prisma.build.update({
            where: { id: existingPart.buildId },
            data: { totalPrice },
        });

        res.json({
            success: true,
            part,
            message: 'Part updated successfully',
        });
    } catch (error) {
        console.error('Error updating part:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update part',
        });
    }
});

/**
 * DELETE /api/parts/:id
 * Remove a part from a build
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const partId = parseInt(req.params.id);

        if (isNaN(partId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid part ID',
            });
        }

        // Get existing part and verify ownership through build
        const existingPart = await prisma.part.findUnique({
            where: { id: partId },
            include: { build: true },
        });

        if (!existingPart || existingPart.build.userId !== userId) {
            return res.status(404).json({
                success: false,
                error: 'Part not found or access denied',
            });
        }

        const buildId = existingPart.buildId;

        // Delete part
        await prisma.part.delete({
            where: { id: partId },
        });

        // Update build total price
        const allParts = await prisma.part.findMany({
            where: { buildId },
        });
        const totalPrice = allParts.reduce((sum: number, p: any) => sum + parseFloat(p.price.toString()), 0);
        await prisma.build.update({
            where: { id: buildId },
            data: { totalPrice },
        });

        res.json({
            success: true,
            message: 'Part deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting part:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete part',
        });
    }
});

export default router;
