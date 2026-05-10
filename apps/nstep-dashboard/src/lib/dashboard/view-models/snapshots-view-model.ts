import { promises as fs } from "node:fs";
import path from "node:path";

export type SnapshotStatus = "valid" | "stale" | "offline" | "unknown" | "pending_verification";

export interface SnapshotViewModelEntry {
  id: string;
  at: string;
  status: SnapshotStatus;
  size: string;
  origin: string;
}

const SNAPSHOT_ROOT = path.join(process.cwd(), "studioos", "snapshots");

function classifySnapshotStatus(updatedAt: Date): SnapshotStatus {
  const ageMs = Date.now() - updatedAt.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const oneWeekMs = 7 * oneDayMs;

  if (ageMs <= oneDayMs) {
    return "valid";
  }
  if (ageMs <= oneWeekMs) {
    return "stale";
  }
  return "pending_verification";
}

function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "Unknown";
  }
  if (bytes < 1024) {
    return `${bytes}B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)}KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

async function collectSnapshotDirs(root: string): Promise<string[]> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const directories = entries.filter((entry) => entry.isDirectory()).map((entry) => path.join(root, entry.name));

  const nestedDirs: string[] = [];
  for (const directory of directories) {
    const nested = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of nested) {
      if (entry.isDirectory()) {
        nestedDirs.push(path.join(directory, entry.name));
      }
    }
  }

  return nestedDirs;
}

export async function loadSnapshotsViewModel(): Promise<SnapshotViewModelEntry[]> {
  try {
    const snapshotDirs = await collectSnapshotDirs(SNAPSHOT_ROOT);
    const snapshots = await Promise.all(
      snapshotDirs.map(async (snapshotPath) => {
        const stats = await fs.stat(snapshotPath);
        const id = path.relative(SNAPSHOT_ROOT, snapshotPath).replace(/\\/g, "/");
        return {
          id,
          at: stats.mtime.toISOString(),
          status: classifySnapshotStatus(stats.mtime),
          size: formatSize(stats.size),
          origin: "Filesystem",
        } satisfies SnapshotViewModelEntry;
      }),
    );

    if (snapshots.length === 0) {
      return [
        {
          id: "snapshot-registry",
          at: new Date().toISOString(),
          status: "pending_verification",
          size: "Unknown",
          origin: "Not yet connected",
        },
      ];
    }

    return snapshots.sort((a, b) => b.at.localeCompare(a.at));
  } catch {
    return [
      {
        id: "snapshot-registry",
        at: new Date().toISOString(),
        status: "offline",
        size: "Unknown",
        origin: "Offline",
      },
    ];
  }
}
