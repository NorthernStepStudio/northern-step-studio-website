import OpenAI from "openai";
import type { Response as OpenAIResponse } from "openai/resources/responses/responses";

import { Project, ProviderConfig, RunStatus, Task, TaskRun } from "@/lib/types";

type DispatchOutcome = {
  providerRunId: string;
  providerState: TaskRun["providerState"];
  providerStateDetail: string;
  dispatchNote: string;
  runStatus: RunStatus;
};

export type ConnectedRunSyncOutcome = Omit<DispatchOutcome, "providerRunId"> & {
  terminalOutputText?: string;
  terminalStatus?: "completed" | "failed" | "cancelled" | "incomplete";
  terminalSummary?: string;
  startedAt?: string;
  completedAt?: string;
};

export type ConnectedProviderTestOutcome = {
  ok: boolean;
  provider: ProviderConfig["connectedProvider"];
  summary: string;
  detail: string;
  checkedAt: string;
};

const AGENT_RESULT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "schemaVersion",
    "runId",
    "taskId",
    "taskTitle",
    "provider",
    "status",
    "summary",
    "completionState",
    "changedFiles",
    "commands",
  ],
  properties: {
    schemaVersion: {
      type: "string",
      enum: ["1.0"],
    },
    runId: { type: "string" },
    taskId: { type: "string" },
    taskTitle: { type: "string" },
    provider: { type: "string" },
    providerRunId: { type: "string" },
    status: {
      type: "string",
      enum: ["succeeded", "failed", "blocked", "timed_out", "cancelled"],
    },
    summary: { type: "string" },
    completionState: {
      type: "object",
      additionalProperties: false,
      required: ["objectiveAddressed", "acceptanceCriteriaStatus"],
      properties: {
        objectiveAddressed: { type: "boolean" },
        acceptanceCriteriaStatus: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["criterion", "status"],
            properties: {
              criterion: { type: "string" },
              status: {
                type: "string",
                enum: ["met", "partially_met", "not_met"],
              },
              note: { type: "string" },
            },
          },
        },
      },
    },
    changedFiles: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["path", "changeType", "summary"],
        properties: {
          path: { type: "string" },
          changeType: {
            type: "string",
            enum: ["added", "modified", "deleted", "renamed"],
          },
          oldPath: { type: "string" },
          summary: { type: "string" },
        },
      },
    },
    commands: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["key", "command", "status"],
        properties: {
          key: { type: "string" },
          command: { type: "string" },
          cwd: { type: "string" },
          status: {
            type: "string",
            enum: ["passed", "failed", "skipped", "not_run"],
          },
          exitCode: { type: "number" },
          stdoutText: { type: "string" },
          stderrText: { type: "string" },
        },
      },
    },
    blocker: {
      type: "object",
      additionalProperties: false,
      required: [
        "type",
        "title",
        "description",
        "requestedDecision",
        "retryable",
      ],
      properties: {
        type: {
          type: "string",
          enum: [
            "missing_context",
            "verification_failure",
            "scope_conflict",
            "repo_error",
            "command_error",
            "unknown",
          ],
        },
        title: { type: "string" },
        description: { type: "string" },
        requestedDecision: { type: "string" },
        retryable: { type: "boolean" },
        relatedPaths: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
    rawOutputText: { type: "string" },
    startedAt: { type: "string" },
    completedAt: { type: "string" },
  },
} as const;

function buildProviderRunId(prefix: string, run: TaskRun) {
  return `${prefix}-${run.id.slice(0, 8)}`;
}

function formatIsoFromUnixSeconds(value?: number | null) {
  if (!value) {
    return undefined;
  }

  return new Date(value * 1000).toISOString();
}

function summarizeCodexFailure(response: OpenAIResponse) {
  if (response.error?.message) {
    return response.error.message;
  }

  if (response.incomplete_details) {
    return `Codex API returned an incomplete response: ${JSON.stringify(response.incomplete_details)}.`;
  }

  return `Codex API finished with status ${response.status ?? "unknown"}.`;
}

function getCodexModel(providerConfig: ProviderConfig) {
  return providerConfig.model?.trim() || "gpt-5-codex";
}

function getApiKeyEnvName(providerConfig: ProviderConfig) {
  return providerConfig.apiKeyHint?.trim() || "OPENAI_API_KEY";
}

