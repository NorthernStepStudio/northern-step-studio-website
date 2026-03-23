// Community forum API endpoints
import { Hono } from "hono";
import { threadReplyNotification } from "./email-templates";
import { findDatabaseUserByEmail, getAuthenticatedUser, type AppUser } from "./auth";
import { isElevatedRole } from "../shared/auth";
import { getDb } from "./db";
import { sendEmail } from "./email";

const community = new Hono<{ Bindings: Env; Variables: { user: AppUser } }>();

async function getCurrentDbUser(c: { env: Env; req: { url: string } }) {
  const authenticatedUser = await getAuthenticatedUser(c);
  if (!authenticatedUser) {
    return null;
  }

  return findDatabaseUserByEmail(c.env, authenticatedUser.email);
}

// ============ Categories ============

community.get("/categories", async (c) => {
  const sql = getDb(c.env);
  const results = await sql`
    SELECT 
      cc.*,
      COUNT(DISTINCT ct.id) as thread_count,
      COUNT(DISTINCT cp.id) as post_count,
      (
        SELECT ct2.title 
        FROM community_threads ct2 
        WHERE ct2.category_id = cc.id AND ct2.is_hidden = FALSE
        ORDER BY ct2.updated_at DESC 
        LIMIT 1
      ) as last_thread_title,
      (
        SELECT ct2.slug 
        FROM community_threads ct2 
        WHERE ct2.category_id = cc.id AND ct2.is_hidden = FALSE
        ORDER BY ct2.updated_at DESC 
        LIMIT 1
      ) as last_thread_slug
    FROM community_categories cc
    LEFT JOIN community_threads ct ON ct.category_id = cc.id AND ct.is_hidden = FALSE
    LEFT JOIN community_posts cp ON cp.thread_id = ct.id AND cp.is_deleted = FALSE
    WHERE cc.is_active = TRUE
    GROUP BY cc.id
    ORDER BY cc.sort_order ASC
  `;

  return c.json(results);
});

community.post("/categories", async (c) => {
  const currentUser = await getCurrentDbUser(c);
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!isElevatedRole(currentUser.role)) {
    return c.json({ error: "Moderator access required" }, 403);
  }

  const body = await c.req.json();
  const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, "-");

  const sql = getDb(c.env);
  const [result] = await sql<{ id: number }[]>`
    INSERT INTO community_categories (name, slug, description, icon, sort_order)
    VALUES (${body.name}, ${slug}, ${body.description || null}, ${body.icon || null}, ${body.sort_order || 0})
    RETURNING id
  `;

  return c.json({ id: result?.id });
});

