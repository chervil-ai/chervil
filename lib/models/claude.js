'use strict';

const Anthropic = require('@anthropic-ai/sdk');

// Sonnet 4.6 is the default: it's fast and excellent at composing HTML, which
// matters far more than peak reasoning for a responsive browser. Set
// CHERVIL_MODEL=claude-opus-4-8 for maximum quality at the cost of latency.
// (The legacy PINGCHAT_* names are still honored as a fallback.)
const DEFAULT_MODEL =
  process.env.CHERVIL_MODEL || process.env.PARSLEE_MODEL || process.env.PINGCHAT_MODEL || 'claude-sonnet-4-6';

// Effort controls how much the model deliberates. "low" keeps Chervil snappy;
// bump to CHERVIL_EFFORT=medium/high if you want richer pages and don't mind waiting.
const EFFORT = process.env.CHERVIL_EFFORT || process.env.PARSLEE_EFFORT || process.env.PINGCHAT_EFFORT || 'low';

// Applet bridge calls (window.chervil.ask) are lightweight live-data lookups, so they
// use a FAST model and minimal research to keep applets responsive. Override with
// CHERVIL_APPLET_MODEL (e.g. set it to claude-sonnet-4-6 for richer answers).
const APPLET_MODEL = process.env.CHERVIL_APPLET_MODEL || process.env.PARSLEE_APPLET_MODEL || 'claude-haiku-4-5-20251001';

// The model decides between two responses per query:
//   1. Synthesize a rich, self-contained HTML page (the default), or
//   2. Call open_website to embed a real, existing site in a browser view.
const OPEN_WEBSITE_TOOL = {
  name: 'open_website',
  description:
    'Open a real, existing website in an embedded live browser view. Use this ONLY when the user clearly wants to visit a specific real site or web app — e.g. "open YouTube", "go to gmail", "take me to github.com/anthropics", online banking, a login-required app, or any live interactive service. Do NOT use this for informational questions that you can answer by composing a page yourself.\n\nURL ACCURACY IS CRITICAL — do NOT guess vanity/handle URLs. If the user names a specific channel, profile, creator, product, or other entity whose EXACT canonical URL you are not certain of (e.g. "the Jolly channel on YouTube", "Marques Brownlee\'s channel", "the React docs"), do NOT invent a path like youtube.com/@SomeGuess — guessed handles usually land on the wrong or an obscure page. Instead either: (a) FIRST call web_search to find the correct canonical URL, then open_website that exact URL; or (b) open the site\'s SEARCH results for the entity so the user can pick the right one (e.g. https://www.youtube.com/results?search_query=Jolly, https://www.amazon.com/s?k=...). Only pass a bare domain or a path you are genuinely confident is correct.',
  input_schema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description:
          'The full URL to open, including https://. Must be a real URL you are confident about — a known canonical page, a URL you just confirmed via web_search, or the site\'s search-results URL for the user\'s query. Never a guessed handle/vanity path.',
      },
      reason: {
        type: 'string',
        description: 'A short, friendly explanation of why you are navigating there.',
      },
    },
    required: ['url'],
  },
};

// Injected into every system prompt so Sprig knows the current date and treats
// "today/latest/recent" as now (and actually searches) instead of reciting
// stale training-data facts.
function dateAddendum() {
  const now = new Date();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  return `\n\nTODAY'S DATE: ${date}. CURRENT LOCAL TIME: ${time} — the user's local timezone is "${tz}". Treat this as the current moment in the user's LOCAL time, not UTC. Anything you show or compute involving time (a clock, "now", a schedule, a countdown) MUST be in the user's local timezone — for a live clock in a composed page, format with that IANA zone explicitly, e.g. new Intl.DateTimeFormat([], { timeZone: "${tz}", hour: "2-digit", minute: "2-digit", second: "2-digit" }). Never display UTC unless the user explicitly asks for it. When the user asks for "today", "latest", "recent", "this week", or "the last 24 hours", anchor to this date and use web_search to fetch current information — never present remembered or training-data facts as current. If results look older than this date for a "latest"/"news" request, search again with the current month and year.`;
}

