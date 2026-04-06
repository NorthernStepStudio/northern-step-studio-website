import type { JobRecord, MemoryEntry, WorkflowDefinition } from "../../core/types.js";
export declare function createProvLyWorkflow(): WorkflowDefinition;
export declare function buildProvLyMemoryEntriesFromJob(job: JobRecord): MemoryEntry[];
