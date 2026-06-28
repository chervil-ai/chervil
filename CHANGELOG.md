# Changelog

All notable changes to Chervil are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project aims to
follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.7.0] — 2026-06-28

Share what you build with everyone: publish your agents, and submit your best
agents and pages to a community Agent store and Share gallery.

### Added
- **Publish agents — and a community Agent store.** Agents are now a publishable
  type, like pages and lessons. From **👤 Agents → Publish**, share an agent to your
  getchervil.com profile (public or unlisted); other Chervil users open it on the web
  and **import it in one click** ("Open in Chervil", with a get-the-app fallback).
  Beyond your profile, you can **submit** your best agents and pages to the community
  **Agent store** and **Share gallery** (getchervil.com/store and /share) — browsable
  by category. Submissions are LLM pre-vetted and human-approved before they appear.
  (Design: RFC 0012.)

## [0.6.0] — 2026-06-27

Agents that work as a team, pages you can hand off and remix, and a couple of
quietly important fixes — your bookmarks now really sync, and interactive pages
remember what you did on them.

### Added
- **Multi-stage agents (agent pipelines).** Chain two or more agents into a team that
  hands off to each other: each runs in order and builds on the previous one's output,
  and the last agent composes the final page. Build one in **Agents → 🧩 Agent
  pipelines** (name it, add agents as ordered stages), then give it a task and **Run** —
  each stage's work shows in the chat as it goes, before the page is composed. Ideal for
  research → draft → critique flows. (Reasoning stages need a provider with text
  completion, e.g. Claude.)
- **Shareable pages — export and import a composed page.** Any composed page now has
  a **🔗 Shareable page (.chervil)** option in the Export dropdown that writes a small,
  self-contained file (the page's HTML, its originating query, and sources — not your
  chat transcript). Send it to anyone; they open **History → ⤒ Import page** to drop it
  into their own Chervil as a fresh tab they can view and remix with Sprig. (E.g. share
  a calculator you built so a colleague can add a component themselves.) **Pages you
  publish to the web** also carry an unobtrusive **✦ Open in Chervil** button — any
  Chervil user viewing the published page can click it to pull the page into their own
  instance and remix it (via a `chervil://import` deep link that reads the page's
  embedded source). Visitors who don't have Chervil get a graceful **"Not using
  Chervil? Get it to import this page →"** prompt (shown only when the deep link
  doesn't launch the app).
- Design doc: **RFC 0011** (standalone browsing — a prioritized, code-grounded plan to
  make embedded real sites behave like they do in Chrome/Edge, without competing with
  browsers).

### Changed
- **Fluent UI pass — History panel.** The History/Library panel now opens as a
  **centered card over a blurred scrim**, consistent with the Agents, Schedules, and
  Settings panels (it was previously the lone right-anchored drawer). Its entries are
  now proper Fluent cards: resting depth, a reveal accent bar on the leading edge, a
  lift on hover, and press feedback, with a subtle entrance fade and unified radius
  tokens. The tabs get smooth state transitions and an active glow. (Honors
  `prefers-reduced-motion`.)

### Fixed
- **Interactive pages now remember their state (checkboxes, toggles).** Composed
  pages render in a security sandbox with no same-origin access, so a page's own
  `localStorage` silently failed — a checklist would forget every check on reopen,
  despite saying "saved in browser." Chervil now shims `localStorage`/`sessionStorage`
  inside composed pages, persisting their data in the app (keyed by a stable per-page
  id that travels with bookmark and history snapshots). Check a box, close the page,
  reopen it from a bookmark — your checks are still there. (Also rides folder-sync, so
  state follows you between computers.)
