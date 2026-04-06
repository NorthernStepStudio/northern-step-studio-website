# User Prompt Archive

Saved on `2026-03-19` for future reference. The text blocks below preserve the user-provided prompts that defined the Starter plumbing product, flow, and sales demo.

## Prompt 1

```text
First — Your 3-Tier Model (Locked)

You are NOT selling “AI models”.

You are selling:

Levels of automation power

The model choice is internal.

💰 Your Offer Structure (Clean & Sellable)
🟢 Tier 1 — Starter (Cheap)

Who it’s for:

Small plumber

Solo contractor

Low volume calls

What it does:

Missed call auto-response (SMS/email)

Basic lead capture (name, issue, urgency)

Simple reply generation

🔧 Tech (your side)

Local:

Qwen 8B (Ollama)

Cloud fallback:

Cheap API OR Qwen 8B on small server

💵 Price

Setup: $500

Monthly: $200–$300

🟡 Tier 2 — Pro (Normal)

Who it’s for:

Growing business

Multiple calls/day

Wants real automation

What it does:

Everything in Starter

Lead qualification (structured questions)

Job categorization (emergency vs normal)

Smart responses (better tone)

Owner summary report

Follow-up messages

🔧 Tech

Local:

Qwen 14B

Cloud fallback:

Qwen 14B OR better API

💵 Price

Setup: $750–$1200

Monthly: $300–$500

🔴 Tier 3 — Elite (Good)

Who it’s for:

Busy companies

High ticket jobs

Wants full automation

What it does:

Everything in Pro

Quote drafting

Multi-step conversations

Appointment scheduling logic

Priority handling

Business insights (basic)

🔧 Tech

Local (if strong machine):

Qwen 14B tuned + structured prompts

Cloud (recommended):

Strong API OR hosted Qwen (GPU)

💵 Price

Setup: $1200–$2000+

Monthly: $500–$800+

🧠 Important: You Don’t Expose Models

Client NEVER hears:

“Qwen 8B”

“Qwen 14B”

“Gemini”

“MiniMax”

They hear:

“Starter”

“Pro”

“Elite”

⚙️ How ResponseOS Handles This (Simple Design)

Inside ResponseOS config:

tier: "starter" | "pro" | "elite"
mode: "local" | "cloud" | "hybrid"
Runtime Logic
IF mode = local:
   use ollama + qwen (based on tier)

IF mode = cloud:
   use API (based on tier)

IF mode = hybrid:
   try local → fallback to cloud
Model Mapping (Internal Only)
starter → qwen:8b
pro     → qwen:14b
elite   → qwen:14b + advanced prompts OR cloud model
🧱 What You Actually Build First (IMPORTANT)

You do NOT build all 3 tiers fully.

You build:

👉 Starter Tier ONLY

Why?

Because:

Fastest to sell

Easiest to build

Easiest to demo

Immediate ROI

🚀 Your First Sellable System (Plumbing v1)

This is what you build THIS WEEK:

Flow:

Missed call / form submission

Auto SMS:
“Hey, what’s going on? Leak, clog, or other?”

Ask 3–5 questions

Classify urgency

Send summary to owner

That alone is worth $200/month.

🧠 Cloud vs Local (Final Simplified Rule)
Client Situation	You Use
Good PC	Local (Qwen)
No PC	Cloud
Weak PC	Hybrid
⚠️ Guardrail (Don’t skip this)

Add this internally:

max_requests_per_day
fallback_on_failure = true

So you never get:

API bill explosion

System crashes

Angry client

🔥 What You Have Now

You now have:

✅ Clear product
✅ Clear pricing
✅ Clear tiers
✅ Clear tech mapping
✅ Clear sales positioning

Next move (critical)

We go from theory → execution.

Reply:

👉 PROJECT: Plumbing AI Starter System

And I will give you:

Exact flow (messages, questions, logic)

Copy-paste prompt templates

Minimal backend structure

How to demo it to a real client in days

This is where you start making money.
```

