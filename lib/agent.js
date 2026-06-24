'use strict';

const crypto = require('crypto');
const { getProvider } = require('./models');
const { normalizeLesson, validateLesson, cardCount, countKind } = require('./lesson');
const { normalizeQuiz, validateQuiz, questionCount } = require('./quiz');

/**
 * Run one turn of the Chervil agent.
 *
 * @param {object} opts
 * @param {string} opts.query       The user's message.
 * @param {Array}  opts.history     Prior turns: [{ role, content }].
 * @param {(s:string)=>void} opts.onStatus  Progress updates for the UI.
 * @param {(d:string)=>void} opts.onText    Streamed HTML text deltas.
 * @param {string|null} [opts.pageContext]  HTML of the page being viewed (for refinement).
 * @param {boolean} [opts.allowNavigate]    Allow open_website (false = compose-only).
 * @param {string|null} [opts.refineMode]   'auto' | 'force' | null.
 * @returns {Promise<object>} A 'page' or 'navigate' result.
 */
async function runAgent({
  query,
  history = [],
  onStatus = () => {},
  onText = () => {},
  pageContext = null,
  allowNavigate = true,
  refineMode = null,
  spaceContext = null,
  deep = false,
  verify = false,
  profile = null,
  attachments = [],
  mcpServers = [],
  agent = null,
  signal = null,
  config = {},
}) {
  if (!query || !String(query).trim()) {
    throw new Error('Empty query.');
  }

  const provider = getProvider(config);
  return provider.run({
    query: String(query).trim(),
    history,
    onStatus,
    onText,
    pageContext,
    allowNavigate,
    refineMode,
    spaceContext,
    deep,
    verify,
    profile,
    attachments,
    mcpServers,
    agent,
    signal,
  });
}

/**
 * Answer a live data request from an interactive applet (window.chervil.ask).
 * Returns { text, sources } — raw data the page renders itself.
 */
async function runAppletAsk({ prompt, config = {} }) {
  if (!prompt || !String(prompt).trim()) {
    throw new Error('Empty applet request.');
  }
  const provider = getProvider(config);
  if (typeof provider.quickAsk !== 'function') {
    throw new Error('This provider does not support applet requests.');
  }
  return provider.quickAsk({ prompt: String(prompt).trim() });
}

/** List the models available for the configured provider (free metadata call). */
async function runListModels({ config = {} }) {
  const provider = getProvider(config);
  if (typeof provider.listModels !== 'function') return [];
  return provider.listModels();
}

// --- Web-agent loop: decide the next action on a live site --------------------

const AGENT_SYSTEM = `You are Sprig, an agent operating a real website inside the user's browser. You are given the user's TASK, the current page (URL, title, visible TEXT, and a numbered list of interactive ELEMENTS), and the actions taken so far. Decide the SINGLE next action.

Reply with ONLY a minified JSON object — no prose, no code fences:
{"action":"click|type|submit|navigate|scroll|finish|need_user","index":<element number for click/type/submit>,"value":"<text to type, full url for navigate, or 'up'/'down' for scroll>","reason":"<one short, user-facing sentence about this step>","risky":<true if it submits a form, posts, sends, logs in, buys, or otherwise changes server state>}

Rules:
- If a PLAN is given, follow it as a guide — but adapt to what the page actually shows; skip or reorder steps as reality requires.
- Prefer reading and navigating to accomplish the task. For searches, "type" into the search box then "submit" it (or "click" the search button).
- Set "risky":true for anything that submits/sends/posts/buys/logs in/changes an account.
- NEVER try to enter a password or payment/card details, complete a purchase, place an order, or send money. Instead return {"action":"need_user","reason":"<what the user must do themselves, e.g. log in or complete payment>"}.
- When the task is done (or you've gathered the answer), return {"action":"finish","reason":"<short summary of what you found or did>"}.
- Choose elements by their [number]. Keep "reason" short and friendly.`;

// Up-front planning: a short, high-level plan before the act loop. Improves
// multi-step task completion and shows the user what Sprig intends (RFC 0006 6.2).
const AGENT_PLAN_SYSTEM = `You are Sprig, planning how to accomplish a TASK on the current website. Output ONLY a minified JSON array of 2–6 short step strings (each a brief imperative like "Search for X" or "Open the first result"). No prose, no code fences. Keep it high-level — you'll choose concrete clicks step by step. Never plan to enter passwords/payment details or complete a purchase; those are handed to the user.`;

