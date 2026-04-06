import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { createUserClient } from '../utils/supabase.js';

const router = Router();
const uploadsBucket = process.env.SUPABASE_UPLOADS_BUCKET || 'uploads';

// POST /documents - Attach a document to an item
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const supabase = createUserClient(req.accessToken!);
    const { itemId, docType, storagePath, fileType, originalName } = req.body;

    if (!itemId || !docType || !storagePath) {
        return res.status(400).json({ error: 'itemId, docType, and storagePath are required' });
    }

    const { data, error } = await supabase
        .from('documents')
        .insert({
            item_id: itemId,
            doc_type: docType,
            storage_path: storagePath,
            file_type: fileType,
            original_name: originalName,
        })
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
});

// GET /documents/:id/signed-url - Get a signed download URL
router.get('/:id/signed-url', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const supabase = createUserClient(req.accessToken!);

    // First get the document to verify ownership via RLS
    const { data: doc, error: docError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', req.params.id)
        .single();

    if (docError || !doc) {
        return res.status(404).json({ error: 'Document not found' });
    }

    // Generate signed URL (60 minutes expiry)
    const { data: signedUrl, error: urlError } = await supabase.storage
        .from(uploadsBucket)
        .createSignedUrl(doc.storage_path, 3600);

    if (urlError) {
        return res.status(500).json({ error: 'Failed to generate signed URL' });
    }

    return res.json({ signedUrl: signedUrl.signedUrl });
});

// DELETE /documents/:id
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const supabase = createUserClient(req.accessToken!);

    // Get doc first to delete from storage
    const { data: doc } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', req.params.id)
        .single();

    if (doc) {
        await supabase.storage.from(uploadsBucket).remove([doc.storage_path]);
    }

    const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', req.params.id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(204).send();
});

export default router;
