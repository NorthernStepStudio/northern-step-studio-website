# Release Verification

Use this checklist after production pushes to `main`.

## GitHub Build Check

Open the repository Actions tab and confirm the Cloudflare production deploy workflow is green. If it is red, inspect the failing job before doing any manual deployment.

## Version Verification

Open the production health endpoint:

```text
https://northernstepstudio.com/api/health
```

Confirm the reported version matches the expected release.

## Visual Check

Open the production website and hard-refresh:

- Windows: `Ctrl+F5`
- macOS: `Cmd+Shift+R`

Confirm the latest UI and route changes are visible.

## AI Assistant Heartbeat

Open the AI assistant route or chat entry point and send a small test message. Confirm the Worker and AI provider integration respond as expected.

## Emergency Cache Purge

Use Cloudflare cache purge only if the health endpoint shows the correct version but stale assets are still being served.
