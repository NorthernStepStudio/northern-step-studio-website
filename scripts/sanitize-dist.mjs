import { readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const blockedNames = new Set([
  '.dev.vars',
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
  '.env.test',
]);

async function sanitizeDirectory(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      await sanitizeDirectory(fullPath);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (blockedNames.has(entry.name) || entry.name.startsWith('.env.')) {
      await rm(fullPath, { force: true });
    }
  }
}

export async function sanitizeDist(rootDir = path.resolve('dist')) {
  await sanitizeDirectory(rootDir);
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await sanitizeDist();
}