- **Bookmarks (and other data) now actually sync between computers.** Chervil's
  folder-sync rides a single `chervil-state.json` through OneDrive/Drive/Dropbox, and
  those services can't merge JSON — when two machines wrote it, the loser was forked
  into a `chervil-state-<MACHINE>.json` conflict copy the app never read, stranding
  whatever was saved there. Chervil now **reconciles conflict copies** on launch and
  on window focus (union of bookmarks, history, spaces, agents, schedules), unions the
  on-disk state into each save, writes atomically, and carries **deletion tombstones**
  so a removed bookmark stays removed across machines instead of being resurrected.

## [0.5.3] — 2026-06-26

### Fixed
- **Settings showed "Chervil v—" instead of the version number.** The sandboxed
  preload couldn't read `package.json`, so the version came back blank. It now comes
  from the main process (`app.getVersion()`) over a small sync IPC — Settings → You
  shows the real version again.

## [0.5.2] — 2026-06-26

A small quality release — make "Hey Sprig" behave in a noisy room.

### Added
- **Wake-word sensitivity control.** Settings → Voice now has a **threshold slider** for
  "Hey Sprig" — raise it so background noise or a TV in the room stops triggering Chervil
  on its own. (The cutoff existed internally but wasn't adjustable.) Changes apply live
  while listening, and the default is a touch stricter (0.6). More noisy-environment
  hardening — a confirmation gate before acting on a wake, and better voice-activity
  detection — is still on the list.

## [0.5.1] — 2026-06-26

A security patch.

### Fixed
- **Bumped the transitive `uuid` dependency to 11.1.1** (GHSA-w5hq-g745-h8pq /
  CVE-2026-41907 — a missing buffer bounds check in uuid v3/v5/v6 when a `buf`
  is provided). `uuid` reaches Chervil only through `exceljs` (Excel export),
  which calls `v4()` with no `buf`, so the vulnerable path was never reachable —
  this clears the alert. Verified Excel export still works.

## [0.5.0] — 2026-06-26

Interactive lessons that actually *do* things — everywhere. Applet cards now compose
real, interactive widgets in the app, in your saved lessons, **and** in lessons you
publish to the web — plus a fluent polish pass across the whole UI.

### Added
- **Interactive applet widgets** — a lesson's "Try it" card now composes a real,
  self-contained interactive widget (dropdowns, inputs, live-computed output, a
  step-by-step simulator) instead of a block of text. In the app it builds on click
  and is cached, so re-opening a lesson is instant; a **↻ Regenerate** button rebuilds
  it, and a failed build offers a Retry.
- **Widgets work on the published web page too** — published and exported lessons bake
  each widget into a sandboxed `data:` iframe under a hardened, hash-allowlisted CSP, so
  they stay interactive on getchervil.com — not just in the desktop app.
- **Lessons auto-upgrade on open** — older lessons re-render with the current renderer
  when opened, so they pick up new capabilities without being rebuilt.
- **Smart attachments for large files** — when an attached file is bigger than fits in
  one request, Chervil selects the **rows relevant to your question** instead of just
  sending the first chunk (local, on-device row matching — no server). The first step
  toward full indexed retrieval (RFC 0004).
- Design docs: **RFC 0009** (published-page metrics) and **RFC 0010** (Chervil on the web).

### Changed
- **Fluent UI pass.** The Settings panel highlights the selected option as a card (not
  just a radio dot) over a blurred backdrop; the **address bar stays usable on small
  windows** — the toolbar collapses to icons via a container query instead of running
  off-screen; the sidebar toggle is now a **directional chevron** that flips between
  hide (‹) and show (›). Plus thin themed scrollbars, consistent overlay blur, keyboard
  focus rings, a smooth sidebar slide, and unified radius tokens.
- **Re-publishing a lesson updates it in place** — same URL — instead of minting a new
  link each time (stable source id, matching the page-publish path).

### Fixed
- **Friendlier error messages** — transcription, wake-word, autofill, and login-fill
  failures now read as plain language instead of raw exceptions or `[object Object]`.

## [0.3.1] — 2026-06-24

Agentic actions land — Sprig can now *do* things on a live site under a
deterministic control layer (plan → allow/confirm/deny → audit) — plus everyday
extras (find in page, reopen closed tab, form autofill) and a fix so large
attached files are actually read.

### Fixed
- **Attached files were silently cut to 30,000 characters** — so a large file
  (e.g. a big CSV) reached the model as only its first few percent, and Sprig drew
  confident conclusions from the sliver it saw. The cap is now ~500,000 chars
  (≈125k tokens), and when a file is still larger the model is told it's truncated
  (and to say so) instead of treating the visible part as complete. All providers.

### Added
- **Form autofill** — save your details (name, email, phone, address…) in Settings
  → You, then on any real site say "fill the form" and Chervil fills the matching
  fields. Passwords and card details are never stored or auto-filled.
- **The web agent plans first** — before acting on a live site, Sprig drafts a
  short numbered plan, shows it to you, and keeps each step grounded in it (it
  still adapts as the page reveals reality). More reliable multi-step task
  completion and clearer intent (RFC 0006 6.2).
- **Find in page (Ctrl+F)** — a find bar that searches the current page: real
  sites use native find with a match count + next/prev; composed pages search via
  the in-page runtime. Enter / Shift+Enter cycle matches, Esc closes.
- **Reopen closed tab (Ctrl+Shift+T)** — restores recently-closed tabs with their
  full conversation and pages intact (keeps the last 12; pinned tabs return to the
  pinned group).
- **Per-task action approvals** — when the web agent asks to confirm a
  state-changing step, you can now **Approve once** or **Allow "&lt;action&gt;" for
  this task** (so Sprig stops re-asking for that action type mid-task). Scoped to
  the run, recorded in the audit trail. Reduces approval fatigue without weakening
  the gate.
- **Guarded OS actions (first ones)** — composed pages can call
  `window.chervil.os('open_url', {url})` or `os('open_downloads')`; each runs only
  after you confirm, is allowlisted in the main process (no arbitrary commands),
  and is recorded to the agent audit trail. The first of RFC 0006's Track B.
- **Agent activity log** — the Agents view now shows a 🛡 activity trail of every
  action Sprig took on a live site and what the control layer allowed, confirmed,
  or denied (with a Clear button). Surfaces the RFC 0006 audit trail.
- **Agentic control layer (foundation)** — the web-agent's actions now pass through
  a deterministic policy: a fixed registry of allowed action types (unknown types
  are refused), with allow / confirm / deny decisions, and an audit trail of every
  action (recorded + persisted). Re-expresses the existing payment refusal and
  approve-before-risky gates as policy. First step of [RFC 0006](docs/rfcs/0006-agentic-actions.md).

## [0.3.0] — 2026-06-24

The everyday-browser release. Chervil gains a **universal omnibox**, real browser
table stakes (**bookmarks**, **browsing history**, **downloads**, in-site
back/forward), a **Stop** button for composing, a tabbed **Settings**, and an
account panel — while the creator platform grows **blogs** as a publishable type
with type-grouped profiles and avatars.

### Added
- **Downloads** — files downloaded from embedded real sites now save straight to
  your Downloads folder (no save dialog, with name de-duplication), a toast
  confirms, and a "Download complete" notification opens the folder on click.
- **Publish as a Page or a Blog post** — publishing a composed page now asks where
  it should go. Blog posts are a distinct content type; your public profile groups
  everything by type (Lessons · Quizzes · Blog · Pages).
- **Browsing history** — a **Sites** tab in the History drawer logs the real
  websites you visit (newest-first, deduped). Click to reopen, Remove one, or
  Clear history. Separate from composed-page History.
- **Bookmarks** — a ☆ in the toolbar saves the current page or site (★ when saved);
  a new **Bookmarks** tab in the History drawer lists them. Click to reopen (sites
  navigate, composed-page bookmarks recompose); Remove to delete. Persists locally.
- **Live omnibox + back/forward inside real sites** — when you browse a real
  website embedded in Chervil, the omnibox now tracks the current URL, the tab
  title follows the site, and Back/Forward step through that site's own history
  before falling back to Chervil's page tree. Embedded browsing now feels like a
  real browser.
- **Account section in Settings → You** — shows whether you're on Chervil **Pro**
  or **Free**, with links to your getchervil.com account and your public profile
  (if you've claimed a handle). Free users get a short Pro pitch + sign-up link.
  Backed by a new `GET /api/account` (publish-token auth).
- **Universal omnibox** — the bar at the top of every page is now editable and
  smart: type a **URL** to open the real site, a **question** to have Sprig compose
  a page, or a **command** (`/learn`, `/quiz`) — one bar routes them all. `Ctrl+L`
  focuses it; Enter goes, Esc restores. Reuses the existing routing brain (slash
  commands, skill modes, Deep Dive, the web agent, and composing).
- **Stop a composing page** — the send button turns into a Stop button while Sprig
  is composing (or press Esc). It aborts the in-flight request, ignores its result,
  and hands the tab straight back to you. Per-tab, so other tabs keep composing.
- **App version in Settings** — Settings now shows the running version (e.g.
  "🌿 Chervil v0.2.0"), and **Help → About Chervil** shows it in a dialog.

### Changed
- **Settings organized into tabs** — the long Settings scroll is now grouped into
  **General · AI · Voice · Publishing & Sync · You** tabs, so each topic is a short,
  focused panel instead of one endless page.
- **Cleaner window chrome** — the native File/Edit/View/Window/Help menu bar is
  replaced by a minimal menu (Edit/View/Help + About) and hidden by default
  (Alt reveals it). Standard accelerators (copy/paste, reload, zoom) still work.

## [0.2.0] — 2026-06-23

A platform release. Chervil grows past "build interactive pages" into a tool that
**publishes anything** you make, **syncs across your computers**, pulls in your
own **files and folders**, **knows your machine**, and tames heavy sessions with
real tab management — plus a richer browser extension.

### Added
- **Sync between computers (free folder-sync)** — point Chervil's data (tabs,
  history, Spaces, agents) at a folder your cloud client already syncs
  (OneDrive / Google Drive / Dropbox) via Settings → "Sync between computers".
  Set the same folder on each machine and your sessions follow you. Safe by
  design: local fallback if the folder is offline, seed-or-adopt on setup, and a
  copy-back-to-local on unlink. Keys stay machine-local (not synced). Pro
  account-sync is the phase-2 path ([RFC 0005](docs/rfcs/0005-sync-between-computers.md)).
- **Computer info (read-only OS introspection)** — ask Sprig "check my computer",
  "how much RAM/disk", "what Windows version am I on", or "when did Windows Update
  last run" and it composes a real dashboard from live machine facts. Exposed to
  composed pages via the applet bridge: `window.chervil.info()` (CPU, RAM, disk,
  uptime, network, versions) and `window.chervil.details()` (Windows
  edition/build, install date, last boot, Windows Update history, GPU, battery,
  manufacturer/model, BIOS). Strictly read-only — fixed `Get-*`/registry queries;
  no settings changes or arbitrary commands.
- **Browser extension v0.2** — a grouped **Ask Sprig** right-click submenu for
  pages, selections, and links, with **Summarize**, **Key points**, and **Explain
  simply** actions; one-tap **Summarize**/**Key points** in the popup; and an
  `Alt+Shift+S` shortcut to summarize the current page. Actions ride a new
  `action=` deep-link param that shapes the prompt the app composes.
- **Tab switcher (Ctrl+K)** — a command palette to jump to any tab by title;
  type to filter, ↑/↓ to move, Enter to open. Tames large tab counts.
- **Pinned tabs** — right-click → Pin. Pinned tabs sort to the front, show 📌,
  are compact, and are protected from "close others / to the right / all". Pins
  persist across restarts.
- **Publish any page to the web** — **🌐 Publish to web** now works for *any*
  composed interactive page (clock, calculator, converter…), not just lessons and
  quizzes. Self-contained pages publish their HTML directly; pages that call Sprig
  at runtime degrade gracefully when hosted. New `chervil:publish-page` endpoint.
- **Publish a whole Space** — a **🌐 Publish** button in the History drawer's
  Space bar publishes every page in the active Space, then a styled index page
  linking them all, and copies the shareable index URL.
- **Minimal publish service** (`server/`) — a zero-dependency Node service that
  stores and serves published page HTML, so *Publish to web* works without the
  full hosted tier. Run `node server/server.js`, point Settings → Publishing at it.
- **Data folders** — designate local folders (or desktop-synced **OneDrive** /
  **Google Drive** folders) as data sources and pull their files into a query's
  attachments (📁 beside the attach button). A free, local on-ramp toward
  cloud-synced, indexed sources — designed in
  [RFC 0004](docs/rfcs/0004-cloud-data-sources.md).
- **History multi-select** — bulk-select and delete pages in the History drawer
  (**Select** → check rows → **Delete selected**), so long histories stay manageable.

### Fixed
- **Bulk tab close** now activates the closest *surviving* tab (first to the
  right, then left), computed before removal — instead of an index that shifts as
  tabs splice out.
- Publishing to an unavailable hosted endpoint now shows a clear "service still in
  development" message instead of a bare `404`.

## [0.1.5] — 2026-06-22

A big feature release: Chervil learns to **teach**. The flagship learning
vertical lands — interactive lessons and graded quizzes you can build, publish,
and share — alongside a browser extension and real-world map/phone actions.

### Added
- **Interactive Lessons** — ask Sprig to teach you a topic (🎓 **Learn**, or
  `/learn <topic>`) and it builds a swipeable deck of cards with hands-on,
  generative applets and oEmbed-verified videos.
- **Quizzes** — build a graded multiple-choice quiz (❓ **Quiz**, or
  `/quiz <topic>`) that scores answers and explains each one. A composer **skill
  picker** sits next to Deep Dive so you choose what Sprig should *make*.
- **Publish to the web (Chervil Pro)** — send any lesson or quiz to a shareable
  `getchervil.com/learn/…` link from the app (Settings → publish token).
  Re-publishing updates the same URL in place, and applets are snapshotted at
  publish so they keep working for viewers. Hosted extras: a **public profile**
  (`/profile/you`) that collects everything you've published, and **per-card
  analytics** showing where learners drop off.
- **Standalone mobile export** — save a lesson or quiz as a self-contained,
  swipeable `.html` you can open on any phone.
- **Browser extension (Chrome/Edge)** — "Ask Sprig about this page" or summarize
  it, sending the page or your selection to Chervil via a `chervil://` deep link.
- **Real-world agentic actions** — composed pages now open **real Google Maps**
  in-app (and send the pin to your phone via QR) instead of faking a map, and
  turn **phone numbers** into one-tap call-from-PC or send-to-phone.

### Changed
- The learning vertical is built on a reusable **skill framework**, so new
  builders (Lesson, Quiz, …) plug into one build → render → publish pipeline.

### Fixed
- Grok / OpenAI now surface the real streaming error instead of a generic
  "stream error".
- Browser deep links no longer get lost on a cold start — the prompt is delivered
  once the window's renderer is ready.

## [0.1.4] — 2026-06-22

### Changed
- **"Hey Sprig" is now a bundled, built-in wake word — and the default.** The
  self-trained openWakeWord model ships with the app, so hands-free "Hey Sprig"
  works out of the box; no more loading a custom `.onnx` or falling back to
  Hey Jarvis. (Hey Jarvis / Alexa / Hey Mycroft remain selectable.)

## [0.1.3] — 2026-06-21

### Changed
- **"Hey Sprig" wake word** now runs on **openWakeWord** (onnxruntime-web) instead
  of Picovoice Porcupine — free, open-source, on-device, and **no API key**
  (Picovoice is retiring its free tier on June 30, 2026). Built-in words
  (Hey Jarvis / Alexa / Hey Mycroft) work out of the box; the literal "Hey Sprig"
  uses a free, self-trained openWakeWord `.onnx` loaded as a custom model.

## [0.1.2] — 2026-06-20

### Fixed
- Installer build: prune the dev-only Picovoice packages from the app bundle
  (runtime uses the vendored copies in `src/vendor`), and stamp the Windows
  `Chervil.exe` file/product version + metadata (was blank). Packaging moved to
  a small cross-platform `scripts/package.mjs`.

## [0.1.1] — 2026-06-20

First packaged **Windows installer** (Inno Setup), plus new providers and a
hands-free listening mode.

### Added
- **Windows installer** — a setup wizard that can set your API keys, a default
  provider, an "About you" profile, and run-at-startup on first launch. Built and
  published by CI on a version tag. Run-from-source still works.
- **OpenAI provider** — alongside Claude/Grok/Gemini/Azure/Ollama, with live web
  grounding (Responses API web search) and citations.
- **"Hey Sprig" listening mode** (opt-in) — on-device wake-word detection
  (Picovoice Porcupine) pops the quick-ask bar and captures a spoken request.
- **Build an agent from a session**, and **export agents** to share.

### Changed
- **Grok** moved to xAI's Agent Tools API on `/v1/responses` (Live Search was
  deprecated) and refreshed to current `grok-4.x` models.

### Fixed
- Local-time clocks/pages (was UTC); notification on compose-finish while
  minimized; notification source name ("Chervil", not `com.chervil.app`).

## [0.1.0] — 2026-06-19

First public, build-in-public alpha. Run from source; no packaged installer yet.

### Added
- **Composed pages** — ask Sprig a question and get a single, image-rich,
  sandboxed page grounded in live web search, with its sources shown.
- **Living, interactive pages** — composed pages can call back to Sprig at
  runtime to fetch fresh data (mini-apps, not printouts).
- **Deep Dive** — a two-phase research pipeline producing long, cited reports
  with disinformation vetting.
- **Trust layer** — one-click **Verify** a page's claims against reputable live
  sources, plus a sources / "show your work" panel.
- **Living pages** — schedule a page to re-ground itself and notify you on change.
- **Spaces** — persistent topic workspaces that synthesize across what you've
  gathered.
- **Agentic web actions** — Sprig can operate real sites for you, with hard
  safety gates (see [SECURITY.md](SECURITY.md)).
- **Quick-ask** — a global hotkey opens a floating ask bar; Chervil lives in the
  tray and can close-to-tray.
- **Scheduled agents** — run prompts on a daily / weekly / interval schedule in
  the background; a schedule can run "as" a chosen agent.
- **Agent files** — import a persona (instructions, model, allowed MCP tools,
  starter prompts); the active agent shows as a chip by the composer. Ships with
  starter agents in [`/agents`](agents).
- **Video summaries** — summarize YouTube videos from captions, or watched
  natively when on Gemini.
- **Export anywhere** — PDF, PowerPoint (.pptx), Word (.docx), Excel (.xlsx),
  image (PNG / JPG), and animated GIF.
- **Bring your own AI** — pluggable providers: Claude, Grok, Gemini, OpenAI, Azure
  AI Foundry, and local Ollama; native grounding for Claude / Grok / Gemini / OpenAI.
- **Voice input** — dictate prompts via a Whisper-compatible endpoint.
- API keys encrypted at rest via OS-native storage; never round-tripped through
  the UI.

[Unreleased]: https://github.com/chervil-ai/chervil/compare/v0.1.5...HEAD
[0.1.5]: https://github.com/chervil-ai/chervil/compare/v0.1.4...v0.1.5
[0.1.0]: https://github.com/chervil-ai/chervil/releases/tag/v0.1.0
