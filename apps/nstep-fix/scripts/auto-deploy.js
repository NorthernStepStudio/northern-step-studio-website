#!/usr/bin/env node
const { execSync } = require('child_process');
const readline = require('readline');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

(async function main() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    console.log(`Current branch: ${branch}`);

    const status = execSync('git status --porcelain').toString();
    if (status) {
      console.log('Working tree has changes.');
      if (process.argv.includes('--yes') || process.argv.includes('-y')) {
        run('git add --all');
        run('git commit -m "Auto-deploy: commit local changes"');
      } else {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const msg = await new Promise((res) => rl.question('Enter commit message (leave empty to abort): ', (answer) => { rl.close(); res(answer); }));
        if (!msg) {
          console.log('No commit message provided — aborting.');
          process.exit(1);
        }
        run('git add --all');
        // escape double quotes in the message
        const safeMsg = msg.replace(/"/g, '\\"');
        run(`git commit -m "${safeMsg}"`);
      }
    } else {
      console.log('Working tree clean.');
    }

    console.log(`Pushing branch ${branch} to origin`);
    run(`git push origin ${branch}`);

    if (branch === 'main' || process.argv.includes('--force-deploy')) {
      console.log('On `main` (or forced) — building and publishing via wrangler.');
      // Install dependencies if node_modules missing
      try {
        run('npm ci');
      } catch (e) {
        console.warn('`npm ci` failed; trying `npm install --legacy-peer-deps`');
        run('npm install --legacy-peer-deps');
      }
      run('npm run deploy');
      console.log('Deploy finished.');
    } else {
      console.log('Not on `main`. To trigger CI deploy, merge this branch into `main` or run with `--force-deploy`.');
    }
  } catch (err) {
    console.error('Auto-deploy failed:', err.message || err);
    process.exit(1);
  }
})();
