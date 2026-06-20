# Changelog

All notable changes to Chervil are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project aims to
follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/chervil-ai/chervil/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/chervil-ai/chervil/releases/tag/v0.1.0
