# RFC 0013 — Your Web (the personal page index)

- **Status:** Draft (phase 1a in progress)
- **Author:** Rod Trent (with Sprig)
- **Created:** 2026-07-16
- **Depends on:** nothing (deliberately — this is local-only and needs no account, no backend, and no new dependency)
- **Related:** [RFC 0004](0004-cloud-data-sources.md) (cloud/indexed folders — the *Pro* cousin of this), [RFC 0005](0005-sync-between-computers.md) (folder sync — this RFC changes what gets synced)
- **Repo:** `chervil-ai/chervil` (app only)

## Summary

Give Chervil a **local, searchable index of the pages you compose and the sites
you read**, and let Sprig answer from it. This turns three things on:

1. **Re-finding** — "what was that laptop review I read last month?" answered from
   your own reading, instantly, free, offline, with no web search at all.
2. **Instant answers** — a question you've already asked serves the page you
   already have instead of a 20-second re-compose.
3. **Ambient synthesis** — Sprig can notice you've read eight pages on a topic and
   assemble a dossier, because there is finally something to assemble *from*.

It is also the fix for Chervil's worst performance problem, which is not a
coincidence — see "Problem" below.

## Problem / today's state

**Chervil hoards what it writes and forgets what it reads, and neither is
searchable by meaning.**

- `addToLibrary` ([src/renderer.js](../../src/renderer.js)) stores the **full HTML**
  of every composed page, plus a conversation and history snapshot, capped at
  `MAX_LIBRARY = 100` — inside the single `chervil-state.json` blob.
- `recordSiteVisit` stores `{ id, url, title, at }`. **The content of every real
  site you read is thrown away** — the same thing Chrome does, from a product whose
  entire premise is that it can read.
- The only way to find a past page is by scanning titles in the Library drawer.

The storage shape makes this actively expensive. Measured on Rod's machine
(2026-07-16): `chervil-state.json` is **3.93 MB** (library ~64%, bookmarks ~24%),
lives on OneDrive, and `scheduleSave` re-serializes **all of it** on a 500 ms
debounce from ~100 call sites — including every chat message and every checkbox
click inside a composed page. The main process then re-reads, merges,
re-stringifies and rewrites the whole file. `mergeStates` unioned the library with
no cap, so each cross-machine sync ratcheted it upward (trash reached 164 against
a limit of 100; capped 2026-07-16).

So the raw material for a personal index already exists — stored in the one shape
that is simultaneously **too heavy to load and too dumb to query.** Fixing the
storage and building the index are the same piece of work.

## Goals / non-goals

**Goals:** a local page store that isn't the session blob; full-text search over
composed pages *and* visited sites; retrieval that feeds the existing compose
pipeline; an answer cache; a privacy model that is airtight on day one; no new
runtime dependency; no account, no backend, no network.

**Non-goals (v1):** cloud sync of the index (RFC 0004 is the Pro cousin; the index
is deliberately machine-local); semantic/vector recall (see "Embeddings" below —
deferred, not rejected); OCR; indexing PDFs/attachments (later, easy once the
store exists); sharing or publishing index contents.

## Key finding — SQLite is already here

Verified on 2026-07-16 against this repo's Electron:

```
electron 39.8.5 · node 22.22.1 · chrome 142.0.7444.265
require('node:sqlite') -> AVAILABLE  { DatabaseSync, StatementSync, constants, backup }
CREATE VIRTUAL TABLE … USING fts5 -> WORKS
```

**`node:sqlite` ships in the bundled Node, and FTS5 is compiled in.** So the whole
bet costs **zero new dependencies**: no `better-sqlite3`, no `electron-rebuild`, no
native-module step in the installer, no ABI risk on Electron upgrades.

Caveat: `node:sqlite` is flagged experimental and prints an `ExperimentalWarning`
(suppressible). Its API may change across Node majors. Accepted — the API surface
we use (`DatabaseSync`, `prepare`, `run`, `get`, `all`, `exec`) is small and stable,
Electron pins Node, and the fallback (`better-sqlite3`) stays available if it ever
breaks. The schema is plain SQLite either way, so the data outlives the driver.

