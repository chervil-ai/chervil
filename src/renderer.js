'use strict';

// ---- Elements ----
const els = {
  conversation: document.getElementById('conversation'),
  composer: document.getElementById('composer'),
  prompt: document.getElementById('prompt'),
  send: document.getElementById('send'),
  deepToggle: document.getElementById('deep-toggle'),
  attachBtn: document.getElementById('attach-btn'),
  micBtn: document.getElementById('mic-btn'),
  fileInput: document.getElementById('file-input'),
  attachChips: document.getElementById('attach-chips'),
  dropOverlay: document.getElementById('drop-overlay'),
  pageTitle: document.getElementById('page-title'),
  badge: document.getElementById('mode-badge'),
  frame: document.getElementById('page-frame'),
  webview: document.getElementById('web-view'),
  overlay: document.getElementById('overlay'),
  remixBar: document.getElementById('remix-bar'),
  verifyBtn: document.getElementById('verify-btn'),
  sourcesBtn: document.getElementById('sources-btn'),
  exportSelect: document.getElementById('export-select'),
  sourcesPanel: document.getElementById('sources-panel'),
  sourcesList: document.getElementById('sources-list'),
  sourcesClose: document.getElementById('sources-close'),
  liveSelect: document.getElementById('live-select'),
  liveStatus: document.getElementById('live-status'),
  toast: document.getElementById('toast'),
  audioBtn: document.getElementById('audio-btn'),
  audioBar: document.getElementById('audio-bar'),
  audioTitle: document.getElementById('audio-title'),
  audioToggle: document.getElementById('audio-toggle'),
  audioStop: document.getElementById('audio-stop'),
  voiceSelect: document.getElementById('voice-select'),
  voiceTest: document.getElementById('voice-test'),
  voiceNote: document.getElementById('voice-note'),
  rateSelect: document.getElementById('rate-select'),
  profileInput: document.getElementById('profile-input'),
  suggestions: document.getElementById('suggestions'),
  tabs: document.getElementById('tabs'),
  newTab: document.getElementById('new-tab'),
  back: document.getElementById('back-btn'),
  fwd: document.getElementById('fwd-btn'),
  navTip: document.getElementById('nav-tip'),
  mapBtn: document.getElementById('map-btn'),
  mapView: document.getElementById('map-view'),
  schedBtn: document.getElementById('sched-btn'),
  schedView: document.getElementById('sched-view'),
  agentsBtn: document.getElementById('agents-btn'),
  agentsView: document.getElementById('agents-view'),
  mapClose: document.getElementById('map-close'),
  mapCanvas: document.getElementById('map-canvas'),
  mapEdges: document.getElementById('map-edges'),
  save: document.getElementById('save-btn'),
  // Settings
  settingsBtn: document.getElementById('settings-btn'),
  settingsModal: document.getElementById('settings-modal'),
  settingsClose: document.getElementById('settings-close'),
  providerKeyRow: document.getElementById('provider-key-row'),
  providerKeyLabel: document.getElementById('provider-key-label'),
  apiKeyInput: document.getElementById('api-key-input'),
  apiKeySave: document.getElementById('api-key-save'),
  apiKeyStatus: document.getElementById('api-key-status'),
  providerModelRow: document.getElementById('provider-model-row'),
  modelSelect: document.getElementById('model-select'),
  modelCustom: document.getElementById('model-custom'),
  ollamaExtra: document.getElementById('ollama-extra'),
  ollamaUrl: document.getElementById('ollama-url'),
  azureExtra: document.getElementById('azure-extra'),
  azureEndpoint: document.getElementById('azure-endpoint'),
  azureDeployment: document.getElementById('azure-deployment'),
  azureApiVersion: document.getElementById('azure-api-version'),
  // Voice input (speech-to-text)
  sttEndpoint: document.getElementById('stt-endpoint'),
  sttModel: document.getElementById('stt-model'),
  sttKeyInput: document.getElementById('stt-key-input'),
  sttKeySave: document.getElementById('stt-key-save'),
  sttKeyStatus: document.getElementById('stt-key-status'),
  voiceAutosend: document.getElementById('voice-autosend'),
  // Appearance
  tabLayoutSelect: document.getElementById('tab-layout-select'),
  // Notifications
  notifyToggle: document.getElementById('notify-toggle'),
  // MCP servers (Claude's native remote MCP connector)
  mcpList: document.getElementById('mcp-list'),
  mcpName: document.getElementById('mcp-name'),
  mcpUrl: document.getElementById('mcp-url'),
  mcpToken: document.getElementById('mcp-token'),
  mcpAddBtn: document.getElementById('mcp-add'),
  // Library (History / Trash)
  historyBtn: document.getElementById('history-btn'),
  libraryDrawer: document.getElementById('library-drawer'),
  libraryClose: document.getElementById('library-close'),
  libraryList: document.getElementById('library-list'),
  libTabHistory: document.getElementById('lib-tab-history'),
  libTabTrash: document.getElementById('lib-tab-trash'),
  emptyTrash: document.getElementById('empty-trash'),
  // Spaces
  spaceBar: document.getElementById('space-bar'),
  spaceSelect: document.getElementById('space-select'),
  newSpaceBtn: document.getElementById('new-space-btn'),
  synthesizeBtn: document.getElementById('synthesize-btn'),
  newSpaceRow: document.getElementById('new-space-row'),
  newSpaceName: document.getElementById('new-space-name'),
  createSpaceBtn: document.getElementById('create-space-btn'),
  synthRow: document.getElementById('synth-row'),
  synthInput: document.getElementById('synth-input'),
  synthGo: document.getElementById('synth-go'),
};

// ---- State ----
// A tab is a browsing session: its own chat + a back/forward stack of pages.
//   tab = { id, title, conversation: [{role,text,cls}], history: [{role,content}],
//           pages: [entry], current }
//   entry = { kind:'page'|'navigate', html?, title, url?, query, sources? }
let tabs = [];
let activeId = null;

// Global, persisted settings (non-secret). The API key is handled separately by
// the main process (encrypted), never stored here.
let settings = {
  linkBehavior: 'smart',
  followupMode: 'auto',
  provider: 'claude',
  claudeModel: 'claude-sonnet-4-6',
  grokModel: 'grok-3',
  geminiModel: 'gemini-2.0-flash',
  azureModel: '',
  azureEndpoint: '',
  azureDeployment: '',
  azureApiVersion: '2024-10-21',
  ollamaModel: 'gemma3:4b',
  ollamaUrl: 'http://localhost:11434',
  voiceURI: '',      // '' = auto-pick the best available
  audioRate: 1,      // narration speed
  profile: '',       // personal "About you" memory — tailors composed pages
  mcpServers: [],    // connected MCP servers: {id, name, url, token, enabled} (Claude only)
  notifications: true, // OS notification when a Living page updates in the background
  tabLayout: 'horizontal', // 'horizontal' (top strip) or 'vertical' (side rail)
  sttEndpoint: 'https://api.openai.com/v1/audio/transcriptions', // Whisper-compatible STT
  sttModel: 'whisper-1',
  voiceAutosend: false, // auto-send the transcript instead of just filling the box
};

// Per-provider metadata for the Settings UI.
const PROVIDER_LABELS = {
  claude: 'Claude', grok: 'Grok (xAI)', gemini: 'Gemini', azure: 'Azure AI Foundry', ollama: 'Ollama',
};
const MODEL_SETTING = {
  claude: 'claudeModel', grok: 'grokModel', gemini: 'geminiModel', azure: 'azureModel', ollama: 'ollamaModel',
};
const MODEL_PLACEHOLDER = {
  claude: 'claude-sonnet-4-6', grok: 'grok-3', gemini: 'gemini-2.0-flash', azure: '(uses deployment)', ollama: 'gemma3:4b',
};
// Suggested models per provider for the dropdown (a "Custom…" entry is appended so
// you can always type your own model id).
const MODEL_OPTIONS = {
  claude: [
    ['claude-haiku-4-5-20251001', 'Claude Haiku 4.5 — cheapest'],
    ['claude-sonnet-4-6', 'Claude Sonnet 4.6 — balanced'],
    ['claude-opus-4-8', 'Claude Opus 4.8 — top quality'],
  ],
  grok: [
    ['grok-3', 'grok-3'],
    ['grok-2-latest', 'grok-2-latest'],
  ],
  gemini: [
    ['gemini-2.0-flash', 'gemini-2.0-flash — fast & cheap'],
    ['gemini-1.5-pro', 'gemini-1.5-pro'],
    ['gemini-1.5-flash', 'gemini-1.5-flash'],
  ],
  ollama: [
    ['gemma3:4b', 'gemma3:4b'],
    ['llama3.2:latest', 'llama3.2'],
  ],
  azure: [],
};
const CUSTOM_MODEL = '__custom__';

// The provider config sent to the agent with each request.
function providerConfig() {
  const p = settings.provider;
  const c = { provider: p, model: settings[MODEL_SETTING[p]] };
  if (p === 'ollama') { c.ollamaModel = settings.ollamaModel; c.ollamaUrl = settings.ollamaUrl; }
  else if (p === 'azure') {
    c.azureEndpoint = settings.azureEndpoint;
    c.azureDeployment = settings.azureDeployment;
    c.azureApiVersion = settings.azureApiVersion;
  }
  // An active agent may pin a model (applied only when it matches the current provider).
  const ag = activeAgent();
  if (ag && ag.model && (!ag.provider || ag.provider === c.provider)) {
    c.model = ag.model;
    if (c.provider === 'ollama') c.ollamaModel = ag.model;
  }
  return c;
}

// Auto-collected library of composed pages, plus a trash bin.
//   item = { id, createdAt, title, query, html, sources, conversation, history, spaceId }
let library = { history: [], trash: [] };
let drawerTab = 'history';

// Spaces: persistent topic workspaces. Each composed page is filed into the active
// Space; Sprig can synthesize across everything collected in a Space.
//   space = { id, name, createdAt }
let spaces = [];
let activeSpaceId = null;

// Living pages: composed pages that re-ground themselves on a schedule.
//   record = { id, tabId, entryId, query, intervalMs, lastRun, title, refreshing }
let living = [];
let livingTimer = null;
// Scheduled agents: run a prompt on a cron-like rule (interval / daily / weekly).
//   schedule = { id, title, prompt, rule, deep, enabled, lastRun, tabId, entryId, running }
let schedules = [];
// Agent files: imported personas/configs that shape Sprig's behavior.
//   agent = { id, name, description, persona, model, provider, mcp:[names], starters:[] }
let agents = [];
let activeAgentId = null;
const LIVE_INTERVALS = [
  ['off', 'Auto-refresh: off'],
  ['300000', 'every 5 min'],
  ['900000', 'every 15 min'],
  ['1800000', 'every 30 min'],
  ['3600000', 'every hour'],
  ['21600000', 'every 6 hours'],
];

// Transient per-tab generation state, kept OFF the tab object so persistence stays clean.
//   runState: tabId -> { genId, statusText, streamBuffer }
const runState = new Map();
const reqToTab = new Map(); // requestId -> tabId

let saveTimer = null;
let previewTimer = null; // throttles the active tab's streamed preview
let previewScrollY = 0;  // scroll position to restore across streaming re-renders
let activeStatusEl = null;

const MAX_PAGES_PER_TAB = 50;
const MAX_LIBRARY = 100;
const DOCTYPE_RE = /<!DOCTYPE html>|<html[\s>]/i;

// Injected into every composed page. Two jobs:
//   1. Route link clicks back to Chervil (instead of navigating the sandboxed iframe).
//   2. Expose a live tool bridge — window.chervil.ask(...) — so a composed page can
//      call Sprig at runtime and build interactive "applets".
const CHERVIL_RUNTIME = `<script>(function(){
  // 1. Link interception.
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if(!a) return;
    var raw = a.getAttribute('href');
    if(!raw || raw.charAt(0)==='#') return;     // let in-page anchors scroll
    var href = a.href;
    if(!/^https?:/i.test(href)) return;
    e.preventDefault();
    try { parent.postMessage({ __chervil:true, type:'link', href: href, text: (a.textContent||'').trim() }, '*'); } catch(_){}
  }, true);

  // 2. Two-way tool bridge.
  var pending = {}, seq = 0;
  window.addEventListener('message', function(e){
    var d = e.data;
    if(!d || d.__chervil !== true || d.type !== 'tool-result') return;
    var p = pending[d.id];
    if(!p) return;
    delete pending[d.id];
    if(d.ok) p.resolve(d.result); else p.reject(new Error(d.error || 'Sprig error'));
  });
  // Keyboard scroll forwarded from the parent (PageDown/Up, Space, Home/End, arrows)
  // when focus is outside the page frame — so nav keys scroll the composed page
  // without having to click into it first.
  window.addEventListener('message', function(e){
    var d = e.data;
    if(!d || d.__chervil !== true || d.type !== 'scrollkey') return;
    var h = window.innerHeight || 600;
    var max = (document.documentElement && document.documentElement.scrollHeight) || 0;
    if(d.key === 'PageDown' || d.key === 'Space') window.scrollBy(0, Math.round(h * 0.9));
    else if(d.key === 'PageUp' || d.key === 'ShiftSpace') window.scrollBy(0, -Math.round(h * 0.9));
    else if(d.key === 'ArrowDown') window.scrollBy(0, 60);
    else if(d.key === 'ArrowUp') window.scrollBy(0, -60);
    else if(d.key === 'Home') window.scrollTo(0, 0);
    else if(d.key === 'End') window.scrollTo(0, max);
  });
  function call(name, args){
    return new Promise(function(resolve, reject){
      var id = 'c' + (++seq);
      pending[id] = { resolve: resolve, reject: reject };
      try { parent.postMessage({ __chervil:true, type:'tool', id:id, name:name, args:args||{} }, '*'); }
      catch(err){ delete pending[id]; reject(err); return; }
      setTimeout(function(){ if(pending[id]){ delete pending[id]; reject(new Error('Sprig timed out')); } }, 90000);
    });
  }
  window.chervil = {
    call: call,
    ask: function(prompt){ return call('ask', { prompt: String(prompt || '') }); }
  };
  // Back-compat: pages composed before the Chervil rename call window.parslee.*
  try { window.parslee = window.chervil; } catch(e){}

  // 3. Report scroll position so streaming re-renders can preserve it.
  var _ss;
  window.addEventListener('scroll', function(){
    if(_ss) return;
    _ss = setTimeout(function(){
      _ss = null;
      try { parent.postMessage({ __chervil:true, type:'scroll', y: (window.scrollY || window.pageYOffset || 0) }, '*'); } catch(e){}
    }, 100);
  }, { passive: true });
})();</script>`;

// ---- Run-state helpers ----
function runStateFor(tabId) {
  let rs = runState.get(tabId);
  if (!rs) {
    rs = { genId: null, statusText: '', streamBuffer: '' };
    runState.set(tabId, rs);
  }
  return rs;
}

function isTabBusy(tabId) {
  const rs = runState.get(tabId);
  return !!(rs && rs.genId);
}

function hasDoctype(s) {
  return !!s && DOCTYPE_RE.test(s);
}

