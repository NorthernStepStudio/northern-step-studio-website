import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { sign, verify } from "hono/jwt";
import { getUserId, requireAuth } from "../middleware/auth";
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  sanitizeInput,
} from "../utils/validation";
import { serializeUser, toOptionalString } from "../utils/serializers";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  JWT_SECRET: string;
  FRONTEND_URL?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
};

const auth = new Hono<{ Bindings: Bindings }>();
const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24;
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;
const EMAIL_VERIFICATION_TTL_SECONDS = 60 * 60 * 24;

const getSupabase = (c: any) =>
  createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);

const getJwtSecret = (c: any) => c.env.JWT_SECRET || "dev-secret-key";

const createToken = (
  c: any,
  payload: Record<string, unknown>,
  expiresInSeconds: number,
) =>
  sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    },
    getJwtSecret(c),
  );

const createAccessToken = (c: any, userId: number) =>
  createToken(c, { userId }, ACCESS_TOKEN_TTL_SECONDS);

const createRefreshToken = (c: any, userId: number) =>
  createToken(c, { userId }, REFRESH_TOKEN_TTL_SECONDS);

const createVerificationToken = (c: any, userId: number, email: string) =>
  createToken(
    c,
    {
      userId,
      email,
      purpose: "email_verification",
    },
    EMAIL_VERIFICATION_TTL_SECONDS,
  );

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderEmailVerificationPage = (
  title: string,
  message: string,
  accent: string,
) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #0f172a;
        --panel: #111827;
        --border: rgba(255, 255, 255, 0.08);
        --text: #e5e7eb;
        --muted: #94a3b8;
        --accent: ${accent};
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: radial-gradient(circle at top, #1f2937 0%, var(--bg) 58%);
        color: var(--text);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        padding: 24px;
      }
      .card {
        width: min(560px, 100%);
        background: rgba(17, 24, 39, 0.92);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 28px;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(16px);
      }
      .eyebrow {
        margin: 0 0 12px;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        font-size: 12px;
        color: var(--muted);
      }
      h1 {
        margin: 0 0 12px;
        font-size: 28px;
        line-height: 1.1;
      }
      p {
        margin: 0 0 18px;
        color: var(--muted);
        line-height: 1.6;
        font-size: 15px;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-top: 6px;
        padding: 12px 16px;
        border-radius: 999px;
        background: rgba(37, 99, 235, 0.18);
        color: var(--text);
        text-decoration: none;
        font-weight: 600;
      }
      .pill span {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: var(--accent);
      }
      .foot {
        margin-top: 18px;
        font-size: 13px;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <p class="eyebrow">NexusBuild</p>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(message)}</p>
      <a class="pill" href="https://northernstepstudio.com">
        <span></span>
        Return to NexusBuild
      </a>
      <p class="foot">You can close this page and continue in the app.</p>
    </main>
  </body>
</html>`;

const buildVerificationUrl = (c: any, token: string) => {
  const origin = new URL(c.req.url).origin;
  return `${origin}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
};

const sendVerificationEmail = async (
  c: any,
  email: string,
  username: string,
  verificationUrl: string,
) => {
  const apiKey = String(c.env.RESEND_API_KEY || "").trim();
  const from = String(c.env.EMAIL_FROM || "").trim();

  if (!apiKey || !from) {
    throw new Error(
      "Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM.",
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Verify your NexusBuild account",
      html: `
        <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="margin: 0 0 12px;">Verify your NexusBuild account</h2>
          <p style="margin: 0 0 12px;">Hi ${escapeHtml(username || "there")},</p>
          <p style="margin: 0 0 16px;">Click the link below to verify your email address and activate your account.</p>
          <p style="margin: 0 0 20px;">
            <a href="${verificationUrl}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;">Verify email</a>
          </p>
          <p style="margin: 0; font-size: 13px; color: #6b7280;">If the button does not work, open this link:</p>
          <p style="margin: 6px 0 0; word-break: break-all; font-size: 13px; color: #2563eb;">${verificationUrl}</p>
        </div>
      `,
      text: `Verify your NexusBuild account: ${verificationUrl}`,
    }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(
      `Failed to send verification email (${response.status}): ${details || response.statusText}`,
    );
  }

  return true;
};

