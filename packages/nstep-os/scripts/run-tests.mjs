import { readdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(process.cwd(), "out", "test");
const files = await collectTestFiles(root);

if (files.length === 0) {
  console.error(`No compiled test files found under ${root}.`);
  process.exit(1);
}

const result = spawnSync(process.execPath, ["--test", ...files], {
  cwd: process.cwd(),
  stdio: "inherit",
  shell: false,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);

async function collectTestFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectTestFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".test.js")) {
      files.push(fullPath);
    }
  }

  return files;
}
