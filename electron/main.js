'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const { app, BrowserWindow, ipcMain, dialog, safeStorage, Notification, Tray, Menu, globalShortcut, screen, shell, clipboard } = require('electron');

// Load .env from the project root (one level up from /electron).
// quiet:true suppresses dotenv v17's "injected env … tip" banner (which also
// renders as mojibake in the Windows console).
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const { runAgent, runAppletAsk, runListModels, runAgentStep, runExtractSlides, runExtractDoc, runExtractSheets, runSynthesizeAgent } = require('../lib/agent');
const { getSkill } = require('../lib/skills');

let mainWindow = null;
let tray = null;
let quickWindow = null;
let isQuitting = false; // true only when truly quitting (tray → Quit); otherwise window close = hide-to-tray

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

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0b0d12',
    title: 'Chervil',
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

  mainWindow.loadFile(path.join(__dirname, '..', 'src', 'index.html'));

  // Native right-click menus for the app UI (and any embedded real sites).
  attachContextMenu(mainWindow.webContents, { isMainUI: true });
  mainWindow.webContents.on('did-attach-webview', (_e, wc) => attachContextMenu(wc, { isMainUI: false }));

  // Allow microphone access for voice input, but ONLY for Chervil's own UI
  // (the file:// origin) — never auto-grant mic/camera to remote sites embedded
  // in the <webview>. Benign browsing permissions (fullscreen, pointer lock) stay
  // allowed so embedded real sites still work; sensitive ones (geolocation,
  // notifications, etc.) are denied.
  const ses = mainWindow.webContents.session;
  const fromApp = (url) => (url || '').startsWith('file://');
  const BROWSING_OK = new Set(['fullscreen', 'pointerLock', 'keyboardLock', 'clipboard-sanitized-write']);
  ses.setPermissionRequestHandler((wc, permission, callback, details) => {
    if (permission === 'media') return callback(fromApp(details && details.requestingUrl));
    return callback(BROWSING_OK.has(permission));
  });
  ses.setPermissionCheckHandler((wc, permission, requestingOrigin) => {
    if (permission === 'media') return fromApp(requestingOrigin);
    return BROWSING_OK.has(permission);
  });

  // Close to tray instead of quitting, so the global hotkey (and background work)
  // keep running. A real quit goes through the tray menu (which sets isQuitting).
  mainWindow.on('close', (e) => {
    if (!isQuitting) { e.preventDefault(); mainWindow.hide(); }
  });

  // Uncomment to debug the renderer.
  // mainWindow.webContents.openDevTools({ mode: 'detach' });
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
function deliverPrompt(prompt) {
  if (!mainWindow || mainWindow.isDestroyed()) createWindow();
  showMain();
  const wc = mainWindow.webContents;
  if (wc.isLoading()) {
    wc.once('did-finish-load', () => {
      if (!wc.isDestroyed()) wc.send('chervil:quick-prompt', prompt);
    });
  } else {
    wc.send('chervil:quick-prompt', prompt);
  }
}

