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

const SCHEMA_VERSION = 2; // 2: feed_items + feed_state (Your Feeds)

// Pages are text-only; a generous body cap keeps one pathological page (a giant
// log, an infinite-scroll feed) from dominating the index.
const MAX_BODY_CHARS = 200000;

// Feed items churn — a daily digest reads the last day or two, and nothing reads
// last month's. Two independent limits: an age cutoff (what could a digest still
// want?) and a hard count ceiling (what if someone subscribes to 200 feeds?).
const FEED_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const FEED_MAX_ITEMS = 5000;

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

// Words that carry no topic signal. Only needs to cover what's common enough to
// float to the top of a term count — the distinct-host rule below does most of the
// real filtering, since boilerplate rarely repeats across unrelated domains.
const TOPIC_STOP = new Set(`a an the and or but if then than that this these those there here it its it's is are was were be been being am do does did doing done have has had having will would should could can may might must shall of in on at to from by for with about into over under again further once you your yours we our ours i me my mine he him his she her hers they them their what which who whom when where why how all any both each few more most other some such no nor not only own same so too very just now also as up out off down out get got go goes going make makes made use used using new news home page site web click read more sign log privacy policy terms cookies cookie accept menu search share like follow comment subscribe newsletter copyright rights reserved contact about us learn view see said says say says one two three first last next back next top best`.split(/\s+/));

// Content terms of one page, with a per-page cap so a long page can't dominate.
function topicTerms(text, cap = 40) {
  const counts = new Map();
  const tokens = String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/);
  for (const t of tokens) {
    if (t.length < 4 || t.length > 24) continue;   // 4+ drops most filler; 24 drops junk
    if (TOPIC_STOP.has(t)) continue;
    if (/^\d+$/.test(t)) continue;                  // bare numbers aren't topics
    counts.set(t, (counts.get(t) || 0) + 1);
  }
  // A term the page barely mentions isn't what the page is about.
  return [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, cap)
    .map(([t]) => t);
}

