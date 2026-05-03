#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

function run(command) {
  return execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function toLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

const trackedPatterns = [
  { label: "tracked temp chrome profile", regex: /^\.tmp-chrome-delete-account\//i },
  { label: "tracked test artifacts", regex: /^test-results\//i },
  { label: "tracked dev logs", regex: /(^|\/)(dev-server.*\.log|build_log\.txt|\.vite-dev\..*\.log)$/i },
  { label: "tracked scratch folder", regex: /^apps\/[^/]+\/scratch\//i },
  { label: "tracked mobile export cache", regex: /\.expo-export-smoke\//i },
  { label: "tracked gradle cache", regex: /\.gradle\//i },
  { label: "tracked codex scratch files", regex: /(^|\/)\.codex_.*\.txt$/i },
  { label: "tracked local backup dir", regex: /^_local_backup_apps\//i },
  { label: "tracked backup app dir", regex: /^apps\/.*backup\//i },
];

const untrackedPatterns = [
  { label: "untracked temp chrome profile", regex: /^\.tmp-chrome-delete-account\/?$/i },
  { label: "untracked test artifacts", regex: /^test-results\/?$/i },
  { label: "untracked dev logs", regex: /(^|\/)(dev-server.*\.log|build_log\.txt|\.vite-dev\..*\.log)$/i },
  { label: "untracked scratch folder", regex: /^apps\/[^/]+\/scratch\/?$/i },
  { label: "untracked mobile export cache", regex: /\.expo-export-smoke\/?$/i },
  { label: "untracked gradle cache", regex: /\.gradle\/?$/i },
  { label: "untracked codex scratch files", regex: /(^|\/)\.codex_.*\.txt$/i },
];

const trackedFiles = toLines(run("git ls-files")).filter((file) => existsSync(file));
const statusLines = toLines(run("git status --porcelain=v1"));
const untrackedPaths = statusLines
  .filter((line) => line.startsWith("?? "))
  .map((line) => line.slice(3).replace(/^"|"$/g, ""));

const failures = [];

for (const file of trackedFiles) {
  for (const rule of trackedPatterns) {
    if (rule.regex.test(file)) {
      failures.push(`[tracked] ${rule.label}: ${file}`);
      break;
    }
  }
}

for (const file of untrackedPaths) {
  for (const rule of untrackedPatterns) {
    if (rule.regex.test(file)) {
      failures.push(`[untracked] ${rule.label}: ${file}`);
      break;
    }
  }
}

if (failures.length > 0) {
  console.error("Workspace hygiene check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Workspace hygiene check passed.");