// ---- Tab helpers ----
function uid() {
  return 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function activeTab() {
  return tabs.find((t) => t.id === activeId) || null;
}

// ---- Page tree helpers (each tab's history is a tree of page nodes) ----
//   entry = { id, parentId, kind, html?, title, url?, query, sources? }
function entryById(tab, id) { return tab ? tab.pages.find((p) => p.id === id) || null : null; }
function currentEntry(tab) { return tab && tab.currentId ? entryById(tab, tab.currentId) : null; }
function parentOf(tab, entry) { return entry && entry.parentId ? entryById(tab, entry.parentId) : null; }
function childrenOf(tab, id) { return tab ? tab.pages.filter((p) => p.parentId === id) : []; }
function lastChild(tab, id) { const k = childrenOf(tab, id); return k.length ? k[k.length - 1] : null; }
function ancestorIds(tab, id) {
  const set = new Set();
  let e = entryById(tab, id);
  while (e) { set.add(e.id); e = parentOf(tab, e); }
  return set;
}

function newTab(activate = true) {
  const tab = {
    id: uid(),
    title: 'New Tab',
    conversation: [],
    history: [],
    pages: [],
    currentId: null,
  };
  tabs.push(tab);
  if (activate) activeId = tab.id;
  renderTabs();
  if (activate) {
    renderConversation();
    renderCurrentPage();
    refreshComposer();
  }
  scheduleSave();
  return tab;
}

function closeTab(id) {
  const idx = tabs.findIndex((t) => t.id === id);
  if (idx === -1) return;
  tabs.splice(idx, 1);
  runState.delete(id);
  living = living.filter((r) => r.tabId !== id); // drop this tab's living pages
  if (tabs.length === 0) {
    newTab(true);
  } else if (activeId === id) {
    if (previewTimer) { clearTimeout(previewTimer); previewTimer = null; }
    activeId = tabs[Math.min(idx, tabs.length - 1)].id;
    renderConversation();
    showActiveTabView();
    refreshComposer();
  }
  renderTabs();
  scheduleSave();
}

function switchTab(id) {
  if (id === activeId) return;
  if (previewTimer) { clearTimeout(previewTimer); previewTimer = null; }
  activeId = id;
  renderTabs();
  renderConversation();
  showActiveTabView();
  refreshComposer();
  scheduleSave();
}

function tabLabel(tab) {
  if (tab.title && tab.title !== 'New Tab') return tab.title;
  const firstUser = tab.conversation.find((m) => m.role === 'user');
  if (firstUser) return firstUser.text;
  return 'New Tab';
}

// ---- Rendering: tab strip ----
function renderTabs() {
  els.tabs.innerHTML = '';
  for (const tab of tabs) {
    const el = document.createElement('div');
    el.className = 'tab' + (tab.id === activeId ? ' active' : '');
    el.title = tabLabel(tab);
    el.dataset.tabId = tab.id;
    el.draggable = true; // click-hold-drag to reorder, like a browser

    if (isTabBusy(tab.id)) {
      const spin = document.createElement('span');
      spin.className = 'tab-spin';
      el.appendChild(spin);
    }

    const title = document.createElement('span');
    title.className = 'tab-title';
    title.textContent = tabLabel(tab);
    el.appendChild(title);

    const close = document.createElement('span');
    close.className = 'tab-close';
    close.textContent = '✕';
    close.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTab(tab.id);
    });
    el.appendChild(close);

    // A real drag suppresses the trailing click, so plain clicks still switch tabs.
    el.addEventListener('click', () => { if (!tabDragId) switchTab(tab.id); });
    el.addEventListener('dragstart', (e) => {
      tabDragId = tab.id;
      el.classList.add('dragging');
      try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', tab.id); } catch {}
    });
    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      commitTabOrder();
      // Clear after the click event would have fired, so a real drag doesn't switch.
      setTimeout(() => { tabDragId = null; }, 0);
    });

    els.tabs.appendChild(el);
  }
}

// ---- Tab layout (horizontal strip vs. vertical rail) ----
function isVerticalTabs() {
  return settings.tabLayout === 'vertical';
}

function applyTabLayout() {
  const app = document.getElementById('app');
  if (app) app.classList.toggle('vtabs', isVerticalTabs());
}

// ---- Drag-to-reorder tabs (works horizontally or vertically) ----
let tabDragId = null;

// Find the tab the dragged one should be inserted before, based on pointer position.
function tabDragAfter(x, y) {
  const vertical = isVerticalTabs();
  const others = [...els.tabs.querySelectorAll('.tab:not(.dragging)')];
  let closest = { offset: -Infinity, el: null };
  for (const el of others) {
    const box = el.getBoundingClientRect();
    const offset = vertical ? (y - box.top - box.height / 2) : (x - box.left - box.width / 2);
    if (offset < 0 && offset > closest.offset) closest = { offset, el };
  }
  return closest.el;
}

function onTabsDragOver(e) {
  if (!tabDragId) return;
  e.preventDefault();
  try { e.dataTransfer.dropEffect = 'move'; } catch {}
  const dragging = els.tabs.querySelector('.tab.dragging');
  if (!dragging) return;
  const after = tabDragAfter(e.clientX, e.clientY);
  if (after == null) els.tabs.appendChild(dragging);
  else if (after !== dragging.nextSibling) els.tabs.insertBefore(dragging, after);
}

// Read the DOM order back into the tabs array and persist it.
function commitTabOrder() {
  const order = [...els.tabs.querySelectorAll('.tab')].map((el) => el.dataset.tabId);
  if (order.length !== tabs.length) return;
  tabs.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  scheduleSave();
}

// ---- Rendering: conversation ----
function renderConversation() {
  els.conversation.innerHTML = '';
  activeStatusEl = null;
  const tab = activeTab();
  if (!tab) return;
  for (const m of tab.conversation) appendMessageEl(m.role, m.text, m.cls);
  const rs = runState.get(tab.id);
  if (rs && rs.genId) setStatus(rs.statusText || 'Thinking…');
  els.conversation.scrollTop = els.conversation.scrollHeight;
}

function sprigAvatar() {
  const av = document.createElement('img');
  av.className = 'sprig-avatar';
  av.src = 'sprig-badge.jpg';
  av.alt = 'Sprig';
  return av;
}

function appendMessageEl(role, text, cls) {
  // Bot messages come from Sprig, so pair them with his avatar.
  if (role === 'bot') {
    const row = document.createElement('div');
    row.className = 'bot-row';
    const bubble = document.createElement('div');
    bubble.className = `msg bot${cls ? ' ' + cls : ''}`;
    bubble.textContent = text;
    row.appendChild(sprigAvatar());
    row.appendChild(bubble);
    els.conversation.appendChild(row);
    return bubble;
  }
  const el = document.createElement('div');
  el.className = `msg ${role}${cls ? ' ' + cls : ''}`;
  el.textContent = text;
  els.conversation.appendChild(el);
  return el;
}

// Adds a persisted message to a specific tab; renders if that tab is active.
function addMessage(tab, role, text, cls = '') {
  tab.conversation.push({ role, text, cls });
  if (tab.id === activeId) {
    appendMessageEl(role, text, cls);
    els.conversation.scrollTop = els.conversation.scrollHeight;
  }
  scheduleSave();
}

// Transient status bubble (not persisted), shown for the active tab.
function setStatus(text) {
  if (!activeStatusEl) {
    const row = document.createElement('div');
    row.className = 'bot-row';
    activeStatusEl = document.createElement('div');
    activeStatusEl.className = 'msg bot status';
    const dot = document.createElement('span');
    dot.className = 'dot-pulse';
    const span = document.createElement('span');
    activeStatusEl.appendChild(dot);
    activeStatusEl.appendChild(span);
    row.appendChild(sprigAvatar());
    row.appendChild(activeStatusEl);
    els.conversation.appendChild(row);
  }
  activeStatusEl.querySelector('span:last-child').textContent = text;
  els.conversation.scrollTop = els.conversation.scrollHeight;
}

function clearStatus() {
  if (activeStatusEl) {
    (activeStatusEl.closest('.bot-row') || activeStatusEl).remove();
    activeStatusEl = null;
  }
}

// ---- Rendering: canvas / viewport ----
function setBadge(kind, label) {
  els.badge.className = `badge ${kind}`;
  els.badge.textContent = label;
}

function showOverlay() {
  els.frame.hidden = false;
  els.frame.removeAttribute('srcdoc');
  els.webview.hidden = true;
  els.webview.removeAttribute('src');
  els.overlay.hidden = false;
}

function renderPageHtml(html, scrollY = 0) {
  els.webview.hidden = true;
  els.webview.removeAttribute('src');
  els.frame.hidden = false;
  els.overlay.hidden = true;
  // Append the Chervil runtime (link routing + applet bridge), plus an optional
  // scroll restore so the page doesn't jump to the top on each streaming re-render.
  const restore = scrollY > 0
    ? `<script>try{window.scrollTo(0,${Math.round(scrollY)});}catch(e){}</script>`
    : '';
  // Bottom breathing room so the floating remix bar doesn't sit on a flowing page's
  // last lines. (Slide decks handle this themselves by centering content within the
  // viewport — see the Slides remix request.)
  const clearance = '<style>body{padding-bottom:140px !important;}</style>';
  els.frame.setAttribute('srcdoc', html + clearance + CHERVIL_RUNTIME + restore);
}

function renderSite(url) {
  els.frame.hidden = true;
  els.frame.removeAttribute('srcdoc');
  els.overlay.hidden = true;
  els.webview.hidden = false;
  els.webview.setAttribute('src', url);
}

// Render whatever the active tab is currently pointing at (committed entry).
function renderCurrentPage() {
  const tab = activeTab();
  const entry = currentEntry(tab);

  if (!entry) {
    showOverlay();
    els.pageTitle.textContent = 'Welcome to Chervil';
    setBadge('', 'ready');
    els.save.disabled = true;
    setRemixVisible(false);
  } else if (entry.kind === 'navigate') {
    renderSite(entry.url);
    els.pageTitle.textContent = entry.url;
    setBadge('live', 'live site');
    els.save.disabled = true;
    setRemixVisible(false);
  } else {
    renderPageHtml(entry.html);
    els.pageTitle.textContent = entry.title || 'Chervil page';
    setBadge('page', 'composed');
    els.save.disabled = false;
    setRemixVisible(true);
  }
  updateNavButtons();
  updatePlaceholder();
}

// ---- Remix bar + Audio Overview ----
const REMIX = {
  summary:   { label: 'Summarize',  query: 'Summarize the page I am viewing into a tight, well-structured overview that captures the key points and takeaways.' },
  simplify:  { label: 'Simplify',   query: 'Rewrite the page I am viewing in plain, simple language anyone can understand (like explaining to a smart 12-year-old), while keeping the substance.' },
  deeper:    { label: 'Go deeper',  query: 'Expand the page I am viewing into a more detailed, comprehensive version — add depth, nuance, examples, and useful context.' },
  slides:    { label: 'Slides',     query: 'Turn the page I am viewing into a self-contained slide deck that shows ONE slide at a time (one key idea per slide, a clear heading, concise bullets). Support BOTH on-screen Previous/Next buttons AND Left/Right arrow keys, and show a visible slide counter like "3 / 8" — keep these controls in the TOP area, never pinned to the bottom edge. Every slide must fill the full viewport height with the deck background and VERTICALLY CENTER its content, so a slide with little content does not leave large empty or white areas. Keep slide content in the central area — clear of the top nav and clear of the bottom ~140px, where an app toolbar floats. Each slide should fit the viewport without scrolling.' },
  keypoints: { label: 'Key points', query: 'Distill the page I am viewing into the essential key points as a clean, scannable bullet list with brief context for each.' },
};

function remix(kind) {
  const r = REMIX[kind];
  const tab = activeTab();
  if (!r || !tab || isTabBusy(tab.id)) return;
  const cur = currentEntry(tab);
  if (!cur || cur.kind !== 'page') return;
  submitQuery(r.query, { remix: true, allowNavigate: false, displayText: r.label });
}

function setRemixVisible(show) {
  els.remixBar.hidden = !show;
  if (show) { updateLiveControls(); updateSourcesButton(); }
  else { stopAudio(); els.sourcesPanel.hidden = true; }
}

// ---- Trust layer: Verify + Sources ----
function verifyPage() {
  const tab = activeTab();
  const cur = currentEntry(tab);
  if (!cur || cur.kind !== 'page' || isTabBusy(tab.id)) return;
  els.sourcesPanel.hidden = true;
  // Verify reuses remix (page as context → new branched "Trust Check" page).
  submitQuery('Fact-check the page I am viewing and produce a Trust Check report.', {
    remix: true,
    verify: true,
    allowNavigate: false,
    displayText: 'Verify this page',
  });
}

function updateSourcesButton() {
  const cur = currentEntry(activeTab());
  const n = cur && cur.kind === 'page' ? (cur.sources || []).length : 0;
  const searched = cur && cur.kind === 'page' ? (cur.searches || []).length : 0;
  els.sourcesBtn.textContent = n ? `Sources (${n})` : 'Sources';
  // Dim when there's nothing to show (knowledge-only page).
  els.sourcesBtn.classList.toggle('dim', !n && !searched);
}

function toggleSourcesPanel() {
  if (!els.sourcesPanel.hidden) { els.sourcesPanel.hidden = true; return; }
  const cur = currentEntry(activeTab());
  const sources = (cur && cur.sources) || [];
  const searches = (cur && cur.searches) || [];
  els.sourcesList.innerHTML = '';

  if (searches.length) {
    const sec = document.createElement('div');
    sec.className = 'src-section';
    sec.innerHTML = '<div class="src-label">Sprig searched for</div>';
    for (const q of searches) {
      const chip = document.createElement('div');
      chip.className = 'src-search';
      chip.textContent = '🔎 ' + q;
      sec.appendChild(chip);
    }
    els.sourcesList.appendChild(sec);
  }

  const sec2 = document.createElement('div');
  sec2.className = 'src-section';
  sec2.innerHTML = `<div class="src-label">Sources used (${sources.length})</div>`;
  if (!sources.length) {
    const none = document.createElement('div');
    none.className = 'src-empty';
    none.textContent = 'No live web sources — this page came from the model’s own knowledge. Use ✓ Verify to fact-check it against the web.';
    sec2.appendChild(none);
  } else {
    for (const s of sources) {
      const a = document.createElement('div');
      a.className = 'src-item';
      a.textContent = s.title || s.url;
      a.title = s.url;
      a.addEventListener('click', () => { els.sourcesPanel.hidden = true; handleLinkClick(s.url, s.title || ''); });
      sec2.appendChild(a);
    }
  }
  els.sourcesList.appendChild(sec2);
  els.sourcesPanel.hidden = false;
}

// --- Audio Overview via the browser's free SpeechSynthesis (no TTS API cost) ---
let audioChunks = [];
let audioIndex = 0;
let audioPlaying = false;
let cachedVoices = [];

function loadVoices() {
  try { cachedVoices = window.speechSynthesis.getVoices() || []; } catch { cachedVoices = []; }
  // Voices often arrive asynchronously — refresh the picker if Settings is open.
  if (els.voiceSelect && els.settingsModal.classList.contains('open')) populateVoiceSelect();
}
if (window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function pickVoice() {
  const vs = cachedVoices.length ? cachedVoices : (window.speechSynthesis ? window.speechSynthesis.getVoices() : []);
  if (settings.voiceURI) {
    const chosen = vs.find((v) => v.voiceURI === settings.voiceURI || v.name === settings.voiceURI);
    if (chosen) return chosen;
  }
  const en = vs.filter((v) => /^en/i.test(v.lang));
  const pref = en.find((v) => /natural|online|aria|jenny|guy|google|microsoft/i.test(v.name));
  return pref || en[0] || vs[0] || null;
}

// Populate the Settings voice picker from the OS voices.
function populateVoiceSelect() {
  if (!els.voiceSelect) return;
  const vs = cachedVoices.length ? cachedVoices : (window.speechSynthesis ? window.speechSynthesis.getVoices() : []);
  els.voiceSelect.innerHTML = '';
  const auto = document.createElement('option');
  auto.value = '';
  auto.textContent = 'Auto — best available';
  els.voiceSelect.appendChild(auto);
  for (const v of vs) {
    const o = document.createElement('option');
    o.value = v.voiceURI || v.name;
    o.textContent = `${v.name} (${v.lang})${v.localService ? '' : ' · online'}`;
    els.voiceSelect.appendChild(o);
  }
  els.voiceSelect.value = settings.voiceURI || '';
  if (els.rateSelect) els.rateSelect.value = String(settings.audioRate || 1);
  if (els.voiceNote) {
    els.voiceNote.textContent = vs.length
      ? 'Tip: a “Natural”/“Online” voice sounds far less robotic than the basic system ones.'
      : 'No voices detected yet — your OS may still be loading them. Reopen Settings in a moment.';
  }
}

function chunkText(text) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  const sentences = clean.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) || [];
  const chunks = [];
  let cur = '';
  for (const s of sentences) {
    if ((cur + ' ' + s).length > 220 && cur) { chunks.push(cur.trim()); cur = s; }
    else cur = cur ? cur + ' ' + s : s;
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
}

