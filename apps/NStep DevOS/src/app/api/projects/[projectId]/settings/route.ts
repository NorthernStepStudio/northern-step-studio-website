import { NextResponse } from "next/server";

import { updateProjectExecutionSettings } from "@/lib/store";
import {
  ConnectedProvider,
  ExecutionMode,
  ManualProvider,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    const body = (await request.json()) as {
      executionMode?: ExecutionMode;
      manualProvider?: ManualProvider;
      connectedProvider?: ConnectedProvider;
      providerBaseUrl?: string;
      providerModel?: string;
      providerApiKeyHint?: string;
      autoDispatchEnabled?: boolean;
      autoIngestEnabled?: boolean;
      autopilotEnabled?: boolean;
    };

    if (!body.executionMode) {
      return NextResponse.json(
        { error: "executionMode is required." },
        { status: 400 },
      );
    }

    const project = await updateProjectExecutionSettings(projectId, {
      executionMode: body.executionMode,
      manualProvider: body.manualProvider ?? "codex-app",
      connectedProvider: body.connectedProvider ?? "mock-connected",
      providerBaseUrl: body.providerBaseUrl,
      providerModel: body.providerModel,
      providerApiKeyHint: body.providerApiKeyHint,
      autoDispatchEnabled: body.autoDispatchEnabled ?? false,
      autoIngestEnabled: body.autoIngestEnabled ?? false,
      autopilotEnabled: body.autopilotEnabled ?? false,
    });

    return NextResponse.json({
      projectId: project.id,
      executionMode: project.executionMode,
      providerConfig: project.providerConfig,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update project settings.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
