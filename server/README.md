# Chervil publish service (v0)

The minimal backend that makes **Publish to web** work: it accepts a self-contained
HTML page + a bearer token, stores it, and serves it at a public URL. No accounts,
database, or billing — that's the full [hosted tier](../docs/hosted-tier.md). This is
a single **zero-dependency** Node file.

## Run locally

```sh
cd server
PUBLISH_TOKEN=chervil-dev node server.js
# → Chervil publish service listening on http://localhost:8787
```

(Or just `node server.js` — with no token set it falls back to the dev token
`chervil-dev`.)

## Point the app at it

In Chervil: **Settings → Publishing**

- **Publish base:** `http://localhost:8787`
- **Publish token:** `chervil-dev` (or whatever you set in `PUBLISH_TOKEN`)

Then open any page (e.g. ask "what time is it?" to get the live clock), open the
**⤓ Export…** menu on the page, and choose **🌐 Publish to web**. The returned
`http://localhost:8787/p/<id>` link is copied to your clipboard — open it in a
browser and the page (clock and all) runs.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/pages` | Publish a page. Body `{ kind, title, html }`, `Authorization: Bearer <token>`. Returns `{ url, id }`. |
| `POST` | `/api/lessons` | Same, for lesson/quiz reader HTML. |
| `GET` | `/p/:id` | Serve a published page. |
| `GET` | `/healthz` | Health check. |

## Configuration

See [`.env.example`](.env.example). Key vars: `PORT`, `PUBLIC_BASE`, `DATA_DIR`,
`PUBLISH_TOKEN` / `PUBLISH_TOKENS`.

## Deploy

Any host that runs Node with a **persistent disk** works (Railway, Render, Fly, a
VPS). Set `PUBLIC_BASE` to the public URL and a strong `PUBLISH_TOKEN`. For
ephemeral/serverless hosts (Vercel functions) replace the disk writes in
`servePage`/`handlePublish` with Vercel Blob or S3 — see [RFC 0004](../docs/rfcs/0004-cloud-data-sources.md).

## Security notes (v0)

- Pages are served **as-is** (no CSP) so interactive pages keep their inline
  scripts — the content is the publisher's own page. Don't expose this to
  untrusted publishers without adding sanitization/CSP and real auth.
- Auth is a shared bearer token, not accounts. The full tier adds Clerk + Stripe
  (RFC 0002).
- Body size is capped at 8 MB; page ids are random 16-hex and path-validated.
