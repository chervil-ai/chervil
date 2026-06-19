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

  /** Load persisted session state (tabs, prompts, pages). */
  loadState: () => ipcRenderer.invoke('chervil:load-state'),

  /** Persist session state. */
  saveState: (state) => ipcRenderer.invoke('chervil:save-state', state),
});
