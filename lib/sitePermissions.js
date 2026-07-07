'use strict';

// Per-site permission decisions for embedded real sites (RFC 0011 privacy).
//
// Chromium/Electron would otherwise force a single global answer for sensitive
// permissions (camera, microphone, location, notifications). A browser you can
// live in has to decide these PER SITE and remember the choice — allow your
// video-call site the camera without handing it to every page. This module is
// the storage layer; the prompt + handler wiring live in electron/main.js.
//
// Storage: a small JSON file, { [origin]: { [permission]: 'allow' | 'deny' } }.
// Origins are normalized to scheme://host (port dropped) so www/#hash/path don't
// fragment the same site into many entries.

const fs = require('fs');

// The permissions we gate per-site. 'media' covers camera + microphone (Chromium
// reports both under the 'media' permission, distinguished by details.mediaTypes).
const MANAGED_PERMISSIONS = ['media', 'geolocation', 'notifications'];

// Normalize any URL or origin string to a stable scheme://host key. Returns '' for
// anything we won't gate (e.g. the app's own file:// UI, blank/opaque origins).
function originKey(input) {
  const s = String(input || '');
  if (!s || s === 'null') return '';
  try {
    const u = new URL(s);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
    return `${u.protocol}//${u.hostname}`;
  } catch {
    return '';
  }
}

function createSitePermissions(filePath) {
  let store = {};
  try {
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (parsed && typeof parsed === 'object') store = parsed;
    }
  } catch { store = {}; }

  function persist() {
    try { fs.writeFileSync(filePath, JSON.stringify(store, null, 2)); } catch { /* best effort */ }
  }

  // 'allow' | 'deny' | undefined (undefined = never decided → caller should prompt).
  function get(origin, permission) {
    const k = originKey(origin);
    return k && store[k] ? store[k][permission] : undefined;
  }

  function set(origin, permission, decision) {
    const k = originKey(origin);
    if (!k || !MANAGED_PERMISSIONS.includes(permission)) return;
    if (decision !== 'allow' && decision !== 'deny') return;
    if (!store[k]) store[k] = {};
    store[k][permission] = decision;
    persist();
  }

  // Everything, shaped for the Settings UI: [{ origin, permissions: {media,...} }].
  function list() {
    return Object.keys(store)
      .sort((a, b) => a.localeCompare(b))
      .map((origin) => ({ origin, permissions: { ...store[origin] } }))
      .filter((e) => Object.keys(e.permissions).length);
  }

  // Revoke a single permission for a site (or the whole site if permission omitted).
  function clear(origin, permission) {
    const k = originKey(origin);
    if (!k || !store[k]) return;
    if (permission) { delete store[k][permission]; if (!Object.keys(store[k]).length) delete store[k]; }
    else delete store[k];
    persist();
  }

  function clearAll() { store = {}; persist(); }

  return { get, set, list, clear, clearAll, originKey };
}

module.exports = { createSitePermissions, originKey, MANAGED_PERMISSIONS };
