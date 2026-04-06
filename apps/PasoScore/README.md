# PasoScore (Mobile)

Mobile Expo app for Android and iOS.

## Product anchor

This product is a:

- Mobile-first credit guidance app
- Multilingual experience (Spanish default, English, Italian)
- Decision system (deterministic paths and monthly sequence)
- Subscription-oriented guidance product with recurring monthly value

And it is explicitly not (in v0):

- AI-heavy prediction product
- Infrastructure-heavy platform
- ResponseOS-integrated workflow

Privacy boundary:

- This app does not access your credit report.
- We do not ask for SSN.
- All data stays on the user mobile device.

## v0 scope

- Structured decision-tree engine (Path A/B/C/D)
- JSON decision-tree routing rules
- Condition-based deterministic evaluation
- State progression tracking per roadmap step
- Monthly milestone unlock gates (strict progression)
- Dual onboarding model:
  - Path A Anonymous mode (no SSN, no sensitive personal data, no income required)
  - Path B Personalized mode (optional ranges and behavior inputs)
- Month-by-month sequence guidance
- Step tracker
- Credit education modules
- Deterministic secured card logic (no scoring engine)
- Letter generator with PDF export
- Next best action guidance
- Low-compliance-risk copy and guardrails
- Language support: Spanish (default), English, Italian
- RevenueCat base in Settings (status, offerings, purchase, restore)

## Run

```bash
npm install
npm run start
```

## Platform scripts

```bash
npm run android
npm run ios
```

## RevenueCat base setup

1. Copy `.env.example` to `.env`.
2. Set:
`EXPO_PUBLIC_REVENUECAT_IOS_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`, `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID`
3. Use the exact entitlement identifier:
`EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=pasoscore_pro`
4. Optional: set `EXPO_PUBLIC_REVENUECAT_OFFERING_ID=default` (or your offering id).
5. In RevenueCat, attach `monthly`, `yearly`, and `lifetime` products to the same Pro entitlement and current offering.
6. Do not add `react-native-purchases` to `app.json` plugins (this package is not an Expo config plugin).
7. Build a dev client or production app build.

Note: Expo Go does not support RevenueCat native billing. The app shows a safe fallback message in that environment.

## Account + restore flow

1. Open `Settings` and save account profile (name/email optional).
2. Enter a stable `Account ID` and tap `Link billing`.
3. Buy any `PasoScore Pro` plan (monthly, yearly, or lifetime).
4. On a new phone, enter the same `Account ID`, tap `Link billing`, then tap `Restore`.

## Free vs Pro

- Free:
  - Onboarding, roadmap, step tracker, education modules
  - Card recommendations
- Pro (`PasoScore Pro` entitlement):
  - Personalized plan details
  - Letter PDF export
  - RevenueCat paywall + restore + customer center flows

## Compliance notes

This v0 app is educational support only and intentionally avoids:

- ResponseOS integration
- Credit bureau API integrations
- AI credit predictions
- Risk scoring engines
- Approval guarantees
- Score guarantees
- Legal claims in templates

## Legal links

Set these optional environment variables to open legal docs from Settings:

- `EXPO_PUBLIC_PRIVACY_POLICY_URL`
- `EXPO_PUBLIC_TERMS_URL`

## Release checklist

- Replace test RevenueCat key with store platform keys (`appl_...`, `goog_...`) for production.
- Ensure entitlement id is exactly `pasoscore_pro` and offering includes `monthly`, `yearly`, `lifetime`.
- Add app branding assets (`icon`, `adaptiveIcon`, `splash`) in `app.json`.
- Run EAS builds using `eas.json` profiles (`development`, `preview`, `production`).
