# Chervil — Hosted Tier Proposal

> A plan for the paid, server-backed product ("Chervil Cloud"). The open-source
> Electron client stays free and BYO-key; the hosted tier adds the things that
> *require a server you run*. See [capabilities-and-monetization.md](capabilities-and-monetization.md)
> for the why and [execution-control.md](execution-control.md) for the trust model.
>
> Status: planned, **not building yet (by choice)**. Core decisions locked 2026-06-19.

## Decisions (locked 2026-06-19)

- **Managed inference** is the paid model — Chervil holds provider keys server-side
  and meters usage; the free tier stays BYO-key. Cap aggressively to control cost.
- **First paid feature: the Cloud Scheduler (#6)** (after the auth + billing
  foundation). Video transcription (#5) comes later.
- **Backend not being built yet** — this is the plan of record; pick it up when ready.
- Stack/auth/billing as recommended below (Vercel + worker + Postgres + Clerk +
  Stripe) unless revisited.

---

## Why a backend at all

Everything shipped so far runs client-side. Two roadmap items — and the paid
business — fundamentally can't:

- **Cloud scheduler (#6):** scheduled agents that run when the app is closed /
  the machine is off. Requires a server that runs on a cron and executes the
  agent on its own.
- **Audio-transcription video (#5):** caption-free / Vimeo / Rumble summaries via
  yt-dlp + Whisper. Heavy binaries + cost + ToS exposure → belongs server-side.

Plus the larger paid surface: **managed/keyless inference**, **cross-device sync**,
**premium data sources**, and a **capability marketplace** with billing.

**A big advantage we already have:** `lib/agent.js` and `lib/models/*` are plain
Node and provider-agnostic. The backend can `require` the *same* compose pipeline
the client uses — so server-side agent runs aren't a rewrite.

---

## Architecture (recommended)

Keep the client open-source and unchanged for free users. Add a backend the
signed-in, paid client talks to.

| Concern | Recommendation | Notes |
|---|---|---|
| **API** | Next.js API routes on **Vercel** | We already use Vercel for the site; one platform. |
| **Long jobs** (transcription, scheduled runs) | a **worker** (Upstash QStash queue → a small worker on Fly.io/Railway) | Serverless has ~60–300s limits; transcription/agent runs can exceed it. |
| **Cron** | **Vercel Cron** → enqueue due schedules → worker runs them | Decouples "is it due" from "run it." |
| **DB** | managed Postgres (**Neon** or **Supabase**) | accounts, schedules, usage, artifacts metadata. |
| **Object storage** | **Vercel Blob** or S3 | generated pages / exports / transcripts. |
| **Auth** | **Clerk** (or Auth.js) | Electron opens the browser for OAuth/PKCE → token → API calls. |
| **Billing** | **Stripe** subscriptions | gate features by plan; metered usage for inference. |
| **Inference** | reuse `lib/models/*` server-side | managed mode = Chervil's keys, metered; BYO mode = client sends its key per request. |

Client ↔ cloud: the Electron app signs in (browser PKCE), stores a token, and
calls the API for hosted features. Everything else stays local.

---

## Recommended v1 scope (smallest valuable paid thing)

Don't build all of it. Sequence:

1. **Foundation** — accounts (Clerk) + Stripe subscription + a thin authed API +
   DB. No features yet; just "can sign in and be on a plan."
2. **First paid endpoint — server-side video transcription (#5).** Self-contained,
   clear value, no client changes beyond calling the endpoint. Proves the worker +
   billing loop. (yt-dlp + Whisper on the worker; cap length/usage.)
3. **Cloud scheduler (#6).** Move schedules server-side; Vercel Cron + worker run
   the agent (reusing `lib/`), deliver results via email/push and sync to the app
   on next open. The first feature that's impossible client-side and clearly worth
   paying for.
4. **Managed inference + sync** — keyless usage (Chervil's keys, metered) and
   cross-device state. Highest value, highest cost/ops; do once 1–3 are proven.
5. **Marketplace** — paid agents/capabilities with revenue share. Last.

---

## The big open decisions (yours)

1. **Managed inference vs. stay BYO-key?** Managed removes the #1 friction (no key
   wrangling) and is the strongest paid hook — but Chervil then pays the provider
   bills and must meter + cap aggressively. Recommendation: keep BYO-key free
   forever; offer managed inference as the headline paid perk, usage-capped.
2. **Pricing model:** flat monthly (simple) vs. usage-based (fairer, more complex).
   Recommendation: a flat plan with generous caps for v1; add usage tiers later.
3. **Hosting shape:** Vercel-only (simplest) vs. Vercel + a worker host (needed for
   long jobs). Recommendation: Vercel for API/site + one small worker (Fly/Railway)
   for transcription and scheduled runs.
4. **Auth/billing vendors:** Clerk + Stripe (fastest) vs. roll-your-own (don't).

---

## Cost & risk notes

- **Inference is the cost center** if managed — meter every call, hard-cap per
  plan, and alert. Start conservative.
- **Transcription** (Whisper/compute + yt-dlp egress) — cap video length; charge or
  credit-meter it.
- **ToS:** server-side downloading from YouTube/Vimeo/Rumble carries ToS risk; keep
  it to the paid tier with clear terms, and prefer provider-native (Gemini) where
  possible.
- **Trust/security:** the hosted tier holds tokens and possibly provider keys —
  the execution-control model extends to the server (least privilege, audited,
  no secret in logs).

---

## Milestones

1. Decisions locked (this doc) → 2. Auth + Stripe + API skeleton → 3. Video
transcription endpoint (first revenue) → 4. Cloud scheduler → 5. Managed
inference + sync → 6. Marketplace.

*Next action: lock the four decisions above, then scaffold milestone 2.*
