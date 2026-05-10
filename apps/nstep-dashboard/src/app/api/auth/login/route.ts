import { NextResponse } from "next/server";

import { buildLoginDestination, resolveDashboardAdminLoginUrl } from "@/lib/auth";

function buildRedirect(request: Request): URL {
  const requestUrl = new URL(request.url);
  const nextPath = buildLoginDestination(requestUrl.searchParams.get("next"));
  const loginUrl = new URL(resolveDashboardAdminLoginUrl());
  loginUrl.searchParams.set("dashboard", nextPath);
  return loginUrl;
}

export async function POST(request: Request): Promise<Response> {
  return NextResponse.redirect(buildRedirect(request), 303);
}

export async function GET(request: Request): Promise<Response> {
  return NextResponse.redirect(buildRedirect(request), 303);
}
