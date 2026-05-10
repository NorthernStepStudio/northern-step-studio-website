import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../apps/nstep-dashboard/src');

const LAYERS = {
  UI: ['/app/', '/components/'],
  VM: ['/lib/dashboard/view-models/'],
  SERVICES: ['/lib/studioos/'],
  MODELS: ['/lib/dashboard/contracts.ts', '/lib/studioos/platform-contracts.ts']
};

/**
 * ARCHITECTURAL RULES
 * key: layer that is being checked
 * allowed: where it CAN import from
 * forbidden: where it CANNOT import from (explicitly checked)
 */
const RULES = [
  {
    layer: 'UI',
    match: ['/app/', '/components/'],
    forbidden: [
      { pattern: '/lib/studioos/', reason: 'UI bypassing View-Models. Must import from /lib/dashboard/view-models/.' },
      { pattern: '/lib/auth.ts', reason: 'UI importing auth logic directly. Use auth hooks/context.' }
    ]
  },
  {
    layer: 'VM',
    match: ['/lib/dashboard/view-models/'],
    forbidden: [
      { pattern: '/app/', reason: 'View-Models importing from UI. Circular dependency or logic leak.' },
      { pattern: '/components/', reason: 'View-Models importing UI components.' }
    ]
  },
  {
    layer: 'SERVICES',
    match: ['/lib/studioos/'],
    forbidden: [
      { pattern: '/lib/dashboard/view-models/', reason: 'Services importing from View-Models. Layer inversion.' },
      { pattern: '/app/', reason: 'Services importing from UI.' }
    ]
  }
];

function scanFiles(dir, allFiles = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        scanFiles(fullPath, allFiles);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      allFiles.push(fullPath);
    }
  }
  return allFiles;
}

function audit() {
  console.log('🔍 Starting StudioOS Architecture Integrity Audit...');
  const files = scanFiles(ROOT);
  let violations = 0;

  files.forEach(file => {
    const relativePath = file.replace(ROOT, '').replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    RULES.forEach(rule => {
      const isMatch = rule.match.some(m => relativePath.includes(m));
      if (isMatch) {
        rule.forbidden.forEach(f => {
          const importPattern = new RegExp(`from ['"]@${f.pattern}|from ['"]\\.\\.\\/.*${f.pattern}`, 'g');
          lines.forEach((line, index) => {
            if (line.includes('import') && line.includes(f.pattern)) {
              console.error(`❌ [${rule.layer} Violation] ${relativePath}:${index + 1}`);
              console.error(`   - Rule: ${f.reason}`);
              console.error(`   - Line: ${line.trim()}`);
              violations++;
            }
          });
        });
      }
    });
  });

  console.log('\n--- Audit Summary ---');
  if (violations === 0) {
    console.log('✅ All layer boundaries intact. Architecture drift level: 0%.');
    process.exit(0);
  } else {
    console.error(`⚠️ Found ${violations} architecture violations.`);
    process.exit(1);
  }
}

audit();
