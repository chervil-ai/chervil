# RFC 0001 — Interactive Lessons (the learning vertical)

- **Status:** Draft
- **Author:** Rod Trent (with Sprig)
- **Created:** 2026-06-22
- **Lead audience (decided):** self-learner
- **Interactivity bar for v1 (decided):** generative applets (not just quizzes)

## Summary

Make **learning** Chervil's flagship application. A learner asks for a topic;
Sprig composes a **Lesson** — a structured, interactive, media-rich, optionally
living document — that the learner works through in the app and can **publish to
a mobile-friendly, swipeable reader** ("TikTok for learning"). The lesson is the
keystone artifact; everything else (mobile, media, the eventual skill framework,
a Chrome funnel) is a surface over it.

This RFC specifies the **Lesson artifact**, the **generation pipeline**, the
**interactivity model**, the **media design** (and its security constraint), the
**in-app player**, and the **publish/mobile** path. It also explains why the
**skill framework** and **Chrome extension** are deliberately sequenced *after*
this, not before.

## Motivation

Chervil already turns a question into a composed, cited, sometimes-interactive
page. A lesson is the natural "long form" of that: composed knowledge with
**structure** (modules → cards), **progression** (concept → check → hands-on →
recall), and **interactivity** (applets). The same primitive — once it can be
*published* — becomes a shareable, swipeable mobile experience, which is the
growth loop. One bet (learning) exercises and proves the platform.

### Why not build the framework first

Chervil already has the *seeds* of a skill framework: agents
(`{persona, model, provider, mcp, starters}`), MCP support, and the applet
bridge. A framework designed before a real skill uses it will be wrong in
expensive ways. **We build Learning as a first-class, partly-hardcoded skill,
then extract the framework from what it actually needed** (Phase 3). The second
use case reveals the right abstraction; the first one just needs to ship.

## How this maps onto today's architecture

| Need | Existing primitive we build on |
|---|---|
| Lesson content | Composed pages (model-authored HTML, streamed, rendered in a sandboxed `srcdoc` iframe) |
| Interactivity | **Applet bridge** — `window.chervil.ask()` injected into every composed page (`CHERVIL_RUNTIME` in `src/renderer.js`; `runAppletAsk` in `lib/agent.js`) |
| Grouping / synthesis | **Spaces** — persistent topic workspaces Sprig can synthesize across |
| Freshness | **Living pages** — scheduled re-grounding + notify |
| Export | `runExtractSlides/Doc/Sheets` → pptx/docx/xlsx |
| Provider-agnostic generation | `lib/models/*` with `provider.complete()` |

A **Lesson is a structured Space**: modules of cards, where `applet` cards reuse
the bridge and `concept` cards are composed HTML.

## The Lesson artifact (implemented: `lib/lesson.js`)

A Lesson is consumed as a flat stream of **cards** grouped into **modules**. The
card is the unit you swipe on mobile, so each card is self-contained.

```
Lesson {
  schemaVersion, id, slug, title, subtitle, topic,
  level: 'beginner'|'intermediate'|'advanced',
  summary, objectives[], estMinutes, tags[],
  modules: Module[],
  sources: Source[],                 // citations from live grounding
  living: { enabled, lastGrounded },
  authorModel, createdAt, updatedAt   // provenance
}
Module { id, title, summary, cards: Card[] }
Card =
  | concept   { id, kind, title, html }                  // composed HTML; no <script>, no external <iframe>
  | media     { id, kind, title, provider:'youtube', videoId, caption, verified }
  | applet    { id, kind, title, prompt }                // generative widget; HTML composed at render time
  | check     { id, kind, title, question, options[], answerIndex, explanation }
  | flashcard { id, kind, front, back }
```

`lib/lesson.js` provides `normalizeLesson()` (coerces model output, **drops**
invalid cards/modules rather than throwing), `validateLesson()`, `cardCount()`,
and `youtubeId()` (resolves an id from any YouTube URL form). It is pure data —
no I/O, no rendering, no security surface.

**Key decision — applets are lazy.** An `applet` card stores only a
natural-language `prompt`. The actual widget HTML is composed **at render time**
by the existing page-composer (and runs against the applet bridge for live
data). This keeps lesson generation cheap and fast, and means applets
automatically inherit the sandbox and the bridge.

## Generation pipeline (implemented: `runBuildLesson` in `lib/agent.js`)

v1 is single-shot: `topic + level (+ goals)` → `provider.complete()` with
`LESSON_BUILD_SYSTEM` → JSON → `normalizeLesson` → `validateLesson`. The prompt
enforces learner-shaped sequencing (why-it-matters → concept → check → hands-on
→ recall), 2–5 modules, ≥1 applet and ≥1 check per module, and live grounding
with sources when the topic needs current facts.

**Phase 1.5 upgrade:** reuse the **Deep Dive two-phase** pipeline — plan the
syllabus first (outline of modules/objectives), then expand each module
(optionally in parallel) — for depth and to keep any single completion within
token limits.

## Interactivity (applets)

Reuse the bridge as-is. A rendered `applet` card asks the composer to build a
widget from its `prompt`; the widget calls `await window.chervil.ask(...)` for
live data exactly like today's composed-page applets. **No new security
surface** — applets already run sandboxed with a single trusted bridge.

`check` and `flashcard` are *structured* interactions (not free applets) so the
mobile reader can render and grade them natively and track progress without
running arbitrary HTML.

## Media (#5) — design and the security constraint

