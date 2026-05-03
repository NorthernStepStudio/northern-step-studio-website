#!/usr/bin/env pwsh
Write-Error "This helper is intentionally disabled. Production releases are performed by GitHub Actions after reviewed changes land on main. Run 'npm run release:check', commit your changes, and push to main. Use 'npm run deploy:manual' only for emergency recovery."
exit 1
