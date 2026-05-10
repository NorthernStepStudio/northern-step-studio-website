import { NextResponse } from "next/server";

// Local dev helper: when `NSTEP_DASHBOARD_ALLOW_LOCAL_ME` is set to '1',
// this endpoint returns a simple admin user object so server-side
// dashboard session resolution can succeed in local testing.
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  if (
    process.env.NSTEP_DASHBOARD_ALLOW_LOCAL_ME !== "1" ||
    process.env.NSTEP_DASHBOARD_LOCAL_DEV_AUTH !== "1"
  ) {
    return NextResponse.json({ error: "Admin session required." }, { status: 401 });
  }

  const user = {
    id: process.env.NSTEP_DASHBOARD_LOCAL_DEV_USER || "localdev",
    email: process.env.NSTEP_DASHBOARD_LOCAL_DEV_EMAIL || "localdev@local",
    role: process.env.NSTEP_DASHBOARD_LOCAL_DEV_ROLE || "owner",
    display_name: process.env.NSTEP_DASHBOARD_LOCAL_DEV_DISPLAY_NAME || "Local Dev",
  };

  return NextResponse.json(user);
}
