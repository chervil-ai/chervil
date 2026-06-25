# RFC 0008 — Password / credential autofill (the sensitive half of autofill)

- **Status:** Draft (design — the security model is the deliverable; code is phased after)
- **Author:** Rod Trent (with Sprig)
- **Created:** 2026-06-25
- **Depends on:** [execution-control.md](../execution-control.md) (authority lives in the runtime), [SECURITY.md](../../SECURITY.md), [RFC 0006](0006-agentic-actions.md) (the agent boundary: passwords are off-limits to the model)
- **Relates to:** [RFC 0005](0005-sync-between-computers.md) (any future credential sync must be end-to-end encrypted)
- **Theme:** finish autofill safely. Identity autofill shipped; passwords were deliberately deferred because they need real secure storage and a human-in-the-loop fill UX — never the agent.

## Summary

Let a user **save a login (username + password) for a real site and fill it back
in on demand**, with the password **encrypted at rest** (OS-backed `safeStorage`),
**scoped to the site's origin**, **filled only on an explicit user action**, and
**never auto-submitted, never shown to the model, and never sent anywhere**. This
is the sensitive counterpart to the identity autofill that already ships
(`autofillCurrentForm` in `src/renderer.js`, which matches name/email/address
fields and **explicitly skips `type=password` and hidden fields** — see
`autofillScript`). No credential code lands until the security model below is
locked.

## Non-goals (for this RFC)

- Auto-submitting login forms (we fill; the user submits).
- Letting **Sprig / the web agent** enter passwords — it already hard-refuses
  password fields and hands logins back to the user via `need_user` (RFC 0006);
  that boundary stays.
- Cross-browser import (Chrome/Edge/1Password), breach monitoring, password
  health scoring — later, if ever.
- Passkeys / WebAuthn and TOTP — noted as future direction, out of scope here.
- Filling credentials into **composed pages** — only real sites in the
  `<webview>` are eligible (composed pages are sandboxed `srcdoc`, no real logins).

## Principles (non-negotiable)

1. **Plaintext passwords never persist.** At rest they live only in the
   `safeStorage`-encrypted vault, mirroring the API-key store (`persistKeys` /
   `keysFile()` in `electron/main.js`).
2. **The model never sees a credential.** Passwords are never put in a prompt,
   never sent to a provider, never logged, never in the agent loop. This is
   strictly a local, human-in-the-loop feature.
3. **User-initiated only.** A password is filled solely in response to a direct
   user gesture (clicking the fill affordance / picking an entry). No silent or
   on-load filling, no agent-triggered filling.
4. **Origin-scoped.** A saved login is only offered/filled on a page whose
   registrable domain matches the entry, and only into the top-level frame's
   same-origin form — never cross-origin iframes.
5. **Never auto-submit.** We populate the username/password fields and stop. The
   user reviews and submits.
6. **Minimal exposure window.** Plaintext is decrypted in the main process and
   handed to the renderer only for the single fill action, for the matching
   origin, then dropped (not retained in renderer state, not persisted to the
   session state file).

## Current state — what we build on

- **Identity autofill (shipped):** `autofillCurrentForm()` injects `autofillScript`
  into the live `<webview>` via `executeJavaScript`, matching fields by
  `autocomplete`/`name`/`id`/`placeholder`/`aria-label`. It **returns `null` for
  `type==='password'` and `type==='hidden'`** — the explicit line we are now
  extending with a separate, guarded path.
- **Encrypted secret storage (shipped):** API keys use Electron `safeStorage`
  (`safeStorage.encryptString` → `keysFile()`), decrypted only in main; the
  renderer never sees raw keys. The credential vault reuses this exact pattern.
- **Agent boundary (shipped, RFC 0006):** `looksFinancial()` hard-refusal +
  `need_user` login handoff + password-field refusal in the web-action loop.
  Password autofill is **orthogonal** to the agent — it does not relax that.

## Architecture

```
 Renderer (UI + <webview>)                 Main process (Node)
 ┌───────────────────────────┐   user click  ┌──────────────────────────────┐
 │ 🔑 fill affordance on a    │ ────────────▶ │ vault (safeStorage-encrypted) │
 │   login form (origin X)    │   getForOrigin │  creds.dat                    │
 │                            │ ◀──────────── │  → decrypt entries for X only │
 │ inject username+password   │  {user, pass}  │                              │
 │ into the form, NO submit   │                │ save / list / delete (mgmt)  │
 │ drop plaintext after fill  │                │  list returns origin+user    │
 └───────────────────────────┘                │  ONLY — never the password    │
                                               └──────────────────────────────┘
```

### Secure vault (main)

- New encrypted file `creds.dat` in `userData`, written with
  `safeStorage.encryptString(JSON.stringify(vault))`, read with
  `decryptString` — same guard as `persistKeys()` (`isEncryptionAvailable()`;
  if unavailable, **refuse to save** rather than write plaintext).
- **Entry shape:**
  `{ id, origin, username, password, label?, createdAt, updatedAt, lastUsed? }`
  where `origin` is the **registrable domain** (eTLD+1) of the site.
