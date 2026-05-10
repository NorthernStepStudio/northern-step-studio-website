import fs from 'fs';

const snapshot = JSON.parse(fs.readFileSync('repo-snapshot.latest.json', 'utf8'));

// Truncate apps to just first 5
snapshot.apps = snapshot.apps.slice(0, 5);
snapshot.todos = snapshot.todos.slice(0, 10);

const jsonStr = JSON.stringify(snapshot).replace(/'/g, "''");

const sql = `INSERT INTO repo_snapshots (repo_name, branch, commit_hash, snapshot_data) VALUES ('northern-step-studio-website', 'main', 'latest-refresh-truncated', '${jsonStr}');`;

fs.writeFileSync('tools/studioos/seed-latest-snapshot-small.sql', sql);
console.log("📝 SQL file generated: tools/studioos/seed-latest-snapshot-small.sql");