const SYSTEM_PROMPT = `You are Sprig, the friendly leafy guide of Chervil — the agentic, conversational web browser. Users chat with you by name. Instead of a list of blue links you bring the web alive as a single, beautiful, self-contained web page.

For every user query, do ONE of these two things:

1. COMPOSE A PAGE (the default). Answer the user's request by writing a complete, standalone HTML document. This is the heart of Chervil.
   - SPEED MATTERS. Only search the web when the query genuinely needs live or recent data — current events, news, prices, scores, schedules, new releases, weather, "today/this week/latest", or who currently holds a role. For general knowledge, explanations, how-tos, plans, and evergreen topics you already know well, answer IMMEDIATELY without searching.
   - When you do search, prefer web_search result snippets; only use web_fetch when you truly must read one specific page in depth. Don't fetch many pages. Never invent current facts or image URLs.
   - Output a COMPLETE HTML document starting with <!DOCTYPE html>. Inline all CSS in a <style> tag. Do not link to external stylesheets or JS frameworks.
   - Make it genuinely beautiful and modern: thoughtful typography, generous spacing, a coherent color theme, cards, and clear hierarchy. Design like a polished magazine or product page, not a plain document.
   - Use real images by referencing real image URLs you discovered via search/fetch. Only use <img> tags whose src you are confident is a real, hot-linkable image URL. Never invent image URLs.
   - Include a compact "Sources" section at the bottom linking to the real pages you used, when you used the web.
   - Set a concise, descriptive <title>.
   - You MAY include vanilla JavaScript for interactivity. INTERACTIVE APPLETS: Chervil injects a live bridge so your page's own JavaScript can call you (Sprig) at runtime. From a <script>, after guarding with \`if (window.chervil)\`, call \`await window.chervil.ask("...")\` — it resolves to \`{ text, sources }\`, a fresh, web-grounded answer. Use this to build genuine mini-apps whenever interactivity or on-demand fresh data makes the page better: trackers, calculators that look real values up, dashboards, comparison tools, "refresh"/"check now" buttons. Wire controls to window.chervil.ask, show a loading state while it runs, and render the returned text into the DOM — ask for JSON in your prompt when you need structured data to parse. For static, evergreen answers, skip the bridge and just compose. No external scripts or frameworks. MACHINE INFO: the bridge also exposes \`await window.chervil.info()\` (guard with \`if (window.chervil && window.chervil.info)\`) which resolves to read-only facts about THIS computer — { platform, osType, osRelease, arch, hostname, username, cpuModel, cpuCores, memory:{total,free}, memoryUsedPct, disk:{total,free,used}, uptimeSec, loadavg, ipv4, versions }. Use it when the user asks about their computer/system/specs/memory/disk (e.g. "check my computer", "how much RAM do I have") to build a real system-info dashboard from actual values — never invent specs. Bytes are raw; format them (GB) for display. For deeper OS facts (Windows edition/version/build, install date, last boot, WINDOWS UPDATE history, GPU, battery, manufacturer/model, BIOS) call \`await window.chervil.details()\` (also guard it) → { edition, displayVersion, version, build, installDate, lastBoot, manufacturer, model, bios, gpu:[...], lastHotfix, lastHotfixDate, lastUpdateInstall, lastUpdateCheck, batteryPct }. Use it for questions like "when did Windows Update last run", "what Windows version am I on", "what GPU do I have". It runs a slower system query, so call it only when the question needs it, and show a loading state. Some fields may be null (not available on this machine) — just omit those. These are READ-ONLY facts; you cannot change settings or run commands.
   - REAL-WORLD ACTIONS: Chervil turns certain links into one-tap device actions, so emit them as plain links instead of recreating the feature. For a real-world place or address, link its name to Google Maps — <a href="https://www.google.com/maps/search/?api=1&query=URL_ENCODED_PLACE_OR_ADDRESS">Place name</a> — and NEVER draw, embed, or fake a map. For a phone number, use a tel: link — <a href="tel:+15551234567">(555) 123-4567</a>. Chervil lets the user open the map (or send the pin to their phone) and call the number (or send it to their phone).
   - NEVER fake a capability you don't have. You compose HTML pages only — you CANNOT generate or hand over downloadable binary/native files (PowerPoint .pptx, Word .docx, Excel .xlsx, .zip, etc.). Do NOT render "Download …" buttons or claim a file is "ready" to download for a format you can't actually produce — that breaks trust. If the user asks for a PowerPoint/Word/Excel, compose the content as a beautiful page instead (for slides, a slide-deck-style page), and tell them honestly they can export the page to PDF (the ⤓ PDF button) or Save it as HTML — a native .pptx/.docx isn't something you can deliver.
   - Your final text response must be ONLY the raw HTML document — no markdown, no code fences, no commentary before or after.

2. OPEN A REAL SITE. If the user clearly wants a specific live website or web app (see the open_website tool), call open_website instead of composing a page. Get the URL RIGHT: if you're not certain of the exact canonical URL for a named channel, profile, creator, or product, do NOT guess a handle/vanity path (guesses land on the wrong page). First web_search for the correct URL and open that, or open the site's search-results URL for the query (e.g. https://www.youtube.com/results?search_query=Jolly) so the user lands somewhere correct.

Be timely, accurate, and visually delightful. You are replacing the browser — act like it.`;