// Tolerant JSON-array parse (strips code fences / surrounding prose).
function parseJsonArray(text) {
  if (!text) return null;
  let s = String(text).trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const i = s.indexOf('['); const j = s.lastIndexOf(']');
  if (i >= 0 && j > i) s = s.slice(i, j + 1);
  try { const a = JSON.parse(s); return Array.isArray(a) ? a : null; } catch { return null; }
}

async function runAgentPlan({ task, pageState = {}, config = {} }) {
  const provider = getProvider(config);
  if (typeof provider.complete !== 'function') return [];
  const prompt = `TASK: ${task}

STARTING PAGE:
URL: ${pageState.url || ''}
Title: ${pageState.title || ''}
TEXT: ${String(pageState.text || '').slice(0, 1500)}

Return the plan as a JSON array of short steps.`;
  try {
    const arr = parseJsonArray(await provider.complete({ system: AGENT_PLAN_SYSTEM, prompt, maxTokens: 400 }));
    return Array.isArray(arr) ? arr.map((s) => String(s)).filter(Boolean).slice(0, 8) : [];
  } catch { return []; }
}

async function runAgentStep({ task, pageState = {}, steps = [], plan = [], config = {} }) {
  const provider = getProvider(config);
  if (typeof provider.complete !== 'function') {
    throw new Error('This provider does not support agent actions.');
  }
  const planStr = (Array.isArray(plan) && plan.length)
    ? plan.map((p, i) => `${i + 1}. ${p}`).join('\n')
    : '';
  const els = (pageState.elements || [])
    .map((e) => `[${e.i}] ${e.tag}${e.type ? '/' + e.type : ''} "${e.label}"${e.href ? ' -> ' + e.href : ''}`)
    .join('\n');
  const history = steps.length
    ? steps.map((s, i) => `${i + 1}. ${s.action}${s.index != null ? ' #' + s.index : ''}${s.value ? ' "' + s.value + '"' : ''} — ${s.reason || ''}`).join('\n')
    : '(none yet)';
  const prompt = `TASK: ${task}
${planStr ? `\nPLAN:\n${planStr}\n` : ''}
ACTIONS SO FAR:
${history}

CURRENT PAGE:
URL: ${pageState.url || ''}
Title: ${pageState.title || ''}
TEXT: ${String(pageState.text || '').slice(0, 2500)}

ELEMENTS:
${els || '(none found)'}

Return the next action as JSON.`;

  const text = await provider.complete({ system: AGENT_SYSTEM, prompt, maxTokens: 700 });
  const action = parseJsonObject(text);
  if (!action || !action.action) {
    throw new Error('Sprig returned an unreadable action.');
  }
  return action;
}

function parseJsonObject(text) {
  if (!text) return null;
  let t = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const m = t.match(/\{[\s\S]*\}/);
  if (m) t = m[0];
  try { return JSON.parse(t); } catch { return null; }
}

// --- Slide extraction for PowerPoint (.pptx) export -------------------------

const SLIDES_EXTRACT_SYSTEM = `You convert a web page into a presentation deck. Output ONLY minified JSON: an array of 6–12 slide objects, each {"title": string, "bullets": string[], "notes": string}. "title" is a short slide heading. "bullets" are 2–6 concise plain-text points (no markdown, no leading symbols). "notes" is a 2–4 sentence speaker script for that slide. Make the first slide a title/overview slide. Return the JSON array only — no prose, no code fences.`;

