import { ProtectedFileState } from "./governance-contracts";

const PROTECTED_PATHS = [
  "wrangler.toml",
  ".dev.vars",
  "src/lib/auth.ts",
  "apps/nstep-dashboard/.env.local",
  "tools/android-build-center-ui/src/config/settings.js",
  "firebase.json",
  "supabase/config.toml"
];

export class ProtectedFileMonitor {
  async getProtectedFiles(): Promise<ProtectedFileState[]> {
    // In a real implementation, we would check file stats/hashes.
    // We simulate "intact" for most, and maybe one "modified" if we want to show drift.
    
    return PROTECTED_PATHS.map(path => ({
      path,
      lastModified: new Date().toISOString(),
      status: "intact",
      checksum: "sha256-placeholder"
    }));
  }

  async detectDrift(): Promise<ProtectedFileState[]> {
    const files = await this.getProtectedFiles();
    // Simulate drift on wrangler.toml
    return files.map(f => {
      if (f.path === "wrangler.toml") {
        return { ...f, status: "modified", lastModified: new Date(Date.now() - 3600000).toISOString() };
      }
      return f;
    });
  }
}

export const protectedFileMonitor = new ProtectedFileMonitor();
