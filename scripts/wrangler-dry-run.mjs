import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { sanitizeDist } from "./sanitize-dist.mjs";

const distDir = path.resolve("dist");
const rootWranglerConfig = path.resolve("wrangler.json");

function findGeneratedWranglerConfig(rootDir) {
  const entries = readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      const candidate = path.join(fullPath, "wrangler.json");

      try {
        if (statSync(candidate).isFile()) {
          return candidate;
        }
      } catch {
        continue;
      }
    }
  }

  throw new Error("Could not find generated wrangler.json under dist");
}

let configPath;

try {
  configPath = findGeneratedWranglerConfig(distDir);
} catch {
  configPath = rootWranglerConfig;
}

const command =
  process.platform === "win32"
    ? `npx wrangler deploy --dry-run --config "${configPath}"`
    : `npx wrangler deploy --dry-run --config '${configPath}'`;

let result;
try {
  result = spawnSync(command, {
    stdio: "inherit",
    shell: true,
  });
} finally {
  await sanitizeDist(distDir);
}

if (result?.error) {
  throw result.error;
}

process.exit(result?.status ?? 1);
