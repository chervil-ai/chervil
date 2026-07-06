'use strict';
// Shared primitive for the SQLite-backed importers (history, autofill): safely read
// a browser's locked SQLite DB by copying it (plus its -wal/-shm sidecars) to a
// private temp file, opening read-only via Node's built-in node:sqlite, running a
// query, and always cleaning up. Chromium holds an exclusive lock on live DBs, so a
// direct read-only open fails ("database is locked") — the copy is required.

const fs = require('fs');
const path = require('path');
const os = require('os');

// node:sqlite is built into Node 22.5+/Electron; guard so an older runtime just
// disables the SQLite importers instead of throwing at module load.
function loadSqlite() {
  try { return require('node:sqlite'); } catch { return null; }
}

// Copy dbPath (+ sidecars) to temp, open read-only, run fn(db), clean up. Returns
// fn's result, or null if SQLite is unavailable / the copy or open failed.
function withCopiedSqlite(dbPath, fn) {
  const sqlite = loadSqlite();
  if (!sqlite) return null;
  const tmp = path.join(os.tmpdir(), 'chervil-imp-' + process.pid + '-' + Date.now() + '-' + Math.floor(Math.random() * 1e6));
  let db;
  try {
    fs.copyFileSync(dbPath, tmp);
    // Best-effort restrict the temp copy (it briefly holds browser data). No-op-ish
    // on Windows ACLs, but tightens perms on macOS/Linux.
    try { fs.chmodSync(tmp, 0o600); } catch { /* ignore */ }
    for (const ext of ['-wal', '-shm']) { try { fs.copyFileSync(dbPath + ext, tmp + ext); } catch { /* sidecar may not exist */ } }
    db = new sqlite.DatabaseSync(tmp, { readOnly: true });
    return fn(db);
  } catch {
    return null;
  } finally {
    try { if (db) db.close(); } catch { /* ignore */ }
    for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(tmp + s); } catch { /* ignore */ } }
  }
}

module.exports = { loadSqlite, withCopiedSqlite };