function createOpenAIClient(providerConfig: ProviderConfig) {
  const envName = getApiKeyEnvName(providerConfig);
  const apiKey = process.env[envName];

  if (!apiKey) {
    throw new Error(
      `Connected Codex API is selected, but ${envName} is not set in the server environment.`,
    );
  }

  return new OpenAI({
    apiKey,
    baseURL: providerConfig.baseUrl?.trim() || process.env.OPENAI_BASE_URL || undefined,
  });
}

function formatProviderTestError(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return "Unknown provider connection error.";
}

async function dispatchCodexRun(
  project: Project,
  task: Task,
  run: TaskRun,
  providerConfig: ProviderConfig,
): Promise<DispatchOutcome> {
  const client = createOpenAIClient(providerConfig);
  const response = await client.responses.create({
    model: getCodexModel(providerConfig),
    background: true,
    input: run.prompt,
    metadata: {
      project_id: project.id,
      project_slug: project.slug,
      task_id: task.id,
      run_id: run.id,
    },
    text: {
      format: {
        type: "json_schema",
        name: "agent_execution_result",
        description:
          "The structured NSS DevOS result payload for a single bounded coding task.",
        strict: true,
        schema: AGENT_RESULT_JSON_SCHEMA,
      },
    },
  });

  const status = response.status ?? "queued";

  return {
    providerRunId: response.id,
    providerState: status === "completed" ? "completed" : "running",
    providerStateDetail:
      status === "completed"
        ? "Codex API already finished this run. Refresh once so NSS can ingest the structured result."
        : "Codex API accepted this run and is working in the background. Refresh the provider status so NSS can ingest the structured result when it completes.",
    dispatchNote: `NSS dispatched ${task.title} to Codex API with model ${getCodexModel(providerConfig)}. The run is now waiting on the provider lifecycle.`,
    runStatus: "waiting_on_provider",
  };
}

async function syncCodexRunState(
  project: Project,
  task: Task,
  run: TaskRun,
  providerConfig: ProviderConfig,
): Promise<ConnectedRunSyncOutcome> {
  const providerRunId = run.providerRunId;

  if (!providerRunId) {
    throw new Error("This connected run does not have a providerRunId yet.");
  }

  const client = createOpenAIClient(providerConfig);
  const response = await client.responses.retrieve(providerRunId);
  const status = response.status ?? "in_progress";
  const startedAt = formatIsoFromUnixSeconds(response.created_at);
  const completedAt = formatIsoFromUnixSeconds(response.completed_at);

  if (status === "queued" || status === "in_progress") {
    return {
      providerState: "running",
      providerStateDetail:
        "Codex API is still processing this run. NSS will ingest the result when the response reaches a terminal state.",
      dispatchNote: `NSS refreshed the Codex API status for ${task.title}. The run is still in progress.`,
      runStatus: "waiting_on_provider",
      startedAt,
      completedAt,
    };
  }

  if (status === "completed") {
    return {
      providerState: "completed",
      providerStateDetail:
        "Codex API completed this run. NSS is ingesting the structured result now.",
      dispatchNote: `NSS received a completed Codex API response for ${project.name}.`,
      runStatus: "waiting_on_provider",
      terminalOutputText: response.output_text?.trim() || undefined,
      terminalStatus: "completed",
      terminalSummary: "Codex API completed the run.",
      startedAt,
      completedAt,
    };
  }

  return {
    providerState: "completed",
    providerStateDetail: summarizeCodexFailure(response),
    dispatchNote: `Codex API reached a terminal ${status} state for ${task.title}. NSS is converting that provider result into the normal verifier path.`,
    runStatus: "waiting_on_provider",
    terminalOutputText: response.output_text?.trim() || undefined,
    terminalStatus:
      status === "cancelled" ? "cancelled" : status === "incomplete" ? "incomplete" : "failed",
    terminalSummary: summarizeCodexFailure(response),
    startedAt,
    completedAt,
  };
}

