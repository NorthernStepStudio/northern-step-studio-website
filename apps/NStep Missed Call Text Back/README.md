# ResponseOS Plumbing AI Starter

Starter-first missed-call recovery for plumbing businesses on the ResponseOS gateway.

## Product Model

ResponseOS sells automation levels, not model names:

- `Starter`: low-cost missed-call recovery and plumbing lead intake
- `Pro`: higher-capacity upgrade path
- `Elite`: highest-capacity upgrade path

The current implementation ships the `Starter` plumbing playbook first.
Tier selection is saved now, but the live customer conversation flow is the Starter plumbing system.

## What It Does

- opens or creates a ResponseOS business tenant
- stores the locked automation config: `tier`, `mode`, `maxRequestsPerDay`, `fallbackOnFailure`
- supports `local`, `cloud`, and `hybrid` runtime modes internally
- keeps internal model routing hidden from client-facing copy
- auto-fills public business details from the website when available
- generates reviewed setup suggestions through the internal automation runtime
- supports multiple client-facing business numbers forwarding into one Twilio relay
- bootstraps a Twilio SMS connector
- generates the shared Twilio webhook URL for inbound SMS and missed-call callbacks
- includes a client dashboard for switching, templating, and launching new client workspaces
- includes a dedicated sales demo view with a live scripted missed-call conversation and owner summary reveal
- duplicates client setup patterns without copying live Twilio wiring
- runs the Starter plumbing intake flow after a missed call:
  - opener: `Leak, clog, water heater, or something else?`
  - other fallback: `toilet`, `fixture`, `disposal`, `sewer`, `water pressure`, or a custom issue
  - leak branch: `constant` vs `only when you use the sink`
  - clog branch: `fully blocked` vs `draining slowly`
  - urgency check: flooding or urgent damage
  - issue location
  - customer name
- classifies urgency as `normal`, `priority`, or `emergency`
- sends an owner summary or creates a manual owner-summary task
- shows recovered calls, leads, tasks, follow-ups, and recent activity
- exports and imports handoff packets between machines

This app still uses the same gateway and tenant data as the full ResponseOS workspace.
Each client should keep a unique Twilio relay number, and the gateway maps that Twilio number back to the correct client workspace.

## Runtime Rules

- `local`: try Ollama first
- `cloud`: use the hosted automation runtime
- `hybrid`: try local first, then cloud
- if the selected path fails and `fallbackOnFailure=true`, ResponseOS uses the safe Starter fallback
- `maxRequestsPerDay` is enforced per tenant to prevent runaway automation usage

Starter tier defaults:

- tier: `starter`
- mode: `hybrid`
- max requests per day: `75`
- fallback on failure: `true`

## Demo Story

Client-facing positioning:

- what it is: a 24/7 missed-call response system for plumbing businesses
- what it solves: customers call the next plumber if nobody responds quickly
- what it does: responds instantly, qualifies the issue, checks urgency, and sends a clean summary
- close line: `If this saves just one missed job per week, it pays for itself.`

Live demo opener:

```text
Let me show you what happens when you miss a call.
```

Owner summary reveal:

```json
{
  "type": "lead_summary",
  "name": "John",
  "issue": "Leak under the sink",
  "severity": "High",
  "urgency": "Same-day recommended",
  "location": "Kitchen",
  "notes": "Constant leak, Flooding or urgent damage reported",
  "recommended_action": "Call immediately"
}
```

## Demo API

The sales demo uses a simple scripted endpoint:

`POST /lead`

Input:

```json
{
  "session_id": "abc123",
  "message": "Leak under the sink",
  "business_name": "ABC Plumbing",
  "agent_name": "Mike"
}
```

UI shortcut:

- use `Load Plumbing Demo` in setup to seed the `ABC Plumbing` demo tenant and jump straight into the Demo view

Response while the conversation is still running:

```json
{
  "session_id": "abc123",
  "reply": "Got it. Is the leak constant or only when you use the sink?",
  "done": false,
  "question_key": "severity_detail"
}
```