function startAudio(text, title) {
  if (!window.speechSynthesis) {
    const tab = activeTab();
    if (tab) addMessage(tab, 'bot', 'Audio narration isn’t available in this environment.', 'error');
    return;
  }
  stopAudio();
  audioChunks = chunkText(text);
  if (!audioChunks.length) return;
  audioIndex = 0;
  audioPlaying = true;
  els.audioBar.hidden = false;
  els.audioTitle.textContent = '🔊 ' + (title || 'Reading this page');
  els.audioToggle.textContent = 'Pause';
  speakNext();
}

function speakNext() {
  if (!audioPlaying) return;
  if (audioIndex >= audioChunks.length) { stopAudio(); return; }
  const u = new SpeechSynthesisUtterance(audioChunks[audioIndex]);
  u.rate = settings.audioRate || 1;
  const v = pickVoice();
  if (v) u.voice = v;
  u.onend = () => { if (audioPlaying) { audioIndex += 1; speakNext(); } };
  u.onerror = () => { if (audioPlaying) { audioIndex += 1; speakNext(); } };
  window.speechSynthesis.speak(u);
}

function stopAudio() {
  audioPlaying = false;
  audioChunks = [];
  audioIndex = 0;
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch { /* ignore */ }
  if (els.audioBar) els.audioBar.hidden = true;
}

function toggleAudio() {
  if (!window.speechSynthesis || !audioPlaying) return;
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    els.audioToggle.textContent = 'Pause';
  } else {
    window.speechSynthesis.pause();
    els.audioToggle.textContent = 'Play';
  }
}

function playPageAudio() {
  const tab = activeTab();
  const cur = currentEntry(tab);
  if (!cur || cur.kind !== 'page') return;
  startAudio(stripText(cur.html), cur.title);
}

// ---- Living pages (scheduled auto-refresh) ----
function livingFor(entryId) {
  return living.find((r) => r.entryId === entryId) || null;
}

function setLiving(tab, entry, intervalMs) {
  if (!entry.id) entry.id = uid();
  living = living.filter((r) => r.entryId !== entry.id);
  if (intervalMs > 0) {
    living.push({
      id: uid(),
      tabId: tab.id,
      entryId: entry.id,
      query: entry.query,
      intervalMs,
      lastRun: Date.now(),
      title: entry.title,
      refreshing: false,
    });
    startScheduler();
    toast(`Sprig will keep “${entry.title || 'this page'}” updated ${intervalLabel(intervalMs)}.`);
  }
  updateLiveControls();
  scheduleSave();
}

function intervalLabel(ms) {
  const row = LIVE_INTERVALS.find(([v]) => v !== 'off' && parseInt(v, 10) === ms);
  return row ? row[1] : '';
}

function startScheduler() {
  if (livingTimer) return;
  if (!living.length && !schedules.length) return;
  livingTimer = setInterval(schedulerTick, 30000); // check living pages + schedules every 30s
}

// Master 30s tick: drives both Living-page refresh and scheduled agents.
function schedulerTick() {
  if (!living.length && !schedules.length) { clearInterval(livingTimer); livingTimer = null; return; }
  tickLiving();
  tickSchedules();
}

function tickLiving() {
  const now = Date.now();
  for (const rec of living.slice()) {
    if (!rec.refreshing && now - (rec.lastRun || 0) >= rec.intervalMs) refreshLiving(rec);
  }
}

// --- Scheduled agents: run a prompt on a cron-like rule ----------------------
function tickSchedules() {
  const now = Date.now();
  for (const sch of schedules.slice()) {
    if (!sch.running && scheduleDue(sch, now)) runSchedule(sch);
  }
}

// Is this schedule due to fire right now? (interval = elapsed; daily/weekly = past
// today's time slot and not yet run for it).
function scheduleDue(sch, now) {
  if (!sch || !sch.enabled) return false;
  const r = sch.rule || {};
  if (r.type === 'interval') {
    const ms = r.intervalMs || 0;
    return ms > 0 && (now - (sch.lastRun || 0)) >= ms;
  }
  if (r.type !== 'daily' && r.type !== 'weekly') return false;
  if (r.type === 'weekly') {
    const days = Array.isArray(r.days) ? r.days : [];
    if (!days.includes(new Date(now).getDay())) return false;
  }
  const parts = String(r.time || '09:00').split(':');
  const target = new Date(now);
  target.setHours(parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0, 0, 0);
  const t = target.getTime();
  return now >= t && (sch.lastRun || 0) < t;
}

// Run a scheduled prompt: compose a fresh page in the schedule's dedicated tab, then notify.
async function runSchedule(sch) {
  if (sch.running) return;
  let tab = tabs.find((t) => t.id === sch.tabId);
  if (!tab) {
    tab = newTab(false);
    tab.title = sch.title || (sch.prompt.length > 32 ? sch.prompt.slice(0, 29) + '…' : sch.prompt);
    sch.tabId = tab.id;
    renderTabs();
  }
  if (isTabBusy(tab.id)) return; // try again next tick
  sch.running = true;
  sch.lastRun = Date.now();
  renderSchedulesIfOpen();
  try {
    const before = currentEntry(tab);
    await submitQuery(sch.prompt, {
      tab, skipFollowup: true, allowNavigate: false, deep: !!sch.deep, background: true, displayText: sch.prompt,
    });
    const after = currentEntry(tab);
    if (after && after !== before && after.kind === 'page') {
      sch.entryId = after.id;
      if (settings.notifications && window.chervil.notify) {
        window.chervil.notify({
          title: 'Chervil · scheduled update',
          body: `“${after.title || sch.title || 'Your page'}” is ready.`,
          tabId: tab.id,
          entryId: after.id,
        });
      }
      toast(`Scheduled: “${after.title || sch.title || 'page'}” is ready.`);
    }
  } catch { /* ignore a failed run; retry next slot */ }
  sch.running = false;
  renderSchedulesIfOpen();
  scheduleSave();
}

// Quietly re-run a living page's query and replace its content in place. Runs
// independently of the per-tab single-flight (no streaming preview, no composer block).
async function refreshLiving(rec) {
  const tab = tabs.find((t) => t.id === rec.tabId);
  if (!tab) { living = living.filter((r) => r.id !== rec.id); return; }
  const entry = tab.pages.find((p) => p.id === rec.entryId);
  if (!entry || entry.kind !== 'page') return; // navigated away from it; try next tick
  if (isTabBusy(tab.id)) return; // don't collide with an active generation

  rec.refreshing = true;
  rec.lastRun = Date.now();
  updateLiveControls();
  try {
    const resp = await window.chervil.ask({
      query: rec.query,
      history: [],
      requestId: uid(), // not registered for streaming — quiet refresh
      allowNavigate: false,
      config: providerConfig(),
    });
    if (resp && resp.ok && resp.result && resp.result.kind === 'page') {
      const r = resp.result;
      const changed = stripText(r.html) !== stripText(entry.html);
      entry.html = r.html;
      entry.title = r.title || entry.title;
      entry.sources = r.sources || [];
      rec.title = entry.title;
      if (activeTab() === tab && currentEntry(tab) === entry) renderCurrentPage();
      if (changed) {
        toast(`Sprig refreshed “${entry.title}”.`);
        // If the user isn't looking (window minimized/unfocused), raise an OS
        // notification so background refreshes don't go unnoticed.
        const unattended = typeof document !== 'undefined' && (document.hidden || !document.hasFocus());
        if (settings.notifications && unattended && window.chervil.notify) {
          window.chervil.notify({
            title: 'Chervil · page updated',
            body: `Sprig refreshed “${entry.title}”.`,
            tabId: tab.id,
            entryId: entry.id,
          });
        }
      }
    }
  } catch { /* ignore a failed cycle; try again next interval */ }
  rec.refreshing = false;
  updateLiveControls();
  scheduleSave();
}

// Reflect the current page's living state in the remix-bar control + status.
function updateLiveControls() {
  if (!els.liveSelect) return;
  const tab = activeTab();
  const cur = currentEntry(tab);
  const rec = cur && cur.kind === 'page' ? livingFor(cur.id) : null;
  els.liveSelect.value = rec ? String(rec.intervalMs) : 'off';
  if (rec) {
    els.liveStatus.hidden = false;
    els.liveStatus.textContent = rec.refreshing
      ? '● refreshing…'
      : `● live · updated ${relTime(rec.lastRun)}`;
  } else {
    els.liveStatus.hidden = true;
  }
}

function onLiveSelectChange() {
  const tab = activeTab();
  const cur = currentEntry(tab);
  if (!cur || cur.kind !== 'page') return;
  const v = els.liveSelect.value;
  setLiving(tab, cur, v === 'off' ? 0 : parseInt(v, 10));
}

// ---- Toast notifications ----
let toastTimer = null;
function toast(message) {
  if (!els.toast) return;
  els.toast.textContent = message;
  els.toast.hidden = false;
  els.toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toast.classList.remove('show');
    setTimeout(() => { els.toast.hidden = true; }, 250);
  }, 4500);
}

// ---- Voice input (speech-to-text) ----
let micRecorder = null;
let micStream = null;
let micChunks = [];
let micBusy = false;

async function toggleVoiceInput() {
  if (micBusy) return;
  if (micRecorder && micRecorder.state === 'recording') { stopVoiceInput(); return; }

  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    toast('Microphone access was blocked. Allow mic access to use voice input.');
    return;
  }

  // Pick a container the platform can actually record.
  let mime = '';
  for (const m of ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) { mime = m; break; }
  }
  try {
    micRecorder = new MediaRecorder(micStream, mime ? { mimeType: mime } : undefined);
  } catch {
    toast('Voice recording is not supported here.');
    stopMicTracks();
    return;
  }

  micChunks = [];
  micRecorder.addEventListener('dataavailable', (e) => { if (e.data && e.data.size) micChunks.push(e.data); });
  micRecorder.addEventListener('stop', onVoiceStop);
  micRecorder.start();
  setMicState('recording');
  toast('Listening… click the mic again to stop.');
}

function stopVoiceInput() {
  if (micRecorder && micRecorder.state === 'recording') micRecorder.stop();
  setMicState('transcribing');
}

async function onVoiceStop() {
  stopMicTracks();
  const type = (micRecorder && micRecorder.mimeType) || 'audio/webm';
  const blob = new Blob(micChunks, { type });
  micChunks = [];
  if (!blob.size) { setMicState('idle'); return; }

  micBusy = true;
  setMicState('transcribing');
  try {
    const b64 = arrayBufferToBase64(await blob.arrayBuffer());
    const ext = /mp4/.test(type) ? 'mp4' : /ogg/.test(type) ? 'ogg' : 'webm';
    const resp = await window.chervil.transcribe({
      audio: b64,
      mimeType: type,
      filename: 'speech.' + ext,
      endpoint: settings.sttEndpoint,
      model: settings.sttModel,
    });
    if (resp && resp.ok && resp.text) insertTranscript(resp.text);
    else toast((resp && resp.error) || 'Sprig didn’t catch that — try again.');
  } catch (e) {
    toast('Transcription failed: ' + (e && e.message ? e.message : e));
  }
  micBusy = false;
  setMicState('idle');
}

function insertTranscript(text) {
  const cur = els.prompt.value.trim();
  els.prompt.value = cur ? `${cur} ${text}` : text;
  autoGrowPrompt();
  els.prompt.focus();
  if (settings.voiceAutosend) handleComposerSubmit(els.prompt.value);
}

function setMicState(state) {
  if (!els.micBtn) return;
  els.micBtn.classList.toggle('recording', state === 'recording');
  els.micBtn.classList.toggle('busy', state === 'transcribing');
  els.micBtn.setAttribute('aria-pressed', state === 'recording' ? 'true' : 'false');
  els.micBtn.textContent = state === 'transcribing' ? '…' : '🎤';
  els.micBtn.title =
    state === 'recording' ? 'Listening… click to stop'
    : state === 'transcribing' ? 'Transcribing…'
    : 'Voice input — talk to Sprig';
}

function stopMicTracks() {
  if (micStream) { for (const t of micStream.getTracks()) t.stop(); micStream = null; }
}

function arrayBufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = '';
  const chunk = 0x8000; // chunk to avoid arg-count limits on fromCharCode
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  return btoa(bin);
}

// ---- Web agent: let Sprig act on the embedded live site ----
let agentRunning = false;
const AGENT_SELECTOR = 'a[href],button,input:not([type=hidden]),textarea,select,[role=button]';

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// JS that collects the visible interactive nodes into `nodes` (same order for read & act).
function agentNodesJS() {
  return 'var nodes=[].slice.call(document.querySelectorAll(' + JSON.stringify(AGENT_SELECTOR) +
    ')).filter(function(n){var r=n.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight*3;});';
}
const AGENT_READ_JS =
  '(function(){' + agentNodesJS() +
  "function lbl(n){return ((n.getAttribute&&(n.getAttribute('aria-label')||n.getAttribute('placeholder')||n.getAttribute('name')))||n.innerText||n.value||n.alt||'').replace(/\\s+/g,' ').trim().slice(0,80);}" +
  "var els=[];for(var i=0;i<nodes.length&&els.length<60;i++){var n=nodes[i];els.push({i:els.length,tag:n.tagName.toLowerCase(),type:(n.type||''),label:lbl(n),href:((n.getAttribute&&n.getAttribute('href'))||'').slice(0,120)});}" +
  "return {url:location.href,title:document.title,text:((document.body&&document.body.innerText)||'').replace(/\\s+/g,' ').slice(0,3000),elements:els};})()";

function clickJS(i) { return '(function(){' + agentNodesJS() + 'var n=nodes[' + i + "];if(!n)return {ok:false,error:'element gone'};n.scrollIntoView({block:'center'});n.click();return {ok:true};})()"; }
function typeJS(i, val) { return '(function(){' + agentNodesJS() + 'var n=nodes[' + i + "];if(!n)return {ok:false,error:'element gone'};if(n.type==='password')return {ok:false,error:'password field'};n.focus();n.value=" + JSON.stringify(String(val || '')) + ";n.dispatchEvent(new Event('input',{bubbles:true}));n.dispatchEvent(new Event('change',{bubbles:true}));return {ok:true};})()"; }
function submitJS(i) { return '(function(){' + agentNodesJS() + 'var n=nodes[' + i + "];if(!n)return {ok:false,error:'element gone'};n.focus();var f=n.form||(n.closest&&n.closest('form'));if(f){if(typeof f.requestSubmit==='function')f.requestSubmit();else f.submit();return {ok:true};}n.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',keyCode:13,which:13,bubbles:true}));return {ok:true};})()"; }

async function readWebview() {
  try { return await els.webview.executeJavaScript(AGENT_READ_JS, false); }
  catch { return null; }
}