export async function dispatchConnectedRun(
  project: Project,
  task: Task,
  run: TaskRun,
  providerConfig: ProviderConfig,
): Promise<DispatchOutcome> {
  if (providerConfig.connectedProvider === "mock-connected") {
    return {
      providerRunId: buildProviderRunId("mock", run),
      providerState: "running",
      providerStateDetail:
        "The mock connected provider accepted this run and is simulating provider-side execution. Refresh the provider status so NSS can check for automatic result ingestion.",
      dispatchNote: `NSS dispatched ${task.title} to the mock connected provider for ${project.name}. If new workspace changes appear, NSS can ingest the result automatically on the next provider refresh.`,
      runStatus: "waiting_on_provider",
    };
  }

  if (providerConfig.connectedProvider === "codex-api") {
    return dispatchCodexRun(project, task, run, providerConfig);
  }

  return {
    providerRunId: buildProviderRunId("staged", run),
    providerState: "staged",
    providerStateDetail:
      "The connected provider target is configured, but direct API dispatch is not wired yet. NSS saved provider metadata and kept the fallback prompt ready.",
    dispatchNote: `NSS staged provider metadata for ${providerConfig.connectedProvider}, but direct API execution is not live yet. Use the fallback prompt if you want to continue right now.`,
    runStatus: "awaiting_submission",
  };
}

export async function syncConnectedRunState(
  project: Project,
  task: Task,
  run: TaskRun,
  providerConfig: ProviderConfig,
): Promise<ConnectedRunSyncOutcome> {
  if (providerConfig.connectedProvider === "codex-api") {
    return syncCodexRunState(project, task, run, providerConfig);
  }

  if (providerConfig.connectedProvider !== "mock-connected") {
    return {
      providerState: run.providerState ?? "staged",
      providerStateDetail:
        run.providerStateDetail ??
        "Direct provider polling is not wired yet for this connected provider.",
      dispatchNote:
        run.dispatchNote ??
        `NSS staged provider metadata for ${providerConfig.connectedProvider}, but direct API execution is not live yet.`,
      runStatus: run.status,
    };
  }

  if (run.providerState === "running" || run.status === "waiting_on_provider") {
    return {
      providerState: "ready_for_fallback",
      providerStateDetail:
        "The mock connected provider finished its dispatch simulation, but NSS did not detect an automatically ingestible result yet. Keep waiting or use the fallback prompt/result flow.",
      dispatchNote: `NSS finished the automatic dispatch simulation for ${task.title}. If repo changes are already present, refresh again or use the fallback prompt/result flow.`,
      runStatus: "awaiting_submission",
    };
  }

  return {
    providerState: run.providerState ?? "ready_for_fallback",
    providerStateDetail:
      run.providerStateDetail ??
      "The mock connected provider is waiting for the fallback result to be pasted.",
    dispatchNote:
      run.dispatchNote ??
      `NSS already completed the automatic dispatch simulation for ${project.name}.`,
    runStatus: run.status,
  };
}

export async function testConnectedProvider(
  providerConfig: ProviderConfig,
): Promise<ConnectedProviderTestOutcome> {
  const checkedAt = new Date().toISOString();

  if (providerConfig.connectedProvider === "mock-connected") {
    return {
      ok: true,
      provider: providerConfig.connectedProvider,
      summary: "Mock connected provider is ready.",
      detail:
        "This provider is local to NSS DevOS, so no remote API credential check is required.",
      checkedAt,
    };
  }

  if (providerConfig.connectedProvider === "codex-api") {
    try {
      const client = createOpenAIClient(providerConfig);
      const model = getCodexModel(providerConfig);
      const modelInfo = await client.models.retrieve(model);

      return {
        ok: true,
        provider: providerConfig.connectedProvider,
        summary: "Codex API connection passed.",
        detail: `Authenticated successfully and resolved model ${modelInfo.id}.`,
        checkedAt,
      };
    } catch (error) {
      return {
        ok: false,
        provider: providerConfig.connectedProvider,
        summary: "Codex API connection failed.",
        detail: formatProviderTestError(error),
        checkedAt,
      };
    }
  }

  return {
    ok: false,
    provider: providerConfig.connectedProvider,
    summary: "Connection testing is not implemented for this provider yet.",
    detail:
      providerConfig.connectedProvider === "ollama-code-api"
        ? "Ollama Code remains a planned local adapter, so NSS cannot verify its connection from the settings panel yet."
        : "Antigravity API remains a planned adapter, so NSS cannot verify its connection from the settings panel yet.",
    checkedAt,
  };
}
