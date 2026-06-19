'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const { app, BrowserWindow, ipcMain, dialog, safeStorage, Notification } = require('electron');

// Load .env from the project root (one level up from /electron).
// quiet:true suppresses dotenv v17's "injected env … tip" banner (which also
// renders as mojibake in the Windows console).
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const { runAgent, runAppletAsk, runListModels, runAgentStep, runExtractSlides, runExtractDoc, runExtractSheets } = require('../lib/agent');

let mainWindow = null;

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

  // Uncomment to debug the renderer.
  // mainWindow.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(() => {
  // Windows shows the AppUserModelID as the toast/notification source; set it so
  // Living-page notifications appear as "Chervil" (with the app icon) rather than
  // the generic electron.app.* identity.
  if (process.platform === 'win32') app.setAppUserModelId('com.chervil.app');
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
ipcMain.handle('chervil:ask', async (event, payload) => {
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
  for (const p of ['claude', 'grok', 'gemini', 'azure', 'stt']) status[p] = !!savedKeys[p];
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
