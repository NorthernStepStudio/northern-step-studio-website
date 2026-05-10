#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
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

function main() {
  const args = parseArgs(process.argv.slice(2));
  const changeId = args["change-id"];
  const owner = args.owner || "unassigned";
  const pathRoot = args["readiness-dir"] || "docs/deployments/readiness";
  const force = Boolean(args.force);

  if (!changeId) {
    console.error("Usage: node scripts/studioos-create-readiness.mjs --change-id CHG-001 [--owner person]");
    process.exit(1);
  }

  ensureDir(pathRoot);

  const target = path.resolve(ROOT, pathRoot, `${changeId}.md`);
  if (existsSync(target) && !force) {
    console.error(`Readiness checklist already exists: ${target}`);
    console.error("Re-run with --force to overwrite.");
    process.exit(1);
  }

  const nowIso = new Date().toISOString();
  const template = [
    `# Deployment Readiness - ${changeId}`,
    "",
    `- Owner: ${owner}`,
    `- Created: ${nowIso}`,
    "",
    "## Governance",
    "",
    "- [ ] Snapshot captured before modification",
    "- [ ] Risk classification recorded",
    "- [ ] Approval present (if required by risk class)",
    "",
    "## Verification",
    "",
    "- [ ] Hygiene check passed",
    "- [ ] Build/check pipeline passed",
    "- [ ] Test suite passed (if required by risk class)",
    "",
    "## Recovery",
    "",
    "- [ ] Rollback plan generated and reviewed",
    "- [ ] Recovery owner acknowledged",
    "",
    "## Deployment Controls",
    "",
    "- [ ] Environment variables reviewed",
    "- [ ] Migration safety verified",
    "- [ ] Monitoring/alerts prepared",
    "",
    "## Approval",
    "",
    "- [ ] Final go/no-go decision recorded",
    "- [ ] Post-deploy verification owner assigned",
    "",
  ].join("\n");

  writeFileSync(target, template, "utf8");
  console.log(`Readiness checklist written: ${path.relative(ROOT, target)}`);
}

main();
