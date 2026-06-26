# RFC 0010 — Chervil on the web (what ports, what doesn't, recommended path)

- **Status:** Draft (decision doc — no commitment yet; scopes a possible web surface)
- **Author:** Rod Trent (with Sprig)
- **Created:** 2026-06-26
- **Depends on:** [RFC 0002](0002-hosted-lessons-and-pro.md) (accounts/publish), [RFC 0007](0007-hosted-interactive-and-living-pages.md) (hosted tier), [hosted-tier.md](../hosted-tier.md)

## Summary

Can Chervil run as a web app? **The UI layer already can — the capabilities that make
it more than a browser can't.** Chervil is an Electron app whose value rests on things a
browser tab is specifically not allowed to do: embedding arbitrary live sites, reaching
the local filesystem, holding keys locally, and touching the OS. This RFC draws the line
between what ports cleanly, what needs a backend, and what's effectively impossible — and
recommends a path: a **hosted "creator + viewer" web surface**, not full parity.

The irony is the whole thesis: Chervil's pitch is *replacing* the browser, and the
browser is exactly the sandbox that forbids the replacement's superpowers. So the desktop
app stays the "full" Chervil; the web is the share / viewer / lightweight-creator surface.

## The three buckets

### ✅ Ports to the browser as-is
- The entire **view layer** — `src/index.html` + `styles.css`, the composed-page renderer,
  lesson/quiz rendering, and the interactive applet widgets (already sandboxed `data:`
  iframes under a hardened CSP; see the 0.5.0 work). This is genuinely web-native — it's
  literally what the static asset server renders during UI testing.

### 🔧 Needs a backend (today these are local / IPC)
Everything behind `window.chervil.*` (the preload bridge) is an `ipcMain` handler today:
- **Model calls + BYO keys.** The desktop app calls `lib/models/*` directly with keys held
  locally via Electron `safeStorage`. On the web the keys can't live in the client — they
  move server-side (the hosted tier's `POST /api/ask` already does this), which is a
  key-custody + metering decision, not a port.
- **Publish, vault/credentials, data folders, export.** All IPC → all need authed endpoints.

### ⛔ Hard or impossible in a browser
- **Embedding live websites — the big one.** "Open the live site" uses Electron's
  `<webview>`. Browsers **block** iframing most sites (`X-Frame-Options` /
  `frame-ancestors`). There is no clean web equivalent; a server-side proxy/rewriter is
  heavy, fragile, and breaks logins, anti-bot, and many SPAs. A web Chervil largely **loses
  the embedded-browser half** of the product.
- **Local filesystem** (data folders, save dialogs, the encrypted vault file),
  **OS actions** (open URL, dial), **tray / background wake-word / `chervil://` deep links** —
  unavailable or badly degraded in a tab.

## What already exists on the web
`chervil-web` (Next.js on Vercel) already serves **published** lessons and pages — a
read-only *viewer* (`/learn/<id>`, `/p/<id>`), plus accounts/billing and the applet `ask`
endpoint (RFC 0007). That viewer is the proven web beachhead. A full interactive web *app*
is a much larger lift than extending it.

## Options

1. **Hosted "creator" PWA (recommended).** Compose / learn / publish in the browser against
   a backend that holds keys and runs `lib/agent.js` server-side. **Drop live-site
   embedding** (or offer a server-rendered read-only snapshot). This is the most achievable
   "Chervil on the web," and it reuses the same `lib/` compose pipeline the hosted tier
   already runs. Natural Pro hook (server inference = the paid model).
2. **Thin companion app.** Web = manage what you've published + light asks; the desktop app
   keeps the full agentic/browser-replacement power. Lowest effort, clear value, no false
   promise of parity.
3. **Full parity.** Not realistic without re-architecting around the browser's limits —
   chiefly live-site embedding. Not recommended.

## Recommendation

**Option 2 now → Option 1 next.** Extend the existing viewer into a thin companion
(manage published items + a "quick ask" that composes a page server-side and shows it),
then grow it toward a creator PWA as the hosted tier matures. Keep the **desktop app as the
canonical, full-power Chervil**; treat the web as reach, not replacement. Never market the
web build as "the same Chervil" — the embedded-browser gap makes that untrue.

## Open questions

1. **Key custody for client-initiated compose on the web** — proxy through the backend with
   per-user metering (reuse RFC 0007's `/api/ask` model), or require Pro? Lean: Pro-gated
   server compose, basic viewing free.
2. **Live-site story on the web** — omit, or ship a clearly-labeled "static snapshot
   (read-only)" via a server fetch? Lean: omit in v1; snapshot is a later experiment.
3. **Shared code** — `lib/agent.js` + `lib/models/*` already run both in Electron main and
   (per hosted tier) server-side. Formalize them as the shared core so desktop and web don't
   diverge. This is the real enabler and should happen regardless of which option ships.
