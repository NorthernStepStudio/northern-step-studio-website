import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
export async function ensureDirectory(dirPath) {
    await mkdir(dirPath, { recursive: true });
}
export async function readJsonFile(filePath, fallback) {
    try {
        const raw = await readFile(filePath, "utf8");
        if (!raw.trim()) {
            return fallback;
        }
        return JSON.parse(raw);
    }
    catch (error) {
        if (isFileNotFound(error)) {
            return fallback;
        }
        throw error;
    }
}
export async function writeJsonFile(filePath, value) {
    await ensureDirectory(path.dirname(filePath));
    const tmpPath = `${filePath}.tmp`;
    await writeFile(tmpPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    await rename(tmpPath, filePath);
}
export function isFileNotFound(error) {
    return Boolean(error && typeof error === "object" && "code" in error && error.code === "ENOENT");
}
//# sourceMappingURL=persistence.js.map