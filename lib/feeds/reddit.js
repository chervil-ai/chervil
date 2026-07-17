'use strict';

// Subreddit posts — no account, no API key.
//
// Vendored from PulseKeeper src/main/sources/reddit.js. Changes from upstream:
//
//  - DROPPED the parser's `Accept-Encoding: gzip, deflate, br` header. rss-parser
//    doesn't decompress (it just setEncoding's the raw stream), and node's http
//    doesn't either, so gzipped bytes were decoded as utf8 and xml2js threw —
//    every time. Upstream's RSS path could never succeed: it always threw, always
//    fell through to the JSON fallback, and paid a wasted round trip to do it.
//    Its "tries RSS first, falls back to JSON" comment described code that had
//    never once run to completion.
//  - the app-style UA no longer claims to be PulseKeeper
//  - identity stamped by ./index.js; ISO -> ms

const https = require('https');
const zlib = require('zlib');
const Parser = require('rss-parser');
const { FEED_UA, MAX_SUMMARY, decodeEntities, stripHTML, toMs } = require('./util');

// Reddit's edge blocks non-browser agents on the RSS endpoint...
const BROWSER_UA = FEED_UA;
// ...but the JSON API wants the app-style UA instead.
const REDDIT_UA = 'windows:com.chervil.browser:0.20.0 (by /u/rodtrent)';

const rssParser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': BROWSER_UA,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    // No Accept-Encoding: see the note above. Asking for gzip here is what broke
    // this path upstream.
    'Cache-Control': 'no-cache',
  },
  customFields: {
    item: [
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

const REDDIT_RSS = (sub, sort) => `https://www.reddit.com/r/${sub}/${sort}.rss`;
const REDDIT_JSON = (sub, sort, limit) => `https://old.reddit.com/r/${sub}/${sort}.json?limit=${limit}&raw_json=1`;

/**
 * @param {{id:string, config:{subreddit:string, sort?:string}, maxItems?:number}} feed
 * @returns {Promise<{items:Array}>}
 */
async function fetchReddit(feed) {
  const { config, maxItems = 20 } = feed;
  if (!config || !config.subreddit) throw new Error('Reddit feed needs a subreddit name');

  // Accept both 'technology' and 'r/technology'
  const subreddit = String(config.subreddit).replace(/^\/?r\//, '').trim();
  const sort = config.sort || 'hot';

  try {
    return { items: await viaRSS(feed, subreddit, sort, maxItems) };
  } catch (rssErr) {
    try {
      return { items: await viaJSON(feed, subreddit, sort, maxItems) };
    } catch (jsonErr) {
      throw new Error(`r/${subreddit}: RSS — ${rssErr.message}; JSON — ${jsonErr.message}`);
    }
  }
}

async function viaRSS(feed, subreddit, sort, maxItems) {
  const parsed = await rssParser.parseURL(REDDIT_RSS(subreddit, sort));
  const at = Date.now();
  return (parsed.items || []).slice(0, maxItems).map((item) => ({
    externalId: postId(item.link || item.guid || ''),
    url: item.link || '',
    title: decodeEntities(item.title || '(no title)'),
    author: item.creator || item.author || '',
    summary: stripHTML(item.contentSnippet || item.content || '').slice(0, MAX_SUMMARY),
    thumbnail: (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url)
      || thumbFromContent(item.content || item.contentEncoded || ''),
    publishedAt: toMs(item.isoDate || item.pubDate, at),
    fetchedAt: at,
  }));
}

async function viaJSON(feed, subreddit, sort, maxItems) {
  const data = await getJSON(REDDIT_JSON(subreddit, sort, Math.min(maxItems, 100)));
  const posts = ((data && data.data && data.data.children) || []).filter((c) => c.kind === 't3');
  const at = Date.now();
  return posts.slice(0, maxItems).map(({ data: post }) => ({
    externalId: post.id,
    url: `https://www.reddit.com${post.permalink}`,
    title: decodeEntities(post.title || '(no title)'),
    author: post.author || '',
    summary: String(post.selftext || '').slice(0, MAX_SUMMARY),
    thumbnail: String(post.thumbnail || '').startsWith('http') ? post.thumbnail : null,
    publishedAt: (post.created_utc || 0) * 1000 || at,
    fetchedAt: at,
  }));
}

function getJSON(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': REDDIT_UA,
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
    }, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        res.resume();
        if (redirects >= 3) { reject(new Error('too many redirects')); return; }
        getJSON(res.headers.location, redirects + 1).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const enc = res.headers['content-encoding'];
      let stream = res;
      if (enc === 'gzip') stream = res.pipe(zlib.createGunzip());
      else if (enc === 'deflate') stream = res.pipe(zlib.createInflate());
      else if (enc === 'br') stream = res.pipe(zlib.createBrotliDecompress());

      let body = '';
      stream.setEncoding('utf8');
      stream.on('data', (chunk) => { body += chunk; });
      stream.on('end', () => {
        try { resolve(JSON.parse(body)); } catch { reject(new Error('JSON parse error')); }
      });
      stream.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('request timed out')); });
  });
}

function postId(url) {
  const m = String(url).match(/\/comments\/(\w+)/);
  return m ? m[1] : url;
}

function thumbFromContent(html) {
  const m = String(html).match(/<img[^>]+src="([^"]+)"/i);
  return (m && m[1]) || null;
}

module.exports = { fetchReddit };