## Key decision — do NOT distill on ingest

An earlier framing asked whether page distillation should run on a **local model**
(free/private/slow) or the **user's BYO key** (fast/costed). That was the wrong
question. The answer is **neither: don't run a model on ingest at all.**

- **Store the readable text.** FTS5 gives BM25 ranking locally, instantly, for
  free. Sprig reads the top hits at *ask* time, which is exactly the pattern
  `formatTextAttachment` ([lib/attachments.js](../../lib/attachments.js)) already
  uses for large files — pull the relevant rows, hand them to the model.
- **Why this is strictly better:** zero tokens and zero latency while you browse
  (a per-page model call on every site you read would be both expensive and slow);
  capture works offline and with no key; and — decisively — **nothing leaves the
  machine when you read a page.** A distillation pass would ship the text of
  everything you read to a provider. That alone disqualifies it.

The model earns its cost at query time, on ~5 retrieved pages, not on all 10,000.

### Embeddings (deferred, not rejected)

BM25 misses synonyms: a page saying "notebook computer" won't match "laptop".
That's a real ceiling. When we hit it, the fix is a **local** embedding pass
(`onnxruntime-web` is already a devDependency for the wake word, so a MiniLM-class
model is tractable) stored in a `vec` column, hybrid-ranked with BM25. Deferred
because BM25 over your own small corpus (thousands of pages, not billions) is a
much stronger baseline than intuition suggests, and shipping it proves whether the
ceiling is real before we pay for a model download. **The schema leaves room for
it** (nullable `embedding` BLOB) so adding it is not a migration.

## Design

### Storage

New file `chervil-index.db` in userData, beside `chervil-state.json`. Owned by the
**main process** (`lib/pageIndex.js`); the renderer reaches it over IPC. Named
`pageIndex` deliberately — state already has an unrelated `pageStores` map (the
localStorage shim for interactive pages); do not conflate them.

```sql
CREATE TABLE pages (
  id          TEXT PRIMARY KEY,
  kind        TEXT NOT NULL,      -- 'composed' | 'visited'
  url         TEXT,               -- visited: the site; composed: null
  title       TEXT,
  query       TEXT,               -- composed: what was asked
  html        TEXT,               -- composed: the artifact itself
  body        TEXT,               -- readable text — what FTS indexes (both kinds)
  space_id    TEXT,
  sources     TEXT,               -- JSON
  conversation TEXT,              -- JSON (composed)
  history     TEXT,               -- JSON (composed)
  embedding   BLOB,               -- reserved; see above
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  visits      INTEGER DEFAULT 1,  -- visited: revisit count, a ranking signal
  trashed_at  INTEGER             -- non-null = in Trash (replaces library.trash)
);
CREATE VIRTUAL TABLE pages_fts USING fts5(title, query, body, content='pages', content_rowid='rowid');
```

`library.history` / `library.trash` become **views over this table**, not state.
Trash is a `trashed_at` timestamp rather than a second list, which also kills the
resurrect-on-merge class of bug the tombstones exist to patch.

### What leaves the state blob

`chervil-state.json` keeps **session** data only: tabs, activeId, settings,
spaces, bookmarks, collections, agents, schedules, watchers. Page HTML — the bulk
— moves to SQLite, where a page write is one small `INSERT`, not a 4 MB rewrite.
This is the perf fix and the feature in one move.

