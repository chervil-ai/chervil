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
  compareToggle: document.getElementById('compare-toggle'),
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
  // The ACTIVE tab's webview (or null if it never navigated). A getter so the
  // dozens of "the site showing right now" call sites survived the move from a
  // single shared <webview> to one per live tab.
  get webview() { return webviews.get(activeId) || null; },
  webviewsBox: document.getElementById('web-views'),
  overlay: document.getElementById('overlay'),
  remixBar: document.getElementById('remix-bar'),
  remixMin: document.getElementById('remix-min'),
  remixHandle: document.getElementById('remix-handle'),
  followupForm: document.getElementById('followup-form'),
  followupInput: document.getElementById('followup-input'),
  followupSend: document.getElementById('followup-send'),
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
  tabsToggle: document.getElementById('tabsbar-toggle'),
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
  reload: document.getElementById('reload-btn'),
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
  ollamaUrlStatus: document.getElementById('ollama-url-status'),
  ollamaKeyHint: document.getElementById('ollama-key-hint'),
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
  wakeConfirmToggle: document.getElementById('wake-confirm-toggle'),
  noisyModeToggle: document.getElementById('noisy-mode-toggle'),
  wakeConfirm: document.getElementById('wake-confirm'),
  wakeConfirmText: document.getElementById('wake-confirm-text'),
  wakeConfirmGo: document.getElementById('wake-confirm-go'),
  wakeConfirmCancel: document.getElementById('wake-confirm-cancel'),
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
  libTabFavorites: document.getElementById('lib-tab-favorites'),
  libTabCollections: document.getElementById('lib-tab-collections'),
  libNewCollection: document.getElementById('lib-new-collection'),
  libTabSites: document.getElementById('lib-tab-sites'),
  libTabDownloads: document.getElementById('lib-tab-downloads'),
  libTabTrash: document.getElementById('lib-tab-trash'),
  clearSites: document.getElementById('clear-sites'),
  clearDownloads: document.getElementById('clear-downloads'),
  libSearch: document.getElementById('lib-search'),
  libNewFolder: document.getElementById('lib-new-folder'),
  libCollapseAll: document.getElementById('lib-collapse-all'),
  bookmarksBar: document.getElementById('bookmarks-bar'),
  bookmarksBarToggle: document.getElementById('bookmarks-bar-toggle'),
  favoritesBar: document.getElementById('favorites-bar'),
  favoritesBarToggle: document.getElementById('favorites-bar-toggle'),
  makeDefaultBtn: document.getElementById('make-default-btn'),
  defaultBrowserStatus: document.getElementById('default-browser-status'),
  importBookmarksBtn: document.getElementById('import-bookmarks-btn'),
  importStatus: document.getElementById('import-status'),
  importHistoryBtn: document.getElementById('import-history-btn'),
  importHistoryStatus: document.getElementById('import-history-status'),
  importPwBtn: document.getElementById('import-pw-btn'),
  importPwStatus: document.getElementById('import-pw-status'),
  importAddressBtn: document.getElementById('import-address-btn'),
  importAddressStatus: document.getElementById('import-address-status'),
  adblockToggle: document.getElementById('adblock-toggle'),
  adblockStat: document.getElementById('adblock-stat'),
  spellcheckToggle: document.getElementById('spellcheck-toggle'),
  sharePopupToggle: document.getElementById('share-popup-toggle'),
  shareFedicaToggle: document.getElementById('share-fedica-toggle'),
  shareAddtoanyToggle: document.getElementById('share-addtoany-toggle'),
  clearDataBtn: document.getElementById('clear-data-btn'),
  menuBarToggle: document.getElementById('menu-bar-toggle'),
  zoomControls: document.getElementById('zoom-controls'),
  zoomIndicator: document.getElementById('zoom-indicator'),
  zoomIn: document.getElementById('zoom-in'),
  zoomOut: document.getElementById('zoom-out'),
  printBtn: document.getElementById('print-btn'),
  readerBtn: document.getElementById('reader-btn'),
  askPageBtn: document.getElementById('ask-page-btn'),
  translateBtn: document.getElementById('translate-btn'),
  readAloudBtn: document.getElementById('read-aloud-btn'),
  snipBtn: document.getElementById('snip-btn'),
  sendPhoneBtn: document.getElementById('send-phone-btn'),
  emailPageBtn: document.getElementById('email-page-btn'),
  shareFedicaBtn: document.getElementById('share-fedica-btn'),
  pipBtn: document.getElementById('pip-btn'),
  bookmarkBtn: document.getElementById('bookmark-btn'),
  favoriteBtn: document.getElementById('favorite-btn'),
  pwFillBtn: document.getElementById('autofill-pw-btn'),
  pwFillToggle: document.getElementById('pw-fill-toggle'),
  cardFillBtn: document.getElementById('autofill-card-btn'),
  cardFillToggle: document.getElementById('card-fill-toggle'),
  cardsPanel: document.getElementById('cards-panel'),
  sitePermsPanel: document.getElementById('site-perms-panel'),
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
let tabGroups = []; // [{ id, name, color, collapsed }] — tabs carry a groupId; persisted with the session
let closedTabs = []; // recently-closed tab snapshots for Ctrl+Shift+T (in-memory)
const MAX_CLOSED_TABS = 12;

// ---- Per-tab webview pool ----
// Each live-site tab owns its own <webview>, created on its first navigation and
// kept until the tab closes (or the LRU cap evicts it). Background tabs keep
// running — audio continues, switching back is instant — and private tabs get
// REAL isolation via a per-tab in-memory partition (cookies/storage never touch
// disk and vanish with the tab).
const webviews = new Map();            // tabId → <webview>
const webviewAudibleTabs = new Set();  // tabIds whose site is currently making sound
const MAX_LIVE_WEBVIEWS = 8;           // background sites kept alive; LRU beyond this reloads on revisit

function ensureWebview(tab) {
  let wv = webviews.get(tab.id);
  if (wv) return wv;
  wv = document.createElement('webview');
  wv.setAttribute('allowpopups', '');
  wv.setAttribute('plugins', ''); // inline PDF viewer
  // True private browsing: an unprefixed partition is an in-memory session.
  if (tab.private) wv.setAttribute('partition', `private-${tab.id}`);
  wv.hidden = true; // revealed by renderSite
  attachWebviewEvents(wv, tab.id);
  els.webviewsBox.appendChild(wv);
  webviews.set(tab.id, wv);
  return wv;
}

function destroyWebview(tabId) {
  const wv = webviews.get(tabId);
  if (!wv) return;
  webviews.delete(tabId);
  webviewAudibleTabs.delete(tabId);
  try { wv.remove(); } catch { /* already gone */ }
}

// Bump a webview's recency and evict the least-recently-shown background one
// past the cap. Never evicts the active tab or anything playing sound; evicted
// tabs simply reload when revisited (the pre-pool behavior for every tab).
function touchWebview(tabId) {
  const wv = webviews.get(tabId);
  if (wv) wv.__lastShown = Date.now();
  if (webviews.size <= MAX_LIVE_WEBVIEWS) return;
  let oldest = null;
  for (const [tid, w] of webviews) {
    if (tid === activeId || webviewAudibleTabs.has(tid)) continue;
    if (!oldest || (w.__lastShown || 0) < (webviews.get(oldest).__lastShown || 0)) oldest = tid;
  }
  if (oldest) destroyWebview(oldest);
}

// Cold-start pre-warm for pinned tabs. Restored tabs are inert data: renderSite
// creates the <webview> and fires the load lazily on first activation, so every
// morning the first click on each pinned tab waits through a full reload. Pinned
// tabs are precisely the always-open ones, so we warm them in the background right
// after launch — create their webviews and start loading while hidden, staggered
// so a dozen pages don't hit the network at once (and don't starve the active tab).
// Clicking a pinned tab then reveals an already-loaded page. No token cost: this is
// just loading live sites the user will open anyway.
function prewarmPinnedTabs() {
  const pending = tabs.filter((t) => {
    if (!t.pinned || t.id === activeId || webviews.has(t.id)) return false; // active already loaded; skip warm ones
    const entry = currentEntry(t);
    return entry && entry.kind === 'navigate' && entry.url; // live sites only (composed pages need no webview)
  });
  // Stay under the live-webview cap: the active tab holds one slot, warm the rest
  // up to the cap. Any extra pinned tabs stay lazy (the LRU would evict them anyway).
  const warmNow = pending.slice(0, Math.max(0, MAX_LIVE_WEBVIEWS - 1));
  let i = 0;
  const warmNext = () => {
    const tab = warmNow[i++];
    if (tab && tabs.includes(tab) && !webviews.has(tab.id)) { // may have closed/navigated while we waited
      const entry = currentEntry(tab);
      if (entry && entry.kind === 'navigate' && entry.url) {
        const wv = ensureWebview(tab);      // created hidden; loads in the background
        wv.__lastShown = Date.now();        // treat as recent so a genuinely-old tab is evicted first
        try { if (!wv.getAttribute('src')) wv.setAttribute('src', entry.url); } catch { /* ignore */ }
      }
    }
    if (i < warmNow.length) setTimeout(warmNext, 450);
  };
  if (warmNow.length) setTimeout(warmNext, 600); // let the active tab paint first
}

// Per-webview events, with the owning tab bound in the closure — a background
// site that redirects must update ITS tab, never whichever tab is active.
function attachWebviewEvents(wv, tabId) {
  const tabOf = () => tabs.find((t) => t.id === tabId) || null;
  wv.addEventListener('did-navigate', (e) => onWebviewNavigated(tabId, e.url));
  wv.addEventListener('did-navigate-in-page', (e) => { if (e.isMainFrame) onWebviewNavigated(tabId, e.url); });
  // Chromium resets zoom on each navigation — re-apply this tab's level + mute.
  wv.addEventListener('dom-ready', () => {
    const t = tabOf();
    try { wv.setZoomFactor(zoomForTab(t)); } catch { /* not ready */ }
    try { wv.setAudioMuted(!!(t && t.muted)); } catch { /* not ready */ }
  });
  // Audio badge: any tab (active or background) shows 🔊 while its site plays.
  wv.addEventListener('media-started-playing', () => {
    try { if (wv.isCurrentlyAudible && !wv.isCurrentlyAudible()) return; } catch { /* assume audible */ }
    webviewAudibleTabs.add(tabId);
    renderTabs();
  });
  wv.addEventListener('media-paused', () => { webviewAudibleTabs.delete(tabId); renderTabs(); });
  wv.addEventListener('found-in-page', (e) => {
    if (tabId !== activeId) return;
    const r = (e && e.result) || {};
    if (typeof r.matches === 'number') els.findCount.textContent = r.matches ? `${r.activeMatchOrdinal || 1}/${r.matches}` : 'No matches';
  });
  // Login-capture messages from the webview preload (RFC 0008 8.3).
  wv.addEventListener('ipc-message', (e) => {
    if (e.channel === 'chervil:login-submit') onCapturedLogin(e.args && e.args[0]);
    // mailto: clicked on a real site → webmail compose (Your places) / OS mail.
    if (e.channel === 'chervil:mailto') openMailto(e.args && e.args[0] && e.args[0].href);
  });
}

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
  noisyMode: false,          // "Noisy room" — TV/music always on: stricter wake (higher floor threshold, 3 consecutive hits, long cooldown), stricter capture VAD, and the confirm gate always applies
  wakeConfirm: true,         // require an explicit confirm before composing from a wake trigger (guards against false triggers in a noisy room)
  // Publishing — Chervil Pro: publish a lesson to a shareable getchervil.com link.
  publishToken: '',          // from getchervil.com/me (stored locally)
  publishBase: 'https://getchervil.com',
  cloudLivePrompt: true,     // after publishing a page, offer cloud auto-refresh (RFC 0007). Off → never auto-ask; still enable from Publish ☁.
  // Data folders (RFC 0004 local on-ramp): designated folders to pull files from.
  dataFolders: [],           // [{ id, name, path }] — local or desktop-synced OneDrive/GDrive
  // Autofill identity (non-sensitive only — never passwords/cards). Filled into
  // forms on real sites on request.
  autofill: {},              // { fullName, givenName, familyName, email, phone, address, city, postal, country, organization }
  places: {},                // Your places (URLs only, never credentials): { email: 'gmail'|'outlook'|'custom', emailUrl, blog, x, bluesky, facebook, instagram, tiktok, extras: [{name,url}] }
  blogTargets: [],           // blogging destinations: [{ id, platform:'wordpress'|'substack'|'medium', name, siteUrl, username }] — WP app password lives in the vault, never here
  blogAgent: false,          // opt-in: let Sprig auto-fill the Substack/Medium editor (never publishes) — off by default
  sidebarCollapsed: false,   // hide the left chat sidebar for a full-width page (Ctrl+\)
  tabsBarHidden: false,      // hide the tab strip for full-height pages (Ctrl+Shift+\); top/left edge peeks it
  chatMode: false,           // "Just a chatbot" — plain conversational replies, no page composed
  heroImages: false,         // generate an AI hero image for composed pages (opt-in; BYO image key, costs money)
  pageStyle: 'balanced',     // composed-page richness: 'balanced' | 'rich' | 'minimal'
  spaceFilesMode: 'synthesize', // pinned Space files feed the model: 'synthesize' | 'always' | 'off'
  toolbar: {},               // which top-bar buttons to show — { key: false } hides one (missing = shown)
  credsAutoLock: 'hide',     // password vault auto-lock: 'hide' | '5' | '15' | '30' (min idle) | 'never'
  pageZoom: 1,               // default viewport zoom (Ctrl +/−/0) — composed pages, and sites with no remembered level
  siteZoom: {},              // per-site zoom memory: { hostname: factor } — zooming on a live site remembers it for that site
  searchEngine: 'google',    // engine used by omnibox search escapes (g!/ddg!/b!/s!) — 'google' | 'duckduckgo' | 'bing'
  bookmarksBar: false,       // show the bookmarks strip under the omnibar (Ctrl+Shift+B)
  favoritesBar: false,       // show the favorites strip (★ sites) under the omnibar
  collapsedFolders: [],      // ["favorites:Name" | "bookmarks:Name"] folder groups the user collapsed in the Library
  adblock: false,            // block common ad/tracker hosts in embedded sites (main-process filter)
  spellcheck: true,          // red squiggles + right-click suggestions in text fields (app + embedded sites)
  sharePopup: true,          // open share composers (Fedica, AddToAny…) in a popup window vs a tab
  shareFedica: true,         // show Fedica on the 📣 share menu + post-publish sheet
  shareAddtoany: true,       // show AddToAny on the 📣 share menu + post-publish sheet
  translateLang: 'English',  // target language for 🌐 inline page translation (free text — any language)
  showMenuBar: false,        // always show the native menu bar (File/Edit/View); else Alt reveals it
  onboarded: false,          // first-run welcome shown (fresh profiles) / suppressed (upgrades)
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
// "Saved Pages" (internally still `bookmarks`): composed Chervil pages the user
// saved, on the ribbon button. Sites live in Favorites, not here. [{ id, key, kind:'page', query, title, at, folder?, tab }]
let bookmarks = [];
let bookmarkFolders = []; // ordered folder names; also holds empty folders (pages carry `folder`)
// Favorites: your websites, on the ★ star — like a standard browser's favorites/
// bookmarks. Folders + the browser-import target. [{ id, key, url, title, at, folder? }]
let favorites = [];
let collections = []; // named URL groups: [{ id, name, items: [{id,url,title,addedAt}], createdAt, updatedAt }]
let favoriteFolders = []; // ordered folder names (favorites carry `folder`)
let favoriteTombstones = []; // [{ key, at }] — same delete-survives-sync trick as bookmarks
// Tombstones for removed bookmarks, so a delete propagates across synced machines
// and the union-merge (lib/stateMerge.js) doesn't resurrect it. [{ key, at }]
let bookmarkTombstones = [];
const MAX_BOOKMARK_TOMBSTONES = 1000;
// Id-keyed delete tombstones for the other synced collections (composed pages,
// trash, site history, agents, schedules), so those removals also survive the
// cross-machine union-merge instead of resurrecting. { coll: [{ id, at }] }
let deletionTombstones = { pages: [], trash: [], sites: [], agents: [], schedules: [], watchers: [] };
const MAX_DEL_TOMBSTONES = 1000;
let siteHistory = []; // [{ id, url, title, at }] newest-first — real sites visited
const MAX_SITE_HISTORY = 500;
let downloads = []; // [{ id, filename, path, at, ok, state }] newest-first — files saved from embedded sites
const MAX_DOWNLOADS = 200;
let agentAudit = []; // [{ at, type, target, decision, ok }] — agent action audit trail (RFC 0006)
const MAX_AGENT_AUDIT = 500;
let drawerTab = 'history';
let librarySearch = ''; // filter text for the Library drawer list (all tabs)
// History multi-select (bulk delete) state.
let librarySelectMode = false;
let selectedLibraryIds = new Set();

// Spaces (legacy): these organized the Activity timeline's auto-captured pages.
// Activity is now a flat timeline, so this data stays dormant (kept, not shown).
//   space = { id, name, createdAt }
let spaces = [];
let activeSpaceId = null;
// Saved-Pages Spaces: the organizing structure for Saved Pages (replacing folders).
// A saved page carries `spaceId`; Synthesize/Publish operate on the active Space.
let savedSpaces = [];
let activeSavedSpaceId = null;

// Living pages: composed pages that re-ground themselves on a schedule.
//   record = { id, tabId, entryId, query, intervalMs, lastRun, title, refreshing }
let living = [];
let livingTimer = null;
// Scheduled agents: run a prompt on a cron-like rule (interval / daily / weekly).
//   schedule = { id, title, prompt, rule, deep, enabled, lastRun, tabId, entryId, running }
let schedules = [];
// Page watchers: poll an external URL and notify when its content/condition changes.
//   watcher = { id, url, title, condition, intervalMs, enabled, running, lastRun,
//               lastValue, lastSummary, lastChangedAt, triggered }
let watchers = [];
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
//   runState: tabId -> { genId, statusText, status, startedAt, streamBuffer }
const runState = new Map();
const reqToTab = new Map(); // requestId -> tabId
const cancelledRequests = new Set(); // requestIds the user stopped — their results are ignored

let saveTimer = null;
let previewTimer = null; // throttles the active tab's streamed preview
let previewScrollY = 0;  // scroll position to restore across streaming re-renders
let activeStatusEl = null;
let statusTimer = null;    // ticks the elapsed counter in the status bubble
let statusStartedAt = 0;   // when the active run began (for elapsed)

