'use strict';

// Shared helpers for the feed adapters.
//
// Vendored from PulseKeeper (C:\Code\Personal Content Builder\src\main\sources\),
// which carried a near-identical stripHTML in three files, all with the same bug:
// `&[a-z]+;` -> ' ' turned every entity into a space, so "AT&amp;T" read as "AT T"
// and every curly quote silently vanished. Decode them instead. Feed summaries go
// straight into a model prompt at digest time, so mangled text is mangled output.

// Feeds want a browser UA: Cloudflare (and Reddit's edge in particular) rejects
// non-browser agents outright, so Chervil's own ChervilWatcher/1.0 UA — fine for
// fetching a page a user explicitly asked to watch — gets 403s here.
const FEED_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// A summary is what the digest model actually reads, so it's sized for that, not
// for display. PulseKeeper capped at 300 to fit a tray popup; 500 costs ~2.5MB at
// the 5000-item ceiling and gives the model enough to group items by theme.
const MAX_SUMMARY = 500;

const NAMED = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  hellip: '…', mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’',
  ldquo: '“', rdquo: '”', trade: '™', copy: '©', reg: '®', deg: '°',
};

// One pass over all three entity forms. Decoding in separate passes would
// double-decode: `&#38;lt;` would become `&lt;` on the numeric pass and then `<`
// on the named one.
const ENTITY_RE = /&(?:#x([0-9a-f]+)|#(\d+)|([a-z][a-z0-9]*));/gi;

function safeChar(code) {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return '';
  try { return String.fromCodePoint(code); } catch { return ''; }
}

function decodeEntities(str) {
  return String(str == null ? '' : str).replace(ENTITY_RE, (m, hex, dec, name) => {
    if (hex) return safeChar(parseInt(hex, 16));
    if (dec) return safeChar(parseInt(dec, 10));
    const v = NAMED[String(name).toLowerCase()];
    return v === undefined ? m : v; // leave an unknown entity intact rather than eat it
  });
}

// Tags collapse to a space, not to nothing: `<p>one</p><p>two</p>` must not read
// "onetwo".
function stripHTML(html) {
  return decodeEntities(String(html == null ? '' : html).replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

/** Feeds speak ISO/RFC-822 dates; Chervil is ms epoch throughout. */
function toMs(v, fallback = Date.now()) {
  if (v == null || v === '') return fallback;
  if (typeof v === 'number') return Number.isFinite(v) ? v : fallback;
  const t = Date.parse(String(v));
  return Number.isNaN(t) ? fallback : t;
}

module.exports = { FEED_UA, MAX_SUMMARY, decodeEntities, stripHTML, toMs };
