'use strict';

// RSS / Atom / podcast / newsletter / blog.
//
// All five are the same wire format, so one adapter covers five feed types — the
// type is a label for the user and an icon, not a code path. (PulseKeeper's
// sources/index.js:102-106 routed all four of its equivalents here too.)
//
// Vendored from PulseKeeper src/main/sources/rss.js. Changes from upstream:
//  - identity (id/feedId/type) is stamped by ./index.js, not built here, so the
//    adapter stays a pure feed -> items function
//  - dropped the isPodcast sniff: it read `feed.itunes`, which the parser below
//    never declares as a feed-level customField, so it was always undefined
//  - prefer item.isoDate (rss-parser's normalized field) over the raw pubDate
//  - ISO -> ms at the boundary

const Parser = require('rss-parser');
const { FEED_UA, MAX_SUMMARY, stripHTML, toMs } = require('./util');

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': FEED_UA },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['itunes:image', 'itunesImage'],
      ['itunes:author', 'itunesAuthor'],
    ],
  },
});

/**
 * @param {{id:string, type:string, config:{url:string}, maxItems?:number}} feed
 * @returns {Promise<{items:Array}>} items WITHOUT identity fields — ./index.js stamps those
 */
async function fetchRSS(feed) {
  const { config, maxItems = 20 } = feed;
  if (!config || !config.url) throw new Error('Feed is missing a URL');

  const parsed = await parser.parseURL(config.url);
  const at = Date.now();

  const items = (parsed.items || []).slice(0, maxItems).map((item) => ({
    externalId: item.guid || item.link || item.title || '',
    url: item.link || item.guid || '',
    title: String(item.title || '(no title)').trim(),
    author: item.itunesAuthor || item.creator || item.author || parsed.title || '',
    summary: stripHTML(item.contentSnippet || item.summary || item.content || '').slice(0, MAX_SUMMARY),
    thumbnail: extractThumbnail(item),
    publishedAt: toMs(item.isoDate || item.pubDate, at),
    fetchedAt: at,
  }));
  return { items };
}

function extractThumbnail(item) {
  if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) return item.mediaThumbnail.$.url;
  if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) return item.mediaContent.$.url;
  if (item.itunesImage && item.itunesImage.$ && item.itunesImage.$.href) return item.itunesImage.$.href;
  const img = String(item.content || item['content:encoded'] || '').match(/<img[^>]+src="([^"]+)"/i);
  return (img && img[1]) || null;
}

module.exports = { fetchRSS };
