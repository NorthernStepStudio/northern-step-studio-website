import fs from 'fs/promises';
import path from 'path';

/**
 * NStep StudioOS: Project Intelligence Seeder
 * Idempotently seeds core studio projects into the local D1 database.
 * 
 * Usage:
 * 1. Start your local Cloudflare Worker (npm run dev:worker)
 * 2. Run this script: node tools/studioos/seed-projects.mjs
 */

const API_ROOT = "http://127.0.0.1:8787/api/admin/studio";
const PROJECTS = [
  { name: "Northern Step Studio Website", status: "active", priority: "high", description: "The primary public-facing studio presence." },
  { name: "Studio Intelligence", status: "active", priority: "critical", description: "The private admin dashboard and operational core for NStep AI." },
  { name: "NStep AI", status: "active", priority: "high", description: "The broader product ecosystem for NStep automation and intelligence." },
  { name: "Matterhorn", status: "active", priority: "high", description: "The main NStep AI agent and operator." },
  { name: "Synox", status: "active", priority: "critical", description: "The core intelligence engine powering Matterhorn and Studio Intelligence." },
  { name: "NexusBuild", status: "active", priority: "high", description: "Dev and build orchestration platform." },
  { name: "ProvLy", status: "planning", priority: "medium", description: "PSA and CRM automation suite." },
  { name: "NeuroMoves", status: "active", priority: "high", description: "Pediatric motor therapy and education suite." },
  { name: "Doomed / Roguelike", status: "active", priority: "medium", description: "Tactical roguelike RPG game." },
  { name: "NStep Build Center", status: "active", priority: "medium", description: "Build and artifact management center." }
];

async function seed() {
  console.log("🌱 Seeding StudioOS projects...");

  try {
    // 1. Fetch existing projects to avoid duplicates
    const res = await fetch(`${API_ROOT}/projects`);
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error("Unauthorized. Ensure your local worker is running and you have admin access (or disable auth for seeding).");
      }
      throw new Error(`API Error: ${res.statusText}`);
    }
    const existing = await res.json();
    const existingNames = new Set(existing.map(p => p.name));

    // 2. Insert missing projects
    for (const project of PROJECTS) {
      if (existingNames.has(project.name)) {
        console.log(`⏭️  Skipping: ${project.name} (Already exists)`);
        continue;
      }

      console.log(`➕  Adding: ${project.name}`);
      const createRes = await fetch(`${API_ROOT}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project)
      });

      if (!createRes.ok) {
        console.error(`❌  Failed to add ${project.name}: ${createRes.statusText}`);
      }
    }

    console.log("✅  Seeding complete.");
  } catch (err) {
    console.error("❌  Seeding failed:", err.message);
    console.log("\nTIP: Make sure your local worker is running on port 8787 and auth is bypassable for local requests.");
  }
}

seed();
