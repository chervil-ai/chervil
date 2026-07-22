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

const { formatTextAttachment } = require('../attachments');

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
  async function geminiChat({ system, messages, onText = () => {}, groundMode = 'off', onStatus = null, maxTokens = 0, model: modelOverride = null }) {
    const base = String(config.baseURL || PRESETS.gemini.baseURL).replace(/\/+$/, '').replace(/\/openai$/, '');
    const url = `${base}/models/${encodeURIComponent(modelOverride || model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
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
    if (maxTokens > 0) body.generationConfig = { maxOutputTokens: maxTokens };
    if (groundMode !== 'off') {
      body.tools = [{ google_search: {} }];
      if (onStatus) onStatus('Sprig is searching the web (Gemini)…');
    }
    const res = await postWithRetry(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }, { label, onStatus });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw httpError(label, res.status, t);
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
  async function responsesApi({ system, messages, onText = () => {}, groundMode = 'off', onStatus = null, maxTokens = 0, model: modelOverride = null }) {
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
    const body = { model: modelOverride || model, input, stream: true };
    if (maxTokens > 0) body.max_output_tokens = maxTokens;
    if (groundMode !== 'off') {
      // x_search is xAI-only; OpenAI exposes web search alone.
      body.tools = provider === 'grok' ? [{ type: 'web_search' }, { type: 'x_search' }] : [{ type: 'web_search' }];
      if (onStatus) onStatus(`Sprig is searching the web (${label})…`);
    }
    const res = await postWithRetry(url, {
      method: 'POST', headers, body: JSON.stringify(body),
    }, { label, onStatus });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw httpError(label, res.status, t);
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
          const e = obj.error || (obj.response && obj.response.error) || obj;
          let detail = (e && (e.message || e.code)) || '';
          if (!detail) { try { detail = JSON.stringify(e).slice(0, 300); } catch { detail = 'stream error'; } }
          throw new Error(`${label}: ${detail}`);
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
  async function chat({ system, messages, onText = () => {}, groundMode = 'off', onStatus = null, maxTokens = 0, model: modelOverride = null }) {
    if (provider === 'gemini') return geminiChat({ system, messages, onText, groundMode, onStatus, maxTokens, model: modelOverride });
    if (provider === 'grok' || provider === 'openai') return responsesApi({ system, messages, onText, groundMode, onStatus, maxTokens, model: modelOverride });
    const body = { messages: [{ role: 'system', content: system }, ...messages], stream: true };
    if (!azure) body.model = modelOverride || model; // Azure: the deployment in the URL selects the model.
    if (maxTokens > 0) body.max_tokens = maxTokens;
    const g = groundingFields(groundMode);
    if (g) Object.assign(body, g);

    const res = await postWithRetry(requestUrl, {
      method: 'POST', headers, body: JSON.stringify(body),
    }, { label, onStatus });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw httpError(label, res.status, t);
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
    // Chat mode grounds in live web search on providers that support it
    // (Grok/Gemini/OpenAI). Azure has no web search, so it stays knowledge-only.
    canSearch: canGround,

    async run({
      query,
      history = [],
      onStatus = () => {},
      onText = () => {},
      pageContext = null,
      refineMode = null,
      spaceContext = null,
      recallContext = null, // excerpts from the user's own past reading (RFC 0013)
      recallMode = 'find',  // 'find' (re-find a page) | 'synthesize' (a dossier)
      deep = false,
      verify = false,
      profile = null,
      corrections = null,
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
      // PROMPT-CACHE ORDERING. These providers cache prefixes automatically, so the
      // only lever is what comes first. `dateLine` carries the current MINUTE, and it
      // used to sit at position 2 — which meant every addendum, the profile, and the
      // agent persona behind it changed every 60s and could never be cached. Stable
      // text first, the date appended last. (Same fix runChat carries for chat.)
      let system = verify ? verifyPrompt(live) : deep ? deepPrompt(live) : composePrompt(live);
      if (!verify) {
        if (pageContext && refineMode === 'force') system += REFINE_FORCE_ADDENDUM;
        else if (pageContext && refineMode === 'auto') system += REFINE_AUTO_ADDENDUM;
        if (spaceContext) system += SPACE_ADDENDUM;
        if (recallContext) {
          system += recallMode === 'digest' ? DIGEST_ADDENDUM
            : recallMode === 'synthesize' ? DOSSIER_ADDENDUM
              : recallMode === 'augment' ? RECALL_AUGMENT_ADDENDUM
                : RECALL_ADDENDUM;
        }
        if (profile) system += `\n\nABOUT THE USER (tailor to this when helpful): ${String(profile).slice(0, 1500)}`;
        if (agent) system += `\n\nACTIVE AGENT (adopt this persona/instructions for this response): ${String(agent).slice(0, 4000)}`;
      }
      system += dateLine;

      let extra = '';
      if (pageContext) extra += `---\nThe full HTML of the page I'm currently viewing:\n\n${pageContext}`;
      if (spaceContext) extra += `${extra ? '\n\n' : ''}---\nNotes from pages I've collected in my Space:\n\n${spaceContext}`;
      // 'digest' items arrived in the user's feeds and have NOT been read — the
      // "pages I read" framing would be a falsehood they can't catch.
      if (recallContext) {
        extra += `${extra ? '\n\n' : ''}---\n${recallMode === 'digest'
          ? 'New items from the feeds I subscribe to, waiting on this computer:'
          : 'Excerpts from pages I read or made myself, from my own history on this computer:'}\n\n${recallContext}`;
      }

      // Reference material BEFORE the question. It used to trail the query, which put
      // the one part that changes every turn in front of the one part that doesn't —
      // so a refine of the same page re-sent its whole HTML uncached. This way two
      // turns on the same page share everything up to the query.
      let userText = extra ? `${extra}\n\n---\n${query}` : query;
      const imageParts = [];
      for (const a of (attachments || [])) {
        if (!a) continue;
        if (a.kind === 'text') userText += formatTextAttachment(a.name, a.text, query);
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
    async complete({ system, prompt, maxTokens = 0 }) {
      const { text } = await chat({ system, messages: [{ role: 'user', content: String(prompt || '') }], maxTokens });
      return text.trim();
    },

    // Plain chat with autonomous web search. Grok/Gemini/OpenAI ground in live
    // sources (the model searches when the question needs current data); Azure has
    // no web search, so it answers from knowledge. Returns { text, sources }.
    // onDelta forwards streamed text so chat can paint as it arrives. `chat()`
    // already streams and takes an onText — this just stops throwing the deltas away.
    async chatReply({ system, messages, maxTokens = 1500, onStatus = () => {}, onDelta = null, model: modelOverride = null }) {
      const { text, citations } = await chat({
        system,
        messages: normalizeHistory(messages),
        groundMode: canGround ? 'auto' : 'off',
        onStatus,
        onText: onDelta ? (d) => { if (d) onDelta(d); } : undefined,
        maxTokens,
        model: modelOverride || undefined,
      });
      return { text: text.trim(), sources: citations };
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

// Surfacing conflict only makes sense where there are real sources to conflict —
// on a compose-only provider there's nothing to cross-check against.
const CORRECTIONS_CLAUSE = (list) => `

THE USER HAS CORRECTED YOU ON THESE POINTS — each is something they told you after seeing you get it wrong, so treat them as authoritative about their own situation, domain, preferences, and local facts:

${String(list).slice(0, 6000)}

Apply them SILENTLY (just get it right — no "as you mentioned" asides) and ONLY where they actually apply; an irrelevant correction must never be worked into the page or bend its subject. Do NOT over-generalize: a correction about one product or place says nothing about the category. Each is dated — if a live source you just found contradicts one and the world has moved on (a price, a role, a version), go with what you found and say so briefly so they know to update it. Their correction beats your training data, not today's evidence.`;

const DISAGREE_CLAUSE = `SHOW WHERE SOURCES DISAGREE — never hide a real conflict behind one confident sentence. If the sources you consulted give materially different answers on something that matters (a figure, a date, a cause, a ranking, a recommendation), do NOT average them, split the difference, or quietly pick a winner. Put an <aside class="chervil-disagree"> right after the paragraph with the contested claim: a short heading naming what's in dispute, then each position on its own line linking the source that makes it — <li><strong>the claim</strong> — <a href="URL">Source name</a></li> — and a closing line on which you find more credible and why, or that it's genuinely unsettled. If the split is really staleness, say so and give each source's date. Style it as a calm callout that fits the page's theme, not an alarm. This is the exception, not the rule: most pages have no genuine conflict — never manufacture one, stretch a wording difference into a disagreement, or use it for a matter of taste. At most two or three per page.`;

function composePrompt(live) {
  return `You are Sprig — the agentic, conversational web browser. Answer the user by composing a COMPLETE, beautiful, self-contained HTML document.
- ${webClause(live)}${live ? `\n- ${DISAGREE_CLAUSE}` : ''}
- Output a COMPLETE HTML document starting with <!DOCTYPE html>. Inline all CSS in a <style> tag. No external stylesheets, scripts, or frameworks.
- Make it genuinely beautiful and modern: thoughtful typography, generous spacing, a coherent color theme, cards, and clear hierarchy. Set a concise, descriptive <title>.
- You MAY include vanilla JavaScript for interactivity. INTERACTIVE APPLETS: Chervil injects a bridge — from a <script>, after guarding with \`if (window.chervil)\`, call \`await window.chervil.ask("...")\` which resolves to \`{ text, sources }\` from Sprig. Use it to build live mini-apps when helpful. The bridge also exposes \`await window.chervil.info()\` → read-only facts about THIS computer ({ platform, osType, osRelease, arch, cpuModel, cpuCores, memory, disk, uptimeSec, ipv4, versions }); use it for "check my computer"/specs/RAM/disk requests to show real values (bytes are raw — format as GB). For deeper OS facts (Windows edition/build, install date, last boot, Windows Update history, GPU, battery, manufacturer/model, BIOS) call \`await window.chervil.details()\` → { edition, displayVersion, build, installDate, lastBoot, manufacturer, model, bios, gpu, lastHotfix, lastHotfixDate, lastUpdateInstall, lastUpdateCheck, batteryPct } (slower; omit null fields; read-only). Never invent specs.
- REAL-WORLD ACTIONS: link a real place/address to Google Maps — <a href="https://www.google.com/maps/search/?api=1&query=URL_ENCODED_PLACE">Place</a> (never fake a map) — and write phone numbers as tel: links — <a href="tel:+15551234567">(555) 123-4567</a>. Chervil turns these into one-tap open-in-Maps / send-to-phone / call actions.
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

// Your Web (RFC 0013, phase 1d) — asking about their own past reading.
const RECALL_ADDENDUM = `

THE USER IS ASKING ABOUT THEIR OWN PAST READING. Below their message are excerpts from pages they actually read or composed on this computer, retrieved from their local history — their own record, not web results. Answer from these pages first, and say which page each thing came from and when they read it (title, site, how long ago), linking the original URL where there is one — they are trying to re-find something. The excerpts were keyword-matched, so ignore any that don't fit rather than padding the answer with them. If none of them answer it, SAY SO PLAINLY instead of quietly giving a web answer as though it were their page.`;

// Your Feeds digest. This existed only on the Claude path, so on Grok/Gemini a
// digest fell through to RECALL_ADDENDUM — which frames feed items as "pages you
// read and are trying to re-find". They have NOT read them, and buildFeedContext
// deliberately avoids that exact falsehood on the renderer side.
const DIGEST_ADDENDUM = `

BRIEF THE USER ON THEIR OWN FEEDS. Below their message are items that arrived in subscriptions they chose — feeds, channels, subreddits, newsletters. They have NOT read these; you are telling them what showed up and what's worth their time. Lead with what MATTERS rather than what arrived first — your judgment about significance is the product, since a chronological relist is what the feeds already gave them. Group by theme rather than by source (three feeds on one story is one item with three sources, and that they all covered it is itself worth saying). One or two sentences per item, each linked to its URL with \`target="_blank"\` so clicking through doesn't replace this brief. YOU ONLY HAVE TITLES AND SUMMARIES — never write as though you read the full articles, and never invent what's behind a link. Skip the noise: a shorter honest brief beats a padded one, and if little of substance arrived, say so. Do not search the web — the subject is what THEIR sources published.`;

// Your Web as the default first hop — the user did NOT ask about their reading; the
// index was consulted automatically because the query matched. Mostly brakes.
const RECALL_AUGMENT_ADDENDUM = `

THE USER HAS READ ABOUT THIS BEFORE. Below their message are excerpts from pages they read or composed on this computer that matched their query. They did NOT ask about their own reading — this was retrieved automatically, so answer the question they actually asked. These are SUPPORTING context, not the assignment: compose the page you would have composed anyway, and don't let this section change its shape, subject, or length. They were keyword-matched, so some or all may be irrelevant — ignore those completely and silently, never mention that you looked, and never stretch the page to fit one in. When one genuinely informs the answer, attribute it as <a class="chervil-recall" href="URL">Page title</a> (or <span class="chervil-recall">Page title</span> with no URL) so they can get back to the original, noting when they read it if staleness matters. NEVER claim they read something these excerpts don't show. Their own reading is not more authoritative than current facts — if an excerpt conflicts with what you find on the web now, prefer the live source and say the earlier page is out of date.`;

// Your Web (RFC 0013, Bet 3) — same excerpts, but pull them together.
const DOSSIER_ADDENDUM = `

BUILD A DOSSIER FROM THE USER'S OWN READING. Below their message are excerpts from pages they actually read or composed on this computer — their own research, from their local history. SYNTHESIZE across them rather than summarizing each in turn: the through-line, where they agree, where they CONTRADICT each other, and what's still open. Attribute everything to the page it came from (title, site, when they read it, linking the URL) so they can get back to it. SAY WHAT'S MISSING — the obvious questions their reading hasn't covered are often the most useful part. If the evidence is thin, say the picture is partial rather than inflating it. You may add web results to fill a gap, but keep them clearly marked as new — their reading is the subject, the web is the supplement.`;

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
    // Callers that feature-detect chatReply (chat, Compare, claim checks) would
    // otherwise read a missing KEY as a missing CAPABILITY and tell the user to
    // switch providers when they just need to paste a key.
    chatReply: async () => { throw new Error(message); },
  };
}

// POST with retry on 429 (rate limited) and 5xx (transient server errors).
//
// Every request on this path used to `throw` on the first non-2xx, so a single
// 429 surfaced to the user as "Grok error 429" with no attempt to recover — the
// user-visible failure Rod hit on the hosted app. The Claude path never had this
// problem because the Anthropic SDK retries 429/5xx internally (maxRetries: 4).
//
// xAI does NOT send a Retry-After header and documents exponential backoff as the
// intended strategy, so that's the default; Retry-After is still honoured when a
// provider does send one (Gemini and OpenAI both can). Rate limits are per-second
// AND per-minute, so the first backoff has to clear a whole second — starting at
// ~1s rather than the ~100ms typical for connection retries.
const RETRY_STATUSES = new Set([408, 409, 429, 500, 502, 503, 504]);
const MAX_HTTP_ATTEMPTS = 4;

function retryDelayMs(res, attempt) {
  // Retry-After is seconds or an HTTP date; both are worth honouring exactly,
  // since a server that sends one knows better than our backoff curve.
  const h = res && res.headers && res.headers.get && res.headers.get('retry-after');
  if (h) {
    const secs = Number(h);
    if (Number.isFinite(secs) && secs >= 0) return Math.min(secs * 1000, 30000);
    const at = Date.parse(h);
    if (Number.isFinite(at)) return Math.min(Math.max(0, at - Date.now()), 30000);
  }
  // 1s, 2s, 4s … plus jitter so concurrent tabs don't retry in lockstep and
  // re-trigger the same per-second cap they just tripped.
  const base = 1000 * Math.pow(2, attempt - 1);
  return Math.min(base, 16000) + Math.floor(Math.random() * 250);
}

async function postWithRetry(url, init, { label, signal = undefined, onStatus = null } = {}) {
  let lastRes = null;
  for (let attempt = 1; attempt <= MAX_HTTP_ATTEMPTS; attempt++) {
    let res;
    try {
      res = await fetch(url, signal ? { ...init, signal } : init);
    } catch (err) {
      // A user-initiated abort is not transient — surface it immediately.
      if (signal && signal.aborted) throw err;
      if (attempt === MAX_HTTP_ATTEMPTS) throw connError(err, label, url);
      await sleep(retryDelayMs(null, attempt));
      continue;
    }
    if (res.ok || !RETRY_STATUSES.has(res.status)) return res;
    lastRes = res;
    if (attempt === MAX_HTTP_ATTEMPTS) break;
    const wait = retryDelayMs(res, attempt);
    if (onStatus) {
      onStatus(res.status === 429
        ? { phase: 'retrying', text: `${label} is rate-limiting — retrying in ${Math.max(1, Math.round(wait / 1000))}s…` }
        : { phase: 'retrying', text: `${label} returned ${res.status} — retrying…` });
    }
    // Drain the body so the connection can be reused.
    try { await res.text(); } catch { /* ignore */ }
    await sleep(wait);
  }
  return lastRes;
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// A 429 that survives every retry deserves a message that says what to do about
// it, not a bare status code.
function httpError(label, status, body) {
  if (status === 429) {
    return new Error(
      `${label} is rate-limiting this account (429) and kept doing so after ${MAX_HTTP_ATTEMPTS} attempts. `
      + `This is a per-second request cap or a per-minute token cap on the key — not a problem with your message. `
      + `Wait a moment and try again; if it persists, check usage limits for this model on your provider account.`
    );
  }
  return new Error(`${label} error ${status}: ${String(body || '').slice(0, 300)}`);
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
