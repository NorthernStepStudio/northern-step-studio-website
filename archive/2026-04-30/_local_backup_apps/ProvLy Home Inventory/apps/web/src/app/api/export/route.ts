import { NextResponse } from "next/server";

import { fetchBackendJson } from "@/lib/serverBackend";

export async function POST(request: Request) {
  const body = await request.json();
  const { response, payload } = await fetchBackendJson("/exports/trigger", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return NextResponse.json(payload, { status: response.status });
}
