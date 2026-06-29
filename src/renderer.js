'use strict';

// ---- Elements ----
const els = {
  conversation: document.getElementById('conversation'),
  composer: document.getElementById('composer'),
  prompt: document.getElementById('prompt'),
  send: document.getElementById('send'),
  deepToggle: document.getElementById('deep-toggle'),
  learnToggle: document.getElementById('learn-toggle'),
  quizToggle: document.getElementById('quiz-toggle'),
  chatToggle: document.getElementById('chat-toggle'),
  attachBtn: document.getElementById('attach-btn'),
  foldersBtn: document.getElementById('folders-btn'),
  micBtn: document.getElementById('mic-btn'),
  fileInput: document.getElementById('file-input'),
  attachChips: document.getElementById('attach-chips'),
  // Data folders modal (RFC 0004 local on-ramp)
  foldersModal: document.getElementById('folders-modal'),
  foldersClose: document.getElementById('folders-close'),
  foldersList: document.getElementById('folders-list'),
  foldersAdd: document.getElementById('folders-add'),
  folderBrowse: document.getElementById('folder-browse'),
  folderBrowseTitle: document.getElementById('folder-browse-title'),
  folderBrowseBack: document.getElementById('folder-browse-back'),
  folderFilter: document.getElementById('folder-filter'),
  folderFiles: document.getElementById('folder-files'),
  folderPickCount: document.getElementById('folder-pick-count'),
  folderAttach: document.getElementById('folder-attach'),
  dropOverlay: document.getElementById('drop-overlay'),
  pageTitle: document.getElementById('page-title'),
  badge: document.getElementById('mode-badge'),
  frame: document.getElementById('page-frame'),
  webview: document.getElementById('web-view'),
  overlay: document.getElementById('overlay'),
  remixBar: document.getElementById('remix-bar'),
  remixMin: document.getElementById('remix-min'),
  remixHandle: document.getElementById('remix-handle'),
  verifyBtn: document.getElementById('verify-btn'),
  refreshPageBtn: document.getElementById('refresh-page-btn'),
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
  main: document.getElementById('main'),
  sidebarToggle: document.getElementById('sidebar-toggle'),
  tabs: document.getElementById('tabs'),
  newTab: document.getElementById('new-tab'),
  tabActions: document.getElementById('tab-actions'),
  tabMenu: document.getElementById('tab-menu'),
  tabSelectBar: document.getElementById('tab-select-bar'),
  tabSelectCount: document.getElementById('tab-select-count'),
  tabSelectAll: document.getElementById('tab-select-all'),
  tabSelectClose: document.getElementById('tab-select-close'),
  tabSelectDone: document.getElementById('tab-select-done'),
  tabSwitcher: document.getElementById('tab-switcher'),
  tabSwitcherInput: document.getElementById('tab-switcher-input'),
  tabSwitcherList: document.getElementById('tab-switcher-list'),
  findBar: document.getElementById('find-bar'),
  findInput: document.getElementById('find-input'),
  findCount: document.getElementById('find-count'),
  findPrev: document.getElementById('find-prev'),
  findNext: document.getElementById('find-next'),
  findClose: document.getElementById('find-close'),
  back: document.getElementById('back-btn'),
  fwd: document.getElementById('fwd-btn'),
  navTip: document.getElementById('nav-tip'),
  mapBtn: document.getElementById('map-btn'),
  mapView: document.getElementById('map-view'),
  schedBtn: document.getElementById('sched-btn'),
  schedView: document.getElementById('sched-view'),
  agentsBtn: document.getElementById('agents-btn'),
  agentsView: document.getElementById('agents-view'),
  auditList: document.getElementById('audit-list'),
  auditClear: document.getElementById('audit-clear'),
  agentChip: document.getElementById('agent-chip'),
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
  publishToken: document.getElementById('publish-token'),
  publishBase: document.getElementById('publish-base'),
  cloudLivePrompt: document.getElementById('cloud-live-prompt'),
  syncFolder: document.getElementById('sync-folder'),
  syncChoose: document.getElementById('sync-choose'),
  syncClear: document.getElementById('sync-clear'),
  syncStatus: document.getElementById('sync-status'),
  accountBox: document.getElementById('account-box'),
  publishSave: document.getElementById('publish-save'),
  publishStatus: document.getElementById('publish-status'),
  sttKeyInput: document.getElementById('stt-key-input'),
  sttKeySave: document.getElementById('stt-key-save'),
  sttKeyStatus: document.getElementById('stt-key-status'),
  voiceAutosend: document.getElementById('voice-autosend'),
  // Listening — "Hey Sprig"
  wakeToggle: document.getElementById('wake-toggle'),
  wakeStatus: document.getElementById('wake-status'),
  wakeKeyword: document.getElementById('wake-keyword'),
  wakeImport: document.getElementById('wake-import'),
  wakeKeywordNote: document.getElementById('wake-keyword-note'),
  wakeThreshold: document.getElementById('wake-threshold'),
  wakeThresholdVal: document.getElementById('wake-threshold-val'),
  // Appearance
  tabLayoutSelect: document.getElementById('tab-layout-select'),
  remixDefaultSelect: document.getElementById('remix-default-select'),
  // Notifications
  notifyToggle: document.getElementById('notify-toggle'),
  heroToggle: document.getElementById('hero-toggle'),
  heroNote: document.getElementById('hero-note'),
  credsPanel: document.getElementById('creds-panel'),
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
  libTabBookmarks: document.getElementById('lib-tab-bookmarks'),
  libTabSites: document.getElementById('lib-tab-sites'),
  libTabTrash: document.getElementById('lib-tab-trash'),
  clearSites: document.getElementById('clear-sites'),
  bookmarkBtn: document.getElementById('bookmark-btn'),
  pwFillBtn: document.getElementById('autofill-pw-btn'),
  emptyTrash: document.getElementById('empty-trash'),
  libImportPage: document.getElementById('lib-import-page'),
  libSelectToggle: document.getElementById('lib-select-toggle'),
  libSelectBar: document.getElementById('lib-select-bar'),
  libSelectCount: document.getElementById('lib-select-count'),
  libSelectAll: document.getElementById('lib-select-all'),
  libSelectDelete: document.getElementById('lib-select-delete'),
  libSelectDone: document.getElementById('lib-select-done'),
  // Spaces
  spaceBar: document.getElementById('space-bar'),
  spaceSelect: document.getElementById('space-select'),
  newSpaceBtn: document.getElementById('new-space-btn'),
  synthesizeBtn: document.getElementById('synthesize-btn'),
  publishSpaceBtn: document.getElementById('publish-space-btn'),
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
let closedTabs = []; // recently-closed tab snapshots for Ctrl+Shift+T (in-memory)
const MAX_CLOSED_TABS = 12;

// Global, persisted settings (non-secret). The API key is handled separately by
// the main process (encrypted), never stored here.
let settings = {
  linkBehavior: 'smart',
  followupMode: 'auto',
  provider: 'claude',
  claudeModel: 'claude-sonnet-4-6',
  grokModel: 'grok-4.3',
  geminiModel: 'gemini-2.5-flash',
  openaiModel: 'gpt-5.5',
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
  remixMinimized: true, // start the floating remix/export bar collapsed to its corner handle
  tabLayout: 'horizontal', // 'horizontal' (top strip) or 'vertical' (side rail)
  sttEndpoint: 'https://api.openai.com/v1/audio/transcriptions', // Whisper-compatible STT
  sttModel: 'whisper-1',
  voiceAutosend: false, // auto-send the transcript instead of just filling the box
  // Listening — "Hey Sprig" wake mode (openWakeWord, on-device, free, no key).
  wakeEnabled: false,
  wakeKeyword: 'hey_sprig', // built-in: hey_sprig | hey_jarvis | alexa | hey_mycroft, or 'custom' (.onnx in userData)
  wakeKeywordLabel: '',      // display label for a loaded custom model
  wakeThreshold: 0.6,        // detection score cutoff (0–1; higher = fewer false triggers). Tunable in Settings → Voice.
  // Publishing — Chervil Pro: publish a lesson to a shareable getchervil.com link.
  publishToken: '',          // from getchervil.com/me (stored locally)
  publishBase: 'https://getchervil.com',
  cloudLivePrompt: true,     // after publishing a page, offer cloud auto-refresh (RFC 0007). Off → never auto-ask; still enable from Publish ☁.
  // Data folders (RFC 0004 local on-ramp): designated folders to pull files from.
  dataFolders: [],           // [{ id, name, path }] — local or desktop-synced OneDrive/GDrive
  // Autofill identity (non-sensitive only — never passwords/cards). Filled into
  // forms on real sites on request.
  autofill: {},              // { fullName, givenName, familyName, email, phone, address, city, postal, country, organization }
  sidebarCollapsed: false,   // hide the left chat sidebar for a full-width page (Ctrl+\)
  chatMode: false,           // "Just a chatbot" — plain conversational replies, no page composed
  heroImages: false,         // generate an AI hero image for composed pages (opt-in; BYO image key, costs money)
  pageStyle: 'balanced',     // composed-page richness: 'balanced' | 'rich' | 'minimal'
  spaceFilesMode: 'synthesize', // pinned Space files feed the model: 'synthesize' | 'always' | 'off'
  toolbar: {},               // which top-bar buttons to show — { key: false } hides one (missing = shown)
  credsAutoLock: 'hide',     // password vault auto-lock: 'hide' | '5' | '15' | '30' (min idle) | 'never'
};

// Per-provider metadata for the Settings UI.
const PROVIDER_LABELS = {
  claude: 'Claude', grok: 'Grok (xAI)', gemini: 'Gemini', openai: 'OpenAI', azure: 'Azure AI Foundry', ollama: 'Ollama',
};
const MODEL_SETTING = {
  claude: 'claudeModel', grok: 'grokModel', gemini: 'geminiModel', openai: 'openaiModel', azure: 'azureModel', ollama: 'ollamaModel',
};
const MODEL_PLACEHOLDER = {
  claude: 'claude-sonnet-4-6', grok: 'grok-4.3', gemini: 'gemini-2.5-flash', openai: 'gpt-5.5', azure: '(uses deployment)', ollama: 'gemma3:4b',
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
    ['grok-4.3', 'grok-4.3 — recommended (web search)'],
    ['grok-4.20-0309-reasoning', 'grok-4.20 — reasoning'],
    ['grok-4.20-0309-non-reasoning', 'grok-4.20 — non-reasoning'],
  ],
  gemini: [
    ['gemini-2.5-flash', 'gemini-2.5-flash — fast & cheap'],
    ['gemini-2.5-pro', 'gemini-2.5-pro — top quality'],
  ],
  openai: [
    ['gpt-5.5', 'gpt-5.5 — recommended (web search)'],
    ['gpt-5.5-pro', 'gpt-5.5-pro — top quality'],
  ],
  ollama: [
    ['gemma3:4b', 'gemma3:4b'],
    ['llama3.2:latest', 'llama3.2'],
  ],
  azure: [],
};
const CUSTOM_MODEL = '__custom__';

// The provider config sent to the agent with each request.
function providerConfig(agentOverride) {
  const p = settings.provider;
  const c = { provider: p, model: settings[MODEL_SETTING[p]] };
  if (p === 'ollama') { c.ollamaModel = settings.ollamaModel; c.ollamaUrl = settings.ollamaUrl; }
  else if (p === 'azure') {
    c.azureEndpoint = settings.azureEndpoint;
    c.azureDeployment = settings.azureDeployment;
    c.azureApiVersion = settings.azureApiVersion;
  }
  // An active agent may pin a model (applied only when it matches the current provider).
  const ag = agentOverride || activeAgent();
  if (ag && ag.model && (!ag.provider || ag.provider === c.provider)) {
    c.model = ag.model;
    if (c.provider === 'ollama') c.ollamaModel = ag.model;
  }
  return c;
}

// Auto-collected library of composed pages, plus a trash bin.
//   item = { id, createdAt, title, query, html, sources, conversation, history, spaceId }
let library = { history: [], trash: [] };
let bookmarks = []; // [{ id, key, kind:'site'|'page', url?, query?, title, at }]
// Tombstones for removed bookmarks, so a delete propagates across synced machines
// and the union-merge (lib/stateMerge.js) doesn't resurrect it. [{ key, at }]
let bookmarkTombstones = [];
const MAX_BOOKMARK_TOMBSTONES = 1000;
let siteHistory = []; // [{ id, url, title, at }] newest-first — real sites visited
const MAX_SITE_HISTORY = 500;
let agentAudit = []; // [{ at, type, target, decision, ok }] — agent action audit trail (RFC 0006)
const MAX_AGENT_AUDIT = 500;
let drawerTab = 'history';
// History multi-select (bulk delete) state.
let librarySelectMode = false;
let selectedLibraryIds = new Set();

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
// Multi-stage agents: ordered pipelines of agents that pass results to each other.
// [{ id, name, stageAgentIds:[agentId,…] }]. draftStages backs the inline builder.
let pipelines = [];
let draftStages = [];
// Per-page persisted storage for interactive composed pages (checkboxes, etc.).
// Composed pages run in a sandbox with no same-origin access, so their own
// localStorage can't persist; we shim it and keep the data here, keyed by a stable
// entry.storeKey that travels with bookmark/history snapshots. { storeKey: {k:v} }
let pageStores = {};
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
const cancelledRequests = new Set(); // requestIds the user stopped — their results are ignored

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
    if(!/^(https?|tel):/i.test(href)) return;  // also forward tel: for one-tap call/send
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
  // Find-in-page for composed pages: the parent forwards Ctrl+F queries here.
  window.addEventListener('message', function(e){
    var d = e.data;
    if(!d || d.__chervil !== true || d.type !== 'find') return;
    try {
      if(!d.text){ var s = window.getSelection && window.getSelection(); if(s) s.removeAllRanges(); return; }
      window.find(d.text, false, !!d.back, true, false, false, false);
    } catch(_){}
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
    ask: function(prompt){ return call('ask', { prompt: String(prompt || '') }); },
    applet: function(prompt, force){ return call('applet', { prompt: String(prompt || ''), force: !!force }); },
    info: function(){ return call('system_info'); },
    details: function(){ return call('system_details'); },
    // Guarded OS actions (RFC 0006 Track B). Each runs only after the user
    // confirms; types are allowlisted. e.g. os('open_url', { url }), os('open_downloads').
    os: function(type, args){ return call('os_action', { type: String(type||''), args: args||{} }); }
  };
  // Back-compat: pages composed before the Chervil rename call window.parslee.*
  try { window.parslee = window.chervil; } catch(e){}

  // (localStorage/sessionStorage are shimmed by a separate script injected into
  //  <head> so they're ready before the page's own scripts — see pageStorageShim.)

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

// A synchronous localStorage/sessionStorage shim for composed pages. The sandbox
// iframe has no same-origin access, so a page's real localStorage throws / never
// persists. This shadows it with an in-memory store seeded from Chervil's saved
// data, and posts every change up to the parent (which persists it per page). It
// must run in <head>, before the page's own scripts, so reads on load see the seed.
function pageStorageShim(seedJson) {
  return `<script>(function(){
  var store=${seedJson}||{};
  function persist(){try{parent.postMessage({__chervil:true,type:'page-store',data:store},'*');}catch(e){}}
  var api={
    getItem:function(k){k=String(k);return Object.prototype.hasOwnProperty.call(store,k)?store[k]:null;},
    setItem:function(k,v){store[String(k)]=String(v);persist();},
    removeItem:function(k){delete store[String(k)];persist();},
    clear:function(){Object.keys(store).forEach(function(k){delete store[k];});persist();},
    key:function(i){return Object.keys(store)[i]||null;}
  };
  try{Object.defineProperty(api,'length',{get:function(){return Object.keys(store).length;}});}catch(e){}
  try{Object.defineProperty(window,'localStorage',{configurable:true,get:function(){return api;}});}
  catch(e){try{window.localStorage=api;}catch(_){}}
  try{Object.defineProperty(window,'sessionStorage',{configurable:true,get:function(){return api;}});}catch(e){}
})();</script>`;
}

// Insert a snippet as early as possible (right after <head>, else <html>, else
// at the very front) so it runs before any of the page's own scripts.
function injectIntoHead(html, snippet) {
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => m + snippet);
  if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, (m) => m + snippet);
  return snippet + html;
}

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
    pinned: false,
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

// Remember a closed tab so Ctrl+Shift+T can reopen it (keeps its full state).
function recordClosedTab(tab) {
  if (!tab) return;
  closedTabs.push(tab);
  if (closedTabs.length > MAX_CLOSED_TABS) closedTabs.shift();
}

// Reopen the most recently closed tab, restoring its conversation/pages.
function reopenClosedTab() {
  const tab = closedTabs.pop();
  if (!tab) { toast('No recently closed tabs.'); return; }
  if (tabs.some((t) => t.id === tab.id)) tab.id = uid(); // avoid an id collision
  if (tab.pinned) tabs.splice(lastPinnedIndex() + 1, 0, tab);
  else tabs.push(tab);
  activeId = tab.id;
  renderTabs();
  renderConversation();
  showActiveTabView();
  refreshComposer();
  scheduleSave();
}

function closeTab(id) {
  const idx = tabs.findIndex((t) => t.id === id);
  if (idx === -1) return;
  recordClosedTab(tabs[idx]);
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

// ---- Bulk / managed tab close ----
// Close every tab in `ids` at once, fixing the active tab and cleaning up state.
function closeTabs(ids) {
  const idSet = new Set(ids);
  idSet.delete(undefined);
  if (!idSet.size) return;
  const closingActive = idSet.has(activeId);
  const activeIdx = tabs.findIndex((t) => t.id === activeId);
  // Pick the closest surviving tab from the ORIGINAL array before any splicing:
  // first to the right of the active tab, then to the left. This id stays valid
  // no matter how many entries shift during the splice loop below.
  let nextId;
  if (closingActive && activeIdx !== -1) {
    for (let i = activeIdx + 1; i < tabs.length; i++) {
      if (!idSet.has(tabs[i].id)) { nextId = tabs[i].id; break; }
    }
    if (nextId === undefined) {
      for (let i = activeIdx - 1; i >= 0; i--) {
        if (!idSet.has(tabs[i].id)) { nextId = tabs[i].id; break; }
      }
    }
  }
  for (const id of idSet) {
    const idx = tabs.findIndex((t) => t.id === id);
    if (idx !== -1) { recordClosedTab(tabs[idx]); tabs.splice(idx, 1); }
    runState.delete(id);
  }
  living = living.filter((r) => !idSet.has(r.tabId));
  if (tabs.length === 0) {
    newTab(true);
  } else if (closingActive) {
    if (previewTimer) { clearTimeout(previewTimer); previewTimer = null; }
    // nextId is the pre-computed closest survivor; fall back to last tab as a safety net.
    const next = tabs.find((t) => t.id === nextId) || tabs[tabs.length - 1];
    activeId = next.id;
    renderConversation();
    showActiveTabView();
    refreshComposer();
  }
  renderTabs();
  scheduleSave();
}

// Bulk-close helpers protect pinned tabs — they're only closed explicitly.
function closeOtherTabs(id) { closeTabs(tabs.filter((t) => t.id !== id && !t.pinned).map((t) => t.id)); }

function closeTabsToRight(id) {
  const i = tabs.findIndex((t) => t.id === id);
  if (i === -1) return;
  closeTabs(tabs.slice(i + 1).filter((t) => !t.pinned).map((t) => t.id));
}

function closeAllTabs() {
  const closable = tabs.filter((t) => !t.pinned);
  if (!closable.length) { toast('Only pinned tabs remain.'); return; }
  if (closable.length > 1 && !confirm(`Close ${closable.length} tabs? Pinned tabs are kept. This clears their conversations.`)) return;
  closeTabs(closable.map((t) => t.id));
}

// ---- Pin / unpin: pinned tabs sort to the front and resist bulk close ----
function lastPinnedIndex() {
  let i = -1;
  for (let k = 0; k < tabs.length; k++) if (tabs[k].pinned) i = k;
  return i;
}
function pinTab(id) {
  const idx = tabs.findIndex((t) => t.id === id);
  if (idx === -1 || tabs[idx].pinned) return;
  const [t] = tabs.splice(idx, 1);
  t.pinned = true;
  tabs.splice(lastPinnedIndex() + 1, 0, t); // after the current pinned group
  renderTabs();
  scheduleSave();
}
function unpinTab(id) {
  const idx = tabs.findIndex((t) => t.id === id);
  if (idx === -1 || !tabs[idx].pinned) return;
  const [t] = tabs.splice(idx, 1);
  t.pinned = false;
  tabs.splice(lastPinnedIndex() + 1, 0, t); // first slot after pinned group
  renderTabs();
  scheduleSave();
}
function toggleTabPin(id) {
  const t = tabs.find((x) => x.id === id);
  if (!t) return;
  if (t.pinned) unpinTab(id); else pinTab(id);
}

// ---- Ctrl+K tab switcher (command palette for tabs) ----
let tabSwitcherItems = [];
let tabSwitcherIdx = 0;

function tabSwitcherIsOpen() { return els.tabSwitcher && !els.tabSwitcher.hidden; }
function openTabSwitcher() {
  if (!els.tabSwitcher || tabs.length <= 1) { if (tabs.length <= 1) toast('Only one tab open.'); return; }
  els.tabSwitcherInput.value = '';
  tabSwitcherIdx = 0;
  els.tabSwitcher.hidden = false;
  renderTabSwitcher();
  els.tabSwitcherInput.focus();
}
function closeTabSwitcher() { if (els.tabSwitcher) els.tabSwitcher.hidden = true; }

function renderTabSwitcher() {
  const q = (els.tabSwitcherInput.value || '').trim().toLowerCase();
  tabSwitcherItems = q ? tabs.filter((t) => tabLabel(t).toLowerCase().includes(q)) : tabs.slice();
  if (tabSwitcherIdx >= tabSwitcherItems.length) tabSwitcherIdx = Math.max(0, tabSwitcherItems.length - 1);
  const list = els.tabSwitcherList;
  list.innerHTML = '';
  if (!tabSwitcherItems.length) {
    const e = document.createElement('div');
    e.className = 'palette-empty';
    e.textContent = 'No matching tabs.';
    list.appendChild(e);
    return;
  }
  tabSwitcherItems.forEach((t, i) => {
    const row = document.createElement('div');
    row.className = 'palette-row' + (i === tabSwitcherIdx ? ' active' : '');
    const icon = document.createElement('span');
    icon.className = 'pr-icon';
    icon.textContent = t.pinned ? '📌' : (isTabBusy(t.id) ? '⏳' : '○');
    const title = document.createElement('span');
    title.className = 'pr-title';
    title.textContent = tabLabel(t);
    const tag = document.createElement('span');
    tag.className = 'pr-tag';
    tag.textContent = t.id === activeId ? 'current' : '';
    row.appendChild(icon);
    row.appendChild(title);
    row.appendChild(tag);
    row.addEventListener('click', () => chooseTabSwitcher(i));
    list.appendChild(row);
  });
  const activeRow = list.children[tabSwitcherIdx];
  if (activeRow && activeRow.scrollIntoView) activeRow.scrollIntoView({ block: 'nearest' });
}
function moveTabSwitcher(delta) {
  if (!tabSwitcherItems.length) return;
  tabSwitcherIdx = (tabSwitcherIdx + delta + tabSwitcherItems.length) % tabSwitcherItems.length;
  renderTabSwitcher();
}
function chooseTabSwitcher(i) {
  const t = tabSwitcherItems[i != null ? i : tabSwitcherIdx];
  closeTabSwitcher();
  if (t) switchTab(t.id);
}

// ---- Tab right-click context menu ----
let tabMenuTargetId = null;
function openTabMenu(e, tabId) {
  e.preventDefault();
  e.stopPropagation();
  tabMenuTargetId = tabId;
  const menu = els.tabMenu;
  const i = tabs.findIndex((t) => t.id === tabId);
  const target = tabs[i];
  const pinBtn = menu.querySelector('[data-act="pin"]');
  if (pinBtn) pinBtn.textContent = (target && target.pinned) ? 'Unpin tab' : 'Pin tab';
  menu.querySelector('[data-act="others"]').disabled = tabs.length <= 1;
  menu.querySelector('[data-act="right"]').disabled = i < 0 || i >= tabs.length - 1;
  const layoutBtn = menu.querySelector('[data-act="layout"]');
  if (layoutBtn) layoutBtn.textContent = isVerticalTabs() ? 'Switch to horizontal tabs' : 'Switch to vertical tabs';
  menu.hidden = false;
  const mw = menu.offsetWidth || 200;
  const mh = menu.offsetHeight || 220;
  let x = e.clientX;
  let y = e.clientY;
  if (x + mw > window.innerWidth) x = window.innerWidth - mw - 6;
  if (y + mh > window.innerHeight) y = window.innerHeight - mh - 6;
  menu.style.left = Math.max(6, x) + 'px';
  menu.style.top = Math.max(6, y) + 'px';
}
function closeTabMenu() { if (els.tabMenu) els.tabMenu.hidden = true; tabMenuTargetId = null; }
function onTabMenuClick(act) {
  const id = tabMenuTargetId;
  closeTabMenu();
  if (!id) return;
  if (act === 'new') newTab(true);
  else if (act === 'pin') toggleTabPin(id);
  else if (act === 'close') closeTab(id);
  else if (act === 'others') closeOtherTabs(id);
  else if (act === 'right') closeTabsToRight(id);
  else if (act === 'select') enterTabSelect(id);
  else if (act === 'layout') toggleTabLayout();
  else if (act === 'all') closeAllTabs();
}

// ---- Multi-select close mode ----
function enterTabSelect(preselectId) {
  tabSelectMode = true;
  selectedTabIds = new Set(preselectId ? [preselectId] : []);
  els.tabSelectBar.hidden = false;
  updateTabSelectBar();
  renderTabs();
}
function exitTabSelect() {
  tabSelectMode = false;
  selectedTabIds.clear();
  els.tabSelectBar.hidden = true;
  renderTabs();
}
function toggleTabSelected(id) {
  if (selectedTabIds.has(id)) selectedTabIds.delete(id);
  else selectedTabIds.add(id);
  updateTabSelectBar();
  renderTabs();
}
function selectAllTabs() {
  const all = selectedTabIds.size === tabs.length;
  selectedTabIds = new Set(all ? [] : tabs.map((t) => t.id));
  updateTabSelectBar();
  renderTabs();
}
function closeSelectedTabs() {
  if (!selectedTabIds.size) return;
  const ids = [...selectedTabIds];
  exitTabSelect();
  closeTabs(ids);
}
function updateTabSelectBar() {
  els.tabSelectCount.textContent = `${selectedTabIds.size} selected`;
  els.tabSelectClose.disabled = selectedTabIds.size === 0;
  els.tabSelectAll.textContent = (tabs.length && selectedTabIds.size === tabs.length) ? 'Select none' : 'Select all';
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
    el.className = 'tab'
      + (tab.id === activeId ? ' active' : '')
      + (tab.pinned ? ' pinned' : '')
      + (tabSelectMode ? ' selecting' : '')
      + (selectedTabIds.has(tab.id) ? ' sel' : '');
    el.title = tabLabel(tab);
    el.dataset.tabId = tab.id;
    el.draggable = !tabSelectMode; // click-hold-drag to reorder (off in select mode)

    if (tabSelectMode) {
      const cb = document.createElement('span');
      cb.className = 'tab-check';
      cb.textContent = selectedTabIds.has(tab.id) ? '☑' : '☐';
      el.appendChild(cb);
    }

    if (tab.pinned) {
      const pin = document.createElement('span');
      pin.className = 'tab-pin';
      pin.textContent = '📌';
      el.appendChild(pin);
    }

    if (isTabBusy(tab.id)) {
      const spin = document.createElement('span');
      spin.className = 'tab-spin';
      el.appendChild(spin);
    }

    const title = document.createElement('span');
    title.className = 'tab-title';
    title.textContent = tabLabel(tab);
    el.appendChild(title);

    // Pinned tabs hide the inline ✕ (close them via the menu) and shrink to the pin.
    if (!tabSelectMode && !tab.pinned) {
      const close = document.createElement('span');
      close.className = 'tab-close';
      close.textContent = '✕';
      close.addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab(tab.id);
      });
      el.appendChild(close);
    }

    // A real drag suppresses the trailing click, so plain clicks still switch tabs.
    el.addEventListener('click', () => {
      if (tabSelectMode) { toggleTabSelected(tab.id); return; }
      if (!tabDragId) switchTab(tab.id);
    });
    el.addEventListener('contextmenu', (e) => openTabMenu(e, tab.id));
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

