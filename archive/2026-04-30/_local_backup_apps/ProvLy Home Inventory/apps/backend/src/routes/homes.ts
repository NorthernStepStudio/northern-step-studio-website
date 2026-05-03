import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { createUserClient } from '../utils/supabase.js';

const router = Router();

// GET /homes - List all homes for user
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const supabase = createUserClient(req.accessToken!);

    const { data, error } = await supabase
        .from('homes')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.json(data);
});

// POST /homes - Create a new home
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const supabase = createUserClient(req.accessToken!);
    const { name, address } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Home name is required' });
    }

    const { data, error } = await supabase
        .from('homes')
        .insert({ user_id: req.userId, name, address })
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
});

// GET /homes/:id - Get a specific home
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const supabase = createUserClient(req.accessToken!);

    const { data, error } = await supabase
        .from('homes')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (error) {
        return res.status(404).json({ error: 'Home not found' });
    }

    return res.json(data);
});

// DELETE /homes/:id - Delete a home
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const supabase = createUserClient(req.accessToken!);

    const { error } = await supabase
        .from('homes')
        .delete()
        .eq('id', req.params.id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(204).send();
});

export default router;
