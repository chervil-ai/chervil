'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFile } = require('child_process');
const { app, BrowserWindow, ipcMain, dialog, safeStorage, Notification, Tray, Menu, globalShortcut, screen, shell, clipboard, session } = require('electron');

// Load .env from the project root (one level up from /electron).
// quiet:true suppresses dotenv v17's "injected env … tip" banner (which also
// renders as mojibake in the Windows console).
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

// Dev: `--profile-dir=<path>` runs this build with its own profile, so it can
// boot beside an installed Chervil (separate userData ⇒ separate instance lock)
// without touching the real profile. Must be set before the lock is requested.
const profileArg = process.argv.find((a) => a.startsWith('--profile-dir='));
if (profileArg) app.setPath('userData', path.resolve(profileArg.slice('--profile-dir='.length)));

const QRCode = require('qrcode');
const { runAgent, runChat, runTranslate, runAgentTurn, runOrchestrator, runAppletAsk, runComposeApplet, runListModels, runAgentStep, runAgentPlan, runExtractSlides, runExtractDoc, runExtractSheets, runSynthesizeAgent, runWatchCheck } = require('../lib/agent');
const { generateHeroImage, editImage } = require('../lib/images');
const { buildEpub } = require('../lib/epub');
const { getSkill } = require('../lib/skills');
const { createVault } = require('../lib/vault');
const { createPageIndex } = require('../lib/pageIndex');
const { createSitePermissions, MANAGED_PERMISSIONS } = require('../lib/sitePermissions');
const { registrableDomain } = require('../lib/etld');
const { mergeStates } = require('../lib/stateMerge');
const importBookmarks = require('../lib/importBookmarks');
const importHistory = require('../lib/importHistory');
const importPasswordsCsv = require('../lib/importPasswordsCsv');
const importAutofill = require('../lib/importAutofill');

let mainWindow = null;
let primaryWcId = null; // webContents id of the persisting window; secondary windows are ephemeral
let tray = null;
let quickWindow = null;
let quickChatMode = false; // the floating quick-ask is showing the inline chat panel (taller) vs the compact ask bar
let isQuitting = false; // true only when truly quitting (tray → Quit); otherwise window close = hide-to-tray

// Send a message to the main renderer (no-op if the window is gone). Used by menu
// accelerators (page zoom, print) that the renderer acts on.
function sendToMain(channel, arg) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(channel, arg);
}

// --- Ad / tracker blocking ------------------------------------------------
// A curated blocklist of common ad/tracking hosts (host-suffix match). Applied to
// the default session (which embedded <webview> sites use). Chervil's own requests
// (local files, DuckDuckGo favicons, getchervil.com) never match these, so the app
// is unaffected. Opt-in — off unless the renderer enables it.
const AD_HOSTS = [
  'doubleclick.net', 'g.doubleclick.net', 'stats.g.doubleclick.net', 'googlesyndication.com',
  'pagead2.googlesyndication.com', 'googleadservices.com', 'adservice.google.com', 'google-analytics.com',
  'analytics.google.com', 'googletagmanager.com', 'googletagservices.com', 'scorecardresearch.com',
  'adnxs.com', 'criteo.com', 'criteo.net', 'taboola.com', 'outbrain.com', 'amazon-adsystem.com',
  'adsafeprotected.com', 'moatads.com', 'quantserve.com', 'quantcount.com', 'rubiconproject.com',
  'pubmatic.com', 'openx.net', 'casalemedia.com', '2mdn.net', 'serving-sys.com', 'bidswitch.net',
  'yieldmo.com', 'sharethrough.com', 'contextweb.com', 'connect.facebook.net', 'advertising.com',
  'bat.bing.com', 'hotjar.com', 'mixpanel.com', 'segment.io', 'segment.com', 'fullstory.com',
  'doubleverify.com', 'adroll.com', 'bluekai.com', 'demdex.net', 'omtrdc.net', 'krxd.net',
  'mathtag.com', 'rlcdn.com', 'agkn.com', 'clarity.ms', 'branch.io', 'zqtk.net', 'adform.net',
];
let adblockEnabled = false;
let adblockCount = 0; // blocked this session (for the Settings readout)
function isAdHost(hostname) {
  const h = (hostname || '').toLowerCase();
  for (const d of AD_HOSTS) if (h === d || h.endsWith('.' + d)) return true;
  return false;
}
// Spell-check languages: Chromium's checker is on by default, but on Windows/
// Linux (Hunspell) it needs a dictionary language that actually exists — pin it
// to the OS locale, falling back to the base language (e.g. "de" for "de-AT").
// macOS uses the native spellchecker and ignores language lists.
function setupSpellcheck(ses = session.defaultSession) {
  if (process.platform === 'darwin') return;
  try {
    const langs = ses.availableSpellCheckerLanguages || [];
    const locale = app.getLocale() || 'en-US';
    const pick = langs.includes(locale) ? locale : langs.find((l) => l === locale.split('-')[0] || l.startsWith(locale.split('-')[0] + '-'));
    if (pick) ses.setSpellCheckerLanguages([pick]);
  } catch { /* keep Chromium defaults */ }
}

function setupAdblock(ses = session.defaultSession) {
  ses.webRequest.onBeforeRequest((details, cb) => {
    if (!adblockEnabled) return cb({});
    try {
      if (isAdHost(new URL(details.url).hostname)) { adblockCount++; return cb({ cancel: true }); }
    } catch { /* ignore malformed URLs */ }
    cb({});
  });
}

// Register Chervil as a handler for http/https so the OS can offer it as the
// default browser. Windows/macOS still require the user to confirm the choice in
// system settings; this just makes Chervil eligible and reversible.
function registerWebProtocols() {
  for (const scheme of ['http', 'https']) {
    try {
      if (process.defaultApp && process.argv.length >= 2) {
        app.setAsDefaultProtocolClient(scheme, process.execPath, [path.resolve(process.argv[1])]);
      } else {
        app.setAsDefaultProtocolClient(scheme);
      }
    } catch { /* ignore */ }
  }
}

// Register Chervil as a *browser* in the Windows registry so it actually shows up
// in Settings → Default apps as a selectable web browser. `setAsDefaultProtocolClient`
// above only registers a URL-protocol handler — that is NOT enough for the Win10/11
// default-apps picker, which only lists apps that publish the "Capabilities" keys
// under HKCU\Software\Clients\StartMenuInternet + RegisteredApplications. Without
// these, opening ms-settings:defaultapps is a dead end (nothing to select), which
// is exactly why "Make default" appeared to do nothing. All keys are per-user
// (HKCU) so no elevation is needed. Windows still requires the user to confirm the
// choice in Settings — no app can self-assign the default browser.
function runReg(args) {
  return new Promise((resolve) => {
    execFile('reg', args, { windowsHide: true }, (err) => resolve(!err));
  });
}
const BROWSER_PROGID = 'ChervilHTML';
const BROWSER_APPKEY = 'Chervil'; // key under StartMenuInternet + RegisteredApplications
async function registerAsBrowser() {
  // Only meaningful on Windows, and only for a packaged build — in dev,
  // process.execPath is electron.exe, which we must never register as "the browser".
  if (process.platform !== 'win32' || process.defaultApp) return false;
  const exe = process.execPath;
  const icon = exe + ',0';
  const openUrlCmd = `"${exe}" "%1"`;
  const startMenu = `Software\\Clients\\StartMenuInternet\\${BROWSER_APPKEY}`;
  const caps = `HKCU\\${startMenu}\\Capabilities`;
  const set = (key, name, data) =>
    runReg(name === null
      ? ['add', key, '/ve', '/d', data, '/f']
      : ['add', key, '/v', name, '/t', 'REG_SZ', '/d', data, '/f']);
  try {
    // 1) ProgID that describes how to open an http(s) URL / .htm(l) file with Chervil.
    await set(`HKCU\\Software\\Classes\\${BROWSER_PROGID}`, null, 'Chervil HTML Document');
    await set(`HKCU\\Software\\Classes\\${BROWSER_PROGID}\\Application`, 'ApplicationName', 'Chervil');
    await set(`HKCU\\Software\\Classes\\${BROWSER_PROGID}\\DefaultIcon`, null, icon);
    await set(`HKCU\\Software\\Classes\\${BROWSER_PROGID}\\shell\\open\\command`, null, openUrlCmd);
    // 2) StartMenuInternet client entry — what marks Chervil as a *browser*.
    await set(`HKCU\\${startMenu}`, null, 'Chervil');
    await set(`HKCU\\${startMenu}\\DefaultIcon`, null, icon);
    await set(`HKCU\\${startMenu}\\shell\\open\\command`, null, `"${exe}"`);
    // 3) Capabilities — the URL/file associations the default-apps picker reads.
    await set(caps, 'ApplicationName', 'Chervil');
    await set(caps, 'ApplicationIcon', icon);
    await set(caps, 'ApplicationDescription', 'The agentic, conversational web browser.');
    await set(`${caps}\\StartMenu`, 'StartMenuInternet', BROWSER_APPKEY);
    for (const scheme of ['http', 'https']) await set(`${caps}\\URLAssociations`, scheme, BROWSER_PROGID);
    for (const ext of ['.htm', '.html']) await set(`${caps}\\FileAssociations`, ext, BROWSER_PROGID);
    // 4) Advertise the capabilities set so Windows surfaces Chervil in Default apps.
    await set('HKCU\\Software\\RegisteredApplications', BROWSER_APPKEY, `${startMenu}\\Capabilities`);
    return true;
  } catch { return false; }
}

