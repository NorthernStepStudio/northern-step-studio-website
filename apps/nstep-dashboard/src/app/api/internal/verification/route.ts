import { NextResponse } from "next/server";
import { getDashboardSessionFromRequest } from "@/lib/auth";
import { loadVerificationViewModel } from "@/lib/dashboard/view-models/verification-view-model";

// Internal audit endpoint: run the verification engine and return results.
// Enabled only when `NSTEP_DASHBOARD_ALLOW_LOCAL_ME` is set to '1'.
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  if (process.env.NSTEP_DASHBOARD_ALLOW_LOCAL_ME !== "1") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const session = await getDashboardSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admin session required." }, { status: 401 });
  }

  try {
    const view = await loadVerificationViewModel();
    const results = view.results;
    return NextResponse.json({ success: true, results });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
