# Chervil — Ask Sprig (Chrome extension)

A lightweight funnel: send the current page or your selection to the **Chervil
desktop app** and ask Sprig about it. The extension doesn't run AI itself — it
opens the app via a `chervil://` deep link (the app composes the answer).

## How it works

- **Toolbar popup** — type a question, or "Summarize this page".
- **Right-click** — "Ask Sprig about this page" / "Ask Sprig about ‘selection’".

Either builds a `chervil://ask?url=…&title=…&text=…` link and opens it. Chervil
(the desktop app, which registers the `chervil://` protocol) focuses, drops the
prompt into a new tab, and composes the answer. If Chervil isn't installed, the
browser shows nothing to open — the popup has a **Get the app** link.

## Install (unpacked, for dev)

1. Make sure the Chervil desktop app has run at least once (it registers the
   `chervil://` protocol on first launch).
2. Chrome → `chrome://extensions` → enable **Developer mode** → **Load unpacked**
   → select this `extension/` folder.
3. Pin "Chervil — Ask Sprig" and try it on any page.

> First use shows Chrome's "Open Chervil?" external-protocol prompt — that's
> expected. Check "Always allow" to skip it next time.

## Files

- `manifest.json` — MV3 manifest (action popup + background service worker)
- `background.js` — context-menu items → open the deep link
- `popup.html` / `popup.js` — the toolbar popup
