# Parslee ◈

**The Agentic, Conversational Modern Web Browser.**

Parslee replaces the list of blue links with a conversation. You talk to the web,
and Parslee brings it alive — searching the live web in real time and **composing a
complete, beautiful web page** in response, or **opening a real site** in an embedded
browser when that's what you actually want.

It's a hybrid browser:

- **Composed pages** — for questions, comparisons, research, and discovery, Parslee
  synthesizes a self-contained HTML page (text, images, layout, light interactivity),
  grounded in current sources via live web search.
- **Real sites** — when you ask to "open YouTube" or "go to gmail", Parslee embeds the
  actual website in a live browser view.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Add your Anthropic API key
cp .env.example .env
#   then edit .env and set ANTHROPIC_API_KEY=sk-ant-...

# 3. Launch
npm start
```

Get an API key at <https://console.anthropic.com>.

---

## How it works

```
┌─────────────────┐     IPC      ┌──────────────────────────────┐
│  Renderer (UI)  │ ───────────▶ │  Main process (Electron)     │
│  chat + canvas  │ ◀─────────── │  runs the agent              │
└─────────────────┘  stream      └───────────────┬──────────────┘
                                                  │
                                         ┌────────▼─────────┐
                                         │  Model provider  │  (pluggable)
                                         │  default: Claude │
                                         └────────┬─────────┘
                                                  │ web_search / web_fetch
                                                  │ open_website (decide to embed)
                                                  ▼
                                    Composed HTML  ──or──  Real-site URL
```

For each message the model either:

1. **Composes a page** — grounds itself with the server-side `web_search` /
   `web_fetch` tools, then streams back a full HTML document that renders in a
   sandboxed `<iframe>`, or
2. **Calls `open_website(url)`** — a client-side tool that tells the UI to load a
   real site in a `<webview>`.

### Project layout

| Path | Purpose |
|------|---------|
| `electron/main.js` | App window + IPC; bridges UI ↔ agent |
| `electron/preload.js` | Safe `window.parslee` bridge (contextIsolation) |
| `lib/agent.js` | Thin orchestrator for one turn |
| `lib/models/index.js` | Pluggable provider registry |
| `lib/models/claude.js` | Claude provider: tools, system prompt, streaming, HTML extraction |
| `src/` | Renderer UI (chat sidebar + page canvas) |

---

## Configuration

Set in `.env`:

| Variable | Default | Notes |
|----------|---------|-------|
| `ANTHROPIC_API_KEY` | — | **Required.** |
| `PARSLEE_MODEL` | `claude-sonnet-4-6` | Use `claude-opus-4-8` for maximum quality at the cost of latency. |
| `PARSLEE_EFFORT` | `low` | How hard the model deliberates. Try `medium`/`high` for richer pages. |
| `PARSLEE_PROVIDER` | `claude` | The model backend. |

The legacy `PINGCHAT_*` names are still honored as a fallback.

### Adding another model backend

The model is pluggable. Create `lib/models/<name>.js` exporting a factory with a
`run({ query, history, onStatus, onText })` method that resolves to either
`{ kind: 'page', html, title, sources }` or `{ kind: 'navigate', url, reason }`,
then register it in `lib/models/index.js`.

---

## Browser features

- **Tabs** — each tab is its own chat *and* its own back/forward page stack. New tab = new conversation.
- **Back / Forward** — navigate the history of pages you've composed (and real sites you've opened) within a tab.
- **Save** — export any composed page to a standalone `.html` file via the Save button.
- **Persistence** — tabs, prompts, and pages are saved to disk and restored on the next launch.

### Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+T` | New tab |
| `Ctrl+W` | Close tab |
| `Alt+←` / `Alt+→` | Back / Forward |

Session state lives in `parslee-state.json` under Electron's `userData` directory.

## Status

This is an early MVP / prototype. Roadmap ideas:

- Click-through: let links inside composed pages start new Parslee queries
- Per-page follow-up chat ("make this darker", "add a price table")
- A saved-pages library (browse everything you've saved)
- Concurrent generations across tabs (today, one request runs at a time)

## License

MIT