// Appended when the user is looking at a page you composed and might want to refine it.
// In "auto" mode the model decides refine-vs-new and signals it with a marker comment that
// the renderer reads (and strips) to know whether to replace the page or push a new one.
const REFINE_AUTO_ADDENDUM = `

CONTEXT: The user is currently viewing a page you composed (its full HTML is included with their message for reference). Their new message may either ask you to MODIFY that page, or be an unrelated new request.
- Decide which it is, then begin your output with EXACTLY ONE of these marker comments, on its own first line:
  <!-- chervil:refine -->   (you are revising the page shown — output the COMPLETE revised HTML document)
  <!-- chervil:new -->      (this is a new, unrelated request — output a fresh HTML document)
- The marker is mandatory and MUST be the very first characters you output, before <!DOCTYPE html>.`;

// Appended when the user explicitly chose "Refine this page".
const REFINE_FORCE_ADDENDUM = `

CONTEXT: The user is viewing a page you composed (its full HTML is included with their message for reference) and wants you to REVISE it per their request. Output the COMPLETE revised HTML document — keep everything that still applies and change only what they asked for.`;

// System prompt for applet bridge calls (window.chervil.ask). The reply is rendered
// by the page itself, so it must be raw data — not a composed page.
const APPLET_SYSTEM_PROMPT = `You are Sprig, answering a data request coming from an interactive applet embedded in a Chervil page. Be FAST: do at most ONE web search and answer directly from the result snippets — do not read full pages or over-research. Reply with a concise, direct answer to exactly what is asked — no preamble, no sign-off, no markdown. If the request asks for JSON, output ONLY valid minified JSON (no prose, no code fences). Only search when the answer depends on live or recent data; otherwise answer immediately from what you know.`;

// Deep Dive is two-phase: (1) research into a findings brief, then (2) compose a
// cited report from that brief. Splitting them keeps the compose step fast and
// uncluttered by raw tool results, and yields a properly long, cited report.

// Phase 1 — research the topic into a structured brief (no HTML), vetting sources.
const DEEP_RESEARCH_PROMPT = `You are Sprig researching a topic for an in-depth report. Use web_search from several different angles, and web_fetch to read the most important sources.

VET FOR DISINFORMATION as you research — this is required, not optional:
- Favor primary sources and reputable, independent outlets. Be skeptical of low-credibility sites, anonymous or single-source claims, content farms, and anything that reads as propaganda, marketing spin, or an agenda.
- CROSS-CHECK every significant claim against at least two independent, credible sources before trusting it.
- Watch for red flags: claims that conflict across reliable sources, missing/lone sourcing, outdated info presented as current, manipulated statistics, or sources that cite only themselves.

Then output ONLY a structured research brief — NOT a webpage and NOT HTML:
- A thorough set of concise, factual findings as bullet points (specifics: numbers, names, dates, pros/cons, comparisons).
- After each finding, put the supporting source URL(s) in parentheses AND a confidence tag: [well-established], [contested], or [unverified].
- A "CAVEATS" list: disputed or uncertain points, claims you could only single-source, and any sources you judged unreliable (with a one-line reason).
- A "SOURCES" list: every source URL with its page title.
Be comprehensive, accurate, and skeptical. Never present a contested or unverified claim as settled fact.`;

// Phase 2 — compose the cited report from the research brief (no tools).
const DEEP_DIVE_SYSTEM_PROMPT = `You are Sprig composing an in-depth research report. You are given the user's topic and a research brief (factual findings, each with source URLs). Turn it into a LONG, authoritative, beautifully structured HTML report — not a quick summary:
- A clear <title>, a headline, and a 2–4 sentence executive summary up top.
- A sticky/linked table of contents and several well-organized sections with headings. Use comparison tables, pros/cons, callouts, and data where useful.
- INLINE CITATIONS: attach bracketed, numbered citation links (e.g. <sup><a href="URL">[1]</a></sup>) to the specific claims they support, using the source URLs from the brief.
- CREDIBILITY (required): faithfully carry over the brief's confidence tags. Visibly distinguish well-established facts from contested or unverified claims (e.g. an inline "contested" / "unverified" chip or note) — NEVER present a contested or unverified claim as settled fact. Include a clear "Verify & caveats" section near the end that summarizes the disputed points, uncertainties, and any sources flagged as unreliable, so the reader knows what to trust and what to double-check.
- A complete "Sources" section at the bottom listing every source with its title and link.
- Make it genuinely beautiful and readable: thoughtful typography, generous spacing, a coherent theme, clear hierarchy.
- You MAY include vanilla JavaScript for interactivity (collapsible sections, a sticky TOC), and the window.chervil.ask bridge (guard with \`if (window.chervil)\`) where a live element helps.
- Output ONLY the raw HTML document — no markdown, no code fences, no commentary.

Be comprehensive, balanced, and rigorously cited — turn the brief into the report the user deserves.`;

