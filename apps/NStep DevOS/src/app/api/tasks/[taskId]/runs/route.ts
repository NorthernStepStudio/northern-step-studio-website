import { NextResponse } from "next/server";

import { getProject, startTaskRun } from "@/lib/store";
import { ManualProvider } from "@/lib/types";
import { getExecutionModeLabel, getTaskStageLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const { taskId } = await params;
    const body = (await request.json()) as {
      projectId?: string;
      provider?: ManualProvider;
    };

    if (!body.projectId) {
      return NextResponse.json({ error: "projectId is required." }, { status: 400 });
    }

    const run = await startTaskRun(body.projectId, taskId, body.provider ?? "codex-app");
    const project = await getProject(body.projectId);
    const task = project?.tasks.find((item) => item.id === taskId);

    return NextResponse.json({
      runId: run.id,
      taskId,
      taskTitle: task?.title,
      stepLabel: task && project ? getTaskStageLabel(project, task) : null,
      executionMode: getExecutionModeLabel(run.executionMode),
      provider: run.provider,
      providerState: run.providerState,
      providerStateDetail: run.providerStateDetail,
      dispatchNote: run.dispatchNote,
      prompt: run.prompt,
      expectedResultTemplate: run.expectedResultTemplate,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start the task run.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
