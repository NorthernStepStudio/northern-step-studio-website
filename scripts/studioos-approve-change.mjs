#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      continue;
    }
    const [rawKey, inlineValue] = arg.split("=");
    const key = rawKey.slice(2);
    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function ensureDir(relativeDir) {
  const absolute = path.resolve(ROOT, relativeDir);
  if (!existsSync(absolute)) {
    mkdirSync(absolute, { recursive: true });
  }
}

function normalizeCsvList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const changeId = args["change-id"];
  const approvedBy = args["approved-by"];
  const approverRole = args["role"] || "admin";
  const riskClass = args["risk"] || "high";
  const scope = normalizeCsvList(args.scope);
  const conditions = normalizeCsvList(args.conditions);
  const notes = args.notes || "";
  const decision = args.decision || "approved";
  const approvalDir = args["approval-dir"] || "studioos/validation/approvals";
  const force = Boolean(args.force);

  if (!changeId || !approvedBy) {
    console.error("Usage: node scripts/studioos-approve-change.mjs --change-id CHG-001 --approved-by <name>");
    process.exit(1);
  }

  ensureDir(approvalDir);

  const targetPath = path.resolve(ROOT, approvalDir, `${changeId}.json`);
  if (existsSync(targetPath) && !force) {
    console.error(`Approval file already exists: ${targetPath}`);
    console.error("Re-run with --force to overwrite.");
    process.exit(1);
  }

  const payload = {
    changeId,
    decision,
    riskClass,
    approvedBy,
    approverRole,
    approvedAt: new Date().toISOString(),
    scope,
    conditions,
    notes,
  };

  writeFileSync(targetPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  const echo = JSON.parse(readFileSync(targetPath, "utf8"));
  console.log(`Approval record written: ${path.relative(ROOT, targetPath)}`);
  console.log(`Decision: ${echo.decision}`);
}

main();