function toggleTabLayout() {
  settings.tabLayout = isVerticalTabs() ? 'horizontal' : 'vertical';
  applyTabLayout();
  if (els.tabLayoutSelect) els.tabLayoutSelect.value = settings.tabLayout;
  scheduleSave();
}

// ---- Chat sidebar collapse (full-width composed page) ----
// Directional chevron: ‹ points left to HIDE the (left-hand) sidebar; › points
// right to SHOW it again — so the icon always reflects what the click will do.
// Sidebar toggle uses a panel glyph (a window with a filled-vs-empty left column),
// not a chevron — so it's not mistaken for the back/forward arrows beside it.
// HIDE = sidebar currently shown (left column filled); SHOW = collapsed (outline).
const SIDEBAR_ICON_HIDE = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M9 4 H5.5 A2.5 2.5 0 0 0 3 6.5 V17.5 A2.5 2.5 0 0 0 5.5 20 H9 Z" fill="currentColor" stroke="none"/><path d="M9 4v16"/></svg>';
const SIDEBAR_ICON_SHOW = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M9 4v16"/></svg>';
function applySidebarCollapsed() {
  const on = !!settings.sidebarCollapsed;
  if (els.main) els.main.classList.toggle('sidebar-collapsed', on);
  if (els.sidebarToggle) {
    els.sidebarToggle.setAttribute('aria-pressed', String(on));
    els.sidebarToggle.title = on ? 'Show chat sidebar (Ctrl+\\)' : 'Hide chat sidebar (Ctrl+\\)';
    els.sidebarToggle.innerHTML = on ? SIDEBAR_ICON_SHOW : SIDEBAR_ICON_HIDE;
  }
}

function toggleSidebar() {
  settings.sidebarCollapsed = !settings.sidebarCollapsed;
  applySidebarCollapsed();
  scheduleSave();
}

// ---- Drag-to-reorder tabs (works horizontally or vertically) ----
let tabDragId = null;
let tabSelectMode = false;
let selectedTabIds = new Set();

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
  // Enforce the pinned-first invariant (stable within each group), then re-sync
  // the DOM in case a drag crossed the pinned boundary.
  const reordered = tabs.filter((t) => t.pinned).concat(tabs.filter((t) => !t.pinned));
  const changed = reordered.some((t, i) => t !== tabs[i]);
  tabs = reordered;
  if (changed) renderTabs();
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

// A varied pool of starter ideas for the welcome overlay. Each entry is
// [chip label, full "Hey Sprig, …" query]. We shuffle-pick a few each time the
// overlay appears so users keep seeing fresh suggestions. Mix of categories:
// research, planning, learn/quiz, open-a-real-site, agentic "do", comparisons,
// and a little fun.
const SUGGESTION_POOL = [
  // Research / news
  ['Latest in AI this week', "what's the latest in AI this week?"],
  ['What happened in tech today', 'what happened in tech today?'],
  ['Explain the news on a topic', 'catch me up on the biggest news story today'],
  ['Best new sci-fi books', 'what are the best new sci-fi books this year?'],
  ['How does mRNA work?', 'explain how mRNA vaccines work, simply'],
  ['Why is the sky blue?', 'why is the sky blue? explain like I have 5 minutes'],
  // Planning
  ['3-day Tokyo food tour', 'plan a 3-day food tour of Tokyo'],
  ['Weekend in Lisbon', 'plan a weekend trip to Lisbon on a budget'],
  ['Meal plan for the week', 'build me a healthy 7-day dinner meal plan'],
  ['Plan a home gym', 'help me plan a budget home gym in a small space'],
  ['Beginner garden plan', 'plan a beginner vegetable garden for spring'],
  // Learn / quiz
  ['Learn Python basics', '/learn the basics of Python programming'],
  ['Teach me chess openings', '/learn the most useful chess openings for beginners'],
  ['Quiz me on world capitals', '/quiz me on world capitals'],
  ['Learn how SSL works', '/learn how HTTPS and SSL certificates work'],
  ['Quiz me on the solar system', '/quiz me on the planets and the solar system'],
  // Open a real site
  ['Open YouTube', 'open YouTube'],
  ['Open Wikipedia', 'open Wikipedia'],
  ['Open Hacker News', 'open Hacker News'],
  ['Go to GitHub', 'go to github.com'],
  ['Open my email', 'open Gmail'],
  // Agentic "do"
  ['Find flights to Denver', 'find me flights to Denver next month'],
  ['Summarize a webpage', 'summarize this article for me: '],
  ['Draft a quick email', 'help me draft a polite email asking for a deadline extension'],
  ['Compare two products', 'compare the best robot vacuums under $400'],
  // Comparisons
  ['iPhone 16 vs Pixel 9', 'compare the iPhone 16 and Pixel 9'],
  ['React vs Vue in 2026', 'compare React and Vue for a new project in 2026'],
  ['Coffee vs tea for focus', 'is coffee or tea better for focus? give me the science'],
  // Fun
  ['Build a trivia game', 'make me a quick trivia game about movies'],
  ['Tell me a fun fact', 'tell me a genuinely surprising fun fact and explain it'],
  ['Plan a movie night', 'plan a cozy movie night with snacks and a theme'],
  ['Write a haiku about code', 'write a haiku about debugging code'],
];

// Remember the last shown set so we don't repeat it back-to-back.
let _lastSuggestionKeys = [];

function shuffleSuggestions(count = 4) {
  // Fisher–Yates on a copy (Math.random is fine for cosmetic shuffling).
  const pool = SUGGESTION_POOL.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  let pick = pool.slice(0, count);
  // If the new set fully overlaps the previous one, reshuffle once to vary it.
  const keyOf = (p) => p[0];
  const lastSet = new Set(_lastSuggestionKeys);
  if (pick.every((p) => lastSet.has(keyOf(p))) && pool.length > count) {
    pick = pool.slice(count, count * 2);
  }
  _lastSuggestionKeys = pick.map(keyOf);
  return pick;
}

function renderSuggestions() {
  if (!els.suggestions) return;
  const picks = shuffleSuggestions(4);
  els.suggestions.innerHTML = '';
  for (const [label, query] of picks) {
    const btn = document.createElement('button');
    btn.setAttribute('data-q', `Hey Sprig, ${query}`);
    btn.textContent = label;
    els.suggestions.appendChild(btn);
  }
}

function showOverlay() {
  els.frame.hidden = false;
  els.frame.removeAttribute('srcdoc');
  els.webview.hidden = true;
  els.webview.removeAttribute('src');
  els.overlay.hidden = false;
  renderSuggestions();
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
  // Seed the page's (shimmed) localStorage from saved state so interactive pages —
  // checklists, toggles — restore their state on reopen. Keyed by a stable storeKey
  // on the entry that travels with bookmark/history snapshots.
  let seed = {};
  const entry = currentEntry(activeTab());
  if (entry && entry.kind === 'page') {
    if (!entry.storeKey) entry.storeKey = uid();
    seed = pageStores[entry.storeKey] || {};
  }
  const shim = pageStorageShim(JSON.stringify(seed).replace(/</g, '\\u003c'));
  els.frame.setAttribute('srcdoc', injectIntoHead(html, shim) + clearance + CHERVIL_RUNTIME + restore);
}

function renderSite(url) {
  els.frame.hidden = true;
  els.frame.removeAttribute('srcdoc');
  els.overlay.hidden = true;
  els.webview.hidden = false;
  els.webview.setAttribute('src', url);
}

// Lessons/quizzes store the HTML rendered at build time. When the renderer changes
// (e.g. interactive applets gained an inline widget), older items would otherwise
// stay frozen on stale markup. On open, re-render a skill entry from its structured
// artifact (a pure render — no model call, no token cost) and cache the result.
// Bump SKILL_HTML_VERSION whenever lib/lessonHtml.js or lib/quizHtml.js output changes.
const SKILL_HTML_VERSION = 2;
async function maybeRefreshSkillHtml(tab, entry) {
  if (!entry || !entry.skill || entry.skillHtmlVersion === SKILL_HTML_VERSION) return;
  const artifact = entry.artifact || entry.lesson;
  if (!artifact || !window.chervil || !window.chervil.renderSkill) return;
  try {
    const res = await window.chervil.renderSkill({ kind: entry.skill, artifact });
    if (res && res.ok && res.html) {
      entry.html = res.html;
      entry.skillHtmlVersion = SKILL_HTML_VERSION;
      scheduleSave();
      if (activeTab() === tab && currentEntry(tab) === entry) renderPageHtml(entry.html);
    }
  } catch { /* keep the stored HTML */ }
}

// Render whatever the active tab is currently pointing at (committed entry).
function renderCurrentPage() {
  const tab = activeTab();
  const entry = currentEntry(tab);

  if (!entry) {
    showOverlay();
    setOmnibox('');
    setBadge('', 'ready');
    els.save.disabled = true;
    setRemixVisible(false);
  } else if (entry.kind === 'navigate') {
    renderSite(entry.url);
    setOmnibox(entry.url);
    setBadge('live', 'live site');
    els.save.disabled = true;
    setRemixVisible(false);
  } else {
    renderPageHtml(entry.html);
    setOmnibox(entry.title || 'Chervil page');
    setBadge('page', 'composed');
    els.save.disabled = false;
    setRemixVisible(true);
    maybeRefreshSkillHtml(tab, entry); // upgrade stored lessons/quizzes to the current renderer
  }
  updateNavButtons();
  updatePlaceholder();
  updateBookmarkStar();
  updatePwFillButton();
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
  const min = !!settings.remixMinimized;
  els.remixBar.hidden = !show || min;
  if (els.remixHandle) els.remixHandle.hidden = !show || !min;
  if (show) { updateLiveControls(); updateSourcesButton(); }
  else { stopAudio(); els.sourcesPanel.hidden = true; }
}

// Collapse the floating remix bar to a small corner handle (and back). Persisted.
function minimizeRemix() {
  settings.remixMinimized = true;
  els.remixBar.hidden = true;
  if (els.remixHandle) els.remixHandle.hidden = false;
  scheduleSave();
}
function expandRemix() {
  settings.remixMinimized = false;
  if (els.remixHandle) els.remixHandle.hidden = true;
  els.remixBar.hidden = false;
  updateLiveControls();
  updateSourcesButton();
  scheduleSave();
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

// Manually re-ground the current composed page: re-run its own query and replace
// it in place (the same in-place update the "Living pages" auto-refresh does, but
// on demand). Lessons/quizzes are skill-built, not composed via ask — skip them.
function refreshCurrentPage() {
  const tab = activeTab();
  if (!tab) return;
  if (isTabBusy(tab.id) || agentRunning) { toast('Sprig is busy — try again in a moment.'); return; }
  const cur = currentEntry(tab);
  if (!cur || cur.kind !== 'page') { toast('Open a composed page to refresh it.'); return; }
  if (cur.lesson || cur.skill) { toast('Rebuild lessons and quizzes from the composer instead.'); return; }
  if (!cur.query) { toast('This page has no query to refresh from.'); return; }
  els.sourcesPanel.hidden = true;
  submitQuery(cur.query, {
    refineMode: 'force',     // replace this page in place rather than branching a new one
    allowNavigate: false,
    skipUserMessage: true,   // a refresh isn't a new question — don't add a chat bubble
  });
  toast('Sprig is refreshing this page…');
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
      tab, skipFollowup: true, allowNavigate: false, deep: !!sch.deep, background: true, agentId: sch.agentId || null, displayText: sch.prompt,
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
  // Skill-built pages (lessons, quizzes) aren't composed via the ask pipeline, so
  // re-grounding rec.query would clobber them with a generic page. Drop the record.
  if (entry.lesson || entry.skill) { living = living.filter((r) => r.id !== rec.id); return; }
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
  const rec = cur && cur.kind === 'page' && !cur.lesson && !cur.skill ? livingFor(cur.id) : null;
  els.liveSelect.disabled = !!(cur && (cur.lesson || cur.skill)); // Living doesn't apply to skill pages
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
  if (!cur || cur.kind !== 'page' || cur.lesson || cur.skill) return;
  const v = els.liveSelect.value;
  setLiving(tab, cur, v === 'off' ? 0 : parseInt(v, 10));
}

// ---- Toast notifications ----
let toastTimer = null;
// Turn a caught error (Error, string, or stray object) into a clean user-facing
// string — never "[object Object]" or "undefined". Keeps a real message when there is
// one, else falls back to a friendly default.
function errText(e, fallback) {
  var m = e && e.message ? String(e.message) : (typeof e === 'string' ? e : '');
  return m.trim() || (fallback || 'something went wrong');
}

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
    toast('Couldn’t transcribe that — ' + errText(e, 'please try again') + '.');
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

// ---- Listening mode — "Hey Sprig" wake phrase ----
// openWakeWord (via src/wake.js) listens on-device; when the phrase fires we pop the
// Quick-Ask bar, capture the spoken request (auto-stopping on silence), transcribe
// it through the configured voice service, and compose — all hands-free.
let wakeCapturing = false;
let wakeAssets = null; // cached { ortWasm, melspec, embedding } for this session

const WAKE_LABELS = { hey_sprig: 'Hey Sprig', hey_jarvis: 'Hey Jarvis', alexa: 'Alexa', hey_mycroft: 'Hey Mycroft' };
function prettyWake(k) { return WAKE_LABELS[k] || k; }

function setWakeStatus(msg, kind) {
  if (!els.wakeStatus) return;
  els.wakeStatus.textContent = msg || '';
  els.wakeStatus.className = 'field-note' + (kind ? ' ' + kind : '');
}

async function startWake() {
  if (!window.ChervilWake || !window.ChervilWake.available()) {
    setWakeStatus('Wake-word engine failed to load.', 'warn'); return false;
  }
  const usingCustom = settings.wakeKeyword === 'custom';
  try {
    if (!wakeAssets) {
      const a = await window.chervil.wakeAssets();
      if (!a || !a.ok) throw new Error((a && a.error) || 'engine assets unavailable');
      wakeAssets = a;
    }
    const km = await window.chervil.wakeKeywordModel(usingCustom ? 'custom' : settings.wakeKeyword);
    if (!km || !km.ok) {
      throw new Error(usingCustom ? 'Load a wake-word model (.onnx) first, or pick a built-in.' : (km && km.error) || 'keyword model missing');
    }
    await window.ChervilWake.start({
      ortWasm: wakeAssets.ortWasm,
      melspec: wakeAssets.melspec,
      embedding: wakeAssets.embedding,
      keywordModel: km.model,
      threshold: settings.wakeThreshold || 0.5,
      onDetect: onWakeDetected,
      onError: (e) => setWakeStatus('Wake-word listening stopped — ' + errText(e, 'mic unavailable'), 'warn'),
    });
    const label = usingCustom ? (settings.wakeKeywordLabel || 'your model') : prettyWake(settings.wakeKeyword);
    setWakeStatus(`Listening for “${label}”…`, 'ok');
    return true;
  } catch (e) {
    setWakeStatus('Could not start listening: ' + (e && e.message ? e.message : e), 'warn');
    return false;
  }
}

async function stopWake() {
  try { if (window.ChervilWake) await window.ChervilWake.stop(); } catch { /* ignore */ }
  setWakeStatus('');
}

// Re-arm after a settings change while listening is on.
async function restartWake() {
  if (!settings.wakeEnabled) return;
  await stopWake();
  await startWake();
}

async function onWakeDetected() {
  if (wakeCapturing) return;
  wakeCapturing = true;
  try {
    window.chervil.wakeListening && window.chervil.wakeListening(); // pop Quick-Ask "listening" bar
    if (window.ChervilWake) await window.ChervilWake.pause();       // free the mic for capture
    const text = await captureUtterance();
    window.chervil.wakeDone && window.chervil.wakeDone();           // hide the listening bar
    if (text) {
      window.chervil.showMain && window.chervil.showMain();         // surface the result (only on a real request)
      newTab(true);
      handleComposerSubmit(text);
    }
  } catch { /* ignore a failed capture */ }
  finally {
    wakeCapturing = false;
    try { if (settings.wakeEnabled && window.ChervilWake) await window.ChervilWake.resume(); } catch { /* ignore */ }
  }
}

// Record the spoken command and auto-stop on silence (energy-based VAD), then
// transcribe via the configured voice-input endpoint. Returns the text or null.
async function captureUtterance({ maxMs = 9000, silenceMs = 1200, minMs = 500 } = {}) {
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { return null; }
  let mime = '';
  for (const m of ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) { mime = m; break; }
  }
  let rec;
  try { rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined); }
  catch { for (const t of stream.getTracks()) t.stop(); return null; }

  const chunks = [];
  rec.addEventListener('dataavailable', (e) => { if (e.data && e.data.size) chunks.push(e.data); });

  // Silence detector.
  const AC = window.AudioContext || window.webkitAudioContext;
  const ac = AC ? new AC() : null;
  const analyser = ac ? ac.createAnalyser() : null;
  if (ac && analyser) { analyser.fftSize = 512; ac.createMediaStreamSource(stream).connect(analyser); }
  const data = analyser ? new Uint8Array(analyser.fftSize) : null;
  const startedAt = Date.now();
  let lastVoiceAt = startedAt;
  let sawVoice = false;
  let monitor = null;

  return await new Promise((resolve) => {
    rec.addEventListener('stop', async () => {
      if (monitor) clearInterval(monitor);
      try { if (ac) await ac.close(); } catch { /* ignore */ }
      for (const t of stream.getTracks()) t.stop();
      const type = rec.mimeType || mime || 'audio/webm';
      const blob = new Blob(chunks, { type });
      if (!blob.size) return resolve(null);
      try {
        const b64 = arrayBufferToBase64(await blob.arrayBuffer());
        const ext = /mp4/.test(type) ? 'mp4' : /ogg/.test(type) ? 'ogg' : 'webm';
        const resp = await window.chervil.transcribe({
          audio: b64, mimeType: type, filename: 'wake.' + ext,
          endpoint: settings.sttEndpoint, model: settings.sttModel,
        });
        resolve(resp && resp.ok && resp.text ? resp.text.trim() : null);
      } catch { resolve(null); }
    });

    rec.start();
    monitor = setInterval(() => {
      if (rec.state !== 'recording') return;
      let rms = 1;
      if (analyser && data) {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
        rms = Math.sqrt(sum / data.length);
      }
      const now = Date.now();
      if (rms > 0.045) { lastVoiceAt = now; sawVoice = true; }
      const elapsed = now - startedAt;
      const silentFor = now - lastVoiceAt;
      // Stop on max duration, or after enough silence once we've actually heard speech.
      // If there's no analyser, just record up to maxMs.
      const silenceStop = analyser && sawVoice && elapsed >= minMs && silentFor >= silenceMs;
      if (elapsed >= maxMs || silenceStop) { try { rec.stop(); } catch { /* ignore */ } }
    }, 80);
  });
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

// Fill a live site's form fields from the user's saved autofill identity. Matches
// fields by autocomplete/name/id/placeholder; NEVER touches password/hidden fields.
function autofillScript(idJson) {
  return `(function(){
    var id = ${idJson};
    function pick(el){
      var hay = ((el.getAttribute('autocomplete')||'')+' '+(el.name||'')+' '+(el.id||'')+' '+(el.placeholder||'')+' '+(el.getAttribute('aria-label')||'')).toLowerCase();
      var t = (el.type||'').toLowerCase();
      if (t==='password' || t==='hidden') return null;
      if (t==='email' || /e-?mail/.test(hay)) return id.email;
      if (t==='tel' || /phone|mobile|\\btel\\b/.test(hay)) return id.phone;
      if (/given|first.?name|fname/.test(hay)) return id.givenName;
      if (/family|last.?name|lname|surname/.test(hay)) return id.familyName;
      if (/full.?name|your.?name|^name$|\\bname\\b/.test(hay)) return id.fullName;
      if (/street|address.?line.?1|address1|^address$|addr/.test(hay)) return id.address;
      if (/city|town|locality|address.?level.?2/.test(hay)) return id.city;
      if (/zip|postal|postcode/.test(hay)) return id.postal;
      if (/country/.test(hay)) return id.country;
      if (/organi|company|employer/.test(hay)) return id.organization;
      return null;
    }
    var n = 0;
    document.querySelectorAll('input, textarea, select').forEach(function(el){
      if (el.disabled || el.readOnly) return;
      if (el.offsetParent === null) return; // not visible
      var v = pick(el);
      if (v == null || v === '') return;
      try { el.focus(); el.value = v; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); n++; } catch(e){}
    });
    return n;
  })()`;
}

async function autofillCurrentForm() {
  const tab = activeTab();
  const cur = currentEntry(tab);
  if (!cur || cur.kind !== 'navigate' || els.webview.hidden) { toast('Open a website with a form first.'); return; }
  const id = settings.autofill || {};
  if (!Object.values(id).some((v) => v)) { toast('Add your autofill details in Settings → You first.'); return; }
  try {
    const n = await els.webview.executeJavaScript(autofillScript(JSON.stringify(id)), true);
    auditAction({ type: 'autofill', target: cur.url || '', decision: 'allow', ok: !!n });
    addMessage(tab, 'bot', n ? `Filled ${n} field${n === 1 ? '' : 's'} from your saved details. (Passwords are never auto-filled.)` : 'No matching fields found to fill here.');
  } catch (e) {
    addMessage(tab, 'bot', `Couldn’t autofill this page — ${errText(e, 'no fillable form found')}.`, 'error');
  }
}

// ---- Password autofill (RFC 0008, Phase 8.2): user-initiated, origin-scoped ----
// Injected into the live <webview> to fill ONE login from a saved credential.
// Top document only; finds the password field + a nearby username field; NEVER
// submits. Returns { found, filled }.
function passwordFillScript(credJson) {
  return `(function(){
    var c = ${credJson};
    function vis(el){ return el && el.offsetParent !== null && !el.disabled && !el.readOnly; }
    var all = Array.prototype.slice.call(document.querySelectorAll('input'));
    var pws = all.filter(function(el){ return (el.type||'').toLowerCase()==='password' && vis(el); });
    if(!pws.length) return { found:false, filled:0 };
    var pw = pws[0];
    var pwIdx = all.indexOf(pw);
    var user = null;
    for(var i=pwIdx-1;i>=0;i--){ var el=all[i]; var t=(el.type||'').toLowerCase(); if(!vis(el)) continue; if(t==='text'||t==='email'||t===''){ user=el; break; } }
    if(!user){
      user = all.find(function(el){ var t=(el.type||'').toLowerCase(); var hay=((el.name||'')+(el.id||'')+(el.getAttribute('autocomplete')||'')).toLowerCase(); return vis(el)&&(t==='email'||t==='text')&&/user|email|login|account/.test(hay); }) || null;
    }
    var n=0;
    function set(el,val){ try{ el.focus(); el.value=val; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); n++; }catch(e){} }
    if(user && c.username) set(user, c.username);
    if(c.password) set(pw, c.password);
    return { found:true, filled:n };
  })()`;
}

// ---- Vault auto-lock (RFC 0008, Phase 8.4) ----
// Re-auth = the master passphrase is required again after the vault locks. The
// vault locks on app hide/minimize (unless "never") and after an idle timeout.
let lastActivityAt = Date.now();
async function lockVault(reason) {
  if (!window.chervil.creds) return;
  try {
    const st = await window.chervil.creds.status();
    if (!st || !st.ok || !st.unlocked) return; // already locked / not set up
    await window.chervil.creds.lock();
    updatePwFillButton();
    if (els.settingsModal && els.settingsModal.classList.contains('open')) renderCredsPanel();
    if (reason === 'idle') toast('Passwords locked (idle).');
  } catch { /* ignore */ }
}
// Single low-frequency idle checker; activity just stamps a timestamp.
['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'].forEach((ev) =>
  window.addEventListener(ev, () => { lastActivityAt = Date.now(); }, { passive: true }));
setInterval(() => {
  const mins = parseInt(settings.credsAutoLock, 10);
  if (Number.isFinite(mins) && mins > 0 && (Date.now() - lastActivityAt) >= mins * 60000) lockVault('idle');
}, 30000);
// Lock when Chervil is hidden/minimized (it lives in the tray), unless "never".
// On becoming visible again, also check for a newer synced session (RFC 0005).
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (settings.credsAutoLock !== 'never') lockVault('hide'); }
  else reconcileNow().then(checkSyncConflict);
});
window.addEventListener('focus', () => { reconcileNow().then(checkSyncConflict); });

// A labeled auto-lock <select>, built for the (configured) credential panel.
function credsAutoLockRow() {
  const sel = credsEl('select', { class: 'live-select' });
  const opts = [['hide', 'When Chervil is hidden'], ['5', 'After 5 minutes idle'], ['15', 'After 15 minutes idle'], ['30', 'After 30 minutes idle'], ['never', 'Only when I quit']];
  for (const [v, label] of opts) {
    const o = document.createElement('option');
    o.value = v; o.textContent = label;
    if (String(settings.credsAutoLock) === v) o.selected = true;
    sel.appendChild(o);
  }
  sel.addEventListener('change', () => { settings.credsAutoLock = sel.value; lastActivityAt = Date.now(); scheduleSave(); });
  return credsEl('div', { class: 'creds-toolbar' }, [credsEl('span', { class: 'field-note', text: 'Auto-lock' }), sel]);
}

