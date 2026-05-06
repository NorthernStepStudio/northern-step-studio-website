const fs = require('fs');
const path = require('path');
const http = require('http');

const root = path.join(__dirname, '..', '..', '..');

function postSecrets(appName, keystorePassword, keyPassword) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ appName, keystorePassword, keyPassword, remember: false });
    const opts = {
      hostname: 'localhost',
      port: 4545,
      path: '/api/secrets/save',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => data += c.toString());
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve({ error: 'invalid-json' }); }
      });
    });

    req.on('error', (e) => resolve({ error: e.message }));
    req.write(payload);
    req.end();
  });
}

function walk(dir, fileCallback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (['node_modules', '.git', 'build', 'dist', 'archive'].includes(ent.name)) continue;
      try { walk(full, fileCallback); } catch (e) {}
    } else {
      try { fileCallback(full); } catch (e) {}
    }
  }
}

function tryImportFromCredentialsJson(fullPath) {
  try {
    const txt = fs.readFileSync(fullPath, 'utf8');
    const obj = JSON.parse(txt);
    if (obj && obj.android && obj.android.keystore) {
      const ks = obj.android.keystore.keystorePassword || null;
      const kp = obj.android.keystore.keyPassword || null;
      if (ks) return { appName: getAppNameFromPath(fullPath), keystorePassword: ks, keyPassword: kp, source: fullPath };
    }
  } catch (e) {}
  return null;
}

function tryImportFromSigningTemp(fullPath) {
  try {
    const txt = fs.readFileSync(fullPath, 'utf8');
    const store = txt.match(/STORE_PASSWORD=(.+)/);
    const key = txt.match(/KEY_PASSWORD=(.+)/);
    if (store) return { appName: getAppNameFromPath(fullPath), keystorePassword: store[1].trim(), keyPassword: key ? key[1].trim() : null, source: fullPath };
  } catch (e) {}
  return null;
}

function getAppNameFromPath(p) {
  const parts = p.split(path.sep);
  const appsIndex = parts.lastIndexOf('apps');
  if (appsIndex >= 0 && parts.length > appsIndex + 1) return parts[appsIndex + 1];
  return path.basename(path.dirname(p));
}

(async function main(){
  const appsDir = path.join(root, 'apps');
  if (!fs.existsSync(appsDir)) {
    console.error('apps directory not found:', appsDir);
    console.error('Computed workspace root:', root);
    process.exit(2);
  }

  const found = [];

  walk(appsDir, (full) => {
    const name = path.basename(full).toLowerCase();
    if (name === 'credentials.json') {
      const r = tryImportFromCredentialsJson(full);
      if (r) found.push(r);
    }
    if (name === 'signing.temp.properties') {
      const r = tryImportFromSigningTemp(full);
      if (r) found.push(r);
    }
  });

  if (found.length === 0) {
    console.log('No credential files with secrets found under apps/');
    process.exit(0);
  }

  let imported = 0;
  for (const item of found) {
    const resp = await postSecrets(item.appName, item.keystorePassword, item.keyPassword);
    if (resp && resp.success) {
      console.log(`Imported secrets for app: ${item.appName} (source: ${path.relative(root, item.source)})`);
      imported++;
    } else if (resp && resp.warning) {
      console.log(`Imported for ${item.appName} with warning: ${resp.warning}`);
      imported++;
    } else {
      console.log(`Failed to import for ${item.appName}: ${resp && resp.error ? resp.error : JSON.stringify(resp)}`);
    }
  }

  console.log(`Import complete. ${imported}/${found.length} imported to session vault (remember=false).`);
})();
