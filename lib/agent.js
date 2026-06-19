'use strict';

const { getProvider } = require('./models');

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
- Prefer reading and navigating to accomplish the task. For searches, "type" into the search box then "submit" it (or "click" the search button).
- Set "risky":true for anything that submits/sends/posts/buys/logs in/changes an account.
- NEVER try to enter a password or payment/card details, complete a purchase, place an order, or send money. Instead return {"action":"need_user","reason":"<what the user must do themselves, e.g. log in or complete payment>"}.
- When the task is done (or you've gathered the answer), return {"action":"finish","reason":"<short summary of what you found or did>"}.
- Choose elements by their [number]. Keep "reason" short and friendly.`;

async function runAgentStep({ task, pageState = {}, steps = [], config = {} }) {
  const provider = getProvider(config);
  if (typeof provider.complete !== 'function') {
    throw new Error('This provider does not support agent actions.');
  }
  const els = (pageState.elements || [])
    .map((e) => `[${e.i}] ${e.tag}${e.type ? '/' + e.type : ''} "${e.label}"${e.href ? ' -> ' + e.href : ''}`)
    .join('\n');
  const history = steps.length
    ? steps.map((s, i) => `${i + 1}. ${s.action}${s.index != null ? ' #' + s.index : ''}${s.value ? ' "' + s.value + '"' : ''} — ${s.reason || ''}`).join('\n')
    : '(none yet)';
  const prompt = `TASK: ${task}

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

module.exports = { runAgent, runAppletAsk, runListModels, runAgentStep, runExtractSlides, runExtractDoc, runExtractSheets };
