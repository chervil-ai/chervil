'use strict';

// Passphrase-gated credential vault (RFC 0008, Phase 8.1).
//
// Security model:
//  - Entries are encrypted with AES-256-GCM under a key derived from the user's
//    MASTER PASSPHRASE via scrypt (Node built-in crypto — no native deps).
//  - The on-disk record is *additionally* wrapped with Electron safeStorage when
//    available (OS-account binding), so at rest you need both the OS account and
//    the passphrase. If safeStorage is unavailable, the passphrase layer still
//    protects the data.
//  - The passphrase is NEVER stored. Wrong passphrase = GCM auth failure on
//    decrypt, which we surface as "locked / bad passphrase".
//  - Plaintext passwords live only in memory while UNLOCKED, never in the session
//    state file, never in logs.
//
// This module is storage + crypto only; IPC wiring + the fill UX live elsewhere.

const crypto = require('crypto');
const fs = require('fs');

const SCRYPT_N = 1 << 15; // 32768 — cost factor (memory/CPU); fine for an interactive unlock
const SCRYPT_PARAMS = { N: SCRYPT_N, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LEN = 32; // AES-256

function deriveKey(passphrase, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(String(passphrase), salt, KEY_LEN, SCRYPT_PARAMS, (err, key) => {
      if (err) reject(err); else resolve(key);
    });
  });
}

function encryptEntries(entries, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const pt = Buffer.from(JSON.stringify(entries || []), 'utf8');
  const ct = Buffer.concat([cipher.update(pt), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv: iv.toString('base64'), tag: tag.toString('base64'), data: ct.toString('base64') };
}

function decryptEntries(rec, key) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(rec.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(rec.tag, 'base64'));
  const pt = Buffer.concat([decipher.update(Buffer.from(rec.data, 'base64')), decipher.final()]);
  const arr = JSON.parse(pt.toString('utf8'));
  return Array.isArray(arr) ? arr : [];
}

/**
 * Create a vault bound to a file path, using an optional safeStorage shim
 * ({ isEncryptionAvailable, encryptString, decryptString }) for the outer layer.
 */