// Make sure the vault is unlocked (the master-passphrase gate), prompting inline
// if needed. Returns true if unlocked and ready.
async function ensureVaultUnlocked() {
  if (!window.chervil.creds) { toast('Password storage isn’t available in this build.'); return false; }
  let st;
  try { st = await window.chervil.creds.status(); } catch { st = null; }
  if (!st || !st.ok || !st.encryptionAvailable) { toast('Password storage isn’t available on this system.'); return false; }
  if (!st.configured) { toast('Set up a master passphrase first in Settings → Security.'); return false; }
  if (st.unlocked) return true;
  const pass = await showInputSheet({
    title: 'Unlock your passwords',
    subtitle: 'Enter your master passphrase to fill this login.',
    placeholder: 'Master passphrase', type: 'password', okLabel: 'Unlock',
  });
  if (pass == null) return false;
  const r = await window.chervil.creds.unlock(pass);
  if (!r || !r.ok) { toast((r && r.error) || 'Wrong passphrase.'); return false; }
  return true;
}

async function doFillCredential(cred, cur) {
  const tab = activeTab();
  try {
    const r = await els.webview.executeJavaScript(passwordFillScript(JSON.stringify({ username: cred.username, password: cred.password })), true);
    // Audit records WHAT happened, never the credential itself.
    auditAction({ type: 'password_fill', target: cur.url || '', decision: 'allow', ok: !!(r && r.filled) });
    if (r && r.found) {
      addMessage(tab, 'bot', r.filled ? `Filled your saved login for ${hostOf(cur.url) || 'this site'}. Review it and submit yourself — Chervil never auto-submits.` : 'Found a login form but couldn’t fill it.');
    } else {
      toast('No login form found on this page.');
    }
  } catch (e) {
    toast(`Couldn’t fill the login — ${errText(e, 'no login form found')}.`);
  }
}

async function fillPasswordOnSite() {
  const tab = activeTab();
  const cur = currentEntry(tab);
  if (!cur || cur.kind !== 'navigate' || els.webview.hidden) { toast('Open a website with a login form first.'); return; }
  if (!(await ensureVaultUnlocked())) return;
  const url = (els.webview.getURL && els.webview.getURL()) || cur.url || '';
  let res;
  try { res = await window.chervil.creds.forOrigin(url); } catch { res = null; }
  const items = (res && res.ok && res.items) || [];
  const site = (res && res.origin) || hostOf(url) || 'this site';
  if (!items.length) {
    // Nothing saved for this site — offer to save the login currently on the page.
    showActionSheet('No saved login', `Save a login for ${site}?`, [
      { label: 'Save the login on this page', primary: true, onClick: () => saveCurrentPageLogin(cur) },
    ]);
    updatePwFillButton();
    return;
  }
  if (items.length === 1) { doFillCredential(items[0], cur); return; }
  showActionSheet('Choose a login', `Fill credentials for ${site}`,
    items.map((it) => ({ label: it.username || '(no username)', onClick: () => doFillCredential(it, cur) })));
}

// Read the username/password currently typed into the live page's login form.
function readLoginFieldsScript() {
  return `(function(){
    function vis(el){ return el && el.offsetParent !== null; }
    var all = Array.prototype.slice.call(document.querySelectorAll('input'));
    var pw = all.find(function(el){ return (el.type||'').toLowerCase()==='password' && vis(el); });
    var username='';
    if(pw){ var idx=all.indexOf(pw); for(var i=idx-1;i>=0;i--){ var el=all[i]; var t=(el.type||'').toLowerCase(); if(!vis(el))continue; if(t==='email'||t==='text'||t===''){ username=el.value||''; break; } } }
    return { username: username, password: pw ? (pw.value||'') : '' };
  })()`;
}

// Manual save: capture whatever login is on the current page (or ask for the
// missing pieces), then store it in the vault.
async function saveCurrentPageLogin(cur) {
  let fields = null;
  try { fields = await els.webview.executeJavaScript(readLoginFieldsScript(), true); } catch { /* ignore */ }
  let username = (fields && fields.username) || '';
  let password = (fields && fields.password) || '';
  const site = hostOf(cur.url) || 'this site';
  if (!password) {
    password = await showInputSheet({ title: 'Save login', subtitle: `Password for ${site}`, placeholder: 'Password', type: 'password', okLabel: 'Next' });
    if (password == null || password === '') return;
  }
  if (!username) {
    username = (await showInputSheet({ title: 'Save login', subtitle: `Username or email for ${site} (optional)`, placeholder: 'Username / email', type: 'text', okLabel: 'Save' })) || '';
  }
  if (!(await ensureVaultUnlocked())) return;
  const url = (els.webview.getURL && els.webview.getURL()) || cur.url || '';
  const r = await window.chervil.creds.save({ origin: url, username, password });
  toast(r && r.ok ? 'Login saved.' : ((r && r.error) || 'Couldn’t save.'));
  updatePwFillButton();
}

// Save-on-submit: the webview preload reports a submitted login. Offer to save it
// to the vault (only for users who've set up the vault), skipping unchanged ones.
let lastCapture = { sig: '', at: 0 };
async function onCapturedLogin(data) {
  if (!data || !data.password || !window.chervil.creds) return;
  // Debounce the submit/click/Enter burst for the same login.
  const sig = `${data.href}|${data.username}|${data.password}`;
  const now = Date.now();
  if (sig === lastCapture.sig && now - lastCapture.at < 8000) return;
  lastCapture = { sig, at: now };

  let st;
  try { st = await window.chervil.creds.status(); } catch { return; }
  if (!st || !st.ok || !st.configured) return; // only prompt users who opted into the vault
  // Skip if this exact login is already saved (only checkable while unlocked).
  if (st.unlocked) {
    try { const h = await window.chervil.creds.hasExact(data.href, data.username, data.password); if (h && h.ok && h.exists) return; } catch { /* ignore */ }
  }
  const site = hostOf(data.href) || 'this site';
  const label = data.username ? `Save (${data.username})` : 'Save login';
  showActionSheet('Save this login?', `Save your login for ${site} to the encrypted vault? Chervil never shares it.`, [
    { label, primary: true, onClick: async () => {
      if (!(await ensureVaultUnlocked())) return;
      const r = await window.chervil.creds.save({ origin: data.href, username: data.username, password: data.password });
      toast(r && r.ok ? 'Login saved.' : ((r && r.error) || 'Couldn’t save.'));
      updatePwFillButton();
    } },
  ]);
}

// Show/enable the 🔑 fill button based on context: only on a live site, enabled
// when there's a saved login to fill (or the vault needs unlocking first).
async function updatePwFillButton() {
  const btn = els.pwFillBtn;
  if (!btn) return;
  const cur = currentEntry(activeTab());
  const onLive = !!(cur && cur.kind === 'navigate' && els.webview && !els.webview.hidden);
  btn.hidden = !onLive || !window.chervil.creds;
  if (btn.hidden) return;
  try {
    const url = (els.webview.getURL && els.webview.getURL()) || cur.url || '';
    const r = await window.chervil.creds.countForOrigin(url);
    if (!r || !r.ok || !r.configured) { btn.disabled = true; btn.classList.add('dim'); btn.title = 'No saved logins yet (set up in Settings → Security)'; return; }
    if (!r.unlocked) { btn.disabled = false; btn.classList.remove('dim'); btn.title = 'Fill a saved login (unlock required)'; return; }
    if (r.count > 0) { btn.disabled = false; btn.classList.remove('dim'); btn.title = `Fill saved login (${r.count})`; }
    else { btn.disabled = true; btn.classList.add('dim'); btn.title = 'No saved login for this site'; }
  } catch { btn.disabled = true; btn.classList.add('dim'); }
}

// Hard stop on payment/purchase/transfer language — Sprig never does these.
function looksFinancial(a) {
  const s = ((a.reason || '') + ' ' + (a.value || '')).toLowerCase();
  return /\b(buy now|place order|complete (purchase|order|checkout)|checkout|pay\b|payment|card number|cvv|credit card|transfer|send money|wire transfer|donate)\b/.test(s);
}

// ---- Agentic control layer (RFC 0006, phase 6.1) ----
// The deterministic boundary the model sits inside: a fixed registry of action
// types the agent may invoke, each with a base policy. The model proposes; this
// decides allow / confirm / deny. Authority lives here, never in the model.
const WEB_ACTION_POLICY = {
  navigate: 'allow',
  scroll: 'allow',
  click: 'allow',
  type: 'allow',   // password fields are refused at execution (typeJS)
  submit: 'allow',
};

// Decide what happens to a proposed web action: { decision, reason }.
function decideAction(a) {
  if (!a || !WEB_ACTION_POLICY[a.action]) {
    return { decision: 'deny', reason: `Unknown action “${(a && a.action) || ''}” — refused.` };
  }
  if (looksFinancial(a)) {
    return { decision: 'deny', reason: 'That looks like a payment/purchase step — I won’t do that. Please complete it yourself.' };
  }
  if (a.risky) return { decision: 'confirm', reason: a.reason || a.action };
  return { decision: 'allow', reason: a.reason || a.action };
}

// Guarded OS write-actions (RFC 0006 Track B). A small allowlist; each requires
// explicit user confirmation. No arbitrary command/app execution is reachable.
const OS_ACTION_POLICY = {
  open_url: 'confirm',        // open a URL in the real browser
  open_downloads: 'confirm',  // open the Downloads folder
};
function osActionLabel(type, args) {
  if (type === 'open_url') return `Open ${args && args.url ? args.url : 'a link'} in your browser?`;
  if (type === 'open_downloads') return 'Open your Downloads folder?';
  return `Run “${type}”?`;
}
function decideOsAction(type) {
  return OS_ACTION_POLICY[type] ? { decision: OS_ACTION_POLICY[type] } : { decision: 'deny', reason: `Unknown OS action “${type}”.` };
}

// Append to the (persisted, capped) agent audit trail — so "unauthorized" is
// detectable, not just hopefully-prevented.
function auditAction(entry) {
  agentAudit.unshift({ at: Date.now(), ...entry });
  if (agentAudit.length > MAX_AGENT_AUDIT) agentAudit.length = MAX_AGENT_AUDIT;
  scheduleSave();
}

function actionLabel(a) {
  if (a.action === 'type') return `Typing “${a.value || ''}”${a.reason ? ' — ' + a.reason : ''}`;
  if (a.action === 'navigate') return `Going to ${a.value || ''}`;
  if (a.action === 'scroll') return `Scrolling ${a.value || 'down'}`;
  return a.reason || a.action;
}

