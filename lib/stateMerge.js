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
// Mirrors MAX_LIBRARY in the renderer, which trims these lists as they're added
// to. The renderer's cap alone doesn't hold across machines: merging unions two
// already-capped lists into a longer one, and each sync grows it again. Library
// items carry composed-page HTML, so an uncapped union is what turns a session
// file into megabytes — and every save then rewrites all of it.
const MAX_LIBRARY = 100;

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

// Generic id-keyed delete tombstones cover the collections that (unlike bookmarks)
// are keyed by id: composed pages (library.history), emptied trash, site history,
// agents, and schedules. Each lives under deletionTombstones[collection].
const DT_COLLECTIONS = ['pages', 'trash', 'sites', 'agents', 'schedules', 'collections', 'watchers', 'feeds'];

// Keep an item only if no strictly-newer tombstone says it was deleted. An item
// whose own recency is newer-OR-EQUAL to the delete (a re-add or later edit, incl.
// one stamped the same millisecond) still wins — `>=` so a delete+re-add in the same
// tick isn't dropped on merge.
function survivesTomb(map, id, recency) {
  if (!map || id == null) return true;
  const at = map.get(String(id));
  if (at === undefined) return true;
  return (recency || 0) >= at;
}

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

  // --- Generic id-keyed tombstones for the other collections -----------------
  const dt = {};
  const dtMap = {};
  for (const coll of DT_COLLECTIONS) {
    const list = unionBy(
      states.map((s) => s.deletionTombstones && s.deletionTombstones[coll]),
      (t) => (t && t.id != null) ? String(t.id) : null,
      (t) => t && t.at,
    ).slice(0, MAX_TOMBSTONES);
    const m = new Map();
    for (const t of list) if (t && t.id != null) m.set(String(t.id), t.at || 0);
    dt[coll] = list;
    dtMap[coll] = m;
  }
  merged.deletionTombstones = dt;

  // --- Additive collections: union across all sources ------------------------
  merged.bookmarks = unionBy(states.map((s) => s.bookmarks), bmKey, (b) => b && b.at)
    // Drop any bookmark a newer-or-equal tombstone says was deleted.
    .filter((b) => {
      const at = tombAt.get(bmKey(b));
      return at === undefined || (b && b.at && b.at >= at);
    });

  // Favorites: sites-only quick list on the ★ star. Same key-based tombstone
  // scheme as bookmarks (keyed by the favorite's stable `key`).
  const favTombs = unionBy(
    states.map((s) => s.favoriteTombstones),
    (t) => (t && t.key != null) ? 'k:' + t.key : null,
    (t) => t && t.at,
  ).slice(0, MAX_TOMBSTONES);
  const favTombAt = new Map();
  for (const t of favTombs) if (t && t.key != null) favTombAt.set('k:' + t.key, t.at || 0);
  merged.favoriteTombstones = favTombs;
  merged.favorites = unionBy(states.map((s) => s.favorites), bmKey, (f) => f && f.at)
    .filter((f) => {
      const at = favTombAt.get(bmKey(f));
      return at === undefined || (f && f.at && f.at >= at);
    });

  merged.siteHistory = unionBy(
    states.map((s) => s.siteHistory),
    (h) => (h && h.id != null) ? 'i:' + h.id : (h && h.url ? 'u:' + h.url : null),
    (h) => h && h.at,
  ).filter((h) => survivesTomb(dtMap.sites, h && h.id, h && h.at));
  merged.spaces = unionBy(states.map((s) => s.spaces), (s) => s && s.id, (s) => s && s.createdAt);
  merged.savedSpaces = unionBy(states.map((s) => s.savedSpaces), (s) => s && s.id, (s) => s && s.createdAt);
  merged.agents = unionBy(states.map((s) => s.agents), (a) => a && a.id, (a) => a && (a.updatedAt || a.createdAt))
    .filter((a) => survivesTomb(dtMap.agents, a && a.id, a && (a.updatedAt || a.createdAt)));
  // Collections (named URL groups): whole-collection LWW by updatedAt — the copy
  // with the latest user edit wins its item list, like agents.
  merged.collections = unionBy(states.map((s) => s.collections), (c) => c && c.id, (c) => c && (c.updatedAt || c.createdAt))
    .filter((c) => survivesTomb(dtMap.collections, c && c.id, c && (c.updatedAt || c.createdAt)));
  // Schedules: a delete must WIN over an auto-bumped lastRun. Unlike agents (whose
  // updatedAt reflects a real user edit), a schedule's recency (lastRun) advances on
  // its own when it fires — so we drop a tombstoned schedule unconditionally (a
  // genuinely re-created schedule has a fresh id and isn't in the tombstone set).
  merged.schedules = unionBy(states.map((s) => s.schedules), (s) => s && s.id, (s) => s && (s.lastRun || 0))
    .filter((s) => !(s && s.id != null && dtMap.schedules.has(String(s.id))));
  merged.watchers = unionBy(states.map((s) => s.watchers), (w) => w && w.id, (w) => w && (w.lastRun || 0))
    .filter((w) => !(w && w.id != null && dtMap.watchers.has(String(w.id))));
  // Feeds take the AGENTS rule, not the schedules/watchers one above. A feed
  // record is pure intent — name, URL, cadence — and its recency only moves when
  // the user edits it, because the fetch cursor deliberately lives in the page
  // index instead of here. So updatedAt means what it means for an agent, and a
  // tombstone can be compared against it honestly rather than dropped
  // unconditionally.
  merged.feeds = unionBy(states.map((s) => s.feeds), (f) => f && f.id, (f) => f && (f.updatedAt || f.createdAt))
    .filter((f) => survivesTomb(dtMap.feeds, f && f.id, f && (f.updatedAt || f.createdAt)));
  merged.living = unionBy(states.map((s) => s.living), (r) => r && r.entryId, (r) => r && (r.lastRun || 0));
  merged.agentAudit = unionBy(
    states.map((s) => s.agentAudit),
    (e) => e ? [e.at, e.type, e.target].join('|') : null,
    (e) => e && e.at,
  ).slice(0, MAX_AGENT_AUDIT);

  // library: { history, trash } — union each list by id, newest write wins. Recency
  // is updatedAt||createdAt so a restore/move (which stamps updatedAt) can outrank a
  // stale tombstone that resurrects from another machine.
  const libRecency = (it) => it && (it.updatedAt || it.createdAt);
  // library: only present in state files written before RFC 0013 moved pages into
  // the local index (or by a machine still on an older build). Kept so a mixed-
  // version sync doesn't strand those pages — the newer machine migrates whatever
  // arrives here into its own index on next boot. Once every machine is migrated
  // this key stops being written and this block no-ops.
  //
  // unionBy returns newest-first, so the cap drops the oldest items — the same
  // ones the renderer's own trim would have dropped.
  //
  // The key is emitted ONLY when some source actually carried pages. Setting it
  // unconditionally is what kept a migrated profile from ever shrinking: the
  // renderer stops sending `library`, but the copy still on disk came back through
  // this union on every save and was written out again — 1.6MB resurrected in
  // perpetuity, which is most of the save cost this merge sits in front of. Absent
  // means absent; save-state absorbs whatever a legacy machine does send into the
  // index and then drops the key for good (see absorbLegacyLibrary in main.js).
  const libHistory = unionBy(states.map((s) => s.library && s.library.history), (it) => it && it.id, libRecency)
    .filter((it) => survivesTomb(dtMap.pages, it && it.id, libRecency(it)))
    .slice(0, MAX_LIBRARY);
  const libTrash = unionBy(states.map((s) => s.library && s.library.trash), (it) => it && it.id, libRecency)
    .filter((it) => survivesTomb(dtMap.trash, it && it.id, libRecency(it)))
    .slice(0, MAX_LIBRARY);
  if (libHistory.length || libTrash.length) merged.library = { history: libHistory, trash: libTrash };
  else delete merged.library;

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