community.put("/categories/:id", async (c) => {
  const currentUser = await getCurrentDbUser(c);
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!isElevatedRole(currentUser.role)) {
    return c.json({ error: "Moderator access required" }, 403);
  }

  const id = c.req.param("id");
  const body = await c.req.json();

  const sql = getDb(c.env);
  await sql`
    UPDATE community_categories 
    SET name = ${body.name}, description = ${body.description}, icon = ${body.icon}, 
        sort_order = ${body.sort_order}, is_active = ${body.is_active ? true : false}, 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;

  return c.json({ success: true });
});

community.delete("/categories/:id", async (c) => {
  const currentUser = await getCurrentDbUser(c);
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!isElevatedRole(currentUser.role)) {
    return c.json({ error: "Moderator access required" }, 403);
  }

  const id = c.req.param("id");
  const sql = getDb(c.env);

  await sql`
    UPDATE community_categories SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}
  `;

  return c.json({ success: true });
});

// ============ Threads ============

community.get("/threads", async (c) => {
  const categorySlug = c.req.query("category");
  const searchQuery = c.req.query("search");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const offset = (page - 1) * limit;

  const sql = getDb(c.env);

  const threads = await sql`
    SELECT 
      t.*,
      c.name as category_name,
      c.slug as category_slug,
      u.id as author_id,
      u.display_name as author_name,
      u.avatar_url as author_avatar_url,
      u.bio as author_bio,
      u.role as author_role,
      (SELECT COUNT(*) FROM community_posts WHERE thread_id = t.id AND is_deleted = FALSE) as post_count,
      (SELECT MAX(created_at) FROM community_posts WHERE thread_id = t.id AND is_deleted = FALSE) as last_post_at
    FROM community_threads t
    LEFT JOIN community_categories c ON t.category_id = c.id
    LEFT JOIN users u ON t.user_id = u.id
    WHERE t.is_hidden = FALSE
    ${categorySlug ? sql`AND c.slug = ${categorySlug}` : sql``}
    ${searchQuery ? sql`AND (t.title ILIKE ${"%" + searchQuery + "%"} OR t.content ILIKE ${"%" + searchQuery + "%"})` : sql``}
    ORDER BY t.is_pinned DESC, t.updated_at DESC 
    LIMIT ${limit} OFFSET ${offset}
  `;

  // Get total count for pagination
  const [countResult] = await sql<{ total: string }[]>`
    SELECT COUNT(*) as total 
    FROM community_threads t 
    LEFT JOIN community_categories c ON t.category_id = c.id 
    WHERE t.is_hidden = FALSE
    ${categorySlug ? sql`AND c.slug = ${categorySlug}` : sql``}
    ${searchQuery ? sql`AND (t.title ILIKE ${"%" + searchQuery + "%"} OR t.content ILIKE ${"%" + searchQuery + "%"})` : sql``}
  `;

  const total = parseInt(countResult?.total || "0");

  return c.json({
    threads,
    pagination: {
      page,
      limit,
      total,
      hasMore: offset + limit < total,
    },
  });
});

community.get("/threads/:slug", async (c) => {
  const slug = c.req.param("slug");
  const sql = getDb(c.env);

  const [thread] = await sql`
    SELECT 
       t.*,
       c.name as category_name,
       c.slug as category_slug,
       u.id as author_id,
       u.display_name as author_name,
       u.avatar_url as author_avatar_url,
       u.bio as author_bio,
       u.role as author_role
     FROM community_threads t
     LEFT JOIN community_categories c ON t.category_id = c.id
     LEFT JOIN users u ON t.user_id = u.id
     WHERE t.slug = ${slug}
  `;

  if (!thread) {
    return c.json({ error: "Thread not found" }, 404);
  }

  // Increment view count
  await sql`
    UPDATE community_threads SET view_count = view_count + 1 WHERE slug = ${slug}
  `;

  return c.json(thread);
});

community.post("/threads", async (c) => {
  const currentUser = await getCurrentDbUser(c);
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const sql = getDb(c.env);

  // Get category_id from category_slug if not provided
  let categoryId = body.category_id;
  if (!categoryId && body.category_slug) {
    const [category] = await sql<{ id: number }[]>`
      SELECT id FROM community_categories WHERE slug = ${body.category_slug}
    `;

    if (!category) {
      return c.json({ error: "Category not found" }, 404);
    }
    categoryId = category.id;
  }

  const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const [result] = await sql<{ id: number }[]>`
    INSERT INTO community_threads (category_id, user_id, title, slug, content)
    VALUES (${categoryId}, ${currentUser.id}, ${body.title}, ${slug}, ${body.content})
    RETURNING id
  `;

  // Return the created thread with author info
  const [thread] = await sql`
    SELECT 
       t.*,
       c.name as category_name,
       c.slug as category_slug,
       u.id as author_id,
       u.display_name as author_name,
       u.avatar_url as author_avatar_url,
       u.bio as author_bio,
       u.role as author_role
     FROM community_threads t
     LEFT JOIN community_categories c ON t.category_id = c.id
     LEFT JOIN users u ON t.user_id = u.id
     WHERE t.id = ${result.id}
  `;

  return c.json(thread, 201);
});

community.put("/threads/:id", async (c) => {
  const currentUser = await getCurrentDbUser(c);
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");
  const body = await c.req.json();
  const sql = getDb(c.env);

  const [existingThread] = await sql<{ user_id: number | null }[]>`
    SELECT user_id FROM community_threads WHERE id = ${id}
  `;

  if (!existingThread) {
    return c.json({ error: "Thread not found" }, 404);
  }

  if (!isElevatedRole(currentUser.role) && existingThread.user_id !== currentUser.id) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  await sql`
    UPDATE community_threads 
    SET title = ${body.title}, content = ${body.content}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;

  return c.json({ success: true });
});