// A URL handed to Chervil by the OS (default-browser link) → open it in a tab.
function openExternalHttpUrl(url) {
  if (!/^https?:\/\//i.test(String(url || ''))) return false;
  showMain();
  const wc = mainWindow && mainWindow.webContents;
  if (!wc) return false;
  if (wc.isLoading()) wc.once('did-finish-load', () => { if (!wc.isDestroyed()) wc.send('chervil:open-tab-url', url); });
  else wc.send('chervil:open-tab-url', url);
  return true;
}

// Credential vault (RFC 0008) — passphrase-gated, lazily created once app is ready.
let credVault = null;
function vault() {
  if (!credVault) credVault = createVault(path.join(app.getPath('userData'), 'chervil-creds.bin'), safeStorage);
  return credVault;
}

// Per-site permission decisions (camera/mic/location/notifications) for embedded
// real sites — lazily created once app is ready.
let sitePermsStore = null;
function sitePerms() {
  if (!sitePermsStore) sitePermsStore = createSitePermissions(path.join(app.getPath('userData'), 'chervil-permissions.json'));
  return sitePermsStore;
}

// Human-readable label for a permission prompt.
function permLabel(permission) {
  if (permission === 'media') return 'use your camera and microphone';
  if (permission === 'geolocation') return 'know your location';
  if (permission === 'notifications') return 'send you notifications';
  return `use ${permission}`;
}

// Ask the user to allow/block a sensitive permission for a site, once. The choice
// is remembered (per origin) so we never re-prompt — matching browser behavior.
// Returns true to allow.
async function promptSitePermission(win, origin, permission) {
  const parent = win && !win.isDestroyed() ? win : (mainWindow && !mainWindow.isDestroyed() ? mainWindow : null);
  const opts = {
    type: 'question',
    buttons: ['Block', 'Allow'],
    defaultId: 0,
    cancelId: 0,
    noLink: true,
    title: 'Site permission',
    message: `Allow ${origin} to ${permLabel(permission)}?`,
    detail: 'Chervil will remember your choice for this site. You can change it later in Settings → Browser → Site permissions.',
  };
  try {
    const { response } = parent ? await dialog.showMessageBox(parent, opts) : await dialog.showMessageBox(opts);
    return response === 1;
  } catch {
    return false; // fail closed
  }
}

// --- Bring-your-own API keys (per provider, encrypted at rest via safeStorage) ---
function keysFile() {
  return path.join(app.getPath('userData'), 'chervil-keys.bin');
}

// Before the rename the Electron app used a different name ("parslee", earlier
// "PingChat"), so user-data lived in a DIFFERENT folder under appData — renaming the
// package moved getPath('userData'). Look in those old folders so keys/state migrate
// forward into the current folder instead of being orphaned.
function legacyDataFile(filename) {
  const appData = app.getPath('appData');
  for (const name of ['parslee', 'PingChat', 'pingchat']) {
    const p = path.join(appData, name, filename);
    try { if (fs.existsSync(p)) return p; } catch { /* ignore */ }
  }
  return '';
}
function legacyKeysFile() {
  return legacyDataFile('parslee-keys.bin') || legacyDataFile('pingchat-keys.bin');
}

// provider -> key, for this session. Anthropic's .env key seeds "claude".
let savedKeys = {};

function loadSavedKeys() {
  if (process.env.ANTHROPIC_API_KEY) savedKeys.claude = process.env.ANTHROPIC_API_KEY;
  if (process.env.OPENAI_API_KEY) savedKeys.openai = process.env.OPENAI_API_KEY;
  try {
    let p = keysFile();
    if (!fs.existsSync(p) && fs.existsSync(legacyKeysFile())) p = legacyKeysFile();
    if (fs.existsSync(p) && safeStorage.isEncryptionAvailable()) {
      const obj = JSON.parse(safeStorage.decryptString(fs.readFileSync(p)));
      if (obj && typeof obj === 'object') savedKeys = { ...savedKeys, ...obj };
    }
  } catch { /* ignore */ }
}

function persistKeys() {
  if (!safeStorage.isEncryptionAvailable()) return false;
  try {
    fs.writeFileSync(keysFile(), safeStorage.encryptString(JSON.stringify(savedKeys)));
    return true;
  } catch {
    return false;
  }
}

function setKey(provider, key) {
  if (!provider) return { ok: false, error: 'No provider given.' };
  if (key) savedKeys[provider] = key;
  else delete savedKeys[provider];
  const stored = persistKeys();
  return {
    ok: true,
    stored,
    warn: stored ? undefined : 'OS encryption is unavailable — the key is kept for this session only (not written to disk).',
  };
}

// --- First-run provisioning (from the installer wizard) ------------------
// The Inno Setup installer can't encrypt keys (safeStorage is Electron/OS-specific)
// or write the renderer's settings, so it drops a plain firstrun.json into our
// userData folder and we apply it here on first launch, then delete it:
//   { keys: { claude, openai, grok, gemini }, provider, profile }
function applyFirstRunProvisioning() {
  const p = path.join(app.getPath('userData'), 'firstrun.json');
  let cfg;
  try {
    if (!fs.existsSync(p)) return;
    cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch { return; }
  if (!cfg || typeof cfg !== 'object') { try { fs.unlinkSync(p); } catch { /* ignore */ } return; }

  try {
    // 1) API keys → encrypted key store.
    const keys = cfg.keys && typeof cfg.keys === 'object' ? cfg.keys : {};
    let touchedKeys = false;
    for (const provider of ['claude', 'openai', 'grok', 'gemini']) {
      const v = keys[provider];
      if (typeof v === 'string' && v.trim()) { savedKeys[provider] = v.trim(); touchedKeys = true; }
    }
    if (touchedKeys) persistKeys();

    // 2) Default provider + 3) "About You" profile → renderer settings, by seeding
    // the state file the renderer restores on load.
    const provider = ['claude', 'grok', 'gemini', 'openai', 'azure', 'ollama'].includes(cfg.provider) ? cfg.provider : null;
    const profile = typeof cfg.profile === 'string' ? cfg.profile.slice(0, 4000) : null;
    if (provider || profile) {
      let state = {};
      try { if (fs.existsSync(stateFile())) state = JSON.parse(fs.readFileSync(stateFile(), 'utf8')) || {}; } catch { state = {}; }
      if (!state.settings || typeof state.settings !== 'object') state.settings = {};
      if (provider) state.settings.provider = provider;
      if (profile) state.settings.profile = profile;
      fs.writeFileSync(stateFile(), JSON.stringify(state), 'utf8');
    }
  } catch { /* best-effort; never block startup */ }

  try { fs.unlinkSync(p); } catch { /* ignore */ }
}

// Build the provider config for a request from the renderer's settings + saved key.
function providerConfigFrom(payload) {
  const cfg = (payload && payload.config) || {};
  const provider = cfg.provider || 'claude';
  return { ...cfg, provider, apiKey: savedKeys[provider] || '' };
}

// Permission model for embedded sites (and the app UI), applied per session:
//  • Chervil's own UI (file://) always gets the mic — that's voice input.
//  • Benign browsing permissions (fullscreen, pointer lock, …) stay allowed so
//    embedded real sites work.
//  • Sensitive permissions (camera/mic, location, notifications) on a REMOTE
//    site are decided PER SITE: honor a saved choice, otherwise prompt once and
//    remember it. Anything else is denied.
function attachPermissionHandlers(ses, win) {
  const fromApp = (url) => (url || '').startsWith('file://');
  const BROWSING_OK = new Set(['fullscreen', 'pointerLock', 'keyboardLock', 'clipboard-sanitized-write']);
  const managed = new Set(MANAGED_PERMISSIONS);
  ses.setPermissionRequestHandler(async (wc, permission, callback, details) => {
    if (permission === 'media' && fromApp(details && details.requestingUrl)) return callback(true);
    if (BROWSING_OK.has(permission)) return callback(true);
    if (managed.has(permission)) {
      const origin = sitePerms().originKey(details && details.requestingUrl);
      if (!origin) return callback(false);
      const saved = sitePerms().get(origin, permission);
      if (saved) return callback(saved === 'allow');
      const allow = await promptSitePermission(win, origin, permission);
      sitePerms().set(origin, permission, allow ? 'allow' : 'deny');
      return callback(allow);
    }
    return callback(false);
  });
  ses.setPermissionCheckHandler((wc, permission, requestingOrigin) => {
    if (permission === 'media' && fromApp(requestingOrigin)) return true;
    if (BROWSING_OK.has(permission)) return true;
    if (managed.has(permission)) {
      const origin = sitePerms().originKey(requestingOrigin);
      return origin ? sitePerms().get(origin, permission) === 'allow' : false;
    }
    return false;
  });
}

// A guest webview's session may be a brand-new one (private tabs use per-tab
// in-memory partitions). Give any session we haven't seen the same protections
// as the default: downloads, permission gating, ad-block, spell-check.
const _guestSessions = new WeakSet();
function setupGuestSession(ses, win) {
  attachDownloadHandler(ses); // self-guarded per session
  if (ses === session.defaultSession || _guestSessions.has(ses)) return;
  _guestSessions.add(ses);
  attachPermissionHandlers(ses, win);
  setupAdblock(ses);
  setupSpellcheck(ses);
}

// Build a native right-click menu from the page's context-menu params. Used for
// the app UI and for any embedded real sites (<webview>).
function attachContextMenu(wc, opts = {}) {
  const isMainUI = !!opts.isMainUI;
  wc.on('context-menu', (_event, params) => {
    const groups = [];
    const sel = (params.selectionText || '').trim();

    if (params.linkURL) {
      groups.push([
        { label: 'Open Link in Browser', click: () => shell.openExternal(params.linkURL) },
        { label: 'Copy Link Address', click: () => clipboard.writeText(params.linkURL) },
      ]);
    }

    if (params.mediaType === 'image' && params.srcURL) {
      groups.push([
        { label: 'Copy Image', click: () => wc.copyImageAt(params.x, params.y) },
        { label: 'Save Image As…', click: () => wc.downloadURL(params.srcURL) },
        { label: 'Copy Image Address', click: () => clipboard.writeText(params.srcURL) },
      ]);
    }

    if (params.isEditable) {
      const spell = [];
      for (const s of (params.dictionarySuggestions || [])) {
        spell.push({ label: s, click: () => wc.replaceMisspelling(s) });
      }
      if (params.misspelledWord) {
        if (spell.length) spell.push({ type: 'separator' });
        spell.push({ label: 'Add to Dictionary', click: () => wc.session.addWordToSpellCheckerDictionary(params.misspelledWord) });
      }
      if (spell.length) groups.push(spell);
      groups.push([{ role: 'undo' }, { role: 'redo' }]);
      groups.push([
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteAndMatchStyle', label: 'Paste and Match Style' },
        { role: 'selectAll' },
      ]);
    } else if (sel) {
      const short = sel.length > 32 ? sel.slice(0, 32) + '…' : sel;
      groups.push([
        { role: 'copy' },
        {
          label: `Ask Sprig about “${short}”`,
          click: () => {
            if (mainWindow && !mainWindow.webContents.isDestroyed()) {
              mainWindow.show();
              mainWindow.webContents.send('chervil:context-ask', sel);
            }
          },
        },
      ]);
    }

    // Native back/forward/reload only for embedded sites — never the app shell,
    // where "reload" would blow away the whole SPA.
    if (!isMainUI) {
      const hist = wc.navigationHistory;
      const canBack = hist ? hist.canGoBack() : wc.canGoBack();
      const canFwd = hist ? hist.canGoForward() : wc.canGoForward();
      groups.push([
        { label: 'Back', enabled: canBack, click: () => (hist ? hist.goBack() : wc.goBack()) },
        { label: 'Forward', enabled: canFwd, click: () => (hist ? hist.goForward() : wc.goForward()) },
        { label: 'Reload', click: () => wc.reload() },
      ]);
    }

    // On the app shell, only show a menu when there's something to act on, so a
    // plain right-click on tabs/chrome doesn't pop a stray native menu that
    // fights the custom tab-management menu. Embedded sites always get a menu.
    if (!app.isPackaged && (!isMainUI || groups.length)) {
      groups.push([{ label: 'Inspect Element', click: () => wc.inspectElement(params.x, params.y) }]);
    }

    if (!groups.length) return;
    const template = [];
    groups.forEach((g, i) => {
      if (i) template.push({ type: 'separator' });
      template.push(...g);
    });
    Menu.buildFromTemplate(template).popup({ window: BrowserWindow.fromWebContents(wc) || mainWindow });
  });
}

// "About Chervil" — shows the running version (read-only, native dialog).
function showAboutDialog() {
  const win = BrowserWindow.getFocusedWindow() || mainWindow;
  dialog.showMessageBox(win, {
    type: 'info',
    title: 'About Chervil',
    message: `Chervil ${app.getVersion()}`,
    detail: 'The agentic, conversational web browser — the web comes to you.\n\n© 2026 Rod Trent · MIT licensed',
    buttons: ['OK', 'View on GitHub'],
    defaultId: 0,
    cancelId: 0,
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
  }).then((r) => { if (r.response === 1) shell.openExternal('https://github.com/chervil-ai/chervil'); })
    .catch(() => {});
}

// Replace Electron's default File/Edit/View/Window/Help bar with a minimal menu:
// drops "File", keeps standard accelerators (copy/paste, reload, zoom…), and adds
// an About item. The bar is hidden by default (autoHideMenuBar) — Alt reveals it.
function buildAppMenu() {
  const isDev = !app.isPackaged;
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'New Window', accelerator: 'CmdOrCtrl+N', click: () => createWindow({ secondary: true }) },
        { type: 'separator' },
        { role: 'close' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' }, { role: 'forceReload' },
        ...(isDev ? [{ role: 'toggleDevTools' }] : []),
        { type: 'separator' },
        // Page-content zoom (composed page or embedded site), NOT the whole app UI.
        // Routed to the renderer so it zooms the viewport like a browser. Owning the
        // accelerators here means they don't also fire as renderer keydowns.
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+=', click: () => sendToMain('chervil:menu-zoom', 'in') },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: () => sendToMain('chervil:menu-zoom', 'out') },
        { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', click: () => sendToMain('chervil:menu-zoom', 'reset') },
        { type: 'separator' },
        { label: 'Print…', accelerator: 'CmdOrCtrl+P', click: () => sendToMain('chervil:menu-print') },
        { type: 'separator' }, { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'About Chervil', click: showAboutDialog },
        { label: 'Chervil on GitHub', click: () => shell.openExternal('https://github.com/chervil-ai/chervil') },
        { label: 'Report an issue', click: () => shell.openExternal('https://github.com/chervil-ai/chervil/issues') },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// Save downloads from embedded sites to the Downloads folder (browser-style, no
// save dialog), de-duplicating filenames, with a clickable completion toast.
const _dlSessions = new WeakSet();
function attachDownloadHandler(session) {
  if (!session || _dlSessions.has(session)) return;
  _dlSessions.add(session);
  session.on('will-download', (_event, item) => {
    try {
      const dir = app.getPath('downloads');
      let target = path.join(dir, item.getFilename());
      if (fs.existsSync(target)) {
        const ext = path.extname(target);
        const base = target.slice(0, target.length - ext.length);
        let i = 1;
        while (fs.existsSync(`${base} (${i})${ext}`)) i++;
        target = `${base} (${i})${ext}`;
      }
      item.setSavePath(target);
    } catch { /* fall back to Electron's default (a save dialog) */ }
    item.on('done', (_e, state) => {
      const name = item.getFilename();
      const savePath = item.getSavePath();
      const send = (d) => { if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('chervil:download-done', d); };
      if (state === 'completed') {
        if (Notification.isSupported()) {
          const n = new Notification({ title: 'Download complete', body: name });
          n.on('click', () => { try { shell.showItemInFolder(savePath); } catch { /* ignore */ } });
          n.show();
        }
        send({ ok: true, filename: name, path: savePath });
      } else {
        send({ ok: false, filename: name, state });
      }
    });
  });
}

function createWindow(opts = {}) {
  const startHidden = !!opts.startHidden;
  const secondary = !!opts.secondary; // an extra, ephemeral browsing window
  const win = new BrowserWindow({
    // Launched at sign-in: stay hidden in the tray instead of popping the window
    // open. The user can summon it from the tray or the global hotkey. (Extra
    // windows are always shown — the user just asked for one.)
    show: secondary ? true : !startHidden,
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0b0d12',
    title: secondary ? 'Chervil — New Window' : 'Chervil',
    // Chervil has its own chrome (tabs, omnibar), so hide the native menu bar by
    // default. A minimal menu (set below) keeps standard accelerators; Alt reveals it.
    autoHideMenuBar: true,
    // Sprig as the window/taskbar icon (multi-resolution .ico).
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Enables the <webview> tag used to embed real websites.
      webviewTag: true,
      // Keep the renderer's Living-page timers firing at full rate when the window
      // is minimized or hidden (Chromium otherwise throttles background timers) so
      // background auto-refresh actually runs while the app sits in the background.
      backgroundThrottling: false,
    },
  });

  win.loadFile(path.join(__dirname, '..', 'src', 'index.html'));
  win.setMenuBarVisibility(false);
  buildAppMenu();

  // Native right-click menus for the app UI (and any embedded real sites).
  attachContextMenu(win.webContents, { isMainUI: true });
  // Inject the login-capture preload into every guest <webview> (RFC 0008 8.3).
  // It runs isolated, exposes nothing to the page, and only messages the host.
  win.webContents.on('will-attach-webview', (_e, webPreferences) => {
    webPreferences.preload = path.join(__dirname, 'webview-preload.js');
  });
  win.webContents.on('did-attach-webview', (_e, wc) => {
    attachContextMenu(wc, { isMainUI: false });
    setupGuestSession(wc.session, win);
    // Popups / new windows from embedded real sites (RFC 0011 A1). Without this,
    // window.open() and target="_blank" silently do nothing — which breaks
    // Google/Microsoft OAuth sign-in. Two cases:
    //   • "open in new tab" links (foreground/background-tab) → a new Chervil tab.
    //   • window.open(...) popups (OAuth/login) → a real child window, so the
    //     opener relationship (postMessage + window.close) survives and the flow
    //     completes. It shares the webview's session, so cookies/login carry over.
    wc.setWindowOpenHandler(({ url, disposition }) => {
      if (!/^https?:\/\//i.test(url)) return { action: 'deny' };
      if (disposition === 'foreground-tab' || disposition === 'background-tab') {
        if (!win.isDestroyed()) win.webContents.send('chervil:open-tab-url', url);
        return { action: 'deny' };
      }
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 600,
          height: 720,
          autoHideMenuBar: true,
          // plugins: render PDFs inline in popups (OAuth flows sometimes surface docs).
          webPreferences: { contextIsolation: true, nodeIntegration: false, plugins: true },
        },
      };
    });
    // The allowed popup is a real child window; give it the same chrome (no menu,
    // native context menu, downloads-to-folder) as embedded sites.
    wc.on('did-create-window', (child) => {
      try {
        child.setMenuBarVisibility(false);
        attachContextMenu(child.webContents, { isMainUI: false });
        attachDownloadHandler(child.webContents.session);
      } catch { /* best effort */ }
    });
  });

  // Permission model for the embedded <webview>:
  //  • Chervil's own UI (file://) always gets the mic — that's voice input.
  //  • Benign browsing permissions (fullscreen, pointer lock, …) stay allowed so
  //    embedded real sites work.
  //  • Sensitive permissions (camera/mic, location, notifications) on a REMOTE
  //    site are decided PER SITE: honor a saved choice, otherwise prompt once and
  //    remember it. This lets Chervil be someone's only browser without handing
  //    every page the camera. Anything else is denied.
  attachPermissionHandlers(win.webContents.session, win);

  if (secondary) {
    // Ephemeral: no session persistence (see the primary gate in load/save-state),
    // so it can't clobber the saved session. Closing it just disposes the window.
    return win;
  }

  mainWindow = win;
  primaryWcId = win.webContents.id;
  // Close to tray instead of quitting, so the global hotkey (and background work)
  // keep running. A real quit goes through the tray menu (which sets isQuitting).
  win.on('close', (e) => {
    if (!isQuitting) { e.preventDefault(); win.hide(); }
  });

  // Uncomment to debug the renderer.
  // win.webContents.openDevTools({ mode: 'detach' });
  return win;
}

// --- Floating quick-ask (global hotkey) + system tray -------------------------

function showMain() {
  if (!mainWindow || mainWindow.isDestroyed()) { createWindow(); return; }
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

// Deliver a prompt to the main window's composer. If the window is still
// loading (cold start / just created), wait until its renderer is ready —
// otherwise the message is sent before onQuickPrompt is registered and lost.
function deliverPrompt(prompt, opts) {
  if (!mainWindow || mainWindow.isDestroyed()) createWindow();
  showMain();
  const wc = mainWindow.webContents;
  if (wc.isLoading()) {
    wc.once('did-finish-load', () => {
      if (!wc.isDestroyed()) wc.send('chervil:quick-prompt', prompt, opts);
    });
  } else {
    wc.send('chervil:quick-prompt', prompt, opts);
  }
}

// "Send to phone": render any URL/number as a QR the user scans with their phone.
ipcMain.handle('chervil:qr', async (_event, text) => {
  try {
    const dataUrl = await QRCode.toDataURL(String(text || ''), { width: 320, margin: 1, color: { dark: '#0b0e13', light: '#ffffff' } });
    return { ok: true, dataUrl };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Dial a phone number through the desktop's tel: handler (Phone Link, Skype, etc.).
ipcMain.handle('chervil:dial', async (_event, tel) => {
  const t = String(tel || '');
  if (!/^tel:[+\d().\-\s]+$/i.test(t)) return { ok: false, error: 'Not a phone number.' };
  try { await shell.openExternal(t); return { ok: true }; }
  catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});

// Open a web URL in the user's real browser (for Settings/account links).
ipcMain.handle('chervil:open-external', async (_event, url) => {
  const u = String(url || '');
  if (!/^https?:\/\//i.test(u)) return { ok: false, error: 'Not a web URL.' };
  try { await shell.openExternal(u); return { ok: true }; }
  catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});

// Guarded OS write-actions (RFC 0006 Track B). Renderer gates with a confirm, but
// the main process independently allowlists each type — no arbitrary command/app
// execution is reachable.
ipcMain.handle('chervil:os-action', async (_event, payload) => {
  const type = payload && payload.type;
  const args = (payload && payload.args) || {};
  try {
    if (type === 'open_url') {
      const u = String(args.url || '');
      if (!/^https?:\/\//i.test(u)) return { ok: false, error: 'Not a web URL.' };
      await shell.openExternal(u);
      return { ok: true };
    }
    if (type === 'open_downloads') {
      const err = await shell.openPath(app.getPath('downloads'));
      return err ? { ok: false, error: err } : { ok: true };
    }
    return { ok: false, error: 'Unknown OS action.' };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// App version for the sandboxed preload (it can't read package.json directly).
ipcMain.on('chervil:get-version', (event) => { event.returnValue = app.getVersion(); });

// --- Check for updates -----------------------------------------------------
// Chervil ships as a GitHub Release (an Inno Setup installer); there's no silent
// auto-updater yet (that wants signed builds). This checks the latest release tag
// against the running version and tells the renderer where to download a newer
// one — the user opens the installer in their browser. Failures are returned,
// never thrown.
const RELEASES_API = 'https://api.github.com/repos/chervil-ai/chervil/releases/latest';
const RELEASES_PAGE = 'https://github.com/chervil-ai/chervil/releases/latest';

function parseSemver(v) {
  const m = String(v || '').trim().replace(/^v/i, '').match(/^(\d+)\.(\d+)\.(\d+)/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}
// 1 if a>b, -1 if a<b, 0 if equal or either is unparseable.
function compareSemver(a, b) {
  const pa = parseSemver(a), pb = parseSemver(b);
  if (!pa || !pb) return 0;
  for (let i = 0; i < 3; i++) { if (pa[i] !== pb[i]) return pa[i] > pb[i] ? 1 : -1; }
  return 0;
}

ipcMain.handle('chervil:check-for-updates', async () => {
  const current = app.getVersion();
  try {
    const res = await fetch(RELEASES_API, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': `Chervil/${current}` },
    });
    if (!res.ok) return { ok: false, error: `Update check failed (${res.status}).`, current };
    const data = await res.json().catch(() => ({}));
    const latest = String(data.tag_name || data.name || '').replace(/^v/i, '');
    if (!latest) return { ok: false, error: 'Could not read the latest version.', current };
    const hasUpdate = compareSemver(latest, current) > 0;
    // Prefer the Windows installer asset; fall back to the release page.
    let url = data.html_url || RELEASES_PAGE;
    const asset = Array.isArray(data.assets)
      ? data.assets.find((a) => /Setup.*\.exe$/i.test((a && a.name) || ''))
      : null;
    if (asset && asset.browser_download_url) url = asset.browser_download_url;
    return { ok: true, current, latest, hasUpdate, url };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err), current };
  }
});

// Account status for Settings → You (publish-token auth → { pro, username }).
ipcMain.handle('chervil:account-status', async (_event, payload) => {
  try {
    const token = payload && payload.token;
    if (!token) return { ok: false, error: 'No token' };
    const base = String((payload && payload.baseUrl) || 'https://getchervil.com').replace(/\/+$/, '');
    const res = await fetch(`${base}/api/account`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error || `Account check failed (${res.status}).` };
    return { ok: true, pro: !!data.pro, username: data.username || null };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Deliver an imported page doc to the renderer (chervil://import deep link).
function deliverImportDoc(doc) {
  if (!mainWindow || mainWindow.isDestroyed()) createWindow();
  showMain();
  const wc = mainWindow.webContents;
  const send = () => { if (!wc.isDestroyed()) wc.send('chervil:import-page', doc); };
  if (wc.isLoading()) wc.once('did-finish-load', send); else send();
}

// Pull a shared page into Chervil from a published getchervil.com URL: fetch the
// page and extract the portable source the publisher embedded (a JSON <script
// id="chervil-source">). Only http(s) — never file:// or other schemes.
async function importFromPublishedUrl(pageUrl) {
  try {
    const u = new URL(pageUrl);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return;
    const resp = await fetch(pageUrl, { redirect: 'follow' });
    if (!resp.ok) { deliverPrompt(`I couldn't open that Chervil page to import (HTTP ${resp.status}).`); return; }
    const html = await resp.text();
    const m = html.match(/<script[^>]*id=["']chervil-source["'][^>]*>([\s\S]*?)<\/script>/i);
    if (!m) { deliverPrompt(`That page isn't a shareable Chervil page (no embedded source). You can still ask me about it: ${pageUrl}`); return; }
    let doc;
    try { doc = JSON.parse(m[1].replace(/\\u003c/g, '<')); } catch { doc = null; }
    if (!doc || doc.format !== 'chervil-page') { deliverPrompt(`That page's embedded Chervil source was unreadable: ${pageUrl}`); return; }
    deliverImportDoc(doc);
  } catch {
    deliverPrompt(`I couldn't import that Chervil page: ${pageUrl}`);
  }
}

// Deliver an imported agent doc to the renderer (chervil://import-agent).
function deliverImportAgent(doc) {
  if (!mainWindow || mainWindow.isDestroyed()) createWindow();
  showMain();
  const wc = mainWindow.webContents;
  const send = () => { if (!wc.isDestroyed()) wc.send('chervil:import-agent', doc); };
  if (wc.isLoading()) wc.once('did-finish-load', send); else send();
}

// Import an agent into Chervil from a getchervil.com agent URL (RFC 0012). The URL
// returns the importable agent doc as JSON. http(s) only.
async function importAgentFromUrl(agentUrl) {
  try {
    const u = new URL(agentUrl);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return;
    const resp = await fetch(agentUrl, { headers: { Accept: 'application/json' }, redirect: 'follow' });
    if (!resp.ok) { deliverPrompt(`I couldn't import that agent (HTTP ${resp.status}).`); return; }
    const doc = await resp.json().catch(() => null);
    if (!doc || doc.format !== 'chervil-agent' || !doc.agent || !doc.agent.persona) {
      deliverPrompt(`That link isn't an importable Chervil agent: ${agentUrl}`);
      return;
    }
    deliverImportAgent(doc);
  } catch {
    deliverPrompt(`I couldn't import that Chervil agent: ${agentUrl}`);
  }
}

// Handle a chervil:// deep link from the browser extension (or anywhere):
//   chervil://ask?url=<page>&title=<title>&text=<selection>
//   chervil://import?u=<published page URL>
//   chervil://import-agent?u=<agent JSON URL>
function handleChervilUrl(raw) {
  let prompt = '';
  let quickOpts;
  try {
    const u = new URL(raw);
    if (u.protocol !== 'chervil:') return;
    // Import a published page into this Chervil instance to remix.
    if (u.hostname === 'import' || u.pathname === '//import' || u.pathname === 'import') {
      const src = (u.searchParams.get('u') || u.searchParams.get('url') || '').trim();
      if (src) importFromPublishedUrl(src);
      return;
    }
    // Import a published agent (RFC 0012).
    if (u.hostname === 'import-agent' || u.pathname === '//import-agent' || u.pathname === 'import-agent') {
      const src = (u.searchParams.get('u') || u.searchParams.get('url') || '').trim();
      if (src) importAgentFromUrl(src);
      return;
    }
    const text = (u.searchParams.get('text') || '').trim();
    const url = (u.searchParams.get('url') || '').trim();
    const title = (u.searchParams.get('title') || '').trim();
    const action = (u.searchParams.get('action') || '').trim().toLowerCase();
    const mode = (u.searchParams.get('mode') || '').trim().toLowerCase();
    const where = title ? `${title} (${url})` : url;
    const from = url ? `\n\n— from ${where}` : '';
    if (text) {
      // Selection-based actions.
      if (action === 'explain') prompt = `Explain this clearly and simply, for a general reader:\n\n“${text}”${from}`;
      else if (action === 'keypoints') prompt = `Pull out the key points as a tight bulleted list:\n\n“${text}”${from}`;
      else prompt = url ? `${text}${from}` : text;
    } else if (url) {
      // Page/link actions.
      if (mode === 'chat') prompt = `About this web page: ${where}`;
      else if (action === 'keypoints') prompt = `Pull out the key points / TL;DR of this web page as a tight bulleted list: ${where}`;
      else prompt = `Summarize this web page and pull out the key points: ${where}`;
    }
    // mode=chat asks Chervil conversationally (no page composed) — flag it so the
    // renderer routes this one turn to chat without flipping the global toggle.
    if (mode === 'chat') quickOpts = { chat: true };
  } catch { /* malformed link */ }
  if (prompt) deliverPrompt(prompt, quickOpts);
}

function createQuickWindow() {
  quickWindow = new BrowserWindow({
    width: 640,
    height: 96,
    frame: false,
    resizable: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'quick-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  quickWindow.loadFile(path.join(__dirname, '..', 'src', 'quick.html'));
  // Spotlight behavior: clicking away (blur) dismisses it.
  quickWindow.on('blur', () => { if (quickWindow && quickWindow.isVisible()) quickWindow.hide(); });
  quickWindow.on('close', (e) => { if (!isQuitting) { e.preventDefault(); quickWindow.hide(); } });
}

// Compact ask bar vs the expanded inline-chat panel.
const QUICK_ASK_H = 96;
const QUICK_CHAT_H = 468;

function showQuick() {
  if (!quickWindow || quickWindow.isDestroyed()) createQuickWindow();
  const area = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea;
  const w = 640;
  const h = quickChatMode ? QUICK_CHAT_H : QUICK_ASK_H;
  quickWindow.setBounds({
    x: Math.round(area.x + (area.width - w) / 2),
    y: Math.round(area.y + area.height * 0.18),
    width: w,
    height: h,
  });
  quickWindow.show();
  quickWindow.focus();
  if (!quickWindow.webContents.isDestroyed()) quickWindow.webContents.send('chervil:quick-show', { chat: quickChatMode });
}

// Grow/shrink the floating window in place when it flips between ask and chat.
function resizeQuick() {
  if (!quickWindow || quickWindow.isDestroyed() || !quickWindow.isVisible()) return;
  const b = quickWindow.getBounds();
  const h = quickChatMode ? QUICK_CHAT_H : QUICK_ASK_H;
  if (b.height !== h) quickWindow.setBounds({ x: b.x, y: b.y, width: b.width, height: h });
}

function hideQuick() { if (quickWindow && !quickWindow.isDestroyed()) quickWindow.hide(); }

function toggleQuick() {
  if (quickWindow && quickWindow.isVisible()) hideQuick();
  else { quickChatMode = false; showQuick(); } // hotkey / tray "Quick ask" always opens the compact ask bar
}

function createTray() {
  try {
    tray = new Tray(path.join(__dirname, '..', 'build', 'icon.ico'));
  } catch {
    return; // no tray icon available — skip gracefully
  }
  tray.setToolTip('Chervil');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open Chervil', click: showMain },
    { label: 'Quick ask  (Ctrl+Shift+Space)', click: toggleQuick },
    { type: 'separator' },
    {
      label: 'Launch at login',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      // Start hidden in the tray when auto-launched at sign-in (see createWindow).
      click: (item) => app.setLoginItemSettings({ openAtLogin: item.checked, args: ['--hidden'] }),
    },
    { type: 'separator' },
    { label: 'Quit Chervil', click: () => { isQuitting = true; app.quit(); } },
  ]));
  tray.on('click', showMain);
}

// The floating quick-ask hands its prompt to the main window (new tab + compose).
ipcMain.on('chervil:quick-hide', () => hideQuick());
ipcMain.on('chervil:quick-submit', (_event, text) => {
  hideQuick();
  const t = String(text || '').trim();
  if (!t) return;
  showMain();
  if (mainWindow && !mainWindow.webContents.isDestroyed()) {
    mainWindow.webContents.send('chervil:quick-prompt', t);
  }
});

// Inline chat from the floating quick-ask panel. Rather than duplicate the
// renderer's provider config (keys, model, profile, agent pins), we run the turn
// THROUGH the main renderer's chat path and relay the reply back — so the quick
// chat behaves exactly like the in-app chat and the conversation is already in the
// renderer for a later "Open in Chervil" handoff. Request/response is matched by id.
let quickChatSeq = 0;
const quickChatPending = new Map();
ipcMain.handle('chervil:quick-chat', (_event, payload) => new Promise((resolve) => {
  if (!mainWindow || mainWindow.webContents.isDestroyed()) { resolve({ ok: false, error: 'Chervil isn’t ready yet.' }); return; }
  const id = ++quickChatSeq;
  // Don't leave the floating window spinning forever if the renderer never answers;
  // clear this timer on the normal reply path so it doesn't linger 2 minutes.
  const timer = setTimeout(() => {
    if (quickChatPending.has(id)) { quickChatPending.delete(id); resolve({ ok: false, error: 'Sprig took too long to reply.' }); }
  }, 120000);
  quickChatPending.set(id, { resolve, timer });
  mainWindow.webContents.send('chervil:quick-chat-run', { id, query: String((payload && payload.query) || '') });
}));
ipcMain.on('chervil:quick-chat-reply', (_event, res) => {
  const r = res || {};
  const pending = quickChatPending.get(r.id);
  if (pending) { quickChatPending.delete(r.id); clearTimeout(pending.timer); pending.resolve(r); }
});

// The floating panel toggled between ask and chat — grow/shrink the window.
ipcMain.on('chervil:quick-mode', (_event, chat) => {
  quickChatMode = !!chat;
  resizeQuick();
});

// "Open in Chervil" — hand the running quick conversation to the main window, then
// reset the floating panel so a later handoff can't re-duplicate the same history.
ipcMain.on('chervil:quick-open-in-app', () => {
  hideQuick();
  if (quickWindow && !quickWindow.webContents.isDestroyed()) quickWindow.webContents.send('chervil:quick-reset');
  showMain();
  if (mainWindow && !mainWindow.webContents.isDestroyed()) mainWindow.webContents.send('chervil:quick-open-in-app');
});

// "New chat" in the floating panel — clear the renderer's quick-chat history too.
ipcMain.on('chervil:quick-clear', () => {
  if (mainWindow && !mainWindow.webContents.isDestroyed()) mainWindow.webContents.send('chervil:quick-clear');
});

// Open a share composer (Fedica, AddToAny, …) in a small popup window like the
// Chrome/Edge extensions do, instead of a full tab. It uses the DEFAULT session, so
// it shares cookies with normal live tabs — the user's logged-in Fedica/etc. carries
// over. A single popup is reused so repeated shares don't stack windows.
let sharePopupWindow = null;
ipcMain.on('chervil:open-share-popup', (_event, payload) => {
  const url = String((payload && payload.url) || '');
  if (!/^https?:\/\//i.test(url)) return;
  const width = Math.max(360, Math.min(1200, Math.round((payload && payload.width) || 620)));
  const height = Math.max(360, Math.min(1000, Math.round((payload && payload.height) || 640)));
  if (sharePopupWindow && !sharePopupWindow.isDestroyed()) {
    sharePopupWindow.setContentSize(width, height);
    sharePopupWindow.loadURL(url);
    sharePopupWindow.show();
    sharePopupWindow.focus();
    return;
  }
  sharePopupWindow = new BrowserWindow({
    width,
    height,
    title: 'Share',
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
    autoHideMenuBar: true,
    minimizable: false,
    maximizable: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false }, // default session → logged-in cookies
  });
  // Fedica's composer (and many web editors) register a `beforeunload` guard for an
  // unfinished post. Electron's default is to SILENTLY block the window close when
  // that guard fires — so the ✕ appears dead. Bypass it so the user can always close
  // the share popup (calling preventDefault here lets the unload proceed). This also
  // keeps the reused-window loadURL() from being blocked when a composer is still open.
  sharePopupWindow.webContents.on('will-prevent-unload', (event) => { event.preventDefault(); });
  // Govern window.open()/target=_blank from the composer: this window rides the
  // default (logged-in) session, so don't let a composer page spawn chromeless child
  // windows on it. Route http(s) opens into a normal (governed) Chervil tab; deny the rest.
  sharePopupWindow.webContents.setWindowOpenHandler(({ url: openUrl }) => {
    if (/^https?:\/\//i.test(String(openUrl || ''))) openExternalHttpUrl(openUrl);
    return { action: 'deny' };
  });
  sharePopupWindow.on('closed', () => { sharePopupWindow = null; });
  sharePopupWindow.loadURL(url);
});

// --- "Hey Sprig" wake mode --------------------------------------------------
// Wake-word detection runs in the main renderer (openWakeWord, on-device). When it
// fires, the renderer pops the Quick-Ask bar as a "listening" affordance, then
// captures + transcribes the spoken command itself and composes via the normal path.
ipcMain.on('chervil:wake-listening', () => {
  quickChatMode = false; // a spoken "Hey Sprig" request composes — show the compact ask bar, not the chat panel
  showQuick();
  if (quickWindow && !quickWindow.webContents.isDestroyed()) {
    quickWindow.webContents.send('chervil:quick-listening');
  }
});
ipcMain.on('chervil:wake-done', () => hideQuick());
ipcMain.on('chervil:show-main', () => showMain());

// openWakeWord runs in the renderer on onnxruntime-web. fetch() is blocked on
// file://, so we hand the renderer the ort WASM runtime + shared feature models as
// raw bytes (Buffers ride the IPC structured clone) and it loads them in-memory.
const OWW_DIR = path.join(__dirname, '..', 'src', 'vendor', 'oww');
ipcMain.handle('chervil:wake-assets', async () => {
  try {
    return {
      ok: true,
      ortWasm: fs.readFileSync(path.join(OWW_DIR, 'ort-wasm-simd-threaded.wasm')),
      melspec: fs.readFileSync(path.join(OWW_DIR, 'melspectrogram.onnx')),
      embedding: fs.readFileSync(path.join(OWW_DIR, 'embedding_model.onnx')),
    };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// A keyword model's bytes: a bundled built-in, or the imported custom one.
const OWW_BUILTINS = { hey_sprig: 'hey_sprig_v0.1.onnx', hey_jarvis: 'hey_jarvis_v0.1.onnx', alexa: 'alexa_v0.1.onnx', hey_mycroft: 'hey_mycroft_v0.1.onnx' };
ipcMain.handle('chervil:wake-keyword-model', async (_event, name) => {
  try {
    const p = name === 'custom'
      ? path.join(app.getPath('userData'), 'wake-custom.onnx')
      : path.join(OWW_DIR, OWW_BUILTINS[name] || OWW_BUILTINS.hey_sprig);
    if (!fs.existsSync(p)) return { ok: false, error: 'Wake-word model not found.' };
    return { ok: true, model: fs.readFileSync(p) };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Import a custom openWakeWord keyword model (.onnx) — copy it into userData.
ipcMain.handle('chervil:open-wake-keyword', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: 'Load wake-word model',
    properties: ['openFile'],
    filters: [{ name: 'openWakeWord model', extensions: ['onnx'] }],
  });
  if (canceled || !filePaths || !filePaths[0]) return { ok: false, canceled: true };
  try {
    const name = path.basename(filePaths[0]).replace(/\.[^.]+$/, '');
    fs.copyFileSync(filePaths[0], path.join(app.getPath('userData'), 'wake-custom.onnx'));
    return { ok: true, name };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Single-instance + chervil:// protocol (so the browser extension can open the
// app). A second launch (e.g. from a deep link) focuses the running app and
// passes its URL via 'second-instance' instead of starting a new window.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', (_e, argv) => {
    showMain();
    const deep = argv.find((a) => String(a).startsWith('chervil://'));
    if (deep) { handleChervilUrl(deep); return; }
    // Default-browser: a link opened from another app arrives as an argv URL.
    const web = argv.find((a) => /^https?:\/\//i.test(String(a)));
    if (web) openExternalHttpUrl(web);
  });
}
app.on('open-url', (e, url) => { // macOS
  e.preventDefault();
  if (String(url).startsWith('chervil://')) handleChervilUrl(url);
  else openExternalHttpUrl(url);
});
if (process.defaultApp) {
  // Dev (running `electron .`): register with the explicit exec path + script.
  if (process.argv.length >= 2) app.setAsDefaultProtocolClient('chervil', process.execPath, [path.resolve(process.argv[1])]);
} else {
  app.setAsDefaultProtocolClient('chervil');
}

app.whenReady().then(() => {
  // Windows prints the AppUserModelID verbatim as the toast/notification source
  // *unless* an installed Start Menu shortcut maps that ID to a display name. We
  // ship from source (no installer/shortcut yet), so use a human-readable ID —
  // otherwise toasts read "com.chervil.app" instead of "Chervil". When a packaged
  // installer lands, set this to match the shortcut's AUMID.
  if (process.platform === 'win32') {
    app.setName('Chervil');
    app.setAppUserModelId('Chervil');
  }
  loadSavedKeys();
  setupAdblock(); // install the (opt-in) ad/tracker request filter on the default session
  setupSpellcheck(); // pin the spell-check dictionary to the OS locale (renderer syncs the on/off toggle)
  applyFirstRunProvisioning(); // import installer wizard choices on first launch
  // Silent startup: when Windows launches Chervil at sign-in (registry Run key
  // adds "--hidden"; the tray toggle does the same), start minimized to the tray
  // rather than surfacing the window. Also honor Electron's own login detection.
  let openedAtLogin = false;
  try { openedAtLogin = app.getLoginItemSettings().wasOpenedAtLogin; } catch { /* not supported */ }
  const launchedHidden = process.argv.includes('--hidden') || process.argv.includes('--startup');
  createWindow({ startHidden: launchedHidden || openedAtLogin });
  createTray();
  // Keep the browser registration fresh (the exe path moves across updates) so
  // Chervil stays selectable in Default apps. Fire-and-forget, packaged Windows only.
  registerAsBrowser().catch(() => {});
  // Cold start via a chervil:// deep link (URL passed in argv on first launch).
  const startUrl = process.argv.find((a) => String(a).startsWith('chervil://'));
  if (startUrl) handleChervilUrl(startUrl); // deliverPrompt waits for the renderer
  // Cold start as the default browser (a link launched us with an http(s) argv).
  const startWeb = process.argv.find((a) => /^https?:\/\//i.test(String(a)));
  if (startWeb) openExternalHttpUrl(startWeb);
  // System-wide hotkey to summon the floating quick-ask, even when Chervil isn't focused.
  globalShortcut.register('CommandOrControl+Shift+Space', toggleQuick);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else showMain();
  });
});

app.on('before-quit', () => { isQuitting = true; });
app.on('will-quit', () => { globalShortcut.unregisterAll(); });

app.on('window-all-closed', () => {
  // Stay resident in the tray; quit only via the tray menu (which sets isQuitting).
  if (isQuitting && process.platform !== 'darwin') app.quit();
});

/**
 * The renderer asks a question; we run the agent and stream progress back.
 * Returns the final result object: a generated page or a navigation directive.
 */
// In-flight ask() and build-skill() requests, keyed by requestId, so the renderer
// can abort them (Stop). Shared so one abort channel covers both.
const askAborters = new Map();

ipcMain.handle('chervil:ask', async (event, payload) => {
  const { query, history, requestId, pageContext, allowNavigate, refineMode, spaceContext, recallContext, recallMode, deep, verify, profile, pageStyle, attachments, mcpServers, agent } =
    payload || {};
  const send = (channel, data) => {
    if (!event.sender.isDestroyed()) event.sender.send(channel, data);
  };

  // Allow the renderer to cancel this request mid-flight (Stop button).
  const aborter = new AbortController();
  if (requestId) askAborters.set(requestId, aborter);

  try {
    const result = await runAgent({
      query,
      history: Array.isArray(history) ? history : [],
      signal: aborter.signal,
      // Stream events are tagged with requestId so the renderer can route them to the
      // right tab — multiple tabs can generate concurrently.
      onStatus: (status) => send('chervil:status', { requestId, status }),
      onText: (delta) => send('chervil:chunk', { requestId, delta }),
      pageContext: pageContext || null,
      allowNavigate: allowNavigate !== false,
      refineMode: refineMode || null,
      spaceContext: spaceContext || null,
      recallContext: recallContext || null,
      recallMode: recallMode === 'synthesize' ? 'synthesize' : 'find',
      deep: deep === true,
      verify: verify === true,
      profile: typeof profile === 'string' ? profile : null,
      pageStyle: typeof pageStyle === 'string' ? pageStyle : 'balanced',
      attachments: Array.isArray(attachments) ? attachments : [],
      mcpServers: Array.isArray(mcpServers) ? mcpServers : [],
      agent: typeof agent === 'string' ? agent : null,
      config: providerConfigFrom(payload),
    });
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  } finally {
    if (requestId) askAborters.delete(requestId);
  }
});

// Renderer → "Stop" the in-flight compose for a requestId.
ipcMain.on('chervil:abort', (_event, requestId) => {
  const a = askAborters.get(requestId);
  if (a) { try { a.abort(); } catch { /* ignore */ } askAborters.delete(requestId); }
});

// --- Applet bridge: a composed page asks Sprig for live data -------------
ipcMain.handle('chervil:applet-ask', async (_event, payload) => {
  try {
    const { prompt } = payload || {};
    const res = await runAppletAsk({ prompt, config: providerConfigFrom(payload) });
    return { ok: true, text: res.text, sources: res.sources || [] };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Applet widget builder: compose a self-contained interactive widget (HTML)
ipcMain.handle('chervil:compose-applet', async (_event, payload) => {
  try {
    const { prompt } = payload || {};
    const res = await runComposeApplet({ prompt, config: providerConfigFrom(payload) });
    return { ok: true, html: res.html };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- AI hero image for composed pages (opt-in; BYO image key) --------------
ipcMain.handle('chervil:generate-hero', async (_event, payload) => {
  try {
    const { title, topic } = payload || {};
    const dataUrl = await generateHeroImage({
      title: title || topic || '',
      topic: topic || '',
      openaiKey: savedKeys.openai || '',
      geminiKey: savedKeys.gemini || '',
      grokKey: savedKeys.grok || '',
    });
    if (!dataUrl) return { ok: false, error: 'no-image-key' };
    return { ok: true, dataUrl };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// AI image edit for the in-Chervil snip editor (BYO Grok/OpenAI/Gemini key).
ipcMain.handle('chervil:edit-image', async (_event, payload) => {
  try {
    const { imageDataUrl, instruction } = payload || {};
    if (!imageDataUrl || !instruction) return { ok: false, error: 'missing-args' };
    const dataUrl = await editImage({
      imageDataUrl,
      instruction: String(instruction).slice(0, 2000),
      grokKey: savedKeys.grok || '',
      openaiKey: savedKeys.openai || '',
      geminiKey: savedKeys.gemini || '',
      resolution: payload && payload.resolution === '2k' ? '2k' : '',
    });
    if (!dataUrl) return { ok: false, error: 'no-image-key' };
    return { ok: true, dataUrl };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Open an image (data: URL) in the Windows-registered image viewer: write it to
// a temp file and hand it to the shell.
ipcMain.handle('chervil:open-image', async (_event, payload) => {
  try {
    const { dataUrl, name } = payload || {};
    const m = /^data:([^;]+);base64,(.*)$/.exec(String(dataUrl || ''));
    if (!m || !m[2]) return { ok: false, error: 'bad-image' };
    const dir = path.join(os.tmpdir(), 'chervil-snips');
    fs.mkdirSync(dir, { recursive: true });
    const safe = String(name || 'snip.png').replace(/[^\w.-]+/g, '_').replace(/^_+/, '') || 'snip.png';
    const file = path.join(dir, safe);
    fs.writeFileSync(file, Buffer.from(m[2], 'base64'));
    const err = await shell.openPath(file);
    if (err) return { ok: false, error: err };
    return { ok: true, file };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Whether an image-capable key (OpenAI, Gemini, or Grok) is configured —
// Settings uses this to show the hero-image toggle's availability.
ipcMain.handle('chervil:image-key-status', async () => {
  return {
    ok: true,
    hasKey: !!(savedKeys.openai || savedKeys.gemini || savedKeys.grok),
    openai: !!savedKeys.openai,
    gemini: !!savedKeys.gemini,
    grok: !!savedKeys.grok,
  };
});

// --- Credential vault (RFC 0008, Phase 8.1): passphrase-gated password store --
// Plaintext passwords never leave the main process except creds:reveal /
// creds:get-for-origin, both of which require the vault to be UNLOCKED (the
// master passphrase was entered this session — the "gate").
ipcMain.handle('chervil:creds-status', async () => {
  try {
    const v = vault();
    return {
      ok: true,
      configured: v.isConfigured(),
      unlocked: v.isUnlocked(),
      encryptionAvailable: !!(safeStorage.isEncryptionAvailable && safeStorage.isEncryptionAvailable()),
    };
  } catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});
ipcMain.handle('chervil:creds-setup', async (_e, payload) => {
  try { await vault().setup((payload || {}).passphrase); return { ok: true }; }
  catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});
ipcMain.handle('chervil:creds-unlock', async (_e, payload) => {
  try { const ok = await vault().unlock((payload || {}).passphrase); return { ok, error: ok ? undefined : 'Wrong passphrase.' }; }
  catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});
ipcMain.handle('chervil:creds-lock', async () => { try { vault().lock(); return { ok: true }; } catch { return { ok: false }; } });
ipcMain.handle('chervil:creds-list', async () => {
  try { return { ok: true, items: vault().list() }; }
  catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});
ipcMain.handle('chervil:creds-save', async (_e, payload) => {
  try {
    const p = payload || {};
    const origin = registrableDomain(p.origin || '');
    if (!origin) return { ok: false, error: 'Enter a valid site (e.g. github.com).' };
    const res = vault().save({ id: p.id, origin, username: p.username, password: p.password, label: p.label });
    return { ok: true, id: res.id };
  } catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});
ipcMain.handle('chervil:creds-delete', async (_e, payload) => {
  try { vault().remove((payload || {}).id); return { ok: true }; }
  catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});
ipcMain.handle('chervil:creds-reveal', async (_e, payload) => {
  try { return { ok: true, ...vault().reveal((payload || {}).id) }; }
  catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});
// Is this exact captured login already saved? (no plaintext echoed) — lets the
// save-on-submit prompt skip unchanged logins.
ipcMain.handle('chervil:creds-has-exact', async (_e, payload) => {
  try {
    const p = payload || {};
    const origin = registrableDomain(p.url || p.origin || '');
    if (!origin) return { ok: true, exists: false };
    return { ok: true, exists: vault().hasExact(origin, p.username, p.password) };
  } catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});

// How many saved logins match a site (no plaintext) — for the fill affordance.
ipcMain.handle('chervil:creds-count-for-origin', async (_e, payload) => {
  try {
    const v = vault();
    const origin = registrableDomain((payload || {}).url || (payload || {}).origin || '');
    const configured = v.isConfigured();
    const unlocked = v.isUnlocked();
    const count = unlocked && origin ? v.countForOrigin(origin) : null;
    return { ok: true, configured, unlocked, origin, count };
  } catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});

// Phase 8.2 fill: matching credentials for the current site's domain.
ipcMain.handle('chervil:creds-for-origin', async (_e, payload) => {
  try {
    const origin = registrableDomain((payload || {}).url || (payload || {}).origin || '');
    if (!origin) return { ok: true, items: [] };
    return { ok: true, origin, items: vault().getForOrigin(origin) };
  } catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});

// --- Payment cards (RFC 0008, Phase 8.5): same vault, same passphrase gate -----
// The full card number leaves the main process ONLY via cards-reveal (Settings)
// and cards-for-fill (a deliberate fill gesture), both requiring an UNLOCKED
// vault. Listings carry brand + last4 only. The CVC is never stored. Card data is
// never placed in any model prompt (never touches Sprig).
ipcMain.handle('chervil:cards-list', async () => {
  try { return { ok: true, items: vault().listCards() }; }
  catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});
// Count for the fill affordance — reports configured/unlocked without needing the
// passphrase, mirroring creds-count-for-origin.
ipcMain.handle('chervil:cards-count', async () => {
  try {
    const v = vault();
    const configured = v.isConfigured();
    const unlocked = v.isUnlocked();
    return { ok: true, configured, unlocked, count: unlocked ? v.countCards() : null };
  } catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});
ipcMain.handle('chervil:cards-save', async (_e, payload) => {
  try {
    const p = payload || {};
    const res = vault().saveCard({ id: p.id, cardholder: p.cardholder, number: p.number, expMonth: p.expMonth, expYear: p.expYear, label: p.label });
    return { ok: true, id: res.id };
  } catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});
ipcMain.handle('chervil:cards-delete', async (_e, payload) => {
  try { vault().removeCard((payload || {}).id); return { ok: true }; }
  catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});
ipcMain.handle('chervil:cards-reveal', async (_e, payload) => {
  try { return { ok: true, ...vault().revealCard((payload || {}).id) }; }
  catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});
ipcMain.handle('chervil:cards-for-fill', async (_e, payload) => {
  try { return { ok: true, ...vault().getCardForFill((payload || {}).id) }; }
  catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});

// --- Plain chat ("Just a chatbot" mode): a text reply, no page composed ----
ipcMain.handle('chervil:chat', async (_event, payload) => {
  try {
    const { query, history, profile, pageContext, pageMeta, tabsContext } = payload || {};
    const res = await runChat({ query, history: history || [], profile: profile || null, pageContext: pageContext || null, pageMeta: pageMeta || null, tabsContext: tabsContext || null, config: providerConfigFrom(payload) });
    return { ok: true, text: res.text, sources: res.sources || [] };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Inline page translation: translate one batch of text segments ---------
ipcMain.handle('chervil:translate', async (_event, payload) => {
  try {
    const { segments, targetLang } = payload || {};
    const out = await runTranslate({ segments: Array.isArray(segments) ? segments : [], targetLang: targetLang || 'English', config: providerConfigFrom(payload) });
    return { ok: true, segments: out };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Skills: build any registered skill (RFC 0003) -------------------------
// Generic build: getSkill → build → optional enrich (Learn's media verify) →
// toHtml. Replaces the old lesson-specific build-lesson handler.
ipcMain.handle('chervil:build-skill', async (event, payload) => {
  const { skill: skillId, input, level, goals, requestId } = payload || {};
  const send = (channel, data) => {
    if (!event.sender.isDestroyed()) event.sender.send(channel, data);
  };
  // Skills report progress over the same status channel as ask(), tagged with
  // requestId so the renderer routes it to the originating tab.
  const onStatus = (status) => send('chervil:status', { requestId, status });

  // A Compare does live web research and can run for a while — it needs the same
  // Stop affordance as a compose.
  const aborter = new AbortController();
  if (requestId) askAborters.set(requestId, aborter);

  try {
    const skill = getSkill(skillId);
    if (!skill) return { ok: false, error: 'Unknown skill.' };
    const config = providerConfigFrom(payload);
    const artifact = await skill.build({ input, level, goals, config, onStatus, signal: aborter.signal });
    if (skill.enrich) {
      onStatus({ phase: 'composing', text: 'Sprig is checking the media…' });
      await skill.enrich(artifact, config);
    }
    onStatus({ phase: 'composing', text: 'Sprig is laying out the page…' });
    return { ok: true, kind: skill.id, artifact, html: skill.toHtml(artifact) };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  } finally {
    if (requestId) askAborters.delete(requestId);
  }
});

// --- Page watchers: check one watched URL for a change / condition ----------
ipcMain.handle('chervil:watch-check', async (_event, payload) => {
  try {
    const { url, condition, lastValue } = payload || {};
    const res = await runWatchCheck({ url, condition, lastValue, config: providerConfigFrom(payload) });
    return { ok: true, ...res };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Re-render a stored skill artifact (lesson/quiz) to current HTML — a pure render
// with NO model call. Lets the app refresh items built with an older renderer
// (e.g. before interactive applets) on open, instead of replaying frozen markup.
ipcMain.handle('chervil:render-skill', (_event, payload) => {
  try {
    const { kind, artifact } = payload || {};
    const skill = getSkill(kind || 'learn');
    if (!skill) return { ok: false, error: 'Unknown skill.' };
    if (!artifact) return { ok: false, error: 'Nothing to render.' };
    return { ok: true, html: skill.toHtml(artifact) };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Pre-compute applet results with the user's LOCAL key so published/exported
// lessons are self-contained — no hosted bridge, no server-side key custody, no
// token cost (RFC 0002 / the "snapshot at publish" decision). Mutates in place.
// Bakes the full interactive WIDGET (appletHtml) the reader renders in a sandboxed
// data: iframe; falls back to a plain text answer if widget compose fails.
async function snapshotApplets(lesson, config) {
  const cards = [];
  for (const m of (lesson.modules || [])) for (const c of (m.cards || [])) {
    if (c.kind === 'applet' && c.prompt && !c.appletHtml && !c.answer) cards.push(c);
  }
  await Promise.all(cards.map(async (c) => {
    try {
      const r = await runComposeApplet({ prompt: c.prompt, config });
      if (r && r.html) { c.appletHtml = r.html; return; }
    } catch { /* fall back to a text answer */ }
    try { const r = await runAppletAsk({ prompt: c.prompt, config }); if (r && r.text) c.answer = String(r.text); }
    catch { /* leave unbaked */ }
  }));
  return lesson;
}

// Export a lesson as a standalone, swipeable mobile reader (.html) — the
// reader-mode render, self-contained for sharing/opening on a phone.
ipcMain.handle('chervil:export-lesson', async (event, payload) => {
  const artifact = (payload && (payload.artifact || payload.lesson)) || null;
  const kind = (payload && (payload.kind || (payload.lesson ? 'learn' : ''))) || 'learn';
  if (!artifact) return { ok: false, error: 'Nothing to export.' };
  const skill = getSkill(kind);
  if (!skill) return { ok: false, error: 'Unknown skill.' };
  const win = BrowserWindow.fromWebContents(event.sender);
  const safe = String((payload && payload.suggestedName) || 'chervil-' + kind)
    .replace(/[^a-z0-9\-_ ]+/gi, '').trim().slice(0, 80) || 'chervil-' + kind;
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Share (mobile)',
    defaultPath: `${safe}.html`,
    filters: [{ name: 'HTML', extensions: ['html'] }],
  });
  if (canceled || !filePath) return { ok: false, canceled: true };
  try {
    if (kind === 'learn') await snapshotApplets(artifact, providerConfigFrom(payload));
    fs.writeFileSync(filePath, skill.toHtml(artifact, { reader: true }), 'utf8');
    return { ok: true, path: filePath };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Publish a lesson to getchervil.com (Chervil Pro) --------------------
ipcMain.handle('chervil:publish-lesson', async (_event, payload) => {
  try {
    const { token, baseUrl, sourceId } = payload || {};
    const artifact = (payload && (payload.artifact || payload.lesson)) || null;
    const kind = (payload && (payload.kind || (payload.lesson ? 'learn' : ''))) || 'learn';
    if (!artifact) return { ok: false, error: 'Nothing to publish.' };
    if (!token) return { ok: false, error: 'Missing publish token.' };
    const skill = getSkill(kind);
    if (!skill) return { ok: false, error: 'Unknown skill.' };
    const base = String(baseUrl || 'https://getchervil.com').replace(/\/+$/, '');
    if (kind === 'learn') await snapshotApplets(artifact, providerConfigFrom(payload));
    const html = skill.toHtml(artifact, { reader: true });
    const res = await fetch(`${base}/api/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      // sourceId (the app's stable lesson id) makes re-publishing update the SAME
      // hosted lesson in place — same URL — instead of minting a new one each time.
      body: JSON.stringify({ artifact, kind, html, sourceId: sourceId || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 404) return { ok: false, error: 'Publishing isn’t available yet — the Chervil hosted service (getchervil.com) is still in development. (404)' };
      return { ok: false, error: data.error || `Publish failed (${res.status}).` };
    }
    return { ok: true, url: data.url, id: data.id, updated: data.updated };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Publish any composed page to getchervil.com (Chervil Pro) ----------
// Unlike publish-lesson (which renders a structured lesson/quiz artifact), this
// publishes a page's self-contained HTML as-is — any interactive component
// (clock, calculator, converter). Model-dependent applets won't run when hosted.
ipcMain.handle('chervil:publish-page', async (_event, payload) => {
  try {
    const { token, baseUrl, title, sourceId } = payload || {};
    const html = payload && payload.html;
    const kind = (payload && payload.kind) === 'blog' ? 'blog' : 'page';
    if (!html) return { ok: false, error: 'Nothing to publish.' };
    if (!token) return { ok: false, error: 'Missing publish token.' };
    const base = String(baseUrl || 'https://getchervil.com').replace(/\/+$/, '');
    const res = await fetch(`${base}/api/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      // sourceId (the app's stable page id) makes re-publishing update in place
      // and keeps the public id stable — important for cloud living-page schedules.
      body: JSON.stringify({ kind, title: title || 'Chervil page', html, sourceId: sourceId || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 404) return { ok: false, error: 'Publishing isn’t available yet — the Chervil hosted service (getchervil.com) is still in development. (404)' };
      return { ok: false, error: data.error || `Publish failed (${res.status}).` };
    }
    return { ok: true, url: data.url, id: data.id, updated: data.updated };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Publish a composed page to a self-hosted / wordpress.com blog via the WP
// REST API (blog publishing). Auth = HTTP Basic with an Application Password
// (WP 5.6+, generated by the user in wp-admin). Creates a DRAFT — the user reviews
// + Publishes in WordPress. Runs in main → no CORS. The app password arrives from
// the renderer (fetched from the encrypted vault) and is never logged.
ipcMain.handle('chervil:wp-publish', async (_event, payload) => {
  try {
    const { siteUrl, username, appPassword, title, content } = payload || {};
    if (!siteUrl || !username || !appPassword) return { ok: false, error: 'Missing WordPress site, username, or application password.' };
    if (!content) return { ok: false, error: 'Nothing to publish.' };
    const base = String(siteUrl).trim().replace(/\/+$/, '');
    if (!/^https:\/\//i.test(base)) return { ok: false, error: 'Your WordPress site URL must start with https:// (Application Passwords require HTTPS).' };
    const auth = 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64');
    const res = await fetch(`${base}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify({ title: title || 'Chervil page', content, status: 'draft' }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) return { ok: false, error: 'WordPress rejected the login — double-check the username and application password. (' + res.status + ')' };
      if (res.status === 404) return { ok: false, error: 'No WordPress REST API at that URL — is it a WordPress site with the REST API enabled? (404)' };
      return { ok: false, error: (data && data.message) || `WordPress publish failed (${res.status}).` };
    }
    const id = data && data.id;
    return { ok: true, id, link: (data && data.link) || '', editUrl: id ? `${base}/wp-admin/post.php?post=${id}&action=edit` : '' };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Publish an agent to getchervil.com (RFC 0012) — appears on the user's profile,
// importable by other Chervil users, and submittable to the Agent store.
ipcMain.handle('chervil:publish-agent', async (_event, payload) => {
  try {
    const { token, baseUrl, agent, visibility, sourceId } = payload || {};
    if (!agent || !agent.persona) return { ok: false, error: 'Nothing to publish.' };
    if (!token) return { ok: false, error: 'Missing publish token.' };
    const base = String(baseUrl || 'https://getchervil.com').replace(/\/+$/, '');
    const res = await fetch(`${base}/api/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ agent, visibility: visibility || 'public', sourceId: sourceId || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 404) return { ok: false, error: 'Publishing isn’t available yet — the Chervil hosted service is still in development. (404)' };
      return { ok: false, error: data.error || `Publish failed (${res.status}).` };
    }
    return { ok: true, url: data.url, id: data.id, updated: data.updated };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Browse the community Agent store from inside the app (RFC 0012). Public JSON
// listing; the main process fetches it (no CORS limits).
ipcMain.handle('chervil:list-store-agents', async (_event, payload) => {
  try {
    const base = String((payload && payload.baseUrl) || 'https://getchervil.com').replace(/\/+$/, '');
    const params = new URLSearchParams();
    if (payload && payload.category) params.set('category', String(payload.category));
    const resp = await fetch(`${base}/api/store/agents?${params.toString()}`, { headers: { Accept: 'application/json' } });
    if (!resp.ok) return { ok: false, error: `Couldn’t reach the store (HTTP ${resp.status}).` };
    const data = await resp.json().catch(() => ({}));
    return { ok: true, agents: Array.isArray(data.agents) ? data.agents : [] };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Import one store agent by id — reuses the chervil://import-agent fetch path
// (importAgentFromUrl → renderer onImportAgent → adds it to Agents).
ipcMain.handle('chervil:import-store-agent', async (_event, payload) => {
  try {
    const base = String((payload && payload.baseUrl) || 'https://getchervil.com').replace(/\/+$/, '');
    const id = String((payload && payload.id) || '');
    if (!id) return { ok: false, error: 'Missing agent id.' };
    await importAgentFromUrl(`${base}/api/agents/${id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Cloud living pages (RFC 0007 7.3): register/update/clear a server-side refresh
// schedule for a published page. Authed by the publish token (like publish-page).
ipcMain.handle('chervil:set-cloud-living', async (_event, payload) => {
  try {
    const { pageId, query, intervalMs, enabled, token, baseUrl } = payload || {};
    if (!token) return { ok: false, error: 'Missing publish token.' };
    if (!pageId) return { ok: false, error: 'Publish the page first.' };
    const base = String(baseUrl || 'https://getchervil.com').replace(/\/+$/, '');
    const body = enabled === false
      ? { pageId, enabled: false }
      : { pageId, query: query || '', intervalMs: intervalMs || 0 };
    const res = await fetch(`${base}/api/pages/living`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 404) return { ok: false, error: 'Cloud living pages aren’t available on this server yet.' };
      return { ok: false, error: data.error || `Failed (${res.status}).` };
    }
    return { ok: true, ...data };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Data folders (local on-ramp for RFC 0004 data sources) -------------
// Free, backend-agnostic: designate a folder (local, or a desktop-synced
// OneDrive/Google Drive folder) and pull files from it into a query's
// attachments. No upload, no indexing — that's the Pro cloud layer (RFC 0004).
const SOURCE_TEXT_EXT = new Set([
  '.txt', '.md', '.markdown', '.csv', '.tsv', '.json', '.log', '.xml',
  '.yml', '.yaml', '.html', '.htm', '.css', '.js', '.ts', '.py', '.rb',
  '.go', '.rs', '.java', '.c', '.h', '.cpp', '.sh', '.ini', '.toml', '.sql',
]);
const SOURCE_IMG_EXT = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.bmp': 'image/bmp' };
const SOURCE_PDF_EXT = '.pdf';
const SOURCE_MAX_BYTES = 12 * 1024 * 1024;   // per file, mirrors the renderer attach cap
const SOURCE_MAX_FILES = 2000;               // safety cap on a folder scan
const SOURCE_MAX_DEPTH = 6;

function isSupportedSource(name) {
  const ext = path.extname(name).toLowerCase();
  return SOURCE_TEXT_EXT.has(ext) || !!SOURCE_IMG_EXT[ext] || ext === SOURCE_PDF_EXT;
}

// Pick a folder to designate as a data source.
ipcMain.handle('chervil:pick-folder', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: 'Choose a data-source folder',
    properties: ['openDirectory'],
  });
  if (canceled || !filePaths || !filePaths.length) return { ok: false, canceled: true };
  const dir = filePaths[0];
  return { ok: true, path: dir, name: path.basename(dir) || dir };
});

// Enumerate supported files in a designated folder (recursive, capped).
ipcMain.handle('chervil:list-folder', async (_event, payload) => {
  const root = payload && payload.path;
  if (!root) return { ok: false, error: 'No folder.' };
  const out = [];
  function walk(dir, depth) {
    if (depth > SOURCE_MAX_DEPTH || out.length >= SOURCE_MAX_FILES) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }
    for (const ent of entries) {
      if (out.length >= SOURCE_MAX_FILES) break;
      if (ent.name.startsWith('.')) continue; // skip dotfiles/dirs
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) { walk(full, depth + 1); continue; }
      if (!ent.isFile() || !isSupportedSource(ent.name)) continue;
      let size = 0;
      try { size = fs.statSync(full).size; } catch { continue; }
      out.push({ name: ent.name, path: full, relPath: path.relative(root, full), size });
    }
  }
  try {
    walk(root, 0);
    out.sort((a, b) => a.relPath.localeCompare(b.relPath));
    return { ok: true, files: out, truncated: out.length >= SOURCE_MAX_FILES };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Read selected files into attachment-shaped payloads (text / image / pdf).
ipcMain.handle('chervil:read-source-files', async (_event, payload) => {
  const paths = (payload && payload.paths) || [];
  const files = [];
  const skipped = [];
  for (const p of paths) {
    const name = path.basename(p);
    const ext = path.extname(name).toLowerCase();
    let size = 0;
    try { size = fs.statSync(p).size; } catch { skipped.push(name); continue; }
    if (size > SOURCE_MAX_BYTES) { skipped.push(name); continue; }
    try {
      if (SOURCE_IMG_EXT[ext]) {
        files.push({ name, kind: 'image', data: fs.readFileSync(p).toString('base64'), mediaType: SOURCE_IMG_EXT[ext] });
      } else if (ext === SOURCE_PDF_EXT) {
        files.push({ name, kind: 'pdf', data: fs.readFileSync(p).toString('base64'), mediaType: 'application/pdf' });
      } else {
        files.push({ name, kind: 'text', text: fs.readFileSync(p, 'utf8') });
      }
    } catch { skipped.push(name); }
  }
  return { ok: true, files, skipped };
});

// --- Read-only computer info (agentic OS introspection, phase 1) ---------
// Lets a composed page call window.chervil.info() to show real machine facts
// (specs, memory, disk, uptime). READ ONLY — no settings changes, no commands.
ipcMain.handle('chervil:system-info', async () => {
  try {
    const cpus = os.cpus() || [];
    const nets = os.networkInterfaces() || {};
    const ipv4 = [];
    for (const name of Object.keys(nets)) {
      for (const ni of nets[name] || []) {
        if (ni && ni.family === 'IPv4' && !ni.internal) ipv4.push(ni.address);
      }
    }
    let disk = null;
    try {
      const st = fs.statfsSync(os.homedir());
      const total = st.blocks * st.bsize;
      const free = st.bfree * st.bsize;
      disk = { total, free, used: total - free };
    } catch { /* statfs not available on this platform/Node */ }
    let username = '';
    try { username = os.userInfo().username; } catch { /* ignore */ }
    const mem = { total: os.totalmem(), free: os.freemem() };
    return {
      ok: true,
      info: {
        platform: process.platform,
        osType: os.type(),
        osRelease: os.release(),
        arch: process.arch,
        hostname: os.hostname(),
        username,
        cpuModel: (cpus[0] && cpus[0].model ? String(cpus[0].model) : 'Unknown CPU').trim(),
        cpuCores: cpus.length,
        memory: mem,
        memoryUsedPct: mem.total ? Math.round((1 - mem.free / mem.total) * 100) : null,
        disk,
        uptimeSec: Math.round(os.uptime()),
        loadavg: typeof os.loadavg === 'function' ? os.loadavg() : [0, 0, 0],
        ipv4,
        versions: {
          chervil: app.getVersion(),
          electron: process.versions.electron,
          node: process.versions.node,
          chrome: process.versions.chrome,
        },
        capturedAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Extended OS details (read-only, Windows) ---------------------------
// Richer "Windows Settings"-style facts: OS edition/build, install date, last
// boot, Windows Update history, GPU, battery, manufacturer/model, BIOS. Gathered
// via a FIXED set of read-only PowerShell Get-* / registry reads — the model can
// only trigger this; it never supplies commands. Nothing here changes state.
const WIN_DETAILS_PS = `
$ErrorActionPreference='SilentlyContinue'
function D($d){ if($d){ try { ([datetime]$d).ToString('o') } catch { "$d" } } else { $null } }
$os=Get-CimInstance Win32_OperatingSystem
$cs=Get-CimInstance Win32_ComputerSystem
$bios=Get-CimInstance Win32_BIOS
$gpu=@(Get-CimInstance Win32_VideoController | ForEach-Object { $_.Name })
$hf=Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 1
$batt=Get-CimInstance Win32_Battery | Select-Object -First 1
$au=(New-Object -ComObject Microsoft.Update.AutoUpdate).Results
$disp=(Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion').DisplayVersion
[pscustomobject]@{
 edition=$os.Caption; displayVersion=$disp; version=$os.Version; build=$os.BuildNumber
 installDate=(D $os.InstallDate); lastBoot=(D $os.LastBootUpTime)
 manufacturer=$cs.Manufacturer; model=$cs.Model; bios=$bios.SMBIOSBIOSVersion; gpu=$gpu
 lastHotfix=$hf.HotFixID; lastHotfixDate=(D $hf.InstalledOn)
 lastUpdateInstall=(D $au.LastInstallationSuccessDate); lastUpdateCheck=(D $au.LastSearchSuccessDate)
 batteryPct=$batt.EstimatedChargeRemaining
} | ConvertTo-Json -Compress`;

function runWindowsDetails() {
  return new Promise((resolve) => {
    const b64 = Buffer.from(WIN_DETAILS_PS, 'utf16le').toString('base64');
    execFile('powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', b64],
      { windowsHide: true, timeout: 15000, maxBuffer: 2 * 1024 * 1024 },
      (err, stdout) => {
        if (err && !stdout) return resolve({ ok: false, error: `Query failed: ${err.message}` });
        try { resolve({ ok: true, details: JSON.parse(String(stdout || '{}')) }); }
        catch (e) { resolve({ ok: false, error: `Couldn't parse system details: ${e.message}` }); }
      });
  });
}

ipcMain.handle('chervil:system-details', async () => {
  if (process.platform !== 'win32') {
    return { ok: true, details: { note: 'Extended OS details are currently Windows-only.', platform: process.platform } };
  }
  try { return await runWindowsDetails(); }
  catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});

// --- System notifications: a Living page changed in the background -------
// The renderer fires this from refreshLiving when a page's content changed and
// the window isn't focused. Clicking the toast focuses Chervil and asks the
// renderer to jump to the page that updated.
ipcMain.handle('chervil:notify', async (_event, payload) => {
  try {
    if (!Notification.isSupported()) return { ok: false, error: 'unsupported' };
    const { title, body, tabId, entryId, url } = payload || {};
    const n = new Notification({
      title: String(title || 'Chervil'),
      body: String(body || ''),
      icon: path.join(__dirname, '..', 'build', 'icon.ico'),
      silent: false,
    });
    n.on('click', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
        if (!mainWindow.webContents.isDestroyed()) {
          mainWindow.webContents.send('chervil:notification-click', { tabId, entryId, url });
        }
      }
    });
    n.show();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Bring-your-own API key IPC (per provider) ---------------------------
ipcMain.handle('chervil:get-key-status', async () => {
  const status = {};
  for (const p of ['claude', 'grok', 'gemini', 'openai', 'azure', 'ollama', 'stt']) status[p] = !!savedKeys[p];
  status.claudeFromEnv = !!process.env.ANTHROPIC_API_KEY && savedKeys.claude === process.env.ANTHROPIC_API_KEY;
  return status;
});

ipcMain.handle('chervil:set-api-key', async (_event, payload) => {
  const provider = payload && typeof payload.provider === 'string' ? payload.provider : '';
  const key = payload && typeof payload.apiKey === 'string' ? payload.apiKey.trim() : '';
  return setKey(provider, key);
});

// Downloads shelf: open a downloaded file, or reveal it in the OS file manager.
ipcMain.handle('chervil:open-path', async (_event, p) => {
  try { const err = await shell.openPath(String(p || '')); return { ok: !err, error: err || undefined }; }
  catch (e) { return { ok: false, error: String((e && e.message) || e) }; }
});
ipcMain.handle('chervil:show-in-folder', async (_event, p) => {
  try { shell.showItemInFolder(String(p || '')); return { ok: true }; }
  catch (e) { return { ok: false, error: String((e && e.message) || e) }; }
});

// Ad/tracker blocking: renderer syncs the toggle on load + change; stats feed the
// Settings readout.
ipcMain.handle('chervil:set-adblock', async (_event, enabled) => { adblockEnabled = !!enabled; return { ok: true }; });
ipcMain.handle('chervil:adblock-stats', async () => ({ enabled: adblockEnabled, blocked: adblockCount }));

// Region screenshot (✂ snip): capture a rect of this window's content (DIP
// coordinates from the renderer's drag overlay). The webview path is handled
// renderer-side via webview.capturePage; this covers composed pages + app UI.
ipcMain.handle('chervil:capture-window', async (event, rect) => {
  try {
    const r = rect && rect.width >= 1 && rect.height >= 1
      ? { x: Math.max(0, Math.round(rect.x)), y: Math.max(0, Math.round(rect.y)), width: Math.round(rect.width), height: Math.round(rect.height) }
      : undefined;
    const img = await event.sender.capturePage(r);
    return { ok: true, dataUrl: img.toDataURL() };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Spell-check: red squiggles + right-click suggestions in text fields (the
// context menu already offers replaceMisspelling / Add to Dictionary — this is
// the switch that turns the underlying checker on/off for the shared session).
ipcMain.handle('chervil:set-spellcheck', async (_event, enabled) => {
  try { session.defaultSession.setSpellCheckerEnabled(!!enabled); return { ok: true }; }
  catch (e) { return { ok: false, error: String((e && e.message) || e) }; }
});

// Clear browsing data: cookies, cache, and site storage for embedded sites. This
// does NOT touch Chervil's own session/library (state file) or the password vault.
ipcMain.handle('chervil:clear-browsing-data', async () => {
  try {
    const ses = session.defaultSession;
    await ses.clearCache();
    await ses.clearStorageData({ storages: ['cookies', 'localstorage', 'indexdb', 'websql', 'serviceworkers', 'cachestorage', 'filesystem', 'shadercache'] });
    return { ok: true };
  } catch (e) { return { ok: false, error: String((e && e.message) || e) }; }
});

// Site permissions (camera/mic, location, notifications) — review & revoke from
// Settings. The prompts themselves are handled inline in the request handler.
ipcMain.handle('chervil:site-perms-list', async () => {
  try { return { ok: true, items: sitePerms().list() }; }
  catch (e) { return { ok: false, error: String((e && e.message) || e) }; }
});
ipcMain.handle('chervil:site-perms-set', async (_event, { origin, permission, decision } = {}) => {
  try { sitePerms().set(origin, permission, decision); return { ok: true }; }
  catch (e) { return { ok: false, error: String((e && e.message) || e) }; }
});
ipcMain.handle('chervil:site-perms-clear', async (_event, { origin, permission } = {}) => {
  try {
    if (origin) sitePerms().clear(origin, permission || undefined);
    else sitePerms().clearAll();
    return { ok: true };
  } catch (e) { return { ok: false, error: String((e && e.message) || e) }; }
});

// Default browser: report status, and make Chervil eligible (opening the OS picker
// where the user confirms — Windows/macOS don't let apps self-assign silently).
ipcMain.handle('chervil:default-browser-status', async () => {
  let isDefault = false;
  try { isDefault = app.isDefaultProtocolClient('https') && app.isDefaultProtocolClient('http'); } catch { /* ignore */ }
  return { isDefault, platform: process.platform, dev: !!process.defaultApp };
});
ipcMain.handle('chervil:make-default-browser', async () => {
  registerWebProtocols();
  // Publish the browser Capabilities so Chervil is actually selectable in the
  // picker, THEN open it. Deep-link to Chervil's own entry when we can (Win11
  // honors registeredAppUser; older builds ignore the query and open the list).
  let registered = false;
  if (process.platform === 'win32') {
    registered = await registerAsBrowser();
    const target = registered
      ? `ms-settings:defaultapps?registeredAppUser=${BROWSER_APPKEY}`
      : 'ms-settings:defaultapps';
    try { await shell.openExternal(target); } catch { try { await shell.openExternal('ms-settings:defaultapps'); } catch { /* ignore */ } }
  }
  let isDefault = false;
  try { isDefault = app.isDefaultProtocolClient('https') && app.isDefaultProtocolClient('http'); } catch { /* ignore */ }
  // dev builds can't self-register (execPath is electron.exe) — tell the renderer.
  return { ok: true, registered, isDefault, platform: process.platform, dev: !!process.defaultApp };
});

// Open another window (from the tab menu / an in-app button).
ipcMain.handle('chervil:new-window', async () => { createWindow({ secondary: true }); return { ok: true }; });

// Show/hide the native menu bar for the calling window (Alt still reveals it when
// hidden). Per-window so an ephemeral window can't change the primary's bar.
ipcMain.handle('chervil:set-menu-bar-visible', async (event, visible) => {
  const w = BrowserWindow.fromWebContents(event.sender);
  if (w) { w.setAutoHideMenuBar(!visible); w.setMenuBarVisibility(!!visible); }
  return { ok: true };
});

// Web-agent: decide the next action on a live site.
ipcMain.handle('chervil:agent-step', async (_event, payload) => {
  try {
    const { task, pageState, steps, plan } = payload || {};
    const action = await runAgentStep({ task, pageState, steps, plan, config: providerConfigFrom(payload) });
    return { ok: true, action };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Up-front plan for an agent task (RFC 0006 6.2): a short list of steps.
ipcMain.handle('chervil:agent-plan', async (_event, payload) => {
  try {
    const { task, pageState } = payload || {};
    const plan = await runAgentPlan({ task, pageState, config: providerConfigFrom(payload) });
    return { ok: true, plan };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Voice input: transcribe recorded mic audio (Whisper-compatible STT) --
// The renderer records the mic and sends the audio bytes here; we POST them as
// multipart/form-data to a configurable OpenAI-Whisper-compatible endpoint
// (OpenAI, Groq, Azure, or a local whisper server) using the saved 'stt' key.
ipcMain.handle('chervil:transcribe', async (_event, payload) => {
  try {
    const { audio, mimeType, filename, endpoint, model } = payload || {};
    if (!audio) return { ok: false, error: 'No audio captured.' };
    const url = (endpoint && String(endpoint).trim()) || 'https://api.openai.com/v1/audio/transcriptions';
    const key = savedKeys.stt || '';
    // Azure transcription uses an api-key header; everyone else uses Bearer.
    const isAzure = /\.azure\.com/i.test(url) || /api-version=/i.test(url);
    if (!key) {
      return { ok: false, error: 'No speech-to-text key set. Add one in Settings → Voice input.' };
    }

    const buf = Buffer.from(String(audio), 'base64');
    const form = new FormData();
    form.append('file', new Blob([buf], { type: mimeType || 'audio/webm' }), filename || 'speech.webm');
    form.append('model', (model && String(model).trim()) || 'whisper-1');
    form.append('response_format', 'json');

    const headers = isAzure ? { 'api-key': key } : { Authorization: `Bearer ${key}` };
    let res;
    try {
      res = await fetch(url, { method: 'POST', headers, body: form });
    } catch (err) {
      return { ok: false, error: `Couldn't reach the transcription service at ${url}. Check the endpoint and your network.` };
    }
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return { ok: false, error: `Transcription error ${res.status}: ${t.slice(0, 300)}` };
    }
    const j = await res.json().catch(() => null);
    const text = j && (j.text || (j.results && j.results[0] && j.results[0].text)) || '';
    return { ok: true, text: String(text).trim() };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Live model list for the Settings dropdown (free metadata call).
ipcMain.handle('chervil:list-models', async (_event, payload) => {
  try {
    const models = await runListModels({ config: providerConfigFrom(payload) });
    return { ok: true, models: Array.isArray(models) ? models : [] };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Summarize a video: fetch its transcript (YouTube captions) ----------
const { youtubeId } = require('../lib/youtube');

function fmtTime(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : String(m)) + ':' + String(s).padStart(2, '0');
}

function decodeEntities(t) {
  return String(t)
    .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
}

async function fetchYouTubeTranscript(url) {
  const id = youtubeId(url);
  if (!id) throw new Error('That doesn’t look like a YouTube video URL.');
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
  const headers = { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' };
  let html;
  try {
    html = await (await fetch(`https://www.youtube.com/watch?v=${id}&hl=en`, { headers })).text();
  } catch {
    throw new Error('Couldn’t reach YouTube.');
  }
  const titleM = html.match(/<title>([^<]*)<\/title>/);
  const title = titleM ? decodeEntities(titleM[1]).replace(/\s*-\s*YouTube\s*$/, '').trim() : 'YouTube video';
  const capM = html.match(/"captionTracks":(\[.*?\])/);
  if (!capM) throw new Error('No captions/transcript are available for this video.');
  let tracks;
  try { tracks = JSON.parse(capM[1]); } catch { throw new Error('Couldn’t parse the caption list.'); }
  if (!Array.isArray(tracks) || !tracks.length) throw new Error('This video has no captions.');
  const track = tracks.find((t) => /^en/i.test(t.languageCode || '')) || tracks[0];
  let capUrl = String(track.baseUrl || '');
  if (!capUrl) throw new Error('No caption track URL found.');
  capUrl += (capUrl.includes('?') ? '&' : '?') + 'fmt=json3';
  let data;
  try {
    data = await (await fetch(capUrl, { headers })).json();
  } catch {
    throw new Error('Couldn’t download the transcript.');
  }
  const segs = [];
  for (const ev of (data && data.events) || []) {
    if (!ev.segs) continue;
    const text = ev.segs.map((s) => s.utf8 || '').join('').replace(/\s+/g, ' ').trim();
    if (text) segs.push({ start: (ev.tStartMs || 0) / 1000, text });
  }
  if (!segs.length) throw new Error('The transcript came back empty.');
  let body = segs.map((s) => `[${fmtTime(s.start)}] ${s.text}`).join('\n');
  let truncated = false;
  if (body.length > 28000) { body = body.slice(0, 28000); truncated = true; } // keep under the text-attachment cap
  return { id, title, url: `https://www.youtube.com/watch?v=${id}`, transcript: body, truncated };
}

ipcMain.handle('chervil:video-transcript', async (_event, url) => {
  try {
    return { ok: true, ...(await fetchYouTubeTranscript(url)) };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Gemini watches a YouTube video natively (audio + visual) — no caption scraping.
async function geminiVideoSummary(url, cfg) {
  const key = cfg.apiKey;
  if (!key) throw new Error('No Gemini API key set (Settings → Provider).');
  const model = cfg.model || 'gemini-2.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const promptText = 'Watch this video and produce a faithful, detailed summary.\n'
    + 'The FIRST line must be exactly: "TITLE: <the video\'s title>".\n'
    + 'Then a 2–3 sentence overview, then "Key takeaways:" as a bullet list, then "Highlights:" '
    + 'as timestamped lines formatted "[m:ss] description" for the most important moments. '
    + 'Base everything on the actual video; do not invent.';
  const body = { contents: [{ parts: [{ fileData: { fileUri: url } }, { text: promptText }] }] };
  let res;
  try {
    res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } catch {
    throw new Error('Couldn’t reach the Gemini API.');
  }
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Gemini error ${res.status}: ${t.slice(0, 200)}`);
  }
  const j = await res.json().catch(() => null);
  const parts = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts;
  const text = Array.isArray(parts) ? parts.map((p) => p.text || '').join('').trim() : '';
  if (!text) throw new Error('Gemini returned no summary (the video may be too long, private, or unsupported).');
  let title = 'Video';
  let summary = text;
  const m = text.match(/^\s*TITLE:\s*(.+)$/im);
  if (m) { title = m[1].trim(); summary = text.replace(m[0], '').trim(); }
  return { title, summary };
}

ipcMain.handle('chervil:video-gemini', async (_event, payload) => {
  try {
    const id = youtubeId(payload && payload.url);
    if (!id) throw new Error('That doesn’t look like a YouTube video URL.');
    const cfg = providerConfigFrom(payload);
    const watch = `https://www.youtube.com/watch?v=${id}`;
    const { title, summary } = await geminiVideoSummary(watch, cfg);
    return { ok: true, title, summary, url: watch };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Import an agent file (Markdown + frontmatter) -----------------------
ipcMain.handle('chervil:open-agent-file', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: 'Import agent file',
    properties: ['openFile'],
    filters: [{ name: 'Agent files', extensions: ['md', 'markdown', 'agent', 'txt'] }],
  });
  if (canceled || !filePaths || !filePaths[0]) return { ok: false, canceled: true };
  try {
    const text = fs.readFileSync(filePaths[0], 'utf8');
    const name = path.basename(filePaths[0]).replace(/\.[^.]+$/, '');
    return { ok: true, name, text };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- List the bundled starter agent files shipped in /agents ------------
ipcMain.handle('chervil:list-starter-agents', async () => {
  try {
    const dir = path.join(__dirname, '..', 'agents');
    const files = fs.readdirSync(dir)
      .filter((f) => /\.(md|markdown)$/i.test(f) && f.toLowerCase() !== 'readme.md')
      .sort();
    return files.map((f) => ({ filename: f, text: fs.readFileSync(path.join(dir, f), 'utf8') }));
  } catch {
    return [];
  }
});

// --- Synthesize a reusable agent from a prompt session ------------------
ipcMain.handle('chervil:synthesize-agent', async (_event, payload) => {
  const { session } = payload || {};
  if (!session || !String(session).trim()) return { ok: false, error: 'Nothing to learn from yet.' };
  try {
    const agent = await runSynthesizeAgent({ session, config: providerConfigFrom(payload) });
    return { ok: true, agent };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Multi-stage agents: run one specialist's turn in a pipeline --------
ipcMain.handle('chervil:agent-turn', async (_event, payload) => {
  const { task, role, persona, prior, profile } = payload || {};
  try {
    const r = await runAgentTurn({ task, role, persona, prior, profile, config: providerConfigFrom(payload) });
    return { ok: true, text: r.text };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Orchestrated pipelines: the coordinator picks the next agent (or 'finish').
ipcMain.handle('chervil:agent-orchestrate', async (_event, payload) => {
  const { task, roster, transcript } = payload || {};
  try {
    const r = await runOrchestrator({ task, roster, transcript, config: providerConfigFrom(payload) });
    return { ok: true, next: r.next, reason: r.reason };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Export a single agent as a shareable Markdown file -----------------
ipcMain.handle('chervil:save-agent-file', async (event, payload) => {
  const { text, suggestedName } = payload || {};
  if (!text) return { ok: false, error: 'Nothing to export.' };
  const win = BrowserWindow.fromWebContents(event.sender);
  const safe = String(suggestedName || 'agent')
    .replace(/[^a-z0-9\-_ ]+/gi, '').trim().slice(0, 80) || 'agent';
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Export agent file',
    defaultPath: `${safe}.md`,
    filters: [{ name: 'Agent file', extensions: ['md', 'markdown', 'agent'] }],
  });
  if (canceled || !filePath) return { ok: false, canceled: true };
  try {
    fs.writeFileSync(filePath, text, 'utf8');
    return { ok: true, path: filePath };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Share a composed page as a portable .chervil file ------------------
// A self-contained JSON document of one composed page (html + query + sources)
// that someone else can import into their own Chervil to view and remix.
ipcMain.handle('chervil:save-page-file', async (event, payload) => {
  const { json, suggestedName } = payload || {};
  if (!json) return { ok: false, error: 'Nothing to share.' };
  const win = BrowserWindow.fromWebContents(event.sender);
  const safe = String(suggestedName || 'chervil-page')
    .replace(/[^a-z0-9\-_ ]+/gi, '').trim().slice(0, 80) || 'chervil-page';
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Share page',
    defaultPath: `${safe}.chervil`,
    filters: [{ name: 'Chervil page', extensions: ['chervil', 'json'] }],
  });
  if (canceled || !filePath) return { ok: false, canceled: true };
  try {
    fs.writeFileSync(filePath, json, 'utf8');
    return { ok: true, path: filePath };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Import a shared .chervil page file ---------------------------------
ipcMain.handle('chervil:open-page-file', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: 'Import a shared Chervil page',
    properties: ['openFile'],
    filters: [{ name: 'Chervil page', extensions: ['chervil', 'json'] }],
  });
  if (canceled || !filePaths || !filePaths[0]) return { ok: false, canceled: true };
  try {
    const text = fs.readFileSync(filePaths[0], 'utf8');
    return { ok: true, text };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Export a composed page as PDF --------------------------------------
// EPUB ebook export — the renderer sends a pre-sanitized book (XHTML chapters +
// bundled images); this assembles the .epub (lib/epub.js) and saves it.
ipcMain.handle('chervil:export-epub', async (event, payload) => {
  const { book, suggestedName } = payload || {};
  if (!book) return { ok: false, error: 'Nothing to export.' };
  const win = BrowserWindow.fromWebContents(event.sender);
  const safe = String(suggestedName || book.title || 'chervil-book')
    .replace(/[^a-z0-9\-_ ]+/gi, '').trim().slice(0, 80) || 'chervil-book';
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Export eBook (EPUB)',
    defaultPath: `${safe}.epub`,
    filters: [{ name: 'EPUB eBook', extensions: ['epub'] }],
  });
  if (canceled || !filePath) return { ok: false, canceled: true };
  try {
    fs.writeFileSync(filePath, buildEpub(book));
    return { ok: true, path: filePath };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Print-ready (book) PDF: exact trim size in inches, page numbers in the footer.
// The renderer sends fully-restyled book HTML (see printBookHtml).
ipcMain.handle('chervil:export-print-pdf', async (event, payload) => {
  const { html, suggestedName, widthIn, heightIn, pageNumbers } = payload || {};
  if (!html) return { ok: false, error: 'Nothing to export.' };
  const w = Math.min(14, Math.max(3, Number(widthIn) || 6));
  const h = Math.min(20, Math.max(3, Number(heightIn) || 9));
  const win = BrowserWindow.fromWebContents(event.sender);
  const safe = String(suggestedName || 'chervil-book')
    .replace(/[^a-z0-9\-_ ()]+/gi, '').trim().slice(0, 80) || 'chervil-book';
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Export print-ready PDF',
    defaultPath: `${safe}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });
  if (canceled || !filePath) return { ok: false, canceled: true };
  const tmp = path.join(os.tmpdir(), `chervil-print-${Date.now()}.html`);
  const printWin = new BrowserWindow({ show: false, webPreferences: { sandbox: true, javascript: false } });
  try {
    fs.writeFileSync(tmp, html, 'utf8');
    await printWin.loadFile(tmp);
    const pdf = await printWin.webContents.printToPDF({
      printBackground: true,
      pageSize: { width: w, height: h },
      margins: { top: 0.7, bottom: 0.7, left: 0.75, right: 0.75 },
      displayHeaderFooter: !!pageNumbers,
      headerTemplate: '<div></div>',
      footerTemplate: '<div style="width:100%;text-align:center;font-size:8.5px;font-family:Georgia,serif;color:#333;"><span class="pageNumber"></span></div>',
      preferCSSPageSize: false,
    });
    fs.writeFileSync(filePath, pdf);
    return { ok: true, path: filePath };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  } finally {
    try { printWin.destroy(); } catch { /* ignore */ }
    try { fs.unlinkSync(tmp); } catch { /* ignore */ }
  }
});

ipcMain.handle('chervil:export-pdf', async (event, payload) => {
  const { html, suggestedName } = payload || {};
  if (!html) return { ok: false, error: 'Nothing to export.' };
  const win = BrowserWindow.fromWebContents(event.sender);
  const safe = String(suggestedName || 'chervil-page')
    .replace(/[^a-z0-9\-_ ]+/gi, '').trim().slice(0, 80) || 'chervil-page';

  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Export PDF',
    defaultPath: `${safe}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });
  if (canceled || !filePath) return { ok: false, canceled: true };

  // Render the (self-contained) page HTML in a hidden window, then print it to PDF.
  const tmp = path.join(os.tmpdir(), `chervil-export-${Date.now()}.html`);
  const printWin = new BrowserWindow({
    show: false,
    webPreferences: { sandbox: true, javascript: true },
  });
  try {
    fs.writeFileSync(tmp, html, 'utf8');
    await printWin.loadFile(tmp);
    const pdf = await printWin.webContents.printToPDF({
      printBackground: true,
      margins: { marginType: 'default' },
    });
    fs.writeFileSync(filePath, pdf);
    return { ok: true, path: filePath };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  } finally {
    try { printWin.destroy(); } catch { /* ignore */ }
    try { fs.unlinkSync(tmp); } catch { /* ignore */ }
  }
});

// --- Export a composed page as an editable PowerPoint (.pptx) ------------
// The model turns the page into structured slides (title/bullets/notes), then
// PptxGenJS builds a real .pptx — speaker notes included — saved via a dialog.
ipcMain.handle('chervil:export-pptx', async (event, payload) => {
  const { html, suggestedName } = payload || {};
  if (!html) return { ok: false, error: 'Nothing to export.' };
  const win = BrowserWindow.fromWebContents(event.sender);
  const safe = String(suggestedName || 'chervil-deck')
    .replace(/[^a-z0-9\-_ ]+/gi, '').trim().slice(0, 80) || 'chervil-deck';
  try {
    const slides = await runExtractSlides({ html, title: suggestedName || '', config: providerConfigFrom(payload) });
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Export PowerPoint',
      defaultPath: `${safe}.pptx`,
      filters: [{ name: 'PowerPoint', extensions: ['pptx'] }],
    });
    if (canceled || !filePath) return { ok: false, canceled: true };
    const PptxGenJS = require('pptxgenjs');
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    slides.forEach((s, i) => {
      const slide = pptx.addSlide();
      slide.background = { color: '0B0D12' };
      slide.addText(s.title || `Slide ${i + 1}`, {
        x: 0.5, y: 0.4, w: 12.3, h: 1.0, fontSize: i === 0 ? 36 : 28, bold: true, color: 'FFFFFF',
      });
      if (s.bullets.length) {
        slide.addText(
          s.bullets.map((t) => ({ text: t, options: { bullet: true } })),
          { x: 0.7, y: 1.7, w: 11.9, h: 5.2, fontSize: 18, color: 'E6E6E6', valign: 'top', lineSpacingMultiple: 1.2 }
        );
      }
      if (s.notes) slide.addNotes(s.notes);
    });
    await pptx.writeFile({ fileName: filePath });
    return { ok: true, path: filePath };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Export a composed page as a Word document (.docx) -------------------
ipcMain.handle('chervil:export-docx', async (event, payload) => {
  const { html, suggestedName } = payload || {};
  if (!html) return { ok: false, error: 'Nothing to export.' };
  const win = BrowserWindow.fromWebContents(event.sender);
  const safe = String(suggestedName || 'chervil-doc')
    .replace(/[^a-z0-9\-_ ]+/gi, '').trim().slice(0, 80) || 'chervil-doc';
  try {
    const docData = await runExtractDoc({ html, title: suggestedName || '', config: providerConfigFrom(payload) });
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Export Word document',
      defaultPath: `${safe}.docx`,
      filters: [{ name: 'Word', extensions: ['docx'] }],
    });
    if (canceled || !filePath) return { ok: false, canceled: true };
    const { Document, Packer, Paragraph, HeadingLevel } = require('docx');
    const children = [new Paragraph({ text: docData.title, heading: HeadingLevel.TITLE })];
    docData.sections.forEach((s) => {
      if (s.heading) children.push(new Paragraph({ text: s.heading, heading: HeadingLevel.HEADING_1 }));
      s.paragraphs.forEach((p) => children.push(new Paragraph({ text: p })));
    });
    const doc = new Document({ sections: [{ children }] });
    const buf = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buf);
    return { ok: true, path: filePath };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Export a composed page as an Excel workbook (.xlsx) -----------------
ipcMain.handle('chervil:export-xlsx', async (event, payload) => {
  const { html, suggestedName } = payload || {};
  if (!html) return { ok: false, error: 'Nothing to export.' };
  const win = BrowserWindow.fromWebContents(event.sender);
  const safe = String(suggestedName || 'chervil-data')
    .replace(/[^a-z0-9\-_ ]+/gi, '').trim().slice(0, 80) || 'chervil-data';
  try {
    const sheets = await runExtractSheets({ html, title: suggestedName || '', config: providerConfigFrom(payload) });
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Export Excel workbook',
      defaultPath: `${safe}.xlsx`,
      filters: [{ name: 'Excel', extensions: ['xlsx'] }],
    });
    if (canceled || !filePath) return { ok: false, canceled: true };
    const ExcelJS = require('exceljs');
    const wb = new ExcelJS.Workbook();
    sheets.forEach((sh, i) => {
      const ws = wb.addWorksheet(sh.name || `Sheet${i + 1}`);
      if (sh.columns.length) {
        const header = ws.addRow(sh.columns);
        header.font = { bold: true };
      }
      sh.rows.forEach((r) => ws.addRow(r));
    });
    await wb.xlsx.writeFile(filePath);
    return { ok: true, path: filePath };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Export a composed page as an image (PNG/JPG) -----------------------
// Renders the page in an off-screen window and captures the FULL scrollable
// page (Chromium's captureBeyondViewport), not just the visible fold.
ipcMain.handle('chervil:export-image', async (event, payload) => {
  const { html, suggestedName, format } = payload || {};
  if (!html) return { ok: false, error: 'Nothing to export.' };
  const ext = format === 'jpg' ? 'jpg' : 'png';
  const win = BrowserWindow.fromWebContents(event.sender);
  const safe = String(suggestedName || 'chervil-page')
    .replace(/[^a-z0-9\-_ ]+/gi, '').trim().slice(0, 80) || 'chervil-page';
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Export image',
    defaultPath: `${safe}.${ext}`,
    filters: [{ name: ext.toUpperCase(), extensions: [ext] }],
  });
  if (canceled || !filePath) return { ok: false, canceled: true };

  const tmp = path.join(os.tmpdir(), `chervil-img-${Date.now()}.html`);
  const shot = new BrowserWindow({
    show: false,
    width: 1280,
    height: 900,
    webPreferences: { sandbox: true, javascript: true },
  });
  let attached = false;
  try {
    fs.writeFileSync(tmp, html, 'utf8');
    await shot.loadFile(tmp);
    // Render off-screen so the page paints (a surface exists) without a visible flash.
    shot.setBounds({ x: -32000, y: 0, width: 1280, height: 900 });
    shot.showInactive();
    await new Promise((r) => setTimeout(r, 900)); // let images/fonts/layout settle
    let buf;
    try {
      shot.webContents.debugger.attach('1.3');
      attached = true;
      const res = await shot.webContents.debugger.sendCommand('Page.captureScreenshot', {
        format: ext === 'jpg' ? 'jpeg' : 'png',
        quality: 92,
        captureBeyondViewport: true, // capture the full scrollable page
      });
      buf = Buffer.from(res.data, 'base64');
    } catch {
      // Fallback: capture just the visible viewport.
      const img = await shot.webContents.capturePage();
      buf = ext === 'jpg' ? img.toJPEG(92) : img.toPNG();
    }
    fs.writeFileSync(filePath, buf);
    return { ok: true, path: filePath };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  } finally {
    try { if (attached) shot.webContents.debugger.detach(); } catch { /* ignore */ }
    try { shot.destroy(); } catch { /* ignore */ }
    try { fs.unlinkSync(tmp); } catch { /* ignore */ }
  }
});

// --- Export a composed page as an animated GIF (records ~3s of the page) --
ipcMain.handle('chervil:export-gif', async (event, payload) => {
  const { html, suggestedName } = payload || {};
  if (!html) return { ok: false, error: 'Nothing to export.' };
  const win = BrowserWindow.fromWebContents(event.sender);
  const safe = String(suggestedName || 'chervil-page')
    .replace(/[^a-z0-9\-_ ]+/gi, '').trim().slice(0, 80) || 'chervil-page';
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Export animated GIF',
    defaultPath: `${safe}.gif`,
    filters: [{ name: 'GIF', extensions: ['gif'] }],
  });
  if (canceled || !filePath) return { ok: false, canceled: true };

  const tmp = path.join(os.tmpdir(), `chervil-gif-${Date.now()}.html`);
  const shot = new BrowserWindow({ show: false, width: 960, height: 640, webPreferences: { sandbox: true } });
  try {
    fs.writeFileSync(tmp, html, 'utf8');
    await shot.loadFile(tmp);
    shot.setBounds({ x: -32000, y: 0, width: 960, height: 640 });
    shot.showInactive();
    await new Promise((r) => setTimeout(r, 500)); // let it paint / start animating

    const { GIFEncoder, quantize, applyPalette } = require('gifenc');
    const enc = GIFEncoder();
    const FRAMES = 30;
    const DELAY = 100; // ms/frame → ~3s at ~10fps
    const MAXW = 720;

    // Lock output dimensions from the first frame so every frame matches.
    const first = await shot.webContents.capturePage();
    const s0 = first.getSize();
    const targetW = Math.min(s0.width || MAXW, MAXW);
    const targetH = Math.max(1, Math.round((s0.height || 1) * (targetW / (s0.width || targetW))));

    for (let i = 0; i < FRAMES; i++) {
      const cap = i === 0 ? first : await shot.webContents.capturePage();
      const img = cap.resize({ width: targetW, height: targetH });
      const bgra = img.toBitmap(); // Electron NativeImage bitmap is BGRA
      const rgba = Buffer.allocUnsafe(bgra.length);
      for (let p = 0; p < bgra.length; p += 4) {
        rgba[p] = bgra[p + 2];
        rgba[p + 1] = bgra[p + 1];
        rgba[p + 2] = bgra[p];
        rgba[p + 3] = bgra[p + 3];
      }
      const u8 = new Uint8Array(rgba.buffer, rgba.byteOffset, rgba.length);
      const palette = quantize(u8, 256);
      const index = applyPalette(u8, palette);
      enc.writeFrame(index, targetW, targetH, { palette, delay: DELAY });
      if (i < FRAMES - 1) await new Promise((r) => setTimeout(r, DELAY));
    }
    enc.finish();
    fs.writeFileSync(filePath, Buffer.from(enc.bytes()));
    return { ok: true, path: filePath };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  } finally {
    try { shot.destroy(); } catch { /* ignore */ }
    try { fs.unlinkSync(tmp); } catch { /* ignore */ }
  }
});

// --- Save a composed page to disk ---------------------------------------
ipcMain.handle('chervil:save-page', async (event, payload) => {
  const { html, suggestedName } = payload || {};
  if (!html) return { ok: false, error: 'Nothing to save.' };
  const win = BrowserWindow.fromWebContents(event.sender);
  const safe = String(suggestedName || 'chervil-page')
    .replace(/[^a-z0-9\-_ ]+/gi, '')
    .trim()
    .slice(0, 80) || 'chervil-page';

  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Save page',
    defaultPath: `${safe}.html`,
    filters: [{ name: 'HTML page', extensions: ['html'] }],
  });
  if (canceled || !filePath) return { ok: false, canceled: true };

  try {
    fs.writeFileSync(filePath, html, 'utf8');
    return { ok: true, path: filePath };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Persist & restore session state (tabs, prompts, pages) --------------
function defaultStateFile() {
  return path.join(app.getPath('userData'), 'chervil-state.json');
}

// Machine-local config (the pointer to a custom/synced state location). Must live
// OUTSIDE the synced state file itself, and never syncs — each machine sets its own.
function configFile() {
  return path.join(app.getPath('userData'), 'chervil-config.json');
}
function readConfig() {
  try { return JSON.parse(fs.readFileSync(configFile(), 'utf8')) || {}; }
  catch { return {}; }
}
function writeConfig(cfg) {
  try { fs.writeFileSync(configFile(), JSON.stringify(cfg), 'utf8'); return true; }
  catch { return false; }
}

// The active state file: a user-chosen sync location if set AND its folder is
// reachable, otherwise the local default. Falling back when the sync folder is
// offline (unmounted drive, paused cloud client) avoids breaking save/load.
function stateFile() {
  const cfg = readConfig();
  if (cfg.statePath) {
    const dir = path.dirname(cfg.statePath);
    try { if (fs.existsSync(dir)) return cfg.statePath; } catch { /* fall through */ }
  }
  return defaultStateFile();
}

// Pre-rename state file (in the old per-app folder); migrated forward on first save.
function legacyStateFile() {
  return legacyDataFile('parslee-state.json') || legacyDataFile('pingchat-state.json');
}

// --- Conflict-copy reconciliation (RFC 0005) -----------------------------
// File-sync services (OneDrive/Google Drive/Dropbox) cannot merge JSON: when two
// machines both write chervil-state.json, the service keeps one and forks the
// loser into a conflict copy ("chervil-state-<MACHINE>[-N].json", "chervil-state
// (1).json", "…(conflicted copy …).json"). The app only reads chervil-state.json,
// so those writes would be lost — the user sees "my bookmarks don't sync." We
// absorb any sibling conflict copies into the canonical file (union of additive
// collections via stateMerge) and archive them so they stop accumulating.
function isConflictCopy(name) {
  const lower = name.toLowerCase();
  if (lower === 'chervil-state.json') return false;
  return lower.startsWith('chervil-state') && lower.endsWith('.json') && !lower.endsWith('.tmp.json');
}

function readStateWithMtime(p, { newest = false } = {}) {
  try {
    const state = JSON.parse(fs.readFileSync(p, 'utf8'));
    const mtimeMs = newest ? Number.MAX_SAFE_INTEGER : fs.statSync(p).mtimeMs;
    return { state, mtimeMs };
  } catch { return null; }
}

// Absorb any conflict copies next to `canonical` into it. Canonical is treated as
// newest so its session/scalar fields (tabs, settings) stay authoritative; only
// additive collections are unioned in. Returns the merged state if a merge
// happened, else null. Best-effort — never throws.
function reconcileConflictCopies(canonical) {
  try {
    const dir = path.dirname(canonical);
    let entries;
    try { entries = fs.readdirSync(dir); } catch { return null; }
    const orphans = entries.filter(isConflictCopy);
    if (!orphans.length) return null;

    const sources = [];
    const base = readStateWithMtime(canonical, { newest: true });
    if (base) sources.push(base);
    const absorbed = [];
    for (const f of orphans) {
      const s = readStateWithMtime(path.join(dir, f));
      if (s) { sources.push(s); absorbed.push(f); }
    }
    if (!absorbed.length) return null;

    const merged = mergeStates(sources);
    if (!merged) return null;

    const tmp = canonical + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(merged), 'utf8');
    fs.renameSync(tmp, canonical);

    // Archive the absorbed copies so they don't re-accumulate or re-trigger.
    const archive = path.join(dir, '_resolved-conflicts');
    try { fs.mkdirSync(archive, { recursive: true }); } catch { /* ignore */ }
    for (const f of absorbed) {
      try { fs.renameSync(path.join(dir, f), path.join(archive, f)); }
      catch { try { fs.rmSync(path.join(dir, f)); } catch { /* ignore */ } }
    }
    return merged;
  } catch { return null; }
}

ipcMain.handle('chervil:load-state', async (event) => {
  // Secondary (ephemeral) windows start fresh and never read the saved session.
  if (primaryWcId != null && event.sender.id !== primaryWcId) return null;
  try {
    let p = stateFile();
    // If a configured sync file isn't there yet, fall back to local, then legacy.
    if (!fs.existsSync(p) && fs.existsSync(defaultStateFile())) p = defaultStateFile();
    if (!fs.existsSync(p) && fs.existsSync(legacyStateFile())) p = legacyStateFile();
    if (!fs.existsSync(p)) return null;
    // Deliberately does NOT reconcile conflict copies. Absorbing them means reading
    // and parsing every orphan file, and on a cloud-synced folder those reads can be
    // dehydrated — seconds of network I/O inside readFileSync, blocking the main
    // process while the user stares at an empty window. The renderer kicks off the
    // same merge over IPC right after boot (reconcileNow) and adopts the result in
    // place; the reconcile only ever changes additive collections, and the session
    // itself (tabs, settings) comes from this canonical file regardless.
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
});

// --- Your Web: the local page index (RFC 0013) ---
// Composed pages used to live as full HTML inside chervil-state.json, so every
// save re-serialized megabytes. They live here instead: a page write is one small
// INSERT, and the corpus becomes searchable. The DB is always LOCAL (never the
// synced statePath) — the index is machine-local by design; see the RFC.
let pageIndex = null;
let pageIndexBroken = false;

function pageIndexFile() {
  return path.join(app.getPath('userData'), 'chervil-index.db');
}

// Lazily opened. If node:sqlite is ever unavailable the index degrades to "off"
// rather than taking down the app — every caller below tolerates a null.
function getPageIndex() {
  if (pageIndex || pageIndexBroken) return pageIndex;
  try {
    pageIndex = createPageIndex(pageIndexFile());
  } catch (err) {
    pageIndexBroken = true;
    console.error('[chervil] page index unavailable:', err && err.message);
  }
  return pageIndex;
}

app.on('will-quit', () => { try { if (pageIndex) pageIndex.close(); } catch { /* ignore */ } });

// One-time move of library.history/trash out of the state file and into the index.
// Reads the state file directly rather than taking megabytes over IPC. Idempotent:
// a `library_migrated` marker means later boots no-op. Backs the state file up
// first so a bad migration is recoverable.
ipcMain.handle('chervil:index-migrate', async () => {
  const idx = getPageIndex();
  if (!idx) return { ok: false, error: 'index-unavailable' };
  try {
    const done = idx._db.prepare('SELECT value FROM meta WHERE key = ?').get('library_migrated');
    if (done) return { ok: true, migrated: 0, already: true };

    const p = stateFile();
    if (!fs.existsSync(p)) {
      idx._db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run('library_migrated', String(Date.now()));
      return { ok: true, migrated: 0 };
    }
    const raw = fs.readFileSync(p, 'utf8');
    const state = JSON.parse(raw);
    const hist = (state.library && Array.isArray(state.library.history)) ? state.library.history : [];
    const trash = (state.library && Array.isArray(state.library.trash)) ? state.library.trash : [];
    if (hist.length || trash.length) {
      try { fs.writeFileSync(p + '.pre-index.bak', raw, 'utf8'); } catch { /* best effort */ }
    }

    let migrated = 0;
    const put = (it, trashed) => {
      if (!it || !it.id) return;
      idx.putComposed({
        id: it.id,
        title: it.title || '',
        query: it.query || '',
        html: it.html || '',
        body: stripHtmlText(it.html),   // what FTS indexes
        sources: it.sources || [],
        conversation: it.conversation || [],
        history: it.history || [],
        spaceId: it.spaceId,
        storeKey: it.storeKey,
        createdAt: it.createdAt || Date.now(),
      });
      if (trashed) idx.trash(it.id);
      migrated++;
    };
    for (const it of hist) put(it, false);
    for (const it of trash) put(it, true);

    idx._db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run('library_migrated', String(Date.now()));
    return { ok: true, migrated, stats: idx.stats() };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Mirrors the renderer's stripText — the index stores readable text, not markup.
function stripHtmlText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const withIndex = (fn) => async (_event, payload) => {
  const idx = getPageIndex();
  if (!idx) return { ok: false, error: 'index-unavailable' };
  try { return { ok: true, ...fn(idx, payload || {}) }; }
  catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
};

ipcMain.handle('chervil:index-put', withIndex((idx, p) => {
  // Body is derived here so the renderer never has to ship text it already has as HTML.
  const id = idx.putComposed({ ...p, body: p.body || stripHtmlText(p.html) });
  return { id };
}));
ipcMain.handle('chervil:index-put-visited', withIndex((idx, p) => ({ id: idx.putVisited(p) })));
ipcMain.handle('chervil:index-get', withIndex((idx, p) => ({ item: idx.get(p.id) })));
ipcMain.handle('chervil:index-list', withIndex((idx, p) => ({
  items: idx.list({ kind: p.kind || 'composed', limit: p.limit || 200, offset: p.offset || 0 }),
  trash: p.withTrash ? idx.listTrash({ limit: p.limit || 200 }) : undefined,
})));
ipcMain.handle('chervil:index-search', withIndex((idx, p) => ({
  items: idx.search(p.query || '', { limit: p.limit || 20, kind: p.kind || null, includeBody: !!p.includeBody, any: !!p.any }),
})));
ipcMain.handle('chervil:index-trash', withIndex((idx, p) => { idx.trash(p.id); return {}; }));
ipcMain.handle('chervil:index-restore', withIndex((idx, p) => { idx.restore(p.id); return {}; }));
ipcMain.handle('chervil:index-remove', withIndex((idx, p) => { idx.remove(p.id); return {}; }));
ipcMain.handle('chervil:index-empty-trash', withIndex((idx) => { idx.emptyTrash(); return {}; }));
ipcMain.handle('chervil:index-stats', withIndex((idx) => ({ stats: idx.stats() })));
ipcMain.handle('chervil:index-topics', withIndex((idx, p) => ({
  topics: idx.topics({
    sinceMs: Number(p.sinceMs) || (Date.now() - 14 * 24 * 60 * 60 * 1000),
    minPages: Math.max(2, Number(p.minPages) || 4),
    minHosts: Math.max(1, Number(p.minHosts) || 2),
    limit: Math.max(1, Number(p.limit) || 8),
  }),
})));
ipcMain.handle('chervil:index-evict-over', withIndex((idx, p) => {
  idx.evictVisitedOver(Math.max(0, Number(p.max) || 5000));
  return {};
}));
ipcMain.handle('chervil:index-forget-site', withIndex((idx, p) => { idx.forgetSite(p.host); return {}; }));
ipcMain.handle('chervil:index-forget-since', withIndex((idx, p) => { idx.forgetSince(p.since); return {}; }));
ipcMain.handle('chervil:index-forget-all', withIndex((idx, p) => {
  idx.forgetAll({ includeComposed: !!p.includeComposed });
  return { stats: idx.stats() };
}));

ipcMain.handle('chervil:save-state', async (event, state) => {
  // Secondary (ephemeral) windows must not write over the primary's saved session.
  if (primaryWcId != null && event.sender.id !== primaryWcId) return { ok: true, mtimeMs: 0 };
  try {
    const p = stateFile();
    let toWrite = state;
    // Synced: union additive collections from whatever is on disk now (another
    // machine may have written since we loaded) with our in-memory state as the
    // newest/base. Deletion tombstones keep our removals from being resurrected.
    const cfg = readConfig();
    if (cfg.statePath && p === cfg.statePath) {
      const onDisk = readStateWithMtime(p);
      if (onDisk) {
        const merged = mergeStates([{ state, mtimeMs: Number.MAX_SAFE_INTEGER }, onDisk]);
        if (merged) toWrite = merged;
      }
    }
    // Atomic write so a sync client never reads a half-written file.
    const tmp = p + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(toWrite), 'utf8');
    fs.renameSync(tmp, p);
    let mtimeMs = 0;
    try { mtimeMs = fs.statSync(p).mtimeMs; } catch { /* ignore */ }
    return { ok: true, mtimeMs };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Re-run conflict-copy reconciliation on demand. The renderer calls this on
// window focus so orphans heal mid-session, not only at launch. Returns whether
// anything changed (and the merged state so the renderer can adopt new items).
ipcMain.handle('chervil:reconcile-state', async () => {
  try {
    const cfg = readConfig();
    const active = stateFile();
    if (!cfg.statePath || active !== cfg.statePath) return { ok: true, changed: false };
    const merged = reconcileConflictCopies(active);
    let mtimeMs = 0;
    try { mtimeMs = fs.statSync(active).mtimeMs; } catch { /* ignore */ }
    return { ok: true, changed: !!merged, mtimeMs, state: merged || null };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Import from another browser (Phase 1: bookmarks). List the importable sources
// (browser × profile that has a Bookmarks file) and read one on request. Read-only.
ipcMain.handle('chervil:import-list-sources', async () => {
  try { return { ok: true, sources: importBookmarks.listSources() }; }
  catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});
ipcMain.handle('chervil:import-bookmarks', async (_event, srcPath) => {
  try {
    // Only ever read a path we ourselves enumerated — never an arbitrary path the
    // renderer hands us (defense against a compromised renderer reading the disk).
    // Cheap membership check (no re-parsing every Bookmarks file to validate one path).
    if (!importBookmarks.isImportablePath('Bookmarks', srcPath)) return { ok: false, error: 'Unknown import source.' };
    return { ok: true, entries: importBookmarks.readSource(srcPath) };
  } catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});
// Import browsing history (SQLite via node:sqlite; copy-then-read). Read-only.
ipcMain.handle('chervil:import-list-history-sources', async () => {
  try { return { ok: true, sources: importHistory.listHistorySources() }; }
  catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});
ipcMain.handle('chervil:import-history', async (_event, srcPath) => {
  try {
    // Validate cheaply (path membership) — don't re-copy every History DB here.
    if (!importHistory.isImportablePath(srcPath)) return { ok: false, error: 'Unknown import source.' };
    return { ok: true, entries: importHistory.readHistory(srcPath) };
  } catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});

// Import passwords from a browser/password-manager CSV export. The user picks the
// file; we parse + save into the encrypted vault ENTIRELY in the main process —
// plaintext passwords never cross back to the renderer. Returns counts only.
ipcMain.handle('chervil:import-passwords-csv', async (event) => {
  try {
    const v = vault();
    if (!v.isConfigured()) return { ok: false, error: 'needs-setup' };
    if (!v.isUnlocked()) return { ok: false, error: 'locked' };
    const win = BrowserWindow.fromWebContents(event.sender) || mainWindow;
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'Import passwords — choose your browser’s CSV export',
      filters: [{ name: 'CSV files', extensions: ['csv'] }],
      properties: ['openFile'],
    });
    if (canceled || !filePaths || !filePaths[0]) return { ok: true, canceled: true };
    let text;
    try { text = fs.readFileSync(filePaths[0], 'utf8'); } catch { return { ok: false, error: 'Couldn’t read that file.' }; }
    const rows = importPasswordsCsv.parsePasswordsCsv(text);
    if (!rows.length) return { ok: false, error: 'not-a-passwords-csv' };
    let added = 0;
    let skipped = 0;
    let failed = 0;
    for (const r of rows) {
      const origin = registrableDomain(r.url || '');
      if (!origin || !r.password) { skipped++; continue; }
      try {
        if (v.hasExact(origin, r.username || '', r.password)) { skipped++; continue; }
        v.save({ origin, username: r.username || '', password: r.password });
        added++;
      } catch { failed++; }
    }
    return { ok: true, added, skipped, failed, total: rows.length };
  } catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});

// Import contact/address autofill (unencrypted Web Data). Reads the most-used
// address profile and returns Chervil's identity fields for the renderer to save.
ipcMain.handle('chervil:import-list-address-sources', async () => {
  try { return { ok: true, sources: importAutofill.listAddressSources() }; }
  catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});
ipcMain.handle('chervil:import-address', async (_event, srcPath) => {
  try {
    if (!importAutofill.isImportablePath(srcPath)) return { ok: false, error: 'Unknown import source.' };
    return { ok: true, fields: importAutofill.readPrimaryAddress(srcPath) || {} };
  } catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
});

// Info about the active state file: whether it's the synced location and its
// last-modified time. The renderer uses this to detect when another computer has
// updated the shared synced session (RFC 0005, decision 3 — reload-on-focus).
ipcMain.handle('chervil:state-info', async (event) => {
  // Ephemeral windows never sync, so never prompt them to reload.
  if (primaryWcId != null && event.sender.id !== primaryWcId) return { ok: true, synced: false, mtimeMs: 0 };
  try {
    const cfg = readConfig();
    const active = stateFile();
    const synced = !!cfg.statePath && active === cfg.statePath;
    let mtimeMs = 0;
    try { mtimeMs = fs.statSync(active).mtimeMs; } catch { /* not written yet */ }
    return { ok: true, synced, mtimeMs };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Sync folder (free folder-sync on-ramp for #1) ----------------------
// Point Chervil's state file at a desktop-synced folder (OneDrive / Google Drive
// / Dropbox) so it rides their sync to your other machines. Set the same folder
// on each machine. API keys are NOT synced (machine-encrypted via safeStorage).
ipcMain.handle('chervil:get-sync-folder', async () => {
  const cfg = readConfig();
  if (cfg.statePath) return { ok: true, folder: path.dirname(cfg.statePath), path: cfg.statePath };
  return { ok: true, folder: null };
});

ipcMain.handle('chervil:set-sync-folder', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: 'Choose a sync folder (e.g. inside OneDrive or Google Drive)',
    properties: ['openDirectory'],
  });
  if (canceled || !filePaths || !filePaths.length) return { ok: false, canceled: true };
  const folder = filePaths[0];
  const target = path.join(folder, 'chervil-state.json');
  try {
    const adopted = fs.existsSync(target);
    if (!adopted) {
      // Seed the new location from the current state so nothing is lost.
      const cur = stateFile();
      const seed = fs.existsSync(cur) ? fs.readFileSync(cur, 'utf8') : '{}';
      fs.writeFileSync(target, seed, 'utf8');
    }
    const cfg = readConfig();
    cfg.statePath = target;
    if (!writeConfig(cfg)) return { ok: false, error: 'Could not save the sync setting.' };
    // adopted === true means an existing synced file was found; the renderer should
    // reload to pick it up (it has stale in-memory state from this machine).
    return { ok: true, folder, path: target, adopted };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

ipcMain.handle('chervil:clear-sync-folder', async () => {
  try {
    const cfg = readConfig();
    const synced = cfg.statePath;
    // Copy the synced state back to local so the current data stays after unlinking.
    try {
      if (synced && fs.existsSync(synced)) fs.copyFileSync(synced, defaultStateFile());
    } catch { /* best effort */ }
    delete cfg.statePath;
    writeConfig(cfg);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});
