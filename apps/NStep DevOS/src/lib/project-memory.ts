import { Project, Task } from "@/lib/types";
import { compactText } from "@/lib/utils";

export type ProjectMemoryItem = {
  title: string;
  detail: string;
  timestamp?: string;
};

export type ProjectOperationalMemory = {
  taskHistory: ProjectMemoryItem[];
  projectHistory: ProjectMemoryItem[];
  interventions: ProjectMemoryItem[];
};

function sortNewestFirst<T extends { updatedAt?: string; createdAt?: string }>(items: T[]) {
  return [...items].sort((left, right) =>
    (right.updatedAt ?? right.createdAt ?? "").localeCompare(
      left.updatedAt ?? left.createdAt ?? "",
    ),
  );
}

export function buildProjectOperationalMemory(
  project: Project,
  task: Task,
): ProjectOperationalMemory {
  const taskHistory = sortNewestFirst(
    project.runs.filter((run) => run.taskId === task.id && Boolean(run.parsedResult)),
  )
    .slice(0, 4)
    .map((run) => ({
      title: `Run ${run.attemptNumber} finished as ${run.status}`,
      detail: compactText(
        run.decision?.reason ??
          run.parsedResult?.summary ??
          "This run completed without a stored summary.",
        240,
      ),
      timestamp: run.updatedAt,
    }));

  const projectHistory = project.decisionLog
    .filter((entry) => entry.relatedTaskId === task.id || !entry.relatedTaskId)
    .slice(0, 6)
    .map((entry) => ({
      title: entry.title,
      detail: compactText(entry.detail, 220),
      timestamp: entry.createdAt,
    }));

  const interventions = project.interventionLog
    .filter((entry) => entry.taskId === task.id)
    .slice(0, 4)
    .map((entry) => ({
      title: entry.action.replaceAll("_", " "),
      detail: compactText(
        `${entry.summary}${entry.guidance ? ` Guidance: ${entry.guidance}` : ""}`,
        240,
      ),
      timestamp: entry.createdAt,
    }));

  return {
    taskHistory,
    projectHistory,
    interventions,
  };
}