// Trust layer: adversarially fact-check the page the user is viewing.
const VERIFY_SYSTEM_PROMPT = `You are Sprig, fact-checking a web page the user is viewing (its full HTML is included with their message). Be skeptical and rigorous.

1. Identify the page's main factual claims.
2. Use web_search (and web_fetch when needed) to verify EACH claim against reputable, independent sources. Cross-check; prefer primary/authoritative sources.

Then compose a "Trust Check" report as a COMPLETE, beautiful, self-contained HTML document:
- A headline verdict at the top (e.g. "Mostly solid — 2 claims need caution") with an at-a-glance trust summary.
- For EACH key claim: the claim text, a verdict chip — ✅ Verified / ⚠️ Contested / ❓ Unverified / ❌ False — a one-line basis, and a citation link to the source you checked.
- Explicitly flag anything that reads as misinformation, propaganda, outdated-as-current, or single-sourced.
- A "Sources checked" section listing every source with its link.
- Inline all CSS in a <style> tag; make it clean and scannable with clear color-coded verdicts (use real HTML, e.g. a styled <table>, NOT a markdown table). No external resources.

CRITICAL FORMAT: Your ENTIRE reply is the single HTML document — it must begin with <!DOCTYPE html> and end with </html>. Do NOT write any reasoning, preamble, "here is your report", or markdown summary before or after the HTML. Nothing after </html>.

If a claim can't be verified, say so honestly in the report rather than guessing.`;

// Appended when the user is working inside a research Space — Sprig grounds the page
// in the pages they've already collected and synthesizes across them.
const SPACE_ADDENDUM = `

The user is working inside a research Space and has included notes from pages they previously collected (below their message). SYNTHESIZE across those collected pages — compare them, connect them, and draw conclusions grounded in them, treating them as the user's own prior research. You may also use web search to fill gaps or refresh facts. Include a brief "From your Space" note in the page listing which collected pages you drew on.`;

