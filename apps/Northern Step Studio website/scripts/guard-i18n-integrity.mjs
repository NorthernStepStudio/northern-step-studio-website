#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const projectRoot = join(__dirname, "..");
const localeRoot = join(projectRoot, "src", "react-app", "i18n", "locales");
const sourceRoot = join(projectRoot, "src", "react-app");

const localeFiles = ["en.json", "es.json", "it.json"];

function flattenKeys(obj, prefix = "") {
  const output = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(output, flattenKeys(value, fullKey));
      continue;
    }
    output[fullKey] = value;
  }
  return output;
}

function walkFiles(rootPath, files = []) {
  for (const entry of readdirSync(rootPath)) {
    const fullPath = join(rootPath, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === "dist" || entry === ".wrangler") {
        continue;
      }
      walkFiles(fullPath, files);
      continue;
    }

    if (!stat.isFile()) {
      continue;
    }

    if (!/\.(ts|tsx)$/.test(entry)) {
      continue;
    }

    const relativePath = relative(projectRoot, fullPath).replace(/\\/g, "/");
    if (relativePath.includes("/pages/admin/")) {
      continue;
    }

    files.push(relativePath);
  }

  return files;
}

const locales = {};
for (const file of localeFiles) {
  const locale = file.replace(".json", "");
  locales[locale] = JSON.parse(readFileSync(join(localeRoot, file), "utf-8"));
}

const enFlat = flattenKeys(locales.en);
const enKeySet = new Set(Object.keys(enFlat));
const namespaceSet = new Set(Object.keys(locales.en));

const filesToCheck = walkFiles(sourceRoot);
const requiredKeys = new Set();
const keyRegexes = [
  /\bt\(\s*["'`]([^"'`]+)["'`]/g,
  /["'`]([a-z][a-z0-9_]*(?:\.[a-z0-9_]+){1,})["'`]/g,
];

for (const file of filesToCheck) {
  const content = readFileSync(join(projectRoot, file), "utf-8");
  for (const regex of keyRegexes) {
    regex.lastIndex = 0;
    let match = regex.exec(content);
    while (match) {
      const candidate = match[1].trim();
      if (candidate.includes("://")) {
        match = regex.exec(content);
        continue;
      }
      if (candidate.includes("${")) {
        match = regex.exec(content);
        continue;
      }

      const namespace = candidate.split(".")[0];
      if (!namespaceSet.has(namespace)) {
        match = regex.exec(content);
        continue;
      }

      requiredKeys.add(candidate);
      match = regex.exec(content);
    }
  }
}

const missingInEn = [...requiredKeys].filter((key) => !enKeySet.has(key)).sort();
if (missingInEn.length > 0) {
  console.error("Missing translation keys in en.json:");
  for (const key of missingInEn) {
    console.error(`- ${key}`);
  }
  process.exit(1);
}

const localeWarnings = [];
for (const locale of ["es", "it"]) {
  const flat = flattenKeys(locales[locale]);
  const keySet = new Set(Object.keys(flat));
  const missing = [...requiredKeys].filter((key) => !keySet.has(key));
  if (missing.length > 0) {
    localeWarnings.push({ locale, missingCount: missing.length });
  }
}

if (localeWarnings.length > 0) {
  console.warn("Locale fallback warnings (resolved by English fallback merge):");
  for (const warning of localeWarnings) {
    console.warn(`- ${warning.locale}: ${warning.missingCount} keys fallback to en`);
  }
}

console.log(`i18n integrity guard passed. Checked ${requiredKeys.size} keys from public source files.`);
