# RFC 0005 — Sync between computers

- **Status:** Phase 1 (free folder-sync) **shipped 2026-06-23**; Phase 2 (Pro account-sync) is design-only
- **Author:** Rod Trent (with Sprig)
- **Created:** 2026-06-23
- **Depends on:** [RFC 0002](0002-hosted-lessons-and-pro.md) (accounts/billing, for Phase 2), [hosted-tier.md](../hosted-tier.md)

## Summary

Let a user's session — tabs, history, Spaces, agents, settings — follow them
between computers. **Phase 1 (free, shipped):** point Chervil's state file at a
desktop-synced folder (OneDrive / Google Drive / Dropbox). **Phase 2 (Pro):**
real account-based sync through Chervil Cloud with conflict handling and
cross-device merge.

## State today

All session state persists to a single JSON file, `chervil-state.json`, in the
Electron `userData` folder ([electron/main.js](../../electron/main.js),
`saveState`/`loadState`). API keys live separately in `chervil-keys.bin`,
encrypted per-machine via `safeStorage`. Nothing leaves the device.

## Phase 1 — folder-sync (shipped)

The cleanest free on-ramp: let the user choose where the state file lives and put
it in a folder their cloud client already syncs.

- **Pointer is machine-local.** The custom state path is stored in
  `chervil-config.json` in `userData` — deliberately *outside* the synced state
  file (chicken/egg), and it never syncs. Each machine sets its own pointer to the
  same shared folder.
- **`stateFile()`** returns the configured path when its folder is reachable, else
  falls back to the local default — so an offline/unmounted sync folder never
  breaks save/load.
- **Set** (`chervil:set-sync-folder`): pick a folder → `chervil-state.json` there.
  If the file already exists, *adopt* it (renderer reloads to load the synced
  session); if not, *seed* it from current state so nothing is lost.
- **Stop** (`chervil:clear-sync-folder`): copies the synced state back to local,
  then unlinks. UI lives in Settings → "Sync between computers".

**Accepted caveats (documented in the UI):**
1. **Keys don't sync** — `safeStorage` is machine-bound; re-enter API keys once
   per computer. (Syncing secrets safely belongs to Phase 2's server.)
2. **Last-writer-wins** — running Chervil on two machines simultaneously can
   clobber; the cloud client may also drop a `…-PCNAME.json` conflict copy. Fine
   for the common one-machine-at-a-time case.

## Phase 2 — account-sync (Pro, design)

True multi-device sync needs a server (the RFC 0002 / hosted-tier backend):

- **Auth:** the existing Chervil account (Clerk → bearer), same token surface as
  publish.
- **Model:** push/pull state deltas to `GET/PUT /api/state` with a version/vector
  clock; resolve conflicts by entity (tabs, library items, agents) rather than
  clobbering the whole blob. Last-write-wins per entity at minimum; CRDT-ish merge
  later.
- **Keys:** offer optional encrypted key sync (client-side-encrypted with a user
  passphrase so the server never sees plaintext), resolving caveat #1.
- **Realtime-ish:** pull on focus + periodic; websockets later if needed.

## Phasing

| Step | Scope | Status |
|---|---|---|
| **5.1** | Folder-sync: configurable state path + Settings UI + adopt/seed/unlink | ✅ shipped |
| **5.2** | Account-sync: `GET/PUT /api/state`, per-entity merge, pull-on-focus | gated on RFC 0002 backend |
| **5.3** | Encrypted key sync (passphrase) | after 5.2 |

## Open decisions

1. **Merge granularity** for 5.2 — whole-blob LWW (simple) vs per-entity merge
   (better UX). _Lean: per-entity LWW for v1._
2. **Key sync** — never (stay machine-local) vs opt-in client-side-encrypted.
   _Lean: opt-in, passphrase-derived, zero-knowledge._
3. **Conflict UX** for folder-sync — silently last-writer-wins vs surface a
   "synced copy is newer, reload?" prompt on focus. _Lean: add reload-on-focus
   detection as a fast follow._

## Risks

- **Data loss** is the cardinal risk — every change here is guarded with local
  fallback + copy-back on unlink; never delete the local copy.
- **Conflict copies** from cloud clients can confuse users — document, and add
  focus-time detection (decision 3).
- **Phase 2** depends entirely on the unbuilt backend; don't start 5.2 until
  accounts exist.