Interaction with **RFC 0005 (folder sync)**: the index is machine-local and is NOT
synced. Bookmarks/spaces still sync via the state file. Cross-machine index sync is
explicitly out of scope (it's the natural Pro hook — see RFC 0004).

### Capture

- **Composed pages:** already have HTML; `body` = existing `stripText(html)`.
- **Visited sites:** on navigation-settled, pull readable text from the webview
  (the reader-mode extraction path already exists). Store `body`, bump `visits` on
  revisit. Never for private tabs (`recordSiteVisit` already returns early on
  `tab.private` — same gate).

### Retrieval

`searchPages(query, { limit })` → BM25-ranked hits. Two consumers:

1. **Library search (1b)** — the user searching their own stuff, directly.
2. **Compose grounding (1d)** — when a query looks retrospective ("that article
   I read", "the page about X"), retrieve first and ground the answer in the
   user's own pages, citing them, before considering the web.

### Answer cache (2a)

On compose, look for a past composed page whose `query` is a near-duplicate. If
one exists and is fresh enough, **serve it instantly** with a visible
"from your pages · composed 3 days ago · ↻ Refresh" affordance. Never silently —
the user must always be able to tell a cached answer from a fresh one, and always
be one click from fresh. Staleness is intent-sensitive (a "latest"/"today" query
must never cache); reuse the existing freshness signals rather than a flat TTL.

## Privacy — the load-bearing part

Keeping the text of everything you read is the most sensitive thing this app has
ever done. It is also the sharpest argument against Google — *if* it is airtight,
and worthless if it isn't. Non-negotiable, on day one, not as a follow-up:

- **Local only.** The index never leaves the machine. Not synced, not uploaded,
  no telemetry. Retrieved text reaches a provider only when the user asks a
  question it answers — the same trust boundary as attaching a file today.
- **Private tabs are never indexed.** Same gate as `recordSiteVisit`.
- **Visible.** The Library drawer shows exactly what's stored, per page.
- **Deletable.** Per-page delete, per-site "forget this site", per-range
  "forget the last hour/day", and a single "delete my index" that removes the file.
  Deletes are real (`DELETE` + `VACUUM`), not tombstones.
- **Off is a first-class state.** Site capture is a setting. Off = composed pages
  only (still useful). The setting must be findable *before* it has captured
  anything — i.e. surfaced at first run, not buried.
- **Domain excludes.** A denylist (banks, health, whatever the user says), plus
  never indexing pages behind an obvious auth wall.

Open question: default **on** or **off** for site capture? Leaning **off with a
prominent first-run offer** — the feature is worthless if the user doesn't trust
it, and "it was quietly recording my browsing" is an unrecoverable first
impression. Costs adoption; buys the thing the bet depends on.

## Phasing

| Phase | What | Ships |
|---|---|---|
| **1a** | `lib/pageIndex.js`, schema, migration of `library` out of the blob | A pure perf release: no more 4 MB rewrite per keystroke |
| **1b** | FTS search over composed pages, in the Library drawer | "Search your own pages" |
| **2a** | Answer cache for near-duplicate questions | Repeat asks are instant and free |
| **1c** | Capture readable text of visited sites (privacy-gated) | The substrate |
| **1d** | Retrospective queries grounded in your own reading | **"What was that article I read?"** — the differentiator |
| **2b** | Speculative compose from the omnibox | Polish on instant |
| **3** | Ambient dossier | The payoff |

1a → 1b+2a → 1c+1d → 2b → 3. The order is forced by dependencies; the slicing is
chosen so each phase ships something felt. 2a is pulled ahead of 1c because it
needs only composed pages, and it's the biggest felt-win per unit of work.

## Risks

- **Trust (highest).** 1c is the point of no return. Everything before it is
  reversible. Mitigation: the privacy section above, shipped *with* 1c.
- **`node:sqlite` is experimental.** Mitigated by a small API surface, a pinned
  Node, plain-SQLite data, and `better-sqlite3` as an escape hatch.
- **Migration.** Moving a live 3.93 MB library must not lose pages. Mitigation:
  copy-then-verify-then-drop, keep a `.bak` of the pre-migration state file, and
  make the migration idempotent and re-runnable.
- **Index bloat.** Storing body text for every site grows unbounded. Mitigation:
  a size budget with oldest-first eviction, surfaced in Settings; text-only (no
  images) keeps it small — a year of heavy reading is on the order of hundreds of MB.
- **BM25 ceiling.** May under-recall. Mitigation: local embeddings, schema-ready.
