# RFC 0011 — Standalone browsing (the real web, done well)

- **Status:** Draft / scoping checklist — 2026-06-27
- **Author:** Rod Trent (with Sprig)
- **Depends on:** [RFC 0006](0006-agentic-actions.md) (agentic actions on live sites), [RFC 0008](0008-password-autofill.md) (login capture/fill)

## Summary

Chervil's job is **actions and composing** — talk to Sprig, get a synthesized
page, and let Sprig *do* things on the web. But Chervil also embeds the real web
(email, bank, web apps) in a `<webview>`, and when it does, plain browsing should
just *work* — cookies persist, logins stick, links open, downloads land, sites
don't think you're on a broken browser.

**This is explicitly not an attempt to build a competitive browser.** No
extensions store, no profiles/sync-your-tabs, no reader mode, no built-in
ad-blocker, no devtools polish. The goal is narrow: **a real site embedded in
Chervil behaves the way that site behaves in Chrome/Edge**, so people never feel
they have to leave Chervil to do something ordinary. Everything below is judged
against that bar — "does a normal user hit this and bounce to another browser?"

## State today

Embedded sites render in a **single, shared `<webview id="web-view">`**
([src/index.html](../../src/index.html)) that the renderer shows/hides and
re-points per tab ([src/renderer.js](../../src/renderer.js), `showWebview` /
`openUrlInTab`). What already works well:

- **Persistent session.** The webview uses the window's default session, which
  Electron persists to disk (`userData/Network`), so cookies/localStorage already
  survive restarts. (Not a *named* partition — see B1.)
- **Downloads** ([electron/main.js](../../electron/main.js), `attachDownloadHandler`):
  browser-style auto-save to Downloads, filename de-dup, completion toast.
- **Back / forward / find-in-page / stop** wired to the webview.
- **Login capture + autofill** (RFC 0008) via `webview-preload.js`.
- **Right-click context menus** on embedded pages (`attachContextMenu`).
- **Locked-down permissions**: mic only for Chervil's own UI; fullscreen/pointer
  lock allowed; geolocation/notifications/camera denied
  (`setPermissionRequestHandler`).
- **Agentic control** of the live page (RFC 0006): read/click/type/scroll.

## The gaps — prioritized checklist

Each item: current behavior → what a user hits → proposed change → where.

### Tier A — people actually leave Chervil over these

- [ ] **A1. Popups, `target="_blank"`, and `window.open`.** The webview has no
  `allowpopups` and no `setWindowOpenHandler`, so "open in new tab" links and OAuth
  popups (Google/Microsoft sign-in!) silently do nothing. **Fix:** handle
  `webContents.setWindowOpenHandler` on the guest (`did-attach-webview`) → route
  new-window requests into a **new Chervil tab** (or a child window for true OAuth
  popups, then auto-close on redirect). This is the single highest-impact gap —
  many logins are unreachable without it. *(main.js `did-attach-webview`, renderer
  `openUrlInTab`.)*

- [ ] **A2. One live site at a time.** A single shared `<webview>` means opening a
  second real site in another tab tears down the first (loses scroll, form state,
  playing audio/video). **Fix:** one webview per tab that has a live site —
  either a pool of `<webview>` elements keyed by tab id, or `<webview>` created on
  demand and parked (hidden) when its tab is backgrounded. Bounds: cap concurrent
  live webviews (e.g. 5) and reap least-recently-used to limit memory. *(renderer
  webview management; biggest structural change here.)*

- [ ] **A3. Default Electron user-agent.** Some sites sniff the UA and serve a
  "browser not supported" wall or degraded path. **Fix:** set a current Chrome UA
  on the webview session (`ses.setUserAgent` / `webview useragent`), optionally
  appending `Chervil/<version>`. Low effort, removes a class of "this site is
  broken in Chervil" reports. *(main.js session setup.)*

### Tier B — friction that makes Chervil feel less trustworthy

- [ ] **B1. Guarantee a named persistent partition.** Today persistence rides the
  default session; make it explicit and stable with
  `partition="persist:chervil-web"` so cookie/login durability can't regress and is
  inspectable. Pairs with B4. *(index.html webview attr + main.js.)*
- [ ] **B2. Security indicator in the omnibox.** No https/lock signal, and
  `certificate-error` is unhandled (Electron blocks by default with a blank-ish
  fail). **Fix:** show a lock/scheme chip; on cert error show a clear interstitial
  ("this site's certificate is invalid") instead of a dead page. *(renderer omnibox
  + main.js `certificate-error`.)*
- [ ] **B3. Favicons on tabs.** Tabs show no site icon, so a row of live sites is
  hard to scan. **Fix:** listen for `page-favicon-updated` and render it in the tab
  + omnibox. *(renderer tab render.)*
- [ ] **B4. "Clear browsing data" / signed-in-sites control.** No way to clear
  cookies/cache or see what you're logged into. **Fix:** Settings → Browsing →
  clear data (`session.clearStorageData`) and a simple cookie/site list. Also the
  privacy counterpart to B1. *(main.js session APIs + Settings UI.)*
- [ ] **B5. Page zoom.** No Ctrl+/Ctrl-/Ctrl0 zoom for embedded sites. **Fix:**
  `webContents.setZoomLevel` bound to the standard accelerators, persisted per
  origin. *(renderer keybindings.)*

### Tier C — polish, not blockers

- [ ] **C1. Loading/progress affordance** for the webview (spinner in the omnibox
  on `did-start-loading` / `did-stop-loading`; `did-fail-load` → friendly error).
- [ ] **C2. Per-site permission prompts.** Today sensitive permissions are blanket
  denied. A real site that needs geolocation/notifications/camera just fails. **Fix:**
  a minimal allow/deny prompt with per-origin memory (keep the secure default of
  deny, but make it *grantable*). *(main.js permission handlers + a small UI.)*
- [ ] **C3. Basic-auth / HTTP login dialog** (`app.on('login')`) — currently
  unhandled, so basic-auth sites can't be reached.
- [ ] **C4. PDF / in-page file viewing.** Confirm embedded PDFs render rather than
  force-download (Chromium's PDF viewer in the webview).
- [ ] **C5. Autoplay / media policy** sanity check (muted-autoplay parity with
  Chrome so embedded video behaves predictably).

## Explicitly out of scope (don't compete with browsers)

To keep Chervil focused on actions + composing, we are **not** doing: a browser
extensions ecosystem; multiple browser profiles or "sync my open tabs"; reader
mode / built-in ad-block / content blockers; a full bookmark-manager-as-browser
(Chervil bookmarks are page snapshots, not a web-bookmark tree); password manager
beyond the existing scoped login vault (RFC 0008); or DevTools UX. If a request
smells like "make Chervil a better Chrome," it belongs to Chrome.

## Suggested sequencing

1. **A1 (popups/OAuth)** — unblocks logins; highest user-visible win, contained.
2. **A3 (user-agent)** + **B1 (named partition)** — tiny, derisk "broken site" and
   "lost login" reports.
3. **A2 (per-tab webviews)** — the real structural investment; do it once A1/A3
   prove the embed path.
4. **B2–B5**, then **Tier C** as polish.

## Open questions

- A2: pool vs. on-demand-and-park — which keeps memory sane with many tabs?
- A1: OAuth popups that expect a *real* popup window (and `window.close()`),
  vs. ones fine as a new tab — do we need both paths?
- C2: is grantable per-site permission worth the surface, or do we stay
  deny-by-default and document it?