community.patch("/threads/:id/pin", async (c) => {
  const currentUser = await getCurrentDbUser(c);
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!isElevatedRole(currentUser.role)) {
    return c.json({ error: "Moderator access required" }, 403);
  }

  const id = c.req.param("id");
  const body = await c.req.json();
  const sql = getDb(c.env);

  await sql`
    UPDATE community_threads SET is_pinned = ${body.is_pinned ? true : false}, 
           updated_at = CURRENT_TIMESTAMP WHERE id = ${id}
  `;

  return c.json({ success: true });
});

community.patch("/threads/:id/lock", async (c) => {
  const currentUser = await getCurrentDbUser(c);
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!isElevatedRole(currentUser.role)) {
    return c.json({ error: "Moderator access required" }, 403);
  }

  const id = c.req.param("id");
  const body = await c.req.json();
  const sql = getDb(c.env);

  await sql`
    UPDATE community_threads SET is_locked = ${body.is_locked ? true : false}, 
           updated_at = CURRENT_TIMESTAMP WHERE id = ${id}
  `;

  return c.json({ success: true });
});

community.patch("/threads/:id/hide", async (c) => {
  const currentUser = await getCurrentDbUser(c);
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!isElevatedRole(currentUser.role)) {
    return c.json({ error: "Moderator access required" }, 403);
  }

  const id = c.req.param("id");
  const body = await c.req.json();
  const sql = getDb(c.env);

  await sql`
    UPDATE community_threads SET is_hidden = ${body.is_hidden ? true : false}, 
           updated_at = CURRENT_TIMESTAMP WHERE id = ${id}
  `;

  return c.json({ success: true });
});

community.delete("/threads/:id", async (c) => {
  const currentUser = await getCurrentDbUser(c);
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");
  const sql = getDb(c.env);

  const [existingThread] = await sql<{ user_id: number | null }[]>`
    SELECT user_id FROM community_threads WHERE id = ${id}
  `;

  if (!existingThread) {
    return c.json({ error: "Thread not found" }, 404);
  }

  if (!isElevatedRole(currentUser.role) && existingThread.user_id !== currentUser.id) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  await sql`
    UPDATE community_threads SET is_hidden = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}
  `;

  return c.json({ success: true });
});

// ============ Posts ============

community.get("/posts", async (c) => {
  const threadId = c.req.query("thread_id");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = (page - 1) * limit;

  if (!threadId) {
    return c.json({ error: "thread_id required" }, 400);
  }

  const sql = getDb(c.env);

  const posts = await sql`
    SELECT 
       p.*,
       p.user_id as author_id,
       u.display_name as author_name,
       u.avatar_url as author_avatar_url,
       u.bio as author_bio,
       u.role as author_role
     FROM community_posts p
     LEFT JOIN users u ON p.user_id = u.id
     WHERE p.thread_id = ${threadId} AND p.is_deleted = FALSE
     ORDER BY p.created_at ASC
     LIMIT ${limit} OFFSET ${offset}
  `;

  // Get total count
  const [countResult] = await sql<{ total: string }[]>`
    SELECT COUNT(*) as total
    FROM community_posts
    WHERE thread_id = ${threadId} AND is_deleted = FALSE
  `;

  const total = parseInt(countResult?.total || "0");

  return c.json({
    posts,
    pagination: {
      page,
      limit,
      total,
      hasMore: offset + limit < total,
    },
  });
});

