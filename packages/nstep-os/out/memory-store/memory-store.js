import path from "node:path";
import { ensureDirectory, readJsonFile, writeJsonFile } from "../core/persistence.js";
export async function createJsonMemoryStore(options) {
    const filePath = path.join(options.dataDir, options.fileName ?? "memory.json");
    await ensureDirectory(options.dataDir);
    const load = async () => readJsonFile(filePath, []);
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
    };
}
//# sourceMappingURL=memory-store.js.map