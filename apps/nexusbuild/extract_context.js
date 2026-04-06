const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, 'apk_extract', 'assets', 'index.android.bundle');
const bundle = fs.readFileSync(bundlePath, 'utf8');

const keywords = ['handleSmartBuild', 'smartBuild', 'nexus_chat', 'tokens', 'isToken', 'entitlements'];
const results = {};

keywords.forEach(keyword => {
  const index = bundle.indexOf(keyword);
  if (index !== -1) {
    const start = Math.max(0, index - 1000);
    const end = Math.min(bundle.length, index + 2000);
    results[keyword] = bundle.substring(start, end);
  }
});

fs.writeFileSync('extraction_context.json', JSON.stringify(results, null, 2));
console.log('Context extraction complete.');