// Inline approval prompt for state-changing actions. Resolves 'once' | 'task' | 'stop'
// — "task" allows this action type for the rest of the current task (scoped allow).
function confirmAgentAction(a) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'msg bot refine-choice';
    const p = document.createElement('div');
    p.textContent = `Sprig wants to ${actionLabel(a).toLowerCase()}. This changes the site — proceed?`;
    wrap.appendChild(p);
    const row = document.createElement('div');
    row.className = 'choice-row';
    const yes = document.createElement('button');
    yes.textContent = 'Approve';
    const all = document.createElement('button');
    all.textContent = `Allow “${a.action}” this task`;
    const no = document.createElement('button');
    no.textContent = 'Stop';
    row.appendChild(yes);
    row.appendChild(all);
    row.appendChild(no);
    wrap.appendChild(row);
    els.conversation.appendChild(wrap);
    els.conversation.scrollTop = els.conversation.scrollHeight;
    const done = (v) => { wrap.remove(); resolve(v); };
    yes.addEventListener('click', () => done('once'));
    all.addEventListener('click', () => done('task'));
    no.addEventListener('click', () => done('stop'));
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
  const taskAllowed = new Set(); // action types the user approved for this whole task
  let plan = [];
  try {
    // Draft a short plan up front and show it (RFC 0006 6.2) — best-effort.
    try {
      setStatus('Sprig is planning…');
      const state0 = await readWebview();
      if (state0 && agentRunning) {
        const planResp = await window.chervil.agentPlan({ task, pageState: state0, config: providerConfig() });
        if (planResp && planResp.ok && Array.isArray(planResp.plan) && planResp.plan.length) {
          plan = planResp.plan;
          addMessage(tab, 'bot', '📋 Plan:\n' + plan.map((p, i) => `${i + 1}. ${p}`).join('\n'));
        }
      }
      clearStatus();
    } catch { clearStatus(); }

    for (let step = 0; step < 8 && agentRunning; step++) {
      setStatus('Sprig is reading the page…');
      const state = await readWebview();
      if (!state) { clearStatus(); addMessage(tab, 'bot', 'I couldn’t read this page (it may block automation).', 'error'); break; }

      setStatus('Sprig is deciding the next step…');
      const resp = await window.chervil.agentStep({ task, pageState: state, steps, plan, config: providerConfig() });
      clearStatus();
      if (!resp.ok) { addMessage(tab, 'bot', resp.error || 'Agent error.', 'error'); break; }

      const a = resp.action;
      steps.push(a);
      if (a.action === 'finish') { addMessage(tab, 'bot', '✅ ' + (a.reason || 'Done.')); break; }
      if (a.action === 'need_user') { addMessage(tab, 'bot', '🙋 ' + (a.reason || 'I’ll let you take it from here.')); break; }

      // Every action passes through the deterministic control layer (RFC 0006).
      const verdict = decideAction(a);
      const target = a.value || a.reason || '';
      if (verdict.decision === 'deny') {
        auditAction({ type: a.action, target, decision: 'deny' });
        addMessage(tab, 'bot', verdict.reason, 'error');
        break;
      }
      let decisionLabel = verdict.decision === 'confirm' ? 'approved' : 'allow';
      if (verdict.decision === 'confirm') {
        if (taskAllowed.has(a.action)) {
          decisionLabel = 'allow-scoped'; // pre-approved for this task
        } else {
          const choice = await confirmAgentAction(a);
          if (choice === 'stop') { auditAction({ type: a.action, target, decision: 'denied-by-user' }); addMessage(tab, 'bot', 'Okay, stopping here.'); break; }
          if (choice === 'task') { taskAllowed.add(a.action); addMessage(tab, 'bot', `Got it — I’ll ${a.action} without asking again this task.`); }
        }
      }
      addMessage(tab, 'bot', '→ ' + actionLabel(a));
      const res = await executeAction(a);
      auditAction({ type: a.action, target, decision: decisionLabel, ok: !!(res && res.ok) });
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
  else if (settings.chatMode) els.prompt.placeholder = 'Chat with Sprig…';
  else els.prompt.placeholder = skillMode === 'learn' ? 'What do you want to learn?' : skillMode === 'quiz' ? 'Quiz me on…' : deepMode ? 'Hey Sprig, research…' : 'Hey Sprig, ask…';
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
    setOmnibox('Composing…');
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
  const webBack = webviewCan('back');
  const webFwd = webviewCan('forward');
  els.back.disabled = !(back || webBack);
  els.fwd.disabled = !(fwd || webFwd);

  // Tree entries get a descriptive tooltip; in-site steps just say Back/Forward.
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

// The send button doubles as a Stop button while the active tab is composing.
function setSendBusy(busy) {
  els.send.classList.toggle('stop', busy);
  els.send.textContent = busy ? '◼' : '↑';
  els.send.title = busy ? 'Stop composing' : 'Send';
  els.send.disabled = false; // enabled either way (Send or Stop)
}

function refreshComposer() {
  const tab = activeTab();
  setSendBusy(!!(tab && isTabBusy(tab.id)));
}

// Stop the active tab's in-flight composition: abort the request, ignore its
// result, and hand the tab back to the user. Partial streamed HTML is discarded.
function stopActiveCompose() {
  const tab = activeTab();
  if (!tab) return;
  const rs = runState.get(tab.id);
  if (!rs || !rs.genId) return;
  const requestId = rs.genId;
  cancelledRequests.add(requestId);
  if (window.chervil.abort) window.chervil.abort(requestId); // best-effort network cancel
  rs.genId = null;
  rs.statusText = '';
  rs.streamBuffer = '';
  reqToTab.delete(requestId);
  if (previewTimer) { clearTimeout(previewTimer); previewTimer = null; }
  addMessage(tab, 'bot', 'Stopped.');
  renderTabs();
  if (tab.id === activeId) {
    clearStatus();
    const cur = currentEntry(tab);
    setBadge(cur && cur.kind === 'page' ? 'page' : '', cur ? 'composed' : 'ready');
    renderCurrentPage();
    refreshComposer();
  }
  scheduleSave();
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

// On a live site, is the embedded webview the thing to step through?
function webviewActive() {
  const e = currentEntry(activeTab());
  return !!(e && e.kind === 'navigate' && els.webview && !els.webview.hidden);
}
function webviewCan(dir) {
  try {
    return webviewActive() && (dir === 'back' ? els.webview.canGoBack() : els.webview.canGoForward());
  } catch { return false; }
}

function goBack() {
  // Inside an embedded site, walk that site's own history first.
  if (webviewCan('back')) { try { els.webview.goBack(); return; } catch { /* fall through */ } }
  const tab = activeTab();
  const p = parentOf(tab, currentEntry(tab));
  if (!p) return;
  tab.currentId = p.id;
  renderCurrentPage();
  scheduleSave();
}

function goForward() {
  if (webviewCan('forward')) { try { els.webview.goForward(); return; } catch { /* fall through */ } }
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
function openSched() { populateSchedAgentSelect(); renderSchedules(); els.schedView.classList.add('open'); }
function populateSchedAgentSelect() {
  const sel = document.getElementById('sched-agent');
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = '<option value="">None (default Sprig)</option>';
  for (const a of agents) {
    const o = document.createElement('option');
    o.value = a.id;
    o.textContent = a.name;
    sel.appendChild(o);
  }
  if (cur && agents.find((a) => a.id === cur)) sel.value = cur;
}
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
    const agName = sch.agentId ? ((agents.find((a) => a.id === sch.agentId) || {}).name || '') : '';
    when.textContent = ruleSummary(sch)
      + (agName ? ` · as ${agName}` : '')
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
  const agentId = document.getElementById('sched-agent').value || null;
  const rule = type === 'interval'
    ? { type, intervalMs }
    : type === 'weekly'
      ? { type, time, days: days.length ? days : [1, 2, 3, 4, 5] }
      : { type: 'daily', time };
  schedules.push({
    id: uid(),
    title: prompt.length > 40 ? prompt.slice(0, 37) + '…' : prompt,
    prompt, rule, deep, agentId, enabled: true, lastRun: 0, tabId: null, entryId: null, running: false,
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

function openAgents() { renderAgents(); renderStoreSection(); renderPipelinesSection(); renderStarterAgents(); renderAuditLog(); els.agentsView.classList.add('open'); }

// Render the agent action audit trail (RFC 0006) — what Sprig did, and what the
// control layer allowed, confirmed, or denied.
function renderAuditLog() {
  const list = els.auditList;
  if (!list) return;
  if (els.auditClear) els.auditClear.hidden = !agentAudit.length;
  list.innerHTML = '';
  if (!agentAudit.length) {
    const e = document.createElement('div');
    e.className = 'audit-empty';
    e.textContent = 'No agent actions yet. When Sprig acts on a live site, every step is logged here.';
    list.appendChild(e);
    return;
  }
  for (const a of agentAudit.slice(0, 100)) {
    const row = document.createElement('div');
    row.className = 'audit-row';
    const dec = document.createElement('span');
    dec.className = 'ar-dec ' + (a.decision || 'allow');
    dec.textContent = a.decision || 'allow';
    const type = document.createElement('span');
    type.className = 'ar-type';
    type.textContent = a.type || 'action';
    const target = document.createElement('span');
    target.className = 'ar-target' + (a.ok === false ? ' ar-fail' : '');
    target.textContent = (a.ok === false ? '✗ ' : '') + (a.target || '');
    target.title = a.target || '';
    const time = document.createElement('span');
    time.className = 'ar-time';
    time.textContent = relTime(a.at);
    row.appendChild(dec);
    row.appendChild(type);
    row.appendChild(target);
    row.appendChild(time);
    list.appendChild(row);
  }
}
function clearAuditLog() {
  if (!agentAudit.length) return;
  if (!confirm('Clear the agent activity log?')) return;
  agentAudit = [];
  renderAuditLog();
  scheduleSave();
}
function closeAgents() { els.agentsView.classList.remove('open'); }
function setActiveAgent(id) { activeAgentId = id; scheduleSave(); renderAgents(); updateAgentChip(); }

// Show the active agent as a dismissible chip above the composer.
function updateAgentChip() {
  const el = els.agentChip;
  if (!el) return;
  const a = activeAgent();
  if (!a) { el.hidden = true; el.innerHTML = ''; return; }
  el.hidden = false;
  el.innerHTML = '';
  const label = document.createElement('span');
  label.textContent = `👤 ${a.name}`;
  label.title = 'Active agent — click to manage';
  label.style.cursor = 'pointer';
  label.addEventListener('click', openAgents);
  const x = document.createElement('button');
  x.className = 'agent-chip-x';
  x.textContent = '✕';
  x.title = 'Deactivate agent';
  x.addEventListener('click', (e) => { e.stopPropagation(); setActiveAgent(null); });
  el.appendChild(label);
  el.appendChild(x);
}

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

// Render an agent back to the importable Markdown + frontmatter format so it can
// be shared. Inverse of parseAgentFile.
function serializeAgentFile(a) {
  // Values live on a single frontmatter line; flatten newlines and avoid the
  // quote char the minimal YAML reader strips.
  const esc = (s) => String(s == null ? '' : s).replace(/"/g, "'").replace(/\r?\n/g, ' ').trim();
  const lines = ['---'];
  lines.push(`name: ${esc(a.name) || 'Agent'}`);
  if (a.description) lines.push(`description: ${esc(a.description)}`);
  if (a.model) lines.push(`model: ${esc(a.model)}`);
  if (a.provider) lines.push(`provider: ${esc(a.provider)}`);
  if (a.mcp && a.mcp.length) lines.push(`mcp: [${a.mcp.map(esc).join(', ')}]`);
  if (a.starters && a.starters.length) {
    lines.push('starters:');
    a.starters.forEach((s) => lines.push(`  - ${esc(s)}`));
  }
  lines.push('---', '', String(a.persona || '').trim(), '');
  return lines.join('\n');
}

async function exportAgent(a) {
  if (!window.chervil.saveAgentFile) { toast('Export isn’t available in this build.'); return; }
  const text = serializeAgentFile(a);
  const safe = (a.name || 'agent').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'agent';
  const res = await window.chervil.saveAgentFile({ text, suggestedName: safe });
  if (res && res.ok) toast(`Exported “${a.name}”.`);
  else if (res && res.error) toast(`Export failed: ${res.error}`);
}

// Publish an agent to getchervil.com (RFC 0012) — your profile + importable by
// others, and (if public) submittable to the Agent store from getchervil.com/me.
function publishAgentToWeb(a) {
  if (!settings.publishToken) { toast('Add a publish token in Settings → Publishing (from getchervil.com/me).'); return; }
  if (!window.chervil.publishAgent) { toast('Publishing isn’t available in this build.'); return; }
  showActionSheet('Publish agent', `Publish “${a.name}” so other Chervil users can import it?`, [
    { label: '🌐 Public — on your profile, importable', primary: true, onClick: () => doPublishAgent(a, 'public') },
    { label: '🔗 Unlisted — only people with the link', onClick: () => doPublishAgent(a, 'unlisted') },
  ]);
}

async function doPublishAgent(a, visibility) {
  toast('Publishing agent…');
  const res = await window.chervil.publishAgent({
    agent: {
      id: a.id, name: a.name, description: a.description || '', persona: a.persona || '',
      model: a.model || '', provider: a.provider || '', mcp: a.mcp || [], starters: a.starters || [],
    },
    visibility,
    sourceId: a.id, // stable id → re-publish updates in place
    token: settings.publishToken,
    baseUrl: settings.publishBase || 'https://getchervil.com',
  });
  if (res && res.ok && res.url) {
    a.publishedUrl = res.url;
    scheduleSave();
    renderAgents();
    try { await navigator.clipboard.writeText(res.url); toast(res.updated ? 'Agent updated — link copied.' : 'Agent published — link copied.'); }
    catch { toast(res.updated ? 'Agent updated.' : 'Agent published.'); }
  } else {
    const e = (res && res.error) || '';
    toast(/pro|cap|free plan/i.test(e) ? 'Past the free limit — publishing more agents is a Chervil Pro feature.' : (e || 'Couldn’t publish agent.'));
  }
}

// Import an agent that arrived via a chervil://import-agent deep link from the web.
function importAgentDoc(doc) {
  const a = doc && doc.agent;
  if (!a || !a.persona) { toast('That isn’t an importable Chervil agent.'); return; }
  const agent = {
    id: uid(),
    name: String(a.name || 'Imported agent').slice(0, 80),
    description: String(a.description || '').slice(0, 300),
    persona: String(a.persona),
    model: a.model ? String(a.model) : '',
    provider: a.provider ? String(a.provider) : '',
    mcp: Array.isArray(a.mcp) ? a.mcp.map((s) => String(s)) : [],
    starters: Array.isArray(a.starters) ? a.starters.map((s) => String(s)) : [],
  };
  agents.push(agent);
  scheduleSave();
  openAgents();
  toast(`Imported agent “${agent.name}”.`);
}

// Flatten a tab's conversation into a transcript the model can distill into an agent.
function sessionTranscript(tab) {
  const lines = [];
  for (const h of (tab && tab.history) || []) {
    const c = String(h.content || '').trim();
    if (c) lines.push(`${h.role === 'user' ? 'User' : 'Sprig'}: ${c}`);
  }
  return lines.join('\n');
}

// Turn the active prompt session into a reusable Agent. Uses the model to distill
// a persona; falls back to a session-seeded persona when synthesis is unavailable
// (e.g. a compose-only provider or an offline error).
async function createAgentFromSession() {
  const tab = activeTab();
  const userPrompts = [...new Set(
    (((tab && tab.history) || []).filter((h) => h.role === 'user').map((h) => String(h.content || '').trim()).filter(Boolean)),
  )];
  if (!userPrompts.length) { toast('Ask Sprig something first, then turn the session into an agent.'); return; }

  const transcript = sessionTranscript(tab);
  toast('Distilling this session into an agent…');

  let synth = null;
  try {
    if (window.chervil.synthesizeAgent) {
      const res = await window.chervil.synthesizeAgent({ session: transcript, config: providerConfig() });
      if (res && res.ok && res.agent && res.agent.persona) synth = res.agent;
      else if (res && res.error) toast(`Couldn’t auto-distill (${res.error}); built one from your prompts.`);
    }
  } catch { /* fall through to the mechanical fallback */ }

  const fallbackName = (tab && tab.title && tab.title !== 'New Tab') ? tab.title : 'Session agent';
  const a = synth ? {
    id: uid(),
    name: (synth.name || '').slice(0, 80) || fallbackName,
    description: (synth.description || '').slice(0, 300),
    persona: String(synth.persona || '').trim(),
    model: '', provider: '', mcp: [],
    starters: (synth.starters && synth.starters.length ? synth.starters : userPrompts).slice(0, 5),
  } : {
    id: uid(),
    name: fallbackName,
    description: userPrompts[0].slice(0, 140),
    persona: `You are a specialist assistant distilled from an earlier session. The user repeatedly asked for help like this:\n${userPrompts.slice(0, 8).map((p) => `- ${p}`).join('\n')}\n\nStay focused on that kind of task. Be concise and practical, cite sources for factual claims, state assumptions when a request is ambiguous, and proactively offer the next useful step.`,
    model: '', provider: '', mcp: [],
    starters: userPrompts.slice(0, 5),
  };

  agents.push(a);
  scheduleSave();
  openAgents();
  renderAgents();
  toast(`Created agent “${a.name}”. Review and tweak it below.`);
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
    const exp = document.createElement('button');
    exp.className = 'si-btn';
    exp.textContent = 'Export';
    exp.title = 'Save as a shareable agent file';
    exp.addEventListener('click', () => exportAgent(a));
    const pub = document.createElement('button');
    pub.className = 'si-btn';
    pub.textContent = a.publishedUrl ? 'Published ✓' : 'Publish';
    pub.title = 'Publish to the web — your profile + the Agent store';
    pub.addEventListener('click', () => publishAgentToWeb(a));
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
    item.appendChild(exp);
    item.appendChild(pub);
    item.appendChild(del);
    list.appendChild(item);
  }
}

// ---- Multi-stage agents: pipelines ----------------------------------------
function renderPipelinesSection() { renderPipelineBuilder(); renderPipelines(); }

// The inline builder: an agent picker that appends to an ordered draft of stages.
function renderPipelineBuilder() {
  const sel = document.getElementById('pipeline-stage-select');
  const draft = document.getElementById('pipeline-draft');
  if (!sel || !draft) return;
  sel.innerHTML = '';
  if (!agents.length) {
    const o = document.createElement('option'); o.value = ''; o.textContent = 'Import agents first'; sel.appendChild(o);
  } else {
    const ph = document.createElement('option'); ph.value = ''; ph.textContent = 'Choose an agent…'; sel.appendChild(ph);
    for (const a of agents) { const o = document.createElement('option'); o.value = a.id; o.textContent = a.name; sel.appendChild(o); }
  }
  draft.innerHTML = '';
  if (!draftStages.length) {
    const e = document.createElement('span'); e.className = 'pipeline-draft-empty';
    e.textContent = 'No stages yet — add agents in the order they should run.';
    draft.appendChild(e);
    return;
  }
  draftStages.forEach((id, i) => {
    const a = agents.find((x) => x.id === id);
    const chip = document.createElement('span'); chip.className = 'pipeline-chip';
    chip.textContent = `${i + 1}. ${a ? a.name : '(removed)'}`;
    const x = document.createElement('button'); x.className = 'pipeline-chip-x'; x.title = 'Remove stage'; x.textContent = '✕';
    x.addEventListener('click', () => { draftStages.splice(i, 1); renderPipelineBuilder(); });
    chip.appendChild(x);
    draft.appendChild(chip);
    if (i < draftStages.length - 1) { const arr = document.createElement('span'); arr.className = 'pipeline-arrow'; arr.textContent = '→'; draft.appendChild(arr); }
  });
}

function addPipelineStage() {
  const sel = document.getElementById('pipeline-stage-select');
  const id = sel && sel.value;
  if (!id) return;
  draftStages.push(id);
  renderPipelineBuilder();
}

function savePipeline() {
  const nameEl = document.getElementById('pipeline-name');
  const name = ((nameEl && nameEl.value) || '').trim();
  if (draftStages.length < 2) { toast('A pipeline needs at least two stages.'); return; }
  const finalName = name || draftStages.map((id) => { const a = agents.find((x) => x.id === id); return a ? a.name : '?'; }).join(' → ');
  const orchEl = document.getElementById('pipeline-orchestrated');
  const orchestrated = !!(orchEl && orchEl.checked);
  pipelines.push({ id: uid(), name: finalName, stageAgentIds: draftStages.slice(), orchestrated });
  draftStages = [];
  if (nameEl) nameEl.value = '';
  if (orchEl) orchEl.checked = false;
  scheduleSave();
  renderPipelinesSection();
  toast(`Saved pipeline “${finalName}”.`);
}

function deletePipeline(id) {
  pipelines = pipelines.filter((p) => p.id !== id);
  scheduleSave();
  renderPipelines();
}

function renderPipelines() {
  const list = document.getElementById('pipelines-list');
  if (!list) return;
  list.innerHTML = '';
  if (!pipelines.length) {
    const e = document.createElement('div'); e.className = 'sched-empty';
    e.textContent = 'No pipelines yet. Add stages above and Save.';
    list.appendChild(e);
    return;
  }
  for (const p of pipelines) {
    const item = document.createElement('div'); item.className = 'sched-item';
    const main = document.createElement('div'); main.className = 'si-main';
    const title = document.createElement('div'); title.className = 'si-title';
    title.textContent = (p.orchestrated ? '🧠 ' : '🧩 ') + p.name;
    const when = document.createElement('div'); when.className = 'si-when';
    const names = p.stageAgentIds.map((id) => { const a = agents.find((x) => x.id === id); return a ? a.name : '(removed)'; });
    when.textContent = (p.orchestrated ? 'orchestrated · ' : '') + names.join(p.orchestrated ? ', ' : ' → ');
    const taskInput = document.createElement('input');
    taskInput.type = 'text'; taskInput.className = 'pipeline-task'; taskInput.placeholder = 'Task for this run…';
    taskInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') runPipeline(p, taskInput.value); });
    main.appendChild(title); main.appendChild(when); main.appendChild(taskInput);
    const run = document.createElement('button'); run.className = 'si-btn'; run.textContent = 'Run';
    run.addEventListener('click', () => runPipeline(p, taskInput.value));
    const del = document.createElement('button'); del.className = 'si-btn'; del.textContent = 'Delete';
    del.addEventListener('click', () => deletePipeline(p.id));
    item.appendChild(main); item.appendChild(run); item.appendChild(del);
    list.appendChild(item);
  }
}

// Run a pipeline: each agent but the last produces a reasoning turn that the next
// builds on; the final agent composes the page from the whole team's notes.
async function runPipeline(pipeline, task) {
  task = (task || '').trim();
  if (!task) { toast('Enter a task for this pipeline.'); return; }
  if (pipeline.orchestrated) return runOrchestratedPipeline(pipeline, task);
  const stages = (pipeline.stageAgentIds || []).map((id) => agents.find((a) => a.id === id)).filter(Boolean);
  if (stages.length < 2) { toast('This pipeline needs at least two existing agents.'); return; }
  closeAgents();
  newTab(true);
  const tab = activeTab();
  tab.title = (pipeline.name || 'Pipeline').slice(0, 40);
  addMessage(tab, 'user', `🧩 ${pipeline.name}: ${task}`);
  renderTabs();
  let prior = '';
  for (let i = 0; i < stages.length - 1; i++) {
    const a = stages[i];
    if (tab.id === activeId) setStatus(`🧩 ${a.name} is working… (stage ${i + 1} of ${stages.length})`);
    let res;
    try {
      res = await window.chervil.agentTurn({ task, role: a.name, persona: a.persona || '', prior, profile: settings.profile || null, config: providerConfig(a) });
    } catch (e) { res = { ok: false, error: String((e && e.message) || e) }; }
    if (!res || !res.ok) {
      if (tab.id === activeId) clearStatus();
      addMessage(tab, 'bot', `Stage “${a.name}” couldn’t run: ${(res && res.error) || 'unknown error'}`, 'error');
      scheduleSave();
      return;
    }
    addMessage(tab, 'bot', `🧩 ${a.name}\n\n${res.text}`);
    prior += `\n\n## ${a.name}\n${res.text}`;
  }
  if (tab.id === activeId) clearStatus();
  const finalAgent = stages[stages.length - 1];
  const composeQuery = `${task}\n\n--- Notes from your agent team (use these to build the page) ---${prior}`;
  await submitQuery(composeQuery, { tab, agentId: finalAgent.id, displayText: `🧩 ${finalAgent.name} composes the result`, skipFollowup: true });
  scheduleSave();
}

// Orchestrated run: a coordinator looks at the work so far and picks who acts next
// (or "finish"), instead of a fixed order. Bounded by a step cap so it can't loop
// forever. The last agent in the roster composes the final page.
async function runOrchestratedPipeline(pipeline, task) {
  const stages = (pipeline.stageAgentIds || []).map((id) => agents.find((a) => a.id === id)).filter(Boolean);
  if (stages.length < 2) { toast('This pipeline needs at least two existing agents.'); return; }
  if (!window.chervil.agentOrchestrate) { toast('Orchestration isn’t available in this build.'); return; }
  closeAgents();
  newTab(true);
  const tab = activeTab();
  tab.title = (pipeline.name || 'Pipeline').slice(0, 40);
  addMessage(tab, 'user', `🧠 ${pipeline.name} (orchestrated): ${task}`);
  renderTabs();
  const roster = stages.map((a) => ({ name: a.name, description: a.description || '' }));
  const composer = stages[stages.length - 1];
  const coordCfg = providerConfig();           // coordinator uses the default provider/model
  const MAX_STEPS = Math.min(10, Math.max(3, stages.length * 2));
  let prior = '';
  for (let step = 0; step < MAX_STEPS; step++) {
    if (tab.id === activeId) setStatus(`🧭 Coordinator is deciding the next move… (step ${step + 1}/${MAX_STEPS})`);
    let dec;
    try { dec = await window.chervil.agentOrchestrate({ task, roster, transcript: prior, config: coordCfg }); }
    catch (e) { dec = { ok: false, error: String((e && e.message) || e) }; }
    if (!dec || !dec.ok) {
      if (tab.id === activeId) clearStatus();
      addMessage(tab, 'bot', `Coordinator couldn’t run: ${(dec && dec.error) || 'unknown error'}`, 'error');
      scheduleSave();
      return;
    }
    if (!dec.next || /^finish$/i.test(dec.next)) break;
    const a = stages.find((x) => x.name.toLowerCase() === String(dec.next).toLowerCase());
    if (!a) break; // coordinator named someone not on the team — stop rather than loop
    if (tab.id === activeId) setStatus(`🧩 ${a.name} is working…`);
    let res;
    try { res = await window.chervil.agentTurn({ task, role: a.name, persona: a.persona || '', prior, profile: settings.profile || null, config: providerConfig(a) }); }
    catch (e) { res = { ok: false, error: String((e && e.message) || e) }; }
    if (!res || !res.ok) {
      if (tab.id === activeId) clearStatus();
      addMessage(tab, 'bot', `Stage “${a.name}” couldn’t run: ${(res && res.error) || 'unknown error'}`, 'error');
      scheduleSave();
      return;
    }
    addMessage(tab, 'bot', `🧩 ${a.name}${dec.reason ? ` — ${dec.reason}` : ''}\n\n${res.text}`);
    prior += `\n\n## ${a.name}\n${res.text}`;
  }
  if (tab.id === activeId) clearStatus();
  const composeQuery = `${task}\n\n--- Notes from your agent team (use these to build the page) ---${prior}`;
  await submitQuery(composeQuery, { tab, agentId: composer.id, displayText: `🧩 ${composer.name} composes the result`, skipFollowup: true });
  scheduleSave();
}

// Show the bundled /agents starter files with one-click "Add".
// ---- Agent store browse (RFC 0012) ----
const STORE_CATEGORIES = [
  'Productivity', 'Coding & Dev', 'Security', 'Research', 'Writing', 'Education',
  'Business & Finance', 'Marketing', 'Data & Analytics', 'Creative', 'Lifestyle', 'Other',
];
let storeAgentsCache = null;   // null = not loaded yet
let storeAgentsLoading = false;

function storeBase() { return settings.publishBase || 'https://getchervil.com'; }

function renderStoreCatSelect() {
  const sel = document.getElementById('store-cat-select');
  if (!sel || sel.options.length) return; // populate once
  const all = document.createElement('option'); all.value = ''; all.textContent = 'All categories'; sel.appendChild(all);
  for (const c of STORE_CATEGORIES) { const o = document.createElement('option'); o.value = c; o.textContent = c; sel.appendChild(o); }
}

function renderStoreSection() {
  renderStoreCatSelect();
  const list = document.getElementById('store-agents-list');
  if (!list) return;
  if (storeAgentsCache === null) {
    list.innerHTML = '<div class="sched-empty">Click “Browse store” to load community agents.</div>';
  } else {
    renderStoreAgents();
  }
}

async function loadStoreAgents() {
  if (storeAgentsLoading || !window.chervil.listStoreAgents) return;
  const sel = document.getElementById('store-cat-select');
  const cat = sel ? sel.value : '';
  const list = document.getElementById('store-agents-list');
  storeAgentsLoading = true;
  if (list) list.innerHTML = '<div class="sched-empty">Loading the store…</div>';
  let res;
  try { res = await window.chervil.listStoreAgents({ category: cat || undefined, baseUrl: storeBase() }); }
  catch (e) { res = { ok: false, error: String((e && e.message) || e) }; }
  storeAgentsLoading = false;
  if (!res || !res.ok) { if (list) list.innerHTML = `<div class="sched-empty">Couldn’t load the store: ${(res && res.error) || 'offline?'}</div>`; return; }
  storeAgentsCache = res.agents || [];
  renderStoreAgents();
}

function renderStoreAgents() {
  const list = document.getElementById('store-agents-list');
  if (!list) return;
  list.innerHTML = '';
  const items = storeAgentsCache || [];
  if (!items.length) {
    const e = document.createElement('div'); e.className = 'sched-empty'; e.textContent = 'No agents found here yet.';
    list.appendChild(e); return;
  }
  for (const a of items) {
    const item = document.createElement('div'); item.className = 'sched-item';
    const main = document.createElement('div'); main.className = 'si-main';
    const title = document.createElement('div'); title.className = 'si-title'; title.textContent = '👤 ' + a.name;
    const when = document.createElement('div'); when.className = 'si-when';
    when.textContent = [a.category, a.description, a.username ? 'by @' + a.username : ''].filter(Boolean).join(' · ');
    main.appendChild(title); main.appendChild(when);
    const add = document.createElement('button'); add.className = 'si-btn'; add.textContent = 'Add'; add.title = 'Import this agent';
    add.addEventListener('click', async () => {
      add.disabled = true; add.textContent = 'Adding…';
      let r;
      try { r = await window.chervil.importStoreAgent({ id: a.id, baseUrl: storeBase() }); }
      catch (e) { r = { ok: false, error: String((e && e.message) || e) }; }
      if (!r || !r.ok) { add.disabled = false; add.textContent = 'Add'; toast(`Couldn’t import: ${(r && r.error) || 'error'}`); }
      else { add.textContent = 'Added ✓'; }
    });
    item.appendChild(main); item.appendChild(add);
    list.appendChild(item);
  }
}

async function renderStarterAgents() {
  const list = document.getElementById('starter-agents-list');
  if (!list) return;
  list.innerHTML = '<div class="sched-empty">Loading starter agents…</div>';
  let files = [];
  try { files = await window.chervil.listStarterAgents(); } catch { files = []; }
  list.innerHTML = '';
  if (!files || !files.length) {
    const e = document.createElement('div');
    e.className = 'sched-empty';
    e.textContent = 'No bundled starter agents found.';
    list.appendChild(e);
    return;
  }
  for (const f of files) {
    const a = parseAgentFile(f.text, (f.filename || '').replace(/\.[^.]+$/, ''));
    if (!a.persona) continue;
    const item = document.createElement('div');
    item.className = 'sched-item';
    const main = document.createElement('div');
    main.className = 'si-main';
    const title = document.createElement('div');
    title.className = 'si-title';
    title.textContent = a.name;
    const when = document.createElement('div');
    when.className = 'si-when';
    when.textContent = [a.description, a.model ? `model: ${a.model}` : ''].filter(Boolean).join(' · ') || 'persona agent';
    main.appendChild(title);
    main.appendChild(when);
    const add = document.createElement('button');
    add.className = 'si-btn';
    add.textContent = agents.some((x) => x.name === a.name) ? 'Add again' : 'Add';
    add.addEventListener('click', () => {
      const fresh = parseAgentFile(f.text, (f.filename || '').replace(/\.[^.]+$/, '')); // fresh id
      agents.push(fresh);
      scheduleSave();
      renderAgents();
      renderStarterAgents();
      toast(`Added “${fresh.name}”.`);
    });
    item.appendChild(main);
    item.appendChild(add);
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
  if (deepMode) { setSkillMode(''); setChatMode(false); } // the pipelines are mutually exclusive
  updatePlaceholder();
}

// "Just a chatbot" mode (sticky): the next messages are plain conversation —
// Sprig replies as text in the chat panel instead of composing a page.
function setChatMode(on) {
  settings.chatMode = !!on;
  if (els.chatToggle) {
    els.chatToggle.classList.toggle('active', settings.chatMode);
    els.chatToggle.setAttribute('aria-pressed', String(settings.chatMode));
  }
  if (settings.chatMode) {
    // Mutually exclusive with the page-composing pipelines.
    if (deepMode) { deepMode = false; els.deepToggle.classList.remove('active'); els.deepToggle.setAttribute('aria-pressed', 'false'); }
    setSkillMode('');
  }
  updatePlaceholder();
  scheduleSave();
}

// Skill picker (sticky): when a skill mode is active, the next query builds that
// skill ('learn' | 'quiz') instead of composing a page — same as its "/command".
let skillMode = '';
function setSkillMode(id) {
  skillMode = skillMode === id ? '' : (id || ''); // clicking the active one turns it off
  if (els.learnToggle) {
    els.learnToggle.classList.toggle('active', skillMode === 'learn');
    els.learnToggle.setAttribute('aria-pressed', String(skillMode === 'learn'));
  }
  if (els.quizToggle) {
    els.quizToggle.classList.toggle('active', skillMode === 'quiz');
    els.quizToggle.setAttribute('aria-pressed', String(skillMode === 'quiz'));
  }
  if (skillMode && deepMode) {
    deepMode = false;
    els.deepToggle.classList.remove('active');
    els.deepToggle.setAttribute('aria-pressed', 'false');
  }
  if (skillMode && settings.chatMode) { // skills compose pages — leave chat mode
    settings.chatMode = false;
    if (els.chatToggle) { els.chatToggle.classList.remove('active'); els.chatToggle.setAttribute('aria-pressed', 'false'); }
  }
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

// ---- Data folders (RFC 0004 local on-ramp) ----
// Designate folders (local / desktop-synced OneDrive/GDrive) and pull files from
// them into pendingAttachments. No upload/indexing — that's the Pro cloud layer.
let folderBrowseId = null;       // id of the folder currently being browsed
let folderBrowseFiles = [];      // enumerated files of that folder
let folderSelected = new Set();  // selected file paths

function fmtBytes(n) {
  if (!n && n !== 0) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function openFoldersModal() {
  folderBrowseId = null;
  folderBrowseFiles = [];
  folderSelected.clear();
  els.folderBrowse.hidden = true;
  renderFolders();
  renderPinnedFiles();
  els.foldersModal.classList.add('open');
}
function closeFoldersModal() { els.foldersModal.classList.remove('open'); }

function renderFolders() {
  const list = els.foldersList;
  list.innerHTML = '';
  const folders = settings.dataFolders || [];
  if (!folders.length) {
    const empty = document.createElement('div');
    empty.className = 'folders-empty';
    empty.textContent = 'No folders yet. Add one to pull files from it when composing.';
    list.appendChild(empty);
    return;
  }
  for (const f of folders) {
    const row = document.createElement('div');
    row.className = 'folder-row';
    const info = document.createElement('div');
    info.className = 'folder-info';
    const name = document.createElement('div');
    name.className = 'folder-name';
    name.textContent = `📁 ${f.name}`;
    const p = document.createElement('div');
    p.className = 'folder-path';
    p.textContent = f.path;
    p.title = f.path;
    info.appendChild(name);
    info.appendChild(p);
    row.appendChild(info);
    const acts = document.createElement('div');
    acts.className = 'folder-acts';
    const browse = document.createElement('button');
    browse.className = 'lib-btn';
    browse.textContent = 'Browse';
    browse.addEventListener('click', () => browseFolder(f.id));
    const remove = document.createElement('button');
    remove.className = 'lib-btn danger';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => removeDataFolder(f.id));
    acts.appendChild(browse);
    acts.appendChild(remove);
    row.appendChild(acts);
    list.appendChild(row);
  }
}

async function addDataFolder() {
  if (!window.chervil.pickFolder) { toast('Folder picking isn’t available in this build.'); return; }
  const res = await window.chervil.pickFolder();
  if (!res || !res.ok) return;
  if (!settings.dataFolders) settings.dataFolders = [];
  if (settings.dataFolders.some((f) => f.path === res.path)) { toast('That folder is already added.'); return; }
  settings.dataFolders.push({ id: uid(), name: res.name, path: res.path });
  scheduleSave();
  renderFolders();
}

function removeDataFolder(id) {
  settings.dataFolders = (settings.dataFolders || []).filter((f) => f.id !== id);
  scheduleSave();
  if (folderBrowseId === id) { folderBrowseId = null; els.folderBrowse.hidden = true; }
  renderFolders();
}

async function browseFolder(id) {
  const folder = (settings.dataFolders || []).find((f) => f.id === id);
  if (!folder) return;
  if (!window.chervil.listFolder) { toast('Folder browsing isn’t available in this build.'); return; }
  folderBrowseId = id;
  folderSelected.clear();
  els.folderBrowseTitle.textContent = `📁 ${folder.name}`;
  els.folderFilter.value = '';
  els.folderFiles.innerHTML = '<div class="folders-empty">Reading folder…</div>';
  els.folderBrowse.hidden = false;
  const res = await window.chervil.listFolder({ path: folder.path });
  if (!res || !res.ok) { els.folderFiles.innerHTML = `<div class="folders-empty">Couldn’t read folder: ${(res && res.error) || 'unknown error'}</div>`; return; }
  folderBrowseFiles = res.files || [];
  if (res.truncated) toast(`Showing the first ${folderBrowseFiles.length} files.`);
  renderFolderFiles();
}

function renderFolderFiles() {
  const q = (els.folderFilter.value || '').trim().toLowerCase();
  const shown = q ? folderBrowseFiles.filter((f) => f.relPath.toLowerCase().includes(q)) : folderBrowseFiles;
  els.folderFiles.innerHTML = '';
  if (!folderBrowseFiles.length) {
    els.folderFiles.innerHTML = '<div class="folders-empty">No supported files in this folder.</div>';
  } else if (!shown.length) {
    els.folderFiles.innerHTML = '<div class="folders-empty">No files match the filter.</div>';
  } else {
    for (const f of shown) {
      const row = document.createElement('div');
      row.className = 'folder-file' + (folderSelected.has(f.path) ? ' sel' : '');
      row.title = f.relPath;
      const cb = document.createElement('span');
      cb.className = 'ff-check';
      cb.textContent = folderSelected.has(f.path) ? '☑' : '☐';
      const name = document.createElement('span');
      name.className = 'ff-name';
      name.textContent = f.relPath;
      const size = document.createElement('span');
      size.className = 'ff-size';
      size.textContent = fmtBytes(f.size);
      row.appendChild(cb);
      row.appendChild(name);
      row.appendChild(size);
      row.addEventListener('click', () => toggleFolderFile(f.path));
      els.folderFiles.appendChild(row);
    }
  }
  updateFolderPickBar();
}

function toggleFolderFile(p) {
  if (folderSelected.has(p)) folderSelected.delete(p);
  else {
    const room = MAX_ATTACH - pendingAttachments.length;
    if (folderSelected.size >= room) { toast(`Up to ${MAX_ATTACH} files total (with current attachments).`); return; }
    folderSelected.add(p);
  }
  renderFolderFiles();
}

function updateFolderPickBar() {
  els.folderPickCount.textContent = `${folderSelected.size} selected`;
  els.folderAttach.disabled = folderSelected.size === 0;
}

async function attachSelectedFolderFiles() {
  if (!folderSelected.size) return;
  if (!window.chervil.readSourceFiles) { toast('Reading files isn’t available in this build.'); return; }
  const paths = [...folderSelected];
  toast('Reading files…');
  const res = await window.chervil.readSourceFiles({ paths });
  if (!res || !res.ok) { toast(`Couldn’t read files: ${(res && res.error) || 'unknown error'}`); return; }
  let added = 0;
  for (const f of (res.files || [])) {
    if (pendingAttachments.length >= MAX_ATTACH) break;
    pendingAttachments.push({ id: uid(), ...f });
    added++;
  }
  renderAttachChips();
  const skipped = (res.skipped || []).length;
  closeFoldersModal();
  toast(`Attached ${added} file${added === 1 ? '' : 's'}${skipped ? ` (${skipped} skipped — too large)` : ''}.`);
}

// ---- Pinned Space files: permanent per-Space sources (Spaces-as-sources) ----
// Pin selected folder files to the active Space; they auto-feed Synthesize (and,
// if the user opts in via Settings, every compose while that Space is active).
function pinSelectedFilesToSpace() {
  const sp = activeSpace();
  if (!sp) { toast('Create or pick a Space first.'); return; }
  if (!folderSelected.size) { toast('Select files to pin first.'); return; }
  if (!Array.isArray(sp.pinnedFiles)) sp.pinnedFiles = [];
  let added = 0;
  for (const path of folderSelected) {
    if (sp.pinnedFiles.length >= 20) break;
    if (sp.pinnedFiles.some((f) => f.path === path)) continue;
    sp.pinnedFiles.push({ path, name: String(path).split(/[\\/]/).pop() || path });
    added++;
  }
  scheduleSave();
  renderPinnedFiles();
  toast(`Pinned ${added} file${added === 1 ? '' : 's'} to “${sp.name}”.`);
}

function unpinSpaceFile(path) {
  const sp = activeSpace();
  if (!sp || !Array.isArray(sp.pinnedFiles)) return;
  sp.pinnedFiles = sp.pinnedFiles.filter((f) => f.path !== path);
  scheduleSave();
  renderPinnedFiles();
}

function renderPinnedFiles() {
  const box = document.getElementById('space-pinned');
  if (!box) return;
  const sp = activeSpace();
  const files = (sp && Array.isArray(sp.pinnedFiles)) ? sp.pinnedFiles : [];
  box.innerHTML = '';
  if (!files.length) { box.hidden = true; return; }
  box.hidden = false;
  const label = document.createElement('span'); label.className = 'pinned-label';
  label.textContent = `📌 Pinned to ${sp.name}:`;
  box.appendChild(label);
  for (const f of files) {
    const chip = document.createElement('span'); chip.className = 'pinned-chip'; chip.textContent = f.name;
    const x = document.createElement('button'); x.className = 'pinned-x'; x.title = 'Unpin'; x.textContent = '✕';
    x.addEventListener('click', () => unpinSpaceFile(f.path));
    chip.appendChild(x); box.appendChild(chip);
  }
}

// Load the active Space's pinned files as attachment objects (capped), for use as
// model context. Missing/deleted files are simply skipped.
async function loadSpacePinnedAttachments() {
  const sp = activeSpace();
  if (!sp || !Array.isArray(sp.pinnedFiles) || !sp.pinnedFiles.length) return [];
  if (!window.chervil.readSourceFiles) return [];
  const paths = sp.pinnedFiles.slice(0, 10).map((f) => f.path).filter(Boolean);
  if (!paths.length) return [];
  let res;
  try { res = await window.chervil.readSourceFiles({ paths }); } catch { return []; }
  if (!res || !res.ok || !Array.isArray(res.files)) return [];
  return res.files.map((f) => ({ id: uid(), ...f }));
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

// ---- Omnibox: the editable address/ask bar in the omnibar ----
let omniboxCanonical = '';
// Set the omnibox's canonical text without clobbering what the user is typing.
function setOmnibox(text) {
  omniboxCanonical = text || '';
  if (document.activeElement !== els.pageTitle) els.pageTitle.value = omniboxCanonical;
}
// Does this look like a URL/host to navigate to (vs. a question for Sprig)?
function looksLikeUrl(s) {
  const t = (s || '').trim();
  if (!t) return false;
  if (/^https?:\/\/\S+$/i.test(t)) return true;                  // explicit scheme
  if (/\s/.test(t)) return false;                                 // spaces, no scheme => a query
  if (/^localhost(:\d+)?(\/.*)?$/i.test(t)) return true;
  if (/^\d{1,3}(\.\d{1,3}){3}(:\d+)?(\/.*)?$/.test(t)) return true; // IPv4
  return /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,24}(:\d+)?(\/.*)?$/i.test(t); // domain.tld[/path]
}
// Friendly names → real URLs, so "open YouTube" / "go to my email" navigate
// reliably instead of composing a page about the site.
const KNOWN_SITES = {
  youtube: 'https://www.youtube.com', yt: 'https://www.youtube.com',
  gmail: 'https://mail.google.com', 'my email': 'https://mail.google.com',
  email: 'https://mail.google.com', mail: 'https://mail.google.com',
  google: 'https://www.google.com', 'google maps': 'https://maps.google.com',
  maps: 'https://maps.google.com', wikipedia: 'https://www.wikipedia.org',
  reddit: 'https://www.reddit.com', twitter: 'https://x.com', x: 'https://x.com',
  facebook: 'https://www.facebook.com', instagram: 'https://www.instagram.com',
  github: 'https://github.com', 'hacker news': 'https://news.ycombinator.com',
  hn: 'https://news.ycombinator.com', amazon: 'https://www.amazon.com',
  netflix: 'https://www.netflix.com', spotify: 'https://open.spotify.com',
  linkedin: 'https://www.linkedin.com', chatgpt: 'https://chatgpt.com',
  claude: 'https://claude.ai', wikipedia_org: 'https://www.wikipedia.org',
};
// App/agent concepts that should NOT be turned into "<word>.com" navigation.
const NAV_WORD_DENYLIST = new Set([
  'settings', 'downloads', 'download', 'history', 'bookmarks', 'bookmark',
  'help', 'file', 'menu', 'find', 'library', 'profile', 'account', 'tab',
  'page', 'devtools', 'console', 'cart', 'checkout', 'home', 'back', 'forward',
]);

// Detect a "go to / open <site>" navigation intent and resolve it to a URL.
// Returns the URL string, or null if it isn't a confident navigation request.
// `strict` (used while a live site is showing) only honors explicit domains and
// known site names, so agent commands like "open the cart" aren't hijacked.
function parseNavIntent(query, { strict = false } = {}) {
  const m = (query || '').trim().match(
    /^(?:go\s*to|goto|navigate\s+to|visit|open(?:\s+up)?|launch|pull\s+up|bring\s+up|take\s+me\s+to)\s+(.+)$/i
  );
  if (!m) return null;
  let target = m[1].trim().replace(/[.?!,;:'"]+$/, '').replace(/^(?:the|my|a|an)\s+/i, '').trim();
  if (!target) return null;
  // 1) Explicit URL / domain.
  if (looksLikeUrl(target)) return /^https?:\/\//i.test(target) ? target : 'https://' + target;
  // 2) Known friendly name (whole-target match).
  const key = target.toLowerCase();
  if (KNOWN_SITES[key]) return KNOWN_SITES[key];
  if (strict) return null;
  // 3) A single bare word → treat as "<word>.com" (unless it's an app concept).
  if (/^[a-z0-9][a-z0-9-]*$/i.test(target) && !NAV_WORD_DENYLIST.has(key)) {
    return 'https://www.' + key + '.com';
  }
  return null;
}

// Open a real site in the active tab (mirrors the 'live' link behavior).
function openUrlInTab(url) {
  const tab = activeTab();
  if (!tab || isTabBusy(tab.id)) return;
  let href = url.trim();
  if (!/^https?:\/\//i.test(href)) href = 'https://' + href;
  pushEntry(tab, { kind: 'navigate', url: href, title: href, query: href });
  tab.title = hostOf(href);
  renderTabs();
  renderCurrentPage();
  scheduleSave();
}

// Open a URL in a fresh tab — used when an embedded site follows a "new tab"
// link (target="_blank"), so it doesn't replace what the current tab is showing.
function openUrlInNewTab(url) {
  newTab(true);
  openUrlInTab(url);
}
// Route an omnibox submission: a URL navigates; anything else goes to Sprig
// (handleComposerSubmit already handles /commands, skills, deep mode, the web
// agent on live sites, and composing).
function runOmnibox(raw) {
  const text = (raw || '').trim();
  if (!text) return;
  els.pageTitle.blur();
  if (looksLikeUrl(text)) openUrlInTab(text);
  else handleComposerSubmit(text);
}

// ---- Find in page (Ctrl+F) ----
let lastFindQuery = '';
function findIsOpen() { return els.findBar && !els.findBar.hidden; }
function openFind() {
  if (!els.findBar) return;
  els.findBar.hidden = false;
  els.findInput.focus();
  els.findInput.select();
  if (els.findInput.value) runFind(true);
}
function closeFind() {
  if (!els.findBar || els.findBar.hidden) return;
  els.findBar.hidden = true;
  els.findCount.textContent = '';
  try { els.webview.stopFindInPage('clearSelection'); } catch { /* ignore */ }
  try { if (els.frame.contentWindow) els.frame.contentWindow.postMessage({ __chervil: true, type: 'find', text: '' }, '*'); } catch { /* ignore */ }
  lastFindQuery = '';
}
// Search the live site (webview, with a match count) or the composed page (iframe).
function runFind(forward) {
  const q = els.findInput.value;
  if (!q) { els.findCount.textContent = ''; try { els.webview.stopFindInPage('clearSelection'); } catch {} lastFindQuery = ''; return; }
  const entry = currentEntry(activeTab());
  if (entry && entry.kind === 'navigate' && !els.webview.hidden) {
    try { els.webview.findInPage(q, { forward, findNext: q === lastFindQuery }); } catch {}
    lastFindQuery = q;
  } else {
    try { if (els.frame.contentWindow) els.frame.contentWindow.postMessage({ __chervil: true, type: 'find', text: q, back: !forward }, '*'); } catch {}
    els.findCount.textContent = '';
  }
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

  // Skill dispatch: a "/learn" or "/quiz" command, or the active skill-mode
  // toggle, builds that skill instead of composing a page.
  const learnCmd = query.match(/^\/learn\s+(.+)/is);
  const quizCmd = query.match(/^\/quiz\s+(.+)/is);
  if (learnCmd) { buildAndRenderSkill(tab, 'learn', learnCmd[1].trim(), 'lesson'); return; }
  if (quizCmd) { buildAndRenderSkill(tab, 'quiz', quizCmd[1].trim(), 'quiz'); return; }
  if (skillMode) { buildAndRenderSkill(tab, skillMode, query, skillMode === 'learn' ? 'lesson' : 'quiz'); return; }

  // "Just a chatbot" mode: a plain conversational reply, no page composed.
  if (settings.chatMode) { chatSubmit(tab, query); return; }

  // On a live site, the composer drives the web agent instead of composing a page.
  const cur = currentEntry(tab);

  // Video summary: a YouTube URL in the message (or while viewing one) + a summarize intent.
  const ytUrl = extractYouTubeUrl(query) || (cur && cur.kind === 'navigate' ? extractYouTubeUrl(cur.url) : null);
  if (ytUrl && /(summ|tl;?dr|recap|key ?points|key takeaways|digest)/i.test(query)) {
    summarizeVideo(tab, ytUrl);
    return;
  }

  // "Go to / open <site>" navigates to a real URL instead of composing a page.
  // On a live site we stay strict (explicit domains / known names only) so the
  // web agent's own "open …" commands aren't hijacked.
  const navUrl = parseNavIntent(query, { strict: !!(cur && cur.kind === 'navigate') });
  if (navUrl) { openUrlInTab(navUrl); return; }

  if (cur && cur.kind === 'navigate') {
    if (/^\s*(auto-?fill|fill\s+(in|out)?\s*(the|this|my)?\s*form|fill\s+my\s+(details|info|information))\b/i.test(query)) { autofillCurrentForm(); return; }
    startAgent(query);
    return;
  }

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

// Generic skill build (RFC 0003): build any registered skill (Learn, Quiz, …)
// via the build-skill IPC and commit it as a page entry. Learn also keeps
// `lesson`/`sources` on the entry for the export/publish actions.
async function buildAndRenderSkill(tab, skillId, input, label) {
  if (!input) return;
  if (!window.chervil.buildSkill) { toast('This build isn’t available in this build.'); return; }
  els.prompt.value = '';
  refreshComposer();
  toast(`Sprig is building your ${label || skillId}…`);
  try {
    const resp = await window.chervil.buildSkill({ skill: skillId, input, level: 'beginner', config: providerConfig() });
    if (!resp || !resp.ok) { toast((resp && resp.error) || 'Couldn’t build it.'); return; }
    const a = resp.artifact || {};
    const entry = {
      kind: 'page',
      html: resp.html,
      title: a.title || (label || skillId),
      query: `/${skillId} ${input}`,
      skill: skillId,
      artifact: a,
      skillHtmlVersion: SKILL_HTML_VERSION, // freshly rendered with the current renderer
    };
    // Learn keeps `lesson` + `sources` for the (currently lesson-specific)
    // export/publish actions.
    if (skillId === 'learn') { entry.lesson = a; entry.sources = a.sources || []; }
    pushEntry(tab, entry);
    if (!tab.title || tab.title === 'New Tab') tab.title = a.title || (label || skillId);
    if (activeTab() === tab) { renderTabs(); renderCurrentPage(); refreshComposer(); }
    scheduleSave();
  } catch (e) {
    toast(`Build error: ${(e && e.message) || e}`);
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

// The hero block is delimited by marker comments so we can swap the loading
// placeholder for the real image (or remove it on failure) with an exact match.
const HERO_START = '<!--chervil-hero-start-->';
const HERO_END = '<!--chervil-hero-end-->';

// A shimmering skeleton shown in the hero's spot while the image generates, so
// the user sees that something is happening (gen can take ~10s). Neutral colors
// read on both light and dark composed pages.
const HERO_PLACEHOLDER =
  '<figure class="chervil-hero" style="margin:0 0 24px;width:100%;">' +
    '<div style="position:relative;width:100%;height:240px;border-radius:12px;overflow:hidden;background:#e6e9ee;display:flex;align-items:center;justify-content:center;">' +
      '<div style="position:absolute;inset:0;background:linear-gradient(90deg,#e6e9ee 0%,#f3f5f8 50%,#e6e9ee 100%);background-size:200% 100%;animation:chervilHeroShimmer 1.2s linear infinite;"></div>' +
      '<span style="position:relative;color:#5b6472;font:600 14px/1.4 system-ui,-apple-system,sans-serif;">🎨 Generating hero image…</span>' +
    '</div>' +
  '</figure>' +
  '<style>@keyframes chervilHeroShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}</style>';

function heroFigure(dataUrl) {
  // Show the full generated illustration (no crop). max-height caps very tall
  // (e.g. square) images while object-fit:contain keeps the whole image visible.
  return `<figure class="chervil-hero" style="margin:0 0 24px;width:100%;"><img src="${dataUrl}" alt="" style="display:block;width:100%;height:auto;max-height:70vh;object-fit:contain;border-radius:12px;"></figure>`;
}

// Downscale + recompress a (large, often multi-MB PNG) hero data URL to a compact
// JPEG so the inlined image stays small — important because a composed page is
// inlined whole, and the publish API caps page HTML at ~2 MB. Also makes pages
// load faster. Falls back to the original on any failure.
function compressHeroDataUrl(dataUrl, maxW = 1200, quality = 0.82) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const ow = img.naturalWidth || maxW;
          const oh = img.naturalHeight || maxW;
          const scale = Math.min(1, maxW / ow);
          const w = Math.max(1, Math.round(ow * scale));
          const h = Math.max(1, Math.round(oh * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const out = canvas.toDataURL('image/jpeg', quality);
          resolve(out && out.length < dataUrl.length ? out : dataUrl);
        } catch { resolve(dataUrl); }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch { resolve(dataUrl); }
  });
}

// Insert a marker-wrapped hero block as the first child of <body>.
function insertHeroBlock(html, inner) {
  const block = HERO_START + inner + HERO_END;
  const s = String(html || '');
  const m = s.match(/<body[^>]*>/i);
  if (m) {
    const idx = m.index + m[0].length;
    return s.slice(0, idx) + '\n' + block + s.slice(idx);
  }
  return block + s;
}

const HERO_BLOCK_RE = /<!--chervil-hero-start-->[\s\S]*?<!--chervil-hero-end-->/;
// Swap whatever is inside the hero markers for new content (the real image).
function replaceHeroBlock(html, inner) {
  const s = String(html || '');
  if (HERO_BLOCK_RE.test(s)) return s.replace(HERO_BLOCK_RE, HERO_START + inner + HERO_END);
  return insertHeroBlock(s, inner);
}
// Strip the hero block entirely (generation failed, or a stale pending block).
function stripHeroBlock(html) {
  return String(html || '').replace(HERO_BLOCK_RE, '');
}

// Does this composed page actually suit a hero image? Heroes belong on content-
// rich pages (articles, guides, explainers) — NOT on small interactive tools like
// clocks, timers, calculators, or converters, where a big photo at the top looks
// out of place. Judge by the page itself: measure the visible prose (ignoring
// scripts/styles/markup). Sparse pages — and interactive pages with little prose —
// are widgets, so skip the hero.
function pageSuitsHero(html) {
  const s = String(html || '');
  const hasScript = /<script[\s>]/i.test(s);
  const text = s
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const len = text.length;
  if (len < 600) return false;              // sparse → a utility/widget, not an article
  if (hasScript && len < 1500) return false; // interactive + light prose → a tool, not content
  return true;
}

// Opt-in: generate an AI hero image for a just-composed page. Shows a loading
// skeleton in the hero's spot immediately, then swaps in the image when ready
// (gen is slow). One image per page (guarded by entry.hero) so a refresh won't
// regenerate it. Skips tool/widget pages (see pageSuitsHero).
async function maybeAddHeroImage(tab, entry, title, topic) {
  if (!tab || !entry || entry.kind !== 'page' || entry.hero || entry.heroPending) return;
  if (!window.chervil || !window.chervil.generateHero) return;
  if (!pageSuitsHero(entry.html)) return; // don't put a hero on a clock/calculator/etc.
  const targetId = entry.id;

  const findEntry = () => {
    const t = tabs.find((x) => x.id === tab.id);
    const e = t && t.pages.find((p) => p.id === targetId);
    return { t, e };
  };
  const rerenderIfActive = (t, e) => { if (activeTab() === t && currentEntry(t) === e) renderCurrentPage(); };

  // 1) Show the loading placeholder right away (not persisted — it's transient).
  entry.heroPending = true;
  entry.html = insertHeroBlock(entry.html, HERO_PLACEHOLDER);
  rerenderIfActive(tab, entry);

  try {
    const resp = await window.chervil.generateHero({ title: title || '', topic: topic || '' });
    const { t, e } = findEntry();
    if (!e || e.kind !== 'page') return; // page closed while generating
    if (!resp || !resp.ok) {
      e.html = stripHeroBlock(e.html);
      delete e.heroPending;
      rerenderIfActive(t, e);
      if (resp && resp.error === 'no-image-key') toast('Hero images need an OpenAI, Gemini, or Grok key (Settings → AI).');
      else toast('Couldn’t generate a hero image.');
      return;
    }
    // 2) Compress, then swap the placeholder for the real image.
    const compact = await compressHeroDataUrl(resp.dataUrl);
    e.html = replaceHeroBlock(e.html, heroFigure(compact));
    e.hero = true;
    delete e.heroPending;
    rerenderIfActive(t, e);
    scheduleSave();
  } catch {
    const { t, e } = findEntry();
    if (e && e.kind === 'page') { e.html = stripHeroBlock(e.html); delete e.heroPending; rerenderIfActive(t, e); }
    toast('Couldn’t generate a hero image.');
  }
}

// "Just a chatbot" mode: send a plain conversational turn and append Sprig's
// text reply to the chat panel — no page composed. Reuses the tab's single-flight
// run state so it can't collide with a composing request.
async function chatSubmit(tab, text) {
  const query = (text || '').trim();
  if (!query || !tab || isTabBusy(tab.id) || agentRunning) return;

  els.prompt.value = '';
  resetPromptHeight();

  const requestId = uid();
  const rs = runStateFor(tab.id);
  rs.genId = requestId;
  rs.statusText = 'Sprig is typing…';

  addMessage(tab, 'user', query);
  if (tab.title === 'New Tab') tab.title = query.length > 40 ? query.slice(0, 37) + '…' : query;
  renderTabs();

  const sentHistory = tab.history.slice();
  tab.history.push({ role: 'user', content: query });

  const isActive = () => tab.id === activeId;
  if (isActive()) { setStatus(rs.statusText); setBadge('working', 'working'); setSendBusy(true); }

  try {
    const resp = await window.chervil.chat({
      query,
      history: sentHistory,
      profile: settings.profile || null,
      config: providerConfig(),
    });
    rs.genId = null; rs.statusText = '';
    if (isActive()) clearStatus();
    if (!resp || !resp.ok) {
      addMessage(tab, 'bot', (resp && resp.error) || 'Something went wrong.', 'error');
    } else {
      const reply = resp.text || '…';
      addMessage(tab, 'bot', reply);
      tab.history.push({ role: 'assistant', content: reply });
    }
  } catch (e) {
    rs.genId = null; rs.statusText = '';
    if (isActive()) clearStatus();
    addMessage(tab, 'bot', String(e && e.message ? e.message : e), 'error');
  } finally {
    if (isActive()) { setSendBusy(false); setBadge('', 'ready'); els.prompt.focus(); }
    renderTabs();
    scheduleSave();
  }
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
  // Effective agent: a per-run override (e.g. a scheduled "run as" agent) or the active one.
  const runAgentObj = opts.agentId ? (agents.find((a) => a.id === opts.agentId) || null) : activeAgent();

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
    setSendBusy(true);
    setRemixVisible(false);
  }

  // Permanent Space files (Spaces-as-sources): when the user opts into "every
  // compose", auto-attach the active Space's pinned files as context.
  let composeAttachments = opts.attachments || [];
  if (settings.spaceFilesMode === 'always' && !verify) {
    try {
      const extra = await loadSpacePinnedAttachments();
      if (extra.length) composeAttachments = composeAttachments.concat(extra);
    } catch { /* ignore */ }
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
      pageStyle: settings.pageStyle || 'balanced',
      attachments: composeAttachments,
      mcpServers: enabledMcpServers(runAgentObj),
      agent: runAgentObj ? runAgentObj.persona : null,
      config: providerConfig(runAgentObj),
    });

    // The user stopped this request while it was in flight — ignore its result.
    if (cancelledRequests.has(requestId)) { cancelledRequests.delete(requestId); return; }

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

      // Opt-in AI hero image for a freshly composed page (not refines, remixes,
      // or trust-checks). Runs after the page is shown; injects when ready.
      if (settings.heroImages && !isRefine && !opts.remix && !opts.verify) {
        maybeAddHeroImage(tab, currentEntry(tab), result.title || query, query);
      }

      // If the user stepped away while this composed (minimized to tray / window
      // unfocused), raise an OS notification so a finished page doesn't sit
      // unseen. Scheduled/background runs notify via runSchedule, so skip those
      // here to avoid a double toast.
      const unattended = typeof document !== 'undefined' && (document.hidden || !document.hasFocus());
      if (!opts.background && settings.notifications && unattended && window.chervil.notify) {
        const notifyEntry = isRefine ? curEntry : currentEntry(tab);
        window.chervil.notify({
          title: 'Chervil · page ready',
          body: `“${result.title || tab.title || 'Your page'}” is ready.`,
          tabId: tab.id,
          entryId: notifyEntry ? notifyEntry.id : null,
        });
      }
    }

    renderTabs();
    if (isActive()) renderCurrentPage();
    scheduleSave();
  } catch (err) {
    rs.genId = null;
    rs.streamBuffer = '';
    rs.statusText = '';
    reqToTab.delete(requestId);
    // If the user stopped this request, swallow the resulting abort error.
    if (cancelledRequests.has(requestId)) { cancelledRequests.delete(requestId); return; }
    if (isActive()) { clearStatus(); renderCurrentPage(); }
    addMessage(tab, 'bot', String(err && err.message ? err.message : err), 'error');
    renderTabs();
  } finally {
    if (isActive()) {
      setSendBusy(false);
      els.prompt.focus();
    }
  }
}

// ---- Agentic actions: phone numbers and map locations ----
function isMapsUrl(href) {
  return /(?:google\.[a-z.]+\/maps|maps\.google\.|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(href);
}

// A tel: link in a composed page → call via the desktop, or send to phone.
function showPhoneActions(href, text) {
  const number = href.replace(/^tel:/i, '').trim();
  showActionSheet(text && text.trim() && text.trim() !== number ? text.trim() : number, number, [
    { label: '📞 Call from this PC', primary: true, onClick: async () => {
      const r = await window.chervil.dial(href);
      if (!r || !r.ok) toast('No phone app is set up on this PC to place the call.');
    } },
    { label: '📱 Send to phone', onClick: () => showQrModal('Scan to dial', href, number) },
    { label: '📋 Copy number', onClick: () => { try { navigator.clipboard.writeText(number); toast('Number copied.'); } catch {} } },
  ]);
}

// A Google Maps link → open the real map in Chervil's webview, or send the pin to phone.
function openMapsInChervil(href, text) {
  const place = (text && text.trim()) || 'this location';
  showActionSheet(`Open ${place} in Maps?`, href, [
    { label: '🗺️ Open in Chervil', primary: true, onClick: () => {
      const tab = activeTab();
      if (!tab || isTabBusy(tab.id)) return;
      pushEntry(tab, { kind: 'navigate', url: href, title: place, query: href });
      tab.title = place.slice(0, 60);
      renderTabs(); renderCurrentPage(); scheduleSave();
    } },
    { label: '📱 Send pin to phone', onClick: () => showQrModal('Scan to open the map', href, place) },
    { label: '📋 Copy link', onClick: () => { try { navigator.clipboard.writeText(href); toast('Map link copied.'); } catch {} } },
  ]);
}

// ---- Click-through links ----
function handleLinkClick(href, text) {
  if (/^tel:/i.test(href)) { showPhoneActions(href, text); return; }
  if (!/^https?:\/\//i.test(href)) return;
  if (isMapsUrl(href)) { openMapsInChervil(href, text); return; }
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

// A small centered modal with a title, a subtitle, and a stack of action buttons.
// A sheet with a single text/password input → resolves to the value (or null if
// cancelled). Used for the password-vault unlock prompt.
function showInputSheet({ title, subtitle, placeholder = '', type = 'text', okLabel = 'OK' }) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'chervil-sheet-overlay';
    let done = false;
    const finish = (v) => { if (done) return; done = true; overlay.remove(); document.removeEventListener('keydown', onEsc); resolve(v); };
    function onEsc(e) { if (e.key === 'Escape') finish(null); }
    overlay.addEventListener('click', (e) => { if (e.target === overlay) finish(null); });
    const sheet = document.createElement('div');
    sheet.className = 'chervil-sheet';
    const h = document.createElement('div'); h.className = 'chervil-sheet-title'; h.textContent = title; sheet.appendChild(h);
    if (subtitle) { const s = document.createElement('div'); s.className = 'chervil-sheet-sub'; s.textContent = subtitle; sheet.appendChild(s); }
    const input = document.createElement('input');
    input.type = type; input.className = 'mcp-field'; input.placeholder = placeholder; input.style.width = '100%';
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); finish(input.value); } });
    sheet.appendChild(input);
    const ok = document.createElement('button'); ok.className = 'chervil-sheet-btn primary'; ok.textContent = okLabel;
    ok.addEventListener('click', () => finish(input.value));
    sheet.appendChild(ok);
    const cancel = document.createElement('button'); cancel.className = 'chervil-sheet-btn cancel'; cancel.textContent = 'Cancel';
    cancel.addEventListener('click', () => finish(null));
    sheet.appendChild(cancel);
    overlay.appendChild(sheet);
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onEsc);
    input.focus();
  });
}

function showActionSheet(title, subtitle, actions, onClose, extra) {
  const overlay = document.createElement('div');
  overlay.className = 'chervil-sheet-overlay';
  let chosen = false;
  function onEsc(e) { if (e.key === 'Escape') close(); }
  const close = () => { overlay.remove(); document.removeEventListener('keydown', onEsc); if (!chosen && onClose) onClose(); };
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  const sheet = document.createElement('div');
  sheet.className = 'chervil-sheet';
  const h = document.createElement('div');
  h.className = 'chervil-sheet-title';
  h.textContent = title;
  sheet.appendChild(h);
  if (subtitle) {
    const s = document.createElement('div');
    s.className = 'chervil-sheet-sub';
    s.textContent = subtitle;
    sheet.appendChild(s);
  }
  // Optional checkbox row (e.g. "Don't show this again"). Fires onChange immediately
  // so the choice persists regardless of how the sheet is then dismissed.
  if (extra && extra.checkbox) {
    const lbl = document.createElement('label');
    lbl.className = 'chervil-sheet-check';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!extra.checkbox.checked;
    cb.addEventListener('change', () => { Promise.resolve().then(() => extra.checkbox.onChange(cb.checked)); });
    const sp = document.createElement('span');
    sp.textContent = extra.checkbox.label;
    lbl.appendChild(cb);
    lbl.appendChild(sp);
    sheet.appendChild(lbl);
  }
  (actions || []).forEach((a) => {
    const b = document.createElement('button');
    b.className = 'chervil-sheet-btn' + (a.primary ? ' primary' : '');
    b.textContent = a.label;
    b.addEventListener('click', () => { chosen = true; close(); Promise.resolve().then(a.onClick); });
    sheet.appendChild(b);
  });
  const cancel = document.createElement('button');
  cancel.className = 'chervil-sheet-btn cancel';
  cancel.textContent = 'Cancel';
  cancel.addEventListener('click', close);
  sheet.appendChild(cancel);

  overlay.appendChild(sheet);
  document.body.appendChild(overlay);
  document.addEventListener('keydown', onEsc);
}

// "Send to phone" — show a QR the user scans with their phone camera.
async function showQrModal(title, text, caption) {
  const res = await window.chervil.qr(text);
  if (!res || !res.ok) { toast('Couldn’t generate the QR code.'); return; }
  const overlay = document.createElement('div');
  overlay.className = 'chervil-sheet-overlay';
  const close = () => overlay.remove();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  const sheet = document.createElement('div');
  sheet.className = 'chervil-sheet';
  const h = document.createElement('div');
  h.className = 'chervil-sheet-title';
  h.textContent = title;
  sheet.appendChild(h);
  const img = document.createElement('img');
  img.className = 'chervil-qr';
  img.src = res.dataUrl;
  img.alt = 'QR code';
  sheet.appendChild(img);
  if (caption) {
    const c = document.createElement('div');
    c.className = 'chervil-sheet-sub';
    c.textContent = caption;
    sheet.appendChild(c);
  }
  const done = document.createElement('button');
  done.className = 'chervil-sheet-btn cancel';
  done.textContent = 'Done';
  done.addEventListener('click', close);
  sheet.appendChild(done);

  overlay.appendChild(sheet);
  document.body.appendChild(overlay);
  const onEsc = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc); } };
  document.addEventListener('keydown', onEsc);
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
async function synthesizeSpace(query) {
  const items = spaceItems();
  const sp = activeSpace();
  if (!items.length) {
    closeDrawer();
    const tab = activeTab();
    if (tab) addMessage(tab, 'bot', `Your "${sp ? sp.name : 'Space'}" has no pages yet — compose a few, then synthesize.`, 'error');
    return;
  }
  const spaceContext = buildSpaceContext(items);
  // Pinned Space files feed Synthesize unless the user turned the feature off.
  let attachments = [];
  if (settings.spaceFilesMode !== 'off') { try { attachments = await loadSpacePinnedAttachments(); } catch { attachments = []; } }
  const q = (query || '').trim() ||
    `Synthesize everything I've collected in my "${sp ? sp.name : 'research'}" Space into one clear overview — compare the pages, connect the themes, and tell me the key takeaways.`;
  closeDrawer();
  submitQuery(q, {
    spaceContext,
    attachments,
    skipFollowup: true,
    allowNavigate: false,
    displayText: (query || '').trim() || `Synthesize "${sp ? sp.name : 'my Space'}" (${items.length} pages)`,
  });
}

// Publish every page in the active Space to the web, then a styled index page
// linking them all. Returns the index URL (the shareable Space link).
async function publishCurrentSpace() {
  const items = spaceItems();
  const sp = activeSpace();
  const spaceName = sp ? sp.name : 'My Space';
  if (!items.length) { toast(`"${spaceName}" has no pages to publish.`); return; }
  if (!settings.publishToken) { toast('Add a publish token in Settings → Publishing.'); return; }
  if (!window.chervil.publishPage) { toast('Publishing isn’t available in this build.'); return; }
  const pages = items.filter((it) => it.html);
  if (!pages.length) { toast('No composed pages in this Space to publish.'); return; }
  if (!confirm(`Publish all ${pages.length} page${pages.length === 1 ? '' : 's'} in "${spaceName}" to the web?`)) return;

  const token = settings.publishToken;
  const baseUrl = settings.publishBase || 'https://getchervil.com';
  toast(`Publishing ${pages.length} page${pages.length === 1 ? '' : 's'}…`);
  const published = [];
  for (const it of pages) {
    try {
      const res = await window.chervil.publishPage({ html: it.html, title: it.title || it.query || 'Chervil page', token, baseUrl });
      if (res && res.ok && res.url) published.push({ title: it.title || it.query || 'Untitled page', url: res.url, createdAt: it.createdAt });
    } catch { /* skip this page, keep going */ }
  }

  closeDrawer();
  const tab = activeTab();
  if (!published.length) {
    if (tab) addMessage(tab, 'bot', `Couldn’t publish "${spaceName}". Check your publish token and base URL in Settings → Publishing.`, 'error');
    return;
  }
  let indexUrl = '';
  try {
    const res = await window.chervil.publishPage({ html: buildSpaceIndexHtml(spaceName, published), title: spaceName, token, baseUrl });
    if (res && res.ok && res.url) indexUrl = res.url;
  } catch { /* index failed; pages are still up */ }

  const n = published.length;
  if (indexUrl) {
    if (tab) addMessage(tab, 'bot', `Published "${spaceName}" — ${n} page${n === 1 ? '' : 's'} live at ${indexUrl}`);
    try { await navigator.clipboard.writeText(indexUrl); toast('Space published — index link copied to clipboard.'); } catch { toast('Space published.'); }
  } else {
    if (tab) addMessage(tab, 'bot', `Published ${n} page${n === 1 ? '' : 's'} from "${spaceName}", but the index page couldn’t be created.`, 'error');
  }
}

// A self-contained index page listing each published page in a Space.
function buildSpaceIndexHtml(name, pages) {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rows = pages.map((p) => {
    const when = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '';
    return `<li><a href="${esc(p.url)}">${esc(p.title)}</a>${when ? `<span class="when">${esc(when)}</span>` : ''}</li>`;
  }).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(name)} — Chervil</title>
<style>
*{box-sizing:border-box}
body{font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;max-width:680px;margin:0 auto;padding:48px 24px;color:#1c2b22;background:#f7faf7}
h1{font-size:28px;margin:0 0 4px}
.sub{color:#5b6b60;margin:0 0 28px;font-size:14px}
ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px}
li{background:#fff;border:1px solid #e2ece4;border-radius:12px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;gap:12px}
a{color:#2e8b57;text-decoration:none;font-weight:600}
a:hover{text-decoration:underline}
.when{color:#8aa093;font-size:12px;flex:none}
footer{margin-top:32px;color:#8aa093;font-size:13px;text-align:center}
</style></head>
<body>
<h1>🌿 ${esc(name)}</h1>
<p class="sub">${pages.length} page${pages.length === 1 ? '' : 's'} · published with Chervil</p>
<ul>${rows}</ul>
<footer>Made with Chervil</footer>
</body></html>`;
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
        storeKey: item.storeKey,   // carry interactive-state key if the item has one
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

// Move several history items to trash at once (bulk delete), newest kept on top.
function deleteLibraryItems(ids) {
  const idSet = new Set(ids);
  idSet.delete(undefined);
  if (!idSet.size) return;
  const moved = [];
  library.history = library.history.filter((it) => {
    if (idSet.has(it.id)) { moved.push(it); return false; }
    return true;
  });
  for (let i = moved.length - 1; i >= 0; i--) library.trash.unshift(moved[i]);
  if (library.trash.length > MAX_LIBRARY) library.trash.length = MAX_LIBRARY;
  renderDrawer();
  scheduleSave();
}

// ---- History multi-select mode ----
function enterLibrarySelect() {
  librarySelectMode = true;
  selectedLibraryIds.clear();
  renderDrawer();
}
function exitLibrarySelect() {
  librarySelectMode = false;
  selectedLibraryIds.clear();
  renderDrawer();
}
function toggleLibrarySelected(id) {
  if (selectedLibraryIds.has(id)) selectedLibraryIds.delete(id);
  else selectedLibraryIds.add(id);
  renderDrawer();
}
function selectAllLibrary() {
  const shown = spaceItems();
  const allSel = shown.length > 0 && shown.every((it) => selectedLibraryIds.has(it.id));
  selectedLibraryIds = new Set(allSel ? [] : shown.map((it) => it.id));
  renderDrawer();
}
function deleteSelectedLibrary() {
  if (!selectedLibraryIds.size) return;
  const ids = [...selectedLibraryIds];
  librarySelectMode = false;
  selectedLibraryIds.clear();
  deleteLibraryItems(ids); // calls renderDrawer + scheduleSave
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
  // The Space bar only applies to the History tab, and is hidden while multi-selecting.
  els.spaceBar.hidden = drawerTab !== 'history' || librarySelectMode;
  if (drawerTab !== 'history' || librarySelectMode) {
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

// ---- Bookmarks ----
// A stable key per entry so toggling/lookup is reliable (site → URL, page → query).
function entryBookmarkKey(entry) {
  if (!entry) return null;
  if (entry.kind === 'navigate') return 'site:' + (entry.url || '');
  if (entry.kind === 'page') return 'page:' + (entry.query || entry.title || '');
  return null;
}
function updateBookmarkStar() {
  if (!els.bookmarkBtn) return;
  const entry = currentEntry(activeTab());
  const key = entryBookmarkKey(entry);
  const on = !!key && bookmarks.some((b) => b.key === key);
  els.bookmarkBtn.disabled = !key;
  els.bookmarkBtn.textContent = on ? '★' : '☆';
  els.bookmarkBtn.classList.toggle('on', on);
  els.bookmarkBtn.title = !key ? 'Bookmark' : on ? 'Remove bookmark' : 'Bookmark this page';
}
function toggleBookmark() {
  const tab = activeTab();
  const entry = currentEntry(tab);
  const key = entryBookmarkKey(entry);
  if (!key) return;
  const idx = bookmarks.findIndex((b) => b.key === key);
  if (idx >= 0) { bookmarks.splice(idx, 1); addBookmarkTombstone(key); toast('Bookmark removed.'); }
  else {
    clearBookmarkTombstone(key); // re-adding overrides any prior delete
    const bm = entry.kind === 'navigate'
      ? { id: uid(), key, kind: 'site', url: entry.url, title: tab.title || hostOf(entry.url) || entry.url, at: Date.now() }
      : {
          id: uid(), key, kind: 'page',
          query: entry.query || '',
          title: entry.title || tab.title || 'Saved page',
          at: Date.now(),
          // Snapshot the whole tab (conversation + history + page tree) so reopening
          // restores the full session like History does — not a recompose-from-query.
          tab: {
            title: tab.title,
            conversation: (tab.conversation || []).map((m) => ({ ...m })),
            history: (tab.history || []).map((h) => ({ ...h })),
            pages: (tab.pages || []).map((p) => ({ ...p })),
            currentId: tab.currentId,
          },
        };
    bookmarks.unshift(bm);
    toast('Bookmarked.');
  }
  updateBookmarkStar();
  if (els.libraryDrawer.classList.contains('open') && drawerTab === 'bookmarks') renderDrawer();
  scheduleSave();
}
// Rebuild a full tab from a bookmark/snapshot, remapping page ids so the restored
// copy never collides with the still-open original tab.
function restoreTabSnapshot(snap) {
  const srcPages = Array.isArray(snap.pages) ? snap.pages : [];
  const idMap = new Map();
  for (const p of srcPages) if (p && p.id) idMap.set(p.id, uid());
  const pages = srcPages.map((p) => ({
    ...p,
    id: idMap.get(p.id) || uid(),
    parentId: p.parentId != null ? (idMap.get(p.parentId) || null) : null,
  }));
  const currentId = idMap.get(snap.currentId) || (pages.length ? pages[pages.length - 1].id : null);
  const tab = {
    id: uid(),
    title: snap.title || 'Saved page',
    conversation: (snap.conversation || []).map((m) => ({ ...m })),
    history: (snap.history || []).map((h) => ({ ...h })),
    pages,
    currentId,
    pinned: false,
  };
  tabs.push(tab);
  activeId = tab.id;
  renderTabs();
  renderConversation();
  renderCurrentPage();
  refreshComposer();
  scheduleSave();
}

function openBookmark(b) {
  closeDrawer();
  if (b.kind === 'site' && b.url) { openUrlInTab(b.url); return; }
  // New bookmarks carry a full tab snapshot; restore the whole session.
  if (b.tab && Array.isArray(b.tab.pages) && b.tab.pages.length) { restoreTabSnapshot(b.tab); return; }
  // Legacy lightweight bookmarks ({query,title}) — recompose from the query.
  if (b.query) { newTab(true); submitQuery(b.query); return; }
  toast('This bookmark can’t be opened.');
}
function removeBookmark(id) {
  const gone = bookmarks.find((b) => b.id === id);
  bookmarks = bookmarks.filter((b) => b.id !== id);
  if (gone && gone.key) addBookmarkTombstone(gone.key);
  updateBookmarkStar();
  renderDrawer();
  scheduleSave();
}

// Record/clear a deletion tombstone so removes survive the cross-machine
// union-merge (and a later re-add cancels the tombstone).
function addBookmarkTombstone(key) {
  if (!key) return;
  bookmarkTombstones = bookmarkTombstones.filter((t) => t.key !== key);
  bookmarkTombstones.unshift({ key, at: Date.now() });
  if (bookmarkTombstones.length > MAX_BOOKMARK_TOMBSTONES) bookmarkTombstones.length = MAX_BOOKMARK_TOMBSTONES;
}
function clearBookmarkTombstone(key) {
  if (!key) return;
  bookmarkTombstones = bookmarkTombstones.filter((t) => t.key !== key);
}

function removeSite(id) {
  siteHistory = siteHistory.filter((s) => s.id !== id);
  renderDrawer();
  scheduleSave();
}
function clearSiteHistory() {
  if (!siteHistory.length) return;
  if (!confirm('Clear all browsing history?')) return;
  siteHistory = [];
  renderDrawer();
  scheduleSave();
}

function renderDrawer() {
  els.libTabHistory.classList.toggle('active', drawerTab === 'history');
  els.libTabTrash.classList.toggle('active', drawerTab === 'trash');
  if (els.libTabBookmarks) els.libTabBookmarks.classList.toggle('active', drawerTab === 'bookmarks');
  if (els.libTabSites) els.libTabSites.classList.toggle('active', drawerTab === 'sites');
  els.emptyTrash.hidden = drawerTab !== 'trash';
  if (els.clearSites) els.clearSites.hidden = drawerTab !== 'sites' || !siteHistory.length;
  // Select mode only applies to History; leaving History cancels it.
  if (drawerTab !== 'history' && librarySelectMode) { librarySelectMode = false; selectedLibraryIds.clear(); }
  renderSpaceBar();

  const items = drawerTab === 'history' ? spaceItems()
    : drawerTab === 'bookmarks' ? bookmarks
      : drawerTab === 'sites' ? siteHistory
        : library.trash;

  // Toggle + select-bar visibility (History only).
  if (els.libSelectToggle) els.libSelectToggle.hidden = drawerTab !== 'history' || librarySelectMode || !items.length;
  if (els.libSelectBar) els.libSelectBar.hidden = !(drawerTab === 'history' && librarySelectMode);
  if (librarySelectMode) {
    const allSel = items.length > 0 && items.every((it) => selectedLibraryIds.has(it.id));
    els.libSelectCount.textContent = `${selectedLibraryIds.size} selected`;
    els.libSelectDelete.disabled = selectedLibraryIds.size === 0;
    els.libSelectAll.textContent = allSel ? 'Select none' : 'Select all';
  }

  els.libraryList.innerHTML = '';

  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'lib-empty';
    empty.textContent = drawerTab === 'history'
      ? 'No pages in this Space yet. Compose some, then synthesize.'
      : drawerTab === 'bookmarks'
        ? 'No bookmarks yet. Click ☆ in the toolbar to save a page or site.'
        : drawerTab === 'sites'
          ? 'No browsing history yet. Open a website and it shows up here.'
          : 'Trash is empty.';
    els.libraryList.appendChild(empty);
    return;
  }

  const selecting = drawerTab === 'history' && librarySelectMode;
  for (const item of items) {
    const row = document.createElement('div');
    row.className = 'lib-row'
      + (selecting ? ' selecting' : '')
      + (selecting && selectedLibraryIds.has(item.id) ? ' sel' : '');

    if (selecting) {
      const cb = document.createElement('span');
      cb.className = 'lib-check';
      cb.textContent = selectedLibraryIds.has(item.id) ? '☑' : '☐';
      row.appendChild(cb);
    }

    const main = document.createElement('div');
    main.className = 'lib-main';
    const title = document.createElement('div');
    title.className = 'lib-title';
    title.textContent = drawerTab === 'bookmarks'
      ? `${item.kind === 'site' ? '🔗' : '📄'} ${item.title || item.url || 'Bookmark'}`
      : drawerTab === 'sites'
        ? `🌐 ${item.title || item.url}`
        : (item.title || item.query || 'Untitled page');
    const meta = document.createElement('div');
    meta.className = 'lib-meta';
    meta.textContent = drawerTab === 'bookmarks'
      ? (item.kind === 'site' ? item.url : 'Composed page')
      : drawerTab === 'sites'
        ? `${item.url} · ${relTime(item.at)}`
        : relTime(item.createdAt);
    main.appendChild(title);
    main.appendChild(meta);
    row.appendChild(main);

    const actions = document.createElement('div');
    actions.className = 'lib-actions';
    if (selecting) {
      // Whole row toggles selection; no per-row buttons.
      row.title = 'Toggle selection';
      row.addEventListener('click', () => toggleLibrarySelected(item.id));
    } else if (drawerTab === 'bookmarks') {
      main.title = 'Open';
      main.style.cursor = 'pointer';
      main.addEventListener('click', () => openBookmark(item));
      const del = document.createElement('button');
      del.className = 'lib-btn';
      del.textContent = 'Remove';
      del.addEventListener('click', () => removeBookmark(item.id));
      actions.appendChild(del);
    } else if (drawerTab === 'sites') {
      main.title = 'Open';
      main.style.cursor = 'pointer';
      main.addEventListener('click', () => { closeDrawer(); openUrlInTab(item.url); });
      const del = document.createElement('button');
      del.className = 'lib-btn';
      del.textContent = 'Remove';
      del.addEventListener('click', () => removeSite(item.id));
      actions.appendChild(del);
    } else if (drawerTab === 'history') {
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
  librarySelectMode = false;
  selectedLibraryIds.clear();
  els.libraryDrawer.classList.remove('open');
}

// ---- Settings ----
const AUTOFILL_FIELDS = ['fullName', 'email', 'phone', 'organization', 'address', 'city', 'postal', 'country'];

function applySettingsToUI() {
  for (const k of AUTOFILL_FIELDS) {
    const el = document.getElementById('af-' + k);
    if (el) el.value = (settings.autofill && settings.autofill[k]) || '';
  }
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
  if (els.remixDefaultSelect) els.remixDefaultSelect.value = settings.remixMinimized ? 'minimized' : 'expanded';
  if (els.sttEndpoint) els.sttEndpoint.value = settings.sttEndpoint || '';
  if (els.sttModel) els.sttModel.value = settings.sttModel || '';
  if (els.publishToken) els.publishToken.value = settings.publishToken || '';
  if (els.publishBase) els.publishBase.value = settings.publishBase || 'https://getchervil.com';
  if (els.cloudLivePrompt) els.cloudLivePrompt.checked = settings.cloudLivePrompt !== false;
  if (els.voiceAutosend) els.voiceAutosend.checked = !!settings.voiceAutosend;
  if (els.wakeToggle) els.wakeToggle.checked = !!settings.wakeEnabled;
  if (els.wakeKeyword) els.wakeKeyword.value = settings.wakeKeyword || 'hey_jarvis';
  if (els.wakeKeywordNote) els.wakeKeywordNote.textContent = (settings.wakeKeyword === 'custom' && settings.wakeKeywordLabel)
    ? `Loaded: ${settings.wakeKeywordLabel}` : 'No custom model loaded.';
  if (els.wakeThreshold) {
    const thr = typeof settings.wakeThreshold === 'number' ? settings.wakeThreshold : 0.6;
    els.wakeThreshold.value = String(thr);
    if (els.wakeThresholdVal) els.wakeThresholdVal.textContent = thr.toFixed(2);
  }
  if (els.sttKeyInput) els.sttKeyInput.value = '';
  if (els.heroToggle) els.heroToggle.checked = !!settings.heroImages;
  { const ps = document.getElementById('page-style-select'); if (ps) ps.value = settings.pageStyle || 'balanced'; }
  { const sf = document.getElementById('space-files-select'); if (sf) sf.value = settings.spaceFilesMode || 'synthesize'; }
  refreshSttKeyStatus();
  refreshImageKeyStatus();
  renderCredsPanel();
  renderMcpServers();
}

// ---- Credential vault UI (RFC 0008, Phase 8.1) ----
// A stateful panel: not-configured → set a master passphrase; configured+locked
// → unlock; unlocked → list/add/delete saved logins. Plaintext passwords stay in
// the main process; the renderer only holds one momentarily for "Reveal"/add.
function credsEl(tag, props = {}, children = []) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'type' && tag === 'input') el.type = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  for (const c of children) if (c) el.appendChild(c);
  return el;
}

// Generate a strong random password (crypto-strong; excludes ambiguous chars like
// l/I/O/0/1). Guarantees at least one lower/upper/digit/symbol, then shuffles.
function generatePassword(len = 20) {
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const symbols = '!@#$%^&*-_=+?';
  const all = lower + upper + digits + symbols;
  const rand = (n) => crypto.getRandomValues(new Uint32Array(1))[0] % n;
  const pick = (set) => set[rand(set.length)];
  const out = [pick(lower), pick(upper), pick(digits), pick(symbols)];
  for (let i = out.length; i < Math.max(8, len); i++) out.push(pick(all));
  for (let i = out.length - 1; i > 0; i--) { const j = rand(i + 1); [out[i], out[j]] = [out[j], out[i]]; }
  return out.join('');
}

async function renderCredsPanel() {
  const panel = els.credsPanel;
  if (!panel || !window.chervil.creds) return;
  panel.innerHTML = '';
  let st;
  try { st = await window.chervil.creds.status(); } catch { st = null; }
  if (!st || !st.ok) { panel.appendChild(credsEl('p', { class: 'field-note warn', text: 'Password storage is unavailable in this build.' })); return; }

  if (!st.encryptionAvailable) {
    panel.appendChild(credsEl('p', { class: 'field-note warn', text: 'Your OS has no encryption backend available, so passwords can’t be stored securely here. Password autofill is disabled.' }));
    return;
  }

  // 1) First-time setup — choose a master passphrase.
  if (!st.configured) {
    const input = credsEl('input', { type: 'password', class: 'mcp-field', placeholder: 'Create a master passphrase (min 8 chars)', autocomplete: 'new-password' });
    const note = credsEl('small', { class: 'field-note' });
    const submit = async () => {
      const r = await window.chervil.creds.setup(input.value);
      if (r && r.ok) { toast('Password vault created.'); renderCredsPanel(); }
      else { note.textContent = (r && r.error) || 'Couldn’t create the vault.'; note.className = 'field-note warn'; }
    };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    panel.appendChild(credsEl('p', { class: 'group-hint', text: 'Set a master passphrase to protect your saved logins. You’ll enter it once per session to unlock them. It can’t be recovered if forgotten — there’s no backdoor.' }));
    panel.appendChild(credsEl('div', { class: 'mcp-add' }, [input, credsEl('button', { class: 'lib-btn primary', text: 'Create vault', onclick: submit })]));
    panel.appendChild(note);
    return;
  }

  // 2) Locked — unlock with the passphrase.
  if (!st.unlocked) {
    const input = credsEl('input', { type: 'password', class: 'mcp-field', placeholder: 'Master passphrase', autocomplete: 'current-password' });
    const note = credsEl('small', { class: 'field-note' });
    const submit = async () => {
      const r = await window.chervil.creds.unlock(input.value);
      if (r && r.ok) { toast('Passwords unlocked.'); renderCredsPanel(); }
      else { note.textContent = (r && r.error) || 'Wrong passphrase.'; note.className = 'field-note warn'; input.select(); }
    };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    panel.appendChild(credsEl('p', { class: 'group-hint', text: 'Enter your master passphrase to view and manage saved logins.' }));
    panel.appendChild(credsEl('div', { class: 'mcp-add' }, [input, credsEl('button', { class: 'lib-btn primary', text: 'Unlock', onclick: submit })]));
    panel.appendChild(note);
    panel.appendChild(credsAutoLockRow());
    return;
  }

  // 3) Unlocked — manage entries.
  const lockBtn = credsEl('button', { class: 'lib-btn', text: '🔒 Lock', title: 'Lock the vault now', onclick: async () => { await window.chervil.creds.lock(); toast('Passwords locked.'); renderCredsPanel(); } });
  panel.appendChild(credsEl('div', { class: 'creds-toolbar' }, [credsEl('span', { class: 'field-note ok', text: 'Unlocked for this session.' }), lockBtn]));

  // Add-new form.
  const oInput = credsEl('input', { type: 'text', class: 'mcp-field', placeholder: 'Site (e.g. github.com)', spellcheck: 'false' });
  const uInput = credsEl('input', { type: 'text', class: 'mcp-field', placeholder: 'Username / email', spellcheck: 'false', autocomplete: 'off' });
  const pInput = credsEl('input', { type: 'password', class: 'mcp-field', placeholder: 'Password', autocomplete: 'new-password' });
  const genBtn = credsEl('button', { class: 'lib-btn', title: 'Generate a strong password', text: '🎲 Generate', onclick: () => {
    pInput.value = generatePassword(20);
    pInput.type = 'text'; // reveal what was generated so the user can see/copy it
  } });
  const addNote = credsEl('small', { class: 'field-note' });
  const addBtn = credsEl('button', { class: 'lib-btn primary', text: 'Save login', onclick: async () => {
    if (!oInput.value.trim() || !pInput.value) { addNote.textContent = 'Site and password are required.'; addNote.className = 'field-note warn'; return; }
    const r = await window.chervil.creds.save({ origin: oInput.value.trim(), username: uInput.value.trim(), password: pInput.value });
    if (r && r.ok) { oInput.value = uInput.value = pInput.value = ''; pInput.type = 'password'; addNote.textContent = ''; toast('Login saved.'); renderCredsList(listWrap); }
    else { addNote.textContent = (r && r.error) || 'Couldn’t save.'; addNote.className = 'field-note warn'; }
  } });
  panel.appendChild(credsEl('div', { class: 'mcp-add creds-add' }, [oInput, uInput, pInput, genBtn, addBtn]));
  panel.appendChild(addNote);

  const listWrap = credsEl('div', { class: 'creds-list' });
  panel.appendChild(listWrap);
  renderCredsList(listWrap);
  panel.appendChild(credsAutoLockRow());
}

async function renderCredsList(wrap) {
  wrap.innerHTML = '';
  let items = [];
  try { const r = await window.chervil.creds.list(); items = (r && r.ok && r.items) || []; } catch { /* ignore */ }
  if (!items.length) { wrap.appendChild(credsEl('div', { class: 'lib-empty', text: 'No saved logins yet.' })); return; }
  items.sort((a, b) => (a.origin || '').localeCompare(b.origin || ''));
  for (const it of items) {
    const meta = credsEl('div', { class: 'creds-meta' }, [
      credsEl('div', { class: 'creds-origin', text: it.origin }),
      credsEl('div', { class: 'creds-user', text: it.username || '(no username)' }),
    ]);
    const revealBtn = credsEl('button', { class: 'lib-btn', text: '👁 Reveal', onclick: async (e) => {
      const r = await window.chervil.creds.reveal(it.id);
      if (r && r.ok) {
        const shown = e.target.dataset.shown === '1';
        if (shown) { e.target.textContent = '👁 Reveal'; e.target.dataset.shown = '0'; meta.querySelector('.creds-pass')?.remove(); }
        else { e.target.textContent = '🙈 Hide'; e.target.dataset.shown = '1'; meta.appendChild(credsEl('div', { class: 'creds-pass', text: r.password })); }
      } else { toast((r && r.error) || 'Couldn’t reveal.'); }
    } });
    const delBtn = credsEl('button', { class: 'lib-btn danger', text: 'Delete', onclick: async () => {
      if (!confirm(`Delete the saved login for ${it.origin}?`)) return;
      const r = await window.chervil.creds.remove(it.id);
      if (r && r.ok) { toast('Login deleted.'); renderCredsList(wrap); } else { toast('Couldn’t delete.'); }
    } });
    wrap.appendChild(credsEl('div', { class: 'creds-row' }, [meta, credsEl('div', { class: 'creds-actions' }, [revealBtn, delBtn])]));
  }
}

// Reflect whether an image-capable key (OpenAI/Gemini) is configured.
async function refreshImageKeyStatus() {
  if (!els.heroNote || !window.chervil.imageKeyStatus) return;
  try {
    const st = await window.chervil.imageKeyStatus();
    if (st && st.hasKey) {
      const which = st.openai ? 'OpenAI' : st.gemini ? 'Gemini' : 'Grok';
      els.heroNote.textContent = `Using your ${which} key. Each page generates one image (billed to your key).`;
      els.heroNote.className = 'field-note ok';
    } else {
      els.heroNote.textContent = 'No image key found. Add an OpenAI, Gemini, or Grok key under the provider settings above to enable this.';
      els.heroNote.className = 'field-note warn';
    }
  } catch { /* ignore */ }
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
function enabledMcpServers(agentOverride) {
  if (settings.provider !== 'claude') return [];
  let servers = (settings.mcpServers || []).filter((s) => s && s.enabled && s.url && s.url.trim());
  // An active agent can restrict which MCP servers it's allowed to use.
  const ag = agentOverride || activeAgent();
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

// Settings topic tabs: show only the sections for the active group.
function setSettingsTab(group) {
  const modal = els.settingsModal;
  modal.querySelectorAll('.settings-tab').forEach((b) => b.classList.toggle('active', b.dataset.sgroup === group));
  modal.querySelectorAll('[data-sgroup]').forEach((el) => {
    if (el.classList.contains('settings-tab')) return; // the tab buttons themselves
    el.style.display = el.dataset.sgroup === group ? '' : 'none';
  });
}

// ---- Customizable top-bar buttons ----
// The optional omnibar action buttons. Settings (⚙) and core nav (sidebar, back,
// forward, omnibox) are always shown. A button is hidden when settings.toolbar[key]
// === false (missing = shown).
const TOOLBAR_BUTTONS = [
  { key: 'map', id: 'map-btn', label: 'Map' },
  { key: 'history', id: 'history-btn', label: 'History' },
  { key: 'schedules', id: 'sched-btn', label: 'Schedules' },
  { key: 'agents', id: 'agents-btn', label: 'Agents' },
  { key: 'bookmark', id: 'bookmark-btn', label: 'Bookmark (★)' },
  { key: 'save', id: 'save-btn', label: 'Save' },
];

function toolbarVisible(key) { return !settings.toolbar || settings.toolbar[key] !== false; }

function applyToolbar() {
  for (const b of TOOLBAR_BUTTONS) {
    const el = document.getElementById(b.id);
    if (el) el.classList.toggle('btn-off', !toolbarVisible(b.key));
  }
}

function setToolbarVisible(key, visible) {
  if (!settings.toolbar) settings.toolbar = {};
  if (visible) delete settings.toolbar[key];
  else settings.toolbar[key] = false;
  applyToolbar();
  scheduleSave();
}

// Settings panel: a checkbox per optional button.
function renderToolbarPrefs() {
  const box = document.getElementById('toolbar-prefs');
  if (!box) return;
  box.innerHTML = '';
  for (const b of TOOLBAR_BUTTONS) {
    const label = document.createElement('label'); label.className = 'toggle-row';
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = toolbarVisible(b.key);
    cb.addEventListener('change', () => setToolbarVisible(b.key, cb.checked));
    const span = document.createElement('span'); span.textContent = b.label;
    label.appendChild(cb); label.appendChild(span);
    box.appendChild(label);
  }
}

// Right-click the top bar → a quick show/hide menu for the same buttons.
let toolbarMenuEl = null;
function closeToolbarMenu() {
  if (!toolbarMenuEl) return;
  toolbarMenuEl.remove();
  toolbarMenuEl = null;
  document.removeEventListener('mousedown', onToolbarMenuOutside, true);
  document.removeEventListener('keydown', onToolbarMenuEsc, true);
}
function onToolbarMenuOutside(e) { if (toolbarMenuEl && !toolbarMenuEl.contains(e.target)) closeToolbarMenu(); }
function onToolbarMenuEsc(e) { if (e.key === 'Escape') closeToolbarMenu(); }
function showToolbarMenu(x, y) {
  closeToolbarMenu();
  const menu = document.createElement('div'); menu.className = 'toolbar-menu';
  const head = document.createElement('div'); head.className = 'toolbar-menu-head'; head.textContent = 'Show on toolbar';
  menu.appendChild(head);
  for (const b of TOOLBAR_BUTTONS) {
    const on = toolbarVisible(b.key);
    const row = document.createElement('button'); row.className = 'toolbar-menu-row';
    const check = document.createElement('span'); check.className = 'tm-check'; check.textContent = on ? '✓' : '';
    const lbl = document.createElement('span'); lbl.textContent = b.label;
    row.appendChild(check); row.appendChild(lbl);
    row.addEventListener('click', () => { setToolbarVisible(b.key, !on); renderToolbarPrefs(); closeToolbarMenu(); });
    menu.appendChild(row);
  }
  document.body.appendChild(menu);
  menu.style.left = Math.min(x, window.innerWidth - menu.offsetWidth - 8) + 'px';
  menu.style.top = Math.min(y, window.innerHeight - menu.offsetHeight - 8) + 'px';
  setTimeout(() => {
    document.addEventListener('mousedown', onToolbarMenuOutside, true);
    document.addEventListener('keydown', onToolbarMenuEsc, true);
  }, 0);
}

function openSettings() {
  applySettingsToUI();
  renderToolbarPrefs();
  renderSyncFolder();
  renderAccountBox();
  setSettingsTab('general');
  els.settingsModal.classList.add('open');
}

// Settings → You: show the user's Chervil account (Pro/free) with links to /me
// and their public profile, or a sign-in / Pro upsell. Account status comes from
// getchervil.com (publish-token auth) via the main process (renderer CSP blocks it).
async function renderAccountBox() {
  const box = els.accountBox;
  if (!box) return;
  const base = (settings.publishBase || 'https://getchervil.com').replace(/\/+$/, '');
  const linkBtn = (label, url, primary) => {
    const b = document.createElement('button');
    b.className = 'lib-btn' + (primary ? ' primary' : '');
    b.textContent = label;
    b.addEventListener('click', () => { if (window.chervil.openExternal) window.chervil.openExternal(url); });
    return b;
  };
  const hint = (text) => {
    const p = document.createElement('p');
    p.className = 'group-hint';
    p.style.margin = '0';
    p.textContent = text;
    return p;
  };

  box.innerHTML = '';
  if (!settings.publishToken) {
    box.appendChild(hint('Create a free account at getchervil.com, then add your publish token under Publishing & Sync to connect — publish your pages, get a public profile, and unlock Chervil Pro.'));
    const acts = document.createElement('div');
    acts.className = 'account-actions';
    acts.appendChild(linkBtn('Create an account →', base + '/me', true));
    acts.appendChild(linkBtn('About Chervil Pro', base + '/pro'));
    box.appendChild(acts);
    return;
  }

  box.appendChild(hint('Checking your account…'));
  let res = null;
  try { res = window.chervil.accountStatus ? await window.chervil.accountStatus({ token: settings.publishToken, baseUrl: base }) : null; } catch { /* ignore */ }
  if (!els.settingsModal.classList.contains('open')) return; // closed while we waited
  box.innerHTML = '';

  if (!res || !res.ok) {
    box.appendChild(hint(res && res.error ? `Couldn't verify your account (${res.error}).` : 'Couldn’t reach getchervil.com to check your account.'));
    const acts = document.createElement('div');
    acts.className = 'account-actions';
    acts.appendChild(linkBtn('Open your account →', base + '/me', true));
    box.appendChild(acts);
    return;
  }

  const plan = document.createElement('div');
  plan.className = 'account-plan';
  const pill = document.createElement('span');
  pill.className = 'pill ' + (res.pro ? 'pro' : 'free');
  pill.textContent = res.pro ? 'Pro' : 'Free';
  const planLabel = document.createElement('span');
  planLabel.textContent = res.pro ? 'Chervil Pro' : 'Chervil Free';
  plan.appendChild(pill);
  plan.appendChild(planLabel);
  box.appendChild(plan);

  box.appendChild(hint(res.pro
    ? 'Thanks for supporting Chervil. Manage your account and everything you’ve published on the web.'
    : 'You’re on the free plan. Chervil Pro adds hosted publishing — shareable links, a public profile, and analytics.'));

  const acts = document.createElement('div');
  acts.className = 'account-actions';
  acts.appendChild(linkBtn('Open your account →', base + '/me', true));
  if (res.username) acts.appendChild(linkBtn('View public profile', base + '/profile/' + encodeURIComponent(res.username)));
  if (!res.pro) acts.appendChild(linkBtn('Get Chervil Pro', base + '/pro'));
  box.appendChild(acts);
}

function closeSettings() {
  els.settingsModal.classList.remove('open');
}

// ---- Sync folder (#1: free folder-sync on-ramp) ----
async function renderSyncFolder() {
  if (!els.syncFolder || !window.chervil.getSyncFolder) return;
  try {
    const res = await window.chervil.getSyncFolder();
    const folder = res && res.ok ? res.folder : null;
    if (folder) {
      els.syncFolder.value = folder;
      els.syncStatus.textContent = 'Syncing here. Set the same folder on your other computers.';
      if (els.syncClear) els.syncClear.hidden = false;
    } else {
      els.syncFolder.value = '';
      els.syncStatus.textContent = 'Your data is stored locally on this computer.';
      if (els.syncClear) els.syncClear.hidden = true;
    }
  } catch { /* ignore */ }
}

async function chooseSyncFolder() {
  if (!window.chervil.setSyncFolder) { toast('Sync isn’t available in this build.'); return; }
  const res = await window.chervil.setSyncFolder();
  if (!res || res.canceled) return;
  if (!res.ok) { toast(`Couldn’t set sync folder: ${res.error || 'unknown error'}`); return; }
  await renderSyncFolder();
  if (res.adopted) {
    // That folder already holds synced Chervil data — reload to load it (re-runs
    // init → loadState from the now-synced path), replacing this machine's session.
    if (confirm('That folder already has synced Chervil data. Load it now? Your current tabs on this computer will be replaced by the synced session.')) {
      location.reload();
    }
  } else {
    toast('Syncing to that folder. Set the same folder on your other computers.');
  }
}

async function clearSyncFolder() {
  if (!window.chervil.clearSyncFolder) return;
  if (!confirm('Stop syncing? Your data stays on this computer (copied back locally).')) return;
  const res = await window.chervil.clearSyncFolder();
  if (res && res.ok) { await renderSyncFolder(); toast('Stopped syncing — your data is local again.'); }
  else toast(`Couldn’t stop syncing: ${(res && res.error) || 'unknown error'}`);
}

// ---- Persistence ----
// Tracks the synced state file's last-known mtime so we can tell when ANOTHER
// computer updated the shared folder-synced session (RFC 0005, decision 3).
let lastStateMtimeMs = 0;
let syncConflictPrompting = false;

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    window.chervil.saveState({ tabs, activeId, settings, library, bookmarks, bookmarkTombstones, siteHistory, agentAudit, spaces, activeSpaceId, living, schedules, agents, activeAgentId, pipelines, pageStores })
      .then((r) => { if (r && r.mtimeMs) lastStateMtimeMs = r.mtimeMs; }) // our own write — keep baseline current
      .catch(() => {});
  }, 500);
}

async function refreshStateMtime() {
  try { const r = await window.chervil.stateInfo(); if (r && r.ok) lastStateMtimeMs = r.mtimeMs || 0; } catch { /* ignore */ }
}

// Absorb any sync-service conflict copies (OneDrive/Drive/Dropbox forks), then
// adopt the merged-in additive collections — bookmarks, history, spaces, agents —
// into memory WITHOUT touching the current tab/session. This is what makes a
// bookmark added on another computer appear here without a reload.
async function reconcileNow() {
  if (!window.chervil.reconcileState || saveTimer) return;  // don't fight a pending save
  let r;
  try { r = await window.chervil.reconcileState(); } catch { return; }
  if (!r || !r.ok || !r.changed || !r.state) return;
  const m = r.state;
  if (Array.isArray(m.bookmarks)) bookmarks = m.bookmarks;
  if (Array.isArray(m.bookmarkTombstones)) bookmarkTombstones = m.bookmarkTombstones;
  if (Array.isArray(m.siteHistory)) siteHistory = m.siteHistory;
  if (m.library && Array.isArray(m.library.history)) {
    library = { history: m.library.history, trash: Array.isArray(m.library.trash) ? m.library.trash : [] };
  }
  if (Array.isArray(m.spaces) && m.spaces.length) {
    spaces = m.spaces;
    if (!spaces.find((s) => s.id === activeSpaceId)) activeSpaceId = spaces[0].id;
  }
  if (Array.isArray(m.agents)) agents = m.agents;
  if (r.mtimeMs) lastStateMtimeMs = r.mtimeMs;               // we just absorbed it — don't also prompt to reload
  updateBookmarkStar();
  if (els.libraryDrawer.classList.contains('open')) renderDrawer();
  toast('Synced new items from another computer.');
}

// On focus/visibility, if the synced state file is newer than our baseline (and we
// have no pending write of our own), another machine updated it — offer to reload.
async function checkSyncConflict() {
  if (syncConflictPrompting || saveTimer) return;          // don't fight our own pending save
  if (!window.chervil.stateInfo) return;
  let r;
  try { r = await window.chervil.stateInfo(); } catch { return; }
  if (!r || !r.ok || !r.synced || !r.mtimeMs) return;       // local-only sessions never prompt
  if (r.mtimeMs > lastStateMtimeMs + 1500) {                // 1.5s epsilon vs filesystem jitter
    syncConflictPrompting = true;
    const reload = confirm('Your Chervil session was updated on another computer (synced folder). Reload to load the latest? Unsaved changes on this computer will be replaced.');
    if (reload) { location.reload(); return; }
    lastStateMtimeMs = r.mtimeMs;                            // declined — don't nag again for this version
    syncConflictPrompting = false;
  }
}

function sanitizeTab(t) {
  const pages = Array.isArray(t.pages) ? t.pages : [];
  // Migrate older linear histories: give every node an id and link it to the previous
  // one as its parent (a straight chain), preserving back/forward order.
  let prevId = null;
  for (const p of pages) {
    if (!p.id) p.id = uid();
    if (p.parentId === undefined) p.parentId = prevId;
    // If the app closed while a hero image was still generating, drop the stale
    // loading placeholder so the page doesn't show a frozen skeleton.
    if (p.heroPending && p.html) { p.html = stripHeroBlock(p.html); delete p.heroPending; }
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
    pinned: !!t.pinned,
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
    // xAI retired the grok-2/grok-3 families (and the early grok-4 *-fast aliases),
    // redirecting them to grok-4.3; the dead aliases also don't honor Live Search.
    // Migrate a saved stale model to the current default so web grounding works.
    if (settings.grokModel && /^grok-(2|3|beta|code-fast|4-fast|4-1-fast|4-0709)/.test(settings.grokModel)) {
      settings.grokModel = 'grok-4.3';
    }
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
  if (restored && Array.isArray(restored.bookmarks)) bookmarks = restored.bookmarks;
  if (restored && Array.isArray(restored.bookmarkTombstones)) bookmarkTombstones = restored.bookmarkTombstones;
  if (restored && Array.isArray(restored.siteHistory)) siteHistory = restored.siteHistory;
  if (restored && Array.isArray(restored.agentAudit)) agentAudit = restored.agentAudit;

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
  if (restored && restored.pageStores && typeof restored.pageStores === 'object') pageStores = restored.pageStores;
  if (restored && Array.isArray(restored.pipelines)) {
    // Keep only valid pipelines whose stages still reference existing agents.
    pipelines = restored.pipelines
      .filter((p) => p && p.id && Array.isArray(p.stageAgentIds))
      .map((p) => ({ ...p, stageAgentIds: p.stageAgentIds.filter((id) => agents.find((a) => a.id === id)) }))
      .filter((p) => p.stageAgentIds.length >= 2);
  }
  updateAgentChip();
  startScheduler();

  applyTabLayout();
  applySidebarCollapsed();
  applyToolbar(); // honor the user's chosen top-bar buttons
  setChatMode(settings.chatMode); // reflect the persisted "Just a chatbot" toggle
  renderTabs();
  renderConversation();
  renderCurrentPage();
  refreshComposer();
  els.prompt.focus();

  // Resume "Hey Sprig" listening if it was on last session.
  if (settings.wakeEnabled) startWake();

  // Baseline for folder-sync conflict detection (RFC 0005, decision 3).
  refreshStateMtime();
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

async function exportCurrentGif() {
  const tab = activeTab();
  const entry = currentEntry(tab);
  if (!entry || entry.kind !== 'page') return;
  toast('Recording animated GIF (~3s)…');
  const res = await window.chervil.exportGif({ html: entry.html, suggestedName: entry.title });
  if (res && res.ok) addMessage(tab, 'bot', `Exported animated GIF to ${res.path}`);
  else if (res && !res.canceled) addMessage(tab, 'bot', `Couldn't export GIF: ${res.error || 'unknown error'}`, 'error');
}

// Share the current composed page as a portable .chervil file — its html, the
// originating query, and sources — so anyone can import it into their own Chervil
// to view and remix (RFC: shareable pages). Privacy: only the page itself travels,
// not the tab's chat transcript.
// The portable .chervil document for a composed page entry (shared by file export
// and the "Open in Chervil" affordance baked into published pages).
function chervilPageDoc(entry, tab) {
  return {
    format: 'chervil-page',
    version: 1,
    exportedAt: Date.now(),
    app: 'Chervil',
    page: {
      title: entry.title || (tab && tab.title) || 'Chervil page',
      query: entry.query || '',
      html: entry.html,
      sources: Array.isArray(entry.sources) ? entry.sources : [],
    },
  };
}

// Bake the page's portable source + an unobtrusive "Open in Chervil" button into
// published HTML, so another Chervil user can pull it into their own instance and
// remix it. The button deep-links chervil://import?u=<this page's URL>; Chervil
// fetches the page and reads the embedded <script id="chervil-source">.
function withChervilEditButton(html, doc) {
  const json = JSON.stringify(doc).replace(/</g, '\\u003c');
  const inject =
    `\n<script id="chervil-source" type="application/json">${json}</script>\n` +
    `<div id="chervil-cta" style="position:fixed;right:16px;bottom:16px;z-index:2147483647;` +
    `display:flex;flex-direction:column;align-items:flex-end;gap:8px;font:13px system-ui,Segoe UI,sans-serif">` +
    `<span id="chervil-getit" style="display:none;background:#11141c;color:#e7eaf2;border:1px solid #232838;` +
    `border-radius:10px;padding:8px 12px;box-shadow:0 6px 20px rgba(0,0,0,.35);max-width:240px">` +
    `Not using Chervil? <a href="https://getchervil.com" target="_blank" rel="noopener" ` +
    `style="color:#6c8cff;font-weight:600;text-decoration:none">Get it to import this page →</a></span>` +
    `<a id="chervil-open" href="#" title="Open this page in Chervil to remix it" ` +
    `style="display:inline-flex;align-items:center;gap:7px;padding:9px 14px;border-radius:999px;` +
    `background:#6c8cff;color:#fff;font-weight:600;text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,.35)">` +
    `✦ Open in Chervil</a></div>\n` +
    // Try the chervil:// deep link; if the app doesn't take focus within ~1.5s it
    // isn't installed, so reveal the "Get Chervil" prompt.
    `<script>(function(){var b=document.getElementById('chervil-open'),n=document.getElementById('chervil-getit');if(!b)return;` +
    `b.addEventListener('click',function(e){e.preventDefault();var left=false;` +
    `function go(){left=true;}` +
    `window.addEventListener('blur',go);document.addEventListener('visibilitychange',go);window.addEventListener('pagehide',go);` +
    `try{window.location.href='chervil://import?u='+encodeURIComponent(window.location.href);}catch(_){}` +
    `setTimeout(function(){window.removeEventListener('blur',go);document.removeEventListener('visibilitychange',go);window.removeEventListener('pagehide',go);` +
    `if(!left&&n)n.style.display='block';},1500);});})();</script>\n`;
  return /<\/body>/i.test(html) ? html.replace(/<\/body>/i, inject + '</body>') : html + inject;
}

async function exportCurrentSharePage() {
  const tab = activeTab();
  const entry = currentEntry(tab);
  if (!entry || entry.kind !== 'page' || !entry.html) { toast('Open a composed page first, then share it.'); return; }
  if (!window.chervil.savePageFile) { toast('Sharing isn’t available in this build.'); return; }
  const doc = chervilPageDoc(entry, tab);
  const safe = (doc.page.title || 'chervil-page').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'chervil-page';
  const res = await window.chervil.savePageFile({ json: JSON.stringify(doc, null, 2), suggestedName: safe });
  if (res && res.ok) addMessage(tab, 'bot', `Shared this page to ${res.path} — send the .chervil file to anyone; they can import it into Chervil to view and remix.`);
  else if (res && !res.canceled) addMessage(tab, 'bot', `Couldn't share page: ${res.error || 'unknown error'}`, 'error');
}

// Open a portable page doc into a fresh tab the recipient can view and remix.
// Shared by file import and the chervil://import deep link from a published page.
function importPageDoc(doc) {
  const page = doc && doc.page;
  if (!doc || doc.format !== 'chervil-page' || !page || !page.html) { toast('That isn’t a shareable Chervil page.'); return false; }
  const pid = uid();
  closeDrawer();
  restoreTabSnapshot({
    title: page.title || 'Shared page',
    conversation: [{ role: 'bot', text: `Imported a shared page: “${page.title || 'Untitled'}”. Ask Sprig to change or extend it, or use the Remix bar.`, cls: '' }],
    history: [],
    pages: [{ id: pid, parentId: null, kind: 'page', html: page.html, title: page.title || 'Shared page', sources: Array.isArray(page.sources) ? page.sources : [], query: page.query || '' }],
    currentId: pid,
  });
  toast(`Imported “${page.title || 'shared page'}”.`);
  return true;
}

// Import a shared .chervil file the user picks from disk.
async function importPageFile() {
  if (!window.chervil.openPageFile) { toast('Import isn’t available in this build.'); return; }
  const res = await window.chervil.openPageFile();
  if (!res || !res.ok) { if (res && res.error) toast(`Import failed: ${res.error}`); return; }
  let doc;
  try { doc = JSON.parse(res.text); } catch { toast('That file isn’t a valid Chervil page.'); return; }
  importPageDoc(doc);
}

// The remix-bar "⤓ Export…" dropdown routes to the chosen format, then resets.
function onExportSelect(e) {
  const v = e.target.value;
  e.target.value = '';
  if (v === 'share') exportCurrentSharePage();
  else if (v === 'pdf') exportCurrentPdf();
  else if (v === 'png') exportCurrentImage('png');
  else if (v === 'jpg') exportCurrentImage('jpg');
  else if (v === 'gif') exportCurrentGif();
  else if (v === 'pptx') exportCurrentPptx();
  else if (v === 'docx') exportCurrentDocx();
  else if (v === 'xlsx') exportCurrentXlsx();
  else if (v === 'lesson') exportCurrentLessonReader();
  else if (v === 'lesson-publish') publishCurrentToWeb();
}

// Publish the current page to the web. Lessons/quizzes use their richer reader
// render; any other interactive page publishes its self-contained HTML directly.
function publishCurrentToWeb() {
  const tab = activeTab();
  const entry = currentEntry(tab);
  if (!entry || entry.kind !== 'page') { toast('Open a page first, then publish it.'); return; }
  if (entry.artifact || entry.lesson) return publishCurrentLesson();
  // Plain composed page → let the user choose where it goes.
  const opts = [
    { label: '🌐 As a Page', primary: true, onClick: () => publishCurrentPage('page') },
    { label: '✍️ As a Blog post', onClick: () => publishCurrentPage('blog') },
  ];
  // Already published as a page → offer cloud auto-refresh settings.
  if (entry.publishedId) {
    opts.push({ label: entry.cloudLiveMs ? '☁ Cloud refresh: on — change…' : '☁ Keep it live in the cloud…', onClick: () => chooseCloudLive(entry) });
  }
  showActionSheet('Publish to web', 'How should this go out?', opts);
}

// Cloud living pages (RFC 0007 7.3): keep a PUBLISHED page current server-side on
// a schedule (Pro). Re-grounds the page's query in the cloud even when the app is
// closed. (The client-side "● Live" control only refreshes while Chervil is open.)
function cloudLiveOptions(entry) {
  const opts = [
    { label: 'Every hour', onClick: () => setCloudLive(entry, 3600000) },
    { label: 'Every 6 hours', onClick: () => setCloudLive(entry, 21600000) },
    { label: 'Once a day', onClick: () => setCloudLive(entry, 86400000) },
  ];
  if (entry.cloudLiveMs) opts.push({ label: 'Turn off cloud refresh', onClick: () => setCloudLive(entry, null) });
  return opts;
}

function chooseCloudLive(entry) {
  if (!entry.query) { toast('This page has no query to keep current.'); return; }
  showActionSheet('Cloud auto-refresh', 'Keep this published page current on a schedule — runs in the cloud even when Chervil is closed (Pro).', cloudLiveOptions(entry));
}

async function setCloudLive(entry, intervalMs) {
  if (!entry.publishedId) { toast('Publish the page first.'); return; }
  if (!window.chervil.setCloudLiving) { toast('Not available in this build.'); return; }
  const res = await window.chervil.setCloudLiving({
    pageId: entry.publishedId,
    query: entry.query || '',
    intervalMs: intervalMs || 0,
    enabled: !!intervalMs,
    token: settings.publishToken,
    baseUrl: settings.publishBase || 'https://getchervil.com',
  });
  if (res && res.ok) {
    entry.cloudLiveMs = intervalMs || 0;
    scheduleSave();
    toast(intervalMs ? 'Cloud auto-refresh is on for this page.' : 'Cloud auto-refresh turned off.');
  } else {
    const e = (res && res.error) || '';
    toast(/pro/i.test(e) ? 'Cloud living pages are a Chervil Pro feature.' : (e || 'Couldn’t update cloud refresh.'));
  }
}

// Publish any composed page (self-contained interactive HTML — clock, calculator,
// converter, etc.) to a shareable getchervil.com link (Chervil Pro). Model-dependent
// applets that call Sprig at runtime won't work when hosted.
async function publishCurrentPage(kind = 'page') {
  const tab = activeTab();
  const entry = currentEntry(tab);
  if (!entry || entry.kind !== 'page' || !entry.html) { toast('Open a page first, then publish it.'); return; }
  if (!settings.publishToken) { toast('Add a publish token in Settings → Publishing (from getchervil.com/me).'); return; }
  if (!window.chervil.publishPage) { toast('Publishing isn’t available in this build.'); return; }
  const noun = kind === 'blog' ? 'blog post' : 'page';
  toast(`Publishing ${noun}…`);
  try {
    const res = await window.chervil.publishPage({
      // Bake in an "Open in Chervil" affordance so other Chervil users can pull the
      // page into their own instance and remix it.
      html: withChervilEditButton(entry.html, chervilPageDoc(entry, tab)),
      title: entry.title || 'Chervil page',
      kind,
      sourceId: entry.id,   // stable id → re-publish updates in place + stable cloud-live target
      token: settings.publishToken,
      baseUrl: settings.publishBase || 'https://getchervil.com',
    });
    if (res && res.ok && res.url) {
      entry.publishedUrl = res.url;
      if (res.id) entry.publishedId = res.id;
      scheduleSave();
      addMessage(tab, 'bot', `${res.updated ? 'Updated' : 'Published'} your ${noun} — it’s live at ${res.url}`);
      try { await navigator.clipboard.writeText(res.url); toast('Published — link copied to clipboard.'); } catch { toast('Published.'); }
      // Pages (not blog posts) can be kept current in the cloud. Auto-offer it unless
      // the user turned the prompt off globally (Settings → Publishing) or already
      // dismissed it for this page — they can still enable it anytime from Publish ☁.
      if (kind === 'page' && entry.query && entry.publishedId && !entry.cloudLiveMs
          && settings.cloudLivePrompt !== false && !entry.cloudPromptSkipped) {
        showActionSheet(
          'Keep it live in the cloud?',
          'Auto-refresh this page on a schedule — runs in the cloud even when Chervil is closed (Pro). You can also turn this on anytime later from the ☁ option in Publish.',
          cloudLiveOptions(entry),
          () => { entry.cloudPromptSkipped = true; scheduleSave(); },  // dismissed → don't re-ask for this page on re-publish
          { checkbox: {
              label: 'Don’t offer this after publishing (manage in Settings → Publishing).',
              checked: false,
              onChange: (off) => {
                settings.cloudLivePrompt = !off;
                scheduleSave();
                if (els.cloudLivePrompt) els.cloudLivePrompt.checked = !off;
              },
            } }
        );
      }
    } else {
      addMessage(tab, 'bot', `Couldn’t publish: ${(res && res.error) || 'unknown error'}`, 'error');
    }
  } catch (e) {
    addMessage(tab, 'bot', `Publish error: ${(e && e.message) || e}`, 'error');
  }
}

// Publish the current lesson to a shareable getchervil.com link (Chervil Pro).
async function publishCurrentLesson() {
  const tab = activeTab();
  const entry = currentEntry(tab);
  const artifact = entry && (entry.artifact || entry.lesson);
  if (!artifact) { toast('Open a lesson or quiz first (🎓 / ❓), then publish it.'); return; }
  if (!settings.publishToken) { toast('Add a publish token in Settings → Publishing (from getchervil.com/me).'); return; }
  if (!window.chervil.publishLesson) { toast('Publishing isn’t available in this build.'); return; }
  toast('Publishing…');
  try {
    const res = await window.chervil.publishLesson({
      artifact,
      kind: entry.skill || 'learn',
      sourceId: entry.id,   // stable id → re-publishing updates the same hosted lesson (same URL)
      token: settings.publishToken,
      baseUrl: settings.publishBase || 'https://getchervil.com',
      config: providerConfig(),
    });
    if (res && res.ok && res.url) {
      entry.publishedUrl = res.url;
      if (res.id) entry.publishedId = res.id;
      scheduleSave();
      addMessage(tab, 'bot', `${res.updated ? 'Updated' : 'Published'} — it’s live at ${res.url}`);
      try { await navigator.clipboard.writeText(res.url); toast('Published — link copied to clipboard.'); } catch { toast('Published.'); }
    } else {
      addMessage(tab, 'bot', `Couldn’t publish: ${(res && res.error) || 'unknown error'}`, 'error');
    }
  } catch (e) {
    addMessage(tab, 'bot', `Publish error: ${(e && e.message) || e}`, 'error');
  }
}

// Export the current lesson as a standalone, swipeable mobile reader (.html).
async function exportCurrentLessonReader() {
  const tab = activeTab();
  const entry = currentEntry(tab);
  const artifact = entry && (entry.artifact || entry.lesson);
  if (!artifact) { toast('Open a lesson or quiz first (🎓 / ❓), then export it for mobile.'); return; }
  if (!window.chervil.exportLesson) { toast('Mobile export isn’t available in this build.'); return; }
  const res = await window.chervil.exportLesson({ artifact, kind: entry.skill || 'learn', suggestedName: entry.title, config: providerConfig() });
  if (res && res.ok) addMessage(tab, 'bot', `Saved to ${res.path} — open it on your phone.`);
  else if (res && !res.canceled) addMessage(tab, 'bot', `Couldn’t export: ${res.error || 'unknown error'}`, 'error');
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
  // While composing, the send button is a Stop button.
  if (els.send.classList.contains('stop')) { stopActiveCompose(); return; }
  handleComposerSubmit(els.prompt.value);
});

// Omnibox: focus selects all; Enter routes; Escape restores the canonical value.
els.pageTitle.addEventListener('focus', () => els.pageTitle.select());
els.pageTitle.addEventListener('blur', () => { els.pageTitle.value = omniboxCanonical; });
els.pageTitle.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); runOmnibox(els.pageTitle.value); }
  else if (e.key === 'Escape') { e.preventDefault(); els.pageTitle.value = omniboxCanonical; els.pageTitle.blur(); }
});

