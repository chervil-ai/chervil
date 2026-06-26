# RFC 0009 — Published-page metrics (views & engagement)

- **Status:** Draft (design — needs a small getchervil backend addition; client surfaces ready to wire)
- **Author:** Rod Trent (with Sprig)
- **Created:** 2026-06-26
- **Depends on:** [RFC 0002](0002-hosted-lessons-and-pro.md) (accounts/publish), [RFC 0007](0007-hosted-interactive-and-living-pages.md) (hosted tier stack), [hosted-tier.md](../hosted-tier.md)

## Summary

Surface **view counts and light engagement metrics** for everything a user has
published (lessons, pages, blog posts) — inside the Chervil desktop app, at the
point of publishing and in a "Your published" list. Today the app publishes to
getchervil.com and immediately forgets: `publishCurrentLesson` / `publishCurrentPage`
store only `entry.publishedUrl`, and `/api/account` returns just `{ pro, username }`.
There is **no metrics surface anywhere in the app**. This RFC closes that gap —
"metrics on everything published," which authors expect once they've shared a link.

This is the smallest backend-dependent Pro polish: the hosted stack already records
requests (it serves the pages); we just need to count views and expose them.

## Why a (small) backend change is needed

View counts can only be recorded where the page is *served* — getchervil.com (Vercel),
not the client. The client cannot count its own published pages' web traffic. So the
backend must (a) increment a counter on each hosted page render, and (b) expose the
totals to the authenticated author. Everything else (display, fetching, caching) is
client-side and is ready to build the moment the API lands.

## API contract (the backend addition)

Two options; **Option A preferred** (fewer round-trips, one list view).

**Option A — enrich `/api/account`** (already called on app start for `{pro, username}`):
```
GET /api/account            Authorization: Bearer <publishToken>
→ { pro, username,
    published: [
      { id, kind: "lesson"|"page"|"blog", title, url, sourceId,
        createdAt, updatedAt,
        stats: { views: <int>, uniques: <int>, last7: <int>, lastViewedAt } }
    ] }
```
`sourceId` lets the client match a published item back to a local `entry.id`
(see RFC 0009 ↔ the stable-URL re-publish work: lessons now send `sourceId`).

**Option B — per-item stats endpoint** (if the account payload must stay lean):
```
GET /api/lessons/:id/stats  → { views, uniques, last7, lastViewedAt }
GET /api/pages/:id/stats    → { … }
```

### Counting (backend, server-side)
- Increment on each hosted render of `/learn/:id`, `/p/:id`. The reader iframe
  request (`/learn/:id` fetched by the wrapper) is the natural hook — count the
  **wrapper page** load, not the iframe, to avoid double-counting.
- **uniques:** hashed `IP + UA + day` (no PII stored; salt rotated daily). Honor
  `DNT: 1` → count as a view, skip the unique.
- Ignore the author's own views (authed session) and known bots (UA allowlist).
- `last7` = rolling 7-day sum (cheap: a per-day counts row, summed).

### Data model (Postgres)
```
page_view_daily ( page_id, day DATE, views INT, uniques INT, PRIMARY KEY(page_id, day) )
-- upsert on render; totals = SUM over days. No per-event row needed for v1.
```
A per-event table (referrer, path, dwell) is a **v2** concern — not for this RFC.

## Client surfaces (ready to wire; no backend dependency to build the UI shell)

1. **"Your published" panel** — new section in the Library/account overlay (it
   currently only renders `pro`/`username` via `renderAccount`). List each published
   item: title, kind chip, URL (copy/open), and **👁 N views · M this week**. Sort by
   recent or most-viewed. This is the home for metrics.
2. **Post-publish confirmation** — the "Published — it's live at <url>" message already
   shown by `publishCurrentLesson`/`publishCurrentPage` gains a subtle "track views in
   Library → Published" affordance.
3. **Per-entry badge** — when a published entry is open, show its view count in the
   omnibox status area or remix bar (cached, refreshed on focus). Optional v1.

All three **degrade gracefully**: if `stats` is absent (old API), show nothing — no
errors, no empty "0 views" noise. So the client shell can ship before the backend and
light up automatically when the API returns `stats`.

## Privacy & cost

- Counts only — no IPs, no user agents, no precise location persisted (hashed daily
  bucket for uniques, salt rotated). DNT honored for uniques.
- Counting is a single upsert per render — negligible cost; no new worker, no inference.
  This is the *cheapest* Pro feature (cf. RFC 0007's metered inference).
- Author-facing only by default; a public "N views" badge on the hosted page is a
  separate opt-in decision (out of scope here).

## Phasing

- **v1 (this RFC):** total views + uniques + last7 per published item; "Your published"
  list in the app; graceful-absent client shell. Option A API.
- **v2 (later):** time-series sparkline, top referrers, lesson card-completion funnel
  (the reader already `postMessage`s `start`/`card`/`complete` — wire those to an
  authed beacon for completion analytics).

## Open questions

1. Option A (enriched account) vs B (per-item) — A unless the account payload is hot
   enough that the `published[]` join hurts. Lean A.
2. Bot filtering aggressiveness — start permissive (count everything but obvious bots),
   tighten if numbers look inflated.
3. Do free-tier users get view counts, or is it Pro-gated? Recommend: **basic view
   counts free** (a hook into Pro), richer analytics (referrers, funnel) Pro-only.

## Client work that can land NOW (zero backend dependency)

- Pass-through `published`/`stats` from `/api/account` in the `chervil:account-status`
  handler (currently drops everything but `pro`/`username`).
- Build the "Your published" list UI reading that pass-through; render the view badge
  only when `stats` is present. Ships dark until the API returns data — then lights up.
