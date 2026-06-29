# Chervil — the agentic, conversational web browser

> ⚠️ **Alpha / building in public.** Chervil is young and moves fast. Many
> features are implemented but not yet end-to-end verified on every platform.
> Treat this as a preview, not a stable release. A Windows installer is available
> on the [Releases](https://github.com/chervil-ai/chervil/releases) page (the setup
> wizard can set your keys, default provider, profile, and run-at-startup); you can
> also run from source (below).

🌐 **Website:** [getchervil.com](https://getchervil.com) &nbsp;·&nbsp; 📣 **Announcement:** [Coming Soon — Chervil: The Web Comes to You](https://rodtrent.substack.com/p/coming-soon-parslee-the-web-comes)

**Chervil replaces the browse-and-skim loop with a conversation.** Instead of ten
blue links, you talk to **Sprig** — an assistant that searches the live web, then
composes a single, self-contained, image-rich page built for your exact question.
When you actually want a real site (email, bank, a web app), Sprig opens it live.
Synthesized pages when synthesis is better; the real web when the real web is the
point.

*(Chervil is "French parsley" — which is exactly why Sprig, our leafy guide, feels
right at home.)*

## Demo

> 🎬 A short screen capture of Sprig composing a page from a question is on the
> way. _(Building in public — it'll land right here.)_

<!-- When recorded, save it as Images/demo.gif and replace the line above with:
![Chervil composing a page from a question](Images/demo.gif) -->

## What it does

- **Compose pages, not link lists** — grounded in live web search, rendered in a sandbox.
- **Living, interactive pages** — composed pages can call back to Sprig at runtime to fetch fresh data (mini-apps, not printouts).
- **Deep Dive** — a two-phase research pipeline that produces a long, cited report with disinformation vetting.
- **Trust layer** — every page can show its sources and one-click **Verify** its own claims against live sources.
- **Spaces** — persistent topic workspaces that synthesize across everything you've gathered; **pin files** to a Space as permanent sources.
- **Living pages** — schedule a page to re-ground itself and notify you when it changes.
- **Agentic web actions** — Sprig can operate real sites for you, with hard safety gates (see [SECURITY.md](SECURITY.md)).
- **Multi-stage agents** — chain agents into a pipeline where each builds on the last one's work (research → draft → critique), and the final agent composes the page. Or make it **orchestrated**, where a coordinator picks who acts next based on the results so far.
- **Shareable pages** — export any composed page to a portable `.chervil` file, or publish it with a built-in **Open in Chervil** button, so anyone can import it into their own Chervil and remix it.
- **Publish agents + the Agent store** — publish an agent to your profile (importable by anyone in one click), and submit your best agents and pages to the community **Agent store** and **Share gallery** at [getchervil.com](https://getchervil.com), browsable by category (vetted + approved). Browse and import from the store **right inside the app**, too.
- **Make it your own** — choose which buttons show on the top bar (Settings, or right-click the bar), and pick a **page style** (Balanced / Rich / Minimal) for composed pages. Embedded real sites behave like a normal browser — popup/OAuth logins, downloads, find-in-page.
- **Quick-ask** — a global hotkey opens a floating ask bar; Chervil lives in the tray, always a keystroke away.
- **"Hey Sprig" listening** — opt-in hands-free wake word that pops the quick-ask bar and captures your spoken request. Detection is fully on-device and free ([openWakeWord](https://github.com/dscripka/openWakeWord) on onnxruntime-web, no account or key) — audio never leaves your machine until you speak a command. Built-in words (Hey Jarvis / Alexa / Hey Mycroft) work out of the box; the literal "Hey Sprig" uses a free, self-trained openWakeWord model.
- **Scheduled agents** — run prompts on a daily/weekly/interval schedule in the background, optionally "as" a chosen agent.
- **Agent files** — import a persona (instructions, model, tools, starters) to make Sprig a specialist. Starters in [`/agents`](agents).
- **Video summaries** — summarize YouTube videos from captions, or watched natively on Gemini.
- **Export anywhere** — turn any page into PDF, PowerPoint, Word, Excel, an image, or an animated GIF.
- **Bring your own AI** — pluggable providers: Claude, Grok, Gemini, OpenAI, Azure AI Foundry, and local Ollama.

## Run from source

```bash
git clone <this-repo>
cd <repo>
npm install
npm start          # alias: npm run dev
```

You'll need an API key for at least one provider (or a local [Ollama](https://ollama.com)
install for free, offline use). Add keys in **Settings ⚙ → Provider** — they're
encrypted at rest on your machine and never round-tripped through the UI.
Environment variables also work (a `.env` is supported):

| Variable | Default | Notes |
|----------|---------|-------|
| `CHERVIL_PROVIDER` | `claude` | Model backend: `claude`, `grok`, `gemini`, `openai`, `azure`, `ollama`. |
| `CHERVIL_MODEL` | `claude-sonnet-4-6` | Use `claude-opus-4-8` for maximum quality at higher latency. |
| `CHERVIL_EFFORT` | `low` | How hard the model deliberates (`low`/`medium`/`high`). |
| `ANTHROPIC_API_KEY` | — | Claude — the only provider with the full Deep Dive + web grounding (search *and* fetch). |

> Provider notes: Claude has the richest experience (live grounding + two-phase
> Deep Dive). Grok, Gemini, and OpenAI support live grounding. Azure and Ollama
> are compose-only (no live web search).
>
> **Env vars:** `CHERVIL_*` is the primary prefix. The older `PARSLEE_*` (and
> legacy `PINGCHAT_*`) names are still read as fallbacks, so existing `.env`
> files keep working.

## Status & roadmap

This is an early public build. See [docs/pre-launch-hardening.md](docs/pre-launch-hardening.md)
for the known verification gaps we're closing before a signed, packaged release.
The direction: deeper multi-step agents, Spaces that hold your files as permanent
sources, richer computed pages, and ever-stronger trust tooling.

## Tech

Electron desktop app (bundles its own engine — no installed browser needed). A
main process holds keys and talks to providers; a sandboxed renderer is the UI;
the model layer is fully pluggable. See [CONTRIBUTING.md](CONTRIBUTING.md) for
architecture and how to add a provider.

## License

[MIT](LICENSE) © 2026 Rod Trent.