async function executeAction(a) {
  try {
    if (a.action === 'navigate' && a.value) { try { els.webview.loadURL(a.value); } catch { els.webview.src = a.value; } return { ok: true }; }
    if (a.action === 'scroll') { await els.webview.executeJavaScript('window.scrollBy(0,' + (a.value === 'up' ? -700 : 700) + ');true', false); return { ok: true }; }
    if (a.action === 'click' && a.index != null) return await els.webview.executeJavaScript(clickJS(a.index), true);
    if (a.action === 'type' && a.index != null) return await els.webview.executeJavaScript(typeJS(a.index, a.value), true);
    if (a.action === 'submit' && a.index != null) return await els.webview.executeJavaScript(submitJS(a.index), true);
    return { ok: false, error: 'unsupported action' };
  } catch (e) { return { ok: false, error: String(e && e.message ? e.message : e) }; }
}

// Hard stop on payment/purchase/transfer language — Sprig never does these.
function looksFinancial(a) {
  const s = ((a.reason || '') + ' ' + (a.value || '')).toLowerCase();
  return /\b(buy now|place order|complete (purchase|order|checkout)|checkout|pay\b|payment|card number|cvv|credit card|transfer|send money|wire transfer|donate)\b/.test(s);
}

function actionLabel(a) {
  if (a.action === 'type') return `Typing “${a.value || ''}”${a.reason ? ' — ' + a.reason : ''}`;
  if (a.action === 'navigate') return `Going to ${a.value || ''}`;
  if (a.action === 'scroll') return `Scrolling ${a.value || 'down'}`;
  return a.reason || a.action;
}

// Inline approval prompt for state-changing actions.
function confirmAgentAction(a) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'msg bot refine-choice';
    const p = document.createElement('div');
    p.textContent = `Sprig wants to: ${a.reason || a.action}. This changes the site — proceed?`;
    wrap.appendChild(p);
    const row = document.createElement('div');
    row.className = 'choice-row';
    const yes = document.createElement('button');
    yes.textContent = 'Approve';
    const no = document.createElement('button');
    no.textContent = 'Stop';
    row.appendChild(yes);
    row.appendChild(no);
    wrap.appendChild(row);
    els.conversation.appendChild(wrap);
    els.conversation.scrollTop = els.conversation.scrollHeight;
    const done = (v) => { wrap.remove(); resolve(v); };
    yes.addEventListener('click', () => done(true));
    no.addEventListener('click', () => done(false));
  });
}

// The read → decide → act loop, bounded and gated.
async function startAgent(task) {
  const tab = activeTab();
  const cur = currentEntry(tab);
  if (!cur || cur.kind !== 'navigate') return; // only on a live site
  if (agentRunning || isTabBusy(tab.id)) return;

  agentRunning = true;
  els.send.disabled = true;
  els.prompt.value = '';
  resetPromptHeight();
  addMessage(tab, 'user', '🤖 ' + task);
  setBadge('working', 'acting');

  const steps = [];
  try {
    for (let step = 0; step < 8 && agentRunning; step++) {
      setStatus('Sprig is reading the page…');
      const state = await readWebview();
      if (!state) { clearStatus(); addMessage(tab, 'bot', 'I couldn’t read this page (it may block automation).', 'error'); break; }

      setStatus('Sprig is deciding the next step…');
      const resp = await window.chervil.agentStep({ task, pageState: state, steps, config: providerConfig() });
      clearStatus();
      if (!resp.ok) { addMessage(tab, 'bot', resp.error || 'Agent error.', 'error'); break; }

      const a = resp.action;
      steps.push(a);
      if (a.action === 'finish') { addMessage(tab, 'bot', '✅ ' + (a.reason || 'Done.')); break; }
      if (a.action === 'need_user') { addMessage(tab, 'bot', '🙋 ' + (a.reason || 'I’ll let you take it from here.')); break; }
      if (looksFinancial(a)) { addMessage(tab, 'bot', 'That looks like a payment/purchase step — I won’t do that. Please complete it yourself.', 'error'); break; }
      if (a.risky) {
        const ok = await confirmAgentAction(a);
        if (!ok) { addMessage(tab, 'bot', 'Okay, stopping here.'); break; }
      }
      addMessage(tab, 'bot', '→ ' + actionLabel(a));
      const res = await executeAction(a);
      if (!res || !res.ok) { addMessage(tab, 'bot', 'Couldn’t do that' + (res && res.error ? ` (${res.error})` : '') + '.', 'error'); break; }
      await sleep(1100); // let the page settle
    }
  } catch (e) {
    clearStatus();
    addMessage(tab, 'bot', String(e && e.message ? e.message : e), 'error');
  }
  agentRunning = false;
  if (tab.id === activeId) { setBadge('live', 'live site'); els.send.disabled = false; els.prompt.focus(); }
}

// Keep the composer placeholder in sync with context (live site vs. compose vs. deep).
function updatePlaceholder() {
  const tab = activeTab();
  const cur = currentEntry(tab);
  if (cur && cur.kind === 'navigate') els.prompt.placeholder = 'Hey Sprig, act here…';
  else els.prompt.placeholder = deepMode ? 'Hey Sprig, research…' : 'Hey Sprig, ask…';
}