## Prompt 2

```text
PROJECT: Plumbing AI Starter System

This is your first sellable system. You can demo this in 24–48 hours.

🧠 1️⃣ Core Goal

Capture missed leads → qualify them → send owner a clean summary → keep customer engaged

That’s it.

🧱 2️⃣ System Flow (Exact)
Trigger

Missed call
OR

Website form
OR

Manual demo (you simulate)

Step 1 — First Response (Instant)
Hey, this is Mike from ABC Plumbing. Sorry we missed your call.

What’s going on — leak, clog, or something else?
Step 2 — Qualification Tree (Copy this exactly)
Q1 — Type of Issue

leak

clog

water heater

other

Q2 — Severity

If leak:

Is the leak constant or only when you use the sink?

If clog:

Is it fully blocked or draining slowly?
Q3 — Urgency
Is this causing flooding or urgent damage right now?

Answers:

yes → emergency

no → normal

Q4 — Location
Where is the issue located? (kitchen, bathroom, basement, etc.)
Q5 — Contact Name
Can I get your name so the technician can reach you?
🧠 3️⃣ Internal Classification Logic

You implement this in ResponseOS (simple rules):

IF flooding OR constant leak → urgency = HIGH
IF clog slow → urgency = LOW
ELSE → MEDIUM
📩 4️⃣ Customer Final Message
Thanks, [Name]. We’ve got your request.

A technician will reach out shortly to schedule.
📊 5️⃣ Owner Summary (THIS is your selling point)

Return this from ResponseOS:

{
  "type": "lead_summary",
  "name": "John",
  "issue": "Leak under sink",
  "severity": "High",
  "urgency": "Same-day recommended",
  "location": "Kitchen",
  "notes": "Constant leak, minor flooding",
  "recommended_action": "Call immediately"
}
🧠 6️⃣ Prompt Template (for Qwen or AI provider)

Use this as your base:

You are a plumbing assistant for a local business.

Your job:
- Ask one question at a time
- Keep messages short and clear
- Never sound robotic
- Do not give technical advice
- Focus on identifying the problem and urgency

Always guide the conversation toward:
- issue type
- severity
- urgency
- location
- customer name

Once all info is collected:
- confirm politely
- stop asking questions
⚙️ 7️⃣ Minimal Backend Structure

You only need this:

Endpoint
POST /lead
Input
{
  "message": "customer reply",
  "session_id": "abc123"
}
Output
{
  "reply": "next AI message",
  "done": false
}

When done:

{
  "reply": "final message",
  "done": true,
  "summary": { ... }
}
🧪 8️⃣ How to Demo (IMPORTANT)

You don’t need full Twilio yet.

Option A (fastest)

Use Postman / simple UI

Pretend to be customer

Show messages live

Option B (better)

Use your phone + simple SMS API (later)

🧠 9️⃣ Demo Script (what YOU say)

Start with:

“Let me show you what happens when you miss a call.”

Then simulate:

You = customer

System replies

Show questions

Show final summary

Then say:

“This is what you receive instantly instead of losing the job.”

💰 🔟 Close Line

Say this EXACTLY:

“If this saves just one missed job per week, it pays for itself.”

Then:

“Want me to set this up for your business?”

🚀 What You Build TODAY

You do NOT build everything.

You build:

✅ Question flow
✅ Simple backend logic
✅ Summary output
✅ Demo

That’s enough to sell.

⚠️ Don’t do this yet

No dashboards

No multi-industry

No advanced AI

No full automation

No perfection

🧨 Your Mission (Next 24–48h)

Implement flow

Test it

Run demo

Talk to 2–3 plumbers.
```

## Prompt 3

