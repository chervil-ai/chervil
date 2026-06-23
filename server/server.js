#!/usr/bin/env node
'use strict';

/**
 * Chervil minimal publish service (v0)
 * ------------------------------------
 * The smallest backend that makes "Publish to web" actually work: accept a
 * self-contained HTML blob + a bearer token, store it, and serve it at a public
 * URL. No accounts / Stripe / database — that's the full hosted tier (see
 * docs/hosted-tier.md and docs/rfcs/0002). This is a single zero-dependency Node
 * file you can run locally (`node server/server.js`) or deploy anywhere that runs
 * Node with a persistent disk (Railway / Render / Fly / a VPS).
 *
 * Client contract (matches electron/main.js publish handlers):
 *   POST /api/pages    { kind, title, html }   Authorization: Bearer <token>
 *   POST /api/lessons  { kind, title, html, artifact }
 *     -> 200 { url, id, updated:false }
 *   GET  /p/:id        -> the stored HTML
 *
 * Point the app at it: Settings -> Publishing -> set "Publish base" to this
 * server's URL (e.g. http://localhost:8787) and "Publish token" to a value in
 * PUBLISH_TOKEN(S). Then use "🌐 Publish to web" from any page's Export menu.
 *
 * Storage note: blobs are written to DATA_DIR on local disk. On ephemeral hosts
 * (e.g. Vercel functions) swap this for Vercel Blob / S3 — see RFC 0004.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = parseInt(process.env.PORT || '8787', 10);
const PUBLIC_BASE = (process.env.PUBLIC_BASE || `http://localhost:${PORT}`).replace(/\/+$/, '');
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const MAX_BODY = 8 * 1024 * 1024; // 8 MB

// Allowed bearer tokens. Set PUBLISH_TOKENS (comma-separated) or PUBLISH_TOKEN.
// For zero-config local testing we fall back to a well-known dev token — DO NOT
// rely on this in production; set a real token via env.
let TOKENS = (process.env.PUBLISH_TOKENS || process.env.PUBLISH_TOKEN || '')
  .split(',').map((t) => t.trim()).filter(Boolean);
let USING_DEV_TOKEN = false;
if (!TOKENS.length) { TOKENS = ['chervil-dev']; USING_DEV_TOKEN = true; }

fs.mkdirSync(DATA_DIR, { recursive: true });

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', ...headers });
  res.end(body);
}
function sendJson(res, status, obj) {
  send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8' });
}

function bearer(req) {
  const h = req.headers['authorization'] || '';
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m ? m[1].trim() : '';
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new Error('Payload too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function handlePublish(req, res, kind) {
  if (!TOKENS.includes(bearer(req))) return sendJson(res, 401, { error: 'Invalid or missing publish token.' });
  let payload;
  try { payload = JSON.parse(await readBody(req) || '{}'); }
  catch { return sendJson(res, 400, { error: 'Invalid JSON body.' }); }
  const html = payload.html;
  if (!html || typeof html !== 'string') return sendJson(res, 400, { error: 'Missing html.' });
  const id = crypto.randomBytes(8).toString('hex');
  const title = String(payload.title || 'Chervil page').slice(0, 200);
  const meta = { id, kind: payload.kind || kind, title, createdAt: new Date().toISOString() };
  try {
    fs.writeFileSync(path.join(DATA_DIR, `${id}.html`), html, 'utf8');
    fs.writeFileSync(path.join(DATA_DIR, `${id}.json`), JSON.stringify(meta), 'utf8');
  } catch (err) {
    return sendJson(res, 500, { error: `Storage error: ${err.message}` });
  }
  return sendJson(res, 200, { url: `${PUBLIC_BASE}/p/${id}`, id, updated: false });
}

function servePage(req, res, id) {
  if (!/^[a-f0-9]{4,40}$/.test(id)) return send(res, 404, 'Not found');
  const file = path.join(DATA_DIR, `${id}.html`);
  let html;
  try { html = fs.readFileSync(file, 'utf8'); }
  catch { return send(res, 404, 'This page does not exist or has been removed.'); }
  // Served as-is so interactive pages (clock, calculator) keep working — they
  // need their own inline scripts. The content is the publisher's own page.
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  res.end(html);
}

const LANDING = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Chervil publish service</title>
<style>body{font:16px/1.6 system-ui,sans-serif;max-width:640px;margin:12vh auto;padding:0 24px;color:#1c2b22}
code{background:#eef5ef;padding:2px 6px;border-radius:6px}</style></head>
<body><h1>🌿 Chervil publish service</h1>
<p>This is the minimal backend for Chervil's <b>Publish to web</b>. Published pages
live at <code>/p/&lt;id&gt;</code>. Publish from the Chervil app — Export → 🌐 Publish to web.</p></body></html>`;

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, PUBLIC_BASE);
    const pathname = url.pathname;
    if (req.method === 'GET' && pathname === '/') return send(res, 200, LANDING, { 'Content-Type': 'text/html; charset=utf-8' });
    if (req.method === 'GET' && pathname === '/healthz') return send(res, 200, 'ok');
    if (req.method === 'POST' && pathname === '/api/pages') return await handlePublish(req, res, 'page');
    if (req.method === 'POST' && pathname === '/api/lessons') return await handlePublish(req, res, 'learn');
    const pm = /^\/p\/([^/]+)$/.exec(pathname);
    if (req.method === 'GET' && pm) return servePage(req, res, pm[1]);
    return send(res, 404, 'Not found');
  } catch (err) {
    return sendJson(res, 500, { error: String(err && err.message ? err.message : err) });
  }
});

server.listen(PORT, () => {
  console.log(`Chervil publish service listening on ${PUBLIC_BASE}  (port ${PORT})`);
  console.log(`Storing blobs in ${DATA_DIR}`);
  if (USING_DEV_TOKEN) {
    console.log('⚠  No PUBLISH_TOKEN set — using dev token "chervil-dev". Set PUBLISH_TOKEN (or PUBLISH_TOKENS) for real use.');
  } else {
    console.log(`Accepting ${TOKENS.length} configured publish token(s).`);
  }
});
