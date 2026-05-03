import { readFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const buildMetaPath = path.join(projectRoot, "build-meta.json");

function getArg(name, fallback = "") {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return fallback;
  }
  return process.argv[index + 1] ?? fallback;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const baseUrl = getArg("--base-url", "https://northernstepstudio.com").replace(/\/+$/, "");
const canonicalUrl = getArg("--canonical-url", "https://northernstepstudio.com").replace(/\/+$/, "");
const wwwUrl = getArg("--www-url", "https://www.northernstepstudio.com").replace(/\/+$/, "");
const waitMs = Number(getArg("--wait-ms", "0")) || 0;
const retries = Number(getArg("--retries", "1")) || 1;
const retryDelayMs = Number(getArg("--retry-delay-ms", "5000")) || 5000;
const buildMeta = JSON.parse(await readFile(buildMetaPath, "utf8"));

if (waitMs > 0) {
  await new Promise((resolve) => setTimeout(resolve, waitMs));
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  return response;
}

function header(response, name) {
  return response.headers.get(name);
}

async function fetchText(url, options = {}) {
  const response = await request(url, options);
  const body = await response.text();
  return { response, body };
}

async function runChecks() {
  const healthResponse = await request(`${baseUrl}/api/health`, {
    headers: { accept: "application/json" },
  });
  assert(healthResponse.ok, `/api/health returned ${healthResponse.status}`);
  const health = await healthResponse.json();
  assert(health.build?.buildId === buildMeta.buildId, `Expected health build ${buildMeta.buildId}, got ${health.build?.buildId ?? "missing"}`);

  const home = await fetchText(`${baseUrl}/`, {
    headers: {
      accept: "text/html",
      "sec-fetch-mode": "navigate",
    },
  });
  assert(home.response.ok, `/ returned ${home.response.status}`);
  assert(header(home.response, "x-nss-build") === buildMeta.buildId, `Expected home X-NSS-Build ${buildMeta.buildId}, got ${header(home.response, "x-nss-build") ?? "missing"}`);
  assert((header(home.response, "cache-control") || "").includes("no-store"), `Expected no-store HTML caching, got ${header(home.response, "cache-control") ?? "missing"}`);

  const assetMatch = home.body.match(/(?:src|href)="(\/assets\/[^"]+)"/);
  assert(assetMatch, "Could not find a built asset reference in home HTML");
  const assetUrl = `${baseUrl}${assetMatch[1]}`;
  const assetResponse = await request(assetUrl, {
    headers: {
      accept: "*/*",
    },
  });
  assert(assetResponse.ok, `${assetMatch[1]} returned ${assetResponse.status}`);
  assert((header(assetResponse, "cache-control") || "").includes("immutable"), `Expected immutable asset caching, got ${header(assetResponse, "cache-control") ?? "missing"}`);

  const spaRoute = await request(`${baseUrl}/community`, {
    headers: {
      accept: "text/html",
      "sec-fetch-mode": "navigate",
    },
  });
  assert(spaRoute.ok, `/community returned ${spaRoute.status}`);
  assert((header(spaRoute, "content-type") || "").includes("text/html"), `/community returned ${header(spaRoute, "content-type") ?? "unknown content-type"}`);

  const missingAsset = await request(`${baseUrl}/assets/does-not-exist.js`, {
    headers: {
      accept: "*/*",
    },
  });
  assert(missingAsset.status === 404, `Missing asset returned ${missingAsset.status} instead of 404`);

  const wwwResponse = await request(`${wwwUrl}/`, {
    redirect: "manual",
    headers: {
      accept: "text/html",
      "sec-fetch-mode": "navigate",
    },
  });
  assert(wwwResponse.status >= 300 && wwwResponse.status < 400, `www returned ${wwwResponse.status} instead of redirect`);
  assert((header(wwwResponse, "location") || "").startsWith(`${canonicalUrl}/`), `www redirected to ${header(wwwResponse, "location") ?? "missing location"} instead of ${canonicalUrl}/...`);

  return {
    status: "ok",
    baseUrl,
    buildId: buildMeta.buildId,
    asset: assetMatch[1],
  };
}

let lastError;
for (let attempt = 1; attempt <= retries; attempt += 1) {
  try {
    const result = await runChecks();
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    lastError = error;
    if (attempt === retries) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
  }
}

throw lastError;
