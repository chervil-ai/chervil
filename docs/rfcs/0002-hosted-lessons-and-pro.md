# RFC 0002 — Hosted lessons & Chervil Pro (Phase 2B)

- **Status:** Draft (design — no code yet)
- **Author:** Rod Trent (with Sprig)
- **Created:** 2026-06-22
- **Depends on:** [RFC 0001](0001-interactive-lessons.md) (the learning vertical, shipped)
- **Repos:** `chervil-ai/chervil` (app) + `chervil-ai/website` (getchervil.com, Next.js 16 / Vercel)

## Summary

Let a learner **publish** a lesson to a shareable `getchervil.com/learn/<id>` URL —
the growth loop *and* the **Chervil Pro** paywall. The app, local creation, and
standalone `.html` export stay **free**; hosting is the paid convenience. This
RFC is a design pass: it picks an architecture, names the stack decisions, and
phases the work. **No code until the stack decisions below are made.**

## Goals / non-goals

**Goals:** one-click publish from the app; a fast public lesson page with social
(OG) previews; completion analytics; a learner library/profile; live applets on
hosted lessons (Pro); a Stripe-billed Pro tier.

**Non-goals (for 2B):** collaborative editing, a web-based authoring UI (creation
stays in the app), discovery/marketplace, non-YouTube media.

## Architecture

```
 App (Electron)                         getchervil.com (Next.js 16 / Vercel)
 ┌────────────────────┐   publish        ┌───────────────────────────────────┐
 │ Lesson JSON         │ ───────────────▶ │ POST /api/lessons (auth)          │
 │ lessonToHtml(reader)│   (Pro)          │  → store JSON + pre-rendered HTML  │
 └────────────────────┘                   │  → return /learn/<id>             │
                                          │ GET /learn/[id]  (SSR + OG meta)   │
   learner on phone ◀───── shareable URL ─│  serves reader HTML + CTA          │
                                          │ POST /api/ask  (Pro, metered)      │
                                          │  → hosted applet bridge            │
                                          └───────────────────────────────────┘
```

**Key decision — serve a pre-rendered HTML artifact, not a shared renderer.**
The app already produces a self-contained reader document (`lessonToHtml(lesson,
{reader:true})`, with its hardening CSP). Publishing uploads **(a) the Lesson
JSON** (for analytics/structure/regeneration) **and (b) that pre-rendered HTML
blob**. The website serves the blob inside a thin SSR wrapper that injects OG
tags + a "Make your own / Get Chervil" CTA. This avoids porting the CommonJS
renderer into the Next/TS app and keeps a single source of truth (the app). The
alternative — extract `lib/lesson*.js` into a shared npm package both repos
import — is cleaner long-term but heavier; revisit if the website needs to
re-render server-side.

**Hosted applets (Pro).** A pre-rendered reader's applets call
`window.chervil.ask`, which doesn't exist on a hosted page. For Pro lessons the
website injects a small bridge that routes `ask` → `POST /api/ask` (a metered,
authenticated endpoint that calls the provider). This is where hosting incurs
token cost, which is exactly why it's a Pro feature (or BYO-key). Free/shared
files keep degrading applets gracefully.

**Security carries over + new surface.** The reader's sanitized concept HTML +
hash-based CSP (RFC 0001 review fixes) apply to the served blob too. NEW surface
that 2B must handle: public user-generated content → **abuse/moderation**, and a
public **`/api/ask`** → auth + per-account **rate limiting** + token quotas.

## Stack (DECIDED 2026-06-22)

| Concern | Choice |
|---|---|
| Data store | **Vercel Postgres** (relational: users, lessons, events) + **Vercel Blob** (the pre-rendered HTML artifacts) |
| Auth | **Clerk** (prebuilt auth UI; maps Clerk user → our `users` row) |
| Payments | **Stripe** subscription + webhook (Pro entitlement synced to `users.pro`) |
| Hosting | Vercel (already) |
| Analytics | `lesson_events` table (view/start/complete/card) + Vercel Analytics (installed) |

**Hosted applet tokens — DECIDED: BYO-key.** Hosted applets use the viewer's (or
author's) own AI key; we bear no token cost. This matches Chervil's
bring-your-own-AI ethos and keeps Pro unit economics clean. `POST /api/ask` is a
thin authed/rate-limited relay that uses the caller-supplied key (held client-side
or per-account, never ours). Free shared files still degrade applets gracefully.

## Pro vs Free

- **Free:** the app, unlimited local lessons, standalone `.html` export, and a
  small number of published lessons (e.g. **3**) so the loop still spreads.
- **Pro (subscription):** unlimited published lessons, **live applets** on hosted
  lessons, completion **analytics**, a public **profile/library**, custom OG
  branding. Token-bearing features (hosted `/api/ask`) are quota'd or BYO-key.

## Phasing (within 2B)

| Step | Scope |
|---|---|
| **2B.1** | Chervil accounts: auth + Stripe Pro subscription + account state synced to the app |
| **2B.2** | Publish pipeline: `POST /api/lessons` (store JSON + HTML), `GET /learn/[id]` SSR with OG, CTA, free-cap enforcement |
| **2B.3** | Hosted applet bridge: `POST /api/ask` (authed, metered, rate-limited) + injection into served lessons |
| **2B.4** | Completion analytics + learner library/profile pages |
| **2B.5** | Moderation: report/abuse flow, takedown, basic content checks |

## Open decisions

1. ~~Stack~~ — **DECIDED:** Vercel Postgres + Blob + Clerk + Stripe.
2. ~~Hosted applet tokens~~ — **DECIDED:** BYO-key.
3. **Free publish cap**: number of free hosted lessons before Pro (lean: **3**). _(default unless changed)_
4. **Served artifact**: pre-rendered HTML blob (chosen for v1) vs shared renderer package (revisit later).

## Implementation is gated on external setup

2B.1 (accounts/billing) can't be wired until these exist and their secrets are
provided (the secret-free foundation — DB schema, `.env.example` — can land now):

- **Clerk** app → `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- **Stripe** account + a Pro product/price → `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price id
- **Vercel Postgres** database → `POSTGRES_URL` (+ pooled vars)
- **Vercel Blob** store → `BLOB_READ_WRITE_TOKEN`

## Risks

- **Unit economics** of hosted `/api/ask` — token cost per Pro user. Mitigate
  with quotas/BYO-key (decision 3).
- **Moderation load** of public UGC — start with report + takedown, not pre-review.
- **Cross-repo coupling** if we later share the renderer — the blob approach
  defers this.
- **Scope** — 2B is the largest phase yet; 2B.1 (accounts/billing) is a project
  on its own. Sequence strictly; don't start 2B.2+ until accounts exist.