// Don't show the elapsed counter until a run is slow enough to be worth timing —
// a number flickering 1s/2s on a fast reply is noise.
const ELAPSED_AFTER_SECS = 3;

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
  // Page zoom + print: the sandboxed frame is a separate origin, so the parent
  // can't touch it directly — it posts these in. Zoom scales the document root;
  // print must originate inside the frame (parent can't call our print()).
  window.addEventListener('message', function(e){
    var d = e.data;
    if(!d || d.__chervil !== true) return;
    if(d.type === 'zoom'){ try { document.documentElement.style.zoom = d.factor || 1; } catch(_){} }
    else if(d.type === 'print'){ try { window.print(); } catch(_){} }
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

// A snapshot of the OS voices for seeding a composed page's TTS shim, so pages
// that enumerate speechSynthesis.getVoices() still see a list.
function frameVoicesJson() {
  try {
    const vs = (cachedVoices && cachedVoices.length)
      ? cachedVoices
      : (window.speechSynthesis ? (window.speechSynthesis.getVoices() || []) : []);
    return JSON.stringify(vs.map((v) => ({
      name: v.name, lang: v.lang, voiceURI: v.voiceURI,
      default: !!v.default, localService: !!v.localService,
    }))).replace(/</g, '\\u003c');
  } catch { return '[]'; }
}

// A TTS bridge for composed pages. The sandbox iframe's real speechSynthesis is
// inert (opaque origin → getVoices() is empty and speak() is silent), so a page's
// "Listen / pronounce" buttons do nothing — the cause of the "no audio" reports.
// This shadows window.speechSynthesis and SpeechSynthesisUtterance with versions
// that forward speak/cancel/pause/resume up to the parent renderer (where speech
// works) and relay start/end/error events back to the originating utterance so a
// page's button state stays in sync. Mirrors pageStorageShim's approach and must
// run in <head>, before the page's own scripts. Seeded with the parent's voices.
function pageTtsShim(voicesJson) {
  return `<script>(function(){
  var voices=${voicesJson}||[];
  var utts={}, seq=0;
  function send(action,u){
    try{ parent.postMessage({__chervil:true,type:'tts',action:action,
      id:u?u.__id:null, text:u?String(u.text||''):'', lang:u?String(u.lang||''):'',
      rate:(u&&u.rate)?Number(u.rate):null, pitch:(u&&u.pitch)?Number(u.pitch):null,
      voiceURI:(u&&u.voice)?String(u.voice.voiceURI||u.voice.name||''):''},'*'); }catch(e){}
  }
  function Utt(text){ this.text=(text==null?'':String(text)); this.lang=''; this.rate=1; this.pitch=1;
    this.volume=1; this.voice=null; this.onstart=null; this.onend=null; this.onerror=null;
    this.onpause=null; this.onresume=null; this.onboundary=null; this.onmark=null; this._l={}; }
  Utt.prototype.addEventListener=function(t,fn){ (this._l[t]=this._l[t]||[]).push(fn); };
  Utt.prototype.removeEventListener=function(t,fn){ var a=this._l[t]; if(a){var i=a.indexOf(fn); if(i>=0)a.splice(i,1);} };
  Utt.prototype.dispatchEvent=function(){ return true; };
  function fire(u,type){ var h=u['on'+type]; if(typeof h==='function'){try{h.call(u,{type:type,charIndex:0,elapsedTime:0});}catch(e){}}
    var a=u._l[type]; if(a)for(var i=0;i<a.length;i++){try{a[i].call(u,{type:type});}catch(e){}} }
  var synth={
    speak:function(u){ if(!u)return; if(!(u instanceof Utt)){ var n=new Utt(u&&u.text);
        if(u){n.lang=u.lang||'';n.rate=u.rate||1;n.pitch=u.pitch||1;n.voice=u.voice||null;} u=n; }
      u.__id='u'+(++seq); utts[u.__id]=u; synth.speaking=true; send('speak',u); },
    cancel:function(){ utts={}; synth.speaking=false; synth.paused=false; send('cancel'); },
    pause:function(){ synth.paused=true; send('pause'); },
    resume:function(){ synth.paused=false; send('resume'); },
    getVoices:function(){ return voices.slice(); },
    speaking:false, pending:false, paused:false, onvoiceschanged:null,
    addEventListener:function(){}, removeEventListener:function(){}, dispatchEvent:function(){return true;}
  };
  window.addEventListener('message',function(e){
    var d=e.data; if(!d||d.__chervil!==true||d.type!=='tts-event')return;
    var u=utts[d.id]; if(!u)return;
    if(d.event==='start') fire(u,'start');
    else if(d.event==='end'){ fire(u,'end'); delete utts[d.id]; if(!Object.keys(utts).length)synth.speaking=false; }
    else if(d.event==='error'){ fire(u,'error'); delete utts[d.id]; if(!Object.keys(utts).length)synth.speaking=false; }
  });
  try{Object.defineProperty(window,'speechSynthesis',{configurable:true,get:function(){return synth;}});}
  catch(e){ try{window.speechSynthesis=synth;}catch(_){} }
  try{ window.SpeechSynthesisUtterance=Utt; }catch(e){}
  if(voices.length){ setTimeout(function(){ if(typeof synth.onvoiceschanged==='function'){try{synth.onvoiceschanged();}catch(e){}} },0); }
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
    rs = { genId: null, statusText: '', status: null, startedAt: 0, streamBuffer: '' };
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

function newTab(activate = true, opts = {}) {
  const tab = {
    id: uid(),
    title: opts.private ? 'Private Tab' : 'New Tab',
    conversation: [],
    history: [],
    pages: [],
    currentId: null,
    pinned: false,
    private: !!opts.private, // ephemeral: not saved to history/library/session-restore
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

// Reload a tab's live site. A pooled webview reloads in place (even in the
// background); a tab without one (evicted) loads fresh on its next switch anyway.
function reloadTab(tabId) {
  const tab = tabs.find((t) => t.id === tabId) || null;
  const entry = currentEntry(tab);
  if (!entry || entry.kind !== 'navigate') return;
  const wv = webviews.get(tabId);
  if (wv) { try { wv.reload(); return; } catch { /* fall through */ } }
  if (tabId === activeId) renderSite(entry.url);
}

// "Duplicate tab" — clone the whole tab (conversation + page tree) next to the
// original via the bookmark snapshot-restore, which remaps page ids. The clone
// keeps the original's group; a private clone gets its own fresh partition.
function duplicateTab(tabId) {
  const tab = tabs.find((t) => t.id === tabId);
  if (!tab) return;
  const snap = JSON.parse(JSON.stringify(tab));
  const dup = restoreTabSnapshot(snap, { afterId: tabId });
  if (dup && tab.groupId) { dup.groupId = tab.groupId; renderTabs(); scheduleSave(); }
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
  destroyWebview(id); // tear down the tab's live site (private partitions vanish with it)
  pruneEmptyGroups(); // a group dies with its last tab
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
  { // switching into a collapsed group (omnibox tab-search, Ctrl+K) expands it
    const t = tabs.find((x) => x.id === id);
    const g = t && t.groupId ? tabGroups.find((x) => x.id === t.groupId) : null;
    if (g && g.collapsed) g.collapsed = false;
  }
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
    destroyWebview(id); // tear down each closed tab's live site
  }
  pruneEmptyGroups(); // groups die with their last tab
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
  const reloadBtn = menu.querySelector('[data-act="reload"]');
  if (reloadBtn) {
    const cur = currentEntry(target);
    reloadBtn.disabled = !(cur && cur.kind === 'navigate'); // live sites only
  }
  const dupBtn = menu.querySelector('[data-act="duplicate"]');
  if (dupBtn) dupBtn.disabled = !target;
  const muteBtn = menu.querySelector('[data-act="mute"]');
  if (muteBtn) {
    muteBtn.textContent = (target && target.muted) ? 'Unmute tab' : 'Mute tab';
    const cur = currentEntry(target);
    // Live sites can play audio; also allow unmuting a tab that's muted or currently audible.
    muteBtn.disabled = !target || !((cur && cur.kind === 'navigate') || target.muted || webviewAudibleTabs.has(tabId));
  }
  const collectBtn = menu.querySelector('[data-act="collect"]');
  if (collectBtn) collectBtn.disabled = !(target && collectionPageForTab(target)); // needs a URL (live site / published page)
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
  else if (act === 'new-private') newTab(true, { private: true });
  else if (act === 'new-window') { if (window.chervil.newWindow) window.chervil.newWindow(); }
  else if (act === 'reload') reloadTab(id);
  else if (act === 'duplicate') duplicateTab(id);
  else if (act === 'mute') toggleTabMute(id);
  else if (act === 'collect') { const t = tabs.find((x) => x.id === id); chooseCollectionFor(collectionPageForTab(t)); }
  else if (act === 'pin') toggleTabPin(id);
  else if (act === 'group') openGroupPicker(id);
  else if (act === 'close') closeTab(id);
  else if (act === 'others') closeOtherTabs(id);
  else if (act === 'right') closeTabsToRight(id);
  else if (act === 'select') enterTabSelect(id);
  else if (act === 'hidebar') toggleTabsBar();
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

// ---- Tab groups ----
// Chrome-style: named, colored, collapsible. Group members stay contiguous in
// the strip (enforced after drags); assignment is via the tab context menu.
const TAB_GROUP_COLORS = ['#5a9ce8', '#e8735a', '#5db082', '#f4c542', '#a06ee8', '#e86ea8'];

function nextGroupColor() {
  const used = new Set(tabGroups.map((g) => g.color));
  return TAB_GROUP_COLORS.find((c) => !used.has(c)) || TAB_GROUP_COLORS[tabGroups.length % TAB_GROUP_COLORS.length];
}

function createTabGroup(name) {
  const g = { id: uid(), name: (name || '').trim(), color: nextGroupColor(), collapsed: false };
  tabGroups.push(g);
  return g;
}

function pruneEmptyGroups() {
  tabGroups = tabGroups.filter((g) => tabs.some((t) => t.groupId === g.id));
}

// Assign a tab to a group, parking it right after the group's current members
// so groups stay contiguous. Passing a falsy groupId removes it from its group.
function moveTabToGroup(tabId, groupId) {
  const idx = tabs.findIndex((t) => t.id === tabId);
  if (idx === -1) return;
  const tab = tabs[idx];
  if (!groupId) {
    delete tab.groupId;
  } else {
    const hasMembers = tabs.some((t) => t.id !== tabId && t.groupId === groupId);
    tab.groupId = groupId;
    if (hasMembers) {
      tabs.splice(idx, 1);
      let insertAt = tabs.length;
      for (let i = tabs.length - 1; i >= 0; i--) if (tabs[i].groupId === groupId) { insertAt = i + 1; break; }
      tabs.splice(insertAt, 0, tab);
    }
  }
  pruneEmptyGroups();
  renderTabs();
  scheduleSave();
}

// After a drag, pull each group's members back together (anchored where the
// group first appears). Dragging a tab into a group's span doesn't adopt it —
// grouping stays an explicit menu action.
function normalizeGroups() {
  const out = [];
  const emitted = new Set();
  for (const t of tabs) {
    if (emitted.has(t.id)) continue;
    if (t.groupId) {
      for (const m of tabs) if (m.groupId === t.groupId && !emitted.has(m.id)) { out.push(m); emitted.add(m.id); }
    } else {
      out.push(t);
      emitted.add(t.id);
    }
  }
  tabs = out;
}

function toggleGroupCollapsed(groupId) {
  const g = tabGroups.find((x) => x.id === groupId);
  if (!g) return;
  if (!g.collapsed) {
    // Collapsing the active tab's group: hop to the nearest tab outside it.
    const active = activeTab();
    if (active && active.groupId === groupId) {
      const outside = tabs.find((t) => t.groupId !== groupId);
      if (outside) switchTab(outside.id);
      else newTab(true);
    }
  }
  g.collapsed = !g.collapsed;
  renderTabs();
  scheduleSave();
}

function openGroupMenu(groupId) {
  const g = tabGroups.find((x) => x.id === groupId);
  if (!g) return;
  showActionSheet(g.name || 'Tab group', null, [
    { label: 'Rename…', onClick: async () => {
      const v = await showInputSheet({ title: 'Group name', placeholder: g.name || 'e.g. Work', okLabel: 'Rename' });
      if (v && v.trim()) { g.name = v.trim(); renderTabs(); scheduleSave(); }
    } },
    { label: 'Change color', onClick: () => {
      g.color = TAB_GROUP_COLORS[(TAB_GROUP_COLORS.indexOf(g.color) + 1) % TAB_GROUP_COLORS.length];
      renderTabs();
      scheduleSave();
    } },
    { label: 'Ungroup tabs', onClick: () => {
      for (const t of tabs) if (t.groupId === groupId) delete t.groupId;
      pruneEmptyGroups();
      renderTabs();
      scheduleSave();
    } },
    { label: 'Close group', onClick: () => {
      closeTabs(tabs.filter((t) => t.groupId === groupId).map((t) => t.id));
    } },
  ]);
}

// The tab context menu's "Add to group…": existing groups, a new one, or out.
function openGroupPicker(tabId) {
  const tab = tabs.find((t) => t.id === tabId);
  if (!tab) return;
  const actions = tabGroups.map((g) => ({
    label: `${tab.groupId === g.id ? '✓ ' : ''}${g.name || 'Group'}`,
    onClick: () => moveTabToGroup(tabId, g.id),
  }));
  actions.push({ label: '+ New group…', primary: !tabGroups.length, onClick: async () => {
    const v = await showInputSheet({ title: 'New tab group', placeholder: 'e.g. Work, Research', okLabel: 'Create' });
    if (v == null || !v.trim()) return;
    moveTabToGroup(tabId, createTabGroup(v).id);
  } });
  if (tab.groupId) actions.push({ label: 'Remove from group', onClick: () => moveTabToGroup(tabId, null) });
  showActionSheet('Add to group', null, actions);
}

function tabLabel(tab) {
  if (tab.title && tab.title !== 'New Tab') return tab.title;
  const firstUser = tab.conversation.find((m) => m.role === 'user');
  if (firstUser) return firstUser.text;
  return 'New Tab';
}

// ---- Rendering: tab strip ----
// A group's header renders before its first member; collapsed groups hide their
// tabs (except the active one, which always stays reachable).
function renderGroupHeader(g) {
  const count = tabs.filter((t) => t.groupId === g.id).length;
  const el = document.createElement('div');
  el.className = 'tab-group-head' + (g.collapsed ? ' collapsed' : '');
  el.style.setProperty('--group-color', g.color || TAB_GROUP_COLORS[0]);
  const caret = document.createElement('span');
  caret.className = 'tab-group-caret';
  caret.textContent = g.collapsed ? '▸' : '▾';
  const label = document.createElement('span');
  label.className = 'tab-group-label';
  label.textContent = g.collapsed ? `${g.name || 'Group'} (${count})` : (g.name || 'Group');
  el.append(caret, label);
  el.title = g.collapsed ? 'Click to expand' : 'Click to collapse — right-click for options';
  el.addEventListener('click', () => toggleGroupCollapsed(g.id));
  el.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); openGroupMenu(g.id); });
  els.tabs.appendChild(el);
}

function renderTabs() {
  els.tabs.innerHTML = '';
  let prevGroupId = null;
  for (const tab of tabs) {
    const group = tab.groupId ? tabGroups.find((g) => g.id === tab.groupId) : null;
    if (group && tab.groupId !== prevGroupId) renderGroupHeader(group);
    prevGroupId = tab.groupId || null;
    if (group && group.collapsed && tab.id !== activeId && !tabSelectMode) continue;
    const el = document.createElement('div');
    el.className = 'tab'
      + (tab.id === activeId ? ' active' : '')
      + (tab.pinned ? ' pinned' : '')
      + (tab.private ? ' private' : '')
      + (group ? ' grouped' : '')
      + (tabSelectMode ? ' selecting' : '')
      + (selectedTabIds.has(tab.id) ? ' sel' : '');
    if (group) el.style.setProperty('--group-color', group.color || TAB_GROUP_COLORS[0]);
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

    if (tab.private) {
      const mask = document.createElement('span');
      mask.className = 'tab-private';
      mask.textContent = '🕶';
      mask.title = 'Private tab — isolated cookies & storage (nothing saved to disk), and never in your history or library';
      el.appendChild(mask);
    }

    // Audio badge: on the active live-site tab when it's audible or muted. Click to
    // mute/unmute. (Background tabs are parked, so only the active site plays.)
    // Any tab — active or background — shows 🔊 while its site plays (background
    // sites keep running now); click to mute that tab without switching to it.
    if (!tabSelectMode && (webviewAudibleTabs.has(tab.id) || tab.muted)) {
      const spk = document.createElement('span');
      spk.className = 'tab-audio' + (tab.muted ? ' muted' : '');
      spk.textContent = tab.muted ? '🔇' : '🔊';
      spk.title = tab.muted ? 'Unmute this tab' : 'Mute this tab';
      spk.addEventListener('click', (e) => { e.stopPropagation(); toggleTabMute(tab.id); });
      el.appendChild(spk);
    }

    if (isTabBusy(tab.id)) {
      const spin = document.createElement('span');
      spin.className = 'tab-spin';
      el.appendChild(spin);
    }

    // Favicon for tabs currently showing a real site (composed pages have none).
    if (!tabSelectMode) {
      const ce = currentEntry(tab);
      if (ce && ce.kind === 'navigate' && ce.url) {
        const fav = faviconImg(ce.url, 'tab-favicon');
        if (fav) el.appendChild(fav);
      }
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

// ---- Resizable panes: drag the chat-sidebar / vertical-tab-rail seams -------
const SIDEBAR_W = { min: 300, max: 560 };
const VTABS_W = { min: 140, max: 320 };

// Push the saved pane widths (persisted in settings, synced across machines)
// onto the CSS variables. No-op for a pane the user hasn't resized (keeps the
// stylesheet default). Called on load and after a sync pulls new settings.
function applyPaneSizes() {
  const root = document.documentElement;
  if (Number.isFinite(settings.sidebarW)) {
    root.style.setProperty('--sidebar-w', Math.max(SIDEBAR_W.min, Math.min(SIDEBAR_W.max, settings.sidebarW)) + 'px');
  }
  if (Number.isFinite(settings.vtabsW)) {
    root.style.setProperty('--vtabs-w', Math.max(VTABS_W.min, Math.min(VTABS_W.max, settings.vtabsW)) + 'px');
  }
}

function setupPaneResize(handleId, opts) {
  const handle = document.getElementById(handleId);
  if (!handle) return;
  const root = document.documentElement;
  let dragging = false;
  const onMove = (e) => {
    if (!dragging) return;
    const rect = opts.container().getBoundingClientRect();
    let w = e.clientX - rect.left;
    // Dragging the sidebar well below its minimum snaps it collapsed instead.
    if (opts.collapseBelow && w < opts.min - 60) {
      endDrag();
      if (!settings.sidebarCollapsed) toggleSidebar();
      return;
    }
    w = Math.max(opts.min, Math.min(opts.max, Math.round(w)));
    root.style.setProperty(opts.varName, w + 'px');
    settings[opts.settingKey] = w;
  };
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    document.body.classList.remove('resizing');
    document.removeEventListener('mousemove', onMove, true);
    document.removeEventListener('mouseup', endDrag, true);
    scheduleSave();
  };
  handle.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragging = true;
    document.body.classList.add('resizing');
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('mouseup', endDrag, true);
  });
  // Double-click the seam → reset to the stylesheet default width.
  handle.addEventListener('dblclick', () => {
    root.style.removeProperty(opts.varName);
    delete settings[opts.settingKey];
    scheduleSave();
  });
}

function initPaneResize() {
  setupPaneResize('sidebar-resize', {
    container: () => els.main, varName: '--sidebar-w', settingKey: 'sidebarW',
    min: SIDEBAR_W.min, max: SIDEBAR_W.max, collapseBelow: true,
  });
  setupPaneResize('vtabs-resize', {
    container: () => document.getElementById('app'), varName: '--vtabs-w', settingKey: 'vtabsW',
    min: VTABS_W.min, max: VTABS_W.max,
  });
}

// Tabs-bar toggle mirrors the sidebar glyph, but with the TOP row filled —
// HIDE = strip currently shown (top filled); SHOW = hidden (outline + top line).
const TABSBAR_ICON_HIDE = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9 V6.5 A2.5 2.5 0 0 1 5.5 4 H18.5 A2.5 2.5 0 0 1 21 6.5 V9 Z" fill="currentColor" stroke="none"/><path d="M3 9h18"/></svg>';
const TABSBAR_ICON_SHOW = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18"/></svg>';
function applyTabsBarHidden() {
  const on = !!settings.tabsBarHidden;
  const app = document.getElementById('app');
  if (app) {
    app.classList.toggle('tabs-hidden', on);
    if (!on) app.classList.remove('tabs-peek');
  }
  if (els.tabsToggle) {
    els.tabsToggle.setAttribute('aria-pressed', String(on));
    els.tabsToggle.title = on ? 'Show tab bar (Ctrl+Shift+\\)' : 'Hide tab bar (Ctrl+Shift+\\)';
    els.tabsToggle.innerHTML = on ? TABSBAR_ICON_SHOW : TABSBAR_ICON_HIDE;
  }
  const hideBtn = els.tabMenu && els.tabMenu.querySelector('[data-act="hidebar"]');
  if (hideBtn) hideBtn.textContent = on ? 'Show tab bar' : 'Hide tab bar';
}

function toggleTabsBar() {
  settings.tabsBarHidden = !settings.tabsBarHidden;
  applyTabsBarHidden();
  scheduleSave();
}

// While the strip is hidden, nudging the screen edge where it lives (top, or
// left with vertical tabs) peeks it as an overlay; it tucks away on mouseleave.
window.addEventListener('mousemove', (e) => {
  if (!settings.tabsBarHidden) return;
  const app = document.getElementById('app');
  if (!app || app.classList.contains('tabs-peek')) return;
  if (isVerticalTabs() ? e.clientX <= 3 : e.clientY <= 3) app.classList.add('tabs-peek');
});
document.getElementById('tabstrip').addEventListener('mouseleave', () => {
  if (els.tabMenu && !els.tabMenu.hidden) return; // keep the peek under an open tab menu
  const app = document.getElementById('app');
  if (app && app.classList.contains('tabs-hidden')) app.classList.remove('tabs-peek');
});

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
  if (order.length !== tabs.length) return; // e.g. a collapsed group hides tabs — skip reorder
  tabs.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  // Enforce the pinned-first invariant (stable within each group), then pull
  // group members back together, then re-sync the DOM.
  tabs = tabs.filter((t) => t.pinned).concat(tabs.filter((t) => !t.pinned));
  normalizeGroups();
  renderTabs();
  scheduleSave();
}

// ---- Rendering: conversation ----
function renderConversation() {
  els.conversation.innerHTML = '';
  activeStatusEl = null;
  const tab = activeTab();
  if (!tab) return;
  for (const m of tab.conversation) appendMessageEl(m.role, m.text, m.cls, m.sources);
  const rs = runState.get(tab.id);
  if (rs && rs.genId) setStatus(rs.status || rs.statusText || 'Thinking…', rs.startedAt);
  els.conversation.scrollTop = els.conversation.scrollHeight;
}

function sprigAvatar() {
  const av = document.createElement('img');
  av.className = 'sprig-avatar';
  av.src = 'sprig-badge.jpg';
  av.alt = 'Sprig';
  return av;
}

// Turn bare URLs in a plain-text chat message into clickable links that open in
// a fresh Chervil tab. We build DOM nodes (never innerHTML) so message text stays
// safe from injection — only the URLs we explicitly match become anchors.
const CHAT_URL_RE = /((?:https?:\/\/|www\.)[^\s<>]+)/gi;
function appendLinkified(container, text) {
  const str = String(text == null ? '' : text);
  CHAT_URL_RE.lastIndex = 0;
  let last = 0;
  let m;
  while ((m = CHAT_URL_RE.exec(str))) {
    const start = m.index;
    let url = m[0];
    // Peel trailing punctuation that's almost certainly sentence, not URL…
    let trail = '';
    const tm = url.match(/[)\].,;:!?'"]+$/);
    if (tm) {
      trail = tm[0];
      let core = url.slice(0, url.length - trail.length);
      // …but hand back a ')' when the URL has an unmatched '(' e.g. wiki_(disambig).
      while (trail.startsWith(')') && (core.split('(').length > core.split(')').length)) {
        core += ')';
        trail = trail.slice(1);
      }
      url = core;
    }
    if (start > last) container.appendChild(document.createTextNode(str.slice(last, start)));
    const href = /^https?:\/\//i.test(url) ? url : 'https://' + url;
    const a = document.createElement('a');
    a.className = 'chat-link';
    a.textContent = url;
    a.href = href;
    a.title = href;
    a.addEventListener('click', (e) => { e.preventDefault(); openUrlInNewTab(href); });
    container.appendChild(a);
    if (trail) container.appendChild(document.createTextNode(trail));
    last = start + m[0].length;
  }
  if (last < str.length) container.appendChild(document.createTextNode(str.slice(last)));
}

function appendMessageEl(role, text, cls, sources) {
  // Bot messages come from Sprig, so pair them with his avatar.
  if (role === 'bot') {
    const row = document.createElement('div');
    row.className = 'bot-row';
    const bubble = document.createElement('div');
    bubble.className = `msg bot${cls ? ' ' + cls : ''}`;
    appendLinkified(bubble, text);
    // Chat mode can search the web — when it did, list the live sources it used
    // as clickable links under the reply (they open like any other Chervil link).
    if (Array.isArray(sources) && sources.length) {
      const foot = document.createElement('div');
      foot.className = 'chat-sources';
      const label = document.createElement('span');
      label.className = 'chat-sources-label';
      label.textContent = 'Sources: ';
      foot.appendChild(label);
      sources.forEach((s, i) => {
        if (!s || !s.url) return;
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'chat-source-link';
        a.textContent = s.title || s.url;
        a.title = s.url;
        a.addEventListener('click', (e) => { e.preventDefault(); handleLinkClick(s.url, s.title || ''); });
        foot.appendChild(a);
        if (i < sources.length - 1) foot.appendChild(document.createTextNode(', '));
      });
      bubble.appendChild(foot);
    }
    row.appendChild(sprigAvatar());
    row.appendChild(bubble);
    els.conversation.appendChild(row);
    return bubble;
  }
  const el = document.createElement('div');
  el.className = `msg ${role}${cls ? ' ' + cls : ''}`;
  appendLinkified(el, text);
  els.conversation.appendChild(el);
  return el;
}

// Adds a persisted message to a specific tab; renders if that tab is active.
function addMessage(tab, role, text, cls = '', sources = null) {
  tab.conversation.push({ role, text, cls, ...(sources && sources.length ? { sources } : {}) });
  if (tab.id === activeId) {
    appendMessageEl(role, text, cls, sources);
    els.conversation.scrollTop = els.conversation.scrollHeight;
  }
  scheduleSave();
}

// Status arrives from the provider either as a plain string (older call sites) or
// as a structured { phase, text, detail, sources }. Normalize both into one shape
// so the UI has a phase to work with instead of sniffing the text.
function normalizeStatus(v) {
  if (v && typeof v === 'object') {
    return {
      phase: v.phase || 'working',
      text: v.text || 'Sprig is working…',
      detail: v.detail || '',
      note: v.note || '',
      sources: v.sources || 0,
    };
  }
  const text = String(v || 'Sprig is working…');
  return { phase: /retrying/i.test(text) ? 'retrying' : 'working', text, detail: '', note: '', sources: 0 };
}

// The secondary line under the status: what's being looked at, and how much has
// been done. `detail` is a quoted thing (a search query, a hostname); `note` is
// free text (a running count). All optional — an empty line just collapses.
function statusDetailText(s) {
  const parts = [];
  if (s.detail) parts.push(`“${s.detail}”`);
  if (s.note) parts.push(s.note);
  if (s.sources > 0) parts.push(`${s.sources} source${s.sources === 1 ? '' : 's'} found`);
  return parts.join(' · ');
}

// Elapsed seconds tick independently of the model, so a long quiet stretch (a
// server-side search can run for a while with nothing to report) still visibly
// moves. It counts up rather than filling a bar: the number of searches is the
// model's call, so there's no honest denominator to show a percentage against.
function renderElapsed() {
  if (!activeStatusEl || !statusStartedAt) return;
  const el = activeStatusEl.querySelector('.status-elapsed');
  if (!el) return;
  const secs = Math.floor((Date.now() - statusStartedAt) / 1000);
  el.textContent = secs >= ELAPSED_AFTER_SECS ? `${secs}s` : '';
}

// Transient status bubble (not persisted), shown for the active tab.
// `startedAt` keeps the elapsed clock anchored to when the run began, so it
// survives tab switches and status changes rather than restarting.
function setStatus(v, startedAt = 0) {
  const s = normalizeStatus(v);
  if (!activeStatusEl) {
    const row = document.createElement('div');
    row.className = 'bot-row';
    activeStatusEl = document.createElement('div');
    activeStatusEl.className = 'msg bot status';

    const dot = document.createElement('span');
    dot.className = 'dot-pulse';

    const body = document.createElement('span');
    body.className = 'status-body';
    const line = document.createElement('span');
    line.className = 'status-line';
    const text = document.createElement('span');
    text.className = 'status-text';
    const elapsed = document.createElement('span');
    elapsed.className = 'status-elapsed';
    line.appendChild(text);
    line.appendChild(elapsed);
    const detail = document.createElement('span');
    detail.className = 'status-detail';
    body.appendChild(line);
    body.appendChild(detail);

    activeStatusEl.appendChild(dot);
    activeStatusEl.appendChild(body);
    row.appendChild(sprigAvatar());
    row.appendChild(activeStatusEl);
    els.conversation.appendChild(row);

    statusStartedAt = startedAt || Date.now();
    if (statusTimer) clearInterval(statusTimer);
    statusTimer = setInterval(renderElapsed, 1000);
  }
  if (startedAt) statusStartedAt = startedAt;

  activeStatusEl.dataset.phase = s.phase;
  activeStatusEl.querySelector('.status-text').textContent = s.text;
  const detailEl = activeStatusEl.querySelector('.status-detail');
  const detailText = statusDetailText(s);
  detailEl.textContent = detailText;
  detailEl.classList.toggle('empty', !detailText);
  renderElapsed();
  els.conversation.scrollTop = els.conversation.scrollHeight;
}

function clearStatus() {
  if (statusTimer) { clearInterval(statusTimer); statusTimer = null; }
  statusStartedAt = 0;
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
  els.suggestions.innerHTML = '';

  // Your places — one-click tiles above the idea chips (no data-q: they
  // navigate directly instead of going through the composer).
  const p = settings.places || {};
  const tiles = [];
  const defs = [
    ['email', '📧', p.email === 'gmail' ? 'Gmail' : p.email === 'outlook' ? 'Outlook' : 'Email'],
    ['blog', '✍️', 'Blog'], ['x', '𝕏', 'X'], ['bluesky', '🦋', 'Bluesky'],
    ['facebook', '📘', 'Facebook'], ['instagram', '📸', 'Instagram'], ['tiktok', '🎵', 'TikTok'],
  ];
  for (const [key, icon, label] of defs) {
    const u = placeUrl(key);
    if (u) tiles.push([icon, label, u]);
  }
  for (const ex of p.extras || []) {
    if (ex && ex.url && ex.name) tiles.push(['🔗', ex.name, normalizePlaceUrl(ex.url)]);
  }
  if (tiles.length) {
    const row = document.createElement('div');
    row.className = 'places-row';
    for (const [icon, label, u] of tiles.slice(0, 8)) {
      const btn = document.createElement('button');
      btn.className = 'place-tile';
      btn.textContent = `${icon} ${label}`;
      btn.title = u;
      btn.addEventListener('click', () => openUrlInTab(u));
      row.appendChild(btn);
    }
    els.suggestions.appendChild(row);
  }

  const picks = shuffleSuggestions(4);
  for (const [label, query] of picks) {
    const btn = document.createElement('button');
    btn.setAttribute('data-q', `Hey Sprig, ${query}`);
    btn.textContent = label;
    els.suggestions.appendChild(btn);
  }
}

// Hide every tab's webview (a composed page or the welcome overlay is taking
// the stage). Background sites deliberately stay ALIVE — audio keeps playing
// (the tab shows a 🔊 badge; click it to mute) and switching back is instant.
// Sites are only torn down when their tab closes or the LRU cap evicts them.
function hideWebviews() {
  for (const wv of webviews.values()) wv.hidden = true;
}

function showOverlay() {
  els.frame.hidden = false;
  els.frame.removeAttribute('srcdoc');
  hideWebviews();
  els.overlay.hidden = false;
  renderSuggestions();
}

function renderPageHtml(html, scrollY = 0) {
  hideWebviews();
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
  // Open at the current zoom level so composed pages match the toolbar/webview zoom.
  const zoomStyle = (settings.pageZoom && settings.pageZoom !== 1)
    ? `<style>html{zoom:${settings.pageZoom};}</style>`
    : '';
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
  const ttsShim = pageTtsShim(frameVoicesJson());
  els.frame.setAttribute('srcdoc', injectIntoHead(html, shim + ttsShim) + clearance + zoomStyle + CHERVIL_RUNTIME + restore);
}

function renderSite(url) {
  els.frame.hidden = true;
  els.frame.removeAttribute('srcdoc');
  els.overlay.hidden = true;
  const tab = activeTab();
  if (!tab) return;
  const wv = ensureWebview(tab);
  touchWebview(tab.id);
  for (const [tid, w] of webviews) w.hidden = tid !== tab.id;
  // Don't reload a site the webview is already on — tab switches land here with
  // entry.url matching getURL() (onWebviewNavigated keeps them in sync).
  let liveUrl = '';
  try { liveUrl = wv.getURL() || ''; } catch { /* not attached yet */ }
  if (liveUrl !== url && (wv.getAttribute('src') || '') !== url) wv.setAttribute('src', url);
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
    maybeRefreshEditorHtml(tab, entry); // same for image-editor shells
  }
  updateNavButtons();
  updatePlaceholder();
  updateBookmarkStar();
  updatePwFillButton();
  applyZoom();
  const onLiveSite = !!(entry && entry.kind === 'navigate');
  if (els.reload) els.reload.disabled = !onLiveSite;       // reload = live sites only (pages have ↻ Refresh on the remix bar)
  if (els.readerBtn) els.readerBtn.disabled = !onLiveSite; // reader = live sites only
  if (els.askPageBtn) els.askPageBtn.disabled = !onLiveSite; // ask-about-page = live sites only
  if (!onLiveSite && askPageArmed) setAskPageArmed(false); // disarm when leaving the site
  if (els.translateBtn) {
    els.translateBtn.disabled = !onLiveSite; // translate = live sites only
    if (!onLiveSite && !translateRunning) els.translateBtn.classList.remove('on');
  }
  if (els.readAloudBtn) els.readAloudBtn.disabled = !entry; // read-aloud = any page or site
  if (els.sendPhoneBtn) els.sendPhoneBtn.disabled = !onLiveSite; // send-to-phone = live sites (they have a URL)
  if (els.emailPageBtn) els.emailPageBtn.disabled = !(onLiveSite || (entry && entry.publishedUrl)); // email = anything with a URL to share
  if (els.shareFedicaBtn) els.shareFedicaBtn.disabled = !(onLiveSite || (entry && entry.publishedUrl)); // Fedica = anything with a URL to share
  if (els.pipBtn) els.pipBtn.disabled = !onLiveSite;       // PiP = live-site video only
  if (onLiveSite) applyTabMute();
}

// ---- Page zoom (Ctrl +/−/0) ----
// One zoom level for whatever's showing — a composed page (iframe) or an embedded
// site (webview). Discrete steps like a real browser. Persisted in settings.
// Live sites remember their own level (settings.siteZoom, keyed by hostname, like
// Chrome's per-origin zoom); settings.pageZoom is composed pages + the default.
const ZOOM_STEPS = [0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3];

// Hostname key for per-site zoom (www. collapsed so m.example ≠ example but
// www.example === example — matches how people think of "this site").
function zoomHostFor(entry) {
  if (!entry || entry.kind !== 'navigate' || !entry.url) return null;
  try { return new URL(entry.url).hostname.replace(/^www\./i, '') || null; } catch { return null; }
}

// The zoom that applies to a given tab's current entry (per-site memory wins).
function zoomForTab(tab) {
  const host = zoomHostFor(tab ? currentEntry(tab) : null);
  if (host && settings.siteZoom && typeof settings.siteZoom[host] === 'number') return settings.siteZoom[host];
  return settings.pageZoom || 1;
}

// The zoom that applies to what's showing right now.
function currentZoom() { return zoomForTab(activeTab()); }

// Push the current zoom to whichever view is visible and refresh the indicator.
function applyZoom() {
  const z = currentZoom();
  try { if (els.webview && !els.webview.hidden) els.webview.setZoomFactor(z); } catch { /* webview not ready */ }
  try {
    if (els.frame && !els.frame.hidden && els.frame.contentWindow) {
      els.frame.contentWindow.postMessage({ __chervil: true, type: 'zoom', factor: z }, '*');
    }
  } catch { /* frame not ready — the injected zoomStyle covers first paint */ }
  // Always reflect the level — the whole cluster is shown/hidden via the toolbar
  // toggle (settings.toolbar.zoom), not by whether we're at 100%.
  if (els.zoomIndicator) els.zoomIndicator.textContent = `${Math.round(z * 100)}%`;
}

function setZoom(z) {
  const level = Math.min(3, Math.max(0.5, Math.round(z * 100) / 100));
  const host = zoomHostFor(currentEntry(activeTab()));
  if (host) {
    // On a live site, remember the level for THAT site; matching the default
    // again forgets it (so the site follows the default from then on).
    if (!settings.siteZoom) settings.siteZoom = {};
    if (level === (settings.pageZoom || 1)) delete settings.siteZoom[host];
    else settings.siteZoom[host] = level;
  } else {
    settings.pageZoom = level;
  }
  applyZoom();
  scheduleSave();
  // No toast — it lands bottom-right on top of the minimized remix handle. The
  // always-visible zoom control shows the current level instead.
}

// Step to the next/previous zoom level relative to the closest current step.
function nudgeZoom(dir) {
  const cur = currentZoom();
  let nearest = 0;
  for (let i = 1; i < ZOOM_STEPS.length; i++) {
    if (Math.abs(ZOOM_STEPS[i] - cur) < Math.abs(ZOOM_STEPS[nearest] - cur)) nearest = i;
  }
  const idx = Math.min(ZOOM_STEPS.length - 1, Math.max(0, nearest + (dir > 0 ? 1 : -1)));
  setZoom(ZOOM_STEPS[idx]);
}

// ---- Print (Ctrl+P) ----
// Print the visible view: the webview prints itself; the sandboxed frame can't be
// driven from here, so we ask it to print itself via the runtime bridge.
function printCurrentView() {
  try {
    if (els.webview && !els.webview.hidden) { els.webview.print(); return; }
    if (els.frame && !els.frame.hidden && els.frame.contentWindow) {
      els.frame.contentWindow.postMessage({ __chervil: true, type: 'print' }, '*');
      return;
    }
    toast('Open a page or site first, then print.');
  } catch { toast('Couldn’t open the print dialog.'); }
}

// ---- Reader mode (declutter a live site) ----
// A Readability-lite extractor injected into the embedded site: it picks the main
// content root, strips chrome/ads/scripts, absolutizes links + images, and returns
// clean HTML. Runs client-side (no model cost). The result becomes a normal Chervil
// page (so Back returns to the live site, and Audio/Export work on it).
const READER_EXTRACT_JS = `(function(){
  try {
    function tlen(el){ return ((el&&el.innerText)||'').replace(/\\s+/g,' ').trim().length; }
    var root = document.querySelector('article') || document.querySelector('[role=main]') || document.querySelector('main');
    if(!root){
      var best=null,bestScore=0,cands=document.querySelectorAll('div,section');
      for(var i=0;i<cands.length;i++){
        var ps=cands[i].querySelectorAll(':scope > p'); if(ps.length<2) continue;
        var s=0; for(var j=0;j<ps.length;j++) s+=(ps[j].innerText||'').length;
        if(s>bestScore){bestScore=s;best=cands[i];}
      }
      root=best;
    }
    if(!root) return {ok:false};
    var clone=root.cloneNode(true);
    var kill=clone.querySelectorAll('script,style,noscript,nav,aside,header,footer,form,iframe,button,svg,video,audio,[role=navigation],[aria-hidden=true],.ad,.ads,.advert,.share,.social,.newsletter,.promo,.subscribe,.comments,.related,.sidebar');
    for(var k=0;k<kill.length;k++){ if(kill[k]&&kill[k].parentNode) kill[k].parentNode.removeChild(kill[k]); }
    var imgs=clone.querySelectorAll('img[src]'); for(var a=0;a<imgs.length;a++){ try{ imgs[a].setAttribute('src', new URL(imgs[a].getAttribute('src'), location.href).href); imgs[a].removeAttribute('srcset'); imgs[a].removeAttribute('loading'); }catch(e){} }
    var links=clone.querySelectorAll('a[href]'); for(var b=0;b<links.length;b++){ try{ links[b].setAttribute('href', new URL(links[b].getAttribute('href'), location.href).href); }catch(e){} }
    var all=clone.querySelectorAll('*'); for(var m=0;m<all.length;m++){ var el=all[m]; for(var x=el.attributes.length-1;x>=0;x--){ var an=el.attributes[x].name; if(an.indexOf('on')===0||an==='style'||an==='class'||an==='id') el.removeAttribute(an); } }
    if(tlen(clone)<200) return {ok:false};
    var h1=document.querySelector('h1');
    var title=(h1&&h1.innerText)||document.title||'';
    var by=''; var mby=document.querySelector('meta[name="author"], meta[property="article:author"]'); if(mby) by=mby.getAttribute('content')||'';
    return {ok:true, title:title.trim(), byline:(by||'').trim(), host:location.host, url:location.href, html:clone.innerHTML};
  } catch(e){ return {ok:false, error:String((e&&e.message)||e)}; }
})()`;

function buildReaderHtml(r) {
  const esc = (s) => String(s || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
  const title = esc(r.title || 'Article');
  const by = r.byline ? `<p class="byline">${esc(r.byline)}</p>` : '';
  const src = r.url ? `<p class="src"><a href="${esc(r.url)}">${esc(r.host || r.url)}</a></p>` : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
:root{color-scheme:light}
body{font-family:Georgia,'Times New Roman',serif;max-width:720px;margin:0 auto;padding:56px 24px 96px;line-height:1.7;font-size:19px;color:#1a1a1a;background:#faf9f7;}
h1{font-family:system-ui,-apple-system,sans-serif;font-size:32px;line-height:1.2;margin:0 0 8px;}
.byline{color:#666;font-style:italic;margin:0 0 2px;}
.src{margin:0 0 28px;font-family:system-ui,sans-serif;font-size:13px;}
.src a{color:#2c8a5b;text-decoration:none;}
img{max-width:100%;height:auto;border-radius:8px;margin:18px 0;}
a{color:#1a6e46;}
h2,h3{font-family:system-ui,-apple-system,sans-serif;line-height:1.3;margin-top:1.6em;}
blockquote{border-left:3px solid #d8d5cf;margin:1em 0;padding:0.2em 0 0.2em 1em;color:#555;}
pre{background:#f0ede8;padding:12px;border-radius:8px;overflow:auto;font-size:15px;}
hr{border:none;border-top:1px solid #e2ded7;margin:2em 0;}
</style></head><body>
<h1>${title}</h1>${by}${src}
<div class="reader-content">${r.html}</div>
</body></html>`;
}

async function openReaderView() {
  const tab = activeTab();
  const entry = currentEntry(tab);
  if (!entry || entry.kind !== 'navigate') { toast('Reader view works on a live website.'); return; }
  toast('Preparing reader view…');
  let r;
  try { r = await els.webview.executeJavaScript(READER_EXTRACT_JS, true); } catch { r = null; }
  if (!r || !r.ok || !r.html) { toast('Couldn’t find a readable article on this page.'); return; }
  pushEntry(tab, { kind: 'page', html: buildReaderHtml(r), title: `Reader · ${r.title || tab.title || 'Article'}`, query: entry.url, reader: true });
  if (r.title) tab.title = r.title;
  renderTabs();
  renderCurrentPage();
  scheduleSave();
}

// ---- "Ask about this page" (chat grounded in the live site) ----
// A light text extraction for chat context: prefers the main content root, falls
// back to the whole body, and carries the user's selection (likely what "this"
// refers to). Cheaper than READER_EXTRACT_JS — chat needs text, not clean HTML.
const PAGE_TEXT_EXTRACT_JS = `(function(){
  try {
    function txt(el){ return ((el&&el.innerText)||'').replace(/\\s+/g,' ').trim(); }
    var root = document.querySelector('article') || document.querySelector('[role=main]') || document.querySelector('main');
    var text = txt(root);
    if (text.length < 200) text = txt(document.body);
    var sel = ''; try { sel = String(window.getSelection() || '').replace(/\\s+/g,' ').trim(); } catch(e){}
    return { ok:true, title: document.title || '', url: location.href, text: text.slice(0, 60000), selection: sel.slice(0, 4000) };
  } catch(e){ return { ok:false }; }
})()`;

// Text + metadata of the live site showing in the webview, or null. Only valid
// for the active tab (the single shared webview shows the active tab's site).
async function extractLivePageContext(tab) {
  const entry = currentEntry(tab);
  if (!entry || entry.kind !== 'navigate' || tab.id !== activeId || !els.webview || els.webview.hidden) return null;
  try {
    const r = await els.webview.executeJavaScript(PAGE_TEXT_EXTRACT_JS, true);
    if (!r || !r.ok || !r.text) return null;
    return { text: r.text, meta: { kind: 'site', title: r.title || entry.title || '', url: r.url || entry.url || '', selection: r.selection || '' } };
  } catch { return null; }
}

// One-shot "Ask about this page": arms the composer so the NEXT submit routes to
// chat (with the live page as context) without flipping the sticky chat-mode
// toggle — mirrors how forceChat works for the extension's "Chervil Chat".
let askPageArmed = false;

function setAskPageArmed(on) {
  askPageArmed = !!on;
  if (els.askPageBtn) {
    els.askPageBtn.classList.toggle('on', askPageArmed);
    els.askPageBtn.setAttribute('aria-pressed', String(askPageArmed));
  }
  updatePlaceholder();
}

function toggleAskPage() {
  const entry = currentEntry(activeTab());
  if (!entry || entry.kind !== 'navigate') { toast('Ask about a page works on a live website.'); return; }
  setAskPageArmed(!askPageArmed);
  if (askPageArmed) els.prompt.focus();
}

// ---- Inline page translation (🌐) ----
// Sprig translates the live site in place: collect the page's visible text
// nodes once (kept alive in the page as window.__chervilTranslate so later
// calls can address them), send them to the model in bounded batches, and
// write the translations back into the same nodes. "Show original" restores
// the saved node values — no reload needed.
const TRANSLATE_COLLECT_JS = `(function(){
  try {
    var body = document.body; if (!body) return { ok:false };
    var walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, { acceptNode: function(n){
      var v = n.nodeValue; if (!v || v.trim().length < 2) return NodeFilter.FILTER_REJECT;
      var p = n.parentElement; if (!p) return NodeFilter.FILTER_REJECT;
      if (/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|CODE|PRE|SVG)$/i.test(p.tagName)) return NodeFilter.FILTER_REJECT;
      try { if (p.closest('[contenteditable="true"], input, select')) return NodeFilter.FILTER_REJECT; } catch(e){}
      var cs; try { cs = getComputedStyle(p); } catch(e){ return NodeFilter.FILTER_REJECT; }
      if (cs && (cs.display === 'none' || cs.visibility === 'hidden')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    var nodes = [], texts = [], total = 0, n;
    while ((n = walker.nextNode())) {
      nodes.push(n); texts.push(n.nodeValue); total += n.nodeValue.length;
      if (nodes.length >= 800 || total > 120000) break; // bound huge pages
    }
    if (!nodes.length) return { ok:false };
    window.__chervilTranslate = { nodes: nodes, orig: texts.slice(), translated: false };
    return { ok:true, texts: texts };
  } catch(e) { return { ok:false, error: String((e && e.message) || e) }; }
})()`;

const TRANSLATE_RESTORE_JS = `(function(){
  try {
    var st = window.__chervilTranslate;
    if (!st || !st.nodes || !st.translated) return false;
    for (var i = 0; i < st.nodes.length; i++) { try { st.nodes[i].nodeValue = st.orig[i]; } catch(e){} }
    st.translated = false;
    return true;
  } catch(e) { return false; }
})()`;

// Write one translated batch back into the collected nodes, starting at index s.
function translateApplyJs(startIndex, batchJson) {
  return `(function(){
    try {
      var st = window.__chervilTranslate; if (!st || !st.nodes) return false;
      var out = ${batchJson}, s = ${Number(startIndex) || 0};
      for (var i = 0; i < out.length; i++) { var node = st.nodes[s + i]; if (node) try { node.nodeValue = out[i]; } catch(e){} }
      st.translated = true;
      return true;
    } catch(e) { return false; }
  })()`;
}

let translateRunning = false;

async function translatePageTo(lang) {
  const tab = activeTab();
  const entry = currentEntry(tab);
  if (!entry || entry.kind !== 'navigate' || !els.webview || els.webview.hidden) { toast('Translate works on a live website.'); return; }
  if (translateRunning) { toast('Already translating this page…'); return; }
  translateRunning = true;
  if (els.translateBtn) els.translateBtn.classList.add('on');
  try {
    let col;
    try { col = await els.webview.executeJavaScript(TRANSLATE_COLLECT_JS, true); } catch { col = null; }
    if (!col || !col.ok || !Array.isArray(col.texts) || !col.texts.length) { toast('Couldn’t find translatable text on this page.'); return; }
    // Batch by segment count AND character budget so each model call stays reliable.
    const texts = col.texts;
    const batches = [];
    let cur = [], curChars = 0, curStart = 0;
    for (let i = 0; i < texts.length; i++) {
      cur.push(texts[i]); curChars += texts[i].length;
      if (cur.length >= 80 || curChars >= 6000) { batches.push({ start: curStart, items: cur }); curStart = i + 1; cur = []; curChars = 0; }
    }
    if (cur.length) batches.push({ start: curStart, items: cur });
    toast(`Translating to ${lang}…`);
    let failed = 0;
    for (let bi = 0; bi < batches.length; bi++) {
      // Stop if the user navigated away — the collected nodes died with the page.
      if (currentEntry(activeTab()) !== entry) { toast('Translation stopped — you left the page.'); return; }
      const b = batches[bi];
      try {
        const resp = await window.chervil.translate({ segments: b.items, targetLang: lang, config: providerConfig() });
        if (resp && resp.ok && Array.isArray(resp.segments) && resp.segments.length === b.items.length) {
          await els.webview.executeJavaScript(translateApplyJs(b.start, JSON.stringify(resp.segments)), true);
        } else failed++;
      } catch { failed++; }
      if (batches.length > 1 && els.translateBtn) els.translateBtn.title = `Translating… ${bi + 1}/${batches.length}`;
    }
    if (failed === batches.length) toast('Translation failed — check your provider key in Settings.');
    else toast(failed ? `Translated to ${lang} (${failed} section${failed > 1 ? 's' : ''} skipped).` : `Translated to ${lang}. 🌐 → Show original to switch back.`);
  } finally {
    translateRunning = false;
    if (els.translateBtn) els.translateBtn.title = 'Translate this page';
  }
}

async function restoreTranslation() {
  let ok = false;
  try { ok = await els.webview.executeJavaScript(TRANSLATE_RESTORE_JS, true); } catch { ok = false; }
  if (els.translateBtn) els.translateBtn.classList.remove('on');
  toast(ok ? 'Original restored.' : 'Nothing to restore on this page.');
}

function openTranslateSheet() {
  const entry = currentEntry(activeTab());
  if (!entry || entry.kind !== 'navigate') { toast('Translate works on a live website.'); return; }
  const lang = settings.translateLang || 'English';
  showActionSheet('Translate this page', 'Sprig translates the page in place — layout and links stay put.', [
    { label: `Translate to ${lang}`, primary: true, onClick: () => translatePageTo(lang) },
    { label: 'Translate to another language…', onClick: async () => {
      const v = await showInputSheet({ title: 'Translate to…', subtitle: 'Any language — e.g. Spanish, French, Japanese.', placeholder: lang, okLabel: 'Translate' });
      const chosen = (v || '').trim();
      if (!chosen) return;
      settings.translateLang = chosen;
      scheduleSave();
      translatePageTo(chosen);
    } },
    { label: 'Show original', onClick: restoreTranslation },
  ]);
}

// ---- Region screenshot (✂ snip → ask Sprig) ----
// Drag a rect over anything on screen; the capture happens AFTER the overlay is
// removed (so the dim/box never appears in the shot). Live-site rects fully
// inside the webview capture via webview.capturePage (embedder captures of
// guest content are unreliable); everything else captures via the main process.
let snipActive = false;

function startSnip() {
  if (snipActive) return;
  snipActive = true;
  const ov = document.createElement('div');
  ov.className = 'snip-overlay';
  const box = document.createElement('div');
  box.className = 'snip-box';
  box.hidden = true;
  ov.appendChild(box);
  const hint = document.createElement('div');
  hint.className = 'snip-hint';
  hint.textContent = 'Drag to snip — Esc to cancel';
  ov.appendChild(hint);
  let sx = 0, sy = 0, dragging = false;
  const done = () => { snipActive = false; ov.remove(); document.removeEventListener('keydown', onKey, true); };
  const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); done(); } };
  document.addEventListener('keydown', onKey, true);
  ov.addEventListener('mousedown', (e) => {
    dragging = true; sx = e.clientX; sy = e.clientY;
    Object.assign(box.style, { left: `${sx}px`, top: `${sy}px`, width: '0px', height: '0px' });
    box.hidden = false;
    hint.hidden = true;
  });
  ov.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    Object.assign(box.style, {
      left: `${Math.min(sx, e.clientX)}px`, top: `${Math.min(sy, e.clientY)}px`,
      width: `${Math.abs(e.clientX - sx)}px`, height: `${Math.abs(e.clientY - sy)}px`,
    });
  });
  ov.addEventListener('mouseup', (e) => {
    if (!dragging) return;
    const x = Math.min(sx, e.clientX), y = Math.min(sy, e.clientY);
    const w = Math.abs(e.clientX - sx), h = Math.abs(e.clientY - sy);
    done();
    if (w >= 8 && h >= 8) captureSnip(x, y, w, h); // smaller = a stray click
  });
  document.body.appendChild(ov);
}

// ---- Lightweight image editor (snips) ----------------------------------------
// A self-contained editor PAGE (regular tab entry, kind 'page'), so it can be
// revisited, bookmarked, and survives restarts. Client-side canvas tools (text,
// erase, crop, undo) work offline; the "Ask Sprig" box round-trips through the
// composed-page bridge (edit_image → BYO OpenAI/Gemini image edit). Every change
// commits back into entry.html so the tab always holds the latest image.
// Bump when imageEditorHtml's UI changes — editor tabs persist their built HTML
// in entry.html, so stale shells are re-rendered from entry.snipImage on open.
const IMAGE_EDITOR_HTML_VERSION = 4;

