#!/usr/bin/env node

import { existsSync, readdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const apply = process.argv.includes("--apply");

const cleanupTargets = [
  "test-results",
  ".tmp",
  ".tmp-chrome-delete-account",
  ".tmp-playwright-dashboard-audit",
  ".start-test.txt",
  ".vite-dev.err.log",
  ".vite-dev.out.log",
  "build_log.txt",
  "dev-server.err.log",
  "dev-server.out.log",
  "dev-server-4173.err.log",
  "dev-server-4173.out.log",
  "dev-server-4174.err.log",
  "dev-server-4174.out.log",
  "dev-server-4175.err.log",
  "dev-server-4175.out.log",
  "apps/nexusbuild/apps/mobile/.expo-export-smoke",
  "apps/nexusbuild/apps/mobile/.gradle",
  "apps/nexusbuild/apk_extract",
  "apps/nexusbuild/apps/mobile/eas_build_output.txt",
  "apps/nexusbuild/apps/mobile/expo_output.txt",
  "apps/nexusbuild/apps/mobile/npm_ls_output.txt",
  "apps/nexusbuild/apps/mobile/whoami.txt",
  "apps/nexusbuild/apps/backend-worker/tmp_chat_body.json",
  "apps/nexusbuild/apps/backend-worker/tmp_sync_body.json",
  "apps/NStep DevOS/data/dev-3001.err.log",
  "apps/NStep DevOS/data/dev-3001.out.log",
  "apps/neurormoves/android/build_log.txt",
  "apps/neurormoves/android/build_log_2.txt",
  "apps/Northern Step Studio website/tsconfig.worker.tsbuildinfo",
  "apps/nstep-dashboard/tsconfig.tsbuildinfo",
  "packages/nscore/out",
  "packages/nstep-os/out",
  "packages/nstep-os/.smoke-data-2",
  "packages/nstep-os/.smoke-data-3",
  "packages/nstep-os/.smoke-stage4",
  "packages/nstep-os/.tmp-provly-smoke",
  "packages/nstep-os/.tmp-provly-smoke-2",
  "tools/android-build-center-ui/tmp/scan-cache.json",
  "tsconfig.worker.tsbuildinfo",
  "b",
  "b-cxx",
  "build-artifacts",
  "dist",
];

const rootFilePatterns = [
  /^\.tmp.*\.(pid|log|json|png|cjs)$/i,
  /^build_(aab|apk|output|error|final).*\.(txt|log)$/i,
  /^eslint-(errors|report.*)\.json$/i,
];

const rootGeneratedFiles = readdirSync(process.cwd(), { withFileTypes: true })
  .filter((entry) => entry.isFile() && rootFilePatterns.some((regex) => regex.test(entry.name)))
  .map((entry) => entry.name);

const present = [...cleanupTargets, ...rootGeneratedFiles].filter((target) => existsSync(resolve(target)));

if (!apply) {
  console.log("Dry run. Add --apply to delete.");
  for (const target of present) {
    console.log(`- ${target}`);
  }
  process.exit(0);
}

for (const target of present) {
  try {
    rmSync(resolve(target), { recursive: true, force: true });
    console.log(`deleted ${target}`);
  } catch (error) {
    console.error(`failed ${target}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log("Workspace hygiene clean run complete.");
