import express, { Response } from 'express';
import { createUserClient } from '../utils/supabase.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all maintenance tasks for the user
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = createUserClient(req.accessToken!);
        const userId = req.userId;

        const { data: tasks, error: tasksError } = await supabase
            .from('maintenance_tasks')
            .select('*')
            .eq('user_id', userId)
            .order('due_date', { ascending: true });

        if (tasksError) throw tasksError;

        res.json(tasks);
    } catch (error: any) {
        console.error('Error fetching maintenance tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create a new task
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = createUserClient(req.accessToken!);
        const userId = req.userId;
        const { item_id, title, description, due_date, frequency_days } = req.body;

        if (!item_id || !title) {
            return res.status(400).json({ error: 'item_id and title are required' });
        }

        // Verify item ownership
        const { data: item } = await supabase
            .from('items')
            .select('id, rooms!inner(home_id)')
            .eq('id', item_id)
            .single();

        if (!item) {
            return res.status(404).json({ error: 'Item not found or access denied' });
        }

        const { data, error } = await supabase
            .from('maintenance_tasks')
            .insert({
                item_id,
                user_id: userId,
                title,
                description,
                due_date,
                frequency_days,
                is_completed: false
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error: any) {
        console.error('Error creating maintenance task:', error);
        res.status(500).json({ error: error.message });
    }
});

// Toggle task completion
router.patch('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = createUserClient(req.accessToken!);
        const userId = req.userId;
        const { id } = req.params;
        const { is_completed, completed_at } = req.body;

        const { data: task } = await supabase
            .from('maintenance_tasks')
            .select('id')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const { data, error } = await supabase
            .from('maintenance_tasks')
            .update({
                is_completed,
                completed_at
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        console.error('Error updating maintenance task:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
