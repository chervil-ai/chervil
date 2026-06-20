'use strict';

// Local provider for development — runs against a local Ollama server so you can
// build and test Chervil (tabs, the applet bridge, Spaces, persistence, streaming,
// the refine marker, etc.) without spending Anthropic credits.
//
// IMPORTANT LIMITATIONS vs. the Claude provider:
//   - No live web access (no web_search/web_fetch), so pages compose from the model's
//     own knowledge — not grounded in current data. Deep Dive does no real research.
//   - No open_website navigation — Ollama always composes a page.
// Switch back to CHERVIL_PROVIDER=claude when you need real grounding or page quality.
//
// Config: CHERVIL_OLLAMA_MODEL (default "gemma3:4b"), CHERVIL_OLLAMA_URL
// (default "http://localhost:11434").

const SYSTEM_PROMPT = `You are Sprig — the agentic, conversational web browser. Answer the user by composing a COMPLETE, beautiful, self-contained HTML document.
- You are running on a LOCAL model with NO live web access. Answer from your own knowledge. Do NOT invent specific real-time facts (today's prices, scores, news) or fake image URLs — if something genuinely needs live data you don't have, say so gracefully in the page.
- Output a COMPLETE HTML document starting with <!DOCTYPE html>. Inline all CSS in a <style> tag. No external stylesheets, scripts, or frameworks.
- Make it genuinely beautiful and modern: thoughtful typography, generous spacing, a coherent color theme, cards, and clear hierarchy.
- Set a concise, descriptive <title>.
- You MAY include vanilla JavaScript for interactivity. INTERACTIVE APPLETS: Chervil injects a bridge — from a <script>, after guarding with \`if (window.chervil)\`, call \`await window.chervil.ask("...")\` which resolves to \`{ text, sources }\` from Sprig. Use it to build live mini-apps when helpful.
- Your final response must be ONLY the raw HTML document — no markdown, no code fences, no commentary.`;

const DEEP_PROMPT = `${SYSTEM_PROMPT}

DEEP DIVE: Write a LONG, thorough, well-structured report-style page — an executive summary, a table of contents, and several sections with headings. You have no live web access, so base it on your knowledge and clearly flag where current data would be needed to confirm specifics.`;

const REFINE_AUTO_ADDENDUM = `

CONTEXT: The user is viewing a page you composed (its HTML is included with their message). Begin your output with EXACTLY ONE marker comment on its own first line — \`<!-- chervil:refine -->\` if you are revising that page (output the COMPLETE revised HTML), or \`<!-- chervil:new -->\` if this is a new request — then the HTML document.`;

const REFINE_FORCE_ADDENDUM = `

CONTEXT: The user is viewing a page you composed (its HTML is included with their message) and wants you to REVISE it. Output the COMPLETE revised HTML document, changing only what they asked for.`;

const SPACE_ADDENDUM = `

The user is working in a research Space and included notes from pages they collected (below their message). Synthesize across those collected pages and include a brief "From your Space" note listing which ones you drew on.`;

const VERIFY_PROMPT = `You are Sprig doing a TRUST CHECK on a page the user is viewing (its HTML is included). You have NO live web access, so you cannot verify against the internet — instead critically review it from your own knowledge. Compose a "Trust Check" HTML page: list the main factual claims and mark each ✅ Looks right / ⚠️ Double-check / ❓ Can't verify offline / ❌ Likely wrong, each with a one-line note. Flag anything outdated, dubious, or one-sided, and clearly remind the reader you could NOT check live sources. Output ONLY the raw HTML document.`;

const APPLET_PROMPT = `You are Sprig answering a data request from an interactive applet in a Chervil page. Answer concisely and directly from your knowledge — no preamble, no markdown. If the request asks for JSON, output ONLY valid minified JSON (no prose, no code fences). You have no live web access, so do not fabricate real-time values; give a reasonable best-effort answer.`;

