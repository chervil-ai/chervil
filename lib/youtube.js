'use strict';

// Shared YouTube id parser. Previously duplicated in electron/main.js (URL-only,
// for transcript fetch) and lib/lesson.js (regex, for media cards) with divergent
// coverage; unified here so both processes parse ids the same way.
//
// Accepts a bare 11-char id or any common YouTube URL form (watch?v=, youtu.be/,
// /embed/, /shorts/, /live/). Returns the 11-char id, or '' if none is found
// (falsy, so existing `if (!id)` guards keep working).

const ID = /^[a-zA-Z0-9_-]{11}$/;

function youtubeId(input) {
  const s = String(input == null ? '' : input).trim();
  if (!s) return '';
  if (ID.test(s)) return s; // already a bare id
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0] || '';
      if (ID.test(id)) return id;
    }
    if (host.endsWith('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v && ID.test(v)) return v;
      const m = u.pathname.match(/\/(?:shorts|embed|live)\/([a-zA-Z0-9_-]{11})/);
      if (m) return m[1];
    }
  } catch { /* not a URL — fall through to a loose scan */ }
  const m = s.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/|\/live\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : '';
}

module.exports = { youtubeId };