/** Turn a composed page's HTML into structured slides (title/bullets/notes) for .pptx export. */
async function runExtractSlides({ html, title = '', config = {} }) {
  const provider = getProvider(config);
  if (typeof provider.complete !== 'function') {
    throw new Error('This provider can’t build slide decks — switch to Claude in Settings.');
  }
  const prompt = `Turn this page into presentation slides with speaker notes. Return ONLY the JSON array.\n\nTITLE: ${title}\n\nPAGE HTML:\n${String(html || '').slice(0, 20000)}`;
  const text = await provider.complete({ system: SLIDES_EXTRACT_SYSTEM, prompt, maxTokens: 4000 });
  const slides = parseJsonArray(text);
  if (!Array.isArray(slides) || !slides.length) {
    throw new Error('Couldn’t turn this page into slides.');
  }
  return slides.map((s) => ({
    title: String((s && s.title) || '').slice(0, 200),
    bullets: Array.isArray(s && s.bullets) ? s.bullets.map((b) => String(b)).filter(Boolean).slice(0, 8) : [],
    notes: String((s && s.notes) || ''),
  }));
}

function parseJsonArray(text) {
  if (!text) return null;
  let t = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const m = t.match(/\[[\s\S]*\]/);
  if (m) t = m[0];
  try { return JSON.parse(t); } catch { return null; }
}

// --- Word (.docx) extraction ------------------------------------------------

const DOC_EXTRACT_SYSTEM = `You convert a web page into a Word document. Output ONLY minified JSON: {"title": string, "sections": [{"heading": string, "paragraphs": string[]}]}. "title" is the document title. Each section has a short "heading" and 1–5 plain-text "paragraphs" (no markdown). Cover the page's substance faithfully. JSON object only — no prose, no code fences.`;

/** Turn a composed page's HTML into a structured document (title + sections) for .docx export. */
async function runExtractDoc({ html, title = '', config = {} }) {
  const provider = getProvider(config);
  if (typeof provider.complete !== 'function') {
    throw new Error('This provider can’t build Word docs — switch to Claude in Settings.');
  }
  const prompt = `Turn this page into a Word document. Return ONLY the JSON object.\n\nTITLE: ${title}\n\nPAGE HTML:\n${String(html || '').slice(0, 20000)}`;
  const text = await provider.complete({ system: DOC_EXTRACT_SYSTEM, prompt, maxTokens: 4000 });
  const doc = parseJsonObject(text);
  if (!doc || !Array.isArray(doc.sections)) {
    throw new Error('Couldn’t turn this page into a document.');
  }
  return {
    title: String(doc.title || title || 'Document'),
    sections: doc.sections.map((s) => ({
      heading: String((s && s.heading) || ''),
      paragraphs: Array.isArray(s && s.paragraphs) ? s.paragraphs.map((p) => String(p)).filter(Boolean) : [],
    })),
  };
}

// --- Excel (.xlsx) extraction -----------------------------------------------

const SHEETS_EXTRACT_SYSTEM = `You extract structured/tabular data from a web page into spreadsheet sheets. Output ONLY minified JSON: {"sheets": [{"name": string, "columns": string[], "rows": (string|number)[][]}]}. Each row's length should match columns. If the page has clear tables, reproduce them; if it has no real tabular data, make one sheet of key facts with columns like ["Item","Detail"]. JSON object only — no prose, no code fences.`;

/** Turn a composed page's HTML into spreadsheet sheets (columns + rows) for .xlsx export. */
async function runExtractSheets({ html, title = '', config = {} }) {
  const provider = getProvider(config);
  if (typeof provider.complete !== 'function') {
    throw new Error('This provider can’t build spreadsheets — switch to Claude in Settings.');
  }
  const prompt = `Extract this page's data into spreadsheet sheets. Return ONLY the JSON object.\n\nTITLE: ${title}\n\nPAGE HTML:\n${String(html || '').slice(0, 20000)}`;
  const text = await provider.complete({ system: SHEETS_EXTRACT_SYSTEM, prompt, maxTokens: 4000 });
  const data = parseJsonObject(text);
  if (!data || !Array.isArray(data.sheets) || !data.sheets.length) {
    throw new Error('Couldn’t extract a spreadsheet from this page.');
  }
  return data.sheets.map((sh, i) => ({
    name: String((sh && sh.name) || `Sheet${i + 1}`).slice(0, 31), // Excel sheet-name limit
    columns: Array.isArray(sh && sh.columns) ? sh.columns.map((c) => String(c)) : [],
    rows: Array.isArray(sh && sh.rows) ? sh.rows.map((r) => (Array.isArray(r) ? r : [r])) : [],
  }));
}

// --- Synthesize a reusable Agent from a prompt session ----------------------

