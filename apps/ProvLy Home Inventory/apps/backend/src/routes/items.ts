import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { createUserClient } from '../utils/supabase.js';

const router = Router();

// GET /items?roomId=xxx - List items in a room
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const supabase = createUserClient(req.accessToken!);
    const { roomId } = req.query;

    if (!roomId) {
        return res.status(400).json({ error: 'roomId query parameter is required' });
    }

    const { data, error } = await supabase
        .from('items')
        .select('*, documents(*)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.json(data);
});

// POST /items - Create an item
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const supabase = createUserClient(req.accessToken!);
    const { roomId, name, category, brand, model, serialNumber, purchaseDate, purchasePrice, notes } = req.body;

    if (!roomId || !name) {
        return res.status(400).json({ error: 'roomId and name are required' });
    }

    const { data, error } = await supabase
        .from('items')
        .insert({
            room_id: roomId,
            name,
            category,
            brand,
            model,
            serial_number: serialNumber,
            purchase_date: purchaseDate,
            purchase_price: purchasePrice,
            notes,
        })
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
});

// GET /items/:id - Get single item with documents
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const supabase = createUserClient(req.accessToken!);

    const { data, error } = await supabase
        .from('items')
        .select('*, documents(*)')
        .eq('id', req.params.id)
        .single();

    if (error) {
        return res.status(404).json({ error: 'Item not found' });
    }

    return res.json(data);
});

// PATCH /items/:id - Update an item
router.patch('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const supabase = createUserClient(req.accessToken!);
    const { name, category, brand, model, serialNumber, purchaseDate, purchasePrice, notes, status } = req.body;

    const { data, error } = await supabase
        .from('items')
        .update({
            name,
            category,
            brand,
            model,
            serial_number: serialNumber,
            purchase_date: purchaseDate,
            purchase_price: purchasePrice,
            notes,
            status,
            updated_at: new Date().toISOString(),
        })
        .eq('id', req.params.id)
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.json(data);
});

// DELETE /items/:id
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const supabase = createUserClient(req.accessToken!);

    const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', req.params.id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(204).send();
});

export default router;
