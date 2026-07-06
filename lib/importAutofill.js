'use strict';
// Import contact/address autofill from other Chromium browsers. Unlike passwords and
// cards (encrypted), address profiles live UNENCRYPTED in the "Web Data" SQLite DB —
// modern Chrome/Edge store each field as a (type, value) row in address_type_tokens
// keyed by an addresses.guid. We read the most-used profile and map Chrome's numeric
// FieldType codes onto Chervil's single autofill identity. Read-only.

const { withCopiedSqlite } = require('./importSqlite');
const { enumerateSources, isImportablePath } = require('./importBookmarks');

// Chrome autofill FieldType codes (verified against real Chrome + Edge data):
//   7 NAME_FULL · 9 EMAIL · 14 PHONE · 60 COMPANY · 77 STREET_ADDRESS ·
//   30 ADDRESS_LINE1 · 33 CITY · 35 ZIP · 36 COUNTRY
const FT = { fullName: 7, email: 9, phone: 14, organization: 60, streetFull: 77, streetLine1: 30, city: 33, postal: 35, country: 36 };

// Read the most-used address profile and assemble Chervil's identity fields.
function readPrimaryAddress(webDataPath) {
  return withCopiedSqlite(webDataPath, (db) => {
    let addr;
    try { addr = db.prepare('SELECT guid FROM addresses ORDER BY use_count DESC, use_date DESC LIMIT 1').get(); }
    catch { return null; } // older/newer schema without the modern addresses table
    if (!addr || !addr.guid) return null;
    const toks = db.prepare('SELECT type, value FROM address_type_tokens WHERE guid = ?').all(addr.guid);
    const byType = new Map();
    for (const t of toks) {
      const v = (t && t.value != null) ? String(t.value).trim() : '';
      if (v) byType.set(Number(t.type), v);
    }
    // Explicit field extraction with intentional precedence (no reliance on object
    // key-iteration order): the full street address (77) wins over line1 (30).
    const first = (...codes) => { for (const c of codes) { const v = byType.get(c); if (v) return v; } return ''; };
    const out = {};
    const put = (field, v) => { if (v) out[field] = v; };
    put('fullName', first(FT.fullName));
    put('email', first(FT.email));
    put('phone', first(FT.phone));
    put('organization', first(FT.organization));
    const street = first(FT.streetFull, FT.streetLine1);
    put('address', street && street.replace(/\s*\n+\s*/g, ', '));
    put('city', first(FT.city));
    put('postal', first(FT.postal));
    put('country', first(FT.country));
    return Object.keys(out).length ? out : null;
  });
}

// Importable address sources. No per-DB copy just to count (deferred to import).
function listAddressSources() {
  return enumerateSources('Web Data');
}

module.exports = {
  listAddressSources,
  readPrimaryAddress,
  isImportablePath: (srcPath) => isImportablePath('Web Data', srcPath),
};
