#!/usr/bin/env node

import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const apply = process.argv.includes("--apply");

const cleanupTargets = [
  "test-results",
  ".tmp-chrome-delete-account",
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
  "apps/nexusbuild/apps/mobile/eas_build_output.txt",
  "apps/nexusbuild/apps/mobile/expo_output.txt",
  "apps/nexusbuild/apps/mobile/whoami.txt",
  "apps/nexusbuild/apps/backend-worker/tmp_chat_body.json",
  "apps/nexusbuild/apps/backend-worker/tmp_sync_body.json",
];

const present = cleanupTargets.filter((target) => existsSync(resolve(target)));

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
