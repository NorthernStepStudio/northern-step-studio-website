import { mkdir, mkdtemp, readFile, rm, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import http from "node:http";
import net from "node:net";

const appRoot = process.cwd();

async function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();

      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("Could not resolve an open local port.")));
        return;
      }

      const nextPort = address.port;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(nextPort);
      });
    });
  });
}

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Server did not become ready at ${url} in time.`);
}

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `Expected JSON from ${url} but received ${response.status} ${response.statusText}: ${text.slice(0, 200)}`,
      );
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || `Request failed for ${url}`);
  }

  return data;
}

async function runProcess(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(stderr || `${command} ${args.join(" ")} failed with code ${code}`));
    });
  });
}

function createJsonResponse(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  let body = "";

  for await (const chunk of request) {
    body += chunk.toString();
  }

  return body ? JSON.parse(body) : {};
}

async function startFakeCodexServer() {
  const port = await getAvailablePort();
  const responses = new Map();
  let responseCount = 0;
  const server = http.createServer(async (request, response) => {
    if (!request.url || !request.method) {
      createJsonResponse(response, 400, { error: { message: "Missing request metadata." } });
      return;
    }

    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "POST" && url.pathname === "/v1/responses") {
      const body = await readJsonBody(request);
      const id = `resp_${String(++responseCount).padStart(4, "0")}`;
      const createdAt = Math.floor(Date.now() / 1000);

      responses.set(id, {
        id,
        createdAt,
        completedAt: undefined,
        metadata: body.metadata ?? {},
        outputText: "",
        status: "in_progress",
      });

      createJsonResponse(response, 200, {
        id,
        object: "response",
        created_at: createdAt,
        status: "in_progress",
        output: [],
        output_text: "",
      });
      return;
    }

    if (request.method === "GET" && url.pathname.startsWith("/v1/responses/")) {
      const id = url.pathname.split("/").at(-1);
      const record = id ? responses.get(id) : undefined;

      if (!record) {
        createJsonResponse(response, 404, { error: { message: "Response not found." } });
        return;
      }

      createJsonResponse(response, 200, {
        id: record.id,
        object: "response",
        created_at: record.createdAt,
        completed_at: record.completedAt,
        status: record.status,
        output:
          record.status === "completed"
            ? [
                {
                  id: `msg_${record.id}`,
                  type: "message",
                  role: "assistant",
                  content: [
                    {
                      type: "output_text",
                      text: record.outputText,
                      annotations: [],
                    },
                  ],
                },
              ]
            : [],
        output_text: record.outputText,
      });
      return;
    }

    if (request.method === "GET" && url.pathname.startsWith("/v1/models/")) {
      const modelId = url.pathname.split("/").at(-1);

      createJsonResponse(response, 200, {
        id: modelId,
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: "openai",
      });
      return;
    }

    createJsonResponse(response, 404, { error: { message: "Unknown fake Codex route." } });
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });

  return {
    baseUrl: `http://127.0.0.1:${port}/v1`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
    finishRun(runId, { status = "completed", outputText = "" } = {}) {
      const record = [...responses.values()].find(
        (candidate) => candidate.metadata?.run_id === runId,
      );

      if (!record) {
        throw new Error(`Fake Codex response for run ${runId} was not created.`);
      }

      record.status = status;
      record.outputText = outputText;
      record.completedAt = Math.floor(Date.now() / 1000);

      return record.id;
    },
    completeRun(runId, outputText) {
      return this.finishRun(runId, { status: "completed", outputText });
    },
  };
}

function materializeTaskPath(patterns, index) {
  for (const pattern of patterns) {
    if (pattern.endsWith("/**")) {
      const base = pattern.slice(0, -3);
      const ext = base.includes("src/app") ? "tsx" : "ts";
      return `${base}/smoke-task-${index}.${ext}`;
    }

    if (pattern.endsWith("README.md") || pattern.endsWith("package.json")) {
      return pattern;
    }

    if (pattern.includes("*")) {
      const cleaned = pattern.replace(/\*\*/g, "").replace(/\*/g, "");
      const ext = cleaned.includes("src/app") ? "tsx" : "ts";
      return `${cleaned.replace(/\/+$/, "")}/smoke-task-${index}.${ext}`;
    }

    return pattern;
  }

  return `src/smoke-task-${index}.ts`;
}

