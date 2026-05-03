import { NextResponse } from "next/server";

import { fetchBackendJson } from "@/lib/serverBackend";

export async function DELETE() {
  const { response, payload } = await fetchBackendJson("/account", {
    method: "DELETE",
  });

  return NextResponse.json(payload, { status: response.status });
}
