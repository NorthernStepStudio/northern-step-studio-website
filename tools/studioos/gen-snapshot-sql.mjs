import fs from 'fs';

const snapshot = JSON.parse(fs.readFileSync('repo-snapshot.json', 'utf8'));
const jsonStr = JSON.stringify(snapshot).replace(/'/g, "''");

const sql = `INSERT INTO repo_snapshots (repo_name, branch, commit_hash, snapshot_data) VALUES ('northern-step-studio-website', 'main', 'local-seed', '${jsonStr}');`;

fs.writeFileSync('tools/studioos/seed-snapshot.sql', sql);
console.log("📝 SQL file generated.");