community.post("/posts", async (c) => {
  const currentUser = await getCurrentDbUser(c);
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const sql = getDb(c.env);

  // Check if thread is locked
  const [threadStatus] = await sql<{ is_locked: boolean }[]>`
    SELECT is_locked FROM community_threads WHERE id = ${body.thread_id}
  `;

  if (threadStatus?.is_locked) {
    return c.json({ error: "Thread is locked" }, 403);
  }

  const [result] = await sql<{ id: number }[]>`
    INSERT INTO community_posts (thread_id, user_id, content)
    VALUES (${body.thread_id}, ${currentUser.id}, ${body.content})
    RETURNING id
  `;

  // Update thread's updated_at
  await sql`
    UPDATE community_threads SET updated_at = CURRENT_TIMESTAMP WHERE id = ${body.thread_id}
  `;

  // Return the created post with author info
  const [post] = await sql`
    SELECT 
       p.*,
       p.user_id as author_id,
       u.display_name as author_name
     FROM community_posts p
     LEFT JOIN users u ON p.user_id = u.id
     WHERE p.id = ${result.id}
  `;

  // Send email notification to thread author
  try {
    const [threadInfo] = await sql<{
      title: string;
      slug: string;
      user_id: number;
      email: string;
      display_name: string
    }[]>`
       SELECT t.title, t.slug, t.user_id, u.email, u.display_name
       FROM community_threads t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = ${body.thread_id}
    `;

    // Only send email if thread has an author and it's not the same person replying
    if (threadInfo && threadInfo.user_id && threadInfo.user_id !== currentUser.id && threadInfo.email) {
      // Check user preferences
      const [prefs] = await sql<{ email_thread_replies: boolean }[]>`
        SELECT email_mentions as email_thread_replies FROM user_preferences WHERE user_id = ${threadInfo.user_id}
      `;

      // Send email if user hasn't disabled notifications (default is enabled)
      const shouldSendEmail = prefs ? prefs.email_thread_replies === true : true;

      if (shouldSendEmail) {
        const threadUrl = `${new URL(c.req.url).origin}/community/thread/${threadInfo.slug}`;
        const postContent = post as { author_name?: string | null } | null;
        const replyAuthor =
          postContent?.author_name ||
          currentUser.display_name ||
          currentUser.email.split("@")[0] ||
          "Someone";

        await sendEmail(c.env, {
          to: threadInfo.email,
          subject: `New reply to "${threadInfo.title}"`,
          html_body: threadReplyNotification({
            recipientName: threadInfo.display_name || threadInfo.email,
            threadTitle: threadInfo.title,
            threadUrl,
            replyAuthor,
            replyPreview: body.content,
          }),
          text_body: `Hi ${threadInfo.display_name || threadInfo.email},\n\n${replyAuthor} replied to your thread "${threadInfo.title}":\n\n${body.content}\n\nView the reply at: ${threadUrl}`,
        });
      }
    }
  } catch (err) {
    // Log email error but don't fail the post creation
    console.error("Failed to send email notification:", err);
  }

  return c.json(post, 201);
});

community.put("/posts/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const sql = getDb(c.env);

  // Get the post to check ownership and timing
  const [post] = await sql<{ user_id: number; created_at: string }[]>`
    SELECT p.user_id, p.created_at
    FROM community_posts p
    WHERE p.id = ${id}
  `;

  if (!post) {
    return c.json({ error: "Post not found" }, 404);
  }

  const currentUser = await getCurrentDbUser(c);
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!isElevatedRole(currentUser.role) && post.user_id !== currentUser.id) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  // Check if within 15 minute edit window
  const postTime = new Date(post.created_at).getTime();
  const now = Date.now();
  const minutesSincePost = (now - postTime) / 1000 / 60;

  if (minutesSincePost > 15) {
    return c.json({ error: "Edit window expired (15 minutes)" }, 403);
  }

  await sql`
    UPDATE community_posts 
    SET content = ${body.content}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;

  return c.json({ success: true });
});

community.delete("/posts/:id", async (c) => {
  const id = c.req.param("id");
  const sql = getDb(c.env);

  // Get the post to check ownership and timing
  const [post] = await sql<{ user_id: number; created_at: string }[]>`
    SELECT p.user_id, p.created_at
    FROM community_posts p
    WHERE p.id = ${id}
  `;

  if (!post) {
    return c.json({ error: "Post not found" }, 404);
  }

  const currentUser = await getCurrentDbUser(c);
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!isElevatedRole(currentUser.role) && post.user_id !== currentUser.id) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  // Check if within 15 minute delete window
  const postTime = new Date(post.created_at).getTime();
  const now = Date.now();
  const minutesSincePost = (now - postTime) / 1000 / 60;

  if (minutesSincePost > 15) {
    return c.json({ error: "Delete window expired (15 minutes)" }, 403);
  }

  await sql`
    UPDATE community_posts SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}
  `;

  return c.json({ success: true });
});

export default community;