```text
First — Your 3-Tier Model (Locked)

You are NOT selling “AI models”.

You are selling:

Levels of automation power

The model choice is internal.

💰 Your Offer Structure (Clean & Sellable)
🟢 Tier 1 — Starter (Cheap)

Who it’s for:

Small plumber

Solo contractor

Low volume calls

What it does:

Missed call auto-response (SMS/email)

Basic lead capture (name, issue, urgency)

Simple reply generation

🔧 Tech (your side)

Local:

Qwen 8B (Ollama)

Cloud fallback:

Cheap API OR Qwen 8B on small server

💵 Price

Setup: $500

Monthly: $200–$300

🟡 Tier 2 — Pro (Normal)

Who it’s for:

Growing business

Multiple calls/day

Wants real automation

What it does:

Everything in Starter

Lead qualification (structured questions)

Job categorization (emergency vs normal)

Smart responses (better tone)

Owner summary report

Follow-up messages

🔧 Tech

Local:

Qwen 14B

Cloud fallback:

Qwen 14B OR better API

💵 Price

Setup: $750–$1200

Monthly: $300–$500

🔴 Tier 3 — Elite (Good)

Who it’s for:

Busy companies

High ticket jobs

Wants full automation

What it does:

Everything in Pro

Quote drafting

Multi-step conversations

Appointment scheduling logic

Priority handling

Business insights (basic)

🔧 Tech

Local (if strong machine):

Qwen 14B tuned + structured prompts

Cloud (recommended):

Strong API OR hosted Qwen (GPU)

💵 Price

Setup: $1200–$2000+

Monthly: $500–$800+

🧠 Important: You Don’t Expose Models

Client NEVER hears:

“Qwen 8B”

“Qwen 14B”

“Gemini”

“MiniMax”

They hear:

“Starter”

“Pro”

“Elite”

⚙️ How ResponseOS Handles This (Simple Design)

Inside ResponseOS config:

tier: "starter" | "pro" | "elite"
mode: "local" | "cloud" | "hybrid"
Runtime Logic
IF mode = local:
   use ollama + qwen (based on tier)

IF mode = cloud:
   use API (based on tier)

IF mode = hybrid:
   try local → fallback to cloud
Model Mapping (Internal Only)
starter → qwen:8b
pro     → qwen:14b
elite   → qwen:14b + advanced prompts OR cloud model
🧱 What You Actually Build First (IMPORTANT)

You do NOT build all 3 tiers fully.

You build:

👉 Starter Tier ONLY

Why?

Because:

Fastest to sell

Easiest to build

Easiest to demo

Immediate ROI

🚀 Your First Sellable System (Plumbing v1)

This is what you build THIS WEEK:

Flow:

Missed call / form submission

Auto SMS:
“Hey, what’s going on? Leak, clog, or other?”

Ask 3–5 questions

Classify urgency

Send summary to owner

That alone is worth $200/month.

🧠 Cloud vs Local (Final Simplified Rule)
Client Situation	You Use
Good PC	Local (Qwen)
No PC	Cloud
Weak PC	Hybrid
⚠️ Guardrail (Don’t skip this)

Add this internally:

max_requests_per_day
fallback_on_failure = true

So you never get:

API bill explosion

System crashes

Angry client

🔥 What You Have Now

You now have:

✅ Clear product
✅ Clear pricing
✅ Clear tiers
✅ Clear tech mapping
✅ Clear sales positioning

Next move (critical)

We go from theory → execution.

Reply:

👉 PROJECT: Plumbing AI Starter System

And I will give you:

Exact flow (messages, questions, logic)

Copy-paste prompt templates

Minimal backend structure

How to demo it to a real client in days

This is where you start making money.

I need to have the demo with more info as possible you can provide. From, what is it for to what it will do and how it works

Good. We’re going to build you a sellable demo narrative + flow you can show to a real plumber and close with.

No fluff. This is exactly what you say, show, and how it works under the hood.

🎯 DEMO PACKAGE: “AI Response System for Plumbing Businesses”
1️⃣ What It Is (Simple Explanation)

Use this verbatim:

“This is a 24/7 automated response system that captures missed calls, talks to customers instantly, qualifies the job, and sends you a clean summary so you don’t lose work.”

If they ask “AI what?”:

“It’s basically an assistant that answers your missed calls and filters real jobs from time-wasters.”

2️⃣ What Problem It Solves (Make Them Feel It)

Say:

“If you miss a call, that customer is calling the next plumber.
This makes sure you respond instantly, even if you’re on a job.”

3️⃣ What It Actually Does (Clear + Concrete)
Core Functions

Responds instantly to missed calls or form leads

Asks key questions automatically

Identifies urgency (emergency vs normal)

Filters serious vs non-serious leads

Sends you a structured summary

Helps you respond faster and close more jobs

4️⃣ Demo Flow (THIS is what you show)

You simulate a real scenario.

Step 1 — Missed Call Trigger

Say:

“Let’s say you miss a call while working.”

System sends SMS automatically:

AI → Customer:

Hey, this is Mike from ABC Plumbing. Sorry we missed your call.
What’s going on — leak, clog, or something else?
Step 2 — Customer Replies

Customer:

Leak under the sink
Step 3 — AI Qualification

AI:

Got it. Is the leak constant or only when you use the sink?

Customer:

Constant

AI:

Understood. Is there any flooding or major water damage right now?

Customer:

Yes a little
Step 4 — AI Classifies

System internally marks:

Issue: Leak

Severity: Medium–High

Urgency: Same-day

Step 5 — AI Reassures Customer

AI → Customer:

Thanks for the info. We can help with that.
A technician will reach out shortly to schedule.
Step 6 — Owner Gets Summary (THIS is the WOW moment)

You show this:

NEW LEAD — PLUMBING

Name: (if collected)
Issue: Leak under sink
Severity: Medium–High
Urgency: Same-day recommended
Customer Notes: Constant leak, minor flooding

Suggested Action:
Call ASAP — likely quick repair opportunity
🧠 This is where they go:

“Oh… this actually helps.”

5️⃣ How It Works (Explain simply, no tech jargon)

Say:

“When someone contacts you, the system responds instantly, asks the right questions, and sends you a clean summary so you can decide what to do fast.”

If they push more:

“It follows a structured flow — it’s not random. It’s trained for plumbing scenarios.”

6️⃣ What Makes It Valuable (THIS closes deals)

Say:

“If this saves just one missed job per week, it pays for itself.”

Then:

“Most plumbers lose multiple calls per week.”

7️⃣ What They Get (Package)

For Starter:

Auto-response system

Lead qualification

SMS/email replies

Job summaries

Setup + customization

8️⃣ How It Runs (Local vs Cloud — keep it simple)

Say:

“We install it based on your setup.
If your system supports it, it runs locally.
Otherwise, we host it for you.”

Don’t over-explain.

9️⃣ Objection Handling (you WILL get these)
❓ “What if it says something wrong?”

“It follows controlled templates and rules — it won’t go off-script.”

❓ “Can I still talk to the customer?”

“Of course — this just handles the first response so you don’t lose them.”

❓ “Is this complicated?”

“No — once installed, it runs automatically.”

❓ “What if I’m busy?”

“That’s exactly when it works best.”

🔟 Close (THIS is critical)

Say:

“I can set this up for you and customize it for your business.
We can start simple and expand later.”

Then:

👉 “Do you want me to set up a demo version for your business?”

🧱 What’s Actually Running Behind This (your side)

Minimal stack:

ResponseOS Gateway (local or cloud)

Qwen (local) OR API (cloud)

Prompt templates (plumbing-specific)

SMS/email integration (Twilio or similar)

🔥 Your Demo Strategy (IMPORTANT)

You do NOT:

Show code

Talk about models

Talk about tokens

Talk about AI architecture

You DO:

Show conversation

Show summary

Show speed

Show money impact

🧨 Final Truth

You are not selling AI.

You are selling:

“Never miss a job again
```
