# Changelog

All notable changes to Chervil are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project aims to
follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Tab switcher (Ctrl+K)** — a command palette to jump to any tab by title;
  type to filter, ↑/↓ to move, Enter to open. Tames large tab counts.
- **Pinned tabs** — right-click → Pin. Pinned tabs sort to the front, show 📌,
  are compact, and are protected from "close others / to the right / all". Pins
  persist across restarts.
- **Publish any page to the web** — **🌐 Publish to web** now works for *any*
  composed interactive page (clock, calculator, converter…), not just lessons and
  quizzes. Self-contained pages publish their HTML directly; pages that call Sprig
  at runtime degrade gracefully when hosted. New `chervil:publish-page` endpoint.
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
