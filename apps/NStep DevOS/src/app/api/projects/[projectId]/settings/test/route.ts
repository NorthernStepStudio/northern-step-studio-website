import { NextResponse } from "next/server";

import { testConnectedProvider } from "@/lib/provider-adapters";
import { getProject } from "@/lib/store";
import {
  ConnectedProvider,
  ExecutionMode,
  ManualProvider,
  ProviderConfig,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    const project = await getProject(projectId);

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

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

    const providerConfig: ProviderConfig = {
      manualProvider: body.manualProvider ?? project.providerConfig.manualProvider,
      connectedProvider: body.connectedProvider ?? project.providerConfig.connectedProvider,
      connectionStatus: "configured",
      baseUrl: body.providerBaseUrl?.trim() || undefined,
      model: body.providerModel?.trim() || undefined,
      apiKeyHint: body.providerApiKeyHint?.trim() || undefined,
      autoDispatchEnabled: body.autoDispatchEnabled ?? project.providerConfig.autoDispatchEnabled,
      autoIngestEnabled: body.autoIngestEnabled ?? project.providerConfig.autoIngestEnabled,
      autopilotEnabled: body.autopilotEnabled ?? project.providerConfig.autopilotEnabled,
    };

    const outcome = await testConnectedProvider(providerConfig);
    const statusCode = outcome.ok ? 200 : 400;

    return NextResponse.json(outcome, { status: statusCode });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not test provider settings.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