const AGENT_SYNTH_SYSTEM = `You distill a user's session with Sprig (their prompts and what Sprig produced) into a reusable Agent persona that the user — or someone they share it with — could activate later. Output ONLY minified JSON: {"name": string, "description": string, "persona": string, "starters": string[]}.
- "name": a short human title for the agent (2–4 words), no quotes.
- "description": one concise line (under 140 chars) summarizing what the agent is for.
- "persona": the agent's system instructions, written in the second person ("You are …"). Capture the recurring intent, domain, voice, priorities, and any rules implied by the session. Generalize: describe the KIND of work and how to do it well, not the one-off specifics of this session. 4–10 sentences.
- "starters": 2–5 short, imperative example prompts representative of what this agent does.
Return the JSON object only — no prose, no code fences.`;

/** Turn a transcript of a prompt session into a reusable agent (name/description/persona/starters). */
async function runSynthesizeAgent({ session = '', config = {} }) {
  const provider = getProvider(config);
  if (typeof provider.complete !== 'function') {
    throw new Error('This provider can’t synthesize agents — switch to Claude in Settings.');
  }
  const prompt = `Distill this session into a reusable Agent. Return ONLY the JSON object.\n\nSESSION:\n${String(session || '').slice(0, 12000)}`;
  const text = await provider.complete({ system: AGENT_SYNTH_SYSTEM, prompt, maxTokens: 1200 });
  const obj = parseJsonObject(text);
  if (!obj || !obj.persona) {
    throw new Error('Couldn’t synthesize an agent from this session.');
  }
  return {
    name: String(obj.name || '').slice(0, 80),
    description: String(obj.description || '').slice(0, 300),
    persona: String(obj.persona || '').trim(),
    starters: Array.isArray(obj.starters) ? obj.starters.map((s) => String(s)).filter(Boolean).slice(0, 5) : [],
  };
}

// --- Learning vertical: build an interactive Lesson from a topic ------------
// See docs/rfcs/0001-interactive-lessons.md. Sprig turns a topic into a
// structured Lesson (modules of swipeable cards). Generation is TWO-PHASE:
//   1. plan a syllabus (modules + objectives) — small and fast;
//   2. expand each module into cards in parallel — each its own bounded
//      completion, so there's no single giant response to truncate.
// Interactive cards reuse the existing applet bridge: an `applet` card carries a
// natural-language prompt and the page-composer builds the widget HTML at render
// time. Output is normalized + validated against lib/lesson.js. If planning
// fails, we fall back to a single-shot build.

// Shared card vocabulary, embedded in both the single-shot and per-module prompts
// so the two can't drift.
const CARD_SPEC = `A CARD is one of:
- {"kind":"concept","title":string,"html":string} — a self-contained explanation. html is clean semantic HTML (h2/h3/p/ul/strong/code/figure). Inline styles allowed; no <script>, no external <iframe>. Keep each concept card to one idea.
- {"kind":"media","title":string,"videoId":string,"caption":string} — ONLY if you are confident a specific YouTube video exists; videoId is the 11-char id. If unsure, omit the card rather than guessing.
- {"kind":"applet","title":string,"prompt":string} — an interactive widget to build (a simulator, calculator, diagram, sorter, quiz game, flashcard drill). prompt fully describes what the learner can do and what it should compute/show. Favor these for "hands-on" moments.
- {"kind":"check","title":string,"question":string,"options":string[],"answerIndex":number,"explanation":string} — a multiple-choice check for understanding (2–5 options; answerIndex is 0-based).
- {"kind":"flashcard","front":string,"back":string} — a recall prompt and its answer.`;

// Phase 1: plan the syllabus only (no card content).
const LESSON_PLAN_SYSTEM = `You are Sprig, planning the syllabus for a self-paced, interactive lesson for an independent learner (not a classroom). Output ONLY minified JSON — no prose, no code fences:

{"title":string,"subtitle":string,"level":"beginner|intermediate|advanced","summary":string,"objectives":string[],"tags":string[],"modules":[{"title":string,"summary":string,"objectives":string[]}]}

Rules:
- 2–5 modules; each has a clear title, a one-line summary, and 1–3 concrete objectives.
- Sequence modules so they build on each other; open with motivation/fundamentals.
- objectives are concrete ("explain…", "calculate…", "build…").
- Plan the OUTLINE only — do not write card content here.
- Return the JSON object only.`;

