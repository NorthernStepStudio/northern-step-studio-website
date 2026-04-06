import {
  CreateProjectInput,
  Milestone,
  MilestoneBlueprint,
  StructuredSpec,
  Task,
  TaskPacket,
  TaskBlueprint,
  VerificationCommand,
} from "@/lib/types";
import { compactText, slugify, uniqueStrings } from "@/lib/utils";

function normalizeBrief(rawBrief: string) {
  return rawBrief.replace(/\s+/g, " ").trim();
}

function sentenceCase(value: string) {
  if (!value) {
    return value;
  }

  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

function extractProductType(rawBrief: string) {
  const normalized = normalizeBrief(rawBrief)
    .replace(/^(build|create|make|ship|develop)\s+/i, "")
    .replace(/^(a|an|the)\s+/i, "");
  const leadingSegment = normalized
    .split(/\b(?:that|which|where|with|for|so|because|while)\b/i)[0]
    .trim()
    .replace(/\b(?:tiny|minimal|small|simple|lightweight)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return leadingSegment || "web product";
}

function extractActionPhrases(rawBrief: string) {
  const normalized = normalizeBrief(rawBrief);
  const actionSource =
    normalized.match(/\b(?:lets?|allows?)\s+(?:a|the)?\s*user\s+(.+)$/i)?.[1] ??
    normalized.match(/\bto\s+(.+)$/i)?.[1] ??
    "";

  if (!actionSource) {
    return [];
  }

  return actionSource
    .replace(/[.]+$/g, "")
    .split(/,| and /i)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function buildPrimaryLoop(rawBrief: string, targetMvp?: string) {
  const actions = extractActionPhrases(rawBrief);

  if (actions.length > 0) {
    return actions.map((action) => sentenceCase(action)).join(" -> ");
  }

  if (targetMvp?.trim()) {
    return targetMvp
      .split(/->/g)
      .map((step) => step.trim())
      .filter(Boolean)
      .map((step) => sentenceCase(step))
      .join(" -> ");
  }

  return "Capture the primary brief flow -> render the main surface -> preserve the expected product state.";
}

function buildRisks(rawBrief: string, targetMvp?: string) {
  const normalized = normalizeBrief(rawBrief).toLowerCase();
  const risks = [
    "The first task can drift beyond the primary brief if the shell and data model are not kept narrow.",
  ];

  if (/\bamount|budget|price|finance|expense|cost|currency\b/.test(normalized)) {
    risks.push("Numeric inputs and rollups need deterministic validation to avoid incorrect totals.");
  }

  if (/\blist|table|dashboard|summary|overview|display\b/.test(normalized)) {
    risks.push("List and summary surfaces can desync if state updates are not reflected consistently.");
  }

  if (
    /\blocal|persist|storage|refresh\b/.test(normalized) ||
    /local/i.test(targetMvp ?? "")
  ) {
    risks.push("Persistence rules need to be explicit so refreshes preserve the expected user state.");
  }

  return risks.slice(0, 3);
}

function buildNotes(input: CreateProjectInput) {
  const notes = [
    input.targetMvp?.trim()
      ? `Target MVP: ${input.targetMvp.trim()}`
      : "Target MVP: not provided, so planning stays anchored to the raw brief.",
    `Primary repository target: ${input.repoPath}`,
    `Execution mode: ${input.executionMode === "connected" ? "connected automation" : "manual handoff"}`,
    `Connected provider target: ${input.connectedProvider}`,
  ];

  const primaryPaths = uniqueStrings(input.primaryPaths);

  if (primaryPaths.length > 0) {
    notes.push(`Primary implementation paths: ${primaryPaths.join(", ")}`);
  }

  return notes;
}

export function buildStructuredSpec(input: CreateProjectInput): StructuredSpec {
  return {
    summary: compactText(normalizeBrief(input.rawBrief), 260),
    productType: extractProductType(input.rawBrief),
    primaryLoop: buildPrimaryLoop(input.rawBrief, input.targetMvp),
    risks: buildRisks(input.rawBrief, input.targetMvp),
    notes: buildNotes(input),
  };
}

function buildBasePaths(primaryPaths: string[]) {
  const fallback = [
    "src/app/**",
    "src/components/**",
    "src/lib/**",
    "README.md",
    "package.json",
  ];

  return uniqueStrings(primaryPaths.length > 0 ? primaryPaths : fallback);
}

function buildMilestoneOneBlueprints(codePaths: string[]): TaskBlueprint[] {
  return [
    {
      key: "foundation",
      milestoneKey: "prove-manual-loop",
      title: "Stand up the app shell and local project state",
      objective:
        "Create the first runnable shell for the product with a working project dashboard and local persistence.",
      instructions:
        "Implement the app shell, local storage model, and a first project dashboard surface. Keep the scope inside the primary UI and persistence paths only.",
      acceptanceCriteria: [
        "The app can create and list projects locally.",
        "The first dashboard view renders project summary data.",
        "Local state survives page refreshes.",
      ],
      allowedPaths: codePaths,
      forbiddenPaths: ["node_modules/**", ".next/**", "**/*.env*", "**/package-lock.json"],
    },
    {
      key: "planning",
      milestoneKey: "prove-manual-loop",
      title: "Implement brief planning and task generation",
      objective:
        "Turn a raw project brief into a structured spec, milestone one, and an explicit task handoff packet.",
      instructions:
        "Build deterministic brief normalization and task planning logic. Do not add direct provider automation yet.",
      acceptanceCriteria: [
        "A structured project spec is generated from the raw brief.",
        "Milestone one is created automatically.",
        "Task one includes objective, instructions, acceptance criteria, and file boundaries.",
      ],
      allowedPaths: codePaths,
      forbiddenPaths: ["node_modules/**", ".next/**", "**/*.env*"],
    },
    {
      key: "handoff",
      milestoneKey: "prove-manual-loop",
      title: "Implement manual coding-agent handoff and result ingestion",
      objective:
        "Allow an operator to copy a strict handoff prompt, paste a structured coding-agent result, and store the run.",
      instructions:
        "Add the task run page, prompt generation, pasted JSON ingestion, and validation of the result contract.",
      acceptanceCriteria: [
        "A copy-ready prompt is generated for the active task.",
        "The operator can paste a valid coding-agent result JSON payload.",
        "Invalid result payloads are rejected with actionable errors.",
      ],
      allowedPaths: codePaths,
      forbiddenPaths: ["node_modules/**", ".next/**", "**/*.env*"],
    },
    {
      key: "verification",
      milestoneKey: "prove-manual-loop",
      title: "Implement verification and next-task decisioning",
      objective:
        "Verify the coding-agent result against acceptance criteria, file scope, blocker state, and command outcomes.",
      instructions:
        "Add deterministic verification and supervisor decisions. Accepted work should unlock the next task.",
      acceptanceCriteria: [
        "The verifier can return accepted, retry required, rollback required, or human review required.",
        "Forbidden files and scope expansion are flagged.",
        "Accepted runs advance the project to the next task.",
      ],
      allowedPaths: codePaths,
      forbiddenPaths: ["node_modules/**", ".next/**", "**/*.env*"],
    },
    {
      key: "review",
      milestoneKey: "prove-manual-loop",
      title: "Polish review surfaces for manual operation",
      objective:
        "Make the operator workflow usable end to end with clear review surfaces for diffs, commands, and decisions.",
      instructions:
        "Tighten the run detail presentation, decision summaries, and empty/error states without changing the underlying orchestration contract.",
      acceptanceCriteria: [
        "The run page surfaces prompt, result, verification, and next action clearly.",
        "The project overview shows progress and decision history.",
        "The app is understandable enough to use in a real Codex App or Antigravity trial.",
      ],
      allowedPaths: codePaths,
      forbiddenPaths: ["node_modules/**", ".next/**", "**/*.env*"],
    },
  ];
}

function buildMilestoneTwoBlueprints(codePaths: string[]): TaskBlueprint[] {
  return [
    {
      key: "provider-settings",
      milestoneKey: "automate-provider-loop",
      title: "Add provider settings and execution mode controls",
      objective:
        "Prepare the app to choose between manual mode and connected-provider mode with explicit provider settings.",
      instructions:
        "Add provider configuration surfaces, execution mode labels, and operator-facing guidance for moving from manual copy-paste runs toward connected automation.",
      acceptanceCriteria: [
        "The app can save provider configuration details for a project.",
        "The UI clearly distinguishes manual mode from connected mode.",
        "The next automation milestone is visible from the overview and task board.",
      ],
      allowedPaths: codePaths,
      forbiddenPaths: ["node_modules/**", ".next/**", "**/*.env*"],
    },
    {
      key: "dispatch",
      milestoneKey: "automate-provider-loop",
      title: "Implement provider dispatch scaffolding",
      objective:
        "Replace the copy-paste start step with a provider adapter contract that can dispatch a run automatically.",
      instructions:
        "Add provider adapter interfaces and a mock automatic dispatch path. Keep Codex and Antigravity provider logic abstracted behind the same interface.",
      acceptanceCriteria: [
        "The app has a provider-agnostic dispatch contract.",
        "A run can be started in automatic mode without manual prompt copying.",
        "Automatic-mode state is visible on the run page even if the provider is still mocked.",
      ],
      allowedPaths: codePaths,
      forbiddenPaths: ["node_modules/**", ".next/**", "**/*.env*"],
    },
    {
      key: "ingestion",
      milestoneKey: "automate-provider-loop",
      title: "Implement automatic result ingestion and polling",
      objective:
        "Allow automatic runs to collect provider output without the operator pasting JSON back into the app.",
      instructions:
        "Add polling or callback-ready run ingestion so the supervisor can update a run when the provider finishes.",
      acceptanceCriteria: [
        "Automatic runs no longer require manual result pasting.",
        "Provider run status can be refreshed from the app.",
        "Automatic result ingestion reuses the same verification contract as manual runs.",
      ],
      allowedPaths: codePaths,
      forbiddenPaths: ["node_modules/**", ".next/**", "**/*.env*"],
    },
    {
      key: "autopilot",
      milestoneKey: "automate-provider-loop",
      title: "Enable one-brief automatic supervised progression",
      objective:
        "Advance from the first project brief into automated task dispatch, verification, and next-task generation with minimal operator intervention.",
      instructions:
        "Connect the automatic provider path to the supervisor so accepted runs can trigger the next task without manual start steps.",
      acceptanceCriteria: [
        "The supervisor can start the next automatic task after an accepted run.",
        "The operator can still pause or review before a risky step.",
        "The app is ready for direct Codex or Antigravity automation from the initial product brief.",
      ],
      allowedPaths: codePaths,
      forbiddenPaths: ["node_modules/**", ".next/**", "**/*.env*"],
    },
  ];
}

export function buildMilestoneBlueprints(input: CreateProjectInput): MilestoneBlueprint[] {
  const basePaths = buildBasePaths(input.primaryPaths);
  const codePaths = uniqueStrings([...basePaths, "src/app/api/**", "data/**"]);

  return [
    {
      key: "prove-manual-loop",
      title: "First supervised build loop",
      goal:
        "Prove that one project brief can produce a bounded task, manual coding-agent handoff, verification result, and next task.",
      successCriteria: [
        "Project brief is captured and normalized.",
        "Task handoff prompt can be copied into a coding agent.",
        "Pasted agent results are verified and turned into a next action.",
      ],
      taskBlueprints: buildMilestoneOneBlueprints(codePaths),
    },
    {
      key: "automate-provider-loop",
      title: "Connected provider automation",
      goal:
        "Replace the manual copy-paste loop with provider dispatch, automatic result ingestion, and next-task progression driven from the original brief.",
      successCriteria: [
        "Provider settings and execution mode controls exist.",
        "Runs can dispatch automatically through a provider adapter.",
        "Accepted runs can advance to the next automatic task with minimal operator input.",
      ],
      taskBlueprints: buildMilestoneTwoBlueprints(codePaths),
    },
  ];
}

export function buildTaskBlueprints(input: CreateProjectInput): TaskBlueprint[] {
  return buildMilestoneBlueprints(input).flatMap((milestone) => milestone.taskBlueprints);
}

export function createMilestone(blueprint: MilestoneBlueprint): Milestone {
  return {
    id: crypto.randomUUID(),
    key: blueprint.key,
    title: blueprint.title,
    goal: blueprint.goal,
    status: "active",
    successCriteria: blueprint.successCriteria,
  };
}

export function instantiateTask(
  blueprint: TaskBlueprint,
  milestoneId: string,
  orderIndex: number,
): Task {
  return {
    id: crypto.randomUUID(),
    milestoneId,
    orderIndex,
    title: blueprint.title,
    objective: blueprint.objective,
    instructions: blueprint.instructions,
    acceptanceCriteria: blueprint.acceptanceCriteria,
    allowedPaths: blueprint.allowedPaths,
    forbiddenPaths: blueprint.forbiddenPaths,
    status: "ready",
    attemptCount: 0,
    createdAt: new Date().toISOString(),
  };
}

export function buildTaskPacket(task: Task, verificationCommands: VerificationCommand[]): TaskPacket {
  return {
    taskId: task.id,
    taskTitle: task.title,
    objective: task.objective,
    instructions: task.instructions,
    acceptanceCriteria: task.acceptanceCriteria,
    allowedPaths: task.allowedPaths,
    forbiddenPaths: task.forbiddenPaths,
    verificationCommands,
  };
}

export function buildProjectSlug(name: string) {
  return slugify(name) || `project-${Date.now()}`;
}
