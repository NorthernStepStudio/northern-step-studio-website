import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
    res.json({
        user_id: req.userId ?? null,
        total_tokens: 0,
    });
});

export default router;
