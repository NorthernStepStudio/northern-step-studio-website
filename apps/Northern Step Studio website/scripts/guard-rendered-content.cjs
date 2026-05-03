#!/usr/bin/env node
/* eslint-disable no-console */

const { spawn, spawnSync } = require("node:child_process");
const { setTimeout: delay } = require("node:timers/promises");
const { chromium } = require("playwright");

const HOST = "127.0.0.1";
const PORT = 4173;
const BASE_URL = `http://${HOST}:${PORT}`;

const ROUTES_TO_CHECK = [
  "/",
  "/about",
  "/apps",
  "/contact",
  "/services",
  "/workspace-ai",
  "/terms",
];

const LEAK_PATTERNS = [
  /\bHOME\.[A-Z0-9_.]+\b/g,
  /\bMCTB_[A-Z0-9_]+\b/g,
  /\b[A-Z0-9_]+_PAGE\.[A-Z0-9_.]+\b/g,
  /\bportfolio_[a-z0-9_]+\b/gi,
  /\b[a-z]+(?:\.[a-z0-9_]+){2,}\b/g,
];

async function waitForServer(url, timeoutMs = 45000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status >= 200 && response.status < 500) {
        return;
      }
    } catch {
      // ignore while starting
    }
    await delay(500);
  }
  throw new Error(`Timed out waiting for preview server at ${url}`);
}

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

async function run() {
  const preview = spawnCommand("npm", [
    "run",
    "preview",
    "--",
    "--host",
    HOST,
    "--port",
    String(PORT),
    "--strictPort",
  ]);

  let previewLogs = "";
  preview.stdout.on("data", (chunk) => {
    previewLogs += chunk.toString();
  });
  preview.stderr.on("data", (chunk) => {
    previewLogs += chunk.toString();
  });

  try {
    await waitForServer(`${BASE_URL}/`);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const findings = [];

    for (const route of ROUTES_TO_CHECK) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle", timeout: 45000 });
      const text = (await page.locator("body").innerText()) || "";
      for (const pattern of LEAK_PATTERNS) {
        pattern.lastIndex = 0;
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
          findings.push({
            route,
            pattern: pattern.toString(),
            sample: matches[0],
          });
        }
      }
    }

    await browser.close();

    if (findings.length > 0) {
      console.error("Rendered translation leakage detected:");
      for (const finding of findings) {
        console.error(`- route=${finding.route} pattern=${finding.pattern} sample="${finding.sample}"`);
      }
      process.exitCode = 1;
      return;
    }

    console.log("Rendered content leakage guard passed.");
  } finally {
    stopChild(preview);
  }
}

run().catch((error) => {
  console.error("Rendered content guard failed:", error);
  process.exit(1);
});