auth.post("/register", async (c) => {
  try {
    const { username, email, password } = await c.req.json();
    const normalizedUsername = sanitizeInput(String(username || "")).replace(
      /\s+/g,
      "_",
    );
    const normalizedEmail = String(email || "")
      .toLowerCase()
      .trim();

    if (!normalizedUsername || !normalizedEmail || !password) {
      return c.json({ message: "Missing required fields" }, 400);
    }

    const usernameValidation = isValidUsername(normalizedUsername);
    if (!usernameValidation.valid) {
      return c.json({ message: usernameValidation.message }, 400);
    }

    if (!isValidEmail(normalizedEmail)) {
      return c.json({ message: "Invalid email address" }, 400);
    }

    const passwordValidation = isValidPassword(String(password));
    if (!passwordValidation.valid) {
      return c.json({ message: passwordValidation.message }, 400);
    }

    const supabase = getSupabase(c);
    const existing = await supabase
      .from("users")
      .select("id, username, email")
      .or(`username.eq.${normalizedUsername},email.eq.${normalizedEmail}`);

    if (existing.error) {
      return c.json({ message: existing.error.message }, 500);
    }

    const duplicateUsername = existing.data?.find(
      (user) => user.username === normalizedUsername,
    );
    if (duplicateUsername) {
      return c.json({ message: "Username already exists" }, 409);
    }

    const duplicateEmail = existing.data?.find(
      (user) => user.email === normalizedEmail,
    );
    if (duplicateEmail) {
      return c.json({ message: "Email already exists" }, 409);
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const isAdminEmail = normalizedEmail === "admin@nexusbuild.app";
    const requiresVerification = !isAdminEmail;
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        username: normalizedUsername,
        email: normalizedEmail,
        password_hash: passwordHash,
        is_admin: isAdminEmail,
        is_moderator: isAdminEmail,
        is_suspended: requiresVerification,
        bio: isAdminEmail ? "NexusBuild Administrator" : null,
      })
      .select("*")
      .single();

    if (error || !user) {
      return c.json({ message: error?.message || "Error creating user" }, 500);
    }

    if (requiresVerification) {
      const verificationToken = await createVerificationToken(
        c,
        user.id,
        normalizedEmail,
      );
      const verificationUrl = buildVerificationUrl(c, verificationToken);

      try {
        await sendVerificationEmail(
          c,
          normalizedEmail,
          normalizedUsername,
          verificationUrl,
        );
      } catch (sendError) {
        await supabase.from("users").delete().eq("id", user.id);
        console.error("Failed to send verification email:", sendError);
        return c.json(
          {
            message:
              sendError instanceof Error
                ? sendError.message
                : "Failed to send verification email",
            verification_required: true,
          },
          503,
        );
      }

      return c.json(
        {
          message: "Account created. Check your email to verify your account.",
          verification_required: true,
          user: serializeUser({ ...user, is_suspended: true }),
        },
        201,
      );
    }

    const token = await createAccessToken(c, user.id);
    const refreshToken = await createRefreshToken(c, user.id);

    return c.json(
      {
        message: "User created successfully",
        token,
        refresh_token: refreshToken,
        user: serializeUser(user),
      },
      201,
    );
  } catch (error) {
    return c.json({ message: "Error creating user" }, 500);
  }
});

