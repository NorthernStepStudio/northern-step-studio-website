const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');

const run = (command, args) => {
  const result =
    process.platform === 'win32'
      ? spawnSync('cmd.exe', ['/d', '/s', '/c', `${command} ${args.join(' ')}`], {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        })
      : spawnSync(command, args, {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const message = (result.stderr || result.stdout || '').trim();
    throw new Error(message || `${command} ${args.join(' ')} failed`);
  }

  return result.stdout;
};

const NPX_BIN = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const sanitizeVersion = (value) => {
  const cleaned = String(value || '').trim();
  if (!cleaned) return 'unknown';
  return cleaned.replace(/[^0-9A-Za-z._-]/g, '_');
};

const getLatestProductionAndroidBuild = () => {
  const raw = run(NPX_BIN, [
    'eas',
    'build:list',
    '--platform',
    'android',
    '--status',
    'finished',
    '--distribution',
    'store',
    '--build-profile',
    'production',
    '--limit',
    '1',
    '--json',
    '--non-interactive',
  ]);

  const builds = JSON.parse(raw);
  if (!Array.isArray(builds) || builds.length === 0) {
    throw new Error('No finished Android production builds were found on EAS.');
  }

  return builds[0];
};

const download = async (url, destination) => {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download AAB: ${response.status} ${response.statusText}`);
  }

  await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(destination));
};

const main = async () => {
  const latestBuild = getLatestProductionAndroidBuild();
  const artifactUrl =
    latestBuild?.artifacts?.applicationArchiveUrl || latestBuild?.artifacts?.buildUrl;

  if (!artifactUrl) {
    throw new Error('Latest build does not include an artifact URL.');
  }

  const urlPath = new URL(artifactUrl).pathname;
  const ext = path.extname(urlPath) || '.aab';
  const appVersion = sanitizeVersion(latestBuild.appVersion);
  const fileName = `NexusBuild_v${appVersion}${ext}`;
  const outDir = path.join(__dirname, '..', 'dist', 'releases');
  const outPath = path.join(outDir, fileName);

  fs.mkdirSync(outDir, { recursive: true });

  console.log(`Downloading latest AAB (${latestBuild.id})...`);
  await download(artifactUrl, outPath);

  console.log(`Saved: ${outPath}`);
  console.log(`Source build: ${latestBuild.id}`);
};

main().catch((error) => {
  console.error(error.message || String(error));
  process.exit(1);
});
