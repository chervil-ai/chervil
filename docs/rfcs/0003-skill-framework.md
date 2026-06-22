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

## Done since the foundation

- **A second skill — Quiz** (`lib/quiz.js`, `lib/quizHtml.js`, `runBuildQuiz`,
  `quizSkill`): a graded multiple-choice assessment built via `/quiz <topic>`.
  It uses the same `build`/`toHtml`/`summarize` contract — **validating that the
  abstraction generalizes** beyond Lessons (the real test of an extracted
  abstraction). Verified end-to-end through the registry.
- **Generic dispatch:** a `chervil:build-skill` IPC ({skill,input,level,goals} →
  `getSkill().build` → optional `enrich` → `toHtml`), so adding a skill needs no
  bespoke IPC. The renderer dispatches `/quiz` through it.

## Done — Phase 3 complete

- **1a — Learn migrated onto `build-skill`:** media verify moved to
  `lib/lessonMedia.js` and wired as Learn's `enrich` hook; the lesson-specific
  `build-lesson` IPC removed. All skills now share one build path.
- **1b — skill picker UI:** 🎓 Learn / ❓ Quiz composer toggles (a `skillMode`
  picker, mutually exclusive with Deep Dive); `/learn` + `/quiz` commands too.
- **1c — publish/export any skill:** the app sends `{artifact, kind, html}`;
  `/api/lessons` stores a `kind` column and serves any artifact's HTML. Verified
  end-to-end: a quiz publishes to getchervil.com (kind=quiz) and serves at
  `/learn/<id>`.

## Later (optional)

- A richer skill picker (dropdown) once there are >2–3 skills.
- More skills (study-guide, flashcard-deck) — now just a registry entry + a
  build prompt + a renderer.

## Why now / why this shape

One vertical (Learning) proved the pipeline; the abstraction is the platform
payoff. Keeping `build`/`toHtml`/`summarize` minimal — and routing the real flow
through it before adding UI or a 2nd skill — avoids speculative framework design
while making the seam real.
