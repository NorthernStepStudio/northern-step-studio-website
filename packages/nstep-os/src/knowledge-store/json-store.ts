import path from "node:path";
import type { KnowledgeChunk, KnowledgeStore } from "../core/types.js";
import { ensureDirectory, readJsonFile, writeJsonFile } from "../core/persistence.js";
import { searchKnowledgeChunks } from "../knowledge/index.js";

export interface JsonKnowledgeStoreOptions {
  readonly dataDir: string;
  readonly fileName?: string;
}

export async function createJsonKnowledgeStore(options: JsonKnowledgeStoreOptions): Promise<KnowledgeStore> {
  const filePath = path.join(options.dataDir, options.fileName ?? "knowledge_chunks.json");
  await ensureDirectory(options.dataDir);

  const load = async () => readJsonFile<readonly KnowledgeChunk[]>(filePath, []);

  return {
    async load() {
      return load();
    },
    async get(id) {
      const entries = await load();
      return entries.find((entry) => entry.id === id);
    },
    async save(entries) {
      await writeJsonFile(filePath, entries);
    },
    async list() {
      return load();
    },
    async upsert(entry) {
      const entries = await load();
      const index = entries.findIndex((item) => item.id === entry.id);
      const nextEntries = index >= 0 ? [...entries.slice(0, index), entry, ...entries.slice(index + 1)] : [...entries, entry];
      await writeJsonFile(filePath, nextEntries);
      return entry;
    },
    async search(query, limit = 5) {
      const entries = await load();
      return searchKnowledgeChunks(query, entries, limit);
    },
  };
}
