# RFC 0003 — The Skill framework

- **Status:** Draft (foundation landed; UI generalization + 2nd skill pending)
- **Author:** Rod Trent (with Sprig)
- **Created:** 2026-06-22
- **Extracted from:** [RFC 0001](0001-interactive-lessons.md) (the learning vertical, shipped)

## Summary

Generalize the learning vertical into a reusable **Skill** abstraction so new
skills plug into the same pipeline — composer command → build → render → export/
publish — by adding **one registry entry**, not a new bespoke flow. Per RFC
0001's guidance, we **extracted** the contract from Learning's real shape rather
than designing it up front.

## The contract (`lib/skills.js`)

A **Skill** turns a user request into a structured, renderable artifact:

```
Skill {
  id, name, emoji, description,
  command,                         // composer trigger, e.g. '/learn'
  build({ input, level?, goals?, config }) -> Promise<artifact>   // provider.complete → normalize → validate
  toHtml(artifact, { reader? }) -> string                          // self-contained HTML (default + reader)
  summarize(artifact) -> { title, summary, count }                 // tab titles / publish previews
}
```

Registry helpers: `SKILLS`, `getSkill(id)`, and `matchCommand(text)` (parses a
leading `/command <input>` into `{ skill, input }`).

## Learning as the first skill

`learnSkill` wraps the existing functions — **behavior is unchanged**:
- `build` → `runBuildLesson` (two-phase plan→expand, in `lib/agent.js`)
- `toHtml` → `lessonToHtml` (default in-app player + `reader` swipe deck)
- `summarize` → title/summary + `cardCount`

`electron/main.js` now routes the build/export/publish IPC handlers through
`getSkill('learn')`, so the registry is **used by the real flow**, not
speculative. Validated end-to-end (build → render default + reader → command
parse) against a stubbed provider.

## How to add a new skill

1. Implement `build` / `toHtml` / `summarize` (a build prompt + an output schema
   with normalize/validate, like `lib/lesson.js`, and an HTML renderer like
   `lib/lessonHtml.js`).
2. Add the skill object to `SKILLS` in `lib/skills.js` with a unique `command`.
3. Wire the composer: a generic `matchCommand` dispatch + a toggle/picker (see
   "Pending" — today the renderer still hardcodes `/learn`).

Worked example — a "Quiz" skill would be: `{ id:'quiz', command:'/quiz',
build → a graded-questions artifact, toHtml → a quiz player, summarize → count }`
and one line in `SKILLS`.

## Pending (next slices)

- **Generic UI dispatch.** The renderer still hardcodes `/learn` + the 🎓 Learn
  toggle and calls `buildLesson` directly. Generalize to: `matchCommand` →
  dispatch any skill; a skill picker instead of one toggle.
- **A second skill** to truly validate the interface generalizes (the real test
  of an extracted abstraction). Candidates: quiz, study-guide, flashcard-deck.
- **Per-skill publish/export wiring** so the export menu + `/api/lessons` aren't
  lesson-specific (the website stores `lesson_json`; a generic `artifact_json` +
  `kind` would let it host any skill's output).

## Why now / why this shape

One vertical (Learning) proved the pipeline; the abstraction is the platform
payoff. Keeping `build`/`toHtml`/`summarize` minimal — and routing the real flow
through it before adding UI or a 2nd skill — avoids speculative framework design
while making the seam real.
