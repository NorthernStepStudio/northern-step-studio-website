import { NextResponse } from "next/server";

import { fetchBackendJson } from "@/lib/serverBackend";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { response, payload } = await fetchBackendJson(`/exports/${id}/download`);
  return NextResponse.json(payload, { status: response.status });
}