auth.post("/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    const normalizedEmail = String(email || "")
      .toLowerCase()
      .trim();

    if (!normalizedEmail || !password) {
      return c.json({ message: "Missing email or password" }, 400);
    }

    const supabase = getSupabase(c);
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", normalizedEmail)
      .single();

    if (error || !user) {
      return c.json({ message: "Invalid email or password" }, 401);
    }

    const isPasswordValid = await bcrypt.compare(
      String(password),
      user.password_hash,
    );
    if (!isPasswordValid) {
      return c.json({ message: "Invalid email or password" }, 401);
    }

    if (user.is_suspended) {
      return c.json(
        {
          message: "Please verify your email before logging in.",
          verification_required: true,
        },
        403,
      );
    }

    const token = await createAccessToken(c, user.id);
    const refreshToken = await createRefreshToken(c, user.id);

    return c.json({
      message: "Login successful",
      token,
      refresh_token: refreshToken,
      user: serializeUser(user),
    });
  } catch (error) {
    return c.json({ message: "Error logging in" }, 500);
  }
});

auth.post("/refresh", async (c) => {
  try {
    const { refresh_token: refreshToken } = await c.req.json();

    if (!refreshToken) {
      return c.json({ message: "Refresh token required" }, 400);
    }

    const decoded = (await verify(refreshToken, getJwtSecret(c), "HS256")) as {
      userId?: number;
    };
    if (!decoded?.userId) {
      return c.json({ message: "Invalid or expired refresh token" }, 401);
    }

    const supabase = getSupabase(c);
    const { data: user, error } = await supabase
      .from("users")
      .select("id, is_suspended")
      .eq("id", decoded.userId)
      .maybeSingle();

    if (error || !user) {
      return c.json({ message: "Invalid or expired refresh token" }, 401);
    }

    if (user.is_suspended) {
      return c.json(
        {
          message: "Please verify your email before logging in.",
          verification_required: true,
        },
        403,
      );
    }

    const token = await createAccessToken(c, decoded.userId);
    return c.json({ token });
  } catch (error) {
    return c.json({ message: "Invalid or expired refresh token" }, 401);
  }
});

auth.get("/me", requireAuth, async (c) => {
  const userId = getUserId(c);
  if (!userId) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const supabase = getSupabase(c);
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !user) {
    return c.json({ message: "User not found" }, 404);
  }

  if (user.is_suspended) {
    return c.json(
      {
        message: "Please verify your email before logging in.",
        verification_required: true,
      },
      403,
    );
  }

  return c.json(serializeUser(user));
});

auth.get("/verify-email", async (c) => {
  try {
    const token = c.req.query("token");
    if (!token) {
      return c.html(
        renderEmailVerificationPage(
          "Verification link missing",
          "The verification link is incomplete. Please open the link from your email again.",
          "#f59e0b",
        ),
        400,
      );
    }

    const payload = (await verify(token, getJwtSecret(c), "HS256")) as {
      userId?: number;
      email?: string;
      purpose?: string;
    };

    if (
      payload?.purpose !== "email_verification" ||
      !payload.userId ||
      !payload.email
    ) {
      return c.html(
        renderEmailVerificationPage(
          "Verification failed",
          "That verification link is invalid or expired. Please request a new one from the app.",
          "#ef4444",
        ),
        400,
      );
    }

    const supabase = getSupabase(c);
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, is_suspended")
      .eq("id", payload.userId)
      .eq("email", payload.email.toLowerCase())
      .maybeSingle();

    if (error || !user) {
      return c.html(
        renderEmailVerificationPage(
          "Verification failed",
          "We could not find a matching account for this link.",
          "#ef4444",
        ),
        404,
      );
    }

    if (!user.is_suspended) {
      return c.html(
        renderEmailVerificationPage(
          "Email already verified",
          "This account is already active. You can return to the app and log in.",
          "#22c55e",
        ),
        200,
      );
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ is_suspended: false })
      .eq("id", user.id);

    if (updateError) {
      return c.html(
        renderEmailVerificationPage(
          "Verification failed",
          "Your account could not be activated right now. Please try again later.",
          "#ef4444",
        ),
        500,
      );
    }

    return c.html(
      renderEmailVerificationPage(
        "Email verified",
        "Your account is active now. Return to the app and sign in with your email and password.",
        "#22c55e",
      ),
      200,
    );
  } catch (error) {
    return c.html(
      renderEmailVerificationPage(
        "Verification failed",
        "The verification link is invalid or expired. Please request a new one from the app.",
        "#ef4444",
      ),
      400,
    );
  }
});

