import { PatternMemorySuggestion, Project, Task, TaskRun } from "@/lib/types";
import { buildProjectOperationalMemory } from "@/lib/project-memory";
import { compactText } from "@/lib/utils";
import { getExecutionModeLabel, getProviderLabel, getTaskStageLabel } from "@/lib/utils";

export function buildResultTemplate(project: Project, task: Task, run: TaskRun) {
  return JSON.stringify(
    {
      schemaVersion: "1.0",
      runId: run.id,
      taskId: task.id,
      taskTitle: task.title,
      provider: run.provider,
      providerRunId: "optional-provider-run-id",
      status: "succeeded",
      summary: "Describe exactly what changed for this task.",
      completionState: {
        objectiveAddressed: true,
        acceptanceCriteriaStatus: task.acceptanceCriteria.map((criterion) => ({
          criterion,
          status: "met",
          note: "",
        })),
      },
      changedFiles: [
        {
          path: task.allowedPaths[0] ?? "src/app/example.tsx",
          changeType: "modified",
          summary: "Explain the concrete implementation change.",
        },
      ],
      commands: project.verificationCommands.map((command) => ({
        key: command.key,
        command: command.command,
        cwd: command.cwd,
        status: "not_run",
      })),
      rawOutputText: "Optional short freeform note.",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    },
    null,
    2,
  );
}

function formatSuccessPatterns(suggestion: PatternMemorySuggestion) {
  if (suggestion.successPatterns.length === 0) {
    return "- No similar successful pattern has been recorded yet.";
  }

  return suggestion.successPatterns
    .map((memory) => {
      const files =
        memory.exampleFiles.length > 0 ? ` Example files: ${memory.exampleFiles.join(", ")}` : "";
      const confidence =
        memory.confidence !== undefined ? ` Confidence: ${Math.round(memory.confidence * 100)}%.` : "";

      return `- [${memory.pattern}] ${compactText(
        memory.successfulStrategy ?? "Follow the same working structure.",
        220,
      )}${files}${confidence}`;
    })
    .join("\n");
}

function formatFailurePatterns(suggestion: PatternMemorySuggestion) {
  if (suggestion.failurePatterns.length === 0) {
    return "- No similar failure pattern has been recorded yet.";
  }

  return suggestion.failurePatterns
    .map((memory) => {
      const error = memory.knownError
        ? `Known error: ${memory.knownError}. `
        : "";
      const fix = memory.recommendedFix
        ? `Recommended fix: ${memory.recommendedFix}`
        : memory.mistakeToAvoid ?? "Avoid repeating the previously flagged mistake.";

      return `- [${memory.pattern}] ${compactText(`${error}${fix}`, 220)}`;
    })
    .join("\n");
}

function formatRepoConventions(suggestion: PatternMemorySuggestion) {
  if (suggestion.repoConventions.length === 0) {
    return "- No stable repo convention has been inferred for this task yet.";
  }

  return suggestion.repoConventions.map((item) => `- ${item}`).join("\n");
}

function formatMemorySection(title: string, entries: Array<{ title: string; detail: string }>) {
  if (entries.length === 0) {
    return `${title}\n- No stored memory yet.`;
  }

  return `${title}\n${entries
    .map((entry) => `- ${entry.title}: ${entry.detail}`)
    .join("\n")}`;
}

