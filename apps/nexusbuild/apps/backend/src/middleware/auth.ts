import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    userId?: number;
    user?: {
        id: number;
        isAdmin: boolean;
        isModerator: boolean;
        isSuspended: boolean;
    };
}

const getJwtSecret = () => process.env.JWT_SECRET || 'dev-secret-key';

const resolveUserIdFromAuthorization = (req: AuthRequest): number | null => {
    if (req.userId) {
        return req.userId;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: number };
    req.userId = decoded.userId;
    return decoded.userId;
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = resolveUserIdFromAuthorization(req);
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        resolveUserIdFromAuthorization(req);

        next();
    } catch (error) {
        // Ignore auth errors for optional auth
        next();
    }
};

export const requireRole = (roles: string[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = resolveUserIdFromAuthorization(req);
            if (!userId) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            // Import here to avoid circular dependency
            const { PrismaClient } = await import('@prisma/client');
            const prisma = new PrismaClient();

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    isAdmin: true,
                    isModerator: true,
                    isSuspended: true,
                },
            });

            await prisma.$disconnect();

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (user.isSuspended) {
                return res.status(403).json({ message: 'Account suspended' });
            }

            const hasRole =
                (roles.includes('admin') && user.isAdmin) ||
                (roles.includes('moderator') && user.isModerator);

            if (!hasRole) {
                return res.status(403).json({ message: 'Insufficient permissions' });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(500).json({ message: 'Authorization error' });
        }
    };
};

// Convenience exports
export const authenticate = requireAuth;
export const requireAdmin = requireRole(['admin']);

