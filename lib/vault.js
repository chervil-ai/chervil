'use strict';

// Passphrase-gated credential vault (RFC 0008, Phase 8.1 logins; Phase 8.5 cards).
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
//  - Plaintext passwords and full card numbers live only in memory while
//    UNLOCKED, never in the session state file, never in logs.
//  - Payment cards NEVER store the CVC/security code (card-network best practice);
//    the user types it at checkout. Listings expose only brand + last4, never the
//    full PAN — the number is returned solely by revealCard/getCardForFill, both
//    gated on an unlocked vault + a user gesture.
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

// Encrypt an arbitrary JSON-serializable payload (the whole { logins, cards } store).
function encryptPayload(payload, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const pt = Buffer.from(JSON.stringify(payload || {}), 'utf8');
  const ct = Buffer.concat([cipher.update(pt), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv: iv.toString('base64'), tag: tag.toString('base64'), data: ct.toString('base64') };
}

function decryptPayload(rec, key) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(rec.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(rec.tag, 'base64'));
  const pt = Buffer.concat([decipher.update(Buffer.from(rec.data, 'base64')), decipher.final()]);
  return JSON.parse(pt.toString('utf8'));
}

// Normalize the decrypted payload into the current store shape. Legacy vaults
// stored a bare array of logins; new vaults store { logins, cards }.
function toStore(parsed) {
  if (Array.isArray(parsed)) return { logins: parsed, cards: [] };
  return {
    logins: Array.isArray(parsed && parsed.logins) ? parsed.logins : [],
    cards: Array.isArray(parsed && parsed.cards) ? parsed.cards : [],
  };
}

// --- Payment-card helpers (pure) -------------------------------------------
function onlyDigits(s) { return String(s || '').replace(/\D/g, ''); }

// Luhn checksum — rejects typos/invalid PANs before we bother storing them.
function luhnValid(digits) {
  if (!/^\d{12,19}$/.test(digits)) return false;
  let sum = 0, alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d; alt = !alt;
  }
  return sum % 10 === 0;
}

// Best-effort card-network detection from the IIN (leading digits). Display only.
function detectBrand(digits) {
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  if (/^(6011|65|64[4-9]|622)/.test(digits)) return 'Discover';
  if (/^3(0[0-5]|[68])/.test(digits)) return 'Diners Club';
  if (/^35/.test(digits)) return 'JCB';
  return 'Card';
}

function normalizeMonth(m) {
  const n = parseInt(m, 10);
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new Error('Expiry month must be 01–12.');
  return n;
}
function normalizeYear(y) {
  let n = parseInt(y, 10);
  if (!Number.isInteger(n)) throw new Error('Enter a valid expiry year.');
  if (n < 100) n += 2000; // 2-digit → 20xx
  if (n < 2000 || n > 2099) throw new Error('Enter a valid expiry year.');
  return n;
}

/**
 * Create a vault bound to a file path, using an optional safeStorage shim
 * ({ isEncryptionAvailable, encryptString, decryptString }) for the outer layer.
 */