// Speak a short sample with the currently selected voice/speed (Settings test button).
function testVoice() {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance("Hi, I'm Sprig. This is how I'll read your pages aloud.");
  u.rate = settings.audioRate || 1;
  const v = pickVoice();
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

// On tab switch: if the tab is mid-generation with streamed HTML, show the live
// preview; otherwise render its committed page.
function showActiveTabView() {
  const tab = activeTab();
  const rs = tab && runState.get(tab.id);
  if (rs && rs.genId && hasDoctype(rs.streamBuffer)) {
    const idx = rs.streamBuffer.search(DOCTYPE_RE);
    renderPageHtml(idx >= 0 ? rs.streamBuffer.slice(idx) : rs.streamBuffer);
    els.pageTitle.textContent = 'Composing…';
    setBadge('working', 'composing');
    els.save.disabled = true;
    updateNavButtons();
  } else {
    renderCurrentPage();
    if (rs && rs.genId) setBadge('working', 'working');
  }
}

// A short label for a page/site entry, used on the back/forward tooltips.
function entryLabel(entry) {
  if (!entry) return '';
  if (entry.kind === 'navigate') return hostOf(entry.url) || entry.url || 'site';
  return entry.title || entry.query || 'Untitled page';
}

function updateNavButtons() {
  const tab = activeTab();
  const e = currentEntry(tab);
  const back = parentOf(tab, e);
  const fwd = e ? lastChild(tab, e.id) : null;
  els.back.disabled = !back;
  els.fwd.disabled = !fwd;

  const backLabel = back ? entryLabel(back) : '';
  const fwdLabel = fwd ? entryLabel(fwd) : '';
  els.back.dataset.tip = backLabel;
  els.fwd.dataset.tip = fwdLabel;
  els.back.title = backLabel ? `Back to: ${backLabel}` : 'Back';
  els.fwd.title = fwdLabel ? `Forward to: ${fwdLabel}` : 'Forward';

  // Refresh the live tooltip if it's currently showing for one of these buttons.
  if (navTipFor === els.back) (backLabel ? showNavTip(els.back, backLabel) : hideNavTip());
  else if (navTipFor === els.fwd) (fwdLabel ? showNavTip(els.fwd, fwdLabel) : hideNavTip());
}

// ---- Back/forward hover tooltip ----
let navTipFor = null;
function showNavTip(btn, text) {
  navTipFor = btn;
  els.navTip.textContent = text;
  els.navTip.hidden = false;
  const r = btn.getBoundingClientRect();
  const tipW = els.navTip.offsetWidth;
  let left = r.left;
  if (left + tipW > window.innerWidth - 8) left = window.innerWidth - 8 - tipW;
  els.navTip.style.left = Math.max(8, Math.round(left)) + 'px';
  els.navTip.style.top = Math.round(r.bottom + 6) + 'px';
}
function hideNavTip() {
  navTipFor = null;
  els.navTip.hidden = true;
}

function refreshComposer() {
  const tab = activeTab();
  els.send.disabled = tab ? isTabBusy(tab.id) : false;
}

// Add a new page/navigation node as a CHILD of the current node (a branch). Going
// back then composing forks instead of erasing forward history.
function pushEntry(tab, entry) {
  if (!entry.id) entry.id = uid();
  entry.parentId = tab.currentId || null;
  tab.pages.push(entry);
  pruneTree(tab);
  tab.currentId = entry.id;
}

// Cap nodes per tab: drop the oldest leaf that isn't on the path to the current node.
function pruneTree(tab) {
  let guard = 0;
  while (tab.pages.length > MAX_PAGES_PER_TAB && guard++ < 200) {
    const keep = ancestorIds(tab, tab.currentId);
    const leaf = tab.pages.find((p) => !childrenOf(tab, p.id).length && !keep.has(p.id));
    if (!leaf) break;
    tab.pages = tab.pages.filter((p) => p.id !== leaf.id);
  }
}

function goBack() {
  const tab = activeTab();
  const p = parentOf(tab, currentEntry(tab));
  if (!p) return;
  tab.currentId = p.id;
  renderCurrentPage();
  scheduleSave();
}

function goForward() {
  const tab = activeTab();
  const e = currentEntry(tab);
  const next = e ? lastChild(tab, e.id) : null;
  if (!next) return;
  tab.currentId = next.id;
  renderCurrentPage();
  scheduleSave();
}

// ---- Thinking canvas: a visual map of the tab's page tree ----
const MAP_NODE_W = 168;
const MAP_NODE_H = 56;
const MAP_GAP_X = 26;
const MAP_GAP_Y = 48;

function renderMap() {
  const tab = activeTab();
  els.mapEdges.innerHTML = '';
  [...els.mapCanvas.querySelectorAll('.map-node')].forEach((n) => n.remove());
  if (!tab || !tab.pages.length) {
    els.mapCanvas.style.width = '100%';
    els.mapCanvas.style.height = '100%';
    const empty = document.createElement('div');
    empty.className = 'map-node empty';
    empty.textContent = 'No pages yet — ask Sprig something.';
    empty.style.left = '20px';
    empty.style.top = '20px';
    els.mapCanvas.appendChild(empty);
    return;
  }

  // Tidy layout: leaves get sequential columns; a parent is centered over its children.
  const roots = tab.pages.filter((p) => !p.parentId || !entryById(tab, p.parentId));
  const pos = {};
  let leafX = 0;
  function layout(node, depth) {
    const kids = childrenOf(tab, node.id);
    let x;
    if (!kids.length) { x = leafX; leafX += 1; }
    else {
      const xs = kids.map((k) => layout(k, depth + 1));
      x = (xs[0] + xs[xs.length - 1]) / 2;
    }
    pos[node.id] = { x, depth };
    return x;
  }
  for (const r of roots) layout(r, 0);

  let maxX = 0;
  let maxDepth = 0;
  for (const id in pos) { maxX = Math.max(maxX, pos[id].x); maxDepth = Math.max(maxDepth, pos[id].depth); }
  const W = (maxX + 1) * (MAP_NODE_W + MAP_GAP_X) + 40;
  const H = (maxDepth + 1) * (MAP_NODE_H + MAP_GAP_Y) + 40;
  els.mapCanvas.style.width = W + 'px';
  els.mapCanvas.style.height = H + 'px';
  els.mapEdges.setAttribute('viewBox', `0 0 ${W} ${H}`);
  els.mapEdges.style.width = W + 'px';
  els.mapEdges.style.height = H + 'px';

  const nx = (id) => 20 + pos[id].x * (MAP_NODE_W + MAP_GAP_X);
  const ny = (id) => 20 + pos[id].depth * (MAP_NODE_H + MAP_GAP_Y);

  // Edges (parent → child) as smooth curves.
  let edges = '';
  for (const p of tab.pages) {
    if (p.parentId && pos[p.parentId] && pos[p.id]) {
      const x1 = nx(p.parentId) + MAP_NODE_W / 2;
      const y1 = ny(p.parentId) + MAP_NODE_H;
      const x2 = nx(p.id) + MAP_NODE_W / 2;
      const y2 = ny(p.id);
      const my = (y1 + y2) / 2;
      edges += `<path d="M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}"/>`;
    }
  }
  els.mapEdges.innerHTML = edges;

  // Nodes.
  for (const p of tab.pages) {
    const node = document.createElement('div');
    node.className = 'map-node' + (p.id === tab.currentId ? ' current' : '') + (p.kind === 'navigate' ? ' site' : '');
    node.style.left = nx(p.id) + 'px';
    node.style.top = ny(p.id) + 'px';
    node.textContent = entryLabel(p);
    node.title = entryLabel(p);
    node.addEventListener('click', () => jumpToNode(tab, p.id));
    els.mapCanvas.appendChild(node);
  }

  const curNode = els.mapCanvas.querySelector('.map-node.current');
  if (curNode) setTimeout(() => curNode.scrollIntoView({ block: 'center', inline: 'center' }), 0);
}

function jumpToNode(tab, id) {
  tab.currentId = id;
  closeMap();
  renderCurrentPage();
  renderTabs();
  scheduleSave();
}

function openMap() { renderMap(); els.mapView.classList.add('open'); }
function closeMap() { els.mapView.classList.remove('open'); }

// --- Scheduled agents UI ----------------------------------------------------
function openSched() { renderSchedules(); els.schedView.classList.add('open'); }
function closeSched() { els.schedView.classList.remove('open'); }
function renderSchedulesIfOpen() { if (els.schedView && els.schedView.classList.contains('open')) renderSchedules(); }

function ruleSummary(sch) {
  const r = sch.rule || {};
  if (r.type === 'interval') {
    const m = { 1800000: 'every 30 min', 3600000: 'every hour', 10800000: 'every 3 hours', 21600000: 'every 6 hours', 43200000: 'every 12 hours' };
    return m[r.intervalMs] || 'on an interval';
  }
  if (r.type === 'daily') return `every day at ${r.time}`;
  if (r.type === 'weekly') {
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const d = (r.days || []).slice().sort((a, b) => a - b).map((x) => names[x]).join(', ');
    return `${d || 'no days'} at ${r.time}`;
  }
  return '';
}

function renderSchedules() {
  const list = document.getElementById('sched-list');
  if (!list) return;
  list.innerHTML = '';
  if (!schedules.length) {
    const e = document.createElement('div');
    e.className = 'sched-empty';
    e.textContent = 'No scheduled agents yet. Add one above.';
    list.appendChild(e);
    return;
  }
  for (const sch of schedules) {
    const item = document.createElement('div');
    item.className = 'sched-item';
    const main = document.createElement('div');
    main.className = 'si-main';
    const title = document.createElement('div');
    title.className = 'si-title';
    title.textContent = (sch.deep ? '🔬 ' : '') + (sch.title || sch.prompt);
    const when = document.createElement('div');
    when.className = 'si-when';
    when.textContent = ruleSummary(sch)
      + (sch.enabled ? '' : ' · paused')
      + (sch.running ? ' · running…' : '')
      + (sch.lastRun ? ' · last ' + new Date(sch.lastRun).toLocaleString() : '');
    main.appendChild(title);
    main.appendChild(when);

    const runBtn = document.createElement('button');
    runBtn.className = 'si-btn';
    runBtn.textContent = 'Run now';
    runBtn.addEventListener('click', () => runSchedule(sch));
    const tog = document.createElement('button');
    tog.className = 'si-btn';
    tog.textContent = sch.enabled ? 'Pause' : 'Resume';
    tog.addEventListener('click', () => { sch.enabled = !sch.enabled; scheduleSave(); renderSchedules(); });
    const del = document.createElement('button');
    del.className = 'si-btn';
    del.textContent = 'Delete';
    del.addEventListener('click', () => { schedules = schedules.filter((s) => s.id !== sch.id); scheduleSave(); renderSchedules(); });

    item.appendChild(main);
    item.appendChild(runBtn);
    item.appendChild(tog);
    item.appendChild(del);
    list.appendChild(item);
  }
}

function onSchedTypeChange() {
  const type = document.getElementById('sched-type').value;
  document.getElementById('sched-time-wrap').hidden = type === 'interval';
  document.getElementById('sched-interval-wrap').hidden = type !== 'interval';
  document.getElementById('sched-days').hidden = type !== 'weekly';
}

function addScheduleFromForm() {
  const prompt = document.getElementById('sched-prompt').value.trim();
  if (!prompt) return;
  const type = document.getElementById('sched-type').value;
  const time = document.getElementById('sched-time').value || '08:00';
  const intervalMs = parseInt(document.getElementById('sched-interval').value, 10) || 3600000;
  const deep = document.getElementById('sched-deep').checked;
  const days = Array.from(document.querySelectorAll('#sched-days input:checked')).map((c) => parseInt(c.value, 10));
  const rule = type === 'interval'
    ? { type, intervalMs }
    : type === 'weekly'
      ? { type, time, days: days.length ? days : [1, 2, 3, 4, 5] }
      : { type: 'daily', time };
  schedules.push({
    id: uid(),
    title: prompt.length > 40 ? prompt.slice(0, 37) + '…' : prompt,
    prompt, rule, deep, enabled: true, lastRun: 0, tabId: null, entryId: null, running: false,
  });
  startScheduler();
  scheduleSave();
  document.getElementById('sched-prompt').value = '';
  renderSchedules();
}

// --- Agent files (importable personas / config) -----------------------------
function activeAgent() { return agents.find((a) => a.id === activeAgentId) || null; }
function activeAgentPersona() { const a = activeAgent(); return a && a.persona ? a.persona : null; }
function stripQuotes(s) { return String(s).replace(/^["']|["']$/g, ''); }

// Minimal YAML-frontmatter parser: key: value, key: [a, b], and key:\n  - item lists.
function parseYamlish(src) {
  const out = {};
  let curKey = null;
  for (const raw of String(src).split('\n')) {
    if (!raw.trim() || /^\s*#/.test(raw)) continue;
    const li = raw.match(/^\s*-\s+(.*)$/);
    if (li && curKey) { (out[curKey] = out[curKey] || []).push(stripQuotes(li[1].trim())); continue; }
    const kv = raw.match(/^([A-Za-z0-9_]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    const k = kv[1];
    const v = kv[2].trim();
    if (v === '') { curKey = k; out[k] = []; }
    else if (v.startsWith('[') && v.endsWith(']')) { out[k] = v.slice(1, -1).split(',').map((x) => stripQuotes(x.trim())).filter(Boolean); curKey = null; }
    else { out[k] = stripQuotes(v); curKey = null; }
  }
  return out;
}

function parseAgentFile(text, fallbackName) {
  let fm = {};
  let body = String(text || '');
  const m = body.match(/^\s*---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (m) { fm = parseYamlish(m[1]); body = m[2]; }
  const list = (v) => (Array.isArray(v) ? v.map(String) : (typeof v === 'string' && v.trim() ? v.split(',').map((s) => s.trim()).filter(Boolean) : []));
  return {
    id: uid(),
    name: String(fm.name || fallbackName || 'Agent').slice(0, 80),
    description: String(fm.description || '').slice(0, 300),
    persona: body.trim(),
    model: fm.model ? String(fm.model) : '',
    provider: fm.provider ? String(fm.provider).toLowerCase() : '',
    mcp: list(fm.mcp || fm.mcpServers || fm.mcp_servers),
    starters: list(fm.starters || fm.starter || fm.examples),
  };
}

function openAgents() { renderAgents(); els.agentsView.classList.add('open'); }
function closeAgents() { els.agentsView.classList.remove('open'); }
function setActiveAgent(id) { activeAgentId = id; scheduleSave(); renderAgents(); }

async function importAgentFile() {
  const res = await window.chervil.openAgentFile();
  if (!res || !res.ok) { if (res && res.error) toast(`Import failed: ${res.error}`); return; }
  const a = parseAgentFile(res.text, res.name);
  if (!a.persona) { toast('That file had no agent instructions.'); return; }
  agents.push(a); scheduleSave(); renderAgents();
  toast(`Imported agent “${a.name}”.`);
}

function addAgentFromPaste() {
  const ta = document.getElementById('agent-paste');
  const t = (ta.value || '').trim();
  if (!t) return;
  const a = parseAgentFile(t, 'Pasted agent');
  if (!a.persona) { toast('No agent instructions found in the pasted text.'); return; }
  agents.push(a); ta.value = ''; scheduleSave(); renderAgents();
}

function renderAgents() {
  const list = document.getElementById('agents-list');
  if (!list) return;
  list.innerHTML = '';
  if (!agents.length) {
    const e = document.createElement('div');
    e.className = 'sched-empty';
    e.textContent = 'No agents yet. Import an agent file (Markdown + frontmatter) or paste one above.';
    list.appendChild(e);
    return;
  }
  for (const a of agents) {
    const item = document.createElement('div');
    item.className = 'sched-item';
    const main = document.createElement('div');
    main.className = 'si-main';
    const title = document.createElement('div');
    title.className = 'si-title';
    title.textContent = (a.id === activeAgentId ? '● ' : '') + a.name;
    const when = document.createElement('div');
    when.className = 'si-when';
    when.textContent = [a.description, a.model ? `model: ${a.model}` : '', (a.mcp && a.mcp.length) ? `mcp: ${a.mcp.join(', ')}` : '']
      .filter(Boolean).join(' · ') || 'persona agent';
    main.appendChild(title);
    main.appendChild(when);
    if (a.starters && a.starters.length) {
      const chips = document.createElement('div');
      chips.className = 'agent-starters';
      a.starters.slice(0, 5).forEach((s) => {
        const c = document.createElement('button');
        c.className = 'si-btn';
        c.title = s;
        c.textContent = s.length > 38 ? s.slice(0, 35) + '…' : s;
        c.addEventListener('click', () => { setActiveAgent(a.id); closeAgents(); newTab(true); handleComposerSubmit(s); });
        chips.appendChild(c);
      });
      main.appendChild(chips);
    }
    const act = document.createElement('button');
    act.className = 'si-btn';
    act.textContent = a.id === activeAgentId ? 'Deactivate' : 'Activate';
    act.addEventListener('click', () => setActiveAgent(a.id === activeAgentId ? null : a.id));
    const del = document.createElement('button');
    del.className = 'si-btn';
    del.textContent = 'Delete';
    del.addEventListener('click', () => {
      if (activeAgentId === a.id) activeAgentId = null;
      agents = agents.filter((x) => x.id !== a.id);
      scheduleSave();
      renderAgents();
    });
    item.appendChild(main);
    item.appendChild(act);
    item.appendChild(del);
    list.appendChild(item);
  }
}

// ---- Streaming preview (throttled, active tab only) ----
function scheduleStreamRender(tabId) {
  if (tabId !== activeId || previewTimer) return;
  previewTimer = setTimeout(() => {
    previewTimer = null;
    const rs = runState.get(activeId);
    if (rs && hasDoctype(rs.streamBuffer)) {
      const idx = rs.streamBuffer.search(DOCTYPE_RE);
      renderPageHtml(idx >= 0 ? rs.streamBuffer.slice(idx) : rs.streamBuffer, previewScrollY);
    }
  }, 450);
}

// ---- Submit flow ----

// Deep Dive mode (sticky toggle): the next queries run thorough, cited research.
let deepMode = false;
function setDeepMode(on) {
  deepMode = !!on;
  els.deepToggle.classList.toggle('active', deepMode);
  els.deepToggle.setAttribute('aria-pressed', String(deepMode));
  updatePlaceholder();
}

// ---- File attachments (sources for the next query) ----
let pendingAttachments = [];
const MAX_ATTACH = 6;
const MAX_ATTACH_BYTES = 12 * 1024 * 1024; // 12MB each

function addFiles(fileList) {
  for (const file of Array.from(fileList || [])) {
    if (pendingAttachments.length >= MAX_ATTACH) { toast(`Up to ${MAX_ATTACH} files at a time.`); break; }
    if (file.size > MAX_ATTACH_BYTES) { toast(`“${file.name}” is too large (max 12 MB).`); continue; }
    readAttachment(file);
  }
}

function readAttachment(file) {
  const name = file.name || 'file';
  const type = file.type || '';
  const isImage = /^image\//.test(type) || /\.(png|jpe?g|gif|webp|bmp)$/i.test(name);
  const isPdf = type === 'application/pdf' || /\.pdf$/i.test(name);
  const reader = new FileReader();
  reader.onerror = () => toast(`Couldn’t read “${name}”.`);
  if (isImage || isPdf) {
    reader.onload = () => {
      const m = /^data:([^;]+);base64,(.*)$/.exec(String(reader.result || ''));
      if (!m) return;
      pendingAttachments.push({ id: uid(), name, kind: isPdf ? 'pdf' : 'image', data: m[2], mediaType: m[1] });
      renderAttachChips();
    };
    reader.readAsDataURL(file);
  } else {
    reader.onload = () => {
      pendingAttachments.push({ id: uid(), name, kind: 'text', text: String(reader.result || '') });
      renderAttachChips();
    };
    reader.readAsText(file);
  }
}

function removeAttachment(id) {
  pendingAttachments = pendingAttachments.filter((a) => a.id !== id);
  renderAttachChips();
}

function clearAttachments() {
  pendingAttachments = [];
  renderAttachChips();
}

function renderAttachChips() {
  els.attachChips.innerHTML = '';
  els.attachChips.hidden = !pendingAttachments.length;
  for (const a of pendingAttachments) {
    const chip = document.createElement('div');
    chip.className = 'attach-chip';
    const icon = a.kind === 'image' ? '🖼️' : a.kind === 'pdf' ? '📄' : '📃';
    const label = document.createElement('span');
    label.className = 'attach-name';
    label.textContent = `${icon} ${a.name}`;
    label.title = a.name;
    const x = document.createElement('span');
    x.className = 'attach-x';
    x.textContent = '✕';
    x.addEventListener('click', () => removeAttachment(a.id));
    chip.appendChild(label);
    chip.appendChild(x);
    els.attachChips.appendChild(chip);
  }
}

// Strip a leading wake phrase ("Hey Sprig, …") so the command runs clean and the
// model never sees the wake words. Accepts the command with or without it.
function stripWake(text) {
  // Removes a leading "Hey Sprig," (with or without a greeting word). If the message
  // was only the wake phrase, this returns '' and the submit is a no-op.
  return String(text || '').trim()
    .replace(/^\s*(?:hey|hi|hello|ok|okay|yo)?[\s,]*sprig\b[\s,!:.\-]*/i, '')
    .trim();
}

// Entry point from the composer/keyboard. Routes through the follow-up "ask"
// prompt when appropriate, otherwise submits directly.
// Pull a YouTube video URL out of a message (watch / youtu.be / shorts / embed / live).
function extractYouTubeUrl(text) {
  const m = String(text || '').match(
    /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?[^\s]*v=|shorts\/|embed\/|live\/)|youtu\.be\/)[^\s)]+/i
  );
  return m ? m[0] : null;
}

// Summarize a video, then compose a timestamped summary page. On the Gemini
// provider Sprig watches the video natively (audio+visual); otherwise it fetches
// the YouTube captions.
async function summarizeVideo(tab, url) {
  if (!tab || isTabBusy(tab.id)) return;
  els.prompt.value = '';
  resetPromptHeight();
  addMessage(tab, 'user', `🎬 Summarize video: ${url}`);
  if (tab.title === 'New Tab') tab.title = 'Video summary';
  renderTabs();
  const cfg = providerConfig();
  const gemini = cfg.provider === 'gemini';
  if (tab.id === activeId) {
    setStatus(gemini ? 'Sprig is watching the video with Gemini…' : 'Sprig is fetching the transcript…');
    setBadge('working', gemini ? 'watching' : 'transcript');
    els.send.disabled = true;
  }
  let title = '';
  let content = '';
  let srcUrl = url;
  let truncated = false;
  let label = 'transcript';
  try {
    if (gemini) {
      const r = await window.chervil.videoGemini({ url, config: cfg });
      if (!r || !r.ok) throw new Error((r && r.error) || 'Gemini could not summarize the video');
      title = r.title || 'Video';
      content = r.summary;
      srcUrl = r.url || url;
      label = 'Gemini video summary';
    } else {
      const r = await window.chervil.videoTranscript(url);
      if (!r || !r.ok) throw new Error((r && r.error) || 'no transcript available');
      title = r.title;
      content = r.transcript;
      srcUrl = r.url;
      truncated = r.truncated;
    }
  } catch (err) {
    if (tab.id === activeId) { clearStatus(); els.send.disabled = false; }
    addMessage(tab, 'bot', `Couldn’t summarize that video — ${err.message}.${gemini ? '' : ' (On this provider, only videos with captions are supported — switch to Gemini for caption-free videos.)'}`, 'error');
    return;
  }
  if (tab.id === activeId) { clearStatus(); els.send.disabled = false; }
  const prompt = `Turn the following ${label} of the YouTube video “${title}” (${srcUrl}) into a clean, well-structured page: a 2–3 sentence overview, the key takeaways as bullets, and a “Timestamped highlights” section linking the most important moments as ${srcUrl}&t=SECONDSs (convert each [m:ss] marker to total seconds). ${truncated ? 'The source was long and truncated — summarize what is present and say so.' : ''} Use ONLY the material below; do not invent details.`;
  const attachments = [{ name: 'video.txt', kind: 'text', text: `${label} of “${title}” (${srcUrl}):\n\n${content}` }];
  submitQuery(prompt, { tab, attachments, allowNavigate: false, skipFollowup: true, skipUserMessage: true, displayText: `Summarize video: ${title}` });
}

function handleComposerSubmit(text) {
  const tab = activeTab();
  if (!tab || isTabBusy(tab.id) || agentRunning) return;
  let query = stripWake(text);
  if (!query && pendingAttachments.length) query = 'Make a useful page from the attached file(s).';
  if (!query) return;

  // Consume any attached files for this turn.
  const attachments = pendingAttachments.slice();
  if (attachments.length) clearAttachments();

  // On a live site, the composer drives the web agent instead of composing a page.
  const cur = currentEntry(tab);

  // Video summary: a YouTube URL in the message (or while viewing one) + a summarize intent.
  const ytUrl = extractYouTubeUrl(query) || (cur && cur.kind === 'navigate' ? extractYouTubeUrl(cur.url) : null);
  if (ytUrl && /(summ|tl;?dr|recap|key ?points|key takeaways|digest)/i.test(query)) {
    summarizeVideo(tab, ytUrl);
    return;
  }

  if (cur && cur.kind === 'navigate') { startAgent(query); return; }

  // Deep Dive always composes a fresh research report (no in-place refine).
  if (deepMode) {
    submitQuery(query, { deep: true, skipFollowup: true, allowNavigate: false, attachments });
    return;
  }

  if (settings.followupMode === 'ask' && cur && cur.kind === 'page') {
    promptRefineChoice(query, attachments);
  } else {
    submitQuery(query, { attachments });
  }
}

// Inline "Refine this page / New page" choice for the 'ask' follow-up mode.
function promptRefineChoice(query, attachments = []) {
  const tab = activeTab();
  els.prompt.value = '';
  resetPromptHeight();

  const wrap = document.createElement('div');
  wrap.className = 'msg bot refine-choice';
  const p = document.createElement('div');
  p.textContent = 'Refine the page you’re viewing, or start a new one?';
  wrap.appendChild(p);

  const row = document.createElement('div');
  row.className = 'choice-row';
  const refineBtn = document.createElement('button');
  refineBtn.textContent = 'Refine this page';
  const newBtn = document.createElement('button');
  newBtn.textContent = 'New page';
  row.appendChild(refineBtn);
  row.appendChild(newBtn);
  wrap.appendChild(row);

  els.conversation.appendChild(wrap);
  els.conversation.scrollTop = els.conversation.scrollHeight;

  const cleanup = () => wrap.remove();
  refineBtn.addEventListener('click', () => {
    cleanup();
    submitQuery(query, { tab, refineMode: 'force', attachments });
  });
  newBtn.addEventListener('click', () => {
    cleanup();
    submitQuery(query, { tab, skipFollowup: true, attachments });
  });
}

// Runs one generation against a tab. Multiple tabs may run concurrently; a single
// tab is single-flight. opts:
//   tab           - target tab (defaults to active)
//   displayText   - what to show in the user bubble (defaults to query)
//   refineMode    - 'force' to refine the current page in place
//   skipFollowup  - true to ignore the current page (a fresh request)
//   allowNavigate - false to force composition (used by compose-mode link clicks)
async function submitQuery(text, opts = {}) {
  const query = (text || '').trim();
  if (!query) return;

  const tab = opts.tab || activeTab();
  if (!tab || isTabBusy(tab.id)) return;
  const isActive = () => tab.id === activeId;

  // Decide refine vs new + whether to send the current page as context.
  const curEntry = currentEntry(tab);
  const hasComposed = !!(curEntry && curEntry.kind === 'page');
  let refineMode = null;
  let pageContext = null;
  const allowNavigate = opts.allowNavigate !== false;

  if (opts.remix && hasComposed) {
    // Remix: feed the page as context, but compose a NEW derived page (no in-place refine).
    pageContext = curEntry.html;
    refineMode = null;
  } else if (hasComposed && !opts.skipFollowup) {
    if (opts.refineMode === 'force') {
      pageContext = curEntry.html;
      refineMode = 'force';
    } else if (settings.followupMode === 'auto') {
      pageContext = curEntry.html;
      refineMode = 'auto';
    }
  }

  const deep = opts.deep === true;
  const verify = opts.verify === true;
  const requestId = uid();
  const rs = runStateFor(tab.id);
  rs.genId = requestId;
  rs.statusText = verify ? 'Sprig is fact-checking…' : deep ? 'Sprig is researching deeply…' : 'Sprig is thinking…';
  rs.streamBuffer = '';
  if (tab.id === activeId) previewScrollY = 0;
  reqToTab.set(requestId, tab.id);

  if (!opts.background) {
    els.prompt.value = '';
    resetPromptHeight();
  }

  const atts = opts.attachments || [];
  const attNote = atts.length ? `   📎 ${atts.map((a) => a.name).join(', ')}` : '';
  if (!opts.skipUserMessage) addMessage(tab, 'user', (opts.displayText || query) + attNote);
  if (tab.title === 'New Tab') {
    const label = opts.displayText || query;
    tab.title = label.length > 40 ? label.slice(0, 37) + '…' : label;
  }
  renderTabs();

  const sentHistory = tab.history.slice();
  tab.history.push({ role: 'user', content: query });

  if (isActive()) {
    setStatus(rs.statusText);
    setBadge('working', verify ? 'verifying' : deep ? 'researching' : 'working');
    els.send.disabled = true;
    setRemixVisible(false);
  }

  try {
    const resp = await window.chervil.ask({
      query,
      history: sentHistory,
      requestId,
      pageContext,
      allowNavigate,
      refineMode,
      spaceContext: opts.spaceContext || null,
      deep,
      verify,
      profile: settings.profile || null,
      attachments: opts.attachments || [],
      mcpServers: enabledMcpServers(),
      agent: activeAgentPersona(),
      config: providerConfig(),
    });

    if (isActive() && previewTimer) { clearTimeout(previewTimer); previewTimer = null; }

    // Tear down run state before rendering the result.
    rs.genId = null;
    rs.streamBuffer = '';
    rs.statusText = '';
    reqToTab.delete(requestId);
    if (isActive()) clearStatus();

    if (!resp.ok) {
      addMessage(tab, 'bot', resp.error || 'Something went wrong.', 'error');
      renderTabs();
      if (isActive()) renderCurrentPage();
      return;
    }

    const result = resp.result;
    if (result.kind === 'navigate') {
      pushEntry(tab, { kind: 'navigate', url: result.url, title: result.url, query });
      tab.title = hostOf(result.url);
      const note = result.reason
        ? `Opening ${result.url} — ${result.reason}`
        : `Opening ${result.url}`;
      addMessage(tab, 'bot', note);
      tab.history.push({ role: 'assistant', content: note });
    } else {
      const isRefine = !!result.refine && hasComposed && !opts.skipFollowup;
      if (isRefine) {
        // Replace the current page in place.
        curEntry.html = result.html;
        curEntry.title = result.title || curEntry.title;
        curEntry.sources = result.sources || [];
        curEntry.searches = result.searches || [];
        curEntry.query = query;
      } else {
        pushEntry(tab, {
          kind: 'page',
          html: result.html,
          title: result.title || query,
          sources: result.sources || [],
          searches: result.searches || [],
          query,
        });
      }
      tab.title = result.title || tab.title;
      const n = (result.sources || []).length;
      const grounded = n ? ` — checked ${n} source${n === 1 ? '' : 's'}.` : '.';
      const verb = isRefine
        ? 'Refined the page'
        : verify
          ? 'Ran a trust check'
          : deep
            ? 'Researched and composed a report'
            : 'Composed a page';
      addMessage(tab, 'bot', `${verb}${grounded}`);
      tab.history.push({
        role: 'assistant',
        content: `[${isRefine ? 'Refined' : 'Displayed'} a page titled "${result.title}"]`,
      });
      addToLibrary(tab, result, query);
    }

    renderTabs();
    if (isActive()) renderCurrentPage();
    scheduleSave();
  } catch (err) {
    rs.genId = null;
    rs.streamBuffer = '';
    rs.statusText = '';
    reqToTab.delete(requestId);
    if (isActive()) { clearStatus(); renderCurrentPage(); }
    addMessage(tab, 'bot', String(err && err.message ? err.message : err), 'error');
    renderTabs();
  } finally {
    if (isActive()) {
      els.send.disabled = false;
      els.prompt.focus();
    }
  }
}

// ---- Click-through links ----
function handleLinkClick(href, text) {
  if (!/^https?:\/\//i.test(href)) return;
  const tab = activeTab();
  if (!tab) return;
  const behavior = settings.linkBehavior || 'smart';

  if (behavior === 'live') {
    if (isTabBusy(tab.id)) return;
    pushEntry(tab, { kind: 'navigate', url: href, title: href, query: href });
    tab.title = hostOf(href);
    addMessage(tab, 'bot', `Opening ${href}`);
    tab.history.push({ role: 'assistant', content: `Opening ${href}` });
    renderTabs();
    renderCurrentPage();
    scheduleSave();
    return;
  }

  const label = text && text.trim() ? text.trim().slice(0, 120) : hostOf(href);
  const query = `Open this link: "${label}" — ${href}`;
  // compose => force composition; smart => let the model decide (open_website or compose).
  submitQuery(query, {
    displayText: label,
    skipFollowup: true,
    allowNavigate: behavior !== 'compose',
  });
}

// ---- Library (auto-collected History + Trash) ----
function addToLibrary(tab, result, query) {
  const item = {
    id: uid(),
    createdAt: Date.now(),
    title: result.title || query,
    query,
    html: result.html,
    sources: result.sources || [],
    conversation: tab.conversation.map((m) => ({ ...m })),
    history: tab.history.map((h) => ({ ...h })),
    spaceId: activeSpaceId,
  };
  library.history.unshift(item);
  if (library.history.length > MAX_LIBRARY) library.history.length = MAX_LIBRARY;
}

// ---- Spaces ----
function activeSpace() {
  return spaces.find((s) => s.id === activeSpaceId) || spaces[0] || null;
}

function setActiveSpace(id) {
  if (!spaces.find((s) => s.id === id)) return;
  activeSpaceId = id;
  renderDrawer();
  scheduleSave();
}

function createSpace(name) {
  const sp = { id: uid(), name: String(name || '').trim().slice(0, 40) || 'New Space', createdAt: Date.now() };
  spaces.push(sp);
  activeSpaceId = sp.id;
  renderDrawer();
  scheduleSave();
  return sp;
}

// History items for the active Space (older items lacking spaceId fall into it too,
// so nothing gets stranded after migration).
function spaceItems() {
  return library.history.filter((it) => (it.spaceId || activeSpaceId) === activeSpaceId);
}

function stripText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Build a compact, groundable corpus from the most recent pages in the Space.
function buildSpaceContext(items) {
  const picked = items.slice(0, 8); // history is newest-first
  const parts = picked.map((it, i) => {
    const body = stripText(it.html).slice(0, 700);
    return `[Page ${i + 1}] "${it.title || it.query}"\n  My original ask: ${it.query}\n  Content: ${body}`;
  });
  return parts.join('\n\n').slice(0, 7000);
}

// Synthesize a new page grounded in everything collected in the active Space.
function synthesizeSpace(query) {
  const items = spaceItems();
  const sp = activeSpace();
  if (!items.length) {
    closeDrawer();
    const tab = activeTab();
    if (tab) addMessage(tab, 'bot', `Your "${sp ? sp.name : 'Space'}" has no pages yet — compose a few, then synthesize.`, 'error');
    return;
  }
  const spaceContext = buildSpaceContext(items);
  const q = (query || '').trim() ||
    `Synthesize everything I've collected in my "${sp ? sp.name : 'research'}" Space into one clear overview — compare the pages, connect the themes, and tell me the key takeaways.`;
  closeDrawer();
  submitQuery(q, {
    spaceContext,
    skipFollowup: true,
    allowNavigate: false,
    displayText: (query || '').trim() || `Synthesize "${sp ? sp.name : 'my Space'}" (${items.length} pages)`,
  });
}

function openLibraryItem(item) {
  const rootId = uid();
  const tab = {
    id: uid(),
    title: item.title || 'Saved page',
    conversation: (item.conversation || []).map((m) => ({ ...m })),
    history: (item.history || []).map((h) => ({ ...h })),
    pages: [
      {
        id: rootId,
        parentId: null,
        kind: 'page',
        html: item.html,
        title: item.title,
        sources: item.sources || [],
        query: item.query,
      },
    ],
    currentId: rootId,
  };
  tabs.push(tab);
  activeId = tab.id;
  closeDrawer();
  renderTabs();
  renderConversation();
  renderCurrentPage();
  refreshComposer();
  scheduleSave();
}

function deleteLibraryItem(id) {
  const idx = library.history.findIndex((i) => i.id === id);
  if (idx === -1) return;
  const [it] = library.history.splice(idx, 1);
  library.trash.unshift(it);
  if (library.trash.length > MAX_LIBRARY) library.trash.length = MAX_LIBRARY;
  renderDrawer();
  scheduleSave();
}

function restoreLibraryItem(id) {
  const idx = library.trash.findIndex((i) => i.id === id);
  if (idx === -1) return;
  const [it] = library.trash.splice(idx, 1);
  library.history.unshift(it);
  renderDrawer();
  scheduleSave();
}

function emptyTrash() {
  library.trash = [];
  renderDrawer();
  scheduleSave();
}

function relTime(ts) {
  if (!ts) return '';
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function renderSpaceBar() {
  // The Space bar only applies to the History tab.
  els.spaceBar.hidden = drawerTab !== 'history';
  if (drawerTab !== 'history') {
    if (els.newSpaceRow) els.newSpaceRow.hidden = true;
    if (els.synthRow) els.synthRow.hidden = true;
    return;
  }
  els.spaceSelect.innerHTML = '';
  for (const sp of spaces) {
    const opt = document.createElement('option');
    opt.value = sp.id;
    opt.textContent = sp.name;
    if (sp.id === activeSpaceId) opt.selected = true;
    els.spaceSelect.appendChild(opt);
  }
}

function renderDrawer() {
  els.libTabHistory.classList.toggle('active', drawerTab === 'history');
  els.libTabTrash.classList.toggle('active', drawerTab === 'trash');
  els.emptyTrash.hidden = drawerTab !== 'trash';
  renderSpaceBar();

  const items = drawerTab === 'history' ? spaceItems() : library.trash;
  els.libraryList.innerHTML = '';

  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'lib-empty';
    empty.textContent = drawerTab === 'history'
      ? 'No pages in this Space yet. Compose some, then synthesize.'
      : 'Trash is empty.';
    els.libraryList.appendChild(empty);
    return;
  }

  for (const item of items) {
    const row = document.createElement('div');
    row.className = 'lib-row';

    const main = document.createElement('div');
    main.className = 'lib-main';
    const title = document.createElement('div');
    title.className = 'lib-title';
    title.textContent = item.title || item.query || 'Untitled page';
    const meta = document.createElement('div');
    meta.className = 'lib-meta';
    meta.textContent = relTime(item.createdAt);
    main.appendChild(title);
    main.appendChild(meta);
    row.appendChild(main);

    const actions = document.createElement('div');
    actions.className = 'lib-actions';
    if (drawerTab === 'history') {
      main.title = 'Open';
      main.style.cursor = 'pointer';
      main.addEventListener('click', () => openLibraryItem(item));
      const del = document.createElement('button');
      del.className = 'lib-btn';
      del.textContent = 'Delete';
      del.addEventListener('click', () => deleteLibraryItem(item.id));
      actions.appendChild(del);
    } else {
      const restore = document.createElement('button');
      restore.className = 'lib-btn';
      restore.textContent = 'Restore';
      restore.addEventListener('click', () => restoreLibraryItem(item.id));
      actions.appendChild(restore);
    }
    row.appendChild(actions);
    els.libraryList.appendChild(row);
  }
}

function openDrawer() {
  drawerTab = 'history';
  renderDrawer();
  els.libraryDrawer.classList.add('open');
}

function closeDrawer() {
  els.libraryDrawer.classList.remove('open');
}

// ---- Settings ----
function applySettingsToUI() {
  for (const r of els.settingsModal.querySelectorAll('input[name="linkBehavior"]')) {
    r.checked = r.value === settings.linkBehavior;
  }
  for (const r of els.settingsModal.querySelectorAll('input[name="followupMode"]')) {
    r.checked = r.value === settings.followupMode;
  }
  for (const r of els.settingsModal.querySelectorAll('input[name="provider"]')) {
    r.checked = r.value === settings.provider;
  }
  applyProviderUI();
  populateVoiceSelect();
  els.profileInput.value = settings.profile || '';
  if (els.notifyToggle) els.notifyToggle.checked = settings.notifications !== false;
  if (els.tabLayoutSelect) els.tabLayoutSelect.value = isVerticalTabs() ? 'vertical' : 'horizontal';
  if (els.sttEndpoint) els.sttEndpoint.value = settings.sttEndpoint || '';
  if (els.sttModel) els.sttModel.value = settings.sttModel || '';
  if (els.voiceAutosend) els.voiceAutosend.checked = !!settings.voiceAutosend;
  if (els.sttKeyInput) els.sttKeyInput.value = '';
  refreshSttKeyStatus();
  renderMcpServers();
}

// Reflect whether a speech-to-text key is saved (key lives in the main process).
async function refreshSttKeyStatus() {
  if (!els.sttKeyStatus) return;
  try {
    const st = await window.chervil.getKeyStatus();
    const has = st && st.stt;
    els.sttKeyStatus.textContent = has ? 'A transcription key is saved.' : 'No transcription key saved yet.';
    els.sttKeyStatus.className = 'field-note' + (has ? ' ok' : '');
  } catch { /* ignore */ }
}

// ---- MCP servers (Claude's native remote MCP connector) ----
// Only enabled servers with a URL are sent. MCP tools run server-side as part of
// the request, so the opt-in list IS the trust gate — we recommend trusted/read-only
// servers. MCP is Claude-only and remote-URL-only in this build.
function enabledMcpServers() {
  if (settings.provider !== 'claude') return [];
  let servers = (settings.mcpServers || []).filter((s) => s && s.enabled && s.url && s.url.trim());
  // An active agent can restrict which MCP servers it's allowed to use.
  const ag = activeAgent();
  if (ag && Array.isArray(ag.mcp) && ag.mcp.length) {
    const allow = new Set(ag.mcp.map((n) => String(n).toLowerCase()));
    servers = servers.filter((s) => allow.has(String(s.name || '').toLowerCase()));
  }
  return servers.map((s) => ({ name: s.name || 'mcp', url: s.url.trim(), token: (s.token || '').trim() || undefined, enabled: true }));
}

function renderMcpServers() {
  const list = els.mcpList;
  if (!list) return;
  const servers = settings.mcpServers || [];
  list.innerHTML = '';
  if (!servers.length) {
    const empty = document.createElement('div');
    empty.className = 'mcp-empty';
    empty.textContent = 'No MCP servers yet. Add a remote MCP server (URL) to give Sprig its tools.';
    list.appendChild(empty);
  }
  for (const s of servers) {
    const row = document.createElement('div');
    row.className = 'mcp-row';
    row.dataset.id = s.id;

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.className = 'mcp-toggle';
    toggle.checked = !!s.enabled;
    toggle.title = s.enabled ? 'Enabled' : 'Disabled';
    toggle.addEventListener('change', () => { s.enabled = toggle.checked; scheduleSave(); });

    const info = document.createElement('div');
    info.className = 'mcp-info';
    const name = document.createElement('div');
    name.className = 'mcp-name';
    name.textContent = s.name || '(unnamed)';
    const url = document.createElement('div');
    url.className = 'mcp-url';
    url.textContent = (s.token ? '🔒 ' : '') + (s.url || '');
    info.appendChild(name);
    info.appendChild(url);

    const remove = document.createElement('button');
    remove.className = 'mcp-remove';
    remove.type = 'button';
    remove.textContent = '✕';
    remove.title = 'Remove this server';
    remove.addEventListener('click', () => {
      settings.mcpServers = (settings.mcpServers || []).filter((x) => x.id !== s.id);
      renderMcpServers();
      scheduleSave();
    });

    row.appendChild(toggle);
    row.appendChild(info);
    row.appendChild(remove);
    list.appendChild(row);
  }
}

function addMcpServer() {
  const name = (els.mcpName.value || '').trim();
  const url = (els.mcpUrl.value || '').trim();
  const token = (els.mcpToken.value || '').trim();
  if (!url) { toast('Enter the MCP server URL.'); return; }
  if (!/^https?:\/\//i.test(url)) { toast('MCP URL must start with http:// or https://'); return; }
  settings.mcpServers = settings.mcpServers || [];
  settings.mcpServers.push({ id: uid(), name: name || hostOf(url) || 'mcp', url, token, enabled: true });
  els.mcpName.value = '';
  els.mcpUrl.value = '';
  els.mcpToken.value = '';
  renderMcpServers();
  scheduleSave();
}

// Reflect the selected provider: which fields show, labels, and current values.
function applyProviderUI() {
  const p = settings.provider;
  els.providerKeyRow.hidden = p === 'ollama'; // Ollama needs no key
  els.providerModelRow.hidden = p === 'azure'; // Azure uses the deployment instead
  els.ollamaExtra.hidden = p !== 'ollama';
  els.azureExtra.hidden = p !== 'azure';

  els.providerKeyLabel.textContent = `API key for ${PROVIDER_LABELS[p]}`;
  rebuildModelSelect();
  els.ollamaUrl.value = settings.ollamaUrl || '';
  els.azureEndpoint.value = settings.azureEndpoint || '';
  els.azureDeployment.value = settings.azureDeployment || '';
  els.azureApiVersion.value = settings.azureApiVersion || '';
  els.apiKeyInput.value = '';
  refreshKeyStatus();
}

// Live models fetched from each provider's API this session (merged with the
// curated suggestions). Refreshed whenever Settings opens or the provider changes.
const liveModels = {};

// Curated suggestions + any live models, deduped (curated keep their friendly labels).
function modelOptionsFor(p) {
  const map = new Map((MODEL_OPTIONS[p] || []).map(([v, l]) => [v, l]));
  const live = liveModels[p];
  if (Array.isArray(live)) for (const id of live) if (id && !map.has(id)) map.set(id, id);
  return [...map.entries()];
}

// Populate the model <select> for the active provider; show a custom text field
// when the saved model isn't one of the options.
function populateModelSelect() {
  const p = settings.provider;
  const opts = modelOptionsFor(p);
  const cur = settings[MODEL_SETTING[p]] || '';

  els.modelSelect.innerHTML = '';
  for (const [val, label] of opts) {
    const o = document.createElement('option');
    o.value = val;
    o.textContent = label;
    els.modelSelect.appendChild(o);
  }
  const customOpt = document.createElement('option');
  customOpt.value = CUSTOM_MODEL;
  customOpt.textContent = 'Custom…';
  els.modelSelect.appendChild(customOpt);

  const known = opts.some(([v]) => v === cur);
  if (cur && !known) {
    els.modelSelect.value = CUSTOM_MODEL;
    els.modelCustom.hidden = false;
    els.modelCustom.value = cur;
  } else {
    const value = cur || (opts[0] && opts[0][0]) || '';
    els.modelSelect.value = value;
    els.modelCustom.hidden = true;
    els.modelCustom.value = '';
    if (!cur && value) { settings[MODEL_SETTING[p]] = value; scheduleSave(); }
  }
}

function rebuildModelSelect() {
  populateModelSelect();      // immediate, from curated + cached live
  fetchModelsFor(settings.provider); // async refresh from the provider's API
}

// Pull the live model list from the provider and repopulate if it's still showing.
function fetchModelsFor(p) {
  if (p === 'azure') return; // Azure is deployment-based — no model list
  window.chervil.listModels(providerConfig()).then((res) => {
    if (res && res.ok && Array.isArray(res.models) && res.models.length) {
      liveModels[p] = res.models;
      if (settings.provider === p && els.settingsModal.classList.contains('open')) {
        populateModelSelect();
      }
    }
  }).catch(() => {});
}

function refreshKeyStatus() {
  const p = settings.provider;
  if (p === 'ollama') { els.apiKeyStatus.textContent = ''; return; }
  window.chervil.getKeyStatus().then((s) => {
    const has = s && s[p];
    if (has) {
      els.apiKeyStatus.textContent = (p === 'claude' && s.claudeFromEnv)
        ? 'Using the key from your .env file.'
        : 'A saved key is in use (encrypted on this machine).';
      els.apiKeyStatus.className = 'field-note ok';
    } else {
      els.apiKeyStatus.textContent = `No ${PROVIDER_LABELS[p]} key set — calls will fail. Add one above.`;
      els.apiKeyStatus.className = 'field-note warn';
    }
  }).catch(() => {});
}

function openSettings() {
  applySettingsToUI();
  els.settingsModal.classList.add('open');
}

function closeSettings() {
  els.settingsModal.classList.remove('open');
}

// ---- Persistence ----
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    window.chervil.saveState({ tabs, activeId, settings, library, spaces, activeSpaceId, living, schedules, agents, activeAgentId });
  }, 500);
}

function sanitizeTab(t) {
  const pages = Array.isArray(t.pages) ? t.pages : [];
  // Migrate older linear histories: give every node an id and link it to the previous
  // one as its parent (a straight chain), preserving back/forward order.
  let prevId = null;
  for (const p of pages) {
    if (!p.id) p.id = uid();
    if (p.parentId === undefined) p.parentId = prevId;
    prevId = p.id;
  }
  let currentId = t.currentId;
  if (!currentId || !pages.find((p) => p.id === currentId)) {
    const idx = typeof t.current === 'number' ? t.current : pages.length - 1;
    currentId = pages[idx] ? pages[idx].id : (pages.length ? pages[pages.length - 1].id : null);
  }
  return {
    id: t.id || uid(),
    title: t.title || 'New Tab',
    conversation: Array.isArray(t.conversation) ? t.conversation : [],
    history: Array.isArray(t.history) ? t.history : [],
    pages,
    currentId,
  };
}

async function init() {
  let restored = null;
  try {
    restored = await window.chervil.loadState();
  } catch { /* ignore */ }

  if (restored && Array.isArray(restored.tabs) && restored.tabs.length) {
    tabs = restored.tabs.map(sanitizeTab);
    activeId = tabs.find((t) => t.id === restored.activeId) ? restored.activeId : tabs[0].id;
  } else {
    newTab(false);
    activeId = tabs[0].id;
  }

  if (restored && restored.settings) {
    settings = { ...settings, ...restored.settings };
    // Tolerate older/corrupt state: MCP servers must be a clean array of records.
    settings.mcpServers = Array.isArray(settings.mcpServers)
      ? settings.mcpServers.filter((s) => s && s.url).map((s) => ({
          id: s.id || uid(), name: s.name || '', url: s.url, token: s.token || '', enabled: s.enabled !== false,
        }))
      : [];
  }
  if (restored && restored.library) {
    library = {
      history: Array.isArray(restored.library.history) ? restored.library.history : [],
      trash: Array.isArray(restored.library.trash) ? restored.library.trash : [],
    };
  }

  // Spaces: restore, or migrate by creating a default Space and adopting any
  // previously-collected pages into it.
  if (restored && Array.isArray(restored.spaces) && restored.spaces.length) {
    spaces = restored.spaces;
    activeSpaceId = spaces.find((s) => s.id === restored.activeSpaceId)
      ? restored.activeSpaceId
      : spaces[0].id;
  } else {
    const def = { id: uid(), name: 'My Research', createdAt: Date.now() };
    spaces = [def];
    activeSpaceId = def.id;
    for (const it of library.history) if (!it.spaceId) it.spaceId = def.id;
    for (const it of library.trash) if (!it.spaceId) it.spaceId = def.id;
  }

  if (restored && Array.isArray(restored.living)) {
    living = restored.living.filter((r) => r && r.entryId && r.intervalMs);
    // Reset the clock so pages don't all refresh at once on launch (avoids a cost burst).
    for (const r of living) { r.refreshing = false; r.lastRun = Date.now(); }
  }
  if (restored && Array.isArray(restored.schedules)) {
    schedules = restored.schedules
      .filter((s) => s && s.prompt && s.rule)
      .map((s) => ({ ...s, running: false }));
  }
  if (restored && Array.isArray(restored.agents)) {
    agents = restored.agents.filter((a) => a && a.persona);
    activeAgentId = restored.activeAgentId && agents.find((a) => a.id === restored.activeAgentId) ? restored.activeAgentId : null;
  }
  startScheduler();

  applyTabLayout();
  renderTabs();
  renderConversation();
  renderCurrentPage();
  refreshComposer();
  els.prompt.focus();
}

// ---- Save (to disk) ----
async function saveCurrentPage() {
  const tab = activeTab();
  const entry = currentEntry(tab);
  if (!entry || entry.kind !== 'page') return;

  const res = await window.chervil.savePage({
    html: entry.html,
    suggestedName: entry.title,
  });
  if (res && res.ok) {
    addMessage(tab, 'bot', `Saved to ${res.path}`);
  } else if (res && !res.canceled) {
    addMessage(tab, 'bot', `Couldn't save: ${res.error || 'unknown error'}`, 'error');
  }
}

async function exportCurrentPdf() {
  const tab = activeTab();
  const entry = currentEntry(tab);
  if (!entry || entry.kind !== 'page') return;
  toast('Exporting PDF…');
  const res = await window.chervil.exportPdf({ html: entry.html, suggestedName: entry.title });
  if (res && res.ok) addMessage(tab, 'bot', `Exported PDF to ${res.path}`);
  else if (res && !res.canceled) addMessage(tab, 'bot', `Couldn't export PDF: ${res.error || 'unknown error'}`, 'error');
}

async function exportCurrentPptx() {
  const tab = activeTab();
  const entry = currentEntry(tab);
  if (!entry || entry.kind !== 'page') return;
  toast('Building PowerPoint…');
  const res = await window.chervil.exportPptx({ html: entry.html, suggestedName: entry.title, config: providerConfig() });
  if (res && res.ok) addMessage(tab, 'bot', `Exported PowerPoint to ${res.path}`);
  else if (res && !res.canceled) addMessage(tab, 'bot', `Couldn't export PowerPoint: ${res.error || 'unknown error'}`, 'error');
}

async function exportCurrentDocx() {
  const tab = activeTab();
  const entry = currentEntry(tab);
  if (!entry || entry.kind !== 'page') return;
  toast('Building Word document…');
  const res = await window.chervil.exportDocx({ html: entry.html, suggestedName: entry.title, config: providerConfig() });
  if (res && res.ok) addMessage(tab, 'bot', `Exported Word document to ${res.path}`);
  else if (res && !res.canceled) addMessage(tab, 'bot', `Couldn't export Word doc: ${res.error || 'unknown error'}`, 'error');
}

async function exportCurrentXlsx() {
  const tab = activeTab();
  const entry = currentEntry(tab);
  if (!entry || entry.kind !== 'page') return;
  toast('Building Excel workbook…');
  const res = await window.chervil.exportXlsx({ html: entry.html, suggestedName: entry.title, config: providerConfig() });
  if (res && res.ok) addMessage(tab, 'bot', `Exported Excel workbook to ${res.path}`);
  else if (res && !res.canceled) addMessage(tab, 'bot', `Couldn't export Excel: ${res.error || 'unknown error'}`, 'error');
}

async function exportCurrentImage(format) {
  const tab = activeTab();
  const entry = currentEntry(tab);
  if (!entry || entry.kind !== 'page') return;
  toast(`Rendering ${format.toUpperCase()}…`);
  const res = await window.chervil.exportImage({ html: entry.html, suggestedName: entry.title, format });
  if (res && res.ok) addMessage(tab, 'bot', `Exported ${format.toUpperCase()} to ${res.path}`);
  else if (res && !res.canceled) addMessage(tab, 'bot', `Couldn't export image: ${res.error || 'unknown error'}`, 'error');
}

// The remix-bar "⤓ Export…" dropdown routes to the chosen format, then resets.
function onExportSelect(e) {
  const v = e.target.value;
  e.target.value = '';
  if (v === 'pdf') exportCurrentPdf();
  else if (v === 'png') exportCurrentImage('png');
  else if (v === 'jpg') exportCurrentImage('jpg');
  else if (v === 'pptx') exportCurrentPptx();
  else if (v === 'docx') exportCurrentDocx();
  else if (v === 'xlsx') exportCurrentXlsx();
}

// ---- Helpers ----
function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url; }
}

// ---- Events ----
function autoGrowPrompt() {
  els.prompt.style.height = 'auto';
  els.prompt.style.height = Math.min(els.prompt.scrollHeight, 168) + 'px';
}

function resetPromptHeight() {
  els.prompt.style.height = 'auto';
}

els.composer.addEventListener('submit', (e) => {
  e.preventDefault();
  handleComposerSubmit(els.prompt.value);
});

els.deepToggle.addEventListener('click', () => setDeepMode(!deepMode));

// File attachments: button, picker, and drag-and-drop.
els.attachBtn.addEventListener('click', () => els.fileInput.click());
els.fileInput.addEventListener('change', () => { addFiles(els.fileInput.files); els.fileInput.value = ''; });
let dragDepth = 0;
window.addEventListener('dragenter', (e) => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) { e.preventDefault(); dragDepth++; els.dropOverlay.hidden = false; } });
window.addEventListener('dragover', (e) => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) e.preventDefault(); });
window.addEventListener('dragleave', () => { dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) els.dropOverlay.hidden = true; });
window.addEventListener('drop', (e) => {
  e.preventDefault();
  dragDepth = 0;
  els.dropOverlay.hidden = true;
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
});

