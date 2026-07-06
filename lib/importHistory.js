'use strict';
// Import browsing history from other Chromium browsers (Chrome / Edge / Brave /
// Vivaldi). History lives in a SQLite "History" DB the browser keeps locked, so we
// read it via the shared copy-then-read helper (node:sqlite, no dependency). Times
// are WebKit-epoch microseconds stored as huge integers, so we CAST them to TEXT in
// SQL to dodge JS's safe-integer limit. Read-only.

const { withCopiedSqlite } = require('./importSqlite');
const { enumerateSources, isImportablePath, webkitToUnixMs } = require('./importBookmarks');

// Read a profile's history newest-first, normalized to Chervil's shape. Capped so a
// giant history doesn't balloon the state file; the cap keeps the most recent visits.
function readHistory(historyPath, limit) {
  const lim = Number(limit) > 0 ? Math.floor(Number(limit)) : 5000; // guard against NaN/0/bad input
  const rows = withCopiedSqlite(historyPath, (db) => db.prepare(
    'SELECT url, title, visit_count, CAST(last_visit_time AS TEXT) AS lvt ' +
    'FROM urls WHERE last_visit_time > 0 ORDER BY last_visit_time DESC LIMIT ' + lim,
  ).all());
  if (!rows) return [];
  return rows
    .filter((r) => r && typeof r.url === 'string' && /^https?:\/\//i.test(r.url))
    .map((r) => ({
      url: r.url,
      title: (r.title && String(r.title).trim()) || r.url,
      visitCount: Number(r.visit_count) || 0,
      at: webkitToUnixMs(r.lvt),
    }));
}

// Importable history sources. No per-DB copy here (counting would copy every History
// DB, up to 100s of MB, on each picker open) — the count is deferred to import.
function listHistorySources() {
  return enumerateSources('History');
}

module.exports = {
  listHistorySources,
  readHistory,
  isImportablePath: (srcPath) => isImportablePath('History', srcPath),
};