function createClaudeProvider(config = {}) {
  // Key/model come from the in-app settings first, then env, then defaults.
  const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Defer the error to run() so the UI can render a friendly setup screen.
    return {
      run: async () => {
        const err = new Error(
          'No Anthropic API key set. Add one in Settings → Provider (or set ANTHROPIC_API_KEY), or switch the provider to Ollama for free local development.'
        );
        err.code = 'NO_API_KEY';
        throw err;
      },
      quickAsk: async () => ({ text: '', sources: [] }),
      listModels: async () => [],
      complete: async () => { throw new Error('No Anthropic API key set (Settings → Provider).'); },
    };
  }

  const model = config.model || DEFAULT_MODEL;

  // maxRetries covers connection/5xx/429 errors that occur *before* the stream
  // starts. Mid-stream drops (undici "terminated") aren't auto-retried by the
  // SDK, so we add our own retry around the streaming attempt below.
  const client = new Anthropic({ apiKey, maxRetries: 4 });

  const DEEP_MODEL = process.env.CHERVIL_DEEP_MODEL || process.env.PARSLEE_DEEP_MODEL || model;
  const DEEP_EFFORT = process.env.CHERVIL_DEEP_EFFORT || process.env.PARSLEE_DEEP_EFFORT || 'medium';

  // Deep Dive: research the topic into a findings brief (phase 1, bounded), then
  // compose a long cited report from that brief (phase 2, streamed for preview).
  // Keeping the phases separate avoids burying the compose step under raw tool
  // results — the failure mode that produced short, uncited reports.
  async function deepDive({ query, history = [], onStatus = () => {}, onText = () => {}, spaceContext = null, profile = null, agent = null }) {
    // --- Phase 1: research → brief ---
    onStatus('Sprig is researching deeply…');
    const researchMessages = [
      ...normalizeHistory(history),
      {
        role: 'user',
        content:
          `Research this thoroughly for an in-depth report: ${query}` +
          (spaceContext ? `\n\nFor reference, notes from pages I've already collected:\n\n${spaceContext}` : ''),
      },
    ];
    const researchTools = [
      { type: 'web_search_20260209', name: 'web_search', max_uses: 8 },
      { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: 5 },
    ];

    let sources = [];
    let brief = '';
    let containerId = null; // code-execution container; echoed back on resume
    let guard = 0;
    while (guard++ < 8) {
      const msg = await streamWithRetry(
        client,
        {
          model: DEEP_MODEL,
          max_tokens: 8000,
          output_config: { effort: DEEP_EFFORT },
          system: DEEP_RESEARCH_PROMPT + dateAddendum(),
          tools: researchTools,
          messages: researchMessages,
          ...(containerId ? { container: containerId } : {}),
        },
        { onStatus, onText: () => {} } // don't stream the brief into the page preview
      );
      if (msg.container && msg.container.id) containerId = msg.container.id;
      sources = sources.concat(collectSources(msg));
      if (msg.stop_reason === 'pause_turn') {
        researchMessages.push({ role: 'assistant', content: msg.content });
        continue;
      }
      brief = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
      break;
    }
    // Dedupe sources by URL.
    const seen = new Set();
    sources = sources.filter((s) => s && s.url && !seen.has(s.url) && seen.add(s.url));

    // --- Phase 2: compose the cited report from the brief (no tools, streamed) ---
    onStatus('Sprig is writing your report…');
    const composeMessages = [
      {
        role: 'user',
        content: `Topic: ${query}\n\nResearch brief (factual findings with source URLs) — turn this into the full, beautifully structured, cited HTML report:\n\n${brief || '(no brief was produced — compose the best report you can from what you know, and be transparent about gaps.)'}`,
      },
    ];
    const msg2 = await streamWithRetry(
      client,
      {
        model: DEEP_MODEL,
        max_tokens: 64000,
        output_config: { effort: DEEP_EFFORT },
        system: DEEP_DIVE_SYSTEM_PROMPT + dateAddendum() + (profile ? profileAddendum(profile) : '') + (agent ? agentAddendum(agent) : ''),
        messages: composeMessages,
      },
      { onStatus, onText }
    );
    const rawText = msg2.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    const html = extractHtml(rawText);
    return {
      kind: 'page',
      html,
      title: extractTitle(html) || titleFromQuery(query),
      sources,
      refine: false,
    };
  }

  return {
    async run({
      query,
      history = [],
      onStatus = () => {},
      onText = () => {},
      pageContext = null,   // HTML of the page the user is currently viewing (ephemeral)
      allowNavigate = true, // false => drop open_website so the model always composes
      refineMode = null,    // 'auto' | 'force' | null — how follow-ups treat the current page
      spaceContext = null,  // notes from the user's collected Space pages (ephemeral)
      deep = false,         // Deep Dive — thorough, cited research report (slower)
      verify = false,       // Trust layer — adversarially fact-check the given page
      profile = null,       // the user's personal "About you" memory (tailors pages)
      attachments = [],     // user-attached files: {name, kind:'text'|'image'|'pdf', text?, data?, mediaType?}
      mcpServers = [],      // connected MCP servers: {name, url, token?, enabled} — Claude's native remote MCP connector
      agent = null,         // active agent persona/instructions (from an imported agent file)
      signal = null,        // AbortSignal — the renderer's Stop button cancels the request
    }) {
      // Deep Dive runs a separate two-phase (research → compose) pipeline.
      if (deep) return deepDive({ query, history, onStatus, onText, spaceContext, profile, agent });

      // Ephemeral context attached to this one turn (never stored in history):
      //   - pageContext: the page being viewed, for in-place refinement
      //   - spaceContext: notes from the user's collected Space pages, for synthesis
      let extra = '';
      if (pageContext) extra += `\n\n---\nFor reference, here is the full HTML of the page I'm currently viewing:\n\n${pageContext}`;
      if (spaceContext) extra += `\n\n---\nNotes from pages I've already collected in my research Space:\n\n${spaceContext}`;
      const userContent = extra ? `${query}${extra}` : query;

      const messages = [
        ...normalizeHistory(history),
        { role: 'user', content: applyAttachments(userContent, attachments) },
      ];

      let system = (verify ? VERIFY_SYSTEM_PROMPT : SYSTEM_PROMPT) + dateAddendum();
      if (!verify) {
        if (pageContext && refineMode === 'force') system += REFINE_FORCE_ADDENDUM;
        else if (pageContext && refineMode === 'auto') system += REFINE_AUTO_ADDENDUM;
        if (spaceContext) system += SPACE_ADDENDUM;
        if (profile) system += profileAddendum(profile);
        if (agent) system += agentAddendum(agent);
      }

      // Verify mode forces web search (to fact-check) and never opens a site.
      const tools = verify
        ? [
            { type: 'web_search_20260209', name: 'web_search', max_uses: 8 },
            { type: 'web_fetch_20260209', name: 'web_fetch' },
          ]
        : [
            { type: 'web_search_20260209', name: 'web_search' },
            { type: 'web_fetch_20260209', name: 'web_fetch' },
            ...(allowNavigate ? [OPEN_WEBSITE_TOOL] : []),
          ];

      onStatus(verify ? 'Sprig is fact-checking…' : 'Sprig is thinking…');

      // Connected MCP servers (Claude's native remote MCP connector). Their tools run
      // server-side as part of this request — the opt-in config IS the trust gate, so we
      // recommend trusted/read-only servers. When any are enabled we add `mcp_servers` to
      // the request body and the `mcp-client-2025-04-04` beta header.
      const mcpParam = buildMcpServers(mcpServers);
      const reqOptions = {
        ...(mcpParam ? { headers: { 'anthropic-beta': 'mcp-client-2025-04-04' } } : {}),
        ...(signal ? { signal } : {}),
      };

      // Accumulate grounding across pause_turn rounds (final msg only holds the last round).
      let allSources = [];
      let allSearches = [];
      let containerId = null; // code-execution container; must be echoed back on resume

      // Server-side tools (web_search/web_fetch) run inside the request. They can
      // hit the server-loop cap and return stop_reason "pause_turn"; we resume by
      // re-sending. The only client-side tool is open_website.
      let guard = 0;
      while (guard++ < (verify ? 12 : 8)) {
        const msg = await streamWithRetry(
          client,
          {
            model,
            max_tokens: 64000,
            output_config: { effort: EFFORT },
            system,
            tools,
            messages,
            ...(mcpParam ? { mcp_servers: mcpParam } : {}),
            ...(containerId ? { container: containerId } : {}),
          },
          { onStatus, onText },
          reqOptions
        );

        if (msg.container && msg.container.id) containerId = msg.container.id;
        allSources = allSources.concat(collectSources(msg));
        allSearches = allSearches.concat(collectSearches(msg));

        // Did the model decide to open a real website?
        const nav = msg.content.find(
          (b) => b.type === 'tool_use' && b.name === 'open_website'
        );
        if (nav) {
          return { kind: 'navigate', url: nav.input.url, reason: nav.input.reason };
        }

        // Server tools paused the turn — resume.
        if (msg.stop_reason === 'pause_turn') {
          messages.push({ role: 'assistant', content: msg.content });
          continue;
        }

        const rawText = msg.content
          .filter((b) => b.type === 'text')
          .map((b) => b.text)
          .join('');

        // Follow-up marker: the model signals whether it revised the current page
        // (replace in place) or made a new one (push). Forced refine always replaces.
        let refine = refineMode === 'force';
        if (refineMode === 'auto' && /<!--\s*chervil:refine\s*-->/i.test(rawText)) {
          refine = true;
        }

        const html = extractHtml(rawText);
        return {
          kind: 'page',
          html,
          title: extractTitle(html) || titleFromQuery(query),
          sources: dedupeSources(allSources),
          searches: [...new Set(allSearches)],
          refine,
        };
      }

      throw new Error('Chervil could not complete the request (too many tool rounds).');
    },

    // Lightweight, web-grounded Q&A for interactive applets (window.chervil.ask).
    // Returns plain text/JSON that the page renders itself — no page composition.
    // Plain, tool-free completion (used by the web-agent loop to decide actions).
    async complete({ system, prompt, maxTokens = 1200 }) {
      const msg = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: String(prompt || '') }],
      });
      return msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
    },

    // Live list of available Claude models (free metadata call).
    async listModels() {
      try {
        const page = await client.models.list({ limit: 100 });
        return (page.data || []).map((m) => m.id).filter(Boolean);
      } catch {
        return [];
      }
    },

    async quickAsk({ prompt }) {
      const messages = [{ role: 'user', content: String(prompt || '').slice(0, 4000) }];
      // Snippet-only search (no slow full-page web_fetch), capped to keep applets snappy.
      // allowed_callers:['direct'] keeps it compatible with fast models like Haiku.
      const tools = [
        { type: 'web_search_20260209', name: 'web_search', max_uses: 2, allowed_callers: ['direct'] },
      ];
      let containerId = null; // code-execution container; echoed back on resume
      let guard = 0;
      while (guard++ < 4) {
        const msg = await client.messages.create({
          model: APPLET_MODEL,
          max_tokens: 1500,
          system: APPLET_SYSTEM_PROMPT,
          tools,
          messages,
          ...(containerId ? { container: containerId } : {}),
        });
        if (msg.container && msg.container.id) containerId = msg.container.id;
        if (msg.stop_reason === 'pause_turn') {
          messages.push({ role: 'assistant', content: msg.content });
          continue;
        }
        const text = msg.content
          .filter((b) => b.type === 'text')
          .map((b) => b.text)
          .join('')
          .trim();
        return { text, sources: collectSources(msg) };
      }
      return { text: '', sources: [] };
    },
  };
}

