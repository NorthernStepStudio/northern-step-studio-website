# Northern Step Studio Release Checklist

## Before push

1. Run `npm run release:check`.
2. Confirm the build completed successfully.
3. Confirm the Wrangler dry-run completed successfully.
4. Commit only the intended website changes.

## Production release

1. Push the reviewed commit to `main`.
2. Open the GitHub Actions run for `Cloudflare Production Deploy`.
3. Wait for both the deploy step and the verification step to finish green.

## Live proof points

1. `https://northernstepstudio.com/api/health`
   Confirm `build.buildId`, `build.gitShortSha`, and `build.version` match the release you just shipped.
2. `https://northernstepstudio.com/`
   Confirm response headers include `X-NSS-Build` and `Cache-Control: no-store`.
3. `https://northernstepstudio.com/community`
   Confirm the route loads instead of returning a 500.
4. Current hashed bundle under `/assets/*`
   Confirm `Cache-Control: public, max-age=31536000, immutable`.
5. `https://www.northernstepstudio.com/`
   Confirm it redirects to `https://northernstepstudio.com/`.

## Emergency fallback

Only if GitHub Actions is unavailable:

1. Run `npm run deploy:manual`.
2. Run `npm run verify:release -- --base-url https://northernstepstudio.com`.
3. Commit and push the same source changes immediately so repository state matches production.
