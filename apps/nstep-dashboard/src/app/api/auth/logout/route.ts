import { NextResponse } from "next/server";

import { resolveDashboardAdminLogoutUrl } from "@/lib/auth";

function buildRedirect(): URL {
  return new URL(resolveDashboardAdminLogoutUrl());
}

function clearLegacyDashboardCookie(response: NextResponse): void {
  response.cookies.set({
    name: "nstep_dashboard_session",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function GET(): Promise<Response> {
  const response = NextResponse.redirect(buildRedirect(), 303);
  clearLegacyDashboardCookie(response);
  return response;
}

export async function POST(): Promise<Response> {
  return GET();
}
