import { NextResponse } from "next/server";

import { syncConnectedRun } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  try {
    const { runId } = await params;
    const run = await syncConnectedRun(runId);

    return NextResponse.json({
      runId: run.id,
      status: run.status,
      resultSource: run.resultSource,
      providerState: run.providerState,
      providerStateDetail: run.providerStateDetail,
      dispatchNote: run.dispatchNote,
      lastProviderSyncAt: run.lastProviderSyncAt,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not refresh provider status.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
