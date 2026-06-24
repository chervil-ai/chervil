# RFC 0007 — Hosted interactive & living pages (Chervil Pro server tier)

- **Status:** Draft (design — no backend yet; this is the plan of record for bet #3)
- **Author:** Rod Trent (with Sprig)
- **Created:** 2026-06-24
- **Depends on:** [hosted-tier.md](../hosted-tier.md), [RFC 0002](0002-hosted-lessons-and-pro.md) (accounts/billing/publish), [RFC 0004](0004-cloud-data-sources.md) (cloud data sources), [execution-control.md](../execution-control.md)

## Summary

The Pro features that **fundamentally require a server Chervil runs** — the
"server-cost" tier. Two headline capabilities (the strongest paywall pair):
**hosted applets** (a published page's `window.chervil.ask` works for *viewers* on
the web) and **cloud living pages** (a published page that auto-refreshes on a
schedule, server-side, staying current for everyone). Cloud/indexed **data
sources** are the third leg, already designed in [RFC 0004](0004-cloud-data-sources.md)
— referenced here, not redesigned. This RFC picks the architecture and, critically,
resolves **key custody for server-side inference** — the hard decision everything
else hangs on. No code until the decisions below are locked.

## Why these need a backend (recap)

Everything shipped is client-side. These can't be:
- **Hosted applets:** a published page served at `/p/<id>` or `/learn/<id>` runs in
  a sandbox with no `window.chervil` bridge — its applets currently degrade. To make
  them live for a viewer, an authed server endpoint must answer `ask` calls.
- **Cloud living pages:** re-grounding a page on a schedule when the author's app is
  closed requires a server cron + worker running inference unattended.

Both incur **recurring token + compute cost** — which is exactly what justifies a
subscription (per hosted-tier.md: "managed inference is the paid model; cap
aggressively").

## Architecture

Reuse the hosted-tier stack: **Vercel** (API/site) + a **worker** (Fly/Railway) for
long/scheduled jobs + **Postgres** + **Clerk** + **Stripe**, and — the advantage we
keep — the **same `lib/agent.js` + `lib/models/*` compose pipeline** the app uses,
`require`d server-side.

```
 Hosted page (/p/<id>, /learn/<id>)            getchervil.com + worker
 ┌───────────────────────────┐   ask          ┌───────────────────────────────────┐
 │ applet → bridge shim       │ ─────────────▶ │ POST /api/ask  (authed, metered,  │
 │  (injected on hosted pages)│                │   rate-limited) → lib/models/*     │
 └───────────────────────────┘                │ Vercel Cron → enqueue due "living" │
                                              │   pages → worker re-grounds (lib/) │
 author's published page  ◀── refreshed HTML ─│   → store new HTML + notify        │
                                              └───────────────────────────────────┘
```

## The central decision — key custody for server-side inference

RFC 0002 decided hosted *applets* are **BYO-key**. But that only covers a viewer who
*has* a key; and **cloud living pages run unattended** (no viewer, no live key). So:

- **Cloud living pages → managed inference (Chervil's keys, server-side), metered &
  hard-capped per plan.** There is no viewer key at refresh time, so this is the only
  option. This is the real recurring cost and the core Pro justification. Cap
  aggressively (refresh frequency limits, per-plan token budgets, alerts).
- **Hosted applets → two modes:** (a) **BYO-key** (viewer/author key, relayed through
  `/api/ask`, zero Chervil cost — the RFC 0002 default; degrades for keyless viewers);
  (b) **managed** (seamless for any viewer, metered to the author's plan, capped).
  _Lean: ship BYO-key first (no cost exposure), add managed as a Pro upgrade._
- **Keys never sit in the model's context or logs** (execution-control). Managed keys
  live only in the worker/API env; BYO keys are per-request, never stored.

## Phasing

| Step | Scope | Gate |
|---|---|---|
| **7.1** | `POST /api/ask` — authed, rate-limited, BYO-key relay; inject a bridge shim into hosted pages so applets call it. | RFC 0002 accounts |
| **7.2** | Managed inference for `/api/ask` (metered + hard-capped) — seamless live applets for viewers. | 7.1 + metering |
| **7.3** | Cloud living pages — Vercel Cron → worker re-grounds due pages via `lib/`, stores new HTML, notifies; managed inference, frequency-capped. | 7.2 + worker |
| **7.4** | Cloud/indexed data sources — see [RFC 0004](0004-cloud-data-sources.md) phase 2. | worker + pgvector |

## Open decisions

1. **Managed vs BYO-key for hosted applets** — _lean: BYO first, managed as upgrade._
2. **Metering + caps** — per-plan token budgets, refresh-frequency limits, overage
   behavior (degrade vs block vs charge). _Lean: hard-cap + degrade for v1._
3. **Worker host** — Fly vs Railway (hosted-tier leans "a small worker").
4. **Abuse/rate limits** on public `/api/ask` (a public, token-spending endpoint) —
   per-account + per-IP limits, and bot protection.
5. **Living-page refresh cadence** floor (e.g. ≥ hourly on Pro) to bound cost.

## Risks

- **Cost runaway** — managed inference is the cost center; meter every call, cap hard,
  alert. Living pages especially (unattended + recurring).
- **Abuse** of a public token-spending endpoint — strict rate limits + auth.
- **Unit economics** — keep BYO-key paths to bound exposure; price managed features
  to cover metered cost.
- **Scope** — this is the largest backend lift; do 7.1 (BYO relay, no cost) before
  any managed/cron work. Don't start until RFC 0002's accounts/billing exist.

*Next action: lock decisions 1–2, stand up RFC 0002's accounts/billing foundation,
then build 7.1 (BYO-key `/api/ask` + hosted bridge shim) — the no-cost first rung.*