- **IPC surface (all in main; renderer gets a thin preload bridge):**
  - `creds:list` → `[{ id, origin, username, label, updatedAt }]` — **never the password**.
  - `creds:get-for-origin({ origin })` → matching `[{ id, username, password }]`
    — the ONLY call that returns plaintext, gated to a fill action.
  - `creds:save({ origin, username, password, label? })` → upsert.
  - `creds:delete({ id })`, `creds:rename`/`creds:update` for management.
  - `creds:availability` → `{ encryption: bool }` so Settings can warn if the OS
    has no encryption backend.

### Origin matching

- Compute the current site's registrable domain from `els.webview.getURL()`
  (reuse `hostOf()`; add an eTLD+1 reducer — ship a small public-suffix-lite list,
  or match on the full host first and relax to domain as a v1 simplification).
- Only `creds:get-for-origin` for that domain; the fill script only touches the
  **top document** (skip cross-origin iframes) — the injected script runs in the
  webview's main world but must not reach into foreign frames.

### Login-form detection + fill

- Detection script (mirrors `autofillScript`, password-aware): find a visible
  `input[type=password]`; pair it with the nearest preceding username field
  (`type=email`, or name/id/autocomplete matching `user|email|login|account`).
- A **🔑 affordance** appears (omnibar button enabled, or a small inline chip)
  only when (a) a login form is detected AND (b) at least one saved entry matches
  the origin.
- On click: if one match, fill; if several, show a tiny picker (origin + username).
  Fill sets `.value` + dispatches `input`/`change` (as `autofillScript` does) on
  username and password fields. **Never** calls `form.submit()` / clicks submit.
- Plaintext is requested per-fill via `creds:get-for-origin`, injected, and the
  renderer-side variable is cleared immediately after.

### Save / capture flow

- **Phase 8.3:** detect a login submission (capture on the form's submit / a
  password field losing focus with a filled sibling) and show a non-blocking
  "Save this login for `domain`?" prompt → `creds:save`. Update-in-place when the
  username matches an existing entry (password changed).
- Always also offer a **manual** "Save login for this site" action so capture
  isn't the only path.

### Settings UI (management)

- New **Settings → Security → Passwords** group (or under "You" beside identity
  autofill). Lists saved logins as **origin + username only**; never renders the
  password by default. Actions: add, edit username/label, **delete**, and an
  optional **Reveal** that requires re-auth (see below).
- A master **"Enable password autofill"** toggle (default the feature on, but the
  vault is empty until the user saves something). A warning row when
  `safeStorage` is unavailable on this OS.

### Optional re-auth / lock (Phase 8.4)

- Before **reveal** (and optionally before **fill**), require a gate: OS auth
  (Windows Hello via `electron`/native where available) or a Chervil master
  passphrase that wraps the vault key. Auto-lock after N minutes / on minimize.
- Decision needed (below) on whether v1 ships any gate or defers it.

## Threat model notes

- **Renderer compromise / malicious composed page:** composed pages are sandboxed
  `srcdoc` and cannot call the creds IPC (only the trusted preload bridge in the
  app UI can); `creds:get-for-origin` is the sole plaintext path and is tied to a
  live-site fill gesture. Document that a fully compromised renderer could request
  fills — same trust level as the existing key bridge.
- **At rest:** equivalent to the API-key store. If the OS keychain is wiped, the
  vault is unreadable (acceptable; not a backup system).
- **Exfiltration:** no network path for credentials; they never enter prompts.
  Reaffirm in `SECURITY.md`.

## Phasing

- **8.1 — Vault + management UI.** `safeStorage` vault, IPC, Settings → Passwords
  (add/list/delete; list never exposes passwords). No on-page fill yet. *Shippable
  on its own (a basic local password manager).*
- **8.2 — Manual fill on a live site.** Origin-scoped 🔑 affordance, picker,
  fill username+password, never submit.
- **8.3 — Save-on-submit capture** prompt + manual save.
- **8.4 — Re-auth / auto-lock** (OS Hello or master passphrase), reveal-gated.
- **Later — encrypted sync** via RFC 0005 (end-to-end only), browser import,
  password generator, passkeys.

## Open decisions (lock before coding 8.1)

1. **Gate in v1?** Ship 8.1/8.2 with no re-auth (parity with how API keys work —
   already decrypted on use), and add Hello/passphrase in 8.4? Or require a gate
   from day one? (Leaning: no gate in v1, matching the key store; revisit.)
2. **Match granularity:** exact host vs registrable domain (eTLD+1). eTLD+1 is
   friendlier (`mail.google.com` ↔ `accounts.google.com`) but needs a suffix list.
   v1 could match exact host and relax later.
3. **Reveal in UI at all?** Or delete-and-re-add only, never show plaintext?
4. **Generator?** Offer a "suggest strong password" helper at save time (cheap,
   high value) or keep strictly storage-only for v1?
5. **Settings placement:** new "Security" tab vs extend "You".

## Acceptance (8.1)

- Saving a login writes only to the `safeStorage`-encrypted `creds.dat`; the
  session state file and logs contain no plaintext password.
- `creds:list` returns origins + usernames only; there is no IPC that returns a
  password except `creds:get-for-origin`.
- With `safeStorage` unavailable, saving is refused with a clear message (no
  plaintext fallback).
