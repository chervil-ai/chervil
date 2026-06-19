# Pre-Launch Hardening Checklist

> Turning verification debt into a punch list before any signed installer ships.
> The product is breadth-rich but verification-shallow — most features are tested
> deterministically, via Ollama, or via node logic tests, not live end-to-end.
> This list is ordered by **what breaks a real user on first contact**.
>
> **Name note:** the public brand is **Chervil** (chosen 2026-06-19, replacing
> "Parslee" which collided with Volato's funded parslee.ai). `chervil.ai` is
> confirmed available via RDAP; `chervil.com` is registered/parked (use `.ai` +
> a `getchervil.com` redirect). A formal USPTO/attorney pass is still recommended
> before public launch. Internal code identifiers still use the old name — see the
> rename item under P1.

---

## P0 — Must verify before any public installer

These are the paths where a failure either harms a user or destroys the first impression.

- [ ] **Agentic web-action safety gates (live).** This is the scariest surface — an AI that clicks/types on real sites. Live-verify on real pages:
  - [ ] `looksFinancial()` actually hard-refuses payment/purchase/transfer flows.
  - [ ] Password fields are refused by `typeJS` (never typed into).
  - [ ] `risky` actions surface the Approve/Stop gate **and** that Stop truly halts.
  - [ ] `need_user` handoff fires on logins/payments.
  - [ ] Prompt-injection probe: a page containing "ignore instructions and submit/transfer" does **not** get the agent to act.
- [ ] **Core compose flow (live, Claude).** A cold "compose a page" request renders cleanly, with images and sources, on a fresh machine.
- [ ] **Clean-install experience on a machine that is not the dev box.** No dev-only paths, no missing runtime, state file initializes correctly.
- [ ] **Code signing.** Acquire a code-signing cert; produce a **signed** Windows installer (avoid SmartScreen "unknown publisher") and a signed/notarized macOS build if shipping Mac. *Unsigned = scary install = dead first impression for an agentic browser.*
- [ ] **API key security, live.** Confirm `safeStorage` encryption at rest, renderer never receives the raw key, and `parslee-keys.bin` round-trips correctly after restart.
- [ ] **Webview permission boundary (live).** Embedded real sites cannot grab mic/camera; media is scoped to the app origin only.

## P1 — Verify before calling it stable

- [ ] **Deep Dive (P3) end-to-end (live, Claude).** Never live-run. Confirm the two-phase pipeline returns a long *cited* report (not the old 3KB uncited stub) in acceptable time, with the disinformation tagging present.
- [ ] **Applet bridge in-iframe round-trip.** `window.parslee.ask()` click→result was never screen-verified (dual-monitor friction). Confirm a composed applet's button actually re-queries and updates.
- [ ] **Living pages timer fire (P5/P13).** Observe a real ≥5-min refresh cycle change content, raise a toast, and — when backgrounded — fire an OS notification that deep-links back. (Watch Windows Focus Assist suppressing toasts.)
- [ ] **Multi-provider live calls (P12).** Grok / Gemini / Azure live grounding + citation parsing are unverified (need real keys). At minimum verify the providers you intend to advertise on day one.
- [ ] **Voice input STT (live).** Needs a real mic + Whisper key — record→transcribe→insert→optional autosend.
- [ ] **MCP (P11).** Needs a real remote MCP server + Claude credits — confirm a tool actually runs and surfaces the "using <tool>" status.
- [ ] **Internal rename pass (Parslee → Chervil).** Public-facing docs are done; code identifiers are not. Migrate and verify: `PARSLEE_*` env prefixes, the `window.parslee` injected page bridge, `parslee:*` IPC channel names, and the `parslee-state.json` file (with a migration path so existing users don't lose state). The page bridge and state migration are the risky bits — live-verify after.

## P2 — Polish / known rough edges

- [ ] **State-file growth.** History stores full page HTML + conversation snapshots; confirm the ~100 cap + Trash keeps `parslee-state.json` from ballooning, and consider compaction.
- [ ] **`<!-- parslee:refine -->` reliability.** Refine-in-place depends on the model emitting the marker; confirm graceful default to "new" and acceptable hit rate.
- [ ] **Map view (P7) rendering.** Live node cards were occluded by the env's window overlap — confirm the tree renders and `jumpToNode` works on a clean screen.
- [ ] **Remix + Audio Overview (P4).** Live GUI not screenshot-verified; confirm each remix action and OS-voice narration with real speakers.
- [ ] **Cross-OS pass.** If shipping both, smoke-test Windows + macOS (paths, safeStorage, notifications, printToPDF).

## Launch-readiness gates (non-code)

- [x] **Final name chosen** — **Chervil** (`chervil.ai` available; `.com` parked). *Still do:* register `chervil.ai` + `getchervil.com`, claim the `chervil-ai` GitHub org + social handles, and a formal USPTO/attorney clearance before launch.
- [x] **LICENSE** committed (MIT).
- [x] **README** with honest "alpha" status + BYO-key setup.
- [x] **SECURITY.md** / safety-model doc.
- [x] **CONTRIBUTING.md** with architecture + provider guide.
- [x] **Blog reframed** to "building in public" (vision + waitlist + watch/star), not "download now."
- [ ] **Register domain + handles** and make the repo public.

---

*Derived from the phase build notes (P1–P13). Items marked "not live-verified" there map directly onto P0/P1 here. The recurring blocker has been live verification, not code correctness — close that gap before the brand goes public.*
