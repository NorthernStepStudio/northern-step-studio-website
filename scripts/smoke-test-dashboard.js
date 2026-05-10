#!/usr/bin/env node
const http = require('http');
const https = require('https');
const { URL } = require('url');

const BASE = process.env.BASE_URL || 'http://localhost:3000';

const ROUTES = [
  '/',
  '/dashboard',
  '/dashboard/apps',
  '/dashboard/apps/nexusbuild',
  '/dashboard/governance',
  '/dashboard/verification',
  '/dashboard/risk-register',
  '/dashboard/snapshots',
  '/dashboard/incidents',
  '/dashboard/timeline',
  '/dashboard/execution',
  '/dashboard/recovery',
  '/dashboard/intelligence',
  '/dashboard/activity',
  '/dashboard/approvals',
  '/dashboard/jobs',
  '/dashboard/memory',
  '/dashboard/settings',
  '/sign-in'
];

function httpGet(url, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.request(u, { method: 'GET', headers: { 'Accept': 'text/html' } }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on('error', reject);
    req.setTimeout(timeout, () => {
      req.destroy(new Error('timeout'));
    });
    req.end();
  });
}

async function waitForServer(url, timeout = 30000, interval = 500) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const r = await httpGet(url, 3000);
      if (r.statusCode && r.statusCode < 500) return true;
    } catch (e) {
      // ignore
    }
    await new Promise(r => setTimeout(r, interval));
  }
  return false;
}

async function main() {
  console.log('Smoke test starting against', BASE);
  const ready = await waitForServer(BASE + '/');
  if (!ready) {
    console.error('Server not responding at', BASE);
    process.exit(2);
  }

  const failed = [];

  for (const route of ROUTES) {
    const url = BASE + route;
    try {
      const r = await httpGet(url, 10000);
      const ok = r.statusCode >= 200 && r.statusCode < 400 && r.body && r.body.length > 100;
      console.log(`${route} -> ${r.statusCode} ${ok ? 'OK' : 'WARN'} (len=${r.body ? r.body.length : 0})`);
      if (!ok) failed.push({ route, status: r.statusCode, length: r.body ? r.body.length : 0 });
    } catch (err) {
      console.error(`${route} -> ERROR`, err.message);
      failed.push({ route, error: err.message });
    }
  }

  console.log('--- Summary ---');
  if (failed.length) {
    console.error('FAIL: some routes failed', JSON.stringify(failed, null, 2));
    process.exit(1);
  } else {
    console.log('PASS: all routes responded OK');
    process.exit(0);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
