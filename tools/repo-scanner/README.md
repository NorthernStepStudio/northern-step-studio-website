# NStep StudioOS Repo Scanner

This tool generates a metadata snapshot of a repository for use with **StudioOS Operational Intelligence**.

## Purpose
The NStep StudioOS dashboard (hosted on Cloudflare) cannot see your local files. This tool bridges that gap by creating a safe, non-sensitive JSON summary of your repo that you can upload to the dashboard.

## Usage
Run this tool locally from your terminal.

```bash
node tools/repo-scanner/scan-repo.mjs <repo-path> --out snapshot.json
```

## Security & Privacy
- **No Secrets**: This tool explicitly ignores `.env`, `.dev.vars`, private keys, keystores, and other sensitive files.
- **Structural Only**: It mainly scans file names, directory structures, and summarized configuration (e.g., package names and versions).
- **Code Scan**: It only reads source files to detect `TODO` and `FIXME` comments.

## Snapshot Schema
```typescript
interface RepoSnapshot {
  repoName: string;
  scannedAt: string;
  rootPathLabel: string;
  apps: Array<{ name: string; path: string }>;
  packages: Array<{ name: string; path: string }>;
  packageJsonSummaries: Array<{
    path: string;
    name: string;
    version: string;
    depCount: number;
    devDepCount: number;
  }>;
  migrationSummary: { files: string[] };
  cloudflareSummary: { workers: string[] };
  androidBuildSummary: { files: string[] };
  todos: Array<{ file: string; line: number; text: string }>;
  risks: string[];
  ignoredSecrets: string[];
  scannerVersion: string;
}
```