function pickRollbackVerificationPath(patterns, index) {
  if (patterns.includes("**/package-lock.json")) {
    return "src/package-lock.json";
  }

  const candidatePatterns = patterns.filter(
    (pattern) =>
      !pattern.startsWith("node_modules/") &&
      !pattern.startsWith(".next/") &&
      !pattern.includes(".env"),
  );

  return materializeTaskPath(candidatePatterns.length > 0 ? candidatePatterns : patterns, index);
}

async function materializePathChange(repoPath, relativePath, index) {
  const absolutePath = path.join(repoPath, ...relativePath.split("/"));
  let previousText = null;
  let existedBefore = false;
  let changeType = "added";

  try {
    previousText = await readFile(absolutePath, "utf8");
    existedBefore = true;
    changeType = "modified";
  } catch {}

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(
    absolutePath,
    [
      `// smoke task ${index}`,
      `export const smokeTask${index} = ${JSON.stringify(relativePath)};`,
      "",
    ].join("\n"),
    "utf8",
  );

  return {
    path: relativePath,
    changeType,
    async restore() {
      if (existedBefore && previousText !== null) {
        await writeFile(absolutePath, previousText, "utf8");
        return;
      }

      await unlink(absolutePath).catch(() => undefined);
    },
  };
}

async function ensureTempRepo(repoPath) {
  await mkdir(repoPath, { recursive: true });
  await writeFile(
    path.join(repoPath, "package.json"),
    JSON.stringify(
      {
        name: "ndo-smoke-repo",
        private: true,
        scripts: {
          lint: "node -e \"console.log('lint ok')\"",
          build: "node -e \"console.log('build ok')\"",
        },
      },
      null,
      2,
    ),
    "utf8",
  );
  await writeFile(path.join(repoPath, "README.md"), "# Smoke Repo\n", "utf8");
  await runProcess("git", ["init"], { cwd: repoPath });
  await runProcess("git", ["config", "user.email", "smoke@example.com"], { cwd: repoPath });
  await runProcess("git", ["config", "user.name", "Smoke Runner"], { cwd: repoPath });
  await runProcess("git", ["add", "."], { cwd: repoPath });
  await runProcess("git", ["commit", "-m", "Initial smoke repo"], { cwd: repoPath });
}

async function materializeWorkspaceChange(repoPath, task, index) {
  const relativePath = materializeTaskPath(task.allowedPaths, index);
  const change = await materializePathChange(repoPath, relativePath, index);

  return {
    path: change.path,
    changeType: change.changeType,
  };
}

function buildSubmission(
  project,
  task,
  runId,
  changedFile,
  index,
  provider = "codex-app",
) {
  return {
    schemaVersion: "1.0",
    runId,
    taskId: task.id,
    taskTitle: task.title,
    provider,
    status: "succeeded",
    summary: `Completed smoke task ${index}: ${task.title}.`,
    completionState: {
      objectiveAddressed: true,
      acceptanceCriteriaStatus: task.acceptanceCriteria.map((criterion) => ({
        criterion,
        status: "met",
      })),
    },
    changedFiles: [
      {
        path: changedFile.path,
        changeType: changedFile.changeType,
        summary: `Implemented the smoke-path deliverable for task ${index}.`,
      },
    ],
    commands: project.verificationCommands.map((command) => ({
      key: command.key,
      command: command.command,
      cwd: command.cwd,
      status: "passed",
      exitCode: 0,
      stdoutText: `${command.label} passed during smoke validation.`,
      stderrText: "",
    })),
    rawOutputText: `Smoke runner accepted task ${index}.`,
  };
}

async function stopServer(child) {
  if (!child.pid) {
    return;
  }

  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const killer = spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
        stdio: "ignore",
      });
      killer.on("exit", resolve);
      killer.on("error", resolve);
    });
    return;
  }

  child.kill("SIGTERM");
}

const tempDir = await mkdtemp(path.join(os.tmpdir(), "ndo-smoke-"));
const tempStorePath = path.join(tempDir, "store.json");
const tempRepoPath = path.join(tempDir, "repo");
const fakeCodexServer = await startFakeCodexServer();
const childEnv = Object.fromEntries(
  Object.entries({
    ...process.env,
    NDO_STORE_PATH: tempStorePath,
    NSS_SMOKE_OPENAI_API_KEY: "smoke-openai-key",
  }).filter((entry) => entry[1] !== undefined),
);
const port = await getAvailablePort();
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn(`npm run start -- --port ${port}`, {
  cwd: appRoot,
  env: childEnv,
  shell: true,
  stdio: "ignore",
});

