import { NextResponse } from "next/server";

import { clearSessionCookie } from "@/lib/auth";

function buildRedirect(request: Request): URL {
  const url = new URL("/sign-in", request.url);
  const nextPath = new URL(request.url).searchParams.get("next");
  if (nextPath && nextPath.startsWith("/")) {
    url.searchParams.set("next", nextPath);
  }
  return url;
}

export async function GET(request: Request): Promise<Response> {
  const response = NextResponse.redirect(buildRedirect(request), 303);
  response.cookies.set({
    name: "nstep_dashboard_session",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function POST(request: Request): Promise<Response> {
  return GET(request);
}
