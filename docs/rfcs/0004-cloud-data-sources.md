# RFC 0004 — Cloud-synced data sources (Chervil Pro)

- **Status:** Draft (design — no backend yet; a free local on-ramp can land now)
- **Author:** Rod Trent (with Sprig)
- **Created:** 2026-06-23
- **Depends on:** [RFC 0002](0002-hosted-lessons-and-pro.md) (Chervil accounts + Pro billing), [hosted-tier.md](../hosted-tier.md) (the "premium data sources" surface)
- **Repos:** `chervil-ai/chervil` (app) + `chervil-ai/website` (getchervil.com, Next.js / Vercel) + worker

## Summary

Let a user **designate folders (local, OneDrive, or Google Drive) as persistent
data sources**, sync them to Chervil Cloud, and have Sprig **automatically
retrieve the most relevant files per query** (RAG) instead of the user
hand-attaching files one at a time. The app, BYO-key compose, and one-shot file
attachment stay **free**; durable, indexed, cross-device sources are the **Pro**
convenience. This is a design pass — it picks an architecture and phases the work.

## Problem / today's state

Uploaded files are **ephemeral**. `addFiles` → `readAttachment`
([src/renderer.js](../../src/renderer.js)) reads each file into memory as
base64/text, capped at **6 files / 12 MB each**, attaches them to the *next* turn,
then `clearAttachments()` drops them. Nothing is persisted; there is no
data-source library, no folder concept, and no retrieval. For "lots of files,"
re-attaching by hand every turn doesn't scale. (Contrast: pages/state persist to
`chervil-state.json`; API keys live encrypted in `chervil-keys.bin` via
`safeStorage`.)

## Goals / non-goals

**Goals:** designate one or more **folders** as sources; sync their contents to
the cloud; server-side **index (chunk + embed)**; per-query **retrieval** injected
into the existing compose pipeline; cross-device availability; sensible size/count
limits far above the 12 MB attach cap; incremental re-sync on change.

**Non-goals (v1):** real-time collaborative sources; native Google Drive / MS
Graph API ingestion (covered free by pointing at the *desktop-synced* folder —
see below); OCR/audio extraction beyond text + PDF; a web authoring UI.

## Key insight — "OneDrive / Google Drive" need no cloud API

On Windows, OneDrive and Google Drive are **ordinary synced local folders**. A
single **local folder picker** (`dialog.showOpenDialog`, `properties:
['openDirectory']`) therefore covers all three for free — the user points Chervil
at `…/OneDrive/Notes` or `…/Google Drive/Research` exactly as they would a plain
local folder. Native Drive/Graph OAuth ingestion is a *later* enhancement, not a
v1 requirement.

This makes **folder designation a backend-agnostic, free, ship-now on-ramp**: the
client can let users register folders and enumerate files locally today; the Pro
cloud layer (sync + index + retrieve) lands on top when the backend exists.

## Architecture

```
 App (Electron)                              Chervil Cloud (Vercel + worker)
 ┌──────────────────────────┐  register      ┌──────────────────────────────────┐
 │ Folder picker (local /    │ ─────────────▶ │ POST /api/sources  (auth)        │
 │  OneDrive / GDrive path)  │  + upload      │  → source row + file blobs        │
 │ enumerate + hash files    │ ─────────────▶ │ POST /api/sources/:id/files      │
 │ (mtime/size delta sync)   │                │  → enqueue index job (worker)     │
 └──────────────────────────┘                │ worker: chunk + embed → vec store │
            ▲                                 │ GET  /api/sources/:id/search?q=   │
 compose ───┘  relevant chunks  ◀──────────── │  → top-k chunks for a query      │
 (lib/agent.js injects retrieved context)     └──────────────────────────────────┘
```

- **Client** owns folder designation, change detection (mtime+size or content
  hash), and upload of new/changed files. Designated folders persist in app state.
- **Server** stores file blobs (Vercel Blob/S3), metadata + chunks + embeddings
  in Postgres (`pgvector`), and runs indexing on the **worker** (heavy/long).
- **Retrieval** at compose time: the authed client calls `…/search?q=<query>`,
  gets top-k chunks, and feeds them to the **existing** `lib/agent.js` compose
  pipeline as context — no rewrite, mirroring how attachments already flow in.

