# Plumbing AI Starter Sales Sheet

## What It Is

This is a 24/7 missed-call response system for plumbing businesses. When a customer calls and nobody answers, it replies instantly, asks a few plumbing-specific questions, checks urgency, and sends the owner a clean summary.

Short version:

Never miss a plumbing job again.

## Who It Is For

- solo plumbers
- small plumbing shops
- growing teams missing calls during jobs, after hours, or during lunch

## What Problem It Solves

If a plumber misses a call, that customer usually calls the next company. Starter keeps the customer engaged immediately so the owner can call back with the right context.

## What Starter Does

- sends an instant missed-call text
- asks a short plumbing intake
- captures issue type, severity, urgency, location, and name
- classifies the lead
- sends an owner-ready summary

## Starter Intake Flow

1. Ask what is going on: leak, clog, water heater, or something else.
2. If leak: ask constant or only when the sink is used.
3. If clog: ask fully blocked or draining slowly.
4. Ask whether it is causing flooding or urgent damage right now.
5. Ask where the issue is located.
6. Ask for the customer name.

## Owner Summary Example

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

## Positioning

Do not sell models or providers.

Sell automation levels:

- Starter
- Pro
- Elite

Starter is the first sellable system because it is the fastest to install, easiest to demo, and easiest to prove ROI on.

## Pricing

- Starter setup: $500
- Starter monthly: $200-$300

## Close

If this saves just one missed job per week, it pays for itself.
