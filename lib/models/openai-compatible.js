'use strict';

// One provider covering OpenAI-compatible chat APIs: Grok (xAI), Gemini (Google's
// OpenAI-compatible endpoint), and Azure AI Foundry / Azure OpenAI. Selected via
// config.provider ('grok' | 'gemini' | 'azure').
//
// LIVE WEB GROUNDING (P12): Grok and Gemini have provider-native web search, so on
// those two Chervil composes from real, current sources (with citations) — not just
// the model's memory:
//   - Grok (xAI Agent Tools API): xAI deprecated Live Search (`search_parameters` now
//     returns HTTP 410). Grounding runs through the OpenAI-compatible /v1/responses
//     endpoint with server-side tools (`web_search`, `x_search`); citations come back
//     as annotations on the output (or a top-level list). See grokResponses().
//   - Gemini (Grounding with Google Search): a `tools:[{google_search:{}}]` entry
//     (the OpenAI SDK's `extra_body` merges to the top level over raw REST).
// Azure OpenAI has no built-in web search on this endpoint, so it stays compose-only
// (like Ollama). Switch to Claude for the full Anthropic web_search + Deep Dive path.

const PRESETS = {
  grok: {
    label: 'Grok (xAI)',
    baseURL: process.env.CHERVIL_GROK_URL || process.env.PARSLEE_GROK_URL || 'https://api.x.ai/v1',
    defaultModel: process.env.CHERVIL_GROK_MODEL || process.env.PARSLEE_GROK_MODEL || 'grok-4.3',
  },
  gemini: {
    label: 'Gemini (Google)',
    baseURL: process.env.CHERVIL_GEMINI_URL || process.env.PARSLEE_GEMINI_URL || 'https://generativelanguage.googleapis.com/v1beta/openai',
    defaultModel: process.env.CHERVIL_GEMINI_MODEL || process.env.PARSLEE_GEMINI_MODEL || 'gemini-2.5-flash',
  },
  openai: {
    label: 'OpenAI',
    baseURL: process.env.CHERVIL_OPENAI_URL || process.env.PARSLEE_OPENAI_URL || 'https://api.openai.com/v1',
    defaultModel: process.env.CHERVIL_OPENAI_MODEL || process.env.PARSLEE_OPENAI_MODEL || 'gpt-5.5',
  },
};