Final response:

```json
{
  "session_id": "abc123",
  "reply": "Thanks, John. We've got your request.\n\nA technician will reach out shortly to schedule.",
  "done": true,
  "question_key": "done",
  "summary": {
    "type": "lead_summary",
    "name": "John",
    "issue": "Leak under the sink",
    "severity": "High",
    "urgency": "Same-day recommended",
    "location": "Kitchen",
    "notes": "Constant leak, Flooding or urgent damage reported",
    "recommended_action": "Call immediately"
  }
}
```

## Multi-Client Model

- one client workspace per business
- one unique Twilio relay number per client
- one shared Twilio webhook URL for the whole gateway
- multiple public client-facing numbers can forward into that one client relay number

Use `Start New Client` for a clean onboarding draft.
Use `Duplicate Client` when you want to copy setup patterns from an existing client but intentionally reset Twilio wiring, alerts, and live activity.

## Credential Hardening

Generate a credential key once:

```bash
npm run generate:credential-key
```

Set that value as `RESPONSEOS_CREDENTIAL_KEY` before starting the gateway.
After the gateway loads, any saved Twilio Auth Tokens in `server-data/responseos-store.json` are migrated from plaintext to encrypted-at-rest storage automatically.

## Follow-Up Runner

ResponseOS creates follow-ups from:

- missed calls that triggered the Starter text-back
- completed plumbing intake conversations
- due owner call tasks

Optional env vars:

- `RESPONSEOS_FOLLOWUP_RUNNER_ENABLED=true`
- `RESPONSEOS_FOLLOWUP_RUNNER_INTERVAL_MS=60000`
- `RESPONSEOS_FOLLOWUP_RUNNER_LIMIT_PER_TENANT=25`

## Run

Start the local gateway first:

```bash
npm run gateway:start
```

To boot the gateway with a configured public base URL:

```bash
RESPONSEOS_PUBLIC_BASE_URL=https://your-public-host.example npm run gateway:public
```

Then start the add-on:

```bash
npm run dev
```

Or run both together:

```bash
npm run dev:all
```

Run the full local verification pass:

```bash
npm run check
```

Local UI defaults:

- gateway: `http://127.0.0.1:8787`
- access key: `preview-key`
- app id: `responseos-app`
- business id: `default`

## Environment

Gateway and storage:

- `RESPONSEOS_PUBLIC_BASE_URL`
- `RESPONSEOS_GATEWAY_API_KEY`
- `RESPONSEOS_CREDENTIAL_KEY`

Automation routing:

- `RESPONSEOS_OLLAMA_BASE_URL`
- `RESPONSEOS_AUTOMATION_STARTER_LOCAL_MODEL`
- `RESPONSEOS_AUTOMATION_PRO_LOCAL_MODEL`
- `RESPONSEOS_AUTOMATION_ELITE_LOCAL_MODEL`

Cloud automation:

- `M_CORE_PROVIDER_MODE=gemini`
- `M_CORE_GEMINI_API_KEY`
- optional `M_CORE_GEMINI_MODEL`

If cloud automation is unavailable, the gateway falls back to the safe Starter templates when tenant fallback is enabled.

## Hosted Deployment

The clean hosted path is the gateway container, not a local tunnel:

1. Copy `.env.hosted.example` to `.env.hosted`.
2. Fill in `RESPONSEOS_PUBLIC_BASE_URL`, `RESPONSEOS_GATEWAY_API_KEY`, and `RESPONSEOS_CREDENTIAL_KEY`.
3. Leave the follow-up runner enabled unless you want all due follow-ups triggered manually.
4. Add cloud automation env vars if you want live hosted generation.
5. Start the hosted gateway:

```bash
docker compose -f docker-compose.hosted.yml up -d --build
```

## Current Gaps

- Twilio compliance still needs the normal A2P / toll-free verification work
- owner email alerts are still placeholder-only
- calendar sync is still placeholder-only
- Pro and Elite tiers are stored and sellable, but the live customer conversation flow is still the Starter plumbing playbook