// Voice input: record the mic, transcribe via the configured Whisper endpoint.
if (els.micBtn) els.micBtn.addEventListener('click', toggleVoiceInput);

els.prompt.addEventListener('input', autoGrowPrompt);

els.prompt.addEventListener('keydown', (e) => {
  // Enter sends; Shift+Enter inserts a newline. Ignore Enter during IME composition.
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    handleComposerSubmit(els.prompt.value);
  }
});

els.suggestions.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-q]');
  if (btn) handleComposerSubmit(btn.getAttribute('data-q'));
});

els.newTab.addEventListener('click', () => newTab(true));
// Tab reorder: allow dropping a dragged tab anywhere along the strip/rail.
els.tabs.addEventListener('dragover', onTabsDragOver);
els.tabs.addEventListener('drop', (e) => e.preventDefault());
els.back.addEventListener('click', goBack);
els.fwd.addEventListener('click', goForward);
els.save.addEventListener('click', saveCurrentPage);

// Back/forward tooltips showing the target page.
for (const btn of [els.back, els.fwd]) {
  btn.addEventListener('mouseenter', () => { if (!btn.disabled && btn.dataset.tip) showNavTip(btn, btn.dataset.tip); });
  btn.addEventListener('mouseleave', hideNavTip);
}

// Thinking canvas (page map)
els.mapBtn.addEventListener('click', openMap);
els.schedBtn.addEventListener('click', openSched);
els.schedView.addEventListener('click', (e) => { if (e.target === els.schedView) closeSched(); });
document.getElementById('sched-close').addEventListener('click', closeSched);
document.getElementById('sched-type').addEventListener('change', onSchedTypeChange);
document.getElementById('sched-form').addEventListener('submit', (e) => { e.preventDefault(); addScheduleFromForm(); });
els.agentsBtn.addEventListener('click', openAgents);
els.agentsView.addEventListener('click', (e) => { if (e.target === els.agentsView) closeAgents(); });
document.getElementById('agents-close').addEventListener('click', closeAgents);
document.getElementById('agent-import').addEventListener('click', importAgentFile);
document.getElementById('agent-add').addEventListener('click', addAgentFromPaste);
els.mapClose.addEventListener('click', closeMap);
els.mapView.addEventListener('click', (e) => { if (e.target === els.mapView) closeMap(); });

