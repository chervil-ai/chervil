# Chervil — Capabilities & Monetization

> Working strategy doc. How Chervil grows new abilities, and where the money is.
> Status: direction agreed (2026-06-19); not yet built beyond bundled local
> capabilities (PDF / PowerPoint / Word / Excel export).

---

## The thesis

The value of an agentic browser isn't the model — it's what the agent can *do*.
Every new capability ("pull what it needs when it needs it") compounds: research,
compose, verify, operate a site, build a deck, export a file, reach a private data
source. The roadmap is therefore a **capability roadmap**, and the business is
built on top of it.

Two ways to add a capability:
1. **Pull from known/trusted resources** — the agent fetches what it needs at
   runtime (live web, a specific API, a connected data source).
2. **Invoke a tool** — a discrete ability the agent can call (export a .pptx,
   query a database, run a calculation).

Chervil already does both in primitive form: `web_search`/`web_fetch`,
`open_website`, the applet bridge, and **remote MCP servers (P11)**.

---

## Architecture: don't reinvent the plugin format

**Lean on MCP for external capabilities.** MCP (Model Context Protocol) is
becoming the industry standard for "give an agent new tools," and Chervil already
speaks it. For anything that lives outside the app — calendars, databases, SaaS,
proprietary data — an MCP server *is* the plugin. Building a proprietary plugin
format would fragment from the standard and duplicate effort.

**Add a thin local-capability interface for bundled tools.** Some capabilities
ship in the app and run locally (the export pipeline: PDF, PowerPoint, Word,
Excel). These don't need MCP; they need a small internal registry: a capability
declares a name, a description the model sees, an input schema, and a handler.
The export features are the first members of this registry.

So the capability layer is two-tier:

| Tier | For | Mechanism | Examples |
|------|-----|-----------|----------|
| **Local** | bundled, runs in-app | internal capability registry | PDF/PPTX/DOCX/XLSX export, calculators |
| **External** | third-party / your data | **MCP servers** (already supported) | calendar, DB, SaaS, premium data feeds |

Both surface to the model as tools, both pass through the same authority gate.

---

## Monetization: charge at the service boundary

The instinct — **free tool, paid plugins** — is right, but the *where* matters.

**The trap:** Chervil is open-source. Client-side plugin code is trivially
copyable, so you can't durably sell a plugin that runs entirely on the user's
machine — someone forks it or reimplements it in an afternoon.

**The fix:** charge for anything backed by **a service you host**, where the value
is the backend, not the copyable code:

- **Managed / keyless inference** — remove the BYO-API-key friction; users pay
  Chervil instead of wiring up Anthropic/OpenAI themselves.
- **Premium data sources & connectors** you operate (and pay for upstream).
- **Cloud-rendered / branded exports** — premium deck templates, brand kits,
  higher-fidelity documents generated server-side.
- **Sync, team workspaces, and closed-app Living-page refresh** (needs a server
  to run while the app is closed).
- **A capability marketplace** — third parties publish capabilities; Chervil takes
  a revenue share and provides billing, distribution, and the trust layer.

**Net model:** free, open-core client + free open/MCP/local plugins; **paid =
hosted capabilities + marketplace.** This mirrors Obsidian / Raycast / JetBrains,
adapted so the paid surface is the part that *can't* simply be copied.

---

## Execution control is the moat

A marketplace of agent capabilities is only adoptable if it's safe — and "safe"
is exactly what Chervil already positions around (see
[execution-control.md](execution-control.md)). Every capability is something the
agent can *do*, so more capabilities = more authority to govern. The deterministic
permission layer (the model proposes, the runtime disposes; hard gates on
money/credentials/destructive actions; opt-in scoping) becomes the feature that
makes a third-party capability ecosystem trustworthy. That's a moat competitors
bolting tools onto a chatbot won't have.

---

## Sequencing

1. **Bundled local capabilities** — *in progress.* PDF, PowerPoint, Word, Excel
   export. Proves the local-capability pattern (structured extraction → a
   generator library → a saved file).
2. **Formalize the capability registry** — a small interface so adding a local
   tool is declarative, and the model's tool list is generated from it.
3. **MCP-as-plugins polish** — discovery, one-click connect, per-capability
   permission UI, a curated directory of trusted MCP servers.
4. **Hosted paid tier** — managed inference + sync + premium exports. The first
   thing worth paying for; requires a backend.
5. **Marketplace** — third-party capabilities, billing, revenue share, and the
   sandboxing/permission model to make it safe. Largest effort; do last.

---

## Difficulty / risks

- **Local capability registry:** moderate — the export tools already follow the
  pattern; generalizing it is incremental.
- **MCP polish:** moderate — the client exists; the work is UX and trust.
- **Hosted tier:** real product + ops work (a backend, auth, billing, inference
  cost management). This is the first true "company" milestone.
- **Marketplace + sandboxing:** hard — securely running third-party capabilities
  is the execution-control problem at full difficulty. Don't rush it.
- **Don't paywall copyable local plugins** in an OSS app — it invites forks and
  resentment. Keep the client and open plugins free; put the wall at the service.

---

*This doc captures the agreed direction so the build can sequence toward it. The
near-term work is the local capability pattern (exports); the business case lives
at the hosted-service and marketplace layers, with execution-control as the moat.*
