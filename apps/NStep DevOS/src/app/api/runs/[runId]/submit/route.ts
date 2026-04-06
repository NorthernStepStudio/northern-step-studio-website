import { NextResponse } from "next/server";

import { submitTaskRun } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  try {
    const { runId } = await params;
    const body = (await request.json()) as { submissionText?: string };

    if (!body.submissionText?.trim()) {
      return NextResponse.json(
        { error: "submissionText is required." },
        { status: 400 },
      );
    }

    const result = await submitTaskRun(runId, body.submissionText);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not submit the run.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
