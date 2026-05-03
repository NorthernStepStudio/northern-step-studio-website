#!/usr/bin/env node
/* eslint-disable no-console */

const { spawn, spawnSync } = require("node:child_process");
const { setTimeout: delay } = require("node:timers/promises");

const HOST = "127.0.0.1";
const PORT = 8787;
const BASE_URL = `http://${HOST}:${PORT}`;

const DEPRECATED_ROUTES = [
  "/missed-call-text-back",
  "/missed-call-text-back/demo",
  "/lead-recovery",
  "/response-automation",
  "/sms-automation",
  "/twilio-follow-up",
  "/local-service-automation",
];

const PUBLIC_HEALTH_ROUTES = [
  "/",
  "/about",
  "/apps",
  "/contact",
  "/services",
  "/workspace-ai",
  "/terms",
];

function toCmd(binary) {
  return process.platform === "win32" ? `${binary}.cmd` : binary;
}

function spawnCommand(binary, args) {
  if (process.platform === "win32") {
    return spawn([binary, ...args].join(" "), {
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
      shell: true,
    });
  }
  return spawn(toCmd(binary), args, {
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });
}

function stopChild(child) {
  if (!child || child.exitCode !== null) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }
  child.kill("SIGTERM");
}

async function waitForWorker(timeoutMs = 60000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${BASE_URL}/api/ping`);
      if (response.ok) {
        return;
      }
    } catch {
      // ignore while worker is starting
    }
    await delay(750);
  }
  throw new Error("Timed out waiting for local wrangler worker.");
}

async function fetchStatus(path) {
  const response = await fetch(`${BASE_URL}${path}`, {
    redirect: "manual",
  });
  return response.status;
}

async function run() {
  const worker = spawnCommand("npx", [
    "wrangler",
    "dev",
    "--local",
    "--ip",
    HOST,
    "--port",
    String(PORT),
    "--log-level",
    "error",
  ]);

  let logs = "";
  worker.stdout.on("data", (chunk) => {
    logs += chunk.toString();
  });
  worker.stderr.on("data", (chunk) => {
    logs += chunk.toString();
  });

  try {
    await waitForWorker();
    const failures = [];

    const homeStatus = await fetchStatus("/");
    if (homeStatus !== 200) {
      failures.push(`Homepage expected 200, got ${homeStatus}`);
    }

    for (const route of DEPRECATED_ROUTES) {
      const status = await fetchStatus(route);
      if (status !== 410 && status !== 301) {
        failures.push(`Deprecated route ${route} expected 410 or 301, got ${status}`);
      }
      if (status === 200 || status === 500) {
        failures.push(`Deprecated route ${route} returned forbidden status ${status}`);
      }
    }

    for (const route of PUBLIC_HEALTH_ROUTES) {
      const status = await fetchStatus(route);
      if (status === 500) {
        failures.push(`Public route ${route} returned 500`);
      }
    }

    if (failures.length > 0) {
      console.error("Route health guard failed:");
      for (const failure of failures) {
        console.error(`- ${failure}`);
      }
      console.error("Worker logs:");
      console.error(logs.trim() || "(no logs captured)");
      process.exitCode = 1;
      return;
    }

    console.log("Route health guard passed.");
  } finally {
    stopChild(worker);
  }
}

run().catch((error) => {
  console.error("Route health guard failed:", error);
  process.exit(1);
});