function imageEditorHtml(dataUrl, name) {
  const safeName = String(name || 'snip.png').replace(/[<>&"']/g, '');
  return `<!doctype html><html><head><meta charset="utf-8"><title>Edit ${safeName}</title><style>
  :root { color-scheme: dark; }
  body { margin: 0; background: #0b0d12; color: #e6e9ef; font: 13px -apple-system, "Segoe UI", Roboto, sans-serif; }
  #bar { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 10px 12px; border-bottom: 1px solid #232733; position: sticky; top: 0; background: #0b0d12; z-index: 5; }
  #bar .sep { width: 1px; height: 22px; background: #232733; margin: 0 4px; }
  button { background: #171b24; color: #e6e9ef; border: 1px solid #2a2f3d; border-radius: 8px; padding: 6px 12px; font-size: 13px; cursor: pointer; }
  button:hover { border-color: #7be0a3; }
  button.on { border-color: #7be0a3; background: #14231b; }
  button:disabled { opacity: .5; cursor: default; }
  #ask { flex: 1; min-width: 180px; background: #171b24; color: #e6e9ef; border: 1px solid #2a2f3d; border-radius: 8px; padding: 6px 10px; font-size: 13px; outline: none; }
  #ask:focus { border-color: #7be0a3; }
  #stage { display: flex; justify-content: center; padding: 18px; }
  #wrap { position: relative; }
  canvas { max-width: 100%; height: auto; display: block; border: 1px solid #2a2f3d; border-radius: 8px;
    background: repeating-conic-gradient(#14161c 0 25%, #0e1015 0 50%) 0 0 / 18px 18px; }
  #wrap.tool-text canvas { cursor: text; } #wrap.tool-erase canvas, #wrap.tool-crop canvas { cursor: crosshair; }
  #marq { position: absolute; border: 1.5px dashed #7be0a3; background: rgba(123,224,163,.12); pointer-events: none; display: none; }
  #ti { position: absolute; display: none; background: rgba(11,13,18,.9); color: #fff; border: 1px solid #7be0a3; border-radius: 6px; padding: 4px 8px; font-size: 14px; outline: none; min-width: 140px; }
  #note { padding: 0 14px 14px; color: #8b93a7; font-size: 12px; text-align: center; }
  #busy { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 9; align-items: center; justify-content: center; color: #e6e9ef; font-size: 14px; }
  </style></head><body>
  <div id="bar">
    <button id="t-text" title="Click the image to place text">T Text</button>
    <button id="t-erase" title="Drag a box to blend it away">◫ Erase</button>
    <button id="t-crop" title="Drag a box to crop to it">⛶ Crop</button>
    <button id="t-undo" title="Undo" disabled>↶ Undo</button>
    <span class="sep"></span>
    <button id="t-up" title="Double the resolution — faithful high-quality resample, right here, free">⤴ Upscale 2×</button>
    <button id="t-enhance" title="AI upscale + sharpen via your image key (regenerates — tiny details may shift)">✨ Enhance 2×</button>
    <span class="sep"></span>
    <input id="ask" placeholder="Ask Sprig to change the image… e.g. add a red arrow pointing at the button" />
    <button id="go">✨ Apply</button>
    <span class="sep"></span>
    <button id="x-copy">Copy</button>
    <button id="x-save">Save</button>
    <button id="x-viewer">Open in viewer</button>
    <button id="x-attach">Ask about it</button>
  </div>
  <div id="stage"><div id="wrap">
    <canvas id="cv"></canvas>
    <div id="marq"></div>
    <input id="ti" placeholder="Type, then Enter" />
  </div></div>
  <p id="note">Text, erase, and crop happen right here. “Ask Sprig” uses your Grok, OpenAI, or Gemini key (Settings → AI). Everything stays in this tab until you copy or save it.</p>
  <div id="busy">Sprig is editing the image…</div>
  <script>
  (function () {
    var cv = document.getElementById('cv'), ctx = cv.getContext('2d');
    var wrap = document.getElementById('wrap'), marq = document.getElementById('marq'), ti = document.getElementById('ti');
    var undoStack = [], tool = null;
    var img = new Image();
    img.onload = function () { cv.width = img.naturalWidth; cv.height = img.naturalHeight; ctx.drawImage(img, 0, 0); };
    img.src = ${JSON.stringify(dataUrl)};
    function snap() { undoStack.push(cv.toDataURL('image/png')); if (undoStack.length > 15) undoStack.shift(); document.getElementById('t-undo').disabled = false; }
    function commit() { try { window.chervil && window.chervil.call('editor_commit', { image: cv.toDataURL('image/png') }); } catch (e) {} }
    function loadInto(dataUrl2) { var im = new Image(); im.onload = function () { cv.width = im.naturalWidth; cv.height = im.naturalHeight; ctx.drawImage(im, 0, 0); commit(); }; im.src = dataUrl2; }
    // AI results come back at the provider's generation size (e.g. 1k-wide even
    // for a small snip) — scale them back DOWN to fit the pre-edit dimensions,
    // preserving the result's aspect. Never upscale.
    function loadEdited(dataUrl2, ow, oh) {
      var im = new Image();
      im.onload = function () {
        var w = im.naturalWidth, h = im.naturalHeight;
        if (w > ow || h > oh) { var s = Math.min(ow / w, oh / h); w = Math.max(1, Math.round(w * s)); h = Math.max(1, Math.round(h * s)); }
        cv.width = w; cv.height = h;
        ctx.drawImage(im, 0, 0, w, h);
        commit();
      };
      im.src = dataUrl2;
    }
    function setTool(t) { tool = tool === t ? null : t; ['text','erase','crop'].forEach(function (k) { document.getElementById('t-' + k).classList.toggle('on', tool === k); wrap.classList.toggle('tool-' + k, tool === k); }); ti.style.display = 'none'; }
    ['text','erase','crop'].forEach(function (k) { document.getElementById('t-' + k).onclick = function () { setTool(k); }; });
    document.getElementById('t-undo').onclick = function () {
      var prev = undoStack.pop(); if (!prev) return;
      if (!undoStack.length) document.getElementById('t-undo').disabled = true;
      loadInto(prev);
    };
    function pos(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * (cv.width / r.width), y: (e.clientY - r.top) * (cv.height / r.height), rx: e.clientX - r.left + cv.offsetLeft, ry: e.clientY - r.top + cv.offsetTop }; }
    // Text: click to place, Enter to draw.
    cv.addEventListener('click', function (e) {
      if (tool !== 'text') return;
      var p = pos(e);
      ti.style.display = 'block'; ti.style.left = p.rx + 'px'; ti.style.top = p.ry + 'px';
      ti.dataset.x = p.x; ti.dataset.y = p.y; ti.value = ''; ti.focus();
    });
    ti.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { ti.style.display = 'none'; return; }
      if (e.key !== 'Enter' || !ti.value.trim()) return;
      snap();
      var size = Math.max(16, Math.round(cv.height * 0.05));
      ctx.font = '600 ' + size + 'px -apple-system, "Segoe UI", Roboto, sans-serif';
      ctx.textBaseline = 'top';
      ctx.lineWidth = Math.max(2, Math.round(size / 8)); ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.fillStyle = '#fff';
      ctx.strokeText(ti.value, +ti.dataset.x, +ti.dataset.y); ctx.fillText(ti.value, +ti.dataset.x, +ti.dataset.y);
      ti.style.display = 'none'; commit();
    });
    // Erase / crop: marquee drag.
    var drag = null;
    cv.addEventListener('pointerdown', function (e) {
      if (tool !== 'erase' && tool !== 'crop') return;
      drag = { a: pos(e) }; cv.setPointerCapture(e.pointerId);
      marq.style.display = 'block';
    });
    cv.addEventListener('pointermove', function (e) {
      if (!drag) return;
      drag.b = pos(e);
      var x = Math.min(drag.a.rx, drag.b.rx), y = Math.min(drag.a.ry, drag.b.ry);
      marq.style.left = x + 'px'; marq.style.top = y + 'px';
      marq.style.width = Math.abs(drag.a.rx - drag.b.rx) + 'px'; marq.style.height = Math.abs(drag.a.ry - drag.b.ry) + 'px';
    });
    cv.addEventListener('pointerup', function () {
      marq.style.display = 'none';
      if (!drag || !drag.b) { drag = null; return; }
      var x = Math.round(Math.min(drag.a.x, drag.b.x)), y = Math.round(Math.min(drag.a.y, drag.b.y));
      var w = Math.round(Math.abs(drag.a.x - drag.b.x)), h = Math.round(Math.abs(drag.a.y - drag.b.y));
      drag = null;
      if (w < 4 || h < 4) return;
      if (tool === 'erase') {
        snap();
        // Blend the box away with the average of a ring just outside it.
        var pad = 6, sx = Math.max(0, x - pad), sy = Math.max(0, y - pad);
        var sw = Math.min(cv.width - sx, w + pad * 2), sh = Math.min(cv.height - sy, h + pad * 2);
        var d = ctx.getImageData(sx, sy, sw, sh).data, r = 0, g = 0, b = 0, n = 0;
        for (var i = 0; i < d.length; i += 4 * 7) { r += d[i]; g += d[i+1]; b += d[i+2]; n++; }
        ctx.fillStyle = 'rgb(' + Math.round(r/n) + ',' + Math.round(g/n) + ',' + Math.round(b/n) + ')';
        ctx.fillRect(x, y, w, h); commit();
      } else if (tool === 'crop') {
        snap();
        var cut = ctx.getImageData(x, y, w, h);
        cv.width = w; cv.height = h; ctx.putImageData(cut, 0, 0); commit();
      }
    });
    // Ask Sprig (AI edit via the page bridge).
    var busyEl = document.getElementById('busy'), askEl = document.getElementById('ask'), goBtn = document.getElementById('go');
    function askSprig() {
      var instruction = askEl.value.trim();
      if (!instruction || !window.chervil) return;
      busyEl.style.display = 'flex'; goBtn.disabled = true;
      var ow = cv.width, oh = cv.height;
      window.chervil.call('edit_image', { image: cv.toDataURL('image/png'), instruction: instruction })
        .then(function (res) { if (res && res.image) { snap(); loadEdited(res.image, ow, oh); askEl.value = ''; } })
        .catch(function (err) { document.getElementById('note').textContent = '⚠ ' + (err && err.message || err); })
        .finally(function () { busyEl.style.display = 'none'; goBtn.disabled = false; });
    }
    goBtn.onclick = askSprig;
    askEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') askSprig(); });
    // Local upscale: multi-pass-free 2× with high-quality resampling. Faithful
    // (no regeneration) and offline — the print/publish "300 DPI" workhorse.
    document.getElementById('t-up').onclick = function () {
      var MAX = 4096;
      if (cv.width * 2 > MAX || cv.height * 2 > MAX) { document.getElementById('note').textContent = 'Already at the maximum size (' + cv.width + '×' + cv.height + ').'; return; }
      snap();
      var tmp = document.createElement('canvas');
      tmp.width = cv.width * 2; tmp.height = cv.height * 2;
      var tctx = tmp.getContext('2d');
      tctx.imageSmoothingEnabled = true; tctx.imageSmoothingQuality = 'high';
      tctx.drawImage(cv, 0, 0, tmp.width, tmp.height);
      cv.width = tmp.width; cv.height = tmp.height;
      ctx.drawImage(tmp, 0, 0);
      document.getElementById('note').textContent = 'Upscaled to ' + cv.width + '×' + cv.height + '.';
      commit();
    };
    // AI enhance: real detail synthesis at the provider's 2k tier. Regenerative —
    // adopt the model's full-size result rather than rescaling it back down.
    document.getElementById('t-enhance').onclick = function () {
      if (!window.chervil) return;
      busyEl.style.display = 'flex';
      window.chervil.call('edit_image', {
        image: cv.toDataURL('image/png'),
        instruction: 'Upscale and enhance this image to a higher resolution. Increase sharpness and detail. Do NOT add, remove, move, or change ANY content, text, colors, or layout — produce an exact higher-resolution version only.',
        resolution: '2k',
      })
        .then(function (res) { if (res && res.image) { snap(); loadInto(res.image); document.getElementById('note').textContent = 'AI-enhanced.'; } })
        .catch(function (err) { document.getElementById('note').textContent = '⚠ ' + (err && err.message || err); })
        .finally(function () { busyEl.style.display = 'none'; });
    };
    // The host composer forwards edit requests here — typing "add a red arrow…"
    // in Chervil's main bar edits this image instead of composing a page.
    window.addEventListener('message', function (e) {
      var d = e.data;
      if (!d || d.__chervil !== true || d.type !== 'edit-instruction' || !d.text) return;
      askEl.value = String(d.text);
      askSprig();
    });
    // Exports round-trip through the host (the sandboxed frame can't reach the
    // clipboard, Downloads, or the OS shell itself).
    function exportAs(action) {
      if (!window.chervil) return;
      window.chervil.call('editor_export', { action: action, image: cv.toDataURL('image/png') })
        .catch(function (err) { document.getElementById('note').textContent = '⚠ ' + (err && err.message || err); });
    }
    document.getElementById('x-copy').onclick = function () { exportAs('copy'); };
    document.getElementById('x-save').onclick = function () { exportAs('save'); };
    document.getElementById('x-viewer').onclick = function () { exportAs('viewer'); };
    document.getElementById('x-attach').onclick = function () { exportAs('attach'); };
  })();
  </script></body></html>`;
}

// Open a snip (or any data: image) in its own editor tab.
function openImageEditor(dataUrl, name) {
  const tab = newTab(true);
  const entry = {
    kind: 'page',
    title: `✏️ ${name}`,
    query: '',
    html: imageEditorHtml(dataUrl, name),
    imageEditor: true,
    snipName: name,
    snipImage: dataUrl,
    editorHtmlVersion: IMAGE_EDITOR_HTML_VERSION,
  };
  pushEntry(tab, entry);
  tab.title = `✏️ ${name}`;
  renderTabs();
  renderCurrentPage();
  scheduleSave();
}

// Re-render a stale editor shell (same trick as maybeRefreshSkillHtml): the tab
// stores built HTML, so a UI fix would otherwise never reach existing editors.
// Pre-versioning tabs have no snipImage — pull the image out of the stored HTML.
function maybeRefreshEditorHtml(tab, entry) {
  if (!entry || !entry.imageEditor || entry.editorHtmlVersion === IMAGE_EDITOR_HTML_VERSION) return;
  let image = entry.snipImage;
  if (!image) {
    const m = /img\.src = "(data:image\/[^"]+)"/.exec(entry.html || '');
    image = m && m[1];
  }
  if (!image) return; // can't recover the image — keep the old shell
  entry.snipImage = image;
  entry.html = imageEditorHtml(image, entry.snipName || 'snip.png');
  entry.editorHtmlVersion = IMAGE_EDITOR_HTML_VERSION;
  scheduleSave();
  if (activeTab() === tab && currentEntry(tab) === entry) renderPageHtml(entry.html);
}

// The composer, pointed at an image-editor tab, edits the image (the request is
// forwarded into the editor's own Ask-Sprig box) — see handleComposerSubmit.
function forwardEditToImageEditor(instruction) {
  try {
    els.frame.contentWindow.postMessage({ __chervil: true, type: 'edit-instruction', text: String(instruction || '') }, '*');
    toast('Sprig is editing the image…');
  } catch {
    toast('Couldn’t reach the image editor — use the box on the image page.');
  }
}

async function captureSnip(x, y, w, h) {
  // Two frames so the overlay's removal has actually painted before we shoot.
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  let dataUrl = null;
  try {
    const wv = els.webview;
    const entry = currentEntry(activeTab());
    const wvRect = (entry && entry.kind === 'navigate' && wv && !wv.hidden) ? wv.getBoundingClientRect() : null;
    if (wvRect && x >= wvRect.left && y >= wvRect.top && x + w <= wvRect.right && y + h <= wvRect.bottom) {
      // Rect fully inside the live site → let the guest capture itself.
      const img = await wv.capturePage({ x: Math.round(x - wvRect.left), y: Math.round(y - wvRect.top), width: Math.round(w), height: Math.round(h) });
      dataUrl = img && img.toDataURL ? img.toDataURL() : null;
    }
    if (!dataUrl) {
      const shot = await window.chervil.captureWindow({ x, y, width: w, height: h });
      dataUrl = (shot && shot.ok && shot.dataUrl) || null;
    }
  } catch { dataUrl = null; }
  if (!dataUrl) { toast('Couldn’t capture that region.'); return; }
  const m = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
  if (!m || !m[2]) { toast('Couldn’t capture that region.'); return; }
  const now = new Date();
  const name = `snip-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}.png`;
  showActionSheet('Got your snip', 'What do you want to do with it?', [
    { label: 'Ask Sprig about it', primary: true, onClick: () => {
      if (pendingAttachments.length >= MAX_ATTACH) { toast(`Up to ${MAX_ATTACH} files at a time.`); return; }
      pendingAttachments.push({ id: uid(), name, kind: 'image', data: m[2], mediaType: m[1] || 'image/png' });
      renderAttachChips();
      els.prompt.focus();
      toast('Snip attached — ask away.');
    } },
    { label: 'Copy to clipboard', onClick: async () => {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        await navigator.clipboard.write([new ClipboardItem({ [blob.type || 'image/png']: blob })]);
        toast('Snip copied.');
      } catch { toast('Couldn’t copy the snip.'); }
    } },
    { label: 'Edit in Chervil', onClick: () => openImageEditor(dataUrl, name) },
    { label: 'Save to Downloads', onClick: () => {
      const a = document.createElement('a');
      a.href = dataUrl; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
    } },
    { label: 'Open in image viewer', onClick: async () => {
      const r = window.chervil.openImage ? await window.chervil.openImage({ dataUrl, name }) : null;
      if (!r || !r.ok) toast('Couldn’t open the image viewer.');
    } },
  ]);
}

// ---- Picture-in-picture (live-site video) ----
async function togglePictureInPicture() {
  if (!els.webview || els.webview.hidden) { toast('Open a site with a video first.'); return; }
  const js = `(async()=>{try{
    if(document.pictureInPictureElement){await document.exitPictureInPicture();return 'exit';}
    var v=[...document.querySelectorAll('video')].find(function(x){return !x.paused;})||document.querySelector('video');
    if(!v)return 'none';
    await v.requestPictureInPicture();return 'ok';
  }catch(e){return 'err:'+(e&&e.message||e);}})()`;
  let r; try { r = await els.webview.executeJavaScript(js, true); } catch { r = 'err'; }
  if (r === 'none') toast('No video found on this page.');
  else if (typeof r === 'string' && r.startsWith('err')) toast('Picture-in-picture isn’t available here.');
}

// ---- Per-tab audio: mute + audible badge ----
// (Audible state lives in webviewAudibleTabs, per tab — see the webview pool.)
function applyTabMute(tabId = activeId) {
  const tab = tabs.find((t) => t.id === tabId);
  const wv = webviews.get(tabId);
  try { if (wv) wv.setAudioMuted(!!(tab && tab.muted)); } catch { /* not ready */ }
}
function toggleTabMute(id) {
  const tab = tabs.find((t) => t.id === id) || activeTab();
  if (!tab) return;
  tab.muted = !tab.muted;
  applyTabMute(tab.id); // works for background tabs too — their webviews are live
  renderTabs();
  scheduleSave();
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
  if (show) { updateLiveControls(); updateSourcesButton(); updateFollowupDock(); }
  else { stopAudio(); els.sourcesPanel.hidden = true; }
}

// The in-page follow-up input refines a composed page in place. It only applies
// to ask-composed pages — skill-built pages (lessons/quizzes/compare) and the
// image editor aren't refined via the ask pipeline, so hide it there.
function updateFollowupDock() {
  if (!els.followupForm) return;
  const cur = currentEntry(activeTab());
  const refinable = !!(cur && cur.kind === 'page' && !cur.lesson && !cur.skill && !cur.imageEditor);
  els.followupForm.hidden = !refinable;
}

// Send a follow-up: refine THIS page in place (force refine, never navigate away).
function handleFollowup(e) {
  if (e) e.preventDefault();
  const tab = activeTab();
  const cur = currentEntry(tab);
  if (!cur || cur.kind !== 'page' || cur.lesson || cur.skill || cur.imageEditor) return;
  const q = (els.followupInput.value || '').trim();
  if (!q) return;
  if (isTabBusy(tab.id) || agentRunning) { toast('Sprig is busy — try again in a moment.'); return; }
  els.followupInput.value = '';
  els.followupInput.blur();
  submitQuery(q, { tab, refineMode: 'force', skipFollowup: true, allowNavigate: false, displayText: q });
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
  updateFollowupDock();
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
  // Ambient freshness: surface the freshest-source recency in the tooltip.
  const fresh = n ? freshnessSummary(cur.sources || []) : '';
  els.sourcesBtn.title = fresh ? `Sources Sprig used — ${fresh}` : 'Sources Sprig used';
}

// Try to turn a web-search "page age" string (e.g. "April 30, 2025",
// "2025-04-30", "3 days ago") into a Date, so we can show a consistent freshness
// signal. Returns null when it can't be parsed (many results carry no date).
function parseSourceAge(age) {
  const s = String(age || '').trim();
  if (!s) return null;
  const rel = s.match(/^(\d+)\s+(day|week|month|year|hour|minute)s?\s+ago$/i);
  if (rel) {
    const n = Number(rel[1]); const now = Date.now();
    const ms = { minute: 6e4, hour: 36e5, day: 864e5, week: 6048e5, month: 2592e6, year: 31536e6 }[rel[2].toLowerCase()];
    return new Date(now - n * ms);
  }
  const t = Date.parse(s);
  return Number.isFinite(t) ? new Date(t) : null;
}

// "3 days ago" / "2 months ago" from a Date, for the freshness label.
function relativeAge(date) {
  const diff = Date.now() - date.getTime();
  if (diff < 0) return 'just now';
  const day = 864e5;
  if (diff < day) return 'today';
  const d = Math.round(diff / day);
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.round(d / 7)}w ago`;
  if (d < 365) return `${Math.round(d / 30)}mo ago`;
  return `${Math.round(d / 365)}y ago`;
}

// A one-line freshness summary from the sources' dates: how many are dated and
// how recent the freshest one is. Returns '' when nothing is dated.
function freshnessSummary(sources) {
  const dated = sources.map((s) => parseSourceAge(s && s.age)).filter(Boolean);
  if (!dated.length) return '';
  const newest = new Date(Math.max(...dated.map((d) => d.getTime())));
  return `Freshest source ${relativeAge(newest)} · ${dated.length} of ${sources.length} dated`;
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
    const fresh = freshnessSummary(sources);
    if (fresh) {
      const f = document.createElement('div');
      f.className = 'src-fresh';
      f.innerHTML = '<span class="dot"></span>';
      f.appendChild(document.createTextNode('🕒 ' + fresh));
      sec2.appendChild(f);
    }
    for (const s of sources) {
      const a = document.createElement('div');
      a.className = 'src-item';
      a.title = s.url;
      const t = document.createElement('span');
      t.className = 'src-title';
      t.textContent = s.title || s.url;
      a.appendChild(t);
      const dt = parseSourceAge(s.age);
      if (dt) {
        const age = document.createElement('span');
        age.className = 'src-age';
        age.textContent = relativeAge(dt);
        a.appendChild(age);
      }
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

// --- Pronunciation / page TTS bridge -------------------------------------
// Composed pages run in a sandboxed iframe where speechSynthesis is inert, so
// their "Listen / pronounce" buttons forward here (see pageTtsShim) and we speak
// from the top-level renderer, where TTS works, posting events back to the page.

// Best-effort language guess from the script of the text, so a Chinese phrase
// gets a Chinese voice even when the page didn't set utterance.lang.
function guessTtsLang(text) {
  const s = String(text || '');
  if (/[぀-ヿ]/.test(s)) return 'ja-JP';   // hiragana/katakana
  if (/[가-힯]/.test(s)) return 'ko-KR';   // hangul
  if (/[一-鿿]/.test(s)) return 'zh-CN';   // CJK ideographs
  if (/[؀-ۿ]/.test(s)) return 'ar-SA';   // arabic
  if (/[Ѐ-ӿ]/.test(s)) return 'ru-RU';   // cyrillic
  return '';
}

// Pick a voice for a requested lang (falling back to an explicit voiceURI, then
// the user's narration voice). A language match matters most for pronunciation.
function voiceForTts(lang, voiceURI) {
  const vs = cachedVoices.length ? cachedVoices : (window.speechSynthesis ? window.speechSynthesis.getVoices() : []);
  if (voiceURI) {
    const exact = vs.find((v) => v.voiceURI === voiceURI || v.name === voiceURI);
    if (exact) return exact;
  }
  if (lang) {
    const pre = lang.slice(0, 2).toLowerCase();
    const langVoices = vs.filter((v) => (v.lang || '').toLowerCase().startsWith(pre));
    if (langVoices.length) {
      return langVoices.find((v) => /natural|online|google|microsoft/i.test(v.name)) || langVoices[0];
    }
  }
  return pickVoice();
}

function handleFrameTts(source, msg) {
  if (!window.speechSynthesis) return;
  const send = (event) => {
    try { if (source) source.postMessage({ __chervil: true, type: 'tts-event', id: msg.id, event }, '*'); }
    catch { /* ignore */ }
  };
  const action = msg.action;
  if (action === 'cancel') { try { window.speechSynthesis.cancel(); } catch { /* ignore */ } return; }
  if (action === 'pause') { try { window.speechSynthesis.pause(); } catch { /* ignore */ } return; }
  if (action === 'resume') { try { window.speechSynthesis.resume(); } catch { /* ignore */ } return; }
  if (action !== 'speak') return;
  const text = String(msg.text || '').trim();
  if (!text) return;
  // A pronunciation tap replaces any in-flight speech (including a page narration)
  // so words don't overlap.
  if (audioPlaying) stopAudio();
  try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
  const u = new SpeechSynthesisUtterance(text);
  const lang = msg.lang || guessTtsLang(text);
  if (lang) u.lang = lang;
  const rate = Number(msg.rate);
  if (rate >= 0.1 && rate <= 10) u.rate = rate;
  const pitch = Number(msg.pitch);
  if (pitch >= 0 && pitch <= 2) u.pitch = pitch;
  const v = voiceForTts(lang, msg.voiceURI);
  if (v) u.voice = v;
  u.onstart = () => send('start');
  u.onend = () => send('end');
  u.onerror = () => send('error');
  try { window.speechSynthesis.speak(u); } catch { send('error'); }
}

function playPageAudio() {
  const tab = activeTab();
  const cur = currentEntry(tab);
  if (!cur || cur.kind !== 'page') return;
  startAudio(stripText(cur.html), cur.title);
}

// ---- Read this page aloud (🔊 in the omnibar) ----
// The remix bar's Audio covers composed pages; this brings the same narration
// to live websites. Clicking while narrating stops. If the user highlighted a
// passage, read just that (natural "read me this part").
async function readPageAloud() {
  if (audioPlaying) { stopAudio(); return; }
  const tab = activeTab();
  const cur = currentEntry(tab);
  if (!cur) { toast('Open a page first.'); return; }
  if (cur.kind === 'page') { startAudio(stripText(cur.html), cur.title); return; }
  let r = null;
  try { r = await els.webview.executeJavaScript(PAGE_TEXT_EXTRACT_JS, true); } catch { r = null; }
  if (!r || !r.ok || !r.text || r.text.length < 40) { toast('Couldn’t find readable text on this page.'); return; }
  const sel = (r.selection || '').trim();
  startAudio(sel || r.text, r.title || cur.title || 'this page');
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
  if (!living.length && !schedules.length && !watchers.length) return;
  livingTimer = setInterval(schedulerTick, 30000); // check living pages + schedules + watchers every 30s
}

// Master 30s tick: drives Living-page refresh, scheduled agents, and page watchers.
function schedulerTick() {
  if (!living.length && !schedules.length && !watchers.length) { clearInterval(livingTimer); livingTimer = null; return; }
  tickLiving();
  tickSchedules();
  tickWatchers();
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

// --- Page watchers: poll a URL, notify when it changes / a condition is met --
function tickWatchers() {
  const now = Date.now();
  for (const w of watchers.slice()) {
    if (w.enabled && !w.running && now - (w.lastRun || 0) >= w.intervalMs) runWatcher(w);
  }
}

// Create + start a watcher for a URL. Runs an immediate baseline check so there's
// a value to compare against (and so a condition already true fires right away).
function createWatcher(url, title, condition, intervalMs) {
  if (!url) return null;
  const w = {
    id: uid(),
    url,
    title: title || hostOf(url),
    condition: (condition || '').trim(),
    intervalMs: intervalMs || 3600000, // hourly by default
    enabled: true,
    running: false,
    lastRun: 0,
    lastValue: '',
    lastSummary: '',
    lastChangedAt: 0,
    triggered: false,
  };
  watchers.push(w);
  startScheduler();
  scheduleSave();
  const what = w.condition ? `until “${w.condition}”` : 'for changes';
  toast(`👁 Watching “${w.title}” ${what} — I’ll check ${watchIntervalLabel(w.intervalMs)} and let you know.`);
  renderWatchersIfOpen();
  runWatcher(w); // baseline
  return w;
}

function watchIntervalLabel(ms) {
  const m = { 900000: 'every 15 min', 1800000: 'every 30 min', 3600000: 'hourly', 21600000: 'every 6 hours', 86400000: 'daily' };
  return m[ms] || 'periodically';
}

async function runWatcher(w) {
  if (w.running) return;
  w.running = true;
  w.lastRun = Date.now();
  renderWatchersIfOpen();
  try {
    const res = await window.chervil.watchCheck({
      url: w.url,
      condition: w.condition || '',
      lastValue: w.lastValue || '',
      config: providerConfig(),
    });
    if (res && res.ok) {
      const prevValue = w.lastValue || '';
      const conditionWatch = !!(w.condition && w.condition.trim());
      let fire = false;
      let note = '';
      if (conditionWatch) {
        // Edge-trigger: fire when the condition flips from unmet → met.
        if (res.met && !w.triggered) { fire = true; note = res.summary || 'Your condition is now met.'; }
        w.triggered = !!res.met;
      } else if (res.value && prevValue && res.value.trim().toLowerCase() !== prevValue.trim().toLowerCase()) {
        // Any-change watch: fire when the tracked value changes from a known baseline.
        fire = true;
        note = res.summary || `Changed to ${res.value}`;
      }
      if (res.value) w.lastValue = res.value;
      if (res.summary) w.lastSummary = res.summary;
      if (fire) {
        w.lastChangedAt = Date.now();
        toast(`👁 ${w.title}: ${note}`);
        if (settings.notifications && window.chervil.notify) {
          window.chervil.notify({ title: `Chervil · ${w.title}`, body: note, url: w.url });
        }
      }
    }
  } catch { /* transient failure — try again next tick */ }
  w.running = false;
  renderWatchersIfOpen();
  scheduleSave();
}

// Detect a "watch this page / tell me when …" request on a live site. Returns
// { condition } (condition '' = watch for any change) or null.
function parseWatchIntent(text) {
  const q = String(text || '').trim();
  let m = q.match(/^(?:watch|monitor|keep an eye on|track)\s+(?:this\s+page|this\s+site|it|this)\b(.*)$/i);
  if (m) {
    const rest = m[1]
      .replace(/^[\s,:.-]*(?:for|and)?\s*/i, '')
      .replace(/^(?:tell|let|notify|ping|alert)\s+me(?:\s+know)?\s*/i, '')
      .replace(/^(?:when|if|for)\s+/i, '')
      .trim();
    return { condition: rest };
  }
  m = q.match(/^(?:tell|let|notify|ping|alert)\s+me(?:\s+know)?\s+(?:when|if)\s+(.+)$/i);
  if (m) return { condition: m[1].trim() };
  return null;
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
  if (tab && tab.private) { els.liveSelect.value = 'off'; toast('Living pages aren’t available in private tabs.'); return; }
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
    const noisy = !!settings.noisyMode;
    await window.ChervilWake.start({
      ortWasm: wakeAssets.ortWasm,
      melspec: wakeAssets.melspec,
      embedding: wakeAssets.embedding,
      keywordModel: km.model,
      // Noisy room: floor the threshold high, demand a longer hold, cool down
      // longer — a broadcast that brushes the threshold once shouldn't wake us.
      threshold: noisy ? Math.max(settings.wakeThreshold || 0.5, 0.72) : (settings.wakeThreshold || 0.5),
      minHits: noisy ? 3 : 2,
      cooldownMs: noisy ? 8000 : 2500,
      onDetect: onWakeDetected,
      onError: (e) => setWakeStatus('Wake-word listening stopped — ' + errText(e, 'mic unavailable'), 'warn'),
    });
    const label = usingCustom ? (settings.wakeKeywordLabel || 'your model') : prettyWake(settings.wakeKeyword);
    setWakeStatus(`Listening for “${label}”…${noisy ? ' (noisy room mode)' : ''}`, 'ok');
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
    // Noisy room: shorter onset window, quicker cut on trailing noise, and a
    // higher above-the-floor bar before room audio counts as speech.
    const text = await captureUtterance(settings.noisyMode
      ? { maxMs: 8000, silenceMs: 1000, onsetMs: 2500, voiceBoost: 2.6 }
      : {});
    window.chervil.wakeDone && window.chervil.wakeDone();           // hide the listening bar
    if (text) {
      window.chervil.showMain && window.chervil.showMain();         // surface the result (only on a real request)
      // Noisy room ALWAYS gates — auto-compose stays off even if the user
      // disabled the confirm toggle back in quiet-room days.
      if (settings.wakeConfirm === false && !settings.noisyMode) {
        // Power-user / quiet-room path: compose straight from the wake.
        newTab(true);
        handleComposerSubmit(text);
      } else {
        // Default: show what Sprig heard and wait for an explicit OK. A false
        // trigger (e.g. TV audio) fills the bar but can never compose on its own.
        showWakeConfirm(text);
      }
    }
  } catch { /* ignore a failed capture */ }
  finally {
    wakeCapturing = false;
    try { if (settings.wakeEnabled && window.ChervilWake) await window.ChervilWake.resume(); } catch { /* ignore */ }
  }
}

// ---- Wake-word confirmation gate ----
// Shows the captured request and waits for the user to confirm (Compose/Enter) or
// cancel (Cancel/Esc/click-away). Auto-cancels after a timeout so an unattended
// false trigger simply disappears. Nothing composes until the user says so.
let wakeConfirmTimer = null;
let wakeConfirmText = '';

function showWakeConfirm(text) {
  wakeConfirmText = text;
  if (!els.wakeConfirm) { // fallback if the gate DOM is missing: just fill the composer
    els.prompt.value = text; autoGrowPrompt(); els.prompt.focus();
    return;
  }
  if (els.wakeConfirmText) els.wakeConfirmText.textContent = text;
  els.wakeConfirm.hidden = false;
  requestAnimationFrame(() => els.wakeConfirm.classList.add('show'));
  if (els.wakeConfirmGo) els.wakeConfirmGo.focus();
  clearTimeout(wakeConfirmTimer);
  wakeConfirmTimer = setTimeout(() => hideWakeConfirm(), 8000); // auto-cancel
}

function hideWakeConfirm() {
  clearTimeout(wakeConfirmTimer);
  wakeConfirmTimer = null;
  wakeConfirmText = '';
  if (!els.wakeConfirm) return;
  els.wakeConfirm.classList.remove('show');
  els.wakeConfirm.hidden = true;
}

function acceptWakeConfirm() {
  const text = wakeConfirmText;
  hideWakeConfirm();
  if (!text) return;
  newTab(true);
  handleComposerSubmit(text);
}

if (els.wakeConfirmGo) els.wakeConfirmGo.addEventListener('click', acceptWakeConfirm);
if (els.wakeConfirmCancel) els.wakeConfirmCancel.addEventListener('click', hideWakeConfirm);
if (els.wakeConfirm) {
  els.wakeConfirm.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); acceptWakeConfirm(); }
    else if (e.key === 'Escape') { e.preventDefault(); hideWakeConfirm(); }
  });
}

// Record the spoken command and auto-stop on silence (energy-based VAD), then
// transcribe via the configured voice-input endpoint. Returns the text or null.
async function captureUtterance({ maxMs = 9000, silenceMs = 1200, minMs = 500, onsetMs = 3500, voiceBoost = 2.0 } = {}) {
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
  // Adaptive noise floor: in a room with the TV on, the mic is never "silent",
  // so a fixed RMS cutoff hears the broadcast as speech. Track the quietest
  // recent level (dips between words) and call it voice only when the signal
  // clearly rises above that floor — or is loud outright (someone at the mic).
  let noiseFloor = Infinity;
  let aborted = false;

  return await new Promise((resolve) => {
    rec.addEventListener('stop', async () => {
      if (monitor) clearInterval(monitor);
      try { if (ac) await ac.close(); } catch { /* ignore */ }
      for (const t of stream.getTracks()) t.stop();
      // No actual speech (just ambient noise after a false wake) → don't send
      // the room's audio to the transcriber at all.
      if (aborted) return resolve(null);
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
      // Floor rides the minimum, decaying slowly upward so it can re-adapt.
      if (rms < noiseFloor) noiseFloor = rms;
      else noiseFloor = Math.min(noiseFloor * 1.03, rms);
      const voiceThresh = Math.max(0.045, (isFinite(noiseFloor) ? noiseFloor : 0) * voiceBoost);
      if (rms > voiceThresh || rms > 0.12) { lastVoiceAt = now; sawVoice = true; }
      const elapsed = now - startedAt;
      const silentFor = now - lastVoiceAt;
      // Nobody actually spoke within the onset window → this wake was spurious.
      if (analyser && !sawVoice && elapsed >= onsetMs) {
        aborted = true;
        try { rec.stop(); } catch { /* ignore */ }
        return;
      }
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

// ---- Payment-card autofill (RFC 0008, Phase 8.5): user-initiated ---------------
// Injected into the live <webview> to fill ONE saved card into a checkout form.
// Handles combined MM/YY fields and separate month/year inputs or <select>s.
// NEVER fills the CVC (we don't store it) and NEVER submits. Returns { found, filled }.
function cardFillScript(cardJson) {
  return `(function(){
    var c = ${cardJson};
    var mm = ('0'+c.expMonth).slice(-2);
    var yyyy = String(c.expYear);
    var yy = yyyy.slice(-2);
    function vis(el){ return el && el.offsetParent !== null && !el.disabled && !el.readOnly; }
    function hay(el){ return ((el.getAttribute('autocomplete')||'')+' '+(el.name||'')+' '+(el.id||'')+' '+(el.placeholder||'')+' '+(el.getAttribute('aria-label')||'')).toLowerCase(); }
    function setVal(el,val){ try{ el.focus(); el.value=val; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); return true; }catch(e){ return false; } }
    function setSelect(el,cands){
      var opts=Array.prototype.slice.call(el.options);
      for(var i=0;i<cands.length;i++){
        var want=String(cands[i]).toLowerCase();
        var m=opts.find(function(o){ return (o.value||'').toLowerCase()===want || (o.text||'').trim().toLowerCase()===want; });
        if(m){ el.value=m.value; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); return true; }
      }
      return false;
    }
    var fields = Array.prototype.slice.call(document.querySelectorAll('input, select')).filter(vis);
    var n=0, filledNumber=false;
    // 1) Card number (most identifying).
    var numEl = fields.find(function(el){ var h=hay(el); return el.tagName==='INPUT' && (/cc-number|cardnumber|card-number|ccnum/.test(h) || (/card/.test(h) && /number|num\\b/.test(h))); });
    if(numEl){ if(setVal(numEl, c.number)) { n++; filledNumber=true; } }
    // 2) Cardholder name.
    var nameEl = fields.find(function(el){ var h=hay(el); return el.tagName==='INPUT' && (/cc-name|ccname|card.?holder|name.?on.?card|cardname/.test(h) || (/card/.test(h)&&/name/.test(h))); });
    if(nameEl && c.cardholder){ if(setVal(nameEl, c.cardholder)) n++; }
    // 3) Expiry — separate month/year fields, else a combined field.
    var monthEl = fields.find(function(el){ var h=hay(el); return /cc-exp-month|exp.?month|expmonth|expiry.?month|expirationmonth/.test(h) || (/month/.test(h)&&/exp|card/.test(h)); });
    var yearEl = fields.find(function(el){ var h=hay(el); return /cc-exp-year|exp.?year|expyear|expiry.?year|expirationyear/.test(h) || (/year/.test(h)&&/exp|card/.test(h)); });
    if(monthEl || yearEl){
      if(monthEl){ var okm = monthEl.tagName==='SELECT' ? setSelect(monthEl,[mm,String(c.expMonth)]) : setVal(monthEl, mm); if(okm) n++; }
      if(yearEl){ var oky = yearEl.tagName==='SELECT' ? setSelect(yearEl,[yyyy,yy]) : setVal(yearEl, (yearEl.maxLength===2 ? yy : yyyy)); if(oky) n++; }
    } else {
      var expEl = fields.find(function(el){ var h=hay(el); return el.tagName==='INPUT' && (/cc-exp|expir|\\bexp\\b|mm.?\\/.?yy/.test(h)); });
      if(expEl){ var fmt = /yyyy/.test(hay(expEl)) ? (mm+'/'+yyyy) : (mm+'/'+yy); if(setVal(expEl, fmt)) n++; }
    }
    // NOTE: the CVC / security code is intentionally never filled — it is never stored.
    return { found: (filledNumber || n>0), filled: n };
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
    if (els.settingsModal && els.settingsModal.classList.contains('open')) { renderCredsPanel(); renderCardsPanel(); }
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
    title: 'Unlock your vault',
    subtitle: 'Enter your master passphrase to continue.',
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

// Fill one saved card into the live checkout form. Explicit action only: the user
// clicks 💳, unlocks the vault if needed, and picks a card. The full number lives
// in the renderer only for the moment it takes to inject it — never logged, never
// sent to the model.
async function doFillCard(cardId, cur) {
  const tab = activeTab();
  let res;
  try { res = await window.chervil.cards.forFill(cardId); } catch { res = null; }
  if (!res || !res.ok) { toast((res && res.error) || 'Couldn’t read that card.'); return; }
  const last4 = String(res.number || '').slice(-4);
  try {
    const r = await els.webview.executeJavaScript(cardFillScript(JSON.stringify({ number: res.number, cardholder: res.cardholder, expMonth: res.expMonth, expYear: res.expYear })), true);
    // Audit records WHAT happened, never the card number.
    auditAction({ type: 'card_fill', target: cur.url || '', decision: 'allow', ok: !!(r && r.filled) });
    if (r && r.found) {
      addMessage(tab, 'bot', r.filled
        ? `Filled your ${res.brand} ····${last4} on ${hostOf(cur.url) || 'this page'}. Enter the security code (CVC) and review before you pay — Chervil never submits a payment.`
        : 'Found a payment form but couldn’t fill it.');
    } else {
      toast('No payment form found on this page.');
    }
  } catch (e) {
    toast(`Couldn’t fill the card — ${errText(e, 'no payment form found')}.`);
  }
}

