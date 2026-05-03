import crypto from "crypto";
import path from "path";
import { supabaseAdmin } from "../utils/supabase.js";

function safeExt(filename: string, mime?: string) {
    const ext = path.extname(filename || "").toLowerCase();
    if (ext) return ext.replace(".", "").slice(0, 10);

    if (mime === "application/pdf") return "pdf";
    if (mime?.startsWith("image/")) return (mime.split("/")[1] || "img").slice(0, 10);
    if (mime?.startsWith("video/")) return (mime.split("/")[1] || "vid").slice(0, 10);
    return "bin";
}

export function makeDocPath(args: {
    userId: string;
    homeId: string;
    itemId: string;
    filename: string;
    mimeType?: string;
}) {
    const id = crypto.randomUUID();
    const ext = safeExt(args.filename, args.mimeType);
    return `${args.userId}/${args.homeId}/${args.itemId}/${id}.${ext}`;
}

export async function uploadToBucket(params: {
    bucket: string;
    storagePath: string;
    buffer: Buffer;
    contentType?: string;
}) {
    const { bucket, storagePath, buffer, contentType } = params;

    const { error } = await supabaseAdmin.storage.from(bucket).upload(storagePath, buffer, {
        contentType: contentType || "application/octet-stream",
        upsert: false,
    });

    if (error) throw new Error(`Storage upload failed: ${error.message}`);
}
