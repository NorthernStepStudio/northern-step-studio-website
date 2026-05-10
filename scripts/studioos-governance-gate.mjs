#!/usr/bin/env node

import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const DEFAULT_RISK_POLICY = "studioos/validation/risk-policy.json";
const DEFAULT_VERIFY_PROFILE = "studioos/validation/verification-profile.json";
const DEFAULT_APPROVAL_DIR = "studioos/validation/approvals";
const DEFAULT_READINESS_DIR = "docs/deployments/readiness";

const RISK_ORDER = ["low", "medium", "high", "critical"];

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

function toPosix(input) {
  return input.replace(/\\/g, "/");
}

function safeExec(command) {
  try {
    const output = execSync(command, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { ok: true, output: output.trim() };
  } catch (error) {
    const stdout = error?.stdout ? String(error.stdout) : "";
    const stderr = error?.stderr ? String(error.stderr) : "";
    return {
      ok: false,
      output: `${stdout}\n${stderr}`.trim(),
      code: typeof error?.status === "number" ? error.status : 1,
    };
  }
}

function runChecked(command, timeoutMs = 900000) {
  const startedAt = Date.now();
  try {
    const output = execSync(command, {
      cwd: ROOT,
      encoding: "utf8",
      timeout: timeoutMs,
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 50 * 1024 * 1024,
    });
    const durationMs = Date.now() - startedAt;
    return {
      ok: true,
      command,
      durationMs,
      outputTail: tail(output, 80),
    };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const stdout = error?.stdout ? String(error.stdout) : "";
    const stderr = error?.stderr ? String(error.stderr) : "";
    return {
      ok: false,
      command,
      durationMs,
      code: typeof error?.status === "number" ? error.status : 1,
      outputTail: tail(`${stdout}\n${stderr}`, 120),
    };
  }
}

function tail(text, maxLines) {
  return String(text)
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(-maxLines)
    .join("\n");
}

function ensureDir(relativeDir) {
  const target = path.resolve(ROOT, relativeDir);
  if (!existsSync(target)) {
    mkdirSync(target, { recursive: true });
  }
}

function parseLines(text) {
  return String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function uniqueSorted(items) {
  return [...new Set(items)].sort((a, b) => a.localeCompare(b));
}

function loadJson(relativePath) {
  const absolute = path.resolve(ROOT, relativePath);
  if (!existsSync(absolute)) {
    throw new Error(`Missing JSON file: ${relativePath}`);
  }
  const raw = readFileSync(absolute, "utf8");
  return JSON.parse(raw);
}

function riskRank(risk) {
  const rank = RISK_ORDER.indexOf(risk);
  return rank === -1 ? 0 : rank;
}

function globToRegExp(glob) {
  const marker = "__DOUBLE_STAR__";
  const escaped = glob
    .replace(/\*\*/g, marker)
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, "[^/]*")
    .replace(/\?/g, ".")
    .replace(new RegExp(marker, "g"), ".*");
  return new RegExp(`^${escaped}$`);
}

function pathMatches(file, pattern) {
  const normalized = toPosix(file);
  const regex = globToRegExp(toPosix(pattern));
  return regex.test(normalized);
}

function collectWorkingTreeChanges() {
  const unstaged = parseLines(safeExec("git diff --name-only --diff-filter=ACMRD").output || "");
  const staged = parseLines(safeExec("git diff --name-only --cached --diff-filter=ACMRD").output || "");
  const untracked = parseLines(safeExec("git ls-files --others --exclude-standard").output || "");
  return uniqueSorted([...unstaged, ...staged, ...untracked]);
}

function collectRangeChanges(diffRange) {
  const command = `git diff --name-only --diff-filter=ACMRD ${diffRange}`;
  const result = safeExec(command);
  if (!result.ok) {
    throw new Error(`Failed to collect diff range "${diffRange}": ${result.output}`);
  }
  return uniqueSorted(parseLines(result.output));
}

function collectGitState() {
  const branch = safeExec("git rev-parse --abbrev-ref HEAD").output || "unknown";
  const head = safeExec("git rev-parse HEAD").output || "unknown";
  const status = safeExec("git status --porcelain=v1");
  const remote = safeExec("git remote get-url origin");
  const upstream = safeExec("git rev-parse --abbrev-ref --symbolic-full-name @{u}");

  return {
    branch,
    head,
    remote: remote.ok ? remote.output : null,
    upstream: upstream.ok ? upstream.output : null,
    dirty: parseLines(status.output).length > 0,
    statusLines: parseLines(status.output),
  };
}

function classifyRisk(changedFiles, policy) {
  let overall = policy.defaultRisk || "low";
  const matches = [];
  for (const file of changedFiles) {
    for (const rule of policy.rules || []) {
      if (pathMatches(file, rule.pattern)) {
        matches.push({
          file,
          pattern: rule.pattern,
          risk: rule.risk,
          reason: rule.reason || "",
        });
        if (riskRank(rule.risk) > riskRank(overall)) {
          overall = rule.risk;
        }
      }
    }
  }

  return {
    overall,
    matches,
  };
}

function requiredForRisk(configRisk, currentRisk) {
  return riskRank(currentRisk) >= riskRank(configRisk);
}

function parseChecklistState(changeId, readinessDir, currentRisk, policy) {
  const checklistPath = path.resolve(ROOT, readinessDir, `${changeId}.md`);
  const required = requiredForRisk(policy.deploymentChecklistRequiredAtOrAbove, currentRisk);
  if (!existsSync(checklistPath)) {
    return {
      required,
      exists: false,
      path: toPosix(path.relative(ROOT, checklistPath)),
      checkedCount: 0,
      totalCount: 0,
      complete: false,
    };
  }

  const content = readFileSync(checklistPath, "utf8");
  const checkedCount = (content.match(/^\s*-\s*\[x\]/gim) || []).length;
  const uncheckedCount = (content.match(/^\s*-\s*\[\s\]/gim) || []).length;
  const totalCount = checkedCount + uncheckedCount;

  return {
    required,
    exists: true,
    path: toPosix(path.relative(ROOT, checklistPath)),
    checkedCount,
    totalCount,
    complete: uncheckedCount === 0 && totalCount > 0,
  };
}

function readApproval(changeId, currentRisk, policy, approvalDir) {
  const required = requiredForRisk(policy.approvalRequiredAtOrAbove, currentRisk);
  const approvalPath = path.resolve(ROOT, approvalDir, `${changeId}.json`);
  if (!existsSync(approvalPath)) {
    return {
      required,
      exists: false,
      valid: false,
      path: toPosix(path.relative(ROOT, approvalPath)),
      issues: required ? ["Missing approval file."] : [],
      data: null,
    };
  }

  let data = null;
  const issues = [];
  try {
    data = JSON.parse(readFileSync(approvalPath, "utf8"));
  } catch (error) {
    return {
      required,
      exists: true,
      valid: false,
      path: toPosix(path.relative(ROOT, approvalPath)),
      issues: [`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`],
      data: null,
    };
  }

  if (data.changeId !== changeId) {
    issues.push(`changeId mismatch: expected "${changeId}", got "${data.changeId ?? "missing"}".`);
  }
  if (!data.approvedBy) {
    issues.push("approvedBy is required.");
  }
  if (!data.approverRole) {
    issues.push("approverRole is required.");
  }
  if (!data.approvedAt || Number.isNaN(Date.parse(data.approvedAt))) {
    issues.push("approvedAt must be a valid ISO-8601 date.");
  }
  if (data.decision !== "approved") {
    issues.push(`decision must be "approved" (received "${data.decision ?? "missing"}").`);
  }

  return {
    required,
    exists: true,
    valid: issues.length === 0,
    path: toPosix(path.relative(ROOT, approvalPath)),
    issues,
    data,
  };
}

function computeHashes(files) {
  const results = [];
  for (const file of files) {
    const absolute = path.resolve(ROOT, file);
    if (!existsSync(absolute)) {
      results.push({ file, exists: false });
      continue;
    }
    try {
      const fileStat = statSync(absolute);
      if (!fileStat.isFile()) {
        results.push({ file, exists: true, skipped: "not-a-file" });
        continue;
      }
      if (fileStat.size > 2 * 1024 * 1024) {
        results.push({ file, exists: true, skipped: "file-too-large", size: fileStat.size });
        continue;
      }
      const bytes = readFileSync(absolute);
      const hash = createHash("sha256").update(bytes).digest("hex");
      results.push({ file, exists: true, size: fileStat.size, sha256: hash });
    } catch (error) {
      results.push({
        file,
        exists: true,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return results;
}

function writeArtifact(relativePath, data) {
  const absolute = path.resolve(ROOT, relativePath);
  ensureDir(path.dirname(relativePath));
  writeFileSync(absolute, data, "utf8");
}

function makeRunId(changeId, timestampIso) {
  const safeChangeId = String(changeId).replace(/[^A-Za-z0-9._-]/g, "_");
  const safeTime = timestampIso.replace(/[:.]/g, "-");
  return `${safeTime}_${safeChangeId}`;
}

function summarizeVerification(results) {
  const total = results.length;
  const failed = results.filter((item) => !item.ok).length;
  return {
    total,
    failed,
    passed: total - failed,
  };
}

function buildRollbackPlan(runId, changeId, snapshotPath, gitState, changedFiles) {
  const lines = [];
  lines.push(`# Rollback Plan: ${changeId}`);
  lines.push("");
  lines.push(`- Run ID: \`${runId}\``);
  lines.push(`- Snapshot: \`${snapshotPath}\``);
  lines.push(`- Branch: \`${gitState.branch}\``);
  lines.push(`- Head SHA: \`${gitState.head}\``);
  lines.push("");
  lines.push("## Safe Recovery Sequence");
  lines.push("");
  lines.push("1. Freeze deployments and announce rollback window.");
  lines.push(`2. Create a forensic branch: \`git switch -c recovery/${runId}\`.`);
  lines.push(`3. Confirm target commit before rollback: \`git show --stat ${gitState.head}\`.`);
  lines.push("4. Re-run governance verification in recovery branch.");
  lines.push("5. Roll forward with a fix if possible; roll back only after verification.");
  lines.push("");
  lines.push("## Candidate Files in Scope");
  lines.push("");
  if (changedFiles.length === 0) {
    lines.push("- none");
  } else {
    for (const file of changedFiles.slice(0, 200)) {
      lines.push(`- \`${file}\``);
    }
    if (changedFiles.length > 200) {
      lines.push(`- ... ${changedFiles.length - 200} additional files omitted`);
    }
  }
  lines.push("");
  lines.push("## Notes");
  lines.push("");
  lines.push("- This plan avoids destructive commands.");
  lines.push("- If rollback is needed, execute via reviewed pull request.");
  return lines.join("\n");
}

function buildReport({
  runId,
  changeId,
  nowIso,
  gitState,
  changedFiles,
  risk,
  approval,
  checklist,
  verification,
  violations,
  snapshotPath,
  auditPath,
  recoveryPath,
}) {
  const lines = [];
  lines.push(`# StudioOS Governance Report - ${changeId}`);
  lines.push("");
  lines.push(`- Run ID: \`${runId}\``);
  lines.push(`- Timestamp (UTC): \`${nowIso}\``);
  lines.push(`- Branch: \`${gitState.branch}\``);
  lines.push(`- Commit: \`${gitState.head}\``);
  lines.push(`- Risk Class: \`${risk.overall}\``);
  lines.push(`- Changed Files: \`${changedFiles.length}\``);
  lines.push("");
  lines.push("## Control Status");
  lines.push("");
  lines.push(`- Approval Required: \`${approval.required}\``);
  lines.push(`- Approval File: \`${approval.path}\``);
  lines.push(`- Approval Valid: \`${approval.valid}\``);
  lines.push(`- Deployment Checklist Required: \`${checklist.required}\``);
  lines.push(`- Deployment Checklist Complete: \`${checklist.complete}\``);
  lines.push("");
  lines.push("## Verification");
  lines.push("");
  if (verification.length === 0) {
    lines.push("- No verification commands executed.");
  } else {
    for (const step of verification) {
      lines.push(`- \`${step.command}\`: ${step.ok ? "PASS" : "FAIL"} (${step.durationMs}ms)`);
    }
  }
  lines.push("");
  lines.push("## Violations");
  lines.push("");
  if (violations.length === 0) {
    lines.push("- none");
  } else {
    for (const violation of violations) {
      lines.push(`- ${violation}`);
    }
  }
  lines.push("");
  lines.push("## Artifacts");
  lines.push("");
  lines.push(`- Snapshot: \`${snapshotPath}\``);
  lines.push(`- Audit: \`${auditPath}\``);
  lines.push(`- Recovery: \`${recoveryPath}\``);
  lines.push("");
  lines.push("## Risk Rule Matches");
  lines.push("");
  if (risk.matches.length === 0) {
    lines.push("- no explicit risk rules matched; default risk applied");
  } else {
    for (const match of risk.matches.slice(0, 200)) {
      lines.push(`- \`${match.file}\` -> \`${match.risk}\` via \`${match.pattern}\``);
    }
    if (risk.matches.length > 200) {
      lines.push(`- ... ${risk.matches.length - 200} additional matches omitted`);
    }
  }
  return lines.join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const changeId = args["change-id"];
  const diffRange = args["diff-range"] || null;
  const enforce = Boolean(args.enforce);
  const skipVerification = Boolean(args["skip-verification"]);

  if (!changeId) {
    console.error('Missing required argument: --change-id "<id>"');
    process.exit(1);
  }

  const riskPolicyPath = args["risk-policy"] || DEFAULT_RISK_POLICY;
  const verifyProfilePath = args["verify-profile"] || DEFAULT_VERIFY_PROFILE;
  const approvalDir = args["approval-dir"] || DEFAULT_APPROVAL_DIR;
  const readinessDir = args["readiness-dir"] || DEFAULT_READINESS_DIR;

  const nowIso = new Date().toISOString();
  const runId = makeRunId(changeId, nowIso);

  ensureDir("studioos/audits");
  ensureDir("studioos/reports");
  ensureDir("studioos/snapshots");
  ensureDir("studioos/recovery");
  ensureDir(approvalDir);
  ensureDir(readinessDir);

  const policy = loadJson(riskPolicyPath);
  const verifyProfile = loadJson(verifyProfilePath);

  const gitState = collectGitState();
  const changedFiles = diffRange ? collectRangeChanges(diffRange) : collectWorkingTreeChanges();
  const risk = classifyRisk(changedFiles, policy);

  const approval = readApproval(changeId, risk.overall, policy, approvalDir);
  const checklist = parseChecklistState(changeId, readinessDir, risk.overall, policy);

  const verificationResults = [];
  if (!skipVerification) {
    for (const step of verifyProfile.commands || []) {
      const minimumRisk = step.minimumRisk || "low";
      if (requiredForRisk(minimumRisk, risk.overall)) {
        verificationResults.push(runChecked(step.command, step.timeoutMs || 900000));
      }
    }
  }

  const violations = [];
  if (approval.required && !approval.valid) {
    if (!approval.exists) {
      violations.push(`Approval required for risk ${risk.overall} but file is missing (${approval.path}).`);
    }
    for (const issue of approval.issues) {
      violations.push(`Approval invalid: ${issue}`);
    }
  }

  if (checklist.required && !checklist.complete) {
    if (!checklist.exists) {
      violations.push(`Deployment readiness checklist required but missing (${checklist.path}).`);
    } else {
      violations.push(
        `Deployment readiness checklist incomplete (${checklist.checkedCount}/${checklist.totalCount} checked).`,
      );
    }
  }

  for (const verification of verificationResults) {
    if (!verification.ok) {
      violations.push(`Verification failed: ${verification.command}`);
    }
  }

  const hashEntries = computeHashes(changedFiles.slice(0, 500));
  const snapshotPayload = {
    runId,
    changeId,
    timestamp: nowIso,
    git: gitState,
    diffRange,
    changedFiles,
    risk,
    fileHashes: hashEntries,
  };

  const verificationSummary = summarizeVerification(verificationResults);
  const auditPayload = {
    runId,
    changeId,
    timestamp: nowIso,
    risk: risk.overall,
    control: {
      approvalRequired: approval.required,
      approvalValid: approval.valid,
      readinessRequired: checklist.required,
      readinessComplete: checklist.complete,
    },
    verificationSummary,
    verificationResults,
    violations,
  };

  const snapshotPath = `studioos/snapshots/${runId}.snapshot.json`;
  const auditPath = `studioos/audits/${runId}.audit.json`;
  const reportPath = `studioos/reports/${runId}.report.md`;
  const recoveryPath = `studioos/recovery/${runId}.rollback.md`;

  writeArtifact(snapshotPath, `${JSON.stringify(snapshotPayload, null, 2)}\n`);
  writeArtifact(auditPath, `${JSON.stringify(auditPayload, null, 2)}\n`);
  writeArtifact(
    recoveryPath,
    `${buildRollbackPlan(runId, changeId, snapshotPath, gitState, changedFiles)}\n`,
  );
  writeArtifact(
    reportPath,
    `${buildReport({
      runId,
      changeId,
      nowIso,
      gitState,
      changedFiles,
      risk,
      approval,
      checklist,
      verification: verificationResults,
      violations,
      snapshotPath,
      auditPath,
      recoveryPath,
    })}\n`,
  );

  const outcome = violations.length === 0 ? "PASS" : "FAIL";
  const summaryLine = [
    `Governance Gate ${outcome}`,
    `change=${changeId}`,
    `risk=${risk.overall}`,
    `files=${changedFiles.length}`,
    `verifications=${verificationSummary.passed}/${verificationSummary.total}`,
    `violations=${violations.length}`,
  ].join(" | ");

  console.log(summaryLine);
  console.log(`Report: ${reportPath}`);
  console.log(`Snapshot: ${snapshotPath}`);
  console.log(`Audit: ${auditPath}`);
  console.log(`Recovery: ${recoveryPath}`);

  if (enforce && violations.length > 0) {
    process.exit(1);
  }
}

main();
