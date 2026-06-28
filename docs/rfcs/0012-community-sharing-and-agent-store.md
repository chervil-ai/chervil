# RFC 0012 — Community sharing: agent publishing + the Agent store

- **Status:** Implemented (pending prod migration) — 2026-06-28
- **Author:** Rod Trent (with Sprig)
- **Depends on:** [RFC 0002](0002-hosted-lessons-and-pro.md) (accounts/publishing), [RFC 0010](0010-chervil-on-the-web.md)

## Summary

Extend publishing three ways:

1. **Publish agents.** Agents become a first-class published type (like pages and
   lessons): public/unlisted/private, shown in an **Agents** section on the user's
   `/profile/<username>`, and **importable** by other Chervil users with one click.
2. **A central community share.** Users submit their published agents and pages to
   a curated **Agent store** (`/store`) and **Share gallery** (`/share`), organized
   by category tabs.
3. **Approval + vetting.** Every submission is **LLM pre-vetted** then **manually
   approved** by an admin before it appears publicly.

## Data model (website Postgres)

- **`agents`** — mirrors `pages`: `agent_json` holds the portable config
  (`persona`, `model`, `provider`, `mcp`, `starters`), plus `category`,
  `visibility` (public/unlisted/private), `flagged`. `agent_events`
  (view/import) and `agent_reports` (abuse) mirror the page tables.
- **`submissions`** — one moderation row per submitted item:
  `item_type` (agent|page), `item_id`, `category`, `status`
  (pending/approved/rejected), `vet_verdict` (pass/flag/fail) + `vet_notes` from
  the LLM, `review_notes`. The store/gallery list `status = 'approved'` rows
  joined to the live item. (No FK on `item_id` — it points at one of two tables —
  so deletes clear submissions explicitly.)

Categories are a shared 12-item taxonomy ([`lib/categories.ts`]).

## Flows

- **Publish (app → web):** `chervil:publish-agent` POSTs the agent to
  `/api/agents` (publish-token auth, free-tier cap), upserting by `(owner,
  source_id)` so re-publish updates in place. Mirrors `/api/pages`.
- **Import (web → app):** an agent page (`/a/<id>`) has an **Open in Chervil**
  button → `chervil://import-agent?u=<json url>`; the app fetches the JSON
  (`/api/agents/<id>`) and adds it to Agents. A "Get Chervil" fallback shows when
  the app isn't installed. Same pattern as page remix (RFC: shareable pages).
- **Submit:** `/api/submit` (Clerk-authed) verifies ownership + public visibility,
  runs `vetSubmission()` (managed inference — **fails open to manual review** if
  unavailable), and upserts a `pending` submission. UI lives on `/me`.
- **Moderate:** `/admin` (gated by the `ADMIN_USER_IDS` env allowlist) lists
  pending submissions with the auto-vet verdict/notes; approve (sets category) or
  reject (with a note). `/api/admin/submissions/[id]` performs the action.

## Decisions

- **Vetting = LLM pre-vet + human approve.** Nothing is auto-published; the LLM
  only annotates. Fail-open: a missing key never auto-approves.
- **Admin = env allowlist** (`ADMIN_USER_IDS`, comma/space-separated Clerk ids).
  No schema change; grant more by editing the env var.
- **Categories:** Productivity, Coding & Dev, Security, Research, Writing,
  Education, Business & Finance, Marketing, Data & Analytics, Creative,
  Lifestyle, Other.

## Deploy steps (manual, prod)

1. Apply `db/schema.sql` to the production Postgres (idempotent — new
   `CREATE TABLE IF NOT EXISTS`s only).
2. Set `ADMIN_USER_IDS` in the website's Vercel env to the moderator Clerk id(s).

## Out of scope (later)

Ratings/featured ranking, store search, agent versioning/changelogs, store
analytics for authors, and moderation of `agent_reports` (abuse auto-flag is
inherited but not yet surfaced in `/admin`).