// Handle a chervil:// deep link from the browser extension (or anywhere):
//   chervil://ask?url=<page>&title=<title>&text=<selection>
function handleChervilUrl(raw) {
  let prompt = '';
  try {
    const u = new URL(raw);
    if (u.protocol !== 'chervil:') return;
    const text = (u.searchParams.get('text') || '').trim();
    const url = (u.searchParams.get('url') || '').trim();
    const title = (u.searchParams.get('title') || '').trim();
    const where = title ? `${title} (${url})` : url;
    if (text) prompt = url ? `${text}\n\n— from ${where}` : text;
    else if (url) prompt = `Summarize this web page and pull out the key points: ${where}`;
  } catch { /* malformed link */ }
  if (prompt) deliverPrompt(prompt);
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

function showQuick() {
  if (!quickWindow || quickWindow.isDestroyed()) createQuickWindow();
  const area = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea;
  const w = 640;
  quickWindow.setBounds({
    x: Math.round(area.x + (area.width - w) / 2),
    y: Math.round(area.y + area.height * 0.18),
    width: w,
    height: 96,
  });
  quickWindow.show();
  quickWindow.focus();
  if (!quickWindow.webContents.isDestroyed()) quickWindow.webContents.send('chervil:quick-show');
}

function hideQuick() { if (quickWindow && !quickWindow.isDestroyed()) quickWindow.hide(); }

function toggleQuick() {
  if (quickWindow && quickWindow.isVisible()) hideQuick();
  else showQuick();
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
      click: (item) => app.setLoginItemSettings({ openAtLogin: item.checked }),
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

// --- "Hey Sprig" wake mode --------------------------------------------------
// Wake-word detection runs in the main renderer (openWakeWord, on-device). When it
// fires, the renderer pops the Quick-Ask bar as a "listening" affordance, then
// captures + transcribes the spoken command itself and composes via the normal path.
ipcMain.on('chervil:wake-listening', () => {
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
    const url = argv.find((a) => String(a).startsWith('chervil://'));
    if (url) handleChervilUrl(url);
  });
}
app.on('open-url', (e, url) => { e.preventDefault(); handleChervilUrl(url); }); // macOS
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
  applyFirstRunProvisioning(); // import installer wizard choices on first launch
  createWindow();
  createTray();
  // Cold start via a chervil:// deep link (URL passed in argv on first launch).
  const startUrl = process.argv.find((a) => String(a).startsWith('chervil://'));
  if (startUrl) handleChervilUrl(startUrl); // deliverPrompt waits for the renderer
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
ipcMain.handle('chervil:ask', async (event, payload) => {
  const { query, history, requestId, pageContext, allowNavigate, refineMode, spaceContext, deep, verify, profile, attachments, mcpServers, agent } =
    payload || {};
  const send = (channel, data) => {
    if (!event.sender.isDestroyed()) event.sender.send(channel, data);
  };

  try {
    const result = await runAgent({
      query,
      history: Array.isArray(history) ? history : [],
      // Stream events are tagged with requestId so the renderer can route them to the
      // right tab — multiple tabs can generate concurrently.
      onStatus: (status) => send('chervil:status', { requestId, status }),
      onText: (delta) => send('chervil:chunk', { requestId, delta }),
      pageContext: pageContext || null,
      allowNavigate: allowNavigate !== false,
      refineMode: refineMode || null,
      spaceContext: spaceContext || null,
      deep: deep === true,
      verify: verify === true,
      profile: typeof profile === 'string' ? profile : null,
      attachments: Array.isArray(attachments) ? attachments : [],
      mcpServers: Array.isArray(mcpServers) ? mcpServers : [],
      agent: typeof agent === 'string' ? agent : null,
      config: providerConfigFrom(payload),
    });
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
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

// --- Skills: build any registered skill (RFC 0003) -------------------------
// Generic build: getSkill → build → optional enrich (Learn's media verify) →
// toHtml. Replaces the old lesson-specific build-lesson handler.
ipcMain.handle('chervil:build-skill', async (_event, payload) => {
  try {
    const { skill: skillId, input, level, goals } = payload || {};
    const skill = getSkill(skillId);
    if (!skill) return { ok: false, error: 'Unknown skill.' };
    const config = providerConfigFrom(payload);
    const artifact = await skill.build({ input, level, goals, config });
    if (skill.enrich) await skill.enrich(artifact, config);
    return { ok: true, kind: skill.id, artifact, html: skill.toHtml(artifact) };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Pre-compute applet answers with the user's LOCAL key so published/exported
// lessons show baked results — no hosted bridge, no server-side key custody, no
// token cost (RFC 0002 / the "snapshot at publish" decision). Mutates in place.
async function snapshotApplets(lesson, config) {
  const cards = [];
  for (const m of (lesson.modules || [])) for (const c of (m.cards || [])) {
    if (c.kind === 'applet' && c.prompt && !c.answer) cards.push(c);
  }
  await Promise.all(cards.map(async (c) => {
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
    const { token, baseUrl } = payload || {};
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
      body: JSON.stringify({ artifact, kind, html }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error || `Publish failed (${res.status}).` };
    return { ok: true, url: data.url, id: data.id };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- System notifications: a Living page changed in the background -------
// The renderer fires this from refreshLiving when a page's content changed and
// the window isn't focused. Clicking the toast focuses Chervil and asks the
// renderer to jump to the page that updated.
ipcMain.handle('chervil:notify', async (_event, payload) => {
  try {
    if (!Notification.isSupported()) return { ok: false, error: 'unsupported' };
    const { title, body, tabId, entryId } = payload || {};
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
          mainWindow.webContents.send('chervil:notification-click', { tabId, entryId });
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
  for (const p of ['claude', 'grok', 'gemini', 'openai', 'azure', 'stt']) status[p] = !!savedKeys[p];
  status.claudeFromEnv = !!process.env.ANTHROPIC_API_KEY && savedKeys.claude === process.env.ANTHROPIC_API_KEY;
  return status;
});

ipcMain.handle('chervil:set-api-key', async (_event, payload) => {
  const provider = payload && typeof payload.provider === 'string' ? payload.provider : '';
  const key = payload && typeof payload.apiKey === 'string' ? payload.apiKey.trim() : '';
  return setKey(provider, key);
});

// Web-agent: decide the next action on a live site.
ipcMain.handle('chervil:agent-step', async (_event, payload) => {
  try {
    const { task, pageState, steps } = payload || {};
    const action = await runAgentStep({ task, pageState, steps, config: providerConfigFrom(payload) });
    return { ok: true, action };
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

// --- Export a composed page as PDF --------------------------------------
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
function stateFile() {
  return path.join(app.getPath('userData'), 'chervil-state.json');
}

// Pre-rename state file (in the old per-app folder); migrated forward on first save.
function legacyStateFile() {
  return legacyDataFile('parslee-state.json') || legacyDataFile('pingchat-state.json');
}

ipcMain.handle('chervil:load-state', async () => {
  try {
    let p = stateFile();
    if (!fs.existsSync(p) && fs.existsSync(legacyStateFile())) p = legacyStateFile();
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
});

ipcMain.handle('chervil:save-state', async (_event, state) => {
  try {
    fs.writeFileSync(stateFile(), JSON.stringify(state), 'utf8');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});
