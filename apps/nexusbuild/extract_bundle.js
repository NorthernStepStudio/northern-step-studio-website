const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, 'apk_extract', 'assets', 'index.android.bundle');
const content = fs.readFileSync(bundlePath, 'utf8');

// Extraction Patterns
const patterns = {
  urls: /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}[^\s"']*/g,
  smartBuildLogic: /handleSmartBuild\s*=\s*(?:async\s*)?function\s*\(([^)]*)\)\s*\{([\s\S]*?)\}/g,
  analysisLogic: /analyzeBuild\s*=\s*(?:async\s*)?function\s*\(([^)]*)\)\s*\{([\s\S]*?)\}/g,
  tokenCosts: /\{[^{}]*(?:cost|price|token)[^{}]*:\s*\d+\}/gi,
  skus: /(pro_monthly|power_monthly|tokens?_\d+|premium_[\w_]+)/gi,
};

const results = {};
for (const [name, regex] of Object.entries(patterns)) {
  const matches = content.match(regex);
  results[name] = [...new Set(matches)].slice(0, 100);
}

fs.writeFileSync('extraction_results.json', JSON.stringify(results, null, 2));
console.log('Extraction complete. Results saved to extraction_results.json');
