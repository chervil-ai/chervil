'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const { app, BrowserWindow, ipcMain, dialog, safeStorage, Notification } = require('electron');

// Load .env from the project root (one level up from /electron).
// quiet:true suppresses dotenv v17's "injected env … tip" banner (which also
// renders as mojibake in the Windows console).
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const { runAgent, runAppletAsk, runListModels, runAgentStep } = require('../lib/agent');

let mainWindow = null;

// --- Bring-your-own API keys (per provider, encrypted at rest via safeStorage) ---
function keysFile() {
  return path.join(app.getPath('userData'), 'parslee-keys.bin');
}

// provider -> key, for this session. Anthropic's .env key seeds "claude".
let savedKeys = {};

function loadSavedKeys() {
  if (process.env.ANTHROPIC_API_KEY) savedKeys.claude = process.env.ANTHROPIC_API_KEY;
  try {
    const p = keysFile();
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

// Build the provider config for a request from the renderer's settings + saved key.
function providerConfigFrom(payload) {
  const cfg = (payload && payload.config) || {};
  const provider = cfg.provider || 'claude';
  return { ...cfg, provider, apiKey: savedKeys[provider] || '' };
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0b0d12',
    title: 'Parslee',
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

  // Uncomment to debug the renderer.
  // mainWindow.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(() => {
  // Windows shows the AppUserModelID as the toast/notification source; set it so
  // Living-page notifications appear as "Parslee" (with the app icon) rather than
  // the generic electron.app.* identity.
  if (process.platform === 'win32') app.setAppUserModelId('com.parslee.app');
  loadSavedKeys();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

/**
 * The renderer asks a question; we run the agent and stream progress back.
 * Returns the final result object: a generated page or a navigation directive.
 */
ipcMain.handle('parslee:ask', async (event, payload) => {
  const { query, history, requestId, pageContext, allowNavigate, refineMode, spaceContext, deep, verify, profile, attachments, mcpServers } =
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
      onStatus: (status) => send('parslee:status', { requestId, status }),
      onText: (delta) => send('parslee:chunk', { requestId, delta }),
      pageContext: pageContext || null,
      allowNavigate: allowNavigate !== false,
      refineMode: refineMode || null,
      spaceContext: spaceContext || null,
      deep: deep === true,
      verify: verify === true,
      profile: typeof profile === 'string' ? profile : null,
      attachments: Array.isArray(attachments) ? attachments : [],
      mcpServers: Array.isArray(mcpServers) ? mcpServers : [],
      config: providerConfigFrom(payload),
    });
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Applet bridge: a composed page asks Sprig for live data -------------
ipcMain.handle('parslee:applet-ask', async (_event, payload) => {
  try {
    const { prompt } = payload || {};
    const res = await runAppletAsk({ prompt, config: providerConfigFrom(payload) });
    return { ok: true, text: res.text, sources: res.sources || [] };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- System notifications: a Living page changed in the background -------
// The renderer fires this from refreshLiving when a page's content changed and
// the window isn't focused. Clicking the toast focuses Parslee and asks the
// renderer to jump to the page that updated.
ipcMain.handle('parslee:notify', async (_event, payload) => {
  try {
    if (!Notification.isSupported()) return { ok: false, error: 'unsupported' };
    const { title, body, tabId, entryId } = payload || {};
    const n = new Notification({
      title: String(title || 'Parslee'),
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
          mainWindow.webContents.send('parslee:notification-click', { tabId, entryId });
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
ipcMain.handle('parslee:get-key-status', async () => {
  const status = {};
  for (const p of ['claude', 'grok', 'gemini', 'azure']) status[p] = !!savedKeys[p];
  status.claudeFromEnv = !!process.env.ANTHROPIC_API_KEY && savedKeys.claude === process.env.ANTHROPIC_API_KEY;
  return status;
});

ipcMain.handle('parslee:set-api-key', async (_event, payload) => {
  const provider = payload && typeof payload.provider === 'string' ? payload.provider : '';
  const key = payload && typeof payload.apiKey === 'string' ? payload.apiKey.trim() : '';
  return setKey(provider, key);
});

// Web-agent: decide the next action on a live site.
ipcMain.handle('parslee:agent-step', async (_event, payload) => {
  try {
    const { task, pageState, steps } = payload || {};
    const action = await runAgentStep({ task, pageState, steps, config: providerConfigFrom(payload) });
    return { ok: true, action };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Live model list for the Settings dropdown (free metadata call).
ipcMain.handle('parslee:list-models', async (_event, payload) => {
  try {
    const models = await runListModels({ config: providerConfigFrom(payload) });
    return { ok: true, models: Array.isArray(models) ? models : [] };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// --- Export a composed page as PDF --------------------------------------
ipcMain.handle('parslee:export-pdf', async (event, payload) => {
  const { html, suggestedName } = payload || {};
  if (!html) return { ok: false, error: 'Nothing to export.' };
  const win = BrowserWindow.fromWebContents(event.sender);
  const safe = String(suggestedName || 'parslee-page')
    .replace(/[^a-z0-9\-_ ]+/gi, '').trim().slice(0, 80) || 'parslee-page';

  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Export PDF',
    defaultPath: `${safe}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });
  if (canceled || !filePath) return { ok: false, canceled: true };

  // Render the (self-contained) page HTML in a hidden window, then print it to PDF.
  const tmp = path.join(os.tmpdir(), `parslee-export-${Date.now()}.html`);
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

// --- Save a composed page to disk ---------------------------------------
ipcMain.handle('parslee:save-page', async (event, payload) => {
  const { html, suggestedName } = payload || {};
  if (!html) return { ok: false, error: 'Nothing to save.' };
  const win = BrowserWindow.fromWebContents(event.sender);
  const safe = String(suggestedName || 'parslee-page')
    .replace(/[^a-z0-9\-_ ]+/gi, '')
    .trim()
    .slice(0, 80) || 'parslee-page';

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
  return path.join(app.getPath('userData'), 'parslee-state.json');
}

ipcMain.handle('parslee:load-state', async () => {
  try {
    const p = stateFile();
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
});

ipcMain.handle('parslee:save-state', async (_event, state) => {
  try {
    fs.writeFileSync(stateFile(), JSON.stringify(state), 'utf8');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});
