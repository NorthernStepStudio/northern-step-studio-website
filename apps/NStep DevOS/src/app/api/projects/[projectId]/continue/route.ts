import { NextResponse } from "next/server";

import { continueProjectRoadmap } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    const result = await continueProjectRoadmap(projectId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not continue the roadmap.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
