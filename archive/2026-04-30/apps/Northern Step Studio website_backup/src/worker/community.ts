import { Hono } from "hono";
import { getDb, type Env } from "./db";
import { authMiddleware, getAuthenticatedUser, type AppUser } from "./auth";
import { isElevatedRole } from "../shared/auth";

const community = new Hono<{ Bindings: Env; Variables: { user: AppUser } }>();

type DbUser = {
  id: number;
  role: string;
  display_name: string | null;
  email: string;
};

type ThreadRow = {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  category_name: string | null;
  category_slug: string | null;
  author_id: number | null;
  author_name: string | null;
  is_pinned: unknown;
  is_locked: unknown;
  is_hidden: unknown;
  view_count: number | null;
  post_count: number | null;
  created_at: string;
  updated_at: string;
  last_post_at: string | null;
  last_activity_at: string | null;
};

type PostRow = {
  id: number;
  thread_id: number;
  content: string;
  user_id: number | null;
  author_name: string | null;
  is_deleted: unknown;
  created_at: string;
  updated_at: string;
};

function toBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value === 1;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "t";
  }
  return false;
}

function clampInt(raw: string | undefined, fallback: number, min: number, max: number) {
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, Math.floor(numeric)));
}

function normalizeSearch(value: string | undefined) {
  return (value || "").trim().toLowerCase();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeThread(row: ThreadRow) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content || "",
    category_name: row.category_name || "General",
    category_slug: row.category_slug || "general",
    author_id: row.author_id,
    author_name: row.author_name || "Community member",
    is_pinned: toBoolean(row.is_pinned),
    is_locked: toBoolean(row.is_locked),
    is_hidden: toBoolean(row.is_hidden),
    view_count: Number(row.view_count || 0),
    post_count: Number(row.post_count || 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_post_at: row.last_post_at || row.last_activity_at || row.updated_at,
  };
}