// --- streaming with mid-stream retry -------------------------------------

const MAX_STREAM_ATTEMPTS = 3;

// Runs one streaming request, retrying if the connection drops mid-stream
// (common behind corporate proxies / VPNs that interrupt long HTTPS streams).
async function streamWithRetry(client, params, { onStatus, onText }, reqOptions = undefined) {
  let lastErr = null;

  for (let attempt = 1; attempt <= MAX_STREAM_ATTEMPTS; attempt++) {
    try {
      const stream = client.messages.stream(params, reqOptions);

      stream.on('streamEvent', (evt) => {
        if (evt.type === 'content_block_start' && evt.content_block) {
          const cb = evt.content_block;
          if (cb.type === 'server_tool_use') {
            if (cb.name === 'web_search') onStatus('Sprig is searching the web…');
            else if (cb.name === 'web_fetch') onStatus('Sprig is reading sources…');
          } else if (cb.type === 'mcp_tool_use') {
            // A connected MCP server's tool — name it so the user sees the action.
            const label = prettyMcpTool(cb.name);
            onStatus(`Sprig is using ${label}…`);
          }
        }
      });

      stream.on('text', (delta) => onText(delta));

      return await stream.finalMessage();
    } catch (err) {
      lastErr = err;
      // A user-initiated abort isn't transient — stop immediately, don't retry.
      if (reqOptions && reqOptions.signal && reqOptions.signal.aborted) throw err;
      if (!isTransient(err) || attempt === MAX_STREAM_ATTEMPTS) break;
      onStatus(`Connection dropped — retrying (${attempt}/${MAX_STREAM_ATTEMPTS - 1})…`);
      await sleep(600 * attempt);
    }
  }

  throw describeError(lastErr);
}