function hostOfUrl(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
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

  // Your Feeds — items pulled from the user's subscriptions.
  //
  // A SEPARATE table, not another `kind` in `pages`, and that isn't tidiness —
  // four things in this file assume `pages` holds only what the user read or
  // composed:
  //  - topics() has no kind filter and reads the newest 400 rows. Feed volume
  //    would fill that window daily, and dossier offers would quietly become
  //    "what my feeds published" instead of "what I read".
  //  - putVisited() looks up by URL first, so reading a feed item's page would
  //    match the feed row and bumpVisit would overwrite it in place — silent
  //    corruption on the one path that's guaranteed to happen.
  //  - search(kind=null) feeds recall, which labels every non-'visited' hit as a
  //    page Sprig composed. A feed item would be described to the model as
  //    something Sprig wrote.
  //  - evictVisited/forgetAll hardcode kind='visited', so feed items would never
  //    be evicted.
  // Separate tables also mean this is a pure CREATE IF NOT EXISTS — an existing
  // index gains them on open, with no migration to run.
  //
  // Deliberately no FTS: a digest asks "what arrived since yesterday", which is
  // chronological. BM25 over a 500-char summary is noise, and staying out of
  // pages_fts is what keeps feed items away from recall.
  db.exec(`
    CREATE TABLE IF NOT EXISTS feed_items (
      id           TEXT PRIMARY KEY,   -- \`\${type}:\${feedId}:\${externalId}\`
      feed_id      TEXT NOT NULL,
      type         TEXT NOT NULL,
      external_id  TEXT,
      url          TEXT,               -- NOT unique-indexed: would collide with pages.url
      title        TEXT,
      author       TEXT,
      summary      TEXT,
      thumbnail    TEXT,
      published_at INTEGER,
      fetched_at   INTEGER NOT NULL,
      read_at      INTEGER,
      digested_at  INTEGER
    );
    CREATE INDEX IF NOT EXISTS feed_items_recent ON feed_items (published_at DESC);
    CREATE INDEX IF NOT EXISTS feed_items_feed   ON feed_items (feed_id, published_at DESC);
    CREATE INDEX IF NOT EXISTS feed_items_undig  ON feed_items (digested_at, published_at DESC);

    -- Per-machine fetch cursors. The subscription itself lives in
    -- chervil-state.json and syncs; where THIS machine got to does not — same
    -- reason the rest of this index never syncs.
    CREATE TABLE IF NOT EXISTS feed_state (
      feed_id      TEXT PRIMARY KEY,
      last_fetched INTEGER,
      resolved_url TEXT,               -- e.g. a YouTube @handle resolved to a channel feed
      last_error   TEXT
    );
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

  // DO UPDATE, not OR IGNORE: with OR IGNORE an index created at v1 kept saying
  // "1" forever no matter how the schema moved, so the marker tracked when the
  // file was created rather than what's in it — worse than no marker, since the
  // first thing to trust it would be wrong.
  db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
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

    // --- Your Feeds ---------------------------------------------------------
    // DO NOTHING, not DO UPDATE: a feed that re-serves an item we already
    // digested must not have its digested_at cleared, or the next digest repeats
    // it. Nothing upstream can change about an item that we'd want anyway.
    putFeedItem: db.prepare(`
      INSERT INTO feed_items (id, feed_id, type, external_id, url, title, author, summary,
                              thumbnail, published_at, fetched_at, read_at, digested_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)
      ON CONFLICT(id) DO NOTHING
    `),
    recentFeedItems: db.prepare(`
      SELECT * FROM feed_items WHERE published_at >= ?
      ORDER BY published_at DESC LIMIT ?
    `),
    undigestedFeedItems: db.prepare(`
      SELECT * FROM feed_items WHERE digested_at IS NULL AND published_at >= ?
      ORDER BY published_at DESC LIMIT ?
    `),
    markFeedItemDigested: db.prepare('UPDATE feed_items SET digested_at = ? WHERE id = ?'),
    markFeedItemRead: db.prepare('UPDATE feed_items SET read_at = ? WHERE id = ?'),
    countFeedItems: db.prepare('SELECT COUNT(*) AS n FROM feed_items'),
    countFeedItemsFor: db.prepare('SELECT COUNT(*) AS n FROM feed_items WHERE feed_id = ?'),
    deleteFeedItems: db.prepare('DELETE FROM feed_items WHERE feed_id = ?'),
    evictFeedItemsOld: db.prepare('DELETE FROM feed_items WHERE fetched_at < ?'),
    evictFeedItemsByFeedOld: db.prepare('DELETE FROM feed_items WHERE feed_id = ? AND fetched_at < ?'),
    evictFeedItemsOver: db.prepare(`
      DELETE FROM feed_items WHERE id IN (
        SELECT id FROM feed_items ORDER BY fetched_at ASC LIMIT ?
      )
    `),
    forgetFeedItemsUrlLike: db.prepare('DELETE FROM feed_items WHERE url LIKE ?'),
    forgetFeedItemsSince: db.prepare('DELETE FROM feed_items WHERE fetched_at >= ?'),
    getFeedState: db.prepare('SELECT * FROM feed_state WHERE feed_id = ?'),
    allFeedState: db.prepare('SELECT * FROM feed_state'),
    setFeedState: db.prepare(`
      INSERT INTO feed_state (feed_id, last_fetched, resolved_url, last_error)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(feed_id) DO UPDATE SET
        last_fetched = excluded.last_fetched,
        resolved_url = excluded.resolved_url,
        last_error   = excluded.last_error
    `),
    deleteFeedState: db.prepare('DELETE FROM feed_state WHERE feed_id = ?'),
  };

  function toFeedState(row) {
    return {
      feedId: row.feed_id,
      lastFetched: row.last_fetched || 0,
      resolvedUrl: row.resolved_url || '',
      lastError: row.last_error || '',
    };
  }

  function rowToFeedItem(row) {
    if (!row) return null;
    return {
      id: row.id,
      feedId: row.feed_id,
      type: row.type,
      externalId: row.external_id || '',
      url: row.url || '',
      title: row.title || '',
      author: row.author || '',
      summary: row.summary || '',
      thumbnail: row.thumbnail || null,
      publishedAt: row.published_at,
      fetchedAt: row.fetched_at,
      readAt: row.read_at || undefined,
      digestedAt: row.digested_at || undefined,
    };
  }

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
      // Feed items carry the same host's URLs. "Forget this site" that leaves
      // that site's items sitting in the digest queue isn't forgetting.
      stmt.forgetFeedItemsUrlLike.run(`%${host}%`);
      db.exec('VACUUM');
    },
    forgetSince(sinceMs) {
      stmt.forgetSince.run(sinceMs);
      stmt.forgetFeedItemsSince.run(sinceMs);
      db.exec('VACUUM');
    },
    /**
     * Erase captured sites, or everything. Composed pages are the user's own
     * work, so "forget what I read" must not take them with it — clearing those
     * is a separate, explicit choice. Feed items follow the same logic: they're
     * not something the user read, so the narrow "forget what I read" leaves
     * them, and only the explicit "erase everything" takes them.
     */
    forgetAll({ includeComposed = false, includeFeeds = includeComposed } = {}) {
      if (includeComposed) db.exec('DELETE FROM pages');
      else db.exec("DELETE FROM pages WHERE kind = 'visited'");
      if (includeFeeds) db.exec('DELETE FROM feed_items');
      db.exec('VACUUM');
    },

    stats() {
      return {
        composed: stmt.countKind.get('composed').n,
        visited: stmt.countKind.get('visited').n,
        trashed: stmt.countTrash.get().n,
        feedItems: stmt.countFeedItems.get().n,
      };
    },

    /**
     * What has the user been reading about lately? (Bet 3.)
     *
     * A topic is a content word that recurs across several DISTINCT pages AND at
     * least two DISTINCT sites inside a time window. The distinct-host rule kills
     * per-site boilerplate (one domain's nav and house style repeat endlessly but
     * never leave that domain) and, more importantly, distinguishes "reading about
     * a subject" from "reading one website a lot". Web-wide furniture — cookie
     * banners, newsletter prompts — DOES cross hosts, so TOPIC_STOP and the
     * ubiquity cut below are what handle that.
     *
     * Deliberately cheap: it reads a 4KB slice per recent page, not whole bodies —
     * enough to know what a page is about, and it keeps a background pass over a
     * few hundred pages down to milliseconds. No model, no network.
     *
     * Returns [{ term, pages: [{id,title,url}], pageCount, hostCount }], strongest
     * first. The caller decides what crosses the bar; this only reports.
     */
    topics({ sinceMs = Date.now() - 14 * 24 * 60 * 60 * 1000, minPages = 4, minHosts = 2, limit = 8 } = {}) {
      const rows = db.prepare(`
        SELECT id, kind, url, title, substr(body, 1, 4000) AS head
        FROM pages
        WHERE created_at >= ? AND trashed_at IS NULL AND body IS NOT NULL AND length(body) > 200
        ORDER BY created_at DESC LIMIT 400
      `).all(sinceMs);
      if (rows.length < minPages) return [];

      const byTerm = new Map();  // term -> { pages:Set, hosts:Set }
      for (const r of rows) {
        const host = r.url ? hostOfUrl(r.url) : 'chervil:composed';
        // Title words count too — a title term is a strong signal of aboutness.
        for (const term of new Set(topicTerms(`${r.title || ''} ${r.title || ''} ${r.head || ''}`))) {
          let e = byTerm.get(term);
          if (!e) { e = { pages: new Set(), hosts: new Set() }; byTerm.set(term, e); }
          e.pages.add(r.id);
          if (host) e.hosts.add(host);
        }
      }

      // A term in most of what the user reads is a habit or boilerplate we didn't
      // list, not a topic. Only meaningful once there's a real corpus: over a
      // handful of pages "60% of them" is noise — and it would land on top of
      // minPages and reject every candidate, so no topic could ever be found.
      const ubiquitous = rows.length >= 12 ? Math.floor(rows.length * 0.6) : Infinity;
      const cand = [...byTerm.entries()]
        .filter(([, e]) => e.pages.size >= minPages && e.hosts.size >= minHosts && e.pages.size < ubiquitous)
        .map(([term, e]) => ({ term, pageIds: [...e.pages], pageCount: e.pages.size, hostCount: e.hosts.size }))
        .sort((a, b) => (b.pageCount - a.pageCount) || (b.hostCount - a.hostCount));

      // Terms from one cluster co-occur on the same pages ("mirrorless" and
      // "camera"), and offering both would be two offers for one topic. Keep the
      // strongest and drop anything covering nearly the same pages.
      const picked = [];
      for (const c of cand) {
        const dup = picked.find((p) => {
          const inter = c.pageIds.filter((id) => p.pageIds.includes(id)).length;
          return inter / Math.min(c.pageIds.length, p.pageIds.length) >= 0.7;
        });
        if (dup) { dup.related = (dup.related || []); if (dup.related.length < 4) dup.related.push(c.term); continue; }
        picked.push(c);
        if (picked.length >= limit) break;
      }

      const meta = new Map(rows.map((r) => [r.id, { id: r.id, title: r.title, url: r.url, kind: r.kind }]));
      return picked.map((p) => ({
        term: p.term,
        related: p.related || [],
        pageCount: p.pageCount,
        hostCount: p.hostCount,
        pages: p.pageIds.map((id) => meta.get(id)).filter(Boolean).slice(0, 12),
      }));
    },

    /** Keep captured sites within a page budget, oldest first. */
    evictVisitedOver(maxVisited) {
      const n = stmt.countKind.get('visited').n;
      if (n > maxVisited) stmt.evictVisited.run(n - maxVisited);
    },

    /**
     * Your Feeds. Items from the user's subscriptions, kept apart from `pages` —
     * see the DDL above for why that separation is load-bearing.
     */
    feeds: {
      /**
       * Insert new items, ignoring ones already seen.
       * @returns {number} how many were actually new — the count the UI wants.
       */
      putItems(items) {
        if (!Array.isArray(items) || !items.length) return 0;
        // DatabaseSync is synchronous and on the main thread: 600 autocommitted
        // INSERTs is 600 fsyncs with IPC blocked behind them. One transaction.
        let added = 0;
        db.exec('BEGIN');
        try {
          for (const it of items) {
            if (!it || !it.id || !it.feedId) continue;
            const r = stmt.putFeedItem.run(
              it.id, it.feedId, it.type || 'rss', it.externalId || null,
              it.url || null, it.title || '', it.author || '', it.summary || '',
              it.thumbnail || null,
              Number(it.publishedAt) || nowMs(), Number(it.fetchedAt) || nowMs(),
            );
            added += r.changes || 0;
          }
          db.exec('COMMIT');
        } catch (e) {
          try { db.exec('ROLLBACK'); } catch { /* the BEGIN never took */ }
          throw e;
        }
        return added;
      },

      /**
       * Newest-first items for the digest.
       * `undigestedOnly` is what makes a second run of the same schedule not
       * repeat yesterday's news.
       */
      recent({ sinceMs = nowMs() - 2 * 24 * 60 * 60 * 1000, limit = 120, undigestedOnly = false } = {}) {
        const rows = undigestedOnly
          ? stmt.undigestedFeedItems.all(sinceMs, limit)
          : stmt.recentFeedItems.all(sinceMs, limit);
        return rows.map(rowToFeedItem);
      },

      markDigested(ids, at = nowMs()) {
        if (!Array.isArray(ids) || !ids.length) return;
        db.exec('BEGIN');
        try {
          for (const id of ids) stmt.markFeedItemDigested.run(at, id);
          db.exec('COMMIT');
        } catch (e) {
          try { db.exec('ROLLBACK'); } catch { /* the BEGIN never took */ }
          throw e;
        }
      },

      markRead(id, at = nowMs()) { stmt.markFeedItemRead.run(at, id); },

      count(feedId) {
        return feedId ? stmt.countFeedItemsFor.get(feedId).n : stmt.countFeedItems.get().n;
      },

      /** Unsubscribing takes the items with it — they're the feed's, not the user's. */
      removeFeed(feedId) {
        stmt.deleteFeedItems.run(feedId);
        stmt.deleteFeedState.run(feedId);
      },

      /**
       * Prune feed items. Two limits catch different failures: an AGE cut drops
       * what's grown stale, a COUNT cap catches the 200-subscription power user.
       * Nothing else drives this — evictVisitedOver rides the site-capture path,
       * and feeds have no equivalent — so tickFeeds must call it.
       *
       * Age is now PER FEED. The caller passes `perFeed` — one {feedId, cutoffMs}
       * per feed that has a finite retention (a "forever" feed is simply omitted,
       * so its items are kept, bounded only by the count cap). `maxAgeMs` is a
       * fallback age cut applied to everything when no perFeed list is given
       * (preserves the old single-global behavior for any caller that passes none).
       */
      evict({ perFeed = null, maxAgeMs = FEED_MAX_AGE_MS, maxItems = FEED_MAX_ITEMS } = {}) {
        if (Array.isArray(perFeed)) {
          db.exec('BEGIN');
          try {
            for (const p of perFeed) {
              if (p && p.feedId && p.cutoffMs > 0) stmt.evictFeedItemsByFeedOld.run(p.feedId, p.cutoffMs);
            }
            db.exec('COMMIT');
          } catch (e) {
            try { db.exec('ROLLBACK'); } catch { /* the BEGIN never took */ }
            throw e;
          }
        } else {
          stmt.evictFeedItemsOld.run(nowMs() - maxAgeMs);
        }
        const n = stmt.countFeedItems.get().n;
        if (n > maxItems) stmt.evictFeedItemsOver.run(n - maxItems);
      },

      /** Per-machine fetch cursor. Never synced — see the feed_state DDL. */
      getState(feedId) {
        const r = stmt.getFeedState.get(feedId);
        return r ? toFeedState(r) : null;
      },
      /** Every cursor at once — the renderer mirrors these at launch. */
      allStates() { return stmt.allFeedState.all().map(toFeedState); },
      setState(feedId, { lastFetched = 0, resolvedUrl = '', lastError = '' } = {}) {
        stmt.setFeedState.run(feedId, lastFetched || 0, resolvedUrl || null, lastError || null);
      },
    },

    close() { try { db.close(); } catch { /* already closed */ } },
    _db: db, // tests
  };

  return api;
}

module.exports = {
  createPageIndex, ftsQuery, SCHEMA_VERSION, MAX_BODY_CHARS,
  FEED_MAX_AGE_MS, FEED_MAX_ITEMS,
};
