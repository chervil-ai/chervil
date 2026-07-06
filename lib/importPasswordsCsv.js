'use strict';
// Parse a browser/password-manager "export passwords" CSV. Because Chrome, Edge,
// Firefox, 1Password, Bitwarden, LastPass, etc. all export slightly different
// column orders, we key off the HEADER row (url/username/password) rather than
// position. This is a pure function — no filesystem, no secrets held.

// A correct CSV reader: handles quoted fields with embedded commas, escaped quotes
// ("" → "), CRLF/LF line endings, and a leading UTF-8 BOM. Passwords routinely
// contain commas and quotes, so a naive split() would corrupt them.
function parseCsv(text) {
  const s = String(text == null ? '' : text).replace(/^﻿/, '');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { inQuotes = true; i++; continue; }
    if (c === ',') { row.push(field); field = ''; i++; continue; }
    if (c === '\r') { i++; continue; }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
    field += c; i++;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Find a column index by any of several accepted header names.
function pick(header, names) {
  for (const n of names) {
    const i = header.indexOf(n);
    if (i >= 0) return i;
  }
  return -1;
}

// Returns [{ url, username, password }]. Empty array if the header isn't a
// recognizable passwords export (so we can tell the user "that's not a passwords CSV").
function parsePasswordsCsv(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => String(h).trim().toLowerCase());
  const iUrl = pick(header, ['url', 'login_uri', 'website', 'web site', 'site']);
  const iUser = pick(header, ['username', 'login_username', 'user', 'login']);
  const iPass = pick(header, ['password', 'login_password', 'pass']);
  if (iUrl < 0 || iPass < 0) return [];
  const out = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || (row.length === 1 && row[0] === '')) continue;
    const url = (row[iUrl] || '').trim();
    const password = row[iPass] || '';
    if (!url && !password) continue;
    out.push({ url, username: iUser >= 0 ? (row[iUser] || '') : '', password });
  }
  return out;
}

module.exports = { parseCsv, parsePasswordsCsv };
