import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { createUserClient } from '../utils/supabase.js';
import { createExportJob } from '../services/exportService.js';
import { createZipExportJob } from '../services/zipExportService.js';
import { requireEntitlement } from '../middleware/tierGating.js';

const router = Router();
const exportsBucket = process.env.SUPABASE_EXPORTS_BUCKET || 'exports';

// POST /exports/trigger - Start export job
router.post('/trigger', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const supabase = createUserClient(req.accessToken!);
    const { homeId, format } = req.body;

    if (!homeId) {
        return res.status(400).json({ error: 'homeId is required' });
    }

    // Verify home ownership
    const { data: home, error: homeError } = await supabase
        .from('homes')
        .select('id, name')
        .eq('id', homeId)
        .single();

    if (homeError || !home) {
        return res.status(404).json({ error: 'Home not found' });
    }

    try {
        let result;
        if (format === 'zip') {
            // Gate ZIP export behind 'pro' entitlement
            // We invoke the middleware imperatively since this is a conditional check logic
            await new Promise<void>((resolve, reject) => {
                requireEntitlement('pro')(req, res, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            // If response headers sent by middleware (403/503), the promise loop above might hang or we need to check res.headersSent
            if (res.headersSent) return;

            result = await createZipExportJob(req.userId!, req.accessToken!, homeId, home.name);
        } else {
            result = await createExportJob(req.userId!, req.accessToken!, homeId, home.name);
        }

        return res.status(201).json({
            jobId: result.jobId,
            message: 'Export started successfully',
        });
    } catch (err: any) {
        console.error('Export error:', err);
        return res.status(500).json({ error: 'Export failed: ' + err.message });
    }
});

// GET /exports/jobs - List user's export history
router.get('/jobs', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const supabase = createUserClient(req.accessToken!);

    const { data, error } = await supabase
        .from('export_jobs')
        .select('*, homes(name)')
        .order('created_at', { ascending: false });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.json(data);
});

// GET /exports/:id/download - Get signed download URLs
router.get('/:id/download', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const supabase = createUserClient(req.accessToken!);

    const { data: job, error } = await supabase
        .from('export_jobs')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (error || !job) {
        return res.status(404).json({ error: 'Export not found' });
    }

    if (job.status !== 'completed') {
        return res.status(400).json({ error: 'Export not ready', status: job.status });
    }

    // List files in export folder
    const { data: files } = await supabase.storage
        .from(exportsBucket)
        .list(job.storage_path);

    if (!files || files.length === 0) {
        return res.status(404).json({ error: 'Export files not found' });
    }

    // Generate signed URLs for each file
    const downloadLinks = await Promise.all(
        files.map(async (file) => {
            const { data } = await supabase.storage
                .from(exportsBucket)
                .createSignedUrl(`${job.storage_path}/${file.name}`, 3600);
            return {
                name: file.name,
                url: data?.signedUrl,
            };
        })
    );

    return res.json({ downloadLinks });
});

export default router;