export function buildMasterPrompt(
  project: Project,
  task: Task,
  run: TaskRun,
  suggestion: PatternMemorySuggestion = {
    successPatterns: [],
    failurePatterns: [],
    repoConventions: [],
  },
) {
  const providerLabel = getProviderLabel(run.provider);
  const executionModeLabel = getExecutionModeLabel(run.executionMode);
  const stepLabel = getTaskStageLabel(project, task);
  const milestone = project.milestones.find((item) => item.id === task.milestoneId);
  const acceptanceCriteria = task.acceptanceCriteria
    .map((criterion) => `- ${criterion}`)
    .join("\n");
  const allowedPaths = task.allowedPaths.map((path) => `- ${path}`).join("\n");
  const forbiddenPaths = task.forbiddenPaths.map((path) => `- ${path}`).join("\n");
  const verificationCommands = project.verificationCommands
    .map((command) => `- key=${command.key} | command=${command.command}`)
    .join("\n");
  const successPatterns = formatSuccessPatterns(suggestion);
  const failurePatterns = formatFailurePatterns(suggestion);
  const repoConventions = formatRepoConventions(suggestion);
  const supervisorGuidance = task.supervisorGuidance?.trim();
  const projectMemory = buildProjectOperationalMemory(project, task);
  const taskHistory = formatMemorySection("Recent task history:", projectMemory.taskHistory);
  const projectHistory = formatMemorySection(
    "Recent project decisions:",
    projectMemory.projectHistory,
  );
  const interventionHistory = formatMemorySection(
    "Recent interventions:",
    projectMemory.interventions,
  );

  return `You are executing exactly one bounded software task for NSS DevOS.

Return only valid JSON matching the required result schema. Do not return markdown. Do not add commentary outside the JSON object.

Execution mode: ${executionModeLabel}
Provider target: ${providerLabel}

TASK_CONTEXT
run_id: ${run.id}
step_label: ${stepLabel}
provider: ${run.provider}
project_name: ${project.name}
project_slug: ${project.slug}
repo_root: ${project.repoPath}
worktree_path: ${project.repoPath}
branch: ${project.defaultBranch}
base_commit_sha: manual-semi-run

MILESTONE
milestone_id: ${milestone?.id ?? "milestone-1"}
milestone_title: ${milestone?.title ?? "Current supervised build stage"}
milestone_goal: ${milestone?.goal ?? ""}

TASK
task_id: ${task.id}
task_title: ${task.title}
task_step: ${stepLabel}
objective: ${task.objective}
instructions: ${task.instructions}

ACCEPTANCE_CRITERIA
${acceptanceCriteria}

ALLOWED_PATHS
${allowedPaths}

FORBIDDEN_PATHS
${forbiddenPaths}

VERIFICATION_COMMANDS
${verificationCommands || "- none provided"}

SUPERVISOR_GUIDANCE
${supervisorGuidance ? supervisorGuidance : "- No extra supervisor correction note is active for this task."}

PROJECT_OPERATIONAL_MEMORY
This is durable NSS memory from previous runs, decisions, and interventions. Use it when fixing or extending the current task, but stay inside the current task boundary.
${taskHistory}

${projectHistory}

${interventionHistory}

ENGINEERING_MEMORY
Use this only as bounded implementation context. Do not broaden scope beyond the current task.
Relevant previous solutions:
${successPatterns}

Known failure patterns:
${failurePatterns}

Repo conventions:
${repoConventions}

RULES
1. Only work on this task.
2. Do not change files outside ALLOWED_PATHS.
3. Do not change any file in FORBIDDEN_PATHS.
4. Do not broaden scope beyond the objective and acceptance criteria.
5. The supervisor now checks the actual repo path after your run. Your changedFiles list must match the files that really changed.
6. Do not claim success if any acceptance criterion is unmet.
7. If blocked by missing information or a hard constraint, stop and return status="blocked" with a blocker object.
8. If you run commands, report them exactly.
9. If you do not run commands, mark them as "not_run".
10. changedFiles must include every changed file and no unchanged files.
11. summary must be specific and match the actual file changes.
12. Return only this JSON shape:

${run.expectedResultTemplate}

If and only if execution is blocked, add this optional blocker object at the top level:
{
  "blocker": {
    "type": "missing_context | verification_failure | scope_conflict | repo_error | command_error | unknown",
    "title": "string",
    "description": "string",
    "requestedDecision": "string",
    "retryable": false,
    "relatedPaths": ["string optional"]
  }
}`;
}