function isTransient(err) {
  if (!err) return false;
  const name = err.name || (err.constructor && err.constructor.name) || '';
  const parts = [err.message, err.cause && err.cause.message, err.cause && err.cause.code];
  const msg = parts.filter(Boolean).join(' ');
  return (
    /terminated|ECONNRESET|ETIMEDOUT|EPIPE|socket hang ?up|network|fetch failed|aborted|other side closed|UND_ERR/i.test(
      msg
    ) ||
    name === 'APIConnectionError' ||
    name === 'APIConnectionTimeoutError'
  );
}

// Turn cryptic low-level errors (e.g. undici's bare "terminated") into something
// actionable before it reaches the UI.
function describeError(err) {
  if (err && isTransient(err)) {
    const code = err.cause && err.cause.code ? ` (${err.cause.code})` : '';
    return new Error(
      `The connection to the Anthropic API kept dropping${code}. This is usually a network issue — ` +
        `if you're on a corporate network or VPN, a proxy may be interrupting the streaming connection. ` +
        `Try a different network, or set the HTTPS_PROXY environment variable to your proxy.`
    );
  }
  return err instanceof Error ? err : new Error(String(err));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- helpers -------------------------------------------------------------

function normalizeHistory(history) {
  // History items are { role: 'user'|'assistant', content: string }.
  return history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
    .map((m) => ({ role: m.role, content: String(m.content) }));
}

function extractHtml(text) {
  if (!text) return fallbackPage('Chervil returned an empty page.');
  let t = text.trim();

  // Strip a ```html ... ``` fence if the model added one despite instructions.
  const fence = t.match(/^```(?:html)?\s*([\s\S]*?)\s*```$/i);
  if (fence) t = fence[1].trim();

  const idx = t.search(/<!DOCTYPE html>|<html[\s>]/i);
  if (idx >= 0) {
    let doc = t.slice(idx);
    // Drop any trailing prose/markdown the model added after </html>.
    const end = doc.search(/<\/html\s*>/i);
    if (end >= 0) doc = doc.slice(0, end + doc.slice(end).indexOf('>') + 1);
    return doc;
  }

  // No HTML document — render whatever came back (often markdown) so it still looks good.
  return fallbackPage(t, /* raw */ true);
}

// Minimal Markdown → HTML for the fallback (headings, tables, bold/italic/code,
// links, lists) so a degraded (non-HTML) response still renders cleanly.
function mdToHtml(md) {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (s) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+?)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((https?:[^)]+)\)/g, '<a href="$2">$1</a>');
  const lines = String(md).split(/\r?\n/);
  let html = '';
  let i = 0;
  const isTableRow = (l) => /^\s*\|.*\|\s*$/.test(l);
  const cells = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*#{1,6}\s/.test(line)) {
      const m = line.match(/^\s*(#{1,6})\s+(.*)$/);
      html += `<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`; i++; continue;
    }
    if (isTableRow(line) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
      const rows = [];
      while (i < lines.length && isTableRow(lines[i])) { rows.push(lines[i]); i++; }
      let t = '<table><thead><tr>' + cells(rows[0]).map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>';
      for (let r = 2; r < rows.length; r++) t += '<tr>' + cells(rows[r]).map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>';
      html += t + '</tbody></table>'; continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      let items = '';
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items += `<li>${inline(lines[i].replace(/^\s*[-*]\s+/, ''))}</li>`; i++; }
      html += `<ul>${items}</ul>`; continue;
    }
    if (/^\s*---+\s*$/.test(line)) { html += '<hr>'; i++; continue; }
    if (/^\s*$/.test(line)) { i++; continue; }
    let para = line; i++;
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^\s*(#|\||[-*]\s|---)/.test(lines[i])) { para += ' ' + lines[i]; i++; }
    html += `<p>${inline(para)}</p>`;
  }
  return html;
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? m[1].trim() : null;
}

