'use strict';

// Your Web — the local page index (RFC 0013).
//
// A SQLite store for the pages Chervil composes and (later) the sites you read,
// with FTS5 full-text search over their text. Owned by the MAIN process; the
// renderer reaches it over IPC.
//
// Why SQLite and why now: composed pages used to live as full HTML inside
// chervil-state.json, which scheduleSave re-serializes on every message and every
// checkbox click — megabytes rewritten per keystroke, and still only searchable by
// title. Moving pages here makes a write one small INSERT and makes the corpus
// queryable. The perf fix and the feature are the same move.
//
// Deliberately NOT named pageStore — state already has an unrelated `pageStores`
// map (the localStorage shim for interactive pages).
//
// Design notes:
//  - `node:sqlite` is built into the bundled Node (verified: electron 39.8.5 /
//    node 22.22.1, FTS5 compiled in), so this adds ZERO dependencies — no
//    better-sqlite3, no electron-rebuild, no native step in the installer. It is
//    flagged experimental; the API surface used here is small and the data is
//    plain SQLite, so swapping drivers later would not touch the schema.
//  - NOTHING is distilled on ingest. We store readable text and let FTS5's BM25
//    rank it; the model reads the top hits at ASK time (the same pattern
//    lib/attachments.js already uses for large files). That keeps browsing free,
//    instant, offline — and keeps the text of what you read on your machine.
//  - Trash is a `trashed_at` timestamp, not a second list, so a page can't be
//    resurrected by a merge that saw it in one place and not the other.

const SCHEMA_VERSION = 1;

// Pages are text-only; a generous body cap keeps one pathological page (a giant
// log, an infinite-scroll feed) from dominating the index.
const MAX_BODY_CHARS = 200000;

function nowMs() { return Date.now(); }

// FTS5's MATCH grammar treats -, ", *, : and friends as operators, so raw user
// text can throw a syntax error. Reduce the query to bare tokens and quote each
// one, which makes any input safe.
//
// `any` switches AND to OR. A search box should mean "all of these words" — but a
// recall lookup must not: two phrasings of the same question ("how TO start a
// starter" vs "how DO I start a starter") share meaning, not every token, and an
// AND-match returns nothing for them. OR retrieves candidates and lets the caller
// rank/threshold them.
function ftsQuery(text, { any = false } = {}) {
  const tokens = String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2)
    .slice(0, 24);
  if (!tokens.length) return '';
  return tokens.map((t) => `"${t}"`).join(any ? ' OR ' : ' AND ');
}

function clampBody(text) {
  const s = String(text || '');
  return s.length > MAX_BODY_CHARS ? s.slice(0, MAX_BODY_CHARS) : s;
}

function toJson(v) {
  if (v == null) return null;
  try { return JSON.stringify(v); } catch { return null; }
}
function fromJson(v, fallback) {
  if (v == null) return fallback;
  try { return JSON.parse(v); } catch { return fallback; }
}

// Map a DB row to the shape the renderer's Library already expects, so callers
// don't have to learn a second vocabulary.
function rowToItem(row) {
  if (!row) return null;
  return {
    id: row.id,
    kind: row.kind,
    url: row.url || undefined,
    title: row.title || '',
    query: row.query || '',
    html: row.html || '',
    body: row.body || '',
    storeKey: row.store_key || undefined,
    sources: fromJson(row.sources, []),
    conversation: fromJson(row.conversation, []),
    history: fromJson(row.history, []),
    spaceId: row.space_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    visits: row.visits || 1,
    trashedAt: row.trashed_at || undefined,
  };
}

// A listing row without the heavy columns. `html` and `body` run to hundreds of KB
// each, so a 100-item drawer listing would otherwise push tens of MB through IPC
// to render titles. Callers that need the payload ask for one page by id.
function lightItem(item) {
  if (!item) return null;
  const { html, body, conversation, history, ...rest } = item;
  return rest;
}

/**
 * Open (creating if needed) the page index at `dbPath`.
 * Throws if node:sqlite is unavailable — callers should treat the index as an
 * enhancement and degrade gracefully rather than failing to boot.
 */