**Constraint (verified in code):** composed pages render in a `srcdoc` iframe
with `sandbox="allow-scripts allow-popups"` (no `allow-same-origin`), inheriting
a CSP whose `child-src` is `'self' blob:`. A raw `<iframe src="youtube…">`:
1. is blocked by CSP (`child-src`/`frame-src` doesn't allow YouTube), and
2. even if allowed, a frame nested in a no-`allow-same-origin` sandbox runs in an
   opaque origin, where the YouTube player typically fails.

Loosening the page-frame sandbox to `allow-same-origin` would let
**model-generated HTML reach the app's origin** — an unacceptable regression.

**Recommended approach (keeps isolation intact):** media is **not** an external
iframe emitted by the model. Instead:
- The model emits only a **`media` card** (provider + `videoId` + caption) — a
  data marker, never raw embed HTML. Already enforced by the schema and prompt.
- The **trusted layer renders playback.** Options, in order of preference:
  - **A. Click-to-play facade (ship first):** the player/reader shows the video
    thumbnail (`https://i.ytimg.com/vi/<id>/hqdefault.jpg`) + a play button.
    Clicking opens the video in Chervil's existing **`<webview>`** (real-site
    surface, already permission-boxed) or a dedicated player pane. Zero sandbox
    change, fully on-brand with "real web when the real web is the point."
  - **B. Trusted inline player (later):** Chervil overlays a *separate*,
    properly-attributed media iframe (not nested in the untrusted page) over the
    card's placeholder, with scroll/position sync. More work; revisit if inline
    autoplay-in-flow proves important.
- **Verification:** model-suggested `videoId`s are **untrusted** (`verified:false`
  in the schema). Before showing a media card we confirm the video exists via
  **YouTube oEmbed** (`https://www.youtube.com/oembed?url=…&format=json`) or a
  grounded search, and only then set `verified:true`. Unverified media cards are
  hidden or shown as "find a video" rather than risking a dead/wrong embed.

> **DECIDED (2026-06-22):** approach **A (facade → webview/player pane)** is
> approved for v1. The sandbox/CSP are unchanged; the model never emits raw
> embed HTML. Phase 0.5 implements oEmbed verification + the facade.

## In-app lesson player (Phase 1)

A new view (alongside the composed-page frame and the `<webview>`): a left rail
of modules/cards + a card canvas. `concept`/`applet` cards render through the
existing composed-page path (so applets + bridge "just work"); `media` cards use
the facade; `check`/`flashcard` render natively with progress tracking. Lessons
persist in app state next to `spaces`/`library` (`chervil-state.json`).

## Publish + mobile consumption (#4)

**Creation stays on desktop; consumption goes everywhere.** Publishing a lesson
emits a **portable bundle** (the Lesson JSON + inlined `concept` HTML +
pre-composed applet HTML + media markers). The first consumption surface is a
**web PWA**, not a native app:
- A shared link opens a **swipeable, thumb-up/down reader** — one card per
  screen, native `check`/`flashcard` grading, facade media, applets running in
  the same sandboxed-iframe + bridge model (the bridge's `ask` can be a
  read-only/no-op or a hosted endpoint in the published context).
- This doubles as the **growth loop**: every shared lesson is a Chervil ad with a
  "make your own / get the app" CTA.

A native mobile app earns its keep only later (offline, push, store presence).

## Skill framework (#1) — Phase 3, by extraction

Once Learning works, generalize: a **skill** = an agent persona + a structured
output contract (like the Lesson schema) + render/consume handlers + optional
applet/MCP wiring. Document the contract so a second skill (e.g. a "research
brief" or "recipe") plugs into the same generate → normalize → render → publish
pipeline. We extract this from Learning's real shape rather than guessing it now.

## Chrome extension (#3) — Phase 4, a funnel

Defer. With shareable lessons in hand, the extension becomes "ask about this
page / save it → see a Chervil lesson preview → get the full app for authoring &
applets." A funnel needs a destination first.

## Phasing

| Phase | Scope | Status |
|---|---|---|
| **0** | Lesson schema (`lib/lesson.js`) + `runBuildLesson` + this RFC | **done (this change)** |
| **0.5** | Media: oEmbed verification + click-to-play facade (#5) | approved (facade); next |
| **1** | In-app lesson player; persist lessons; render concept/applet/check/flashcard | next |
| **1.5** | Two-phase (syllabus → modules) generation for depth | |
| **2** | Publish bundle + mobile PWA swipe reader (#4) | |
| **3** | Extract the skill framework (#1) | |
| **4** | Chrome extension funnel (#3) | |

## Open questions / decisions

1. ~~**Media approach (blocking 0.5):** approve facade → `<webview>`/player pane (A)?~~ **Resolved 2026-06-22: facade approved.**
2. **Lesson storage:** new top-level `lessons[]` in `chervil-state.json`, or model
   each lesson as a specialized Space? (Lean: dedicated `lessons[]`, with a link
   to a backing Space for synthesis.)
3. **Applet pre-composition at publish:** compose applet HTML once at publish
   time (portable, static) vs. require the bridge at consume time? (Lean:
   pre-compose for portability; degrade gracefully where live data isn't
   available off-app.)
4. **Progress/spaced-repetition:** track per-card mastery now (enables review &
   the swipe loop) or defer? (Lean: track minimal per-card state from Phase 1.)
5. **Provider floor:** lesson building needs `provider.complete()`. Confirm the
   UX when a learner is on Ollama/local (smaller models) — degrade or warn?
