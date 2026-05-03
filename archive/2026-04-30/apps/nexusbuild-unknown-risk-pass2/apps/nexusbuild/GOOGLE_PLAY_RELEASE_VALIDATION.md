# Pre-Google Play Validation

This checklist mirrors Google Play release behavior before publishing to production.

## 1) Automated parity checks

Run:

```bash
npm run validate:pre-google-play
```

This verifies:
- Release API base URL is configured
- App deep link scheme and Android callback intent filter
- Worker Google OAuth env presence (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_OAUTH_ORIGIN`)
- Live `/health` and `/auth/google/redirect_url` behavior
- EAS `production` and `production-apk` profiles

## 2) Build release artifacts

```bash
npm run release:aab
npm run release:apk
```

Use the same code branch/commit for both artifacts.

## 3) Local release-device auth matrix

Install the release APK on at least:
- One modern Android device
- One older Android version

Run:
- Email register -> login -> logout
- Google OAuth success flow
- Google OAuth cancel flow
- Google OAuth deny flow

Verify:
- No white screen
- No raw translation keys (for example `auth.login.loginFailed`)
- No silent auth failure

## 4) Play internal testing matrix

- Upload AAB to Google Play Internal Testing
- Install from Play internal testing link (not side-load)
- Re-run auth matrix and critical flows:
  - Builder
  - Budget allocation
  - Add selected / Add all
  - Save build
  - Community fetch

## 5) Observability + rollout safety

- Confirm auth failures are visible in client and backend logs
- Keep previous stable production release available
- Stage rollout with hold points:
  - 10%
  - 50%
  - 100%

Proceed only after each gate is stable.