// Find in page (Ctrl+F) wiring.
if (els.findInput) {
  els.findInput.addEventListener('input', () => runFind(true));
  els.findInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); runFind(!e.shiftKey); }
    else if (e.key === 'Escape') { e.preventDefault(); closeFind(); }
  });
}
if (els.findNext) els.findNext.addEventListener('click', () => runFind(true));
if (els.findPrev) els.findPrev.addEventListener('click', () => runFind(false));
if (els.findClose) els.findClose.addEventListener('click', closeFind);
if (els.webview) els.webview.addEventListener('found-in-page', (e) => {
  const r = (e && e.result) || {};
  if (typeof r.matches === 'number') els.findCount.textContent = r.matches ? `${r.activeMatchOrdinal || 1}/${r.matches}` : 'No matches';
});

// Keep the omnibox, tab title, and back/forward in sync as the user browses
// inside an embedded real site (the webview's own navigation).
function onWebviewNavigated(url) {
  const tab = activeTab();
  const e = currentEntry(tab);
  if (!e || e.kind !== 'navigate') return;          // only while a live site is showing
  if (url && /^https?:\/\//i.test(url)) {
    e.url = url;                                      // the entry now reflects where you are
    tab.title = hostOf(url);
    setOmnibox(url);
    recordSiteVisit(url);
    renderTabs();
    scheduleSave();
  }
  updateNavButtons();
  updatePwFillButton();
}

