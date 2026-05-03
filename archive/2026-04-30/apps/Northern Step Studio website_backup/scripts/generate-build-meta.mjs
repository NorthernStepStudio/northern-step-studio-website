import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const projectRoot = process.cwd();
const packageJsonPath = path.join(projectRoot, "package.json");
const buildMetaJsonPath = path.join(projectRoot, "build-meta.json");
const buildMetaTsPath = path.join(projectRoot, "src", "shared", "build-meta.ts");

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function runGit(args, fallback = "") {
  try {
    return execFileSync("git", args, {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return fallback;
  }
}

function escapeString(value) {
  return JSON.stringify(value);
}

const packageJson = await readJson(packageJsonPath);
const gitRoot = runGit(["rev-parse", "--show-toplevel"], projectRoot);
const repoRelativeProjectPath = path.relative(gitRoot, projectRoot).replace(/\\/g, "/") || ".";
const gitSha = runGit(["rev-parse", "HEAD"], "unknown");
const gitShortSha = runGit(["rev-parse", "--short", "HEAD"], "unknown");
const gitBranch = runGit(["rev-parse", "--abbrev-ref", "HEAD"], "unknown");
const gitCommittedAt = runGit(["show", "-s", "--format=%cI", "HEAD"], new Date().toISOString());
const gitDirty = runGit(["status", "--porcelain", "--untracked-files=no", "--", repoRelativeProjectPath], "") !== "";
const builtAt = gitCommittedAt;
const buildId = `${packageJson.version}-${gitShortSha}${gitDirty ? "-dirty" : ""}`;

const buildMeta = {
  version: packageJson.version,
  buildId,
  builtAt,
  gitSha,
  gitShortSha,
  gitBranch,
  gitDirty,
};

const buildMetaTs = `export const BUILD_META = {
  version: ${escapeString(buildMeta.version)},
  buildId: ${escapeString(buildMeta.buildId)},
  builtAt: ${escapeString(buildMeta.builtAt)},
  gitSha: ${escapeString(buildMeta.gitSha)},
  gitShortSha: ${escapeString(buildMeta.gitShortSha)},
  gitBranch: ${escapeString(buildMeta.gitBranch)},
  gitDirty: ${buildMeta.gitDirty},
} as const;

export type BuildMeta = typeof BUILD_META;
`;

await mkdir(path.dirname(buildMetaTsPath), { recursive: true });
await writeFile(buildMetaJsonPath, `${JSON.stringify(buildMeta, null, 2)}\n`, "utf8");
await writeFile(buildMetaTsPath, buildMetaTs, "utf8");