function createPageIndex(dbPath) {
  // Required lazily so a driver problem surfaces as "no index" rather than a
  // main-process crash at import time.
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(dbPath);

  // WAL: concurrent reads don't block the writer, and a crash can't shred the
  // file mid-write. NORMAL sync is the right trade for a cache-like store —
  // durability of the last few ms matters far less than not stalling the UI.
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA synchronous = NORMAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS pages (
      id           TEXT PRIMARY KEY,
      kind         TEXT NOT NULL,
      url          TEXT,
      title        TEXT,
      query        TEXT,
      html         TEXT,
      body         TEXT,
      space_id     TEXT,
      store_key    TEXT,            -- interactive-page state key; must survive reopen
      sources      TEXT,
      conversation TEXT,
      history      TEXT,
      embedding    BLOB,
      created_at   INTEGER NOT NULL,
      updated_at   INTEGER NOT NULL,
      visits       INTEGER NOT NULL DEFAULT 1,
      trashed_at   INTEGER
    );
    CREATE INDEX IF NOT EXISTS pages_created  ON pages (created_at DESC);
    CREATE INDEX IF NOT EXISTS pages_kind     ON pages (kind, created_at DESC);
    CREATE INDEX IF NOT EXISTS pages_trashed  ON pages (trashed_at);
    CREATE UNIQUE INDEX IF NOT EXISTS pages_url ON pages (url) WHERE url IS NOT NULL;

    CREATE VIRTUAL TABLE IF NOT EXISTS pages_fts
      USING fts5(title, query, body, content='pages', content_rowid='rowid');

    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
  `);

  // External-content FTS needs triggers to stay in step with `pages`.
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS pages_ai AFTER INSERT ON pages BEGIN
      INSERT INTO pages_fts(rowid, title, query, body)
        VALUES (new.rowid, new.title, new.query, new.body);
    END;
    CREATE TRIGGER IF NOT EXISTS pages_ad AFTER DELETE ON pages BEGIN
      INSERT INTO pages_fts(pages_fts, rowid, title, query, body)
        VALUES ('delete', old.rowid, old.title, old.query, old.body);
    END;
    CREATE TRIGGER IF NOT EXISTS pages_au AFTER UPDATE ON pages BEGIN
      INSERT INTO pages_fts(pages_fts, rowid, title, query, body)
        VALUES ('delete', old.rowid, old.title, old.query, old.body);
      INSERT INTO pages_fts(rowid, title, query, body)
        VALUES (new.rowid, new.title, new.query, new.body);
    END;
  `);

  db.prepare('INSERT OR IGNORE INTO meta (key, value) VALUES (?, ?)')
    .run('schema_version', String(SCHEMA_VERSION));

  const stmt = {
    upsert: db.prepare(`
      INSERT INTO pages (id, kind, url, title, query, html, body, space_id, store_key, sources,
                         conversation, history, created_at, updated_at, visits, trashed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NULL)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title, query = excluded.query, html = excluded.html,
        body = excluded.body, space_id = excluded.space_id, store_key = excluded.store_key,
        sources = excluded.sources, conversation = excluded.conversation,
        history = excluded.history, updated_at = excluded.updated_at
    `),
    getById: db.prepare('SELECT * FROM pages WHERE id = ?'),
    getByUrl: db.prepare('SELECT * FROM pages WHERE url = ?'),
    bumpVisit: db.prepare('UPDATE pages SET visits = visits + 1, updated_at = ?, title = ?, body = ? WHERE url = ?'),
    listLive: db.prepare('SELECT * FROM pages WHERE trashed_at IS NULL AND kind = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'),
    listTrash: db.prepare('SELECT * FROM pages WHERE trashed_at IS NOT NULL ORDER BY trashed_at DESC LIMIT ? OFFSET ?'),
    trash: db.prepare('UPDATE pages SET trashed_at = ? WHERE id = ?'),
    restore: db.prepare('UPDATE pages SET trashed_at = NULL WHERE id = ?'),
    remove: db.prepare('DELETE FROM pages WHERE id = ?'),
    emptyTrash: db.prepare('DELETE FROM pages WHERE trashed_at IS NOT NULL'),
    forgetUrlLike: db.prepare('DELETE FROM pages WHERE url LIKE ?'),
    forgetSince: db.prepare('DELETE FROM pages WHERE created_at >= ?'),
    countKind: db.prepare('SELECT COUNT(*) AS n FROM pages WHERE kind = ? AND trashed_at IS NULL'),
    countTrash: db.prepare('SELECT COUNT(*) AS n FROM pages WHERE trashed_at IS NOT NULL'),
    // Oldest-first eviction for the size budget; composed pages are the user's own
    // artifacts, so only ever evict captured sites.
    evictVisited: db.prepare(`
      DELETE FROM pages WHERE id IN (
        SELECT id FROM pages WHERE kind = 'visited' AND trashed_at IS NULL
        ORDER BY created_at ASC LIMIT ?
      )
    `),
  };

  const api = {
    /** Insert or update a page Chervil composed. `body` is derived by the caller. */
    putComposed(item) {
      if (!item || !item.id) return null;
      const at = item.createdAt || nowMs();
      stmt.upsert.run(
        item.id, 'composed', null, item.title || '', item.query || '',
        item.html || '', clampBody(item.body), item.spaceId || null,
        item.storeKey || null,
        toJson(item.sources || []), toJson(item.conversation || []),
        toJson(item.history || []), at, item.updatedAt || at,
      );
      return item.id;
    },

    /**
     * Record a visited site. Re-visiting the same URL updates its text and bumps
     * a visit counter rather than inserting a duplicate — revisits are a ranking
     * signal, not new pages.
     */
    putVisited(item) {
      if (!item || !item.url || !item.id) return null;
      const existing = stmt.getByUrl.get(item.url);
      const at = nowMs();
      if (existing) {
        stmt.bumpVisit.run(at, item.title || existing.title, clampBody(item.body), item.url);
        return existing.id;
      }
      stmt.upsert.run(
        item.id, 'visited', item.url, item.title || '', '', '',
        clampBody(item.body), item.spaceId || null, null, null, null, null, at, at,
      );
      return item.id;
    },

    /** The full record, including html/body. One page at a time by design. */
    get(id) { return rowToItem(stmt.getById.get(id)); },
    getByUrl(url) { return rowToItem(stmt.getByUrl.get(url)); },

    /** Newest-first page list for the Library drawer — light rows (no html/body). */
    list({ kind = 'composed', limit = 100, offset = 0 } = {}) {
      return stmt.listLive.all(kind, limit, offset).map((r) => lightItem(rowToItem(r)));
    },
    listTrash({ limit = 100, offset = 0 } = {}) {
      return stmt.listTrash.all(limit, offset).map((r) => lightItem(rowToItem(r)));
    },

    /**
     * BM25-ranked full-text search. Returns light rows plus a `snippet` with the
     * match highlighted, so the UI can show WHY a page matched, not just its title.
     * Pass includeBody for the retrieval path (grounding an answer in the user's
     * own pages), which genuinely needs the text — the UI never does.
     */
    search(text, { limit = 20, kind = null, includeBody = false, any = false } = {}) {
      const match = ftsQuery(text, { any });
      if (!match) return [];
      const where = kind ? 'AND p.kind = ?' : '';
      // Control chars as match delimiters: page text can legitimately contain
      // brackets or asterisks, and the UI has to be able to tell a real match from
      // the page's own punctuation when it renders the highlight.
      const sql = `
        SELECT p.*, snippet(pages_fts, 2, char(1), char(2), '…', 12) AS snippet
        FROM pages_fts f JOIN pages p ON p.rowid = f.rowid
        WHERE pages_fts MATCH ? AND p.trashed_at IS NULL ${where}
        ORDER BY bm25(pages_fts, 8.0, 4.0, 1.0)
        LIMIT ?
      `;
      try {
        const rows = kind
          ? db.prepare(sql).all(match, kind, limit)
          : db.prepare(sql).all(match, limit);
        return rows.map((r) => {
          const full = { ...rowToItem(r), snippet: r.snippet || '' };
          return includeBody ? full : { ...lightItem(full), snippet: full.snippet };
        });
      } catch {
        return []; // a malformed MATCH must never take down the caller
      }
    },

    trash(id) { stmt.trash.run(nowMs(), id); },
    restore(id) { stmt.restore.run(id); },
    remove(id) { stmt.remove.run(id); },
    emptyTrash() { stmt.emptyTrash.run(); },

    /**
     * Privacy controls (RFC 0013): real deletes, not tombstones. Each VACUUMs so
     * the text is actually gone from the file rather than sitting in free pages —
     * "delete" has to mean deleted or the whole feature is untrustworthy.
     */
    forgetSite(host) {
      if (!host) return;
      stmt.forgetUrlLike.run(`%${host}%`);
      db.exec('VACUUM');
    },
    forgetSince(sinceMs) {
      stmt.forgetSince.run(sinceMs);
      db.exec('VACUUM');
    },
    /**
     * Erase captured sites, or everything. Composed pages are the user's own
     * work, so "forget what I read" must not take them with it — clearing those
     * is a separate, explicit choice.
     */
    forgetAll({ includeComposed = false } = {}) {
      if (includeComposed) db.exec('DELETE FROM pages');
      else db.exec("DELETE FROM pages WHERE kind = 'visited'");
      db.exec('VACUUM');
    },

    stats() {
      return {
        composed: stmt.countKind.get('composed').n,
        visited: stmt.countKind.get('visited').n,
        trashed: stmt.countTrash.get().n,
      };
    },

    /** Keep captured sites within a page budget, oldest first. */
    evictVisitedOver(maxVisited) {
      const n = stmt.countKind.get('visited').n;
      if (n > maxVisited) stmt.evictVisited.run(n - maxVisited);
    },

    close() { try { db.close(); } catch { /* already closed */ } },
    _db: db, // tests
  };

  return api;
}

module.exports = { createPageIndex, ftsQuery, SCHEMA_VERSION, MAX_BODY_CHARS };