// Log a visited real site into browsing history (newest-first, deduped, capped).
function recordSiteVisit(url, title) {
  if (!url || !/^https?:\/\//i.test(url)) return;
  if (siteHistory[0] && siteHistory[0].url === url) { siteHistory[0].at = Date.now(); return; }
  siteHistory.unshift({ id: uid(), url, title: title || hostOf(url), at: Date.now() });
  if (siteHistory.length > MAX_SITE_HISTORY) siteHistory.length = MAX_SITE_HISTORY;
}
if (els.webview) {
  els.webview.addEventListener('did-navigate', (e) => onWebviewNavigated(e.url));
  els.webview.addEventListener('did-navigate-in-page', (e) => { if (e.isMainFrame) onWebviewNavigated(e.url); });
  // Login-capture messages from the webview preload (RFC 0008 8.3).
  els.webview.addEventListener('ipc-message', (e) => {
    if (e.channel === 'chervil:login-submit') onCapturedLogin(e.args && e.args[0]);
  });
}

els.deepToggle.addEventListener('click', () => setDeepMode(!deepMode));
els.learnToggle.addEventListener('click', () => setSkillMode('learn'));
els.quizToggle.addEventListener('click', () => setSkillMode('quiz'));
if (els.chatToggle) els.chatToggle.addEventListener('click', () => setChatMode(!settings.chatMode));

// File attachments: button, picker, and drag-and-drop.
els.attachBtn.addEventListener('click', () => els.fileInput.click());
els.fileInput.addEventListener('change', () => { addFiles(els.fileInput.files); els.fileInput.value = ''; });

// Data folders modal (RFC 0004 local on-ramp)
if (els.foldersBtn) els.foldersBtn.addEventListener('click', openFoldersModal);
if (els.foldersClose) els.foldersClose.addEventListener('click', closeFoldersModal);
if (els.foldersModal) els.foldersModal.addEventListener('click', (e) => { if (e.target === els.foldersModal) closeFoldersModal(); });
if (els.foldersAdd) els.foldersAdd.addEventListener('click', addDataFolder);
if (els.folderBrowseBack) els.folderBrowseBack.addEventListener('click', () => { folderBrowseId = null; els.folderBrowse.hidden = true; });
if (els.folderFilter) els.folderFilter.addEventListener('input', renderFolderFiles);
if (els.folderAttach) els.folderAttach.addEventListener('click', attachSelectedFolderFiles);
{ const fp = document.getElementById('folder-pin'); if (fp) fp.addEventListener('click', pinSelectedFilesToSpace); }

// Right-click the top bar (not the text field) → quick show/hide toolbar buttons.
{
  const omnibar = document.getElementById('omnibar');
  if (omnibar) omnibar.addEventListener('contextmenu', (e) => {
    const t = e.target;
    if (t && t.closest && t.closest('input, textarea, select')) return; // leave text fields' native menu
    e.preventDefault();
    showToolbarMenu(e.clientX, e.clientY);
  });
}
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
els.tabActions.addEventListener('click', (e) => {
  e.stopPropagation();
  if (els.tabMenu.hidden) openTabMenu(e, activeId);
  else closeTabMenu();
});
els.tabMenu.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-act]');
  if (b && !b.disabled) onTabMenuClick(b.dataset.act);
});
els.tabSelectAll.addEventListener('click', selectAllTabs);
els.tabSelectClose.addEventListener('click', closeSelectedTabs);
els.tabSelectDone.addEventListener('click', exitTabSelect);

