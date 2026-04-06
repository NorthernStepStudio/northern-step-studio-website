import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
    res.json({
        user_id: req.userId ?? null,
        subscriptions: [],
    });
});

export default router;
