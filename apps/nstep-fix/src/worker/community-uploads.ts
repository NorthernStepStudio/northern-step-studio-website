import { Hono } from "hono";
import { type AppUser } from "./auth";

const communityUploads = new Hono<{ Bindings: Env; Variables: { user: AppUser } }>();

// Upload image for community posts
communityUploads.post("/upload-image", async (c) => {
  const authUser = c.get("user");
  if (!authUser) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  const formData = await c.req.formData();
  const file = formData.get("image") as File;

  if (!file) {
    return c.json({ error: "No file provided" }, 400);
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return c.json({ error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." }, 400);
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return c.json({ error: "File too large. Maximum size is 5MB." }, 400);
  }

  // Generate unique filename
  const timestamp = Date.now();
  const ext = file.name.split('.').pop();
  const sanitizedEmail = authUser.email.replace(/[^a-zA-Z0-9]/g, '-');
  const filename = `${sanitizedEmail}-${timestamp}.${ext}`;
  const key = `community/${filename}`;
  const bucket = c.env.R2_BUCKET;
  if (!bucket) {
    return c.json({ error: "Community uploads are currently disabled (missing R2 configuration)." }, 503);
  }

  // Upload to R2
  await bucket.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });

  // Construct public URL
  const url = `/api/community-files/${filename}`;

  return c.json({ url });
});

// Serve community image files
communityUploads.get("/:filename", async (c) => {
  const filename = c.req.param("filename");
  const key = `community/${filename}`;
  const bucket = c.env.R2_BUCKET;

  const object = await bucket.get(key);
  
  if (!object) {
    return c.json({ error: "File not found" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  if (object.httpEtag) {
    headers.set("etag", object.httpEtag);
  }
  headers.set("cache-control", "public, max-age=31536000");
  
  return c.body(object.body, { headers });
});

export default communityUploads;
