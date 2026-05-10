import { OperationalMemoryEntry, operationalMemoryService } from "@/lib/studioos/operational-memory-service";
import { formatDateTime } from "@/lib/dashboard/format";

export interface MemoryViewModel {
  entries: Array<{
    id: string;
    title: string;
    category: string;
    timestamp: string;
    summary: string;
    tags: string[];
  }>;
}

export function buildMemoryViewModel(memories: OperationalMemoryEntry[]): MemoryViewModel {
  return {
    entries: memories.map(m => ({
      id: m.id,
      title: m.title,
      category: m.category,
      timestamp: m.timestamp,
      summary: m.summary,
      tags: m.tags || []
    }))
  };
}

export async function loadMemoryViewModel(): Promise<MemoryViewModel> {
  const memories = await operationalMemoryService.getMemories();
  return buildMemoryViewModel(memories);
}
