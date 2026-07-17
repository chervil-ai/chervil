'use strict';

// Find the feed for any URL, so subscribing means pasting the address bar rather
// than hunting for the little orange icon:
//   1. is the URL already a feed?
//   2. does its HTML declare one (<link rel="alternate">)?
//   3. do any of the conventional paths answer?
//
// Vendored from PulseKeeper src/main/sources/rssDiscover.js. Changes: Chervil's
// shared UA, and dropped the '/wp-json/wp/v2/posts?per_page=1' guess — it serves
// application/json, which isFeedContentType (/rss|atom|xml/) can't match, so it
// never fired; and had it fired, rss-parser couldn't parse WP's JSON anyway.

const https = require('https');
const http = require('http');
const zlib = require('zlib');
const { FEED_UA } = require('./util');

const GUESSES = [
  '/feed', '/feed.xml', '/feed.rss', '/rss', '/rss.xml', '/rss/feed',
  '/atom.xml', '/atom', '/blog/feed', '/blog/rss', '/index.xml',
  '/feeds/posts/default',
];

/**
 * @param {string} url
 * @returns {Promise<string|null>} the feed URL, or null if none was found
 */
async function discoverFeed(url) {
  if (!url || !url.startsWith('http')) return null;

  // Already a feed?
  try {
    if (isFeedContentType(await getContentType(url))) return url;
  } catch { /* fall through */ }

  // Declared in the page's own <head>?
  try {
    const found = extractFeedLinkFromHTML(await fetchPage(url), url);
    if (found) return found;
  } catch { /* fall through */ }

  // Conventional paths on the same origin.
  try {
    const { origin } = new URL(url);
    for (const p of GUESSES) {
      try {
        if (isFeedContentType(await getContentType(origin + p))) return origin + p;
      } catch { /* try next */ }
    }
  } catch { /* fall through */ }

  return null;
}

function extractFeedLinkFromHTML(html, baseUrl) {
  const patterns = [
    /type=["']application\/rss\+xml["'][^>]+href=["']([^"']+)["']/i,
    /href=["']([^"']+)["'][^>]*type=["']application\/rss\+xml["']/i,
    /type=["']application\/atom\+xml["'][^>]+href=["']([^"']+)["']/i,
    /href=["']([^"']+)["'][^>]*type=["']application\/atom\+xml["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) {
      try { return m[1].startsWith('http') ? m[1] : new URL(m[1], baseUrl).href; } catch { /* next */ }
    }
  }
  return null;
}

function isFeedContentType(ct) {
  return /rss|atom|xml/i.test(ct || '');
}

function getContentType(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method: 'HEAD', headers: { 'User-Agent': FEED_UA } }, (res) => {
      resolve(res.headers['content-type'] || '');
      res.resume();
    });
    req.on('error', reject);
    req.setTimeout(6000, () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

function fetchPage(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: { 'User-Agent': FEED_UA, Accept: 'text/html', 'Accept-Encoding': 'gzip, deflate' },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        if (redirects >= 5) { reject(new Error('too many redirects')); return; }
        let next;
        try {
          next = res.headers.location.startsWith('http')
            ? res.headers.location : new URL(res.headers.location, url).href;
        } catch { reject(new Error('bad redirect')); return; }
        fetchPage(next, redirects + 1).then(resolve).catch(reject);
        return;
      }
      const enc = res.headers['content-encoding'];
      let stream = res;
      if (enc === 'gzip') stream = res.pipe(zlib.createGunzip());
      else if (enc === 'deflate') stream = res.pipe(zlib.createInflate());

      let data = '';
      let settled = false;
      const done = (v) => { if (!settled) { settled = true; resolve(v); } };
      stream.setEncoding('utf8');
      // The <link> tag is in <head>; no need to read a whole page to find it.
      stream.on('data', (c) => { data += c; if (data.length > 200000) { req.destroy(); done(data); } });
      stream.on('end', () => done(data));
      stream.on('error', () => { if (data.length > 100) done(data); else reject(new Error('stream error')); });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

module.exports = { discoverFeed };
