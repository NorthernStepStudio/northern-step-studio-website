console.error("Production deploys are triggered by pushing reviewed changes to main through GitHub Actions.");
console.error("Use `npm run release:check` before pushing, or `npm run deploy:manual` only for emergency recovery.");
process.exit(1);
