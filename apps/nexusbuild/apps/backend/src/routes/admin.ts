import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, requireAdmin, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const serializeUser = (user: any) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.isAdmin ? 'admin' : user.isModerator ? 'moderator' : 'user',
    is_admin: user.isAdmin,
    is_moderator: user.isModerator,
    is_suspended: user.isSuspended,
    builds_count: user._count?.builds ?? 0,
    created_at: user.createdAt?.toISOString?.() ?? user.createdAt,
});

const serializeBuild = (build: any) => ({
    id: build.id,
    name: build.name,
    description: build.description,
    total_price: build.totalPrice,
    is_public: build.isPublic,
    is_featured: build.isFeatured,
    likes_count: build.likesCount,
    created_at: build.createdAt?.toISOString?.() ?? build.createdAt,
    updated_at: build.updatedAt?.toISOString?.() ?? build.updatedAt,
    user: build.user
        ? {
            id: build.user.id,
            username: build.user.username,
            email: build.user.email,
        }
        : null,
    parts_count: build.parts?.length ?? 0,
});

const serializePart = (part: any) => ({
    id: part.id,
    name: part.name,
    category: part.category,
    price: part.price,
    image_url: part.imageUrl,
    build_id: part.buildId,
    build_name: part.build?.name ?? null,
    owner_username: part.build?.user?.username ?? null,
    created_at: part.createdAt?.toISOString?.() ?? part.createdAt,
});

router.get('/stats', requireRole(['admin', 'moderator']), async (_req: AuthRequest, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [users, builds, parts, reports, activeToday] = await Promise.all([
            prisma.user.count(),
            prisma.build.count(),
            prisma.part.count(),
            prisma.bugReport.count(),
            prisma.dailyAIUsage.count({
                where: {
                    date: {
                        gte: today,
                    },
                },
            }),
        ]);

        res.json({
            users,
            builds,
            parts,
            reports,
            totalUsers: users,
            totalBuilds: builds,
            activeToday,
            totalRevenue: 0,
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Failed to fetch admin stats' });
    }
});

router.get('/users', requireRole(['admin', 'moderator']), async (_req: AuthRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                _count: {
                    select: {
                        builds: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json(users.map(serializeUser));
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

router.patch('/users/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const userId = parseInt(req.params.id, 10);

        if (Number.isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }

        const updates: Record<string, boolean> = {};

        if (typeof req.body?.is_admin === 'boolean') {
            updates.isAdmin = req.body.is_admin;
        }
        if (typeof req.body?.is_moderator === 'boolean') {
            updates.isModerator = req.body.is_moderator;
        }
        if (typeof req.body?.is_suspended === 'boolean') {
            updates.isSuspended = req.body.is_suspended;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No supported updates provided' });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updates,
            include: {
                _count: {
                    select: {
                        builds: true,
                    },
                },
            },
        });

        res.json({
            message: 'User updated',
            user: serializeUser(user),
        });
    } catch (error) {
        console.error('Error updating admin user:', error);
        res.status(500).json({ message: 'Failed to update user' });
    }
});

router.get('/builds', requireRole(['admin', 'moderator']), async (_req: AuthRequest, res: Response) => {
    try {
        const builds = await prisma.build.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                parts: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json(builds.map(serializeBuild));
    } catch (error) {
        console.error('Error fetching admin builds:', error);
        res.status(500).json({ message: 'Failed to fetch builds' });
    }
});

router.delete('/builds/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const buildId = parseInt(req.params.id, 10);

        if (Number.isNaN(buildId)) {
            return res.status(400).json({ message: 'Invalid build id' });
        }

        await prisma.build.delete({
            where: { id: buildId },
        });

        res.json({ message: 'Build deleted' });
    } catch (error) {
        console.error('Error deleting admin build:', error);
        res.status(500).json({ message: 'Failed to delete build' });
    }
});

router.get('/parts', requireRole(['admin', 'moderator']), async (_req: AuthRequest, res: Response) => {
    try {
        const parts = await prisma.part.findMany({
            include: {
                build: {
                    select: {
                        id: true,
                        name: true,
                        user: {
                            select: {
                                username: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json(parts.map(serializePart));
    } catch (error) {
        console.error('Error fetching admin parts:', error);
        res.status(500).json({ message: 'Failed to fetch parts' });
    }
});

router.get('/migrate', requireAdmin, async (_req: AuthRequest, res: Response) => {
    res.json({ message: 'No admin migration required' });
});

export default router;