function createVault(filePath, safeStorage) {
  // In-memory session state. `entries` and `key` are null while LOCKED.
  let key = null;
  let entries = null;
  let salt = null;

  const osWrap = (jsonStr) => {
    if (safeStorage && safeStorage.isEncryptionAvailable && safeStorage.isEncryptionAvailable()) {
      return Buffer.concat([Buffer.from('SS1'), safeStorage.encryptString(jsonStr)]);
    }
    return Buffer.from('PJ1' + jsonStr, 'utf8'); // plain-JSON marker (inner layer still passphrase-encrypted)
  };
  const osUnwrap = (buf) => {
    const head = buf.slice(0, 3).toString('utf8');
    if (head === 'SS1') return safeStorage.decryptString(buf.slice(3));
    if (head === 'PJ1') return buf.slice(3).toString('utf8');
    // Legacy/unknown: assume plain JSON.
    return buf.toString('utf8');
  };

  function isConfigured() {
    try { return fs.existsSync(filePath); } catch { return false; }
  }
  function isUnlocked() { return !!key && Array.isArray(entries); }

  // Read the on-disk record → { salt, iv, tag, data } (still passphrase-encrypted).
  function readRecord() {
    const raw = fs.readFileSync(filePath);
    const rec = JSON.parse(osUnwrap(raw));
    if (!rec || !rec.salt || !rec.data) throw new Error('Corrupt vault file.');
    return rec;
  }
  function writeRecord() {
    const rec = { v: 1, kdf: 'scrypt', salt: salt.toString('base64'), ...encryptEntries(entries, key) };
    fs.writeFileSync(filePath, osWrap(JSON.stringify(rec)));
  }

  // First-time setup: choose a master passphrase and create an empty vault.
  async function setup(passphrase) {
    if (isConfigured()) throw new Error('Vault already exists.');
    if (!passphrase || String(passphrase).length < 8) throw new Error('Passphrase must be at least 8 characters.');
    salt = crypto.randomBytes(16);
    key = await deriveKey(passphrase, salt);
    entries = [];
    writeRecord();
  }

  // Unlock an existing vault. Returns true on success, false on bad passphrase.
  async function unlock(passphrase) {
    if (!isConfigured()) throw new Error('No vault to unlock.');
    const rec = readRecord();
    const s = Buffer.from(rec.salt, 'base64');
    const k = await deriveKey(passphrase, s);
    try {
      entries = decryptEntries(rec, k); // GCM auth fails here on wrong passphrase
      key = k; salt = s;
      return true;
    } catch {
      key = null; entries = null;
      return false;
    }
  }

  function lock() { key = null; entries = null; salt = null; }

  function requireUnlocked() { if (!isUnlocked()) throw new Error('Vault is locked.'); }

  // Public listing — NEVER includes the password.
  function list() {
    requireUnlocked();
    return entries.map((e) => ({ id: e.id, origin: e.origin, username: e.username, label: e.label || '', updatedAt: e.updatedAt, lastUsed: e.lastUsed || null }));
  }

  function save({ id, origin, username, password, label }) {
    requireUnlocked();
    if (!origin) throw new Error('Missing site.');
    const now = Date.now();
    if (id) {
      const e = entries.find((x) => x.id === id);
      if (!e) throw new Error('Entry not found.');
      if (origin != null) e.origin = origin;
      if (username != null) e.username = username;
      if (password != null && password !== '') e.password = password;
      if (label != null) e.label = label;
      e.updatedAt = now;
      writeRecord();
      return { id: e.id };
    }
    // Upsert by (origin, username): updating a known login replaces its password.
    const existing = entries.find((x) => x.origin === origin && x.username === username);
    if (existing) {
      if (password != null) existing.password = password;
      if (label != null) existing.label = label;
      existing.updatedAt = now;
      writeRecord();
      return { id: existing.id };
    }
    const entry = { id: crypto.randomUUID(), origin, username: username || '', password: password || '', label: label || '', createdAt: now, updatedAt: now };
    entries.push(entry);
    writeRecord();
    return { id: entry.id };
  }

  function remove(id) {
    requireUnlocked();
    const i = entries.findIndex((x) => x.id === id);
    if (i >= 0) { entries.splice(i, 1); writeRecord(); }
    return { ok: true };
  }

  // Reveal a single password (gated: requires unlocked = passphrase entered).
  function reveal(id) {
    requireUnlocked();
    const e = entries.find((x) => x.id === id);
    if (!e) throw new Error('Entry not found.');
    return { username: e.username, password: e.password };
  }

  // How many saved logins match a registrable domain (no plaintext, no write) —
  // lets the UI decide whether to offer the fill affordance.
  function countForOrigin(origin) {
    requireUnlocked();
    return entries.filter((e) => e.origin === origin).length;
  }

  // Is this exact (origin, username, password) already saved? Lets the capture
  // flow skip prompting for an unchanged login. Takes plaintext in, returns only
  // a boolean — never echoes a stored password back out.
  function hasExact(origin, username, password) {
    requireUnlocked();
    return entries.some((e) => e.origin === origin && e.username === (username || '') && e.password === password);
  }

  // For Phase 8.2 fill: matching credentials for a registrable domain. Returns
  // plaintext — callers must gate this to a user fill gesture.
  function getForOrigin(origin) {
    requireUnlocked();
    const now = Date.now();
    const matches = entries.filter((e) => e.origin === origin);
    for (const e of matches) e.lastUsed = now;
    if (matches.length) writeRecord();
    return matches.map((e) => ({ id: e.id, username: e.username, password: e.password }));
  }

  return {
    isConfigured, isUnlocked, setup, unlock, lock,
    list, save, remove, reveal, getForOrigin, countForOrigin, hasExact,
  };
}

module.exports = { createVault };
