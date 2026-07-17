'use strict';

// Feed dispatch + normalization.
//
// Adapters are pure `feed -> raw items` functions; identity is stamped here so
// every adapter can't invent its own id scheme (PulseKeeper built the id inside
// each of its five adapters, which is how `webpage.js` ended up keying items on a
// content hash and minting a fresh row on every fetch).

const { fetchRSS } = require('./rss');
const { fetchYouTube } = require('./youtube');
const { fetchReddit } = require('./reddit');
const { discoverFeed } = require('./rssDiscover');
const { parseOpml } = require('./opml');

// RSS, Atom and their dialects are one wire format. The type is a label and an
// icon for the user, not a code path.
const RSS_LIKE = new Set(['rss', 'podcast', 'newsletter', 'blog']);

/**
 * Feed types offered in the UI. `fields` is a form schema — the Feeds pane
 * renders it, so this list and the dispatch below must stay in step.
 */
const FEED_TYPES = [
  {
    id: 'rss', label: 'RSS / Atom feed', emoji: '📡',
    description: 'Any RSS or Atom feed URL.',
    fields: [{ key: 'url', label: 'Feed URL', type: 'url', placeholder: 'https://example.com/feed.xml', required: true }],
  },
  {
    id: 'podcast', label: 'Podcast', emoji: '🎙',
    description: "A show's public RSS feed — no account needed.",
    fields: [{ key: 'url', label: 'Podcast RSS URL', type: 'url', placeholder: 'https://feeds.example.com/show', required: true }],
  },
  {
    id: 'newsletter', label: 'Newsletter', emoji: '✉️',
    description: 'Substack, Beehiiv, Ghost — anything with an RSS feed.',
    fields: [{ key: 'url', label: 'Newsletter RSS URL', type: 'url', placeholder: 'https://yourname.substack.com/feed', required: true }],
  },
  {
    id: 'blog', label: 'Blog', emoji: '📝',
    description: 'A blog’s RSS feed.',
    fields: [{ key: 'url', label: 'Blog RSS URL', type: 'url', placeholder: 'https://blog.example.com/rss', required: true }],
  },
  {
    id: 'youtube', label: 'YouTube channel', emoji: '▶️',
    description: 'A channel or playlist, via public RSS. A /channel/UC… URL is the most reliable; @handles are resolved for you (once, then cached).',
    fields: [{ key: 'url', label: 'Channel URL', type: 'url', placeholder: 'https://www.youtube.com/@channelname', required: true }],
  },
  {
    id: 'reddit', label: 'Subreddit', emoji: '👽',
    description: 'Posts from a subreddit.',
    fields: [
      { key: 'subreddit', label: 'Subreddit', type: 'text', placeholder: 'technology (or r/technology)', required: true },
      { key: 'sort', label: 'Sort', type: 'select', options: ['hot', 'new', 'top', 'rising'], default: 'hot' },
    ],
  },
];

function str(v, max = 2000) {
  return String(v == null ? '' : v).slice(0, max);
}

/**
 * Stamp identity, drop unusable rows, and de-dupe within a single fetch.
 * An item with no stable external key is dropped rather than given a synthetic
 * one — a synthetic key mints a new row on every fetch, which is exactly the
 * unbounded-growth bug we cut `webpage.js` to avoid.
 */
function normalize(feed, items) {
  const at = Date.now();
  const seen = new Set();
  const out = [];
  for (const it of items || []) {
    const externalId = str(it.externalId, 512).trim();
    if (!externalId) continue;
    const id = `${feed.type}:${feed.id}:${externalId}`;
    if (seen.has(id)) continue; // a feed that repeats a guid inside one response
    seen.add(id);
    out.push({
      id,
      feedId: feed.id,
      type: feed.type,
      externalId,
      url: str(it.url, 2048),
      title: str(it.title, 500) || '(no title)',
      author: str(it.author, 200),
      summary: str(it.summary, 2000),
      thumbnail: it.thumbnail ? str(it.thumbnail, 2048) : null,
      publishedAt: Number(it.publishedAt) || at,
      fetchedAt: Number(it.fetchedAt) || at,
    });
  }
  return out;
}

// Adapters take (feed, cursor) and return { items, resolvedUrl? }. The cursor is
// this machine's fetch state from feed_state — it exists so an adapter that has
// to resolve something expensive (a YouTube @handle costs up to four round trips)
// can do it once and hand the answer back to be cached.
async function dispatch(feed, cursor) {
  if (RSS_LIKE.has(feed.type)) return fetchRSS(feed, cursor);
  if (feed.type === 'youtube') return fetchYouTube(feed, cursor);
  if (feed.type === 'reddit') return fetchReddit(feed, cursor);
  throw new Error(`Unknown feed type: ${feed.type}`);
}

/**
 * Fetch one feed and return normalized, identity-stamped items.
 * Throws on failure — the caller records the error against the feed.
 *
 * @param {{id:string, type:string, name?:string, config:object, maxItems?:number}} feed
 * @param {{resolvedUrl?:string}} cursor  this machine's feed_state row
 * @returns {Promise<{items:Array, resolvedUrl:string}>}
 */
async function fetchFeed(feed, cursor = {}) {
  if (!feed || !feed.id || !feed.type) throw new Error('Feed is missing id or type');
  const res = (await dispatch(feed, cursor)) || {};
  return {
    items: normalize(feed, res.items),
    resolvedUrl: res.resolvedUrl || cursor.resolvedUrl || '',
  };
}

module.exports = { FEED_TYPES, fetchFeed, discoverFeed, parseOpml };
