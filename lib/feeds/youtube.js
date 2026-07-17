'use strict';

// YouTube channels and playlists via public RSS — no API key.
//
// Vendored from PulseKeeper src/main/sources/youtube.js, and deliberately kept
// close to it: resolveToFeedURL scrapes a private innertube API with a pinned
// clientVersion and WILL break, so the cheapest fix will be to re-sync this file
// from upstream. Don't refactor it for style.
//
// Changes from upstream:
//  - THE resolve is cached (see resolvedUrl below). Upstream re-ran the whole
//    ladder on every single fetch — up to four network round-trips, hourly,
//    forever, to rediscover a channel id that never changes.
//  - reuse Chervil's youtubeId() (lib/youtube.js) instead of a local ?v=-only
//    regex: it also handles /shorts/, /live/ and /embed/
//  - identity stamped by ./index.js; ISO -> ms; no config mutation

const https = require('https');
const http = require('http');
const zlib = require('zlib');
const Parser = require('rss-parser');
const { youtubeId } = require('../youtube');
const { FEED_UA, MAX_SUMMARY, stripHTML, toMs } = require('./util');

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': FEED_UA },
  customFields: {
    item: [
      ['media:group', 'mediaGroup'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['yt:videoId', 'videoId'],
      ['yt:channelId', 'channelId'],
    ],
  },
});

const YT_VIDEO_URL = (id) => `https://www.youtube.com/watch?v=${id}`;
const YT_THUMBNAIL = (id) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

/**
 * @param {{id:string, config:{url?:string, channelId?:string, playlistId?:string}, maxItems?:number}} feed
 * @param {{resolvedUrl?:string}} cursor  cached resolve from feed_state
 * @returns {Promise<{items:Array, resolvedUrl:string}>}
 */
async function fetchYouTube(feed, cursor = {}) {
  const { config = {}, maxItems = 20 } = feed;

  let url = config.url || '';
  if (!url && config.channelId) url = `https://www.youtube.com/channel/${config.channelId}`;
  if (!url && config.playlistId) url = `https://www.youtube.com/playlist?list=${config.playlistId}`;
  if (!url) throw new Error('YouTube feed needs a channel URL (e.g. https://www.youtube.com/@channelname)');

  // Resolving an @handle costs up to four round trips. It answers "which channel
  // is this?", which doesn't change — so do it once and keep the answer.
  let resolvedUrl = cursor.resolvedUrl || '';
  let parsed;
  if (resolvedUrl) {
    try {
      parsed = await parser.parseURL(resolvedUrl);
    } catch {
      // The cache can still go stale (channel deleted, handle moved). Re-resolve
      // once rather than making the feed permanently dead.
      resolvedUrl = '';
    }
  }
  if (!parsed) {
    resolvedUrl = await resolveToFeedURL(url);
    parsed = await parser.parseURL(resolvedUrl);
  }

  const at = Date.now();
  const items = (parsed.items || []).slice(0, maxItems).map((item) => {
    const vid = item.videoId || youtubeId(item.link || '');
    return {
      externalId: vid || item.guid || item.link || '',
      url: vid ? YT_VIDEO_URL(vid) : (item.link || ''),
      title: String(item.title || '(no title)').trim(),
      author: parsed.title || item.author || '',
      summary: stripHTML(extractDescription(item)).slice(0, MAX_SUMMARY),
      thumbnail: vid ? YT_THUMBNAIL(vid) : extractThumb(item),
      publishedAt: toMs(item.isoDate || item.pubDate, at),
      fetchedAt: at,
    };
  });
  return { items, resolvedUrl };
}

/**
 * Convert any YouTube URL format to an RSS feed URL. Expensive and fragile —
 * the caller caches the result.
 */
