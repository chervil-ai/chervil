# Security & Safety Model

Chervil is an *agentic* browser: it can hold credentials, compose and run HTML,
and act on real websites on your behalf. That power demands a clear safety model.
This document describes how authority is enforced and how to report a
vulnerability.

## Core principle: the model proposes, the runtime disposes

Authority does **not** live in the model's reasoning. The model can *propose* an
action, but a deterministic layer in the app decides whether it is allowed to
happen. The model cannot widen its own permissions. (See
[docs/execution-control.md](docs/execution-control.md) for the philosophy.)

## What protects you

- **API keys are encrypted at rest.** Keys are stored via the OS secure store
  (Electron `safeStorage`) in the main process. The renderer/UI only ever learns
  *that* a key exists — never the raw key. Keys are never written in plaintext or
  round-tripped through the UI.
- **Composed pages run sandboxed.** Sprig-generated HTML executes in isolation.
  A single, trusted, injected bridge is the only channel back to the app.
- **Side-effects ask first.** When Sprig acts on a real website, any action that
  submits, posts, or changes an account requires explicit user approval
  (Approve/Stop). Stop halts the action.
- **Hard refusals on high-risk actions.** Chervil refuses to enter passwords,
  refuses payment/purchase/transfer flows, and hands logins and financial steps
  back to the user — enforced in the harness, not left to model judgment.
- **The microphone is scoped to the app's own origin.** Embedded real sites in
  the live browser view cannot silently access the mic or camera; only benign,
  sanitized browsing permissions are granted to embedded content.
- **MCP is opt-in.** Remote MCP servers run only when you add and enable them; the
  enabled list is the trust boundary. (Claude-only, remote-URL servers only.)
- **Honesty about facts.** Deep Dive and the Verify layer are designed to
  distinguish well-established from contested or unverified claims rather than
  presenting everything with equal confidence.

## Known limitations (current build)

- Several safety paths are verified deterministically/in logic tests but not yet
  fully live-verified end-to-end (see [docs/pre-launch-hardening.md](docs/pre-launch-hardening.md)).
  Treat the alpha accordingly.
- MCP server-side tools run as part of the request without a per-call
  confirmation gate — the opt-in list is the only gate.
- Prompt-injection from fetched/visited pages is an active area of hardening.

## Reporting a vulnerability

Please report security issues **privately** — do not open a public issue for an
exploitable vulnerability.

- Open a [GitHub security advisory](https://docs.github.com/en/code-security/security-advisories) on this repo, **or**
- Email the maintainer (see the repo profile).

Include reproduction steps and impact. We aim to acknowledge within a few days.
Coordinated disclosure is appreciated.
