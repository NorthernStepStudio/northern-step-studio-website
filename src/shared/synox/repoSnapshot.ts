export interface RepoSnapshot {
  repoName: string;
  scannedAt: string;
  rootPathLabel: string;
  apps: Array<{
    name: string;
    path: string;
  }>;
  packages: Array<{
    name: string;
    path: string;
  }>;
  packageJsonSummaries: Array<{
    path: string;
    name: string;
    version: string;
    depCount: number;
    devDepCount: number;
  }>;
  migrationSummary: {
    files: string[];
  };
  cloudflareSummary: {
    workers: string[];
  };
  androidBuildSummary: {
    files: string[];
  };
  todos: Array<{
    file: string;
    line: number;
    text: string;
  }>;
  risks: string[];
  ignoredSecrets: string[];
  scannerVersion: string;
}

export interface RepoSnapshotMetadata {
  id: number;
  repo_name: string;
  branch?: string;
  commit_hash?: string;
  created_at: string;
}
