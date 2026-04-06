import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../utils/supabase.js';

export interface AuthenticatedRequest extends Request {
    userId?: string;
    accessToken?: string;
}

export const authMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const t0 = Date.now();
    console.log("[AUTH] start");

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        req.userId = user.id;
        req.accessToken = token;
        console.log("[AUTH] ok", Date.now() - t0, "ms");
        next();
    } catch (err) {
        console.log("[AUTH] fail", Date.now() - t0, "ms", err);
        console.error('Auth middleware error:', err);
        return res.status(500).json({ error: 'Authentication failed' });
    }
};
