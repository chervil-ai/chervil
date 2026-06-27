'use strict';
// Merge multiple Chervil session-state objects into one.
//
// Why this exists: Chervil's "free folder-sync" (RFC 0005) rides a single mutable
// blob — chervil-state.json — through OneDrive / Google Drive / Dropbox. Those
// services cannot merge JSON. When two machines both write the file, the service
// keeps one copy and forks the other into a conflict copy named
// "chervil-state-<MACHINE>[-N].json". The app only ever reads chervil-state.json,
// so everything written on the "losing" machine (bookmarks, history, spaces, …)
// silently lands in an orphan file it never opens — looking to the user like
// "my bookmarks don't sync."
//
// mergeStates() heals that: additive collections (bookmarks, history, spaces,
// agents, schedules, living, audit) are UNIONED across every source, so an item
// created on ANY machine survives. Session/scalar fields (tabs, settings,
// active*) are taken from the most-recently-written source, since those represent
// "where this person last was," not an accumulating set.
//
// Deletes: a naive union would resurrect a bookmark deleted on one machine but
// still present in another machine's copy. We carry lightweight tombstones
// (bookmarkTombstones: [{ key, at }]) so a delete propagates and wins over an
// older add of the same key.

const MAX_AGENT_AUDIT = 500;
const MAX_TOMBSTONES = 1000;

function asArray(v) { return Array.isArray(v) ? v : []; }

// Union record arrays by a key function. On collision keep the record whose
// recency value is larger (so edits win over stale copies). Result is sorted
// most-recent-first when a recency function is given.
function unionBy(arrays, keyOf, recencyOf) {
  const map = new Map();
  for (const arr of arrays) {
    for (const item of asArray(arr)) {
      if (item == null) continue;
      let k;
      try { k = keyOf(item); } catch { k = undefined; }
      if (k == null) k = 'json:' + JSON.stringify(item); // fall back to identity
      const prev = map.get(k);
      if (prev === undefined) { map.set(k, item); continue; }
      const a = recencyOf ? (recencyOf(item) || 0) : 0;
      const b = recencyOf ? (recencyOf(prev) || 0) : 0;
      if (a >= b) map.set(k, item);
    }
  }
  const out = Array.from(map.values());
  if (recencyOf) out.sort((x, y) => (recencyOf(y) || 0) - (recencyOf(x) || 0));
  return out;
}

const bmKey = (b) => (b && b.key != null) ? 'k:' + b.key : (b && b.id != null ? 'i:' + b.id : null);

// sources: [{ state: <parsed object|null>, mtimeMs: <number> }]
// Returns a single merged state object, or null if no source had a usable state.
function mergeStates(sources) {
  const valid = (sources || []).filter((s) => s && s.state && typeof s.state === 'object');
  if (!valid.length) return null;

  // Newest by mtime is the base for session/scalar fields.
  const sorted = valid.slice().sort((a, b) => (b.mtimeMs || 0) - (a.mtimeMs || 0));
  const states = sorted.map((s) => s.state);
  const merged = { ...sorted[0].state };

  // --- Delete tombstones (bookmarks): union, newest delete per key wins -------
  const tombstones = unionBy(
    states.map((s) => s.bookmarkTombstones),
    (t) => (t && t.key != null) ? 'k:' + t.key : null,
    (t) => t && t.at,
  ).slice(0, MAX_TOMBSTONES);
  const tombAt = new Map();
  for (const t of tombstones) if (t && t.key != null) tombAt.set('k:' + t.key, t.at || 0);
  merged.bookmarkTombstones = tombstones;

  // --- Additive collections: union across all sources ------------------------
  merged.bookmarks = unionBy(states.map((s) => s.bookmarks), bmKey, (b) => b && b.at)
    // Drop any bookmark a newer-or-equal tombstone says was deleted.
    .filter((b) => {
      const at = tombAt.get(bmKey(b));
      return at === undefined || (b && b.at && b.at > at);
    });

  merged.siteHistory = unionBy(
    states.map((s) => s.siteHistory),
    (h) => (h && h.id != null) ? 'i:' + h.id : (h && h.url ? 'u:' + h.url : null),
    (h) => h && h.at,
  );
  merged.spaces = unionBy(states.map((s) => s.spaces), (s) => s && s.id, (s) => s && s.createdAt);
  merged.agents = unionBy(states.map((s) => s.agents), (a) => a && a.id, (a) => a && (a.updatedAt || a.createdAt));
  merged.schedules = unionBy(states.map((s) => s.schedules), (s) => s && s.id, (s) => s && (s.lastRun || 0));
  merged.living = unionBy(states.map((s) => s.living), (r) => r && r.entryId, (r) => r && (r.lastRun || 0));
  merged.agentAudit = unionBy(
    states.map((s) => s.agentAudit),
    (e) => e ? [e.at, e.type, e.target].join('|') : null,
    (e) => e && e.at,
  ).slice(0, MAX_AGENT_AUDIT);

  // library: { history, trash } — union each list by id, newest createdAt wins.
  merged.library = {
    history: unionBy(states.map((s) => s.library && s.library.history), (it) => it && it.id, (it) => it && it.createdAt),
    trash: unionBy(states.map((s) => s.library && s.library.trash), (it) => it && it.id, (it) => it && it.createdAt),
  };

  // pageStores: interactive-page state keyed by storeKey. Union by key; the newest
  // source wins per key (states is newest-first, so apply oldest→newest).
  merged.pageStores = {};
  for (const st of states.slice().reverse()) {
    if (st && st.pageStores && typeof st.pageStores === 'object') Object.assign(merged.pageStores, st.pageStores);
  }

  // Session/scalar fields (tabs, activeId, settings, activeSpaceId,
  // activeAgentId) already come from the newest source via the `merged` spread.
  return merged;
}

module.exports = { mergeStates, unionBy };
