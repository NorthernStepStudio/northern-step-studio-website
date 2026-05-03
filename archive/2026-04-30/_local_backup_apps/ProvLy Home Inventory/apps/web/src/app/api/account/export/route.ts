import { NextResponse } from "next/server";

import { fetchBackendJson } from "@/lib/serverBackend";

export async function POST() {
  const { response, payload } = await fetchBackendJson("/account/export-all", {
    method: "POST",
  });

  return NextResponse.json(payload, { status: response.status });
}
