import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { createUserClient } from '../utils/supabase.js';

const router = Router();

// GET /rooms?homeId=xxx - List rooms in a home
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const supabase = createUserClient(req.accessToken!);
    const { homeId } = req.query;

    if (!homeId) {
        return res.status(400).json({ error: 'homeId query parameter is required' });
    }

    const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('home_id', homeId)
        .order('created_at', { ascending: true });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.json(data);
});

// POST /rooms - Create a room
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const supabase = createUserClient(req.accessToken!);
    const { homeId, name, roomType } = req.body;

    if (!homeId || !name) {
        return res.status(400).json({ error: 'homeId and name are required' });
    }

    const { data, error } = await supabase
        .from('rooms')
        .insert({ home_id: homeId, name, room_type: roomType })
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
});

// DELETE /rooms/:id
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const supabase = createUserClient(req.accessToken!);

    const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', req.params.id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(204).send();
});

export default router;