function createOllamaProvider(config = {}) {
  const model = config.ollamaModel || process.env.CHERVIL_OLLAMA_MODEL || process.env.PARSLEE_OLLAMA_MODEL || 'gemma3:4b';
  const url = (config.ollamaUrl || process.env.CHERVIL_OLLAMA_URL || process.env.PARSLEE_OLLAMA_URL || 'http://localhost:11434').replace(/\/+$/, '');

  // One streaming chat call against Ollama's /api/chat (NDJSON stream).
  async function chat({ system, messages, onText = () => {} }) {
    let res;
    try {
      res = await fetch(`${url}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          stream: true,
          options: { temperature: 0.6 },
          messages: [{ role: 'system', content: system }, ...messages],
        }),
      });
    } catch (err) {
      throw connError(err, url);
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      if (res.status === 404) {
        throw new Error(
          `Ollama model "${model}" isn't available. Pull it with:  ollama pull ${model}\n(or pick one you have in Settings → Provider).`
        );
      }
      throw new Error(`Ollama error ${res.status}: ${body.slice(0, 200)}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let full = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        let obj;
        try { obj = JSON.parse(line); } catch { continue; }
        const c = obj.message && obj.message.content;
        if (c) { full += c; onText(c); }
        if (obj.error) throw new Error(`Ollama: ${obj.error}`);
      }
    }
    return full;
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
      // allowNavigate is ignored — the local provider always composes a page.
    }) {
      onStatus(verify ? 'Sprig is reviewing (local model, no live web)…' : deep ? 'Sprig is composing a report (local model)…' : 'Sprig is thinking (local model)…');

      let system = verify ? VERIFY_PROMPT : deep ? DEEP_PROMPT : SYSTEM_PROMPT;
      {
        const now = new Date();
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
        system += `\n\nTODAY'S DATE: ${date}. CURRENT LOCAL TIME: ${time} — the user's local timezone is "${tz}". Treat this as the current moment in the user's LOCAL time, not UTC. Anything involving time (a clock, "now", a schedule) MUST be in the user's local timezone — for a live clock, format with that IANA zone explicitly, e.g. new Intl.DateTimeFormat([], { timeZone: "${tz}", hour: "2-digit", minute: "2-digit", second: "2-digit" }). Never display UTC unless the user explicitly asks for it.`;
      }
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
      const images = [];
      for (const a of (attachments || [])) {
        if (!a) continue;
        if (a.kind === 'text') userText += `\n\n--- Attached file: ${a.name || 'file'} ---\n${String(a.text || '').slice(0, 30000)}`;
        else if (a.kind === 'image' && a.data) images.push(a.data);
        else if (a.kind === 'pdf') userText += `\n\n(Note: a PDF "${a.name || 'file'}" was attached, but this local model can't read PDFs — switch to Claude to use it.)`;
      }
      const userMsg = { role: 'user', content: userText };
      if (images.length) userMsg.images = images; // multimodal Ollama models only

      const messages = [...normalizeHistory(history), userMsg];

      const raw = await chat({ system, messages, onText });

      let refine = refineMode === 'force';
      if (refineMode === 'auto' && /<!--\s*chervil:refine\s*-->/i.test(raw)) refine = true;

      const html = extractHtml(raw);
      return {
        kind: 'page',
        html,
        title: extractTitle(html) || titleFromQuery(query),
        sources: [],
        searches: [],
        refine,
      };
    },

    async quickAsk({ prompt }) {
      const text = await chat({
        system: APPLET_PROMPT,
        messages: [{ role: 'user', content: String(prompt || '').slice(0, 4000) }],
      });
      return { text: text.trim(), sources: [] };
    },

    // Plain completion (used by the web-agent loop to decide actions).
    async complete({ system, prompt }) {
      const text = await chat({ system, messages: [{ role: 'user', content: String(prompt || '') }] });
      return text.trim();
    },

    // Models pulled locally in Ollama (free, no key).
    async listModels() {
      try {
        const res = await fetch(`${url}/api/tags`);
        if (!res.ok) return [];
        const j = await res.json();
        return (j.models || []).map((m) => m.name).filter(Boolean);
      } catch {
        return [];
      }
    },
  };
}

// --- helpers (local copies so this provider stays self-contained) ---------

function connError(err, url) {
  const code = err && err.cause && err.cause.code;
  if (code === 'ECONNREFUSED' || /fetch failed/i.test(err && err.message)) {
    return new Error(
      `Couldn't reach Ollama at ${url}. Make sure Ollama is running (launch the Ollama app or run "ollama serve") and that a model is pulled. Or switch the provider to Claude in Settings.`
    );
  }
  return err instanceof Error ? err : new Error(String(err));
}

function normalizeHistory(history) {
  return (Array.isArray(history) ? history : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
    .map((m) => ({ role: m.role, content: String(m.content) }));
}

function extractHtml(text) {
  if (!text) return fallbackPage('Sprig (local model) returned an empty page.');
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

module.exports = { createOllamaProvider };
