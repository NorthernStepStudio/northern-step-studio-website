# ResponseOS

AI execution engine for automated systems.

Web operator workspace for the ResponseOS gateway revenue routes.

## What It Does

- loads a tenant revenue workspace from the gateway
- saves onboarding and connector settings
- opens hosted or local gateway workspaces, with local detection available as a helper path
- saves client connection profiles for one-click reopen
- applies business presets for HVAC, plumbing, electrical, and roofing tenants
- keeps incomplete tenants in protected mode instead of blocking setup entirely
- starts with plain-language guidance and a simple setup order instead of dropping users into raw operator panels
- shows a missing-info checklist, live/protected mode, and per-channel activation state
- generates Twilio inbound webhook URLs and shows whether the current gateway URL is actually reachable from Twilio
- exports and imports onboarding packets so partial setup can move between machines
- creates and manages a manual task queue for blocked or simulated automations
- shows whether the gateway background follow-up runner is enabled
- validates Twilio SMS, Resend email, and generic calendar credentials before bootstrap
- bootstraps encrypted Twilio SMS, Resend email, and generic JSON calendar connectors
- submits normalized lead intake payloads
- dispatches missed call, inbound SMS, and job completed events
- reviews leads, follow-ups, activity, and metrics

## Run

Start the gateway first:

```bash
npm run responseos:gateway:start -- --config ./packages/responseos-gateway/config/tenants.example.json
```

Then start this app:

```bash
npm run responseos:studio:dev
```

Default app values:

- gateway: blank until you enter the hosted gateway URL or detect a local install
- app id: `responseos-app`
- tenant id: `default`

Update the gateway URL, API key, and app id in the UI to match your hosted or local gateway config.

Connector setup notes:

- Use `Detect Local Gateway` when onboarding on the client machine and the local URL is unknown
- Save a working client after connection so reopening that tenant is one click
- Apply a tenant preset before filling the rest of the business setup if you are starting from a blank workspace
- Use protected mode when the client does not have everything yet; required gaps stay visible and automation falls back to manual tasks
- Export an onboarding packet after a discovery/setup call, then import it later on the install machine or final tenant
- Use the `Live Inbound Setup` panel to copy the Twilio SMS and missed-call webhook URLs
- If the gateway URL is `localhost` or another private address, Twilio still needs a public hostname, tunnel, or reverse proxy
- Validate provider credentials inline before bootstrapping a live connector
- Twilio SMS bootstrap creates a Basic Auth connector and applies it to the tenant SMS settings
- Resend bootstrap creates a Bearer token connector and applies outbound email defaults
- Calendar bootstrap creates a generic JSON connector for booking automation