// Ctrl+K tab switcher wiring
if (els.tabSwitcher) els.tabSwitcher.addEventListener('click', (e) => { if (e.target === els.tabSwitcher) closeTabSwitcher(); });
if (els.tabSwitcherInput) {
  els.tabSwitcherInput.addEventListener('input', () => { tabSwitcherIdx = 0; renderTabSwitcher(); });
  els.tabSwitcherInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveTabSwitcher(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveTabSwitcher(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); chooseTabSwitcher(); }
    else if (e.key === 'Escape') { e.preventDefault(); closeTabSwitcher(); }
  });
}
window.addEventListener('click', () => { if (els.tabMenu && !els.tabMenu.hidden) closeTabMenu(); });
window.addEventListener('contextmenu', () => { if (els.tabMenu && !els.tabMenu.hidden) closeTabMenu(); });
window.addEventListener('blur', () => closeTabMenu());
els.tabs.addEventListener('scroll', () => closeTabMenu());
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeTabMenu(); if (tabSelectMode) exitTabSelect(); if (librarySelectMode) exitLibrarySelect(); if (els.foldersModal && els.foldersModal.classList.contains('open')) closeFoldersModal(); } });
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
if (els.auditClear) els.auditClear.addEventListener('click', clearAuditLog);
document.getElementById('agent-import').addEventListener('click', importAgentFile);
document.getElementById('agent-add').addEventListener('click', addAgentFromPaste);
{
  const fromSession = document.getElementById('agent-from-session');
  if (fromSession) fromSession.addEventListener('click', createAgentFromSession);
  const addStage = document.getElementById('pipeline-add-stage');
  if (addStage) addStage.addEventListener('click', addPipelineStage);
  const savePipe = document.getElementById('pipeline-save');
  if (savePipe) savePipe.addEventListener('click', savePipeline);
  const storeRefresh = document.getElementById('store-refresh');
  if (storeRefresh) storeRefresh.addEventListener('click', loadStoreAgents);
  const storeCat = document.getElementById('store-cat-select');
  if (storeCat) storeCat.addEventListener('change', () => { if (storeAgentsCache !== null) loadStoreAgents(); });
}
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
if (els.refreshPageBtn) els.refreshPageBtn.addEventListener('click', refreshCurrentPage);
els.sourcesBtn.addEventListener('click', toggleSourcesPanel);
els.exportSelect.addEventListener('change', onExportSelect);
els.remixMin.addEventListener('click', minimizeRemix);
els.remixHandle.addEventListener('click', expandRemix);
els.sourcesClose.addEventListener('click', () => { els.sourcesPanel.hidden = true; });
els.liveSelect.addEventListener('change', onLiveSelectChange);
els.voiceSelect.addEventListener('change', () => { settings.voiceURI = els.voiceSelect.value; scheduleSave(); });
els.rateSelect.addEventListener('change', () => { settings.audioRate = parseFloat(els.rateSelect.value) || 1; scheduleSave(); });
els.voiceTest.addEventListener('click', testVoice);
els.profileInput.addEventListener('input', () => { settings.profile = els.profileInput.value; scheduleSave(); });

