'use strict';

// Max characters of a text attachment sent to the model. ~500k chars ≈ 125k
// tokens — large enough for real files within Claude's context, while bounding
// cost. Files under this are sent whole. Bigger files use local retrieval (below):
// the rows relevant to the user's question are selected, so size stops being a
// wall (the long-term cloud/indexed version is RFC 0004).
const MAX_ATTACH_CHARS = 500000;

// Words to ignore when pulling search terms from the question — generic request
// filler, so matching focuses on content words (e.g. "scottish", "royalty").
const STOP = new Set([
  'the', 'and', 'for', 'you', 'your', 'with', 'from', 'what', 'whats', 'who', 'all', 'this', 'that',
  'use', 'using', 'about', 'give', 'please', 'provide', 'comprehensive', 'timeline', 'people', 'person',
  'attached', 'attachment', 'file', 'files', 'list', 'show', 'tell', 'find', 'want', 'need', 'into',
  'over', 'more', 'most', 'full', 'complete', 'data', 'info', 'information', 'details', 'detail',
  'question', 'asks', 'can', 'could', 'would', 'make', 'create', 'build', 'summary', 'summarize',
  'summarise', 'overview', 'here', 'there', 'have', 'has', 'are', 'was', 'were', 'their', 'them',
]);

// 4-char stems of the question's content words (so "scottish" matches "Scotland",
// "Scott", "Scottish"). Empty when there's nothing meaningful to match on.
function queryStems(query) {
  return [...new Set(
    String(query || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP.has(w))
      .map((w) => w.slice(0, 4))
  )];
}

function headSlice(label, full) {
  return `\n\n--- Attached file: ${label} (TRUNCATED — showing the first ${MAX_ATTACH_CHARS.toLocaleString()} of ${full.length.toLocaleString()} characters; the rest was NOT sent, so do not assume the visible portion is complete or representative — say so if the answer may depend on the omitted part) ---\n${full.slice(0, MAX_ATTACH_CHARS)}`;
}

// Format one text attachment, with local retrieval for large files: keep the
// header + the lines matching the question's terms, within the char budget.
function formatTextAttachment(name, text, query) {
  const full = String(text || '');
  const label = name || 'file';
  if (full.length <= MAX_ATTACH_CHARS) {
    return `\n\n--- Attached file: ${label} ---\n${full}`;
  }
  const stems = queryStems(query);
  const lines = full.split('\n');
  if (!stems.length || lines.length < 3) return headSlice(label, full); // nothing to match → head slice

  const header = lines[0] || '';
  let used = header.length + 1;
  const matched = [];
  let scanned = 0;
  for (let i = 1; i < lines.length; i++) {
    scanned++;
    const low = lines[i].toLowerCase();
    if (stems.some((s) => low.includes(s))) {
      if (used + lines[i].length + 1 > MAX_ATTACH_CHARS) break;
      matched.push(lines[i]);
      used += lines[i].length + 1;
    }
  }
  if (!matched.length) return headSlice(label, full); // no rows matched → head slice

  const body = `${header}\n${matched.join('\n')}`;
  return `\n\n--- Attached file: ${label} (LARGE FILE — ${full.length.toLocaleString()} chars / ${scanned.toLocaleString()} rows. Showing the header plus the ${matched.length.toLocaleString()} rows most relevant to the request; other rows were omitted. If the answer may depend on omitted rows, say so.) ---\n${body}`;
}

module.exports = { MAX_ATTACH_CHARS, formatTextAttachment };
