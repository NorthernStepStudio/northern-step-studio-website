import {
  AgentExecutionResult,
  EngineeringMemoryRecord,
  LocalRepoCheck,
  PatternMemorySuggestion,
  Task,
  VerificationResult,
} from "@/lib/types";
import {
  buildEngineeringMemories,
  getRelevantEngineeringMemories,
  upsertEngineeringMemories,
} from "@/lib/engineering-memory";
import { uniqueStrings } from "@/lib/utils";

type MemoryContext = {
  projectId: string;
  task: Task;
  runId: string;
  result: AgentExecutionResult;
  verification: VerificationResult;
  localRepoCheck?: LocalRepoCheck;
};

export function recordSuccessPattern(context: MemoryContext) {
  return buildEngineeringMemories(context).filter((item) => item.memoryType === "success");
}

export function recordFailurePattern(context: MemoryContext) {
  return buildEngineeringMemories(context).filter((item) => item.memoryType === "mistake");
}

export function mergePatternMemory(
  existing: EngineeringMemoryRecord[],
  incoming: EngineeringMemoryRecord[],
) {
  return upsertEngineeringMemories(existing, incoming);
}

export function findSimilarPatterns(
  memories: EngineeringMemoryRecord[],
  task: Task,
  limit = 6,
) {
  return getRelevantEngineeringMemories(memories, task, limit);
}

export function suggestStrategy(
  memories: EngineeringMemoryRecord[],
  task: Task,
): PatternMemorySuggestion {
  const similarPatterns = findSimilarPatterns(memories, task, 6);
  const successPatterns = similarPatterns.filter((item) => item.memoryType === "success");
  const failurePatterns = similarPatterns.filter((item) => item.memoryType === "mistake");
  const repoConventions = uniqueStrings(
    similarPatterns.flatMap((item) => item.repoConventions ?? []),
  );

  return {
    successPatterns,
    failurePatterns,
    repoConventions,
  };
}
