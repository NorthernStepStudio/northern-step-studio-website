#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const projectRoot = join(__dirname, "..");

const TARGETS = [
  "src/react-app",
  "src/worker",
  "src/shared",
  "public",
];

const ALLOWED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".sql",
  ".html",
  ".xml",
  ".txt",
  ".svg",
]);

const FORBIDDEN_PATTERNS = [
  { label: "missed-call-text-back", regex: /missed-call-text-back/gi },
  { label: "MCTB", regex: /\bmctb\b/gi },
  { label: "home.portfolio_lead", regex: /home\.portfolio_lead/gi },
  { label: "mctb_page", regex: /mctb_page/gi },
  { label: "lead recovery", regex: /lead recovery/gi },
  { label: "response automation", regex: /response automation/gi },
];

const ALLOWLIST = [
  {
    fileSuffix: "src/worker/index.ts",
    regex: /missed-call-text-back/i,
  },
];

function walkFiles(directory, files = []) {
  const fullDirectory = join(projectRoot, directory);
  for (const entry of readdirSync(fullDirectory)) {
    if (entry === "node_modules" || entry === "dist" || entry === ".wrangler") {
      continue;
    }

    const fullPath = join(fullDirectory, entry);
    const relativePath = relative(projectRoot, fullPath);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      walkFiles(relativePath, files);
      continue;
    }

    if (stat.isFile() && ALLOWED_EXTENSIONS.has(extname(entry))) {
      files.push(relativePath);
    }
  }

  return files;
}

function lineNumberAt(content, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (content[i] === "\n") {
      line += 1;
    }
  }
  return line;
}

const filesToScan = TARGETS.flatMap((target) => walkFiles(target));
const findings = [];

for (const file of filesToScan) {
  const fullPath = join(projectRoot, file);
  const content = readFileSync(fullPath, "utf-8");

  for (const pattern of FORBIDDEN_PATTERNS) {
    pattern.regex.lastIndex = 0;
    let match = pattern.regex.exec(content);
    while (match) {
      const allowlisted = ALLOWLIST.some(
        (entry) => file.replace(/\\/g, "/").endsWith(entry.fileSuffix) && entry.regex.test(match[0]),
      );
      if (allowlisted) {
        match = pattern.regex.exec(content);
        continue;
      }

      findings.push({
        file,
        line: lineNumberAt(content, match.index),
        label: pattern.label,
        snippet: match[0],
      });
      match = pattern.regex.exec(content);
    }
  }
}

if (findings.length > 0) {
  console.error("Forbidden production content detected:");
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} [${finding.label}] "${finding.snippet}"`);
  }
  process.exit(1);
}

console.log("Forbidden content guard passed.");
