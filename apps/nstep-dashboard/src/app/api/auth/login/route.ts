import { NextResponse } from "next/server";

import { authenticateDashboardUser, createSessionCookie, parseDashboardLoginCredentials } from "@/lib/auth";

async function readLoginRequest(request: Request): Promise<{ readonly username: string; readonly password: string; readonly nextPath: string }> {
  const contentType = request.headers.get("content-type")?.toLowerCase() || "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    return parseDashboardLoginCredentials({
      username: String(body.username || ""),
      password: String(body.password || ""),
      next: String(body.next || ""),
    });
  }

  const formData = await request.formData();
  return parseDashboardLoginCredentials(formData);
}

export async function POST(request: Request): Promise<Response> {
  const { username, password, nextPath } = await readLoginRequest(request);

  const user = authenticateDashboardUser(username, password);
  if (!user) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("error", "invalid");
    url.searchParams.set("next", nextPath);
    return NextResponse.redirect(url, 303);
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url), 303);
  response.cookies.set({
    name: "nstep_dashboard_session",
    value: createSessionCookie(user),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL("/sign-in", request.url);
  const nextPath = new URL(request.url).searchParams.get("next");
  if (nextPath && nextPath.startsWith("/")) {
    url.searchParams.set("next", nextPath);
  }
  return NextResponse.redirect(url, 303);
}