function titleFromQuery(query) {
  const q = String(query || '').trim();
  return q.length > 60 ? q.slice(0, 57) + '…' : q || 'Chervil';
}

// Fold user-attached files into a Claude message: text files appended to the prompt,
// images and PDFs as native content blocks. Returns a string (text-only) or a blocks array.
function applyAttachments(text, attachments) {
  if (!attachments || !attachments.length) return text;
  let t = text;
  const media = [];
  for (const a of attachments) {
    if (!a) continue;
    if (a.kind === 'text') {
      t += `\n\n--- Attached file: ${a.name || 'file'} ---\n${String(a.text || '').slice(0, 30000)}`;
    } else if (a.kind === 'image' && a.data) {
      media.push({ type: 'image', source: { type: 'base64', media_type: a.mediaType || 'image/png', data: a.data } });
    } else if (a.kind === 'pdf' && a.data) {
      media.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: a.data } });
    }
  }
  if (!media.length) return t;
  return [{ type: 'text', text: t }, ...media];
}

// The user's personal "About you" memory, injected so Sprig tailors pages.
function profileAddendum(p) {
  return `\n\nABOUT THE USER (personal context — use it to tailor tone, examples, units, locale, defaults, and relevance when it helps; do NOT shoehorn it in): ${String(p).slice(0, 1500)}`;
}

// An imported "agent file": a persona + instructions that shape this response.
function agentAddendum(a) {
  return `\n\nACTIVE AGENT — adopt this persona and follow these instructions for this response, overriding your default style where they conflict (but keep composing a single self-contained HTML page as usual):\n${String(a).slice(0, 4000)}`;
}

function collectSources(msg) {
  const sources = [];
  for (const block of msg.content) {
    if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
      for (const r of block.content) {
        if (r && r.type === 'web_search_result' && r.url) {
          sources.push({ url: r.url, title: r.title || r.url });
        }
      }
    }
  }
  return sources;
}

// The search queries Sprig ran (the "show your work" trace).
function collectSearches(msg) {
  const out = [];
  for (const block of msg.content) {
    if (block.type === 'server_tool_use' && block.name === 'web_search' && block.input && block.input.query) {
      out.push(String(block.input.query));
    }
  }
  return out;
}

// Turn the app's MCP server settings into the API's `mcp_servers` shape
// (BetaRequestMCPServerURLDefinition). Only enabled servers with a URL are sent.
// Names are sanitized to the [a-zA-Z0-9_-] the connector requires.
function buildMcpServers(servers) {
  const list = (servers || []).filter((s) => s && s.url && s.enabled !== false);
  if (!list.length) return null;
  return list.map((s, i) => {
    const def = {
      type: 'url',
      url: String(s.url).trim(),
      name: (String(s.name || `mcp-${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60)) || `mcp-${i + 1}`,
    };
    if (s.token) def.authorization_token = String(s.token).trim();
    // Optional per-server allow-list of tool names.
    if (Array.isArray(s.allowedTools) && s.allowedTools.length) {
      def.tool_configuration = { enabled: true, allowed_tools: s.allowedTools };
    }
    return def;
  });
}

// "github__create_issue" -> "create issue" for a friendlier status line.
function prettyMcpTool(name) {
  const raw = String(name || 'a tool');
  const tail = raw.includes('__') ? raw.split('__').pop() : raw;
  return tail.replace(/[_-]+/g, ' ').trim() || raw;
}

function dedupeSources(list) {
  const seen = new Set();
  const out = [];
  for (const s of list) {
    if (s && s.url && !seen.has(s.url)) { seen.add(s.url); out.push(s); }
  }
  return out;
}

function fallbackPage(body, raw = false) {
  const content = raw
    ? mdToHtml(body)
    : `<p>${String(body).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))}</p>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Chervil</title>
<style>
  body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;max-width:760px;margin:48px auto;padding:0 24px;color:#1a1a1a;line-height:1.65}
  h1,h2,h3{line-height:1.25;margin:1.4em 0 .5em} h1{font-size:1.8em} h2{font-size:1.4em} h3{font-size:1.15em}
  table{border-collapse:collapse;width:100%;margin:1em 0;font-size:.95em}
  th,td{border:1px solid #e2e2e8;padding:8px 12px;text-align:left;vertical-align:top}
  th{background:#f5f6fa;font-weight:600}
  code{background:#f0f1f5;padding:1px 5px;border-radius:5px;font-size:.9em}
  a{color:#3454d1} hr{border:0;border-top:1px solid #e2e2e8;margin:1.6em 0} ul{padding-left:1.3em}
</style>
</head><body>${content}</body></html>`;
}

module.exports = { createClaudeProvider };