function createOpenAICompatProvider(config = {}) {
  const provider = (config.provider || 'grok').toLowerCase();
  const apiKey = config.apiKey || '';
  const azure = provider === 'azure';
  // Grok and OpenAI ground via the Responses API on /v1/responses (see responsesApi)
  // with server-side search tools. Gemini can't ground via the chat/completions shim
  // (its tools array only accepts OpenAI function tools), so Gemini requests are routed
  // to the NATIVE generateContent API (see geminiChat) where the google_search tool
  // works. Azure has no built-in web search.
  const canGround = provider === 'grok' || provider === 'gemini' || provider === 'openai';

  // Grounding is no longer expressed as chat/completions body fields. xAI deprecated
  // Live Search (`search_parameters` → HTTP 410); Grok now grounds via the Agent Tools
  // API on /v1/responses (see grokResponses). Gemini grounds via its native
  // generateContent path. Azure has no web search. So the chat/completions body never
  // carries grounding fields anymore — this returns null and stays for call-site shape.
  function groundingFields() {
    return null;
  }

  let label, requestUrl, headers, model;
  if (azure) {
    label = 'Azure AI Foundry';
    const endpoint = String(config.azureEndpoint || process.env.CHERVIL_AZURE_ENDPOINT || process.env.PARSLEE_AZURE_ENDPOINT || '').replace(/\/+$/, '');
    const deployment = config.azureDeployment || process.env.CHERVIL_AZURE_DEPLOYMENT || process.env.PARSLEE_AZURE_DEPLOYMENT || '';
    const apiVersion = config.azureApiVersion || process.env.CHERVIL_AZURE_API_VERSION || process.env.PARSLEE_AZURE_API_VERSION || '2024-10-21';
    model = config.model || deployment;
    if (!apiKey) return deferred(`No ${label} key set. Add it in Settings → Provider.`);
    if (!endpoint || !deployment) {
      return deferred(`${label} needs an Endpoint and Deployment name (Settings → Provider).`);
    }
    requestUrl = `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
    headers = { 'Content-Type': 'application/json', 'api-key': apiKey };
  } else {
    const preset = PRESETS[provider] || PRESETS.grok;
    label = preset.label;
    const baseURL = String(config.baseURL || preset.baseURL).replace(/\/+$/, '');
    model = config.model || preset.defaultModel;
    if (!apiKey) return deferred(`No ${label} key set. Add it in Settings → Provider.`);
    requestUrl = `${baseURL}/chat/completions`;
    headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` };
  }

  // Gemini path: the OpenAI tools schema can't express Google-Search grounding, so we
  // call the NATIVE generateContent API (where google_search works). Non-streaming;
  // returns the same { text, citations } shape as chat().
  async function geminiChat({ system, messages, onText = () => {}, groundMode = 'off', onStatus = null }) {
    const base = String(config.baseURL || PRESETS.gemini.baseURL).replace(/\/+$/, '').replace(/\/openai$/, '');
    const url = `${base}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const toParts = (content) => {
      if (typeof content === 'string') return [{ text: content }];
      if (Array.isArray(content)) {
        const parts = [];
        for (const p of content) {
          if (!p) continue;
          if (p.type === 'text' && p.text) parts.push({ text: p.text });
          else if (p.type === 'image_url' && p.image_url && p.image_url.url) {
            const m = String(p.image_url.url).match(/^data:([^;]+);base64,(.*)$/);
            if (m) parts.push({ inlineData: { mimeType: m[1], data: m[2] } });
          }
        }
        return parts.length ? parts : [{ text: '' }];
      }
      return [{ text: String(content || '') }];
    };
    const contents = messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: toParts(m.content) }));
    const body = { systemInstruction: { parts: [{ text: system }] }, contents };
    if (groundMode !== 'off') {
      body.tools = [{ google_search: {} }];
      if (onStatus) onStatus('Sprig is searching the web (Gemini)…');
    }
    let res;
    try {
      res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } catch (err) {
      throw connError(err, label, url);
    }
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`${label} error ${res.status}: ${t.slice(0, 300)}`);
    }
    const j = await res.json().catch(() => null);
    const cand = j && j.candidates && j.candidates[0];
    const parts = cand && cand.content && cand.content.parts;
    const text = Array.isArray(parts) ? parts.map((p) => p.text || '').join('') : '';
    let citations = [];
    const gm = cand && cand.groundingMetadata;
    if (gm && Array.isArray(gm.groundingChunks)) {
      citations = gm.groundingChunks
        .map((c) => (c && c.web ? { url: c.web.uri, title: c.web.title || c.web.uri } : null))
        .filter(Boolean);
    }
    if (text) onText(text); // no token streaming on this path — emit once so the preview fills
    return { text, citations: normCitations(citations) };
  }

  // Responses API path (Grok + OpenAI). xAI deprecated Live Search (search_parameters →
  // HTTP 410), and OpenAI's web search is a Responses-API tool too — so both ground via
  // /v1/responses with server-side search tools (`web_search`, plus `x_search` on Grok),
  // and the model searches autonomously, returning source URLs as citations. Streams
  // token deltas (Responses SSE) for a live preview, and treats the final
  // `response.completed` payload as the source of truth for text + citations — so if
  // delta events ever differ, it still degrades to emit-once.
  async function responsesApi({ system, messages, onText = () => {}, groundMode = 'off', onStatus = null }) {
    const baseURL = String(config.baseURL || (PRESETS[provider] || PRESETS.grok).baseURL).replace(/\/+$/, '');
    const url = `${baseURL}/responses`;
    const toContent = (content) => {
      if (typeof content === 'string') return content;
      if (Array.isArray(content)) {
        const parts = [];
        for (const p of content) {
          if (!p) continue;
          if (p.type === 'text' && p.text) parts.push({ type: 'input_text', text: p.text });
          else if (p.type === 'image_url' && p.image_url && p.image_url.url) parts.push({ type: 'input_image', image_url: p.image_url.url });
        }
        return parts.length ? parts : '';
      }
      return String(content || '');
    };
    const input = [
      { role: 'system', content: system },
      ...messages.map((m) => ({ role: m.role, content: toContent(m.content) })),
    ];
    const body = { model, input, stream: true };
    if (groundMode !== 'off') {
      // x_search is xAI-only; OpenAI exposes web search alone.
      body.tools = provider === 'grok' ? [{ type: 'web_search' }, { type: 'x_search' }] : [{ type: 'web_search' }];
      if (onStatus) onStatus(`Sprig is searching the web (${label})…`);
    }
    let res;
    try {
      res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    } catch (err) {
      throw connError(err, label, url);
    }
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`${label} error ${res.status}: ${t.slice(0, 300)}`);
    }

    // Responses SSE: each event is a "data: {json}" line whose JSON carries its own
    // `type`. We accumulate output_text deltas, capture annotations, and keep the final
    // full response object as the authoritative payload.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let streamed = '';
    let finalPayload = null;
    const annotations = [];
    let announced = false;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line.startsWith('data:')) continue; // ignore "event:" lines — the JSON has its own type
        const data = line.slice(5).trim();
        if (!data || data === '[DONE]') continue;
        let obj;
        try { obj = JSON.parse(data); } catch { continue; }
        const type = (obj && obj.type) || '';
        if (type === 'error' || type === 'response.failed') {
          const e = obj.error || (obj.response && obj.response.error);
          throw new Error(`${label}: ${(e && (e.message || e.code)) || 'stream error'}`);
        }
        if (typeof obj.delta === 'string' && /output_text/.test(type) && /delta$/.test(type)) {
          streamed += obj.delta;
          onText(obj.delta);
          if (onStatus && !announced && groundMode !== 'off') { announced = true; onStatus('Sprig is reading live sources…'); }
        } else if (type === 'response.output_text.annotation.added' && obj.annotation) {
          annotations.push(obj.annotation);
        } else if (obj.response && /^response\.(completed|done|incomplete)$/.test(type)) {
          finalPayload = obj.response;
        }
      }
    }

    const parsed = parseResponsesPayload(finalPayload);
    const text = streamed || parsed.text;
    if (!streamed && parsed.text) onText(parsed.text); // no deltas arrived — emit the final text once
    return { text, citations: normCitations([...parsed.citations, ...annotations]) };
  }

  // One streaming chat call (OpenAI-style SSE: "data: {json}" lines, "data: [DONE]").
  // Returns { text, citations } — citations are live-web sources when grounded.
  async function chat({ system, messages, onText = () => {}, groundMode = 'off', onStatus = null }) {
    if (provider === 'gemini') return geminiChat({ system, messages, onText, groundMode, onStatus });
    if (provider === 'grok' || provider === 'openai') return responsesApi({ system, messages, onText, groundMode, onStatus });
    const body = { messages: [{ role: 'system', content: system }, ...messages], stream: true };
    if (!azure) body.model = model; // Azure: the deployment in the URL selects the model.
    const g = groundingFields(groundMode);
    if (g) Object.assign(body, g);

    let res;
    try {
      res = await fetch(requestUrl, { method: 'POST', headers, body: JSON.stringify(body) });
    } catch (err) {
      throw connError(err, label, requestUrl);
    }
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`${label} error ${res.status}: ${t.slice(0, 300)}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let full = '';
    let citations = [];
    let announcedSearch = false;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') { buf = ''; break; }
        let obj;
        try { obj = JSON.parse(data); } catch { continue; }
        if (obj.error) throw new Error(`${label}: ${obj.error.message || JSON.stringify(obj.error)}`);
        // Live-search citations can arrive on any chunk (usually the last). Collect the
        // richest set we see, checking the common locations across Grok/Gemini.
        const found = extractCitations(obj);
        if (found.length) {
          citations = found;
          if (onStatus && !announcedSearch) { announcedSearch = true; onStatus('Sprig is reading live sources…'); }
        }
        const choice = obj.choices && obj.choices[0];
        const delta = choice && choice.delta;
        const c = delta && delta.content;
        if (c) { full += c; onText(c); }
      }
    }
    return { text: full, citations: normCitations(citations) };
  }

  return {
    async run({
      query,
      history = [],
      onStatus = () => {},
      onText = () => {},
      pageContext = null,
      refineMode = null,
      spaceContext = null,
      deep = false,
      verify = false,
      profile = null,
      agent = null,
      attachments = [],
    }) {
      // On Grok/Gemini we ground in live web search; Verify and Deep Dive force it.
      const groundMode = canGround ? (verify || deep ? 'on' : 'auto') : 'off';
      const live = canGround; // prompts reflect whether real web access is available

      onStatus(
        canGround
          ? (verify ? `Sprig is fact-checking the web (${label})…` : `Sprig is searching (${label})…`)
          : (verify ? `Sprig is reviewing (${label})…` : `Sprig is thinking (${label})…`)
      );

      const now = new Date();
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const today = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const nowTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
      const dateLine = `\n\nTODAY'S DATE: ${today}. CURRENT LOCAL TIME: ${nowTime} — the user's local timezone is "${tz}". Treat this as the current moment in the user's LOCAL time, not UTC. Anything you show or compute involving time (a clock, "now", a schedule) MUST be in the user's local timezone — for a live clock, format with that IANA zone explicitly, e.g. new Intl.DateTimeFormat([], { timeZone: "${tz}", hour: "2-digit", minute: "2-digit", second: "2-digit" }). Never display UTC unless the user explicitly asks for it. For "today/latest/recent/this week/last 24 hours", anchor to this date and use live search when available — never present remembered or training-data facts as current.`;
      let system = (verify ? verifyPrompt(live) : deep ? deepPrompt(live) : composePrompt(live)) + dateLine;
      if (!verify) {
        if (pageContext && refineMode === 'force') system += REFINE_FORCE_ADDENDUM;
        else if (pageContext && refineMode === 'auto') system += REFINE_AUTO_ADDENDUM;
        if (spaceContext) system += SPACE_ADDENDUM;
        if (profile) system += `\n\nABOUT THE USER (tailor to this when helpful): ${String(profile).slice(0, 1500)}`;
        if (agent) system += `\n\nACTIVE AGENT (adopt this persona/instructions for this response): ${String(agent).slice(0, 4000)}`;
      }

      let extra = '';
      if (pageContext) extra += `\n\n---\nThe full HTML of the page I'm currently viewing:\n\n${pageContext}`;
      if (spaceContext) extra += `\n\n---\nNotes from pages I've collected in my Space:\n\n${spaceContext}`;

      let userText = extra ? `${query}${extra}` : query;
      const imageParts = [];
      for (const a of (attachments || [])) {
        if (!a) continue;
        if (a.kind === 'text') userText += `\n\n--- Attached file: ${a.name || 'file'} ---\n${String(a.text || '').slice(0, 30000)}`;
        else if (a.kind === 'image' && a.data) imageParts.push({ type: 'image_url', image_url: { url: `data:${a.mediaType || 'image/png'};base64,${a.data}` } });
        else if (a.kind === 'pdf') userText += `\n\n(Note: a PDF "${a.name || 'file'}" was attached, but this provider can't read PDFs here — switch to Claude to use it.)`;
      }
      const userContent = imageParts.length ? [{ type: 'text', text: userText }, ...imageParts] : userText;

      const messages = [
        ...normalizeHistory(history),
        { role: 'user', content: userContent },
      ];

      const { text: raw, citations } = await chat({ system, messages, onText, groundMode, onStatus });

      let refine = refineMode === 'force';
      if (refineMode === 'auto' && /<!--\s*chervil:refine\s*-->/i.test(raw)) refine = true;

      const html = extractHtml(raw);
      return {
        kind: 'page',
        html,
        title: extractTitle(html) || titleFromQuery(query),
        sources: citations,
        searches: [],
        refine,
      };
    },

    async quickAsk({ prompt }) {
      // Applets benefit from live data, so ground these too (auto) on Grok/Gemini.
      const { text, citations } = await chat({
        system: appletPrompt(canGround),
        messages: [{ role: 'user', content: String(prompt || '').slice(0, 4000) }],
        groundMode: canGround ? 'auto' : 'off',
      });
      return { text: text.trim(), sources: citations };
    },

    // Plain completion (used by the web-agent loop to decide actions). No grounding —
    // it operates on the page state it's given, not the live web.
    async complete({ system, prompt }) {
      const { text } = await chat({ system, messages: [{ role: 'user', content: String(prompt || '') }] });
      return text.trim();
    },

    // Live model list via GET /models (OpenAI-compatible). Azure is deployment-based,
    // so it has no meaningful model list here.
    async listModels() {
      if (azure) return [];
      try {
        const baseURL = String(config.baseURL || (PRESETS[provider] || PRESETS.grok).baseURL).replace(/\/+$/, '');
        const res = await fetch(`${baseURL}/models`, { headers: { Authorization: `Bearer ${apiKey}` } });
        if (!res.ok) return [];
        const j = await res.json();
        const arr = j.data || j.models || [];
        return arr.map((m) => String(m.id || m.name || '').replace(/^models\//, '')).filter(Boolean);
      } catch {
        return [];
      }
    },
  };
}

// --- prompts (live-aware: grounded on Grok/Gemini, compose-only on Azure) ----

// The web-access clause differs by whether this provider has live grounding.
function webClause(live) {
  return live
    ? 'You CAN search the live web. Search when the query needs current or recent data (news, prices, scores, schedules, weather, "today/latest", who currently holds a role); for evergreen knowledge answer directly without searching. Ground real-time claims in what you find and never invent facts or fake image URLs. Include a compact "Sources" section at the bottom linking the real pages you used.'
    : 'You have NO live web access in this mode, so answer from your own knowledge. Do NOT invent specific real-time facts (today\'s prices, scores, news) or fake image URLs — if something genuinely needs live data you don\'t have, say so gracefully in the page.';
}

function composePrompt(live) {
  return `You are Sprig — the agentic, conversational web browser. Answer the user by composing a COMPLETE, beautiful, self-contained HTML document.
- ${webClause(live)}
- Output a COMPLETE HTML document starting with <!DOCTYPE html>. Inline all CSS in a <style> tag. No external stylesheets, scripts, or frameworks.
- Make it genuinely beautiful and modern: thoughtful typography, generous spacing, a coherent color theme, cards, and clear hierarchy. Set a concise, descriptive <title>.
- You MAY include vanilla JavaScript for interactivity. INTERACTIVE APPLETS: Chervil injects a bridge — from a <script>, after guarding with \`if (window.chervil)\`, call \`await window.chervil.ask("...")\` which resolves to \`{ text, sources }\` from Sprig. Use it to build live mini-apps when helpful.
- Your final response must be ONLY the raw HTML document — no markdown, no code fences, no commentary.`;
}

function deepPrompt(live) {
  return `${composePrompt(live)}

DEEP DIVE: Write a LONG, thorough, well-structured report-style page — an executive summary, a table of contents, and several sections with headings, comparison tables, and callouts where useful. ${
    live
      ? 'Search the web from several angles and cite your sources inline and in a "Sources" section.'
      : 'You have no live web access, so base it on your knowledge and clearly flag where current data would be needed to confirm specifics.'
  }`;
}

function verifyPrompt(live) {
  return live
    ? `You are Sprig doing a TRUST CHECK on a page the user is viewing (its HTML is included). Search the live web to fact-check its main claims against reputable, independent sources; cross-check and prefer primary sources. Compose a "Trust Check" HTML page: a headline verdict, then for each key claim the claim text, a verdict chip — ✅ Verified / ⚠️ Contested / ❓ Unverified / ❌ False — a one-line basis, and a citation link to the source you checked. Flag anything that reads as misinformation, propaganda, outdated-as-current, or single-sourced. End with a "Sources checked" section. Use real HTML (a styled <table>, not markdown). Output ONLY the raw HTML document, beginning <!DOCTYPE html> and ending </html>.`
    : `You are Sprig doing a TRUST CHECK on a page the user is viewing (its HTML is included). You have NO live web access, so you cannot verify against the internet — instead critically review it from your own knowledge. Compose a "Trust Check" HTML page: list the main factual claims and mark each ✅ Looks right / ⚠️ Double-check / ❓ Can't verify offline / ❌ Likely wrong, each with a one-line note. Flag anything outdated, dubious, or one-sided, and clearly remind the reader you could NOT check live sources. Output ONLY the raw HTML document.`;
}

function appletPrompt(live) {
  return live
    ? `You are Sprig answering a data request from an interactive applet in a Chervil page. Search the live web when the answer depends on current data, then answer concisely and directly — no preamble, no markdown. If the request asks for JSON, output ONLY valid minified JSON (no prose, no code fences).`
    : `You are Sprig answering a data request from an interactive applet in a Chervil page. Answer concisely and directly from your knowledge — no preamble, no markdown. If the request asks for JSON, output ONLY valid minified JSON (no prose, no code fences). You have no live web access, so do not fabricate real-time values; give a reasonable best-effort answer.`;
}

const REFINE_AUTO_ADDENDUM = `

CONTEXT: The user is viewing a page you composed (its HTML is included with their message). Begin your output with EXACTLY ONE marker comment on its own first line — \`<!-- chervil:refine -->\` if you are revising that page (output the COMPLETE revised HTML), or \`<!-- chervil:new -->\` if this is a new request — then the HTML document.`;

const REFINE_FORCE_ADDENDUM = `

CONTEXT: The user is viewing a page you composed (its HTML is included with their message) and wants you to REVISE it. Output the COMPLETE revised HTML document, changing only what they asked for.`;

const SPACE_ADDENDUM = `

The user is working in a research Space and included notes from pages they collected (below their message). Synthesize across those collected pages and include a brief "From your Space" note listing which ones you drew on.`;

// --- citation extraction (live web grounding) ------------------------------

// Pull live-search citations out of a streaming chunk. Grok returns a top-level
// `citations` array of URL strings; Gemini's OpenAI-compat layer may surface
// grounding as message-level `annotations`/`citations`. We check the common spots.
// Parse an xAI /v1/responses (OpenAI Responses-compatible) payload into { text, citations }.
// Defensive across shapes: prefers the output_text convenience field, else concatenates
// the output[].content[] text parts; gathers citations from inline annotations and any
// top-level list. Raw citation objects are normalized later by normCitations.
function parseResponsesPayload(j) {
  if (!j || typeof j !== 'object') return { text: '', citations: [] };
  const citations = [];
  let collected = '';
  const out = Array.isArray(j.output) ? j.output : [];
  for (const item of out) {
    const content = item && Array.isArray(item.content) ? item.content : [];
    for (const part of content) {
      if (!part) continue;
      if ((part.type === 'output_text' || part.type === 'text') && typeof part.text === 'string') collected += part.text;
      if (Array.isArray(part.annotations)) for (const a of part.annotations) citations.push(a);
    }
  }
  const text = (typeof j.output_text === 'string' && j.output_text) ? j.output_text : collected;
  if (Array.isArray(j.citations)) for (const c of j.citations) citations.push(c);
  return { text, citations };
}

function extractCitations(obj) {
  if (!obj || typeof obj !== 'object') return [];
  const choice = obj.choices && obj.choices[0];
  const msg = choice && (choice.message || choice.delta);
  const candidates = [
    obj.citations,                              // Grok (xAI Live Search), top level
    choice && choice.citations,
    msg && msg.citations,
    msg && msg.annotations,                     // OpenAI-style url_citation annotations
    obj.grounding_metadata && obj.grounding_metadata.citations, // Gemini-ish
  ];
  for (const c of candidates) {
    if (Array.isArray(c) && c.length) return c;
  }
  return [];
}

// Normalize mixed citation shapes (URL strings, {url,title}, or annotation
// objects with a nested url_citation) into deduped { url, title } records.
function normCitations(cites) {
  const seen = new Set();
  const out = [];
  for (const c of (cites || [])) {
    if (!c) continue;
    let url = null;
    let title = null;
    if (typeof c === 'string') {
      url = c;
    } else if (c.url) {
      url = c.url; title = c.title;
    } else if (c.url_citation && c.url_citation.url) {
      url = c.url_citation.url; title = c.url_citation.title;
    } else if (c.uri) {
      url = c.uri; title = c.title;
    }
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push({ url, title: title || hostFromUrl(url) });
  }
  return out;
}

function hostFromUrl(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

// --- helpers (self-contained) ---------------------------------------------

function deferred(message) {
  return {
    run: async () => { throw new Error(message); },
    quickAsk: async () => ({ text: '', sources: [] }),
    listModels: async () => [],
    complete: async () => { throw new Error(message); },
  };
}

function connError(err, label, url) {
  const code = err && err.cause && err.cause.code;
  if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || /fetch failed/i.test(err && err.message)) {
    return new Error(`Couldn't reach ${label} at ${url}. Check your network and the endpoint/key in Settings → Provider.`);
  }
  return err instanceof Error ? err : new Error(String(err));
}

function normalizeHistory(history) {
  return (Array.isArray(history) ? history : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
    .map((m) => ({ role: m.role, content: String(m.content) }));
}

function extractHtml(text) {
  if (!text) return fallbackPage('Sprig returned an empty page.');
  let t = text.trim();
  const fence = t.match(/^```(?:html)?\s*([\s\S]*?)\s*```$/i);
  if (fence) t = fence[1].trim();
  const idx = t.search(/<!DOCTYPE html>|<html[\s>]/i);
  if (idx >= 0) {
    let doc = t.slice(idx);
    const end = doc.search(/<\/html\s*>/i);
    if (end >= 0) doc = doc.slice(0, end + doc.slice(end).indexOf('>') + 1);
    return doc;
  }
  return fallbackPage(t, /* raw */ true);
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? m[1].trim() : null;
}

function titleFromQuery(query) {
  const q = String(query || '').trim();
  return q.length > 60 ? q.slice(0, 57) + '…' : q || 'Chervil';
}

function fallbackPage(body, raw = false) {
  const content = raw
    ? body
    : `<p>${String(body).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))}</p>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Chervil</title>
<style>body{font-family:system-ui,-apple-system,sans-serif;max-width:720px;margin:60px auto;padding:0 24px;color:#1a1a1a;line-height:1.6}</style>
</head><body>${content}</body></html>`;
}

module.exports = { createOpenAICompatProvider };
