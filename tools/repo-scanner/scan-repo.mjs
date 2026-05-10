import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * NStep StudioOS Repo Scanner
 * A local-only tool to generate repo snapshots for operational intelligence.
 * 
 * SECURITY RULES:
 * 1. NEVER read sensitive files (.env, keys, keystores).
 * 2. ONLY scan structure and non-sensitive config summaries.
 * 3. IGNORE massive folders (node_modules, .git).
 */

const IGNORED_FOLDERS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.expo',
  'dist',
  'build',
  'out',
  'target',
  'vendor',
  '.turbo',
  'build-artifacts',
  'archive'
]);

const SENSITIVE_FILES = [
  '.env',
  '.dev.vars',
  'keystore',
  '.jks',
  '.pem',
  '.key',
  'google-services.json',
  'credentials.json',
  'secret',
  'token'
];

async function isDirectory(path) {
  try {
    const stats = await fs.stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function scan(dir, rootDir, snapshot) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      if (IGNORED_FOLDERS.has(entry.name)) continue;
      
      // Basic structure tracking
      if (relativePath === 'apps' || relativePath === 'packages') {
        // Deep scan subdirectories as potential apps/packages
        const subEntries = await fs.readdir(fullPath, { withFileTypes: true });
        for (const sub of subEntries) {
          if (sub.isDirectory()) {
            const list = relativePath === 'apps' ? snapshot.apps : snapshot.packages;
            list.push({ name: sub.name, path: path.join(relativePath, sub.name) });
          }
        }
      }

      await scan(fullPath, rootDir, snapshot);
    } else {
      // Security Check: Skip sensitive files
      const isSensitive = SENSITIVE_FILES.some(f => entry.name.toLowerCase().includes(f));
      if (isSensitive) {
        snapshot.ignoredSecrets.push(relativePath);
        continue;
      }

      // Detection
      if (entry.name === 'package.json') {
        try {
          const content = JSON.parse(await fs.readFile(fullPath, 'utf8'));
          snapshot.packageJsonSummaries.push({
            path: relativePath,
            name: content.name,
            version: content.version,
            depCount: Object.keys(content.dependencies || {}).length,
            devDepCount: Object.keys(content.devDependencies || {}).length,
          });
        } catch {}
      }

      if (entry.name === 'wrangler.toml') {
        snapshot.cloudflareSummary.workers.push(relativePath);
      }

      if (entry.name.endsWith('.sql') && dir.includes('migrations')) {
        snapshot.migrationSummary.files.push(relativePath);
      }

      if (entry.name === 'AndroidManifest.xml' || entry.name.endsWith('.gradle')) {
        snapshot.androidBuildSummary.files.push(relativePath);
      }

      // TODO/FIXME detection (limited scan)
      if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) {
        try {
          const content = await fs.readFile(fullPath, 'utf8');
          const lines = content.split('\n');
          lines.forEach((line, i) => {
            if (line.includes('TODO:') || line.includes('FIXME:')) {
              snapshot.todos.push({
                file: relativePath,
                line: i + 1,
                text: line.trim().substring(0, 100)
              });
            }
          });
        } catch {}
      }
    }
  }
}

async function run() {
  const args = process.argv.slice(2);
  const repoPath = args[0] || process.cwd();
  const absoluteRepoPath = path.resolve(repoPath);
  const outPath = args.includes('--out') ? args[args.indexOf('--out') + 1] : 'repo-snapshot.json';

  console.log(`🚀 NStep StudioOS Repo Scanner starting...`);
  console.log(`📂 Scanning: ${absoluteRepoPath}`);

  const snapshot = {
    repoName: path.basename(absoluteRepoPath),
    scannedAt: new Date().toISOString(),
    rootPathLabel: path.basename(absoluteRepoPath),
    apps: [],
    packages: [],
    packageJsonSummaries: [],
    migrationSummary: { files: [] },
    cloudflareSummary: { workers: [] },
    androidBuildSummary: { files: [] },
    todos: [],
    risks: [],
    ignoredSecrets: [],
    scannerVersion: "0.1.0"
  };

  await scan(absoluteRepoPath, absoluteRepoPath, snapshot);

  // Simple risk detection
  if (snapshot.ignoredSecrets.length > 20) {
    snapshot.risks.push("Large number of potentially sensitive files detected in repo structure.");
  }
  if (snapshot.packageJsonSummaries.length === 0) {
    snapshot.risks.push("No package.json files found. This may not be a standard Node/JS repository.");
  }

  await fs.writeFile(outPath, JSON.stringify(snapshot, null, 2));
  console.log(`✅ Snapshot saved to: ${outPath}`);
  console.log(`📊 Found ${snapshot.apps.length} apps, ${snapshot.packages.length} packages, and ${snapshot.todos.length} TODOs.`);
}

run().catch(err => {
  console.error("❌ Scanner failed:", err);
  process.exit(1);
});
