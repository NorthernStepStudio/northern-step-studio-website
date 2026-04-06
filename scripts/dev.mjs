import { spawn, spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const nodeCmd = process.execPath;

function runBlocking(command, args, label) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: false,
  });

  if (result.error) {
    console.error(`[${label}] ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function startChild(label, command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: options.cwd ?? rootDir,
    env: { ...process.env, ...(options.env ?? {}) },
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`[${label}] ${chunk}`);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[${label}] ${chunk}`);
  });

  child.on("error", (error) => {
    console.error(`[${label}] ${error.message}`);
    shutdown(1);
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const status = signal ? `signal ${signal}` : `code ${code ?? 0}`;
    console.error(`[${label}] exited with ${status}`);
    shutdown(code ?? 1);
  });

  return child;
}

let shuttingDown = false;
const children = [];

function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of children) {
    try {
      child.kill();
    } catch {
      // Best-effort shutdown.
    }
  }

  setTimeout(() => process.exit(code), 250);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
process.on("exit", () => {
  shuttingDown = true;
});

console.log("NStepOS dev: starting backend compile, server, worker, and dashboard.");
console.log("Production and staging still run the server and worker as separate processes.");

runBlocking(npmCmd, ["run", "compile", "--workspace", "packages/nstep-os"], "compile");

children.push(
  startChild("nstep-os:watch", npmCmd, ["run", "watch", "--workspace", "packages/nstep-os"])
);
children.push(
  startChild("nstep-os:server", nodeCmd, ["--watch", "packages/nstep-os/out/server.js"])
);
children.push(
  startChild("nstep-os:worker", nodeCmd, ["--watch", "packages/nstep-os/out/worker.js"])
);
children.push(
  startChild("nstep-dashboard", npmCmd, ["run", "dev", "--workspace", "apps/nstep-dashboard"])
);
