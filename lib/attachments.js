'use strict';

// Max characters of a text attachment sent to the model. ~500k chars ≈ 125k
// tokens — large enough for real files (a full CSV, a long doc) within Claude's
// context window, while still bounding cost. Bigger files are truncated WITH a
// clear notice so the model knows it's seeing only part and won't draw confident
// conclusions from an incomplete slice.
const MAX_ATTACH_CHARS = 500000;

// Format one text attachment as a labeled block, truncating with a notice.
function formatTextAttachment(name, text) {
  const full = String(text || '');
  const label = name || 'file';
  if (full.length <= MAX_ATTACH_CHARS) {
    return `\n\n--- Attached file: ${label} ---\n${full}`;
  }
  const shown = full.slice(0, MAX_ATTACH_CHARS);
  return `\n\n--- Attached file: ${label} (TRUNCATED — showing the first ${MAX_ATTACH_CHARS.toLocaleString()} of ${full.length.toLocaleString()} characters; the rest was NOT sent, so do not assume the visible portion is complete or representative — say so if the answer may depend on the omitted part) ---\n${shown}`;
}

module.exports = { MAX_ATTACH_CHARS, formatTextAttachment };
