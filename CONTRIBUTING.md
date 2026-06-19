# Contributing to Chervil

Thanks for your interest! Chervil is an early, fast-moving open-source project.
This guide covers setup, architecture, and conventions.

## Development setup

```bash
npm install
npm start      # launches the Electron app (alias: npm run dev)
```

Requirements: Node.js + the bundled Electron (`^39`). For a free, offline dev
loop, install [Ollama](https://ollama.com) and select it as the provider — no API
key or web grounding needed (compose-only). For grounded features, add a provider
key in **Settings ⚙** or via environment variables (see [README](README.md)).

## Architecture

Chervil is a standard Electron three-layer app:

- **`electron/main.js`** — the main process. Holds API keys (encrypted via
  `safeStorage`), owns the `BrowserWindow`, sets permission handlers, and exposes
  IPC endpoints (ask, applet-ask, agent-step, transcribe, set/get key status,
  list-models, export-pdf, notify).
- **`electron/preload.js`** — the context-isolated bridge that exposes a narrow,
  safe API from main to the renderer.
- **`src/`** — the UI. `index.html`, `renderer.js` (the bulk of the app logic:
  tabs, page tree, composer, remix/trust bars, Spaces, settings, living pages),
  and `styles.css`.
- **`lib/agent.js`** — orchestration entrypoints (`runAgent`, `runAppletAsk`,
  `runAgentStep`) that the IPC handlers call.
- **`lib/models/`** — the pluggable provider layer:
  - `index.js` — `getProvider(config)` selects a provider from config/env.
  - `claude.js` — Claude (the only provider with server-side web search + fetch,
    the two-phase Deep Dive, applet `quickAsk`, and the agentic `complete()` loop).
  - `ollama.js` — local Ollama (compose-only).
  - `openai-compatible.js` — Grok, Gemini, Azure via an OpenAI-style API
    (Grok/Gemini support live grounding; Azure is compose-only).

Data flow for a typical request: renderer collects `settings` + query →
`preload` IPC → `main` handler → `lib/agent.js` → a provider in `lib/models/` →
streamed events tagged with a `requestId` route back to the originating tab.

State (tabs, page tree, settings, library, Spaces, living pages) persists in a
state file in the Electron `userData` directory.

> **Note on the rename:** the project was renamed from "Parslee" to **Chervil**,
> including internal identifiers — use the **`chervil`** names in new code:
> `CHERVIL_*` env prefixes, the `window.chervil` page bridge, `chervil:*` IPC
> channels, and `chervil-state.json` / `chervil-keys.bin`. The old `parslee`
> names survive only as backward-compat shims (env-var fallbacks, a
> `window.parslee` alias for pre-rename composed pages, and one-time legacy-file
> reads) so existing installs keep working — don't add new references to them.

## Adding a provider

1. Create `lib/models/<provider>.js` exporting the provider interface used by the
   others (`run`, and where applicable `quickAsk`, `complete`, `listModels`).
2. Register it in `lib/models/index.js` (`getProvider`). OpenAI-style APIs can
   often reuse `createOpenAICompatProvider` in `openai-compatible.js`.
3. Wire any new config fields through the renderer settings → ask payload → main.
4. If the provider supports live web grounding, follow the `groundingFields`
   pattern in `openai-compatible.js`.

## Conventions

- **Match the surrounding code** — naming, comment density, and idiom. No new
  build tooling or frameworks without discussion.
- **Keep authority in the runtime, not the model.** Any new agentic capability
  must respect the safety model in [SECURITY.md](SECURITY.md): hard refusals for
  financial/credential actions, approval gates for side-effects, sandboxed
  composed pages.
- **Verify before claiming done.** Prefer a real run over assumption; note in the
  PR what you verified and what you didn't.

## Pull requests

1. Branch from `main`.
2. Keep PRs focused; describe the change and your verification.
3. Reference any related issue.

## Reporting bugs & security issues

File functional bugs as GitHub issues. For security vulnerabilities, follow
[SECURITY.md](SECURITY.md) (private disclosure) — do not open a public issue.
