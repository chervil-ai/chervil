'use strict';

// Parse an OPML subscription list (what every feed reader exports).
//
// Hand-rolled, not xml2js — even though xml2js is on disk as a transitive of
// rss-parser, `require('xml2js')` resolves only by npm's hoisting, which is not a
// contract: a future install pinning a different version, or a move to pnpm, breaks
// it silently in a packaged build. OPML is shallow `<outline …>` elements, so a
// regex extractor is less code than the xml2js callback dance and adds no declared
// dependency — the same shape rssDiscover.js already uses on markup.
//
// Folders are kept. OPML nests feeds under <outline> containers; each feed is
// stamped with the name of its immediate enclosing container (its parent folder),
// which Chervil groups by. This is a proper `folder` FIELD, not a name prefix —
// the old objection (a prefix would be permanent, since nothing rewrites a feed's
// name) doesn't apply to a field you can change later.

const { decodeEntities } = require('./util');

// Pull one attribute out of an <outline …> tag. Attributes may be single- or
// double-quoted; OPML in the wild uses both.
function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i'))
    || tag.match(new RegExp(`\\b${name}\\s*=\\s*'([^']*)'`, 'i'));
  return m ? decodeEntities(m[1]) : '';
}

/**
 * @param {string} text  OPML file contents
 * @returns {{ feeds: Array<{title,xmlUrl,htmlUrl,type,folder}>, folders: number, skipped: number }}
 *   feeds — every outline with an xmlUrl (that's what makes an outline a feed),
 *           each carrying `folder` = its immediate container's label ('' at top level)
 *   folders — distinct container labels seen (reported to the user)
 *   skipped — outlines that were neither a feed nor a labelled container
 */
function parseOpml(text) {
  const src = String(text || '');
  const feeds = [];
  const seenContainers = new Set();
  let skipped = 0;

  // Nesting-aware scan: a flat regex can't tell a feed's parent, so track container
  // depth with a stack. Match an opening `<outline …>`, a self-closing
  // `<outline …/>`, or a closing `</outline>`, in document order.
  //   - a self-closing feed (has xmlUrl) → emit with the current top-of-stack folder
  //   - a self-closing labelled non-feed → a childless folder; note it, don't push
  //   - an opening non-feed with a label → a container: emit nothing, PUSH its label
  //   - an opening feed (has xmlUrl AND children — rare) → emit, then push '' so its
  //     children aren't misattributed to it
  //   - `</outline>` → pop
  const re = /<outline\b([^>]*?)(\/?)>|<\/outline\s*>/gi;
  const stack = []; // labels of currently-open containers
  const folderTop = () => (stack.length ? stack[stack.length - 1] : '');
  let m;
  while ((m = re.exec(src))) {
    if (m[0][1] === '/') { stack.pop(); continue; } // </outline>
    const tag = m[1] || '';
    const selfClosing = m[2] === '/';
    const xmlUrl = attr(tag, 'xmlUrl') || attr(tag, 'xmlurl');
    const label = attr(tag, 'text') || attr(tag, 'title');

    if (xmlUrl) {
      feeds.push({
        title: label || '',
        xmlUrl: xmlUrl.trim(),
        htmlUrl: (attr(tag, 'htmlUrl') || attr(tag, 'htmlurl')).trim(),
        type: (attr(tag, 'type') || 'rss').toLowerCase(),
        folder: folderTop(),
      });
      if (!selfClosing) stack.push(''); // a feed that (unusually) has children
    } else if (label) {
      if (!seenContainers.has(label)) seenContainers.add(label);
      if (!selfClosing) stack.push(label);
    } else {
      // no xmlUrl, no label — junk
      skipped++;
      if (!selfClosing) stack.push(''); // still a scope; keep the stack balanced
    }
  }

  return { feeds, folders: seenContainers.size, skipped };
}

module.exports = { parseOpml };
