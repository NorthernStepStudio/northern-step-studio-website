import fs from 'fs/promises';
import path from 'path';

/**
 * NStep AI: Operational Memory Seeder
 */

const API_ROOT = "http://127.0.0.1:8787/api/admin/intelligence";

const MEMORY = [
  { key: "canonical_naming", value: "NStep AI ecosystem uses Synox (engine), Matterhorn (agent), and Studio Intelligence (dashboard).", category: "governance", scope: "general" },
  { key: "safety_boundary", value: "All intelligence modules are admin-only and gated by isUserAdmin checks.", category: "security", scope: "general" },
  { key: "matterhorn_role", value: "Matterhorn is advisory-only. It cannot execute code, run shell commands, or modify the repository directly.", category: "governance", scope: "general" },
  { key: "synox_role", value: "Synox is a reasoning and context engine. It provides grounded analysis based on studio data.", category: "governance", scope: "general" },
  { key: "deployment_safety", value: "Cloudflare Workers deployments must be handled manually or via verified CI/CD. AI cannot deploy.", category: "security", scope: "general" },
  { key: "no_direct_mutation", value: "Matterhorn is prohibited from modifying repository files. It must suggest code changes for human review.", category: "security", scope: "general" },
  { key: "secret_storage_rule", value: "Do not store secrets, credentials, or .env contents in operational memory or context docs.", category: "security", scope: "general" },
  { key: "build_center_scope", value: "NStep Build Center is the source of truth for build artifacts and logs. Studio Intelligence consumes this data.", category: "infrastructure", scope: "general" },
  { key: "repo_snapshot_scope", value: "Repo snapshots are static data representations for reasoning. They do not grant write access.", category: "infrastructure", scope: "general" },
  { key: "dashboard_privacy", value: "Studio Intelligence is a private, internal-only dashboard for Northern Step Studio management.", category: "governance", scope: "general" }
];

async function seed() {
  console.log("🌱 Seeding Operational Memory...");

  try {
    const res = await fetch(`${API_ROOT}/memory`);
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    const existing = await res.json();
    const existingKeys = new Set(existing.map(m => m.key));

    for (const item of MEMORY) {
      if (existingKeys.has(item.key)) {
        console.log(`⏭️  Skipping: ${item.key} (Already exists)`);
        continue;
      }

      console.log(`➕  Adding: ${item.key}`);
      const createRes = await fetch(`${API_ROOT}/memory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });

      if (!createRes.ok) {
        console.error(`❌  Failed to add ${item.key}: ${createRes.statusText}`);
      }
    }

    console.log("✅  Seeding complete.");
  } catch (err) {
    console.error("❌  Seeding failed:", err.message);
  }
}

seed();
