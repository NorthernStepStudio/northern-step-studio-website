import { execSync } from 'child_process';
import fs from 'fs';

const snapshot = JSON.parse(fs.readFileSync('repo-snapshot.json', 'utf8'));
const jsonStr = JSON.stringify(snapshot).replace(/'/g, "''"); // Escape single quotes for SQL

const insertCmd = `npx wrangler d1 execute northern-step-studio-website --local --command "INSERT INTO repo_snapshots (repo_name, branch, commit_hash, snapshot_data) VALUES ('northern-step-studio-website', 'main', 'local-seed', '${jsonStr}')"`;

console.log("🌱 Seeding repo snapshot via D1...");
try {
  execSync(insertCmd);
  console.log("✅ Snapshot seeded.");
} catch (e) {
  console.error("❌ Seeding failed:", e.message);
}