// Phase 2: expand a single module into cards.
const MODULE_EXPAND_SYSTEM = `You are Sprig, expanding ONE module of a lesson into interactive cards for an independent learner. Output ONLY minified JSON — no prose, no code fences:

{"cards":[CARD,...]}

${CARD_SPEC}

Rules:
- 3–8 cards. Sequence: concept → check → hands-on applet → recall. Mix card kinds; don't make every card a concept.
- Include at least one applet and at least one check.
- Stay within THIS module's scope and objectives; don't repeat other modules.
- Return the JSON object only.`;

// Fallback: build the whole lesson in one shot (used only if planning fails).
const LESSON_BUILD_SYSTEM = `You are Sprig, building a self-paced, interactive lesson for an independent learner (not a classroom). Turn the learner's TOPIC into a structured lesson and output ONLY minified JSON — no prose, no code fences — matching this shape:

{"title":string,"subtitle":string,"level":"beginner|intermediate|advanced","summary":string,"objectives":string[],"tags":string[],"modules":[{"title":string,"summary":string,"cards":[CARD,...]}],"sources":[{"title":string,"url":string}]}

${CARD_SPEC}

Rules:
- Sequence for a learner: open with why-it-matters, build concept → check → hands-on applet, and close each module with recall. Mix card kinds.
- 2–5 modules; 3–8 cards per module. Include at least one applet and one check per module.
- objectives are concrete ("explain…", "calculate…", "build…").
- Return the JSON object only.`;

async function planSyllabus(provider, topic, level, goals) {
  const prompt = `Plan the syllabus. Return ONLY the JSON object.

TOPIC: ${topic}
LEVEL: ${level}${goals ? `\nLEARNER GOALS: ${goals}` : ''}`;
  return parseJsonObject(await provider.complete({ system: LESSON_PLAN_SYSTEM, prompt, maxTokens: 2000 }));
}

async function expandModule(provider, lessonCtx, mod) {
  const prompt = `Expand this module into cards. Return ONLY the JSON object.

LESSON: ${lessonCtx.title} — ${lessonCtx.summary} (level: ${lessonCtx.level})
MODULE: ${(mod && mod.title) || ''}
MODULE SUMMARY: ${(mod && mod.summary) || ''}
MODULE OBJECTIVES: ${(mod && Array.isArray(mod.objectives) ? mod.objectives.join('; ') : '')}`;
  const obj = parseJsonObject(await provider.complete({ system: MODULE_EXPAND_SYSTEM, prompt, maxTokens: 4000 }));
  return obj && Array.isArray(obj.cards) ? obj.cards : [];
}

/**
 * Build an interactive Lesson from a topic (two-phase: plan → expand modules).
 * @param {object} opts
 * @param {string} opts.topic
 * @param {string} [opts.level]   'beginner' | 'intermediate' | 'advanced'
 * @param {string} [opts.goals]   optional free-text on what the learner wants.
 * @param {object} [opts.config]  provider config (same shape as runAgent).
 * @returns {Promise<import('./lesson').Lesson>}
 */