try {
  await ensureTempRepo(tempRepoPath);
  await waitForServer(`${baseUrl}/projects`);

  const createPayload = {
    name: "Smoke Project",
    rawBrief:
      "Build a supervised loop that can create five bounded tasks, accept structured coding-agent results, verify them, and complete the milestone.",
    targetMvp: "Advance through all five planned tasks automatically after accepted runs.",
    repoPath: tempRepoPath,
    defaultBranch: "main",
    primaryPaths: "src/app/**\nsrc/components/**\nsrc/lib/**",
    verificationCommands: "build | npm run build\nlint | npm run lint",
  };

  const created = await fetchJson(`${baseUrl}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createPayload),
  });

  const projectId = created.projectId;
  if (!projectId) {
    throw new Error("Project creation did not return a projectId.");
  }

  let totalSteps = 0;

  for (let index = 1; ; index += 1) {
    const projectsResponse = await fetchJson(`${baseUrl}/api/projects`);
    const project = projectsResponse.projects.find((item) => item.id === projectId);

    if (!project) {
      throw new Error(`Project ${projectId} disappeared during smoke run.`);
    }

    totalSteps = project.taskBlueprints.length;

    const task = project.tasks.find((item) => ["ready", "needs_retry"].includes(item.status));

    if (!task) {
      if (project.status === "completed") {
        break;
      }

      throw new Error(`No runnable task found for smoke step ${index}.`);
    }

    const runResponse = await fetchJson(`${baseUrl}/api/tasks/${task.id}/runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });

    const runId = runResponse.runId;
    if (!runId) {
      throw new Error(`No runId returned for smoke step ${index}.`);
    }

    const changedFile = await materializeWorkspaceChange(tempRepoPath, task, index);
    const submission = buildSubmission(project, task, runId, changedFile, index);
    const submitResponse = await fetchJson(`${baseUrl}/api/runs/${runId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionText: JSON.stringify(submission, null, 2) }),
    });

    const action = submitResponse.decision?.action;
    const expectedAction = index < totalSteps ? "generate_next_task" : "complete_milestone";

    if (action !== expectedAction) {
      throw new Error(
        `Smoke step ${index} expected ${expectedAction} but received ${action}.`,
      );
    }

    const updatedProjectsResponse = await fetchJson(`${baseUrl}/api/projects`);
    const updatedProject = updatedProjectsResponse.projects.find((item) => item.id === projectId);
    const storedRun = updatedProject?.runs.find((item) => item.id === runId);

    if (!storedRun?.snapshotBefore || !storedRun?.snapshotAfter) {
      throw new Error(`Smoke step ${index} did not persist both repo snapshots.`);
    }

    if (!storedRun.localRepoCheck?.available) {
      throw new Error(`Smoke step ${index} did not produce an available local repo check.`);
    }

    if (!storedRun.actualChangedFiles?.some((file) => file.path === changedFile.path)) {
      throw new Error(`Smoke step ${index} did not detect the changed file locally.`);
    }

    if (!storedRun.localCommandReports?.every((report) => report.status === "passed")) {
      throw new Error(`Smoke step ${index} did not record passing local command checks.`);
    }
  }

  const finalProjectsResponse = await fetchJson(`${baseUrl}/api/projects`);
  const finalProject = finalProjectsResponse.projects.find((item) => item.id === projectId);

  if (!finalProject) {
    throw new Error("Final project state was not found.");
  }

  if (finalProject.status !== "completed") {
    throw new Error(`Expected project to be completed but got ${finalProject.status}.`);
  }

  if (finalProject.tasks.length !== finalProject.taskBlueprints.length) {
    throw new Error(
      `Expected ${finalProject.taskBlueprints.length} tasks but found ${finalProject.tasks.length}.`,
    );
  }

  if (!finalProject.tasks.every((task) => task.status === "completed")) {
    throw new Error("Not all tasks completed successfully in the smoke flow.");
  }

  const connectedCreated = await fetchJson(`${baseUrl}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...createPayload,
      name: "Codex Connected Smoke Project",
      executionMode: "connected",
      connectedProvider: "codex-api",
      providerBaseUrl: fakeCodexServer.baseUrl,
      providerModel: "gpt-5-codex",
      providerApiKeyHint: "NSS_SMOKE_OPENAI_API_KEY",
    }),
  });

  const connectedProjectId = connectedCreated.projectId;
  if (!connectedProjectId) {
    throw new Error("Connected project creation did not return a projectId.");
  }

  if (!connectedCreated.initialRunId) {
    throw new Error("Connected project creation did not auto-start task one.");
  }

  const connectionTestResponse = await fetchJson(
    `${baseUrl}/api/projects/${connectedProjectId}/settings/test`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        executionMode: "connected",
        manualProvider: "codex-app",
        connectedProvider: "codex-api",
        providerBaseUrl: fakeCodexServer.baseUrl,
        providerModel: "gpt-5-codex",
        providerApiKeyHint: "NSS_SMOKE_OPENAI_API_KEY",
        autoDispatchEnabled: true,
        autoIngestEnabled: true,
        autopilotEnabled: true,
      }),
    },
  );

  if (!connectionTestResponse.ok) {
    throw new Error("Codex connection test did not return a passing result.");
  }

  const connectedProjectsResponse = await fetchJson(`${baseUrl}/api/projects`);
  const connectedProject = connectedProjectsResponse.projects.find(
    (item) => item.id === connectedProjectId,
  );

  if (!connectedProject) {
    throw new Error("Connected project was not found after creation.");
  }

  const connectedTask = connectedProject.tasks.find((item) => item.status === "in_progress");
  if (!connectedTask) {
    throw new Error("Connected project did not move task one into progress automatically.");
  }

  const connectedRunId = connectedCreated.initialRunId;

  const connectedChangedFile = await materializeWorkspaceChange(
    tempRepoPath,
    connectedTask,
    totalSteps + 1,
  );
  const connectedSubmission = buildSubmission(
    connectedProject,
    connectedTask,
    connectedRunId,
    connectedChangedFile,
    totalSteps + 1,
    "codex-api",
  );
  fakeCodexServer.completeRun(
    connectedRunId,
    JSON.stringify(connectedSubmission, null, 2),
  );

  const syncResponse = await fetchJson(
    `${baseUrl}/api/runs/${connectedRunId}/sync`,
    {
      method: "POST",
    },
  );

  if (syncResponse.status !== "accepted") {
    throw new Error(
      `Connected smoke sync expected accepted but received ${syncResponse.status}.`,
    );
  }

  if (syncResponse.resultSource !== "connected_auto_ingest") {
    throw new Error("Connected smoke sync did not report automatic ingestion.");
  }

  const finalConnectedProjectsResponse = await fetchJson(`${baseUrl}/api/projects`);
  const finalConnectedProject = finalConnectedProjectsResponse.projects.find(
    (item) => item.id === connectedProjectId,
  );

  if (!finalConnectedProject) {
    throw new Error("Connected smoke project was not found after sync.");
  }

  const connectedRun = finalConnectedProject?.runs.find((item) => item.id === connectedRunId);

  if (!connectedRun?.parsedResult) {
    throw new Error("Connected smoke run did not persist an auto-ingested result.");
  }

  if (connectedRun.resultSource !== "connected_auto_ingest") {
    throw new Error("Connected smoke run did not store the automatic result source.");
  }

  if (connectedRun.providerState !== "completed") {
    throw new Error("Connected smoke run did not complete the provider lifecycle.");
  }

  if (!connectedRun.actualChangedFiles?.some((file) => file.path === connectedChangedFile.path)) {
    throw new Error("Connected smoke run did not detect the local changed file.");
  }

  if (!connectedRun.decision?.autopilotRunId) {
    throw new Error("Connected smoke run did not start the next run through autopilot.");
  }

  const autopilotRun = finalConnectedProject?.runs.find(
    (item) => item.id === connectedRun.decision?.autopilotRunId,
  );

  if (!autopilotRun) {
    throw new Error("Connected smoke project did not persist the autopilot run.");
  }

  if (autopilotRun.taskId === connectedRun.taskId) {
    throw new Error("Connected smoke autopilot reused the previous task instead of advancing.");
  }

  const autopilotTask = finalConnectedProject?.tasks.find(
    (item) => item.id === autopilotRun.taskId,
  );

  if (!autopilotTask) {
    throw new Error("Connected smoke project did not persist the autopilot task.");
  }

  const autopilotChangedFile = await materializeWorkspaceChange(
    tempRepoPath,
    autopilotTask,
    totalSteps + 2,
  );
  const autopilotSubmission = buildSubmission(
    finalConnectedProject,
    autopilotTask,
    autopilotRun.id,
    autopilotChangedFile,
    totalSteps + 2,
    "codex-api",
  );
  fakeCodexServer.completeRun(
    autopilotRun.id,
    JSON.stringify(autopilotSubmission, null, 2),
  );

  const autopilotSyncResponse = await fetchJson(
    `${baseUrl}/api/runs/${autopilotRun.id}/sync`,
    {
      method: "POST",
    },
  );

  if (autopilotSyncResponse.status !== "accepted") {
    throw new Error(
      `Autopilot smoke sync expected accepted but received ${autopilotSyncResponse.status}.`,
    );
  }

  if (autopilotSyncResponse.resultSource !== "connected_auto_ingest") {
    throw new Error("Autopilot smoke sync did not report automatic ingestion.");
  }

  const chainedConnectedProjectsResponse = await fetchJson(`${baseUrl}/api/projects`);
  const chainedConnectedProject = chainedConnectedProjectsResponse.projects.find(
    (item) => item.id === connectedProjectId,
  );

  if (!chainedConnectedProject) {
    throw new Error("Connected smoke project was not found after the autopilot sync.");
  }

  const storedAutopilotRun = chainedConnectedProject?.runs.find(
    (item) => item.id === autopilotRun.id,
  );

  if (!storedAutopilotRun?.parsedResult) {
    throw new Error("Autopilot smoke run did not persist an auto-ingested result.");
  }

  if (storedAutopilotRun.resultSource !== "connected_auto_ingest") {
    throw new Error("Autopilot smoke run did not store the automatic result source.");
  }

  if (storedAutopilotRun.providerState !== "completed") {
    throw new Error("Autopilot smoke run did not complete the provider lifecycle.");
  }

  if (
    !storedAutopilotRun.actualChangedFiles?.some(
      (file) => file.path === autopilotChangedFile.path,
    )
  ) {
    throw new Error("Autopilot smoke run did not detect the local changed file.");
  }

  if (!storedAutopilotRun.decision?.autopilotRunId) {
    throw new Error("Autopilot smoke run did not continue chaining to the next connected step.");
  }

  const autoRetryCreated = await fetchJson(`${baseUrl}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...createPayload,
      name: "Connected Auto Retry Smoke Project",
      executionMode: "connected",
      connectedProvider: "codex-api",
      providerBaseUrl: fakeCodexServer.baseUrl,
      providerModel: "gpt-5-codex",
      providerApiKeyHint: "NSS_SMOKE_OPENAI_API_KEY",
    }),
  });

  const autoRetryProjectId = autoRetryCreated.projectId;
  const autoRetryInitialRunId = autoRetryCreated.initialRunId;
  if (!autoRetryProjectId || !autoRetryInitialRunId) {
    throw new Error("Connected auto-retry smoke project did not auto-start the first run.");
  }

  const autoRetryProjectsResponse = await fetchJson(`${baseUrl}/api/projects`);
  const autoRetryProject = autoRetryProjectsResponse.projects.find(
    (item) => item.id === autoRetryProjectId,
  );

  if (!autoRetryProject) {
    throw new Error("Connected auto-retry smoke project was not found.");
  }

  const autoRetryTask = autoRetryProject.tasks.find((item) => item.status === "in_progress");
  if (!autoRetryTask) {
    throw new Error("Connected auto-retry smoke task did not move into progress.");
  }

  const autoRetryChangedFile = await materializeWorkspaceChange(
    tempRepoPath,
    autoRetryTask,
    totalSteps + 10,
  );
  const autoRetrySubmission = buildSubmission(
    autoRetryProject,
    autoRetryTask,
    autoRetryInitialRunId,
    autoRetryChangedFile,
    totalSteps + 10,
    "codex-api",
  );
  autoRetrySubmission.completionState.objectiveAddressed = false;
  autoRetrySubmission.completionState.acceptanceCriteriaStatus =
    autoRetryTask.acceptanceCriteria.map((criterion, index) => ({
      criterion,
      status: index === 0 ? "not_met" : "partially_met",
      note: "Connected auto-retry smoke intentionally leaves this criterion unmet.",
    }));
  autoRetrySubmission.summary = `Connected auto-retry smoke task ${totalSteps + 10} intentionally requires an automatic retry.`;

  fakeCodexServer.completeRun(
    autoRetryInitialRunId,
    JSON.stringify(autoRetrySubmission, null, 2),
  );

  const autoRetrySyncResponse = await fetchJson(
    `${baseUrl}/api/runs/${autoRetryInitialRunId}/sync`,
    {
      method: "POST",
    },
  );

  if (autoRetrySyncResponse.status !== "needs_retry") {
    throw new Error("Connected auto-retry smoke run did not enter retry mode first.");
  }

  const storedAutoRetryProjectsResponse = await fetchJson(`${baseUrl}/api/projects`);
  const storedAutoRetryProject = storedAutoRetryProjectsResponse.projects.find(
    (item) => item.id === autoRetryProjectId,
  );

  if (!storedAutoRetryProject) {
    throw new Error("Connected auto-retry smoke project was not found after sync.");
  }

  const storedFailingConnectedRun = storedAutoRetryProject.runs.find(
    (item) => item.id === autoRetryInitialRunId,
  );

  if (!storedFailingConnectedRun?.decision?.autopilotRunId) {
    throw new Error("Connected auto-retry smoke run did not auto-start the next retry attempt.");
  }

  const automaticRetryRun = storedAutoRetryProject.runs.find(
    (item) => item.id === storedFailingConnectedRun.decision?.autopilotRunId,
  );

  if (!automaticRetryRun) {
    throw new Error("Connected auto-retry smoke project did not persist the new retry run.");
  }

  if (automaticRetryRun.taskId !== autoRetryTask.id) {
    throw new Error("Connected auto-retry smoke started a new task instead of retrying the same task.");
  }

  if (!automaticRetryRun.prompt?.includes("Use the previous verifier findings as the correction target for this retry.")) {
    throw new Error("Connected auto-retry smoke did not inject supervisor retry guidance into the new run prompt.");
  }

  const providerFailureCreated = await fetchJson(`${baseUrl}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...createPayload,
      name: "Connected Provider Failure Smoke Project",
      executionMode: "connected",
      connectedProvider: "codex-api",
      providerBaseUrl: fakeCodexServer.baseUrl,
      providerModel: "gpt-5-codex",
      providerApiKeyHint: "NSS_SMOKE_OPENAI_API_KEY",
    }),
  });

  const providerFailureProjectId = providerFailureCreated.projectId;
  const providerFailureInitialRunId = providerFailureCreated.initialRunId;
  if (!providerFailureProjectId || !providerFailureInitialRunId) {
    throw new Error("Connected provider-failure smoke project did not auto-start the first run.");
  }

  fakeCodexServer.finishRun(providerFailureInitialRunId, {
    status: "failed",
    outputText: "Provider crashed before returning the required NSS DevOS JSON payload.",
  });

  const providerFailureSyncResponse = await fetchJson(
    `${baseUrl}/api/runs/${providerFailureInitialRunId}/sync`,
    {
      method: "POST",
    },
  );

  if (providerFailureSyncResponse.status !== "needs_retry") {
    throw new Error("Connected provider-failure smoke run did not enter retry mode.");
  }

  const providerFailureProjectsResponse = await fetchJson(`${baseUrl}/api/projects`);
  const providerFailureProject = providerFailureProjectsResponse.projects.find(
    (item) => item.id === providerFailureProjectId,
  );

  if (!providerFailureProject) {
    throw new Error("Connected provider-failure smoke project was not found after sync.");
  }

  const storedProviderFailureRun = providerFailureProject.runs.find(
    (item) => item.id === providerFailureInitialRunId,
  );

  if (!storedProviderFailureRun?.decision?.autopilotRunId) {
    throw new Error("Connected provider-failure smoke run did not auto-start a recovery retry.");
  }

  const providerRecoveryRun = providerFailureProject.runs.find(
    (item) => item.id === storedProviderFailureRun.decision?.autopilotRunId,
  );

  if (!providerRecoveryRun) {
    throw new Error("Connected provider-failure smoke project did not persist the recovery retry run.");
  }

  if (
    !providerRecoveryRun.prompt?.includes(
      "The previous connected-provider attempt did not return an acceptable structured result.",
    )
  ) {
    throw new Error("Connected provider-failure smoke did not inject provider recovery guidance into the retry prompt.");
  }

  const interventionCreated = await fetchJson(`${baseUrl}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...createPayload,
      name: "Intervention Smoke Project",
    }),
  });

  const interventionProjectId = interventionCreated.projectId;
  if (!interventionProjectId) {
    throw new Error("Intervention project creation did not return a projectId.");
  }

  const interventionProjectsResponse = await fetchJson(`${baseUrl}/api/projects`);
  const interventionProject = interventionProjectsResponse.projects.find(
    (item) => item.id === interventionProjectId,
  );

  if (!interventionProject) {
    throw new Error("Intervention project was not found.");
  }

  const interventionTask = interventionProject.tasks.find((item) => item.status === "ready");
  if (!interventionTask) {
    throw new Error("No ready task found for the intervention smoke flow.");
  }

  const interventionRunResponse = await fetchJson(
    `${baseUrl}/api/tasks/${interventionTask.id}/runs`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: interventionProjectId }),
    },
  );

  const interventionRunId = interventionRunResponse.runId;
  if (!interventionRunId) {
    throw new Error("No runId returned for the intervention smoke flow.");
  }

  const interventionChangedFile = await materializeWorkspaceChange(
    tempRepoPath,
    interventionTask,
    totalSteps + 3,
  );
  const failingSubmission = buildSubmission(
    interventionProject,
    interventionTask,
    interventionRunId,
    interventionChangedFile,
    totalSteps + 3,
  );
  failingSubmission.completionState.objectiveAddressed = false;
  failingSubmission.completionState.acceptanceCriteriaStatus =
    interventionTask.acceptanceCriteria.map((criterion, index) => ({
      criterion,
      status: index === 0 ? "not_met" : "partially_met",
      note: "Smoke intervention flow intentionally leaves this criterion unmet.",
    }));
  failingSubmission.summary = `Intervention smoke task ${totalSteps + 3} intentionally requires retry.`;

  const interventionSubmitResponse = await fetchJson(
    `${baseUrl}/api/runs/${interventionRunId}/submit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionText: JSON.stringify(failingSubmission, null, 2) }),
    },
  );

  if (interventionSubmitResponse.decision?.action !== "retry_task") {
    throw new Error("Intervention smoke run did not land in retry mode.");
  }

  const operatorGuidance = "Fix the failed acceptance criteria and keep the retry inside src/app only.";
  const interventionActionResponse = await fetchJson(
    `${baseUrl}/api/runs/${interventionRunId}/intervention`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "request_retry_with_guidance",
        guidance: operatorGuidance,
        startNextRun: true,
      }),
    },
  );

  if (!interventionActionResponse.nextRunId) {
    throw new Error("Intervention smoke flow did not immediately start the next run.");
  }

  const updatedInterventionProjectsResponse = await fetchJson(`${baseUrl}/api/projects`);
  const updatedInterventionProject = updatedInterventionProjectsResponse.projects.find(
    (item) => item.id === interventionProjectId,
  );
  const updatedInterventionTask = updatedInterventionProject?.tasks.find(
    (item) => item.id === interventionTask.id,
  );

  if (!updatedInterventionTask?.supervisorGuidance?.includes(operatorGuidance)) {
    throw new Error("Intervention smoke task did not persist the supervisor guidance.");
  }

  const retryRun = updatedInterventionProject?.runs.find(
    (item) => item.id === interventionActionResponse.nextRunId,
  );

  if (!retryRun) {
    throw new Error("Intervention smoke flow did not persist the immediately started retry run.");
  }

  if (!retryRun.prompt?.includes(operatorGuidance)) {
    throw new Error("Retry smoke run prompt did not include the supervisor guidance.");
  }

  const mismatchCreated = await fetchJson(`${baseUrl}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...createPayload,
      name: "Mismatch Policy Smoke Project",
    }),
  });

  const mismatchProjectId = mismatchCreated.projectId;
  if (!mismatchProjectId) {
    throw new Error("Mismatch policy smoke project creation did not return a projectId.");
  }

  const mismatchProjectsResponse = await fetchJson(`${baseUrl}/api/projects`);
  const mismatchProject = mismatchProjectsResponse.projects.find(
    (item) => item.id === mismatchProjectId,
  );

  if (!mismatchProject) {
    throw new Error("Mismatch policy smoke project was not found.");
  }

  const mismatchTask = mismatchProject.tasks.find((item) => item.status === "ready");
  if (!mismatchTask) {
    throw new Error("No ready task found for the mismatch policy smoke flow.");
  }

  const mismatchRunResponse = await fetchJson(
    `${baseUrl}/api/tasks/${mismatchTask.id}/runs`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: mismatchProjectId }),
    },
  );

  const mismatchRunId = mismatchRunResponse.runId;
  if (!mismatchRunId) {
    throw new Error("No runId returned for the mismatch policy smoke flow.");
  }

  const mismatchChangedFile = await materializeWorkspaceChange(
    tempRepoPath,
    mismatchTask,
    totalSteps + 4,
  );
  const mismatchSubmission = buildSubmission(
    mismatchProject,
    mismatchTask,
    mismatchRunId,
    mismatchChangedFile,
    totalSteps + 4,
  );
  mismatchSubmission.changedFiles.push({
    path: "src/app/phantom-smoke-file.tsx",
    changeType: "modified",
    summary: "This extra reported file is intentional to test retry-vs-review policy.",
  });

  const mismatchSubmitResponse = await fetchJson(
    `${baseUrl}/api/runs/${mismatchRunId}/submit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionText: JSON.stringify(mismatchSubmission, null, 2) }),
    },
  );

  if (mismatchSubmitResponse.decision?.action !== "retry_task") {
    throw new Error("Mismatch policy smoke run did not downgrade to retry mode.");
  }

  const rollbackCreated = await fetchJson(`${baseUrl}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...createPayload,
      name: "Rollback Verification Smoke Project",
    }),
  });

  const rollbackProjectId = rollbackCreated.projectId;
  if (!rollbackProjectId) {
    throw new Error("Rollback verification smoke project creation did not return a projectId.");
  }

  const rollbackProjectsResponse = await fetchJson(`${baseUrl}/api/projects`);
  const rollbackProject = rollbackProjectsResponse.projects.find(
    (item) => item.id === rollbackProjectId,
  );

  if (!rollbackProject) {
    throw new Error("Rollback verification smoke project was not found.");
  }

  const rollbackTask = rollbackProject.tasks.find((item) => item.status === "ready");
  if (!rollbackTask) {
    throw new Error("No ready task found for the rollback verification smoke flow.");
  }

  if (rollbackTask.forbiddenPaths.length === 0) {
    throw new Error("Rollback verification smoke task does not expose a forbidden path.");
  }

  const rollbackRunResponse = await fetchJson(
    `${baseUrl}/api/tasks/${rollbackTask.id}/runs`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: rollbackProjectId }),
    },
  );

  const rollbackRunId = rollbackRunResponse.runId;
  if (!rollbackRunId) {
    throw new Error("No runId returned for the rollback verification smoke flow.");
  }

  const forbiddenPath = pickRollbackVerificationPath(
    rollbackTask.forbiddenPaths,
    totalSteps + 5,
  );
  const forbiddenChange = await materializePathChange(
    tempRepoPath,
    forbiddenPath,
    totalSteps + 5,
  );
  const rollbackSubmission = buildSubmission(
    rollbackProject,
    rollbackTask,
    rollbackRunId,
    forbiddenChange,
    totalSteps + 5,
  );

  const rollbackSubmitResponse = await fetchJson(
    `${baseUrl}/api/runs/${rollbackRunId}/submit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionText: JSON.stringify(rollbackSubmission, null, 2) }),
    },
  );

  if (rollbackSubmitResponse.decision?.action !== "rollback_run") {
    throw new Error("Rollback verification smoke run did not enter rollback-required mode.");
  }

  const prematureRollbackResponse = await fetch(
    `${baseUrl}/api/runs/${rollbackRunId}/intervention`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "mark_rollback_complete",
        startNextRun: true,
      }),
    },
  );
  const prematureRollbackBody = await prematureRollbackResponse.json();

  if (prematureRollbackResponse.ok) {
    throw new Error("Rollback verification smoke flow accepted rollback before the repo was restored.");
  }

  if (
    typeof prematureRollbackBody.error !== "string" ||
    !prematureRollbackBody.error.includes("Rollback is not complete yet")
  ) {
    throw new Error("Rollback verification smoke flow did not explain why rollback proof failed.");
  }

  await forbiddenChange.restore();

  const rollbackCompleteResponse = await fetchJson(
    `${baseUrl}/api/runs/${rollbackRunId}/intervention`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "mark_rollback_complete",
        startNextRun: true,
      }),
    },
  );

  if (!rollbackCompleteResponse.nextRunId) {
    throw new Error("Rollback verification smoke flow did not start the next run after proof.");
  }

  console.log(
    `Smoke v0 passed: manual roadmap completed across ${finalProject.taskBlueprints.length} planned tasks, Codex API connected sync auto-ingested two verified runs, autopilot continued chaining forward, recoverable connected verifier failures and provider failures now auto-retry with guidance, operator retry guidance auto-started the next run, payload mismatches now downgrade to retry instead of human review, and rollback completion now requires repo proof before automation resumes.`,
  );
} finally {
  await stopServer(server);
  await fakeCodexServer.close();
  await rm(tempDir, { recursive: true, force: true });
}
