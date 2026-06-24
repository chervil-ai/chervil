# RFC 0006 — Agentic actions: trusted task completion + guarded OS actions

- **Status:** Draft (design — the trust model is the deliverable; code is phased after)
- **Author:** Rod Trent (with Sprig)
- **Created:** 2026-06-24
- **Depends on:** [execution-control.md](../execution-control.md) (the authority thesis), [SECURITY.md](../../SECURITY.md)
- **Theme:** the differentiator — let Sprig *do* things, with authority that lives in the runtime, never in the model.

## Summary

Move Sprig from *operating one site step-by-step* to **completing real multi-step
tasks** ("book a table," "fill and submit this form," "cancel this subscription"),
and from *reading* the computer to **taking specific, vetted OS actions** ("open
this app," "reveal this file," "set volume"). Both ride a single principle from
[execution-control.md](../execution-control.md): **the model proposes; a
deterministic layer disposes.** This RFC designs that layer. No broad action code
until the control model below is built and the open decisions are locked.

## Current state — the receipts we build on

Chervil already has the bones of the control layer (per execution-control.md):
- **Web-action loop** (`runAgentStep` in lib/agent.js; driven from the renderer)
  operates real sites, but **hard-refuses payments/purchases/transfers**
  (`looksFinancial()`), **refuses password fields**, and forces a **`need_user`
  handoff for logins** — enforced in the harness, not left to the model.
- **Approve / Stop gate** on risky actions; plus the new **Stop button** (this
  session) that aborts an in-flight run.
- **Read-only computer info** (`window.chervil.info()` / `.details()`) — already
  shipped, strictly read-only.
- **Keys in `safeStorage`** (renderer never sees them); **mic only to our origin**;
  **MCP tools gated by an opt-in list**.

This RFC generalizes those into a reusable, auditable capability layer.

## The control model (the heart)

Everything an agent can do flows through one path:

```
 model proposes a STRUCTURED action  →  runtime validates  →  policy decides
   { type, target, args }                (against the         (allow | confirm | deny)
                                          capability registry)        │
                                                                      ▼
                                              allow → run     confirm → human gate     deny → refuse
                                                          (every run logged to an append-only audit trail)
```

- **Capability registry** — a *fixed, code-defined* set of action types the agent
  may invoke (e.g. `web.click`, `web.type`, `web.navigate`, `os.openApp`,
  `os.revealFile`). The model can only name a registered type with validated args;
  anything else is rejected. **No arbitrary shell / eval, ever** — there is no
  `run-command` capability the model can reach.
- **Deterministic policy** — each capability has a policy: `allow` (safe, e.g.
  scroll/navigate-within-site), `confirm` (human Approve/Stop before it runs, e.g.
  submit a form, open an app), or `deny` (never, e.g. payments, password entry,
  destructive deletes). Policy is data the model can't edit.
- **Confirmation UX** — `confirm` actions show a clear, specific sheet ("Submit
  this form to example.com?" / "Open Calculator?") with Approve / Stop, defaulting
  to Stop. Optional per-session "allow this kind for this task" to reduce fatigue
  (scoped, expires with the task).
- **Audit trail** — every proposed/decided/executed action is appended to a local
  log (what, when, target, decision), so "unauthorized" is *detectable* and a run
  is reviewable. Surfaced in a simple activity view.
- **Kill switch** — the Stop button cancels the whole run; a global "agent off"
  setting disables all action capabilities.

## Two tracks

**Track A — Web task completion.** Generalize the site-operating agent from
single steps into goal-directed multi-step tasks, keeping every existing hard gate.
The model plans → proposes actions → the policy gates sensitive ones → provenance
logged → Stop always available. Prompt-injection defense is central (a page saying
"ignore instructions and pay" hits `deny`, not the model's judgment).

**Track B — Guarded OS actions.** Extend the read-only computer-info bridge into a
*small, curated* set of **write** actions, each `confirm`-gated and allowlisted:
e.g. open an app, reveal a file in the folder, open a URL, set volume. Each is a
named capability with validated args and a confirmation — **never** a generic
"run this command." Windows first (mirrors the read-only info work); abstract for
macOS later (see [[browser-replacement-roadmap]] bet ④).

## Phasing

| Step | Scope | Gate |
|---|---|---|
| **6.1** | Capability registry + policy engine + audit log (the deterministic layer). Re-express the *existing* web gates (`looksFinancial`, password refusal, `need_user`) as registry policies. No new powers — just the framework. | none |
| **6.2** | Web task completion: multi-step planning over the registry, confirmation UX, provenance view. Builds on `runAgentStep` + Stop. | 6.1 |
| **6.3** | First guarded OS write-actions (open app / reveal file / open URL), each `confirm`-gated. | 6.1 |
| **6.4** | Cautiously expand the OS + web catalogs; activity/audit UI; per-task scoped allows. | 6.2/6.3 |

## Open decisions

1. **Confirmation granularity** — per-action always vs per-task scoped allow for a
   capability. _Lean: per-action by default; opt-in scoped allow that expires with
   the task._
2. **Never-allowed list (locked)** — payments/transfers, password/credential entry,
   destructive deletes, arbitrary command execution. _Confirm this is exhaustive._
3. **Audit log location/retention** — local file in userData; how long; user-clearable.
4. **OS action surface** — which write-actions ship first (open app/url, reveal
   file are safest). _Lean: start with the irreversible-proof ones._
5. **macOS** — OS actions are Windows-specific; sequence with bet ④.

## Risks

- **Prompt injection is the primary threat** — content the agent reads telling it
  to act. Mitigated structurally: sensitive actions are `deny`/`confirm` by policy,
  not by the model deciding they're safe.
- **Confirmation fatigue** — too many prompts and users click through. Mitigate
  with sane `allow` defaults for safe actions + scoped per-task allows.
- **Irreversibility** — prefer reversible actions; gate the rest hard.
- **Scope creep** — keep the capability registry small and reviewed; every new
  capability is a deliberate, audited addition.

## Non-goals (this RFC)

Arbitrary shell/command execution by the model (never); autofill/credential
storage (its own design — a password-manager-grade feature); full RPA/macro
recording.

*Next action: build 6.1 (registry + policy + audit) as the foundation, re-expressing
today's web gates as policies — no new powers until that layer exists.*