async function runBuildLesson({ topic, level = 'beginner', goals = '', config = {} }) {
  if (!topic || !String(topic).trim()) throw new Error('Empty topic.');
  const provider = getProvider(config);
  if (typeof provider.complete !== 'function') {
    throw new Error('This provider can’t build lessons — switch to Claude in Settings.');
  }
  const t = String(topic).trim();
  const g = String(goals || '').trim();

  // Phase 1: plan. If it yields modules, Phase 2: expand them in parallel.
  let raw = null;
  let plan = null;
  try { plan = await planSyllabus(provider, t, level, g); } catch { plan = null; }
  if (plan && Array.isArray(plan.modules) && plan.modules.length) {
    const ctx = { title: (plan.title && String(plan.title)) || t, level, summary: String(plan.summary || '') };
    const mods = plan.modules.slice(0, 5);
    const expanded = await Promise.all(mods.map(async (m) => ({
      title: m && m.title,
      summary: m && m.summary,
      cards: await expandModule(provider, ctx, m).catch(() => []),
    })));
    raw = { ...plan, topic: t, level, modules: expanded };
  } else {
    // Fallback: single-shot build.
    const prompt = `Build an interactive lesson. Return ONLY the JSON object.

TOPIC: ${t}
LEVEL: ${level}${g ? `\nLEARNER GOALS: ${g}` : ''}`;
    raw = parseJsonObject(await provider.complete({ system: LESSON_BUILD_SYSTEM, prompt, maxTokens: 8000 }));
  }
  if (!raw) throw new Error('Couldn’t build a lesson — the response was incomplete or not valid JSON. Try again or narrow the topic.');

  const now = new Date().toISOString();
  const lesson = normalizeLesson({ ...raw, topic: t, level }, {
    id: 'lesson_' + crypto.randomUUID(),
    // Provenance: prefer the concrete model id; falls back to the provider name.
    // When this is wired to the UI, the renderer should pass config.model so the
    // exact model is recorded (providerConfigFrom does not inject it today).
    authorModel: (config && (config.model || config.provider)) || null,
    createdAt: now,
    updatedAt: now,
  });
  const { ok, errors } = validateLesson(lesson);
  if (!ok) throw new Error('Built an invalid lesson: ' + errors.join('; '));
  // Guard against a response that collapsed to near-empty after malformed cards
  // were dropped, or that lacks the hands-on/recall structure a lesson needs.
  if (cardCount(lesson) < 3 || !countKind(lesson, 'applet') || !countKind(lesson, 'check')) {
    throw new Error('The model returned an incomplete lesson (too few cards, or missing an interactive or check card). Try again or rephrase the topic.');
  }
  return lesson;
}

// --- Skill: Quiz — a graded multiple-choice assessment (RFC 0003) -----------

const QUIZ_BUILD_SYSTEM = `You are Sprig, building a multiple-choice quiz on a TOPIC. Output ONLY minified JSON — no prose, no code fences:

{"title":string,"level":"beginner|intermediate|advanced","summary":string,"questions":[{"question":string,"options":string[],"answerIndex":number,"explanation":string}]}

Rules:
- 5–10 questions. Each has 3–5 plausible, mutually-exclusive options and exactly one correct answer (answerIndex, 0-based).
- explanation: one sentence on why the correct answer is right.
- Test real understanding; avoid trick wording and "all of the above".
- Return the JSON object only.`;

/**
 * Build a multiple-choice Quiz from a topic.
 * @param {object} opts { topic, level?, goals?, config? }
 * @returns {Promise<import('./quiz')>}
 */
async function runBuildQuiz({ topic, level = 'beginner', goals = '', config = {} }) {
  if (!topic || !String(topic).trim()) throw new Error('Empty topic.');
  const provider = getProvider(config);
  if (typeof provider.complete !== 'function') {
    throw new Error('This provider can’t build quizzes — switch to Claude in Settings.');
  }
  const t = String(topic).trim();
  const prompt = `Build a multiple-choice quiz. Return ONLY the JSON object.

TOPIC: ${t}
LEVEL: ${level}${goals ? `\nFOCUS: ${String(goals).trim()}` : ''}`;
  const raw = parseJsonObject(await provider.complete({ system: QUIZ_BUILD_SYSTEM, prompt, maxTokens: 4000 }));
  if (!raw) throw new Error('Couldn’t build a quiz — the response was incomplete or not valid JSON. Try again.');
  const now = new Date().toISOString();
  const quiz = normalizeQuiz({ ...raw, topic: t, level }, {
    id: 'quiz_' + crypto.randomUUID(),
    authorModel: (config && (config.model || config.provider)) || null,
    createdAt: now,
    updatedAt: now,
  });
  const { ok, errors } = validateQuiz(quiz);
  if (!ok) throw new Error('Built an invalid quiz: ' + errors.join('; '));
  if (questionCount(quiz) < 3) throw new Error('The model returned too few questions. Try again or rephrase the topic.');
  return quiz;
}

module.exports = { runAgent, runAppletAsk, runListModels, runAgentStep, runAgentPlan, runExtractSlides, runExtractDoc, runExtractSheets, runSynthesizeAgent, runBuildLesson, runBuildQuiz };