async function resolveToFeedURL(url) {
  // Normalize: ensure www.youtube.com and strip tracking params
  let trimmed = String(url).trim();
  try {
    const u = new URL(trimmed);
    if (u.hostname === 'youtube.com') u.hostname = 'www.youtube.com';
    for (const param of ['si', 'feature', 'ab_channel', 'pp']) u.searchParams.delete(param);
    trimmed = u.toString();
  } catch { /* malformed URL — leave as-is */ }

  // Already a YouTube RSS feed URL
  if (trimmed.includes('feeds/videos.xml')) return trimmed;

  // Playlist URL
  const playlistMatch = trimmed.match(/[?&]list=([\w-]+)/);
  if (playlistMatch && !trimmed.includes('/channel/') && !trimmed.includes('/@')) {
    return `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistMatch[1]}`;
  }

  // /channel/UC... URL — extract ID directly
  const channelIdMatch = trimmed.match(/\/channel\/(UC[\w-]+)/);
  if (channelIdMatch) {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelIdMatch[1]}`;
  }

  // @handle URL
  const handleMatch = trimmed.match(/\/@([\w-]+)/);
  if (handleMatch) {
    const handle = handleMatch[1];

    // 1. Legacy ?user= RSS URL (instant, no network round-trip to YouTube UI)
    const legacyUrl = `https://www.youtube.com/feeds/videos.xml?user=${handle}`;
    try {
      await parser.parseURL(legacyUrl);
      return legacyUrl;
    } catch { /* not a legacy username — continue */ }

    // 2. resolve_url — innertube endpoint designed specifically to canonicalise any YT URL
    try {
      const channelId = await resolveUrlViaInnertube(`https://www.youtube.com/@${handle}`);
      return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    } catch { /* fall through */ }

    // 3. browse — innertube channel browse endpoint, accepts @handle as browseId
    try {
      const channelId = await resolveHandleViaInnertube(handle);
      return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    } catch { /* fall through to HTML scraping */ }
  }

  // /c/name or /user/name — try ?user= with the path segment
  const userMatch = trimmed.match(/\/(?:c|user)\/([\w-]+)/);
  if (userMatch) {
    const legacyUrl = `https://www.youtube.com/feeds/videos.xml?user=${userMatch[1]}`;
    try {
      await parser.parseURL(legacyUrl);
      return legacyUrl;
    } catch { /* fall through */ }
  }

  // Last resort: fetch the channel page and extract channel ID via regex
  const pageUrl = trimmed.startsWith('http') ? trimmed : `https://www.youtube.com/${trimmed}`;
  const html = await fetchPageHTML(pageUrl);

  const patterns = [
    // <link rel="alternate"> RSS tag in <head>
    { re: /type="application\/rss\+xml"[^>]+href="([^"]+feeds\/videos\.xml[^"]+)"/, full: true },
    { re: /href="([^"]+feeds\/videos\.xml[^"]+)"[^>]+type="application\/rss\+xml"/, full: true },
    // Escaped feeds URL inside JSON strings
    { re: /feeds\\\/videos\.xml\?channel_id=(UC[\w-]+)/, full: false },
    { re: /"(https:\/\/www\.youtube\.com\/feeds\/videos\.xml\?channel_id=[^"\\]+)"/, full: true },
    // ytInitialData / ytcfg embedded JSON — various channel ID fields
    { re: /"externalId"\s*:\s*"(UC[\w-]+)"/, full: false },
    { re: /"channelId"\s*:\s*"(UC[\w-]+)"/, full: false },
    { re: /"externalChannelId"\s*:\s*"(UC[\w-]+)"/, full: false },
    { re: /"browseId"\s*:\s*"(UC[\w-]+)"/, full: false },
    { re: /"ucid"\s*:\s*"(UC[\w-]+)"/, full: false },
    // itemprop / meta tags
    { re: /itemprop="channelId"[^>]+content="(UC[\w-]+)"/, full: false },
    { re: /<meta[^>]+name="channelId"[^>]+content="(UC[\w-]+)"/, full: false },
    // General UC id anywhere in page (last resort)
    { re: /\b(UC[\w-]{22})\b/, full: false },
  ];

  for (const { re, full } of patterns) {
    const m = html.match(re);
    if (m) {
      if (full) return m[1].replace(/\\u0026/g, '&');
      return `https://www.youtube.com/feeds/videos.xml?channel_id=${m[1]}`;
    }
  }

  throw new Error(
    `Could not resolve the YouTube channel for: ${url}. `
    + 'Most reliable fix: use the channel-ID URL directly — find it in '
    + 'YouTube Studio → Settings → Channel → Basic Info, then subscribe to '
    + 'https://www.youtube.com/channel/UC…'
  );
}

/**
 * Use the innertube navigation/resolve_url endpoint to turn any YouTube URL
 * into a channel ID.  This is the most direct path — it's the same call
 * the YouTube web app makes when routing a URL internally.
 */
function resolveUrlViaInnertube(youtubeUrl) {
  const body = JSON.stringify({
    context: {
      client: { hl: 'en', gl: 'US', clientName: 'WEB', clientVersion: '2.20240304.00.00' },
    },
    url: youtubeUrl,
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'www.youtube.com',
      path: '/youtubei/v1/navigation/resolve_url?prettyPrint=false',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': FEED_UA,
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        Origin: 'https://www.youtube.com',
        'X-YouTube-Client-Name': '1',
        'X-YouTube-Client-Version': '2.20240304.00.00',
      },
    }, (res) => {
      const stream = decompress(res);
      let data = '';
      let settled = false;
      const done = (v) => { if (!settled) { settled = true; resolve(v); } };
      const fail = (e) => { if (!settled) { settled = true; reject(e); } };

      stream.setEncoding('utf8');
      stream.on('data', (chunk) => { data += chunk; if (data.length > 200000) req.destroy(); });
      stream.on('end', () => {
        if (!data) { fail(new Error('Empty resolve_url response')); return; }
        let channelId = null;
        try {
          const json = JSON.parse(data);
          // endpoint.browseEndpoint.browseId is the canonical channel ID
          channelId = json && json.endpoint && json.endpoint.browseEndpoint && json.endpoint.browseEndpoint.browseId;
        } catch { /* truncated — try regex */ }
        if (!channelId) {
          const m = data.match(/"browseId"\s*:\s*"(UC[\w-]+)"/);
          channelId = (m && m[1]) || null;
        }
        if (channelId && channelId.startsWith('UC')) done(channelId);
        else fail(new Error('No channel ID in resolve_url response'));
      });
      stream.on('error', fail);
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('resolve_url timed out')); });
    req.write(body);
    req.end();
  });
}