function createVault(filePath, safeStorage) {
  // In-memory session state. All null while LOCKED.
  let key = null;
  let logins = null;
  let cards = null;
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
  function isUnlocked() { return !!key && Array.isArray(logins) && Array.isArray(cards); }

  // Read the on-disk record → { salt, iv, tag, data } (still passphrase-encrypted).
  function readRecord() {
    const raw = fs.readFileSync(filePath);
    const rec = JSON.parse(osUnwrap(raw));
    if (!rec || !rec.salt || !rec.data) throw new Error('Corrupt vault file.');
    return rec;
  }
  function writeRecord() {
    const rec = { v: 2, kdf: 'scrypt', salt: salt.toString('base64'), ...encryptPayload({ logins, cards }, key) };
    fs.writeFileSync(filePath, osWrap(JSON.stringify(rec)));
  }

  // First-time setup: choose a master passphrase and create an empty vault.
  async function setup(passphrase) {
    if (isConfigured()) throw new Error('Vault already exists.');
    if (!passphrase || String(passphrase).length < 8) throw new Error('Passphrase must be at least 8 characters.');
    salt = crypto.randomBytes(16);
    key = await deriveKey(passphrase, salt);
    logins = [];
    cards = [];
    writeRecord();
  }

  // Unlock an existing vault. Returns true on success, false on bad passphrase.
  async function unlock(passphrase) {
    if (!isConfigured()) throw new Error('No vault to unlock.');
    const rec = readRecord();
    const s = Buffer.from(rec.salt, 'base64');
    const k = await deriveKey(passphrase, s);
    try {
      const store = toStore(decryptPayload(rec, k)); // GCM auth fails here on wrong passphrase
      logins = store.logins; cards = store.cards;
      key = k; salt = s;
      return true;
    } catch {
      key = null; logins = null; cards = null;
      return false;
    }
  }

  function lock() { key = null; logins = null; cards = null; salt = null; }

  function requireUnlocked() { if (!isUnlocked()) throw new Error('Vault is locked.'); }

  // Public listing — NEVER includes the password.
  function list() {
    requireUnlocked();
    return logins.map((e) => ({ id: e.id, origin: e.origin, username: e.username, label: e.label || '', updatedAt: e.updatedAt, lastUsed: e.lastUsed || null }));
  }

  function save({ id, origin, username, password, label }) {
    requireUnlocked();
    if (!origin) throw new Error('Missing site.');
    const now = Date.now();
    if (id) {
      const e = logins.find((x) => x.id === id);
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
    const existing = logins.find((x) => x.origin === origin && x.username === username);
    if (existing) {
      if (password != null) existing.password = password;
      if (label != null) existing.label = label;
      existing.updatedAt = now;
      writeRecord();
      return { id: existing.id };
    }
    const entry = { id: crypto.randomUUID(), origin, username: username || '', password: password || '', label: label || '', createdAt: now, updatedAt: now };
    logins.push(entry);
    writeRecord();
    return { id: entry.id };
  }

  function remove(id) {
    requireUnlocked();
    const i = logins.findIndex((x) => x.id === id);
    if (i >= 0) { logins.splice(i, 1); writeRecord(); }
    return { ok: true };
  }

  // Reveal a single password (gated: requires unlocked = passphrase entered).
  function reveal(id) {
    requireUnlocked();
    const e = logins.find((x) => x.id === id);
    if (!e) throw new Error('Entry not found.');
    return { username: e.username, password: e.password };
  }

  // How many saved logins match a registrable domain (no plaintext, no write) —
  // lets the UI decide whether to offer the fill affordance.
  function countForOrigin(origin) {
    requireUnlocked();
    return logins.filter((e) => e.origin === origin).length;
  }

  // Is this exact (origin, username, password) already saved? Lets the capture
  // flow skip prompting for an unchanged login. Takes plaintext in, returns only
  // a boolean — never echoes a stored password back out.
  function hasExact(origin, username, password) {
    requireUnlocked();
    return logins.some((e) => e.origin === origin && e.username === (username || '') && e.password === password);
  }

  // For Phase 8.2 fill: matching credentials for a registrable domain. Returns
  // plaintext — callers must gate this to a user fill gesture.
  function getForOrigin(origin) {
    requireUnlocked();
    const now = Date.now();
    const matches = logins.filter((e) => e.origin === origin);
    for (const e of matches) e.lastUsed = now;
    if (matches.length) writeRecord();
    return matches.map((e) => ({ id: e.id, username: e.username, password: e.password }));
  }

  // --- Payment cards (Phase 8.5) --------------------------------------------
  // Public metadata only — NEVER the full number. Enough to pick a card + render
  // "Visa ····1234, exp 08/28".
  function cardMeta(c) {
    return { id: c.id, cardholder: c.cardholder || '', brand: c.brand || 'Card', last4: c.last4 || '', expMonth: c.expMonth, expYear: c.expYear, label: c.label || '', updatedAt: c.updatedAt, lastUsed: c.lastUsed || null };
  }
  function listCards() {
    requireUnlocked();
    return cards.map(cardMeta);
  }
  function countCards() {
    requireUnlocked();
    return cards.length;
  }

  function saveCard({ id, cardholder, number, expMonth, expYear, label }) {
    requireUnlocked();
    const now = Date.now();
    const month = normalizeMonth(expMonth);
    const year = normalizeYear(expYear);
    if (id) {
      // Edit: number is optional (blank = keep existing); other fields updated.
      const c = cards.find((x) => x.id === id);
      if (!c) throw new Error('Card not found.');
      const digits = onlyDigits(number);
      if (digits) {
        if (!luhnValid(digits)) throw new Error('That card number doesn’t look valid.');
        c.number = digits; c.brand = detectBrand(digits); c.last4 = digits.slice(-4);
      }
      if (cardholder != null) c.cardholder = String(cardholder).trim();
      if (label != null) c.label = String(label).trim();
      c.expMonth = month; c.expYear = year; c.updatedAt = now;
      writeRecord();
      return { id: c.id };
    }
    const digits = onlyDigits(number);
    if (!luhnValid(digits)) throw new Error('That card number doesn’t look valid.');
    const entry = {
      id: crypto.randomUUID(),
      cardholder: String(cardholder || '').trim(),
      number: digits,                 // full PAN, encrypted at rest with everything else
      brand: detectBrand(digits),
      last4: digits.slice(-4),
      expMonth: month, expYear: year,
      label: String(label || '').trim(),
      createdAt: now, updatedAt: now,
      // NOTE: no `cvc` field, by design — the security code is never stored.
    };
    cards.push(entry);
    writeRecord();
    return { id: entry.id };
  }

  function removeCard(id) {
    requireUnlocked();
    const i = cards.findIndex((x) => x.id === id);
    if (i >= 0) { cards.splice(i, 1); writeRecord(); }
    return { ok: true };
  }

  // Reveal a single card's full number (gated: unlocked). For the Settings list.
  function revealCard(id) {
    requireUnlocked();
    const c = cards.find((x) => x.id === id);
    if (!c) throw new Error('Card not found.');
    return { cardholder: c.cardholder, number: c.number, brand: c.brand, expMonth: c.expMonth, expYear: c.expYear };
  }

  // Full card details for a fill gesture (gated: unlocked + explicit user action).
  // Stamps lastUsed. Returns the full PAN — callers must inject it only on a
  // deliberate fill. Never includes a CVC (we don't store one).
  function getCardForFill(id) {
    requireUnlocked();
    const c = cards.find((x) => x.id === id);
    if (!c) throw new Error('Card not found.');
    c.lastUsed = Date.now();
    writeRecord();
    return { cardholder: c.cardholder, number: c.number, brand: c.brand, expMonth: c.expMonth, expYear: c.expYear };
  }

  return {
    isConfigured, isUnlocked, setup, unlock, lock,
    list, save, remove, reveal, getForOrigin, countForOrigin, hasExact,
    listCards, countCards, saveCard, removeCard, revealCard, getCardForFill,
  };
}

module.exports = { createVault };