auth.get("/google/redirect_url", async (c) =>
  c.json(
    {
      message:
        "Google sign-in is temporarily disabled. Use email and password.",
    },
    503,
  ),
);

auth.get("/google/callback", async (c) =>
  c.html(
    renderEmailVerificationPage(
      "Google sign-in disabled",
      "Google sign-in is temporarily disabled. Please use email and password instead.",
      "#f59e0b",
    ),
    503,
  ),
);

auth.put("/update", requireAuth, async (c) => {
  try {
    const userId = getUserId(c);
    if (!userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const requestedUsername =
      typeof body?.username === "string"
        ? body.username
        : typeof body?.displayName === "string"
          ? body.displayName
          : undefined;
    const nextUsername = requestedUsername
      ? sanitizeInput(requestedUsername).replace(/\s+/g, "_")
      : undefined;

    if (nextUsername) {
      const usernameValidation = isValidUsername(nextUsername);
      if (!usernameValidation.valid) {
        return c.json({ message: usernameValidation.message }, 400);
      }
    }

    const supabase = getSupabase(c);

    if (nextUsername) {
      const usernameConflict = await supabase
        .from("users")
        .select("id")
        .eq("username", nextUsername)
        .neq("id", userId)
        .maybeSingle();

      if (usernameConflict.data) {
        return c.json({ message: "Username already exists" }, 409);
      }
    }

    const nextPassword =
      typeof body?.password === "string" ? body.password.trim() : undefined;
    let nextPasswordHash: string | undefined;
    if (nextPassword) {
      const passwordValidation = isValidPassword(nextPassword);
      if (!passwordValidation.valid) {
        return c.json({ message: passwordValidation.message }, 400);
      }
      nextPasswordHash = await bcrypt.hash(nextPassword, 10);
    }

    const updates: Record<string, unknown> = {};
    if (nextUsername) updates.username = nextUsername;

    const nextBio =
      typeof body?.bio === "string"
        ? sanitizeInput(body.bio)
        : typeof body?.profile?.bio === "string"
          ? sanitizeInput(body.profile.bio)
          : undefined;
    if (nextBio !== undefined) updates.bio = nextBio;

    const nextProfileImage =
      toOptionalString(body?.profile_image) || toOptionalString(body?.avatar);
    if (nextProfileImage !== null) updates.profile_image = nextProfileImage;
    else if (body?.profile_image === null || body?.avatar === null)
      updates.profile_image = null;

    const nextAvatarFrame =
      toOptionalString(body?.avatar_frame) ||
      toOptionalString(body?.profile?.frameId);
    if (nextAvatarFrame !== null) updates.avatar_frame = nextAvatarFrame;

    if (body?.showcase_build_id !== undefined) {
      updates.showcase_build_id = body.showcase_build_id;
    }

    if (body?.is_public_profile !== undefined) {
      updates.is_public_profile = Boolean(body.is_public_profile);
    } else if (body?.is_public !== undefined) {
      updates.is_public_profile = Boolean(body.is_public);
    }

    if (nextPasswordHash) {
      updates.password_hash = nextPasswordHash;
    }

    const { data: user, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select("*")
      .single();

    if (error || !user) {
      return c.json(
        { message: error?.message || "Error updating profile" },
        500,
      );
    }

    return c.json({
      message: "Profile updated successfully",
      user: serializeUser(user),
    });
  } catch (error) {
    return c.json({ message: "Error updating profile" }, 500);
  }
});

export default auth;
