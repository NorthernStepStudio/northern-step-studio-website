import { spawn } from "node:child_process";
import path from "node:path";
import { promises as fs } from "node:fs";

import { CommandReport, VerificationCommand, WorkspaceIssue } from "@/lib/types";

const COMMAND_TIMEOUT_MS = 180_000;
const MAX_OUTPUT_BYTES = 24_000;
const STANDARD_NODE_ENVS = new Set(["development", "production", "test"]);

function trimOutput(value: string | undefined) {
  if (!value) {
    return "";
  }

  return value.length > MAX_OUTPUT_BYTES ? `${value.slice(0, MAX_OUTPUT_BYTES)}...` : value;
}

async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function buildCommandEnv(commandKey: string): NodeJS.ProcessEnv {
  const env: Record<string, string | undefined> = { ...process.env };

  if (env.NODE_ENV && !STANDARD_NODE_ENVS.has(env.NODE_ENV)) {
    env.NODE_ENV = undefined;
  }

  if (commandKey.toLowerCase() === "build") {
    env.NODE_ENV = "production";
  } else if (commandKey.toLowerCase() === "test") {
    env.NODE_ENV ??= "test";
  }

  return env as NodeJS.ProcessEnv;
}

export async function runVerificationCommand(
  repoPath: string,
  command: VerificationCommand,
): Promise<{ report: CommandReport; issue?: WorkspaceIssue }> {
  const cwd = path.resolve(repoPath, command.cwd ?? ".");

  if (!(await pathExists(cwd))) {
    return {
      report: {
        key: command.key,
        command: command.command,
        cwd: command.cwd,
        status: "not_run",
        stderrText: `Could not find command working directory: ${cwd}`,
      },
      issue: {
        severity: "warning",
        message: `Local command checks were skipped because the working directory ${cwd} does not exist.`,
      },
    };
  }

  return new Promise((resolve) => {
    const startedAt = Date.now();
    const shellBinary = process.platform === "win32" ? "cmd.exe" : "sh";
    const shellArgs =
      process.platform === "win32"
        ? ["/d", "/s", "/c", command.command]
        : ["-lc", command.command];
    const child = spawn(shellBinary, shellArgs, {
      cwd,
      env: buildCommandEnv(command.key),
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let didTimeout = false;

    const timer = setTimeout(() => {
      didTimeout = true;
      child.kill("SIGTERM");
    }, COMMAND_TIMEOUT_MS);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({
        report: {
          key: command.key,
          command: command.command,
          cwd: command.cwd,
          status: "not_run",
          durationMs: Date.now() - startedAt,
          stderrText: trimOutput(error.message),
        },
        issue: {
          severity: "warning",
          message: `Local command checks were unavailable for "${command.label}": ${error.message}`,
        },
      });
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        report: {
          key: command.key,
          command: command.command,
          cwd: command.cwd,
          status: didTimeout ? "failed" : code === 0 ? "passed" : "failed",
          exitCode: code ?? undefined,
          durationMs: Date.now() - startedAt,
          stdoutText: trimOutput(stdout),
          stderrText: trimOutput(
            didTimeout
              ? `${stderr}\nCommand timed out after ${COMMAND_TIMEOUT_MS / 1000} seconds.`
              : stderr,
          ),
        },
      });
    });
  });
}

export async function runAllVerificationCommands(
  repoPath: string,
  commands: VerificationCommand[],
): Promise<{ reports: CommandReport[]; issues: WorkspaceIssue[] }> {
  const reports: CommandReport[] = [];
  const issues: WorkspaceIssue[] = [];

  for (const command of commands) {
    const result = await runVerificationCommand(repoPath, command);
    reports.push(result.report);

    if (result.issue) {
      issues.push(result.issue);
    }
  }

  return { reports, issues };
}
