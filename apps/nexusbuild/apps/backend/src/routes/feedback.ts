import { Router, Response } from 'express';
import { AuthRequest, optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/', optionalAuth, async (req: AuthRequest, res: Response) => {
    res.status(202).json({
        message: 'Feedback endpoint is available, but no persistence is configured in this backend snapshot.',
        received: {
            user_id: req.userId ?? null,
            category: req.body?.category ?? null,
            message: req.body?.message ?? req.body?.description ?? null,
        },
    });
});

export default router;