// Remix bar + audio controls
els.remixBar.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-remix]');
  if (btn) remix(btn.getAttribute('data-remix'));
});
els.audioBtn.addEventListener('click', playPageAudio);
els.audioToggle.addEventListener('click', toggleAudio);
els.audioStop.addEventListener('click', stopAudio);
els.verifyBtn.addEventListener('click', verifyPage);
els.sourcesBtn.addEventListener('click', toggleSourcesPanel);
els.exportSelect.addEventListener('change', onExportSelect);
els.sourcesClose.addEventListener('click', () => { els.sourcesPanel.hidden = true; });
els.liveSelect.addEventListener('change', onLiveSelectChange);
els.voiceSelect.addEventListener('change', () => { settings.voiceURI = els.voiceSelect.value; scheduleSave(); });
els.rateSelect.addEventListener('change', () => { settings.audioRate = parseFloat(els.rateSelect.value) || 1; scheduleSave(); });
els.voiceTest.addEventListener('click', testVoice);
els.profileInput.addEventListener('input', () => { settings.profile = els.profileInput.value; scheduleSave(); });

// Settings
els.settingsBtn.addEventListener('click', openSettings);
els.settingsClose.addEventListener('click', closeSettings);
els.settingsModal.addEventListener('click', (e) => {
  if (e.target === els.settingsModal) closeSettings();
});
els.settingsModal.addEventListener('change', (e) => {
  const t = e.target;
  if (t && t.name === 'linkBehavior') settings.linkBehavior = t.value;
  else if (t && t.name === 'followupMode') settings.followupMode = t.value;
  else if (t && t.name === 'provider') { settings.provider = t.value; applyProviderUI(); }
  else return;
  scheduleSave();
});

