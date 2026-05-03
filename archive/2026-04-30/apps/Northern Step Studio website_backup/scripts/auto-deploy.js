#!/usr/bin/env node
console.error("This helper is intentionally disabled.");
console.error("Production releases are performed by GitHub Actions after reviewed changes land on main.");
console.error("Run `npm run release:check`, commit your changes, and push to main.");
console.error("Use `npm run deploy:manual` only for emergency recovery.");
process.exit(1);
