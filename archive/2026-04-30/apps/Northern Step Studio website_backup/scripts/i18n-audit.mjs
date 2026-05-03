#!/usr/bin/env node
/**
 * i18n Audit Script
 * ─────────────────
 * Compares locale JSON files against en.json (source of truth).
 * Reports: missing keys, extra keys, mojibake/encoding damage, empty values.
 *
 * Usage:  node scripts/i18n-audit.mjs [--ci]
 *   --ci  exits with code 1 on any error (for CI pipelines)
 */

import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = join(__dirname, "..", "src", "react-app", "i18n", "locales");
const CI_MODE = process.argv.includes("--ci");

// Characters that indicate mojibake (UTF-8 bytes misread as Latin-1)
const MOJIBAKE_PATTERNS = [
  /\u00C3[\u0080-\u00BF]/g,       // UTF-8 2-byte sequences misread as Latin-1
  /\u00C2[\u00A9\u00AE\u2122]/g,  // Â before symbols like ©®™
  /\u00C3\u00A1/g,                // á damaged → Ã¡
  /\u00C3\u00A9/g,                // é damaged → Ã©
  /\u00C3\u00AD/g,                // í damaged → Ã­
  /\u00C3\u00B3/g,                // ó damaged → Ã³
  /\u00C3\u00BA/g,                // ú damaged → Ãº
  /\u00C3\u00B1/g,                // ñ damaged → Ã±
  /\u00C3\u00BC/g,                // ü damaged → Ã¼
  /\u00C2\s/g,                    // stray Â before space
  /\u00C2\u00A9/g,                // © damaged → Â©
];

// ─── Helpers ────────────────────────────────────────────────────────

function flattenKeys(obj, prefix = "") {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenKeys(value, fullKey));
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

function checkMojibake(flatObj, locale) {
  const issues = [];
  for (const [key, value] of Object.entries(flatObj)) {
    if (typeof value !== "string") continue;
    for (const pattern of MOJIBAKE_PATTERNS) {
      const matches = value.match(pattern);
      if (matches) {
        issues.push({ key, value, chars: matches.join(", ") });
        break; // one report per key is enough
      }
    }
  }
  return issues;
}

function checkEmpty(flatObj) {
  return Object.entries(flatObj)
    .filter(([, v]) => typeof v === "string" && v.trim() === "")
    .map(([key]) => key);
}

// ─── Main ───────────────────────────────────────────────────────────

const files = readdirSync(LOCALES_DIR).filter((f) => f.endsWith(".json"));
const locales = {};

for (const file of files) {
  const locale = file.replace(".json", "");
  const raw = readFileSync(join(LOCALES_DIR, file), "utf-8");
  locales[locale] = {
    raw,
    parsed: JSON.parse(raw),
    flat: flattenKeys(JSON.parse(raw)),
  };
}

if (!locales.en) {
  console.error("❌  en.json not found — cannot audit.");
  process.exit(1);
}

const enKeys = new Set(Object.keys(locales.en.flat));
let totalErrors = 0;
let totalWarnings = 0;

console.log("╔══════════════════════════════════════════════════════════╗");
console.log("║          i18n Translation Audit Report                  ║");
console.log("╚══════════════════════════════════════════════════════════╝\n");
console.log(`  Source of truth: en.json (${enKeys.size} keys)\n`);

for (const [locale, data] of Object.entries(locales)) {
  if (locale === "en") continue;
  
  const localeKeys = new Set(Object.keys(data.flat));
  const missing = [...enKeys].filter((k) => !localeKeys.has(k));
  const extra = [...localeKeys].filter((k) => !enKeys.has(k));
  const mojibake = checkMojibake(data.flat, locale);
  const empty = checkEmpty(data.flat);

  console.log(`── ${locale.toUpperCase()} ──────────────────────────────────────────`);
  console.log(`   Total keys: ${localeKeys.size}  |  EN keys: ${enKeys.size}`);

  if (missing.length) {
    totalErrors += missing.length;
    console.log(`\n   ❌ Missing keys (${missing.length}):`);
    missing.forEach((k) => console.log(`      - ${k}`));
  } else {
    console.log(`\n   ✅ No missing keys`);
  }

  if (extra.length) {
    totalWarnings += extra.length;
    console.log(`\n   ⚠️  Extra keys not in EN (${extra.length}):`);
    extra.forEach((k) => console.log(`      - ${k}`));
  }

  if (mojibake.length) {
    totalErrors += mojibake.length;
    console.log(`\n   ❌ Mojibake / encoding damage (${mojibake.length}):`);
    mojibake.forEach(({ key, chars }) =>
      console.log(`      - ${key}  →  damaged chars: ${chars}`)
    );
  } else {
    console.log(`   ✅ No encoding damage detected`);
  }

  if (empty.length) {
    totalWarnings += empty.length;
    console.log(`\n   ⚠️  Empty string values (${empty.length}):`);
    empty.forEach((k) => console.log(`      - ${k}`));
  }

  console.log();
}

// Check EN itself for mojibake
const enMojibake = checkMojibake(locales.en.flat, "en");
if (enMojibake.length) {
  totalErrors += enMojibake.length;
  console.log(`── EN (self-check) ──────────────────────────────────────`);
  console.log(`   ❌ Mojibake in source locale (${enMojibake.length}):`);
  enMojibake.forEach(({ key, chars }) =>
    console.log(`      - ${key}  →  damaged chars: ${chars}`)
  );
  console.log();
}

// Summary
console.log("═══════════════════════════════════════════════════════════");
console.log(`  Summary: ${totalErrors} error(s), ${totalWarnings} warning(s)`);
if (totalErrors === 0 && totalWarnings === 0) {
  console.log("  ✅ All locales are in good shape!");
}
console.log("═══════════════════════════════════════════════════════════\n");

if (CI_MODE && totalErrors > 0) {
  process.exit(1);
}
