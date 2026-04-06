import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { createUserClient, supabaseAdmin } from '../utils/supabase.js';

const router = Router();
const uploadsBucket = process.env.SUPABASE_UPLOADS_BUCKET || 'uploads';
const exportsBucket = process.env.SUPABASE_EXPORTS_BUCKET || 'exports';

/**
 * POST /account/export-all
 * Export all user data (CCPA/GDPR compliant)
 */
router.post('/export-all', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const userId = req.userId!;
    const supabase = createUserClient(req.accessToken!);

    try {
        // Gather all user data
        const [homes, items, documents, exportJobs, auditLogs] = await Promise.all([
            supabase.from('homes').select('*'),
            supabase.from('items').select('*'),
            supabase.from('documents').select('*'),
            supabase.from('export_jobs').select('*'),
            supabase.from('audit_logs').select('*'),
        ]);

        // Log this export action
        const { error: exportAuditError } = await supabaseAdmin.from('audit_logs').insert({
            user_id: userId,
            action: 'full_data_export',
            resource_type: 'account',
            details: { exportedAt: new Date().toISOString() },
        });
        if (exportAuditError) {
            console.warn('Audit log insert failed for export-all:', exportAuditError.message);
        }

        return res.json({
            exportedAt: new Date().toISOString(),
            data: {
                homes: homes.data,
                items: items.data,
                documents: documents.data,
                exportJobs: exportJobs.data,
                auditLogs: auditLogs.data,
            },
        });
    } catch (err: any) {
        console.error('Export all error:', err);
        return res.status(500).json({ error: 'Failed to export data' });
    }
});

/**
 * DELETE /account
 * Soft delete handling (Default)
 * Marks profile as deleted, signs out user
 */
router.delete('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const userId = req.userId!;
    const supabase = createUserClient(req.accessToken!);

    try {
        // 1. Mark as deleted
        const { error } = await supabase
            .from('profiles')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) throw error;

        // 2. Audit log when admin privileges are available.
        const { error: deleteAuditError } = await supabaseAdmin.from('audit_logs').insert({
            user_id: userId,
            action: 'account_soft_deleted',
            resource_type: 'account',
            details: { deletedAt: new Date().toISOString() },
        });
        if (deleteAuditError) {
            console.warn('Audit log insert failed for soft delete:', deleteAuditError.message);
        }

        return res.json({
            success: true,
            mode: 'soft',
            message: 'Account marked for deletion. Data will be retained for 30 days.'
        });
    } catch (err: any) {
        console.error('Soft delete error:', err);
        return res.status(500).json({ error: 'Failed to soft delete account: ' + err.message });
    }
});

/**
 * DELETE /account/hard
 * Immediate Hard Delete (CCPA/GDPR/Compliance)
 * Wipes Storage, Database, Auth
 * Headers: X-Confirm-Delete: DELETE
 */
router.delete('/hard', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const userId = req.userId!;
    const confirmHeader = req.header('X-Confirm-Delete');

    // Require specific confirmation header to prevent accidents
    if (confirmHeader !== 'DELETE') {
        return res.status(400).json({
            error: 'Hard deletion requires header "X-Confirm-Delete: DELETE"',
        });
    }

    try {
        // 1. Get storage paths BEFORE deleting DB rows
        // Documents (in 'uploads' bucket)
        const { data: docs } = await supabaseAdmin
            .from('documents')
            .select('storage_path, items!inner(rooms!inner(homes!inner(user_id)))')
            .eq('items.rooms.homes.user_id', userId);

        // Exports (in 'exports' bucket)
        const { data: exports } = await supabaseAdmin
            .from('export_jobs')
            .select('storage_path')
            .eq('user_id', userId);

        // 2. Delete storage files
        const docPaths = (docs || []).map((d: any) => d.storage_path).filter(Boolean);
        const exportJobs = (exports || []).map((e: any) => e.storage_path).filter(Boolean);

        if (docPaths.length > 0) {
            const { error: uploadError } = await supabaseAdmin.storage.from(uploadsBucket).remove(docPaths);
            if (uploadError) console.error('Failed to delete uploads:', uploadError);
        }

        // Export paths are usually folders, list and delete contents
        for (const jobPath of exportJobs) {
            const { data: files } = await supabaseAdmin.storage.from(exportsBucket).list(jobPath);
            if (files && files.length > 0) {
                const fullPaths = files.map(f => `${jobPath}/${f.name}`);
                await supabaseAdmin.storage.from(exportsBucket).remove(fullPaths);
            }
        }

        // 3. Log deletion audit (this will be deleted shortly if cascading, or kept if strictly separate)
        // We log it just in case audit logs are preserved elsewhere or before cascade
        await supabaseAdmin.from('audit_logs').insert({
            user_id: userId,
            action: 'account_hard_deleted',
            resource_type: 'account',
            details: {
                deletedAt: new Date().toISOString(),
                documentsDeleted: docPaths.length,
                exportsDeleted: exportJobs.length,
            },
        });

        // 4. Delete Auth User (This is the root)
        // Supabase Auth deletion typically cascades to public.profiles via ON DELETE CASCADE on the FK,
        // but we explicitly delete profile first to ensure app data is gone.
        await supabaseAdmin.from('profiles').delete().eq('id', userId);

        // Finally delete the auth user
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) throw authError;

        return res.json({
            success: true,
            mode: 'hard',
            message: 'Account and all data permanently deleted',
            deletedAt: new Date().toISOString(),
        });
    } catch (err: any) {
        console.error('Hard delete error:', err);
        return res.status(500).json({ error: 'Failed to delete account: ' + err.message });
    }
});

/**
 * GET /account/audit-logs
 * View export and deletion history
 */
router.get('/audit-logs', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const userId = req.userId!;
    const supabase = createUserClient(req.accessToken!);

    const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.json(data);
});

export default router;