/** Resolve a YouTube @handle to a channel ID using the innertube browse endpoint. */
function resolveHandleViaInnertube(handle) {
  const body = JSON.stringify({
    context: {
      client: { hl: 'en', gl: 'US', clientName: 'WEB', clientVersion: '2.20240304.00.00' },
    },
    browseId: `@${handle}`,
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'www.youtube.com',
      path: '/youtubei/v1/browse?prettyPrint=false',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': FEED_UA,
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        Origin: 'https://www.youtube.com',
        Referer: `https://www.youtube.com/@${handle}`,
        'X-YouTube-Client-Name': '1',
        'X-YouTube-Client-Version': '2.20240304.00.00',
      },
    }, (res) => {
      const stream = decompress(res);
      let data = '';
      let settled = false;
      const done = (v) => { if (!settled) { settled = true; resolve(v); } };
      const fail = (e) => { if (!settled) { settled = true; reject(e); } };

      stream.setEncoding('utf8');
      stream.on('data', (chunk) => {
        data += chunk;
        if (data.length > 500000) req.destroy(); // channel ID is always early in the response
      });
      stream.on('end', () => {
        if (!data) { fail(new Error('Empty innertube response')); return; }
        let channelId = null;
        try {
          const json = JSON.parse(data);
          channelId = (json.metadata && json.metadata.channelMetadataRenderer && json.metadata.channelMetadataRenderer.externalId)
            || (json.header && json.header.c4TabbedHeaderRenderer && json.header.c4TabbedHeaderRenderer.channelId)
            || (json.header && json.header.pageHeaderRenderer && json.header.pageHeaderRenderer.channelId);
        } catch { /* JSON truncated — fall through to regex */ }
        if (!channelId || !String(channelId).startsWith('UC')) {
          const m = data.match(/"externalId"\s*:\s*"(UC[\w-]+)"/)
            || data.match(/"channelId"\s*:\s*"(UC[\w-]+)"/)
            || data.match(/\b(UC[\w-]{22})\b/);
          channelId = (m && m[1]) || null;
        }
        if (channelId) done(channelId);
        else fail(new Error('Channel ID not found in innertube response'));
      });
      stream.on('error', fail);
    });

    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Innertube request timed out')); });
    req.write(body);
    req.end();
  });
}

function decompress(res) {
  const enc = res.headers['content-encoding'];
  if (enc === 'gzip') return res.pipe(zlib.createGunzip());
  if (enc === 'deflate') return res.pipe(zlib.createInflate());
  if (enc === 'br') return res.pipe(zlib.createBrotliDecompress());
  return res;
}

function fetchPageHTML(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': FEED_UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        // Bypass YouTube's consent gate
        Cookie: 'CONSENT=YES+cb; SOCS=CAESEwgDEgk2IgJlbg==; YSC=irrelevant; VISITOR_INFO1_LIVE=irrelevant',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location.startsWith('http')
          ? res.headers.location
          : `https://www.youtube.com${res.headers.location}`;
        res.resume();
        fetchPageHTML(loc).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode} fetching YouTube page: ${url}`));
        return;
      }

      const stream = decompress(res);
      let html = '';
      let settled = false;
      const done = (v) => { if (!settled) { settled = true; resolve(v); } };
      const fail = (e) => { if (!settled) { settled = true; reject(e); } };

      stream.setEncoding('utf8');
      stream.on('data', (chunk) => {
        html += chunk;
        if (html.length > 600000) { req.destroy(); done(html); }
      });
      stream.on('end', () => done(html));
      stream.on('error', () => { if (html.length > 1000) done(html); else fail(new Error('Decompress error')); });
    });
    req.on('error', (e) => reject(e));
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('Timeout fetching YouTube page')); });
  });
}

function extractDescription(item) {
  if (item.mediaGroup) {
    const g = Array.isArray(item.mediaGroup) ? item.mediaGroup[0] : item.mediaGroup;
    const desc = g && g['media:description'] && g['media:description'][0];
    if (desc) return typeof desc === 'string' ? desc : (desc._ || '');
  }
  return item.contentSnippet || item.summary || '';
}

function extractThumb(item) {
  if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) return item.mediaThumbnail.$.url;
  if (item.mediaGroup) {
    const g = Array.isArray(item.mediaGroup) ? item.mediaGroup[0] : item.mediaGroup;
    const thumbs = g && g['media:thumbnail'];
    if (thumbs && thumbs.length) {
      const last = thumbs[thumbs.length - 1];
      return (last && last.$ && last.$.url) || null;
    }
  }
  return null;
}

module.exports = { fetchYouTube, resolveToFeedURL };
