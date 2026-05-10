import { execSync } from 'child_process';

const PROJECTS = [
  { uuid: 'p1', name: "Northern Step Studio Website", status: "active", priority: "high", description: "The primary public-facing studio presence." },
  { uuid: 'p2', name: "Studio Intelligence", status: "active", priority: "critical", description: "The private admin dashboard and operational core for NStep AI." },
  { uuid: 'p3', name: "NStep AI", status: "active", priority: "high", description: "The broader product ecosystem for NStep automation and intelligence." },
  { uuid: 'p4', name: "Matterhorn", status: "active", priority: "high", description: "The main NStep AI agent and operator." },
  { uuid: 'p5', name: "Synox", status: "active", priority: "critical", description: "The core intelligence engine powering Matterhorn and Studio Intelligence." },
  { uuid: 'p6', name: "NexusBuild", status: "active", priority: "high", description: "Dev and build orchestration platform." },
  { uuid: 'p7', name: "ProvLy", status: "planning", priority: "medium", description: "PSA and CRM automation suite." },
  { uuid: 'p8', name: "NeuroMoves", status: "active", priority: "high", description: "Pediatric motor therapy and education suite." },
  { uuid: 'p9', name: "Doomed / Roguelike", status: "active", priority: "medium", description: "Tactical roguelike RPG game." },
  { uuid: 'p10', name: "NStep Build Center", status: "active", priority: "medium", description: "Build and artifact management center." }
];

console.log("🌱 Seeding projects via D1...");

for (const p of PROJECTS) {
  const checkCmd = `npx wrangler d1 execute northern-step-studio-website --local --command "SELECT id FROM projects WHERE name = '${p.name}'"`;
  try {
    const output = execSync(checkCmd).toString();
    if (output.includes('id')) {
      console.log(`⏭️  Skipping: ${p.name}`);
      continue;
    }
  } catch (e) {}

  console.log(`➕  Adding: ${p.name}`);
  const insertCmd = `npx wrangler d1 execute northern-step-studio-website --local --command "INSERT INTO projects (uuid, name, status, priority, description) VALUES ('${p.uuid}', '${p.name}', '${p.status}', '${p.priority}', '${p.description}')"`;
  execSync(insertCmd);
}

console.log("✅ Done.");
