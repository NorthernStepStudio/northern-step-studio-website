import "server-only";

import { createClient } from "@/utils/supabase/server";

const defaultApiBaseUrl = "http://127.0.0.1:4000/v1";

function getBackendBaseUrl() {
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    defaultApiBaseUrl
  ).replace(/\/$/, "");
}

export async function fetchBackend(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    {
      data: { session },
    },
  ] = await Promise.all([supabase.auth.getUser(), supabase.auth.getSession()]);

  if (!user || !session?.access_token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${session.access_token}`);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${getBackendBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers,
  });
}

export async function fetchBackendJson(
  path: string,
  init: RequestInit = {},
): Promise<{ response: Response; payload: unknown }> {
  const response = await fetchBackend(path, init);

  try {
    return { response, payload: await response.json() };
  } catch {
    return { response, payload: null };
  }
}
