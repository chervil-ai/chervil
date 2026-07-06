'use strict';
// Import bookmarks from other Chromium browsers (Chrome / Edge / Brave / Vivaldi /
// Opera). Those browsers all keep bookmarks in a plain-JSON "Bookmarks" file per
// profile — no database, no decryption — so this is the safe, dependency-free first
// step of "switch to Chervil and keep your stuff" (history + passwords are separate,
// harder phases). Everything here is read-only; we never touch the source files.

const fs = require('fs');
const path = require('path');

// Chrome stores timestamps as microseconds since 1601-01-01 (the WebKit/Windows
// FILETIME epoch). Convert to the Unix milliseconds Chervil uses everywhere.
const WEBKIT_EPOCH_OFFSET_MS = 11644473600000; // ms between 1601-01-01 and 1970-01-01
function webkitToUnixMs(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n / 1000 - WEBKIT_EPOCH_OFFSET_MS);
}

// Walk a parsed Bookmarks JSON tree into a flat list of web bookmarks. Folder
// nesting is flattened to a single "A/B" label (Chervil folders are flat names).
// Root containers (bookmark_bar/other/synced) are NOT part of the folder path, so a
// bookmark sitting directly on the bar comes in unfiled — matching how it looked.
function parseBookmarksTree(json) {
  const out = [];
  const roots = json && json.roots;
  if (!roots || typeof roots !== 'object') return out;
  const walk = (node, folderPath) => {
    const children = node && Array.isArray(node.children) ? node.children : [];
    for (const c of children) {
      if (!c) continue;
      if (c.type === 'url' && c.url) {
        if (!/^https?:\/\//i.test(c.url)) continue; // skip javascript:/chrome:/file: etc.
        out.push({
          url: c.url,
          title: (c.name && c.name.trim()) || c.url,
          folder: folderPath.join('/'),
          addedAt: webkitToUnixMs(c.date_added),
        });
      } else if (c.type === 'folder') {
        walk(c, folderPath.concat((c.name && c.name.trim()) || 'Folder'));
      }
    }
  };
  for (const key of ['bookmark_bar', 'other', 'synced']) {
    if (roots[key]) walk(roots[key], []);
  }
  return out;
}

// Read + parse a single Bookmarks file. Returns [] on any error (missing/locked/
// malformed) rather than throwing — a bad profile shouldn't sink the whole import.
function readSource(bookmarksPath) {
  try {
    const raw = fs.readFileSync(bookmarksPath, 'utf8');
    return parseBookmarksTree(JSON.parse(raw));
  } catch {
    return [];
  }
}

// Friendly profile name (e.g. "Work") from a browser's Local State file, keyed by
// the on-disk profile directory. Falls back to null so callers can use the dir name.
function profileDisplayName(userDataDir, profileDir) {
  try {
    const ls = JSON.parse(fs.readFileSync(path.join(userDataDir, 'Local State'), 'utf8'));
    const info = ls && ls.profile && ls.profile.info_cache && ls.profile.info_cache[profileDir];
    const name = info && info.name;
    return (name && String(name).trim()) || null;
  } catch {
    return null;
  }
}

// Per-platform locations of each Chromium browser's "User Data" root.
function browserRoots() {
  if (process.platform === 'win32') {
    const local = process.env.LOCALAPPDATA || '';
    const roaming = process.env.APPDATA || '';
    return [
      { browser: 'Chrome', dir: local && path.join(local, 'Google', 'Chrome', 'User Data') },
      { browser: 'Edge', dir: local && path.join(local, 'Microsoft', 'Edge', 'User Data') },
      { browser: 'Brave', dir: local && path.join(local, 'BraveSoftware', 'Brave-Browser', 'User Data') },
      { browser: 'Vivaldi', dir: local && path.join(local, 'Vivaldi', 'User Data') },
      { browser: 'Opera', dir: roaming && path.join(roaming, 'Opera Software', 'Opera Stable') },
    ].filter((b) => b.dir);
  }
  if (process.platform === 'darwin') {
    const home = process.env.HOME || '';
    const app = home && path.join(home, 'Library', 'Application Support');
    if (!app) return [];
    return [
      { browser: 'Chrome', dir: path.join(app, 'Google', 'Chrome') },
      { browser: 'Edge', dir: path.join(app, 'Microsoft Edge') },
      { browser: 'Brave', dir: path.join(app, 'BraveSoftware', 'Brave-Browser') },
      { browser: 'Vivaldi', dir: path.join(app, 'Vivaldi') },
    ];
  }
  // Linux (best-effort).
  const home = process.env.HOME || '';
  const cfg = home && path.join(home, '.config');
  if (!cfg) return [];
  return [
    { browser: 'Chrome', dir: path.join(cfg, 'google-chrome') },
    { browser: 'Edge', dir: path.join(cfg, 'microsoft-edge') },
    { browser: 'Brave', dir: path.join(cfg, 'BraveSoftware', 'Brave-Browser') },
    { browser: 'Vivaldi', dir: path.join(cfg, 'vivaldi') },
  ];
}

// Candidate profile directories inside a User Data root: "Default", "Profile N",
// plus the root itself (Opera keeps its Bookmarks file directly in the root).
function profileDirsIn(userDataDir) {
  const out = [''];
  try {
    for (const name of fs.readdirSync(userDataDir)) {
      if (name === 'Default' || /^Profile /.test(name)) {
        try { if (fs.statSync(path.join(userDataDir, name)).isDirectory()) out.push(name); } catch { /* skip */ }
      }
    }
  } catch { /* unreadable root */ }
  return out;
}

// Generic source enumerator shared by all importers: every browser × profile that
// has a file named `fileName` (Bookmarks / History / Web Data), with a friendly
// label. Callers add a `count` if it's cheap to compute (bookmarks parse the JSON;
// the SQLite importers skip it to avoid copying whole DBs just to count).
function enumerateSources(fileName) {
  const sources = [];
  for (const { browser, dir } of browserRoots()) {
    for (const profileDir of profileDirsIn(dir)) {
      const filePath = path.join(dir, profileDir, fileName);
      let stat;
      try { stat = fs.statSync(filePath); } catch { continue; }
      if (!stat.isFile()) continue;
      const friendly = profileDisplayName(dir, profileDir || 'Default');
      const profileLabel = friendly || (profileDir || 'Default');
      sources.push({
        id: `${browser}:${profileDir || 'Default'}`,
        browser,
        profileDir: profileDir || 'Default',
        profileName: profileLabel,
        label: `${browser} — ${profileLabel}`,
        path: filePath,
      });
    }
  }
  return sources;
}

// Cheap path-membership check (the security boundary for the import IPC handlers):
// is srcPath one of the `fileName` files we ourselves enumerate? No file reads.
function isImportablePath(fileName, srcPath) {
  return enumerateSources(fileName).some((s) => s.path === srcPath);
}

// Bookmarks sources, with a live count (parsing the JSON is cheap).
function listSources() {
  return enumerateSources('Bookmarks')
    .map((s) => ({ ...s, count: readSource(s.path).length }))
    .filter((s) => s.count > 0);
}

module.exports = {
  parseBookmarksTree, readSource, listSources, webkitToUnixMs,
  // Shared helpers reused by the history/autofill importers.
  browserRoots, profileDirsIn, profileDisplayName, enumerateSources, isImportablePath,
};
