import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, optionalAuth, requireAuth, requireRole } from '../middleware/auth';
import { upload, getFileUrl } from '../middleware/upload';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/reports
 * Submit a bug report (authenticated or anonymous)
 * Supports both JSON and multipart/form-data
 */
router.post('/', optionalAuth, upload.array('image', 5), async (req: AuthRequest, res: Response) => {
    try {
        const { description, email, category, message } = req.body;
        const userId = req.userId;

        // Handle both 'description' and 'message' fields
        const reportDescription = description || message;

        if (!reportDescription || reportDescription.trim().length === 0) {
            return res.status(400).json({ message: 'Description is required' });
        }

        // Process uploaded images
        const files = req.files as Express.Multer.File[];
        const imageUrls: string[] = [];
        let primaryImage: string | null = null;

        if (files && files.length > 0) {
            for (const file of files) {
                const url = getFileUrl(file.path);
                imageUrls.push(url);
                if (!primaryImage) {
                    primaryImage = url;
                }
            }
        }

        // Create bug report
        const report = await prisma.bugReport.create({
            data: {
                userId: userId || null,
                email: email || null,
                description: reportDescription.trim(),
                category: category || 'other',
                imageUrl: primaryImage,
                images: imageUrls.length > 0 ? imageUrls : undefined,
                status: 'pending',
                priority: 'medium',
            },
        });

        // Get username if user is authenticated
        let username = 'Anonymous';
        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { username: true },
            });
            username = user?.username || 'Anonymous';
        }

        console.log(`✅ Bug report created: ID=${report.id}, User=${report.userId || 'Anonymous'}`);

        res.status(201).json({
            message: 'Report submitted successfully',
            report: {
                id: report.id,
                user_id: report.userId,
                username,
                email: report.email,
                description: report.description,
                category: report.category,
                image_url: report.imageUrl,
                images: report.images || [],
                status: report.status,
                priority: report.priority,
                admin_notes: report.adminNotes,
                created_at: report.createdAt.toISOString(),
            },
        });
    } catch (error) {
        console.error('Error creating bug report:', error);
        res.status(500).json({ message: 'Failed to submit report' });
    }
});

/**
 * GET /api/reports/my
 * Get current user's bug reports (authenticated users)
 * This allows users to see their reports across all devices (iOS, Android, Web)
 */
router.get('/my', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const reports = await prisma.bugReport.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true },
        });

        const formattedReports = reports.map((report: any) => ({
            id: report.id,
            user_id: report.userId,
            username: user?.username || 'User',
            email: report.email,
            description: report.description,
            category: report.category,
            image_url: report.imageUrl,
            images: report.images || [],
            status: report.status,
            priority: report.priority,
            admin_notes: report.adminNotes,
            created_at: report.createdAt.toISOString(),
        }));

        res.json(formattedReports);
    } catch (error) {
        console.error('Error fetching user reports:', error);
        res.status(500).json({ message: 'Failed to fetch reports' });
    }
});

/**
 * GET /api/reports
 * Get all bug reports (admin/moderator only)
 */
router.get('/', requireRole(['admin', 'moderator']), async (req: AuthRequest, res: Response) => {
    try {
        const reports = await prisma.bugReport.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Fetch usernames for all reports that have a userId
        const userIds = reports.filter((r: any) => r.userId !== null).map((r: any) => r.userId!) as number[];
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, username: true },
        });

        const userMap = new Map(users.map((u: any) => [u.id, u.username]));

        const formattedReports = reports.map((report: any) => ({
            id: report.id,
            user_id: report.userId,
            username: report.userId ? userMap.get(report.userId) || 'Anonymous' : 'Anonymous',
            email: report.email,
            description: report.description,
            category: report.category,
            image_url: report.imageUrl,
            images: report.images || [],
            status: report.status,
            priority: report.priority,
            admin_notes: report.adminNotes,
            created_at: report.createdAt.toISOString(),
        }));

        res.json(formattedReports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Failed to fetch reports' });
    }
});

/**
 * PATCH /api/reports/:id
 * Update bug report status/priority (admin/moderator only)
 */
router.patch('/:id', requireRole(['admin', 'moderator']), async (req: AuthRequest, res: Response) => {
    try {
        const reportId = parseInt(req.params.id);
        const { status, priority, admin_notes } = req.body;

        const report = await prisma.bugReport.update({
            where: { id: reportId },
            data: {
                status: status || undefined,
                priority: priority || undefined,
                adminNotes: admin_notes || undefined,
            },
        });

        // Get username if report has a userId
        let username = 'Anonymous';
        if (report.userId) {
            const user = await prisma.user.findUnique({
                where: { id: report.userId },
                select: { username: true },
            });
            username = user?.username || 'Anonymous';
        }

        res.json({
            message: 'Report updated',
            report: {
                id: report.id,
                user_id: report.userId,
                username,
                email: report.email,
                description: report.description,
                category: report.category,
                image_url: report.imageUrl,
                images: report.images || [],
                status: report.status,
                priority: report.priority,
                admin_notes: report.adminNotes,
                created_at: report.createdAt.toISOString(),
            },
        });
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({ message: 'Failed to update report' });
    }
});

/**
 * DELETE /api/reports/:id
 * Delete bug report (admin/moderator only)
 */
router.delete('/:id', requireRole(['admin', 'moderator']), async (req: AuthRequest, res: Response) => {
    try {
        const reportId = parseInt(req.params.id);

        await prisma.bugReport.delete({
            where: { id: reportId },
        });

        res.json({ message: 'Report deleted' });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ message: 'Failed to delete report' });
    }
});

export default router;
