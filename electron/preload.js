'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// Minimal, safe bridge between the renderer UI and the agent in the main process.
contextBridge.exposeInMainWorld('chervil', {
  /**
   * Ask Chervil something.
   * @param {{query: string, history: Array}} payload
   * @returns {Promise<{ok: boolean, result?: object, error?: string}>}
   */
  ask: (payload) => ipcRenderer.invoke('chervil:ask', payload),

  /**
   * Subscribe to streamed HTML text deltas while a page is being generated.
   * The callback receives { requestId, delta } so the renderer can route to the right tab.
   */
  onChunk: (cb) => {
    const handler = (_e, payload) => cb(payload);
    ipcRenderer.on('chervil:chunk', handler);
    return () => ipcRenderer.removeListener('chervil:chunk', handler);
  },

  /**
   * Subscribe to status updates (e.g. "Searching the web…").
   * The callback receives { requestId, status }.
   */
  onStatus: (cb) => {
    const handler = (_e, payload) => cb(payload);
    ipcRenderer.on('chervil:status', handler);
    return () => ipcRenderer.removeListener('chervil:status', handler);
  },

  /** Applet bridge: a composed page asks Sprig for live data. */
  appletAsk: (payload) => ipcRenderer.invoke('chervil:applet-ask', payload),

  /** Build any registered skill (RFC 0003) → { ok, kind, artifact, html }. */
  buildSkill: (payload) => ipcRenderer.invoke('chervil:build-skill', payload),

  /** Render text/URL as a QR data URL for "send to phone". */
  qr: (text) => ipcRenderer.invoke('chervil:qr', text),

  /** Dial a tel: number through the OS phone handler. */
  dial: (tel) => ipcRenderer.invoke('chervil:dial', tel),

  /** Export a lesson as a standalone, swipeable mobile reader (.html). */
  exportLesson: (payload) => ipcRenderer.invoke('chervil:export-lesson', payload),

  /** Publish a lesson to a shareable getchervil.com link (Chervil Pro). */
  publishLesson: (payload) => ipcRenderer.invoke('chervil:publish-lesson', payload),

  /** Publish any composed page's HTML to a shareable getchervil.com link (Chervil Pro). */
  publishPage: (payload) => ipcRenderer.invoke('chervil:publish-page', payload),

  /** Per-provider key status: { claude, grok, gemini, azure, claudeFromEnv }. */
  getKeyStatus: () => ipcRenderer.invoke('chervil:get-key-status'),

  /** Save/clear a provider's API key (stored encrypted; '' clears it). */
  setApiKey: (provider, apiKey) => ipcRenderer.invoke('chervil:set-api-key', { provider, apiKey }),

  /** Live list of models for the given provider config. */
  listModels: (config) => ipcRenderer.invoke('chervil:list-models', { config }),

  /** Web-agent: ask Sprig for the next action on a live site. */
  agentStep: (payload) => ipcRenderer.invoke('chervil:agent-step', payload),

  /** Save a composed page to disk via a native save dialog. */
  savePage: (payload) => ipcRenderer.invoke('chervil:save-page', payload),

  /** Data folders (RFC 0004 local on-ramp): pick a folder, list its files, read selected files. */
  pickFolder: () => ipcRenderer.invoke('chervil:pick-folder'),
  listFolder: (payload) => ipcRenderer.invoke('chervil:list-folder', payload),
  readSourceFiles: (payload) => ipcRenderer.invoke('chervil:read-source-files', payload),

  /** Read-only machine info for composed pages (window.chervil.info bridge). */
  systemInfo: () => ipcRenderer.invoke('chervil:system-info'),

  /** Read-only extended OS details — Windows edition/build, update history, GPU, etc. */
  systemDetails: () => ipcRenderer.invoke('chervil:system-details'),

  /** Sync folder (#1): point the state file at a synced folder, read it, or unlink. */
  getSyncFolder: () => ipcRenderer.invoke('chervil:get-sync-folder'),
  setSyncFolder: () => ipcRenderer.invoke('chervil:set-sync-folder'),
  clearSyncFolder: () => ipcRenderer.invoke('chervil:clear-sync-folder'),

  /** Export a composed page as PDF via a native save dialog. */
  exportPdf: (payload) => ipcRenderer.invoke('chervil:export-pdf', payload),

  /** Export a composed page as an editable PowerPoint (.pptx) with speaker notes. */
  exportPptx: (payload) => ipcRenderer.invoke('chervil:export-pptx', payload),

  /** Export a composed page as a Word document (.docx). */
  exportDocx: (payload) => ipcRenderer.invoke('chervil:export-docx', payload),

  /** Export a composed page as an Excel workbook (.xlsx). */
  exportXlsx: (payload) => ipcRenderer.invoke('chervil:export-xlsx', payload),

  /** Export a composed page as an image (PNG/JPG) via a full-page screenshot. */
  exportImage: (payload) => ipcRenderer.invoke('chervil:export-image', payload),

  /** Export a composed page as an animated GIF (records a few seconds). */
  exportGif: (payload) => ipcRenderer.invoke('chervil:export-gif', payload),

  /** Transcribe recorded mic audio via the configured Whisper-compatible STT. */
  transcribe: (payload) => ipcRenderer.invoke('chervil:transcribe', payload),

  /** Fetch a video's transcript (YouTube captions) for summarization. */
  videoTranscript: (url) => ipcRenderer.invoke('chervil:video-transcript', url),

  /** Gemini-native video summary (watches the YouTube video directly). */
  videoGemini: (payload) => ipcRenderer.invoke('chervil:video-gemini', payload),

  /** Open a native file picker to import an agent file; returns its text. */
  openAgentFile: () => ipcRenderer.invoke('chervil:open-agent-file'),

  /** List the bundled starter agent files (Markdown) shipped in /agents. */
  listStarterAgents: () => ipcRenderer.invoke('chervil:list-starter-agents'),

  /** Distill a prompt session into a reusable agent (name/persona/starters). */
  synthesizeAgent: (payload) => ipcRenderer.invoke('chervil:synthesize-agent', payload),

  /** "Hey Sprig" wake mode: pop the Quick-Ask bar in a listening state. */
  wakeListening: () => ipcRenderer.send('chervil:wake-listening'),
  /** Wake mode: capture finished — hide the listening bar. */
  wakeDone: () => ipcRenderer.send('chervil:wake-done'),
  /** Bring the main window forward (used after a wake command produced a request). */
  showMain: () => ipcRenderer.send('chervil:show-main'),
  /** openWakeWord assets: ort WASM runtime + shared feature models, as bytes. */
  wakeAssets: () => ipcRenderer.invoke('chervil:wake-assets'),
  /** A keyword model's bytes — a built-in name or 'custom'. */
  wakeKeywordModel: (name) => ipcRenderer.invoke('chervil:wake-keyword-model', name),
  /** Import a custom openWakeWord keyword model (.onnx) → { ok, name }. */
  openWakeKeyword: () => ipcRenderer.invoke('chervil:open-wake-keyword'),

  /** Save an agent as a shareable Markdown file via a native save dialog. */
  saveAgentFile: (payload) => ipcRenderer.invoke('chervil:save-agent-file', payload),

  /** Show an OS notification (e.g. a Living page refreshed in the background). */
  notify: (payload) => ipcRenderer.invoke('chervil:notify', payload),

  /** Subscribe to notification clicks — receives { tabId, entryId } to jump to. */
  onNotificationClick: (cb) => {
    const handler = (_e, payload) => cb(payload);
    ipcRenderer.on('chervil:notification-click', handler);
    return () => ipcRenderer.removeListener('chervil:notification-click', handler);
  },

  /** Subscribe to prompts sent from the floating quick-ask bar (global hotkey). */
  onQuickPrompt: (cb) => ipcRenderer.on('chervil:quick-prompt', (_e, prompt) => cb(prompt)),

  /** Subscribe to "Ask Sprig about <selection>" from the right-click menu. */
  onContextAsk: (cb) => ipcRenderer.on('chervil:context-ask', (_e, text) => cb(text)),

  /** Load persisted session state (tabs, prompts, pages). */
  loadState: () => ipcRenderer.invoke('chervil:load-state'),

  /** Persist session state. */
  saveState: (state) => ipcRenderer.invoke('chervil:save-state', state),
});