async function fillCardOnSite() {
  const tab = activeTab();
  const cur = currentEntry(tab);
  if (!cur || cur.kind !== 'navigate' || els.webview.hidden) { toast('Open a checkout page first.'); return; }
  if (!(await ensureVaultUnlocked())) return;
  let res;
  try { res = await window.chervil.cards.list(); } catch { res = null; }
  const items = (res && res.ok && res.items) || [];
  if (!items.length) { toast('No saved cards yet — add one in Settings → Security.'); return; }
  if (items.length === 1) { doFillCard(items[0].id, cur); return; }
  showActionSheet('Choose a card', 'Fill a saved card on this page',
    items.map((it) => ({ label: `${it.brand} ····${it.last4}${it.label ? ' · ' + it.label : ''}`, onClick: () => doFillCard(it.id, cur) })));
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
  updateCardFillButton(); // keep the 💳 affordance in sync at every call site
  const btn = els.pwFillBtn;
  if (!btn) return;
  const cur = currentEntry(activeTab());
  const onLive = !!(cur && cur.kind === 'navigate' && els.webview && !els.webview.hidden);
  btn.hidden = !onLive || !window.chervil.creds || !toolbarVisible('pwFill');
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

// Show/enable the 💳 fill button: only on a live site, enabled when the vault has
// at least one saved card (or needs unlocking first). Cards aren't origin-scoped —
// a card can fill any checkout — so we gate on "has cards", not on the domain.
async function updateCardFillButton() {
  const btn = els.cardFillBtn;
  if (!btn) return;
  const cur = currentEntry(activeTab());
  const onLive = !!(cur && cur.kind === 'navigate' && els.webview && !els.webview.hidden);
  btn.hidden = !onLive || !window.chervil.cards || !toolbarVisible('cardFill');
  if (btn.hidden) return;
  try {
    const r = await window.chervil.cards.count();
    if (!r || !r.ok || !r.configured) { btn.disabled = true; btn.classList.add('dim'); btn.title = 'No saved cards yet (set up in Settings → Security)'; return; }
    if (!r.unlocked) { btn.disabled = false; btn.classList.remove('dim'); btn.title = 'Fill a saved card (unlock required)'; return; }
    if (r.count > 0) { btn.disabled = false; btn.classList.remove('dim'); btn.title = `Fill a saved card (${r.count})`; }
    else { btn.disabled = true; btn.classList.add('dim'); btn.title = 'No saved cards yet (add one in Settings → Security)'; }
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
  const onLiveSite = !!(cur && cur.kind === 'navigate');
  // Chat wins over the live-site agent at submit time (see handleComposerSubmit),
  // so the placeholder must reflect that same precedence.
  if (onLiveSite && askPageArmed) els.prompt.placeholder = 'Ask about this page…';
  else if (settings.chatMode) els.prompt.placeholder = onLiveSite ? 'Chat about this page, or anything…' : 'Chat with Sprig…';
  else if (onLiveSite) els.prompt.placeholder = 'Hey Sprig, act here…';
  else els.prompt.placeholder = skillMode === 'learn' ? 'What do you want to learn?' : skillMode === 'quiz' ? 'Quiz me on…' : skillMode === 'compare' ? 'Compare… (e.g. iPhone 16 vs Pixel 9)' : deepMode ? 'Hey Sprig, research…' : 'Hey Sprig, ask…';
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
  rs.status = null;
  rs.startedAt = 0;
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
function openSched() { populateSchedAgentSelect(); renderSchedules(); renderWatchers(); els.schedView.classList.add('open'); }
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
function renderWatchersIfOpen() { if (els.schedView && els.schedView.classList.contains('open')) renderWatchers(); }

// The Page-watchers list in the Schedules panel.
function renderWatchers() {
  const list = document.getElementById('watch-list');
  if (!list) return;
  list.innerHTML = '';
  if (!watchers.length) {
    const e = document.createElement('div');
    e.className = 'sched-empty';
    e.textContent = 'No page watchers yet. Add a URL above, or say “watch this page…” on any live site.';
    list.appendChild(e);
    return;
  }
  for (const w of watchers) {
    const item = document.createElement('div');
    item.className = 'sched-item';
    const main = document.createElement('div');
    main.className = 'si-main';
    const title = document.createElement('div');
    title.className = 'si-title';
    title.textContent = '👁 ' + (w.title || hostOf(w.url));
    const when = document.createElement('div');
    when.className = 'si-when';
    const bits = [w.condition ? `until “${w.condition}”` : 'any change', watchIntervalLabel(w.intervalMs)];
    if (!w.enabled) bits.push('paused');
    if (w.running) bits.push('checking…');
    if (w.lastValue) bits.push(`now: ${w.lastValue}`);
    if (w.lastRun) bits.push('checked ' + relTime(w.lastRun));
    when.textContent = bits.join(' · ');
    main.appendChild(title);
    main.appendChild(when);

    const checkBtn = document.createElement('button');
    checkBtn.className = 'si-btn';
    checkBtn.textContent = 'Check now';
    checkBtn.addEventListener('click', () => runWatcher(w));
    const openBtn = document.createElement('button');
    openBtn.className = 'si-btn';
    openBtn.textContent = 'Open';
    openBtn.addEventListener('click', () => { closeSched(); openUrlInTab(w.url); });
    const tog = document.createElement('button');
    tog.className = 'si-btn';
    tog.textContent = w.enabled ? 'Pause' : 'Resume';
    tog.addEventListener('click', () => { w.enabled = !w.enabled; if (w.enabled) startScheduler(); scheduleSave(); renderWatchers(); });
    const del = document.createElement('button');
    del.className = 'si-btn';
    del.textContent = 'Delete';
    del.addEventListener('click', () => { addTombstone('watchers', w.id); watchers = watchers.filter((x) => x.id !== w.id); scheduleSave(); renderWatchers(); });

    item.appendChild(main);
    item.appendChild(checkBtn);
    item.appendChild(openBtn);
    item.appendChild(tog);
    item.appendChild(del);
    list.appendChild(item);
  }
}

function addWatcherFromForm() {
  const urlEl = document.getElementById('watch-url');
  const condEl = document.getElementById('watch-cond');
  const intEl = document.getElementById('watch-interval');
  const raw = (urlEl.value || '').trim();
  if (!raw) { toast('Enter a page URL to watch.'); return; }
  const url = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
  const intervalMs = parseInt(intEl.value, 10) || 3600000;
  createWatcher(url, hostOf(url), (condEl.value || '').trim(), intervalMs);
  urlEl.value = ''; condEl.value = '';
  renderWatchers();
}

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
    del.addEventListener('click', () => { addTombstone('schedules', sch.id); schedules = schedules.filter((s) => s.id !== sch.id); scheduleSave(); renderSchedules(); });

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
      addTombstone('agents', a.id);
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
// Human labels for skills (toasts / tab titles), keyed by skill id.
const SKILL_LABELS = { learn: 'lesson', quiz: 'quiz', compare: 'comparison' };
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
  if (els.compareToggle) {
    els.compareToggle.classList.toggle('active', skillMode === 'compare');
    els.compareToggle.setAttribute('aria-pressed', String(skillMode === 'compare'));
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

// ---- Your places (Settings → You) ------------------------------------------
// The user's registered personal sites: webmail, blog, socials, freeform extras.
// URLs only — logins belong in the password vault. Powers "open my email",
// mailto: links, welcome-overlay tiles, and the post-publish share sheet.
const PLACE_ALIASES = {
  email: ['email', 'e-mail', 'mail', 'inbox', 'webmail', 'gmail', 'outlook'],
  blog: ['blog'],
  x: ['x', 'twitter'],
  bluesky: ['bluesky', 'bsky'],
  facebook: ['facebook', 'fb'],
  instagram: ['instagram', 'insta', 'ig'],
  tiktok: ['tiktok', 'tik tok'],
};
const WEBMAIL = {
  gmail: {
    home: 'https://mail.google.com/',
    compose: (p) => `https://mail.google.com/mail/?view=cm&fs=1&to=${p.to}&su=${p.subject}&body=${p.body}` + (p.cc ? `&cc=${p.cc}` : '') + (p.bcc ? `&bcc=${p.bcc}` : ''),
  },
  outlook: {
    home: 'https://outlook.live.com/mail/0/',
    compose: (p) => `https://outlook.live.com/mail/0/deeplink/compose?to=${p.to}&subject=${p.subject}&body=${p.body}`,
  },
};
// settings.places with the pieces guaranteed present (mutate through this).
function placesObj() {
  if (!settings.places) settings.places = {};
  if (!Array.isArray(settings.places.extras)) settings.places.extras = [];
  return settings.places;
}
function normalizePlaceUrl(u) {
  u = (u || '').trim();
  return u ? (/^https?:\/\//i.test(u) ? u : 'https://' + u) : '';
}
// The URL a place key opens ('' if not configured).
function placeUrl(key) {
  const p = settings.places || {};
  if (key === 'email') {
    if (p.email === 'gmail' || p.email === 'outlook') return WEBMAIL[p.email].home;
    if (p.email === 'custom') return normalizePlaceUrl(p.emailUrl);
    return '';
  }
  return normalizePlaceUrl(p[key] || '');
}
// "email" / "twitter" / an extra's name → its registered URL, or null.
function resolvePlace(nameRaw) {
  const name = (nameRaw || '').toLowerCase()
    .replace(/\s+(?:page|profile|feed|account|site)$/, '').trim();
  if (!name) return null;
  for (const [key, aliases] of Object.entries(PLACE_ALIASES)) {
    if (aliases.includes(name)) { const u = placeUrl(key); if (u) return u; }
  }
  for (const ex of (settings.places && settings.places.extras) || []) {
    if (ex && ex.url && (ex.name || '').trim().toLowerCase() === name) return normalizePlaceUrl(ex.url);
  }
  return null;
}
// "open / check / go to my email" (typed, omnibox, or "Hey Sprig …") → the
// registered URL. Only fires when the possessive target actually resolves, so
// on a live site "open my orders" still reaches the web agent untouched.
function parsePlaceIntent(query) {
  const t = (query || '').trim();
  const m = t.match(/^(?:go\s*to|goto|navigate\s+to|visit|open(?:\s+up)?|launch|pull\s+up|bring\s+up|take\s+me\s+to|check|show\s+me)\s+my\s+(.+)$/i)
    || t.match(/^my\s+(.+)$/i);
  if (!m) return null;
  return resolvePlace(m[1].replace(/[.?!,;:'"]+$/, ''));
}
// mailto:alice@x.com?subject=…&body=…&cc=… → { to, subject, body, cc, bcc }.
function parseMailto(href) {
  try {
    const u = new URL(href);
    if (u.protocol !== 'mailto:') return null;
    const q = u.searchParams;
    return { to: decodeURIComponent(u.pathname || ''), subject: q.get('subject') || '', body: q.get('body') || '', cc: q.get('cc') || '', bcc: q.get('bcc') || '' };
  } catch { return null; }
}
// A mailto: link — open the registered webmail's compose in a new tab; without
// one (or with a custom webmail that has no compose URL) hand it to the OS.
function openMailto(href) {
  const fields = parseMailto(href);
  const p = settings.places || {};
  const wm = fields && WEBMAIL[p.email];
  if (wm) {
    const enc = (s) => encodeURIComponent(s || '');
    openUrlInNewTab(wm.compose({ to: enc(fields.to), subject: enc(fields.subject), body: enc(fields.body), cc: enc(fields.cc), bcc: enc(fields.bcc) }));
    return;
  }
  if (window.chervil.openExternal) window.chervil.openExternal(href);
}
// "Email this page" — a live site's URL, or a composed page's published link.
function emailCurrentPage() {
  const t = currentShareTarget(); // resolves the live-site/published URL + real title
  if (!t) { toast('Publish this page first, then email the link.'); return; }
  openMailto('mailto:?subject=' + encodeURIComponent(t.title) + '&body=' + encodeURIComponent(t.url));
}

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
// Traditional web-search escape hatch — Chervil is AI-first, but a "bang" prefix
// forces a normal search-results page for when the user explicitly wants links.
// g!/google!, ddg!/duck!, b!/bing! pick an engine; s!/search! uses the default.
const SEARCH_ENGINES = {
  google: { label: 'Google', url: 'https://www.google.com/search?q=' },
  duckduckgo: { label: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  bing: { label: 'Bing', url: 'https://www.bing.com/search?q=' },
};
function searchUrlFor(engine, q) {
  const e = SEARCH_ENGINES[engine] || SEARCH_ENGINES.google;
  return e.url + encodeURIComponent(q);
}
// Returns a search-results URL if `text` starts with a search bang, else null.
function parseSearchBang(text) {
  const m = (text || '').match(/^(g|google|ddg|duck|duckduckgo|b|bing|s|search)!\s+(.+)$/i);
  if (!m) return null;
  const alias = {
    g: 'google', google: 'google', ddg: 'duckduckgo', duck: 'duckduckgo', duckduckgo: 'duckduckgo',
    b: 'bing', bing: 'bing', s: settings.searchEngine, search: settings.searchEngine,
  };
  const engine = alias[m[1].toLowerCase()] || settings.searchEngine || 'google';
  return searchUrlFor(engine, m[2].trim());
}

// Route an omnibox submission: a search bang searches the web; a URL navigates;
// anything else goes to Sprig (handleComposerSubmit already handles /commands,
// skills, deep mode, the web agent on live sites, and composing).
function runOmnibox(raw) {
  const text = (raw || '').trim();
  if (!text) return;
  closeOmniSuggest();
  els.pageTitle.blur();
  const bang = parseSearchBang(text);
  if (bang) openUrlInTab(bang);
  else if (looksLikeUrl(text)) openUrlInTab(text);
  else handleComposerSubmit(text);
}

// ---- Omnibox suggestions (history + bookmarks typeahead) ----
let omniSuggestEl = null;
let omniSuggestions = [];
let omniSelIndex = -1;
function closeOmniSuggest() {
  if (omniSuggestEl) { omniSuggestEl.remove(); omniSuggestEl = null; }
  omniSuggestions = [];
  omniSelIndex = -1;
}
function buildOmniSuggestions(text) {
  const q = text.trim().toLowerCase();
  if (!q) return [];
  const out = [];
  const seen = new Set();
  const add = (url, title) => { if (!url || seen.has(url)) return; seen.add(url); out.push({ type: 'url', url, title: title || url }); };
  // Open tabs first — "Switch to tab" beats re-opening a page you already have.
  for (const t of tabs) {
    if (out.length >= 3) break;
    if (t.id === activeId) continue;
    const e = currentEntry(t);
    const title = (e && e.title) || t.title || '';
    const url = (e && e.kind === 'navigate' && e.url) || '';
    if (`${title} ${url}`.toLowerCase().includes(q)) {
      out.push({ type: 'tab', tabId: t.id, title: title || 'Untitled tab', url });
      if (url) seen.add(url); // don't re-suggest the same page from history/bookmarks
    }
  }
  // Your places — "my em…" or the place's own name surfaces the registered URL.
  {
    const bare = q.replace(/^my\s+/, '');
    const placeDefs = [['email', 'My email'], ['blog', 'My blog'], ['x', 'My X'], ['bluesky', 'My Bluesky'], ['facebook', 'My Facebook'], ['instagram', 'My Instagram'], ['tiktok', 'My TikTok']];
    for (const [key, title] of placeDefs) {
      if (out.length >= 6) break;
      const u = placeUrl(key);
      if (u && (title.toLowerCase().includes(q) || (bare.length >= 2 && (PLACE_ALIASES[key] || []).some((a) => a.startsWith(bare))))) add(u, title);
    }
    for (const ex of (settings.places && settings.places.extras) || []) {
      if (out.length >= 6) break;
      if (ex && ex.url && ex.name && ('my ' + ex.name).toLowerCase().includes(q)) add(normalizePlaceUrl(ex.url), `My ${ex.name}`);
    }
  }
  for (const b of bookmarks) { if (out.length >= 6) break; if (b.kind === 'site' && b.url && `${b.title || ''} ${b.url}`.toLowerCase().includes(q)) add(b.url, b.title); }
  for (const s of siteHistory) { if (out.length >= 6) break; if (s.url && `${s.title || ''} ${s.url}`.toLowerCase().includes(q)) add(s.url, s.title); }
  // Action rows when the text isn't already a bare URL or a search bang.
  if (!looksLikeUrl(text) && !parseSearchBang(text)) {
    out.push({ type: 'search', text: text.trim() });
    out.push({ type: 'ask', text: text.trim() });
  }
  return out.slice(0, 8);
}
function paintOmniSel() {
  if (!omniSuggestEl) return;
  [...omniSuggestEl.children].forEach((c, i) => c.classList.toggle('sel', i === omniSelIndex));
}
function moveOmniSel(d) {
  if (!omniSuggestions.length) return;
  omniSelIndex = (omniSelIndex + d + omniSuggestions.length) % omniSuggestions.length;
  paintOmniSel();
}
function pickOmniSuggestion(it) {
  closeOmniSuggest();
  els.pageTitle.blur();
  if (it.type === 'tab') switchTab(it.tabId); // switchTab repaints the omnibox for the target tab
  else if (it.type === 'url') openUrlInTab(it.url);
  else if (it.type === 'search') openUrlInTab(searchUrlFor(settings.searchEngine || 'google', it.text));
  else handleComposerSubmit(it.text);
}
function renderOmniSuggest() {
  closeOmniSuggest();
  if (document.activeElement !== els.pageTitle) return;
  omniSuggestions = buildOmniSuggestions(els.pageTitle.value);
  if (!omniSuggestions.length) return;
  const menu = document.createElement('div');
  menu.className = 'omni-suggest';
  omniSuggestEl = menu;
  omniSuggestions.forEach((it, i) => {
    const row = document.createElement('div');
    row.className = 'omni-suggest-row';
    let label = '';
    let sub = '';
    if (it.type === 'tab') {
      const fi = it.url ? faviconImg(it.url, 'omni-sg-fav') : null;
      if (fi) row.appendChild(fi);
      else { const ic = document.createElement('span'); ic.className = 'omni-sg-icon'; ic.textContent = '⧉'; row.appendChild(ic); }
      label = it.title; sub = it.url ? `Switch to tab · ${it.url}` : 'Switch to tab';
    } else if (it.type === 'url') {
      const fi = faviconImg(it.url, 'omni-sg-fav'); if (fi) row.appendChild(fi);
      label = it.title; sub = it.url;
    } else {
      const ic = document.createElement('span'); ic.className = 'omni-sg-icon';
      ic.textContent = it.type === 'search' ? '🔎' : '🌿';
      row.appendChild(ic);
      label = it.type === 'search' ? `Search the web for “${it.text}”` : `Ask Sprig “${it.text}”`;
    }
    const txt = document.createElement('div'); txt.className = 'omni-sg-text';
    const l = document.createElement('div'); l.className = 'omni-sg-title'; l.textContent = label; txt.appendChild(l);
    if (sub) { const s = document.createElement('div'); s.className = 'omni-sg-sub'; s.textContent = sub; txt.appendChild(s); }
    row.appendChild(txt);
    row.addEventListener('mousedown', (e) => { e.preventDefault(); pickOmniSuggestion(it); }); // mousedown beats blur
    row.addEventListener('mouseenter', () => { omniSelIndex = i; paintOmniSel(); });
    menu.appendChild(row);
  });
  document.body.appendChild(menu);
  const r = els.pageTitle.getBoundingClientRect();
  menu.style.left = `${r.left}px`;
  menu.style.top = `${r.bottom + 4}px`;
  menu.style.width = `${r.width}px`;
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

// Is this a bare "X vs Y" comparison request? Deliberately narrow: a short
// "vs"/"versus" phrase (optionally led by "compare"), each side ≤6 words, no URL,
// not a question-lead sentence — so it triggers the Compare skill only on clear
// intent and never on chat/nav phrasings ("compare my open tabs", "why X vs Y…").
function isComparisonQuery(text) {
  const q = String(text || '').trim();
  if (!q || q.length > 140) return false;
  if (/\bhttps?:\/\//i.test(q) || /\b(my|these|those|the following)\b/i.test(q)) return false;
  if (/^(why|how|what|when|where|should|is|are|do|does|can|which)\b/i.test(q)) return false;
  const body = q.replace(/^\s*compare\s+/i, '');
  const m = body.match(/^(.{1,70}?)\s+(?:vs\.?|versus)\s+(.{1,70})$/i);
  if (!m) return false;
  const a = m[1].trim(), b = m[2].trim().replace(/[?.!]+$/, '');
  const words = (s) => s.split(/\s+/).filter(Boolean).length;
  return !!a && !!b && words(a) <= 6 && words(b) <= 6;
}

function handleComposerSubmit(text, opts = {}) {
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
  const compareCmd = query.match(/^\/compare\s+(.+)/is);
  if (learnCmd) { buildAndRenderSkill(tab, 'learn', learnCmd[1].trim(), 'lesson'); return; }
  if (quizCmd) { buildAndRenderSkill(tab, 'quiz', quizCmd[1].trim(), 'quiz'); return; }
  if (compareCmd) { buildAndRenderSkill(tab, 'compare', compareCmd[1].trim(), 'comparison'); return; }
  if (skillMode) { buildAndRenderSkill(tab, skillMode, query, SKILL_LABELS[skillMode] || 'page'); return; }

  // On an image-editor tab the composer edits THE IMAGE — "add a red arrow at
  // the button" must not web-search and compose a new page (or chat). Explicit
  // navigation still escapes ("open my email", "go to github.com").
  {
    const curEd = currentEntry(tab);
    if (curEd && curEd.imageEditor) {
      const esc = parsePlaceIntent(query) || parseNavIntent(query, { strict: true });
      if (esc) { openUrlInTab(esc); return; }
      els.prompt.value = '';
      resetPromptHeight();
      forwardEditToImageEditor(query);
      return;
    }
  }

  // "Just a chatbot" mode: a plain conversational reply, no page composed.
  // forceChat routes a single turn to chat (e.g. the extension's "Chervil Chat")
  // without flipping the sticky global toggle; the armed 💬 "Ask about this page"
  // button does the same for one turn grounded in the live site.
  if (settings.chatMode || opts.forceChat || askPageArmed) {
    if (askPageArmed) setAskPageArmed(false);
    chatSubmit(tab, query);
    return;
  }

  // On a live site, the composer drives the web agent instead of composing a page.
  const cur = currentEntry(tab);

  // Video summary: a YouTube URL in the message (or while viewing one) + a summarize intent.
  const ytUrl = extractYouTubeUrl(query) || (cur && cur.kind === 'navigate' ? extractYouTubeUrl(cur.url) : null);
  if (ytUrl && /(summ|tl;?dr|recap|key ?points|key takeaways|digest)/i.test(query)) {
    summarizeVideo(tab, ytUrl);
    return;
  }

  // "Open / check my email|blog|X…" → the registered Your-places URL. Checked
  // before the generic nav intent (which strips "my" and would send "open my
  // email" to email.com); only fires when the name resolves to a saved place.
  const placeNav = parsePlaceIntent(query);
  if (placeNav) { openUrlInTab(placeNav); return; }

  // "Go to / open <site>" navigates to a real URL instead of composing a page.
  // On a live site we stay strict (explicit domains / known names only) so the
  // web agent's own "open …" commands aren't hijacked.
  const navUrl = parseNavIntent(query, { strict: !!(cur && cur.kind === 'navigate') });
  if (navUrl) { openUrlInTab(navUrl); return; }

  // "Open (all pages in) the <name> Collection (in tabs)" → every saved page.
  {
    const m = query.match(/^open\s+(?:all\s+)?(?:the\s+)?(?:pages\s+|links\s+|tabs\s+|everything\s+)?(?:in\s+|from\s+)?(?:the\s+)?(.+?)\s+collection(?:\s+in\s+tabs)?[\s.!?]*$/i);
    const c = m && findCollectionByName(m[1]);
    if (c) { openCollectionInTabs(c); return; }
  }

  // A compose that says "based on / from / using the <name> Collection" gets
  // grounded on that collection: its saved pages are appended as the primary
  // sources for the web-searching composer to fetch. A match also forces the
  // compose path — even on a live site, "compose a page based on my Kyoto
  // Collection" means a new page, not a web-agent action on the current site.
  let collectionCompose = false;
  {
    const m = query.match(/\b(?:based\s+on|from|using|with)\s+(?:the\s+|my\s+)?["“']?(.+?)["”']?\s+collection\b/i);
    const c = m && findCollectionByName(m[1]);
    if (c && c.items.length) {
      collectionCompose = true;
      query += `\n\nGround this page on my “${c.name}” collection — fetch and use these saved pages as the primary sources:\n`
        + c.items.map((it) => `- ${it.title && it.title !== it.url ? it.title + ' — ' : ''}${it.url}`).join('\n');
    }
  }

  if (!collectionCompose && cur && cur.kind === 'navigate') {
    if (/^\s*(auto-?fill|fill\s+(in|out)?\s*(the|this|my)?\s*form|fill\s+my\s+(details|info|information))\b/i.test(query)) { autofillCurrentForm(); return; }
    // "Watch this page / tell me when …" → set up a page watcher on this URL.
    const watch = parseWatchIntent(query);
    if (watch) {
      createWatcher(cur.url, tab.title || hostOf(cur.url), watch.condition);
      els.prompt.value = ''; resetPromptHeight();
      return;
    }
    startAgent(query);
    return;
  }

  // Deep Dive always composes a fresh research report (no in-place refine).
  if (deepMode) {
    submitQuery(query, { deep: true, skipFollowup: true, allowNavigate: false, attachments });
    return;
  }

  // Natural-language comparison: a bare "X vs Y" (or "X versus Y") is a strong,
  // unambiguous signal to build a sourced comparison instead of a prose page.
  // Kept deliberately narrow (short sides, no attachments, not a question lead)
  // so it never hijacks chat/nav/agent phrasings like "compare my open tabs".
  // Checked after Deep Dive so an explicit research toggle still wins.
  if (!attachments.length && isComparisonQuery(query)) {
    buildAndRenderSkill(tab, 'compare', query, 'comparison');
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

  // A skill build is a real generation, not a fire-and-forget toast: it registers
  // run state like a compose does, so the tab spins, Stop works, the status bubble
  // reports live progress, and a second build can't be fired over the top of it.
  const requestId = uid();
  const rs = runStateFor(tab.id);
  rs.genId = requestId;
  rs.startedAt = Date.now();
  rs.status = normalizeStatus({ phase: 'working', text: `Sprig is building your ${label || skillId}…` });
  rs.statusText = rs.status.text;
  rs.streamBuffer = '';
  reqToTab.set(requestId, tab.id);

  const isActive = () => activeTab() === tab;
  const finish = () => {
    rs.genId = null;
    rs.status = null;
    rs.statusText = '';
    rs.startedAt = 0;
    rs.streamBuffer = '';
    reqToTab.delete(requestId);
    if (isActive()) { clearStatus(); setBadge('', 'ready'); setSendBusy(false); }
  };

  if (isActive()) {
    setStatus(rs.status, rs.startedAt);
    setBadge('working', 'working');
    setSendBusy(true);
  }
  renderTabs();

  try {
    const resp = await window.chervil.buildSkill({ skill: skillId, input, level: 'beginner', requestId, config: providerConfig() });

    // The user stopped this build while it was in flight — ignore its result.
    if (cancelledRequests.has(requestId)) { cancelledRequests.delete(requestId); return; }
    finish();

    if (!resp || !resp.ok) {
      toast((resp && resp.error) || 'Couldn’t build it.');
      renderTabs();
      if (isActive()) refreshComposer();
      return;
    }
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
    // export/publish actions. Compare keeps `sources` so the Sources button and
    // sourced-page affordances work on a comparison too.
    if (skillId === 'learn') { entry.lesson = a; entry.sources = a.sources || []; }
    if (skillId === 'compare') { entry.sources = a.sources || []; }
    pushEntry(tab, entry);
    if (!tab.title || tab.title === 'New Tab') tab.title = a.title || (label || skillId);
    renderTabs();
    if (isActive()) { renderCurrentPage(); refreshComposer(); }
    scheduleSave();
  } catch (e) {
    if (cancelledRequests.has(requestId)) { cancelledRequests.delete(requestId); return; }
    finish();
    renderTabs();
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

// Cross-tab context for chat ("compare my open tabs", "which tab has…").
// Included only when the question sounds tab-related — it ships tab titles/URLs
// (and content snippets) to the provider, so don't send it on every turn.
// Background live-site tabs keep a running webview now, so their actual text is
// extracted too; tabs whose webview was LRU-evicted fall back to title + URL
// (search-capable providers can fetch those).
const TABS_INTENT_RE = /\btabs?\b|\bhave open\b|\bopen (pages|sites|windows)\b|\b(these|those|my) (pages|sites|articles|products|listings)\b|\bcompare\b|\bacross (them|these|those|all)\b/i;

async function tabsChatContext(query, activeTabRef) {
  if (!TABS_INTENT_RE.test(String(query || ''))) return null;
  const items = [];
  for (const t of tabs) {
    if (activeTabRef && t.id === activeTabRef.id) continue; // the active page is sent fully already
    const e = currentEntry(t);
    if (!e) continue;
    if (e.kind === 'navigate') {
      const item = { kind: 'site', title: e.title || t.title || '', url: e.url || '' };
      const wv = webviews.get(t.id);
      if (wv) {
        try {
          const r = await wv.executeJavaScript(PAGE_TEXT_EXTRACT_JS, true);
          if (r && r.ok && r.text) item.text = r.text.slice(0, 1200);
        } catch { /* still loading or evicted — title+URL is fine */ }
      }
      items.push(item);
    } else if (e.kind === 'page') {
      items.push({ kind: 'page', title: e.title || t.title || '', text: stripText(e.html).slice(0, 1200) });
    }
    if (items.length >= 12) break; // keep the prompt bounded
  }
  return items.length ? items : null;
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
  rs.status = normalizeStatus({ phase: 'working', text: rs.statusText });
  rs.startedAt = Date.now();

  addMessage(tab, 'user', query);
  if (tab.title === 'New Tab') tab.title = query.length > 40 ? query.slice(0, 37) + '…' : query;
  renderTabs();

  const sentHistory = tab.history.slice();
  tab.history.push({ role: 'user', content: query });

  const isActive = () => tab.id === activeId;
  if (isActive()) { setStatus(rs.status, rs.startedAt); setBadge('working', 'working'); setSendBusy(true); }

  // Send what the user is looking at as context — a Chervil-composed page's HTML,
  // or the extracted text of the live site in the webview — so chat can answer
  // questions about "this page" without leaving the conversation.
  const cur = currentEntry(tab);
  const tabsContext = await tabsChatContext(query, tab);
  let pageContext = null;
  let pageMeta = null;
  if (cur && cur.kind === 'page') {
    pageContext = cur.html;
    pageMeta = { kind: 'page', title: cur.title || '' };
  } else if (cur && cur.kind === 'navigate') {
    const live = await extractLivePageContext(tab);
    if (live) { pageContext = live.text; pageMeta = live.meta; }
  }

  try {
    const resp = await window.chervil.chat({
      query,
      history: sentHistory,
      profile: settings.profile || null,
      pageContext,
      pageMeta,
      tabsContext,
      config: providerConfig(),
    });
    rs.genId = null; rs.statusText = ''; rs.status = null; rs.startedAt = 0;
    if (isActive()) clearStatus();
    if (!resp || !resp.ok) {
      addMessage(tab, 'bot', (resp && resp.error) || 'Something went wrong.', 'error');
    } else {
      const reply = resp.text || '…';
      addMessage(tab, 'bot', reply, '', resp.sources || []);
      tab.history.push({ role: 'assistant', content: reply });
    }
  } catch (e) {
    rs.genId = null; rs.statusText = ''; rs.status = null; rs.startedAt = 0;
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
  rs.status = normalizeStatus({ phase: verify ? 'verifying' : deep ? 'researching' : 'working', text: rs.statusText });
  rs.startedAt = Date.now();
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
    setStatus(rs.status, rs.startedAt);
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
    rs.status = null;
    rs.startedAt = 0;
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
    rs.status = null;
    rs.startedAt = 0;
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

// Send the current live site to the phone — scan the QR with the phone camera.
function sendTabToPhone() {
  const entry = currentEntry(activeTab());
  if (!entry || entry.kind !== 'navigate' || !entry.url) { toast('Send to phone works on a live website.'); return; }
  showQrModal('Scan to open on your phone', entry.url, entry.title || entry.url);
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
  if (tab && tab.private) return; // private tabs aren't collected into the Library
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

// ---- Spaces (legacy) ----
// Kept only because the "Pin files to Space" feature still files pins into the legacy
// active space bucket (loadSpacePinnedAttachments). setActiveSpace/createSpace/
// spaceItems were removed — dead after Spaces moved to Saved Pages.
function activeSpace() {
  return spaces.find((s) => s.id === activeSpaceId) || spaces[0] || null;
}

// ---- Saved-Pages Spaces ----
// Saved Pages are organized into Spaces (not folders). Ensure a default Space exists
// and every saved page is filed into one — runs on load + after sync.
function ensureSavedSpaces() {
  let changed = false;
  if (!savedSpaces.length) { savedSpaces.push({ id: uid(), name: 'My Pages', createdAt: Date.now() }); changed = true; }
  // Two machines each mint a fresh "My Pages" before their first sync; after merge
  // that's two near-identical defaults with pages split between them. Collapse them
  // deterministically (earliest createdAt wins on every machine) and remap pages.
  const defs = savedSpaces.filter((s) => s.name === 'My Pages').sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  if (defs.length > 1) {
    const keep = defs[0].id;
    const drop = new Set(defs.slice(1).map((s) => s.id));
    for (const b of bookmarks) if (b && b.kind === 'page' && drop.has(b.spaceId)) b.spaceId = keep;
    savedSpaces = savedSpaces.filter((s) => !drop.has(s.id));
    if (drop.has(activeSavedSpaceId)) activeSavedSpaceId = keep;
    changed = true;
  }
  if (!activeSavedSpaceId || !savedSpaces.find((s) => s.id === activeSavedSpaceId)) { activeSavedSpaceId = savedSpaces[0].id; changed = true; }
  const def = savedSpaces[0].id;
  for (const b of bookmarks) if (b && b.kind === 'page' && !b.spaceId) { b.spaceId = def; changed = true; }
  if (changed) scheduleSave(); // persist the default Space + filings so ids stay stable across launches
  return changed;
}
function activeSavedSpace() { return savedSpaces.find((s) => s.id === activeSavedSpaceId) || savedSpaces[0] || null; }
function setActiveSavedSpace(id) {
  if (!savedSpaces.find((s) => s.id === id)) return;
  activeSavedSpaceId = id;
  renderDrawer();
  scheduleSave();
}
function createSavedSpace(name) {
  const sp = { id: uid(), name: String(name || '').trim().slice(0, 40) || 'New Space', createdAt: Date.now() };
  savedSpaces.push(sp);
  activeSavedSpaceId = sp.id;
  renderDrawer();
  scheduleSave();
  return sp;
}
function moveSavedPageToSpace(id, spaceId) {
  const b = bookmarks.find((x) => x.id === id);
  if (!b || !spaceId) return;
  b.spaceId = spaceId;
  scheduleSave();
  renderDrawer();
  renderBookmarksBar();
}
// The saved pages filed into the active Space.
function savedSpaceItems() {
  return bookmarks.filter((b) => b.kind === 'page' && (b.spaceId || activeSavedSpaceId) === activeSavedSpaceId);
}
// Pull the display HTML out of a saved page's session snapshot (its current page).
function savedPageHtml(b) {
  const pages = b && b.tab && Array.isArray(b.tab.pages) ? b.tab.pages : [];
  if (!pages.length) return '';
  const cur = pages.find((p) => p.id === (b.tab && b.tab.currentId)) || pages[pages.length - 1];
  return (cur && cur.html) || '';
}
// Normalize the active Saved-Pages Space into library-item-like docs for Synthesize
// and Publish (which expect { title, query, html, createdAt }).
function savedSpaceDocs() {
  return savedSpaceItems()
    .map((b) => ({ id: b.id, title: b.title, query: b.query || b.title, html: savedPageHtml(b), createdAt: b.at }))
    .filter((d) => d.html);
}
// A <select> to move a saved page between Spaces (drawer rows).
function savedSpaceSelect(item) {
  const sel = document.createElement('select');
  sel.className = 'lib-folder-select';
  for (const sp of savedSpaces) {
    const o = document.createElement('option'); o.value = sp.id; o.textContent = sp.name;
    sel.appendChild(o);
  }
  const optNew = document.createElement('option'); optNew.value = '__new__'; optNew.textContent = 'New space…';
  sel.appendChild(optNew);
  sel.value = item.spaceId || activeSavedSpaceId || (savedSpaces[0] && savedSpaces[0].id) || '';
  sel.addEventListener('click', (e) => e.stopPropagation());
  sel.addEventListener('change', () => {
    if (sel.value === '__new__') {
      const name = (prompt('New space name:') || '').trim();
      if (!name) { sel.value = item.spaceId || ''; return; }
      const sp = createSavedSpace(name);
      moveSavedPageToSpace(item.id, sp.id);
    } else {
      moveSavedPageToSpace(item.id, sel.value);
    }
  });
  return sel;
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

// Synthesize across the active Saved-Pages Space (composed pages you saved).
async function synthesizeSavedSpace(query) {
  const docs = savedSpaceDocs();
  const sp = activeSavedSpace();
  const name = sp ? sp.name : 'Space';
  if (!docs.length) {
    closeDrawer();
    const tab = activeTab();
    if (tab) addMessage(tab, 'bot', `"${name}" has no saved pages with content yet — save a few pages into it, then synthesize.`, 'error');
    return;
  }
  const spaceContext = buildSpaceContext(docs);
  // Pinned Space files feed Synthesize too (parity with the old Space synthesize),
  // unless the user turned the feature off.
  let attachments = [];
  if (settings.spaceFilesMode !== 'off') { try { attachments = await loadSpacePinnedAttachments(); } catch { attachments = []; } }
  const q = (query || '').trim() ||
    `Synthesize everything I've saved in my "${name}" Space into one clear overview — compare the pages, connect the themes, and tell me the key takeaways.`;
  closeDrawer();
  submitQuery(q, {
    spaceContext,
    attachments,
    skipFollowup: true,
    allowNavigate: false,
    displayText: (query || '').trim() || `Synthesize "${name}" (${docs.length} pages)`,
  });
}

// Publish every page in the active Saved-Pages Space, then a styled index.
async function publishCurrentSavedSpace() {
  const docs = savedSpaceDocs();
  const sp = activeSavedSpace();
  const spaceName = sp ? sp.name : 'My Space';
  if (!docs.length) { toast(`"${spaceName}" has no pages to publish.`); return; }
  if (!settings.publishToken) { toast('Add a publish token in Settings → Publishing.'); return; }
  if (!window.chervil.publishPage) { toast('Publishing isn’t available in this build.'); return; }
  if (!confirm(`Publish all ${docs.length} page${docs.length === 1 ? '' : 's'} in "${spaceName}" to the web?`)) return;
  const token = settings.publishToken;
  const baseUrl = settings.publishBase || 'https://getchervil.com';
  toast(`Publishing ${docs.length} page${docs.length === 1 ? '' : 's'}…`);
  const published = [];
  for (const it of docs) {
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
  it.updatedAt = Date.now();          // fresh recency so the move wins over sync
  library.trash.unshift(it);
  if (library.trash.length > MAX_LIBRARY) library.trash.length = MAX_LIBRARY;
  addTombstone('pages', id);          // don't let another machine resurrect it into history
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
  for (let i = moved.length - 1; i >= 0; i--) {
    moved[i].updatedAt = Date.now();
    library.trash.unshift(moved[i]);
    addTombstone('pages', moved[i].id);
  }
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
  const shown = library.history; // Activity is now a flat timeline of every composed page
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
  it.updatedAt = Date.now();          // fresh recency so the restore wins over sync
  library.history.unshift(it);
  clearTombstone('pages', id);        // it's allowed back in history now…
  addTombstone('trash', id);          // …and gone from trash on every machine
  renderDrawer();
  scheduleSave();
}

function emptyTrash() {
  for (const it of library.trash) addTombstone('trash', it && it.id);
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
  // The Space bar now organizes Saved Pages (composed pages), with Synthesize/Publish.
  const show = drawerTab === 'bookmarks';
  els.spaceBar.hidden = !show;
  if (!show) {
    if (els.newSpaceRow) els.newSpaceRow.hidden = true;
    if (els.synthRow) els.synthRow.hidden = true;
    return;
  }
  ensureSavedSpaces();
  els.spaceSelect.innerHTML = '';
  for (const sp of savedSpaces) {
    const opt = document.createElement('option');
    opt.value = sp.id;
    opt.textContent = sp.name;
    if (sp.id === activeSavedSpaceId) opt.selected = true;
    els.spaceSelect.appendChild(opt);
  }
}

// ---- Bookmarks ----
// A stable key per entry so toggling/lookup is reliable (site → URL, page → query).
// Saved Pages only hold composed Chervil pages (kind:'page'). Live sites go to
// Favorites via the ★ star, so a site entry has no Saved-Pages key.
function entryBookmarkKey(entry) {
  if (!entry) return null;
  if (entry.kind === 'page') return 'page:' + (entry.query || entry.title || '');
  return null;
}
// Bookmark ribbon — outline when not saved, filled when saved. (Favorites keep
// the ★ star; bookmarks now read as a proper bookmark, like other browsers.)
const BOOKMARK_ICON = (filled) => `<svg viewBox="0 0 24 24" width="15" height="15" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z"/></svg>`;
function updateBookmarkStar() {
  updateFavoriteStar(); // the ★ favorite affordance rides along at every call site
  if (!els.bookmarkBtn) return;
  const entry = currentEntry(activeTab());
  const key = entryBookmarkKey(entry);
  const on = !!key && bookmarks.some((b) => b.key === key);
  els.bookmarkBtn.disabled = !key;
  els.bookmarkBtn.innerHTML = BOOKMARK_ICON(on);
  els.bookmarkBtn.classList.toggle('on', on);
  els.bookmarkBtn.title = !key ? 'Save page (composed Chervil pages only)' : on ? 'Remove from Saved Pages' : 'Save this page';
}
function toggleBookmark() {
  const tab = activeTab();
  const entry = currentEntry(tab);
  const key = entryBookmarkKey(entry);
  if (!key) return;
  const idx = bookmarks.findIndex((b) => b.key === key);
  if (idx >= 0) { bookmarks.splice(idx, 1); addBookmarkTombstone(key); toast('Removed from Saved Pages.'); }
  else {
    clearBookmarkTombstone(key); // re-adding overrides any prior delete
    ensureSavedSpaces(); // guarantee an active Space to file this into
    const bm = {
      id: uid(), key, kind: 'page',
      query: entry.query || '',
      title: entry.title || tab.title || 'Saved page',
      at: Date.now(),
      spaceId: activeSavedSpaceId,
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
    toast('Saved to Pages.');
  }
  updateBookmarkStar();
  if (els.libraryDrawer.classList.contains('open') && drawerTab === 'bookmarks') renderDrawer();
  renderBookmarksBar();
  scheduleSave();
}
// Rebuild a full tab from a bookmark/snapshot, remapping page ids so the restored
// copy never collides with the still-open original tab.
function restoreTabSnapshot(snap, opts = {}) {
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
    private: !!snap.private, // duplicates of private tabs stay private
  };
  // Insert next to a requested sibling (Duplicate tab); pinned originals get
  // their clone just past the pinned region so the invariant holds.
  let at = opts.afterId ? tabs.findIndex((t) => t.id === opts.afterId) : -1;
  if (at >= 0 && tabs[at].pinned) at = lastPinnedIndex();
  if (at >= 0) tabs.splice(at + 1, 0, tab); else tabs.push(tab);
  activeId = tab.id;
  renderTabs();
  renderConversation();
  renderCurrentPage();
  refreshComposer();
  scheduleSave();
  return tab;
}

function openBookmark(b) {
  closeDrawer();
  if (b.kind === 'site' && b.url) { openUrlInTab(b.url); return; }
  // New bookmarks carry a full tab snapshot; restore the whole session.
  if (b.tab && Array.isArray(b.tab.pages) && b.tab.pages.length) { restoreTabSnapshot(b.tab); return; }
  // Legacy lightweight bookmarks ({query,title}) — recompose from the query.
  if (b.query) { newTab(true); submitQuery(b.query); return; }
  toast('This saved page can’t be opened.');
}
function removeBookmark(id) {
  const gone = bookmarks.find((b) => b.id === id);
  bookmarks = bookmarks.filter((b) => b.id !== id);
  if (gone && gone.key) addBookmarkTombstone(gone.key);
  updateBookmarkStar();
  renderDrawer();
  renderBookmarksBar();
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

// Same idea as bookmark tombstones, but keyed by id for the id-based collections.
function addTombstone(coll, id) {
  if (id == null) return;
  const key = String(id);
  const arr = deletionTombstones[coll] || (deletionTombstones[coll] = []);
  const i = arr.findIndex((t) => String(t.id) === key);
  if (i >= 0) arr.splice(i, 1);
  arr.unshift({ id: key, at: Date.now() });
  if (arr.length > MAX_DEL_TOMBSTONES) arr.length = MAX_DEL_TOMBSTONES;
}
function clearTombstone(coll, id) {
  if (id == null) return;
  const key = String(id);
  const arr = deletionTombstones[coll];
  if (arr) deletionTombstones[coll] = arr.filter((t) => String(t.id) !== key);
}

// ---- Collections (Library → Collections) ----
// A collection is a named working set of web pages gathered on purpose ("Kyoto
// trip", "GPU reviews") — distinct from Favorites (single starred sites). Sprig
// can use one as a data source ("compose a page based on the Kyoto Collection")
// or reopen the whole set ("open all pages in the Kyoto Collection in tabs").
function findCollection(id) { return collections.find((c) => c.id === id) || null; }
function findCollectionByName(name) {
  const n = (name || '').trim().toLowerCase().replace(/^the\s+/, '').replace(/\s+collection$/, '').trim();
  if (!n) return null;
  return collections.find((c) => (c.name || '').trim().toLowerCase() === n)
    || collections.find((c) => (c.name || '').toLowerCase().includes(n))
    || null;
}
function touchCollection(c) { c.updatedAt = Date.now(); scheduleSave(); }
function refreshCollectionsPanel() {
  if (els.libraryDrawer.classList.contains('open') && drawerTab === 'collections') renderDrawer();
}
async function createCollection() {
  const name = await showInputSheet({
    title: 'New collection',
    subtitle: 'A named set of web pages — Sprig can compose from it or open the whole set in tabs.',
    placeholder: 'e.g. Kyoto trip research',
    okLabel: 'Create',
  });
  const trimmed = (name || '').trim();
  if (!trimmed) return null;
  if (findCollectionByName(trimmed)) { toast(`A collection named “${trimmed}” already exists.`); return null; }
  const c = { id: uid(), name: trimmed, items: [], createdAt: Date.now(), updatedAt: Date.now() };
  collections.unshift(c);
  clearTombstone('collections', c.id);
  scheduleSave();
  refreshCollectionsPanel();
  return c;
}
async function renameCollection(c) {
  const name = await showInputSheet({ title: 'Rename collection', subtitle: c.name, placeholder: c.name, okLabel: 'Rename' });
  if (name && name.trim()) { c.name = name.trim(); touchCollection(c); refreshCollectionsPanel(); }
}
function deleteCollection(id) {
  const c = findCollection(id);
  if (!c) return;
  const n = c.items.length;
  if (!confirm(`Delete the “${c.name}” collection${n ? ` (${n} page${n === 1 ? '' : 's'})` : ''}? The pages themselves aren’t touched.`)) return;
  collections = collections.filter((x) => x.id !== id);
  addTombstone('collections', id);
  scheduleSave();
  refreshCollectionsPanel();
}
function addToCollection(c, page) {
  if (!c || !page || !page.url) return false;
  if (c.items.some((it) => it.url === page.url)) { toast(`Already in “${c.name}”.`); return false; }
  c.items.push({ id: uid(), url: page.url, title: page.title || page.url, addedAt: Date.now() });
  touchCollection(c);
  toast(`Added to “${c.name}” — ${c.items.length} page${c.items.length === 1 ? '' : 's'}.`);
  refreshCollectionsPanel();
  return true;
}
function removeFromCollection(c, itemId) {
  c.items = c.items.filter((it) => it.id !== itemId);
  touchCollection(c);
  refreshCollectionsPanel();
}
function openCollectionInTabs(c) {
  if (!c || !c.items.length) { toast('That collection is empty.'); return; }
  closeDrawer();
  // Gather the opened pages under a tab group named after the collection, so the
  // whole set stays visually together (and can be collapsed away as one).
  const group = createTabGroup(c.name);
  for (const it of c.items) {
    openUrlInNewTab(it.url);   // creates + activates the new tab
    moveTabToGroup(activeId, group.id);
  }
  toast(`Opened ${c.items.length} page${c.items.length === 1 ? '' : 's'} from “${c.name}” in a group.`);
}
// What a tab contributes to a collection: its live site, or its published page.
function collectionPageForTab(tab) {
  const entry = currentEntry(tab);
  if (!entry) return null;
  if (entry.kind === 'navigate' && entry.url) {
    let title = tab.title || entry.url;
    const wv = webviews.get(tab.id);
    try { title = (wv && wv.getTitle()) || title; } catch { /* keep the tab title */ }
    return { url: entry.url, title };
  }
  if (entry.publishedUrl) return { url: entry.publishedUrl, title: entry.title || 'Chervil page' };
  return null;
}
// Picker sheet: which collection should this page join?
function chooseCollectionFor(page) {
  if (!page) { toast('Open a website first — collections gather web pages (or published Chervil pages).'); return; }
  const actions = collections.map((c) => ({
    label: `${c.name} (${c.items.length})`,
    onClick: () => addToCollection(c, page),
  }));
  actions.push({
    label: '＋ New collection…',
    primary: collections.length === 0,
    onClick: async () => { const c = await createCollection(); if (c) addToCollection(c, page); },
  });
  showActionSheet('Add to Collection', page.title || page.url, actions);
}

// ---- Favorites (sites-only, on the ★ star) ----
// A favorite is just the current website. Only live sites qualify — a composed
// Chervil page can't be a favorite (that's what Bookmarks are for).
function favoriteKey(entry) {
  if (!entry || entry.kind !== 'navigate' || !entry.url) return null;
  return 'site:' + entry.url;
}
function updateFavoriteStar() {
  if (!els.favoriteBtn) return;
  const key = favoriteKey(currentEntry(activeTab()));
  const on = !!key && favorites.some((f) => f.key === key);
  els.favoriteBtn.disabled = !key;
  els.favoriteBtn.textContent = on ? '★' : '☆';
  els.favoriteBtn.classList.toggle('on', on);
  els.favoriteBtn.title = !key ? 'Favorites are for websites' : on ? 'Remove from Favorites' : 'Add to Favorites';
}
function toggleFavorite() {
  const tab = activeTab();
  const entry = currentEntry(tab);
  const key = favoriteKey(entry);
  if (!key) { toast('Favorites are for websites — open a site first.'); return; }
  const idx = favorites.findIndex((f) => f.key === key);
  if (idx >= 0) { favorites.splice(idx, 1); addFavoriteTombstone(key); toast('Removed from Favorites.'); }
  else {
    clearFavoriteTombstone(key); // re-adding overrides any prior delete
    favorites.unshift({ id: uid(), key, url: entry.url, title: tab.title || hostOf(entry.url) || entry.url, at: Date.now(), folder: '' });
    toast('Added to Favorites.');
  }
  updateFavoriteStar();
  if (els.libraryDrawer.classList.contains('open') && drawerTab === 'favorites') renderDrawer();
  renderFavoritesBar();
  scheduleSave();
}
function removeFavorite(id) {
  const gone = favorites.find((f) => f.id === id);
  favorites = favorites.filter((f) => f.id !== id);
  if (gone && gone.key) addFavoriteTombstone(gone.key);
  updateFavoriteStar();
  renderDrawer();
  renderFavoritesBar();
  scheduleSave();
}
function addFavoriteTombstone(key) {
  if (!key) return;
  favoriteTombstones = favoriteTombstones.filter((t) => t.key !== key);
  favoriteTombstones.unshift({ key, at: Date.now() });
  if (favoriteTombstones.length > MAX_BOOKMARK_TOMBSTONES) favoriteTombstones.length = MAX_BOOKMARK_TOMBSTONES;
}
function clearFavoriteTombstone(key) {
  if (!key) return;
  favoriteTombstones = favoriteTombstones.filter((t) => t.key !== key);
}
// Favorite folders — mirror the bookmark-folder helpers.
function allFavoriteFolders() {
  const set = new Set(favoriteFolders);
  for (const f of favorites) if (f.folder) set.add(f.folder);
  return [...set];
}
function createFavoriteFolder() {
  const name = (prompt('New folder name:') || '').trim();
  if (!name) return;
  if (!favoriteFolders.includes(name)) favoriteFolders.push(name);
  scheduleSave();
  renderDrawer();
  renderFavoritesBar();
}
function moveFavoriteToFolder(id, folder) {
  const f = favorites.find((x) => x.id === id);
  if (!f) return;
  f.folder = folder || '';
  if (folder && !favoriteFolders.includes(folder)) favoriteFolders.push(folder);
  scheduleSave();
  renderDrawer();
  renderFavoritesBar();
}
// A <select> for reassigning a favorite's folder (used in the drawer rows).
function favoriteFolderSelect(item) {
  const sel = document.createElement('select');
  sel.className = 'lib-folder-select';
  const optU = document.createElement('option'); optU.value = ''; optU.textContent = 'Unfiled';
  sel.appendChild(optU);
  for (const f of allFavoriteFolders()) {
    const o = document.createElement('option'); o.value = f; o.textContent = f;
    sel.appendChild(o);
  }
  const optNew = document.createElement('option'); optNew.value = '__new__'; optNew.textContent = 'New folder…';
  sel.appendChild(optNew);
  sel.value = item.folder || '';
  sel.addEventListener('click', (e) => e.stopPropagation());
  sel.addEventListener('change', () => {
    if (sel.value === '__new__') {
      const name = (prompt('New folder name:') || '').trim();
      if (!name) { sel.value = item.folder || ''; return; }
      moveFavoriteToFolder(item.id, name);
    } else {
      moveFavoriteToFolder(item.id, sel.value);
    }
  });
  return sel;
}
function favoriteBarButton(f) {
  const btn = document.createElement('button');
  btn.className = 'bmbar-item';
  btn.title = f.url || f.title || '';
  const fav = faviconImg(f.url, 'bmbar-favicon'); if (fav) btn.appendChild(fav);
  const t = document.createElement('span'); t.className = 'bmbar-label';
  t.textContent = f.title || f.url || 'Favorite';
  btn.appendChild(t);
  btn.addEventListener('click', () => { closeDrawer(); openUrlInTab(f.url); });
  return btn;
}
function renderFavoritesBar() {
  if (!els.favoritesBar || !settings.favoritesBar) return;
  els.favoritesBar.innerHTML = '';
  if (!favorites.length) {
    const hint = document.createElement('span'); hint.className = 'bmbar-empty';
    hint.textContent = 'No favorites yet — click ★ to add a website.';
    els.favoritesBar.appendChild(hint);
    return;
  }
  // Foldered favorites collapse into dropdown buttons; unfiled ones sit inline.
  for (const fld of allFavoriteFolders().filter((f) => favorites.some((x) => x.folder === f))) {
    const items = favorites.filter((x) => x.folder === fld);
    const btn = document.createElement('button');
    btn.className = 'bmbar-item bmbar-folder';
    btn.textContent = `📁 ${fld}`;
    btn.addEventListener('click', (e) => openFavFolderMenu(e, items));
    els.favoritesBar.appendChild(btn);
  }
  for (const f of favorites.filter((x) => !x.folder)) els.favoritesBar.appendChild(favoriteBarButton(f));
}
function applyFavoritesBar() {
  if (!els.favoritesBar) return;
  els.favoritesBar.hidden = !settings.favoritesBar;
  if (els.favoritesBarToggle) els.favoritesBarToggle.checked = !!settings.favoritesBar;
  if (settings.favoritesBar) renderFavoritesBar();
}

// ---- Import websites from another browser (Chrome/Edge/Brave/Vivaldi) ----
// Browser "bookmarks" are websites, so they land in Favorites (not Saved Pages,
// which is for composed Chervil pages). De-duplicates by site key and keeps the
// original folder structure. Returns { added, skipped }.
function mergeImportedFavorites(entries) {
  let added = 0;
  let skipped = 0;
  const seen = new Set(favorites.map((f) => f.key));
  const fresh = [];
  for (const e of entries || []) {
    if (!e || !e.url) continue;
    const key = 'site:' + e.url;
    if (seen.has(key)) { skipped++; continue; }
    seen.add(key);
    clearFavoriteTombstone(key); // an import re-adds — override any prior delete
    const folder = (e.folder || '').trim();
    if (folder && !favoriteFolders.includes(folder)) favoriteFolders.push(folder);
    fresh.push({ id: uid(), key, url: e.url, title: e.title || e.url, at: e.addedAt || Date.now(), folder });
    added++;
  }
  if (fresh.length) {
    favorites = favorites.concat(fresh); // keep imports in source order, after existing
    updateFavoriteStar();
    if (els.libraryDrawer.classList.contains('open')) renderDrawer();
    renderFavoritesBar();
    scheduleSave();
  }
  return { added, skipped };
}

async function importFromBrowser() {
  if (!window.chervil.importListSources) return;
  if (els.importBookmarksBtn) els.importBookmarksBtn.disabled = true;
  let res;
  try { res = await window.chervil.importListSources(); } catch { res = null; }
  if (els.importBookmarksBtn) els.importBookmarksBtn.disabled = false;
  const sources = (res && res.ok && Array.isArray(res.sources)) ? res.sources : [];
  if (!sources.length) { toast('No bookmarks found from Chrome, Edge, Brave, or Vivaldi.'); return; }

  const doImport = async (src) => {
    let r;
    try { r = await window.chervil.importBookmarks(src.path); } catch { r = null; }
    if (!r || !r.ok || !Array.isArray(r.entries)) { toast('Couldn’t read those bookmarks.'); return; }
    const { added, skipped } = mergeImportedFavorites(r.entries);
    let msg = `Imported ${added} website${added === 1 ? '' : 's'} to Favorites from ${src.label}.`;
    if (skipped) msg += ` ${skipped} were already there.`;
    toast(msg);
    if (els.importStatus) els.importStatus.textContent = `Last import: ${added} added, ${skipped} skipped from ${src.label}.`;
  };

  if (sources.length === 1) {
    const s = sources[0];
    showActionSheet('Import to Favorites', `Import ${s.count} websites from ${s.label} into your Favorites?`, [
      { label: `Import ${s.count}`, primary: true, onClick: () => doImport(s) },
      { label: 'Cancel' },
    ]);
  } else {
    const actions = sources.map((s) => ({ label: `${s.label} · ${s.count}`, onClick: () => doImport(s) }));
    showActionSheet('Import to Favorites', 'Choose which browser profile to import from:', actions);
  }
}

// ---- Import browsing history from another browser ----
// Merge imported {url,title,at} into siteHistory (the History tab). De-dupes by URL,
// keeps newest-first, and honors the same cap as normal browsing history.
function mergeImportedHistory(entries) {
  let added = 0;
  let skipped = 0;
  const seen = new Set(siteHistory.map((s) => s.url));
  const fresh = [];
  for (const e of entries || []) {
    if (!e || !e.url) continue;
    if (seen.has(e.url)) { skipped++; continue; }
    seen.add(e.url);
    fresh.push({ id: uid(), url: e.url, title: e.title || hostOf(e.url) || e.url, at: e.at || Date.now() });
    added++;
  }
  if (fresh.length) {
    siteHistory = siteHistory.concat(fresh).sort((a, b) => (b.at || 0) - (a.at || 0));
    if (siteHistory.length > MAX_SITE_HISTORY) siteHistory.length = MAX_SITE_HISTORY;
    if (els.libraryDrawer.classList.contains('open')) renderDrawer();
    scheduleSave();
  }
  return { added, skipped };
}

async function importHistoryFromBrowser() {
  if (!window.chervil.importListHistorySources) return;
  if (els.importHistoryBtn) els.importHistoryBtn.disabled = true;
  let res;
  try { res = await window.chervil.importListHistorySources(); } catch { res = null; }
  if (els.importHistoryBtn) els.importHistoryBtn.disabled = false;
  const sources = (res && res.ok && Array.isArray(res.sources)) ? res.sources : [];
  if (!sources.length) { toast('No browser history found to import.'); return; }

  const doImport = async (src) => {
    if (els.importHistoryBtn) els.importHistoryBtn.disabled = true;
    let r;
    try { r = await window.chervil.importHistory(src.path); } catch { r = null; }
    if (els.importHistoryBtn) els.importHistoryBtn.disabled = false;
    if (!r || !r.ok || !Array.isArray(r.entries)) { toast('Couldn’t read that history.'); return; }
    const { added, skipped } = mergeImportedHistory(r.entries);
    let msg = `Imported ${added} histor${added === 1 ? 'y entry' : 'y entries'} from ${src.label}.`;
    if (skipped) msg += ` ${skipped} were already there.`;
    toast(msg);
    if (els.importHistoryStatus) els.importHistoryStatus.textContent = `Last import: ${added} added, ${skipped} skipped from ${src.label}.`;
  };

  if (sources.length === 1) {
    const s = sources[0];
    showActionSheet('Import history', `Import your recent history from ${s.label} into Chervil?`, [
      { label: 'Import', primary: true, onClick: () => doImport(s) },
      { label: 'Cancel' },
    ]);
  } else {
    const actions = sources.map((s) => ({ label: s.label, onClick: () => doImport(s) }));
    showActionSheet('Import history', 'Choose which browser profile to import from:', actions);
  }
}

// ---- Import passwords from a CSV export → encrypted vault ----
// The vault must be set up + unlocked first; the actual parse/save happens in the
// main process, so plaintext passwords never come back here — we only get counts.
// ---- First-run welcome (switcher onboarding) ----
// Shown once on a fresh profile; re-runnable from Settings → Browser. Every step
// reuses the real flows (import pickers, default-browser handoff), so this is
// just a friendly front door — skipping it loses nothing.
function showOnboarding() {
  const overlay = document.createElement('div');
  overlay.className = 'chervil-sheet-overlay';
  const close = () => { overlay.remove(); document.removeEventListener('keydown', onEsc); };
  const onEsc = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onEsc);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  const sheet = document.createElement('div');
  sheet.className = 'chervil-sheet onboard-sheet';
  const h = document.createElement('div'); h.className = 'chervil-sheet-title'; h.textContent = '🌿 Welcome to Chervil';
  const sub = document.createElement('div'); sub.className = 'chervil-sheet-sub';
  sub.textContent = 'A few quick steps to make yourself at home. Everything here is optional — it all lives in Settings too.';
  sheet.appendChild(h); sheet.appendChild(sub);

  const step = (title, desc) => {
    const row = document.createElement('div'); row.className = 'onboard-step';
    const t = document.createElement('div'); t.className = 'onboard-step-title'; t.textContent = title; row.appendChild(t);
    if (desc) { const d = document.createElement('div'); d.className = 'onboard-step-desc'; d.textContent = desc; row.appendChild(d); }
    const acts = document.createElement('div'); acts.className = 'onboard-step-actions'; row.appendChild(acts);
    sheet.appendChild(row);
    return acts;
  };
  const btn = (label, fn) => {
    const b = document.createElement('button'); b.className = 'lib-btn'; b.textContent = label;
    b.addEventListener('click', fn);
    return b;
  };

  const imp = step('1 · Bring your stuff', 'Import from Chrome, Edge, Brave, Vivaldi, or Opera. Bookmarks land in Favorites. Passwords import from a CSV in Settings → Security.');
  imp.appendChild(btn('Bookmarks…', importFromBrowser));
  imp.appendChild(btn('History…', importHistoryFromBrowser));
  imp.appendChild(btn('Address…', importAddressFromBrowser));

  const se = step('2 · Web-search engine', 'Sprig answers by default; bangs (g!, ddg!, b!) do a plain search with this engine.');
  const sel = document.createElement('select');
  for (const [v, label] of [['google', 'Google'], ['duckduckgo', 'DuckDuckGo'], ['bing', 'Bing']]) {
    const o = document.createElement('option'); o.value = v; o.textContent = label; sel.appendChild(o);
  }
  sel.value = settings.searchEngine || 'google';
  sel.addEventListener('change', () => {
    settings.searchEngine = sel.value;
    scheduleSave();
    const s2 = document.getElementById('search-engine-select'); if (s2) s2.value = sel.value; // keep Settings in sync
  });
  se.appendChild(sel);

  const def = step('3 · Make Chervil your default browser', 'Links from other apps open here. Windows asks you to confirm the switch.');
  def.appendChild(btn('Make default…', makeDefaultBrowserFlow));

  const foot = document.createElement('div'); foot.className = 'onboard-foot';
  const tip = document.createElement('div'); tip.className = 'onboard-tip';
  tip.textContent = 'Tip: on any website, try 💬 ask about the page, 🌐 translate, 🔊 read aloud, and ✂ snip — all in the toolbar.';
  foot.appendChild(tip);
  const go = document.createElement('button');
  go.className = 'chervil-sheet-btn primary';
  go.textContent = 'Get started';
  go.addEventListener('click', close);
  foot.appendChild(go);
  sheet.appendChild(foot);

  overlay.appendChild(sheet);
  document.body.appendChild(overlay);
}

async function importPasswordsFromCsv() {
  if (!window.chervil.importPasswordsCsv) return;
  if (!(await ensureVaultUnlocked())) return; // prompts setup/unlock as needed
  let r;
  try { r = await window.chervil.importPasswordsCsv(); } catch { r = null; }
  if (!r || r.canceled) return;
  if (!r.ok) {
    const msg = r.error === 'not-a-passwords-csv' ? 'That doesn’t look like a passwords CSV export.'
      : r.error === 'locked' ? 'Unlock your vault first (Settings → Security).'
      : r.error === 'needs-setup' ? 'Set up your password vault first (Settings → Security).'
      : (r.error || 'Import failed.');
    toast(msg);
    return;
  }
  let msg = `Imported ${r.added} password${r.added === 1 ? '' : 's'} into your vault.`;
  if (r.skipped) msg += ` ${r.skipped} skipped (already saved).`;
  if (r.failed) msg += ` ${r.failed} failed.`;
  toast(msg);
  if (els.importPwStatus) els.importPwStatus.textContent = `Last import: ${r.added} added, ${r.skipped} skipped${r.failed ? `, ${r.failed} failed` : ''}.`;
  updatePwFillButton();
}

// ---- Import a saved browser address → the autofill identity ----
async function importAddressFromBrowser() {
  if (!window.chervil.importListAddressSources) return;
  if (els.importAddressBtn) els.importAddressBtn.disabled = true;
  let res;
  try { res = await window.chervil.importListAddressSources(); } catch { res = null; }
  if (els.importAddressBtn) els.importAddressBtn.disabled = false;
  const sources = (res && res.ok && Array.isArray(res.sources)) ? res.sources : [];
  if (!sources.length) { toast('No saved addresses found in Chrome, Edge, Brave, or Vivaldi.'); return; }

  const doImport = async (src) => {
    let r;
    try { r = await window.chervil.importAddress(src.path); } catch { r = null; }
    const fields = (r && r.ok && r.fields) ? r.fields : null;
    if (!fields || !Object.keys(fields).length) { toast('Couldn’t read an address from that profile.'); return; }
    settings.autofill = settings.autofill || {};
    let filled = 0;
    for (const k of AUTOFILL_FIELDS) {
      if (fields[k]) { settings.autofill[k] = fields[k]; filled++; }
    }
    for (const k of AUTOFILL_FIELDS) { const el = document.getElementById('af-' + k); if (el) el.value = settings.autofill[k] || ''; }
    scheduleSave();
    toast(`Imported your ${src.label} address (${filled} field${filled === 1 ? '' : 's'} filled).`);
    if (els.importAddressStatus) els.importAddressStatus.textContent = `Filled ${filled} autofill field${filled === 1 ? '' : 's'} from ${src.label}.`;
  };

  if (sources.length === 1) { doImport(sources[0]); return; }
  const actions = sources.map((s) => ({ label: s.label, onClick: () => doImport(s) }));
  showActionSheet('Import address', 'Choose which browser profile to import your address from:', actions);
}

// One-time (idempotent) migration: websites saved in the old mixed Bookmarks list
// belong in Favorites now. Move every kind:'site' entry across — carrying its
// folder — tombstoning it in Saved Pages so sync doesn't drag it back. Runs on load
// and after each sync reconcile, so a site arriving from another machine is relocated
// too. Returns how many moved.
function migrateSiteBookmarksToFavorites() {
  const sites = bookmarks.filter((b) => b && b.kind === 'site');
  if (!sites.length) return 0;
  const favKeys = new Set(favorites.map((f) => f.key));
  let moved = 0;
  for (const b of sites) {
    const key = b.key || ('site:' + (b.url || ''));
    if (!favKeys.has(key)) {
      favKeys.add(key);
      // NB: do NOT clearFavoriteTombstone here. A migrated site carries its old `at`,
      // so if the user deleted this favorite (newer tombstone), the merge should keep
      // it deleted. Clearing the tombstone would resurrect an intentional deletion
      // when an un-upgraded machine re-syncs its legacy site bookmark.
      const folder = (b.folder || '').trim();
      if (folder && !favoriteFolders.includes(folder)) favoriteFolders.push(folder);
      favorites.push({ id: uid(), key, url: b.url, title: b.title || b.url, at: b.at || Date.now(), folder });
    }
    addBookmarkTombstone(key); // it must not resurrect in Saved Pages
    moved++;
  }
  bookmarks = bookmarks.filter((b) => !(b && b.kind === 'site'));
  return moved;
}

function removeSite(id) {
  addTombstone('sites', id);
  siteHistory = siteHistory.filter((s) => s.id !== id);
  renderDrawer();
  scheduleSave();
}
function clearSiteHistory() {
  if (!siteHistory.length) return;
  if (!confirm('Clear all browsing history?')) return;
  for (const s of siteHistory) addTombstone('sites', s && s.id);
  siteHistory = [];
  renderDrawer();
  scheduleSave();
}
// Downloads shelf — the list only; this never deletes the file on disk.
function removeDownload(id) {
  downloads = downloads.filter((d) => d.id !== id);
  renderDrawer();
  scheduleSave();
}
function clearDownloads() {
  if (!downloads.length) return;
  if (!confirm('Clear the downloads list? (The files stay on your disk.)')) return;
  downloads = [];
  renderDrawer();
  scheduleSave();
}

// Searchable text for a Library row across all tab types.
function libItemText(it) {
  return [it.title, it.url, it.query, it.filename].filter(Boolean).join(' ').toLowerCase();
}

// A site favicon via DuckDuckGo's icon service (privacy-friendly, needs no capture
// and works retroactively for saved history/bookmarks). Returns an <img> that
// removes itself if the icon can't load, so there's never a broken-image box.
function faviconUrl(u) {
  try { return `https://icons.duckduckgo.com/ip3/${new URL(/^https?:\/\//i.test(u) ? u : 'https://' + u).hostname}.ico`; }
  catch { return ''; }
}
function faviconImg(u, cls) {
  const src = faviconUrl(u);
  if (!src) return null;
  const img = document.createElement('img');
  img.className = cls;
  img.src = src;
  img.loading = 'lazy';
  img.alt = '';
  img.addEventListener('error', () => img.remove());
  return img;
}

// ---- Bookmark folders + bookmarks bar ----
// Every folder name in play: explicit ones (incl. empty) plus any a bookmark uses.
function allBookmarkFolders() {
  const set = new Set(bookmarkFolders);
  for (const b of bookmarks) if (b.folder) set.add(b.folder);
  return [...set];
}
function createBookmarkFolder() {
  const name = (prompt('New folder name:') || '').trim();
  if (!name) return;
  if (!bookmarkFolders.includes(name)) bookmarkFolders.push(name);
  scheduleSave();
  renderDrawer();
  renderBookmarksBar();
}

function applyBookmarksBar() {
  if (!els.bookmarksBar) return;
  els.bookmarksBar.hidden = !settings.bookmarksBar;
  if (els.bookmarksBarToggle) els.bookmarksBarToggle.checked = !!settings.bookmarksBar;
  if (settings.bookmarksBar) renderBookmarksBar();
}

// Reflect the Browsing & privacy controls (default-browser status, ad-block toggle
// + session count) when Settings opens.
async function refreshPrivacyUI() {
  if (els.adblockToggle) els.adblockToggle.checked = !!settings.adblock;
  if (els.spellcheckToggle) els.spellcheckToggle.checked = settings.spellcheck !== false;
  if (els.sharePopupToggle) els.sharePopupToggle.checked = settings.sharePopup !== false;
  if (els.shareFedicaToggle) els.shareFedicaToggle.checked = settings.shareFedica !== false;
  if (els.shareAddtoanyToggle) els.shareAddtoanyToggle.checked = settings.shareAddtoany !== false;
  if (els.adblockStat && window.chervil.adblockStats) {
    try { const s = await window.chervil.adblockStats(); els.adblockStat.textContent = (s && s.enabled) ? `· ${s.blocked} blocked this session` : ''; }
    catch { /* ignore */ }
  }
  if (els.defaultBrowserStatus && window.chervil.defaultBrowserStatus) {
    try {
      const st = await window.chervil.defaultBrowserStatus();
      els.defaultBrowserStatus.textContent = (st && st.isDefault)
        ? 'Chervil is your default browser.'
        : 'Open links from other apps in Chervil.';
      els.defaultBrowserStatus.className = 'field-note' + (st && st.isDefault ? ' ok' : '');
    } catch { /* ignore */ }
  }
}
function bookmarkBarButton(b) {
  const btn = document.createElement('button');
  btn.className = 'bmbar-item';
  btn.title = b.url || b.title || '';
  if (b.kind === 'site' && b.url) { const fav = faviconImg(b.url, 'bmbar-favicon'); if (fav) btn.appendChild(fav); }
  const t = document.createElement('span'); t.className = 'bmbar-label';
  t.textContent = b.title || b.url || 'Bookmark';
  btn.appendChild(t);
  btn.addEventListener('click', () => openBookmark(b));
  return btn;
}
function renderBookmarksBar() {
  if (!els.bookmarksBar || !settings.bookmarksBar) return;
  els.bookmarksBar.innerHTML = '';
  if (!bookmarks.length) {
    const hint = document.createElement('span'); hint.className = 'bmbar-empty';
    hint.textContent = 'No saved pages yet — click the bookmark button on a composed page.';
    els.bookmarksBar.appendChild(hint);
    return;
  }
  for (const f of allBookmarkFolders().filter((f) => bookmarks.some((b) => b.folder === f))) {
    const items = bookmarks.filter((b) => b.folder === f);
    const btn = document.createElement('button');
    btn.className = 'bmbar-item bmbar-folder';
    btn.textContent = `📁 ${f}`;
    btn.addEventListener('click', (e) => openBmFolderMenu(e, items));
    els.bookmarksBar.appendChild(btn);
  }
  for (const b of bookmarks.filter((b) => !b.folder)) els.bookmarksBar.appendChild(bookmarkBarButton(b));
}
// Little dropdown listing a folder's bookmarks off the bookmarks bar.
let bmFolderMenuEl = null;
function closeBmFolderMenu() {
  if (!bmFolderMenuEl) return;
  bmFolderMenuEl.remove(); bmFolderMenuEl = null;
  document.removeEventListener('mousedown', onBmMenuOutside, true);
}
function onBmMenuOutside(e) { if (bmFolderMenuEl && !bmFolderMenuEl.contains(e.target)) closeBmFolderMenu(); }
function openBmFolderMenu(e, items) {
  closeBmFolderMenu();
  const menu = document.createElement('div'); menu.className = 'bmbar-menu';
  for (const b of items) {
    const row = document.createElement('button'); row.className = 'bmbar-menu-row';
    if (b.kind === 'site' && b.url) { const fav = faviconImg(b.url, 'bmbar-favicon'); if (fav) row.appendChild(fav); }
    const t = document.createElement('span'); t.textContent = b.title || b.url || 'Bookmark';
    row.appendChild(t);
    row.addEventListener('click', () => { closeBmFolderMenu(); openBookmark(b); });
    menu.appendChild(row);
  }
  document.body.appendChild(menu);
  const r = e.currentTarget.getBoundingClientRect();
  menu.style.left = Math.max(6, Math.min(r.left, window.innerWidth - menu.offsetWidth - 8)) + 'px';
  menu.style.top = (r.bottom + 4) + 'px';
  setTimeout(() => document.addEventListener('mousedown', onBmMenuOutside, true), 0);
}
// Same dropdown, for a Favorites-bar folder (opens each site live).
function openFavFolderMenu(e, items) {
  closeBmFolderMenu();
  const menu = document.createElement('div'); menu.className = 'bmbar-menu';
  bmFolderMenuEl = menu;
  for (const f of items) {
    const row = document.createElement('button'); row.className = 'bmbar-menu-row';
    const fav = faviconImg(f.url, 'bmbar-favicon'); if (fav) row.appendChild(fav);
    const t = document.createElement('span'); t.textContent = f.title || f.url || 'Favorite';
    row.appendChild(t);
    row.addEventListener('click', () => { closeBmFolderMenu(); closeDrawer(); openUrlInTab(f.url); });
    menu.appendChild(row);
  }
  document.body.appendChild(menu);
  const r = e.currentTarget.getBoundingClientRect();
  menu.style.left = Math.max(6, Math.min(r.left, window.innerWidth - menu.offsetWidth - 8)) + 'px';
  menu.style.top = (r.bottom + 4) + 'px';
  setTimeout(() => document.addEventListener('mousedown', onBmMenuOutside, true), 0);
}
// Collapsed folder groups in the Library (per tab), persisted so a tidy view sticks.
function folderCollapseKey(tab, folder) { return `${tab}:${folder || ''}`; }
function isFolderCollapsed(tab, folder) {
  return Array.isArray(settings.collapsedFolders) && settings.collapsedFolders.includes(folderCollapseKey(tab, folder));
}
function toggleFolderCollapsed(tab, folder) {
  if (!Array.isArray(settings.collapsedFolders)) settings.collapsedFolders = [];
  const key = folderCollapseKey(tab, folder);
  const i = settings.collapsedFolders.indexOf(key);
  if (i >= 0) settings.collapsedFolders.splice(i, 1); else settings.collapsedFolders.push(key);
  scheduleSave();
  renderDrawer();
}
// Distinct folder buckets present in a grouped tab (incl. '' = Unfiled).
function foldersInTab(tab) {
  const src = tab === 'favorites' ? favorites : tab === 'bookmarks' ? bookmarks : [];
  const set = new Set();
  for (const it of src) set.add(it.folder || '');
  return [...set];
}
// One click to fold/unfold every folder in the current grouped tab.
function toggleCollapseAll() {
  const tab = drawerTab;
  const folders = foldersInTab(tab);
  if (!folders.length) return;
  if (!Array.isArray(settings.collapsedFolders)) settings.collapsedFolders = [];
  const anyExpanded = folders.some((f) => !isFolderCollapsed(tab, f));
  const keys = new Set(settings.collapsedFolders);
  for (const f of folders) {
    const k = folderCollapseKey(tab, f);
    if (anyExpanded) keys.add(k); else keys.delete(k); // open → collapse all; all closed → expand all
  }
  settings.collapsedFolders = [...keys];
  scheduleSave();
  renderDrawer();
}

// Library → Collections: one collapsible group per collection, with per-item
// rows and header actions (add current page / open all / rename / delete).
function renderCollectionsPanel(q) {
  els.libraryList.innerHTML = '';
  let list = collections;
  if (q) {
    list = collections.filter((c) =>
      (c.name + ' ' + c.items.map((it) => `${it.title} ${it.url}`).join(' ')).toLowerCase().includes(q));
  }
  if (!list.length) {
    const empty = document.createElement('div');
    empty.className = 'lib-empty';
    empty.textContent = q
      ? `No matches for “${librarySearch.trim()}”.`
      : 'No collections yet. Create one, then add pages from a tab’s right-click menu (“Add to Collection…”). Then try: “Sprig, compose a page based on the <name> Collection” — or “open all pages in the <name> Collection in tabs.”';
    els.libraryList.appendChild(empty);
    return;
  }
  const mkBtn = (text, title, onClick) => {
    const b = document.createElement('button');
    b.className = 'lib-btn';
    b.textContent = text;
    b.title = title;
    b.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
    return b;
  };
  for (const c of list) {
    const collapsed = isFolderCollapsed('collections', c.id) && !q;
    const head = document.createElement('div');
    head.className = 'lib-folder-head coll-head' + (collapsed ? ' collapsed' : '');
    const name = document.createElement('span');
    name.className = 'coll-name';
    name.textContent = `${collapsed ? '▸' : '▾'} ${c.name} · ${c.items.length}`;
    name.title = collapsed ? 'Expand' : 'Collapse';
    head.appendChild(name);
    const actions = document.createElement('span');
    actions.className = 'coll-actions';
    actions.appendChild(mkBtn('＋ Add this page', 'Add the current page to this collection', () => {
      addToCollection(c, collectionPageForTab(activeTab()));
    }));
    actions.appendChild(mkBtn('⧉ Open all', `Open all ${c.items.length} pages in tabs`, () => openCollectionInTabs(c)));
    actions.appendChild(mkBtn('✎', 'Rename', () => renameCollection(c)));
    const del = mkBtn('🗑', 'Delete collection', () => deleteCollection(c.id));
    del.classList.add('danger');
    actions.appendChild(del);
    head.appendChild(actions);
    head.addEventListener('click', () => toggleFolderCollapsed('collections', c.id));
    els.libraryList.appendChild(head);
    if (collapsed) continue;
    if (!c.items.length) {
      const none = document.createElement('div');
      none.className = 'coll-item-empty';
      none.textContent = 'Empty — use “＋ Add this page”, or a tab’s right-click → Add to Collection…';
      els.libraryList.appendChild(none);
      continue;
    }
    for (const it of c.items) {
      const row = document.createElement('div');
      row.className = 'coll-item';
      const fav = faviconImg(it.url, 'coll-favicon');
      if (fav) row.appendChild(fav);
      const meta = document.createElement('div');
      meta.className = 'coll-item-meta';
      const t = document.createElement('div');
      t.className = 'coll-item-title';
      t.textContent = it.title || it.url;
      const u = document.createElement('div');
      u.className = 'coll-item-url';
      u.textContent = it.url;
      meta.append(t, u);
      meta.title = 'Open in a new tab';
      meta.addEventListener('click', () => { closeDrawer(); openUrlInNewTab(it.url); });
      row.appendChild(meta);
      const rm = mkBtn('✕', 'Remove from collection', () => removeFromCollection(c, it.id));
      row.appendChild(rm);
      els.libraryList.appendChild(row);
    }
  }
}

function renderDrawer() {
  els.libTabHistory.classList.toggle('active', drawerTab === 'history');
  els.libTabTrash.classList.toggle('active', drawerTab === 'trash');
  if (els.libTabBookmarks) els.libTabBookmarks.classList.toggle('active', drawerTab === 'bookmarks');
  if (els.libTabFavorites) els.libTabFavorites.classList.toggle('active', drawerTab === 'favorites');
  if (els.libTabCollections) els.libTabCollections.classList.toggle('active', drawerTab === 'collections');
  if (els.libTabSites) els.libTabSites.classList.toggle('active', drawerTab === 'sites');
  if (els.libTabDownloads) els.libTabDownloads.classList.toggle('active', drawerTab === 'downloads');
  els.emptyTrash.hidden = drawerTab !== 'trash';
  if (els.clearSites) els.clearSites.hidden = drawerTab !== 'sites' || !siteHistory.length;
  if (els.clearDownloads) els.clearDownloads.hidden = drawerTab !== 'downloads' || !downloads.length;
  if (els.libNewFolder) els.libNewFolder.hidden = drawerTab !== 'favorites';
  if (els.libNewCollection) els.libNewCollection.hidden = drawerTab !== 'collections';
  if (els.libCollapseAll) {
    const grpTab = drawerTab === 'favorites' && !librarySearch.trim();
    const folders = grpTab ? foldersInTab(drawerTab) : [];
    els.libCollapseAll.hidden = !(grpTab && folders.length >= 2);
    if (!els.libCollapseAll.hidden) {
      els.libCollapseAll.textContent = folders.some((f) => !isFolderCollapsed(drawerTab, f)) ? 'Collapse all' : 'Expand all';
    }
  }
  // Select mode only applies to History; leaving History cancels it.
  if (drawerTab !== 'history' && librarySelectMode) { librarySelectMode = false; selectedLibraryIds.clear(); }
  renderSpaceBar();

  // Collections render their own grouped panel (collection → items), not the
  // shared flat list below.
  if (drawerTab === 'collections') {
    if (els.libSelectToggle) els.libSelectToggle.hidden = true;
    if (els.libSelectBar) els.libSelectBar.hidden = true;
    renderCollectionsPanel(librarySearch.trim().toLowerCase());
    return;
  }

  let items = drawerTab === 'history' ? library.history        // Activity: flat, newest-first
    : drawerTab === 'bookmarks' ? savedSpaceItems()            // Saved Pages: the active Space
      : drawerTab === 'favorites' ? favorites
        : drawerTab === 'sites' ? siteHistory
          : drawerTab === 'downloads' ? downloads
            : library.trash;

  // Free-text filter across the visible list (title/url/query/filename).
  const q = librarySearch.trim().toLowerCase();
  if (q) items = items.filter((it) => libItemText(it).includes(q));

  // Bookmarks (unsearched): group by folder — sort so folder headers can be
  // inserted between groups, with Unfiled last.
  const grouping = drawerTab === 'favorites' && !q; // only Favorites uses folder groups now
  if (grouping) {
    const order = allFavoriteFolders();
    items = items.slice().sort((a, b) => {
      const fa = a.folder || '', fb = b.folder || '';
      if (fa === fb) return 0;
      if (!fa) return 1;
      if (!fb) return -1;
      return order.indexOf(fa) - order.indexOf(fb);
    });
  }
  let lastFolder = null;

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
    if (q) { empty.textContent = `No matches for “${librarySearch.trim()}”.`; els.libraryList.appendChild(empty); return; }
    empty.textContent = drawerTab === 'history'
      ? 'No composed pages yet. Pages you create show up here automatically.'
      : drawerTab === 'bookmarks'
        ? 'No saved pages in this Space yet. Open a composed page and click the bookmark button to save it here.'
        : drawerTab === 'favorites'
          ? 'No favorites yet. Open a website and click ★ — or import your bookmarks in Settings.'
          : drawerTab === 'sites'
            ? 'No browsing history yet. Open a website and it shows up here.'
            : drawerTab === 'downloads'
              ? 'No downloads yet. Files you download from sites show up here.'
              : 'Trash is empty.';
    els.libraryList.appendChild(empty);
    return;
  }

  const selecting = drawerTab === 'history' && librarySelectMode;
  // Per-folder counts in one pass (avoids an O(n) filter per header → O(n²) render).
  const folderCounts = grouping
    ? items.reduce((m, it) => { const k = it.folder || ''; return m.set(k, (m.get(k) || 0) + 1); }, new Map())
    : null;
  let collapsedNow = false; // are we currently inside a collapsed folder group?
  for (const item of items) {
    if (grouping) {
      const f = item.folder || '';
      if (f !== lastFolder) {
        lastFolder = f;
        collapsedNow = isFolderCollapsed(drawerTab, f);
        const count = folderCounts.get(f) || 0;
        const head = document.createElement('div');
        head.className = 'lib-folder-head' + (collapsedNow ? ' collapsed' : '');
        head.textContent = `${collapsedNow ? '▸' : '▾'} ${f || 'Unfiled'} · ${count}`;
        head.title = collapsedNow ? 'Expand folder' : 'Collapse folder';
        head.style.cursor = 'pointer';
        head.addEventListener('click', () => toggleFolderCollapsed(drawerTab, f));
        els.libraryList.appendChild(head);
      }
      if (collapsedNow) continue; // rows under a collapsed folder are hidden
    }
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
    // Site-type rows show a real favicon (added below) instead of a leading emoji.
    const isSiteRow = drawerTab === 'sites' || drawerTab === 'favorites' || (drawerTab === 'bookmarks' && item.kind === 'site');
    title.textContent = drawerTab === 'bookmarks'
      ? (item.kind === 'site' ? (item.title || item.url || 'Bookmark') : `📄 ${item.title || item.url || 'Bookmark'}`)
      : drawerTab === 'favorites'
        ? (item.title || item.url)
        : drawerTab === 'sites'
          ? (item.title || item.url)
          : drawerTab === 'downloads'
            ? `${item.ok ? '⬇' : '⚠'} ${item.filename || 'file'}`
            : (item.title || item.query || 'Untitled page');
    const meta = document.createElement('div');
    meta.className = 'lib-meta';
    meta.textContent = drawerTab === 'bookmarks'
      ? (item.kind === 'site' ? item.url : 'Composed page')
      : drawerTab === 'favorites'
        ? item.url
        : drawerTab === 'sites'
          ? `${item.url} · ${relTime(item.at)}`
          : drawerTab === 'downloads'
            ? (item.ok ? `${item.path} · ${relTime(item.at)}` : `${item.state || 'failed'} · ${relTime(item.at)}`)
            : relTime(item.createdAt);
    main.appendChild(title);
    main.appendChild(meta);
    if (isSiteRow) { const fav = faviconImg(item.url, 'lib-favicon'); if (fav) row.appendChild(fav); }
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
      actions.appendChild(savedSpaceSelect(item)); // move between Spaces (replaces folders)
      const del = document.createElement('button');
      del.className = 'lib-btn';
      del.textContent = 'Remove';
      del.addEventListener('click', () => removeBookmark(item.id));
      actions.appendChild(del);
    } else if (drawerTab === 'favorites') {
      main.title = 'Open';
      main.style.cursor = 'pointer';
      main.addEventListener('click', () => { closeDrawer(); openUrlInTab(item.url); });
      actions.appendChild(favoriteFolderSelect(item));
      const del = document.createElement('button');
      del.className = 'lib-btn';
      del.textContent = 'Remove';
      del.addEventListener('click', () => removeFavorite(item.id));
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
    } else if (drawerTab === 'downloads') {
      if (item.ok && item.path) {
        main.title = 'Open file';
        main.style.cursor = 'pointer';
        main.addEventListener('click', () => window.chervil.openPath(item.path));
        const show = document.createElement('button');
        show.className = 'lib-btn';
        show.textContent = 'Show in folder';
        show.addEventListener('click', () => window.chervil.showInFolder(item.path));
        actions.appendChild(show);
      }
      const del = document.createElement('button');
      del.className = 'lib-btn';
      del.textContent = 'Remove';
      del.addEventListener('click', () => removeDownload(item.id));
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
  librarySearch = '';
  if (els.libSearch) els.libSearch.value = '';
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
const PLACES_FIELDS = ['blog', 'x', 'bluesky', 'facebook', 'instagram', 'tiktok'];

// Your places → extras list (name + URL rows, editable in place).
function renderPlacesExtras() {
  const box = document.getElementById('pl-extras');
  if (!box) return;
  box.innerHTML = '';
  const extras = placesObj().extras;
  extras.forEach((ex, i) => {
    const row = document.createElement('div');
    row.className = 'place-extra-row';
    const name = document.createElement('input');
    name.type = 'text'; name.placeholder = 'Name (e.g. work portal)'; name.value = ex.name || '';
    const url = document.createElement('input');
    url.type = 'text'; url.placeholder = 'https://…'; url.value = ex.url || '';
    const del = document.createElement('button');
    del.type = 'button'; del.className = 'lib-btn'; del.textContent = '✕'; del.title = 'Remove this place';
    name.addEventListener('input', () => { ex.name = name.value.trim(); scheduleSave(); });
    url.addEventListener('input', () => { ex.url = url.value.trim(); scheduleSave(); });
    del.addEventListener('click', () => { extras.splice(i, 1); scheduleSave(); renderPlacesExtras(); });
    row.append(name, url, del);
    box.appendChild(row);
  });
}
function applyPlacesToUI() {
  const p = placesObj();
  for (const k of PLACES_FIELDS) {
    const el = document.getElementById('pl-' + k);
    if (el) el.value = p[k] || '';
  }
  const kind = document.getElementById('pl-email-kind');
  const url = document.getElementById('pl-email-url');
  if (kind) kind.value = p.email || '';
  if (url) { url.value = p.emailUrl || ''; url.hidden = p.email !== 'custom'; }
  renderPlacesExtras();
}

// --- Blogs → publishing targets (WordPress / Substack / Medium) ---
const BLOG_PLATFORMS = [['wordpress', 'WordPress'], ['substack', 'Substack'], ['medium', 'Medium']];
function blogTargets() {
  if (!Array.isArray(settings.blogTargets)) settings.blogTargets = [];
  return settings.blogTargets;
}
function blogSitePlaceholder(platform) {
  if (platform === 'substack') return 'https://yourname.substack.com';
  if (platform === 'medium') return 'https://medium.com/@yourname';
  return 'https://yourblog.com';
}
function renderBlogTargets() {
  const box = document.getElementById('blog-targets');
  if (!box) return;
  box.innerHTML = '';
  const list = blogTargets();
  list.forEach((t, i) => {
    const row = document.createElement('div');
    row.className = 'blog-target-row';
    const plat = document.createElement('select');
    for (const [val, label] of BLOG_PLATFORMS) {
      const o = document.createElement('option'); o.value = val; o.textContent = label; plat.appendChild(o);
    }
    plat.value = t.platform || 'wordpress';
    const name = document.createElement('input');
    name.type = 'text'; name.placeholder = 'Name (e.g. My blog)'; name.value = t.name || '';
    const site = document.createElement('input');
    site.type = 'text'; site.placeholder = blogSitePlaceholder(plat.value); site.value = t.siteUrl || '';
    const user = document.createElement('input');
    user.type = 'text'; user.placeholder = 'WordPress username'; user.value = t.username || '';
    user.hidden = plat.value !== 'wordpress';
    const pw = document.createElement('button');
    pw.type = 'button'; pw.className = 'lib-btn'; pw.textContent = '🔑 App password';
    pw.title = 'Store your WordPress application password in the encrypted vault';
    pw.hidden = plat.value !== 'wordpress';
    const del = document.createElement('button');
    del.type = 'button'; del.className = 'lib-btn'; del.textContent = '✕'; del.title = 'Remove this blog';
    plat.addEventListener('change', () => { t.platform = plat.value; scheduleSave(); renderBlogTargets(); });
    name.addEventListener('input', () => { t.name = name.value.trim(); scheduleSave(); });
    site.addEventListener('input', () => { t.siteUrl = site.value.trim(); scheduleSave(); });
    user.addEventListener('input', () => { t.username = user.value.trim(); scheduleSave(); });
    pw.addEventListener('click', () => setBlogAppPassword(t));
    del.addEventListener('click', () => { list.splice(i, 1); scheduleSave(); renderBlogTargets(); });
    row.append(plat, name, site, user, pw, del);
    box.appendChild(row);
  });
}
// Store a WordPress application password in the encrypted vault (keyed to the site).
async function setBlogAppPassword(t) {
  if (!t.siteUrl) { toast('Enter your WordPress site URL first.'); return; }
  if (!t.username) { toast('Enter your WordPress username first.'); return; }
  if (!(await ensureVaultUnlocked())) return;
  const pass = await showInputSheet({
    title: 'WordPress application password',
    subtitle: `Generate one in WordPress → Users → Profile → Application Passwords, then paste it for ${t.username}.`,
    placeholder: 'xxxx xxxx xxxx xxxx xxxx xxxx', type: 'password', okLabel: 'Save',
  });
  if (pass == null) return;
  const clean = String(pass).trim();
  if (!clean) { toast('No password entered.'); return; }
  try {
    const r = await window.chervil.creds.save({ origin: t.siteUrl, username: t.username, password: clean, label: 'WordPress app password' });
    toast((r && r.ok) ? 'App password saved to your vault.' : ((r && r.error) || 'Couldn’t save the app password.'));
  } catch { toast('Couldn’t save the app password.'); }
}
function applyBlogsToUI() {
  renderBlogTargets();
  const at = document.getElementById('blog-agent-toggle');
  if (at) at.checked = !!settings.blogAgent;
}

function applySettingsToUI() {
  applyPlacesToUI();
  applyBlogsToUI();
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
  if (els.menuBarToggle) els.menuBarToggle.checked = !!settings.showMenuBar;
  if (els.pwFillToggle) els.pwFillToggle.checked = toolbarVisible('pwFill');
  if (els.cardFillToggle) els.cardFillToggle.checked = toolbarVisible('cardFill');
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
  if (els.wakeConfirmToggle) els.wakeConfirmToggle.checked = settings.wakeConfirm !== false;
  if (els.noisyModeToggle) els.noisyModeToggle.checked = !!settings.noisyMode;
  if (els.sttKeyInput) els.sttKeyInput.value = '';
  if (els.heroToggle) els.heroToggle.checked = !!settings.heroImages;
  { const ps = document.getElementById('page-style-select'); if (ps) ps.value = settings.pageStyle || 'balanced'; }
  { const sf = document.getElementById('space-files-select'); if (sf) sf.value = settings.spaceFilesMode || 'synthesize'; }
  { const se = document.getElementById('search-engine-select'); if (se) se.value = settings.searchEngine || 'google'; }
  refreshSttKeyStatus();
  refreshImageKeyStatus();
  renderCredsPanel();
  renderCardsPanel();
  renderSitePermsPanel();
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
      if (r && r.ok) { toast('Password vault created.'); renderCredsPanel(); renderCardsPanel(); }
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
      if (r && r.ok) { toast('Passwords unlocked.'); renderCredsPanel(); renderCardsPanel(); updatePwFillButton(); }
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
  const lockBtn = credsEl('button', { class: 'lib-btn', text: '🔒 Lock', title: 'Lock the vault now', onclick: async () => { await window.chervil.creds.lock(); toast('Passwords locked.'); renderCredsPanel(); renderCardsPanel(); updatePwFillButton(); } });
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

  // Search box — filters the list by site or username (useful after importing many).
  const search = credsEl('input', { type: 'search', class: 'mcp-field creds-search', placeholder: 'Search saved logins…', spellcheck: 'false', autocomplete: 'off' });
  const listWrap = credsEl('div', { class: 'creds-list' });
  search.addEventListener('input', () => renderCredsList(listWrap, search.value));
  panel.appendChild(search);
  panel.appendChild(listWrap);
  renderCredsList(listWrap, '');
  panel.appendChild(credsAutoLockRow());
}

// Copy text to the clipboard, tolerating older/edge Electron clipboard behavior.
async function copyToClipboard(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch { try { return !!(window.chervil.copyText && (await window.chervil.copyText(text))); } catch { return false; } }
}

async function renderCredsList(wrap, filter) {
  wrap.innerHTML = '';
  let items = [];
  try { const r = await window.chervil.creds.list(); items = (r && r.ok && r.items) || []; } catch { /* ignore */ }
  const total = items.length;
  const q = (filter || '').trim().toLowerCase();
  if (q) items = items.filter((it) => (it.origin || '').toLowerCase().includes(q) || (it.username || '').toLowerCase().includes(q));
  if (!total) { wrap.appendChild(credsEl('div', { class: 'lib-empty', text: 'No saved logins yet.' })); return; }
  if (!items.length) { wrap.appendChild(credsEl('div', { class: 'lib-empty', text: `No logins match “${filter}”.` })); return; }
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
    const copyBtn = credsEl('button', { class: 'lib-btn', text: '📋 Copy', title: 'Copy password to clipboard', onclick: async () => {
      const r = await window.chervil.creds.reveal(it.id);
      if (r && r.ok && await copyToClipboard(r.password)) toast('Password copied to clipboard.');
      else toast('Couldn’t copy the password.');
    } });
    const editBtn = credsEl('button', { class: 'lib-btn', text: '✎ Edit', title: 'Edit this login', onclick: () => editCredRow(wrap, it, filter) });
    const delBtn = credsEl('button', { class: 'lib-btn danger', text: 'Delete', onclick: async () => {
      if (!confirm(`Delete the saved login for ${it.origin}?`)) return;
      const r = await window.chervil.creds.remove(it.id);
      if (r && r.ok) { toast('Login deleted.'); renderCredsList(wrap, filter); } else { toast('Couldn’t delete.'); }
    } });
    wrap.appendChild(credsEl('div', { class: 'creds-row' }, [meta, credsEl('div', { class: 'creds-actions' }, [revealBtn, copyBtn, editBtn, delBtn])]));
  }
}

// Inline edit for a saved login — change the username and/or set a new password.
// Leaving the password blank keeps the existing one (vault.save merges by id).
async function editCredRow(wrap, it, filter) {
  const uInput = credsEl('input', { type: 'text', class: 'mcp-field', placeholder: 'Username / email', spellcheck: 'false', autocomplete: 'off' });
  uInput.value = it.username || '';
  const pInput = credsEl('input', { type: 'password', class: 'mcp-field', placeholder: 'New password (blank = keep current)', autocomplete: 'new-password' });
  const genBtn = credsEl('button', { class: 'lib-btn', text: '🎲', title: 'Generate a strong password', onclick: () => { pInput.value = generatePassword(20); pInput.type = 'text'; } });
  const note = credsEl('small', { class: 'field-note' });
  const saveBtn = credsEl('button', { class: 'lib-btn primary', text: 'Save', onclick: async () => {
    const payload = { id: it.id, origin: it.origin, username: uInput.value.trim() };
    if (pInput.value) payload.password = pInput.value;
    const r = await window.chervil.creds.save(payload);
    if (r && r.ok) { toast('Login updated.'); renderCredsList(wrap, filter); }
    else { note.textContent = (r && r.error) || 'Couldn’t save.'; note.className = 'field-note warn'; }
  } });
  const cancelBtn = credsEl('button', { class: 'lib-btn', text: 'Cancel', onclick: () => renderCredsList(wrap, filter) });
  const row = credsEl('div', { class: 'creds-row creds-row-edit' }, [
    credsEl('div', { class: 'creds-meta' }, [
      credsEl('div', { class: 'creds-origin', text: it.origin }),
      credsEl('div', { class: 'mcp-add creds-add' }, [uInput, pInput, genBtn]),
      note,
    ]),
    credsEl('div', { class: 'creds-actions' }, [saveBtn, cancelBtn]),
  ]);
  wrap.innerHTML = '';
  wrap.appendChild(row);
  uInput.focus();
}

// Format a stored expiry (month int, 4-digit year) as MM/YY for display.
function fmtExpiry(month, year) { return ('0' + month).slice(-2) + '/' + String(year).slice(-2); }

// Payment cards panel — shares the same vault (and passphrase gate) as passwords.
async function renderCardsPanel() {
  const panel = els.cardsPanel;
  if (!panel || !window.chervil.cards || !window.chervil.creds) return;
  panel.innerHTML = '';
  let st;
  try { st = await window.chervil.creds.status(); } catch { st = null; }
  if (!st || !st.ok) { panel.appendChild(credsEl('p', { class: 'field-note warn', text: 'Card storage is unavailable in this build.' })); return; }
  if (!st.encryptionAvailable) {
    panel.appendChild(credsEl('p', { class: 'field-note warn', text: 'Your OS has no encryption backend available, so cards can’t be stored securely here.' }));
    return;
  }
  // The vault is created in the Passwords section above — don't duplicate setup.
  if (!st.configured) {
    panel.appendChild(credsEl('p', { class: 'group-hint', text: 'Set a master passphrase in the Passwords section above first — cards use the same encrypted vault.' }));
    return;
  }
  // Locked — offer to unlock right here (unlocks the whole vault for this session).
  if (!st.unlocked) {
    const input = credsEl('input', { type: 'password', class: 'mcp-field', placeholder: 'Master passphrase', autocomplete: 'current-password' });
    const note = credsEl('small', { class: 'field-note' });
    const submit = async () => {
      const r = await window.chervil.creds.unlock(input.value);
      if (r && r.ok) { toast('Vault unlocked.'); renderCardsPanel(); renderCredsPanel(); updatePwFillButton(); }
      else { note.textContent = (r && r.error) || 'Wrong passphrase.'; note.className = 'field-note warn'; input.select(); }
    };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    panel.appendChild(credsEl('p', { class: 'group-hint', text: 'Enter your master passphrase to view and manage saved cards.' }));
    panel.appendChild(credsEl('div', { class: 'mcp-add' }, [input, credsEl('button', { class: 'lib-btn primary', text: 'Unlock', onclick: submit })]));
    panel.appendChild(note);
    return;
  }

  // Unlocked — add-new card form.
  const nameInput = credsEl('input', { type: 'text', class: 'mcp-field', placeholder: 'Name on card', spellcheck: 'false', autocomplete: 'off' });
  const numInput = credsEl('input', { type: 'text', class: 'mcp-field', placeholder: 'Card number', spellcheck: 'false', autocomplete: 'off', inputmode: 'numeric' });
  const mmInput = credsEl('input', { type: 'text', class: 'mcp-field mcp-field-sm', placeholder: 'MM', spellcheck: 'false', autocomplete: 'off', inputmode: 'numeric', maxlength: '2' });
  const yyInput = credsEl('input', { type: 'text', class: 'mcp-field mcp-field-sm', placeholder: 'YYYY', spellcheck: 'false', autocomplete: 'off', inputmode: 'numeric', maxlength: '4' });
  const labelInput = credsEl('input', { type: 'text', class: 'mcp-field', placeholder: 'Label (optional, e.g. Personal)', spellcheck: 'false', autocomplete: 'off' });
  const addNote = credsEl('small', { class: 'field-note' });
  const addBtn = credsEl('button', { class: 'lib-btn primary', text: 'Save card', onclick: async () => {
    if (!numInput.value.trim() || !mmInput.value.trim() || !yyInput.value.trim()) { addNote.textContent = 'Card number and expiry are required.'; addNote.className = 'field-note warn'; return; }
    const r = await window.chervil.cards.save({ cardholder: nameInput.value.trim(), number: numInput.value, expMonth: mmInput.value.trim(), expYear: yyInput.value.trim(), label: labelInput.value.trim() });
    if (r && r.ok) { nameInput.value = numInput.value = mmInput.value = yyInput.value = labelInput.value = ''; addNote.textContent = ''; toast('Card saved.'); renderCardsList(listWrap); updatePwFillButton(); }
    else { addNote.textContent = (r && r.error) || 'Couldn’t save.'; addNote.className = 'field-note warn'; }
  } });
  panel.appendChild(credsEl('p', { class: 'field-note', text: 'The security code (CVC) is never stored — you’ll enter it at checkout.' }));
  panel.appendChild(credsEl('div', { class: 'mcp-add creds-add' }, [nameInput, numInput, mmInput, yyInput, labelInput, addBtn]));
  panel.appendChild(addNote);

  const listWrap = credsEl('div', { class: 'creds-list' });
  panel.appendChild(listWrap);
  renderCardsList(listWrap);
}

async function renderCardsList(wrap) {
  wrap.innerHTML = '';
  let items = [];
  try { const r = await window.chervil.cards.list(); items = (r && r.ok && r.items) || []; } catch { /* ignore */ }
  if (!items.length) { wrap.appendChild(credsEl('div', { class: 'lib-empty', text: 'No saved cards yet.' })); return; }
  items.sort((a, b) => (a.brand || '').localeCompare(b.brand || '') || (a.last4 || '').localeCompare(b.last4 || ''));
  for (const it of items) {
    const title = `${it.brand} ····${it.last4}` + (it.label ? ` · ${it.label}` : '');
    const meta = credsEl('div', { class: 'creds-meta' }, [
      credsEl('div', { class: 'creds-origin', text: title }),
      credsEl('div', { class: 'creds-user', text: `${it.cardholder || '(no name)'} · exp ${fmtExpiry(it.expMonth, it.expYear)}` }),
    ]);
    const revealBtn = credsEl('button', { class: 'lib-btn', text: '👁 Reveal', onclick: async (e) => {
      const shown = e.target.dataset.shown === '1';
      if (shown) { e.target.textContent = '👁 Reveal'; e.target.dataset.shown = '0'; meta.querySelector('.creds-pass')?.remove(); return; }
      const r = await window.chervil.cards.reveal(it.id);
      if (r && r.ok) {
        // Group the full number in 4s for readability; it isn't persisted anywhere.
        const grouped = String(r.number).replace(/(.{4})/g, '$1 ').trim();
        e.target.textContent = '🙈 Hide'; e.target.dataset.shown = '1';
        meta.appendChild(credsEl('div', { class: 'creds-pass', text: grouped }));
      } else { toast((r && r.error) || 'Couldn’t reveal.'); }
    } });
    const copyBtn = credsEl('button', { class: 'lib-btn', text: '📋 Copy', title: 'Copy card number to clipboard', onclick: async () => {
      const r = await window.chervil.cards.reveal(it.id);
      if (r && r.ok && await copyToClipboard(String(r.number))) toast('Card number copied to clipboard.');
      else toast('Couldn’t copy the card number.');
    } });
    const delBtn = credsEl('button', { class: 'lib-btn danger', text: 'Delete', onclick: async () => {
      if (!confirm(`Delete ${it.brand} ····${it.last4}?`)) return;
      const r = await window.chervil.cards.remove(it.id);
      if (r && r.ok) { toast('Card deleted.'); renderCardsList(wrap); updatePwFillButton(); } else { toast('Couldn’t delete.'); }
    } });
    wrap.appendChild(credsEl('div', { class: 'creds-row' }, [meta, credsEl('div', { class: 'creds-actions' }, [revealBtn, copyBtn, delBtn])]));
  }
}

// Site-permission decisions (camera/mic, location, notifications) for embedded
// sites. Read-only review + revoke; the grant prompts happen in the main process.
const SITE_PERM_LABELS = { media: 'Camera & microphone', geolocation: 'Location', notifications: 'Notifications' };
async function renderSitePermsPanel() {
  const panel = els.sitePermsPanel;
  if (!panel || !window.chervil.sitePerms) return;
  panel.innerHTML = '';
  let items = [];
  try { const r = await window.chervil.sitePerms.list(); items = (r && r.ok && r.items) || []; } catch { /* ignore */ }
  if (!items.length) { panel.appendChild(credsEl('small', { class: 'field-note', text: 'No site permissions saved yet. Chervil will ask the first time a site wants your camera, mic, location, or notifications.' })); return; }

  const clearAllBtn = credsEl('button', { class: 'lib-btn', text: 'Reset all', title: 'Forget every saved site permission', onclick: async () => {
    if (!confirm('Forget all saved site permissions? Sites will ask again next time.')) return;
    await window.chervil.sitePerms.clear();
    toast('Site permissions reset.'); renderSitePermsPanel();
  } });
  panel.appendChild(credsEl('div', { class: 'creds-toolbar' }, [credsEl('span', { class: 'field-note', text: `${items.length} site${items.length === 1 ? '' : 's'}` }), clearAllBtn]));

  for (const it of items) {
    const rows = Object.keys(it.permissions).map((perm) => {
      const decision = it.permissions[perm];
      const pill = credsEl('span', { class: 'perm-decision ' + (decision === 'allow' ? 'allow' : 'deny'), text: decision === 'allow' ? 'Allowed' : 'Blocked' });
      // Toggle allow/deny in place.
      const toggle = credsEl('button', { class: 'lib-btn', text: decision === 'allow' ? 'Block' : 'Allow', onclick: async () => {
        await window.chervil.sitePerms.set(it.origin, perm, decision === 'allow' ? 'deny' : 'allow');
        renderSitePermsPanel();
      } });
      const forget = credsEl('button', { class: 'lib-btn', text: '✕', title: 'Forget (ask again next time)', onclick: async () => {
        await window.chervil.sitePerms.clear(it.origin, perm); renderSitePermsPanel();
      } });
      return credsEl('div', { class: 'perm-line' }, [
        credsEl('span', { class: 'perm-name', text: SITE_PERM_LABELS[perm] || perm }),
        pill,
        credsEl('div', { class: 'creds-actions' }, [toggle, forget]),
      ]);
    });
    panel.appendChild(credsEl('div', { class: 'creds-row perm-row' }, [
      credsEl('div', { class: 'creds-meta' }, [credsEl('div', { class: 'creds-origin', text: it.origin }), ...rows]),
    ]));
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
  els.providerKeyRow.hidden = false; // every provider can take a key — Ollama's is optional (authed remote servers)
  els.providerModelRow.hidden = p === 'azure'; // Azure uses the deployment instead
  els.ollamaExtra.hidden = p !== 'ollama';
  els.azureExtra.hidden = p !== 'azure';
  if (els.ollamaKeyHint) els.ollamaKeyHint.hidden = p !== 'ollama';

  els.providerKeyLabel.textContent = p === 'ollama'
    ? 'API key for Ollama (optional)'
    : `API key for ${PROVIDER_LABELS[p]}`;
  rebuildModelSelect();
  els.ollamaUrl.value = settings.ollamaUrl || '';
  if (els.ollamaUrlStatus) { els.ollamaUrlStatus.textContent = ''; els.ollamaUrlStatus.className = 'field-note'; }
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
  window.chervil.getKeyStatus().then((s) => {
    const has = s && s[p];
    if (p === 'ollama') {
      // Ollama's key is optional — never warn that calls will fail without one.
      // The "why optional" explanation lives in the persistent #ollama-key-hint below.
      els.apiKeyStatus.textContent = has
        ? 'A saved token is in use (sent as a Bearer header, encrypted on this machine).'
        : 'No token saved — fine for local Ollama.';
      els.apiKeyStatus.className = has ? 'field-note ok' : 'field-note';
      return;
    }
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
  { key: 'history', id: 'history-btn', label: 'Library' },
  { key: 'schedules', id: 'sched-btn', label: 'Schedules' },
  { key: 'agents', id: 'agents-btn', label: 'Agents' },
  { key: 'pwFill', id: 'autofill-pw-btn', label: 'Fill saved login (🔑)' },
  { key: 'cardFill', id: 'autofill-card-btn', label: 'Fill saved card (💳)' },
  { key: 'bookmark', id: 'bookmark-btn', label: 'Save page' },
  { key: 'favorite', id: 'favorite-btn', label: 'Favorite (★)' },
  { key: 'save', id: 'save-btn', label: 'Save' },
  { key: 'askPage', id: 'ask-page-btn', label: 'Ask about this page (💬)' },
  { key: 'translate', id: 'translate-btn', label: 'Translate page (🌐)' },
  { key: 'readAloud', id: 'read-aloud-btn', label: 'Read aloud (🔊)' },
  { key: 'snip', id: 'snip-btn', label: 'Snip screenshot (✂)' },
  { key: 'sendPhone', id: 'send-phone-btn', label: 'Send to phone (📱)' },
  { key: 'emailPage', id: 'email-page-btn', label: 'Email this page (✉️)' },
  { key: 'shareFedica', id: 'share-fedica-btn', label: 'Share to Fedica (📣)' },
  { key: 'reader', id: 'reader-btn', label: 'Reader view' },
  { key: 'pip', id: 'pip-btn', label: 'Picture-in-picture' },
  { key: 'zoom', id: 'zoom-controls', label: 'Zoom controls' },
  { key: 'print', id: 'print-btn', label: 'Print' },
];

function toolbarVisible(key) { return !settings.toolbar || settings.toolbar[key] !== false; }

function applyToolbar() {
  for (const b of TOOLBAR_BUTTONS) {
    const el = document.getElementById(b.id);
    if (el) el.classList.toggle('btn-off', !toolbarVisible(b.key));
  }
  // The 🔑/💳 fill buttons are also context-sensitive (only on live sites with
  // saved creds), so re-evaluate them and keep the Security-tab checkboxes — a
  // second entry point to the same toggle — in sync with the toolbar options.
  if (els.pwFillToggle) els.pwFillToggle.checked = toolbarVisible('pwFill');
  if (els.cardFillToggle) els.cardFillToggle.checked = toolbarVisible('cardFill');
  if (typeof updatePwFillButton === 'function') updatePwFillButton();
  if (typeof reflowOmnibar === 'function') reflowOmnibar(); // widths changed → recompute overflow
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
  window.removeEventListener('blur', closeToolbarMenu);
}
function onToolbarMenuOutside(e) { if (toolbarMenuEl && !toolbarMenuEl.contains(e.target)) closeToolbarMenu(); }
function onToolbarMenuEsc(e) { if (e.key === 'Escape') closeToolbarMenu(); }
// A checkable row for the menu.
function toolbarMenuRow(menu, label, on, onClick) {
  const row = document.createElement('button'); row.className = 'toolbar-menu-row';
  const check = document.createElement('span'); check.className = 'tm-check'; check.textContent = on ? '✓' : '';
  const lbl = document.createElement('span'); lbl.textContent = label;
  row.appendChild(check); row.appendChild(lbl);
  row.addEventListener('click', onClick);
  menu.appendChild(row);
}
function showToolbarMenu(x, y) {
  closeToolbarMenu();
  const menu = document.createElement('div'); menu.className = 'toolbar-menu';
  toolbarMenuEl = menu; // track it so it can actually be dismissed/replaced
  const head = document.createElement('div'); head.className = 'toolbar-menu-head'; head.textContent = 'Show on toolbar';
  menu.appendChild(head);
  for (const b of TOOLBAR_BUTTONS) {
    toolbarMenuRow(menu, b.label, toolbarVisible(b.key), () => { setToolbarVisible(b.key, !toolbarVisible(b.key)); renderToolbarPrefs(); closeToolbarMenu(); });
  }
  // The bookmarks bar isn't a toolbar button, but users look for it here too.
  const sep = document.createElement('div'); sep.className = 'toolbar-menu-sep'; menu.appendChild(sep);
  toolbarMenuRow(menu, 'Saved pages bar', !!settings.bookmarksBar, () => { settings.bookmarksBar = !settings.bookmarksBar; applyBookmarksBar(); scheduleSave(); closeToolbarMenu(); });
  toolbarMenuRow(menu, 'Favorites bar', !!settings.favoritesBar, () => { settings.favoritesBar = !settings.favoritesBar; applyFavoritesBar(); scheduleSave(); closeToolbarMenu(); });
  document.body.appendChild(menu);
  menu.style.left = Math.min(x, window.innerWidth - menu.offsetWidth - 8) + 'px';
  menu.style.top = Math.min(y, window.innerHeight - menu.offsetHeight - 8) + 'px';
  setTimeout(() => {
    document.addEventListener('mousedown', onToolbarMenuOutside, true);
    document.addEventListener('keydown', onToolbarMenuEsc, true);
    window.addEventListener('blur', closeToolbarMenu); // clicks into the page iframe/webview blur the window
  }, 0);
}

// --- Omnibar overflow -------------------------------------------------------
// When the window is narrow (not maximized, or with the sidebar open), the
// right-hand action cluster can't all fit. Instead of clipping buttons off the
// right edge — where they're invisible AND unreachable (no scroll) — we move the
// lowest-priority ones into a ⋯ popover so every action stays reachable.
//
// Order below = order we collapse: first entries leave the bar first. zoom is
// omitted (its 3-button cluster doesn't belong in a vertical menu) and stays
// inline along with Settings and the ⋯ button itself.
const OMNI_OVERFLOW_ORDER = [
  'pip-btn', 'reader-btn', 'read-aloud-btn', 'translate-btn', 'send-phone-btn',
  'share-fedica-btn', 'email-page-btn', 'snip-btn', 'ask-page-btn', 'save-btn',
  'sched-btn', 'agents-btn', 'map-btn', 'favorite-btn', 'bookmark-btn',
  'history-btn', 'print-btn',
];
let omniOriginalOrder = null; // captured once, so we can restore inline order

// Stamp a text label onto each emoji-only button so the tray can show it via
// CSS ::after. The .text buttons (Map, Library, …) already have a visible label.
function initOmniOverflow() {
  const actions = document.getElementById('omni-actions');
  if (!actions) return;
  omniOriginalOrder = [...actions.children];
  for (const b of (typeof TOOLBAR_BUTTONS !== 'undefined' ? TOOLBAR_BUTTONS : [])) {
    const el = document.getElementById(b.id);
    if (!el || el.classList.contains('text')) continue; // .text already labelled
    el.dataset.trayLabel = b.label.replace(/\s*\(.*\)\s*$/, ''); // drop trailing "(emoji)"
  }
  // Clicking a tray action fires its normal handler, then closes the tray.
  const tray = document.getElementById('omni-overflow-tray');
  if (tray) tray.addEventListener('click', (e) => { if (e.target.closest('.omni-btn')) closeOmniTray(); });
  const more = document.getElementById('omni-overflow-btn');
  if (more) more.addEventListener('click', toggleOmniTray);
  const bar = document.getElementById('omnibar');
  if (bar && typeof ResizeObserver !== 'undefined') {
    let raf = 0;
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(reflowOmnibar); });
    ro.observe(bar);
  }
  reflowOmnibar();
}

function reflowOmnibar() {
  const actions = document.getElementById('omni-actions');
  const bar = document.getElementById('omnibar');
  const more = document.getElementById('omni-overflow-btn');
  const tray = document.getElementById('omni-overflow-tray');
  if (!actions || !bar || !more || !tray || !omniOriginalOrder) return;
  closeOmniTray(); // buttons may move; don't leave a stale popover open

  // 1. Pull everything back inline, in the original DOM order.
  for (const node of omniOriginalOrder) actions.appendChild(node);
  more.hidden = true;

  // 2. If it all fits now, we're done.
  const fits = () => bar.scrollWidth <= bar.clientWidth + 1;
  if (fits()) return;

  // 3. Move buttons into the tray, lowest-priority first, until it fits.
  more.hidden = false;
  for (const id of OMNI_OVERFLOW_ORDER) {
    if (fits()) break;
    const el = document.getElementById(id);
    if (!el || el.offsetWidth === 0) continue; // skip hidden / user-disabled buttons
    tray.appendChild(el);
  }
}

let omniTrayOpen = false;
function openOmniTray() {
  const more = document.getElementById('omni-overflow-btn');
  const tray = document.getElementById('omni-overflow-tray');
  if (!more || !tray || !tray.children.length) return;
  tray.classList.add('open');
  const r = more.getBoundingClientRect();
  const left = Math.max(6, Math.min(r.right - tray.offsetWidth, window.innerWidth - tray.offsetWidth - 8));
  tray.style.left = left + 'px';
  tray.style.top = (r.bottom + 4) + 'px';
  more.setAttribute('aria-expanded', 'true');
  omniTrayOpen = true;
  setTimeout(() => {
    document.addEventListener('mousedown', onOmniTrayOutside, true);
    document.addEventListener('keydown', onOmniTrayEsc, true);
    window.addEventListener('blur', closeOmniTray);
  }, 0);
}
function closeOmniTray() {
  const tray = document.getElementById('omni-overflow-tray');
  const more = document.getElementById('omni-overflow-btn');
  if (tray) tray.classList.remove('open');
  if (more) more.setAttribute('aria-expanded', 'false');
  omniTrayOpen = false;
  document.removeEventListener('mousedown', onOmniTrayOutside, true);
  document.removeEventListener('keydown', onOmniTrayEsc, true);
  window.removeEventListener('blur', closeOmniTray);
}
function toggleOmniTray() { omniTrayOpen ? closeOmniTray() : openOmniTray(); }
function onOmniTrayOutside(e) {
  const tray = document.getElementById('omni-overflow-tray');
  const more = document.getElementById('omni-overflow-btn');
  if (tray && !tray.contains(e.target) && e.target !== more) closeOmniTray();
}
function onOmniTrayEsc(e) { if (e.key === 'Escape') closeOmniTray(); }

function openSettings() {
  applySettingsToUI();
  renderToolbarPrefs();
  renderSyncFolder();
  renderAccountBox();
  refreshPrivacyUI();
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
    // Private tabs are ephemeral — never persist them (or point activeId at one).
    const persistTabs = tabs.filter((t) => !t.private);
    const persistActiveId = persistTabs.some((t) => t.id === activeId)
      ? activeId
      : (persistTabs[0] && persistTabs[0].id) || null;
    window.chervil.saveState({ tabs: persistTabs, activeId: persistActiveId, tabGroups, settings, library, bookmarks, bookmarkFolders, bookmarkTombstones, favorites, favoriteFolders, favoriteTombstones, collections, deletionTombstones, siteHistory, downloads, agentAudit, spaces, activeSpaceId, savedSpaces, activeSavedSpaceId, living, schedules, watchers, agents, activeAgentId, pipelines, pageStores })
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
  if (Array.isArray(m.bookmarkFolders)) bookmarkFolders = m.bookmarkFolders.filter((f) => typeof f === 'string');
  if (Array.isArray(m.bookmarkTombstones)) bookmarkTombstones = m.bookmarkTombstones;
  if (m.deletionTombstones && typeof m.deletionTombstones === 'object') deletionTombstones = { ...deletionTombstones, ...m.deletionTombstones };
  if (Array.isArray(m.favorites)) favorites = m.favorites;
  if (Array.isArray(m.favoriteFolders)) favoriteFolders = m.favoriteFolders.filter((f) => typeof f === 'string');
  if (Array.isArray(m.favoriteTombstones)) favoriteTombstones = m.favoriteTombstones;
  if (Array.isArray(m.collections)) collections = m.collections.filter((c) => c && c.id && Array.isArray(c.items));
  if (Array.isArray(m.siteHistory)) siteHistory = m.siteHistory;
  if (m.library && Array.isArray(m.library.history)) {
    library = { history: m.library.history, trash: Array.isArray(m.library.trash) ? m.library.trash : [] };
  }
  if (Array.isArray(m.spaces) && m.spaces.length) {
    spaces = m.spaces;
    if (!spaces.find((s) => s.id === activeSpaceId)) activeSpaceId = spaces[0].id;
  }
  if (Array.isArray(m.savedSpaces)) savedSpaces = m.savedSpaces.filter((s) => s && s.id);
  if (Array.isArray(m.agents)) agents = m.agents;
  if (Array.isArray(m.schedules)) schedules = m.schedules;
  if (Array.isArray(m.watchers)) watchers = m.watchers.filter((w) => w && w.url).map((w) => ({ ...w, running: false }));
  if (r.mtimeMs) lastStateMtimeMs = r.mtimeMs;               // we just absorbed it — don't also prompt to reload
  if (migrateSiteBookmarksToFavorites()) scheduleSave();     // relocate any sites that arrived from another machine
  ensureSavedSpaces();                                       // file any saved pages that arrived from another machine
  updateBookmarkStar();
  applyPaneSizes();                                          // a pane width may have been resized on another machine
  if (els.libraryDrawer.classList.contains('open')) renderDrawer();
  renderBookmarksBar();
  renderFavoritesBar();
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
    ...(t.groupId ? { groupId: t.groupId } : {}), // tab-group membership survives restarts
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
  if (restored && Array.isArray(restored.tabGroups)) {
    tabGroups = restored.tabGroups.filter((g) => g && g.id);
    pruneEmptyGroups(); // drop groups whose tabs didn't survive (e.g. private-only)
    // Never restore with the active tab trapped in a collapsed group.
    const at = tabs.find((t) => t.id === activeId);
    const ag = at && at.groupId ? tabGroups.find((g) => g.id === at.groupId) : null;
    if (ag) ag.collapsed = false;
  }

  if (restored && restored.settings) {
    settings = { ...settings, ...restored.settings };
    // Legacy: the 🔑/💳 fill buttons used to carry their own showPwFill/showCardFill
    // flags. They're now regular Toolbar Options — fold any old "hidden" choice into
    // settings.toolbar so nobody's preference silently flips back on after upgrade.
    if (settings.showPwFill === false || settings.showCardFill === false) {
      if (!settings.toolbar) settings.toolbar = {};
      if (settings.showPwFill === false && settings.toolbar.pwFill === undefined) settings.toolbar.pwFill = false;
      if (settings.showCardFill === false && settings.toolbar.cardFill === undefined) settings.toolbar.cardFill = false;
    }
    delete settings.showPwFill;
    delete settings.showCardFill;
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
  if (restored && Array.isArray(restored.bookmarkFolders)) bookmarkFolders = restored.bookmarkFolders.filter((f) => typeof f === 'string');
  if (restored && Array.isArray(restored.bookmarkTombstones)) bookmarkTombstones = restored.bookmarkTombstones;
  if (restored && Array.isArray(restored.favorites)) favorites = restored.favorites;
  if (restored && Array.isArray(restored.favoriteFolders)) favoriteFolders = restored.favoriteFolders.filter((f) => typeof f === 'string');
  if (restored && Array.isArray(restored.favoriteTombstones)) favoriteTombstones = restored.favoriteTombstones;
  if (restored && Array.isArray(restored.collections)) collections = restored.collections.filter((c) => c && c.id && Array.isArray(c.items));
  if (restored && restored.deletionTombstones && typeof restored.deletionTombstones === 'object') {
    deletionTombstones = { ...deletionTombstones, ...restored.deletionTombstones };
  }
  if (restored && Array.isArray(restored.siteHistory)) siteHistory = restored.siteHistory;
  if (restored && Array.isArray(restored.downloads)) downloads = restored.downloads;
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

  // Saved-Pages Spaces: restore fresh, then guarantee a default + file every saved page.
  if (restored && Array.isArray(restored.savedSpaces)) savedSpaces = restored.savedSpaces.filter((s) => s && s.id);
  if (restored && restored.activeSavedSpaceId) activeSavedSpaceId = restored.activeSavedSpaceId;
  ensureSavedSpaces();

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
  if (restored && Array.isArray(restored.watchers)) {
    watchers = restored.watchers
      .filter((w) => w && w.url && w.intervalMs)
      .map((w) => ({ ...w, running: false })); // keep lastRun so cadence resumes without a launch burst
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
  applyTabsBarHidden();
  applyPaneSizes();   // restore any user-set sidebar / tab-rail widths
  initPaneResize();   // wire the drag-to-resize seams (once)
  applyToolbar(); // honor the user's chosen top-bar buttons
  if (migrateSiteBookmarksToFavorites()) scheduleSave(); // websites belong in Favorites now, not Saved Pages
  applyBookmarksBar(); // restore the bookmarks bar (if enabled) + its contents
  applyFavoritesBar(); // restore the favorites bar (if enabled) + its contents
  if (window.chervil.setAdblock) window.chervil.setAdblock(settings.adblock); // sync ad-block to main
  if (window.chervil.setSpellcheck) window.chervil.setSpellcheck(settings.spellcheck !== false); // sync spell-check to main
  if (window.chervil.setMenuBarVisible) window.chervil.setMenuBarVisible(!!settings.showMenuBar); // this window's menu bar
  setChatMode(settings.chatMode); // reflect the persisted "Just a chatbot" toggle
  renderTabs();
  renderConversation();
  renderCurrentPage();
  prewarmPinnedTabs(); // warm restored pinned tabs in the background so morning clicks are instant
  refreshComposer();
  els.prompt.focus();

  // Resume "Hey Sprig" listening if it was on last session.
  if (settings.wakeEnabled) startWake();

  // First-run welcome: a fresh profile (no saved state) gets the switcher
  // onboarding once. Existing profiles are marked done silently so an upgrade
  // never nags. Re-run any time from Settings → Browser.
  if (!settings.onboarded) {
    settings.onboarded = true;
    scheduleSave();
    if (!restored) setTimeout(showOnboarding, 400);
  }

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

// ---- EPUB (eBook) export ----
// The renderer owns sanitization because it has a real DOM: page/lesson HTML is
// parsed, scripts/applets stripped, inline data: images pulled out as bundled
// files, and the result serialized to well-formed XHTML (XMLSerializer). The
// main process (lib/epub.js) then just assembles the .epub container.
function epubEsc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
// resources === null → keep data: images inline (the print-PDF path); an array →
// extract them into it as bundled files (the EPUB path).
function epubXhtmlFromHtml(html, resources, seq) {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  for (const n of doc.querySelectorAll('script, iframe, webview, object, embed, link, noscript, style')) n.remove();
  for (const el of doc.body.querySelectorAll('*')) {
    for (const a of [...el.attributes]) {
      if (/^on/i.test(a.name)) el.removeAttribute(a.name);
      else if (a.name === 'href' && /^javascript:/i.test(a.value || '')) el.removeAttribute('href');
    }
  }
  for (const img of doc.body.querySelectorAll('img')) {
    if (!img.getAttribute('alt')) img.setAttribute('alt', '');
    if (!resources) continue; // inline mode — leave data: URLs in place
    const m = /^data:(image\/[a-z0-9+.-]+);base64,(.+)$/i.exec(img.getAttribute('src') || '');
    if (!m) continue;
    const ext = /png/i.test(m[1]) ? 'png' : /gif/i.test(m[1]) ? 'gif' : /svg/i.test(m[1]) ? 'svg' : 'jpg';
    const href = `images/img${seq.n++}.${ext}`;
    resources.push({ href, base64: m[2], mediaType: m[1].toLowerCase() });
    img.setAttribute('src', href);
  }
  const ser = new XMLSerializer();
  return [...doc.body.childNodes].map((n) => ser.serializeToString(n)).join('');
}

// A composed page → chapters split on its h1/h2 headings (single chapter if none).
// opts.inline keeps data: images in the chapter bodies (print-PDF) instead of
// extracting them as bundled files (EPUB).
function epubBookFromPage(entry, opts = {}) {
  const resources = opts.inline ? null : [];
  const seq = { n: 1 };
  const bodyX = epubXhtmlFromHtml(entry.html, resources, seq);
  const doc = new DOMParser().parseFromString(`<body>${bodyX}</body>`, 'text/html');
  const kids = [...doc.body.childNodes];
  const heads = kids.filter((n) => n.nodeType === 1 && /^H[12]$/.test(n.tagName));
  const chapters = [];
  const ser = new XMLSerializer();
  if (heads.length >= 2) {
    let cur = { title: entry.title || 'Introduction', parts: [] };
    for (const n of kids) {
      if (n.nodeType === 1 && /^H[12]$/.test(n.tagName)) {
        if (cur.parts.length) chapters.push(cur);
        cur = { title: (n.textContent || '').trim() || 'Chapter', parts: [] };
      }
      cur.parts.push(ser.serializeToString(n));
    }
    if (cur.parts.length) chapters.push(cur);
  } else {
    chapters.push({ title: entry.title || 'Chervil page', parts: [bodyX] });
  }
  return {
    title: entry.title || entry.query || 'Chervil page',
    author: 'Composed with Chervil',
    language: 'en',
    description: entry.query || '',
    chapters: chapters.map((c) => ({ title: c.title, body: c.parts.join('') })),
    resources: resources || [],
  };
}

// A lesson artifact → title page + one chapter per module + sources.
function epubBookFromLesson(lesson, entry, opts = {}) {
  const resources = opts.inline ? null : [];
  const seq = { n: 1 };
  const chapters = [];
  const objectives = (lesson.objectives || []).map((o) => `<li>${epubEsc(o)}</li>`).join('');
  chapters.push({
    title: lesson.title || 'Lesson',
    body: `<div class="titlepage">
<h1>${epubEsc(lesson.title || 'Lesson')}</h1>
${lesson.subtitle ? `<p class="subtitle">${epubEsc(lesson.subtitle)}</p>` : ''}
${lesson.summary ? `<p>${epubEsc(lesson.summary)}</p>` : ''}
${objectives ? `<div class="objectives"><strong>You will learn to:</strong><ul>${objectives}</ul></div>` : ''}
<p class="meta">${epubEsc([lesson.level, lesson.estMinutes ? `~${lesson.estMinutes} min` : ''].filter(Boolean).join(' · '))}</p>
<p class="chervil-colophon">Built with Chervil${lesson.authorModel ? ` · ${epubEsc(lesson.authorModel)}` : ''}</p>
</div>`,
  });
  for (const mod of lesson.modules || []) {
    const parts = [`<h1>${epubEsc(mod.title || 'Module')}</h1>`];
    if (mod.summary) parts.push(`<p><em>${epubEsc(mod.summary)}</em></p>`);
    for (const card of mod.cards || []) {
      if (card.kind === 'concept') {
        if (card.title) parts.push(`<h2>${epubEsc(card.title)}</h2>`);
        parts.push(epubXhtmlFromHtml(card.html, resources, seq));
      } else if (card.kind === 'media' && card.videoId) {
        parts.push(`<p class="media-link">▶ Watch: <a href="https://www.youtube.com/watch?v=${epubEsc(card.videoId)}">${epubEsc(card.title || card.caption || 'video')}</a>${card.caption && card.caption !== card.title ? ` — ${epubEsc(card.caption)}` : ''}</p>`);
      } else if (card.kind === 'applet') {
        parts.push(`<div class="applet-note"><strong>Interactive exercise${card.title ? `: ${epubEsc(card.title)}` : ''}.</strong> ${epubEsc(card.prompt || '')} <em>(Open this lesson in Chervil to try it live.)</em></div>`);
      } else if (card.kind === 'check') {
        const opts = (card.options || []).map((o, i) => `<li>${epubEsc(o)}</li>`).join('');
        const answer = (card.options || [])[card.answerIndex];
        parts.push(`<h3>Check yourself${card.title ? `: ${epubEsc(card.title)}` : ''}</h3><p>${epubEsc(card.question || '')}</p><ol>${opts}</ol>`
          + (answer != null ? `<p class="check-answer">Answer: ${epubEsc(answer)}.${card.explanation ? ' ' + epubEsc(card.explanation) : ''}</p>` : ''));
      } else if (card.kind === 'flashcard') {
        parts.push(`<dl class="flashcard"><dt>${epubEsc(card.front || '')}</dt><dd>${epubEsc(card.back || '')}</dd></dl>`);
      }
    }
    chapters.push({ title: mod.title || 'Module', body: parts.join('\n') });
  }
  const sources = (lesson.sources || []).filter((s) => s && s.url);
  if (sources.length) {
    chapters.push({
      title: 'Sources',
      body: `<h1>Sources</h1><ul>${sources.map((s) => `<li><a href="${epubEsc(s.url)}">${epubEsc(s.title || s.url)}</a></li>`).join('')}</ul>`,
    });
  }
  return {
    title: lesson.title || (entry && entry.title) || 'Chervil lesson',
    author: 'Built with Chervil',
    language: 'en',
    description: lesson.summary || lesson.topic || '',
    chapters,
    resources: resources || [],
  };
}

async function exportCurrentEpub() {
  const tab = activeTab();
  const entry = currentEntry(tab);
  if (!entry || entry.kind !== 'page' || (!entry.html && !(entry.artifact || entry.lesson))) {
    toast('Open a composed page or lesson first.');
    return;
  }
  if (!window.chervil.exportEpub) { toast('EPUB export isn’t available in this build.'); return; }
  toast('Exporting eBook…');
  try {
    const lesson = entry.artifact || entry.lesson;
    const book = lesson ? epubBookFromLesson(lesson, entry) : epubBookFromPage(entry);
    const res = await window.chervil.exportEpub({ book, suggestedName: entry.title || book.title });
    if (res && res.ok) addMessage(tab, 'bot', `Exported eBook to ${res.path} — EPUB works on Kindle (send or upload to KDP), Apple Books, Kobo, and most readers.`);
    else if (res && !res.canceled) addMessage(tab, 'bot', `Couldn’t export the eBook: ${res.error || 'unknown error'}`, 'error');
  } catch (e) {
    addMessage(tab, 'bot', `Couldn’t export the eBook: ${errText(e, 'unknown error')}`, 'error');
  }
}

// ---- Print-ready PDF (book) ----
// Shares the EPUB pipeline (sanitized chapters via epubBookFrom*), restyled with
// print typography and rendered at a real trim size with page numbers. Bleed
// follows KDP's rule: +0.125" width, +0.25" height on the trim.
const PRINT_TRIM_SIZES = [
  { key: '6x9', label: '6 × 9 in — trade paperback (KDP standard)', w: 6, h: 9 },
  { key: '5x8', label: '5 × 8 in — compact paperback', w: 5, h: 8 },
  { key: 'a5', label: 'A5 (5.83 × 8.27 in)', w: 5.83, h: 8.27 },
  { key: 'letter', label: 'US Letter (8.5 × 11 in)', w: 8.5, h: 11 },
];

// High-quality local 2× resample of a data: image (print prep for small images).
function upscaleDataUrl(dataUrl, maxDim = 4096) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let f = 2;
      if (Math.max(img.naturalWidth, img.naturalHeight) * f > maxDim) f = maxDim / Math.max(img.naturalWidth, img.naturalHeight);
      if (f <= 1.05) return resolve(dataUrl);
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * f);
      c.height = Math.round(img.naturalHeight * f);
      const cx = c.getContext('2d');
      cx.imageSmoothingEnabled = true;
      cx.imageSmoothingQuality = 'high';
      cx.drawImage(img, 0, 0, c.width, c.height);
      resolve(/^data:image\/png/i.test(dataUrl) ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// Upscale small inline images in an HTML fragment (print target ≈ 300 DPI, so a
// sub-1200px image on a 4-inch column prints soft — double it).
async function upscaleInlineImagesHtml(html) {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  for (const img of doc.body.querySelectorAll('img[src^="data:image/"]')) {
    const src = img.getAttribute('src');
    const probe = new Image();
    await new Promise((r) => { probe.onload = r; probe.onerror = r; probe.src = src; });
    if (probe.naturalWidth && probe.naturalWidth < 1200) {
      img.setAttribute('src', await upscaleDataUrl(src));
    }
  }
  const ser = new XMLSerializer();
  return [...doc.body.childNodes].map((n) => ser.serializeToString(n)).join('');
}

function printBookHtml(book) {
  const esc = epubEsc;
  const chapters = book.chapters.map((c) => `<section class="chapter">\n${c.body}\n</section>`).join('\n');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(book.title)}</title><style>
  body { font-family: Georgia, "Times New Roman", serif; font-size: 11pt; line-height: 1.5; color: #000; margin: 0; }
  h1, h2, h3 { font-family: "Helvetica Neue", Arial, sans-serif; line-height: 1.25; break-after: avoid; }
  h1 { font-size: 1.55em; } h2 { font-size: 1.25em; } h3 { font-size: 1.05em; }
  p { orphans: 3; widows: 3; }
  img { max-width: 100%; height: auto; break-inside: avoid; }
  figure { margin: 1em 0; break-inside: avoid; } figcaption { font-size: .85em; color: #333; }
  blockquote { margin: 1em 1.5em; padding-left: .8em; border-left: 2.5pt solid #999; }
  code, pre { font-family: Consolas, Menlo, monospace; font-size: .85em; }
  pre { white-space: pre-wrap; border: .5pt solid #bbb; padding: .7em; break-inside: avoid; }
  table { border-collapse: collapse; break-inside: avoid; } td, th { border: .5pt solid #666; padding: .25em .5em; }
  a { color: #000; text-decoration: none; }
  .chapter { break-before: page; }
  .print-titlepage { break-after: page; text-align: center; margin-top: 34%; }
  .print-titlepage h1 { font-size: 2em; }
  .print-titlepage .author { margin-top: 2.5em; font-variant: small-caps; letter-spacing: .08em; }
  .titlepage { text-align: center; margin-top: 20%; } .titlepage .subtitle { font-style: italic; }
  .titlepage .objectives { text-align: left; display: inline-block; margin-top: 1.5em; }
  .check-answer { font-style: italic; } .applet-note { border: .75pt dashed #666; padding: .7em; font-size: .9em; }
  .flashcard dt { font-weight: bold; margin-top: .6em; }
  </style></head><body>
  <section class="print-titlepage"><h1>${esc(book.title)}</h1>${book.description ? `<p><em>${esc(book.description)}</em></p>` : ''}<p class="author">${esc(book.author || '')}</p></section>
  ${chapters}
  </body></html>`;
}

async function exportCurrentPrintPdf() {
  const tab = activeTab();
  const entry = currentEntry(tab);
  if (!entry || entry.kind !== 'page' || (!entry.html && !(entry.artifact || entry.lesson))) {
    toast('Open a composed page or lesson first.');
    return;
  }
  if (!window.chervil.exportPrintPdf) { toast('Print-ready export isn’t available in this build.'); return; }
  let bleed = false;
  const actions = PRINT_TRIM_SIZES.map((s, i) => ({
    label: s.label,
    primary: i === 0,
    onClick: async () => {
      toast('Preparing print-ready PDF…');
      try {
        const lesson = entry.artifact || entry.lesson;
        const book = lesson ? epubBookFromLesson(lesson, entry, { inline: true }) : epubBookFromPage(entry, { inline: true });
        // Print wants dense pixels — double any small inline images first.
        for (const c of book.chapters) c.body = await upscaleInlineImagesHtml(c.body);
        const res = await window.chervil.exportPrintPdf({
          html: printBookHtml(book),
          suggestedName: (entry.title || book.title) + ' (print)',
          widthIn: bleed ? s.w + 0.125 : s.w,
          heightIn: bleed ? s.h + 0.25 : s.h,
          pageNumbers: true,
        });
        if (res && res.ok) addMessage(tab, 'bot', `Exported print-ready PDF to ${res.path} — ${s.label.split(' — ')[0]}${bleed ? ' + bleed' : ''}, page numbers included. Upload straight to KDP or a print shop.`);
        else if (res && !res.canceled) addMessage(tab, 'bot', `Couldn’t export the print PDF: ${res.error || 'unknown error'}`, 'error');
      } catch (e) {
        addMessage(tab, 'bot', `Couldn’t export the print PDF: ${errText(e, 'unknown error')}`, 'error');
      }
    },
  }));
  showActionSheet(
    'Print-ready PDF',
    'Pick a trim size. Book typography, chapters on fresh pages, page numbers — sized for KDP or any print shop.',
    actions,
    null,
    { checkbox: { label: 'Add bleed (KDP: +0.125" width, +0.25" height) — for images that run to the page edge.', checked: false, onChange: (v) => { bleed = v; } } }
  );
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
  else if (v === 'epub') exportCurrentEpub();
  else if (v === 'print-book') exportCurrentPrintPdf();
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
  if (blogTargets().some(blogTargetReady)) {
    opts.push({ label: '📝 To WordPress / Substack / Medium…', onClick: () => openBlogPublishMenu() });
  }
  // Already published as a page → offer cloud auto-refresh settings.
  if (entry.publishedId) {
    opts.push({ label: entry.cloudLiveMs ? '☁ Cloud refresh: on — change…' : '☁ Keep it live in the cloud…', onClick: () => chooseCloudLive(entry) });
  }
  showActionSheet('Publish to web', 'How should this go out?', opts);
}

// --- Publish a composed page to an external blog (WordPress / Substack / Medium) ---
// Boundary: Sprig prepares the post (WordPress draft via API; Substack/Medium editor
// pre-filled), the user always reviews and clicks Publish. Nothing is auto-published.

function blogTargetReady(t) {
  if (!t) return false;
  if (t.platform === 'wordpress') return !!(t.siteUrl && t.username);
  if (t.platform === 'substack') return !!t.siteUrl;
  if (t.platform === 'medium') return true; // imports by URL — no per-site config needed
  return false;
}

// Clean article HTML from a composed page: full document → body prose, minus
// scripts/styles, the inline data-URL hero (blogs reject data URIs), and the
// Chervil "Open in Chervil" CTA/source block. Falls back to plain text.
function blogContentHtml(entry) {
  const raw = (entry && entry.html) || '';
  try {
    const doc = new DOMParser().parseFromString(raw, 'text/html');
    const body = doc.body;
    if (!body) return stripText(raw);
    body.querySelectorAll('script, style, noscript, template, iframe, object, embed').forEach((n) => n.remove());
    body.querySelectorAll('.chervil-hero').forEach((n) => n.remove()); // inline data-URL hero — blogs reject data URIs
    body.querySelectorAll('#chervil-edit-btn, .chervil-edit-btn, #chervil-source, #chervil-report').forEach((n) => n.remove());
    // Strip inline event handlers + javascript: URLs. This HTML is posted to your blog
    // AND injected into third-party editors (Substack/Medium) via innerHTML, where
    // on* handlers fire — and composed pages can carry markup pulled from arbitrary sites.
    body.querySelectorAll('*').forEach((el) => {
      for (const a of Array.from(el.attributes)) {
        const n = a.name.toLowerCase();
        if (n.startsWith('on')) el.removeAttribute(a.name);
        else if ((n === 'href' || n === 'src' || n === 'xlink:href') && /^\s*javascript:/i.test(a.value || '')) el.removeAttribute(a.name);
      }
    });
    const html = body.innerHTML.trim();
    return html || stripText(raw);
  } catch { return stripText(raw); }
}

function blogTargetLabel(t) {
  const icon = t.platform === 'wordpress' ? '📝' : t.platform === 'substack' ? '📬' : '📖';
  return `${icon} ${t.name || t.siteUrl || t.platform}`;
}

function openBlogPublishMenu() {
  const tab = activeTab();
  const entry = currentEntry(tab);
  if (!entry || entry.kind !== 'page' || !entry.html) { toast('Open a page first, then publish it.'); return; }
  const targets = blogTargets().filter(blogTargetReady);
  if (!targets.length) { toast('Add a blog in Settings → Blogs first.'); return; }
  showActionSheet('Publish to a blog',
    'WordPress posts a real draft via its API; Substack/Medium open pre-filled. You always review and hit Publish.',
    targets.map((t) => ({ label: blogTargetLabel(t), onClick: () => publishToBlog(t, entry, tab) })));
}

function publishToBlog(t, entry, tab) {
  if (t.platform === 'wordpress') return publishToWordPress(t, entry, tab);
  if (t.platform === 'substack') return publishToSubstack(t, entry, tab);
  if (t.platform === 'medium') return publishToMedium(t, entry, tab);
}

// WordPress — real draft via the REST API (Basic auth with the vault app password).
async function publishToWordPress(t, entry, tab) {
  if (!t.siteUrl || !t.username) { toast('Add your WordPress site URL and username in Settings → Blogs.'); return; }
  if (!window.chervil.wpPublish) { toast('WordPress publishing isn’t available in this build.'); return; }
  if (!(await ensureVaultUnlocked())) return;
  let appPassword = '';
  try {
    const res = await window.chervil.creds.forOrigin(t.siteUrl);
    const items = (res && res.ok && res.items) || [];
    // Strict username match only — never fall back to another credential saved for
    // this domain (e.g. a normal wp-login password), which would send the wrong secret.
    const match = items.find((it) => it.username === t.username);
    appPassword = (match && match.password) || '';
  } catch { /* ignore */ }
  if (!appPassword) { toast('Set your WordPress app password in Settings → Blogs (🔑 App password).'); return; }
  const content = blogContentHtml(entry);
  toast('Creating a WordPress draft…');
  let r;
  try { r = await window.chervil.wpPublish({ siteUrl: t.siteUrl, username: t.username, appPassword, title: entry.title || 'Chervil page', content }); }
  catch (e) { r = { ok: false, error: errText(e, 'WordPress publish failed') }; }
  if (!r || !r.ok) {
    toast((r && r.error) || 'WordPress publish failed.');
    addMessage(tab, 'bot', `Couldn’t publish to WordPress: ${(r && r.error) || 'unknown error'}`, 'error');
    return;
  }
  addMessage(tab, 'bot', `Created a draft on ${t.name || 'WordPress'} — opening the editor (log in to WordPress if it prompts you). Review it there and hit Publish; Chervil never publishes for you.`);
  if (r.editUrl) openShareComposer(r.editUrl, { width: 1100, height: 820 });
  toast('Draft created in WordPress — review and Publish (log in if prompted).');
}

// Medium — killed its posting API but imports a story by URL (adds a canonical
// link). Ensure the page is public (publish to getchervil.com), then open Medium's
// importer pre-filled with that URL.
async function publishToMedium(t, entry, tab) {
  let url = entry.publishedUrl;
  if (!url) {
    if (!settings.publishToken || !window.chervil.publishPage) {
      addMessage(tab, 'bot', 'Medium imports by URL, so the page must be published to getchervil.com first. Add a publish token in Settings → Publishing, then try again.', 'error');
      return;
    }
    toast('Publishing your page so Medium can import it…');
    let res;
    try {
      res = await window.chervil.publishPage({
        html: withChervilEditButton(entry.html, chervilPageDoc(entry, tab)),
        title: entry.title || 'Chervil page', kind: 'page', sourceId: entry.id,
        token: settings.publishToken, baseUrl: settings.publishBase || 'https://getchervil.com',
      });
    } catch (e) { res = { ok: false, error: errText(e, 'Publish failed') }; }
    if (res && res.ok && res.url) { entry.publishedUrl = res.url; if (res.id) entry.publishedId = res.id; scheduleSave(); url = res.url; }
    else { addMessage(tab, 'bot', `Couldn’t publish for Medium import: ${(res && res.error) || 'unknown error'}`, 'error'); return; }
  }
  const importUrl = 'https://medium.com/p/import?url=' + encodeURIComponent(url);
  openShareComposer(importUrl, { width: 900, height: 780 });
  addMessage(tab, 'bot', 'Opened Medium’s importer with your page URL. Click Import, then review and Publish on Medium — it adds a canonical link back to your page.');
}

// Substack — no API; open the publication's new-post editor with the content on the
// clipboard (rich HTML + plain text) for a single paste.
async function publishToSubstack(t, entry, tab) {
  if (!t.siteUrl) { toast('Add your Substack publication URL in Settings → Blogs.'); return; }
  const contentHtml = blogContentHtml(entry);
  let copied = false;
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([contentHtml], { type: 'text/html' }),
        'text/plain': new Blob([stripText(entry.html)], { type: 'text/plain' }),
      })]);
      copied = true;
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(stripText(entry.html)); copied = true;
    }
  } catch { copied = false; }
  const base = String(t.siteUrl).replace(/\/+$/, '');
  const editorUrl = base + '/publish/post';
  const size = { width: 1000, height: 840 };
  if (settings.blogAgent) fillBlogEditor(editorUrl, entry, t, size); // opt-in Sprig fill (in a tab)
  else openShareComposer(editorUrl, size);
  addMessage(tab, 'bot', copied
    ? 'Opened your Substack editor and copied the post — paste it in (Ctrl+V), add a title, review, and Publish.'
    : 'Opened your Substack editor — add your content and Publish when ready.');
}

// Opt-in agent auto-fill (settings.blogAgent). Best-effort: set the editor's title +
// body then dispatch input events. Substack/Medium editors are contenteditable, so
// we set textContent/innerHTML, NOT .value. It NEVER clicks Publish — RFC 0006
// boundary, mirroring passwordFillScript. Gated by an explicit confirm + audited.
function blogEditorFillScript(dataJson) {
  return `(() => {
    try {
      const d = ${dataJson};
      const fire = (el) => ['input','change','keyup'].forEach((t) => el.dispatchEvent(new Event(t, { bubbles: true })));
      const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 40 && r.height > 12; };
      let titleEl = document.querySelector('textarea[placeholder*="title" i], input[placeholder*="title" i], [contenteditable][data-placeholder*="title" i], [contenteditable][aria-label*="title" i], h1[contenteditable], h1 [contenteditable]');
      let bodyEl = null, best = 0;
      document.querySelectorAll('[contenteditable="true"], [contenteditable=""], textarea').forEach((el) => {
        if (el === titleEl || !vis(el)) return;
        const r = el.getBoundingClientRect(); const area = r.width * r.height;
        if (area > best) { best = area; bodyEl = el; }
      });
      let filledTitle = false, filledBody = false;
      if (titleEl && d.title) {
        if (titleEl.isContentEditable) titleEl.textContent = d.title; else titleEl.value = d.title;
        fire(titleEl); filledTitle = true;
      }
      if (bodyEl && d.html) {
        if (bodyEl.isContentEditable) bodyEl.innerHTML = d.html; else bodyEl.value = d.html;
        fire(bodyEl); filledBody = true;
      }
      return { ok: true, filledTitle, filledBody };
    } catch (e) { return { ok: false, error: String(e && e.message || e) }; }
  })()`;
}

function confirmBlogFill(target) {
  return new Promise((resolve) => {
    showActionSheet('Let Sprig fill this editor?',
      `Sprig will put your page's title and body into the ${target.platform} editor. It will NOT publish — you review and click Publish.`,
      [{ label: 'Fill the editor', primary: true, onClick: () => resolve(true) }],
      () => resolve(false));
  });
}

// Confirm FIRST, then open the editor in a tab and drive the webview to set
// title+body (never submitting). Confirming before navigation avoids racing the
// editor's dom-ready while the confirm modal is up (the old bug that left it empty).
async function fillBlogEditor(url, entry, target, size) {
  if (!(await confirmBlogFill(target))) { openShareComposer(url, size); return; }
  newTab(true);
  const editorTab = activeTab();
  openUrlInTab(url); // navigation starts now — AFTER we're ready to listen
  const wv = webviews.get(editorTab.id);
  if (!wv) { toast('Couldn’t open the editor.'); return; }
  let done = false;
  const inject = async () => {
    if (done) return; done = true;
    try {
      const data = JSON.stringify({ title: entry.title || '', html: blogContentHtml(entry) });
      const r = await wv.executeJavaScript(blogEditorFillScript(data), true);
      auditAction({ type: 'blog_editor_fill', target: target.siteUrl || target.platform, decision: 'allow', ok: !!(r && r.ok) });
      toast((r && r.ok && (r.filledTitle || r.filledBody))
        ? `Filled the ${target.platform} editor — review it and hit Publish.`
        : `Opened the ${target.platform} editor — couldn’t auto-fill; paste your content and Publish.`);
    } catch { /* best-effort */ }
  };
  // Fill once the editor SPA mounts. Cover both cases: dom-ready still to come, or
  // the nav already finished before we attached (the `done` guard dedupes).
  wv.addEventListener('dom-ready', () => setTimeout(inject, 2500), { once: true });
  try { if (wv.isLoading && !wv.isLoading()) setTimeout(inject, 2500); } catch { /* ignore */ }
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
// ---- Share to your networks (post-publish, Your places) ---------------------
// Sprig DRAFTS a per-network post, then opens that network's web share intent
// pre-filled in a new tab. The user reviews and clicks Post over there —
// Chervil NEVER auto-posts (same philosophy as never auto-submitting logins).
const SHARE_NETWORKS = [
  { key: 'x', label: 'X', limit: 280, flavor: 'a punchy post for X (Twitter) — max 280 characters INCLUDING the link', intent: (text, url) => 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text + '\n\n' + url) },
  { key: 'bluesky', label: 'Bluesky', limit: 300, flavor: 'a friendly, conversational Bluesky post — max 300 characters including the link', intent: (text, url) => 'https://bsky.app/intent/compose?text=' + encodeURIComponent(text + '\n\n' + url) },
  { key: 'facebook', label: 'Facebook', limit: 900, flavor: 'a warm Facebook post, two or three sentences', intent: (text, url) => 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) + '&quote=' + encodeURIComponent(text) },
];
function configuredShareNetworks() {
  return SHARE_NETWORKS.filter((n) => placeUrl(n.key));
}

// Shared drafting core: ask the model, strip wrapping quotes, and fit the post to
// the platform's char budget (reserving room for the appended link). Returns '' on
// failure so callers can fall back to the title.
async function runDraft(prompt, url, limit) {
  try {
    const resp = await window.chervil.chat({ query: prompt, history: [], profile: settings.profile || null, config: providerConfig() });
    let text = ((resp && resp.ok && resp.text) || '').trim().replace(/^["“]+|["”]+$/g, '');
    const room = limit - url.length - 2;
    if (text.length > room) text = text.slice(0, Math.max(0, room - 1)) + '…';
    return text;
  } catch { return ''; }
}
async function draftShareText(net, title, url) {
  const prompt = `I just published "${title}" — it's live at ${url}. Write ${net.flavor} announcing it to my followers. Match my voice, at most one tasteful hashtag, no preamble or quotes — reply with ONLY the post text, and do NOT include the link (it's appended automatically).`;
  return (await runDraft(prompt, url, net.limit)) || title;
}

// The sheet re-offers itself after each share so several networks can be hit in
// a row (✓ marks the ones already opened). `done` runs once it's dismissed.
function offerShareToNetworks(title, url, done, shared = new Set()) {
  const nets = configuredShareNetworks();
  const actions = nets.map((n) => ({
    label: (shared.has(n.key) ? '✓ ' : '') + 'Share to ' + n.label,
    onClick: async () => {
      toast(`Sprig is drafting your ${n.label} post…`);
      const text = await draftShareText(n, title, url);
      openShareComposer(n.intent(text, url), { width: 620, height: 680 });
      shared.add(n.key);
      offerShareToNetworks(title, url, done, shared);
    },
  }));
  // Fedica + AddToAny need no registered place, so they're worth showing even with
  // no Your-places networks configured — but honor the Settings → Sharing toggles.
  if (settings.shareFedica !== false) actions.push(fedicaShareAction(title, url, done, shared));
  if (settings.shareAddtoany !== false) actions.push(addToAnyShareAction(title, url, done, shared));
  if (!actions.length) { if (done) done(); return; } // nothing enabled → skip the sheet
  showActionSheet(
    'Share to your networks',
    'Sprig drafts a post and opens each compose pre-filled — you review and hit Post there. Nothing is ever posted automatically.',
    actions,
    done
  );
}

// --- Fedica (social scheduler Rod uses to share posts) ----------------------
// Fedica's own browser extension opens its composer PRE-FILLED via a real endpoint:
//   https://fedica.com/browserplugin?value=<title + " " + pageURL>&host=<page host>
// (reverse-engineered from the installed extension's popup.js — it builds `value`
// from the page's og/twitter title + href). We reuse that exact endpoint, but fill
// `value` with a Sprig-drafted post + the link instead of the bare title, so the
// composer opens already composed — no copy/paste. Falls back to title + url (what
// the vanilla extension does) when drafting is unavailable. Same boundary as the
// other share intents: Sprig composes, the user posts. Never auto-submitted.
const FEDICA_PLUGIN_URL = 'https://fedica.com/browserplugin';

// Open a share composer either in a small popup window (default — like the Chrome/
// Edge extensions) or a new tab, per settings.sharePopup. The popup rides the
// default session, so logged-in cookies (Fedica etc.) carry over.
function openShareComposer(url, { width = 620, height = 640 } = {}) {
  if (settings.sharePopup !== false && window.chervil.openSharePopup) {
    window.chervil.openSharePopup(url, { width, height });
  } else {
    openUrlInNewTab(url);
  }
}

function fedicaComposerUrl(value, pageUrl) {
  let host = '';
  try { host = new URL(pageUrl).host; } catch { /* leave blank */ }
  return FEDICA_PLUGIN_URL + '?value=' + encodeURIComponent(value) + '&host=' + encodeURIComponent(host);
}

// AddToAny — a universal "share to any service" page (100+ networks). No AddToAny
// account needed; it just hands off to whichever network the user picks. The good
// default for people who don't use Fedica.
const ADDTOANY_SHARE_URL = 'https://www.addtoany.com/share';
function addToAnyUrl(title, url) {
  return ADDTOANY_SHARE_URL + '?linkurl=' + encodeURIComponent(url) + '&linkname=' + encodeURIComponent(title || url) + '&type=page';
}
function shareViaAddToAny(title, url) {
  openShareComposer(addToAnyUrl(title, url), { width: 720, height: 680 });
}

// Resolve the shareable URL + real title for the current tab — a live website, or
// a published Chervil page. Returns null when there's nothing public to share.
function currentShareTarget() {
  const tab = activeTab();
  const entry = currentEntry(tab);
  if (!entry) return null;
  const url = entry.kind === 'navigate' ? entry.url : entry.publishedUrl;
  if (!url) return null;
  let title = entry.title || '';
  if (entry.kind === 'navigate') {
    const wv = webviews.get(tab.id);
    try { title = (wv && wv.getTitle()) || tab.title || title; } catch { title = tab.title || title; }
  }
  return { url, title: title || url };
}

// Draft a short social post for any page (not just freshly-published ones — Fedica
// is often used to share articles you're reading). Link is appended by the caller.
async function draftSocialPost(title, url, { flavor = 'a punchy social post', limit = 280 } = {}) {
  const prompt = `Write ${flavor} to share this page with my followers: "${title}" (${url}). Match my voice, at most one tasteful hashtag, no preamble or surrounding quotes — reply with ONLY the post text, and do NOT include the link (it's added separately). Keep it under ${limit} characters.`;
  return (await runDraft(prompt, url, limit)) || title;
}

// Draft a post, then open Fedica's composer pre-filled with it (draft + link).
async function shareToFedica(title, url) {
  toast('Sprig is composing your Fedica post…');
  const draft = await draftSocialPost(title, url, { flavor: 'a punchy social post', limit: 280 });
  const value = ((draft && draft.trim()) ? draft.trim() : (title || 'Check this out')) + ' ' + url;
  openShareComposer(fedicaComposerUrl(value, url), { width: 620, height: 640 });
  toast('Fedica opened with your post ready — review and schedule.');
}

// Toolbar 📣 — a small "Share this page" hub: Fedica (composer pre-fill), AddToAny
// (no account), plus any social networks registered in Your places.
function openShareMenu() {
  const t = currentShareTarget();
  if (!t) { toast('Open a website — or publish this page — then share it.'); return; }
  const actions = [];
  if (settings.shareFedica !== false) actions.push({ label: '📣 Fedica — schedule this post', primary: true, onClick: () => shareToFedica(t.title, t.url) });
  if (settings.shareAddtoany !== false) actions.push({ label: '🌐 Share anywhere (AddToAny)', onClick: () => shareViaAddToAny(t.title, t.url) });
  for (const n of configuredShareNetworks()) {
    actions.push({
      label: 'Share to ' + n.label,
      onClick: async () => {
        toast(`Sprig is drafting your ${n.label} post…`);
        const text = await draftSocialPost(t.title, t.url, { flavor: n.flavor, limit: n.limit });
        openShareComposer(n.intent(text, t.url), { width: 620, height: 680 });
      },
    });
  }
  if (!actions.length) { toast('Turn on a share service in Settings → Sharing.'); return; }
  showActionSheet('Share this page', 'Sprig composes the post; you review and post it. Nothing is shared automatically.', actions);
}

// A "Share to Fedica" row for the post-publish share sheet (mirrors the network rows).
function fedicaShareAction(title, url, done, shared) {
  return {
    label: (shared.has('fedica') ? '✓ ' : '') + 'Share to Fedica',
    onClick: async () => {
      await shareToFedica(title, url);
      shared.add('fedica');
      offerShareToNetworks(title, url, done, shared);
    },
  };
}

// An "AddToAny" row for the post-publish share sheet — the no-account universal option.
function addToAnyShareAction(title, url, done, shared) {
  return {
    label: (shared.has('addtoany') ? '✓ ' : '') + 'Share anywhere (AddToAny)',
    onClick: () => {
      shareViaAddToAny(title, url);
      shared.add('addtoany');
      offerShareToNetworks(title, url, done, shared);
    },
  };
}

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
      const offerCloud = () => {
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
      };
      // Share first (Your places), then the cloud-live offer once that's done.
      offerShareToNetworks(entry.title || entry.query || 'my new page', res.url, offerCloud);
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
      offerShareToNetworks(entry.title || 'my new lesson', res.url);
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
els.pageTitle.addEventListener('blur', () => { els.pageTitle.value = omniboxCanonical; setTimeout(closeOmniSuggest, 120); });
els.pageTitle.addEventListener('input', () => renderOmniSuggest());
els.pageTitle.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' && omniSuggestions.length) { e.preventDefault(); moveOmniSel(1); }
  else if (e.key === 'ArrowUp' && omniSuggestions.length) { e.preventDefault(); moveOmniSel(-1); }
  else if (e.key === 'Enter') {
    e.preventDefault();
    if (omniSelIndex >= 0 && omniSuggestions[omniSelIndex]) pickOmniSuggestion(omniSuggestions[omniSelIndex]);
    else runOmnibox(els.pageTitle.value);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    if (omniSuggestEl) { closeOmniSuggest(); return; }
    els.pageTitle.value = omniboxCanonical; els.pageTitle.blur();
  }
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
// (found-in-page attaches per-webview in attachWebviewEvents — see the pool.)

// Keep a tab's entry, title — and, when it's the active tab, the omnibox and
// nav buttons — in sync as its site navigates. Fires for BACKGROUND tabs too
// (their webviews stay alive now), so everything keys off the owning tab.
function onWebviewNavigated(tabId, url) {
  const tab = tabs.find((t) => t.id === tabId);
  if (!tab) return;
  const e = currentEntry(tab);
  if (!e || e.kind !== 'navigate') return;          // only while that tab is on a live site
  if (url && /^https?:\/\//i.test(url)) {
    e.url = url;                                      // the entry now reflects where that tab is
    tab.title = hostOf(url);
    recordSiteVisit(url, null, tab);
    if (tabId === activeId) setOmnibox(url);
    renderTabs();
    scheduleSave();
  }
  if (tabId === activeId) {
    updateNavButtons();
    updatePwFillButton();
  }
}

// Log a visited real site into browsing history (newest-first, deduped, capped).
function recordSiteVisit(url, title, tab) {
  if (!url || !/^https?:\/\//i.test(url)) return;
  const t = tab || activeTab();
  if (t && t.private) return; // private tabs leave no history
  if (siteHistory[0] && siteHistory[0].url === url) { siteHistory[0].at = Date.now(); return; }
  siteHistory.unshift({ id: uid(), url, title: title || hostOf(url), at: Date.now() });
  if (siteHistory.length > MAX_SITE_HISTORY) siteHistory.length = MAX_SITE_HISTORY;
}
// (Webview events attach per-webview in attachWebviewEvents — see the pool.)

els.deepToggle.addEventListener('click', () => setDeepMode(!deepMode));
els.learnToggle.addEventListener('click', () => setSkillMode('learn'));
els.quizToggle.addEventListener('click', () => setSkillMode('quiz'));
if (els.compareToggle) els.compareToggle.addEventListener('click', () => setSkillMode('compare'));
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

// Collapse toolbar buttons that don't fit into the ⋯ overflow tray, and keep it
// in sync as the window / sidebar resizes.
initOmniOverflow();
window.addEventListener('load', () => reflowOmnibar()); // re-measure once emoji metrics settle
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

// Welcome overlay → docs site (opens in the user's browser).
const overlayDocsLink = document.getElementById('overlay-docs-link');
if (overlayDocsLink && window.chervil && window.chervil.openExternal) {
  overlayDocsLink.addEventListener('click', () => {
    const base = (settings.publishBase || 'https://getchervil.com').replace(/\/+$/, '');
    window.chervil.openExternal(`${base}/docs`);
  });
} else if (overlayDocsLink) {
  overlayDocsLink.style.display = 'none'; // older preload without the bridge
}

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
if (els.reload) els.reload.addEventListener('click', () => reloadTab(activeId));
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
{ const wf = document.getElementById('watch-form'); if (wf) wf.addEventListener('submit', (e) => { e.preventDefault(); addWatcherFromForm(); }); }
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
if (els.followupForm) els.followupForm.addEventListener('submit', handleFollowup);
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
let ollamaUrlSavedTimer = null;
els.ollamaUrl.addEventListener('input', () => {
  settings.ollamaUrl = els.ollamaUrl.value.trim();
  els.ollamaUrlStatus.textContent = 'Saving…';
  els.ollamaUrlStatus.className = 'field-note';
  scheduleSave();
  if (ollamaUrlSavedTimer) clearTimeout(ollamaUrlSavedTimer);
  ollamaUrlSavedTimer = setTimeout(() => {  // fires after scheduleSave's 500ms debounce has written
    els.ollamaUrlStatus.textContent = 'Saved ✓';
    els.ollamaUrlStatus.className = 'field-note ok';
  }, 650);
});
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

// Your places — save on input (URLs only; see placesObj/placeUrl).
for (const k of PLACES_FIELDS) {
  const el = document.getElementById('pl-' + k);
  if (el) el.addEventListener('input', () => { placesObj()[k] = el.value.trim(); scheduleSave(); });
}
{
  const kind = document.getElementById('pl-email-kind');
  const url = document.getElementById('pl-email-url');
  if (kind) kind.addEventListener('change', () => {
    placesObj().email = kind.value;
    if (url) url.hidden = kind.value !== 'custom';
    scheduleSave();
  });
  if (url) url.addEventListener('input', () => { placesObj().emailUrl = url.value.trim(); scheduleSave(); });
  const add = document.getElementById('pl-add-extra');
  if (add) add.addEventListener('click', () => {
    placesObj().extras.push({ name: '', url: '' });
    renderPlacesExtras();
    const rows = document.querySelectorAll('#pl-extras .place-extra-row input');
    if (rows.length >= 2) rows[rows.length - 2].focus();
  });
}
{
  const add = document.getElementById('blog-add-target');
  if (add) add.addEventListener('click', () => {
    blogTargets().push({ id: uid(), platform: 'wordpress', name: '', siteUrl: '', username: '' });
    scheduleSave();
    renderBlogTargets();
    const rows = document.querySelectorAll('#blog-targets .blog-target-row');
    const last = rows[rows.length - 1];
    if (last) { const n = last.querySelector('input'); if (n) n.focus(); }
  });
  const agent = document.getElementById('blog-agent-toggle');
  if (agent) agent.addEventListener('change', () => { settings.blogAgent = agent.checked; scheduleSave(); });
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
if (els.wakeConfirmToggle) els.wakeConfirmToggle.addEventListener('change', () => {
  settings.wakeConfirm = els.wakeConfirmToggle.checked; scheduleSave();
});
if (els.noisyModeToggle) els.noisyModeToggle.addEventListener('change', () => {
  settings.noisyMode = els.noisyModeToggle.checked;
  scheduleSave();
  if (settings.wakeEnabled) restartWake(); // re-arm with the stricter (or relaxed) engine config
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
if (els.tabsToggle) els.tabsToggle.addEventListener('click', toggleTabsBar);

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

// Show/hide the native menu bar (File/Edit/View) for this window.
if (els.menuBarToggle) els.menuBarToggle.addEventListener('change', () => {
  settings.showMenuBar = els.menuBarToggle.checked;
  if (window.chervil.setMenuBarVisible) window.chervil.setMenuBarVisible(settings.showMenuBar);
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
  const se = document.getElementById('search-engine-select');
  if (se) se.addEventListener('change', () => { settings.searchEngine = se.value; scheduleSave(); });
}

// Browsing & privacy controls (default browser, ad-block, clear data).
// Shared by the Settings button and the first-run welcome.
async function makeDefaultBrowserFlow() {
  let r; try { r = await window.chervil.makeDefaultBrowser(); } catch { r = null; }
  if (r && r.dev) {
    // In `electron .` dev, execPath is electron.exe so we can't register a real
    // browser — say so plainly instead of sending the user on a dead-end trip.
    toast('Making Chervil the default only works in the installed app, not dev.');
  } else if (r && r.isDefault) {
    toast('Chervil is already your default browser.');
  } else {
    // The picker is now open with Chervil selectable — the OS won't let us flip it
    // for you, so tell the user exactly what to do to finish.
    toast('In the window that opened, pick Chervil as your web browser to finish.');
  }
  refreshPrivacyUI();
}
if (els.makeDefaultBtn) els.makeDefaultBtn.addEventListener('click', makeDefaultBrowserFlow);
if (els.importBookmarksBtn) els.importBookmarksBtn.addEventListener('click', importFromBrowser);
{
  const rb = document.getElementById('rerun-onboarding-btn');
  if (rb) rb.addEventListener('click', () => { closeSettings(); showOnboarding(); });
}
if (els.importHistoryBtn) els.importHistoryBtn.addEventListener('click', importHistoryFromBrowser);
if (els.importPwBtn) els.importPwBtn.addEventListener('click', importPasswordsFromCsv);
if (els.importAddressBtn) els.importAddressBtn.addEventListener('click', importAddressFromBrowser);
// When the user comes back from the OS Default apps window, refresh the status
// line so it flips to "Chervil is your default browser." without reopening Settings.
window.addEventListener('focus', () => {
  if (els.settingsModal && els.settingsModal.classList.contains('open')) refreshPrivacyUI();
});
if (els.adblockToggle) els.adblockToggle.addEventListener('change', async () => {
  settings.adblock = els.adblockToggle.checked;
  try { await window.chervil.setAdblock(settings.adblock); } catch { /* ignore */ }
  scheduleSave();
  refreshPrivacyUI();
});
if (els.spellcheckToggle) els.spellcheckToggle.addEventListener('change', async () => {
  settings.spellcheck = els.spellcheckToggle.checked;
  try { await window.chervil.setSpellcheck(settings.spellcheck); } catch { /* ignore */ }
  scheduleSave();
});
if (els.sharePopupToggle) els.sharePopupToggle.addEventListener('change', () => {
  settings.sharePopup = els.sharePopupToggle.checked;
  scheduleSave();
});
if (els.shareFedicaToggle) els.shareFedicaToggle.addEventListener('change', () => {
  settings.shareFedica = els.shareFedicaToggle.checked;
  scheduleSave();
});
if (els.shareAddtoanyToggle) els.shareAddtoanyToggle.addEventListener('change', () => {
  settings.shareAddtoany = els.shareAddtoanyToggle.checked;
  scheduleSave();
});
if (els.clearDataBtn) els.clearDataBtn.addEventListener('click', async () => {
  if (!confirm('Clear cookies, cache, and site data for embedded sites — plus your Sites history and Downloads list? Bookmarks and saved logins are kept.')) return;
  let r; try { r = await window.chervil.clearBrowsingData(); } catch { r = null; }
  siteHistory = [];
  downloads = [];
  if (els.libraryDrawer.classList.contains('open')) renderDrawer();
  scheduleSave();
  toast(r && r.ok ? 'Browsing data cleared.' : 'Cleared local history; site data may not have fully cleared.');
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
if (els.libTabBookmarks) els.libTabBookmarks.addEventListener('click', () => { drawerTab = 'bookmarks'; renderDrawer(); });
if (els.libTabFavorites) els.libTabFavorites.addEventListener('click', () => { drawerTab = 'favorites'; renderDrawer(); });
if (els.libTabSites) els.libTabSites.addEventListener('click', () => { drawerTab = 'sites'; renderDrawer(); });
if (els.libTabDownloads) els.libTabDownloads.addEventListener('click', () => { drawerTab = 'downloads'; renderDrawer(); });
if (els.libTabCollections) els.libTabCollections.addEventListener('click', () => { drawerTab = 'collections'; renderDrawer(); });
if (els.libNewCollection) els.libNewCollection.addEventListener('click', createCollection);
els.libTabTrash.addEventListener('click', () => { drawerTab = 'trash'; renderDrawer(); });
if (els.clearSites) els.clearSites.addEventListener('click', clearSiteHistory);
if (els.clearDownloads) els.clearDownloads.addEventListener('click', clearDownloads);
if (els.libSearch) els.libSearch.addEventListener('input', () => { librarySearch = els.libSearch.value; renderDrawer(); });
if (els.libNewFolder) els.libNewFolder.addEventListener('click', () => (drawerTab === 'favorites' ? createFavoriteFolder() : createBookmarkFolder()));
if (els.libCollapseAll) els.libCollapseAll.addEventListener('click', toggleCollapseAll);
if (els.bookmarksBarToggle) els.bookmarksBarToggle.addEventListener('change', () => { settings.bookmarksBar = els.bookmarksBarToggle.checked; applyBookmarksBar(); scheduleSave(); });
if (els.favoritesBarToggle) els.favoritesBarToggle.addEventListener('change', () => { settings.favoritesBar = els.favoritesBarToggle.checked; applyFavoritesBar(); scheduleSave(); });
if (els.bookmarkBtn) els.bookmarkBtn.addEventListener('click', toggleBookmark);
if (els.favoriteBtn) els.favoriteBtn.addEventListener('click', toggleFavorite);
if (els.pwFillBtn) els.pwFillBtn.addEventListener('click', fillPasswordOnSite);
if (els.pwFillToggle) els.pwFillToggle.addEventListener('change', () => { setToolbarVisible('pwFill', els.pwFillToggle.checked); renderToolbarPrefs(); });
if (els.cardFillBtn) els.cardFillBtn.addEventListener('click', fillCardOnSite);
if (els.cardFillToggle) els.cardFillToggle.addEventListener('change', () => { setToolbarVisible('cardFill', els.cardFillToggle.checked); renderToolbarPrefs(); });
els.emptyTrash.addEventListener('click', emptyTrash);
if (els.libImportPage) els.libImportPage.addEventListener('click', importPageFile);
if (els.libSelectToggle) els.libSelectToggle.addEventListener('click', enterLibrarySelect);
if (els.libSelectAll) els.libSelectAll.addEventListener('click', selectAllLibrary);
if (els.libSelectDelete) els.libSelectDelete.addEventListener('click', deleteSelectedLibrary);
if (els.libSelectDone) els.libSelectDone.addEventListener('click', exitLibrarySelect);

// Spaces (now organizing Saved Pages)
els.spaceSelect.addEventListener('change', (e) => setActiveSavedSpace(e.target.value));
els.newSpaceBtn.addEventListener('click', () => {
  els.synthRow.hidden = true;
  els.newSpaceRow.hidden = !els.newSpaceRow.hidden;
  if (!els.newSpaceRow.hidden) { els.newSpaceName.value = ''; els.newSpaceName.focus(); }
});
function commitNewSpace() {
  const name = els.newSpaceName.value.trim();
  if (!name) { els.newSpaceRow.hidden = true; return; }
  createSavedSpace(name);
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
els.synthGo.addEventListener('click', () => { els.synthRow.hidden = true; synthesizeSavedSpace(els.synthInput.value); });
if (els.publishSpaceBtn) els.publishSpaceBtn.addEventListener('click', publishCurrentSavedSpace);
els.synthInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); els.synthRow.hidden = true; synthesizeSavedSpace(els.synthInput.value); }
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
  else if (e.ctrlKey && e.shiftKey && (e.key === 'n' || e.key === 'N')) { e.preventDefault(); newTab(true, { private: true }); }
  else if (e.ctrlKey && e.shiftKey && (e.key === 'b' || e.key === 'B')) { e.preventDefault(); settings.bookmarksBar = !settings.bookmarksBar; applyBookmarksBar(); scheduleSave(); }
  else if (e.ctrlKey && e.key === 't') { e.preventDefault(); newTab(true); }
  else if (e.ctrlKey && e.key === 'w') { e.preventDefault(); if (activeId) closeTab(activeId); }
  else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === '\\' || e.key === '|')) { e.preventDefault(); toggleTabsBar(); }
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
  if (d.type === 'tts') { handleFrameTts(e.source, d); return; }
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
    } else if (msg.name === 'edit_image' || msg.name === 'editor_commit' || msg.name === 'editor_export') {
      // Snip-editor tools — only honored for a page WE built as an image editor
      // (an arbitrary composed page must not reach the clipboard/shell/model-edit).
      const entry = currentEntry(activeTab());
      if (!entry || !entry.imageEditor) return reply({ ok: false, error: 'Only available in the image editor.' });
      const image = String((msg.args && msg.args.image) || '');
      if (!/^data:image\//.test(image)) return reply({ ok: false, error: 'Missing image.' });
      const name = entry.snipName || 'snip.png';
      if (msg.name === 'edit_image') {
        const instruction = String((msg.args && msg.args.instruction) || '').trim();
        if (!instruction) return reply({ ok: false, error: 'Say what to change.' });
        const res = window.chervil.editImage
          ? await window.chervil.editImage({ imageDataUrl: image, instruction, resolution: msg.args && msg.args.resolution === '2k' ? '2k' : '' })
          : null;
        if (res && res.ok) reply({ ok: true, result: { image: res.dataUrl } });
        else reply({ ok: false, error: res && res.error === 'no-image-key' ? 'Add a Grok, OpenAI, or Gemini key in Settings → AI to let Sprig edit images.' : ((res && res.error) || 'Edit failed.') });
      } else if (msg.name === 'editor_commit') {
        // Persist the latest image back into the tab's entry (survives restarts).
        entry.html = imageEditorHtml(image, name);
        entry.snipImage = image;
        entry.editorHtmlVersion = IMAGE_EDITOR_HTML_VERSION;
        scheduleSave();
        reply({ ok: true, result: {} });
      } else {
        const action = (msg.args && msg.args.action) || '';
        if (action === 'copy') {
          const blob = await (await fetch(image)).blob();
          await navigator.clipboard.write([new ClipboardItem({ [blob.type || 'image/png']: blob })]);
          toast('Image copied.');
        } else if (action === 'save') {
          const a = document.createElement('a');
          a.href = image; a.download = name.replace(/\.png$/i, '') + '-edited.png';
          document.body.appendChild(a); a.click(); a.remove();
        } else if (action === 'viewer') {
          const r = window.chervil.openImage ? await window.chervil.openImage({ dataUrl: image, name }) : null;
          if (!r || !r.ok) return reply({ ok: false, error: (r && r.error) || 'Couldn’t open the image viewer.' });
        } else if (action === 'attach') {
          const im = /^data:([^;]+);base64,(.*)$/.exec(image);
          if (!im || pendingAttachments.length >= MAX_ATTACH) return reply({ ok: false, error: `Up to ${MAX_ATTACH} files at a time.` });
          pendingAttachments.push({ id: uid(), name, kind: 'image', data: im[2], mediaType: im[1] || 'image/png' });
          renderAttachChips();
          els.prompt.focus();
          toast('Attached — ask away.');
        } else {
          return reply({ ok: false, error: 'Unknown export.' });
        }
        reply({ ok: true, result: {} });
      }
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

// Badge label per status phase. Kind stays 'working' except where a dedicated
// style already exists, so the badge tracks the same story as the status bubble.
const BADGE_FOR_PHASE = {
  searching: ['working', 'searching'],
  reading: ['working', 'reading'],
  composing: ['working', 'composing'],
  researching: ['working', 'researching'],
  verifying: ['working', 'verifying'],
  retrying: ['working', 'reconnecting'],
};

// Streamed status updates, routed to the originating tab.
window.chervil.onStatus(({ requestId, status } = {}) => {
  const tabId = reqToTab.get(requestId);
  if (!tabId) return;
  const rs = runStateFor(tabId);
  const s = normalizeStatus(status);
  if (s.phase === 'retrying') {
    rs.streamBuffer = '';
    if (tabId === activeId && previewTimer) { clearTimeout(previewTimer); previewTimer = null; }
  }
  rs.status = s;
  rs.statusText = s.text;
  if (tabId === activeId) {
    setStatus(s, rs.startedAt);
    const badge = BADGE_FOR_PHASE[s.phase];
    if (badge) setBadge(badge[0], badge[1]);
  }
});

// Streamed HTML deltas, routed to the originating tab.
window.chervil.onChunk(({ requestId, delta } = {}) => {
  const tabId = reqToTab.get(requestId);
  if (!tabId) return;
  const rs = runStateFor(tabId);
  rs.streamBuffer += delta;
  if (tabId === activeId && hasDoctype(rs.streamBuffer)) {
    rs.statusText = 'Sprig is composing your page…';
    rs.status = normalizeStatus({ phase: 'composing', text: rs.statusText, sources: rs.status ? rs.status.sources : 0 });
    setStatus(rs.status, rs.startedAt);
    setBadge('working', 'composing');
    scheduleStreamRender(tabId);
  }
});

// Clicking a background notification jumps to the page that updated.
if (window.chervil.onNotificationClick) {
  window.chervil.onNotificationClick(({ tabId, entryId, url } = {}) => {
    // A watcher notification carries the watched URL (no tab) → open it live.
    if (url && !tabId) { openUrlInTab(url); return; }
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
  window.chervil.onQuickPrompt((prompt, opts) => {
    newTab(true);
    handleComposerSubmit(String(prompt || ''), { forceChat: !!(opts && opts.chat) });
  });
}

// The floating quick-ask panel can run an inline chat (no page composed, no tab
// opened). We run each turn here so it uses the exact in-app chat path (keys,
// model, profile) and the conversation is already in the renderer for a later
// "Open in Chervil" handoff. History mirrors the { role, content } shape chat uses.
let quickChatHistory = [];
if (window.chervil.onQuickChatRun) {
  window.chervil.onQuickChatRun(async (payload) => {
    const id = payload && payload.id;
    const query = String((payload && payload.query) || '').trim();
    if (!query) { window.chervil.sendQuickChatReply({ id, ok: false, error: 'Empty message.' }); return; }
    try {
      const resp = await window.chervil.chat({
        query,
        history: quickChatHistory.slice(-20),
        profile: settings.profile || null,
        config: providerConfig(),
      });
      if (resp && resp.ok) {
        const text = resp.text || '…';
        quickChatHistory.push({ role: 'user', content: query }, { role: 'assistant', content: text });
        if (quickChatHistory.length > 40) quickChatHistory = quickChatHistory.slice(-40);
        window.chervil.sendQuickChatReply({ id, ok: true, text, sources: resp.sources || [] });
      } else {
        window.chervil.sendQuickChatReply({ id, ok: false, error: (resp && resp.error) || 'Something went wrong.' });
      }
    } catch (e) {
      window.chervil.sendQuickChatReply({ id, ok: false, error: String(e && e.message ? e.message : e) });
    }
  });
}

// "Open in Chervil" — adopt the floating conversation into a real chat tab so it
// can continue with full context and history.
if (window.chervil.onQuickOpenInApp) {
  window.chervil.onQuickOpenInApp(() => {
    const tab = newTab(true);
    for (const m of quickChatHistory) {
      addMessage(tab, m.role === 'user' ? 'user' : 'bot', m.content);
      tab.history.push({ role: m.role, content: m.content });
    }
    if (quickChatHistory.length) {
      const first = quickChatHistory[0].content;
      tab.title = first.length > 40 ? first.slice(0, 37) + '…' : first;
    }
    quickChatHistory = []; // handed off into this tab — don't let a later handoff re-duplicate it
    setChatMode(true); // continued messages stay in chat, matching the floating panel
    renderTabs();
    scheduleSave();
    els.prompt.focus();
  });
}

// "New chat" in the floating panel resets the shared history.
if (window.chervil.onQuickClear) {
  window.chervil.onQuickClear(() => { quickChatHistory = []; });
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

// A file downloaded from an embedded site — record it in the Downloads shelf and
// let the user know.
if (window.chervil.onDownloadDone) {
  window.chervil.onDownloadDone((d) => {
    if (!d) return;
    downloads.unshift({ id: uid(), filename: d.filename || 'file', path: d.path || '', at: Date.now(), ok: !!d.ok, state: d.state || (d.ok ? 'completed' : 'failed') });
    if (downloads.length > MAX_DOWNLOADS) downloads.length = MAX_DOWNLOADS;
    scheduleSave();
    if (els.libraryDrawer.classList.contains('open') && drawerTab === 'downloads') renderDrawer();
    if (d.ok) toast(`⬇ Downloaded ${d.filename} to your Downloads folder.`);
    else toast(`Download failed: ${d.filename || ''}`);
  });
}

// Page zoom + print driven from the app menu (owns the Ctrl +/−/0 and Ctrl+P
// accelerators so they don't also fire as renderer keydowns).
if (window.chervil.onMenuZoom) {
  window.chervil.onMenuZoom((dir) => {
    if (dir === 'in') nudgeZoom(1);
    else if (dir === 'out') nudgeZoom(-1);
    else setZoom(1);
  });
}
if (window.chervil.onMenuPrint) window.chervil.onMenuPrint(() => printCurrentView());
if (els.zoomIndicator) els.zoomIndicator.addEventListener('click', () => setZoom(1)); // click % = reset
if (els.zoomIn) els.zoomIn.addEventListener('click', () => nudgeZoom(1));
if (els.zoomOut) els.zoomOut.addEventListener('click', () => nudgeZoom(-1));
if (els.printBtn) els.printBtn.addEventListener('click', () => printCurrentView());
if (els.readerBtn) els.readerBtn.addEventListener('click', () => openReaderView());
if (els.askPageBtn) els.askPageBtn.addEventListener('click', toggleAskPage);
if (els.translateBtn) els.translateBtn.addEventListener('click', openTranslateSheet);
if (els.readAloudBtn) els.readAloudBtn.addEventListener('click', readPageAloud);
if (els.snipBtn) els.snipBtn.addEventListener('click', startSnip);
if (els.sendPhoneBtn) els.sendPhoneBtn.addEventListener('click', sendTabToPhone);
if (els.emailPageBtn) els.emailPageBtn.addEventListener('click', emailCurrentPage);
if (els.shareFedicaBtn) els.shareFedicaBtn.addEventListener('click', openShareMenu);
if (els.pipBtn) els.pipBtn.addEventListener('click', () => togglePictureInPicture());

// Show the running app version in Settings (from the preload bridge), and wire
// the "Check for updates" link to the GitHub-releases check.
{
  const av = document.getElementById('app-version');
  if (av && window.chervil && window.chervil.version) av.textContent = window.chervil.version;

  const btn = document.getElementById('check-updates-btn');
  const status = document.getElementById('update-status');
  if (btn && status && window.chervil && window.chervil.checkForUpdates) {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      status.textContent = ' · Checking…';
      let res;
      try { res = await window.chervil.checkForUpdates(); }
      catch (e) { res = { ok: false, error: String((e && e.message) || e) }; }
      btn.disabled = false;
      status.textContent = '';
      if (!res || !res.ok) {
        status.textContent = ` · ${(res && res.error) || 'Update check failed.'}`;
        return;
      }
      if (res.hasUpdate) {
        status.appendChild(document.createTextNode(` · v${res.latest} available — `));
        const link = document.createElement('a');
        link.className = 'update-link';
        link.textContent = 'Download';
        link.href = '#';
        link.addEventListener('click', (ev) => {
          ev.preventDefault();
          if (window.chervil.openExternal) window.chervil.openExternal(res.url);
        });
        status.appendChild(link);
      } else {
        status.textContent = ` · You’re on the latest (v${res.current}).`;
      }
    });
  } else if (btn) {
    btn.style.display = 'none'; // older preload without the bridge
  }

  // Documentation link — opens the docs site in the user's browser.
  const docsBtn = document.getElementById('docs-link-btn');
  if (docsBtn) {
    if (window.chervil && window.chervil.openExternal) {
      const base = (settings.publishBase || 'https://getchervil.com').replace(/\/+$/, '');
      docsBtn.addEventListener('click', () => window.chervil.openExternal(`${base}/docs`));
    } else {
      docsBtn.style.display = 'none'; // older preload without the bridge
    }
  }
}

init();