// Model dropdown writes to the active provider's model setting; "Custom…" reveals
// a text field for any model id.
els.modelSelect.addEventListener('change', () => {
  if (els.modelSelect.value === CUSTOM_MODEL) {
    els.modelCustom.hidden = false;
    els.modelCustom.value = '';
    els.modelCustom.focus();
    settings[MODEL_SETTING[settings.provider]] = '';
  } else {
    els.modelCustom.hidden = true;
    settings[MODEL_SETTING[settings.provider]] = els.modelSelect.value;
  }
  scheduleSave();
});
els.modelCustom.addEventListener('input', () => {
  settings[MODEL_SETTING[settings.provider]] = els.modelCustom.value.trim();
  scheduleSave();
});
els.ollamaUrl.addEventListener('input', () => { settings.ollamaUrl = els.ollamaUrl.value.trim(); scheduleSave(); });
els.azureEndpoint.addEventListener('input', () => { settings.azureEndpoint = els.azureEndpoint.value.trim(); scheduleSave(); });
els.azureDeployment.addEventListener('input', () => { settings.azureDeployment = els.azureDeployment.value.trim(); scheduleSave(); });
els.azureApiVersion.addEventListener('input', () => { settings.azureApiVersion = els.azureApiVersion.value.trim(); scheduleSave(); });

// Voice input (speech-to-text) settings.
if (els.sttEndpoint) els.sttEndpoint.addEventListener('input', () => { settings.sttEndpoint = els.sttEndpoint.value.trim(); scheduleSave(); });
if (els.sttModel) els.sttModel.addEventListener('input', () => { settings.sttModel = els.sttModel.value.trim(); scheduleSave(); });
if (els.voiceAutosend) els.voiceAutosend.addEventListener('change', () => { settings.voiceAutosend = els.voiceAutosend.checked; scheduleSave(); });
if (els.sttKeySave) els.sttKeySave.addEventListener('click', async () => {
  els.sttKeyStatus.textContent = 'Saving…';
  els.sttKeyStatus.className = 'field-note';
  try {
    const res = await window.chervil.setApiKey('stt', els.sttKeyInput.value.trim());
    if (res && res.ok) {
      els.sttKeyInput.value = '';
      if (res.warn) { els.sttKeyStatus.textContent = res.warn; els.sttKeyStatus.className = 'field-note warn'; }
      else refreshSttKeyStatus();
    } else {
      els.sttKeyStatus.textContent = (res && res.error) || 'Could not save the key.';
      els.sttKeyStatus.className = 'field-note warn';
    }
  } catch (e) {
    els.sttKeyStatus.textContent = String(e && e.message ? e.message : e);
    els.sttKeyStatus.className = 'field-note warn';
  }
});

// Tab layout (horizontal strip vs. vertical rail).
if (els.tabLayoutSelect) els.tabLayoutSelect.addEventListener('change', () => {
  settings.tabLayout = els.tabLayoutSelect.value === 'vertical' ? 'vertical' : 'horizontal';
  applyTabLayout();
  scheduleSave();
});

// Notifications toggle.
if (els.notifyToggle) els.notifyToggle.addEventListener('change', () => {
  settings.notifications = els.notifyToggle.checked;
  scheduleSave();
});

// MCP servers: add button + Enter-to-add in the URL field.
if (els.mcpAddBtn) els.mcpAddBtn.addEventListener('click', addMcpServer);
if (els.mcpUrl) els.mcpUrl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addMcpServer(); } });

// Save / clear the API key for the selected provider (handled securely in main).
els.apiKeySave.addEventListener('click', async () => {
  els.apiKeyStatus.textContent = 'Saving…';
  els.apiKeyStatus.className = 'field-note';
  try {
    const res = await window.chervil.setApiKey(settings.provider, els.apiKeyInput.value.trim());
    els.apiKeyInput.value = '';
    refreshKeyStatus();
    if (res && res.warn) { els.apiKeyStatus.textContent = res.warn; els.apiKeyStatus.className = 'field-note warn'; }
  } catch {
    els.apiKeyStatus.textContent = 'Could not save the key.';
    els.apiKeyStatus.className = 'field-note warn';
  }
});

// Library drawer
els.historyBtn.addEventListener('click', openDrawer);
els.libraryClose.addEventListener('click', closeDrawer);
els.libraryDrawer.addEventListener('click', (e) => {
  if (e.target === els.libraryDrawer) closeDrawer();
});
els.libTabHistory.addEventListener('click', () => { drawerTab = 'history'; renderDrawer(); });
els.libTabTrash.addEventListener('click', () => { drawerTab = 'trash'; renderDrawer(); });
els.emptyTrash.addEventListener('click', emptyTrash);

// Spaces
els.spaceSelect.addEventListener('change', (e) => setActiveSpace(e.target.value));
els.newSpaceBtn.addEventListener('click', () => {
  els.synthRow.hidden = true;
  els.newSpaceRow.hidden = !els.newSpaceRow.hidden;
  if (!els.newSpaceRow.hidden) { els.newSpaceName.value = ''; els.newSpaceName.focus(); }
});
function commitNewSpace() {
  const name = els.newSpaceName.value.trim();
  if (!name) { els.newSpaceRow.hidden = true; return; }
  createSpace(name);
  els.newSpaceRow.hidden = true;
}
els.createSpaceBtn.addEventListener('click', commitNewSpace);
els.newSpaceName.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); commitNewSpace(); }
  else if (e.key === 'Escape') { els.newSpaceRow.hidden = true; }
});
els.synthesizeBtn.addEventListener('click', () => {
  els.newSpaceRow.hidden = true;
  els.synthRow.hidden = !els.synthRow.hidden;
  if (!els.synthRow.hidden) { els.synthInput.value = ''; els.synthInput.focus(); }
});
els.synthGo.addEventListener('click', () => { els.synthRow.hidden = true; synthesizeSpace(els.synthInput.value); });
els.synthInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); els.synthRow.hidden = true; synthesizeSpace(els.synthInput.value); }
  else if (e.key === 'Escape') { els.synthRow.hidden = true; }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (els.agentsView.classList.contains('open')) { closeAgents(); return; }
    if (els.schedView.classList.contains('open')) { closeSched(); return; }
    if (els.mapView.classList.contains('open')) { closeMap(); return; }
    if (els.settingsModal.classList.contains('open')) { closeSettings(); return; }
    if (els.libraryDrawer.classList.contains('open')) { closeDrawer(); return; }
  }
  if (e.ctrlKey && e.key === 't') { e.preventDefault(); newTab(true); }
  else if (e.ctrlKey && e.key === 'w') { e.preventDefault(); if (activeId) closeTab(activeId); }
  else if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); goBack(); }
  else if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); goForward(); }
});

// Messages bubbled up from composed pages (sandboxed iframe): link clicks and
// applet tool calls.
window.addEventListener('message', (e) => {
  const d = e.data;
  if (!d || d.__chervil !== true) return;
  if (d.type === 'link' && d.href) { handleLinkClick(d.href, d.text || ''); return; }
  if (d.type === 'tool') { handleAppletTool(e.source, d); return; }
  if (d.type === 'scroll' && typeof d.y === 'number') { previewScrollY = d.y; return; }
});

// Keyboard scrolling for composed pages. A sandboxed iframe only scrolls via the
// keyboard when ITS document has focus (i.e. after a click). On a freshly composed
// page focus is still on the parent window, so PageDown/Space/arrows did nothing.
// Forward those keys into the page frame (which scrolls itself) — but only when the
// page is actually showing and focus isn't in the composer or another control.
document.addEventListener('keydown', (e) => {
  if (els.frame.hidden || !els.overlay.hidden) return;     // not viewing a composed page
  const ae = document.activeElement;
  if (ae && ae !== document.body) return;                  // composer/control/page has focus — leave it
  let key;
  if (e.key === 'PageDown') key = 'PageDown';
  else if (e.key === 'PageUp') key = 'PageUp';
  else if (e.key === 'Home') key = 'Home';
  else if (e.key === 'End') key = 'End';
  else if (e.key === 'ArrowDown') key = 'ArrowDown';
  else if (e.key === 'ArrowUp') key = 'ArrowUp';
  else if (e.key === ' ') key = e.shiftKey ? 'ShiftSpace' : 'Space';
  else return;
  const win = els.frame.contentWindow;
  if (!win) return;
  e.preventDefault();
  win.postMessage({ __chervil: true, type: 'scrollkey', key }, '*');
});

// An applet inside a composed page asked Sprig for something. Run it and post the
// result back to that page's window.
async function handleAppletTool(source, msg) {
  const reply = (payload) => {
    try {
      if (source) source.postMessage({ __chervil: true, type: 'tool-result', id: msg.id, ...payload }, '*');
    } catch { /* ignore */ }
  };
  try {
    if (msg.name === 'ask') {
      const prompt = String((msg.args && msg.args.prompt) || '').trim();
      if (!prompt) return reply({ ok: false, error: 'Empty request.' });
      const res = await window.chervil.appletAsk({ prompt, config: providerConfig() });
      if (res && res.ok) reply({ ok: true, result: { text: res.text, sources: res.sources || [] } });
      else reply({ ok: false, error: (res && res.error) || 'Sprig could not answer.' });
    } else {
      reply({ ok: false, error: 'Unknown tool: ' + msg.name });
    }
  } catch (err) {
    reply({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

// Streamed status updates, routed to the originating tab.
window.chervil.onStatus(({ requestId, status } = {}) => {
  const tabId = reqToTab.get(requestId);
  if (!tabId) return;
  const rs = runStateFor(tabId);
  if (/retrying/i.test(status)) {
    rs.streamBuffer = '';
    if (tabId === activeId && previewTimer) { clearTimeout(previewTimer); previewTimer = null; }
    if (tabId === activeId) setBadge('working', 'reconnecting');
  }
  rs.statusText = status;
  if (tabId === activeId) setStatus(status);
});

// Streamed HTML deltas, routed to the originating tab.
window.chervil.onChunk(({ requestId, delta } = {}) => {
  const tabId = reqToTab.get(requestId);
  if (!tabId) return;
  const rs = runStateFor(tabId);
  rs.streamBuffer += delta;
  if (tabId === activeId && hasDoctype(rs.streamBuffer)) {
    rs.statusText = 'Sprig is composing your page…';
    setStatus(rs.statusText);
    setBadge('working', 'composing');
    scheduleStreamRender(tabId);
  }
});

// Clicking a background notification jumps to the page that updated.
if (window.chervil.onNotificationClick) {
  window.chervil.onNotificationClick(({ tabId, entryId } = {}) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;
    if (entryId && tab.pages.some((p) => p.id === entryId)) tab.currentId = entryId;
    if (tab.id !== activeId) switchTab(tab.id);
    else { renderCurrentPage(); renderTabs(); }
    scheduleSave();
  });
}

// Prompts fired from the floating quick-ask bar (global hotkey) open a fresh tab.
if (window.chervil.onQuickPrompt) {
  window.chervil.onQuickPrompt((prompt) => {
    newTab(true);
    handleComposerSubmit(String(prompt || ''));
  });
}

init();