**Reuse, not rewrite.** `lib/agent.js` and `lib/models/*` are provider-agnostic
Node; the worker can `require` the same compose/embedding helpers the client uses
(the advantage hosted-tier.md already calls out).

## API contract (proposed)

| Endpoint | Purpose |
|---|---|
| `POST /api/sources` | Create a source (name, origin path hint, kind). Returns `{ id }`. |
| `GET /api/sources` | List the account's sources + index status/counts. |
| `POST /api/sources/:id/files` | Upload new/changed files (multipart or blob refs + content hashes). Enqueues indexing. |
| `DELETE /api/sources/:id/files` | Remove files no longer present locally (sync deletes). |
| `GET /api/sources/:id/search?q=&k=` | Top-k retrieved chunks for a query. |
| `DELETE /api/sources/:id` | Delete a source + its blobs/index. |

Auth reuses the RFC 0002 account token (Clerk → bearer), same shape as
`publishLesson`/`publishPage` already use. Stubbing these client-side ahead of the
server is consistent with the existing publish stubs.

## Pro vs Free

- **Free:** the app, one-shot attachments (current behavior), and **local folder
  designation + enumeration** (register a folder, browse it, pull files into a
  turn's attachments on demand — no upload, no index, no sync).
- **Pro:** cloud **sync** of designated folders, server-side **indexing + RAG
  retrieval**, **cross-device** sources, and higher size/count limits.

This keeps the free on-ramp genuinely useful and makes the paid line crisp:
*persistence + indexing + cross-device* is the Pro value.

## Phasing

| Step | Scope | Gate |
|---|---|---|
| **4.1 (free, now)** | Folder picker IPC (`openDirectory`) + persist designated folders in app state + a Sources panel that enumerates a folder and lets the user attach files from it on demand. Backend-agnostic. | none |
| **4.2** | Cloud sync: `POST /api/sources` + file upload with content-hash delta; client change detection + re-sync. | RFC 0002 accounts + Blob store |
| **4.3** | Server indexing: worker chunk+embed → `pgvector`; index-status surfaced in the Sources panel. | worker + Postgres/pgvector |
| **4.4** | Retrieval at compose: `…/search?q=` wired into `lib/agent.js`; "sources used" cited on the page. | 4.3 |
| **4.5** | Native Drive/Graph OAuth ingestion (optional, beyond synced-folder coverage). | OAuth apps |

## Open decisions (yours)

1. **Embedding provider/model** — managed (Chervil keys, metered, a cost center)
   vs BYO-key embeddings (matches the 0002 hosted-applet BYO decision). _Lean:
   BYO-key to keep Pro unit economics clean, consistent with RFC 0002._
2. **Vector store** — `pgvector` on the existing Postgres (one fewer vendor) vs a
   dedicated store (Pinecone/Turbopuffer). _Lean: `pgvector` for v1._
3. **Limits** — per-source file count, per-file size, total GB per plan. _Lean:
   generous flat caps for v1, usage tiers later (mirrors hosted-tier pricing)._
4. **Sync trigger** — manual "Sync now," on app focus, or a filesystem watcher.
   _Lean: manual + on-focus for v1; watcher later._
5. **Privacy/encryption** — source content leaves the device for Pro; document it
   in the trust model ([execution-control.md](../execution-control.md)) and
   consider at-rest encryption + per-account isolation.

## Risks

- **Cost** — embeddings + storage scale with corpus size; meter and cap. BYO-key
  embeddings (decision 1) defers most of it.
- **Privacy** — uploading personal folders is sensitive; explicit per-folder
  opt-in, clear UI on what syncs, easy delete, and the trust model must extend to
  the server (least privilege, no content in logs).
- **Sync correctness** — deletes/renames/large folders; content-hash delta + a
  "Sync now" with visible status reduces foot-guns.
- **Scope** — 4.2+ depends entirely on the unbuilt backend (RFC 0002 / hosted
  tier). Ship **4.1 free** first; don't start 4.2 until accounts exist.

## Implementation gating

4.2+ can't be wired until the RFC 0002 foundation (accounts/billing/authed API)
and these exist: a **Blob/S3** store, **Postgres + pgvector**, and the **worker**
(reused from the hosted-tier plan). The secret-free parts — 4.1 client on-ramp,
DB schema, `.env.example` keys — can land now.

*Next action: confirm 4.1 (free local folder on-ramp) as the immediate build, and
lock decisions 1–2 before 4.2.*
