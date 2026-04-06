# Live Phone Test Checklist

Use this after the website is live and Twilio toll-free verification is approved.

## Before The Call

- Gateway is running
- Public webhook URL is current
- Twilio number is `+18777550689`
- Demo workspace is loaded in the app
- `Main Business Number` matches the real test setup
- `Callback Number` is the Twilio number
- `Owner Alert Destination` is your cell
- Twilio shows the webhook URL on the number

## Test Order

1. Open the app and go to `Demo`.
2. Open the app and go to `Operations` in a second tab if possible.
3. Call the Twilio number from your cell.
4. Let it ring out and hang up.
5. Wait for the first SMS.
6. Reply through the full intake.
7. Confirm the owner summary appears in the app.

## Expected Customer SMS Flow

1. `What's going on - leak, clog, water heater, or something else?`
2. Leak branch:
   `Is the leak constant or only when you use the sink?`
3. Clog branch:
   `Is it fully blocked or draining slowly?`
4. Urgency:
   `Is this causing flooding or urgent damage right now?`
5. Location
6. Customer name
7. Final confirmation

## Compliance Commands To Test

- `HELP`
  Expected: help reply and activity log entry
- `STOP`
  Expected: opt-out confirmation, lead marked opted out, future missed-call texts suppressed
- `START`
  Expected: texting re-enabled and the lead can continue or restart the flow

## What To Watch In The App

- `Recent Leads`
  Look for the caller number and SMS status
- `Recent Messaging Activity`
  Look for `HELP received`, `STOP received`, `START received`, and delivery status updates
- `Human Tasks`
  Look for owner follow-up or failed delivery tasks
- `Follow-Up Queue`
  Look for the emergency or callback follow-up

## If The Call Works But No SMS Arrives

- Confirm toll-free verification is approved
- Confirm the webhook URL is still reachable
- Check `Recent Messaging Activity`
- Check Twilio debugger and message logs
- Confirm the lead is not currently opted out

## If SMS Arrives But Follow-Up Looks Wrong

- Check the workspace is the demo workspace you intended
- Check the business/callback numbers saved in Setup
- Check the owner alert destination
- Check whether the customer sent `STOP` previously
