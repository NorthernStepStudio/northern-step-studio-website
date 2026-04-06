import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { createUserClient } from "../utils/supabase.js";
import { makeDocPath } from "../services/storageService.js";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: Number(process.env.MAX_UPLOAD_MB || 15) * 1024 * 1024 },
});

const BodySchema = z.object({
    item_id: z.string().uuid(),
    type: z.enum(["receipt", "manual", "warranty", "photo", "video", "invoice"]),
    filename: z.string().optional(),
});

// POST /v1/documents/upload (multipart/form-data)
// fields: item_id, type, (optional) filename
// file: file
router.post(
    "/upload",
    authMiddleware,
    upload.single("file"),
    async (req: AuthenticatedRequest, res) => {
        try {
            const file = req.file;
            if (!file) return res.status(400).json({ error: "file is required" });

            const parsed = BodySchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error.flatten() });
            }

            const { item_id, type } = parsed.data;
            const filename = parsed.data.filename || file.originalname || "upload.bin";
            const mimeType = file.mimetype;

            const token = req.accessToken;
            const userId = req.userId;

            if (!token || !userId) {
                return res.status(401).json({ error: "Missing auth context (token/user)" });
            }

            // RLS-scoped: confirm ownership and get home_id
            const userClient = createUserClient(token);

            const { data: item, error: itemErr } = await userClient
                .from("items")
                .select("id, room_id, rooms!inner(home_id)")
                .eq("id", item_id)
                .single();

            if (itemErr || !item) return res.status(404).json({ error: "Item not found" });

            // Extract home_id from the joined rooms data
            const homeId = (item as any).rooms?.home_id;
            if (!homeId) return res.status(400).json({ error: "Could not determine home for item" });

            const bucket = process.env.SUPABASE_UPLOADS_BUCKET || "uploads";
            const storagePath = makeDocPath({
                userId,
                homeId,
                itemId: item.id,
                filename,
                mimeType,
            });

            const { error: uploadError } = await userClient.storage
                .from(bucket)
                .upload(storagePath, file.buffer, {
                    contentType: mimeType,
                    upsert: false,
                });

            if (uploadError) {
                return res.status(400).json({ error: uploadError.message });
            }

            // Insert via RLS-scoped client (policies apply)
            const { data: doc, error: docErr } = await userClient
                .from("documents")
                .insert({
                    item_id,
                    doc_type: type,
                    file_type: mimeType,
                    original_name: filename,
                    storage_path: storagePath,
                })
                .select("*")
                .single();

            if (docErr) return res.status(400).json({ error: docErr.message });

            return res.json({ document: doc });
        } catch (e: any) {
            console.error("Upload error:", e);
            return res.status(500).json({ error: e?.message || "Upload failed" });
        }
    }
);

export default router;
