export interface OperationalMemoryEntry {
  id: string;
  category: "advisory" | "decision" | "approval" | "finding" | "pattern" | "relationship";
  timestamp: string;
  title: string;
  summary: string;
  context: Record<string, unknown>;
  tags: string[];
}

class OperationalMemoryService {
  private memories: OperationalMemoryEntry[] = [
    {
      id: "mem-3",
      category: "pattern",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      title: "Shared Dependency Fragility",
      summary: "Detected high risk correlation between Synox Bridge stability and website lead intake reliability.",
      context: { patternId: "pat-001", affectedSystems: ["synox", "website"] },
      tags: ["intelligence", "risk", "synox"]
    },
    {
      id: "mem-1",
      category: "decision",
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      title: "Delayed Synox Update",
      summary: "Decided to delay synox-engine update until NeuroMoves build stability is confirmed.",
      context: { decisionMaker: "Admin", linkedIncident: "inc-002" },
      tags: ["synox", "neurormoves", "priority"]
    },
    {
      id: "mem-2",
      category: "finding",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      title: "Registry Drift Pattern",
      summary: "Observed recurring drift in AppRegistry when manual builds are injected without Synox token.",
      context: { observation: "High correlation between manual injection and integrity warnings." },
      tags: ["governance", "integrity"]
    }
  ];

  async getMemories(): Promise<OperationalMemoryEntry[]> {
    return [...this.memories].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  async addMemory(entry: Omit<OperationalMemoryEntry, "id" | "timestamp">): Promise<OperationalMemoryEntry> {
    const newEntry: OperationalMemoryEntry = {
      ...entry,
      // Non-cryptographic ID for local in-memory entries only.
      id: `mem-${Math.random().toString(36).slice(2, 11)}`,
      timestamp: new Date().toISOString()
    };
    this.memories.push(newEntry);
    return newEntry;
  }
}

export const operationalMemoryService = new OperationalMemoryService();
