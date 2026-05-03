import { Hono } from "hono";
import { type Env } from "./db";
import { authMiddleware, type AppUser } from "./auth";

const communityUploads = new Hono<{ Bindings: Env; Variables: { user: AppUser } }>();

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

type UploadImageFile = {
  name: string;
  type: string;
  size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
};

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function getFileExtension(name: string, contentType: string) {
  const safeName = sanitizeFileName(name);
  const lastDot = safeName.lastIndexOf(".");
  if (lastDot > -1 && lastDot < safeName.length - 1) {
    return safeName.slice(lastDot + 1).toLowerCase();
  }

  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/gif") return "gif";
  return "jpg";
}

communityUploads.post("/upload-image", authMiddleware, async (c) => {
  if (!c.env.R2_BUCKET) {
    return c.json(
      {
        error: "Community image uploads are unavailable because the R2_BUCKET binding is not configured.",
        expectedBinding: "R2_BUCKET",
        readPath: "src/worker/community-uploads.ts -> env.R2_BUCKET",
      },
      503,
    );
  }

  const form = await c.req.formData().catch(() => null);
  const fileCandidate = form?.get("image");
  const file =
    fileCandidate &&
    typeof fileCandidate === "object" &&
    "arrayBuffer" in fileCandidate &&
    "type" in fileCandidate &&
    "size" in fileCandidate &&
    "name" in fileCandidate
      ? (fileCandidate as UploadImageFile)
      : null;
  if (!file) {
    return c.json({ error: "Missing image file in form field `image`." }, 400);
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return c.json({ error: "Unsupported image type. Use JPG, PNG, WEBP, or GIF." }, 400);
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return c.json({ error: "Image exceeds 5MB upload limit." }, 400);
  }

  const extension = getFileExtension(file.name, file.type);
  const key = `community-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const bytes = await file.arrayBuffer();

  await c.env.R2_BUCKET.put(key, bytes, {
    httpMetadata: {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  return c.json({
    key,
    url: `/api/community-files/image/${encodeURIComponent(key)}`,
  });
});

communityUploads.get("/image/:key", async (c) => {
  if (!c.env.R2_BUCKET) {
    return c.json(
      {
        error: "Community image retrieval is unavailable because the R2_BUCKET binding is not configured.",
        expectedBinding: "R2_BUCKET",
        readPath: "src/worker/community-uploads.ts -> env.R2_BUCKET",
      },
      503,
    );
  }

  const key = c.req.param("key");
  const object = await c.env.R2_BUCKET.get(key);
  if (!object) {
    return c.json({ error: "Image not found" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  if (object.httpEtag) {
    headers.set("etag", object.httpEtag);
  }

  return c.body(object.body, { headers });
});

export default communityUploads;