function normalizePost(row: PostRow) {
  return {
    id: row.id,
    thread_id: row.thread_id,
    content: row.content,
    author_id: row.user_id,
    author_name: row.author_name || "Community member",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function getDbUserByEmail(env: Env, email: string): Promise<DbUser | null> {
  const sql = getDb(env);
  const [row] = await sql<DbUser[]>`
    SELECT id, role, display_name, email
    FROM users
    WHERE email = ${email}
  `;
  return row || null;
}

async function getOptionalDbUser(c: { env: Env; req: { url: string } }) {
  const sessionUser = await getAuthenticatedUser(c);
  if (!sessionUser?.email) {
    return null;
  }
  return getDbUserByEmail(c.env, sessionUser.email);
}

async function getRequiredDbUser(c: { env: Env; get: (key: "user") => AppUser }) {
  const authUser = c.get("user");
  const dbUser = await getDbUserByEmail(c.env, authUser.email);
  if (!dbUser) {
    return null;
  }
  return dbUser;
}

function requireElevatedRole(role: string) {
  return isElevatedRole(role);
}

async function generateUniqueThreadSlug(env: Env, baseTitle: string) {
  const sql = getDb(env);
  const base = slugify(baseTitle) || "thread";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const [existing] = await sql<{ id: number }[]>`
      SELECT id FROM community_threads WHERE slug = ${candidate} LIMIT 1
    `;
    if (!existing) {
      return candidate;
    }
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

async function getThreadById(env: Env, id: number) {
  const sql = getDb(env);
  const [row] = await sql<ThreadRow[]>`
    SELECT
      ct.id,
      ct.title,
      ct.slug,
      ct.content,
      cc.name AS category_name,
      cc.slug AS category_slug,
      ct.user_id AS author_id,
      u.display_name AS author_name,
      ct.is_pinned,
      ct.is_locked,
      ct.is_hidden,
      ct.view_count,
      (
        SELECT COUNT(*)
        FROM community_posts cp
        WHERE cp.thread_id = ct.id
          AND NOT COALESCE(cp.is_deleted, FALSE)
      ) AS post_count,
      ct.created_at,
      ct.updated_at,
      (
        SELECT MAX(cp.created_at)
        FROM community_posts cp
        WHERE cp.thread_id = ct.id
          AND NOT COALESCE(cp.is_deleted, FALSE)
      ) AS last_post_at,
      COALESCE(
        (
          SELECT MAX(cp.created_at)
          FROM community_posts cp
          WHERE cp.thread_id = ct.id
            AND NOT COALESCE(cp.is_deleted, FALSE)
        ),
        ct.updated_at,
        ct.created_at
      ) AS last_activity_at
    FROM community_threads ct
    LEFT JOIN community_categories cc ON cc.id = ct.category_id
    LEFT JOIN users u ON u.id = ct.user_id
    WHERE ct.id = ${id}
    LIMIT 1
  `;

  return row ? normalizeThread(row) : null;
}

community.get("/categories", async (c) => {
  const sql = getDb(c.env);

  const categories = await sql<{
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    sort_order: number | null;
    thread_count: number | null;
    post_count: number | null;
    last_thread_title: string | null;
    last_thread_slug: string | null;
  }[]>`
    SELECT
      cc.id,
      cc.name,
      cc.slug,
      cc.description,
      cc.icon,
      cc.sort_order,
      COUNT(DISTINCT CASE WHEN NOT COALESCE(ct.is_hidden, FALSE) THEN ct.id END) AS thread_count,
      COUNT(CASE WHEN NOT COALESCE(cp.is_deleted, FALSE) AND NOT COALESCE(ct.is_hidden, FALSE) THEN cp.id END) AS post_count,
      (
        SELECT t.title
        FROM community_threads t
        WHERE t.category_id = cc.id
          AND NOT COALESCE(t.is_hidden, FALSE)
        ORDER BY COALESCE(t.updated_at, t.created_at) DESC
        LIMIT 1
      ) AS last_thread_title,
      (
        SELECT t.slug
        FROM community_threads t
        WHERE t.category_id = cc.id
          AND NOT COALESCE(t.is_hidden, FALSE)
        ORDER BY COALESCE(t.updated_at, t.created_at) DESC
        LIMIT 1
      ) AS last_thread_slug
    FROM community_categories cc
    LEFT JOIN community_threads ct ON ct.category_id = cc.id
    LEFT JOIN community_posts cp ON cp.thread_id = ct.id
    WHERE COALESCE(cc.is_active, TRUE)
    GROUP BY cc.id
    ORDER BY COALESCE(cc.sort_order, 0) ASC, cc.name ASC
  `;

  return c.json(
    categories.map((category: {
      id: number;
      name: string;
      slug: string;
      description: string | null;
      icon: string | null;
      sort_order: number | null;
      thread_count: number | null;
      post_count: number | null;
      last_thread_title: string | null;
      last_thread_slug: string | null;
    }) => ({
      ...category,
      icon: category.icon || "💬",
      description: category.description || "",
      thread_count: Number(category.thread_count || 0),
      post_count: Number(category.post_count || 0),
      sort_order: Number(category.sort_order || 0),
    })),
  );
});

community.get("/threads", async (c) => {
  const page = clampInt(c.req.query("page"), 1, 1, 1000);
  const limit = clampInt(c.req.query("limit"), 20, 1, 100);
  const category = (c.req.query("category") || "").trim().toLowerCase();
  const search = normalizeSearch(c.req.query("search"));

  const optionalUser = await getOptionalDbUser(c);
  const showHidden = optionalUser ? requireElevatedRole(optionalUser.role) : false;

  const sql = getDb(c.env);
  const rows = await sql<ThreadRow[]>`
    SELECT
      ct.id,
      ct.title,
      ct.slug,
      ct.content,
      cc.name AS category_name,
      cc.slug AS category_slug,
      ct.user_id AS author_id,
      u.display_name AS author_name,
      ct.is_pinned,
      ct.is_locked,
      ct.is_hidden,
      ct.view_count,
      (
        SELECT COUNT(*)
        FROM community_posts cp
        WHERE cp.thread_id = ct.id
          AND NOT COALESCE(cp.is_deleted, FALSE)
      ) AS post_count,
      ct.created_at,
      ct.updated_at,
      (
        SELECT MAX(cp.created_at)
        FROM community_posts cp
        WHERE cp.thread_id = ct.id
          AND NOT COALESCE(cp.is_deleted, FALSE)
      ) AS last_post_at,
      COALESCE(
        (
          SELECT MAX(cp.created_at)
          FROM community_posts cp
          WHERE cp.thread_id = ct.id
            AND NOT COALESCE(cp.is_deleted, FALSE)
        ),
        ct.updated_at,
        ct.created_at
      ) AS last_activity_at
    FROM community_threads ct
    LEFT JOIN community_categories cc ON cc.id = ct.category_id
    LEFT JOIN users u ON u.id = ct.user_id
    ORDER BY
      CASE WHEN COALESCE(ct.is_pinned, FALSE) THEN 0 ELSE 1 END ASC,
      COALESCE(
        (
          SELECT MAX(cp.created_at)
          FROM community_posts cp
          WHERE cp.thread_id = ct.id
            AND NOT COALESCE(cp.is_deleted, FALSE)
        ),
        ct.updated_at,
        ct.created_at
      ) DESC
  `;

  const filtered = rows
    .map((row: ThreadRow) => normalizeThread(row))
    .filter((thread: ReturnType<typeof normalizeThread>) => (showHidden ? true : !thread.is_hidden))
    .filter((thread: ReturnType<typeof normalizeThread>) =>
      category ? thread.category_slug.toLowerCase() === category : true,
    )
    .filter((thread: ReturnType<typeof normalizeThread>) => {
      if (!search) {
        return true;
      }
      const haystack = `${thread.title} ${thread.content}`.toLowerCase();
      return haystack.includes(search);
    });

  const total = filtered.length;
  const offset = (page - 1) * limit;
  const threads = filtered.slice(offset, offset + limit);

  return c.json({
    threads,
    pagination: {
      page,
      limit,
      total,
      hasMore: offset + threads.length < total,
    },
  });
});

community.get("/threads/:identifier", async (c) => {
  const identifier = c.req.param("identifier");
  const threadId = Number(identifier);
  const isNumericId = Number.isFinite(threadId) && threadId > 0;

  const optionalUser = await getOptionalDbUser(c);
  const showHidden = optionalUser ? requireElevatedRole(optionalUser.role) : false;

  const sql = getDb(c.env);
  const [row] = isNumericId
    ? await sql<ThreadRow[]>`
        SELECT
          ct.id,
          ct.title,
          ct.slug,
          ct.content,
          cc.name AS category_name,
          cc.slug AS category_slug,
          ct.user_id AS author_id,
          u.display_name AS author_name,
          ct.is_pinned,
          ct.is_locked,
          ct.is_hidden,
          ct.view_count,
          (
            SELECT COUNT(*)
            FROM community_posts cp
            WHERE cp.thread_id = ct.id
              AND NOT COALESCE(cp.is_deleted, FALSE)
          ) AS post_count,
          ct.created_at,
          ct.updated_at,
          (
            SELECT MAX(cp.created_at)
            FROM community_posts cp
            WHERE cp.thread_id = ct.id
              AND NOT COALESCE(cp.is_deleted, FALSE)
          ) AS last_post_at,
          COALESCE(
            (
              SELECT MAX(cp.created_at)
              FROM community_posts cp
              WHERE cp.thread_id = ct.id
                AND NOT COALESCE(cp.is_deleted, FALSE)
            ),
            ct.updated_at,
            ct.created_at
          ) AS last_activity_at
        FROM community_threads ct
        LEFT JOIN community_categories cc ON cc.id = ct.category_id
        LEFT JOIN users u ON u.id = ct.user_id
        WHERE ct.id = ${threadId}
        LIMIT 1
      `
    : await sql<ThreadRow[]>`
        SELECT
          ct.id,
          ct.title,
          ct.slug,
          ct.content,
          cc.name AS category_name,
          cc.slug AS category_slug,
          ct.user_id AS author_id,
          u.display_name AS author_name,
          ct.is_pinned,
          ct.is_locked,
          ct.is_hidden,
          ct.view_count,
          (
            SELECT COUNT(*)
            FROM community_posts cp
            WHERE cp.thread_id = ct.id
              AND NOT COALESCE(cp.is_deleted, FALSE)
          ) AS post_count,
          ct.created_at,
          ct.updated_at,
          (
            SELECT MAX(cp.created_at)
            FROM community_posts cp
            WHERE cp.thread_id = ct.id
              AND NOT COALESCE(cp.is_deleted, FALSE)
          ) AS last_post_at,
          COALESCE(
            (
              SELECT MAX(cp.created_at)
              FROM community_posts cp
              WHERE cp.thread_id = ct.id
                AND NOT COALESCE(cp.is_deleted, FALSE)
            ),
            ct.updated_at,
            ct.created_at
          ) AS last_activity_at
        FROM community_threads ct
        LEFT JOIN community_categories cc ON cc.id = ct.category_id
        LEFT JOIN users u ON u.id = ct.user_id
        WHERE ct.slug = ${identifier}
        LIMIT 1
      `;

  if (!row) {
    return c.json({ error: "Thread not found" }, 404);
  }

  const thread = normalizeThread(row);
  if (thread.is_hidden && !showHidden) {
    return c.json({ error: "Thread not found" }, 404);
  }

  if (!isNumericId) {
    await sql`
      UPDATE community_threads
      SET view_count = COALESCE(view_count, 0) + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${thread.id}
    `;
    thread.view_count += 1;
  }

  return c.json(thread);
});

community.post("/threads", authMiddleware, async (c) => {
  const dbUser = await getRequiredDbUser(c);
  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  const body = await c.req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const categorySlug = typeof body?.category_slug === "string" ? body.category_slug.trim().toLowerCase() : "";

  if (!title || !content || !categorySlug) {
    return c.json({ error: "category_slug, title, and content are required" }, 400);
  }

  const sql = getDb(c.env);
  const [category] = await sql<{ id: number }[]>`
    SELECT id
    FROM community_categories
    WHERE slug = ${categorySlug} AND COALESCE(is_active, TRUE)
    LIMIT 1
  `;

  if (!category) {
    return c.json({ error: "Category not found" }, 404);
  }

  const slug = await generateUniqueThreadSlug(c.env, title);
  const [inserted] = await sql<{ id: number }[]>`
    INSERT INTO community_threads (category_id, user_id, title, slug, content)
    VALUES (${category.id}, ${dbUser.id}, ${title}, ${slug}, ${content})
    RETURNING id
  `;

  if (!inserted?.id) {
    return c.json({ error: "Failed to create thread" }, 500);
  }

  const created = await getThreadById(c.env, inserted.id);
  if (!created) {
    return c.json({ error: "Thread created but failed to load result" }, 500);
  }

  return c.json(created, 201);
});

community.patch("/threads/:id/pin", authMiddleware, async (c) => {
  const dbUser = await getRequiredDbUser(c);
  if (!dbUser || !requireElevatedRole(dbUser.role)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id) || id <= 0) {
    return c.json({ error: "Invalid thread id" }, 400);
  }

  const body = await c.req.json().catch(() => null);
  const isPinned = Boolean(body?.is_pinned);
  const sql = getDb(c.env);
  await sql`
    UPDATE community_threads
    SET is_pinned = ${isPinned}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;

  return c.json({ success: true, id, is_pinned: isPinned });
});

community.patch("/threads/:id/lock", authMiddleware, async (c) => {
  const dbUser = await getRequiredDbUser(c);
  if (!dbUser || !requireElevatedRole(dbUser.role)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id) || id <= 0) {
    return c.json({ error: "Invalid thread id" }, 400);
  }

  const body = await c.req.json().catch(() => null);
  const isLocked = Boolean(body?.is_locked);
  const sql = getDb(c.env);
  await sql`
    UPDATE community_threads
    SET is_locked = ${isLocked}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;

  return c.json({ success: true, id, is_locked: isLocked });
});

community.patch("/threads/:id/hide", authMiddleware, async (c) => {
  const dbUser = await getRequiredDbUser(c);
  if (!dbUser || !requireElevatedRole(dbUser.role)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id) || id <= 0) {
    return c.json({ error: "Invalid thread id" }, 400);
  }

  const body = await c.req.json().catch(() => null);
  const isHidden = Boolean(body?.is_hidden);
  const sql = getDb(c.env);
  await sql`
    UPDATE community_threads
    SET is_hidden = ${isHidden}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;

  return c.json({ success: true, id, is_hidden: isHidden });
});

community.delete("/threads/:id", authMiddleware, async (c) => {
  const dbUser = await getRequiredDbUser(c);
  if (!dbUser || !requireElevatedRole(dbUser.role)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id) || id <= 0) {
    return c.json({ error: "Invalid thread id" }, 400);
  }

  const sql = getDb(c.env);
  await sql`DELETE FROM community_posts WHERE thread_id = ${id}`;
  await sql`DELETE FROM community_threads WHERE id = ${id}`;

  return c.json({ success: true });
});

community.get("/posts", async (c) => {
  const threadId = Number(c.req.query("thread_id"));
  if (!Number.isFinite(threadId) || threadId <= 0) {
    return c.json({ error: "thread_id is required" }, 400);
  }

  const page = clampInt(c.req.query("page"), 1, 1, 1000);
  const limit = clampInt(c.req.query("limit"), 50, 1, 200);
  const optionalUser = await getOptionalDbUser(c);
  const showDeleted = optionalUser ? requireElevatedRole(optionalUser.role) : false;

  const sql = getDb(c.env);
  const rows = await sql<PostRow[]>`
    SELECT
      cp.id,
      cp.thread_id,
      cp.content,
      cp.user_id,
      u.display_name AS author_name,
      cp.is_deleted,
      cp.created_at,
      cp.updated_at
    FROM community_posts cp
    LEFT JOIN users u ON u.id = cp.user_id
    WHERE cp.thread_id = ${threadId}
    ORDER BY cp.created_at ASC
  `;

  const filtered = rows
    .filter((row: PostRow) => (showDeleted ? true : !toBoolean(row.is_deleted)))
    .map((row: PostRow) => normalizePost(row));

  const total = filtered.length;
  const offset = (page - 1) * limit;
  const posts = filtered.slice(offset, offset + limit);

  return c.json({
    posts,
    pagination: {
      page,
      limit,
      total,
      hasMore: offset + posts.length < total,
    },
  });
});

community.post("/posts", authMiddleware, async (c) => {
  const dbUser = await getRequiredDbUser(c);
  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  const body = await c.req.json().catch(() => null);
  const threadId = Number(body?.thread_id);
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (!Number.isFinite(threadId) || threadId <= 0 || !content) {
    return c.json({ error: "thread_id and content are required" }, 400);
  }

  const sql = getDb(c.env);
  const [thread] = await sql<{ id: number; is_locked: unknown }[]>`
    SELECT id, is_locked
    FROM community_threads
    WHERE id = ${threadId}
    LIMIT 1
  `;

  if (!thread) {
    return c.json({ error: "Thread not found" }, 404);
  }
  if (toBoolean(thread.is_locked) && !requireElevatedRole(dbUser.role)) {
    return c.json({ error: "Thread is locked" }, 403);
  }

  const [inserted] = await sql<{ id: number }[]>`
    INSERT INTO community_posts (thread_id, user_id, content)
    VALUES (${threadId}, ${dbUser.id}, ${content})
    RETURNING id
  `;

  if (!inserted?.id) {
    return c.json({ error: "Failed to create post" }, 500);
  }

  const [created] = await sql<PostRow[]>`
    SELECT
      cp.id,
      cp.thread_id,
      cp.content,
      cp.user_id,
      u.display_name AS author_name,
      cp.is_deleted,
      cp.created_at,
      cp.updated_at
    FROM community_posts cp
    LEFT JOIN users u ON u.id = cp.user_id
    WHERE cp.id = ${inserted.id}
    LIMIT 1
  `;

  if (!created) {
    return c.json({ error: "Post created but failed to load result" }, 500);
  }

  await sql`
    UPDATE community_threads
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = ${threadId}
  `;

  return c.json(normalizePost(created), 201);
});

community.put("/posts/:id", authMiddleware, async (c) => {
  const dbUser = await getRequiredDbUser(c);
  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id) || id <= 0) {
    return c.json({ error: "Invalid post id" }, 400);
  }

  const body = await c.req.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  if (!content) {
    return c.json({ error: "content is required" }, 400);
  }

  const sql = getDb(c.env);
  const [post] = await sql<{
    id: number;
    user_id: number | null;
    created_at: string;
    is_deleted: unknown;
  }[]>`
    SELECT id, user_id, created_at, is_deleted
    FROM community_posts
    WHERE id = ${id}
    LIMIT 1
  `;

  if (!post || toBoolean(post.is_deleted)) {
    return c.json({ error: "Post not found" }, 404);
  }

  const isOwner = post.user_id === dbUser.id;
  const isElevated = requireElevatedRole(dbUser.role);
  if (!isOwner && !isElevated) {
    return c.json({ error: "Forbidden" }, 403);
  }

  if (isOwner && !isElevated) {
    const postAgeMinutes = Math.floor((Date.now() - new Date(post.created_at).getTime()) / 60000);
    if (postAgeMinutes > 15) {
      return c.json({ error: "Posts can only be edited within 15 minutes." }, 403);
    }
  }

  await sql`
    UPDATE community_posts
    SET content = ${content}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;

  return c.json({ success: true });
});

community.delete("/posts/:id", authMiddleware, async (c) => {
  const dbUser = await getRequiredDbUser(c);
  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id) || id <= 0) {
    return c.json({ error: "Invalid post id" }, 400);
  }

  const sql = getDb(c.env);
  const [post] = await sql<{
    id: number;
    user_id: number | null;
    created_at: string;
    is_deleted: unknown;
  }[]>`
    SELECT id, user_id, created_at, is_deleted
    FROM community_posts
    WHERE id = ${id}
    LIMIT 1
  `;

  if (!post || toBoolean(post.is_deleted)) {
    return c.json({ error: "Post not found" }, 404);
  }

  const isOwner = post.user_id === dbUser.id;
  const isElevated = requireElevatedRole(dbUser.role);
  if (!isOwner && !isElevated) {
    return c.json({ error: "Forbidden" }, 403);
  }

  if (isOwner && !isElevated) {
    const postAgeMinutes = Math.floor((Date.now() - new Date(post.created_at).getTime()) / 60000);
    if (postAgeMinutes > 15) {
      return c.json({ error: "Posts can only be deleted within 15 minutes." }, 403);
    }
  }

  await sql`
    UPDATE community_posts
    SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;

  return c.json({ success: true });
});

export default community;