// Settings
els.settingsBtn.addEventListener('click', openSettings);
els.settingsClose.addEventListener('click', closeSettings);
{
  const tabs = document.getElementById('settings-tabs');
  if (tabs) tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.settings-tab');
    if (btn) setSettingsTab(btn.dataset.sgroup);
  });
}
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
if (els.publishToken) els.publishToken.addEventListener('input', () => { settings.publishToken = els.publishToken.value.trim(); scheduleSave(); });
if (els.publishBase) els.publishBase.addEventListener('input', () => { settings.publishBase = els.publishBase.value.trim(); scheduleSave(); });
if (els.cloudLivePrompt) els.cloudLivePrompt.addEventListener('change', () => { settings.cloudLivePrompt = els.cloudLivePrompt.checked; scheduleSave(); });
if (els.publishSave) els.publishSave.addEventListener('click', () => {
  settings.publishToken = els.publishToken.value.trim();
  settings.publishBase = els.publishBase.value.trim() || 'https://getchervil.com';
  scheduleSave();
  if (els.publishStatus) { els.publishStatus.textContent = 'Saved ✓'; els.publishStatus.className = 'field-note ok'; }
  toast('Publishing settings saved.');
});
if (els.voiceAutosend) els.voiceAutosend.addEventListener('change', () => { settings.voiceAutosend = els.voiceAutosend.checked; scheduleSave(); });

// Sync folder (#1)
if (els.syncChoose) els.syncChoose.addEventListener('click', chooseSyncFolder);
if (els.syncClear) els.syncClear.addEventListener('click', clearSyncFolder);

// Autofill identity fields — save on input.
for (const k of AUTOFILL_FIELDS) {
  const el = document.getElementById('af-' + k);
  if (el) el.addEventListener('input', () => { settings.autofill = settings.autofill || {}; settings.autofill[k] = el.value.trim(); scheduleSave(); });
}

// Listening — "Hey Sprig"
if (els.wakeToggle) els.wakeToggle.addEventListener('change', async () => {
  settings.wakeEnabled = els.wakeToggle.checked;
  scheduleSave();
  if (settings.wakeEnabled) {
    const ok = await startWake();
    if (!ok) { settings.wakeEnabled = false; els.wakeToggle.checked = false; scheduleSave(); }
  } else {
    await stopWake();
  }
});
if (els.wakeKeyword) els.wakeKeyword.addEventListener('change', () => {
  settings.wakeKeyword = els.wakeKeyword.value; scheduleSave();
  if (settings.wakeEnabled) restartWake();
});
if (els.wakeThreshold) {
  let wtTimer = null;
  els.wakeThreshold.addEventListener('input', () => {
    const v = parseFloat(els.wakeThreshold.value);
    settings.wakeThreshold = v;
    if (els.wakeThresholdVal) els.wakeThresholdVal.textContent = v.toFixed(2);
    scheduleSave();
    // Restart the detector (debounced) so the new threshold takes effect while listening.
    if (settings.wakeEnabled) { clearTimeout(wtTimer); wtTimer = setTimeout(() => restartWake(), 400); }
  });
}
if (els.wakeImport) els.wakeImport.addEventListener('click', async () => {
  try {
    const res = await window.chervil.openWakeKeyword();
    if (res && res.ok) {
      settings.wakeKeywordLabel = res.name || 'custom model';
      settings.wakeKeyword = 'custom';
      if (els.wakeKeyword) els.wakeKeyword.value = 'custom';
      if (els.wakeKeywordNote) els.wakeKeywordNote.textContent = `Loaded: ${settings.wakeKeywordLabel}`;
      scheduleSave();
      if (settings.wakeEnabled) restartWake();
    } else if (res && res.error) {
      toast('Could not load model: ' + res.error);
    }
  } catch { toast('Could not load model.'); }
});
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

// Collapse / show the chat sidebar (full-width page).
if (els.sidebarToggle) els.sidebarToggle.addEventListener('click', toggleSidebar);

// Tab layout (horizontal strip vs. vertical rail).
if (els.tabLayoutSelect) els.tabLayoutSelect.addEventListener('change', () => {
  settings.tabLayout = els.tabLayoutSelect.value === 'vertical' ? 'vertical' : 'horizontal';
  applyTabLayout();
  scheduleSave();
});

// Default state of the floating Remix/Export bar; applies to the current page too.
if (els.remixDefaultSelect) els.remixDefaultSelect.addEventListener('change', () => {
  settings.remixMinimized = els.remixDefaultSelect.value === 'minimized';
  const showing = !els.remixBar.hidden || (els.remixHandle && !els.remixHandle.hidden);
  setRemixVisible(showing);
  scheduleSave();
});

// Notifications toggle.
if (els.notifyToggle) els.notifyToggle.addEventListener('change', () => {
  settings.notifications = els.notifyToggle.checked;
  scheduleSave();
});

// Hero-image toggle (opt-in; uses a BYO OpenAI/Gemini key).
if (els.heroToggle) els.heroToggle.addEventListener('change', () => {
  settings.heroImages = els.heroToggle.checked;
  if (settings.heroImages) refreshImageKeyStatus(); // remind the user if no key is set
  scheduleSave();
});
{
  const ps = document.getElementById('page-style-select');
  if (ps) ps.addEventListener('change', () => { settings.pageStyle = ps.value; scheduleSave(); });
  const sf = document.getElementById('space-files-select');
  if (sf) sf.addEventListener('change', () => { settings.spaceFilesMode = sf.value; scheduleSave(); });
}

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
if (els.libTabBookmarks) els.libTabBookmarks.addEventListener('click', () => { drawerTab = 'bookmarks'; renderDrawer(); });
if (els.libTabSites) els.libTabSites.addEventListener('click', () => { drawerTab = 'sites'; renderDrawer(); });
els.libTabTrash.addEventListener('click', () => { drawerTab = 'trash'; renderDrawer(); });
if (els.clearSites) els.clearSites.addEventListener('click', clearSiteHistory);
if (els.bookmarkBtn) els.bookmarkBtn.addEventListener('click', toggleBookmark);
if (els.pwFillBtn) els.pwFillBtn.addEventListener('click', fillPasswordOnSite);
els.emptyTrash.addEventListener('click', emptyTrash);
if (els.libImportPage) els.libImportPage.addEventListener('click', importPageFile);
if (els.libSelectToggle) els.libSelectToggle.addEventListener('click', enterLibrarySelect);
if (els.libSelectAll) els.libSelectAll.addEventListener('click', selectAllLibrary);
if (els.libSelectDelete) els.libSelectDelete.addEventListener('click', deleteSelectedLibrary);
if (els.libSelectDone) els.libSelectDone.addEventListener('click', exitLibrarySelect);

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
if (els.publishSpaceBtn) els.publishSpaceBtn.addEventListener('click', publishCurrentSpace);
els.synthInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); els.synthRow.hidden = true; synthesizeSpace(els.synthInput.value); }
  else if (e.key === 'Escape') { els.synthRow.hidden = true; }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (findIsOpen()) { closeFind(); return; }
    if (tabSwitcherIsOpen()) { closeTabSwitcher(); return; }
    if (els.agentsView.classList.contains('open')) { closeAgents(); return; }
    if (els.schedView.classList.contains('open')) { closeSched(); return; }
    if (els.mapView.classList.contains('open')) { closeMap(); return; }
    if (els.settingsModal.classList.contains('open')) { closeSettings(); return; }
    if (els.libraryDrawer.classList.contains('open')) { closeDrawer(); return; }
    // Nothing else consumed Esc — stop the active tab if it's composing.
    if (activeId && isTabBusy(activeId)) { stopActiveCompose(); return; }
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) { e.preventDefault(); openFind(); }
  else if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) { e.preventDefault(); els.pageTitle.focus(); els.pageTitle.select(); }
  else if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); openTabSwitcher(); }
  else if (e.ctrlKey && e.shiftKey && (e.key === 't' || e.key === 'T')) { e.preventDefault(); reopenClosedTab(); }
  else if (e.ctrlKey && e.key === 't') { e.preventDefault(); newTab(true); }
  else if (e.ctrlKey && e.key === 'w') { e.preventDefault(); if (activeId) closeTab(activeId); }
  else if ((e.ctrlKey || e.metaKey) && e.key === '\\') { e.preventDefault(); toggleSidebar(); }
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
  // An interactive page saved its state (shimmed localStorage) — persist it under
  // the active page's stable storeKey so it survives reopen/bookmark.
  if (d.type === 'page-store' && d.data && typeof d.data === 'object') {
    const entry = currentEntry(activeTab());
    if (entry && entry.kind === 'page') {
      if (!entry.storeKey) entry.storeKey = uid();
      pageStores[entry.storeKey] = d.data;
      scheduleSave();
    }
    return;
  }
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

// Session cache of composed applet widgets, keyed by prompt — avoids recomposing
// (a model call) when a lesson is re-rendered, reopened, or the widget rebuilt.
const appletCache = new Map();

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
    } else if (msg.name === 'applet') {
      // Build a self-contained interactive widget (HTML) the card renders inline.
      // Cache by prompt for the session so re-opening a lesson (or re-rendering it)
      // shows the widget instantly with no recompose; `force` (the Regenerate button)
      // bypasses the cache.
      const prompt = String((msg.args && msg.args.prompt) || '').trim();
      if (!prompt) return reply({ ok: false, error: 'Empty request.' });
      const force = !!(msg.args && msg.args.force);
      if (!force && appletCache.has(prompt)) return reply({ ok: true, result: { html: appletCache.get(prompt) } });
      const res = window.chervil.composeApplet
        ? await window.chervil.composeApplet({ prompt, config: providerConfig() })
        : { ok: false, error: 'Not available in this build.' };
      if (res && res.ok && res.html) { appletCache.set(prompt, res.html); reply({ ok: true, result: { html: res.html } }); }
      else reply({ ok: false, error: (res && res.error) || 'Sprig could not build this.' });
    } else if (msg.name === 'system_info') {
      // Read-only machine facts for "check my computer" style pages.
      const res = window.chervil.systemInfo ? await window.chervil.systemInfo() : null;
      if (res && res.ok) reply({ ok: true, result: res.info });
      else reply({ ok: false, error: (res && res.error) || 'Could not read system info.' });
    } else if (msg.name === 'system_details') {
      // Read-only extended OS facts (Windows edition/build, update history, GPU…).
      const res = window.chervil.systemDetails ? await window.chervil.systemDetails() : null;
      if (res && res.ok) reply({ ok: true, result: res.details });
      else reply({ ok: false, error: (res && res.error) || 'Could not read system details.' });
    } else if (msg.name === 'os_action') {
      // Guarded OS write-action (RFC 0006 Track B): policy → confirm → execute → audit.
      const type = (msg.args && msg.args.type) || '';
      const args = (msg.args && msg.args.args) || {};
      const verdict = decideOsAction(type);
      if (verdict.decision === 'deny') {
        auditAction({ type: 'os:' + type, target: args.url || '', decision: 'deny' });
        return reply({ ok: false, error: verdict.reason || 'Action not allowed.' });
      }
      const ok = await new Promise((res) => showActionSheet('Allow this action?', osActionLabel(type, args), [
        { label: 'Allow', primary: true, onClick: () => res(true) },
        { label: 'Deny', onClick: () => res(false) },
      ], () => res(false)));
      if (!ok) {
        auditAction({ type: 'os:' + type, target: args.url || '', decision: 'denied-by-user' });
        return reply({ ok: false, error: 'Denied.' });
      }
      const r = window.chervil.osAction ? await window.chervil.osAction({ type, args }) : { ok: false, error: 'unavailable' };
      auditAction({ type: 'os:' + type, target: args.url || '', decision: 'approved', ok: !!(r && r.ok) });
      reply(r && r.ok ? { ok: true, result: { done: true } } : { ok: false, error: (r && r.error) || 'Action failed.' });
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

// A published page asked to be remixed (chervil://import deep link) → open it.
if (window.chervil.onImportPage) {
  window.chervil.onImportPage((doc) => { try { importPageDoc(doc); } catch { /* ignore */ } });
}

// An agent arrived via a chervil://import-agent deep link → add it to Agents.
if (window.chervil.onImportAgent) {
  window.chervil.onImportAgent((doc) => { try { importAgentDoc(doc); } catch { /* ignore */ } });
}

// An embedded site followed a "new tab" link → open it in a fresh Chervil tab.
if (window.chervil.onOpenTabUrl) {
  window.chervil.onOpenTabUrl((url) => { try { openUrlInNewTab(url); } catch { /* ignore */ } });
}

// Prompts fired from the floating quick-ask bar (global hotkey) open a fresh tab.
if (window.chervil.onQuickPrompt) {
  window.chervil.onQuickPrompt((prompt) => {
    newTab(true);
    handleComposerSubmit(String(prompt || ''));
  });
}

// "Ask Sprig about <selection>" from the right-click menu fills the composer.
if (window.chervil.onContextAsk) {
  window.chervil.onContextAsk((text) => {
    const t = String(text || '').trim();
    if (!t) return;
    const cur = els.prompt.value.trim();
    els.prompt.value = cur ? `${cur} ${t}` : t;
    els.prompt.focus();
  });
}

// A file downloaded from an embedded site — let the user know.
if (window.chervil.onDownloadDone) {
  window.chervil.onDownloadDone((d) => {
    if (d && d.ok) toast(`⬇ Downloaded ${d.filename} to your Downloads folder.`);
    else if (d) toast(`Download failed: ${d.filename || ''}`);
  });
}

// Show the running app version in Settings (from the preload bridge).
{
  const av = document.getElementById('app-version');
  if (av && window.chervil && window.chervil.version) av.textContent = window.chervil.version;
}

init();
