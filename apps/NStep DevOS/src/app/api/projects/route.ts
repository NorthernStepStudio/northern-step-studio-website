import { NextResponse } from "next/server";

import { createProject, getProjects } from "@/lib/store";
import {
  ConnectedProvider,
  CreateProjectInput,
  ExecutionMode,
  ManualProvider,
  VerificationCommand,
} from "@/lib/types";
import { toLines } from "@/lib/utils";

export const dynamic = "force-dynamic";

function parseVerificationCommands(input: string): VerificationCommand[] {
  return toLines(input).map((line, index) => {
    const [keyPart, commandPart] = line.split("|").map((part) => part.trim());

    if (!commandPart) {
      return {
        key: `custom-${index + 1}`,
        label: keyPart,
        command: keyPart,
      };
    }

    return {
      key: keyPart.toLowerCase(),
      label: keyPart,
      command: commandPart,
    };
  });
}

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      rawBrief?: string;
      targetMvp?: string;
      repoPath?: string;
      defaultBranch?: string;
      primaryPaths?: string;
      executionMode?: ExecutionMode;
      manualProvider?: ManualProvider;
      connectedProvider?: ConnectedProvider;
      providerBaseUrl?: string;
      providerModel?: string;
      providerApiKeyHint?: string;
      verificationCommands?: string;
    };

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Project name is required." }, { status: 400 });
    }

    if (!body.rawBrief?.trim()) {
      return NextResponse.json({ error: "Project brief is required." }, { status: 400 });
    }

    if (!body.repoPath?.trim()) {
      return NextResponse.json({ error: "Repo path is required." }, { status: 400 });
    }

    const input: CreateProjectInput = {
      name: body.name,
      rawBrief: body.rawBrief,
      targetMvp: body.targetMvp,
      repoPath: body.repoPath,
      defaultBranch: body.defaultBranch?.trim() || "main",
      primaryPaths: toLines(body.primaryPaths ?? ""),
      executionMode: body.executionMode ?? "manual",
      manualProvider: body.manualProvider ?? "codex-app",
      connectedProvider: body.connectedProvider ?? "mock-connected",
      providerBaseUrl: body.providerBaseUrl,
      providerModel: body.providerModel,
      providerApiKeyHint: body.providerApiKeyHint,
      verificationCommands: parseVerificationCommands(body.verificationCommands ?? ""),
    };

    const created = await createProject(input);
    const project = created.project;

    return NextResponse.json({
      projectId: project.id,
      initialRunId: created.initialRun?.id,
      initialRunStatus: created.initialRun?.status,
      initialRunProviderState: created.initialRun?.providerState,
      initialRunError: created.initialRunError,
      structuredSpec: project.structuredSpec,
      milestone: project.milestones[0],
      firstTaskPacket: project.firstTaskPacket,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create project.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
