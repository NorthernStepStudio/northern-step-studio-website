import { NextResponse } from "next/server";

import { applyRunIntervention } from "@/lib/store";
import { InterventionAction } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  try {
    const { runId } = await params;
    const body = (await request.json()) as {
      action?: InterventionAction;
      guidance?: string;
      startNextRun?: boolean;
    };

    if (!body.action) {
      return NextResponse.json({ error: "action is required." }, { status: 400 });
    }

    const result = await applyRunIntervention(runId, body.action, {
      guidance: body.guidance,
      startNextRun: body.startNextRun,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not apply the intervention.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
